import type { Source } from '../../types';
import { createNativeSource } from './sourceService';

const CROSSREF_API = 'https://api.crossref.org/works';

interface CrossrefMessage {
  title?: string[];
  author?: Array<{ given?: string; family?: string }>;
  published?: { 'date-parts'?: number[][] };
  DOI?: string;
  abstract?: string;
  'container-title'?: string[];
}

export function normalizeDoi(input: string): string | null {
  const trimmed = input.trim();
  const match = trimmed.match(/10\.\d{4,9}\/[^\s]+/i);
  return match ? match[0].replace(/[.,;]+$/, '') : null;
}

export async function fetchMetadataByDoi(doi: string): Promise<Partial<Source>> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${CROSSREF_API}/${encodeURIComponent(doi)}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`DOI lookup failed: ${res.statusText}`);
    const json = (await res.json()) as { message: CrossrefMessage };
    const m = json.message;
    const year = m.published?.['date-parts']?.[0]?.[0] ?? new Date().getFullYear();
    const authors =
      m.author?.map((a) => `${a.given ?? ''} ${a.family ?? ''}`.trim()).filter(Boolean) ?? [
        'Unknown',
      ];

    return {
      title: m.title?.[0] ?? 'Untitled',
      authors,
      year,
      doi,
      abstract: m.abstract?.replace(/<[^>]+>/g, '') ?? undefined,
      publicationTitle: m['container-title']?.[0],
      type: 'web',
    };
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function importSourceByDoi(doiInput: string): Promise<string> {
  const doi = normalizeDoi(doiInput);
  if (!doi) throw new Error('Invalid DOI format');
  const meta = await fetchMetadataByDoi(doi);
  return createNativeSource({
    title: meta.title ?? 'Untitled',
    authors: meta.authors ?? ['Unknown'],
    year: meta.year ?? new Date().getFullYear(),
    doi: meta.doi,
    abstract: meta.abstract,
    publicationTitle: meta.publicationTitle,
    type: meta.type ?? 'web',
  });
}
