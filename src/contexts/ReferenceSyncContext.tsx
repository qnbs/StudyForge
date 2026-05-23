import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { referenceSyncOrchestrator, type OrchestratorProgress } from '../lib/reference/orchestrator';
import type { PushConflict } from '../lib/zotero/pushUtils';
import {
  resolveConflictKeepLocal,
  resolveConflictKeepRemote,
} from '../lib/zotero/pushUtils';
import { resolveZoteroCredentials } from '../lib/zotero/zoteroClient';
import { useSecureConfig } from './SecureConfigContext';
import { toast } from 'sonner';
import type { SyncJobHistoryEntry } from '../types';

interface ReferenceSyncContextState {
  syncProgress: OrchestratorProgress | null;
  isSyncing: boolean;
  conflicts: PushConflict[];
  jobHistory: SyncJobHistoryEntry[];
  pullZotero: (autoDownloadPdfs?: boolean) => Promise<void>;
  pushZotero: () => Promise<void>;
  cancelSync: () => void;
  resolveKeepLocal: (conflict: PushConflict) => Promise<void>;
  resolveKeepRemote: (conflict: PushConflict) => Promise<void>;
}

const ReferenceSyncContext = createContext<ReferenceSyncContextState | undefined>(undefined);

export function ReferenceSyncProvider({ children }: { children: ReactNode }) {
  const { getApiKey, isUnlocked } = useSecureConfig();
  const [syncProgress, setSyncProgress] = useState<OrchestratorProgress | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [conflicts, setConflicts] = useState<PushConflict[]>([]);

  const jobHistory: SyncJobHistoryEntry[] =
    useLiveQuery(() => db.syncJobHistory.orderBy('completedAt').reverse().limit(20).toArray()) ?? [];

  useEffect(() => {
    return referenceSyncOrchestrator.onProgress((p) => setSyncProgress(p));
  }, []);

  const pullZotero = useCallback(
    async (autoDownloadPdfs?: boolean) => {
      if (!isUnlocked) {
        toast.error('Unlock vault to sync.');
        return;
      }
      const credentials = await resolveZoteroCredentials(getApiKey);
      setIsSyncing(true);
      setConflicts([]);
      try {
        await referenceSyncOrchestrator.enqueuePull('zotero', credentials, {
          autoDownloadPdfs,
          useWorker: true,
        });
        toast.success('Zotero pull complete');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Sync failed');
      } finally {
        setIsSyncing(false);
      }
    },
    [getApiKey, isUnlocked]
  );

  const pushZotero = useCallback(async () => {
    if (!isUnlocked) {
      toast.error('Unlock vault to push.');
      return;
    }
    const settings = await db.settings.get('global');
    if (!settings?.featureFlags?.zoteroPush) {
      toast.warning('Enable Zotero push in Settings → Privacy feature flags.');
      return;
    }
    const credentials = await resolveZoteroCredentials(getApiKey);
    setIsSyncing(true);
    try {
      const result = await referenceSyncOrchestrator.enqueuePush(credentials);
      setConflicts(result.conflicts);
      if (result.conflicts.length > 0) {
        toast.warning(`${result.conflicts.length} conflict(s) need resolution`);
      } else {
        toast.success(`Pushed ${result.pushed} item(s) to Zotero`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Push failed');
    } finally {
      setIsSyncing(false);
    }
  }, [getApiKey, isUnlocked]);

  const cancelSync = useCallback(() => {
    referenceSyncOrchestrator.cancel();
    setIsSyncing(false);
  }, []);

  const resolveKeepLocal = useCallback(
    async (conflict: PushConflict) => {
      const credentials = await resolveZoteroCredentials(getApiKey);
      await resolveConflictKeepLocal(credentials, conflict);
      setConflicts((c) => c.filter((x) => x.sourceId !== conflict.sourceId));
    },
    [getApiKey]
  );

  const resolveKeepRemote = useCallback(async (conflict: PushConflict) => {
    await resolveConflictKeepRemote(conflict);
    setConflicts((c) => c.filter((x) => x.sourceId !== conflict.sourceId));
  }, []);

  return (
    <ReferenceSyncContext.Provider
      value={{
        syncProgress,
        isSyncing,
        conflicts,
        jobHistory,
        pullZotero,
        pushZotero,
        cancelSync,
        resolveKeepLocal,
        resolveKeepRemote,
      }}
    >
      {children}
    </ReferenceSyncContext.Provider>
  );
}

export function useReferenceSync() {
  const ctx = useContext(ReferenceSyncContext);
  if (!ctx) throw new Error('useReferenceSync requires ReferenceSyncProvider');
  return ctx;
}
