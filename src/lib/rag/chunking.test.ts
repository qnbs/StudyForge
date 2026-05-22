import { describe, it, expect } from 'vitest';
import { chunkText } from './chunking';

describe('Text Chunking strategy', () => {
  it('should split text into words correctly', () => {
     const text = "Word1 word2 word3 word4 word5 word6";
     // size 3, overlap 1
     const chunks = chunkText(text, 3, 1);
     expect(chunks.length).toBe(3);
     expect(chunks[0]).toBe("Word1 word2 word3");
     expect(chunks[1]).toBe("word3 word4 word5");
     expect(chunks[2]).toBe("word5 word6");
  });

  it('should handle small text elegantly', () => {
     const text = "Too short";
     const chunks = chunkText(text, 100, 20);
     expect(chunks.length).toBe(1);
     expect(chunks[0]).toBe("Too short");
  });
});
