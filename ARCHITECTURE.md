# Architecture Overview

**StudyForge** is engineered as an offline-first, local-first Progressive Web Application. Its primary objective is to guarantee 100% privacy and security for academic resources, operating independently from centralized cloud orchestration once fully loaded.

## Core Pillars

1. **Client-Side Compute Only:** All expensive computations (e.g., text embedding, generation via LLM) are pushed to the edge device. StudyForge relies on modern browser APIs like `WebGPU` via libraries such as `WebLLM`.
2. **Local Storage and Durability:**
   * **IndexedDB:** Used securely for application state, agent configurations, conversation history, and citation metadata sync (Zotero/Mendeley).
   * **OPFS (Origin Private File System):** Critical for efficiently storing and accessing gigabytes of embedded PDF vector data locally without locking up the browser main thread.
3. **No Hidden Telemetry:** The app maintains strict offline paradigms. No external analytics trackers or third-party hidden telemetries are installed. 

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
├── lib/                     # Utilities (RAG handlers, WebLLM wrappers)
└── i18n/                    # Localization structures (EN/DE mappings)
```

## Data Lifecycle

When a user introduces a PDF document via the Research/Library phases:

1. **Ingest & Parse:** The file is picked up via the browser filesystem access API.
2. **Chunking:** A Web Worker processes the raw text into manageable token chunks.
3. **Embedding:** The chunks are passed to a local lightweight embedding model running over `WebGPU`.
4. **Storage:** The output float arrays alongside metadata are cached into the device's `OPFS` for fast subsequent Retrieval-Augmented Generation processes.

This allows all data querying to happen instantly offline.
