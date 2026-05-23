import { db } from '../db';
import type { ZoteroCredentials } from '../zotero/types';
import { incrementalZoteroSync, type SyncProgress } from '../zotero/syncUtils';
import { pushZoteroChanges } from '../zotero/pushUtils';
import { pullMendeleyLibrary } from '../mendeley/mendeleySync';
import type { ReferenceWorkerOut } from './workerMessages';
import { enqueueSyncJob, recordJobHistory, updateJobStatus } from './syncQueue';
import {
  isLiteratureItem,
  mapZoteroApiItemToRecord,
} from '../zotero/mapItem';
import { markImportedFlagsFromSources } from '../zotero/importToSources';
import type { ZoteroApiCollection, ZoteroApiItem } from '../zotero/types';

const ITEMS_PAGE_SIZE = 100;

export type OrchestratorProgress = SyncProgress & { jobId?: string };

type ProgressCallback = (p: OrchestratorProgress) => void;

let activeWorker: Worker | null = null;
let activeJobId: string | null = null;

function canUseWorker(): boolean {
  return typeof Worker !== 'undefined';
}

function spawnWorker(): Worker | null {
  if (!canUseWorker()) return null;
  try {
    return new Worker(new URL('../../workers/referenceSyncWorker.ts', import.meta.url), {
      type: 'module',
    });
  } catch {
    return null;
  }
}

async function applyZoteroPage(
  items: ZoteroApiItem[],
  collections: ZoteroApiCollection[]
): Promise<number> {
  let processed = 0;
  for (const col of collections) {
    const parent = col.data.parentCollection;
    await db.zoteroCollections.put({
      key: col.key,
      name: col.data.name,
      parentKey: typeof parent === 'string' && parent.length > 0 ? parent : undefined,
      version: col.version,
      dateModified: col.data.dateModified ?? new Date().toISOString(),
    });
  }

  for (const item of items) {
    if (!isLiteratureItem(item)) continue;
    const sourceId = `zotero_${item.key}`;
    const existing = await db.sources.get(sourceId);
    await db.zoteroItems.put(mapZoteroApiItemToRecord(item, !!existing));
    processed++;
  }
  return processed;
}

async function pullZoteroViaWorker(
  credentials: ZoteroCredentials,
  since: number,
  jobId: string,
  onProgress?: ProgressCallback
): Promise<{ processed: number; libraryVersion: number }> {
  return new Promise((resolve, reject) => {
    const worker = spawnWorker();
    if (!worker) {
      reject(new Error('Worker unavailable'));
      return;
    }

    activeWorker = worker;
    let processed = 0;
    let libraryVersion = since;
    let start = 0;
    const runPage = () => {
      worker.postMessage({
        type: 'zotero_pull_page',
        jobId,
        userId: credentials.userId,
        apiKey: credentials.apiKey,
        since,
        start,
        limit: ITEMS_PAGE_SIZE,
      });
    };

    worker.onmessage = async (ev: MessageEvent<ReferenceWorkerOut>) => {
      const msg = ev.data;
      if (msg.jobId !== jobId) return;

      if (msg.type === 'error') {
        worker.terminate();
        activeWorker = null;
        reject(new Error(msg.message));
        return;
      }

      if (msg.type === 'zotero_page') {
        if (!msg.notModified) {
          const batchProcessed = await applyZoteroPage(msg.items, start === 0 ? msg.collections : []);
          processed += batchProcessed;
          libraryVersion = Math.max(libraryVersion, msg.libraryVersion);
        }

        onProgress?.({
          stage: 'items',
          processed,
          message: `${processed} entries processed (worker)`,
          jobId,
        });

        if (!msg.notModified && msg.items.length >= ITEMS_PAGE_SIZE) {
          start += ITEMS_PAGE_SIZE;
          runPage();
          return;
        }

        worker.terminate();
        activeWorker = null;
        await markImportedFlagsFromSources();
        resolve({ processed, libraryVersion });
      }
    };

    worker.onerror = () => {
      worker.terminate();
      activeWorker = null;
      reject(new Error('Reference sync worker crashed'));
    };

    onProgress?.({ stage: 'collections', processed: 0, message: 'Starting worker sync...', jobId });
    runPage();
  });
}

export class ReferenceSyncOrchestrator {
  private progressListeners = new Set<ProgressCallback>();

  onProgress(cb: ProgressCallback): () => void {
    this.progressListeners.add(cb);
    return () => this.progressListeners.delete(cb);
  }

