---
name: error-handling
description: Complete error handling patterns for Wasp applications. Use when implementing error handling, validation, or working with HTTP errors. Includes server-side operations errors, client-side error handling, Zod validation, and retry logic.
triggers:
  [
    "error handling",
    "http error",
    "validation",
    "try catch",
    "error",
    "400",
    "401",
    "403",
    "404",
    "500",
    "throw error",
    "HttpError",
    "validation error",
  ]
version: 1.0
last_updated: 2025-10-18
allowed_tools: [Read, Write, Edit]
---

# Error Handling Skill

## Quick Reference

**When to use this skill:**

- Implementing error handling in operations
- Adding validation to forms/inputs
- Handling errors in React components
- Working with HTTP status codes
- Setting up error logging
- Implementing retry logic

**Key principles:**

1. Always check auth FIRST (401)
2. Follow error sequence: 401 → 404 → 403 → 400 → 500
3. Use HttpError from `wasp/server`
4. Validate input with Zod
5. Provide user-friendly messages
6. Log errors for debugging

## HTTP Status Codes Reference

| Code | Meaning        | When to Use            | Example                                            |
| ---- | -------------- | ---------------------- | -------------------------------------------------- |
| 401  | Unauthorized   | `!context.user`        | `throw new HttpError(401, 'Not authenticated')`    |
| 403  | Forbidden      | No permission          | `throw new HttpError(403, 'Not authorized')`       |
| 404  | Not Found      | Resource doesn't exist | `throw new HttpError(404, 'Task not found')`       |
| 400  | Bad Request    | Validation error       | `throw new HttpError(400, 'Description required')` |
| 409  | Conflict       | Duplicate resource     | `throw new HttpError(409, 'Email already exists')` |
| 500  | Internal Error | Unexpected error       | `throw new HttpError(500, 'Internal error')`       |

## Server-Side Error Handling

### Complete Operation Pattern

This is the master pattern - follow this sequence for ALL operations:

```typescript
import { HttpError } from "wasp/server";
import type { UpdateTask } from "wasp/server/operations";

export const updateTask: UpdateTask = async (args, context) => {
  // ------------------------------------------------------------
  // 1. AUTH CHECK (401) - ALWAYS FIRST!
  // ------------------------------------------------------------
  if (!context.user) {
    throw new HttpError(401, "Not authenticated");
  }

  // ------------------------------------------------------------
  // 2. FETCH RESOURCE
  // ------------------------------------------------------------
  const task = await context.entities.Task.findUnique({
    where: { id: args.id },
    include: {
      // Include relations needed for permission checks
      project: {
        include: { members: true },
      },
    },
  });

  // ------------------------------------------------------------
  // 3. EXISTENCE CHECK (404)
  // ------------------------------------------------------------
  if (!task) {
    throw new HttpError(404, "Task not found");
  }

  // ------------------------------------------------------------
  // 4. PERMISSION CHECK (403)
  // ------------------------------------------------------------
  const hasPermission =
    task.userId === context.user.id || // Owner
    task.project?.members.some((m) => m.userId === context.user.id); // Member

  if (!hasPermission) {
    throw new HttpError(403, "Not authorized to update this task");
  }

  // ------------------------------------------------------------
  // 5. INPUT VALIDATION (400)
  // ------------------------------------------------------------
  if (args.data.description !== undefined) {
    if (!args.data.description?.trim()) {
      throw new HttpError(400, "Description cannot be empty");
    }
    if (args.data.description.length > 500) {
      throw new HttpError(400, "Description must be 500 characters or less");
    }
  }

  // ------------------------------------------------------------
  // 6. TRY/CATCH FOR DATABASE ERRORS (500)
  // ------------------------------------------------------------
  try {
    return await context.entities.Task.update({
      where: { id: args.id },
      data: {
        ...(args.data.description && {
          description: args.data.description.trim(),
        }),
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    // Re-throw known HttpErrors
    if (error instanceof HttpError) {
      throw error;
    }

    // Log unexpected errors
    console.error("Failed to update task:", error);

    // Return generic 500 error (don't expose internal details)
    throw new HttpError(500, "Failed to update task. Please try again.");
  }
};
```

### Error Sequence (ALWAYS Follow)

**Critical:** This is the ONLY correct order:

1. **401** - Auth check (FIRST - before anything else)
2. **404** - Resource existence (can't check permissions if resource doesn't exist)
3. **403** - Permission check (now we know resource exists)
4. **400** - Validation (only validate if user has permission)
5. **500** - Unexpected errors (catch-all in try/catch)

