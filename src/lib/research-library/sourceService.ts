import { db } from '../db';
import type { Source } from '../../types';
import { formatZoteroSourceId } from '../zoteroUtils';

export function generateCitationKey(title: string, year: number): string {
  const slug = title
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .slice(0, 3)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
  return `${slug}${year}`;
}

export async function createNativeSource(
  fields: Omit<Source, 'id' | 'addedAt'> & { id?: string }
): Promise<string> {
  const id = fields.id ?? `src_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const citationKey = fields.citationKey ?? generateCitationKey(fields.title, fields.year);

  await db.sources.put({
    id,
    title: fields.title,
    authors: fields.authors,
    year: fields.year,
    type: fields.type,
    addedAt: new Date().toISOString(),
    isVectorized: fields.isVectorized ?? false,
    url: fields.url,
    doi: fields.doi,
    abstract: fields.abstract,
    publicationTitle: fields.publicationTitle,
    tags: fields.tags,
    citationKey,
    zoteroKey: fields.zoteroKey,
  });

  return id;
}

export async function updateSourceMetadata(
  sourceId: string,
  patch: Partial<Source>
): Promise<void> {
  await db.sources.update(sourceId, patch);
  const source = await db.sources.get(sourceId);
  if (source?.zoteroKey) {
    const { markSourceForPush } = await import('../zotero/pushUtils');
    await markSourceForPush(sourceId);
  }
}

export async function listNativeSources(): Promise<Source[]> {
  return db.sources.toArray();
}

export { formatZoteroSourceId };
