# App Directory Context

**AUTO-LOADED** when Claude Code works with files in `app/`. **Parent context**: Root CLAUDE.md provides project overview, testing workflow, multi-worktree setup.

---

## What's in app/

**Complete Wasp application**: Frontend + Backend + Database + Config

```
app/
├── main.wasp              # Routes, entities, operations, auth config
├── schema.prisma          # Database schema (single source of truth)
├── src/                   # All application code
│   ├── pages/             # React pages (routes defined in main.wasp)
│   ├── components/        # Reusable React components
│   ├── server/            # Backend operations
│   ├── lib/               # Shared utilities
│   └── test/              # Vitest component tests
├── .env.server            # Server secrets (NEVER commit)
├── .env.client            # Client config (safe to commit examples)
└── .wasp/                 # Generated code (DO NOT TOUCH)
```

---

## Critical Wasp Rules

### 1. Import Rules (Most Common Errors)

| Context     | Wasp Generated                              | Your Code      | Enums                      | ❌ NEVER                  |
| ----------- | ------------------------------------------- | -------------- | -------------------------- | ------------------------- |
| `.ts/.tsx`  | `wasp/entities`<br>`wasp/client/operations` | Relative paths | `@prisma/client` (runtime) | `@wasp/...`<br>`@src/...` |
| `main.wasp` | N/A                                         | `@src/...`     | N/A                        | Relative paths            |

**Examples:**

```typescript
// ✅ CORRECT - In .ts/.tsx files
import { User } from "wasp/entities";
import { getTasks } from "wasp/client/operations";
import { TaskStatus } from "@prisma/client"; // Enum VALUES

// ❌ WRONG
import { User } from "@wasp/entities"; // @wasp doesn't exist
import { getTasks } from "@src/server/tasks/operations"; // @src in .ts
```

```wasp
// ✅ CORRECT - In main.wasp
query getTasks {
  fn: import { getTasks } from "@src/server/tasks/operations"
}

// ❌ WRONG
query getTasks {
  fn: import { getTasks } from "../src/server/tasks/operations"
}
```

### 2. ALWAYS Restart After Schema Changes

```bash
# After editing schema.prisma or main.wasp
./scripts/safe-start.sh

# Or with clean (recommended)
./scripts/safe-start.sh --clean
```

**Why**: Wasp regenerates TypeScript types in `.wasp/out/` - old types cause errors

### 3. Database Migrations

**NEVER modify database directly!** Use `wasp-migration-helper` agent or manual workflow:

```bash
# 1. Edit schema.prisma
# 2. Create migration
cd app
wasp db migrate-dev --name "add_task_priority"

# 3. MANDATORY restart
cd ..
./scripts/safe-start.sh
```

**→ Complete workflow**: See root CLAUDE.md #database-critical

### 4. Operations Must Have Type Annotations

```typescript
// ✅ CORRECT - Explicit types
import type { GetTasks } from "wasp/server/operations";

export const getTasks: GetTasks = async (args, context) => {
  // TypeScript knows args/context types
};
```

```typescript
// ❌ WRONG - No type annotation
export const getTasks = async (args, context) => {
  // TypeScript can't infer types
};
```

---

## Wasp Operations Patterns

### Query vs Action

| Type       | When                        | Client Call                  | Caching        |
| ---------- | --------------------------- | ---------------------------- | -------------- |
| **Query**  | Read data (no side effects) | `useQuery(getTask)`          | ✅ Auto-cached |
| **Action** | Write data (side effects)   | Direct: `await createTask()` | ❌ No cache    |

### Server Operation Structure (src/server/{feature}/operations.ts)

```typescript
// File: src/server/tasks/operations.ts
import type { GetTasks, CreateTask } from "wasp/server/operations";
import { HttpError } from "wasp/server";

// Query - Read data
export const getTasks: GetTasks = async (args, context) => {
  // 1. Auth check (ALWAYS first)
  if (!context.user) {
    throw new HttpError(401, "Not authenticated");
  }

  // 2. Fetch data using context.entities
  return await context.entities.Task.findMany({
    where: { userId: context.user.id },
    orderBy: { createdAt: "desc" },
  });
};

// Action - Write data
export const createTask: CreateTask = async (args, context) => {
  // 1. Auth check
  if (!context.user) {
    throw new HttpError(401);
  }

  // 2. Validation (optional - use Zod)
  if (!args.title) {
    throw new HttpError(400, "Title required");
  }

  // 3. Create data
  return await context.entities.Task.create({
    data: {
      title: args.title,
      userId: context.user.id,
    },
  });
};
```

