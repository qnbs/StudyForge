import { describe, it, expect, vi, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../db';
import { queryRAGVectors } from './queryRAG';

vi.mock('../opfs', () => ({
  loadVectorFromOPFS: vi.fn(async (id: string) => {
    if (id === 'vec_a') return new Float32Array([1, 0, 0]);
    if (id === 'vec_b') return new Float32Array([0, 1, 0]);
    return null;
  }),
}));

describe('queryRAGVectors', () => {
  beforeEach(async () => {
    await db.documentChunks.clear();
  });

  it('returns top-k by cosine similarity', async () => {
    await db.documentChunks.bulkAdd([
      {
        id: 'c1',
        documentId: 'doc1',
        sourceId: 'doc1',
        chunkIndex: 0,
        text: 'alpha',
        embeddingId: 'vec_a',
        vectorLength: 3,
      },
      {
        id: 'c2',
        documentId: 'doc1',
        sourceId: 'doc1',
        chunkIndex: 1,
        text: 'beta',
        embeddingId: 'vec_b',
        vectorLength: 3,
      },
    ]);

    const query = new Float32Array([1, 0, 0]);
    const results = await queryRAGVectors(query, 1);
    expect(results).toHaveLength(1);
    expect(results[0].chunk.id).toBe('c1');
    expect(results[0].score).toBeGreaterThan(0.9);
  });
});
