# ADR 0004: Citation system

## Status

Accepted (v1.3)

## Context

Writing phase needs inline citations linked to local `sources` without pulling in heavy CSL stacks initially.

## Decision

- TipTap `Citation` node extension (`citationExtension.ts`) stores `sourceId` + display label.
- `formatCitation.ts` provides APA/Vancouver/IEEE-lite formatters (no `@citation-js/core` yet).
- `CitationPicker` searches Dexie `sources`; toolbar button in `WritingPhase`.

## Consequences

- Not publication-grade CSL; upgrade path documented for `@citation-js/core`.
- Bibliography export can reuse `formatBibliographyEntry` when LaTeX/BibTeX export expands.
