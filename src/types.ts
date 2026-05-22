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
}

export interface Source {
  id: string;
  title: string;
  authors: string[];
  year: number;
  type: 'pdf' | 'web' | 'book';
  addedAt: string;
}
