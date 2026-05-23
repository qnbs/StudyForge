# CodeGraph — StudyForge Setup

CodeGraph provides a **local SQLite knowledge graph** (symbols, call edges, impact) for token-efficient code navigation in Cursor. It complements [Graphify](GRAPHIFY.md), which covers macro architecture and committed graph snapshots.

## Related docs

- [GRAPHIFY.md](GRAPHIFY.md) — macro architecture graph (committed snapshot)
- [CONTRIBUTING.md](../CONTRIBUTING.md) — clone checklist (`codegraph init -i`, MCP copy)
- Agent rules: `.cursor/rules/codegraph.mdc`, `.cursor/rules/105-graphify-solo-dev.mdc`

## Prerequisites

CLI v0.9.3+ on PATH (`~/.local/bin/codegraph`):

```bash
curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh
# or: npm i -g @colbymchenry/codegraph
```

## First-Time Setup (this repo)

```bash
codegraph install --target=cursor --location=local --yes
codegraph init -i
cp .mcp.example.json .cursor/mcp.json   # if MCP not already configured
```

Restart Cursor so **codegraph** and **graphify-studyforge** MCP servers load.

## Daily Workflow

| Task | Command |
|------|---------|
| Check index | `npm run codegraph:status` |
| After large refactors | `npm run codegraph:sync` |
| Rebuild from scratch | `npm run codegraph:init` |

CodeGraph auto-syncs on file save (~500ms debounce). No watch daemon needed.

## Dual-Tool Policy (CodeGraph + Graphify)

| Question type | Use first |
|---------------|-----------|
| Symbol, callers, callees, impact | **CodeGraph** MCP (`codegraph_*`) |
| Communities, god nodes, cross-module overview | **Graphify** `GRAPH_REPORT.md` / MCP |
| Docs / PRD | `docs/PRD.md` |
| Repo-wide grep | Last resort |

Agent rules: `.cursor/rules/codegraph.mdc`, `@105-graphify-solo-dev.mdc`

## Git Policy

- **Do not commit** `.codegraph/` (local index, machine-specific)
- **Do commit** Graphify snapshot: `graphify-out/graph.json` + `GRAPH_REPORT.md` only

## Troubleshooting

| Problem | Fix |
|---------|-----|
| MCP "not initialized" | `codegraph init -i` in repo root |
| Missing symbols after edit | Wait 1–2s or `npm run codegraph:sync` |
| `database is locked` | Ensure project on local disk (not WSL `/mnt`); reinstall CodeGraph ≥0.9 |
| Graphify MCP broken | `npm run graphify:refresh` |
