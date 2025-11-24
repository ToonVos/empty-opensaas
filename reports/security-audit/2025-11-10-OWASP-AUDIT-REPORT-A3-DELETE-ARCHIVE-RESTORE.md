# OWASP Top 10 Security Audit Report

## A3 Delete/Archive/Restore Feature

**Date**: 2025-11-10
**Auditor**: security-auditor (Sonnet)
**Feature Scope**: deleteA3, archiveA3, unarchiveA3 operations
**Test Coverage**: 29+ security tests, 200+ operation tests

### Executive Summary

- **Features audited**: deleteA3, archiveA3, unarchiveA3 operations and supporting functions
- **Audit date**: 2025-11-10
- **Risk level**: 0 CRITICAL, 0 HIGH, 1 MEDIUM, 0 LOW findings
- **Overall compliance**: **CONDITIONAL PASS** (1 medium finding requires fix)

### OWASP Top 10 Compliance Matrix

| Category                                            | Status         | Findings | Risk   | Notes                                                         |
| --------------------------------------------------- | -------------- | -------- | ------ | ------------------------------------------------------------- |
| **A01: Broken Access Control**                      | ✅ PASS        | 0        | N/A    | Strong multi-layer permission checks, auth enforced on line 1 |
| **A02: Cryptographic Failures**                     | ✅ PASS        | 0        | N/A    | No crypto in delete operations, passwords handled by Wasp     |
| **A03: Injection**                                  | ✅ PASS        | 0        | N/A    | UUID validation, Prisma ORM prevents SQL injection            |
| **A04: Insecure Design**                            | ✅ PASS        | 0        | N/A    | Rate limiting implemented, defense-in-depth design            |
| **A05: Security Misconfiguration**                  | ✅ PASS        | 0        | N/A    | Safe error messages, proper 404 vs 403 distinction            |
| **A06: Vulnerable & Outdated Components**           | ⚠️ CONDITIONAL | 1        | MEDIUM | getA3WithSections missing archivedAt check                    |
| **A07: Identification and Authentication Failures** | ✅ PASS        | 0        | N/A    | Auth check always first, 401 status codes correct             |
| **A08: Software and Data Integrity Failures**       | ✅ PASS        | 0        | N/A    | Helper functions secure, no unsafe deserialization            |
| **A09: Security Logging and Monitoring Failures**   | ✅ PASS        | 0        | N/A    | Complete audit trail, logs BEFORE deletion                    |
| **A10: Server-Side Request Forgery (SSRF)**         | ✅ N/A         | 0        | N/A    | No external URL fetching in delete operations                 |

### Detailed Findings

#### Finding 1: Archive Bypass in getA3WithSections

- **Category**: A06: Vulnerable and Outdated Components
- **Severity**: MEDIUM
- **Location**: `app/src/server/a3/operations.ts:256-316`
- **Description**: The `getA3WithSections` operation does not check if an A3 document is archived (archivedAt != null). This allows users to view archived content that should be inaccessible, violating the soft delete principle.
- **Risk**:
  - Likelihood: Medium (direct API call to archived A3)
  - Impact: Medium (information disclosure of archived data)
- **Evidence**:
  - Test exists at `security-fixes.test.ts:520-546` expecting 404 for archived A3
  - Implementation at `operations.ts:256-316` missing check between lines 285-293
  - No `if (a3.archivedAt)` validation before returning data
- **Recommendation**: Add check after line 285:
  ```typescript
  // 4a. CHECK IF ARCHIVED (return 404)
  if (a3.archivedAt) {
    throw new HttpError(404, "A3 document not found");
  }
  ```
- **Status**: OPEN

### Strengths Identified

#### 1. Authentication & Authorization (A01, A07)

- ✅ **Mandatory auth check**: All operations check `context.user` on line 1
- ✅ **Multi-tenant isolation**: Organization check before department (permissions/index.ts:221)
- ✅ **Role-based permissions**: MANAGER can delete all, MEMBER own only (canDeleteA3)
- ✅ **Permission helpers**: Centralized permission checking via `checkA3DeletePermission`
- ✅ **404 vs 403**: Properly hides existence from unauthorized users

#### 2. Input Validation (A03)

- ✅ **UUID validation**: All IDs validated with `validateA3Id` using regex
- ✅ **Prisma ORM**: No raw SQL, parameterized queries prevent injection
- ✅ **Search sanitization**: Special chars escaped (validators.ts:228-233)
- ✅ **Length constraints**: Search terms limited 2-100 chars
- ✅ **Helper encapsulation**: `validateAndFetchA3ForMutation` centralizes validation

#### 3. Audit Logging (A09)

