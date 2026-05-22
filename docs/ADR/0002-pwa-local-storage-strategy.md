# Architecture Definition Record 0002: PWA Local Storage Strategy

**Date:** 2026-05-22
**Status:** Accepted

## Context
With our primary architectural pillar being offline-first privacy via local ML execution (ADR 0001), managing storage and caching effectively inside the browser becomes complex. We need robust local persistence for different data classes: Application metadata, AI context histories, Zotero reference syncs, and large vector DB arrays mapping to PDF structures.

## Decision
We enforce a split local storage mechanism leveraging specific browser APIs for different data structures.

1. **IndexedDB:**
   Used for structured relational metadata querying.
   * Workspace configurations & User settings.
   * Conversation history (Agent workshops and chat iterations).
   * Mendeley/Zotero citations syncing (efficient enough to parse thousands of JSON items).

2. **OPFS (Origin Private File System):**
   Used for high-bandwidth raw binary data required to operate Vector Embeddings / RAG databases without crushing local VRAM or the main UI thread.
   * PDF File blobs.
   * `Float32Arrays` resulting from the Vector embeddings representation.

3. **Cache API (Service Workers):**
   * Pre-downloaded neural network weights (e.g. `Phi-4`, `WebLLM artifacts`).
   * Basic web application assets (HTML/CSS/JS) to maintain instant offline boot capabilities.

## Consequences
**Positive:**
- Clean separation of concerns between relational metadata logic and high-throughput vector math.
- Fast boot times regardless of vector sizes.

**Negative:**
- Implementing robust data wiping configurations (as introduced in the `SettingsPhase` "Clear Data" components) must be meticulously mapped across three distinct APIs.
- OPFS debugging tools are heavily reliant on modern DevTools; debugging vector misalignments for developers without Chrome/Edge may prove challenging.
