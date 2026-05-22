# Meeting Notes: Initial Platform Kickoff

**Date:** 2026-05-22
**Participants:** StudyForge Core Team

## Agenda
1. Establish the overarching concept for StudyForge.
2. Determine core technical constraints (Offline-first, PWA).
3. Plan initial UI views.

## Discussion Points

- **Privacy Constraint is non-negotiable:** Academia is slow to adopt ChatGPT out of fear of plagarism /IP leakage. An offline LLM running entirely in the browser is our Unique Selling Proposition (USP).
- **Zotero vs Mendeley:** Both are essential. Zotero has better open API support, so we will start there, but structurally prepare for Mendeley OAuth flows.
- **RAG Local Storage:** IndexedDB handles JSON fine, but actual vector float 32 arrays take up mass storage. We decided to utilize OPFS (Origin Private File System) to store binary vectors to keep memory overhead clean.

## Action Items
- [x] Initial React scaffolding with Tailwind
- [x] Create core UI views (Planning, Library/Research, Elaboration/Outlining, Writing Editor, Agent Workshop, Settings)
- [x] Add global bilingual translations (English/German)
- [x] Mobile responsiveness integration
- [x] Documentation scaffolding (ADR, Guidelines, Codes of Conduct)
