import type { AnyResponse } from 'zotero-api-client';

export interface ZoteroCredentials {
  apiKey: string;
  userId: string;
}

export interface ZoteroApiItemData {
  key?: string;
  itemType?: string;
  title?: string;
  contentType?: string;
  filename?: string;
  linkMode?: string;
  creators?: Array<{
    firstName?: string;
    lastName?: string;
    name?: string;
    creatorType?: string;
  }>;
  abstractNote?: string;
  date?: string;
  DOI?: string;
  url?: string;
  publicationTitle?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  ISBN?: string;
  tags?: Array<{ tag: string }>;
  dateModified?: string;
  collections?: string[];
}

export interface ZoteroApiItem {
  key: string;
  version: number;
  itemType: string;
  data: ZoteroApiItemData;
}

export interface ZoteroApiCollection {
  key: string;
  version: number;
  data: {
    name: string;
    parentCollection?: string | false;
    dateModified?: string;
  };
}

export interface ZoteroDeletedPayload {
  items?: string[];
  collections?: string[];
}

export function isNotModified(response: AnyResponse): boolean {
  const status = (response as { response?: { status?: number } }).response?.status;
  return status === 304;
}

export function getResponseVersion(response: AnyResponse): number {
  const v = response.getVersion();
  return v ?? 0;
}
