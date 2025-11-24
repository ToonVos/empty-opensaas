#!/usr/bin/env bash
set -euo pipefail

# Block committing common secret files (allow example files)
if git diff --cached --name-only | grep -E '(^|/)\.env(\.server|\.client)?(\.local)?$' >/dev/null; then
  echo "\n[pre-commit] Refusing to commit env files. Unstage them and try again." >&2
  exit 1
fi

# Run lint-staged for fast checks on staged files only
npx lint-staged

# Prettier check on all files (same as CI)
if [ -d "app" ]; then
  echo "[pre-commit] Running Prettier check..."
  if ! (cd app && npx prettier --check .); then
    echo "\n[pre-commit] ❌ Prettier check failed. Run 'cd app && npx prettier --write .' to fix."
    exit 1
  fi
fi

# Quick TypeScript check on staged files
STAGED_TS_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' || true)
if [ -n "$STAGED_TS_FILES" ] && [ -d "app" ]; then
  # Check if TypeScript is available (skip if not installed yet)
  if (cd app && command -v tsc >/dev/null 2>&1) || (cd app && npx -y tsc --version >/dev/null 2>&1); then
    echo "[pre-commit] Running TypeScript check..."
    if ! (cd app && npx tsc -p tsconfig.json --noEmit); then
      echo "[pre-commit] ❌ TypeScript check failed. Fix errors before committing."
      exit 1
    fi
  else
    echo "[pre-commit] ⚠️  Skipping TypeScript check (TypeScript not installed yet)"
  fi
fi

# ===================================
# Temporary Files Cleanup
# ===================================
# Remove files older than 7 days from .tmp/
# Preserve documentation and .gitkeep files
# Non-blocking - won't fail commits

if [ -d ".tmp" ]; then
  echo "[pre-commit] Cleaning temporary files (>7 days old)..."

  # Count files before cleanup
  BEFORE_COUNT=$(find .tmp -type f ! -name 'README.md' ! -name 'CLAUDE.md' ! -name '.gitkeep' 2>/dev/null | wc -l | tr -d ' ')

  # Remove files older than 7 days (preserve docs and .gitkeep)
  find .tmp -type f \
    ! -name 'README.md' \
    ! -name 'CLAUDE.md' \
    ! -name '.gitkeep' \
    -mtime +7 \
    -delete 2>/dev/null || true

  # Remove empty directories (but keep structure)
  find .tmp/scripts .tmp/tests .tmp/data -type d -empty -not -name 'scripts' -not -name 'tests' -not -name 'data' -delete 2>/dev/null || true

  # Count remaining files
  AFTER_COUNT=$(find .tmp -type f ! -name 'README.md' ! -name 'CLAUDE.md' ! -name '.gitkeep' 2>/dev/null | wc -l | tr -d ' ')
  REMOVED=$((BEFORE_COUNT - AFTER_COUNT))

  if [ "$REMOVED" -gt 0 ]; then
    echo "[pre-commit] ✓ Cleaned $REMOVED temporary file(s). $AFTER_COUNT file(s) remaining."
  fi

  # Warn about misplaced temp files outside .tmp/
  MISPLACED=$(git ls-files | grep -E '(^|/)temp_.*\.(py|sh|js|ts)$|script_.*\.tmp\.|_claude_temp_|helper_temp_' || true)
  if [ -n "$MISPLACED" ]; then
    echo "[pre-commit] ⚠️  WARNING: Temporary files found outside .tmp/ directory:" >&2
    echo "$MISPLACED" | sed 's/^/    /' >&2
    echo "    Consider moving these to .tmp/scripts/ or .tmp/tests/" >&2
  fi
fi

echo "[pre-commit] ✓ All checks passed"

