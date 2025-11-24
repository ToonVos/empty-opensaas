# Code Style & Conventions (Complete Guide)

**Quick Reference**: [CLAUDE.md#code-style](../CLAUDE.md#code-style)

**Auto-Enforcement**: ESLint + Prettier (via git hooks)

---

## Naming Conventions

### Files & Directories

| Element           | Convention      | Example                           | Notes                       |
| ----------------- | --------------- | --------------------------------- | --------------------------- |
| **Components**    | PascalCase      | `TaskList.tsx`, `A3Editor.tsx`    | React components            |
| **Utils/Helpers** | camelCase       | `emailHelper.ts`, `formatters.ts` | Utility functions           |
| **Operations**    | `operations.ts` | `src/server/a3/operations.ts`     | Wasp operations file        |
| **Types**         | `types.ts`      | `src/types/a3Types.ts`            | TypeScript type definitions |
| **Constants**     | `constants.ts`  | `src/config/constants.ts`         | App-wide constants          |
| **Tests**         | `*.test.tsx`    | `TaskList.test.tsx`               | Vitest component tests      |
| **E2E Tests**     | `*.spec.ts`     | `auth.spec.ts`                    | Playwright E2E tests        |

### Variables & Functions

| Element          | Convention       | Example                            | Why                      |
| ---------------- | ---------------- | ---------------------------------- | ------------------------ |
| **Variables**    | camelCase        | `taskList`, `currentUser`          | Standard JS convention   |
| **Functions**    | camelCase + verb | `getTasks()`, `createA3()`         | Action-oriented naming   |
| **Booleans**     | is/has/should    | `isAuthenticated`, `hasPermission` | Clear true/false meaning |
| **Constants**    | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_TIMEOUT_MS`  | Immutable values         |
| **Private vars** | \_prefix (rare)  | `_internalState`                   | Avoid if possible        |
| **Enums**        | PascalCase       | `UserRole`, `A3Status`             | Type-like naming         |

### React Components

```typescript
// ✅ CORRECT - Component names
export function TaskList() {
  /* ... */
}
export function A3EditorSection() {
  /* ... */
}
export function UserProfileCard() {
  /* ... */
}

// ❌ WRONG
export function tasklist() {
  /* ... */
} // lowercase
export function Task_List() {
  /* ... */
} // snake_case
```

### Operations

```typescript
// ✅ CORRECT - Verb-first naming
export const getTasks = async (args, context) => {
  /* ... */
};
export const createA3 = async (args, context) => {
  /* ... */
};
export const updateSection = async (args, context) => {
  /* ... */
};
export const deleteTask = async (args, context) => {
  /* ... */
};

// ❌ WRONG
export const taskGetter = async (args, context) => {
  /* ... */
}; // Noun-first
export const a3 = async (args, context) => {
  /* ... */
}; // No verb
```

### Boolean Variables

```typescript
// ✅ CORRECT - Clear true/false meaning
const isAuthenticated = !!user;
const hasPermission = user.role === UserRole.ADMIN;
const shouldShowModal = status === "active";
const canEdit = checkEditPermission(user, resource);

// ❌ WRONG
const authenticated = !!user; // Not clear it's boolean
const permission = user.role === UserRole.ADMIN; // Could be string
const modal = status === "active"; // Ambiguous
```

### Constants

```typescript
// ✅ CORRECT - All caps snake case
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const API_TIMEOUT_MS = 30000;
export const DEFAULT_PAGE_SIZE = 20;
export const SECTION_GRID_SPECS = [
  /* ... */
];

// ❌ WRONG
export const maxFileSize = 10 * 1024 * 1024; // Not constant style
export const Api_Timeout_Ms = 30000; // Mixed case
```

---

## Import Order (5 Groups)

**Standard order with blank lines between groups:**

```typescript
// 1. External libraries (alphabetical)
import { useState, useEffect } from "react";
import { z } from "zod";

// 2. Wasp imports (alphabetical)
import { getTasks, createTask } from "wasp/client/operations";
import type { Task, User } from "wasp/entities";
import { HttpError } from "wasp/server";

// 3. Absolute imports (if using path aliases)
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// 4. Relative imports - parent directories first
import { formatDate, formatCurrency } from "../../lib/utils";
import { SECTION_GRID_SPECS } from "../../config/constants";
import { TaskList } from "../components/TaskList";

// 5. Relative imports - same directory
import { TaskListItem } from "./TaskListItem";
import { TaskFilters } from "./TaskFilters";
import type { TaskListProps } from "./types";
```

**Auto-sorted by**: ESLint/Prettier (configured in project)

---

## Code Formatting

### Indentation & Spacing

```typescript
// ✅ CORRECT - 2 spaces indentation
function example() {
  if (condition) {
    doSomething();
  }
}

// ❌ WRONG - 4 spaces or tabs
function example() {
  if (condition) {
    doSomething();
  }
}
```

**Standard:**

- **Indentation**: 2 spaces (no tabs)
- **Max line length**: 100 characters
- **Semicolons**: Always required
- **Quotes**: Single quotes (except JSX)
- **Trailing commas**: Always (except in functions)

### Quotes

```typescript
// ✅ CORRECT - Single quotes
const name = 'John Doe'
import { getTasks } from 'wasp/client/operations'

// ✅ CORRECT - Double quotes in JSX
<div className="container">Hello</div>

// ❌ WRONG - Double quotes in TS
const name = "John Doe"
```

### Semicolons

```typescript
// ✅ CORRECT - Always use semicolons
const x = 10;
return { data: x };

// ❌ WRONG - Missing semicolons
const x = 10;
return { data: x };
```

### Line Length

```typescript
// ✅ CORRECT - Break long lines at 100 chars
const longFunctionName = async (
  firstParameter: string,
  secondParameter: number,
  thirdParameter: boolean,
) => {
  // Function body
};

// ❌ WRONG - Line too long
const longFunctionName = async (
  firstParameter: string,
  secondParameter: number,
  thirdParameter: boolean,
) => {
  // Function body
};
```

---

## TypeScript Style

### Type Annotations

```typescript
// ✅ CORRECT - Explicit types for function signatures
function getTasks(userId: string): Promise<Task[]> {
  return prisma.task.findMany({ where: { userId } });
}

// ✅ CORRECT - Type inference for local variables
const count = tasks.length; // number inferred
const name = user.email; // string inferred

// ❌ WRONG - Unnecessary type annotation
const count: number = tasks.length;
```

### Wasp Operation Types

```typescript
// ✅ CORRECT - Use Wasp-generated types
import type { GetTasks, CreateTask } from "wasp/server/operations";

export const getTasks: GetTasks = async (args, context) => {
  // Types automatically enforced
};

// ❌ WRONG - No type annotation
export const getTasks = async (args, context) => {
  // No type safety
};
```

### Enum Usage

```typescript
// ✅ CORRECT - Import runtime values from @prisma/client
import { UserRole, A3Status } from "@prisma/client";

if (user.role === UserRole.ADMIN) {
  /* ... */
}

// ❌ WRONG - Import from wasp/entities (types only)
import { UserRole } from "wasp/entities";
if (user.role === UserRole.ADMIN) {
  /* ❌ undefined! */
}
```

---

## React Component Style

### Function Components (Preferred)

```typescript
// ✅ CORRECT - Function component with props type
interface TaskListProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
}

