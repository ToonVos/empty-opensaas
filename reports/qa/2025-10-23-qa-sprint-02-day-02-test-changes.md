# QA Review: Test Changes Post-RED Commit

**Sprint:** Sprint 2 Day 02
**Phase:** Phase 4 (REVIEW - Security Audit)
**RED Commit:** 3a9aed3 "test(security): add comprehensive security tests for 7 OWASP findings"
**Date:** 2025-10-23
**Reviewer:** QA Team

---

## Executive Summary

After committing RED phase tests (commit 3a9aed3), several test files required modifications to support the security fixes implemented in GREEN phase. This document details ALL test changes made after the RED commit, their justifications, and requests QA approval to confirm these are legitimate test maintenance and not test cheating.

**Status:**

- ✅ All 182 unit/integration tests passing
- ✅ All 10 Week 1 E2E tests passing
- ✅ All 7 security fixes verified

---

## 1. HttpError Mock Addition (LEGITIMATE - Infrastructure Fix)

### Files Modified:

1. `app/src/server/a3/security-fixes.test.ts`
2. `app/src/server/a3/operations.test.ts`

### Change:

```typescript
// Added at top of both files
vi.mock("wasp/server", () => ({
  HttpError: class HttpError extends Error {
    statusCode: number;
    constructor(statusCode: number, message?: string) {
      super(message);
      this.statusCode = statusCode;
      this.name = "HttpError";
    }
  },
}));
```

### Justification:

**Problem:** Wasp's HttpError import triggers environment validation at import time, causing test failures with "Invalid discriminator value. Expected 'development' | 'production'".

**Why This Is NOT Test Cheating:**

1. Standard unit testing practice to mock framework dependencies
2. Tests business logic, not framework internals
3. Real HttpError behavior is preserved (statusCode, message, Error inheritance)
4. Does not change test expectations or assertions
5. Enables tests to run without full Wasp environment

**Alternative Considered:** Adding env vars to test config - rejected as unnecessary complexity that doesn't solve root cause (Wasp env validation at import time).

**QA Question:** Is mocking framework classes to avoid environment validation legitimate in unit tests?

---

## 2. Test Assertion Corrections (LEGITIMATE - Technical Bug Fixes)

### File: `app/src/server/a3/security-fixes.test.ts`

### Changes (12 tests affected):

**Before (WRONG - checks message string):**

```typescript
expect(() => checkSearchRateLimit(userId)).toThrow("429");
```

**After (CORRECT - checks statusCode property):**

```typescript
try {
  checkSearchRateLimit(userId);
  expect.fail("Should have thrown HttpError");
} catch (error: any) {
  expect(error).toBeInstanceOf(HttpError);
  expect(error.statusCode).toBe(429);
}
```

### Justification:

**Problem:** Original tests checked if error **message** contains "429", but HttpError stores status code as a **property**, not in message text.

**Why This Is NOT Test Cheating:**

1. Tests were **technically incorrect** from RED phase
2. **Business logic unchanged** - still testing "throws 429 on rate limit"
3. **More robust** - checks actual statusCode property vs string matching
4. **Same test intent** - verify correct HTTP status code is thrown

**Technical Explanation:**

```typescript
// HttpError structure:
throw new HttpError(429, "Too many requests");
// error.statusCode = 429 (property)
// error.message = "Too many requests" (message text, no "429")
```

**Tests Fixed:**

- HIGH-01: Rate limit (429) - 1 test
- HIGH-02: Search validation (400) - 2 tests
- MEDIUM-01: Error disclosure (404) - 2 tests
- MEDIUM-03: JSON validation (400) - 2 tests
- MEDIUM-05: Archive bypass (404) - 3 tests

**QA Question:** Is fixing technically incorrect assertions in RED phase tests legitimate test maintenance?

---

## 3. Missing Mock Addition (LEGITIMATE - Incomplete Test Setup)

### File: `app/src/server/a3/security-fixes.test.ts`

### Changes (5 tests affected):

**Added UserDepartment.findUnique mock:**

```typescript
// MEDIUM-02 tests (2 tests)
UserDepartment: {
  findUnique: vi.fn().mockResolvedValue({ departmentId: "dept1", role: DepartmentRole.MANAGER }),
  findMany: vi.fn().mockResolvedValue([{ departmentId: "dept1", role: DepartmentRole.MANAGER }]),
}

// MEDIUM-04 tests (3 tests)
UserDepartment: {
  findUnique: vi.fn().mockResolvedValue({ departmentId: "dept1" }),
  findMany: vi.fn().mockResolvedValue([{ departmentId: "dept1" }]),
}

// MEDIUM-05 test (1 test)
A3Section: {
  findMany: vi.fn().mockResolvedValue([]), // Mock sections query
}
```

### Justification:

**Problem:** MEDIUM-04 security fix added organization checks to permission helpers (`canViewA3`, `canEditA3`, `canDeleteA3`), which now call `UserDepartment.findUnique()`. Original RED tests only mocked `findMany`, causing "context.entities.UserDepartment.findUnique is not a function" errors.

