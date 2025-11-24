# Troubleshooting Guide

**Complete diagnostic procedures for resolving common Wasp development issues.**

> **Quick Start:** For the most common issues, see CLAUDE.md#troubleshooting. This guide provides detailed step-by-step diagnostics for complex problems.

---

## Import/Type Errors

### Symptom

- `Cannot find module 'wasp/...'`
- `Cannot find module '@src/...'`
- `Module has no exported member 'X'`
- TypeScript compilation errors
- Stale types not updating

### Diagnostic Steps

**Step 1: Verify Import Syntax**

Check which context you're in:

```typescript
// ✅ CORRECT - In .ts/.tsx files
import type { Task } from "wasp/entities";
import { useQuery } from "wasp/client/operations";
import { HttpError } from "wasp/server";
import { TaskStatus } from "@prisma/client"; // For enum VALUES

// ❌ WRONG - Don't use @ prefix for wasp
import { Task } from "@wasp/entities"; // ❌
import { useQuery } from "@wasp/client/operations"; // ❌

// ❌ WRONG - Don't use @src in .ts/.tsx
import { helper } from "@src/utils/helper"; // ❌
// ✅ CORRECT - Use relative path
import { helper } from "../../utils/helper";
```

```wasp
// ✅ CORRECT - In main.wasp files
query getTasks {
  fn: import { getTasks } from "@src/server/a3/operations",
  entities: [Task]
}

// ❌ WRONG - Don't use relative paths
query getTasks {
  fn: import { getTasks } from "../src/server/a3/operations", // ❌
}
```

**Step 2: Check main.wasp Configuration**

```wasp
// Make sure entities are listed!
query getTasks {
  fn: import { getTasks } from "@src/server/a3/operations",
  entities: [Task]  // ← REQUIRED for context.entities access
}
```

**Step 3: Restart Wasp**

Types are only regenerated when Wasp restarts:

```bash
# Stop wasp (Ctrl+C), then:
wasp start
```

**Step 4: Clean and Rebuild**

If types still wrong:

```bash
wasp clean
rm -rf node_modules .wasp
npm install
wasp start
```

**Step 5: Check You're in app/ Directory**

```bash
pwd
# Should show: /path/to/opensaas-techlead/app

# If not:
cd app
wasp start
```

### Solutions by Error Type

**"Cannot find module 'wasp/...'"**

- Cause: Wasp not running or using `@wasp` instead of `wasp`
- Fix: Remove `@` prefix, restart `wasp start`

**"Cannot find module '@src/...'"**

- Cause: Using `@src` in .ts/.tsx file
- Fix: Use relative path (`../../utils/helper`)

**"Module has no exported member 'TaskStatus'"**

- Cause: Trying to import enum VALUES from `wasp/entities`
- Fix: Import from `@prisma/client` instead

**"Property 'Task' does not exist on 'context.entities'"**

- Cause: Entity not listed in main.wasp
- Fix: Add `entities: [Task]` to query/action in main.wasp

---

## Operation Not Working

### Symptom

- Operation function not accessible in client
- `context.entities.Task` is undefined
- Operation executes but no auto-refetch
- Type errors on operation parameters

### Diagnostic Steps

**Step 1: Verify main.wasp Configuration**

```wasp
// Check all required fields present:
query getTasks {
  fn: import { getTasks } from "@src/server/a3/operations",  // ← @src prefix?
  entities: [Task]  // ← Listed?
}

action createTask {
  fn: import { createTask } from "@src/server/a3/operations",
  entities: [Task]  // ← Same entities for auto-invalidation
}
```

**Step 2: Check Type Annotations**

```typescript
// ✅ CORRECT - Type annotations present
import type { GetTasks, CreateTask } from "wasp/server/operations";
import type { Task } from "wasp/entities";

export const getTasks: GetTasks<void, Task[]> = async (_args, context) => {
  // Type annotations enable context.entities
};

// ❌ WRONG - No type annotations
export const getTasks = async (_args, context) => {
  // context.entities will be undefined!
};
```

**Step 3: Verify Auth Check**

```typescript
// FIRST line of every operation:
if (!context.user) throw new HttpError(401);
```

**Step 4: Check Server Console**

```bash
# In terminal running wasp start, look for:
# - Import errors
# - Prisma errors
# - HttpError stack traces
```

**Step 5: Restart After Changes**

If you modified main.wasp:

```bash
# Stop wasp, then:
wasp start
```

