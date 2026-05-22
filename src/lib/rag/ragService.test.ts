import { describe, it, expect, vi, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../db';
import { RAGService } from './ragService';

vi.mock('../opfs', () => ({
  saveVectorToOPFS: vi.fn(async () => undefined),
  loadVectorFromOPFS: vi.fn(async () => new Float32Array([1, 0])),
  deleteVectorFromOPFS: vi.fn(async () => undefined),
}));

describe('RAGService', () => {
  let rag: RAGService;

  beforeEach(async () => {
    await db.documentChunks.clear();
    await db.sources.clear();
    rag = new RAGService();
  });

  it('should be defined', () => {
    expect(rag).toBeDefined();
  });

  it('deleteSourceArtifacts removes chunks for source id', async () => {
    await db.documentChunks.add({
      id: 'chunk1',
      documentId: 'src_test',
      sourceId: 'src_test',
      chunkIndex: 0,
      text: 'hello',
      embeddingId: 'vec_chunk1',
      vectorLength: 2,
    });

    await rag.deleteSourceArtifacts('src_test');
    const remaining = await db.documentChunks.toArray();
    expect(remaining).toHaveLength(0);
  });
});
