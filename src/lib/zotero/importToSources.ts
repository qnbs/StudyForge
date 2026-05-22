import { db } from '../db';
import type { ZoteroItem } from '../../types';
import { formatZoteroSourceId } from '../zoteroUtils';
import { zoteroItemToSourceFields } from './mapItem';

/**
 * Import a single Zotero item into local sources (metadata only).
 */
export async function importZoteroItemToSources(item: ZoteroItem): Promise<boolean> {
  const fields = zoteroItemToSourceFields(item);
  const existing = await db.sources.get(fields.id);

  if (existing) {
    await db.zoteroItems.update(item.key, { importedToLocal: true });
    return false;
  }

  await db.sources.put({
    id: fields.id,
    title: fields.title,
    authors: fields.authors,
    year: fields.year,
    type: 'zotero',
    addedAt: new Date().toISOString(),
    isVectorized: false,
    url: fields.url,
    zoteroKey: fields.zoteroKey,
  });

  await db.zoteroItems.update(item.key, { importedToLocal: true });
  return true;
}

/**
 * Import all Zotero items not yet in local sources.
 */
export async function importAllNewZoteroItemsToSources(): Promise<number> {
  const items = await db.zoteroItems.filter((i) => !i.importedToLocal).toArray();
  let imported = 0;

  for (const item of items) {
    const added = await importZoteroItemToSources(item);
    if (added) imported++;
  }

  return imported;
}

export async function markImportedFlagsFromSources(): Promise<void> {
  const items = await db.zoteroItems.toArray();
  for (const item of items) {
    const sourceId = formatZoteroSourceId(item.key);
    const exists = await db.sources.get(sourceId);
    if (exists && !item.importedToLocal) {
      await db.zoteroItems.update(item.key, { importedToLocal: true });
    }
  }
}
