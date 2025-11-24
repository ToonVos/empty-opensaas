/**
 * Wasp Operations Patterns - Complete Examples
 *
 * This file contains copy-paste ready examples for Wasp operations (queries and actions).
 *
 * Quick Reference:
 * - Server-Side: Type annotations, auth checks, context.entities
 * - main.wasp: Configuration with entities list
 * - Client-Side: useQuery hook, direct action calls, useAction for optimistic UI
 *
 * Location: app/src/feature/operations.ts (one file per feature)
 */

// ============================================================
// SERVER-SIDE OPERATIONS
// ============================================================

import { HttpError } from 'wasp/server'
import type {
  GetTasks,
  GetTask,
  CreateTask,
  UpdateTask,
  DeleteTask
} from 'wasp/server/operations'
import type { Task } from 'wasp/entities'

// ------------------------------------------------------------
// QUERY EXAMPLE: Get All (with filtering)
// ------------------------------------------------------------

/**
 * Get all tasks for the authenticated user
 *
 * Key features:
 * - Auth check (context.user)
 * - Type annotation enables context.entities
 * - Optional filtering
 * - Returns array of entities
 */
export const getTasks: GetTasks<
  { status?: string }, // Args type
  Task[]               // Return type
> = async (args, context) => {
  // 1. ALWAYS check auth first
  if (!context.user) throw new HttpError(401)

  // 2. Build query with optional filters
  const where: any = { userId: context.user.id }
  if (args.status) {
    where.status = args.status
  }

  // 3. Query with context.entities (enabled by type annotation + main.wasp entities)
  return context.entities.Task.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      // Include related entities to avoid N+1 queries
      user: {
        select: { id: true, username: true }
      }
    }
  })
}

// ------------------------------------------------------------
// QUERY EXAMPLE: Get Single (with permission check)
// ------------------------------------------------------------

/**
 * Get a single task by ID
 *
 * Key features:
 * - Auth check
 * - Resource existence check (404)
 * - Permission check (403)
 * - Returns single entity or throws
 */
export const getTask: GetTask<
  { id: string },  // Args type
  Task             // Return type
> = async (args, context) => {
  // 1. Auth check
  if (!context.user) throw new HttpError(401)

  // 2. Fetch resource
  const task = await context.entities.Task.findUnique({
    where: { id: args.id },
    include: {
      user: {
        select: { id: true, username: true }
      }
    }
  })

  // 3. Check existence (404)
  if (!task) {
    throw new HttpError(404, 'Task not found')
  }

  // 4. Check permission (403)
  if (task.userId !== context.user.id) {
    throw new HttpError(403, 'Not authorized to access this task')
  }

  // 5. Return resource
  return task
}

// ------------------------------------------------------------
// ACTION EXAMPLE: Create (with validation)
// ------------------------------------------------------------

/**
 * Create a new task
 *
 * Key features:
 * - Auth check
 * - Input validation
 * - Auto-invalidates getTasks query (if same entities in main.wasp)
 * - Returns created entity
 */
export const createTask: CreateTask<
  { description: string; status?: string },  // Args type
  Task                                        // Return type
> = async (args, context) => {
  // 1. Auth check
  if (!context.user) throw new HttpError(401)

  // 2. Validate input
  if (!args.description?.trim()) {
    throw new HttpError(400, 'Description is required')
  }

  if (args.description.length > 500) {
    throw new HttpError(400, 'Description must be 500 characters or less')
  }

  // 3. Create entity
  const task = await context.entities.Task.create({
    data: {
      description: args.description.trim(),
      status: args.status || 'TODO',
      userId: context.user.id
    }
  })

  // 4. Return created entity
  // Note: getTasks query auto-refetches if entities match in main.wasp
  return task
}

// ------------------------------------------------------------
// ACTION EXAMPLE: Update (with validation + permission)
// ------------------------------------------------------------

/**
 * Update an existing task
 *
 * Key features:
 * - Auth check
 * - Resource existence check
 * - Permission check
 * - Input validation
 * - Partial updates
 */
export const updateTask: UpdateTask<
  { id: string; data: { description?: string; status?: string } },  // Args type
  Task                                                               // Return type
