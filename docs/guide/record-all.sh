#!/usr/bin/env bash
# Regenerates every demo GIF by running all VHS tapes under docs/guide.
# Run from the repo root: docs/guide/record-all.sh
set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$repo_root"

for tape in docs/guide/*/*.tape; do
  echo "==> vhs $tape"
  vhs "$tape"
done
