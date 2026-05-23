import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import type { Source } from '../types';

export type SourceTypeFilter = 'all' | Source['type'];

export function useResearchSources() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<SourceTypeFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const allSources = useLiveQuery(() => db.sources.toArray(), []) ?? [];

  const filteredSources = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allSources.filter((s) => {
      if (typeFilter !== 'all' && s.type !== typeFilter) return false;
      if (!q) return true;
      const haystack = [
        s.title,
        s.authors.join(' '),
        String(s.year),
        s.doi ?? '',
        s.citationKey ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [allSources, query, typeFilter]);

  const selectedSource = useMemo(
    () => filteredSources.find((s) => s.id === selectedId) ?? allSources.find((s) => s.id === selectedId) ?? null,
    [filteredSources, allSources, selectedId]
  );

  return {
    query,
    setQuery,
    typeFilter,
    setTypeFilter,
    selectedId,
    setSelectedId,
    allSources,
    filteredSources,
    selectedSource,
  };
}
