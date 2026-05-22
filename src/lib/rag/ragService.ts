import { db } from '../db';
import { saveVectorToOPFS, loadVectorFromOPFS, deleteVectorFromOPFS } from '../opfs';
import { cosineSimilarity } from '../utils/cosineSimilarity';
import { DocumentChunk } from '../../types';

export class RAGService {
  private pdfWorker: Worker | null = null;
  private embeddingWorker: Worker | null = null;

  constructor() {
    this.initWorkers();
  }

  private initWorkers() {
    if (typeof window !== 'undefined') {
      this.pdfWorker = new Worker(new URL('../../workers/pdfWorker.ts', import.meta.url), { type: 'module' });
      this.embeddingWorker = new Worker(new URL('../../workers/embeddingWorker.ts', import.meta.url), { type: 'module' });
    }
  }

  public async ingestSource(file: File, title: string, authors: string[], year: number, onProgress?: (msg: string) => void): Promise<string> {
    const sourceId = `src_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Fallback if worker creation failed
    if (!this.pdfWorker || !this.embeddingWorker) {
      throw new Error("Workers not initialized");
    }

    return new Promise((resolve, reject) => {
      const handler = async (e: MessageEvent) => {
        const { type, payload, data } = e.data;
        if (type === 'progress') {
          const msg = `Parsing PDF: page ${data.page}/${data.total}`;
          if (onProgress) onProgress(msg);
          console.log(msg);
        } else if (type === 'complete' && payload.documentId === sourceId) {
          try {
            this.pdfWorker!.removeEventListener('message', handler);
            await this.processChunks(sourceId, payload.chunks, onProgress);
            
            // Save source metadata
            await db.sources.put({
              id: sourceId,
              title,
              authors,
              year,
              type: 'pdf',
              addedAt: new Date().toISOString(),
              isVectorized: true
            });
            
            resolve(sourceId);
          } catch (err) {
            reject(err);
          }
        } else if (type === 'error') {
          this.pdfWorker!.removeEventListener('message', handler);
          reject(new Error(payload.error));
        }
      };

      this.pdfWorker!.addEventListener('message', handler);
      this.pdfWorker!.postMessage({ type: 'parse', payload: { file, documentId: sourceId } });
    });
  }

  private async processChunks(documentId: string, chunks: Array<{id: string, chunkIndex: number, text: string}>, onProgress?: (msg: string) => void) {
    if (!this.embeddingWorker) throw new Error("Embedding worker not initialized");

    let completedChunks = 0;
    const progressHandler = (e: MessageEvent) => {
      const { type, data } = e.data;
      if (type === 'progress' && onProgress) {
        // data.status, data.name, data.progress are provided by Transformers.js
        if (data.status) {
             onProgress(`Loading Model: ${data.status} ${data.progress ? `(${Math.round(data.progress)}%)` : ''}`);
        }
      }
    };
    
    this.embeddingWorker.addEventListener('message', progressHandler);

    const chunkPromises = chunks.map((chunk) => {
      return new Promise<DocumentChunk>((resolve) => {
        const id = chunk.id;
        
        const messageHandler = async (e: MessageEvent) => {
          const { type, payload } = e.data;
          
          if (type === 'complete' && payload.chunkId === id) {
            this.embeddingWorker!.removeEventListener('message', messageHandler);
            const vector = payload.vector;
            const embeddingId = `vec_${id}`;
            await saveVectorToOPFS(embeddingId, vector);
            
            const dbChunk: DocumentChunk = {
              id,
              documentId,
              sourceId: documentId, // for sources, it's the sourceId
              chunkIndex: chunk.chunkIndex,
              text: chunk.text,
              embeddingId,
              vectorLength: vector.length,
            };
            
            await db.documentChunks.put(dbChunk);
            completedChunks++;
            if (onProgress) onProgress(`Vectorized ${completedChunks}/${chunks.length} chunks...`);
            resolve(dbChunk);
          }
        };

        this.embeddingWorker!.addEventListener('message', messageHandler);
        this.embeddingWorker!.postMessage({ type: 'embed', payload: { text: chunk.text, chunkId: id } });
      });
    });

    await Promise.all(chunkPromises);
    this.embeddingWorker.removeEventListener('message', progressHandler);
  }

  public async queryRAG(query: string, topK: number = 5): Promise<Array<{ chunk: DocumentChunk, score: number }>> {
    if (!this.embeddingWorker) throw new Error("Worker not initialized");

    const queryVector = await new Promise<Float32Array>((resolve) => {
      const qId = `query_${Date.now()}`;
      const handler = (e: MessageEvent) => {
         const { type, payload } = e.data;
         if (type === 'complete' && payload.chunkId === qId) {
             this.embeddingWorker!.removeEventListener('message', handler);
             resolve(payload.vector);
         }
      };
      this.embeddingWorker!.addEventListener('message', handler);
      this.embeddingWorker!.postMessage({ type: 'embed', payload: { text: query, chunkId: qId } });
    });

    const allChunks = await db.documentChunks.toArray();
    const scoredChunks = [];

    // Parallelize loading to speed up linear scan
    const chunksWithVectors = await Promise.all(
        allChunks.filter(c => c.embeddingId).map(async (chunk) => {
            const vec = await loadVectorFromOPFS(chunk.embeddingId!);
            return { chunk, vec };
        })
    );

    for (const item of chunksWithVectors) {
      if (item.vec) {
         const score = cosineSimilarity(queryVector, item.vec);
         scoredChunks.push({ chunk: item.chunk, score });
      }
    }

    scoredChunks.sort((a, b) => b.score - a.score);
    return scoredChunks.slice(0, topK);
  }

  public async deleteDocument(documentId: string) {
    const chunks = await db.documentChunks.where({ documentId }).toArray();
    for (const chunk of chunks) {
      if (chunk.embeddingId) {
        await deleteVectorFromOPFS(chunk.embeddingId);
      }
      await db.documentChunks.delete(chunk.id);
    }
    await db.documents.delete(documentId);
  }

  public async listDocuments() {
    return await db.documents.toArray();
  }
}

export const ragService = new RAGService();
