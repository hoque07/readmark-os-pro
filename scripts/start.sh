#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
trap 'kill 0' EXIT
(cd "$ROOT/backend" && .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload) &
(cd "$ROOT/frontend" && npm run dev) &
wait
