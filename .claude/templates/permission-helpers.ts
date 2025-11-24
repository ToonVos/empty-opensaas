/**
 * Permission Helper Functions
 *
 * Copy-paste ready permission checking patterns for multi-tenant architecture.
 *
 * Architecture:
 * - Organization → Many Departments (hierarchical tree via parentId)
 * - Users ↔ Departments = Many-to-Many via UserDepartment junction
 * - DepartmentRole: MANAGER | MEMBER | VIEWER
 * - OrganizationRole: OWNER | ADMIN | MEMBER
 *
 * Quick Reference:
 * - canAccessDocument() - Check if user can access document
 * - getUserOrgRole() - Get user's role in organization
 * - getUserDepartments() - Get user's department memberships
 * - getUserRoleInDepartment() - Get user's role in specific department
 * - isOrgAdmin() - Check if user is org admin/owner
 * - isDepartmentManager() - Check if user manages department
 * - canEditDocument() - Check if user can edit document
 * - canDeleteDocument() - Check if user can delete document
 *
 * See also: CLAUDE.md#permissions for compact examples
 */

import { HttpError } from 'wasp/server'
import type { User, Document, Organization, Department } from 'wasp/entities'

// ============================================================
// CORE PERMISSION CHECKERS
// ============================================================

/**
 * Check if user can access document
 *
 * Access granted if:
 * - User is the author (owner)
 * - User is organization OWNER/ADMIN
 * - User is in the department (any role: MANAGER, MEMBER, VIEWER)
 *
 * @returns true if user has access, false otherwise
 */
export async function canAccessDocument(
  userId: string,
  a3: Document,
  context: any
): Promise<boolean> {
  // 1. Check if user is the author (owner)
  if (a3.authorId === userId) return true

  // 2. Check if user is organization admin/owner
  const orgRole = await getUserOrgRole(userId, a3.organizationId, context)
  if (['OWNER', 'ADMIN'].includes(orgRole)) return true

  // 3. Check if user is in the department (any role)
  const deptMemberships = await getUserDepartments(userId, context)
  return deptMemberships.some(
    (dm) =>
      dm.departmentId === a3.departmentId &&
      ['MANAGER', 'MEMBER', 'VIEWER'].includes(dm.role)
  )
}

/**
 * Check if user can edit document
 *
 * Edit permissions:
 * - Author can always edit
 * - Org OWNER/ADMIN can edit
 * - Department MANAGER can edit
 * - Department MEMBER can edit their own
 * - VIEWER cannot edit
 */
export async function canEditDocument(
  userId: string,
  a3: Document,
  context: any
): Promise<boolean> {
  // Author can always edit
  if (a3.authorId === userId) return true

  // Org admins can edit
  const orgRole = await getUserOrgRole(userId, a3.organizationId, context)
  if (['OWNER', 'ADMIN'].includes(orgRole)) return true

  // Department managers can edit
  const deptRole = await getUserRoleInDepartment(userId, a3.departmentId, context)
  if (deptRole === 'MANAGER') return true

  // Members cannot edit others' documents
  // Viewers cannot edit
  return false
}

/**
 * Check if user can delete document
 *
 * Delete permissions:
 * - Author can delete
 * - Org OWNER/ADMIN can delete
 * - Department MANAGER can delete
 */
export async function canDeleteDocument(
  userId: string,
  a3: Document,
  context: any
): Promise<boolean> {
  // Author can delete
  if (a3.authorId === userId) return true

  // Org admins can delete
  const orgRole = await getUserOrgRole(userId, a3.organizationId, context)
  if (['OWNER', 'ADMIN'].includes(orgRole)) return true

  // Department managers can delete
  const deptRole = await getUserRoleInDepartment(userId, a3.departmentId, context)
  if (deptRole === 'MANAGER') return true

  return false
}

// ============================================================
// ORGANIZATION HELPERS
// ============================================================

/**
 * Get user's role in an organization
 *
 * @returns 'OWNER' | 'ADMIN' | 'MEMBER' | 'NONE'
 */
export async function getUserOrgRole(
  userId: string,
  organizationId: string,
  context: any
): Promise<string> {
  const membership = await context.entities.OrganizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId
      }
    }
  })

  return membership?.role || 'NONE'
}

/**
 * Check if user is organization owner or admin
 */
export async function isOrgAdmin(
  userId: string,
  organizationId: string,
  context: any
): Promise<boolean> {
  const role = await getUserOrgRole(userId, organizationId, context)
  return ['OWNER', 'ADMIN'].includes(role)
}

/**
 * Get all organizations user belongs to
 */
export async function getUserOrganizations(
  userId: string,
  context: any
): Promise<Organization[]> {
  const memberships = await context.entities.OrganizationMember.findMany({
    where: { userId },
    include: { organization: true }
  })

  return memberships.map((m) => m.organization)
}

/**
 * Check if user can access organization
 */
export async function canAccessOrganization(
  userId: string,
  organizationId: string,
  context: any
): Promise<boolean> {
  const role = await getUserOrgRole(userId, organizationId, context)
  return role !== 'NONE'
}

