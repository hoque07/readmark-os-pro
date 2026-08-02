#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
python3 -m venv "$ROOT/backend/.venv"
"$ROOT/backend/.venv/bin/python" -m pip install --upgrade pip
"$ROOT/backend/.venv/bin/python" -m pip install -r "$ROOT/backend/requirements.txt"
(cd "$ROOT/frontend" && npm install --registry=https://registry.npmjs.org/)
[ -f "$ROOT/backend/.env" ] || cp "$ROOT/backend/.env.example" "$ROOT/backend/.env"
[ -f "$ROOT/frontend/.env" ] || cp "$ROOT/frontend/.env.example" "$ROOT/frontend/.env"
(cd "$ROOT/backend" && "$ROOT/backend/.venv/bin/python" -m pytest -q)
(cd "$ROOT/frontend" && npm run build)
echo "Setup and validation complete. Run ./scripts/start.sh"
