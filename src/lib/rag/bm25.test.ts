import { describe, it, expect } from 'vitest';
import { scoreBM25 } from './bm25';
import type { DocumentChunk } from '../../types';

const baseChunk = (id: string, text: string): DocumentChunk => ({
  id,
  documentId: 'doc1',
  sourceId: 'doc1',
  chunkIndex: 0,
  text,
  embeddingId: `vec_${id}`,
  vectorLength: 384,
});

describe('scoreBM25', () => {
  it('ranks chunks containing query terms higher', () => {
    const chunks = [
      baseChunk('c1', 'machine learning neural networks'),
      baseChunk('c2', 'cooking recipes for pasta'),
      baseChunk('c3', 'deep learning with neural architecture'),
    ];

    const results = scoreBM25('neural network learning', chunks, 2);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].chunk.id).not.toBe('c2');
    expect(['c1', 'c3']).toContain(results[0].chunk.id);
  });

  it('returns empty for empty query', () => {
    expect(scoreBM25('', [baseChunk('c1', 'hello')], 5)).toEqual([]);
  });
});
