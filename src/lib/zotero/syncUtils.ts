import type { MultiReadResponse } from 'zotero-api-client';
import { db } from '../db';
import type { ZoteroSyncMeta } from '../../types';
import {
  getZoteroClient,
  rateLimitedZoteroGet,
} from './zoteroClient';
import type {
  ZoteroApiCollection,
  ZoteroApiItem,
  ZoteroCredentials,
  ZoteroDeletedPayload,
} from './types';
import { getResponseVersion, isNotModified } from './types';
import {
  isLiteratureItem,
  mapZoteroApiItemToRecord,
} from './mapItem';
import { markImportedFlagsFromSources } from './importToSources';
import { syncZoteroAttachments } from './attachmentSync';

const ITEMS_PAGE_SIZE = 100;

export interface SyncProgress {
  stage: 'collections' | 'items' | 'deleted' | 'attachments' | 'done';
  processed: number;
  total?: number;
  message: string;
}

export type SyncProgressCallback = (progress: SyncProgress) => void;

export interface IncrementalSyncOptions {
  credentials: ZoteroCredentials;
  autoDownloadPdfs?: boolean;
  onProgress?: SyncProgressCallback;
}

export interface IncrementalSyncResult {
  success: boolean;
  newVersion: number;
  syncedItems: number;
  pdfsDownloaded?: number;
}

async function getOrCreateSyncMeta(): Promise<ZoteroSyncMeta & { id: number }> {
  let syncMeta = await db.zoteroSyncMeta.limit(1).first();
  if (!syncMeta?.id) {
    const id = await db.zoteroSyncMeta.add({
      lastSyncTimestamp: new Date(0).toISOString(),
      libraryVersion: 0,
      totalItemsSynced: 0,
      lastSyncSuccessful: false,
    });
    syncMeta = (await db.zoteroSyncMeta.get(id))!;
  }
  return syncMeta as ZoteroSyncMeta & { id: number };
}

async function syncCollections(
  credentials: ZoteroCredentials,
  lastVersion: number,
  onProgress?: SyncProgressCallback
): Promise<{ version: number; count: number }> {
  const client = getZoteroClient(credentials);
  const response = await rateLimitedZoteroGet<MultiReadResponse<ZoteroApiCollection>>(
    client,
    (c) => c.collections(),
    'Collections Sync',
    { format: 'json', since: lastVersion }
  );

  if (isNotModified(response)) {
    return { version: getResponseVersion(response) || lastVersion, count: 0 };
  }

  const collections = response.getData();
  if (!Array.isArray(collections)) {
    return { version: getResponseVersion(response) || lastVersion, count: 0 };
  }

  for (const col of collections) {
    const parent = col.data.parentCollection;
    const parentKey =
      typeof parent === 'string' && parent.length > 0 ? parent : undefined;
    await db.zoteroCollections.put({
      key: col.key,
      name: col.data.name,
      parentKey,
      version: col.version,
      dateModified: col.data.dateModified ?? new Date().toISOString(),
    });
  }

  onProgress?.({
    stage: 'collections',
    processed: collections.length,
    message: `${collections.length} collections updated`,
  });

  return { version: getResponseVersion(response) || lastVersion, count: collections.length };
}

async function syncItemsPage(
  credentials: ZoteroCredentials,
  lastVersion: number,
  start: number
): Promise<{
  items: ZoteroApiItem[];
  version: number;
  notModified: boolean;
  hasMore: boolean;
}> {
  const client = getZoteroClient(credentials);
  const response = await rateLimitedZoteroGet<MultiReadResponse<ZoteroApiItem>>(
    client,
    (c) => c.items(),
    `Items Sync (start=${start})`,
    {
      format: 'json',
      since: lastVersion,
      includeTrashed: true,
      limit: ITEMS_PAGE_SIZE,
      start,
    }
  );

  if (isNotModified(response)) {
    return {
      items: [],
      version: getResponseVersion(response) || lastVersion,
      notModified: true,
      hasMore: false,
    };
  }

  const items = response.getData() ?? [];
  return {
    items: Array.isArray(items) ? items : [],
    version: getResponseVersion(response) || lastVersion,
    notModified: false,
    hasMore: items.length >= ITEMS_PAGE_SIZE,
  };
}

