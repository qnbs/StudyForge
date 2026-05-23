import type { ZoteroApiCollection, ZoteroApiItem } from '../zotero/types';

export type ReferenceSyncJobType = 'zotero_pull' | 'zotero_push' | 'mendeley_pull';

export type ReferenceWorkerIn =
  | {
      type: 'zotero_pull_page';
      jobId: string;
      userId: string;
      apiKey: string;
      since: number;
      start: number;
      limit: number;
    }
  | { type: 'cancel'; jobId: string };

export type ReferenceWorkerOut =
  | {
      type: 'progress';
      jobId: string;
      stage: string;
      processed: number;
      total?: number;
      message: string;
    }
  | {
      type: 'zotero_page';
      jobId: string;
      items: ZoteroApiItem[];
      collections: ZoteroApiCollection[];
      libraryVersion: number;
      notModified: boolean;
    }
  | { type: 'complete'; jobId: string; libraryVersion?: number }
  | { type: 'error'; jobId: string; message: string };
