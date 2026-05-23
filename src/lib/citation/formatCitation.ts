import type { Source } from '../../types';

export type CitationStyleId = 'apa' | 'vancouver' | 'ieee';

/**
 * Lightweight citation formatter (no external deps). For CSL-accurate output,
 * integrate @citation-js/core when bundle size allows.
 */
export function formatCitationInline(source: Source, style: CitationStyleId = 'apa'): string {
  const author =
    source.authors[0] ?? 'Unknown';
  const year = source.year;

  switch (style) {
    case 'vancouver':
      return `[${source.citationKey ?? source.id}]`;
    case 'ieee':
      return `[${author.split(' ').pop()} ${year}]`;
    case 'apa':
    default:
      return `(${author}, ${year})`;
  }
}

export function formatBibliographyEntry(source: Source, style: CitationStyleId = 'apa'): string {
  const authors = source.authors.join(', ');
  const doi = source.doi ? ` https://doi.org/${source.doi}` : '';

  switch (style) {
    case 'ieee':
      return `[${source.citationKey ?? '1'}] ${authors}, "${source.title}," ${source.year}.${doi}`;
    case 'vancouver':
      return `${authors}. ${source.title}. ${source.year}.${doi}`;
    case 'apa':
    default:
      return `${authors} (${source.year}). ${source.title}.${doi}`;
  }
}

export function formatCitationHtml(
  source: Source,
  style: CitationStyleId = 'apa'
): string {
  const label = formatCitationInline(source, style);
  return `<span data-citation-source-id="${source.id}" class="citation-ref">${label}</span>`;
}
