# Graphify — StudyForge Solo-Dev Setup

Official Graphify documentation targets **teams** with full `graphify-out/` history, wiki, memory feedback loops, and git hooks. **StudyForge uses a reduced profile** optimized for solo development on low-end hardware.

## Philosophy

| Official recommendation | StudyForge policy |
|-------------------------|-------------------|
| Gitignore entire `graphify-out/` | Commit **only** `graph.json` + `GRAPH_REPORT.md` |
| Keep cache, wiki, memory for team | **Delete** cache/wiki/memory/html locally after refresh |
| `graphify hook install` on every clone | **No hooks** by default (manual refresh before push) |
| `graphify watch` for live graph | **Forbidden** on low-end dev machines |
| `code-review-graph` embeddings MCP | **Optional** (`.mcp.example.full.json`) |

Remote GitHub always receives the **current** codebase graph — not a version history of past graphs.

## Prerequisites

```bash
pip install graphifyy
# Optional (high-end only):
pip install code-review-graph
```

Verify: `graphify update .` completes in under ~30s on this repo.

## Daily Workflow

```bash
# After meaningful code changes, before push:
npm run graphify:refresh

# Optional targeted query (low token budget):
npm run graphify:query -- "How does RAG connect to OPFS?"

git add graphify-out/graph.json graphify-out/GRAPH_REPORT.md
git commit -m "chore: refresh knowledge graph snapshot"
```

## Cursor / MCP

1. Copy MCP config: `cp .mcp.example.json .cursor/mcp.json`
2. Enable **graphify-studyforge** in Cursor Settings → MCP
3. For embeddings-heavy review graph (16GB+ RAM recommended): `cp .mcp.example.full.json .cursor/mcp.json`

MCP server runs via `scripts/graphify-mcp-serve.sh` (uses the same Python as the `graphify` CLI).

## What Gets Committed

```
graphify-out/
├── graph.json        ← YES (latest AST graph)
├── GRAPH_REPORT.md   ← YES (human/agent summary)
├── cache/            ← NO (local speed only)
├── memory/           ← NO (no Q&A history in repo)
├── wiki/             ← NO
└── graph.html        ← NO (local visualization)
```

## Low-End Hardware Tips

- Close `npm run dev` before `graphify:refresh` if RAM < 8GB
- Use `--budget` on queries: `graphify query "auth flow" --budget 1200`
- Agents: read `GRAPH_REPORT.md` first (~4KB) instead of full `graph.json` (~60KB)
- Do not run graphify and Vitest coverage simultaneously on the same machine

## CodeGraph (complement)

For **symbol-level** navigation (callers, callees, impact), use [CodeGraph](CODEGRAPH.md) MCP tools first. Use Graphify for **macro** architecture (communities, god nodes, cross-module graph queries).

## Agent Rules

See `.cursor/rules/105-graphify-solo-dev.mdc`, `.cursor/rules/codegraph.mdc`, and `@850-mcp-and-prd` for Cursor agent policy.

## Optional Pre-Push Hook

Not installed by default (low-end: avoids surprise CPU on every push). To enable:

```bash
cp scripts/git-hooks/pre-push-graphify.sample .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| MCP "graph not found" | `npm run graphify:refresh` |
| `python3 -m graphify` fails | Use `graphify` CLI from pip/uv; MCP script reads its shebang |
| Slow update | Check `.graphifyignore`; ensure `node_modules` excluded |
| Huge git diff on graph.json | Expected after large refactors; still single snapshot only |