### Solutions by Symptom

**"Cannot read property 'Task' of undefined"**

- Cause: Missing type annotations or entities in main.wasp
- Fix: Add type `GetTasks<Args, Return>` and `entities: [Task]`

**"Operation not found on client"**

- Cause: Not exported from operations.ts or wrong import in main.wasp
- Fix: Verify `export const getTasks` and `@src/` prefix

**"Query doesn't refetch after action"**

- Cause: Query and action don't share same entities
- Fix: Add same `entities: [Task]` to both

---

## Auth Not Working

### Symptom

- Login redirect loop
- `user.email` is undefined
- User logged in but operations fail 401
- Signup creates duplicate users

### Diagnostic Steps

**Step 1: Verify main.wasp Auth Block**

```wasp
app leanAiCoach {
  wasp: {
    version: "^0.18.0"
  },
  auth: {
    userEntity: User,
    methods: {
      email: {
        // Email auth config
      }
    },
    onAuthFailedRedirectTo: "/login"
  }
}
```

**Step 2: Check .env.server for OAuth Keys**

```bash
cat app/.env.server
# Should contain:
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
```

**Step 3: Check Server Console for Email Links**

For email auth in development:

```bash
# Look for console output like:
# Dummy email sent to: user@example.com
# Link: http://localhost:3000/auth/email/verify?token=...
```

**Step 4: Use Correct Auth Helpers**

```typescript
import { useAuth, getEmail, getUsername } from "wasp/client/auth";

// ✅ CORRECT
const { data: user } = useAuth();
const email = getEmail(user); // string | null
const username = getUsername(user);

// ❌ WRONG
const email = user.email; // UNDEFINED! Not on User model
```

**Step 5: Check User Model Relations**

```prisma
model User {
  id String @id @default(uuid())
  // Auth fields NOT here (managed by Wasp)
  // Your custom fields:
  displayName String?
  organizations OrganizationMember[]
}
```

**Step 6: Clear Cookies + Fresh Login**

```bash
# In browser:
# 1. Open DevTools (F12)
# 2. Application tab → Cookies → Clear all
# 3. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
# 4. Try login again
```

### Solutions by Symptom

**"`user.email` is undefined"**

- Cause: Email field not on User model
- Fix: Use `getEmail(user)` helper or add email to User model + userSignupFields

**"Login redirect loop"**

- Cause: Auth middleware failing, check onAuthFailedRedirectTo
- Fix: Verify route exists and user has permission

**"401 Unauthorized in operations"**

- Cause: Auth check failing or cookie not sent
- Fix: Verify `if (!context.user)` check, clear cookies

---

## Database Issues

### Symptom

- Prisma errors during queries
- Migration conflicts
- Types don't match schema
- Prisma Studio shows wrong data
- Schema changes not reflected

### Diagnostic Steps

**Step 1: After Schema Changes - ALWAYS Migrate**

```bash
cd app
wasp db migrate-dev "Describe your changes"
```

**Step 2: Check PostgreSQL is Running**

```bash
# Start DB only:
wasp start db

# Or check if DB is accessible:
psql $DATABASE_URL
```

**Step 3: Check DATABASE_URL in .env.server**

```bash
cat app/.env.server
# Should contain:
# DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
```

**Step 4: Check Migration Conflicts**

**Preferred:** Use `wasp-migration-helper` agent to handle conflicts automatically.

**Manual approach** (if needed):

```bash
ls app/migrations/
# Look for failed migrations or conflicts

# If conflicts:
# 1. Backup current schema
# 2. Resolve conflicts manually
# 3. Create new migration
wasp db migrate-dev "Resolve conflicts"
```

**Step 5: Prisma Studio Stale - Restart Wasp**

If Prisma Studio shows old data:

```bash
# Stop wasp, then:
wasp start
wasp db studio
```

**Step 6: Nuclear Option - Reset DB (Dev Only!)**

⚠️ **WARNING: Deletes ALL data!**

```bash
cd app
wasp db reset
wasp db migrate-dev "Fresh start"
```

### Solutions by Error Type

**"Migration failed"**

- Cause: Schema changes conflict with existing data
- Fix: Use `wasp-migration-helper` agent (handles backup, conflict resolution, migration)

**"Prisma client out of sync"**

- Cause: Forgot to restart after migration
- Fix: Restart `wasp start`

**"Database connection refused"**

