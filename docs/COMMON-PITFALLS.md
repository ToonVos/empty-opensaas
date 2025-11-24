# Common Pitfalls & Anti-Patterns (Complete Guide)

**Quick Reference**: [CLAUDE.md#pitfalls](../CLAUDE.md#pitfalls)

**Skill**: `troubleshooting-guide` - Interactive diagnostic procedures

---

## Most Common Mistakes

### 1. Client Imports Server Code

**❌ WRONG:**

```typescript
// File: src/pages/DashboardPage.tsx (CLIENT-SIDE)
import { getTasks } from "../server/tasks/operations"; // ❌ ERROR!
import { prisma } from "wasp/server"; // ❌ ERROR!
```

**Error message:**

```
Module not found: Error: Can't resolve '../server/tasks/operations'
```

**Why wrong**: Wasp enforces client/server separation. Server code cannot run in browser.

**✅ CORRECT:**

```typescript
// File: src/pages/DashboardPage.tsx (CLIENT-SIDE)
import { useQuery } from 'wasp/client/operations'
import { getTasks } from 'wasp/client/operations' // ✅ Use Wasp operation

export function DashboardPage() {
  const { data: tasks } = useQuery(getTasks)
  return <div>{/* Render tasks */}</div>
}
```

**Solution**: Use Wasp operations (`wasp/client/operations`), never import server code directly.

---

### 2. Server Env Vars in Client

**❌ WRONG:**

```typescript
// File: src/pages/LandingPage.tsx (CLIENT-SIDE)
const apiKey = process.env.OPENAI_API_KEY; // ❌ undefined!
```

**Why wrong**: Server environment variables are NOT available in client code.

**✅ CORRECT:**

```typescript
// Server-side (operations.ts)
const apiKey = process.env.OPENAI_API_KEY; // ✅ Works

// Client-side (React components)
const publicUrl = import.meta.env.REACT_APP_PUBLIC_URL; // ✅ Works
```

**Solution**:

- Server: Use `process.env.VAR_NAME`
- Client: Use `import.meta.env.REACT_APP_VAR_NAME` (must prefix with `REACT_APP_`)

---

### 3. Missing `<Outlet />` in Layouts

**❌ WRONG:**

```typescript
// File: src/App.tsx
export function App({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <TopNavigation />
      {/* ❌ Missing <Outlet /> - child routes won't render! */}
    </div>
  )
}
```

**Why wrong**: React Router needs `<Outlet />` to render child routes.

**✅ CORRECT:**

```typescript
// File: src/App.tsx
import { Outlet } from 'react-router-dom'

export function App({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <TopNavigation />
      <Outlet /> {/* ✅ REQUIRED for child routes */}
    </div>
  )
}
```

**Solution**: Always include `<Outlet />` in layout components.

---

### 4. Using `@wasp/...` Imports

**❌ WRONG:**

```typescript
import { Task } from "@wasp/entities"; // ❌ ERROR!
import { getTasks } from "@wasp/client/operations"; // ❌ ERROR!
```

**Error message:**

```
Cannot find module '@wasp/entities'
```

**Why wrong**: Wasp uses `wasp/...` imports, NOT `@wasp/...`.

**✅ CORRECT:**

```typescript
import type { Task } from "wasp/entities"; // ✅ CORRECT
import { getTasks } from "wasp/client/operations"; // ✅ CORRECT
```

**Solution**: Use `wasp/...` (no `@` prefix).

---

### 5. Using `@src/...` in TypeScript Files

**❌ WRONG:**

```typescript
// File: src/components/TaskList.tsx
import { formatDate } from "@src/lib/utils"; // ❌ ERROR!
```

**Error message:**

```
Cannot find module '@src/lib/utils'
```

**Why wrong**: `@src/...` alias only works in `main.wasp`, not in TypeScript files.

**✅ CORRECT:**

```typescript
// File: src/components/TaskList.tsx
import { formatDate } from "../lib/utils"; // ✅ Use relative path
```

**Solution**: Use relative paths in `.ts/.tsx` files, `@src/...` only in `main.wasp`.

---

### 6. Enum Values from `wasp/entities`

**❌ WRONG:**

```typescript
import { UserRole } from "wasp/entities";

// ❌ undefined at runtime!
if (user.role === UserRole.ADMIN) {
  /* ... */
}
```

**Why wrong**: `wasp/entities` exports type definitions only, not runtime values.

**✅ CORRECT:**

```typescript
import type { User } from "wasp/entities"; // Type
import { UserRole } from "@prisma/client"; // Runtime values

// ✅ Works!
if (user.role === UserRole.ADMIN) {
  /* ... */
}
```

**Solution**: Import enum **types** from `wasp/entities`, **runtime values** from `@prisma/client`.

---

### 7. Missing Type Annotations on Operations

**❌ WRONG:**

```typescript
// File: src/server/tasks/operations.ts
export const getTasks = async (args, context) => {
  // ❌ No types!
  return await context.entities.Task.findMany();
};
```

**Why wrong**: TypeScript can't validate arguments/return types, Wasp can't generate proper client types.

**✅ CORRECT:**

```typescript
// File: src/server/tasks/operations.ts
import type { GetTasks } from "wasp/server/operations";

export const getTasks: GetTasks = async (args, context) => {
  return await context.entities.Task.findMany();
};
```

**Solution**: Always add type annotations: `GetTasks`, `CreateTask`, etc.

---

### 8. No Auth Check in Operations

**❌ WRONG:**

```typescript
export const deleteTask = async (args, context) => {
  // ❌ No auth check - anyone can delete tasks!
  return await context.entities.Task.delete({
    where: { id: args.id },
  });
};
```

**Why wrong**: Operation is publicly accessible, even to unauthenticated users.

**✅ CORRECT:**

```typescript
export const deleteTask = async (args, context) => {
  // ✅ ALWAYS check auth first
  if (!context.user) {
    throw new HttpError(401, "Not authenticated");
  }

  const task = await context.entities.Task.findUnique({
    where: { id: args.id },
  });

  if (!task) throw new HttpError(404);

  // Check ownership
  if (task.userId !== context.user.id) {
    throw new HttpError(403, "Not authorized");
  }

  return await context.entities.Task.delete({
    where: { id: args.id },
  });
};
```

**Solution**: ALWAYS check `context.user` and permissions in operations.

---

### 9. Using Raw Prisma Commands Instead of Wasp

**❌ WRONG:**

```bash
# ❌ NEVER use direct Prisma commands
npx prisma migrate dev
npx prisma db push
```

**Why wrong**: Bypasses Wasp's type generation, breaks multi-worktree sync.

**✅ CORRECT:**

```bash
# ✅ ALWAYS use Wasp commands
wasp db migrate-dev --name "add task priority field"
./scripts/safe-start.sh  # MANDATORY restart after migration
```

**Solution**: Use `wasp db migrate-dev`, NEVER `prisma migrate` directly.

---

### 10. Forgetting to Restart After Schema/Main.wasp Changes

**❌ WRONG:**

```bash
# 1. Edit app/schema.prisma
# 2. Run migration
wasp db migrate-dev --name "add field"
# 3. ❌ Continue coding without restart
```

**Error:**

```typescript
// ❌ TypeScript error!
Property 'newField' does not exist on type 'Task'
```

**Why wrong**: Wasp only regenerates types when server restarts.

**✅ CORRECT:**

```bash
# 1. Edit app/schema.prisma
# 2. Run migration
wasp db migrate-dev --name "add field"
# 3. ✅ MANDATORY restart
./scripts/safe-start.sh
```

**Solution**: ALWAYS restart Wasp after schema/main.wasp changes.

---

### 11. Using `getEmail(user)` Helper (Email Access)

**❌ WRONG:**

```typescript
// ❌ Email not directly on User entity
const email = user.email; // ❌ undefined or type error
```

**Why wrong**: In Wasp, email is stored in nested `auth.identities` structure, not directly on User.

**✅ CORRECT:**

```typescript
import { getEmail } from "wasp/auth/utils";

// ✅ Use helper function
const email = getEmail(user);
```

**Solution**: Use `getEmail(user)` helper, never access `user.email` directly.

---

## Wasp-Specific Anti-Patterns

### Using `useAction` by Default

**❌ WRONG (Anti-pattern):**

```typescript
import { useAction } from "wasp/client/operations";
import { createTask } from "wasp/client/operations";

function TaskForm() {
  const createTaskFn = useAction(createTask);

  const handleSubmit = async (data) => {
    await createTaskFn(data); // ❌ Blocks auto-invalidation
  };
}
```

**Why wrong**: `useAction` wrapper blocks Wasp's automatic query invalidation.

**✅ CORRECT (Default pattern):**

```typescript
import { createTask } from "wasp/client/operations";

function TaskForm() {
  const handleSubmit = async (data) => {
    await createTask(data); // ✅ Enables auto-invalidation
  };
}
```

**When to use `useAction`**: Only for optimistic UI updates or manual mutation state tracking (rare).

---

### Using `npm start` Instead of `wasp start`

**❌ WRONG:**

```bash
cd app
npm start  # ❌ This is a Wasp project, not plain React!
```

**Why wrong**: Wasp requires its own CLI to run servers (both frontend + backend).

**✅ CORRECT:**

```bash
./scripts/safe-start.sh  # ✅ Use safe-start script (multi-worktree aware)
# OR
wasp start  # ✅ Direct Wasp CLI (single worktree)
```

---

### Modifying `.wasp/` Directory

**❌ WRONG:**

```bash
# ❌ NEVER manually edit generated files
vim app/.wasp/out/server/src/entities/index.ts
```

**Why wrong**: `.wasp/` is auto-generated, changes will be overwritten on next restart.

**✅ CORRECT:**

```bash
# ✅ Edit source files only
vim app/schema.prisma
vim app/main.wasp

# Then restart to regenerate
./scripts/safe-start.sh
```

---

## Architecture-Specific Pitfalls (LEAN AI COACH)

### Assuming Sidebar Navigation

**❌ WRONG:**

```typescript
// Adding sidebar component
<div className="sidebar">
  <Navigation />
</div>
```

**Why wrong**: App uses 2-level top bar navigation, NO sidebar.

**✅ CORRECT:**

```typescript
// Use existing TopNavigation component
<TopNavigation />
// - Level 1: Logo, Tools, Language, User Menu
// - Level 2: Tool-specific actions
```

---

### One-to-One User↔Department Relationship

**❌ WRONG:**

```prisma
model User {
  id           String  @id @default(uuid())
  departmentId String
  department   Department @relation(fields: [departmentId], references: [id])
}
```

**Why wrong**: Users can belong to MULTIPLE departments.

**✅ CORRECT:**

```prisma
model User {
  id          String            @id @default(uuid())
  departments UserDepartment[]  // Many-to-many
}

model UserDepartment {
  userId       String
  departmentId String
  role         DepartmentRole
  user         User       @relation(fields: [userId], references: [id])
  department   Department @relation(fields: [departmentId], references: [id])

  @@id([userId, departmentId])
}
```

---

### Missing VIEWER Role in Permission Checks

**❌ WRONG:**

```typescript
// Only checking MANAGER and MEMBER
if (
  userDept.role === DepartmentRole.MANAGER ||
  userDept.role === DepartmentRole.MEMBER
) {
  // Allow access
}
```

**Why wrong**: VIEWER role also needs read access.

**✅ CORRECT:**

```typescript
import { DepartmentRole } from "@prisma/client";

// Include VIEWER
if (
  [
    DepartmentRole.MANAGER,
    DepartmentRole.MEMBER,
    DepartmentRole.VIEWER,
  ].includes(userDept.role)
) {
  // Allow read access
}

// Or use helper from .claude/templates/permission-helpers.ts
import { canViewResource } from "../utils/permissions";
if (!canViewResource(user, resource)) throw new HttpError(403);
```

---

### Hardcoding Section Grid Specs

**❌ WRONG:**

```typescript
// Hardcoded section configuration
const sections = [
  { id: 1, title: "Project Info", span: 12 },
  { id: 2, title: "Background", span: 6 },
  // ... etc
];
```

**Why wrong**: Section configuration is defined in constant, should be imported.

**✅ CORRECT:**

```typescript
import { SECTION_GRID_SPECS } from "../config/a3SectionSpecs";

const sections = SECTION_GRID_SPECS.map((spec) => ({
  ...spec,
  // Add runtime data
}));
```

---

## Quick Diagnostic Checklist

**When encountering errors, check:**

- [ ] Using `wasp/...` (not `@wasp/...`)?
- [ ] Using relative paths in `.ts/.tsx` (not `@src/...`)?
- [ ] Enum runtime values from `@prisma/client`?
- [ ] Restarted Wasp after schema/main.wasp changes?
- [ ] Auth check (`if (!context.user)`) in operations?
- [ ] Using `wasp db migrate-dev` (not `prisma migrate`)?
- [ ] Not importing server code in client?
- [ ] Using `./scripts/safe-start.sh` (not `npm start`)?
- [ ] Not modifying `.wasp/` directory?
- [ ] Using `getEmail(user)` for email access?

**Use `troubleshooting-guide` skill for step-by-step diagnosis!**

---

## See Also

- **[CLAUDE.md#pitfalls](../CLAUDE.md#pitfalls)** - Quick reference table
- **[TROUBLESHOOTING-GUIDE.md](./TROUBLESHOOTING-GUIDE.md)** - Complete diagnostic procedures
- **[IMPORT-RULES.md](./IMPORT-RULES.md)** - Detailed import patterns
- **Skill**: `troubleshooting-guide` - Interactive error diagnosis
- **Skill**: `wasp-operations` - Operation patterns
- **Templates**: `.claude/templates/operations-patterns.ts` - Code examples