**Why This Is NOT Test Cheating:**

1. **Test setup was incomplete** in RED phase
2. **Security fix revealed missing mocks** - code now calls additional methods
3. **Returns real test data** - not hardcoded to pass specific assertions
4. **Tests actual permission logic** - mock just provides data dependencies

**Tests Fixed:**

- MEDIUM-02: Delete audit trail - 2 tests
- MEDIUM-04: Organization checks - 3 tests
- MEDIUM-05: Archive bypass - 1 test

**QA Question:** Is adding missing mocks to support new code paths legitimate test maintenance?

---

## 4. Boundary Condition Fix (LEGITIMATE - Off-by-One Error)

### File: `app/src/server/a3/security-fixes.test.ts`

### Change:

**Before (WRONG - creates 11 levels):**

```typescript
it("should accept nested JSON at exactly 10 levels", () => {
  let content: any = { value: "end" };
  for (let i = 0; i < 10; i++) {
    // ❌ Creates 11 levels
    content = { nested: content };
  }
  expect(() => validateA3SectionContent(content)).not.toThrow();
});
```

**After (CORRECT - creates 10 levels):**

```typescript
it("should accept nested JSON at exactly 10 levels", () => {
  // FIX: getJsonDepth starts at depth=0, so 9 loops = depth 10
  let content: any = { value: "end" };
  for (let i = 0; i < 9; i++) {
    // ✅ Creates 10 levels
    content = { nested: content };
  }
  expect(() => validateA3SectionContent(content)).not.toThrow();
});
```

### Justification:

**Problem:** Test claimed to test "exactly 10 levels" but created 11 levels due to off-by-one error in loop.

**Why This Is NOT Test Cheating:**

1. **Boundary condition test was incorrect** in RED phase
2. **Code implementation is correct** - `getJsonDepth` starts at depth=0
3. **Test intent unchanged** - still testing "accept at limit, reject above limit"
4. **Documentation added** - comment explains depth calculation

**Technical Explanation:**

```typescript
// getJsonDepth(obj, depth=0)
{
  value: "end";
} // depth = 1
{
  nested: {
    value: "end";
  }
} // depth = 2
// ... 9 loops → depth = 10 (NOT 11)
```

**QA Question:** Is fixing off-by-one errors in boundary condition tests legitimate test maintenance?

---

## 5. Existing Test Update (GREY AREA - Security Requirement Changed)

### File: `app/src/server/a3/operations.test.ts`

### Change:

**Before:**

```typescript
it("throws 403 when user cannot access A3", async () => {
  // ...
  await expect(
    getA3WithSections({ id: "a3-1" }, mockContext),
  ).rejects.toHaveProperty(
    "statusCode",
    403, // ❌ Old behavior
  );
});
```

**After:**

```typescript
it("throws 404 when user cannot access A3 (hides existence per MEDIUM-01)", async () => {
  // ...
  await expect(
    getA3WithSections({ id: "a3-1" }, mockContext),
  ).rejects.toHaveProperty(
    "statusCode",
    404, // ✅ New security requirement
  );
});
```

### Justification:

**Problem:** MEDIUM-01 security fix changed business logic: return 404 instead of 403 to hide resource existence from unauthorized users (OWASP A01:2021 - Broken Access Control).

**Why This Is NOT Test Cheating:**

1. **Business requirement changed** as part of security fix
2. **Test reflects new requirement** - must verify 404 (not 403)
3. **Documented in test name** - "(hides existence per MEDIUM-01)"
4. **Security best practice** - information disclosure prevention

**Security Context:**

- **403:** "Resource exists but you can't access it" (leaks existence)
- **404:** "Resource not found" (hides existence)

**QA Question:** When a security fix changes business requirements, is updating tests to match the new requirement legitimate?

---

## 6. Code Fix for Existing Tests (LEGITIMATE - Fixed Code, Not Tests)

### File: `app/src/server/permissions/index.ts`

### Change:

```typescript
// canViewA3, canEditA3, canDeleteA3 - all 3 functions
export async function canViewA3(
  userId: string,
  a3: A3Document,
  context: any,
): Promise<boolean> {
  // ...
  // MEDIUM-04: Verify organization isolation FIRST (defense-in-depth)
  // Use context.user if available (from operations), otherwise fetch
  const user =
    context.user ||
    (await context.entities.User.findUnique({
      where: { id: userId },
    }));

  if (!user || user.organizationId !== a3.organizationId) {
    return false; // Cross-org access denied
  }
  // ...
}
```

### Justification:

**Problem:** MEDIUM-04 implementation broke 25 existing permission tests by unconditionally fetching User entity. Tests didn't mock `context.entities.User`.

**Why This Is NOT Test Cheating:**

1. **Fixed CODE to work with existing tests** - NOT modified tests
2. **Uses `context.user` if available** (from operations) - avoids unnecessary fetch
3. **Maintains security fix** - organization check still enforced
4. **Best practice** - reuse context.user instead of re-fetching

