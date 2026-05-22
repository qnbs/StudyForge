const ITERATIONS = 100000;
const KEY_LENGTH = 256;

export interface EncryptedApiKey {
  provider: string;           // 'gemini' | 'openai' | 'anthropic' | 'groq' etc.
  encryptedKey: string;       // base64
  iv: string;                 // base64
  salt: string;               // base64
  createdAt: number;
  lastUsed?: number;
  expiresAt?: number;         // optional
}

export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptApiKey(apiKey: string, masterPassword: string, providerId: string): Promise<EncryptedApiKey> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(masterPassword, salt);

  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(apiKey)
  );

  return {
    provider: providerId,
    encryptedKey: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
    salt: btoa(String.fromCharCode(...salt)),
    createdAt: Date.now(),
  };
}

export async function decryptApiKey(enc: EncryptedApiKey, masterPassword: string): Promise<string> {
  const salt = Uint8Array.from(atob(enc.salt), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(enc.iv), c => c.charCodeAt(0));
  const key = await deriveKey(masterPassword, salt);

  const encryptedData = Uint8Array.from(atob(enc.encryptedKey), c => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedData);
  return new TextDecoder().decode(decrypted);
}
