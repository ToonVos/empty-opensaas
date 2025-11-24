/**
 * Error Handling Patterns - Complete Examples
 *
 * This file contains copy-paste ready error handling patterns for Wasp applications.
 *
 * Quick Reference:
 * - HTTP Status Codes (401, 403, 404, 400, 409, 500)
 * - Server-Side Pattern (operations)
 * - Client-Side Pattern (React components)
 * - Input Validation (Zod)
 *
 * See also: CLAUDE.md#error-handling for quick reference table
 */

import { HttpError } from 'wasp/server'
import { z } from 'zod'

// ============================================================
// HTTP STATUS CODES
// ============================================================

/**
 * Standard HTTP error codes for Wasp operations
 *
 * 401 Unauthorized      - Not authenticated (context.user is null)
 * 403 Forbidden         - Authenticated but no permission
 * 404 Not Found         - Resource doesn't exist
 * 400 Bad Request       - Invalid input / validation error
 * 409 Conflict          - Resource conflict (e.g., duplicate email)
 * 500 Internal Error    - Unexpected server error
 */

// ============================================================
// SERVER-SIDE ERROR HANDLING
// ============================================================

/**
 * Complete operation with all error handling patterns
 *
 * Demonstrates:
 * - Auth check (401)
 * - Resource existence check (404)
 * - Permission check (403)
 * - Input validation (400)
 * - Try/catch for unexpected errors (500)
 */

import type { UpdateTask } from 'wasp/server/operations'
import type { Task } from 'wasp/entities'

export const updateTask: UpdateTask = async (args, context) => {
  // ------------------------------------------------------------
  // 1. AUTH CHECK (401)
  // ------------------------------------------------------------
  // ALWAYS first line of every operation
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated')
  }

  // ------------------------------------------------------------
  // 2. FETCH RESOURCE
  // ------------------------------------------------------------
  const task = await context.entities.Task.findUnique({
    where: { id: args.id },
    include: {
      // Include relations if needed for permission check
      project: {
        include: { members: true }
      }
    }
  })

  // ------------------------------------------------------------
  // 3. EXISTENCE CHECK (404)
  // ------------------------------------------------------------
  if (!task) {
    throw new HttpError(404, 'Task not found')
  }

  // ------------------------------------------------------------
  // 4. PERMISSION CHECK (403)
  // ------------------------------------------------------------
  // Check if user has permission to access this resource
  const hasPermission =
    task.userId === context.user.id || // Owner
    task.project?.members.some((m) => m.userId === context.user.id) || // Project member
    await isOrgAdmin(context.user.id, task.organizationId, context) // Org admin

  if (!hasPermission) {
    throw new HttpError(403, 'Not authorized to update this task')
  }

  // ------------------------------------------------------------
  // 5. INPUT VALIDATION (400)
  // ------------------------------------------------------------
  if (args.data.description !== undefined) {
    if (!args.data.description?.trim()) {
      throw new HttpError(400, 'Description cannot be empty')
    }

    if (args.data.description.length > 500) {
      throw new HttpError(400, 'Description must be 500 characters or less')
    }
  }

  if (args.data.status !== undefined) {
    const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE']
    if (!validStatuses.includes(args.data.status)) {
      throw new HttpError(400, `Status must be one of: ${validStatuses.join(', ')}`)
    }
  }

  // ------------------------------------------------------------
  // 6. TRY/CATCH FOR DATABASE ERRORS (500)
  // ------------------------------------------------------------
  try {
    const updatedTask = await context.entities.Task.update({
      where: { id: args.id },
      data: {
        ...(args.data.description && { description: args.data.description.trim() }),
        ...(args.data.status && { status: args.data.status }),
        updatedAt: new Date()
      }
    })

    return updatedTask
  } catch (error) {
    // Re-throw known HttpErrors
    if (error instanceof HttpError) {
      throw error
    }

    // Log unexpected errors (helps debugging)
    console.error('Failed to update task:', error)

    // Return generic 500 error (don't expose internal details)
    throw new HttpError(500, 'Failed to update task. Please try again.')
  }
}

// ------------------------------------------------------------
// Pattern: Auth Check Only
// ------------------------------------------------------------

/**
 * Simple operation that only needs auth check
 */
export const getMyProfile: GetMyProfile = async (_args, context) => {
  if (!context.user) throw new HttpError(401)

  return context.entities.User.findUnique({
    where: { id: context.user.id }
  })
}

// ------------------------------------------------------------
// Pattern: Resource Existence + Permission
// ------------------------------------------------------------

/**
 * Delete operation with existence and permission checks
 */
