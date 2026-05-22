#!/usr/bin/env bash
# Solo-dev graphify refresh: latest snapshot only, no history/memory/wiki.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v graphify >/dev/null 2>&1; then
  echo "error: graphify CLI not found. Install: pip install graphifyy (or uv tool install graphifyy)" >&2
  exit 1
fi

echo "[graphify] AST update (no LLM, low-end safe)..."
graphify update .

# Drop heavy local-only artifacts (official team docs keep these; we do not)
rm -rf graphify-out/cache graphify-out/memory graphify-out/wiki 2>/dev/null || true
rm -f graphify-out/graph.html 2>/dev/null || true

if [[ -f graphify-out/graph.json && -f graphify-out/GRAPH_REPORT.md ]]; then
  echo "[graphify] Snapshot ready for git: graphify-out/graph.json, graphify-out/GRAPH_REPORT.md"
  wc -c graphify-out/graph.json graphify-out/GRAPH_REPORT.md
else
  echo "error: expected graphify-out/graph.json and GRAPH_REPORT.md" >&2
  exit 1
fi
