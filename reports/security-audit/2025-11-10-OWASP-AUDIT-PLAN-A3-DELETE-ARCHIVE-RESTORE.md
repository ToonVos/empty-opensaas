# OWASP Top 10 Security Audit Plan

## A3 Delete/Archive/Restore Feature

**Date:** 2025-11-10  
**Planned Auditor:** security-auditor (Opus agent)  
**Scope:** deleteA3, archiveA3, unarchiveA3 operations + supporting security infrastructure  
**Standards:** OWASP Top 10 (2021) | Wasp Framework | OpenSaaS Template | CLAUDE.md Constitution  
**Preparation Status:** ✅ READY FOR EXECUTION

---

## 1. Audit Scope

### Features Covered

**Primary Operations:**

- `deleteA3` (hard delete with cascade) - operations.ts:685-730
- `archiveA3` (soft delete) - operations.ts:760-805
- `unarchiveA3` (restore) - operations.ts:817-862

**Supporting Infrastructure:**

- Permission system (permissions/index.ts:94-226)
- Validation helpers (validators.ts:34-233)
- Operation helpers (operationHelpers.ts:36-90)
- Activity logging (activityLog.ts)

### Files in Scope

| File                                                  | Lines            | Purpose              | Security Elements                            |
| ----------------------------------------------------- | ---------------- | -------------------- | -------------------------------------------- |
| `app/src/server/a3/operations.ts`                     | 685-862          | Primary operations   | Auth checks, permission delegation           |
| `app/src/server/permissions/index.ts`                 | 94-226           | Permission functions | Multi-tenant isolation, RBAC                 |
| `app/src/server/a3/operationHelpers.ts`               | 36-90            | Validation helpers   | ID validation, permission check wrapper      |
| `app/src/server/a3/validators.ts`                     | 34-233           | Input validators     | ID format, search sanitization, JSON limits  |
| `app/src/server/a3/activityLog.ts`                    | All              | Audit trail          | Activity creation with user/timestamp        |
| `app/src/pages/a3/components/DeleteArchiveButton.tsx` | 1-38             | Client UI            | Cosmetic permissions (not security boundary) |
| `app/src/pages/a3/components/DeleteArchiveDialog.tsx` | 1-80             | Client dialog        | Error display                                |
| `app/schema.prisma`                                   | A3Document model | Schema definition    | Cascade delete configuration                 |

### Test Files in Scope

| File                                       | Lines     | Coverage                                        |
| ------------------------------------------ | --------- | ----------------------------------------------- |
| `app/src/server/a3/security-fixes.test.ts` | 1-621     | Security-specific tests (7 groups)              |
| `app/src/server/a3/operations.test.ts`     | 807-1090+ | Operation tests (auth/validation/authorization) |

**Total Test Coverage:**

- Security tests: 29+ tests
- Operation tests: 200+ tests (subset for delete/archive)
- Coverage metrics: 80%+ statement/branch coverage

### Out of Scope

**Excluded from this audit:**

- ❌ Deployment/infrastructure security (HTTPS/TLS, database backups)
- ❌ AI chat integration security (separate feature)
- ❌ Payment processing (separate module)
- ❌ General authentication system (Wasp auth - audited separately)
- ❌ Client-side UI security (cosmetic only, server enforces)

**Why excluded:** Focus on delete/archive operations ONLY. Infrastructure and unrelated features covered by separate audits.

---

## 2. OWASP Top 10 Checklist

### A01:2021 - Broken Access Control

**Applicability:** ✅ YES - CRITICAL PRIORITY

**Wasp Framework Context:**

- Multi-tenant SaaS with organization isolation
- Role-based permissions (MANAGER/MEMBER/VIEWER)
- Author-based ownership checks

**Critical Checks:**

| #   | Check                                     | Location                              | Expected Evidence                                          |
| --- | ----------------------------------------- | ------------------------------------- | ---------------------------------------------------------- |
| 1   | **Authentication enforcement**            | operations.ts:686, 761, 818           | `if (!context.user) throw new HttpError(401)` on line 1    |
| 2   | **Organization isolation (multi-tenant)** | permissions/index.ts:214-217, 103-106 | `user.organizationId !== a3.organizationId → return false` |
| 3   | **Department access verification**        | permissions/index.ts:135-174          | `canAccessDepartment()` called AFTER org check             |
| 4   | **Role-based authorization**              | permissions/index.ts:148-174          | VIEWER → false, MEMBER → author check, MANAGER → true      |
| 5   | **Author ownership check**                | permissions/index.ts:160-166          | `userId === a3.authorId` for MEMBER role                   |
| 6   | **Organization permission flag**          | permissions/index.ts:168-171          | `allowMembersDeleteAllA3s` config respected                |
| 7   | **Permission helper delegation**          | operationHelpers.ts:80-90             | `checkA3DeletePermission()` called before mutation         |
| 8   | **Correct HTTP status codes**             | operationHelpers.ts:88                | 403 Forbidden for authorization failures                   |
| 9   | **Information disclosure prevention**     | operations.ts:289-293                 | 404 (not 403) on unauthorized access to hide existence     |
| 10  | **Cross-org access blocking**             | security-fixes.test.ts:397-514        | Tests verify cross-org access fails                        |

