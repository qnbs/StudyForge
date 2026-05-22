import type { MultiReadResponse } from 'zotero-api-client';
import { db } from '../db';
import { formatZoteroSourceId } from '../zoteroUtils';
import { getZoteroClient, rateLimitedZoteroGet } from './zoteroClient';
import type { ZoteroApiItem, ZoteroCredentials } from './types';
import { ragService } from '../rag/ragService';
import { zoteroItemToSourceFields } from './mapItem';
import { importZoteroItemToSources } from './importToSources';

const MAX_PDF_BYTES = 50 * 1024 * 1024; // 50 MB

export interface AttachmentSyncProgress {
  current: number;
  total: number;
  itemKey: string;
  message: string;
}

type AttachmentProgressCallback = (progress: AttachmentSyncProgress) => void;

function isPdfAttachment(item: ZoteroApiItem): boolean {
  return (
    item.itemType === 'attachment' &&
    (item.data.contentType === 'application/pdf' ||
      item.data.filename?.toLowerCase().endsWith('.pdf') ||
      item.data.linkMode === 'imported_file')
  );
}

async function fetchChildAttachments(
  credentials: ZoteroCredentials,
  parentKey: string
): Promise<ZoteroApiItem[]> {
  const client = getZoteroClient(credentials);
  const response = await rateLimitedZoteroGet<MultiReadResponse<ZoteroApiItem>>(
    client,
    (c) => c.items(parentKey).children(),
    `Child attachments for ${parentKey}`,
    { format: 'json' }
  );

  const data = response.getData();
  return Array.isArray(data) ? data.filter(isPdfAttachment) : [];
}

async function downloadAttachmentPdf(
  credentials: ZoteroCredentials,
  attachmentKey: string
): Promise<ArrayBuffer> {
  const client = getZoteroClient(credentials);
  const response = await rateLimitedZoteroGet<{ getData: () => ArrayBuffer }>(
    client,
    (c) => c.items(attachmentKey).attachment(),
    `Download PDF ${attachmentKey}`
  );

  const data = response.getData();
  if (!(data instanceof ArrayBuffer)) {
    throw new Error('Unexpected attachment response format');
  }
  if (data.byteLength > MAX_PDF_BYTES) {
    throw new Error(`PDF exceeds ${MAX_PDF_BYTES / (1024 * 1024)} MB limit`);
  }
  return data;
}

/**
 * Download PDF attachments for Zotero items and ingest via RAG pipeline.
 */
export async function syncZoteroAttachments(
  credentials: ZoteroCredentials,
  itemKeys: string[],
  onProgress?: AttachmentProgressCallback
): Promise<{ downloaded: number; failed: number }> {
  let downloaded = 0;
  let failed = 0;
  const total = itemKeys.length;

  for (let i = 0; i < itemKeys.length; i++) {
    const itemKey = itemKeys[i];
    const zoteroItem = await db.zoteroItems.get(itemKey);
    if (!zoteroItem) continue;

    onProgress?.({
      current: i + 1,
      total,
      itemKey,
      message: `Fetching attachments for "${zoteroItem.title}"...`,
    });

    try {
      await importZoteroItemToSources(zoteroItem);
      const attachments = await fetchChildAttachments(credentials, itemKey);

      if (attachments.length === 0) {
        continue;
      }

      const attachment = attachments[0];
      const pdfBuffer = await downloadAttachmentPdf(credentials, attachment.key);
      const fileName = attachment.data.filename || `${zoteroItem.title}.pdf`;
      const file = new File([pdfBuffer], fileName, { type: 'application/pdf' });
      const fields = zoteroItemToSourceFields(zoteroItem);

      const existingSourceId = formatZoteroSourceId(itemKey);
      const existing = await db.sources.get(existingSourceId);

      if (existing?.isVectorized) {
        continue;
      }

      if (existing) {
        await db.sources.delete(existingSourceId);
        await ragService.deleteSourceArtifacts(existingSourceId);
      }

      await ragService.ingestSource(
        file,
        fields.title,
        fields.authors,
        fields.year,
        (msg) =>
          onProgress?.({
            current: i + 1,
            total,
            itemKey,
            message: msg,
          })
      );

      await db.sources.update(formatZoteroSourceId(itemKey), {
        zoteroKey: itemKey,
        type: 'zotero',
      });

      downloaded++;
    } catch (err) {
      console.error(`Attachment sync failed for ${itemKey}:`, err);
      failed++;
    }
  }

  return { downloaded, failed };
}
