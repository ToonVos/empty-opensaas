---
name: troubleshooting-guide
description: Complete diagnostic procedures for resolving Wasp development issues. Use when encountering errors, debugging problems, or when things aren't working. Includes systematic procedures for import errors, auth issues, database problems, and type errors.
triggers:
  [
    "error",
    "not working",
    "fails",
    "debug",
    "broken",
    "fix",
    "troubleshoot",
    "import error",
    "auth error",
    "database error",
    "cannot find module",
  ]
version: 1.0
last_updated: 2025-10-18
allowed_tools: [Read, Bash, Edit]
---

# Troubleshooting Guide Skill

## Quick Reference

**When to use this skill:**

- Encountering error messages
- Something isn't working as expected
- Types not updating after changes
- Build failures
- Auth not working
- Database sync issues
- Performance problems

## Error Index by Type

Quick navigation to diagnostic procedures:

1. **Import/Type Errors** → Section 1

   - Cannot find module 'wasp/...'
   - Cannot find module '@src/...'
   - Module has no exported member
   - Type errors after schema change

2. **Operation Not Working** → Section 2

   - Operation undefined
   - context.entities undefined
   - Auto-invalidation not working
   - Type errors on parameters

3. **Auth Not Working** → Section 3

   - Login redirect loop
   - user.email is undefined
   - 401 errors in operations
   - Signup creating duplicate users

4. **Database Issues** → Section 4

   - Migration errors
   - Schema sync issues
   - Connection errors
   - Prisma Studio shows wrong data

5. **Build Errors** → Section 5

   - wasp build fails
   - Client importing server code
   - ShadCN component import errors
   - Vite build errors

6. **Types Not Updating** → Section 6

   - Stale TypeScript types
   - IDE shows old types
   - New fields not recognized

7. **Page Not Rendering** → Section 7

   - Blank white page
   - Routes not rendering
   - Missing Outlet

8. **Performance Issues** → Section 8

   - Slow queries
   - N+1 query problem
   - Too many re-renders

9. **Deployment Issues** → Section 9
   - Deploy fails on Fly.io
   - Migrations don't run
   - Environment variables missing

## Systematic Diagnostic Approach

### Step 1: Identify Error Type

Use this decision tree to classify the error:

```
Error message contains "Cannot find module"?
  ├─ YES → Section 1: Import/Type Errors
  └─ NO ↓

Error about context.entities or operation not found?
  ├─ YES → Section 2: Operation Not Working
  └─ NO ↓

Error about user, email, or 401 Unauthorized?
  ├─ YES → Section 3: Auth Not Working
  └─ NO ↓

Error about Prisma, database, or migration?
  ├─ YES → Section 4: Database Issues
  └─ NO ↓

Error during wasp build?
  ├─ YES → Section 5: Build Errors
  └─ NO ↓

Types are stale or old?
  ├─ YES → Section 6: Types Not Updating
  └─ NO ↓

Page is blank or not rendering?
  ├─ YES → Section 7: Page Not Rendering
  └─ NO ↓

App is slow or unresponsive?
  ├─ YES → Section 8: Performance Issues
  └─ NO → Section 9: Deployment Issues
```

### Step 2: Apply Diagnostic Procedure

Follow the procedure in the identified section below.

---

## Section 1: Import/Type Errors

### Common Error Messages

- `Cannot find module 'wasp/...'`
- `Cannot find module '@src/...'`
- `Module has no exported member 'X'`
- TypeScript compilation errors
- Stale types not updating

### Diagnostic Steps

#### Step 1: Verify Import Syntax

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

#### Step 2: Check main.wasp Configuration

```wasp
// Make sure entities are listed!
query getTasks {
  fn: import { getTasks } from "@src/server/a3/operations",
  entities: [Task]  // ← REQUIRED for context.entities access
}
```

#### Step 3: Restart Wasp

Types are only regenerated when Wasp restarts:

```bash
# Stop wasp (Ctrl+C), then safe-start (multi-worktree safe):
../scripts/safe-start.sh
```

#### Step 4: Clean and Rebuild

If types still wrong:

```bash
wasp clean
rm -rf node_modules .wasp
npm install
../scripts/safe-start.sh  # Multi-worktree safe
```

#### Step 5: Check You're in app/ Directory

```bash
pwd
# Should show: /path/to/lean-ai-coach-tl/app

# If not:
cd app
../scripts/safe-start.sh  # Multi-worktree safe
```

