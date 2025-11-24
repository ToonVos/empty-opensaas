# Import Rules & Syntax (Complete Guide)

**Quick Reference**: [CLAUDE.md#import-rules](../CLAUDE.md#import-rules)

**Skill**: Use `troubleshooting-guide` skill for import error diagnosis

---

## Master Import Rules Table

| Context            | Wasp Generated                                               | Your Code                                          | Prisma Enum Values                       | NEVER Use                                   |
| ------------------ | ------------------------------------------------------------ | -------------------------------------------------- | ---------------------------------------- | ------------------------------------------- |
| **.ts/.tsx files** | `wasp/entities`<br>`wasp/client/operations`<br>`wasp/server` | Relative paths:<br>`../utils/helper`<br>`./helper` | `@prisma/client`<br>(for runtime values) | `@wasp/...`<br>`@src/...`                   |
| **main.wasp**      | N/A                                                          | `@src/...`<br>(ALWAYS use prefix)                  | N/A                                      | Relative paths<br>`../src/...`<br>`src/...` |

---

## Common Error Messages & Solutions

### "Cannot find module 'wasp/...'"

**Error:**

```
Cannot find module 'wasp/entities'
Module not found: Error: Can't resolve 'wasp/client/operations'
```

**Cause**:

- Using `@wasp/...` instead of `wasp/...`
- Wasp types not regenerated after schema/main.wasp changes

**Solution:**

```typescript
// ❌ WRONG
import { Task } from "@wasp/entities";
import { getTasks } from "@wasp/client/operations";

// ✅ CORRECT
import type { Task } from "wasp/entities";
import { getTasks } from "wasp/client/operations";
```

**If still failing after fix:**

```bash
# MANDATORY: Restart Wasp to regenerate types
./scripts/safe-start.sh
```

### "Cannot find module '@src/...'" (in .ts/.tsx)

**Error:**

```
Cannot find module '@src/components/TaskList'
Module not found: Error: Can't resolve '@src/utils/helper'
```

**Cause**: Using `@src/...` imports in TypeScript files (only works in main.wasp)

**Solution:**

```typescript
// ❌ WRONG (in src/pages/DashboardPage.tsx)
import { TaskList } from "@src/components/TaskList";
import { formatDate } from "@src/utils/formatters";

// ✅ CORRECT
import { TaskList } from "../components/TaskList";
import { formatDate } from "../utils/formatters";
```

### "Module has no exported member 'UserRole'" (Enum values)

**Error:**

```typescript
import { UserRole } from "wasp/entities";
console.log(UserRole.ADMIN); // ❌ undefined at runtime!
```

**Cause**: `wasp/entities` exports TYPES only, not runtime enum values

**Solution:**

```typescript
// ❌ WRONG - Type-only import
import { UserRole } from "wasp/entities";
console.log(UserRole.ADMIN); // undefined!

// ✅ CORRECT - Runtime value import
import { UserRole } from "@prisma/client";
console.log(UserRole.ADMIN); // "ADMIN"

// ✅ BOTH when needed (type + runtime)
import type { User } from "wasp/entities"; // Type annotation
import { UserRole } from "@prisma/client"; // Runtime values

const isAdmin = (user: User) => user.role === UserRole.ADMIN;
```

---

## Enum Import Rule (CRITICAL)

**Problem**: Prisma enums have BOTH type definitions AND runtime values.

### Usage Table

| Usage Type           | Import Source    | Example                        |
| -------------------- | ---------------- | ------------------------------ |
| **Type annotations** | `wasp/entities`  | `role: UserRole`               |
| **Runtime values**   | `@prisma/client` | `if (role === UserRole.ADMIN)` |

### Complete Example

```typescript
// File: src/server/users/operations.ts

// ✅ CORRECT - Import both
import type { User } from "wasp/entities"; // Type for annotations
import { UserRole, OrgRole, DepartmentRole } from "@prisma/client"; // Runtime values
import type { GetUser } from "wasp/server/operations";
import { HttpError } from "wasp/server";

export const getUser: GetUser = async (args, context) => {
  if (!context.user) throw new HttpError(401);

  // Type annotation uses wasp/entities type
  const user: User = await context.entities.User.findUnique({
    where: { id: args.id },
  });

  if (!user) throw new HttpError(404);

  // Runtime comparison uses @prisma/client enum values
  if (user.orgRole !== OrgRole.ADMIN) {
    throw new HttpError(403);
  }

  return user;
};
```

### All Enums in Project

```typescript
// From @prisma/client (runtime values)
import {
  UserRole, // SUPER_ADMIN | ADMIN | USER
  OrgRole, // OWNER | ADMIN | MEMBER
  DepartmentRole, // MANAGER | MEMBER | VIEWER
  A3Status, // DRAFT | IN_PROGRESS | COMPLETED
  SectionStatus, // NOT_STARTED | IN_PROGRESS | COMPLETED
} from "@prisma/client";

// For type annotations only
import type {
  User,
  Organization,
  Department,
  A3,
  Section,
} from "wasp/entities";
```

---

## Import Patterns by File Type

### Operations (src/server/\*\*/operations.ts)

```typescript
// ✅ CORRECT pattern
import type { GetTasks, CreateTask, UpdateTask } from "wasp/server/operations";
import type { Task } from "wasp/entities";
import { HttpError } from "wasp/server";
import { A3Status } from "@prisma/client"; // Runtime enum values
import { validateTaskInput } from "../utils/validation"; // Relative path
```

### React Components (src/\*_/_.tsx)

```typescript
// ✅ CORRECT pattern
import { getTasks, createTask } from "wasp/client/operations";
import type { Task } from "wasp/entities";
import { A3Status } from "@prisma/client"; // Runtime enum values
import { Button } from "../components/ui/button"; // Relative path
import { TaskList } from "./TaskList"; // Same directory
```

### main.wasp Configuration

```wasp
// ✅ CORRECT - ALWAYS use @src prefix
query getTasks {
  fn: import { getTasks } from "@src/server/tasks/operations",
  entities: [Task]
}

action createTask {
  fn: import { createTask } from "@src/server/tasks/operations",
  entities: [Task]
}

page DashboardPage {
  component: import { DashboardPage } from "@src/pages/DashboardPage",
  authRequired: true
}
```

### Test Files (src/\*_/_.test.tsx)

```typescript
// ✅ CORRECT pattern
import { describe, it, expect, vi } from "vitest";
import type { Task, User } from "wasp/entities";
import { A3Status } from "@prisma/client"; // Runtime enum values
import { render, screen } from "@testing-library/react";
import { TaskList } from "./TaskList"; // Component under test (relative)
```

---

## Import Order (5 Groups)

**Standard order with blank lines between groups:**

```typescript
// 1. External libraries
import { useState, useEffect } from "react";
import { z } from "zod";

// 2. Wasp imports
import { getTasks, createTask } from "wasp/client/operations";
import type { Task, User } from "wasp/entities";
import { HttpError } from "wasp/server";

// 3. Absolute imports (if using path aliases)
import { Button } from "@/components/ui/button";

// 4. Relative imports - parent directories first
import { formatDate } from "../../lib/utils";
import { TaskList } from "../components/TaskList";

// 5. Relative imports - same directory
import { TaskListItem } from "./TaskListItem";
import { TaskFilters } from "./TaskFilters";
```

**Auto-formatting**: ESLint/Prettier enforce this via git hooks.

---

## Troubleshooting Import Issues

### 1. Types Not Found After Schema Change

**Symptom:**

```typescript
Property 'newField' does not exist on type 'User'
```

**Diagnosis:**

```bash
# Check if .wasp/out directory exists
ls app/.wasp/out

# Check if types were regenerated
ls app/.wasp/out/server/src/entities/
```

**Fix:**

```bash
# MANDATORY: Restart Wasp (only way to regenerate types)
./scripts/safe-start.sh
```

### 2. Circular Import Errors

**Symptom:**

```
Dependency cycle detected
Cannot access 'X' before initialization
```

**Cause**: File A imports File B, File B imports File A

**Fix**:

```typescript
// ❌ WRONG
// fileA.ts
import { funcB } from "./fileB";
export const funcA = () => funcB();

// fileB.ts
import { funcA } from "./fileA";
export const funcB = () => funcA();

// ✅ CORRECT - Extract shared code
// shared.ts
export const sharedLogic = () => {
  /* ... */
};

// fileA.ts
import { sharedLogic } from "./shared";
export const funcA = () => sharedLogic();

// fileB.ts
import { sharedLogic } from "./shared";
export const funcB = () => sharedLogic();
```

### 3. ShadCN UI Import Errors

**Symptom:**

```
Cannot find module 's/lib/utils'
```

**Cause**: ShadCN v2.4+ uses incorrect import path

**Fix:**

```typescript
// File: src/components/ui/button.tsx
// ❌ WRONG (auto-generated by ShadCN v2.4+)
import { cn } from "s/lib/utils";

// ✅ CORRECT (manual fix required after EVERY shadcn add)
import { cn } from "../../lib/utils";
```

**Prevention:**

```bash
# ALWAYS use locked version
npx shadcn@2.3.0 add button

# Then manually fix import path in generated file
```

---

## Wasp-Specific Import Constraints

### Cannot Import Server Code in Client

**❌ FORBIDDEN:**

```typescript
// File: src/pages/DashboardPage.tsx (CLIENT-SIDE)
import { prisma } from "wasp/server"; // ❌ ERROR!
import { getTasks } from "../server/tasks/operations"; // ❌ ERROR!
```

**Why**: Wasp enforces client/server separation. Server code cannot run in browser.

**✅ SOLUTION**: Use Wasp operations:

```typescript
// File: src/pages/DashboardPage.tsx (CLIENT-SIDE)
import { useQuery } from "wasp/client/operations";
import { getTasks } from "wasp/client/operations"; // ✅ CORRECT
```

### Cannot Use @src in TypeScript Files

**❌ FORBIDDEN:**

```typescript
// File: src/components/TaskList.tsx
import { formatDate } from "@src/lib/utils"; // ❌ ERROR!
```

**Why**: `@src` alias only configured for main.wasp, not TypeScript compiler.

**✅ SOLUTION**: Use relative paths:

```typescript
// File: src/components/TaskList.tsx
import { formatDate } from "../lib/utils"; // ✅ CORRECT
```

---

## Quick Reference Checklist

Before committing code with imports:

- [ ] No `@wasp/...` imports (use `wasp/...`)
- [ ] No `@src/...` in .ts/.tsx files (use relative paths)
- [ ] Enum runtime values from `@prisma/client` (not `wasp/entities`)
- [ ] No server imports in client code
- [ ] ShadCN component imports fixed (`../../lib/utils`)
- [ ] Import order: external → wasp → absolute → relative (parent) → relative (same)
- [ ] Restarted Wasp after schema/main.wasp changes

---

## See Also

- **[CLAUDE.md#import-rules](../CLAUDE.md#import-rules)** - Quick reference
- **[TROUBLESHOOTING-GUIDE.md](./TROUBLESHOOTING-GUIDE.md)** - Complete diagnostic procedures
- **Skill**: `troubleshooting-guide` - Interactive import error diagnosis
- **Templates**: `.claude/templates/operations-patterns.ts` - Import examples
