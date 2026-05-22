import type { ZoteroItem } from '../../types';
import { db } from '../db';
import { formatZoteroAuthor, formatZoteroSourceId } from '../zoteroUtils';
import type { ZoteroApiItem } from './types';

const LITERATURE_TYPES = new Set([
  'book',
  'bookSection',
  'journalArticle',
  'magazineArticle',
  'newspaperArticle',
  'thesis',
  'manuscript',
  'patent',
  'report',
  'conferencePaper',
  'document',
  'presentation',
  'blogPost',
  'encyclopediaArticle',
  'dictionaryEntry',
  'artwork',
  'audioRecording',
  'film',
  'interview',
  'map',
  'podcast',
  'radioBroadcast',
  'tvBroadcast',
  'videoRecording',
  'webpage',
  'preprint',
]);

export function parseZoteroYear(date?: string): number | undefined {
  if (!date) return undefined;
  const match = date.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : undefined;
}

export function isLiteratureItem(item: ZoteroApiItem): boolean {
  if (item.itemType === 'attachment' || item.itemType === 'note') return false;
  return LITERATURE_TYPES.has(item.itemType);
}

export function mapZoteroApiItemToRecord(
  item: ZoteroApiItem,
  importedToLocal: boolean
): ZoteroItem {
  const data = item.data;
  const creators =
    data.creators?.map((c) => ({
      creatorType: c.creatorType ?? 'author',
      firstName: c.firstName,
      lastName: c.lastName,
      name: c.name,
    })) ?? [];

  return {
    key: item.key,
    version: item.version,
    title: data.title || 'Untitled',
    creators,
    abstractNote: data.abstractNote,
    date: data.date,
    year: parseZoteroYear(data.date),
    doi: data.DOI,
    url: data.url,
    publicationTitle: data.publicationTitle,
    volume: data.volume,
    issue: data.issue,
    pages: data.pages,
    isbn: data.ISBN,
    tags: data.tags ?? [],
    dateModified: data.dateModified ?? new Date().toISOString(),
    collectionKeys: data.collections ?? [],
    attachmentKeys: [],
    itemType: item.itemType,
    importedToLocal,
  };
}

export async function isZoteroItemImportedLocally(itemKey: string): Promise<boolean> {
  const sourceId = formatZoteroSourceId(itemKey);
  const existing = await db.sources.get(sourceId);
  return !!existing;
}

export function zoteroItemToSourceFields(item: ZoteroItem): {
  id: string;
  title: string;
  authors: string[];
  year: number;
  url?: string;
  zoteroKey: string;
} {
  return {
    id: formatZoteroSourceId(item.key),
    title: item.title,
    authors: item.creators.map((c) => formatZoteroAuthor(c)),
    year: item.year ?? new Date().getFullYear(),
    url: item.url,
    zoteroKey: item.key,
  };
}