- Cause: PostgreSQL not running or wrong DATABASE_URL
- Fix: Check `wasp start db` and .env.server

**"Non-interactive migration prompt error"**

**Symptom:**

```
Error: Prisma Migrate has detected that the environment is non-interactive
```

**Cause:** Running `wasp db migrate-dev` without `--name` flag in Claude Code

**Fix:**

```bash
# ❌ WRONG - Requires interactive input (fails in Claude Code)
wasp db migrate-dev

# ✅ CORRECT - Non-interactive mode
wasp db migrate-dev --name "Description of change"
```

**Why:** Wasp prompts for migration name interactively. Claude Code bash sessions have no TTY/stdin, causing the prompt to fail.

**Rule:** ALWAYS use `--name` flag when running migrations in Claude Code, CI/CD, or any non-interactive context.

---

## Build Errors

### Symptom

- `wasp build` fails
- Client importing server code
- ShadCN component import errors
- Vite build errors
- TypeScript compilation errors in build

### Diagnostic Steps

**Step 1: Check Client/Server Separation**

```typescript
// ❌ WRONG - Client importing server
import { PrismaClient } from "@prisma/client"; // In React component!
import { someHelper } from "@src/server/helpers"; // In client code!

// ✅ CORRECT - Use operations
import { useQuery, getTasks } from "wasp/client/operations";
```

**Step 2: Verify ShadCN Version**

```bash
# Only use v2.3.0!
npx shadcn@2.3.0 add button

# After install, fix import:
# Change: "s/lib/utils"
# To: "../../lib/utils"
```

**Step 3: Check Dependencies**

```bash
cd app
npm install
```

**Step 4: Clean Wasp Cache**

```bash
wasp clean
wasp build
```

**Step 5: Check TypeScript Errors**

```bash
cd app
npx tsc --noEmit
# Fix all errors before building
```

### Solutions by Build Error

**"Cannot import server module in client"**

- Cause: Importing from `app/src/server/` in client code
- Fix: Use Wasp operations instead of direct imports

**"ShadCN import error"**

- Cause: Wrong import path or version > 2.3.0
- Fix: Use v2.3.0, fix import to `"../../lib/utils"`

**"Vite build failed"**

- Cause: TypeScript errors, missing dependencies, or .wasp/ corrupted
- Fix: Run `npx tsc --noEmit`, `npm install`, or `wasp clean`

**"wasp-bin: npm: streamingProcess: chdir: invalid argument (Bad file descriptor)"**

- **Symptom**: Server fails to start with file descriptor error during npm install phase
- **Common Context**: After system updates, Node version changes, or corrupted .wasp/ cache
- **Cause**: Corrupted Wasp cache or stale build artifacts preventing npm from running
- **Solution**: Complete clean + React 18 fix + restart

```bash
# 1. Kill all processes
pkill -9 -f "wasp|node"

# 2. Full clean (removes .wasp/ and node_modules/)
cd app
wasp clean

# 3. Apply React 18 fix (required after wasp clean)
cd ..
./scripts/fix-react-version.sh

# 4. Fresh start
./scripts/safe-start.sh

# Result: Server starts successfully on correct ports
```

**Why This Works**:

- `wasp clean` removes corrupted .wasp/ cache and node_modules/
- React 18 fix prevents blank page issue after clean
- Fresh start regenerates all build artifacts cleanly
- Multi-worktree isolation prevents cross-contamination

**Verified Solution**: Tested with Node v22.20.0 on macOS (Darwin 25.0.0) with Wasp 0.18.0 in Dev1 worktree. Complete resolution in ~5 minutes.

**Prevention**: If encountering repeatedly, ensure Node version stability (avoid frequent upgrades during active development). Official Wasp docs require Node >= 22.12.

---

## Types Not Updating

### Symptom

- Stale TypeScript types
- IDE shows old types
- Compilation uses old types
- New fields not recognized

### Diagnostic Steps

**Step 1: ALWAYS Restart After These Changes**

- schema.prisma modifications
- main.wasp modifications
- Database migrations
- Adding/removing operations

```bash
# Stop wasp (Ctrl+C), then:
wasp start
```

**Step 2: If Still Stale - Clean and Reinstall**

```bash
wasp clean
rm -rf node_modules .wasp
npm install
wasp start
```

**Step 3: Check IDE TypeScript Version**

```bash
# In VSCode: Cmd+Shift+P → "TypeScript: Select TypeScript Version"
# Choose "Use Workspace Version"
```