export const deleteTask: DeleteTask = async (args, context) => {
  if (!context.user) throw new HttpError(401)

  const task = await context.entities.Task.findUnique({
    where: { id: args.id }
  })

  if (!task) {
    throw new HttpError(404, 'Task not found')
  }

  if (task.userId !== context.user.id) {
    throw new HttpError(403, 'Not authorized to delete this task')
  }

  return context.entities.Task.delete({
    where: { id: args.id }
  })
}

// ------------------------------------------------------------
// Pattern: Unique Constraint Violation (409)
// ------------------------------------------------------------

/**
 * Handle unique constraint violations (e.g., duplicate email)
 */
export const createOrganization: CreateOrganization = async (args, context) => {
  if (!context.user) throw new HttpError(401)

  // Check for duplicate
  const existing = await context.entities.Organization.findUnique({
    where: { name: args.name }
  })

  if (existing) {
    throw new HttpError(409, 'An organization with this name already exists')
  }

  try {
    return await context.entities.Organization.create({
      data: {
        name: args.name,
        ownerId: context.user.id
      }
    })
  } catch (error) {
    // Handle Prisma unique constraint error (P2002)
    if (error.code === 'P2002') {
      throw new HttpError(409, 'An organization with this name already exists')
    }
    throw error
  }
}

// ============================================================
// CLIENT-SIDE ERROR HANDLING
// ============================================================

/**
 * React component with error handling for queries and actions
 */

/*
import { useQuery, updateTask, deleteTask } from 'wasp/client/operations'
import { toast } from 'react-hot-toast'

function TasksPage() {
  // ------------------------------------------------------------
  // QUERY ERROR HANDLING
  // ------------------------------------------------------------
  // useQuery provides built-in error handling

  const {
    data: tasks,
    isLoading,
    error
  } = useQuery(getTasks)

  // Handle loading state
  if (isLoading) {
    return <div className="flex justify-center p-8">
      <Spinner />
    </div>
  }

  // Handle error state
  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded p-4">
      <h3 className="text-red-800 font-semibold">Error Loading Tasks</h3>
      <p className="text-red-600">{error.message}</p>
      <button onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  }

  // Handle empty state
  if (!tasks || tasks.length === 0) {
    return <div className="text-center p-8 text-gray-500">
      No tasks yet. Create your first task!
    </div>
  }

  // ------------------------------------------------------------
  // ACTION ERROR HANDLING
  // ------------------------------------------------------------
  // Actions: Try/catch with user feedback

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

  // ------------------------------------------------------------
  // FORM SUBMISSION ERROR HANDLING
  // ------------------------------------------------------------

  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)

    const formData = new FormData(e.currentTarget)
    const description = formData.get('description') as string

    // Client-side validation
    if (!description.trim()) {
      setFormError('Description is required')
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
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input name="description" />
        {formError && (
          <div className="text-red-600 text-sm mt-1">{formError}</div>
        )}
        <button type="submit">Create</button>
      </form>

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
// INPUT VALIDATION WITH ZOD
// ============================================================

/**
 * Zod schema for complex validation
 */

const CreateTaskSchema = z.object({
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must be 500 characters or less')
    .trim(),

  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE'])
    .optional()
    .default('TODO'),

  priority: z.enum(['LOW', 'MEDIUM', 'HIGH'])
    .optional(),

  dueDate: z.string()
    .datetime()
    .optional(),

  tags: z.array(z.string())
    .max(10, 'Maximum 10 tags allowed')
    .optional(),

  assigneeId: z.string()
    .uuid()
    .optional()
})

/**
 * Operation using Zod validation
 */
export const createTask: CreateTask = async (args, context) => {
  if (!context.user) throw new HttpError(401)

  try {
    // Validate and parse input
    const validated = CreateTaskSchema.parse(args)

    // Create with validated data
    return await context.entities.Task.create({
      data: {
        ...validated,
        userId: context.user.id
      }
    })
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      // Format validation errors for user
      const messages = error.errors.map((e) => {
        const field = e.path.join('.')
        const message = e.message
        return `${field}: ${message}`
      })

      throw new HttpError(400, messages.join(', '))
    }

    // Handle other errors
    throw error
  }
}

/**
 * Advanced Zod validation with custom refinements
 */
const UpdateTaskSchema = z.object({
  description: z.string().min(1).max(500).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  dueDate: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional()
})
  .refine(
    (data) => {
      // Custom validation: completedAt only allowed if status is DONE
      if (data.completedAt && data.status !== 'DONE') {
        return false
      }
      return true
    },
    {
      message: 'completedAt can only be set when status is DONE',
      path: ['completedAt']
    }
  )
  .refine(
    (data) => {
      // Custom validation: dueDate must be in future
      if (data.dueDate) {
        const dueDate = new Date(data.dueDate)
        if (dueDate < new Date()) {
          return false
        }
      }
      return true
    },
    {
      message: 'dueDate must be in the future',
      path: ['dueDate']
    }
  )