export function TaskList({ tasks, onTaskClick }: TaskListProps) {
  return (
    <div>
      {tasks.map(task => (
        <div key={task.id} onClick={() => onTaskClick(task)}>
          {task.title}
        </div>
      ))}
    </div>
  )
}
```

### Prop Destructuring

```typescript
// ✅ CORRECT - Destructure in function signature
export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return <div>{task.title}</div>
}

// ❌ WRONG - Props object
export function TaskCard(props: TaskCardProps) {
  return <div>{props.task.title}</div>
}
```

### Event Handlers

```typescript
// ✅ CORRECT - handle* prefix for event handlers
const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
  onSubmit(formData);
};

const handleTaskClick = (task: Task) => {
  navigate(`/tasks/${task.id}`);
};

// ❌ WRONG - Unclear naming
const onSubmitForm = (e: FormEvent) => {
  /* ... */
};
const click = (task: Task) => {
  /* ... */
};
```

---

## File Organization

### Directory Structure

```
app/src/
├── components/
│   ├── ui/              # ShadCN components
│   ├── layout/          # Layout components (TopNavigation, etc.)
│   └── a3/              # A3-specific components
├── pages/
│   ├── a3/              # A3 tool pages
│   ├── auth/            # Auth pages
│   └── dashboard/       # Dashboard pages
├── server/
│   ├── a3/
│   │   └── operations.ts
│   ├── tasks/
│   │   └── operations.ts
│   └── utils/
├── lib/                 # Shared utilities
├── config/              # App configuration
└── types/               # TypeScript type definitions
```

### Operation Files

```typescript
// File: src/server/tasks/operations.ts

