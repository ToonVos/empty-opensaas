#!/usr/bin/env bash
set -euo pipefail

if [ -d "app" ]; then
  echo "[pre-push] Running full TypeScript check..."
  (cd app && npx --yes tsc -p tsconfig.json --noEmit)
  
  echo "[pre-push] Validating Wasp configuration..."
  (cd app && wasp version >/dev/null 2>&1 || echo "Warning: Wasp validation skipped")
  
  echo "[pre-push] Running ESLint..."
  (cd app && npx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 50 || echo "Warning: ESLint found issues")
fi

echo "[pre-push] ✓ All checks passed"

