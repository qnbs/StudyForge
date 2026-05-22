# StudyForge Product Requirements Document

## Vision

StudyForge is a privacy-first, offline-first Progressive Web Application that turns the browser into a secure academic writing and research copilot. All document data, embeddings, and optional cloud LLM calls remain under user control on the edge device.

## Non-Goals

- No centralized backend or cloud document sync
- No server-side RAG or document storage
- No mandatory third-party analytics or telemetry
- No hardcoded API keys in source or `.env` (BYOK vault only)

## Core User Journeys

1. **Planning** — Structure research goals before writing
2. **Research / Library** — Ingest PDFs, search PubMed/arXiv, sync Zotero/Mendeley metadata
3. **Elaboration** — Outline and organize arguments
4. **Writing** — TipTap editor with local or BYOK-assisted generation
5. **Agent Workshop** — Configure local LLM personas
6. **Settings** — Language, theme, model limits, encrypted vault

## Technical Constraints

| Area | Decision | Reference |
|------|----------|-----------|
| UI | React 19 + Vite 6 + Tailwind v4 | `package.json` |
| Metadata DB | Dexie 4 / IndexedDB | `src/lib/db.ts` |
| Vector storage | OPFS | `src/lib/opfs.ts`, ADR-0002 |
| Local LLM | Wllama + WebGPU; agent `model` → `low`/`medium`/`high` GGUF presets | ADR-0001, `src/lib/modelConfig.ts`, `LLMContext` |
| RAG | Xenova embeddings + hybrid BM25/vector RRF retrieval | `src/lib/rag/hybridSearch.ts`, `queryRAGHybrid` |
| Cloud LLM (optional) | BYOK AES-256-GCM vault | `SECURITY.md`, `src/lib/crypto.ts` |
| i18n | EN/DE via `LanguageContext` | `src/i18n/translations.ts` |

## Phase Model

Navigation is client-side phase switching in `src/App.tsx` (no React Router). New features must fit an existing phase or justify a new phase module under `src/components/phases/`.

## Success Criteria

- App runs fully offline after initial PWA load
- PDF ingest → chunk → embed → query works without network
- API keys never appear in build artifacts or logs
- CI passes: `npm run lint` and `npm test`

## Related Documents

- Architecture: `ARCHITECTURE.md`
- Security: `SECURITY.md`
- ADRs: `docs/ADR/`
- Meeting history: `docs/meeting-notes/`
- Agent consciousness stream: `.notes/meeting_notes.md`
- Knowledge graph (solo-dev): `docs/GRAPHIFY.md`
