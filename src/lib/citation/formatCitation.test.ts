import { describe, it, expect } from 'vitest';
import { formatCitationInline, formatBibliographyEntry } from './formatCitation';
import type { Source } from '../../types';

const base: Source = {
  id: 'src_1',
  title: 'Deep Learning',
  authors: ['LeCun, Y.'],
  year: 2015,
  type: 'web',
  addedAt: '2026-01-01',
  isVectorized: false,
  citationKey: 'lecun2015',
};

describe('formatCitation', () => {
  it('formats APA inline citation', () => {
    expect(formatCitationInline(base, 'apa')).toBe('(LeCun, Y., 2015)');
  });

  it('formats IEEE inline citation', () => {
    expect(formatCitationInline(base, 'ieee')).toBe('[Y. 2015]');
  });

  it('formats bibliography with DOI', () => {
    const withDoi = { ...base, doi: '10.1234/dl' };
    const entry = formatBibliographyEntry(withDoi, 'apa');
    expect(entry).toContain('Deep Learning');
    expect(entry).toContain('https://doi.org/10.1234/dl');
  });
});
