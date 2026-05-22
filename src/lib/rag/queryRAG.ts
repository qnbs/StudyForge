import { db } from '../db';
import { loadVectorFromOPFS } from '../opfs';
import { cosineSimilarity } from '../utils/cosineSimilarity';
import type { DocumentChunk } from '../../types';

const OPFS_BATCH_SIZE = 32;
const MAX_CHUNKS_TO_SCAN = 2000;

export type ScoredChunk = { chunk: DocumentChunk; score: number };

function mergeTopK(
  current: ScoredChunk[],
  incoming: ScoredChunk[],
  topK: number
): ScoredChunk[] {
  const merged = [...current, ...incoming];
  merged.sort((a, b) => b.score - a.score);
  return merged.slice(0, topK);
}

/**
 * Batched vector retrieval — avoids loading all OPFS blobs at once (OOM guard).
 */
export async function queryRAGVectors(
  queryVector: Float32Array,
  topK: number,
  sourceIdFilter?: string
): Promise<ScoredChunk[]> {
  let chunks = await db.documentChunks.toArray();
  if (sourceIdFilter) {
    chunks = chunks.filter((c) => c.sourceId === sourceIdFilter || c.documentId === sourceIdFilter);
  }
  const withEmbeddings = chunks.filter((c) => c.embeddingId).slice(0, MAX_CHUNKS_TO_SCAN);

  let topResults: ScoredChunk[] = [];

  for (let i = 0; i < withEmbeddings.length; i += OPFS_BATCH_SIZE) {
    const batch = withEmbeddings.slice(i, i + OPFS_BATCH_SIZE);
    const scored: ScoredChunk[] = [];

    for (const chunk of batch) {
      const vec = await loadVectorFromOPFS(chunk.embeddingId!);
      if (vec) {
        scored.push({ chunk, score: cosineSimilarity(queryVector, vec) });
      }
    }

    topResults = mergeTopK(topResults, scored, topK);
  }

  return topResults;
}
