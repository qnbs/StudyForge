import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from './db';

describe('Local Database (Dexie)', () => {
  beforeEach(async () => {
    await db.documents.clear();
    await db.sources.clear();
    await db.zoteroItems.clear();
    await db.zoteroCollections.clear();
    await db.zoteroSyncMeta.clear();
  });

  it('should insert and retrieve a source', async () => {
    const mockSource = {
      id: 'src_123',
      title: 'Test Paper',
      authors: ['Jane Doe'],
      year: 2026,
      type: 'pdf' as const,
      addedAt: new Date().toISOString(),
      isVectorized: true,
    };

    await db.sources.add(mockSource);

    const retrieved = await db.sources.get('src_123');
    expect(retrieved).not.toBeUndefined();
    expect(retrieved?.title).toBe('Test Paper');
    expect(retrieved?.year).toBe(2026);
    expect(retrieved?.type).toBe('pdf');
  });

  it('should store and query zotero items (schema v6)', async () => {
    await db.zoteroItems.put({
      key: 'ABC123',
      version: 1,
      title: 'Zotero Paper',
      creators: [{ creatorType: 'author', firstName: 'Jane', lastName: 'Doe' }],
      dateModified: '2026-01-01T00:00:00Z',
      collectionKeys: ['COL1'],
      importedToLocal: false,
    });

    const item = await db.zoteroItems.get('ABC123');
    expect(item?.title).toBe('Zotero Paper');
    expect(item?.collectionKeys).toContain('COL1');
  });

  it('should store zotero sync metadata', async () => {
    const id = await db.zoteroSyncMeta.add({
      lastSyncTimestamp: new Date().toISOString(),
      libraryVersion: 42,
      totalItemsSynced: 10,
      lastSyncSuccessful: true,
    });

    const meta = await db.zoteroSyncMeta.get(id);
    expect(meta?.libraryVersion).toBe(42);
    expect(meta?.lastSyncSuccessful).toBe(true);
  });
});
