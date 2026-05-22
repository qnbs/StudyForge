import type { DocumentChunk } from '../../types';

const K1 = 1.5;
const B = 0.75;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

export interface BM25ScoredChunk {
  chunk: DocumentChunk;
  score: number;
}

/**
 * Lightweight BM25 over in-memory chunk texts (no external index).
 */
export function scoreBM25(
  query: string,
  chunks: DocumentChunk[],
  topK: number
): BM25ScoredChunk[] {
  if (chunks.length === 0) return [];

  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) return [];

  const docTokens = chunks.map((c) => tokenize(c.text));
  const docLengths = docTokens.map((t) => t.length);
  const avgDl = docLengths.reduce((a, b) => a + b, 0) / docLengths.length || 1;
  const N = chunks.length;

  const df = new Map<string, number>();
  for (const tokens of docTokens) {
    const seen = new Set(tokens);
    for (const term of seen) {
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  }

  const scored: BM25ScoredChunk[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const tokens = docTokens[i];
    const dl = docLengths[i];
    const tf = new Map<string, number>();
    for (const t of tokens) {
      tf.set(t, (tf.get(t) ?? 0) + 1);
    }

    let score = 0;
    for (const term of queryTerms) {
      const termDf = df.get(term) ?? 0;
      if (termDf === 0) continue;
      const idf = Math.log(1 + (N - termDf + 0.5) / (termDf + 0.5));
      const freq = tf.get(term) ?? 0;
      const denom = freq + K1 * (1 - B + (B * dl) / avgDl);
      score += idf * ((freq * (K1 + 1)) / denom);
    }

    if (score > 0) {
      scored.push({ chunk: chunks[i], score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