// ✅ CORRECT - All task operations in one file
import type {
  GetTasks,
  CreateTask,
  UpdateTask,
  DeleteTask,
} from "wasp/server/operations";

export const getTasks: GetTasks = async (args, context) => {
  /* ... */
};
export const createTask: CreateTask = async (args, context) => {
  /* ... */
};
export const updateTask: UpdateTask = async (args, context) => {
  /* ... */
};
export const deleteTask: DeleteTask = async (args, context) => {
  /* ... */
};
```

---

## Comments & Documentation

### When to Comment

```typescript
// ✅ GOOD - Explain WHY, not WHAT
// Wasp auth stores email in nested structure, not on User directly
const email = getEmail(user);

// ✅ GOOD - Explain complex business logic
// Calculate priority score: urgency (0-10) * importance (0-10) * 0.5
const priorityScore = (task.urgency * task.importance) / 2;

// ❌ BAD - Obvious comment
// Get tasks
const tasks = await getTasks();

// ❌ BAD - Commented-out code (delete instead)
// const oldFunction = () => { /* ... */ }
```

### JSDoc (for libraries/shared code)

```typescript
/**
 * Format a date for display in the UI
 * @param date - Date object or ISO string
 * @param format - Format style: 'short' | 'long' | 'relative'
 * @returns Formatted date string
 * @example
 * formatDate(new Date(), 'short') // '2025-01-18'
 */
export function formatDate(
  date: Date | string,
  format: "short" | "long" | "relative" = "short",
): string {
  // Implementation
}
```

---

## Git Commit Style

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `test`: Adding tests
- `docs`: Documentation changes
- `chore`: Build process, dependencies

**Examples:**

```
feat(a3): Add section drag-and-drop reordering

Implement drag-and-drop functionality for A3 sections using
react-beautiful-dnd library. Sections can now be reordered
within the editor.

Closes #123
```

**See**: `.github/COMMIT_CONVENTION.md` for complete guide

---

## Auto-Formatting Setup

### ESLint Configuration

**File: `.eslintrc.json`** (project root)

```json
{
  "extends": [
    "wasp",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "semi": ["error", "always"],
    "quotes": ["error", "single", { "avoidEscape": true }],
    "max-len": ["warn", { "code": 100 }]
  }
}
```

### Prettier Configuration

**File: `.prettierrc`** (project root)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Git Hooks (Auto-Run)

```bash
# Pre-commit hook auto-runs:
npx eslint . --ext .ts,.tsx --fix
npx prettier --write "src/**/*.{ts,tsx}"
```

**Configuration**: `.husky/pre-commit`

---

## Quick Reference Checklist

Before committing code:

- [ ] File names follow conventions (PascalCase for components, camelCase for utils)
- [ ] Function names are verb-first (`getTasks`, not `taskGetter`)
- [ ] Booleans use is/has/should prefix
- [ ] Constants use UPPER_SNAKE_CASE
- [ ] Import order: external → wasp → absolute → relative (parent) → relative (same)
- [ ] 2 spaces indentation, single quotes, semicolons
- [ ] Max 100 chars per line
- [ ] Type annotations on operations
- [ ] Comments explain WHY, not WHAT
- [ ] No commented-out code
- [ ] ESLint + Prettier auto-fix passed (via git hooks)

**Use `code-quality` skill for full quality check!**

---

## See Also

- **[CLAUDE.md#code-style](../CLAUDE.md#code-style)** - Quick reference
- **[.github/COMMIT_CONVENTION.md](../.github/COMMIT_CONVENTION.md)** - Commit message format
- **Skill**: `code-quality` - Complete code quality workflow
- **Config**: `.eslintrc.json`, `.prettierrc` - Auto-formatting config
- **Hooks**: `.husky/pre-commit` - Git commit validation