  private emit(p: OrchestratorProgress): void {
    for (const cb of this.progressListeners) {
      cb(p);
    }
  }

  cancel(): void {
    if (activeWorker) {
      activeWorker.postMessage({ type: 'cancel', jobId: activeJobId ?? '' });
      activeWorker.terminate();
      activeWorker = null;
    }
    activeJobId = null;
  }

  async enqueuePull(
    provider: 'zotero' | 'mendeley',
    credentials: unknown,
    options?: { autoDownloadPdfs?: boolean; useWorker?: boolean }
  ): Promise<{ success: boolean; syncedItems: number }> {
    const queueId = await enqueueSyncJob(provider, 'pull', credentials);
    await updateJobStatus(queueId, 'running');

    try {
      if (provider === 'zotero') {
        const creds = credentials as ZoteroCredentials;
        const jobId = `job_${queueId}`;
        activeJobId = jobId;

        const meta = await db.zoteroSyncMeta.limit(1).first();
        const since = meta?.libraryVersion ?? 0;

        let result: { processed: number; libraryVersion: number; pdfsDownloaded?: number };

        if (options?.useWorker !== false && canUseWorker()) {
          try {
            const workerResult = await pullZoteroViaWorker(creds, since, jobId, (p) => this.emit(p));
            const syncMeta = await db.zoteroSyncMeta.limit(1).first();
            if (syncMeta?.id) {
              await db.zoteroSyncMeta.update(syncMeta.id, {
                lastSyncTimestamp: new Date().toISOString(),
                libraryVersion: workerResult.libraryVersion,
                totalItemsSynced: (syncMeta.totalItemsSynced || 0) + workerResult.processed,
                lastSyncSuccessful: true,
              });
            }
            result = { processed: workerResult.processed, libraryVersion: workerResult.libraryVersion };
          } catch {
            const fallback = await incrementalZoteroSync({
              credentials: creds,
              autoDownloadPdfs: options?.autoDownloadPdfs,
              onProgress: (p) => this.emit({ ...p, jobId }),
            });
            result = {
              processed: fallback.syncedItems,
              libraryVersion: fallback.newVersion,
              pdfsDownloaded: fallback.pdfsDownloaded,
            };
          }
        } else {
          const fallback = await incrementalZoteroSync({
            credentials: creds,
            autoDownloadPdfs: options?.autoDownloadPdfs,
            onProgress: (p) => this.emit({ ...p, jobId }),
          });
          result = {
            processed: fallback.syncedItems,
            libraryVersion: fallback.newVersion,
            pdfsDownloaded: fallback.pdfsDownloaded,
          };
        }

        await updateJobStatus(queueId, 'completed');
        await recordJobHistory(queueId, provider, 'pull', true, `Synced ${result.processed} items`);
        this.emit({ stage: 'done', processed: result.processed, message: 'Sync complete' });
        return { success: true, syncedItems: result.processed };
      }

      if (provider === 'mendeley') {
        const pull = await pullMendeleyLibrary(credentials as { accessToken: string }, (p) =>
          this.emit(p)
        );
        await updateJobStatus(queueId, 'completed');
        await recordJobHistory(queueId, provider, 'pull', true, `Synced ${pull.synced} documents`);
        return { success: true, syncedItems: pull.synced };
      }

      throw new Error(`Unknown provider: ${provider}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      await updateJobStatus(queueId, 'failed', message);
      await recordJobHistory(queueId, provider, 'pull', false, message);
      throw err;
    } finally {
      activeJobId = null;
    }
  }

  async enqueuePush(
    credentials: ZoteroCredentials
  ): Promise<{ pushed: number; conflicts: import('../zotero/pushUtils').PushConflict[] }> {
    const queueId = await enqueueSyncJob('zotero', 'push');
    await updateJobStatus(queueId, 'running');
    try {
      const result = await pushZoteroChanges(credentials, (p) => this.emit(p));
      await updateJobStatus(queueId, 'completed');
      await recordJobHistory(
        queueId,
        'zotero',
        'push',
        result.conflicts.length === 0,
        `Pushed ${result.pushed}, conflicts ${result.conflicts.length}`
      );
      return { pushed: result.pushed, conflicts: result.conflicts };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Push failed';
      await updateJobStatus(queueId, 'failed', message);
      throw err;
    }
  }
}

export const referenceSyncOrchestrator = new ReferenceSyncOrchestrator();
