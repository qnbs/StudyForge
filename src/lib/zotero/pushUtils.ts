import { db } from '../db';
import { getZoteroClient } from './zoteroClient';
import { rateLimitedZoteroRequest } from './rateLimiter';
import type { ZoteroCredentials } from './types';
import type { SyncProgress } from './syncUtils';
import type { ErrorResponse } from 'zotero-api-client';

export interface PushConflict {
  sourceId: string;
  zoteroKey: string;
  remoteVersion: number;
  message: string;
}

export interface PushResult {
  pushed: number;
  conflicts: PushConflict[];
}

function getHttpStatus(err: unknown): number | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const e = err as ErrorResponse;
  return e.response?.status;
}

/**
 * Push local metadata changes (tags, extra) to Zotero for sources marked pendingPush.
 */
export async function pushZoteroChanges(
  credentials: ZoteroCredentials,
  onProgress?: (p: SyncProgress) => void
): Promise<PushResult> {
  const client = getZoteroClient(credentials);
  const pending = await db.sources
    .filter((s) => Boolean(s.pendingPush && s.zoteroKey))
    .toArray();

  const conflicts: PushConflict[] = [];
  let pushed = 0;

  onProgress?.({ stage: 'items', processed: 0, message: `Pushing ${pending.length} changes...` });

  for (const source of pending) {
    const key = source.zoteroKey!;
    const zoteroItem = await db.zoteroItems.get(key);
    const version = zoteroItem?.version ?? source.localVersion ?? 0;

    const patchBody = {
      key,
      version,
      itemType: zoteroItem?.itemType ?? 'journalArticle',
      title: source.title,
      tags: (source.tags ?? []).map((tag) => ({ tag })),
      extra: source.abstract ?? '',
    };

    try {
      await rateLimitedZoteroRequest(
        () =>
          client.items(key).patch(patchBody, {
            ifUnmodifiedSinceVersion: version,
          }),
        `Push ${key}`
      );

      await db.sources.update(source.id, { pendingPush: false });
      pushed++;
    } catch (err: unknown) {
      const status = getHttpStatus(err);
      if (status === 412 || status === 409) {
        conflicts.push({
          sourceId: source.id,
          zoteroKey: key,
          remoteVersion: version + 1,
          message: 'Version conflict — remote library changed',
        });
      } else {
        throw err;
      }
    }

    onProgress?.({
      stage: 'items',
      processed: pushed,
      total: pending.length,
      message: `Pushed ${pushed}/${pending.length}`,
    });
  }

  onProgress?.({ stage: 'done', processed: pushed, message: 'Push complete' });
  return { pushed, conflicts };
}

export async function markSourceForPush(sourceId: string): Promise<void> {
  const source = await db.sources.get(sourceId);
  if (!source?.zoteroKey) return;
  await db.sources.update(sourceId, {
    pendingPush: true,
    localVersion: (source.localVersion ?? 0) + 1,
  });
}

export async function resolveConflictKeepLocal(
  credentials: ZoteroCredentials,
  conflict: PushConflict
): Promise<void> {
  const item = await db.zoteroItems.get(conflict.zoteroKey);
  if (item) {
    await db.zoteroItems.update(conflict.zoteroKey, { version: conflict.remoteVersion });
  }
  await markSourceForPush(conflict.sourceId);
  await pushZoteroChanges(credentials);
}

export async function resolveConflictKeepRemote(conflict: PushConflict): Promise<void> {
  await db.sources.update(conflict.sourceId, { pendingPush: false });
}
