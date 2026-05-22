#!/usr/bin/env bash
# Portable MCP stdio entry for graphify.serve (uses same Python as `graphify` CLI).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GRAPH="${ROOT}/graphify-out/graph.json"

if [[ ! -f "$GRAPH" ]]; then
  echo "error: $GRAPH missing. Run: npm run graphify:refresh" >&2
  exit 1
fi

GRAPHIFFY_BIN="${GRAPHIFFY_BIN:-$(command -v graphify 2>/dev/null || true)}"
if [[ -z "$GRAPHIFFY_BIN" ]]; then
  echo "error: graphify not in PATH" >&2
  exit 1
fi

PYTHON="$(head -1 "$GRAPHIFFY_BIN" | sed 's/^#!//')"
if [[ ! -x "$PYTHON" ]]; then
  PYTHON="$(command -v python3)"
fi

exec "$PYTHON" -m graphify.serve "$GRAPH"
