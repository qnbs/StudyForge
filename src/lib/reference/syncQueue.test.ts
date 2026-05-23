import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../db';
import {
  enqueueSyncJob,
  updateJobStatus,
  recordJobHistory,
  getPendingJobs,
} from './syncQueue';

describe('syncQueue', () => {
  beforeEach(async () => {
    await db.syncQueue.clear();
    await db.syncJobHistory.clear();
  });

  it('enqueues and lists pending jobs', async () => {
    const id = await enqueueSyncJob('zotero', 'pull', { since: 0 });
    expect(id).toBeGreaterThan(0);

    const pending = await getPendingJobs();
    expect(pending).toHaveLength(1);
    expect(pending[0].provider).toBe('zotero');
    expect(pending[0].jobType).toBe('pull');
  });

  it('updates job status and records history', async () => {
    const id = await enqueueSyncJob('mendeley', 'pull');
    await updateJobStatus(id, 'completed');
    await recordJobHistory(id, 'mendeley', 'pull', true, 'ok');

    const job = await db.syncQueue.get(id);
    expect(job?.status).toBe('completed');

    const history = await db.syncJobHistory.toArray();
    expect(history).toHaveLength(1);
    expect(history[0].success).toBe(true);
  });
});
