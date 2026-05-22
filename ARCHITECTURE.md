# Architecture Overview

**StudyForge** is engineered as an offline-first, local-first Progressive Web Application. Its primary objective is to guarantee 100% privacy and security for academic resources, operating independently from centralized cloud orchestration once fully loaded.

## Core Pillars

1. **Client-Side Compute Only:** All expensive computations (embeddings, LLM inference) run in the browser via **Web Workers**, **Wllama/WebGPU**, and **Xenova/transformers** (WASM).
2. **Local Storage and Durability:**
   * **IndexedDB:** Used securely for application state, agent configurations, conversation history, and citation metadata sync (Zotero/Mendeley).
   * **OPFS (Origin Private File System):** Critical for efficiently storing and accessing gigabytes of embedded PDF vector data locally without locking up the browser main thread.
3. **No Hidden Telemetry:** The app maintains strict offline paradigms. No external analytics trackers or third-party hidden telemetries are installed. 
4. **Encrypted BYOK Security Model (Cloud Fallback):** Cloud APIs (e.g., Gemini, OpenAI) may optionally be invoked using the user's *Bring-Your-Own-Key* methodology. 
   - Uses a **Master Password** derived via PBKDF2 (100,000+ iterations with SHA-256).
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
├── contexts/                # Global State (Theme, Lang, LocalDB refs)
├── lib/
│   ├── rag/                 # chunking, bm25, hybridSearch (RRF), ragService
│   ├── modelConfig.ts       # Wllama preset URLs (low/medium/high)
│   └── export/              # shared document export
├── contexts/                # Language, Vault, LLM singleton, Active Agent
└── i18n/                    # Localization structures (EN/DE mappings)
```

## Data Lifecycle

When a user introduces a PDF document via the Research/Library phases:

1. **Ingest & Parse:** The file is picked up via the browser filesystem access API.
2. **Chunking:** A Web Worker processes the raw text into manageable token chunks.
3. **Embedding:** The chunks are passed to a local lightweight embedding model running over `WebGPU`.
4. **Storage:** Embedding vectors in `OPFS`; chunk metadata in Dexie `documentChunks`.
5. **Retrieval:** Hybrid search — BM25 (keyword) + dense cosine (semantic) fused with **Reciprocal Rank Fusion (RRF)** in `queryRAGHybrid`.

## LLM & Agents

- Single **LLMContext** provider loads one Wllama GGUF model per tab.
- `Agent.model` uses preset keys `low` | `medium` | `high` resolved via `resolveModelUrl()`.
- Chat (`RightPanel`) uses active agent prompt + hybrid RAG context.

This allows querying and generation offline after initial model download.
