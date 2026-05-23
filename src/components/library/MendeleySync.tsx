import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../../lib/db';
import { useSecureConfig } from '../../contexts/SecureConfigContext';
import { useReferenceSync } from '../../contexts/ReferenceSyncContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  buildMendeleyAuthUrl,
  exchangeMendeleyCode,
  parseMendeleyOAuthCallback,
  clearMendeleyOAuthParams,
} from '../../lib/mendeley/oauth';
import { importMendeleyDocToSources } from '../../lib/mendeley/mendeleySync';

export function MendeleySync() {
  const { t } = useLanguage();
  const settings = useLiveQuery(() => db.settings.get('global'));
  const { saveApiKey, isUnlocked, hasMasterPasswordSet } = useSecureConfig();
  const { isSyncing } = useReferenceSync();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const docs = useLiveQuery(() => db.mendeleyDocuments.toArray()) ?? [];
  const isConnected = !!settings?.mendeleyConfig?.accessToken;

  useEffect(() => {
    const parsed = parseMendeleyOAuthCallback();
    if (!parsed) return;

    setIsAuthenticating(true);
    exchangeMendeleyCode(parsed.code)
      .then(async (tokens) => {
        await saveApiKey('mendeley', tokens.accessToken);
        await db.settings.update('global', {
          mendeleyConfig: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: tokens.expiresAt,
          },
        });
        clearMendeleyOAuthParams();
        toast.success(t('mendeley.connected'));
      })
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : 'OAuth failed');
      })
      .finally(() => setIsAuthenticating(false));
  }, [saveApiKey, t]);

  const handleAuth = () => {
    if (!hasMasterPasswordSet || !isUnlocked) {
      toast.error(t('mendeley.vaultRequired'));
      return;
    }
    try {
      window.location.href = buildMendeleyAuthUrl();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'OAuth not configured');
    }
  };

  const handleSync = async () => {
    const token = settings?.mendeleyConfig?.accessToken;
    if (!token) return;
    const { referenceSyncOrchestrator } = await import('../../lib/reference/orchestrator');
    try {
      await referenceSyncOrchestrator.enqueuePull('mendeley', { accessToken: token });
      toast.success(t('mendeley.syncDone'));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Sync failed');
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-y-auto md:overflow-hidden pb-16 md:pb-0">
      <div className="w-full md:w-1/3 bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col shrink-0 h-fit">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">{t('mendeley.title')}</h2>
        <p className="text-xs text-slate-500 mb-4">{t('mendeley.desc')}</p>
        <button
          type="button"
          onClick={handleAuth}
          disabled={isAuthenticating}
          className="w-full bg-[#9E002B] text-white font-medium py-2 rounded-lg text-sm mb-2"
        >
          {t('mendeley.authenticate')}
        </button>
        {isConnected && (
          <button
            type="button"
            onClick={() => void handleSync()}
            disabled={isSyncing}
            className="w-full bg-slate-800 text-white font-medium py-2 rounded-lg text-sm flex justify-center items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {t('mendeley.sync')}
          </button>
        )}
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b bg-slate-50 font-semibold text-sm">{t('mendeley.documents')}</div>
        <div className="p-2 max-h-96 overflow-y-auto space-y-2">
          {docs.length === 0 && (
            <p className="text-sm text-slate-500 p-4 text-center">{t('mendeley.empty')}</p>
          )}
          {docs.map((doc) => (
            <div key={doc.key} className="p-3 border rounded-lg flex justify-between gap-2 items-start">
              <div className="min-w-0">
                <p className="text-sm font-medium line-clamp-2">{doc.title}</p>
                <p className="text-xs text-slate-500">{doc.authors.join(', ')}</p>
              </div>
              {!doc.importedToLocal && (
                <button
                  type="button"
                  onClick={() => void importMendeleyDocToSources(doc.key)}
                  className="text-xs text-indigo-700 shrink-0"
                >
                  {t('lib.zoteroImport')}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
