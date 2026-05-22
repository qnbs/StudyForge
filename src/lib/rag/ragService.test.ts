import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RAGService } from './ragService';

// Mock Web Worker
class MockWorker {
    onMessageCallback: ((e: unknown) => void) | null = null;
    addEventListener = vi.fn((event: string, callback: unknown) => {
        if (event === 'message' && typeof callback === 'function') {
            this.onMessageCallback = callback as (e: unknown) => void;
        }
    });
    removeEventListener = vi.fn();
    postMessage = vi.fn();
    terminate = vi.fn();

    // Helper to simulate worker response
    simulateMessage(data: unknown) {
        if (this.onMessageCallback) {
            this.onMessageCallback({ data });
        }
    }
}

describe('RAG Service', () => {
    let rag: RAGService;
    
    beforeEach(() => {
        vi.stubGlobal('Worker', MockWorker);
        rag = new RAGService();
    });

    it('should initialize successfully', () => {
        expect(rag).toBeDefined();
    });
});
