import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { db } from '../lib/db';
import { useSecureConfig } from './SecureConfigContext';
import { useReferenceSync } from './ReferenceSyncContext';
import { resetZoteroClient } from '../lib/zotero/zoteroClient';
import { importZoteroItemToSources } from '../lib/zotero/importToSources';
import type { ZoteroItem } from '../types';
import type { SyncProgress } from '../lib/zotero/syncUtils';

const AUTO_PDF_STORAGE_KEY = 'studyforge_zotero_auto_pdf';

interface ZoteroContextState {
  isConnected: boolean;
  isSyncing: boolean;
  lastSync: string | null;
  syncProgress: SyncProgress | null;
  autoDownloadPdfs: boolean;
  setAutoDownloadPdfs: (value: boolean) => void;
  connect: (userId: string, apiKey: string) => Promise<void>;
  sync: () => Promise<void>;
  disconnect: () => Promise<void>;
  importItem: (item: ZoteroItem) => Promise<boolean>;
}

const ZoteroContext = createContext<ZoteroContextState | undefined>(undefined);

export function ZoteroProvider({ children }: { children: ReactNode }) {
  const globalSettings = useLiveQuery(() => db.settings.get('global'));
  const zoteroConfig = globalSettings?.zoteroConfig;
  const { isUnlocked, saveApiKey, getApiKey, hasMasterPasswordSet } = useSecureConfig();
  const { pullZotero, isSyncing: refSyncing, syncProgress: refProgress } = useReferenceSync();

  const [lastSync, setLastSync] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [autoDownloadPdfs, setAutoDownloadPdfsState] = useState(
    () => localStorage.getItem(AUTO_PDF_STORAGE_KEY) === 'true'
  );

  const isConnected = !!(zoteroConfig?.userId && hasApiKey);
  const isSyncing = refSyncing;
  const syncProgress = refProgress as SyncProgress | null;

  useEffect(() => {
    if (isUnlocked) {
      getApiKey('zotero').then((key) => setHasApiKey(!!key));
    } else {
      setHasApiKey(false);
    }
  }, [isUnlocked, getApiKey, zoteroConfig]);

  useEffect(() => {
    db.zoteroSyncMeta.limit(1).first().then((meta) => {
      if (meta?.lastSyncTimestamp && meta.lastSyncTimestamp !== new Date(0).toISOString()) {
        setLastSync(new Date(meta.lastSyncTimestamp).toLocaleString());
      }
    });
  }, [isSyncing]);

  const setAutoDownloadPdfs = useCallback((value: boolean) => {
    setAutoDownloadPdfsState(value);
    localStorage.setItem(AUTO_PDF_STORAGE_KEY, value ? 'true' : 'false');
  }, []);

  const connect = useCallback(
    async (userId: string, apiKey: string) => {
      if (!hasMasterPasswordSet) {
        toast.error('Please configure your Master Password in Settings first.');
        throw new Error('Master password not set');
      }
      if (!isUnlocked) {
        toast.error('Please unlock your Secure Vault in Settings to save API keys.');
        throw new Error('Vault locked');
      }

      await db.settings.update('global', {
        zoteroConfig: { userId: userId.trim() },
      });

      if (apiKey.trim()) {
        await saveApiKey('zotero', apiKey.trim());
        setHasApiKey(true);
      }

      resetZoteroClient();
      toast.success('Zotero credentials saved securely in local vault.');
    },
    [hasMasterPasswordSet, isUnlocked, saveApiKey]
  );

  const sync = useCallback(async () => {
    await pullZotero(autoDownloadPdfs);
    setLastSync(new Date().toLocaleString());
  }, [pullZotero, autoDownloadPdfs]);

  const disconnect = useCallback(async () => {
    await db.settings.update('global', { zoteroConfig: undefined });
    resetZoteroClient();
    setHasApiKey(false);
    toast.success('Zotero disconnected.');
  }, []);

  const importItem = useCallback(async (item: ZoteroItem) => {
    const added = await importZoteroItemToSources(item);
    if (added) {
      toast.success(`"${item.title}" added to local library.`);
    } else {
      toast.info(`"${item.title}" is already in your local library.`);
    }
    return added;
  }, []);

  useEffect(() => {
    const onSyncRequest = () => {
      if (!isSyncing) void sync();
    };
    window.addEventListener('studyforge:sync-zotero', onSyncRequest);
    return () => window.removeEventListener('studyforge:sync-zotero', onSyncRequest);
  }, [isSyncing, sync]);

  return (
    <ZoteroContext.Provider
      value={{
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
      }}
    >
      {children}
    </ZoteroContext.Provider>
  );
}

export function useZotero() {
  const context = useContext(ZoteroContext);
  if (context === undefined) {
    throw new Error('useZotero must be used within a ZoteroProvider');
  }
  return context;
}
