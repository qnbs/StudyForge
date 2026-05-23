# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Masterplan v1.1–v2.0: Research UX hooks, engine status in sidebar, strict offline + analytics toggles, PDF chunk preview panel.
- Reference sync v1.2: `referenceSyncWorker`, Dexie v7 `syncQueue` / `syncJobHistory`, `ReferenceSyncOrchestrator`, `SyncManagementPanel`.
- Zotero push + conflict resolution (feature flag), lightweight citations (TipTap + `CitationPicker`), DOI import via Crossref.
- Mendeley OAuth2 PKCE UI + pull provider; native research-library service; AI summarize/relevance in Research insights.
- ADRs `0003-reference-sync-worker`, `0004-citation-system`; Lighthouse PWA checklist in SETUP.md; `npm run test:coverage`.
- Zotero Hub v2: incremental sync via `zotero-api-client`, Dexie v6 tables (`zoteroItems`, `zoteroCollections`, `zoteroSyncMeta`), rate-limit handling, collections UI, optional PDF attachment ingest.
- `ZoteroContext`, `src/lib/zotero/*` service layer, and unit tests for map/sync/rate-limit logic.
- Hybrid RAG retrieval: BM25 + dense vectors fused with Reciprocal Rank Fusion (`src/lib/rag/hybridSearch.ts`, tests in `hybridSearch.test.ts`).
- Agent model mapping to Wllama presets (`low` / `medium` / `high`) via `resolveModelUrl()`.
- LLM singleton context, ingest queue, batched OPFS query, Graphify solo-dev docs, modular `.cursor/rules/`.
- Comprehensive architecture and standard documentation (ADR, Security, Contributing, Code of Conduct).
- Global Command Palette (`Cmd/Ctrl + K`) for quick navigation across the application.
- Mobile bottom navigation and general responsiveness improvements across all workspace phases (`LibraryPhase`, `WritingPhase`, `AgentWorkshopPhase`, `SettingsPhase`, `HelpPhase`).
- Responsive Toolbar and editor sections inside `WritingPhase`.
- English to German user interface translations mapped globally via `LanguageContext`.
- Library phase: Local Vector Store views, Zotero integrations UI, Internet Archive fetching with UI layouts.

### Changed
- Zotero integration refactored from inline `fetch` (50-item cap) to service layer with Hub UI, collections sidebar, and Dexie-backed cache.
- `RightPanel` and `AgentEditor` load the agent’s Wllama preset via `ensureModelForRef()` before chat/test generation.
- Dexie v5 migrates legacy `modelLimitConfig: default` and old agent model labels to preset keys; v6 adds Zotero tables.
- Refactored general routing logic avoiding conventional complex react-router structures to stick to single-page memory swapping for PWA stability.
- Enhanced UX for settings configuration, introducing responsive tabbed sidebar navigation instead of static lists.
- Layout overflow issues in mobile views regarding long flex lists.
- Overlapping Z-index problems with the Sidebar and Command Palette overlays.

### Fixed
- Zotero sync template literal bug (`zotero_${key}` IDs).
- XSS: removed `dangerouslySetInnerHTML` on library source titles.
- Multi-`useLLM` OOM, RAG full-scan OOM, worker ingest races, vault session exposure.

### Removed
- Unused dependencies `@google/genai` and `dotenv` (BYOK vault only; no build-time API keys).

## [1.0.0] - 2026-05-22
### Added
- Initial project scaffolding.
- Basic React infrastructure with Vite, Tailwind CSS, Lucide Icons.
- Core local UI framework modeling the writing and research features.