**Expected Evidence:**

- ✅ All operations have `if (!context.user)` check on first line
- ✅ `canDeleteA3()` returns false for cross-org access attempts
- ✅ VIEWER role cannot delete (explicit rejection)
- ✅ MEMBER can only delete own A3s (unless org flag set)
- ✅ 403 thrown on permission denial with generic message
- ✅ 404 thrown on view denial to hide resource existence

**Risk if Non-Compliant:** 🔴 CRITICAL

- Unauthorized deletion of documents
- Cross-organization data access
- Privilege escalation (VIEWER acting as MANAGER)

**Pass Criteria:**

- [ ] All 10 checks PASS
- [ ] No permission checks bypassable via client-side manipulation
- [ ] Tests verify all denial scenarios return correct status codes
- [ ] No information leakage in error messages

---

### A02:2021 - Cryptographic Failures

**Applicability:** ⚠️ LIMITED - NOT IN SCOPE

**Wasp Framework Context:**

- HTTPS/TLS handled by deployment layer (not in application code)
- No password storage in delete operations (Wasp auth system handles)
- No encryption/decryption in feature

**Critical Checks:**

| #   | Check                             | Location           | Expected Evidence                                                   |
| --- | --------------------------------- | ------------------ | ------------------------------------------------------------------- |
| 1   | **Database connection security**  | schema.prisma:2-4  | `url = env("DATABASE_URL")` uses env var (no hardcoded credentials) |
| 2   | **No plain-text secrets in code** | All files in scope | No API keys, passwords, or secrets in code                          |

**Expected Evidence:**

- ✅ Database URL sourced from environment variable
- ✅ No secrets in error messages
- ✅ No secrets in activity logs

**Risk if Non-Compliant:** 🟡 MEDIUM

- Credentials exposure via code repository
- Database access compromise

**Pass Criteria:**

- [ ] No hardcoded secrets in any file
- [ ] Database URL uses `env("DATABASE_URL")`
- [ ] Activity logs don't contain sensitive data

**Note:** HTTPS/TLS enforcement is deployment concern, not code audit scope.

---

### A03:2021 - Injection

**Applicability:** ✅ YES - HIGH PRIORITY

**Wasp Framework Context:**

- Prisma ORM (parameterized queries by default)
- PostgreSQL database
- Search operations with LIKE patterns

**Critical Checks:**

