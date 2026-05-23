export type WorkflowPhase = 
  | 'planning' 
  | 'research' 
  | 'elaboration' 
  | 'writing'
  | 'library'
  | 'agents'
  | 'settings'
  | 'help';

export interface Document {
  id: string;
  title: string;
  wordCount: number;
  lastEdited: string;
  content?: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  sourceId?: string;
  chunkIndex?: number;
  text: string;
  embeddingId: string;   // reference to OPFS
  vectorLength: number;
  pageNumbers?: number[];
  section?: string;
}

export interface Source {
  id: string;
  title: string;
  authors: string[];
  year: number;
  type: 'pdf' | 'web' | 'book' | 'zotero';
  addedAt: string;
  isVectorized?: boolean;
  url?: string;
  zoteroKey?: string;
  doi?: string;
  abstract?: string;
  citationKey?: string;
  publicationTitle?: string;
  tags?: string[];
  /** Local edit tracking for bidirectional Zotero push */
  localVersion?: number;
  pendingPush?: boolean;
}

export interface FeatureFlags {
  zoteroPush?: boolean;
  mendeley?: boolean;
  aiSummarize?: boolean;
  aiRelevance?: boolean;
}

export type SyncJobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface SyncQueueJob {
  id?: number;
  provider: 'zotero' | 'mendeley';
  jobType: 'pull' | 'push' | 'attachments';
  status: SyncJobStatus;
  payload?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncJobHistoryEntry {
  id?: number;
  jobId: number;
  provider: string;
  jobType: string;
  success: boolean;
  message: string;
  completedAt: string;
}

export interface MendeleyDocument {
  key: string;
  title: string;
  authors: string[];
  year?: number;
  doi?: string;
  abstract?: string;
  dateModified: string;
  importedToLocal?: boolean;
}

export interface MendeleySyncMeta {
  id?: number;
  lastSyncTimestamp: string;
  lastSyncSuccessful: boolean;
}

export interface SourceAnnotation {
  id: string;
  sourceId: string;
  pageNumber: number;
  text: string;
  color?: string;
  createdAt: string;
}

export interface ZoteroCreator {
  name?: string;
  firstName?: string;
  lastName?: string;
  creatorType: string;
}

export interface ZoteroItem {
  key: string;
  version: number;
  title: string;
  creators: ZoteroCreator[];
  abstractNote?: string;
  date?: string;
  year?: number;
  doi?: string;
  url?: string;
  publicationTitle?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  isbn?: string;
  tags?: Array<{ tag: string }>;
  dateModified: string;
  collectionKeys?: string[];
  attachmentKeys?: string[];
  itemType?: string;
  importedToLocal?: boolean;
}

export interface ZoteroCollection {
  key: string;
  name: string;
  parentKey?: string;
  version: number;
  dateModified: string;
}

export interface ZoteroSyncMeta {
  id?: number;
  lastSyncTimestamp: string;
  libraryVersion: number;
  totalItemsSynced: number;
  lastSyncSuccessful: boolean;
}

/** `low` | `medium` | `high` or full GGUF HTTPS URL */
export type AgentModelRef = string;

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  prompt: string;
  model: AgentModelRef;
  isCustom: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Settings {
  id: string; // single row ID for singleton
  language: 'en' | 'de';
  theme: 'system' | 'light' | 'dark';
  modelLimitConfig: string;
  strictOfflineMode?: boolean;
  analyticsEnabled?: boolean;
  featureFlags?: FeatureFlags;
  zoteroConfig?: {
    userId: string;
    apiKey?: string; // Opt out of DB plaintext, stored in Vault
  };
  mendeleyConfig?: {
    clientId?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: string;
  };
}
