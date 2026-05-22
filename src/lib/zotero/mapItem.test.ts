import { describe, it, expect } from 'vitest';
import {
  mapZoteroApiItemToRecord,
  parseZoteroYear,
  isLiteratureItem,
} from './mapItem';
import type { ZoteroApiItem } from './types';

describe('mapItem', () => {
  const sampleItem: ZoteroApiItem = {
    key: 'ITEM1',
    version: 3,
    itemType: 'journalArticle',
    data: {
      title: 'Test Article',
      creators: [{ creatorType: 'author', firstName: 'Jane', lastName: 'Doe' }],
      date: '2024-05',
      DOI: '10.1234/test',
      dateModified: '2026-01-01T00:00:00Z',
      collections: ['COL1'],
    },
  };

  it('parseZoteroYear extracts year from date string', () => {
    expect(parseZoteroYear('2024-05')).toBe(2024);
    expect(parseZoteroYear(undefined)).toBeUndefined();
  });

  it('isLiteratureItem excludes notes and attachments', () => {
    expect(isLiteratureItem(sampleItem)).toBe(true);
    expect(
      isLiteratureItem({ ...sampleItem, itemType: 'note' })
    ).toBe(false);
    expect(
      isLiteratureItem({ ...sampleItem, itemType: 'attachment' })
    ).toBe(false);
  });

  it('mapZoteroApiItemToRecord maps API item to ZoteroItem', () => {
    const record = mapZoteroApiItemToRecord(sampleItem, false);
    expect(record.key).toBe('ITEM1');
    expect(record.title).toBe('Test Article');
    expect(record.doi).toBe('10.1234/test');
    expect(record.year).toBe(2024);
    expect(record.collectionKeys).toEqual(['COL1']);
    expect(record.importedToLocal).toBe(false);
  });
});
