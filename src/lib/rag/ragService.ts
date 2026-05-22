import { db } from '../db';
import { saveVectorToOPFS, deleteVectorFromOPFS } from '../opfs';
import { DocumentChunk } from '../../types';
import { IngestQueue } from './ingestQueue';
import { queryRAGHybrid } from './hybridSearch';

export class RAGService {
  private pdfWorker: Worker | null = null;
  private embeddingWorker: Worker | null = null;
  private readonly ingestQueue = new IngestQueue();
  private embeddingChain: Promise<void> = Promise.resolve();

  constructor() {
    this.initWorkers();
  }

  private initWorkers() {
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      this.pdfWorker = new Worker(new URL('../../workers/pdfWorker.ts', import.meta.url), { type: 'module' });
      this.embeddingWorker = new Worker(new URL('../../workers/embeddingWorker.ts', import.meta.url), { type: 'module' });
      this.pdfWorker.onerror = (e) => console.error('PDF worker error:', e);
      this.embeddingWorker.onerror = (e) => console.error('Embedding worker error:', e);
    }
  }

  /** Remove chunks + OPFS vectors for a source/document id (ingest rollback). */
  public async deleteSourceArtifacts(sourceOrDocId: string): Promise<void> {
    const chunks = (await db.documentChunks.toArray()).filter(
      (c) => c.sourceId === sourceOrDocId || c.documentId === sourceOrDocId
    );

    for (const chunk of chunks) {
      if (chunk.embeddingId) {
        await deleteVectorFromOPFS(chunk.embeddingId);
      }
      await db.documentChunks.delete(chunk.id);
    }
  }

  public async ingestSource(
    file: File,
    title: string,
    authors: string[],
    year: number,
    onProgress?: (msg: string) => void
  ): Promise<string> {
    return this.ingestQueue.enqueue(() =>
      this.ingestSourceInternal(file, title, authors, year, onProgress)
    );
  }

  private async ingestSourceInternal(
    file: File,
    title: string,
    authors: string[],
    year: number,
    onProgress?: (msg: string) => void
  ): Promise<string> {
    const sourceId = `src_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    if (!this.pdfWorker || !this.embeddingWorker) {
      throw new Error('Workers not initialized');
    }

    try {
      const chunks = await this.parsePdf(file, sourceId, onProgress);
      await this.processChunks(sourceId, chunks, onProgress);

      await db.sources.put({
        id: sourceId,
        title,
        authors,
        year,
        type: 'pdf',
        addedAt: new Date().toISOString(),
        isVectorized: true,
      });

      return sourceId;
    } catch (err) {
      await this.deleteSourceArtifacts(sourceId);
      throw err;
    }
  }

  private parsePdf(
    file: File,
    documentId: string,
    onProgress?: (msg: string) => void
  ): Promise<Array<{ id: string; chunkIndex: number; text: string }>> {
    return new Promise((resolve, reject) => {
      const handler = (e: MessageEvent) => {
        const { type, payload, data } = e.data;
        if (type === 'progress' && data?.documentId === documentId) {
          onProgress?.(`Parsing PDF: page ${data.page}/${data.total}`);
        } else if (type === 'complete' && payload?.documentId === documentId) {
          this.pdfWorker!.removeEventListener('message', handler);
          resolve(payload.chunks);
        } else if (type === 'error' && (!payload?.documentId || payload.documentId === documentId)) {
          this.pdfWorker!.removeEventListener('message', handler);
          reject(new Error(payload?.error ?? 'PDF parse failed'));
        }
      };

      this.pdfWorker!.addEventListener('message', handler);
      this.pdfWorker!.postMessage({ type: 'parse', payload: { file, documentId } });
    });
  }

  private async processChunks(
    documentId: string,
    chunks: Array<{ id: string; chunkIndex: number; text: string }>,
    onProgress?: (msg: string) => void
  ): Promise<void> {
    if (!this.embeddingWorker) throw new Error('Embedding worker not initialized');

    let completedChunks = 0;
    const progressHandler = (e: MessageEvent) => {
      const { type, data } = e.data;
      if (type === 'progress' && onProgress && data?.status) {
        onProgress(
          `Loading Model: ${data.status} ${data.progress ? `(${Math.round(data.progress)}%)` : ''}`
        );
      }
    };

    this.embeddingWorker.addEventListener('message', progressHandler);

    try {
      for (const chunk of chunks) {
        await this.embedOneChunk(documentId, chunk, () => {
          completedChunks++;
          onProgress?.(`Vectorized ${completedChunks}/${chunks.length} chunks...`);
        });
      }
    } finally {
      this.embeddingWorker.removeEventListener('message', progressHandler);
    }
  }

  /** Serialize embedding jobs — one in flight at a time on shared worker. */
  private embedOneChunk(
    documentId: string,
    chunk: { id: string; chunkIndex: number; text: string },
    onDone: () => void
  ): Promise<DocumentChunk> {
    const run = () =>
      new Promise<DocumentChunk>((resolve, reject) => {
        const id = chunk.id;
        const timeout = window.setTimeout(() => {
          this.embeddingWorker!.removeEventListener('message', messageHandler);
          reject(new Error(`Embedding timeout for chunk ${id}`));
        }, 120000);

        const messageHandler = async (e: MessageEvent) => {
          const { type, payload } = e.data;

          if (type === 'complete' && payload?.chunkId === id) {
            window.clearTimeout(timeout);
            this.embeddingWorker!.removeEventListener('message', messageHandler);
            try {
              const vector = payload.vector as Float32Array;
              const embeddingId = `vec_${id}`;
              await saveVectorToOPFS(embeddingId, vector);

              const dbChunk: DocumentChunk = {
                id,
                documentId,
                sourceId: documentId,
                chunkIndex: chunk.chunkIndex,
                text: chunk.text,
                embeddingId,
                vectorLength: vector.length,
              };

              await db.documentChunks.put(dbChunk);
              onDone();
              resolve(dbChunk);
            } catch (err) {
              reject(err);
            }
          } else if (type === 'error' && payload?.chunkId === id) {
            window.clearTimeout(timeout);
            this.embeddingWorker!.removeEventListener('message', messageHandler);
            reject(new Error(payload.error));
          }
        };

        this.embeddingWorker!.addEventListener('message', messageHandler);
        this.embeddingWorker!.postMessage({
          type: 'embed',
          payload: { text: chunk.text, chunkId: id },
        });
      });

    const chained = this.embeddingChain.then(run);
    this.embeddingChain = chained.then(
      () => undefined,
      () => undefined
    );
    return chained;
  }

  public async queryRAG(
    query: string,
    topK: number = 5,
    sourceIdFilter?: string
  ): Promise<Array<{ chunk: DocumentChunk; score: number }>> {
    if (!this.embeddingWorker) throw new Error('Worker not initialized');

    const queryVector = await new Promise<Float32Array>((resolve, reject) => {
      const qId = `query_${Date.now()}`;
      const timeout = window.setTimeout(() => {
        this.embeddingWorker!.removeEventListener('message', handler);
        reject(new Error('Query embedding timeout'));
      }, 60000);

      const handler = (e: MessageEvent) => {
        const { type, payload } = e.data;
        if (type === 'complete' && payload?.chunkId === qId) {
          window.clearTimeout(timeout);
          this.embeddingWorker!.removeEventListener('message', handler);
          resolve(payload.vector);
        } else if (type === 'error' && payload?.chunkId === qId) {
          window.clearTimeout(timeout);
          this.embeddingWorker!.removeEventListener('message', handler);
          reject(new Error(payload.error));
        }
      };
      this.embeddingWorker!.addEventListener('message', handler);
      this.embeddingWorker!.postMessage({ type: 'embed', payload: { text: query, chunkId: qId } });
    });

    return queryRAGHybrid(queryVector, query, topK, sourceIdFilter);
  }

  public async deleteDocument(documentId: string) {
    await this.deleteSourceArtifacts(documentId);
    await db.documents.delete(documentId);
    const source = await db.sources.get(documentId);
    if (source) {
      await db.sources.delete(documentId);
    }
  }

  public async listDocuments() {
    return await db.documents.toArray();
  }
}

export const ragService = new RAGService();
