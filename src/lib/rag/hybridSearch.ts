import { db } from '../db';
import type { DocumentChunk } from '../../types';
import { scoreBM25, type BM25ScoredChunk } from './bm25';
import { queryRAGVectors, type ScoredChunk } from './queryRAG';

const RRF_K = 60;
const MAX_CHUNKS_TO_SCAN = 2000;

export type HybridScoredChunk = { chunk: DocumentChunk; score: number };

/** Exported for unit tests. */
export function fuseRankings(
  rankedLists: Array<Array<{ chunk: DocumentChunk; score: number }>>,
  topK: number
): HybridScoredChunk[] {
  const fused = new Map<string, { chunk: DocumentChunk; score: number }>();

  for (const list of rankedLists) {
    list.forEach((item, rank) => {
      const id = item.chunk.id;
      const rrf = 1 / (RRF_K + rank + 1);
      const existing = fused.get(id);
      if (existing) {
        existing.score += rrf;
      } else {
        fused.set(id, { chunk: item.chunk, score: rrf });
      }
    });
  }

  return [...fused.values()].sort((a, b) => b.score - a.score).slice(0, topK);
}

async function loadChunksForQuery(sourceIdFilter?: string): Promise<DocumentChunk[]> {
  let chunks = await db.documentChunks.toArray();
  if (sourceIdFilter) {
    chunks = chunks.filter(
      (c) => c.sourceId === sourceIdFilter || c.documentId === sourceIdFilter
    );
  }
  return chunks.slice(0, MAX_CHUNKS_TO_SCAN);
}

/**
 * Hybrid retrieval: dense vectors (cosine) + sparse BM25 fused via RRF.
 */
export async function queryRAGHybrid(
  queryVector: Float32Array,
  queryText: string,
  topK: number,
  sourceIdFilter?: string
): Promise<HybridScoredChunk[]> {
  const chunks = await loadChunksForQuery(sourceIdFilter);
  const withEmbeddings = chunks.filter((c) => c.embeddingId);

  const bm25Ranked: BM25ScoredChunk[] = scoreBM25(queryText, chunks, topK * 3);
  const vectorRanked: ScoredChunk[] = await queryRAGVectors(
    queryVector,
    topK * 3,
    sourceIdFilter
  );

  if (bm25Ranked.length === 0 && vectorRanked.length === 0) {
    return [];
  }
  if (bm25Ranked.length === 0) {
    return vectorRanked.slice(0, topK);
  }
  if (vectorRanked.length === 0 || withEmbeddings.length === 0) {
    return bm25Ranked.slice(0, topK);
  }

  return fuseRankings([bm25Ranked, vectorRanked], topK);
}
