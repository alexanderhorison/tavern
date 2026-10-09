#!/bin/bash
set -e
cd "$(dirname "$0")/.."
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
if ! command -v npm >/dev/null 2>&1; then
  echo "Install Node.js 22.12 or later, then open this launcher again."
  read -r
  exit 1
fi
if [ ! -d node_modules ]; then npm ci; fi
echo "Open http://127.0.0.1:5173 in your browser. Keep this terminal running."
exec npm run dev