### Solutions by Error Type

**"Cannot find module 'wasp/...'"**

- Cause: Wasp not running or using `@wasp` instead of `wasp`
- Fix: Remove `@` prefix, restart `../scripts/safe-start.sh` (multi-worktree safe)

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

## Section 2: Operation Not Working

### Common Symptoms

- Operation function not accessible in client
- `context.entities.Task` is undefined
- Operation executes but no auto-refetch
- Type errors on operation parameters

### Diagnostic Steps

#### Step 1: Verify main.wasp Configuration

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

#### Step 2: Check Type Annotations

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

#### Step 3: Verify Auth Check

```typescript
// FIRST line of every operation:
if (!context.user) throw new HttpError(401);
```

#### Step 4: Check Server Console

Look in terminal running `wasp start` for:

- Import errors
- Prisma errors
- HttpError stack traces

#### Step 5: Restart After Changes

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

## Section 3: Auth Not Working

### Common Symptoms

- Login redirect loop
- `user.email` is undefined
- User logged in but operations fail 401
- Signup creates duplicate users

### Diagnostic Steps

#### Step 1: Verify main.wasp Auth Block

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

#### Step 2: Check .env.server for OAuth Keys

```bash
cat app/.env.server
# Should contain:
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
```

#### Step 3: Check Server Console for Email Links

For email auth in development:

```bash
# Look for console output like:
# Dummy email sent to: user@example.com
# Link: http://localhost:3000/auth/email/verify?token=...
```

#### Step 4: Use Correct Auth Helpers

```typescript
import { useAuth, getEmail, getUsername } from "wasp/client/auth";

// ✅ CORRECT
const { data: user } = useAuth();
const email = getEmail(user); // string | null
const username = getUsername(user);

// ❌ WRONG
const email = user.email; // UNDEFINED! Not on User model
```

#### Step 5: Check User Model Relations

```prisma
model User {
  id String @id @default(uuid())
  // Auth fields NOT here (managed by Wasp)
  // Your custom fields:
  displayName String?
  organizations OrganizationMember[]
}
```

#### Step 6: Clear Cookies + Fresh Login

In browser:

1. Open DevTools (F12)
2. Application tab → Cookies → Clear all
3. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
4. Try login again

### Solutions by Symptom

**"user.email is undefined"**

- Cause: Email field not on User model
- Fix: Use `getEmail(user)` helper or add email to User model + userSignupFields

**"Login redirect loop"**

- Cause: Auth middleware failing, check onAuthFailedRedirectTo
- Fix: Verify route exists and user has permission

**"401 Unauthorized in operations"**

- Cause: Auth check failing or cookie not sent
- Fix: Verify `if (!context.user)` check, clear cookies

---

## Section 4: Database Issues

### Common Symptoms

- Prisma errors during queries
- Migration conflicts
- Types don't match schema
- Prisma Studio shows wrong data
- Schema changes not reflected

### Diagnostic Steps

#### Step 1: After Schema Changes - ALWAYS Migrate

```bash
cd app
wasp db migrate-dev "Describe your changes"
```

#### Step 2: Check PostgreSQL is Running

```bash
# Start DB only:
wasp start db

# Or check if DB is accessible:
psql $DATABASE_URL
```

#### Step 3: Check DATABASE_URL in .env.server

```bash
cat app/.env.server
# Should contain:
# DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
```

#### Step 4: Check Migration Conflicts

```bash
ls app/migrations/
# Look for failed migrations or conflicts

# If conflicts:
# 1. Backup current schema
# 2. Resolve conflicts manually
# 3. Create new migration
wasp db migrate-dev "Resolve conflicts"
```

#### Step 5: Prisma Studio Stale - Restart Wasp

If Prisma Studio shows old data:

```bash
# Stop wasp, then safe-start (multi-worktree safe):
../scripts/safe-start.sh
wasp db studio
```

#### Step 6: Nuclear Option - Reset DB (Dev Only!)

**WARNING: Deletes ALL data!**

```bash
cd app
wasp db reset
wasp db migrate-dev "Fresh start"
```

### Solutions by Error Type

**"Migration failed"**

- Cause: Schema changes conflict with existing data
- Fix: Backup data, resolve conflicts, create migration

**"Prisma client out of sync"**

- Cause: Forgot to restart after migration
- Fix: Restart `../scripts/safe-start.sh` (multi-worktree safe)