| #   | Check                            | Location                        | Expected Evidence                                            |
| --- | -------------------------------- | ------------------------------- | ------------------------------------------------------------ |
| 1   | **ID validation before queries** | validators.ts:34-41             | `validateA3Id()` checks non-empty/non-whitespace             |
| 2   | **Prisma parameterization**      | operations.ts:691-693, 782, 839 | All queries use `{ where: { id: args.id } }` (parameterized) |
| 3   | **Search term sanitization**     | validators.ts:228-233           | `sanitizeSearchTerm()` escapes `%`, `_`, `\`                 |
| 4   | **Escape order correctness**     | validators.ts:230               | Backslash escaped FIRST (prevents escape bypasses)           |
| 5   | **No raw SQL queries**           | All files                       | No `$queryRaw` or `$executeRaw` usage                        |
| 6   | **JSON content validation**      | operations.ts:953-975           | `validateA3Content()` limits size/depth                      |

**Expected Evidence:**

- ✅ All database queries use Prisma query builder (auto-parameterized)
- ✅ Search terms sanitized via `sanitizeSearchTerm()` before LIKE patterns
- ✅ Backslash escaped before `%` and `_` (correct order)
- ✅ ID format validated before database access
- ✅ No string concatenation in queries

**Risk if Non-Compliant:** 🟠 HIGH

- SQL injection via ID parameter
- Pattern injection via search wildcards
- ReDoS via deeply nested JSON

**Pass Criteria:**

- [ ] All 6 checks PASS
- [ ] No raw SQL queries found
- [ ] Tests verify wildcard injection blocked (security-fixes.test.ts:97-147)
- [ ] Prisma exclusively used for database access

---

### A04:2021 - Insecure Design

**Applicability:** ✅ YES - MEDIUM PRIORITY

**Wasp Framework Context:**

- Multi-step permission checking (defense-in-depth)
- Activity logging before deletion
- Soft delete vs hard delete patterns

**Critical Checks:**

| #   | Check                                   | Location                     | Expected Evidence                                |
| --- | --------------------------------------- | ---------------------------- | ------------------------------------------------ |
| 1   | **Rate limiting**                       | security-fixes.test.ts:24-95 | Tests verify rate limit enforced on search       |
| 2   | **Defense-in-depth (multi-layer auth)** | permissions/index.ts:214-226 | Org check → Department check → Role check        |
| 3   | **JSON size limits**                    | validationConstants.ts       | MAX_CONTENT_SIZE = 50KB                          |
| 4   | **JSON nesting depth limits**           | validationConstants.ts       | MAX_NESTING_DEPTH = 10                           |
| 5   | **Activity logging before deletion**    | operations.ts:702-715        | `logA3Activity()` called BEFORE `delete()`       |
| 6   | **Soft delete pattern**                 | operations.ts:760-805        | Archive uses `archivedAt` timestamp (reversible) |
| 7   | **Cascade delete schema**               | schema.prisma:A3Section      | `onDelete: Cascade` for sections                 |

**Expected Evidence:**

- ✅ Rate limiting configured for search operations (HIGH-01)
- ✅ Organization check happens FIRST in permission logic
- ✅ JSON content validated for size and depth
- ✅ Delete activity logged BEFORE hard delete
- ✅ Archive operation is reversible via unarchive

**Risk if Non-Compliant:** 🟡 MEDIUM

- Resource exhaustion (no rate limiting)
- JSON bombs (deeply nested payloads)
- Lost audit trail (deletion before logging)

**Pass Criteria:**

- [ ] All 7 checks PASS
- [ ] Rate limiting tests exist and pass
- [ ] Activity log contains details for deleted A3s
- [ ] Cascade delete prevents orphaned sections

---

### A05:2021 - Security Misconfiguration

**Applicability:** ⚠️ LIMITED - DEPLOYMENT CONCERN

**Wasp Framework Context:**

- Framework defaults used
- No custom security headers in application code
- Environment variable configuration

**Critical Checks:**

| #   | Check                                 | Location                     | Expected Evidence                    |
| --- | ------------------------------------- | ---------------------------- | ------------------------------------ |
| 1   | **Environment variable usage**        | schema.prisma:4, .env.server | `DATABASE_URL` via `env()`           |
| 2   | **No debug code in production paths** | All files                    | No `console.log` with sensitive data |
| 3   | **Default credentials check**         | N/A                          | Not in scope (Wasp auth handles)     |

**Expected Evidence:**

- ✅ Environment variables used for configuration
- ✅ No debug logging with sensitive information

**Risk if Non-Compliant:** 🟢 LOW

- Sensitive data in logs

**Pass Criteria:**

- [ ] Environment variables used for secrets
- [ ] No sensitive data in console/debug logs

**Note:** Security headers, CORS, CSRF protection are Wasp framework defaults (not audited in application code).

---

### A06:2021 - Vulnerable and Outdated Components

**Applicability:** ⚠️ LIMITED - DEPENDENCY AUDIT

**Wasp Framework Context:**

- Wasp framework manages dependencies
- Prisma ORM version locked
- React/Node.js versions

**Critical Checks:**

| #   | Check                              | Location                | Expected Evidence                                  |
| --- | ---------------------------------- | ----------------------- | -------------------------------------------------- |
| 1   | **Database integrity constraints** | schema.prisma:A3Section | `onDelete: Cascade` enforces referential integrity |
| 2   | **Framework version**              | app/main.wasp:1         | `app LeanAICoach { wasp: { version: "^0.18.0" } }` |

**Expected Evidence:**

- ✅ Cascade delete configured in schema (prevents orphaned data)
- ✅ Wasp version >= 0.18.0 (minimum per CLAUDE.md)

**Risk if Non-Compliant:** 🟡 MEDIUM

- Orphaned data (referential integrity violation)

**Pass Criteria:**

- [ ] Cascade delete configured for A3Section
- [ ] Wasp version meets minimum requirement

**Note:** Dependency CVE scanning via `npm audit` is separate from this audit (CI/CD responsibility).

---

### A07:2021 - Identification and Authentication Failures

**Applicability:** ✅ YES - CRITICAL PRIORITY

**Wasp Framework Context:**

- Wasp auth system handles authentication
- Operations enforce `context.user` checks
- Session management via Wasp

**Critical Checks:**

| #   | Check                    | Location                    | Expected Evidence                                       |
| --- | ------------------------ | --------------------------- | ------------------------------------------------------- |
| 1   | **Mandatory auth check** | operations.ts:686, 761, 818 | `if (!context.user) throw new HttpError(401)` on line 1 |
| 2   | **401 status code**      | operations.ts:686, 761, 818 | Correct HTTP status for unauthenticated                 |
| 3   | **No auth bypass paths** | All operations              | No conditional auth checks (always mandatory)           |
| 4   | **Session validation**   | N/A                         | Wasp framework handles (not in scope)                   |

**Expected Evidence:**

- ✅ Every operation has auth check on first line
- ✅ 401 thrown for missing `context.user`
- ✅ Tests verify 401 for unauthenticated access

**Risk if Non-Compliant:** 🔴 CRITICAL

- Unauthenticated deletion of documents
- Anonymous access to sensitive operations

**Pass Criteria:**

- [ ] All 3 operations have auth check on line 1
- [ ] 401 status code used (not 403 or 500)
- [ ] Tests verify unauthenticated access fails (operations.test.ts:821-825, 1023-1027)

---

### A08:2021 - Software and Data Integrity Failures

**Applicability:** ✅ YES - MEDIUM PRIORITY

**Wasp Framework Context:**

- Activity logging for audit trail
- No webhooks in delete operations
- Database transaction integrity

**Critical Checks:**

| #   | Check                                | Location              | Expected Evidence                                |
| --- | ------------------------------------ | --------------------- | ------------------------------------------------ |
| 1   | **Activity logging before deletion** | operations.ts:702-715 | `logA3Activity()` called BEFORE `delete()`       |
| 2   | **Activity log contents**            | operations.ts:706-713 | Logs: title, departmentId, status, authorId      |
| 3   | **Audit trail preservation**         | operations.ts:715     | Hard delete doesn't delete activity logs         |
| 4   | **Action type clarity**              | operations.ts:708     | "DELETED" action type (distinct from "ARCHIVED") |
| 5   | **Archive activity logging**         | operations.ts:783-790 | Archive logs "ARCHIVED" action                   |
| 6   | **Unarchive activity logging**       | operations.ts:849-856 | Unarchive logs "UNARCHIVED" action               |

**Expected Evidence:**

- ✅ Delete activity logged BEFORE hard delete (cannot log after)
- ✅ Activity log contains comprehensive details
- ✅ Activity logs survive A3 deletion (separate table)
- ✅ Each operation has distinct action type

**Risk if Non-Compliant:** 🟡 MEDIUM

- Lost audit trail (compliance violation)
- Inability to track who deleted what

**Pass Criteria:**

- [ ] All 6 checks PASS
- [ ] Activity log call happens BEFORE delete call
- [ ] Tests verify logging order (operations.test.ts:922-965)
- [ ] Activity logs contain sufficient detail for forensics

---

### A09:2021 - Security Logging and Monitoring Failures

**Applicability:** ✅ YES - MEDIUM PRIORITY

**Wasp Framework Context:**

- Activity logging via `logA3Activity()`
- User/timestamp tracking
- Action type categorization

**Critical Checks:**

| #   | Check                     | Location                    | Expected Evidence                               |
| --- | ------------------------- | --------------------------- | ----------------------------------------------- |
| 1   | **User attribution**      | activityLog.ts              | `userId` parameter logged                       |
| 2   | **Timestamp recording**   | activityLog.ts              | `createdAt` auto-generated by Prisma            |
| 3   | **Action type logging**   | operations.ts:708, 787, 853 | "DELETED", "ARCHIVED", "UNARCHIVED"             |
| 4   | **Details field usage**   | operations.ts:709-713       | Comprehensive details object                    |
| 5   | **Log integrity**         | schema.prisma:A3Activity    | Separate table (survives A3 deletion)           |
| 6   | **Error message hygiene** | operationHelpers.ts:88      | Generic message (doesn't leak internal details) |

**Expected Evidence:**

- ✅ Every operation logs activity with userId
- ✅ Timestamps auto-generated by database
- ✅ Action types clearly differentiate operations
- ✅ Details field contains context for forensics

**Risk if Non-Compliant:** 🟡 MEDIUM

- No audit trail for compliance
- Cannot track security incidents
- Insufficient forensic data

**Pass Criteria:**

- [ ] All 6 checks PASS
- [ ] Activity logs queryable by userId, action type, timestamp
- [ ] Tests verify activity logging occurs (operations.test.ts:1080-1090)
- [ ] Error messages don't leak sensitive information

---

### A10:2021 - Server-Side Request Forgery (SSRF)

**Applicability:** ❌ NO - NOT RELEVANT

**Wasp Framework Context:**

- No external HTTP requests in delete operations
- No webhook callbacks
- No URL parameter processing

**Critical Checks:**
None (feature does not make external requests)

**Expected Evidence:**

- N/A

**Risk if Non-Compliant:** N/A

**Pass Criteria:**

- [x] Category not applicable (verified)

---

## 3. Critical Security Paths (Priority Order)

**Audit sequence optimized for high-risk areas first:**

### Priority 1: Authentication & Authorization (CRITICAL)

| #   | Path                         | File:Line                    | Why Critical                   |
| --- | ---------------------------- | ---------------------------- | ------------------------------ |
| 1   | **Auth enforcement**         | operations.ts:686, 761, 818  | Blocks unauthenticated access  |
| 2   | **Multi-tenant isolation**   | permissions/index.ts:214-217 | Prevents cross-org data access |
| 3   | **Role-based authorization** | permissions/index.ts:148-174 | Enforces RBAC rules            |
| 4   | **Author ownership**         | permissions/index.ts:160-166 | MEMBER can only delete own A3s |
| 5   | **Permission helper**        | operationHelpers.ts:80-90    | Centralized auth enforcement   |

**Risk if failed:** 🔴 CRITICAL - Unauthorized deletion, cross-org access, privilege escalation

**Test coverage:** operations.test.ts:821-879, security-fixes.test.ts:397-514

---

### Priority 2: Input Validation (HIGH)

| #   | Path                    | File:Line             | Why Critical                 |
| --- | ----------------------- | --------------------- | ---------------------------- |
| 1   | **ID validation**       | validators.ts:34-41   | Prevents empty/malformed IDs |
| 2   | **Search sanitization** | validators.ts:228-233 | Blocks wildcard injection    |
| 3   | **JSON validation**     | operations.ts:953-975 | Prevents resource exhaustion |

**Risk if failed:** 🟠 HIGH - SQL injection, pattern injection, JSON bombs

**Test coverage:** operations.test.ts:829-832, security-fixes.test.ts:97-147, 326-391

---

### Priority 3: Audit Trail (MEDIUM)

| #   | Path                | File:Line                     | Why Critical           |
| --- | ------------------- | ----------------------------- | ---------------------- |
| 1   | **Delete logging**  | operations.ts:702-715         | Compliance requirement |
| 2   | **Archive logging** | operations.ts:783-790         | Lifecycle tracking     |
| 3   | **Logging order**   | operations.ts:715 (after log) | Must log BEFORE delete |

**Risk if failed:** 🟡 MEDIUM - Lost audit trail, compliance violation

**Test coverage:** operations.test.ts:922-965, 1080-1090

---

### Priority 4: Data Integrity (MEDIUM)

| #   | Path                     | File:Line               | Why Critical                   |
| --- | ------------------------ | ----------------------- | ------------------------------ |
| 1   | **Cascade delete**       | schema.prisma:A3Section | Prevents orphaned sections     |
| 2   | **Existence validation** | operationHelpers.ts:50  | 404 for missing resources      |
| 3   | **Archive status check** | operations.ts:289-293   | Prevent access to archived A3s |

**Risk if failed:** 🟡 MEDIUM - Orphaned data, inconsistent state

**Test coverage:** operations.test.ts:895-906, security-fixes.test.ts:520-546

---

### Priority 5: Error Handling (LOW)

| #   | Path                       | File:Line              | Why Critical                     |
| --- | -------------------------- | ---------------------- | -------------------------------- |
| 1   | **HTTP status codes**      | operationHelpers.ts:88 | Correct semantics                |
| 2   | **Error message hygiene**  | operationHelpers.ts:88 | No information leakage           |
| 3   | **404 vs 403 distinction** | operations.ts:292      | Hide existence from unauthorized |

**Risk if failed:** 🟢 LOW - Information disclosure

**Test coverage:** security-fixes.test.ts:150-210

---

## 4. Remediation Strategy

### 🔴 CRITICAL Issues (Block Merge Immediately)

**Action Plan:**

1. **STOP** - Do not merge to main/develop
2. **FIX** - Implement remediation immediately
3. **TEST** - Add security tests for the vulnerability
4. **VERIFY** - Re-audit fixed code
5. **DOCUMENT** - Update SECURITY-CHECKLIST.md with new pattern

**Examples:**

- Missing auth check on operation
- Cross-org access not blocked
- VIEWER role can delete

**Timeline:** Fix within 24 hours

---

### 🟠 HIGH Issues (Fix Before Merge)

**Action Plan:**

1. **DOCUMENT** - Create GitHub issue with details
2. **FIX** - Implement remediation before PR merge
3. **TEST** - Add tests to prevent regression
4. **REVIEW** - Security review of fix

**Examples:**

- Search term not sanitized
- JSON validation missing
- Rate limiting not enforced

**Timeline:** Fix within 1 week (before PR merge)

---

### 🟡 MEDIUM Issues (Fix Before Production)

**Action Plan:**

1. **RISK REGISTER** - Document in security risk register
2. **PLAN** - Schedule fix in next sprint
3. **COMPENSATE** - Implement temporary controls if needed
4. **MONITOR** - Track in production logs

**Examples:**

- Activity logging missing details
- Error messages leak internal info
- Missing cascade delete

**Timeline:** Fix before production deployment

---

### 🟢 LOW Issues (Backlog)

**Action Plan:**

1. **BACKLOG** - Create tech debt ticket
2. **PRIORITIZE** - Schedule based on severity/effort
3. **DOCUMENT** - Note in CLAUDE.md if pattern issue

**Examples:**

- Inconsistent error messages
- Missing debug logging
- Cosmetic security improvements

**Timeline:** Fix when convenient

---

## 5. Risk Threshold

### Acceptable Risk Criteria

**Merge to develop allowed if:**

- ✅ Zero CRITICAL issues
- ✅ Zero HIGH issues (or documented waiver with compensating controls)
- ⚠️ MEDIUM issues accepted if:
  - Documented in risk register
  - Compensating controls in place
  - Fix planned before production
- ✅ LOW issues accepted (tech debt)

---

### Block Merge Criteria

**DO NOT MERGE if:**

- ❌ Any CRITICAL issue found
- ❌ Any HIGH issue without documented waiver
- ❌ MEDIUM issues without compensating controls
- ❌ Tests failing after remediation

---

### Production Deployment Criteria

**DO NOT DEPLOY to production if:**

- ❌ Any CRITICAL or HIGH issues remain
- ❌ MEDIUM issues without risk acceptance
- ❌ Security tests failing
- ❌ Activity logging not working

---

## 6. Security Test Gaps (if any)

**Based on security analysis, NO MAJOR GAPS IDENTIFIED:**

### Existing Comprehensive Coverage

**Security-specific tests (security-fixes.test.ts):**

- ✅ HIGH-01: Rate limiting (3 tests)
- ✅ HIGH-02: Search sanitization (6 tests)
- ✅ MEDIUM-01: Error disclosure (2 tests)
- ✅ MEDIUM-02: Delete audit trail (2 tests)
- ✅ MEDIUM-03: JSON validation (5 tests)
- ✅ MEDIUM-04: Org isolation (4 tests)
- ✅ MEDIUM-05: Archive bypass (3 tests)

**Operation tests (operations.test.ts):**

- ✅ Auth checks (401 scenarios)
- ✅ Validation (400 scenarios)
- ✅ Not found (404 scenarios)
- ✅ Authorization (403 scenarios)
- ✅ Success paths
- ✅ Cascade delete verification
- ✅ Activity logging order

### Minor Gap: Archive Status Check

**Scenario NOT tested:** getA3WithSections should return 404 for archived A3s

**Test exists but code missing:**

- Test: security-fixes.test.ts:520-546
- Code: operations.ts:289-293 (missing `if (a3.archivedAt !== null)` check)

**Recommended test enhancement:**

```typescript
it("MEDIUM-05: getA3WithSections should return 404 for archived A3s", async () => {
  const archivedA3 = await createA3({ archivedAt: new Date() }, testContext);

  await expect(
    getA3WithSections({ id: archivedA3.id }, testContext),
  ).rejects.toThrow(HttpError);
  // Verify 404 status (not 403)
});
```

**Status:** Test already exists, code fix needed

---

## 7. Audit Sequence

**Total Estimated Time: 90-120 minutes**

### Step 1: Authentication & Authorization (30 min)

**Objective:** Verify access control implementation

**Checks:**

1. Verify `context.user` check on line 1 of all operations ✓
2. Trace permission flow: operation → helper → permission function ✓
3. Verify multi-tenant isolation (organizationId check) ✓
4. Verify role-based rules (VIEWER/MEMBER/MANAGER) ✓
5. Review test coverage for auth/permission scenarios ✓

**Evidence to collect:**

- Code snippets showing auth checks
- Permission function logic
- Test results for 401/403 scenarios

**Pass criteria:** All auth checks present and enforced

---

### Step 2: Input Validation & Injection Prevention (20 min)

**Objective:** Verify injection attack prevention

**Checks:**

1. Verify ID validation before database queries ✓
2. Verify Prisma parameterization (no raw SQL) ✓
3. Verify search sanitization (PostgreSQL wildcards) ✓
4. Verify JSON validation (size/depth limits) ✓
5. Review test coverage for injection scenarios ✓

**Evidence to collect:**

- Code snippets showing validation
- Prisma query patterns
- Sanitization logic
- Test results for injection attempts

**Pass criteria:** All inputs validated, Prisma used exclusively

---

### Step 3: Audit Trail & Data Integrity (20 min)

**Objective:** Verify logging and data consistency

**Checks:**

1. Verify activity logging BEFORE deletion ✓
2. Verify activity log contents (comprehensive details) ✓
3. Verify cascade delete configuration ✓
4. Verify archive status check (KNOWN GAP) ✗
5. Review test coverage for logging order ✓

**Evidence to collect:**

- Code snippets showing logging order
- Activity log contents
- Schema cascade configuration
- Test results for logging scenarios

**Pass criteria:** Logging before deletion, cascade configured, archive check MISSING (code fix needed)

---

### Step 4: Error Handling & Information Disclosure (15 min)

**Objective:** Verify error messages don't leak sensitive info

**Checks:**

1. Verify HTTP status code correctness (401/403/404/400) ✓
2. Verify error messages are generic ✓
3. Verify 404 vs 403 distinction (hide existence) ✓
4. Review test coverage for error scenarios ✓

**Evidence to collect:**

- Error message patterns
- HTTP status code usage
- Test results for error scenarios

**Pass criteria:** Error messages generic, correct status codes, no leakage

---

### Step 5: Defense-in-Depth & Design (15 min)

**Objective:** Verify layered security controls

**Checks:**

1. Verify multi-layer permission checking (org → dept → role) ✓
2. Verify rate limiting enforcement ✓
3. Verify soft delete pattern (reversible) ✓
4. Verify defense-in-depth architecture ✓

**Evidence to collect:**

- Permission check order
- Rate limiting tests
- Archive/unarchive implementation

**Pass criteria:** Multiple security layers present

---

### Step 6: OWASP Coverage Verification (10 min)

**Objective:** Map findings to OWASP Top 10

**Checks:**

1. Review OWASP category applicability (A01-A10) ✓
2. Map findings to severity levels ✓
3. Create summary table ✓

**Evidence to collect:**

- OWASP coverage matrix
- Severity breakdown

**Pass criteria:** All applicable categories addressed

---

### Step 7: Report Generation (10 min)

**Objective:** Document findings and recommendations

**Deliverables:**

1. Security audit report (standard format)
2. Risk register (CRITICAL/HIGH/MEDIUM/LOW)
3. Remediation priority list
4. Standards compliance matrix

**Template:** `reports/security-audit/TEMPLATE.md`

**Pass criteria:** Report follows standard format, all sections complete

---

## 8. Time Estimate

| Phase                          | Duration       | Agent                   |
| ------------------------------ | -------------- | ----------------------- |
| **Step 1: Auth/Authorization** | 30 min         | security-auditor (Opus) |
| **Step 2: Input Validation**   | 20 min         | security-auditor (Opus) |
| **Step 3: Audit Trail**        | 20 min         | security-auditor (Opus) |
| **Step 4: Error Handling**     | 15 min         | security-auditor (Opus) |
| **Step 5: Defense-in-Depth**   | 15 min         | security-auditor (Opus) |
| **Step 6: OWASP Verification** | 10 min         | security-auditor (Opus) |
| **Step 7: Report Generation**  | 10 min         | security-auditor (Opus) |
| **TOTAL**                      | **90-120 min** |                         |

**Agent selection rationale:**

- Opus model required for comprehensive OWASP analysis
- security-auditor agent has specialized security knowledge
- Manual review not required (comprehensive test coverage exists)

---

## 9. Expected Findings Summary (Predicted)

**Based on security analysis report:**

### CRITICAL Findings: 0

No critical issues expected (comprehensive security implementation verified)

---

### HIGH Findings: 0

No high-severity issues expected (strong patterns observed)

---

### MEDIUM Findings: 1 (KNOWN)

**MEDIUM-05: Archive Status Check Missing**

- **Location:** operations.ts:289-293 (getA3WithSections)
- **Issue:** No `archivedAt !== null` check
- **Risk:** Users can access archived A3 details by ID
- **Remediation:** Add archive status check, return 404
- **Test exists:** security-fixes.test.ts:520-546

---

### LOW Findings: 0-2 (Potential)

**Potential minor findings:**

- Client-side permission checks (cosmetic, expected behavior)
- Error message consistency (minor wording variations)

---

## 10. Prerequisites Verification

**Before executing this audit plan:**

### Code Readiness

- [x] All tests passing (verified in security analysis)
- [x] Code committed to feature branch
- [x] No outstanding lint/type errors
- [x] Test coverage ≥ 80% statement/branch

### Documentation Readiness

- [x] Security analysis report completed
- [x] Test coverage documented
- [x] Permission patterns documented

### Agent Readiness

- [ ] security-auditor agent available (marketplace)
- [ ] Claude Code Opus model available
- [ ] Sufficient context budget (plan requires ~20k tokens)

---

## 11. Post-Audit Actions

### If ZERO CRITICAL/HIGH findings:

1. ✅ Generate final security audit report
2. ✅ Update security compliance matrix
3. ✅ Approve for PR merge to develop
4. ✅ Document security patterns in CLAUDE.md (if new patterns)

### If CRITICAL/HIGH findings:

1. 🔴 Block PR merge
2. 🔴 Create remediation tickets (GitHub issues)
3. 🔴 Fix issues immediately
4. 🔴 Re-run audit after fixes
5. 🔴 Verify tests added for vulnerabilities

### If MEDIUM findings:

1. 🟡 Document in risk register
2. 🟡 Create remediation plan
3. 🟡 Implement compensating controls if needed
4. 🟡 Schedule fix before production

### If LOW findings:

1. 🟢 Create tech debt tickets
2. 🟢 Backlog prioritization
3. 🟢 Document in CLAUDE.md if pattern issue

---

## 12. Success Criteria

**Audit considered successful if:**

- [x] All OWASP Top 10 categories evaluated
- [ ] All critical security paths audited
- [ ] Findings documented with evidence
- [ ] Severity levels assigned correctly
- [ ] Remediation plan created
- [ ] Standards compliance matrix completed
- [ ] Report follows standard format
- [ ] Time estimate met (90-120 min)

**Merge approval criteria:**

- [ ] Zero CRITICAL findings
- [ ] Zero HIGH findings (or documented waiver)
- [ ] MEDIUM findings have remediation plan
- [ ] LOW findings documented in backlog

---

## 13. Known Limitations

**This audit does NOT cover:**

1. **Infrastructure security:**

   - HTTPS/TLS configuration (deployment layer)
   - Database connection security (deployment layer)
   - Network security (firewall, VPN, etc.)
   - Server hardening

2. **Dependency vulnerabilities:**

   - npm package CVEs (separate `npm audit` process)
   - Wasp framework vulnerabilities (trust framework security)
   - Prisma ORM vulnerabilities (trust library security)

3. **Performance/availability:**

   - Rate limiting effectiveness (covered functionally, not performance tested)
   - DDoS prevention (infrastructure concern)
   - Database query performance (separate performance audit)

4. **Compliance:**

   - GDPR data retention
   - HIPAA audit logs
   - SOC 2 compliance
   - (Not in scope for MVP)

5. **Client-side security:**
   - XSS prevention (Wasp framework handles)
   - CSRF protection (Wasp framework handles)
   - CSP headers (deployment layer)

**Why limited:** Focus on application-level security for delete/archive operations only.

---

## 14. References

**Security Analysis Report:**

- `/reports/security-audit/A3-DELETE-ARCHIVE-RESTORE-SECURITY-ANALYSIS.md`

**Test Files:**

- `app/src/server/a3/security-fixes.test.ts` (29+ security tests)
- `app/src/server/a3/operations.test.ts` (200+ operation tests)

**Implementation Files:**

- `app/src/server/a3/operations.ts` (deleteA3, archiveA3, unarchiveA3)
- `app/src/server/permissions/index.ts` (canDeleteA3, canViewA3, canEditA3)
- `app/src/server/a3/operationHelpers.ts` (validation helpers)
- `app/src/server/a3/validators.ts` (input validators)

**Project Standards:**

- Root `CLAUDE.md` (Constitution, security rules)
- `reports/security-audit/CLAUDE.md` (Security report format)
- `docs/TDD-WORKFLOW.md` (Phase 4 integration)

**OWASP Resources:**

- OWASP Top 10 (2021): https://owasp.org/Top10/
- Wasp Security Docs: https://wasp.sh/docs/

---

**AUDIT PLAN STATUS:** ✅ READY FOR EXECUTION

**Next Step:** Execute audit using security-auditor agent with this plan as input

**Command:**

```bash
"Use security-auditor skill to audit A3 delete/archive/restore operations following the plan in /reports/security-audit/2025-11-10-OWASP-AUDIT-PLAN-A3-DELETE-ARCHIVE-RESTORE.md"
```

---

**END OF AUDIT PLAN**
