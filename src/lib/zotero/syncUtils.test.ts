import { describe, it, expect, vi, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../db';
import { incrementalZoteroSync } from './syncUtils';
import type { ZoteroApiCollection, ZoteroApiItem } from './types';

vi.mock('./zoteroClient', () => ({
  getZoteroClient: vi.fn(() => ({})),
  rateLimitedZoteroGet: vi.fn(),
}));

vi.mock('./attachmentSync', () => ({
  syncZoteroAttachments: vi.fn().mockResolvedValue({ downloaded: 0, failed: 0 }),
}));

import { rateLimitedZoteroGet } from './zoteroClient';

function mockResponse<T>(data: T, version: number, status = 200) {
  return {
    getData: () => data,
    getVersion: () => version,
    response: { status },
  };
}

describe('syncUtils', () => {
  beforeEach(async () => {
    await db.zoteroItems.clear();
    await db.zoteroCollections.clear();
    await db.zoteroSyncMeta.clear();
    await db.sources.clear();
    vi.mocked(rateLimitedZoteroGet).mockReset();
  });

  it('incrementalZoteroSync stores collections and literature items', async () => {
    const collections: ZoteroApiCollection[] = [
      {
        key: 'COL1',
        version: 1,
        data: { name: 'Papers', dateModified: '2026-01-01T00:00:00Z' },
      },
    ];

    const items: ZoteroApiItem[] = [
      {
        key: 'ITEM1',
        version: 2,
        itemType: 'journalArticle',
        data: {
          title: 'Synced Paper',
          creators: [{ creatorType: 'author', firstName: 'A', lastName: 'B' }],
          date: '2025',
          dateModified: '2026-01-02T00:00:00Z',
        },
      },
      {
        key: 'NOTE1',
        version: 1,
        itemType: 'note',
        data: { title: 'Skip me' },
      },
    ];

    vi.mocked(rateLimitedZoteroGet)
      .mockResolvedValueOnce(mockResponse(collections, 10) as never)
      .mockResolvedValueOnce(mockResponse(items, 11) as never)
      .mockResolvedValueOnce(
        mockResponse({ items: [], collections: [] }, 11) as never
      );

    const result = await incrementalZoteroSync({
      credentials: { apiKey: 'test-key', userId: '12345' },
      autoDownloadPdfs: false,
    });

    expect(result.success).toBe(true);
    expect(result.syncedItems).toBe(1);

    const storedItem = await db.zoteroItems.get('ITEM1');
    expect(storedItem?.title).toBe('Synced Paper');

    const storedCol = await db.zoteroCollections.get('COL1');
    expect(storedCol?.name).toBe('Papers');

    const meta = await db.zoteroSyncMeta.limit(1).first();
    expect(meta?.libraryVersion).toBe(11);
    expect(meta?.lastSyncSuccessful).toBe(true);
  });

  it('handles 304 not modified for items', async () => {
    await db.zoteroSyncMeta.add({
      lastSyncTimestamp: new Date().toISOString(),
      libraryVersion: 5,
      totalItemsSynced: 0,
      lastSyncSuccessful: true,
    });

    vi.mocked(rateLimitedZoteroGet)
      .mockResolvedValueOnce(mockResponse([], 5, 304) as never)
      .mockResolvedValueOnce(mockResponse([], 5, 304) as never)
      .mockResolvedValueOnce(
        mockResponse({ items: [], collections: [] }, 5, 304) as never
      );

    const result = await incrementalZoteroSync({
      credentials: { apiKey: 'k', userId: '1' },
    });

    expect(result.syncedItems).toBe(0);
    expect(result.success).toBe(true);
  });
});
