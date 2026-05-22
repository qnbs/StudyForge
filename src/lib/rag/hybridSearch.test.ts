import { describe, it, expect, vi, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../db';
import { scoreBM25 } from './bm25';
import { fuseRankings, queryRAGHybrid } from './hybridSearch';
import type { DocumentChunk } from '../../types';

vi.mock('../opfs', () => ({
  loadVectorFromOPFS: vi.fn(async (id: string) => {
    if (id === 'vec_kw') return new Float32Array([0, 1, 0]);
    if (id === 'vec_sem') return new Float32Array([1, 0, 0]);
    return null;
  }),
}));

describe('fuseRankings (RRF)', () => {
  it('combines two ranked lists by reciprocal rank', () => {
    const chunkA: DocumentChunk = {
      id: 'a',
      documentId: 'd',
      text: 'alpha',
      embeddingId: 'v',
      vectorLength: 3,
    };
    const chunkB: DocumentChunk = {
      id: 'b',
      documentId: 'd',
      text: 'beta',
      embeddingId: 'v2',
      vectorLength: 3,
    };

    const fused = fuseRankings(
      [
        [
          { chunk: chunkA, score: 1 },
          { chunk: chunkB, score: 0.5 },
        ],
        [{ chunk: chunkA, score: 0.95 }],
      ],
      2
    );

    expect(fused).toHaveLength(2);
    expect(fused[0].chunk.id).toBe('a');
    expect(fused[0].score).toBeGreaterThan(fused[1].score);
  });
});

describe('queryRAGHybrid', () => {
  beforeEach(async () => {
    await db.documentChunks.clear();
  });

  it('prefers chunk matching rare keyword via BM25 + RRF', async () => {
    await db.documentChunks.bulkAdd([
      {
        id: 'sem',
        documentId: 'd1',
        sourceId: 'd1',
        chunkIndex: 0,
        text: 'general academic writing overview',
        embeddingId: 'vec_sem',
        vectorLength: 3,
      },
      {
        id: 'kw',
        documentId: 'd1',
        sourceId: 'd1',
        chunkIndex: 1,
        text: 'zotero bibliographic sync methodology',
        embeddingId: 'vec_kw',
        vectorLength: 3,
      },
    ]);

    const queryVector = new Float32Array([1, 0, 0]);
    const results = await queryRAGHybrid(queryVector, 'zotero bibliographic', 2);

    expect(results.length).toBeGreaterThan(0);
    const ids = results.map((r) => r.chunk.id);
    expect(ids).toContain('kw');
  });

  it('scoreBM25 finds exact term match', () => {
    const chunks: DocumentChunk[] = [
      {
        id: 'a',
        documentId: 'd',
        text: 'machine learning transformers',
        embeddingId: 'v',
        vectorLength: 3,
      },
      {
        id: 'b',
        documentId: 'd',
        text: 'zotero citation export',
        embeddingId: 'v2',
        vectorLength: 3,
      },
    ];
    const hits = scoreBM25('zotero citation', chunks, 1);
    expect(hits[0].chunk.id).toBe('b');
  });
});
