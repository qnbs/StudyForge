import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveVectorToOPFS, loadVectorFromOPFS, deleteVectorFromOPFS } from './opfs';

describe('OPFS Vector Storage', () => {
    let mockFiles: Record<string, Uint8Array>;

    beforeEach(() => {
        mockFiles = {};
        
        // Mock the navigator.storage functionality
        const mockStorageDirectory = {
            getFileHandle: vi.fn().mockImplementation(async (name: string, options?: { create: boolean }) => {
                if (!options?.create && !mockFiles[name]) {
                    throw new Error('File not found');
                }
                return {
                    createWritable: vi.fn().mockResolvedValue({
                        write: vi.fn().mockImplementation(async (data: Float32Array) => {
                            const clone = new Uint8Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
                            mockFiles[name] = clone;
                        }),
                        close: vi.fn().mockResolvedValue(true)
                    }),
                    getFile: vi.fn().mockResolvedValue({
                        arrayBuffer: vi.fn().mockResolvedValue(mockFiles[name]?.buffer || new ArrayBuffer(0))
                    })
                };
            }),
            removeEntry: vi.fn().mockImplementation(async (name: string) => {
                if (mockFiles[name]) delete mockFiles[name];
            })
        };

        // Needs wrapper for global
        const globalObj = global as unknown as Record<string, unknown>;
        if (!globalObj.navigator) {
             globalObj.navigator = {};
        }

        Object.defineProperty(globalObj.navigator, 'storage', {
            value: {
                getDirectory: vi.fn().mockResolvedValue(mockStorageDirectory)
            },
            configurable: true
        });
    });

    it('should save and load a vector from OPFS', async () => {
        const id = 'test_vector';
        const vector = new Float32Array([0.1, 0.2, 0.3]);
        
        await saveVectorToOPFS(id, vector);
        
        const loaded = await loadVectorFromOPFS(id);
        expect(loaded).not.toBeNull();
        expect(loaded?.[0]).toBeCloseTo(0.1);
        expect(loaded?.[1]).toBeCloseTo(0.2);
        expect(loaded?.[2]).toBeCloseTo(0.3);
    });

    it('should return null for non-existent vectors', async () => {
        const loaded = await loadVectorFromOPFS('non_existent');
        expect(loaded).toBeNull();
    });

    it('should delete a vector successfully', async () => {
        const id = 'test_delete';
        const vector = new Float32Array([0.5, 0.5]);
        
        await saveVectorToOPFS(id, vector);
        await deleteVectorFromOPFS(id);
        
        const loaded = await loadVectorFromOPFS(id);
        expect(loaded).toBeNull();
    });
});
