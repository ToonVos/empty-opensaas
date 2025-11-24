---
name: code-quality
description: Complete code quality workflow with ESLint, Prettier, TypeScript, Husky hooks, and type safety standards. Run before every commit/push.
triggers:
  [
    "lint",
    "eslint",
    "prettier",
    "typescript",
    "type check",
    "code quality",
    "clean code",
    "format",
    "husky",
    "pre-commit",
    "pre-push",
    "tsc",
    "type error",
    "linting error",
  ]
version: 1.0
last_updated: 2025-10-24
---

# Code Quality & Linting

Complete workflow for maintaining code quality through automated checks, linting, formatting, and type safety.

## Purpose

Ensure code quality before every commit/push through:

- **ESLint** - Code style and best practices
- **Prettier** - Consistent formatting
- **TypeScript** - Type safety
- **Husky** - Automated git hooks
- **Type Safety Standards** - 2-tier approach (production strict, tests pragmatic)

**Use when:**

- Before committing code
- Fixing linting errors
- Resolving type errors
- Setting up code quality workflow
- Understanding what checks run automatically

---

## Quick Reference

### Manual Checks (Run Anytime)

```bash
# Prettier (formatting)
cd app && npx prettier --check .           # Check formatting
cd app && npx prettier --write .           # Fix formatting

# ESLint (code quality)
cd app && npx eslint . --ext .ts,.tsx      # Check for issues
cd app && npx eslint . --ext .ts,.tsx --fix # Auto-fix issues

# TypeScript (type safety)
cd app && npx tsc --noEmit                 # Full type check
cd app && npx tsc -p tsconfig.json --noEmit # Use config

# All checks at once (pre-push equivalent)
cd app && npx prettier --check . && npx tsc --noEmit && npx eslint . --ext .ts,.tsx
```

### Automated Checks

| Trigger    | When               | What Runs                                       |
| ---------- | ------------------ | ----------------------------------------------- |
| Pre-commit | `git commit`       | Lint-staged, Prettier, TypeScript (staged only) |
| Pre-push   | `git push`         | Full TypeScript, Wasp validation, ESLint        |
| CI/CD      | PR to develop/main | All checks + tests                              |
| Manual     | Run commands above | Individual checks                               |

---

## Pre-Commit Checks

**Automatically runs on `git commit`** (via Husky hook: `.husky/_pre-commit.sh`)

### 1. Block Secret Files

**Prevents committing:**

```bash
.env
.env.server
.env.client
.env.local
.env.server.local
.env.client.local
```

**Allow example files:**

```bash
.env.server.example  # ✅ OK to commit
.env.client.example  # ✅ OK to commit
```

**If blocked:**

```bash
git restore --staged .env.server
git commit  # Try again
```

### 2. Lint-Staged (Fast Checks)

**Only checks staged files** (configured in `.lintstagedrc.json`):

| File Pattern            | Actions                           |
| ----------------------- | --------------------------------- |
| `*.md`                  | Prettier format                   |
| `app/src/**/*.{ts,tsx}` | ESLint auto-fix + Prettier format |
| `app/src/**/*.{js,jsx}` | ESLint auto-fix + Prettier format |
| `app/**/*.{json,css}`   | Prettier format                   |

**Auto-fixes applied before commit** - staged files updated automatically.

### 3. Prettier Check (All Files)

**Checks ALL files**, not just staged (same as CI):

```bash
cd app && npx prettier --check .
```

**If fails:**

```bash
cd app && npx prettier --write .  # Fix all files
git add .                         # Re-stage formatted files
git commit                        # Try again
```

### 4. TypeScript Check (Staged Files Only)

**Fast check** - only runs if `.ts` or `.tsx` files staged:

```bash
cd app && npx tsc -p tsconfig.json --noEmit
```