// ============================================================
// ADVANCED ERROR PATTERNS
// ============================================================

// ------------------------------------------------------------
// Pattern: Retry Logic for Transient Errors
// ------------------------------------------------------------

/*
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      // Don't retry on client errors (4xx)
      if (error instanceof HttpError && error.statusCode < 500) {
        throw error
      }

      // Last attempt - throw error
      if (attempt === maxRetries) {
        throw error
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
    }
  }

  throw new Error('Retry logic failed')
}

export const createTask: CreateTask = async (args, context) => {
  if (!context.user) throw new HttpError(401)

  // Retry on transient errors (network issues, DB locks, etc.)
  return withRetry(async () => {
    return await context.entities.Task.create({
      data: { ...args, userId: context.user.id }
    })
  })
}
*/

// ------------------------------------------------------------
// Pattern: Error Logging / Monitoring
// ------------------------------------------------------------

/*
function logError(error: any, context: { operation: string; userId?: string; args?: any }) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Operation error:', {
      operation: context.operation,
      userId: context.userId,
      args: context.args,
      error: error.message,
      stack: error.stack
    })
  }

  // Send to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Sentry, LogRocket, etc.
    // sentry.captureException(error, { extra: context })
  }
}

export const updateTask: UpdateTask = async (args, context) => {
  try {
    if (!context.user) throw new HttpError(401)
    // ... operation logic
  } catch (error) {
    logError(error, {
      operation: 'updateTask',
      userId: context.user?.id,
      args
    })
    throw error
  }
}
*/

// ------------------------------------------------------------
// Pattern: Custom Error Classes
// ------------------------------------------------------------

/*
class ValidationError extends HttpError {
  constructor(message: string, fields?: Record<string, string>) {
    super(400, message)
    this.name = 'ValidationError'
    this.fields = fields
  }

  fields?: Record<string, string>
}

class PermissionError extends HttpError {
  constructor(message: string, requiredRole?: string) {
    super(403, message)
    this.name = 'PermissionError'
    this.requiredRole = requiredRole
  }

  requiredRole?: string
}

// Usage:
export const updateTask: UpdateTask = async (args, context) => {
  if (!context.user) throw new HttpError(401)

  if (!args.description) {
    throw new ValidationError('Validation failed', {
      description: 'Description is required'
    })
  }

  const task = await context.entities.Task.findUnique({ where: { id: args.id } })
  if (!task) throw new HttpError(404, 'Task not found')

  if (task.userId !== context.user.id) {
    throw new PermissionError('You must be the task owner', 'OWNER')
  }

  // ... update logic
}
*/

// ============================================================
// ERROR HANDLING CHECKLIST
// ============================================================

/**
 * Server-Side Operations:
 * - [ ] Auth check first line (401)
 * - [ ] Fetch resource
 * - [ ] Check resource exists (404)
 * - [ ] Check permission (403)
 * - [ ] Validate input (400)
 * - [ ] Try/catch around DB operations (500)
 * - [ ] Re-throw HttpErrors
 * - [ ] Log unexpected errors
 * - [ ] Return generic 500 message
 *
 * Client-Side Components:
 * - [ ] Handle loading state
 * - [ ] Handle error state
 * - [ ] Handle empty state
 * - [ ] Try/catch around actions
 * - [ ] Display user-friendly errors
 * - [ ] Log errors for debugging
 * - [ ] Toast/alert for feedback
 * - [ ] Confirm destructive actions
 *
 * Validation:
 * - [ ] Use Zod for complex validation
 * - [ ] Trim string inputs
 * - [ ] Check required fields
 * - [ ] Check length constraints
 * - [ ] Check format (email, URL, etc.)
 * - [ ] Custom business logic validation
 */

// ============================================================
// QUICK REFERENCE
// ============================================================

/**
 * HTTP Status Codes:
 * - 401: Not authenticated → if (!context.user) throw new HttpError(401)
 * - 403: Not authorized → if (task.userId !== context.user.id) throw new HttpError(403)
 * - 404: Not found → if (!task) throw new HttpError(404, 'Task not found')
 * - 400: Bad request → throw new HttpError(400, 'Description required')
 * - 409: Conflict → throw new HttpError(409, 'Email already exists')
 * - 500: Server error → throw new HttpError(500, 'Internal error')
 *
 * Client Error Handling:
 * - useQuery: { data, isLoading, error } = useQuery(getQuery)
 * - Actions: try { await action() } catch (err) { toast.error(err.message) }
 *
 * Validation:
 * - Zod: const schema = z.object({ field: z.string().min(1) })
 * - Parse: const validated = schema.parse(input)
 * - Catch: catch (error) { if (error instanceof z.ZodError) ... }
 *
 * See also: CLAUDE.md#error-handling for patterns overview
 */
