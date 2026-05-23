import type { ReferenceWorkerIn, ReferenceWorkerOut } from '../lib/reference/workerMessages';
import type { ZoteroApiCollection, ZoteroApiItem } from '../lib/zotero/types';

const ZOTERO_API = 'https://api.zotero.org';

async function fetchZoteroPage(
  userId: string,
  apiKey: string,
  since: number,
  start: number,
  limit: number
): Promise<{
  items: ZoteroApiItem[];
  collections: ZoteroApiCollection[];
  libraryVersion: number;
  notModified: boolean;
}> {
  const headers: Record<string, string> = {
    'Zotero-API-Key': apiKey,
    'Zotero-API-Version': '3',
  };
  if (since > 0) {
    headers['If-Modified-Since-Version'] = String(since);
  }

  const colUrl = `${ZOTERO_API}/users/${userId}/collections?v=3&format=json&since=${since}`;
  const colRes = await fetch(colUrl, { headers });
  const libraryVersion = parseInt(colRes.headers.get('Last-Modified-Version') ?? '0', 10) || since;

  if (colRes.status === 304) {
    return { items: [], collections: [], libraryVersion, notModified: true };
  }

  const collections = colRes.ok ? ((await colRes.json()) as ZoteroApiCollection[]) : [];

  const itemsUrl = `${ZOTERO_API}/users/${userId}/items?v=3&format=json&since=${since}&includeTrashed=1&limit=${limit}&start=${start}`;
  const itemsRes = await fetch(itemsUrl, { headers });
  const itemsVersion = parseInt(itemsRes.headers.get('Last-Modified-Version') ?? '0', 10) || libraryVersion;

  if (itemsRes.status === 304) {
    return { items: [], collections, libraryVersion: itemsVersion, notModified: true };
  }

  const items = itemsRes.ok ? ((await itemsRes.json()) as ZoteroApiItem[]) : [];

  return {
    items,
    collections: start === 0 ? collections : [],
    libraryVersion: Math.max(libraryVersion, itemsVersion),
    notModified: false,
  };
}

self.onmessage = async (event: MessageEvent<ReferenceWorkerIn>) => {
  const data = event.data;

  if (data.type === 'cancel') {
    return;
  }

  if (data.type === 'zotero_pull_page') {
    const { jobId, userId, apiKey, since, start, limit } = data;
    try {
      const page = await fetchZoteroPage(userId, apiKey, since, start, limit);
      const out: ReferenceWorkerOut = {
        type: 'zotero_page',
        jobId,
        items: page.items,
        collections: page.collections,
        libraryVersion: page.libraryVersion,
        notModified: page.notModified,
      };
      self.postMessage(out);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Worker fetch failed';
      self.postMessage({ type: 'error', jobId, message } satisfies ReferenceWorkerOut);
    }
  }
};

export {};