**Why this order matters:**

- Checking permissions before existence = info leak (attacker learns resource exists)
- Validating before auth = wasted work + security risk
- Always fail fast at each step

### Simple Patterns

**Auth check only:**

```typescript
export const getMyProfile = async (_args, context) => {
  if (!context.user) throw new HttpError(401);

  return context.entities.User.findUnique({
    where: { id: context.user.id },
  });
};
```

**Delete with existence + permission:**

```typescript
export const deleteTask = async (args, context) => {
  if (!context.user) throw new HttpError(401);

  const task = await context.entities.Task.findUnique({
    where: { id: args.id },
  });

  if (!task) {
    throw new HttpError(404, "Task not found");
  }

  if (task.userId !== context.user.id) {
    throw new HttpError(403, "Not authorized to delete this task");
  }

  return context.entities.Task.delete({
    where: { id: args.id },
  });
};
```

### Handling Unique Constraint Violations (409)

**Pattern 1: Pre-check**

```typescript
export const createOrganization = async (args, context) => {
  if (!context.user) throw new HttpError(401);

  // Check for duplicate
  const existing = await context.entities.Organization.findUnique({
    where: { name: args.name },
  });

  if (existing) {
    throw new HttpError(409, "An organization with this name already exists");
  }

  return await context.entities.Organization.create({
    data: {
      name: args.name,
      ownerId: context.user.id,
    },
  });
};
```

**Pattern 2: Catch Prisma error**

```typescript
try {
  return await context.entities.User.create({
    data: { email: args.email },
  });
} catch (error) {
  // Handle Prisma unique constraint error (P2002)
  if (error.code === "P2002") {
    throw new HttpError(409, "Email already exists");
  }
  throw error;
}
```

## Client-Side Error Handling

### React Component with Query Error Handling

```typescript
import { useQuery } from 'wasp/client/operations'
import { getTasks } from 'wasp/client/operations'

function TasksPage() {
  // useQuery provides built-in error handling
  const {
    data: tasks,
    isLoading,
    error
  } = useQuery(getTasks)

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <h3 className="text-red-800 font-semibold">Error Loading Tasks</h3>
        <p className="text-red-600">{error.message}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }

  // Handle empty state
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No tasks yet. Create your first task!
      </div>
    )
  }

  return <div>{/* Render tasks */}</div>
}
```

### Action Error Handling with Toast

```typescript
import { updateTask, deleteTask } from 'wasp/client/operations'
import { toast } from 'react-hot-toast'

function TaskActions() {
  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateTask({ id, data })
      toast.success('Task updated successfully')
    } catch (err) {
      // Display user-friendly error message
      const message = err instanceof Error
        ? err.message
        : 'Failed to update task'
      toast.error(message)

      // Log for debugging
      console.error('Update task error:', err)
    }
  }

  const handleDelete = async (id: string) => {
    // Confirm before destructive action
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      await deleteTask({ id })
      toast.success('Task deleted')
    } catch (err) {
      // Handle specific error codes
      if (err instanceof Error) {
        if (err.message.includes('Not authorized')) {
          toast.error('You don\'t have permission to delete this task')
        } else if (err.message.includes('not found')) {
          toast.error('Task no longer exists')
        } else {
          toast.error('Failed to delete task')
        }
      }
    }
  }

  return (
    <div>
      <button onClick={() => handleUpdate('123', { status: 'DONE' })}>
        Update
      </button>
      <button onClick={() => handleDelete('123')}>
        Delete
      </button>
    </div>
  )
}
```

### Form Submission with Error State

```typescript
import { useState } from 'react'
import { createTask } from 'wasp/client/operations'
import { toast } from 'react-hot-toast'

function CreateTaskForm() {
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const description = formData.get('description') as string

    // Client-side validation
    if (!description.trim()) {
      setFormError('Description is required')
      setIsSubmitting(false)
      return
    }

    try {
      await createTask({ description })
      toast.success('Task created')
      e.currentTarget.reset()
    } catch (err) {
      // Display error in form
      const message = err instanceof Error ? err.message : 'Failed to create task'
      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="description"
        placeholder="Task description"
        disabled={isSubmitting}
      />
      {formError && (
        <div className="text-red-600 text-sm mt-1">{formError}</div>
      )}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  )
}
```

## Input Validation with Zod

### Basic Zod Schema