### Client Usage (src/pages/{feature}/Page.tsx)

```typescript
// Queries - Auto-cached, reactive updates
import { useQuery, getTasks } from "wasp/client/operations";

export function TaskListPage() {
  const { data: tasks, isLoading, error } = useQuery(getTasks);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <ul>{tasks.map((t) => <li key={t.id}>{t.title}</li>)}</ul>;
}
```

```typescript
// Actions - Direct await, manual error handling
import { createTask } from "wasp/client/operations";
import { useState } from "react";

export function CreateTaskForm() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (title: string) => {
    try {
      await createTask({ title });
      // Success - queries auto-refresh!
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e.target.title.value); }}>
      <input name="title" />
      <button>Create</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
```

**→ Complete patterns**: Root `.claude/templates/operations-patterns.ts`

---

## Environment Variables

### Server Secrets (.env.server)

**NEVER commit!** Add to .gitignore.

```bash
# app/.env.server
DATABASE_URL="postgresql://dev:dev@localhost:5432/dev"
OPENAI_API_KEY="sk-..."
STRIPE_SECRET_KEY="sk_..."
JWT_SECRET="random-secret"
```

**Access in server operations:**

```typescript
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new HttpError(500, "API key not configured");
}
```

### Client Config (.env.client)

**Safe to commit example values.** Must prefix with `REACT_APP_`.

```bash
# app/.env.client
REACT_APP_PUBLIC_URL="http://localhost:3000"
REACT_APP_ANALYTICS_ID="G-XXXXXXXXX"
```

**Access in React components:**

```typescript
const analyticsId = import.meta.env.REACT_APP_ANALYTICS_ID;
```

**→ Complete guide**: Root CLAUDE.md #security

---

## ShadCN UI Components

### CRITICAL: Version Lock

**ONLY USE v2.3.0** - Newer versions require Tailwind v4 (incompatible with Wasp)

```bash
# ✅ CORRECT
npx shadcn@2.3.0 add button

# ❌ WRONG - Will break
npx shadcn add button
```

### Post-Installation Fix (MANDATORY)

After EVERY component installation, fix import path:

```typescript
// In src/components/ui/{component}.tsx
// BEFORE (generated - BROKEN):
import { cn } from "s/lib/utils";

// AFTER (fix import path):
import { cn } from "../../lib/utils";
```

**→ Automation**: Use `shadcn-ui` skill for correct workflow

---

## Design System (TailwindCSS)

### Color Palette

**OpenSaaS default colors** (defined in `tailwind.config.js`):