> = async (args, context) => {
  // 1. Auth check
  if (!context.user) throw new HttpError(401)

  // 2. Fetch existing resource
  const task = await context.entities.Task.findUnique({
    where: { id: args.id }
  })

  // 3. Check existence (404)
  if (!task) {
    throw new HttpError(404, 'Task not found')
  }

  // 4. Check permission (403)
  if (task.userId !== context.user.id) {
    throw new HttpError(403, 'Not authorized to update this task')
  }

  // 5. Validate input (if provided)
  if (args.data.description !== undefined) {
    if (!args.data.description.trim()) {
      throw new HttpError(400, 'Description cannot be empty')
    }
    if (args.data.description.length > 500) {
      throw new HttpError(400, 'Description must be 500 characters or less')
    }
  }

  // 6. Update entity
  const updatedTask = await context.entities.Task.update({
    where: { id: args.id },
    data: {
      ...(args.data.description && { description: args.data.description.trim() }),
      ...(args.data.status && { status: args.data.status })
    }
  })

  // 7. Return updated entity
  return updatedTask
}

// ------------------------------------------------------------
// ACTION EXAMPLE: Delete (with permission check)
// ------------------------------------------------------------

/**
 * Delete a task
 *
 * Key features:
 * - Auth check
 * - Resource existence check
 * - Permission check
 * - Returns deleted entity
 */
export const deleteTask: DeleteTask<
  { id: string },  // Args type
  Task             // Return type
> = async (args, context) => {
  // 1. Auth check
  if (!context.user) throw new HttpError(401)

  // 2. Fetch existing resource
  const task = await context.entities.Task.findUnique({
    where: { id: args.id }
  })

  // 3. Check existence (404)
  if (!task) {
    throw new HttpError(404, 'Task not found')
  }

  // 4. Check permission (403)
  if (task.userId !== context.user.id) {
    throw new HttpError(403, 'Not authorized to delete this task')
  }

  // 5. Delete entity
  const deletedTask = await context.entities.Task.delete({
    where: { id: args.id }
  })

  // 6. Return deleted entity
  return deletedTask
}

// ============================================================
// MAIN.WASP CONFIGURATION
// ============================================================

/**
 * Add these blocks to app/main.wasp
 *
 * Key rules:
 * - Use @src/ prefix for imports
 * - List entities for context.entities access + auto-invalidation
 * - Query and action with same entities = auto-invalidation
 */

/*
// Query: Get all tasks
query getTasks {
  fn: import { getTasks } from "@src/server/a3/operations",
  entities: [Task]  // Required for context.entities + auto-invalidation
}

// Query: Get single task
query getTask {
  fn: import { getTask } from "@src/server/a3/operations",
  entities: [Task]
}

// Action: Create task
action createTask {
  fn: import { createTask } from "@src/server/a3/operations",
  entities: [Task]  // Same as getTasks → auto-invalidates getTasks!
}

// Action: Update task
action updateTask {
  fn: import { updateTask } from "@src/server/a3/operations",
  entities: [Task]  // Same as getTasks → auto-invalidates getTasks!
}

// Action: Delete task
action deleteTask {
  fn: import { deleteTask } from "@src/server/a3/operations",
  entities: [Task]  // Same as getTasks → auto-invalidates getTasks!
}
*/

// ============================================================
// CLIENT-SIDE USAGE
// ============================================================

/**
 * Example React component using operations
 */

/*
import { useQuery, createTask, updateTask, deleteTask } from 'wasp/client/operations'

function TasksPage() {
  // ------------------------------------------------------------
  // QUERIES: Use useQuery hook
  // ------------------------------------------------------------

  const {
    data: tasks,      // Task[] | undefined
    isLoading,        // boolean
    error             // Error | undefined
  } = useQuery(getTasks, { status: 'TODO' })  // Optional args

  // Handle loading state
  if (isLoading) return <div>Loading...</div>

  // Handle error state
  if (error) return <div>Error: {error.message}</div>

  // Handle empty state
  if (!tasks || tasks.length === 0) return <div>No tasks</div>

  // ------------------------------------------------------------
  // ACTIONS: Direct async/await (default approach)
  // ------------------------------------------------------------

  const handleCreate = async (description: string) => {
    try {
      // Direct call - Wasp auto-refetches getTasks query!
      await createTask({ description, status: 'TODO' })
      toast.success('Task created')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create task')
    }
  }

  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateTask({ id, data })
      toast.success('Task updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update task')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTask({ id })
      toast.success('Task deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  // ------------------------------------------------------------
  // ACTIONS: useAction for optimistic UI (advanced)
  // ------------------------------------------------------------

  // Only use this if you want optimistic updates!
  const deleteTaskFn = useAction(deleteTask, {
    optimisticUpdates: [
      {
        // Which query to update
        getQuerySpecifier: () => [getTasks],
        // How to update it optimistically
        updateQuery: (oldTasks, { id }) => {
          return oldTasks.filter((task) => task.id !== id)
        }
      }
    ]
  })

  const handleOptimisticDelete = async (id: string) => {
    try {
      // UI updates immediately (optimistic)
      // Query refetches in background (actual)
      await deleteTaskFn({ id })
      toast.success('Task deleted')
    } catch (err) {
      // Optimistic update reverted if error
      toast.error('Failed to delete task')
    }
  }

  // Render tasks
  return (
    <div>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
*/