```typescript
import { z } from "zod";
import { HttpError } from "wasp/server";

const CreateTaskSchema = z.object({
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be 500 characters or less")
    .trim(),

  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional().default("TODO"),

  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),

  dueDate: z.string().datetime().optional(),

  tags: z.array(z.string()).max(10, "Maximum 10 tags allowed").optional(),

  assigneeId: z.string().uuid().optional(),
});

export const createTask = async (args, context) => {
  if (!context.user) throw new HttpError(401);

  try {
    // Validate and parse input
    const validated = CreateTaskSchema.parse(args);

    // Create with validated data
    return await context.entities.Task.create({
      data: {
        ...validated,
        userId: context.user.id,
      },
    });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      // Format validation errors for user
      const messages = error.errors.map((e) => {
        const field = e.path.join(".");
        const message = e.message;
        return `${field}: ${message}`;
      });

      throw new HttpError(400, messages.join(", "));
    }

    // Handle other errors
    throw error;
  }
};
```

### Advanced Zod with Custom Refinements

```typescript
const UpdateTaskSchema = z
  .object({
    description: z.string().min(1).max(500).optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    dueDate: z.string().datetime().optional(),
    completedAt: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      // Custom validation: completedAt only allowed if status is DONE
      if (data.completedAt && data.status !== "DONE") {
        return false;
      }
      return true;
    },
    {
      message: "completedAt can only be set when status is DONE",
      path: ["completedAt"],
    },
  )
  .refine(
    (data) => {
      // Custom validation: dueDate must be in future
      if (data.dueDate) {
        const dueDate = new Date(data.dueDate);
        if (dueDate < new Date()) {
          return false;
        }
      }
      return true;
    },
    {
      message: "dueDate must be in the future",
      path: ["dueDate"],
    },
  );
```

### Common Zod Patterns

```typescript
// Email validation
email: z.string().email("Invalid email address");

// URL validation
website: z.string().url("Invalid URL");

// Number ranges
age: z.number().min(18, "Must be 18+").max(120, "Invalid age");

// String length
password: z.string().min(8, "Password must be at least 8 characters");

// Regex pattern
phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number");

// Custom transformation
slug: z.string().transform((val) => val.toLowerCase().replace(/\s+/g, "-"));

// Conditional validation
z.object({
  type: z.enum(["INDIVIDUAL", "COMPANY"]),
  vatNumber: z.string().optional(),
}).refine((data) => (data.type === "COMPANY" ? !!data.vatNumber : true), {
  message: "VAT number is required for companies",
  path: ["vatNumber"],
});
```

## Advanced Patterns

### Retry Logic for Transient Errors

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // Don't retry on client errors (4xx)
      if (error instanceof HttpError && error.statusCode < 500) {
        throw error;
      }

      // Last attempt - throw error
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw new Error("Retry logic failed");
}

// Usage in operation
export const createTask = async (args, context) => {
  if (!context.user) throw new HttpError(401);

  // Retry on transient errors (network issues, DB locks, etc.)
  return withRetry(async () => {
    return await context.entities.Task.create({
      data: { ...args, userId: context.user.id },
    });
  });
};
```

### Error Logging and Monitoring

```typescript
function logError(
  error: any,
  context: {
    operation: string;
    userId?: string;
    args?: any;
  },
) {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("Operation error:", {
      operation: context.operation,
      userId: context.userId,
      args: context.args,
      error: error.message,
      stack: error.stack,
    });
  }

  // Send to monitoring service in production
  if (process.env.NODE_ENV === "production") {
    // Example: Send to Sentry, LogRocket, etc.
    // sentry.captureException(error, { extra: context })
  }
}

export const updateTask = async (args, context) => {
  try {
    if (!context.user) throw new HttpError(401);
    // ... operation logic
  } catch (error) {
    logError(error, {
      operation: "updateTask",
      userId: context.user?.id,
      args,
    });
    throw error;
  }
};
```

### Custom Error Classes

```typescript
class ValidationError extends HttpError {
  constructor(message: string, fields?: Record<string, string>) {
    super(400, message);
    this.name = "ValidationError";
    this.fields = fields;
  }

  fields?: Record<string, string>;
}

class PermissionError extends HttpError {
  constructor(message: string, requiredRole?: string) {
    super(403, message);
    this.name = "PermissionError";
    this.requiredRole = requiredRole;
  }

  requiredRole?: string;
}

