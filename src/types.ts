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
  zoteroConfig?: {
    userId: string;
    apiKey?: string; // Opt out of DB plaintext, stored in Vault
  };
  mendeleyConfig?: {
    accessToken?: string;
  };
}