/**
 * Check if user can manage organization (OWNER/ADMIN only)
 */
export async function canManageOrganization(
  userId: string,
  organizationId: string,
  context: any
): Promise<boolean> {
  return await isOrgAdmin(userId, organizationId, context)
}

// ============================================================
// DEPARTMENT HELPERS
// ============================================================

/**
 * Get user's role in a specific department
 *
 * @returns 'MANAGER' | 'MEMBER' | 'VIEWER' | null
 */
export async function getUserRoleInDepartment(
  userId: string,
  departmentId: string,
  context: any
): Promise<string | null> {
  const membership = await context.entities.UserDepartment.findUnique({
    where: {
      userId_departmentId: {
        userId,
        departmentId
      }
    }
  })

  return membership?.role || null
}

/**
 * Check if user is department manager
 */
export async function isDepartmentManager(
  userId: string,
  departmentId: string,
  context: any
): Promise<boolean> {
  const role = await getUserRoleInDepartment(userId, departmentId, context)
  return role === 'MANAGER'
}

/**
 * Get all departments user belongs to (with roles)
 */
export async function getUserDepartments(
  userId: string,
  context: any
): Promise<Array<{ departmentId: string; role: string; department: Department }>> {
  const memberships = await context.entities.UserDepartment.findMany({
    where: { userId },
    include: { department: true }
  })

  return memberships.map((m) => ({
    departmentId: m.departmentId,
    role: m.role,
    department: m.department
  }))
}

/**
 * Get all departments user manages
 */
export async function getManagedDepartments(
  userId: string,
  context: any
): Promise<Department[]> {
  const memberships = await context.entities.UserDepartment.findMany({
    where: {
      userId,
      role: 'MANAGER'
    },
    include: { department: true }
  })

  return memberships.map((m) => m.department)
}

/**
 * Check if user can access department
 * Includes parent department access (hierarchical)
 */
export async function canAccessDepartment(
  userId: string,
  departmentId: string,
  context: any
): Promise<boolean> {
  // Get department with parent chain
  const department = await context.entities.Department.findUnique({
    where: { id: departmentId },
    include: { parent: true }
  })

  if (!department) return false

  // Check organization access
  const hasOrgAccess = await canAccessOrganization(userId, department.organizationId, context)
  if (!hasOrgAccess) return false

  // Check if user is org admin (can access all departments)
  const isAdmin = await isOrgAdmin(userId, department.organizationId, context)
  if (isAdmin) return true

  // Check direct membership
  const role = await getUserRoleInDepartment(userId, departmentId, context)
  if (role) return true

  // Check parent department membership (hierarchical access)
  if (department.parentId) {
    return await canAccessDepartment(userId, department.parentId, context)
  }

  return false
}

/**
 * Check if user can manage department (MANAGER or org admin)
 */
export async function canManageDepartment(
  userId: string,
  departmentId: string,
  context: any
): Promise<boolean> {
  const department = await context.entities.Department.findUnique({
    where: { id: departmentId }
  })

  if (!department) return false

  // Org admins can manage all departments
  const isAdmin = await isOrgAdmin(userId, department.organizationId, context)
  if (isAdmin) return true

  // Department managers can manage their department
  return await isDepartmentManager(userId, departmentId, context)
}

// ============================================================
// USAGE IN OPERATIONS
// ============================================================

/**
 * Example: Get document operation with permission check
 */

/*
import type { GetDocument } from 'wasp/server/operations'
import type { Document } from 'wasp/entities'

export const getDocument: GetDocument<{ id: string }, Document> = async (args, context) => {
  // 1. Auth check
  if (!context.user) throw new HttpError(401)

  // 2. Fetch resource
  const a3 = await context.entities.Document.findUnique({
    where: { id: args.id },
    include: {
      author: {
        select: { id: true, username: true }
      },
      department: true,
      organization: true
    }
  })

  // 3. Check existence
  if (!a3) throw new HttpError(404, 'document not found')

  // 4. Check permission using helper
  const hasAccess = await canAccessDocument(context.user.id, a3, context)
  if (!hasAccess) {
    throw new HttpError(403, 'Not authorized to access this document')
  }

  // 5. Return resource
  return a3
}
*/

/**
 * Example: Update document operation with edit permission check
 */

/*
export const updateDocument: UpdateDocument = async (args, context) => {
  if (!context.user) throw new HttpError(401)

  const a3 = await context.entities.Document.findUnique({
    where: { id: args.id }
  })

  if (!a3) throw new HttpError(404, 'document not found')

  // Check edit permission
  const canEdit = await canEditDocument(context.user.id, a3, context)
  if (!canEdit) {
    throw new HttpError(403, 'Not authorized to edit this document')
  }

  // Update...
  return await context.entities.Document.update({
    where: { id: args.id },
    data: args.data
  })
}
*/

/**
 * Example: Delete document operation with delete permission check
 */

/*
export const deleteDocument: DeleteDocument = async (args, context) => {
  if (!context.user) throw new HttpError(401)

  const a3 = await context.entities.Document.findUnique({
    where: { id: args.id }
  })

  if (!a3) throw new HttpError(404, 'document not found')

  // Check delete permission
  const canDelete = await canDeleteDocument(context.user.id, a3, context)
  if (!canDelete) {
    throw new HttpError(403, 'Not authorized to delete this document')
  }

  // Delete...
  return await context.entities.Document.delete({
    where: { id: args.id }
  })
}
*/