// Usage:
export const updateTask = async (args, context) => {
  if (!context.user) throw new HttpError(401);

  if (!args.description) {
    throw new ValidationError("Validation failed", {
      description: "Description is required",
    });
  }

  const task = await context.entities.Task.findUnique({
    where: { id: args.id },
  });
  if (!task) throw new HttpError(404, "Task not found");

  if (task.userId !== context.user.id) {
    throw new PermissionError("You must be the task owner", "OWNER");
  }

  // ... update logic
};
```

### Concurrent Modification Handling

```typescript
export const updateTask = async (args, context) => {
  if (!context.user) throw new HttpError(401);

  const resource = await context.entities.Task.findUnique({
    where: { id: args.id },
  });

  if (!resource) throw new HttpError(404, "Task not found");

  // Check version to detect concurrent modifications
  if (resource.version !== args.expectedVersion) {
    throw new HttpError(
      409,
      "Resource was modified by another user. Please refresh.",
    );
  }

  return await context.entities.Task.update({
    where: { id: args.id },
    data: {
      ...args.data,
      version: { increment: 1 }, // Increment version on update
    },
  });
};
```

## Error Handling Checklist

### Server-side operations:

- [ ] Check auth first (401)
- [ ] Fetch resource
- [ ] Check resource exists (404)
- [ ] Check permissions (403)
- [ ] Validate input (400)
- [ ] Try/catch around DB operations (500)
- [ ] Re-throw HttpErrors
- [ ] Log errors for debugging
- [ ] Return user-friendly messages
- [ ] Handle Prisma unique constraint errors (409)

### Client-side components:

- [ ] Handle loading state (isLoading)
- [ ] Handle error state (error)
- [ ] Handle empty state
- [ ] Try/catch around actions
- [ ] Display error messages to user
- [ ] Reset error state on retry
- [ ] Provide fallback UI
- [ ] Confirm destructive actions
- [ ] Log errors for debugging

### Validation:

- [ ] Use Zod for complex validation
- [ ] Trim string inputs
- [ ] Check required fields
- [ ] Check length constraints
- [ ] Check format (email, URL, etc.)
- [ ] Custom business logic validation
- [ ] Provide clear error messages

## Critical Rules

### DO:

- Follow error sequence (401 → 404 → 403 → 400 → 500)
- Use HttpError from `wasp/server`
- Validate input with Zod
- Log errors for debugging
- Provide user-friendly messages
- Handle errors in try-catch
- Display loading/error states in UI
- Confirm destructive actions

### NEVER:

- Expose sensitive data in errors
- Skip auth checks
- Return generic "Error" messages
- Ignore validation
- Let errors crash the app
- Check permissions before existence (info leak!)
- Use `// @ts-ignore` to suppress errors
- Return stack traces to client

## Common Patterns Quick Reference

**Auth check:**

```typescript
if (!context.user) throw new HttpError(401);
```

**Existence check:**

```typescript
if (!resource) throw new HttpError(404, "Resource not found");
```

**Permission check:**

```typescript
if (resource.userId !== context.user.id) {
  throw new HttpError(403, "Not authorized");
}
```

**Validation:**

```typescript
if (!args.description?.trim()) {
  throw new HttpError(400, "Description is required");
}
```

**Try/catch:**

```typescript
try {
  return await context.entities.Task.update(...)
} catch (error) {
  if (error instanceof HttpError) throw error
  console.error('Operation failed:', error)
  throw new HttpError(500, 'Internal error')
}
```

**Client query:**

```typescript
const { data, isLoading, error } = useQuery(getQuery)
if (isLoading) return <Spinner />
if (error) return <ErrorDisplay error={error.message} />
```

**Client action:**

```typescript
try {
  await action(args);
  toast.success("Success!");
} catch (err) {
  toast.error(err.message);
}
```

## References

**Complete examples:** `/Users/toonvos/Projects/LEANAICOACH/lean-ai-coach-tl/.claude/templates/error-handling-patterns.ts`

**Line references in error-handling-patterns.ts:**

- Lines 15-31: HTTP status codes overview
- Lines 51-139: Complete operation pattern with all error types
- Lines 145-181: Simple patterns (auth only, delete)
- Lines 190-216: Unique constraint handling (409)
- Lines 226-362: Client-side error handling (queries, actions, forms)
- Lines 372-431: Zod validation patterns
- Lines 436-471: Advanced Zod refinements
- Lines 481-518: Retry logic
- Lines 525-557: Error logging
- Lines 564-603: Custom error classes
- Lines 609-638: Checklists
- Lines 644-663: Quick reference

**Additional resources:**

- CLAUDE.md#error-handling - HTTP status codes table
- CLAUDE.md#security - Security rules (never expose sensitive data)
- .claude/templates/operations-patterns.ts - Additional operation examples
