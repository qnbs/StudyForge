import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Lock } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { toast } from 'sonner';
import { useSecureConfig } from '../../contexts/SecureConfigContext';

export function ZoteroSync() {
  const globalSettings = useLiveQuery(() => db.settings.get('global'));
  const zoteroConfig = globalSettings?.zoteroConfig;
  const { isUnlocked, saveApiKey, getApiKey, hasMasterPasswordSet } = useSecureConfig();

  const [zoteroUserId, setZoteroUserId] = useState('');
  const [zoteroApiKey, setZoteroApiKey] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ total: number, synced: number }>({ total: 0, synced: 0 });
  const [lastSync, setLastSync] = useState<string>('never');

  useEffect(() => {
    if (zoteroConfig) {
      setZoteroUserId(zoteroConfig.userId || '');
    }
    // Only attempt to load the API key if the vault is unlocked
    if (isUnlocked) {
       getApiKey('zotero').then(key => {
         if (key) setZoteroApiKey(key);
       });
    }
  }, [zoteroConfig, isUnlocked, getApiKey]);

  const handleSaveZoteroConfig = async () => {
    if (!hasMasterPasswordSet) {
        toast.error("Please configure your Master Password in Settings first.");
        return;
    }
    if (!isUnlocked) {
        toast.error("Please unlock your Secure Vault in Settings to save API keys.");
        return;
    }

    try {
      await db.settings.update('global', {
          zoteroConfig: {
            userId: zoteroUserId
          }
      });

      if (zoteroApiKey) {
        await saveApiKey('zotero', zoteroApiKey);
      }
      toast.success('Zotero credentials saved securely in local vault.');
      handleSync(); // trigger sync after saving
    } catch (err) {
      console.error(err);
      toast.error('Failed to save Zotero configuration securely.');
    }
  };

  const handleSync = useCallback(async () => {
    if (!zoteroUserId || !zoteroApiKey) {
      toast.error('Please provide both Zotero User ID and API Key.');
      return;
    }

    setIsSyncing(true);
    try {
       const controller = new AbortController();
       const timeoutId = window.setTimeout(() => controller.abort(), 30000);

       const response = await fetch(`https://api.zotero.org/users/${zoteroUserId}/items?v=3&format=json&limit=50`, {
         headers: {
           'Zotero-API-Key': zoteroApiKey
         },
         signal: controller.signal,
       });
       window.clearTimeout(timeoutId);

       if (!response.ok) {
         throw new Error(`Zotero API Error: ${response.statusText}`);
       }

       const data = await response.json();
       let newSources = 0;

       for (const item of data) {
         if (item.data.itemType === 'attachment' || item.data.itemType === 'note') continue;
         
         const sourceId = `zotero_${item.key}`;
         const existing = await db.sources.get(sourceId);
         
         if (!existing) {
           await db.sources.put({
             id: sourceId,
             title: item.data.title || 'Untitled',
             authors: item.data.creators?.map((c: { firstName?: string; lastName?: string; name?: string }) => c.firstName ? `${c.firstName} ${c.lastName}` : c.name) || ['Unknown'],
             year: item.data.date ? parseInt(item.data.date.substring(0, 4)) : new Date().getFullYear(),
             type: 'zotero',
             addedAt: new Date().toISOString(),
             isVectorized: false,
             url: item.data.url || ''
           });
           newSources++;
         }
       }

       setSyncStatus({ total: data.length, synced: newSources });
       setLastSync(new Date().toLocaleTimeString());
       toast.success(`Zotero sync complete. Added ${newSources} new items.`);
    } catch (err) {
       console.error(err);
       toast.error('Failed to sync with Zotero API.');
    } finally {
       setIsSyncing(false);
    }
  }, [zoteroUserId, zoteroApiKey]);

  useEffect(() => {
    const onSyncRequest = () => {
      if (zoteroUserId && zoteroApiKey && !isSyncing) {
        void handleSync();
      }
    };
    window.addEventListener('studyforge:sync-zotero', onSyncRequest);
    return () => window.removeEventListener('studyforge:sync-zotero', onSyncRequest);
  }, [zoteroUserId, zoteroApiKey, isSyncing, handleSync]);

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-y-auto md:overflow-hidden pb-16 md:pb-0">
      <div className="w-full md:w-1/3 bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8 flex flex-col items-center justify-center text-center shrink-0 h-fit">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 md:mb-6 border border-red-100">
          <span className="text-xl md:text-2xl font-bold text-red-500 font-serif">Z</span>
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">Connect to Zotero</h2>
        <p className="text-slate-500 max-w-md mb-4 md:mb-6 text-xs md:text-sm">
          Sync your Zotero collections directly into your local database.
        </p>
        <div className="space-y-3 w-full">
          {(!isUnlocked && hasMasterPasswordSet) && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded p-2 text-left mb-2">
              <Lock className="w-3 h-3 inline mr-1" />
              Vault locked. Unlock in settings to load or change API key.
            </p>
          )}
          <input 
            type="text" 
            placeholder="Zotero User ID" 
            value={zoteroUserId}
            onChange={(e) => setZoteroUserId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 md:py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
          />
          <input 
            type="password" 
            placeholder="Zotero API Key (Vault Encrypted)" 
            value={zoteroApiKey}
            onChange={(e) => setZoteroApiKey(e.target.value)}
            disabled={!isUnlocked && hasMasterPasswordSet}
            className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 md:py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60" 
          />
          <button 
            onClick={handleSaveZoteroConfig}
            className="w-full bg-slate-900 text-white font-medium py-2.5 md:py-2 rounded-lg hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
            <RefreshCw className="w-4 h-4" /> Connect & Sync
          </button>
        </div>
      </div>
      
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 text-sm">Sync Status</h2>
          <span className="text-[10px] md:text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Last synced {lastSync}</span>
        </div>
        <div className="p-4 md:p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 md:p-4 text-center">
              <p className="text-xl md:text-3xl font-display font-bold text-slate-900">{isSyncing ? '...' : syncStatus.total}</p>
              <p className="text-[9px] md:text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Found</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 md:p-4 text-center">
              <p className="text-xl md:text-3xl font-display font-bold text-emerald-600">{isSyncing ? '...' : syncStatus.synced}</p>
              <p className="text-[9px] md:text-xs text-emerald-600/80 font-medium uppercase tracking-wider mt-1">Imported</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 md:p-4 text-center">
              <p className="text-xl md:text-3xl font-display font-bold text-yellow-600">0</p>
              <p className="text-[9px] md:text-xs text-yellow-600/80 font-medium uppercase tracking-wider mt-1">Conflicts</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 md:mb-3">Recent Activity</h3>
            <div className="space-y-2 md:space-y-3">
              <div className="text-sm text-slate-500 text-center py-8">
                {isSyncing ? (
                   <span className="flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Syncing...</span>
                ) : Number(syncStatus.total) > 0 ? (
                   <span>Successfully synced {syncStatus.synced} un-vectorized references from Zotero.</span>
                ) : (
                   <span>No sync activity yet.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