**If fails:** See [Type Errors](#type-errors) section below.

### 5. Cleanup .tmp/ Directory

**Non-blocking** - removes files >7 days old from `.tmp/`:

- Preserves `README.md`, `CLAUDE.md`, `.gitkeep`
- Removes empty directories (keeps structure)
- Warns about temp files outside `.tmp/`

---

## Pre-Push Checks

**Automatically runs on `git push`** (via Husky hook: `.husky/_pre-push.sh`)

### 1. Full TypeScript Check

**All files**, not just staged:

```bash
cd app && npx tsc -p tsconfig.json --noEmit
```

**More thorough than pre-commit** - catches cross-file type issues.

### 2. Wasp Configuration Validation

**Validates `main.wasp` syntax:**

```bash
cd app && wasp version
```

**Catches:**

- Syntax errors in main.wasp
- Missing entity declarations
- Invalid route definitions

### 3. ESLint (Max 50 Warnings)

**Full ESLint check** with warning tolerance:

```bash
cd app && npx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 50
```

**Why 50 warnings?**

- Legacy code cleanup in progress
- Errors always block (0 tolerance)
- Warnings reduced over time

**Current warning count:** 20 (as of 2025-10-24)

---

## Type Safety Standards

**Reference:** [docs/LINTING-STANDARDS.md](../../docs/LINTING-STANDARDS.md)

### 2-Tier Standard

| Context             | Standard        | `any` Usage  | Why                      |
| ------------------- | --------------- | ------------ | ------------------------ |
| Production code     | Strict (Tier 1) | 0 preferred  | Type safety critical     |
| Tests/mocks/helpers | Pragmatic       | With comment | Practicality over purity |

### Key Patterns

#### Operations (Production Code)

```typescript
// ✅ CORRECT - Wasp generates types automatically
import type { GetDocument } from "wasp/server/operations";

export const getDocument: GetDocument<{ id: string }, A3Document> = async (
  args,
  context,
) => {
  if (!context.user) throw new HttpError(401);
  // context.entities is typed automatically
  return context.entities.A3Document.findUnique({ where: { id: args.id } });
};
```

#### Helper Functions (Choose Pattern)

```typescript
// 🥇 PREFERRED - Delegate pattern (0 `any`)
export async function createWithAudit(
  userId: string,
  data: Prisma.A3DocumentCreateInput,
  a3Delegate: Prisma.A3DocumentDelegate, // Pass specific delegate
) {
  return a3Delegate.create({ data: { ...data, userId } });
}

// ⚠️ FALLBACK - Context any (when 3+ entities needed)
/**
 * Multi-entity helper - accepts any context.
 * Reason: Needs A3Document, User, Department delegates.
 */
export async function complexHelper(
  data: any,
  context: any, // eslint-disable-line @typescript-eslint/no-explicit-any -- Wasp operation context (see file header)
) {
  // ... uses multiple entities
}
```

#### Test Mocks (Pragmatic)

```typescript
import { vi } from "vitest";

// ✅ PREFERRED - Try vi.mocked() first (Vitest 3.x)
const mockCreate = vi.mocked(context.entities.A3Document.create);

// ✅ ACCEPTABLE - If vi.mocked() has type mismatches
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Mock cast: Vitest types don't match Prisma delegates
const mockCreate = context.entities.A3Document.create as any;
```

**See LINTING-STANDARDS.md for:**

- Complete 2-tier philosophy
- Helper function decision tree
- ESLint configuration (disable no-undef for TS)
- unknown vs any guidance
- Industry standards alignment

---

## Common Fixes

### Type Errors

#### "Property X does not exist on type Y"

**After schema.prisma or main.wasp changes:**

```bash
# 1. Restart Wasp (regenerates types)
./scripts/safe-start.sh

# 2. If still fails, clean build
wasp clean
./scripts/safe-start.sh
```

**Missing type annotation:**

```typescript
// ❌ WRONG - No type annotation
export const getDocument = async (args, context) => {
  // context.entities is undefined!
};

// ✅ CORRECT - Type annotation
export const getDocument: GetDocument<{ id: string }, A3Document> = async (
  args,
  context,
) => {
  // context.entities is typed
};
```

#### "Cannot find module 'wasp/...'"

```bash
# Restart Wasp to regenerate types
./scripts/safe-start.sh
```

#### "Unexpected any"

**Use inline eslint-disable with reason:**

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Mock cast: Vitest types don't match Prisma delegates
const mockContext = createMockContext() as any;
```

**Or fix with vi.mocked():**

```typescript
// Better approach (Vitest 3.x)
const mockCreate = vi.mocked(context.entities.A3Document.create);
```

### Prettier Errors

**"Code style issues found"**

```bash
# Fix all files
cd app && npx prettier --write .

# Check specific file
cd app && npx prettier --check src/path/to/file.ts

# Fix specific file
cd app && npx prettier --write src/path/to/file.ts
```

### ESLint Errors

**"ESLint found issues"**

```bash
# Auto-fix what's possible
cd app && npx eslint . --ext .ts,.tsx --fix

# See all issues
cd app && npx eslint . --ext .ts,.tsx

# Check specific file
cd app && npx eslint src/path/to/file.ts
```

**Common ESLint errors:**

| Error                         | Fix                                             |
| ----------------------------- | ----------------------------------------------- |
| `no-unused-vars`              | Remove unused variable or prefix with `_`       |
| `no-explicit-any`             | Use proper type or add inline eslint-disable    |
| `react-hooks/exhaustive-deps` | Add missing dependency or suppress with comment |

### Hook Failures

**Pre-commit fails:**

```bash
# See what failed in error output, then:

# Fix Prettier
cd app && npx prettier --write .

# Fix TypeScript
./scripts/safe-start.sh  # If types missing
cd app && npx tsc --noEmit  # Check again

# Fix ESLint
cd app && npx eslint . --ext .ts,.tsx --fix

# Unstage secret files
git restore --staged .env.server
```

**Pre-push fails:**

```bash
# Full check locally before pushing
cd app && npx prettier --check . && npx tsc --noEmit && npx eslint . --ext .ts,.tsx

# Fix each error from output
```

**Bypass hooks (emergency only):**

```bash
git commit --no-verify  # ⚠️ Use with extreme caution
git push --no-verify    # ⚠️ CI will still check!
```

---

## Complete Workflow

### Before Every Commit

**Automated (no action needed):**

1. ✅ Lint-staged runs on staged files
2. ✅ Prettier formats code
3. ✅ ESLint auto-fixes issues
4. ✅ TypeScript checks staged files

**If hook fails:**

```bash
# Read error output
# Fix the issue (see Common Fixes above)
# Try commit again
git commit
```

### Before Every Push

**Automated (no action needed):**

1. ✅ Full TypeScript check
2. ✅ Wasp configuration validated
3. ✅ ESLint runs (max 50 warnings)

**If hook fails:**

```bash
# Run checks manually to see details
cd app && npx tsc --noEmit
cd app && npx eslint . --ext .ts,.tsx

# Fix issues
# Try push again
git push
```

### Manual Quality Check

**Run before creating PR:**

```bash
# 1. Format all code
cd app && npx prettier --write .

# 2. Fix linting issues
cd app && npx eslint . --ext .ts,.tsx --fix

# 3. Check types
cd app && npx tsc --noEmit

# 4. Run tests
cd app && wasp test client run

# 5. Commit and push
git add .
git commit -m "fix: code quality improvements"
git push
```

---

## Troubleshooting

### "Husky hooks not running"

```bash
# Reinstall hooks
npx husky install

# Check hook files exist
ls -la .husky/
```

### "lint-staged skipping files"

```bash
# Check .lintstagedrc.json patterns
cat .lintstagedrc.json

# Files must be staged
git add src/path/to/file.ts
git commit
```

### "TypeScript errors after schema change"

```bash
# ALWAYS restart after schema/main.wasp changes
./scripts/safe-start.sh

# If still fails
wasp clean
./scripts/safe-start.sh
```

### "Too many ESLint warnings"

**Current:** 20 warnings (target: 0)

```bash
# See all warnings
cd app && npx eslint . --ext .ts,.tsx

# Fix incrementally
cd app && npx eslint src/specific/area --ext .ts,.tsx --fix
```

**Priority order:**

1. Fix errors first (always block)
2. Fix warnings in new code
3. Gradually fix legacy warnings

### "React 19 issue after wasp clean"

```bash
# Wasp clean installs React 19 (breaks app)
# Use safe-start.sh --clean instead
./scripts/safe-start.sh --clean  # Auto-fixes React version

# Or fix manually
./scripts/fix-react-version.sh
```

---

## Configuration Files

### `.lintstagedrc.json`

**What:** Fast checks on staged files only (pre-commit)

**Patterns:**

- `*.md` → Prettier
- `app/src/**/*.{ts,tsx}` → ESLint + Prettier
- `app/src/**/*.{js,jsx}` → ESLint + Prettier
- `app/**/*.{json,css}` → Prettier

### `.husky/_pre-commit.sh`

**What:** Pre-commit hook script

**Runs:**

1. Block .env files
2. Lint-staged
3. Prettier check (all files)
4. TypeScript check (staged files)
5. Cleanup .tmp/

### `.husky/_pre-push.sh`

**What:** Pre-push hook script

**Runs:**

1. Full TypeScript check
2. Wasp validation
3. ESLint (max 50 warnings)

### `app/.eslintrc.json`

**What:** ESLint configuration

**Key rules:**

- `@typescript-eslint/no-explicit-any`: warn (not error)
- `@typescript-eslint/no-undef`: off (TypeScript handles it)
- React hooks rules enabled
- Max warnings: 50 (enforced in pre-push)

### `app/.prettierrc`

**What:** Prettier configuration

**Settings:**

- 2 spaces indent
- Single quotes
- Semicolons
- Max line length: 100

---

## References

- **Type Safety:** [docs/LINTING-STANDARDS.md](../../docs/LINTING-STANDARDS.md)
- **Troubleshooting:** wasp-troubleshooting skill
- **CI/CD:** [.github/CLAUDE.md](../../.github/CLAUDE.md)
- **Temp Files:** [.tmp/CLAUDE.md](../../.tmp/CLAUDE.md)

---

## Examples

### Fixing Common Pre-Commit Failures

**Scenario 1: Prettier fails**

```bash
[pre-commit] ❌ Prettier check failed

# Fix
cd app && npx prettier --write .
git add .
git commit
```

**Scenario 2: TypeScript error in staged file**

```bash
[pre-commit] TypeScript error: Property 'name' does not exist

# Option 1: Fix the error
# Edit file, fix type issue

# Option 2: Restart if schema changed
./scripts/safe-start.sh

git add src/path/to/file.ts
git commit
```

**Scenario 3: Secret file blocked**

```bash
[pre-commit] Refusing to commit env files

# Unstage
git restore --staged .env.server

# Verify it's in .gitignore
cat .gitignore | grep .env.server

git commit
```

### Fixing Common Pre-Push Failures

**Scenario 1: Full TypeScript check fails**

```bash
[pre-push] TypeScript error in src/utils/helper.ts

# Run locally to see details
cd app && npx tsc --noEmit

# Fix error
# ... edit file

# Commit fix
git add src/utils/helper.ts
git commit -m "fix: resolve type error in helper"
git push
```

**Scenario 2: ESLint exceeds warning limit**

```bash
[pre-push] ESLint found 55 warnings (max 50)

# See warnings
cd app && npx eslint . --ext .ts,.tsx

# Auto-fix what's possible
cd app && npx eslint . --ext .ts,.tsx --fix

# Commit fixes
git add .
git commit -m "fix: resolve ESLint warnings"
git push
```

### Manual Code Quality Workflow

**Before creating PR:**

```bash
# 1. Ensure code is formatted
cd app && npx prettier --write .
git add .
git commit -m "style: format code with prettier"

# 2. Fix linting issues
cd app && npx eslint . --ext .ts,.tsx --fix
git add .
git commit -m "fix: resolve linting issues"

# 3. Verify types are correct
cd app && npx tsc --noEmit
# Fix any errors that appear

# 4. Run tests
cd app && wasp test client run
# Ensure all tests pass

# 5. Push with confidence
git push
```

---

## Notes

- **Hooks are FAST**: Pre-commit averages <5s for typical commits
- **Pre-push is thorough**: Full checks ensure CI won't fail
- **Auto-fix is safe**: Lint-staged only modifies staged files
- **Warnings tolerated**: 50 max (legacy code cleanup in progress)
- **Types regenerate on restart**: After schema/main.wasp changes
- **React 19 bug**: Use `safe-start.sh --clean`, NOT `wasp clean` directly

**Philosophy:** Catch issues early (pre-commit) → Comprehensive check before sharing (pre-push) → CI validates (final gate).
