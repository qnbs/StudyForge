# ADR 0003: Reference sync worker

## Status

Accepted (v1.2)

## Context

Zotero pull previously ran on the main thread with `incrementalZoteroSync`, blocking UI on large libraries. Bidirectional sync and Mendeley require a shared queue and job history.

## Decision

- Add `referenceSyncWorker.ts` for paginated Zotero API fetch; Dexie writes stay on the main thread.
- `ReferenceSyncOrchestrator` enqueues jobs in `syncQueue`, records `syncJobHistory`, falls back to inline sync if `Worker` is unavailable.
- `ReferenceSyncContext` exposes pull/push/cancel/conflicts to UI (`SyncManagementPanel`).

## Consequences

- Extra complexity in message protocol (`workerMessages.ts`).
- Push remains main-thread (`pushUtils.ts`) due to conflict resolution UX.
- Tests: `syncQueue.test.ts`, Dexie v7 tables in `db.test.ts`.