**Step 4: Restart IDE**

Sometimes IDE caches types:

- VSCode: Reload Window (Cmd+Shift+P → "Reload Window")
- Cursor: Same as VSCode

### Prevention

**Preferred workflow:** Use `wasp-migration-helper` agent for schema changes (handles all steps automatically).

**Manual workflow** (for reference):

1. Edit schema.prisma or main.wasp
2. Run migration (if schema change)
3. **ALWAYS restart wasp**
4. Verify types in IDE before continuing

---

## Page Not Rendering

### Symptom

- Blank white page
- No errors in console
- Routes defined but not rendering
- Component imported but not displayed

### Diagnostic Steps

**Step 1: Check `<Outlet />` in App.tsx**

```typescript
// App.tsx or RootLayout.tsx
import { Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div>
      <Navbar />
      <Outlet />  {/* ← REQUIRED for nested routes! */}
    </div>
  )
}
```

**Step 2: Route Defined in main.wasp?**

```wasp
route TasksRoute { path: "/tasks", to: TasksPage }
page TasksPage {
  component: import { TasksPage } from "@src/tasks/TasksPage"
}
```

**Step 3: Component Import Uses `@src/`?**

```wasp
// ✅ CORRECT in main.wasp
component: import { TasksPage } from "@src/tasks/TasksPage"

// ❌ WRONG
component: import { TasksPage } from "src/tasks/TasksPage"  // Missing @
```

**Step 4: Check Browser Console**

```bash
# Open DevTools (F12) → Console tab
# Look for:
# - Import errors
# - React errors
# - 404 on JS bundles
```

**Step 5: Check Network Tab**

```bash
# DevTools → Network tab
# Verify:
# - HTML loaded (200)
# - JS bundles loaded (200)
# - No 404 errors
```

### Solutions by Symptom

**"Blank page, no errors"**

- Cause: Missing `<Outlet />` in parent component
- Fix: Add `<Outlet />` where child routes should render

**"Route not found (404)"**

- Cause: Route not defined in main.wasp
- Fix: Add route block to main.wasp

**"Component not rendering"**

- Cause: Wrong import path in main.wasp
- Fix: Use `@src/` prefix

---

## Query/Action Not Refetching

### Symptom

- Create action succeeds but list doesn't update
- Update doesn't reflect in UI
- Manual refresh shows new data
- Cache not invalidating

### Diagnostic Steps

**Step 1: Check Same Entities in Both**

```wasp
query getTasks {
  fn: import { getTasks } from "@src/server/a3/operations",
  entities: [Task]  // ← Must match!
}

action createTask {
  fn: import { createTask } from "@src/server/a3/operations",
  entities: [Task]  // ← Same as query!
}
```

**Step 2: Verify Wasp Auto-Invalidates**

If entities match, Wasp auto-invalidates queries when action completes.

**Step 3: Manual Invalidation (If Needed)**

```typescript
import { invalidateQuery } from "wasp/client/operations";
import { getTasks } from "wasp/client/operations";

await createTask({ description: "New task" });
invalidateQuery(getTasks); // Manual invalidation
```

**Step 4: Check useAction Not Blocking**

```typescript
// ❌ WRONG - useAction blocks auto-invalidation
const createTaskFn = useAction(createTask);
await createTaskFn({ description: "New" });

// ✅ CORRECT - Direct call allows auto-invalidation
await createTask({ description: "New" });
```

### Solutions

**"List doesn't update after create"**

- Cause: Query and action have different entities
- Fix: Add same `entities: [Task]` to both

**"Update doesn't reflect"**

- Cause: Using useAction without optimistic updates
- Fix: Use direct `await action()` call instead

---

## ComboBox "Create New" Button Disappears

### Symptom

- "Create New" button appears sometimes, disappears other times
- Button visibility is inconsistent/unstable
- Button flashes briefly then vanishes
- Using ComboBox with search + "create new" functionality
- cmdk/ShadCN Command component

### Root Cause

**Double filtering conflict:**

- Your code: Manual filtering with `filterItems(items, search)`
- cmdk: Automatic filtering on `CommandItem` components
- These conflict → button disappears asynchronously (race condition)

**Why it happens:**

- cmdk's automatic filter hides items that don't match search term
- Your "Create New" button doesn't match search term (it's literally "+ Create")
- cmdk filters it out even though React conditional says it should render
- Timing varies → intermittent behavior

### Diagnostic Steps

