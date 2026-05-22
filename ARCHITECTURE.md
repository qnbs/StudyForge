# Architecture Overview

**StudyForge** is engineered as an offline-first, local-first Progressive Web Application. Its primary objective is to guarantee 100% privacy and security for academic resources, operating independently from centralized cloud orchestration once fully loaded.

## Core Pillars

1. **Client-Side Compute Only:** All expensive computations (embeddings, LLM inference) run in the browser via **Web Workers**, **Wllama/WebGPU**, and **Xenova/transformers** (WASM).
2. **Local Storage and Durability:**
   * **IndexedDB:** Used securely for application state, agent configurations, conversation history, and citation metadata sync (Zotero/Mendeley).
   * **OPFS (Origin Private File System):** Stores embedding vectors (Float32) referenced by Dexie `documentChunks`; PDF binaries are not persisted in OPFS by default.
3. **No Hidden Telemetry:** The app maintains strict offline paradigms. No external analytics trackers or third-party hidden telemetries are installed. 
4. **Encrypted BYOK Security Model (Cloud Fallback):** Cloud APIs (e.g., Gemini, OpenAI) may optionally be invoked using the user's *Bring-Your-Own-Key* methodology. 
   - Uses a **Master Password** derived via PBKDF2 (600,000 iterations, SHA-256).
   - API keys are encrypted at rest using AES-GCM and stored only locally in `IndexedDB`.
   - Keys are explicitly decoupled from any `.env` file structure and never transmitted beyond explicit direct API calls.

## Component Tree Structure

```text
src/
├── App.tsx                  # Main router shell & Context Providers
├── components/              # Global shared reusable UI
│   ├── command/             # Search infrastructure
│   ├── layout/              # Sidebars, Navs, Shell wrappers
│   └── phases/              # High-level domain sections
│       ├── PlanningPhase    # Pre-writing
│       ├── ResearchPhase    # Search, vector ingestion
│       ├── ElaborationPhase # Outlining
│       ├── WritingPhase     # Primary Text Editor
│       └── AgentWorkshop    # Local LLM persona building
├── contexts/                # Language, Vault, Zotero, LLM, Agents
├── lib/
│   ├── rag/                 # chunking, bm25, hybridSearch (RRF), ragService
│   ├── zotero/              # zoteroClient, syncUtils, rateLimiter, attachmentSync
│   ├── db.ts                # Dexie v6 (incl. zoteroItems, zoteroCollections, zoteroSyncMeta)
│   ├── modelConfig.ts       # Wllama preset URLs (low/medium/high)
│   └── export/              # shared document export
├── workers/                 # pdfWorker, embeddingWorker
└── i18n/                    # Localization structures (EN/DE mappings)
```

## Data Lifecycle

When a user introduces a PDF document via the Research/Library phases:

1. **Ingest & Parse:** The file is picked up via the browser filesystem access API.
2. **Chunking:** A Web Worker processes the raw text into manageable token chunks.
3. **Embedding:** Chunks are embedded via `@xenova/transformers` in a dedicated Web Worker (WASM/browser cache). **WebGPU** is used for Wllama LLM inference, not for embeddings.
4. **Storage:** Embedding vectors in `OPFS`; chunk metadata in Dexie `documentChunks`.
5. **Retrieval:** Hybrid search — BM25 (keyword) + dense cosine (semantic) fused with **Reciprocal Rank Fusion (RRF)** in `queryRAGHybrid`.

## LLM & Agents

- Single **LLMContext** provider loads one Wllama GGUF model per tab.
- `Agent.model` uses preset keys `low` | `medium` | `high` resolved via `resolveModelUrl()`.
- Chat (`RightPanel`) uses active agent prompt + hybrid RAG context.

This allows querying and generation offline after initial model download.

## Zotero Integration

```text
ZoteroSync.tsx (UI)
    → ZoteroContext.tsx (connect / sync / importItem)
        → syncUtils.ts (incrementalZoteroSync)
            → zoteroClient.ts (zotero-api-client)
            → rateLimiter.ts (spacing + 429 retry)
        → attachmentSync.ts (optional PDF → ragService.ingestSource)
    → Dexie: zoteroItems | zoteroCollections | zoteroSyncMeta
    → importToSources.ts (explicit copy to sources)
```

| Concern | Implementation |
|---------|----------------|
| Credentials | `settings.zoteroConfig.userId` + `secureConfig` provider `zotero` (AES-256-GCM via `getApiKey` / `saveApiKey`) |
| Sync trigger | User only: Connect & Sync, Sync now, Command Palette (`studyforge:sync-zotero`) |
| Protocol | `since=<libraryVersion>` on collections/items; `deleted(since)` for removals; `304` → no writes |
| Pagination | Items fetched in pages of 100 until exhausted |
| Local → library | Per-item **Import** or bulk via `importToSources`; not automatic on metadata sync |
| PDFs | Checkbox `studyforge_zotero_auto_pdf` in localStorage (default off); max 50 MB per attachment |
| Tests | `src/lib/zotero/*.test.ts`, `db.test.ts` (schema v6) |
