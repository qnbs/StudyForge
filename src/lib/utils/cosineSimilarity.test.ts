import { describe, it, expect } from 'vitest';
import { cosineSimilarity } from './cosineSimilarity';

describe('Cosine Similarity', () => {
    it('should calculate identical vectors as 1', () => {
        const vecA = new Float32Array([1, 2, 3]);
        const vecB = new Float32Array([1, 2, 3]);
        expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1.0);
    });

    it('should calculate orthogonal vectors as 0', () => {
        const vecA = new Float32Array([1, 0]);
        const vecB = new Float32Array([0, 1]);
        expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(0);
    });

    it('should calculate opposite vectors as -1', () => {
        const vecA = new Float32Array([1, 1]);
        const vecB = new Float32Array([-1, -1]);
        expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(-1.0);
    });

    it('should throw if lengths differ', () => {
        const vecA = new Float32Array([1, 2]);
        const vecB = new Float32Array([1, 2, 3]);
        expect(() => cosineSimilarity(vecA, vecB)).toThrow();
    });
});
