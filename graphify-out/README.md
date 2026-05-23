# graphify-out (solo-dev snapshot)

This directory holds the **current** codebase knowledge graph for Cursor/agents.

## Committed to GitHub

- `graph.json` — latest AST graph (replace on each refresh, no history)
- `GRAPH_REPORT.md` — summary for agents (read this first)

## Local only (gitignored)

- `cache/` — extraction cache (speed)
- `memory/` — not used in StudyForge (no version history in repo)
- `wiki/` — not committed
- `graph.html` — local visualization

Refresh: `npm run graphify:refresh` from repo root. See `docs/GRAPHIFY.md`.

**CodeGraph** (local `.codegraph/`, gitignored) complements this snapshot for symbol/call-graph queries — see `docs/CODEGRAPH.md`.
