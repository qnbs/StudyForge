import { useLiveQuery } from 'dexie-react-hooks';
import { RefreshCw, Upload, XCircle } from 'lucide-react';
import { db } from '../../lib/db';
import { useReferenceSync } from '../../contexts/ReferenceSyncContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ConflictResolutionModal } from './ConflictResolutionModal';

export function SyncManagementPanel() {
  const { t } = useLanguage();
  const {
    syncProgress,
    isSyncing,
    conflicts,
    jobHistory,
    pullZotero,
    pushZotero,
    cancelSync,
  } = useReferenceSync();

  const queue = useLiveQuery(() => db.syncQueue.orderBy('createdAt').reverse().limit(10).toArray()) ?? [];

  return (
    <div className="mt-4 border border-slate-200 rounded-xl bg-slate-50 p-4 space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isSyncing}
          onClick={() => void pullZotero(false)}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {t('sync.pull')}
        </button>
        <button
          type="button"
          disabled={isSyncing}
          onClick={() => void pushZotero()}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-900 disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          {t('sync.push')}
        </button>
        {isSyncing && (
          <button
            type="button"
            onClick={cancelSync}
            className="flex items-center gap-2 px-3 py-2 border border-slate-300 text-sm rounded-lg"
          >
            <XCircle className="w-4 h-4" />
            {t('sync.cancel')}
          </button>
        )}
      </div>

      {syncProgress && (
        <p className="text-xs text-indigo-700 bg-indigo-50 rounded p-2">{syncProgress.message}</p>
      )}

      <div>
        <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">{t('sync.queue')}</h4>
        <ul className="space-y-1 text-xs text-slate-600">
          {queue.length === 0 && <li>{t('sync.queueEmpty')}</li>}
          {queue.map((job) => (
            <li key={job.id} className="flex justify-between gap-2">
              <span>
                {job.provider} / {job.jobType}
              </span>
              <span className={job.status === 'failed' ? 'text-red-600' : ''}>{job.status}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">{t('sync.history')}</h4>
        <ul className="space-y-1 text-xs text-slate-600 max-h-24 overflow-y-auto">
          {jobHistory.map((h) => (
            <li key={h.id}>
              {h.success ? '✓' : '✗'} {h.provider} {h.jobType}: {h.message}
            </li>
          ))}
        </ul>
      </div>

      {conflicts.length > 0 && <ConflictResolutionModal conflicts={conflicts} />}
    </div>
  );
}
