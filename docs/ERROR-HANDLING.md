# Error Handling Patterns (Complete Guide)

**Quick Reference**: [CLAUDE.md#error-handling](../CLAUDE.md#error-handling)

**Skill**: `error-handling` - Complete error handling patterns

**Templates**: `.claude/templates/error-handling-patterns.ts`

---

## HTTP Status Codes

### Standard Status Codes

| Code    | Name           | When to Use            | Example                                            |
| ------- | -------------- | ---------------------- | -------------------------------------------------- |
| **200** | OK             | Successful request     | `return data`                                      |
| **201** | Created        | Resource created       | `return newTask`                                   |
| **400** | Bad Request    | Validation error       | `throw new HttpError(400, 'Invalid input')`        |
| **401** | Unauthorized   | Not authenticated      | `throw new HttpError(401, 'Not authenticated')`    |
| **403** | Forbidden      | No permission          | `throw new HttpError(403, 'Not authorized')`       |
| **404** | Not Found      | Resource doesn't exist | `throw new HttpError(404, 'Task not found')`       |
| **409** | Conflict       | Duplicate resource     | `throw new HttpError(409, 'Email already exists')` |
| **500** | Internal Error | Unexpected error       | `throw new HttpError(500, 'Internal error')`       |

### When to Use Each Code

**401 Unauthorized** - User not logged in:

```typescript
if (!context.user) {
  throw new HttpError(401, "You must be logged in");
}
```

**403 Forbidden** - User logged in but no permission:

```typescript
if (task.userId !== context.user.id) {
  throw new HttpError(403, "You do not have permission to edit this task");
}
```

**404 Not Found** - Resource doesn't exist:

```typescript
const task = await context.entities.Task.findUnique({ where: { id: args.id } });
if (!task) {
  throw new HttpError(404, "Task not found");
}
```

**400 Bad Request** - Invalid input:

```typescript
if (!args.title || args.title.trim() === "") {
  throw new HttpError(400, "Task title is required");
}
```

**409 Conflict** - Duplicate resource:

```typescript
const existing = await context.entities.User.findUnique({
  where: { email: args.email },
});
if (existing) {
  throw new HttpError(409, "User with this email already exists");
}
```

---

## Operation Error Handling Pattern

### Complete Operation Template

```typescript
// File: src/server/tasks/operations.ts
import type { UpdateTask } from "wasp/server/operations";
import { HttpError } from "wasp/server";

export const updateTask: UpdateTask = async (args, context) => {
  // 1. Authentication check (401)
  if (!context.user) {
    throw new HttpError(401, "Not authenticated");
  }

  // 2. Input validation (400)
  if (!args.id) {
    throw new HttpError(400, "Task ID is required");
  }

  if (args.title && args.title.trim() === "") {
    throw new HttpError(400, "Task title cannot be empty");
  }

  // 3. Resource existence check (404)
  const task = await context.entities.Task.findUnique({
    where: { id: args.id },
  });

  if (!task) {
    throw new HttpError(404, "Task not found");
  }

  // 4. Permission check (403)
  if (task.userId !== context.user.id) {
    throw new HttpError(403, "You do not have permission to update this task");
  }

  // 5. Business logic validation (400 or 409)
  if (args.status === "completed" && task.priority === "high") {
    // Example business rule
    throw new HttpError(
      400,
      "High priority tasks require manager approval before completion",
    );
  }

  // 6. Perform operation (with error handling)
  try {
    return await context.entities.Task.update({
      where: { id: args.id },
      data: {
        title: args.title,
        description: args.description,
        status: args.status,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    // 7. Catch unexpected errors (500)
    console.error("Error updating task:", error);
    throw new HttpError(500, "Failed to update task");
  }
};
```

### Error Handling Checklist

**Every operation should check (in order):**

1. ✅ **Authentication** (`!context.user`) → 401
2. ✅ **Input validation** (required fields, format) → 400
3. ✅ **Resource existence** (findUnique returns null?) → 404
4. ✅ **Authorization** (user owns resource?) → 403
5. ✅ **Business logic** (custom rules) → 400 or 409
6. ✅ **Database errors** (try/catch) → 500

---

## Client-Side Error Handling

### Using useQuery (Read Operations)

```typescript
// File: src/pages/TasksPage.tsx
import { useQuery } from 'wasp/client/operations'
import { getTasks } from 'wasp/client/operations'

export function TasksPage() {
  const { data: tasks, error, isLoading } = useQuery(getTasks)

  // Handle loading state
  if (isLoading) {
    return <div>Loading tasks...</div>
  }

  // Handle errors
  if (error) {
    if (error.statusCode === 401) {
      return <div>Please log in to view tasks</div>
    }

    if (error.statusCode === 403) {
      return <div>You do not have permission to view these tasks</div>
    }

    // Generic error
    return <div>Error loading tasks: {error.message}</div>
  }

  // Render data
  return (
    <div>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
```

### Direct Action Calls (Write Operations)

```typescript
// File: src/components/TaskForm.tsx
import { createTask } from 'wasp/client/operations'
import { toast } from 'react-hot-toast'

export function TaskForm() {
  const handleSubmit = async (data: CreateTaskInput) => {
    try {
      await createTask(data)
      toast.success('Task created successfully!')
      // Navigate or refresh
    } catch (error) {
      if (error.statusCode === 400) {
        toast.error(`Invalid input: ${error.message}`)
      } else if (error.statusCode === 401) {
        toast.error('Please log in to create tasks')
      } else if (error.statusCode === 403) {
        toast.error('You do not have permission to create tasks')
      } else {
        toast.error('Failed to create task. Please try again.')
      }
    }
  }

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>
}
```

---

## Input Validation with Zod

### Server-Side Validation

```typescript
// File: src/server/tasks/operations.ts
import { z } from "zod";
import { HttpError } from "wasp/server";

const CreateTaskInput = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(5000, "Description too long").optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.date().optional(),
});

export const createTask = async (args, context) => {
  if (!context.user) throw new HttpError(401);

  // Validate input
  try {
    const validated = CreateTaskInput.parse(args);

    return await context.entities.Task.create({
      data: {
        ...validated,
        userId: context.user.id,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return validation errors
      throw new HttpError(400, error.errors[0].message);
    }
    throw error;
  }
};
```

### Client-Side Validation (React Hook Form + Zod)

```typescript
// File: src/components/TaskForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const TaskFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(5000).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional()
})

type TaskFormData = z.infer<typeof TaskFormSchema>

export function TaskForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TaskFormData>({
    resolver: zodResolver(TaskFormSchema)
  })

  const onSubmit = async (data: TaskFormData) => {
    try {
      await createTask(data)
      toast.success('Task created!')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}

      <textarea {...register('description')} />
      {errors.description && <span>{errors.description.message}</span>}

      <button type="submit">Create Task</button>
    </form>
  )
}
```

---

## Error Messages Best Practices

### Good Error Messages

**✅ GOOD - Specific and actionable:**

```typescript
throw new HttpError(400, "Task title must be between 1 and 200 characters");
throw new HttpError(403, "Only task owner or managers can edit this task");
throw new HttpError(
  409,
  "A task with this title already exists in this project",
);
```

**❌ BAD - Vague or unhelpful:**

```typescript
throw new HttpError(400, "Invalid input");
throw new HttpError(403, "Access denied");
throw new HttpError(500, "Error");
```

### Error Message Guidelines

1. **Be specific**: Tell user exactly what went wrong
2. **Be actionable**: Explain how to fix it
3. **Be professional**: No technical jargon for user-facing errors
4. **Don't expose internals**: No database errors or stack traces to users

---

## Retry Logic (Client-Side)

### Automatic Retry with Exponential Backoff

```typescript
// File: src/lib/retryOperation.ts
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry client errors (4xx)
      if (
        error.statusCode &&
        error.statusCode >= 400 &&
        error.statusCode < 500
      ) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayMs * Math.pow(2, attempt)),
        );
      }
    }
  }

  throw lastError;
}

// Usage
const tasks = await retryOperation(() => getTasks());
```

---

## Logging Errors (Server-Side)

### Production Error Logging

```typescript
// File: src/server/tasks/operations.ts
export const deleteTask = async (args, context) => {
  if (!context.user) throw new HttpError(401);

  try {
    const task = await context.entities.Task.delete({
      where: { id: args.id },
    });

    // Log successful operations (optional)
    console.log(`Task deleted by user ${context.user.id}: ${args.id}`);

    return task;
  } catch (error) {
    // Log errors with context
    console.error("Error deleting task:", {
      taskId: args.id,
      userId: context.user.id,
      error: error.message,
      stack: error.stack,
    });

    // Don't expose internal error to user
    throw new HttpError(500, "Failed to delete task");
  }
};
```

### Structured Logging (TODO)

```typescript
// TODO: Add winston or pino for production
import logger from "../utils/logger";

logger.error("Task deletion failed", {
  taskId: args.id,
  userId: context.user.id,
  error,
});
```

---

## Global Error Boundary (React)

### Error Boundary Component

```typescript
// File: src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error boundary caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page">
          <h1>Something went wrong</h1>
          <p>We've been notified and will fix this soon.</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

**Usage in App.tsx:**

```typescript
import { ErrorBoundary } from './components/ErrorBoundary'

export function App() {
  return (
    <ErrorBoundary>
      {/* Your app */}
    </ErrorBoundary>
  )
}
```

---

## See Also

- **[CLAUDE.md#error-handling](../CLAUDE.md#error-handling)** - Quick reference
- **Skill**: `error-handling` - Complete error patterns
- **Templates**: `.claude/templates/error-handling-patterns.ts` - Code examples
- **Templates**: `.claude/templates/operations-patterns.ts` - Operation examples
