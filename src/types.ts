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
  sourceId: string;
  chunkIndex: number;
  text: string;
}

export interface Source {
  id: string;
  title: string;
  authors: string[];
  year: number;
  type: 'pdf' | 'web' | 'book';
  addedAt: string;
  isVectorized?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  prompt: string;
  model: string;
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
    apiKey: string;
  };
  mendeleyConfig?: {
    accessToken: string;
  };
}
