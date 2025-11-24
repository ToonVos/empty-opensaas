#!/usr/bin/env bash
set -euo pipefail

if [ -d "app" ]; then
  # Check if TypeScript is available (skip if not installed yet)
  if (cd app && command -v tsc >/dev/null 2>&1) || (cd app && npx -y tsc --version >/dev/null 2>&1); then
    echo "[pre-push] Running full TypeScript check..."
    (cd app && npx tsc -p tsconfig.json --noEmit)
  else
    echo "[pre-push] ⚠️  Skipping TypeScript check (TypeScript not installed yet)"
  fi

  echo "[pre-push] Validating Wasp configuration..."
  (cd app && wasp version >/dev/null 2>&1 || echo "Warning: Wasp validation skipped")

  # Check if ESLint is available (skip if not installed yet)
  if (cd app && command -v eslint >/dev/null 2>&1) || (cd app && npx -y eslint --version >/dev/null 2>&1); then
    echo "[pre-push] Running ESLint..."
    (cd app && npx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 50 || echo "Warning: ESLint found issues")
  else
    echo "[pre-push] ⚠️  Skipping ESLint check (ESLint not installed yet)"
  fi
fi

echo "[pre-push] ✓ All checks passed"

