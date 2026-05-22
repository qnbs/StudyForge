import type { Document } from "../../types";

export interface RAGChunk {
  id: string;
  documentId: string;
  text: string;
  vectorId: string; // The ID pointing to the OPFS vector file
  vectorLength: number;
  pageNumbers?: number[];
  section?: string;
}

export interface RetrievalResult {
  chunk: RAGChunk;
  score: number;
  document: Document;
}
