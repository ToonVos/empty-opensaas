# React 19 Fix - Permanent Solution

## Problem

**Since October 1, 2025**: React 19.2.0 was published to npm. Wasp 0.18 only supports React 18.

After running `wasp clean`, npm installs the **latest** React version (19.x) in `.wasp/out/web-app/node_modules/`, which breaks the app.

### Symptoms

- ❌ **Blank page** on http://localhost:3000
- ❌ **Console error**: `TypeError: Cannot read properties of undefined (reading 'ReactCurrentDispatcher')`
- ❌ React version mismatch between `app/node_modules` (18.x) and `.wasp/out/web-app/node_modules` (19.x)

## Root Cause

1. Wasp generates `.wasp/out/web-app/package.json` with `@tanstack/react-query`
2. `@tanstack/react-query` has peer dependency: `react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0`
3. npm resolves to **latest** compatible version = React 19.2.0
4. React 19 has breaking changes incompatible with React 18 code

## Solution

### Automatic Fix (Recommended)

The fix is now **automatically applied** by `safe-start.sh --clean`:

```bash
./scripts/safe-start.sh --clean
```

**What happens:**

1. Runs `wasp clean` (deletes `.wasp/` and `node_modules/`)
2. Runs `wasp start` in background
3. Waits for `.wasp/out/web-app/` to be generated
4. Automatically runs `fix-react-version.sh` to force install React 18.2.0
5. Restarts Wasp servers with correct React version

### Manual Fix (If Needed)

If you encounter the blank page issue:

```bash
# 1. Force install React 18 in Wasp-generated directory
./scripts/fix-react-version.sh

# 2. Restart Wasp servers
# Kill existing: Ctrl+C or lsof -ti:3000 -ti:3001 | xargs kill -9
wasp start
```

## Files Involved

### 1. `scripts/fix-react-version.sh` (NEW)

**Purpose**: Force install React 18.2.0 in `.wasp/out/web-app/`

**Usage**:

```bash
./scripts/fix-react-version.sh
```

**What it does**:

- Checks current React version in `.wasp/out/web-app/node_modules/react`
- If React 19.x detected → Installs React 18.2.0
- Uses `--save-exact --legacy-peer-deps` to avoid peer dependency conflicts

### 2. `scripts/safe-start.sh` (UPDATED)

**Changes**:

- Detects when `--clean` flag is used
- Automatically runs `fix-react-version.sh` after Wasp build completes
- Restarts servers to apply React 18 fix

### 3. `app/package.json` (UPDATED)

**Added**:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "overrides": {
    "react": "$react",
    "react-dom": "$react-dom"
  }
}
```

**Note**: Overrides work for `app/node_modules` but NOT for Wasp-generated `.wasp/out/web-app/node_modules`. That's why we need the manual fix script.

## Verification

After applying fix, verify React version:

```bash
cat app/.wasp/out/web-app/node_modules/react/package.json | grep '"version"'
```

**Expected output**: `"version": "18.2.0"`

## When Will This Be Fixed?

Wasp team is tracking React 19 support in:

- GitHub Issue: [#2482](https://github.com/wasp-lang/wasp/issues/2482)

Until Wasp upgrades to React 19, this fix is **required** after every `wasp clean`.

## Timeline

- **October 1, 2025**: React 19.2.0 published to npm
- **October 20, 2025**: Issue discovered and fix implemented
- **Future**: Wasp will add official React 19 support

## Quick Reference

| Command                           | When to Use                          |
| --------------------------------- | ------------------------------------ |
| `./scripts/safe-start.sh --clean` | After schema changes (automatic fix) |
| `./scripts/safe-start.sh`         | Normal start (no fix needed)         |
| `./scripts/fix-react-version.sh`  | Manual fix if blank page occurs      |

## For New Team Members

If you see a **blank page** after `wasp clean`:

1. **Don't panic!** This is a known React 19 issue
2. Run: `./scripts/fix-react-version.sh`
3. Restart: `wasp start`
4. **Preventive**: Always use `./scripts/safe-start.sh --clean` instead of manual `wasp clean`

---

**Last Updated**: October 20, 2025
**Status**: ✅ Permanent fix implemented and automated