**Step 1: Check Component Structure**

Look for this pattern:

```typescript
<Command>  {/* ❌ Missing shouldFilter={false} */}
  <CommandInput value={search} onValueChange={setSearch} />
  <CommandList>
    {/* Manually filtered items */}
    {filteredItems.map(...)}

    {/* Create button - getting filtered out! */}
    {canCreate && isUnique && (
      <CommandItem onSelect={handleCreate}>  {/* ❌ Missing forceMount */}
        <Plus /> Create "{search}"
      </CommandItem>
    )}
  </CommandList>
</Command>
```

**Step 2: Reproduce the Issue**

1. Open combobox with "create new" functionality
2. Type unique search term (e.g., "ZZZ Test")
3. Watch "+ Create" button
4. Does it appear then disappear? → cmdk filtering conflict

**Step 3: Check Browser Console**

```javascript
console.log("🔍 ComboboxField Debug:", {
  search: search.trim(),
  canCreate,
  isSearchTermUnique,
  shouldShowCreate: canCreate && isSearchTermUnique,
});
```

If logs show `shouldShowCreate: true` but button not visible → cmdk filtering it out

### Solutions

**Apply TWO fixes (both required):**

**Fix #1: Disable Automatic Filtering**

```typescript
// BEFORE:
<Command>

// AFTER:
<Command shouldFilter={false}>  {/* ✅ Disable cmdk automatic filtering */}
```

**Why:** Gives full control to your manual `filterItems()` function, prevents cmdk from interfering.

**Fix #2: Force Mount Create Button**

```typescript
// BEFORE:
<CommandItem onSelect={handleCreate}>

// AFTER:
<CommandItem
  forceMount  {/* ✅ Force render regardless of filter */}
  onSelect={handleCreate}
>
```

**Why:** Ensures button always renders when React conditional is true, prevents asynchronous filtering from hiding it.

**Complete Fixed Example:**

```typescript
<Command shouldFilter={false}>  {/* ✅ FIX #1 */}
  <CommandInput
    placeholder={t('common.search')}
    value={search}
    onValueChange={setSearch}
  />
  <CommandList>
    <CommandEmpty>{t('common.noResults')}</CommandEmpty>

    {/* Existing Items - Manually Filtered */}
    {filteredItems.length > 0 && (
      <CommandGroup>
        {filteredItems.map((item) => (
          <CommandItem key={item.id} onSelect={() => handleSelect(item.id)}>
            <Check className={cn('mr-2 h-4 w-4', value === item.id ? 'opacity-100' : 'opacity-0')} />
            {item.name}
          </CommandItem>
        ))}
      </CommandGroup>
    )}

    {/* Create New Button - Force Mount */}
    {canCreate && isSearchTermUnique && (
      <CommandGroup>
        <CommandItem
          forceMount  {/* ✅ FIX #2 */}
          onSelect={handleCreate}
          disabled={isCreating}
          className="text-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          {isCreating ? t('common.creating') : `${t('common.create')} "${search.trim()}"`}
        </CommandItem>
      </CommandGroup>
    )}
  </CommandList>
</Command>
```

### Testing the Fix

1. Apply both fixes
2. Open combobox
3. Type unique name (e.g., "Utrecht Office")
4. "+ Create" button should appear **immediately and consistently**
5. Test multiple search terms
6. Verify no intermittent disappearing

**Expected:** Button visible 100% of the time when `canCreate && isSearchTermUnique === true`

### Related Resources

- **Complete Pattern:** `.claude/templates/combobox-creatable-pattern.md`
- **Quick Reference:** `app/CLAUDE.md` → ShadCN UI Setup → Creatable ComboBox Pattern
- **Live Example:** `app/src/components/a3/editor/sections/project-info/ComboboxField.tsx`

### Prevention

**ALWAYS use this pattern for comboboxes with "Create New" functionality:**

- Add `shouldFilter={false}` to `<Command>`
- Add `forceMount` to create button `<CommandItem>`
- No exceptions!

**Why critical:** Without these fixes, users experience frustrating UX where create button randomly disappears.

---

## Performance Issues

### Symptom

- Slow query response
- Many database queries (N+1 problem)
- Large list renders slowly
- Re-renders on every state change

### Diagnostic Steps

**Step 1: Check for N+1 Queries**

