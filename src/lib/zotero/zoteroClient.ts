import api, { type ApiChain } from 'zotero-api-client';
import { db } from '../db';
import type { ZoteroCredentials } from './types';
import { rateLimitedZoteroRequest } from './rateLimiter';

let cachedClient: ApiChain | null = null;
let cachedCredentials: ZoteroCredentials | null = null;

export function resetZoteroClient(): void {
  cachedClient = null;
  cachedCredentials = null;
}

export async function resolveZoteroCredentials(
  getApiKey: (provider: string) => Promise<string | null>
): Promise<ZoteroCredentials> {
  const settings = await db.settings.get('global');
  const userId = settings?.zoteroConfig?.userId?.trim();
  const apiKey = await getApiKey('zotero');

  if (!userId || !apiKey) {
    throw new Error('Zotero is not connected. Please connect in the Library tab.');
  }

  return { apiKey, userId };
}

export function getZoteroClient(credentials: ZoteroCredentials): ApiChain {
  if (
    cachedClient &&
    cachedCredentials?.apiKey === credentials.apiKey &&
    cachedCredentials?.userId === credentials.userId
  ) {
    return cachedClient;
  }

  const userIdNum = parseInt(credentials.userId, 10);
  if (!Number.isFinite(userIdNum)) {
    throw new Error('Invalid Zotero User ID.');
  }

  cachedClient = api(credentials.apiKey).library('user', userIdNum);
  cachedCredentials = credentials;
  return cachedClient;
}

export async function rateLimitedZoteroGet<T>(
  client: ApiChain,
  build: (c: ApiChain) => ApiChain,
  context: string,
  opts?: Parameters<ApiChain['get']>[0]
): Promise<T> {
  return rateLimitedZoteroRequest(async () => {
    const chain = build(client);
    return (await chain.get(opts)) as T;
  }, context);
}
