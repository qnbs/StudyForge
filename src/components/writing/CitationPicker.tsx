import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { Search, X } from 'lucide-react';
import { formatCitationInline, type CitationStyleId } from '../../lib/citation/formatCitation';
import { useLanguage } from '../../contexts/LanguageContext';

interface CitationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (sourceId: string, label: string) => void;
}

export function CitationPicker({ isOpen, onClose, onSelect }: CitationPickerProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [style, setStyle] = useState<CitationStyleId>('apa');
  const sources = useLiveQuery(() => db.sources.toArray(), []) ?? [];

  if (!isOpen) return null;

  const filtered = sources.filter((s) => {
    const q = query.toLowerCase();
    if (!q) return true;
    return (
      s.title.toLowerCase().includes(q) ||
      s.authors.some((a) => a.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-slate-900">{t('citation.pickerTitle')}</h3>
          <button type="button" onClick={onClose} aria-label={t('citation.close')}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('citation.search')}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as CitationStyleId)}
            className="w-full border rounded-lg text-sm py-2"
            aria-label={t('citation.style')}
          >
            <option value="apa">APA</option>
            <option value="ieee">IEEE</option>
            <option value="vancouver">Vancouver</option>
          </select>
        </div>
        <ul className="overflow-y-auto flex-1 p-2">
          {filtered.map((source) => (
            <li key={source.id}>
              <button
                type="button"
                className="w-full text-left p-3 hover:bg-slate-50 rounded-lg text-sm"
                onClick={() => {
                  onSelect(source.id, formatCitationInline(source, style));
                  onClose();
                }}
              >
                <span className="font-medium text-slate-900 line-clamp-1">{source.title}</span>
                <span className="text-xs text-slate-500 block mt-1">
                  {formatCitationInline(source, style)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