async function syncItems(
  credentials: ZoteroCredentials,
  lastVersion: number,
  onProgress?: SyncProgressCallback
): Promise<{ version: number; processed: number }> {
  let start = 0;
  let processed = 0;
  let maxVersion = lastVersion;
  let notModifiedOnFirstPage = false;

  while (true) {
    const page = await syncItemsPage(credentials, lastVersion, start);

    if (page.notModified && start === 0) {
      notModifiedOnFirstPage = true;
      maxVersion = Math.max(maxVersion, page.version);
      break;
    }

    maxVersion = Math.max(maxVersion, page.version);

    for (const item of page.items) {
      if (!isLiteratureItem(item)) continue;

      const sourceId = `zotero_${item.key}`;
      const existingSource = await db.sources.get(sourceId);
      const record = mapZoteroApiItemToRecord(item, !!existingSource);
      await db.zoteroItems.put(record);
      processed++;
    }

    onProgress?.({
      stage: 'items',
      processed,
      message: `${processed} entries processed`,
    });

    if (!page.hasMore) break;
    start += ITEMS_PAGE_SIZE;
  }

  if (notModifiedOnFirstPage) {
    onProgress?.({
      stage: 'items',
      processed: 0,
      message: 'No item changes since last sync',
    });
  }

  await markImportedFlagsFromSources();

  return { version: maxVersion, processed };
}

async function syncDeleted(
  credentials: ZoteroCredentials,
  lastVersion: number,
  onProgress?: SyncProgressCallback
): Promise<number> {
  const client = getZoteroClient(credentials);
  const response = await rateLimitedZoteroGet<MultiReadResponse<ZoteroDeletedPayload>>(
    client,
    (c) => c.deleted(lastVersion),
    'Deleted Items Sync'
  );

  if (isNotModified(response)) {
    return 0;
  }

  const deleted = response.getData() as ZoteroDeletedPayload;
  let removed = 0;

  if (deleted?.items?.length) {
    await db.zoteroItems.bulkDelete(deleted.items);
    for (const key of deleted.items) {
      const sourceId = `zotero_${key}`;
      await db.sources.delete(sourceId);
    }
    removed += deleted.items.length;
  }

  if (deleted?.collections?.length) {
    await db.zoteroCollections.bulkDelete(deleted.collections);
    removed += deleted.collections.length;
  }

  onProgress?.({
    stage: 'deleted',
    processed: removed,
    message: removed > 0 ? `${removed} deletions applied` : 'No deletions',
  });

  return removed;
}

/**
 * Incremental Zotero library sync (collections, items, deletions).
 */
export async function incrementalZoteroSync(
  options: IncrementalSyncOptions
): Promise<IncrementalSyncResult> {
  const { credentials, autoDownloadPdfs = false, onProgress } = options;
  const syncMeta = await getOrCreateSyncMeta();
  const lastVersion = syncMeta.libraryVersion;

  try {
    onProgress?.({
      stage: 'collections',
      processed: 0,
      message: 'Syncing collections...',
    });

    const colResult = await syncCollections(credentials, lastVersion, onProgress);

    onProgress?.({
      stage: 'items',
      processed: 0,
      message: 'Syncing literature entries...',
    });

    const itemsResult = await syncItems(credentials, lastVersion, onProgress);

    onProgress?.({
      stage: 'deleted',
      processed: 0,
      message: 'Processing deletions...',
    });

    await syncDeleted(credentials, lastVersion, onProgress);

    const newVersion = Math.max(colResult.version, itemsResult.version, lastVersion);

    await db.zoteroSyncMeta.update(syncMeta.id, {
      lastSyncTimestamp: new Date().toISOString(),
      libraryVersion: newVersion,
      totalItemsSynced: (syncMeta.totalItemsSynced || 0) + itemsResult.processed,
      lastSyncSuccessful: true,
    });

    let pdfsDownloaded = 0;

    if (autoDownloadPdfs) {
      const keys = (await db.zoteroItems.toArray()).map((i) => i.key);
      onProgress?.({
        stage: 'attachments',
        processed: 0,
        total: keys.length,
        message: 'Downloading PDF attachments...',
      });

      const attachResult = await syncZoteroAttachments(credentials, keys, (p) =>
        onProgress?.({
          stage: 'attachments',
          processed: p.current,
          total: p.total,
          message: p.message,
        })
      );
      pdfsDownloaded = attachResult.downloaded;
    }

    onProgress?.({
      stage: 'done',
      processed: itemsResult.processed,
      message: 'Sync completed successfully',
    });

    return {
      success: true,
      newVersion,
      syncedItems: itemsResult.processed,
      pdfsDownloaded,
    };
  } catch (error) {
    await db.zoteroSyncMeta.update(syncMeta.id, { lastSyncSuccessful: false });
    onProgress?.({
      stage: 'done',
      processed: 0,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    throw error;
  }
}
