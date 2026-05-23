import type { ReferenceProvider, PullOptions, PullResult } from '../provider';
import { referenceSyncOrchestrator } from '../orchestrator';
import { resolveZoteroCredentials } from '../../zotero/zoteroClient';
import { db } from '../../db';
import { pullMendeleyLibrary } from '../../mendeley/mendeleySync';
import { listNativeSources } from '../../research-library';

export const zoteroProvider: ReferenceProvider = {
  id: 'zotero',
  async isConfigured() {
    const s = await db.settings.get('global');
    return !!s?.zoteroConfig?.userId;
  },
  async pullIncremental(options: PullOptions): Promise<PullResult> {
    const creds = options.credentials as Awaited<ReturnType<typeof resolveZoteroCredentials>>;
    const r = await referenceSyncOrchestrator.enqueuePull('zotero', creds, {
      autoDownloadPdfs: options.autoDownloadPdfs,
    });
    return { success: r.success, syncedItems: r.syncedItems };
  },
};

export const mendeleyProvider: ReferenceProvider = {
  id: 'mendeley',
  async isConfigured() {
    const s = await db.settings.get('global');
    return !!s?.mendeleyConfig?.accessToken;
  },
  async pullIncremental(options: PullOptions): Promise<PullResult> {
    const creds = options.credentials as { accessToken: string };
    const r = await pullMendeleyLibrary(creds, options.onProgress);
    return { success: true, syncedItems: r.synced };
  },
};

export const nativeProvider: ReferenceProvider = {
  id: 'native',
  async isConfigured() {
    return true;
  },
  async pullIncremental(): Promise<PullResult> {
    const sources = await listNativeSources();
    return { success: true, syncedItems: sources.length };
  },
};

export const referenceProviders: ReferenceProvider[] = [
  zoteroProvider,
  mendeleyProvider,
  nativeProvider,
];
