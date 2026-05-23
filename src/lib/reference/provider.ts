import type { SyncProgress } from '../zotero/syncUtils';

export interface PullOptions {
  credentials: unknown;
  autoDownloadPdfs?: boolean;
  onProgress?: (progress: SyncProgress) => void;
}

export interface PullResult {
  success: boolean;
  syncedItems: number;
  newVersion?: number;
}

export interface PushOperation {
  sourceId: string;
  zoteroKey: string;
  patch: Record<string, unknown>;
  baseVersion: number;
}

export interface PushResult {
  success: boolean;
  pushed: number;
  conflicts: Array<{ sourceId: string; zoteroKey: string; remoteVersion: number }>;
}

export interface ReferenceProvider {
  id: 'zotero' | 'mendeley' | 'native';
  pullIncremental(options: PullOptions): Promise<PullResult>;
  pushChanges?(operations: PushOperation[]): Promise<PushResult>;
  isConfigured(): Promise<boolean>;
}