- ✅ **Activity logging**: All operations log to A3Activity table
- ✅ **Log before delete**: Captures details BEFORE hard delete (line 703-715)
- ✅ **Comprehensive details**: Logs title, departmentId, status, authorId
- ✅ **Action types**: DELETED, ARCHIVED, UNARCHIVED properly categorized
- ✅ **Delegate pattern**: Type-safe logging via `logA3Activity` helper

#### 4. Rate Limiting (A04)

- ✅ **Search rate limiting**: 20 requests per minute per user (rateLimit.ts)
- ✅ **429 status codes**: Proper "Too Many Requests" responses
- ✅ **In-memory tracking**: Fast rate limit checks
- ✅ **Per-user limits**: Separate counters for each user
- ✅ **Sliding window**: 60-second windows with automatic reset

#### 5. Defense-in-Depth (A06)

- ✅ **Cascade deletes**: Foreign keys with `onDelete: Cascade` in schema
- ✅ **Referential integrity**: Database constraints prevent orphaned data
- ✅ **Multi-layer validation**: ID format → existence → permission checks
- ✅ **Soft delete preferred**: archiveA3 recommended over hard delete
- ✅ **Helper functions**: Reduce code duplication and security gaps

#### 6. Error Handling (A05)

- ✅ **Sanitized errors**: No stack traces or sensitive data in responses
- ✅ **Consistent HTTP codes**: 401/403/404/400 used appropriately
- ✅ **404 for forbidden**: Hides resource existence from unauthorized users
- ✅ **HttpError usage**: Structured error responses
- ✅ **Test coverage**: Error scenarios thoroughly tested

### Risk Assessment

- **CRITICAL**: 0 findings
- **HIGH**: 0 findings
- **MEDIUM**: 1 finding (archive bypass)
- **LOW**: 0 findings

### Compliance Score

- **Categories PASS**: 9/10
- **Categories CONDITIONAL**: 1/10 (A06)
- **Categories N/A**: 1/10 (A10 - no SSRF surface)

### Security Test Coverage Analysis

- ✅ **29+ dedicated security tests** in operations.test.ts
- ✅ **Authentication tests**: 401 scenarios for missing user
- ✅ **Authorization tests**: 403 scenarios for permissions
- ✅ **Input validation tests**: Invalid IDs, malformed data
- ✅ **XSS prevention tests**: HTML escaping verification
- ✅ **Rate limit tests**: 429 responses for excessive requests

### Recommendations

#### 1. Immediate (MEDIUM priority)

- **Fix archive bypass**: Add `archivedAt` check to `getA3WithSections` (2-line fix)
  ```typescript
  // After line 285 in operations.ts
  if (a3.archivedAt) {
    throw new HttpError(404, "A3 document not found");
  }
  ```

#### 2. Short-term (Enhancement)

- Consider adding JSON depth validation to prevent deeply nested content attacks
- Implement distributed rate limiting with Redis for multi-server deployments
- Add security headers middleware (HSTS, CSP, X-Frame-Options)

#### 3. Long-term (Best practices)

- Implement API versioning for backward compatibility
- Add request signing/HMAC for critical operations
- Consider implementing RBAC with more granular permissions

### Positive Security Observations

1. **Excellent test coverage**: 200+ tests including security scenarios
2. **Consistent patterns**: All operations follow same auth → validate → fetch → check → execute flow
3. **Type safety**: TypeScript with proper type annotations throughout
4. **Helper functions**: Reduce security gaps through code reuse
5. **Audit compliance**: Logs captured BEFORE deletion for forensics
6. **Rate limiting**: Proactive DoS prevention on expensive operations

### Sign-off

- **Status**: **CONDITIONAL APPROVAL**
- **Merge Approval**: **NO** - Fix archive bypass first
- **Conditions**:
  1. Add archivedAt check to getA3WithSections operation
  2. Verify security-fixes.test.ts:520-546 passes after fix
  3. Re-test to confirm no regression

### Post-Fix Approval Path

Once the archive bypass is fixed:

1. Run `npm test security-fixes.test.ts` to verify fix
2. Update this report status to APPROVED
3. Merge can proceed

### Attestation

This security audit was conducted following OWASP Top 10 (2021) guidelines with focus on:

- Authentication and authorization controls
- Input validation and injection prevention
- Audit logging and monitoring
- Rate limiting and DoS prevention
- Defense-in-depth design principles

The A3 delete/archive/restore feature demonstrates strong security posture with only one medium-severity finding that can be easily remediated with a 2-line fix.

---

**Audit completed**: 2025-11-10 17:45 UTC
**Next review recommended**: After archive bypass fix implementation
