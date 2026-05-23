import { db } from '../db';
import { ragService } from '../rag/ragService';

/**
 * Summarize a source from its indexed chunks (local RAG text only).
 */
export async function summarizeSourceFromChunks(
  sourceId: string,
  maxChunks = 8
): Promise<string> {
  const chunks = await db.documentChunks
    .where('sourceId')
    .equals(sourceId)
    .limit(maxChunks)
    .toArray();

  if (chunks.length === 0) {
    return 'No indexed text available. Vectorize the PDF in the Library phase first.';
  }

  const combined = chunks.map((c, i) => `[${i + 1}] ${c.text}`).join('\n\n');
  return combined.slice(0, 6000);
}

/**
 * Rank sources by hybrid RAG relevance to manuscript excerpt.
 */
export async function rankSourcesByRelevance(
  queryText: string,
  topK = 5
): Promise<Array<{ sourceId: string; score: number; title: string }>> {
  if (!queryText.trim()) return [];

  const hits = await ragService.queryRAG(queryText, topK * 3);
  const bySource = new Map<string, number>();

  for (const hit of hits) {
    const sourceId = hit.chunk.sourceId;
    if (!sourceId) continue;
    bySource.set(sourceId, Math.max(bySource.get(sourceId) ?? 0, hit.score));
  }

  const sources = await db.sources.toArray();
  return [...bySource.entries()]
    .map(([sourceId, score]) => {
      const source = sources.find((s) => s.id === sourceId);
      return { sourceId, score, title: source?.title ?? sourceId };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
