import type { PushConflict } from '../../lib/zotero/pushUtils';
import { useReferenceSync } from '../../contexts/ReferenceSyncContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface ConflictResolutionModalProps {
  conflicts: PushConflict[];
}

export function ConflictResolutionModal({ conflicts }: ConflictResolutionModalProps) {
  const { t } = useLanguage();
  const { resolveKeepLocal, resolveKeepRemote } = useReferenceSync();

  return (
    <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 space-y-3">
      <h4 className="text-sm font-semibold text-amber-900">{t('sync.conflictsTitle')}</h4>
      {conflicts.map((c) => (
        <div key={c.sourceId} className="bg-white border border-amber-100 rounded p-3 text-sm">
          <p className="text-slate-700 mb-2">{c.message}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void resolveKeepLocal(c)}
              className="px-2 py-1 text-xs bg-indigo-600 text-white rounded"
            >
              {t('sync.keepLocal')}
            </button>
            <button
              type="button"
              onClick={() => void resolveKeepRemote(c)}
              className="px-2 py-1 text-xs border border-slate-300 rounded"
            >
              {t('sync.keepRemote')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