// ============================================================
// ADVANCED PATTERNS
// ============================================================

// ------------------------------------------------------------
// Pattern: Complex Permission Check
// ------------------------------------------------------------

/**
 * Check if user can access resource based on multiple criteria
 */
async function canAccessTask(
  userId: string,
  taskId: string,
  context: any
): Promise<boolean> {
  const task = await context.entities.Task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        include: {
          members: true
        }
      }
    }
  })

  if (!task) return false

  // Owner can access
  if (task.userId === userId) return true

  // Project members can access
  if (task.project?.members.some((m: any) => m.userId === userId)) {
    return true
  }

  // Organization admins can access
  const userRole = await getUserOrgRole(userId, task.organizationId, context)
  if (['OWNER', 'ADMIN'].includes(userRole)) return true

  return false
}

// ------------------------------------------------------------
// Pattern: Input Validation with Zod
// ------------------------------------------------------------

/*
import { z } from 'zod'

const CreateTaskSchema = z.object({
  description: z.string().min(1, 'Description required').max(500, 'Too long'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  dueDate: z.string().datetime().optional()
})

export const createTask: CreateTask = async (args, context) => {
  if (!context.user) throw new HttpError(401)

  try {
    const validated = CreateTaskSchema.parse(args)
    return await context.entities.Task.create({
      data: { ...validated, userId: context.user.id }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
      throw new HttpError(400, messages.join(', '))
    }
    throw error
  }
}
*/

// ------------------------------------------------------------
// Pattern: Pagination
// ------------------------------------------------------------

/*
export const getTasks: GetTasks<
  { page?: number; pageSize?: number },
  { tasks: Task[]; total: number; hasMore: boolean }
> = async (args, context) => {
  if (!context.user) throw new HttpError(401)

  const page = args.page || 0
  const pageSize = args.pageSize || 20

  const [tasks, total] = await Promise.all([
    context.entities.Task.findMany({
      where: { userId: context.user.id },
      skip: page * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' }
    }),
    context.entities.Task.count({
      where: { userId: context.user.id }
    })
  ])

  return {
    tasks,
    total,
    hasMore: (page + 1) * pageSize < total
  }
}
*/

// ------------------------------------------------------------
// Pattern: Bulk Operations
// ------------------------------------------------------------

/*
export const deleteMultipleTasks: DeleteMultipleTasks<
  { ids: string[] },
  { count: number }
> = async (args, context) => {
  if (!context.user) throw new HttpError(401)

  // Verify user owns all tasks
  const tasks = await context.entities.Task.findMany({
    where: { id: { in: args.ids } }
  })

  const unauthorized = tasks.filter((task) => task.userId !== context.user.id)
  if (unauthorized.length > 0) {
    throw new HttpError(403, 'Not authorized to delete some tasks')
  }

  // Bulk delete
  const result = await context.entities.Task.deleteMany({
    where: {
      id: { in: args.ids },
      userId: context.user.id
    }
  })

  return { count: result.count }
}
*/

// ============================================================
// KEY RULES SUMMARY
// ============================================================

/**
 * 1. Type Annotations are CRITICAL
 *    - GetQuery<Args, Return>
 *    - CreateAction<Args, Return>
 *    - Without types: context.entities is undefined!
 *
 * 2. ALWAYS Check Auth First
 *    - if (!context.user) throw new HttpError(401)
 *    - First line of every operation
 *
 * 3. List Entities in main.wasp
 *    - Required for context.entities access
 *    - Enables auto-invalidation between queries/actions
 *
 * 4. useAction ONLY for Optimistic UI
 *    - Default: Direct await action(args)
 *    - Optimistic: useAction with optimisticUpdates
 *
 * 5. Error Handling Pattern
 *    - 401: Not authenticated (no user)
 *    - 403: Not authorized (no permission)
 *    - 404: Resource not found
 *    - 400: Bad request (validation error)
 *
 * 6. Avoid N+1 Queries
 *    - Use Prisma include for relations
 *    - Fetch related data in single query
 *
 * 7. Validate Input
 *    - Check required fields
 *    - Check length constraints
 *    - Use Zod for complex validation
 *
 * 8. Restart After Changes
 *    - ALWAYS restart wasp after main.wasp changes
 *    - Types only regenerate on restart
 */
