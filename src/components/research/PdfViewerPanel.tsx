import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { useLanguage } from '../../contexts/LanguageContext';

interface PdfViewerPanelProps {
  sourceId: string;
  title: string;
}

export function PdfViewerPanel({ sourceId, title }: PdfViewerPanelProps) {
  const { t } = useLanguage();
  const chunks =
    useLiveQuery(
      () =>
        db.documentChunks.where('sourceId').equals(sourceId).sortBy('chunkIndex'),
      [sourceId]
    ) ?? [];

  if (chunks.length === 0) {
    return (
      <p className="text-sm text-slate-500 bg-white border border-slate-200 rounded-lg p-4">
        {t('research.pdfPlaceholder')}
      </p>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-600">
        {title} — {chunks.length} {t('research.chunks')}
      </div>
      <div className="max-h-64 overflow-y-auto p-3 space-y-3 text-sm text-slate-700 leading-relaxed">
        {chunks.slice(0, 12).map((chunk) => (
          <p key={chunk.id} className="border-l-2 border-indigo-200 pl-3">
            {chunk.text}
          </p>
        ))}
        {chunks.length > 12 && (
          <p className="text-xs text-slate-400">… {chunks.length - 12} more chunks</p>
        )}
      </div>
    </div>
  );
}
