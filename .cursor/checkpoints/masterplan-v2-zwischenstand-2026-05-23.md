# Zwischenstand: Masterplan v1.1–v2.0 (StudyForge)

**Datum:** 2026-05-23  
**Branch:** `main` (lokal, **nicht committed**)  
**Basis:** Zotero Hub v2 bereits auf `origin/main` (`c262701`); Masterplan-Diff nur im Working Tree.

---

## Qualitätsgate (letzter Lauf)

| Schritt | Ergebnis |
|---------|----------|
| `npm run lint` | ✅ grün (ESLint + `tsc --noEmit`) |
| `npm test` | ✅ 17 Dateien, 44 Tests |
| `npm run build` | ✅ PWA-Build erfolgreich (~2m 46s) |

**Hinweis:** Gesamtlauf ~19 Min (Tests ~3,5 Min). Vite-Warnung: `orchestrator.ts` dynamisch + statisch importiert.

---

## Phasen-Status (Plan-To-dos)

### v1.1 Hardening — ~95 % ✅

| Item | Status |
|------|--------|
| `useResearchSources` + ResearchPhase Suche/Filter/Detail | ✅ |
| `useEngineStatus` + Sidebar dynamisch | ✅ |
| Settings: `strictOfflineMode`, `analyticsEnabled` | ✅ |
| `PdfViewerPanel` (Chunk-Vorschau) | ✅ |
| Lighthouse-Checkliste in `SETUP.md` | ✅ |
| CI Coverage-Job | ⏸ optional (`test:coverage` lokal, CI unverändert) |

### v1.2 Reference Sync Worker — ~90 % ✅

| Item | Status |
|------|--------|
| Dexie v7: `syncQueue`, `syncJobHistory`, Mendeley-Tabellen, `sourceAnnotations` | ✅ |
| `referenceSyncWorker.ts` + `orchestrator.ts` | ✅ |
| `ReferenceSyncContext` + Provider in `main.tsx` | ✅ |
| `ZoteroContext` → Orchestrator-Pull | ✅ |
| `SyncManagementPanel` in `ZoteroSync` | ✅ |
| Tests: `syncQueue.test.ts`, `db.test.ts` v7 | ✅ |
| Orchestrator-Integrationstest (MSW) | ❌ offen |

### v1.3 Zotero Push + Citations — ~85 % ✅

| Item | Status |
|------|--------|
| `pushUtils.ts` (PATCH, 412/409, Konflikt-Resolve) | ✅ |
| `ConflictResolutionModal` + Panel | ✅ |
| Feature-Flag `zoteroPush` in Settings | ✅ |
| TipTap `Citation` + `CitationPicker` + Writing-Toolbar | ✅ |
| `formatCitation.ts` + Tests | ✅ |
| Manuell: Push/Konflikt gegen echte Zotero-API | ❌ nicht verifiziert |

### v1.4 Native Library — ~75 % ⚠️

| Item | Status |
|------|--------|
| `src/lib/research-library/*` (DOI/Crossref, `createNativeSource`) | ✅ |
| DOI-Import UI in `LocalLibrary` | ✅ |
| PDF-Viewer | ⚠️ nur Chunk-Text, kein PDF.js-Rendering |
| `markSourceForPush` / native→Zotero Flow in UI | ❌ nicht verdrahtet |

### v1.5 Mendeley — ~80 % ⚠️

| Item | Status |
|------|--------|
| `oauth.ts` (PKCE), `mendeleySync.ts` | ✅ |
| `MendeleySync.tsx` UI + OAuth-Callback | ✅ |
| `VITE_MENDELEY_CLIENT_ID` in `.env` | ❌ Nutzer muss setzen |
| Feature-Flag `mendeley` in Settings | ✅ (Tab in LibraryPhase noch immer sichtbar) |
| E2E OAuth + Pull | ❌ nicht verifiziert |

### v2.0 AI + Provider — ~70 % ⚠️

| Item | Status |
|------|--------|
| `aiInsights.ts` (Summarize, Relevanz via RAG) | ✅ |
| `ResearchInsightsPanel` in ResearchPhase | ✅ |
| `providers/index.ts` (zotero/mendeley/native) | ✅ |
| Feature-Flag `aiSummarize` | ✅ |
| Relevanz braucht Manuskript-Text (Prop leer) | ❌ |
| Provider-Plugin-Registry in UI | ❌ |

---

## Wichtige neue Dateien (untracked `??`)

```
src/workers/referenceSyncWorker.ts
src/contexts/ReferenceSyncContext.tsx
src/hooks/useResearchSources.ts, useEngineStatus.ts
src/lib/reference/* (orchestrator, syncQueue, aiInsights, providers)
src/lib/zotero/pushUtils.ts
src/lib/citation/*, src/lib/mendeley/*, src/lib/research-library/*
src/components/library/SyncManagementPanel.tsx, ConflictResolutionModal.tsx
src/components/research/PdfViewerPanel.tsx, ResearchInsightsPanel.tsx
src/components/writing/CitationPicker.tsx
docs/ADR/0003-reference-sync-worker.md, 0004-citation-system.md
```

---

## Nächste Schritte (Fortsetzung)

1. **Manuell smoke-testen:** Zotero Pull/Push, Mendeley OAuth, DOI-Import, Zitat einfügen, Research-Summarize.
2. **Kleine Lücken schließen:**
   - `ResearchInsightsPanel`: `manuscriptExcerpt` aus Writing/Elaboration-Phase befüllen.
   - LibraryPhase: Mendeley-Tab an `featureFlags.mendeley` koppeln.
   - Optional: `pushUtils` / Orchestrator MSW-Tests.
3. **Commit** (nur auf Nutzerwunsch): z. B. `feat: masterplan v1.1–v2.0 reference sync, citations, mendeley, DOI`.
4. **Push/PR** nach Commit.

---

## Bekannte Einschränkungen

- Citations: leichtgewichtig (kein `@citation-js/core`).
- PDF-Viewer: Chunks aus IndexedDB, kein echtes PDF.
- Mendeley: `CLIENT_SECRET` optional; Redirect-URI muss in Mendeley-App passen.
- Push nur wenn `featureFlags.zoteroPush` aktiv.

---

## Referenzen

- Masterplan: `.cursor/plans/studyforge_master_roadmap_df7cccc6.plan.md` (**nicht editieren**)
- Transcript: `5f564f79-ccab-4b2d-be1d-e4d627525601`
