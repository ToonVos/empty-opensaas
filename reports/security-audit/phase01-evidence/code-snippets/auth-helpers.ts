/**
 * Authentication & Authorization Helpers
 *
 * Consolidated auth check patterns for AI operations.
 * Throws HttpError with appropriate status codes for auth failures.
 *
 * Type Safety Note:
 * Helper functions accept `context: any` because:
 * 1. Need user authentication context only (no entity access)
 * 2. Called from multiple operations (operations ARE properly typed)
 * 3. Wasp framework limitation - helpers outside operations lose automatic type inference
 * See docs/LINTING-STANDARDS.md lines 129-166 for details.
 */

import { HttpError } from "wasp/server";

/**
 * Verify user is authenticated and is owner
 *
 * @param context - Wasp context object
 * @throws HttpError(401) if not authenticated
 * @throws HttpError(403) if not owner
 *
 * @example
 * export const myOperation = async (args, context) => {
 *   requireOwnerAuth(context);
 *   // ... rest of operation
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Wasp context varies by operation, auth-only check (see file header)
export function requireOwnerAuth(context: any): void {
  if (!context.user) {
    throw new HttpError(401, "Not authenticated");
  }

  if (!context.user.isOwner) {
    throw new HttpError(403, "Owner access required");
  }
}

/**
 * Verify user has organization
 *
 * @param context - Wasp context object
 * @returns organizationId if user has organization
 * @throws HttpError(400) if no organization
 *
 * @example
 * const orgId = requireUserOrganization(context);
 * // Use orgId for querying org-specific data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Wasp context varies by operation, auth-only check (see file header)
export function requireUserOrganization(context: any): string {
  if (!context.user?.organizationId) {
    throw new HttpError(400, "User must belong to an organization");
  }

  return context.user.organizationId;
}

/**
 * Combined: Auth + owner + organization
 *
 * Convenience function that checks authentication, owner status, and organization membership.
 *
 * @param context - Wasp context object
 * @returns organizationId if all checks pass
 * @throws HttpError(401) if not authenticated
 * @throws HttpError(403) if not owner
 * @throws HttpError(400) if no organization
 *
 * @example
 * export const myOperation = async (args, context) => {
 *   const organizationId = requireOwnerWithOrganization(context);
 *   // ... use organizationId
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Wasp context varies by operation, auth-only check (see file header)
export function requireOwnerWithOrganization(context: any): string {
  requireOwnerAuth(context);
  return requireUserOrganization(context);
}
