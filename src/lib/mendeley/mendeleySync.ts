import { db } from '../db';
import type { MendeleyDocument } from '../../types';
import type { SyncProgress } from '../zotero/syncUtils';

const MENDELEY_API = 'https://api.mendeley.com';

interface MendeleyApiDoc {
  id: string;
  title?: string;
  authors?: Array<{ first_name?: string; last_name?: string }>;
  year?: number;
  identifiers?: { doi?: string };
  abstract?: string;
  last_modified?: string;
}

export async function pullMendeleyLibrary(
  credentials: { accessToken: string },
  onProgress?: (p: SyncProgress) => void
): Promise<{ synced: number }> {
  onProgress?.({ stage: 'items', processed: 0, message: 'Fetching Mendeley documents...' });

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(`${MENDELEY_API}/documents?limit=100`, {
      headers: { Authorization: `Bearer ${credentials.accessToken}` },
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`Mendeley API error: ${res.statusText}`);

    const json = (await res.json()) as MendeleyApiDoc[];
    let synced = 0;

    for (const doc of json) {
      const authors =
        doc.authors?.map((a) => `${a.first_name ?? ''} ${a.last_name ?? ''}`.trim()).filter(Boolean) ??
        ['Unknown'];

      const record: MendeleyDocument = {
        key: doc.id,
        title: doc.title ?? 'Untitled',
        authors,
        year: doc.year,
        doi: doc.identifiers?.doi,
        abstract: doc.abstract,
        dateModified: doc.last_modified ?? new Date().toISOString(),
        importedToLocal: false,
      };

      const sourceId = `mendeley_${doc.id}`;
      const existing = await db.sources.get(sourceId);
      if (existing) record.importedToLocal = true;

      await db.mendeleyDocuments.put(record);
      synced++;
    }

    const meta = await db.mendeleySyncMeta.limit(1).first();
    if (meta?.id) {
      await db.mendeleySyncMeta.update(meta.id, {
        lastSyncTimestamp: new Date().toISOString(),
        lastSyncSuccessful: true,
      });
    }

    onProgress?.({ stage: 'done', processed: synced, message: `Synced ${synced} Mendeley documents` });
    return { synced };
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function importMendeleyDocToSources(key: string): Promise<boolean> {
  const doc = await db.mendeleyDocuments.get(key);
  if (!doc) return false;

  const sourceId = `mendeley_${key}`;
  const existing = await db.sources.get(sourceId);
  if (existing) return false;

  await db.sources.put({
    id: sourceId,
    title: doc.title,
    authors: doc.authors,
    year: doc.year ?? new Date().getFullYear(),
    type: 'web',
    addedAt: new Date().toISOString(),
    doi: doc.doi,
    abstract: doc.abstract,
    isVectorized: false,
  });

  await db.mendeleyDocuments.update(key, { importedToLocal: true });
  return true;
}