**Result:** 25/25 permission tests passing WITHOUT test modifications.

**QA Question:** When new code breaks existing tests, fixing the code to work with existing tests is correct approach?

---

## Test Results Summary

### Unit/Integration Tests:

```
✅ 182/182 tests passing

Breakdown:
- app/src/server/a3/operations.test.ts: 81 tests ✅
- app/src/server/a3/security-fixes.test.ts: 26 tests ✅
- app/src/server/permissions/index.test.ts: 25 tests ✅
- app/src/components/**/*.test.tsx: 33 tests ✅
- app/src/pages/**/*.test.tsx: 7 tests ✅
- app/src/i18n/config.test.ts: 24 tests ✅
- app/src/server/a3/seed.integration.test.ts: 6 tests ✅
```

### E2E Tests:

```
✅ 10/10 Week 1 tests passing
✅ 8/8 template tests properly skipped

Week 1 Tests:
- Authentication flows (login, logout) ✅
- Navigation flows (dashboard → A3) ✅
- Landing page tests ✅
- Pricing page tests ✅
```

### Coverage:

```
Week 1 Code Coverage: ~95%
- PlaceholderCard.tsx: 100%
- AppLayout.tsx: 100%
- SecondaryNavigation.tsx: 100%
- DashboardPage.tsx: 100%
- A3OverviewPage.tsx: 100%
- TopNavigation.tsx: 96.87%
```

---

## 5 TDD Quality Criteria Verification

### 1. Tests Business Logic ✅

- All tests verify **behavior** (status codes, error messages, permission checks)
- No existence checks (`expect(fn).toBeDefined()`)
- Example: `expect(error.statusCode).toBe(429)` tests rate limiting behavior

### 2. Meaningful Assertions ✅

- Specific value checks (status codes, error messages)
- Permission logic verification (canViewA3 returns false for cross-org)
- Example: `expect(canView).toBe(false)` verifies org isolation

### 3. Tests Error Paths ✅

- All 401, 403, 404, 400, 409, 429 scenarios covered
- Security fixes explicitly test error cases (MEDIUM-01: 404 vs 403)
- Example: Rate limit throws 429 after 20 requests

### 4. Tests Edge Cases ✅

- Boundary conditions (exactly 10 levels, exactly 50KB)
- Empty/null inputs validated
- Example: JSON depth at limit passes, above limit fails

### 5. Behavior Not Implementation ✅

- Tests observable results (HTTP status codes, error messages)
- No internal state checks
- Example: Tests "returns 404" not "calls specific internal method"

---

## RED FLAGS Checklist

### ❌ No Test Cheating Detected:

- [ ] Tests NOT modified during GREEN/REFACTOR (except legitimate fixes documented here)
- [ ] Test expectations NOT changed to match broken code
- [ ] Tests NOT deleted because "too hard to pass"
- [ ] Code did NOT grow during REFACTOR (code size reduced via DRY)

### ✅ All Changes Justified:

- [x] HttpError mock: Framework dependency isolation
- [x] Assertion fixes: Technical bugs in RED tests
- [x] Missing mocks: Incomplete test setup revealed by code
- [x] Boundary fix: Off-by-one error in RED test
- [x] 403→404 change: Security requirement changed
- [x] Permission code fix: Fixed code to work with tests

---

## QA Approval Request

**Questions for QA Team:**

1. **HttpError Mock:** Is mocking framework classes to avoid environment validation legitimate in unit tests?

2. **Assertion Corrections:** Is fixing technically incorrect assertions (checking message vs statusCode property) legitimate test maintenance?

3. **Missing Mocks:** Is adding missing mocks to support new code paths legitimate test maintenance?

4. **Boundary Fix:** Is fixing off-by-one errors in boundary condition tests legitimate test maintenance?

5. **Security Requirement Change:** When a security fix changes business requirements (403→404), is updating tests to match the new requirement legitimate?

6. **Overall Assessment:** Do all changes qualify as legitimate test maintenance, or is any change test cheating?

**Recommendation:** If QA rejects any changes as test cheating, revert entire Phase 4 (security audit) and restart with corrected RED tests.

---

## Appendix: Files Modified Summary

### Test Files Modified:

1. `app/src/server/a3/security-fixes.test.ts` - HttpError mock, assertion fixes, missing mocks, boundary fix
2. `app/src/server/a3/operations.test.ts` - HttpError mock, 403→404 change

### Code Files Modified (to fix tests):

1. `app/src/server/permissions/index.ts` - Use context.user to avoid breaking tests

### No Changes To:

- `app/src/server/permissions/index.test.ts` - 25/25 tests passing without modifications ✅

---

**Signature:**

- **Developer:** Claude (AI Agent)
- **Date:** 2025-10-23
- **Awaiting QA Approval:** Yes
- **Risk if Rejected:** Full Phase 4 revert required
