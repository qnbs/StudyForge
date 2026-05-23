import { Search, Database, FileText, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useResearchSources, type SourceTypeFilter } from '../../hooks/useResearchSources';
import { PdfViewerPanel } from '../research/PdfViewerPanel';
import { ResearchInsightsPanel } from '../research/ResearchInsightsPanel';

export function ResearchPhase() {
  const { t } = useLanguage();
  const {
    query,
    setQuery,
    typeFilter,
    setTypeFilter,
    selectedId,
    setSelectedId,
    filteredSources,
    selectedSource,
  } = useResearchSources();

  const typeOptions: { value: SourceTypeFilter; label: string }[] = [
    { value: 'all', label: t('research.filterAll') },
    { value: 'pdf', label: 'PDF' },
    { value: 'zotero', label: 'Zotero' },
    { value: 'web', label: 'Web' },
    { value: 'book', label: t('research.filterBook') },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 h-full flex flex-col animate-in fade-in duration-500">
      <div className="shrink-0">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-tight">
          {t('research.title')}
        </h1>
        <p className="mt-1 md:mt-2 text-sm md:text-base text-slate-500">{t('research.desc')}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('research.searchPlaceholder')}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm md:text-base text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as SourceTypeFilter)}
            aria-label={t('research.filters')}
            className="appearance-none bg-white border border-slate-200 text-slate-700 pl-4 pr-10 py-3 sm:py-2 rounded-xl shadow-sm hover:bg-slate-50 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {typeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-0">
        <div className="w-full md:w-1/2 lg:w-5/12 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col h-1/2 md:h-auto min-h-0">
          <div className="p-3 md:p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between shrink-0">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-sm md:text-base">
              <Database className="w-4 h-4 text-indigo-600" />
              {t('research.vectorStore')}
            </h2>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full font-medium">
              {filteredSources.length} {t('research.items')}
            </span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {filteredSources.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500 mt-10">
                {query ? t('research.noMatch') : t('research.noSources')}
              </div>
            ) : (
              filteredSources.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => setSelectedId(source.id)}
                  className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors border ${
                    selectedId === source.id
                      ? 'bg-indigo-50 border-indigo-200'
                      : 'hover:bg-slate-50 border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="bg-red-50 text-red-600 p-2 rounded-md shrink-0 border border-red-100">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-slate-900 leading-tight line-clamp-2">
                      {source.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {source.authors.join(', ')} • {source.year}
                      {source.isVectorized ? ` • ${t('lib.vectorized')}` : ''}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="w-full md:w-1/2 lg:w-7/12 bg-slate-50 flex flex-col min-h-0 flex-1 overflow-hidden">
          {selectedSource ? (
            <div className="flex flex-col h-full overflow-y-auto p-4 md:p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selectedSource.title}</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {selectedSource.authors.join(', ')} ({selectedSource.year})
                </p>
                {selectedSource.doi && (
                  <p className="text-xs font-mono text-slate-500 mt-2">DOI: {selectedSource.doi}</p>
                )}
                {selectedSource.abstract && (
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed line-clamp-6">
                    {selectedSource.abstract}
                  </p>
                )}
              </div>
              {selectedSource.type === 'pdf' && (
                <PdfViewerPanel sourceId={selectedSource.id} title={selectedSource.title} />
              )}
              <ResearchInsightsPanel selectedSource={selectedSource} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-6">
              <div className="max-w-xs space-y-3">
                <div className="bg-white p-4 rounded-full inline-block shadow-sm text-slate-400">
                  <Database className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">{t('research.selectSource')}</h3>
                <p className="text-sm text-slate-500">{t('research.previewDesc')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
