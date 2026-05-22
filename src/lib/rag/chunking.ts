/** Word-based chunks (~512 words ≈ token-friendly for MiniLM). Overlap preserves context. */
export function chunkText(text: string, chunkSize: number = 512, overlap: number = 64): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const words = normalized.split(' ');
  const chunks: string[] = [];
  let i = 0;

  while (i < words.length) {
    const endIndex = Math.min(i + chunkSize, words.length);
    chunks.push(words.slice(i, endIndex).join(' '));
    if (endIndex >= words.length) break;
    i += Math.max(1, chunkSize - overlap);
  }

  return chunks;
}