// ============================================================
// ADVANCED PATTERNS
// ============================================================

/**
 * Get all documents user can access
 * Applies permission filtering at query level
 */
export async function getAccessibleDocuments(
  userId: string,
  context: any
): Promise<Document[]> {
  // Get user's organizations
  const orgMemberships = await context.entities.OrganizationMember.findMany({
    where: { userId }
  })
  const orgIds = orgMemberships.map((m) => m.organizationId)

  // Get user's departments
  const deptMemberships = await context.entities.UserDepartment.findMany({
    where: { userId }
  })
  const deptIds = deptMemberships.map((m) => m.departmentId)

  // Query documents with permission filter
  return await context.entities.Document.findMany({
    where: {
      OR: [
        // Own documents
        { authorId: userId },
        // Organization documents (if admin)
        {
          AND: [
            { organizationId: { in: orgIds } },
            {
              organization: {
                members: {
                  some: {
                    userId,
                    role: { in: ['OWNER', 'ADMIN'] }
                  }
                }
              }
            }
          ]
        },
        // Department documents
        { departmentId: { in: deptIds } }
      ]
    },
    include: {
      author: { select: { id: true, username: true } },
      department: true,
      organization: true
    },
    orderBy: { updatedAt: 'desc' }
  })
}

/**
 * Check multiple permissions at once
 * Useful for UI rendering (show/hide buttons)
 */
export async function getDocumentPermissions(
  userId: string,
  a3: Document,
  context: any
): Promise<{
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canShare: boolean
}> {
  const [canView, canEdit, canDelete] = await Promise.all([
    canAccessDocument(userId, a3, context),
    canEditDocument(userId, a3, context),
    canDeleteDocument(userId, a3, context)
  ])

  return {
    canView,
    canEdit,
    canDelete,
    canShare: canEdit // Share requires edit permission
  }
}

/**
 * Batch permission check for multiple documents
 * More efficient than checking one by one
 */
export async function filterAccessibleDocuments(
  userId: string,
  a3Ids: string[],
  context: any
): Promise<string[]> {
  const a3Documents = await context.entities.Document.findMany({
    where: { id: { in: a3Ids } }
  })

  const accessChecks = await Promise.all(
    a3Documents.map(async (a3) => ({
      id: a3.id,
      hasAccess: await canAccessDocument(userId, a3, context)
    }))
  )

  return accessChecks
    .filter((check) => check.hasAccess)
    .map((check) => check.id)
}

// ============================================================
// CLIENT-SIDE USAGE
// ============================================================

/**
 * Example React component using permission helpers
 */

/*
import { useQuery, getDocumentPermissions } from 'wasp/client/operations'

function DocumentPage({ a3Id }: { a3Id: string }) {
  // Fetch document
  const { data: a3, isLoading } = useQuery(getDocument, { id: a3Id })

  // Fetch permissions
  const { data: permissions } = useQuery(getDocumentPermissions, { a3Id })

  if (isLoading) return <div>Loading...</div>
  if (!a3) return <div>Not found</div>

  return (
    <div>
      <h1>{a3.title}</h1>

      {permissions?.canEdit && (
        <button onClick={() => editDocument()}>Edit</button>
      )}

      {permissions?.canDelete && (
        <button onClick={() => deleteDocument()}>Delete</button>
      )}

      {permissions?.canShare && (
        <button onClick={() => shareDocument()}>Share</button>
      )}

      {!permissions?.canEdit && (
        <div className="text-gray-500">Read-only access</div>
      )}
    </div>
  )
}
*/

// ============================================================
// PERMISSION HELPERS SUMMARY
// ============================================================

/**
 * Quick Reference:
 *
 * Access Checks:
 * - canAccessDocument() - Can view document
 * - canEditDocument() - Can edit document
 * - canDeleteDocument() - Can delete document
 *
 * Organization:
 * - getUserOrgRole() - Get role in org
 * - isOrgAdmin() - Is owner/admin?
 * - canAccessOrganization() - Can access org?
 * - canManageOrganization() - Can manage org?
 *
 * Department:
 * - getUserRoleInDepartment() - Get role in dept
 * - isDepartmentManager() - Is manager?
 * - canAccessDepartment() - Can access dept?
 * - canManageDepartment() - Can manage dept?
 *
 * Batch Operations:
 * - getAccessibleDocuments() - Get all accessible documents
 * - getDocumentPermissions() - Get all permissions for document
 * - filterAccessibleDocuments() - Filter document IDs by access
 *
 * Usage Pattern:
 * 1. Auth check: if (!context.user) throw new HttpError(401)
 * 2. Fetch resource
 * 3. Check existence: if (!resource) throw new HttpError(404)
 * 4. Check permission: if (!canAccess) throw new HttpError(403)
 * 5. Perform operation
 *
 * See also: CLAUDE.md#permissions for compact examples
 */
