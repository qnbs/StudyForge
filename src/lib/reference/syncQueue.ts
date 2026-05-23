import { db } from '../db';
import type { SyncJobStatus, SyncQueueJob } from '../../types';

export async function enqueueSyncJob(
  provider: SyncQueueJob['provider'],
  jobType: SyncQueueJob['jobType'],
  payload?: unknown
): Promise<number> {
  const now = new Date().toISOString();
  return db.syncQueue.add({
    provider,
    jobType,
    status: 'pending',
    payload: payload ? JSON.stringify(payload) : undefined,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateJobStatus(
  id: number,
  status: SyncJobStatus,
  error?: string
): Promise<void> {
  await db.syncQueue.update(id, {
    status,
    error,
    updatedAt: new Date().toISOString(),
  });
}

export async function recordJobHistory(
  jobId: number,
  provider: string,
  jobType: string,
  success: boolean,
  message: string
): Promise<void> {
  await db.syncJobHistory.add({
    jobId,
    provider,
    jobType,
    success,
    message,
    completedAt: new Date().toISOString(),
  });
}

export async function getPendingJobs(): Promise<SyncQueueJob[]> {
  return db.syncQueue.where('status').equals('pending').toArray();
}
