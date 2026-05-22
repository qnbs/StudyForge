import { describe, it, expect, beforeAll } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from './db';

describe('Local Database (Dexie)', () => {
    beforeAll(async () => {
        // Clear DB for test
        await db.documents.clear();
        await db.sources.clear();
    });

    it('should insert and retrieve a source', async () => {
        const mockSource = {
            id: 'src_123',
            title: 'Test Paper',
            authors: ['Jane Doe'],
            year: 2026,
            type: 'pdf' as const,
            addedAt: new Date().toISOString(),
            isVectorized: true
        };

        await db.sources.add(mockSource);

        const retrieved = await db.sources.get('src_123');
        expect(retrieved).not.toBeUndefined();
        expect(retrieved?.title).toBe('Test Paper');
        expect(retrieved?.year).toBe(2026);
        expect(retrieved?.type).toBe('pdf');
    });
});