```typescript
// ❌ BAD - N+1 query problem
const tasks = await context.entities.Task.findMany();
for (const task of tasks) {
  const user = await context.entities.User.findUnique({
    where: { id: task.userId },
  });
}

// ✅ GOOD - Single query with include
const tasks = await context.entities.Task.findMany({
  include: { user: true },
});
```

**Step 2: Check for Pagination**

```typescript
// ❌ BAD - Loading all records
const tasks = await context.entities.Task.findMany();

// ✅ GOOD - Paginated
const tasks = await context.entities.Task.findMany({
  skip: page * pageSize,
  take: pageSize,
  orderBy: { createdAt: "desc" },
});
```

**Step 3: Check for Unnecessary Re-renders**

```typescript
// Use React DevTools Profiler to identify:
// - Components re-rendering on every state change
// - Expensive computations running unnecessarily

// Fix with:
import { memo, useMemo } from 'react'

const ExpensiveComponent = memo(({ data }) => {
  const processed = useMemo(() => expensiveCalc(data), [data])
  return <div>{processed}</div>
})
```

### Solutions

**"Slow queries"**

- Use Prisma `include` for relations (avoid N+1)
- Add database indexes for commonly queried fields
- Use `select` to fetch only needed fields

**"Large lists slow"**

- Implement pagination (skip/take)
- Use virtual scrolling for very long lists
- Lazy load off-screen items

**"Too many re-renders"**

- Use `React.memo` for expensive components
- Use `useMemo` for expensive calculations
- Use `useCallback` for stable function references

---

## Deployment Issues

### Symptom

- Deploy fails on Fly.io
- Migrations don't run
- Environment variables missing
- Build passes locally but fails on deploy

### Diagnostic Steps

**Step 1: Check Secrets Set**

```bash
# Set server secrets via Wasp CLI:
wasp deploy fly cmd --context server secrets set OPENAI_API_KEY="sk-..."
wasp deploy fly cmd --context server secrets set DATABASE_URL="postgres://..."

# Verify secrets:
wasp deploy fly cmd --context server secrets list
```

**Step 2: Check Migrations Ran**

```bash
# Check fly.io logs:
wasp deploy fly cmd --context server logs

# Look for:
# - Migration output
# - Prisma errors
# - Connection errors
```

**Step 3: Verify Build Passed CI**

```bash
# Check GitHub Actions:
# - All checks green?
# - ESLint passing?
# - TypeScript compiling?
```

**Step 4: Test Production Build Locally**

```bash
wasp build
cd .wasp/build
npm install
DATABASE_URL="..." npm run start
```

### Solutions

**"Missing environment variables"**

- Set via `wasp deploy fly cmd --context server secrets set`
- Verify with `secrets list`

**"Migrations failed"**

- Check DATABASE_URL is correct
- Check Prisma schema is valid
- Use `wasp-migration-helper` agent to diagnose and fix migration issues

**"Build fails on deploy but works locally"**

- Check TypeScript `strict: true` issues
- Check for dev dependencies used in production
- Check for missing environment variables

---

## Temporary Files Management

### Symptom

- `.tmp/` directory filling up with old scripts
- Temporary Python/bash/JS scripts scattered in project
- Worktree polluted with one-time-use files
- Can't find or manage temporary files

### Understanding `.tmp/` Directory

The `.tmp/` directory is specifically for **Claude Code-generated temporary files**:

```
.tmp/
├── README.md      # Human documentation (NOT removed)
├── CLAUDE.md      # Claude instructions (NOT removed)
├── scripts/       # Temporary Python, bash, Node.js scripts
├── tests/         # Temporary test files
└── data/          # Temporary data files
```

**Auto-cleanup policy:** Files older than 7 days are automatically removed by pre-commit hook.

### Diagnostic Steps

**Step 1: List Current Temporary Files**

```bash
npm run list:temp
```

Shows all temporary files with size and modification date.

**Step 2: Check Disk Usage**

```bash
du -sh .tmp/
```

**Step 3: Identify Misplaced Temp Files**

Pre-commit hook warns about temp files outside `.tmp/`:

```bash
git status
# Look for files matching patterns:
# - temp_*.py, temp_*.sh, temp_*.js
# - script_*.tmp.*
# - _claude_temp_*
# - helper_temp_*
```

**Step 4: Check Auto-Cleanup Status**

Verify pre-commit hook is active:

```bash
cat .husky/_pre-commit.sh
# Should contain "Temporary Files Cleanup" section
```

### Cleanup Commands

