export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  // A simple chunker using words
  const words = text.split(/\\s+/);
  const chunks = [];
  let i = 0;
  
  while (i < words.length) {
    const endIndex = Math.min(i + chunkSize, words.length);
    chunks.push(words.slice(i, endIndex).join(' '));
    i += chunkSize - overlap;
  }
  
  return chunks;
}