**"Database connection refused"**

- Cause: PostgreSQL not running or wrong DATABASE_URL
- Fix: Check `wasp start db` and .env.server

---

## Section 5: Build Errors

### Common Symptoms

- `wasp build` fails
- Client importing server code
- ShadCN component import errors
- Vite build errors
- TypeScript compilation errors in build

### Diagnostic Steps

#### Step 1: Check Client/Server Separation

```typescript
// ❌ WRONG - Client importing server
import { PrismaClient } from "@prisma/client"; // In React component!
import { someHelper } from "@src/server/helpers"; // In client code!

// ✅ CORRECT - Use operations
import { useQuery, getTasks } from "wasp/client/operations";
```

#### Step 2: Verify ShadCN Version

```bash
# Only use v2.3.0!
npx shadcn@2.3.0 add button

# After install, fix import:
# Change: "s/lib/utils"
# To: "../../lib/utils"
```

#### Step 3: Check Dependencies

```bash
cd app
npm install
```

#### Step 4: Clean Wasp Cache

```bash
wasp clean
wasp build
```

#### Step 5: Check TypeScript Errors

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

---

## Section 6: Types Not Updating

### Common Symptoms

- Stale TypeScript types
- IDE shows old types
- Compilation uses old types
- New fields not recognized

### Diagnostic Steps

#### Step 1: ALWAYS Restart After These Changes

- schema.prisma modifications
- main.wasp modifications
- Database migrations
- Adding/removing operations

```bash
# Stop wasp (Ctrl+C), then safe-start (multi-worktree safe):
../scripts/safe-start.sh
```

#### Step 2: If Still Stale - Clean and Reinstall

```bash
wasp clean
rm -rf node_modules .wasp
npm install
../scripts/safe-start.sh  # Multi-worktree safe
```

#### Step 3: Check IDE TypeScript Version

```bash
# In VSCode: Cmd+Shift+P → "TypeScript: Select TypeScript Version"
# Choose "Use Workspace Version"
```

#### Step 4: Restart IDE

Sometimes IDE caches types:

- VSCode: Reload Window (Cmd+Shift+P → "Reload Window")
- Cursor: Same as VSCode

### Prevention

Create workflow habit:

1. Edit schema.prisma or main.wasp
2. Run migration (if schema change)
3. **ALWAYS restart wasp**
4. Verify types in IDE before continuing

---

## Section 7: Page Not Rendering

### Common Symptoms

- Blank white page
- No errors in console
- Routes defined but not rendering
- Component imported but not displayed

### Diagnostic Steps

#### Step 1: Check `<Outlet />` in App.tsx

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

#### Step 2: Route Defined in main.wasp?

```wasp
route TasksRoute { path: "/tasks", to: TasksPage }
page TasksPage {
  component: import { TasksPage } from "@src/tasks/TasksPage"
}
```

#### Step 3: Component Import Uses `@src/`?

```wasp
// ✅ CORRECT in main.wasp
component: import { TasksPage } from "@src/tasks/TasksPage"

// ❌ WRONG
component: import { TasksPage } from "src/tasks/TasksPage"  // Missing @
```

#### Step 4: Check Browser Console

Open DevTools (F12) → Console tab

Look for:

- Import errors
- React errors
- 404 on JS bundles

#### Step 5: Check Network Tab

DevTools → Network tab

Verify:

- HTML loaded (200)
- JS bundles loaded (200)
- No 404 errors

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

## Section 8: Performance Issues

### Common Symptoms

- Slow query response
- Many database queries (N+1 problem)
- Large list renders slowly
- Re-renders on every state change

### Diagnostic Steps

#### Step 1: Check for N+1 Queries

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

#### Step 2: Check for Pagination

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

#### Step 3: Check for Unnecessary Re-renders

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

## Section 9: Deployment Issues

### Common Symptoms

- Deploy fails on Fly.io
- Migrations don't run
- Environment variables missing
- Build passes locally but fails on deploy

### Diagnostic Steps

#### Step 1: Check Secrets Set

```bash
# Set server secrets via Wasp CLI:
wasp deploy fly cmd --context server secrets set OPENAI_API_KEY="sk-..."
wasp deploy fly cmd --context server secrets set DATABASE_URL="postgres://..."

# Verify secrets:
wasp deploy fly cmd --context server secrets list
```

#### Step 2: Check Migrations Ran