**Remove files older than 7 days (SAFE):**

```bash
npm run clean:temp:old
```

**Remove ALL temporary files:**

```bash
npm run clean:temp
```

**Remove all + verify structure:**

```bash
npm run clean:temp:all
```

**Interactive cleanup with Claude:**

```bash
# In Claude Code:
/cleanup-temp
```

### Solutions by Symptom

**"Temporary files in wrong location"**

- Cause: Claude Code created files outside `.tmp/`
- Fix: Move to `.tmp/scripts/` or `.tmp/tests/`, or delete if no longer needed
- Prevention: See `.tmp/CLAUDE.md` for instructions to guide Claude

**"Old files not auto-cleaned"**

- Cause: Pre-commit hook not running or files < 7 days old
- Fix: Run `npm run clean:temp:old` manually
- Check: Verify `.husky/_pre-commit.sh` has cleanup section

**"Lost important temp file"**

- Cause: Auto-cleanup removed file older than 7 days
- Fix: If still needed, it wasn't temporary - recreate in appropriate location
- Prevention: Move important files outside `.tmp/` within 7 days

**"Can't find temp files"**

- Cause: Don't know where Claude created files
- Fix: Run `npm run list:temp` to see all temp files
- Check: Also search for patterns: `find . -name "temp_*" -o -name "*_temp_*"`

### Best Practices

**DO:**

- Create temporary scripts in `.tmp/scripts/`
- Create temporary tests in `.tmp/tests/`
- Create temporary data in `.tmp/data/`
- Run `/cleanup-temp` periodically
- Move important files out within 7 days

**DON'T:**

- Create temp files in project root
- Create temp files in `app/src/`
- Ignore pre-commit warnings about misplaced files
- Assume temp files persist indefinitely

### Manual Cleanup

**Find all temporary files:**

```bash
# In .tmp/
find .tmp -type f ! -name 'README.md' ! -name 'CLAUDE.md' ! -name '.gitkeep'

# Misplaced in project:
git ls-files | grep -E 'temp_|_temp_|script_.*\.tmp'
```

**Remove specific file:**

```bash
rm .tmp/scripts/old_migration_script.py
```

**Remove all in subdirectory:**

```bash
# Remove all scripts
find .tmp/scripts -type f ! -name '.gitkeep' -delete

# Remove all data files
find .tmp/data -type f ! -name '.gitkeep' -delete
```

### Prevention

**Guide Claude Code:**

- `.tmp/CLAUDE.md` contains MANDATORY instructions for Claude
- Claude Code auto-loads these instructions when creating files
- Update instructions if Claude creates files in wrong location

**Pre-commit Hook:**

- Automatically runs cleanup on every commit
- Warns about misplaced temp files
- Non-blocking - won't fail commits

**Regular Maintenance:**

```bash
# Weekly: Check temp file status
npm run list:temp

# Monthly: Full cleanup
npm run clean:temp:all
```

**See also:**

- `.tmp/README.md` - Usage guidelines for developers
- `.tmp/CLAUDE.md` - Instructions for Claude Code
- `/cleanup-temp` - Interactive cleanup command

---

## 🆘 Nuclear Option (Development Only!)

When nothing else works:

```bash
# ⚠️ WARNING: Deletes node_modules, .wasp cache, and database!
# Backup important data first!

wasp clean && \
rm -rf node_modules .wasp && \
npm install && \
wasp db reset && \
wasp db migrate-dev "Fresh start" && \
wasp start
```

If **still broken**:

1. Check Wasp Discord: https://discord.gg/rzdnErX
2. Create minimal reproduction
3. File GitHub issue: https://github.com/wasp-lang/wasp

---

## Prevention Best Practices

### Always Restart After:

- [ ] schema.prisma changes
- [ ] main.wasp changes
- [ ] Database migrations
- [ ] Adding/removing operations

### Before Committing:

- [ ] Run `wasp test client run`
- [ ] Run `npx tsc --noEmit`
- [ ] Run `npx eslint . --fix`
- [ ] Verify app runs without errors

### Regular Maintenance:

- [ ] Update dependencies monthly
- [ ] Review logs for warnings
- [ ] Monitor database size
- [ ] Check performance metrics

---

**See also:**

- CLAUDE.md - Quick reference for common issues
- .claude/checklists/DO_NOT_TOUCH.md - Recovery procedures for broken state
- docs/CI-CD-SETUP.md - CI/CD pipeline troubleshooting
