import { describe, it, expect } from 'vitest';
import { deriveKey, encryptApiKey, decryptApiKey } from './crypto';

// Vitest environment runs in jsdom/node, which comes with standard Web Crypto API in Node 19/20+.
// We can use it directly.

describe('Vault Cryptography', () => {
    it('should encrypt and decrypt a string securely', async () => {
        const masterPassword = "vault-mock-pass";
        const secretPayload = "mock-secret-payload-data";

        const encrypted = await encryptApiKey(secretPayload, masterPassword, 'anthropic');
        expect(encrypted.provider).toBe('anthropic');
        expect(encrypted.encryptedKey).not.toBe(secretPayload);
        expect(encrypted.iv).toBeTruthy();
        expect(encrypted.salt).toBeTruthy();

        // Ensure decrypt matches
        const decrypted = await decryptApiKey(encrypted, masterPassword);
        expect(decrypted).toBe(secretPayload);
    });

    it('should fail to decrypt with the wrong master password', async () => {
        const masterPassword = "vault-mock-pass";
        const secretPayload = "mock-secret-payload-data";

        const encrypted = await encryptApiKey(secretPayload, masterPassword, 'anthropic');

        await expect(decryptApiKey(encrypted, "incorrect-pass-mock"))
            .rejects.toThrow();
    });
});
