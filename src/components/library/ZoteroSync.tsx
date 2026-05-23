import { useState, useEffect } from 'react';
import { RefreshCw, Lock, Unplug, FolderOpen } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { useSecureConfig } from '../../contexts/SecureConfigContext';
import { useZotero } from '../../contexts/ZoteroContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ZoteroItemCard } from './ZoteroItemCard';
import { SyncManagementPanel } from './SyncManagementPanel';

export function ZoteroSync() {
  const { t } = useLanguage();
  const globalSettings = useLiveQuery(() => db.settings.get('global'));
  const zoteroConfig = globalSettings?.zoteroConfig;
  const { isUnlocked, getApiKey, hasMasterPasswordSet } = useSecureConfig();
  const {
    isConnected,
    isSyncing,
    lastSync,
    syncProgress,
    autoDownloadPdfs,
    setAutoDownloadPdfs,
    connect,
    sync,
    disconnect,
    importItem,
  } = useZotero();

  const [zoteroUserId, setZoteroUserId] = useState('');
  const [zoteroApiKey, setZoteroApiKey] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string | 'all'>('all');
  const [importingKey, setImportingKey] = useState<string | null>(null);

  const collections = useLiveQuery(() => db.zoteroCollections.toArray()) ?? [];
  const allItems = useLiveQuery(() => db.zoteroItems.toArray()) ?? [];

  const filteredItems =
    selectedCollection === 'all'
      ? allItems
      : allItems.filter((i) => i.collectionKeys?.includes(selectedCollection));

  const syncMeta = useLiveQuery(() => db.zoteroSyncMeta.limit(1).first());

  useEffect(() => {
    if (zoteroConfig?.userId) {
      setZoteroUserId(zoteroConfig.userId);
    }
    if (isUnlocked) {
      getApiKey('zotero').then((key) => {
        if (key) setZoteroApiKey(key);
      });
    }
  }, [zoteroConfig, isUnlocked, getApiKey]);

  const handleConnectAndSync = async () => {
    try {
      await connect(zoteroUserId, zoteroApiKey);
      await sync();
    } catch {
      // Toasts handled in context
    }
  };

  const handleImport = async (item: (typeof allItems)[0]) => {
    setImportingKey(item.key);
    try {
      await importItem(item);
    } finally {
      setImportingKey(null);
    }
  };

  const progressLabel = syncProgress
    ? `${syncProgress.message}${syncProgress.total ? ` (${syncProgress.processed}/${syncProgress.total})` : ''}`
    : null;

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-y-auto md:overflow-hidden pb-16 md:pb-0">
      <div className="w-full md:w-1/3 bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8 flex flex-col shrink-0 h-fit">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 md:mb-6 border border-red-100 mx-auto">
          <span className="text-xl md:text-2xl font-bold text-red-500 font-serif">Z</span>
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-2 text-center">
          {t('lib.zoteroConnectTitle')}
        </h2>
        <p className="text-slate-500 max-w-md mb-4 md:mb-6 text-xs md:text-sm text-center">
          {t('lib.zoteroConnectDesc')}
        </p>
        <div className="space-y-3 w-full">
          {!isUnlocked && hasMasterPasswordSet && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded p-2 text-left">
              <Lock className="w-3 h-3 inline mr-1" />
              {t('lib.zoteroVaultLocked')}
            </p>
          )}
          <input
            type="text"
            placeholder={t('lib.zoteroUserId')}
            value={zoteroUserId}
            onChange={(e) => setZoteroUserId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 md:py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder={t('lib.zoteroApiKey')}
            value={zoteroApiKey}
            onChange={(e) => setZoteroApiKey(e.target.value)}
            disabled={!isUnlocked && hasMasterPasswordSet}
            className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 md:py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          />
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={autoDownloadPdfs}
              onChange={(e) => setAutoDownloadPdfs(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            {t('lib.zoteroAutoPdf')}
          </label>
          <button
            type="button"
            onClick={handleConnectAndSync}
            disabled={isSyncing}
            className="w-full bg-slate-900 text-white font-medium py-2.5 md:py-2 rounded-lg hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isConnected ? t('lib.zoteroConnectSync') : t('lib.zoteroConnect')}
          </button>
          {isConnected && (
            <>
              <button
                type="button"
                onClick={() => void sync()}
                disabled={isSyncing || !isUnlocked}
                className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm disabled:opacity-60"
              >
                {t('lib.zoteroSyncNow')}
              </button>
              <button
                type="button"
                onClick={() => void disconnect()}
                className="w-full text-slate-600 font-medium py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm flex justify-center items-center gap-2"
              >
                <Unplug className="w-4 h-4" />
                {t('lib.zoteroDisconnect')}
              </button>
            </>
          )}
          {isConnected && <SyncManagementPanel />}
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[320px]">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-semibold text-slate-900 text-sm">{t('lib.zoteroHub')}</h2>
          <span className="text-[10px] md:text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
            {lastSync ? `${t('lib.zoteroLastSync')} ${lastSync}` : t('lib.zoteroNeverSynced')}
          </span>
        </div>

        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          <aside className="md:w-48 border-b md:border-b-0 md:border-r border-slate-200 p-3 overflow-y-auto shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
              <FolderOpen className="w-3 h-3" />
              {t('lib.zoteroCollections')}
            </p>
            <button
              type="button"
              onClick={() => setSelectedCollection('all')}
              className={`w-full text-left text-xs px-2 py-1.5 rounded mb-1 ${
                selectedCollection === 'all'
                  ? 'bg-indigo-50 text-indigo-800 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t('lib.zoteroAllItems')} ({allItems.length})
            </button>
            {collections.map((col) => (
              <button
                key={col.key}
                type="button"
                onClick={() => setSelectedCollection(col.key)}
                className={`w-full text-left text-xs px-2 py-1.5 rounded mb-1 truncate ${
                  selectedCollection === col.key
                    ? 'bg-indigo-50 text-indigo-800 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {col.name}
              </button>
            ))}
          </aside>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 grid grid-cols-3 gap-2 border-b border-slate-100">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-slate-900">{allItems.length}</p>
                <p className="text-[9px] text-slate-500 uppercase">{t('lib.zoteroCached')}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-emerald-600">
                  {allItems.filter((i) => i.importedToLocal).length}
                </p>
                <p className="text-[9px] text-emerald-600/80 uppercase">{t('lib.zoteroImported')}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-slate-700">v{syncMeta?.libraryVersion ?? 0}</p>
                <p className="text-[9px] text-slate-500 uppercase">{t('lib.zoteroLibVersion')}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isSyncing && progressLabel && (
                <p className="text-xs text-indigo-600 bg-indigo-50 rounded-lg p-3 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                  {progressLabel}
                </p>
              )}
              {!isSyncing && filteredItems.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-12">{t('lib.zoteroEmpty')}</p>
              )}
              {filteredItems.map((item) => (
                <ZoteroItemCard
                  key={item.key}
                  item={item}
                  onImport={handleImport}
                  isImporting={importingKey === item.key}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