- `bg-background` - Main background (#ffffff)
- `bg-card` - Card background (#f9fafb)
- `text-foreground` - Primary text (#111827)
- `text-muted-foreground` - Secondary text (#6b7280)
- `border` - Borders (#e5e7eb)
- `primary` - Brand color (customizable)
- `destructive` - Error states (#ef4444)

### Spacing & Typography

```typescript
// Common patterns
<div className="p-4 md:p-6 lg:p-8">          // Responsive padding
<h1 className="text-2xl font-bold mb-4">     // Headings
<p className="text-sm text-muted-foreground"> // Secondary text
<div className="space-y-4">                  // Vertical spacing between children
<div className="grid gap-4 md:grid-cols-2">  // Responsive grid
```

### Component Composition

```typescript
// Use ShadCN primitives, compose custom components
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function FeatureCard({ title, description }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
        <Button className="mt-4">Learn More</Button>
      </CardContent>
    </Card>
  );
}
```

---

## Testing

**2 test types, 2 locations:**

| Type                | Tool       | Location                    | Run Command                  |
| ------------------- | ---------- | --------------------------- | ---------------------------- |
| **Component/Unit**  | Vitest     | `app/src/**/*.test.tsx`     | `./scripts/test-watch.sh`    |
| **E2E/Integration** | Playwright | `e2e-tests/tests/*.spec.ts` | `./scripts/run-e2e-tests.sh` |

**Key rule**: Test files next to components

```
src/components/TaskList.tsx
src/components/TaskList.test.tsx  ✅ Co-located
```

**→ Component testing**: See `app/src/components/CLAUDE.md`
**→ Vitest patterns**: See `app/src/test/CLAUDE.md`
**→ E2E testing**: See `e2e-tests/CLAUDE.md`
**→ TDD workflow**: Root `docs/TDD-WORKFLOW.md`

---

## Common Pitfalls

### 1. Client Imports Server Code

**❌ WRONG:**

```typescript
// File: src/pages/TaskPage.tsx
import { getTasks } from "../server/tasks/operations"; // Direct import
```

**✅ CORRECT:**

```typescript
// Use Wasp operations
import { useQuery, getTasks } from "wasp/client/operations";
```

**Why**: Wasp enforces client/server separation - server code not bundled to client

### 2. Forgetting Auth Checks

**❌ WRONG:**

```typescript
export const deleteTask: DeleteTask = async (args, context) => {
  return await context.entities.Task.delete({
    where: { id: args.id },
  });
};
```

**✅ CORRECT:**

```typescript
export const deleteTask: DeleteTask = async (args, context) => {
  if (!context.user) throw new HttpError(401);

  const task = await context.entities.Task.findUnique({
    where: { id: args.id },
  });

  if (!task) throw new HttpError(404);
  if (task.userId !== context.user.id) throw new HttpError(403);

  return await context.entities.Task.delete({ where: { id: args.id } });
};
```

### 3. Using useAction Instead of Direct Call

**❌ WRONG:**

```typescript
import { useAction } from "wasp/client/operations";

const createTaskFn = useAction(createTask);
await createTaskFn({ title: "..." });
```

**✅ CORRECT:**

```typescript
import { createTask } from "wasp/client/operations";

await createTask({ title: "..." });
```

**Why**: Actions don't need `useAction` - just import and call directly

---

## File Organization

```
app/src/
├── pages/                    # React pages (routes in main.wasp)
│   ├── LandingPage.tsx       # Marketing pages
│   ├── DashboardPage.tsx     # App pages
│   └── {feature}/            # Feature-specific pages
│       └── FeaturePage.tsx
├── components/               # Reusable components
│   ├── ui/                   # ShadCN UI components
│   ├── layout/               # Layout components (Header, Footer)
│   └── {feature}/            # Feature-specific components
│       └── FeatureList.tsx
├── server/                   # Backend code
│   ├── {feature}/
│   │   └── operations.ts     # Queries & actions
│   └── scripts/
│       └── seedDemoUser.ts   # Database seeding
├── lib/                      # Shared utilities
│   ├── utils.ts              # General helpers
│   └── {feature}Helpers.ts   # Feature-specific helpers
└── test/                     # Vitest test setup
    ├── vitest.config.ts
    └── setup.ts
```

**Naming convention**:

- Features use descriptive names (tasks, auth, billing)
- NOT generic names (feature1, module1)
- NOT week-based names (week01, week02)

---

## Wasp-Specific Debugging

### Types Not Updating

**Symptom**: `Property 'newField' does not exist on type 'User'`

**Fix**: ALWAYS restart after schema.prisma or main.wasp changes

```bash
# Stop servers (Ctrl+C)
./scripts/safe-start.sh
```

### Operation Not Found

**Symptom**: `Cannot find 'getTasks' in 'wasp/client/operations'`

**Checklist**:

1. ✅ Defined in main.wasp? (`query getTasks { ... }`)
2. ✅ Correct import path in main.wasp? (`@src/server/...`)
3. ✅ Type annotation in implementation? (`export const getTasks: GetTasks`)
4. ✅ Restarted servers? (`./scripts/safe-start.sh`)

### Auth Not Working

**Symptom**: Can't login with seeded user

**Common causes**:

1. Password not hashed correctly (use `sanitizeAndSerializeProviderData<'email'>`)
2. Missing email auth fields (`isEmailVerified`, `emailVerificationSentAt`, etc.)
3. Auth config missing in main.wasp

**→ Complete troubleshooting**: Root `docs/TROUBLESHOOTING-GUIDE.md`

---

## Skills & Agents

**Use these for Wasp-specific tasks:**

- `wasp-operations` - Operation patterns and auth checks
- `wasp-database` - Database migration workflow (reference)
- `wasp-migration-helper` - Database migrations (agent, preferred)
- `shadcn-ui` - ShadCN component installation
- `error-handling` - Error handling patterns
- `troubleshooting-guide` - Diagnostic procedures

**→ Complete list**: Root `.claude/README.md`

---

## See Also

- **[../CLAUDE.md](../CLAUDE.md)** - Root development guide
- **[../docs/CODE-ORGANIZATION.md](../docs/CODE-ORGANIZATION.md)** - Complete file structure
- **[../docs/TDD-WORKFLOW.md](../docs/TDD-WORKFLOW.md)** - Testing workflow
- **[../.claude/templates/operations-patterns.ts](../.claude/templates/operations-patterns.ts)** - Copy-paste operation examples
- **Wasp Docs**: https://wasp.sh/docs
- **OpenSaaS Docs**: https://docs.opensaas.sh