```bash
# Check fly.io logs:
wasp deploy fly cmd --context server logs

# Look for:
# - Migration output
# - Prisma errors
# - Connection errors
```

#### Step 3: Verify Build Passed CI

Check GitHub Actions:

- All checks green?
- ESLint passing?
- TypeScript compiling?

#### Step 4: Test Production Build Locally

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
- Run migrations manually if needed

**"Build fails on deploy but works locally"**

- Check TypeScript `strict: true` issues
- Check for dev dependencies used in production
- Check for missing environment variables

---

## Nuclear Option (Development Only!)

When nothing else works:

```bash
# ⚠️ WARNING: Deletes node_modules, .wasp cache, and database!
# Backup important data first!

wasp clean && \
rm -rf node_modules .wasp && \
npm install && \
wasp db reset && \
wasp db migrate-dev "Fresh start" && \
../scripts/safe-start.sh  # Multi-worktree safe
```

If **still broken**:

1. Check Wasp Discord: https://discord.gg/rzdnErX
2. Create minimal reproduction
3. File GitHub issue: https://github.com/wasp-lang/wasp

---

## Common Error Messages

Quick lookup for exact error messages:

**"Cannot find module 'wasp/...'"**
→ Section 1, Step 1: Remove `@` prefix, restart wasp

**"Cannot find module '@src/...'"**
→ Section 1, Step 1: Use relative path in .ts/.tsx files

**"Module has no exported member 'TaskStatus'"**
→ Section 1, Step 1: Import enum from `@prisma/client`

**"Property 'Task' does not exist on 'context.entities'"**
→ Section 2, Step 1: Add `entities: [Task]` to main.wasp

**"Cannot read property 'Task' of undefined"**
→ Section 2, Step 2: Add type annotations to operation

**"user.email is undefined"**
→ Section 3, Step 4: Use `getEmail(user)` helper

**"Migration failed"**
→ Section 4, Step 4: Resolve conflicts, create new migration

**"Prisma client out of sync"**
→ Section 4, Step 5: Restart wasp after migration

**"Cannot import server module in client"**
→ Section 5, Step 1: Use operations instead of direct imports

**"Cannot find module 's/lib/utils'"**
→ Section 5, Step 2: Fix ShadCN import to `"../../lib/utils"`

---

## Quick Fixes Checklist

Before opening an issue, try these fixes:

### Universal Fixes (Try First)

- [ ] Restart `../scripts/safe-start.sh` (multi-worktree safe)
- [ ] Check import paths (`wasp/` not `@wasp/`)
- [ ] Run `wasp clean`
- [ ] Verify entities in main.wasp
- [ ] Check .env.server file exists
- [ ] Clear browser cookies

### Import/Type Issues

- [ ] Use `wasp/` prefix (not `@wasp/`)
- [ ] Use relative paths in .ts/.tsx (not `@src/`)
- [ ] Import enums from `@prisma/client`
- [ ] Restart after schema/main.wasp changes

### Operation Issues

- [ ] Add type annotations: `GetQuery<Args, Return>`
- [ ] Add auth check: `if (!context.user) throw HttpError(401)`
- [ ] Add entities to main.wasp
- [ ] Restart after main.wasp changes

### Database Issues

- [ ] Run `wasp db migrate-dev` after schema changes
- [ ] Restart after migration
- [ ] Check DATABASE_URL in .env.server
- [ ] Verify PostgreSQL is running

### Build Issues

- [ ] Use ShadCN v2.3.0 only
- [ ] Fix ShadCN imports (`../../lib/utils`)
- [ ] Run `npx tsc --noEmit`
- [ ] Separate client/server code

### Auth Issues

- [ ] Use `getEmail(user)` helper
- [ ] Check for null before using auth fields
- [ ] Clear cookies and retry
- [ ] Verify auth block in main.wasp

---

## References

**Complete guide:** `/Users/toonvos/Projects/LEANAICOACH/lean-ai-coach-tl/docs/TROUBLESHOOTING-GUIDE.md`

**Related documentation:**

- CLAUDE.md - Quick reference
- app/CLAUDE.md - Wasp development patterns
- .claude/templates/error-handling-patterns.ts - Error patterns
- .claude/templates/operations-patterns.ts - Operation examples

**External resources:**

- Wasp Discord: https://discord.gg/rzdnErX
- Wasp Docs: https://wasp.sh/docs
- Wasp GitHub: https://github.com/wasp-lang/wasp
