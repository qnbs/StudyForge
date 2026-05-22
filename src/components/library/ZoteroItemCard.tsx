import { BookMarked, Download, CheckCircle2 } from 'lucide-react';
import type { ZoteroItem } from '../../types';
import { formatZoteroAuthor } from '../../lib/zoteroUtils';
import { useLanguage } from '../../contexts/LanguageContext';

interface ZoteroItemCardProps {
  item: ZoteroItem;
  onImport: (item: ZoteroItem) => void;
  isImporting?: boolean;
}

export function ZoteroItemCard({ item, onImport, isImporting }: ZoteroItemCardProps) {
  const { t } = useLanguage();
  const authors = item.creators.map((c) => formatZoteroAuthor(c)).join(', ');

  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-slate-900 line-clamp-2">{item.title}</h3>
          <p className="text-xs text-slate-500 mt-1 truncate">{authors || t('lib.zoteroUnknownAuthor')}</p>
          <div className="flex flex-wrap gap-2 mt-2 text-[10px] text-slate-500">
            {item.year && <span>{item.year}</span>}
            {item.doi && (
              <span className="font-mono truncate max-w-[180px]" title={item.doi}>
                DOI: {item.doi}
              </span>
            )}
          </div>
        </div>
        {item.importedToLocal ? (
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            {t('lib.zoteroInLibrary')}
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onImport(item)}
            disabled={isImporting}
            aria-label={t('lib.zoteroImportItem')}
            className="flex items-center gap-1 text-[10px] font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 transition-colors shrink-0 disabled:opacity-50"
          >
            <Download className="w-3 h-3" />
            {t('lib.zoteroImport')}
          </button>
        )}
      </div>
      {item.publicationTitle && (
        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
          <BookMarked className="w-3 h-3 shrink-0" />
          <span className="line-clamp-1">{item.publicationTitle}</span>
        </p>
      )}
    </div>
  );
}
