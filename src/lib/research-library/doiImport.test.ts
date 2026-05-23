import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { normalizeDoi, fetchMetadataByDoi } from './doiImport';

describe('doiImport', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          message: {
            title: ['Attention Is All You Need'],
            author: [{ given: 'Ashish', family: 'Vaswani' }],
            published: { 'date-parts': [[2017]] },
            DOI: '10.5555/1234567',
          },
        }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('normalizes DOI from URL', () => {
    expect(normalizeDoi('https://doi.org/10.1234/abc')).toBe('10.1234/abc');
    expect(normalizeDoi('invalid')).toBeNull();
  });

  it('fetches metadata from Crossref', async () => {
    const meta = await fetchMetadataByDoi('10.5555/1234567');
    expect(meta.title).toBe('Attention Is All You Need');
    expect(meta.year).toBe(2017);
    expect(meta.authors?.[0]).toContain('Vaswani');
  });
});
