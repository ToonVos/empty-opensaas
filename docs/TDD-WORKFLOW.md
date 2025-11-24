# TDD-REFACTOR Workflow

**Test-Driven Development for AI-Assisted Coding**

This document describes our mandatory TDD workflow designed specifically for working with AI coding agents.

---

## 🎯 Why TDD with AI Agents?

### The Test Cheating Problem

When AI agents are given both tests and code to work with, they often take the easiest path to make tests "pass":

- **Delete the failing test** instead of fixing the code
- **Modify test expectations** to match buggy behavior
- **Change assertions** rather than implementing correctly

**Kent Beck (creator of TDD):**

> "I'm having trouble stopping AI agents from deleting tests in order to make them 'pass'"

### Why This Happens

LLMs have no inherent concept of "test as truth". When they see:

- Failing test (expects behavior X)
- Code that produces behavior Y

They see two conflicting pieces of text and will modify whichever is easier - often the test, not the code.

### The Solution: 2-Phase Workflow

By separating test writing from implementation, and making tests **immutable** before implementation begins, we prevent test cheating and ensure tests act as "guardrails" against AI hallucinations.

**Research shows:** Including tests in the prompt consistently solves more programming problems than just providing a problem statement.

---

## 📋 Choosing Your TDD Workflow (NEW)

**We have two TDD workflow approaches:**

### 1. Unified `/tdd-feature` - Single Command Workflow

**Best for:** Small features (<5 operations, <500 LOC, straightforward)

All 4 phases (RED → GREEN → REFACTOR → REVIEW) run sequentially in ONE command:

```bash
/tdd-feature "Add status field to tasks"
# → Runs all phases automatically
# → One session, context accumulates
# → Fastest for simple features
```

**Characteristics:**

- ✅ All phases in one session (no artifact overhead)
- ✅ Fastest for simple features
- ✅ Good for learning TDD workflow
- ⚠️ Context accumulates (~30k-50k tokens total)
- ⚠️ May exceed token budget for large features

**Use when:**

- Feature is straightforward (CRUD operations)
- Test scenarios are simple (standard auth/validation)
- Implementation is mechanical (no complex business logic)
- Time-sensitive (want speed over rigor)

### 2. Phased TDD Commands - Four Separate Commands

**Best for:** Large features (>5 operations, >500 LOC, complex)

4 separate commands with checkpoint artifacts between phases:

```bash
# Day 1: Write tests
cd tasks/sprints/sprint-3/day-02/
/red-tdd "Add priority filtering to tasks"

# Day 2: Implement
/green-tdd "priority-filtering"

# Day 3: Refactor
/refactor-tdd "priority-filtering"

# Day 4: Security audit
/security-tdd "priority-filtering"
```

**Characteristics:**

- ✅ Context budget managed per phase (~10k-20k tokens each)
- ✅ Artifact tracking (tests/, implementation/, refactor/, security/)
- ✅ Enable parallel execution (multiple worktrees)
- ✅ Flexible scheduling (split across days)
- ✅ Resume capability (restart failed phase only)
- ⚠️ Slightly more overhead (artifact creation/reading)

**Use when:**

- Feature is complex (multi-entity, complex business logic)
- Extensive planning needed (EXPLORE phases critical)
- Feature spans multiple days
- Multi-worktree coordination required
- Security implications (auth, payments, data export)

### Quick Decision Tree

```
Feature characteristics?
├─ Small (<5 operations, <500 LOC)
│  └─ Straightforward test scenarios
│     └─ ✅ Use /tdd-feature (unified)
│
└─ Large (>5 operations, >500 LOC)
   └─ Complex business logic OR multi-entity
      └─ ✅ Use phased commands (/red-tdd → /green-tdd → /refactor-tdd → /security-tdd)
```

### Phased Commands Overview

| Command             | Purpose                                 | Artifacts                                     | Duration  |
| ------------------- | --------------------------------------- | --------------------------------------------- | --------- |
| **`/red-tdd`**      | Write comprehensive tests (immutable)   | test-plan.md, coverage-targets.json           | 1-2 hours |
| **`/green-tdd`**    | Implement just enough to pass tests     | implementation-notes.md, coverage-actual.json | 2-3 hours |
| **`/refactor-tdd`** | Improve code quality (tests stay green) | refactor-report.md, refactor-metrics.json     | 1 hour    |
| **`/security-tdd`** | OWASP Top 10 compliance audit           | security-audit-[date].md, owasp-compliance.md | 30 min    |

**Artifact Directory Structure (Phased Approach):**

```
tasks/sprints/sprint-3/day-02/
├── README.md                    # Feature doelstelling (prerequisite)
├── tests/                       # /red-tdd artifacts
│   ├── test-plan.md
│   ├── test-suite-map.md
│   └── coverage-targets.json
├── implementation/              # /green-tdd artifacts
│   ├── implementation-notes.md
│   ├── coverage-actual.json
│   └── green-failures.md
├── refactor/                    # /refactor-tdd artifacts
│   ├── refactor-report.md
│   ├── refactor-metrics.json
│   └── complexity-analysis.md
└── security/                    # /security-tdd artifacts
    ├── security-audit-[date].md
    ├── owasp-compliance.md
    └── security-risks.json
```

**Cross-Phase Integration:**

- `/green-tdd` reads `tests/test-plan.md` for implementation guidance
- `/refactor-tdd` reads `implementation/implementation-notes.md` for known issues
- `/security-tdd` reads ALL prior artifacts for comprehensive audit

**See Also:**

- **Phased command docs:** `.claude/commands/red-tdd.md`, `.claude/commands/green-tdd.md`, `.claude/commands/refactor-tdd.md`, `.claude/commands/security-tdd.md`
- **CLAUDE.md:** TDD workflow section for complete comparison

---

## 🔴 Phase 1: RED (Write Tests First)

**Goal:** Define expected behavior through failing tests.

**Participants:** Human developer + AI agent collaborate

### Steps

1. **Understand the requirement**

   - What feature/fix are we implementing?
   - What are the acceptance criteria?
   - What edge cases exist?

2. **Start Test Watch Mode (REQUIRED)**

   ```bash
   # From project root
   ./scripts/test-watch.sh

   # OR from app/ directory
   cd app && wasp test client
   ```

   **Keep this terminal open throughout RED phase!**

   **Why:** Real-time feedback catches infrastructure issues immediately:

   - Import path errors (wasp/ vs @wasp/)
   - Enum hoisting errors (vi.hoisted() with enums)
   - Path alias issues (@/ in test files)
   - Timer conflicts (fake timers + waitFor)
   - Mock setup issues (nested beforeEach)

   **Workflow:**

   1. Watch terminal shows: "Waiting for file changes..."
   2. Write/modify test → Auto-runs immediately
   3. See failure reason → Verify it's correct (not timeout!)
   4. Fix infrastructure issues → Tests run again
   5. Tests fail for RIGHT reason → Ready to commit

2.5. **Component Type Assessment (UI Components Only)**

**BEFORE writing tests for UI components, check component type:**

**Question: Does component use portal-based Radix components?**

Check specification/requirements for:

- ✅ Dialog
- ✅ Sheet
- ✅ AlertDialog
- ✅ Popover (with portal)

**If YES → Use 3-layer test strategy:**

```bash
# Portal components need 3 layers:
# 1. Unit tests (*.logic.test.ts) - Business logic WITHOUT dialog wrapper
# 2. Component tests (*.test.tsx) - Simplified integration tests
# 3. E2E tests (*.spec.ts) - Full UX in real browser

# Use template:
cat .claude/templates/dialog-component-test.template.ts
```

**Why:**

- Portal components render outside component tree via `ReactDOM.createPortal`
- jsdom cannot simulate portals properly
- Standard component tests fail with "Unable to find element" errors

**If NO → Standard component tests:**

```bash
# Non-portal components (DropdownMenu, Select, etc.):
# - Single layer component tests (*.test.tsx)
# - Full coverage in jsdom
# - Pattern: TopNavigation.test.tsx
```

**Decision Tree:**

```
UI Component Test Strategy
├─ Portal component? (Dialog/Sheet/AlertDialog/Popover)
│  ├─ YES → 3-layer strategy
│  │         Template: dialog-component-test.template.ts
│  │         Example: CreateA3Dialog (Sprint 2)
│  │         Doc: app/src/components/CLAUDE.md
│  └─ NO  → Standard component tests
│            Pattern: TopNavigation.test.tsx
└─ Backend operation? → Unit tests (operations.test.ts)
```

**Resources:**

- **Checklist:** `app/src/components/CLAUDE.md` - "Component Type Checklist"
- **Template:** `.claude/templates/dialog-component-test.template.ts`
- **Example:** `app/src/components/a3/CreateA3Dialog` (Sprint 2 pattern)

3. **Write failing test(s)**

   ```bash
   # Create test file
   touch app/src/organization/operations.test.ts

   # Write test for expected behavior
   # (Use appropriate strategy from step 2.5 if UI component)
   ```

   **Watch terminal auto-runs test on save!**

4. **Verify Test Execution in Watch Mode**

   Watch terminal should show:

   - ✅ Tests EXECUTE (no syntax errors)
   - ✅ Tests FAIL for right reason (implementation missing)
   - ❌ NOT timeouts
   - ❌ NOT import errors
   - ❌ NOT framework incompatibility

   **Red Flags (STOP if you see):**

   ```
   ❌ Test timed out in 5000ms → Infrastructure issue!
   ❌ Cannot find module 'wasp/...' → Import path error
   ❌ ReferenceError: Cannot access enum before initialization → Hoisting issue
   ```

   **Expected Failures:**

   ```
   ✅ Cannot find module 'operations' → Good (not implemented yet)
   ✅ expected 'value' but got undefined → Good (no code yet)
   ✅ HttpError: Not found → Good (entity doesn't exist)
   ```

### 🚫 BLOCKING STEP: Verify Test Quality (REQUIRED)

**Before committing tests, ALL 5 criteria below MUST PASS.**

**If ANY criterion fails: 🚫 STOP → Rewrite tests → Re-verify**

**This is MANDATORY. Test theater will result in PR rejection and rework.**

---

#### ✅ 5 MUST PASS Criteria

**1. Tests Business Logic (NOT Existence)**

❌ **INVALID - Test Theater:**

```typescript
it("should exist", () => {
  expect(createOrganization).toBeDefined(); // Only checks function exists!
});

it("should return something", () => {
  const result = await createOrganization({ name: "Test" }, mockContext);
  expect(result).toBeDefined(); // Meaningless - everything is defined if no error
});
```

✅ **VALID - Tests Behavior:**

```typescript
it("should throw 401 if not authenticated", async () => {
  const mockContext = { user: null, entities: {} };
  await expect(
    createOrganization({ name: "Acme" }, mockContext),
  ).rejects.toThrow(HttpError);
  await expect(
    createOrganization({ name: "Acme" }, mockContext),
  ).rejects.toThrow("Not authenticated");
});

it("should create organization with correct data", async () => {
  const mockContext = {
    user: { id: "user-123" },
    entities: {
      Organization: {
        create: vi.fn().mockResolvedValue({ id: "org-1", name: "Acme Corp" }),
      },
    },
  };

  const result = await createOrganization({ name: "Acme Corp" }, mockContext);

  expect(result.name).toBe("Acme Corp");
  expect(mockContext.entities.Organization.create).toHaveBeenCalledWith({
    data: { name: "Acme Corp" },
  });
});
```

**Why:** Tests must verify actual business logic and behavior, not just that functions exist.

---

**2. Meaningful Assertions (NOT Generic Checks)**

❌ **INVALID - Test Theater:**

```typescript
it("should work", async () => {
  const result = await getOrganizations(null, mockContext);
  expect(result).toBeTruthy(); // What behavior does this verify?
  expect(result).toBeDefined(); // Of course it's defined if no error!
});
```

✅ **VALID - Specific Assertions:**

```typescript
it("should return all organizations for authenticated user", async () => {
  const mockContext = {
    user: { id: "user-123" },
    entities: {
      Organization: {
        findMany: vi.fn().mockResolvedValue([
          { id: "1", name: "Org A" },
          { id: "2", name: "Org B" },
        ]),
      },
    },
  };

  const result = await getOrganizations(null, mockContext);

  expect(result).toHaveLength(2);
  expect(result[0].name).toBe("Org A");
  expect(result[1].name).toBe("Org B");
  expect(mockContext.entities.Organization.findMany).toHaveBeenCalledWith();
});
```

**Why:** Assertions must verify specific, meaningful behavior that could actually fail.

---

**3. Tests Error Paths (NOT Just Happy Path)**

❌ **INVALID - Test Theater:**

```typescript
describe("createOrganization", () => {
  it("should create organization", async () => {
    // Only tests success case!
  });
});
```

✅ **VALID - Error Paths Covered:**

```typescript
describe("createOrganization", () => {
  it("should create organization with valid data", async () => {
    // Happy path
  });

  it("should throw 401 if not authenticated", async () => {
    const mockContext = { user: null, entities: {} };
    await expect(
      createOrganization({ name: "Acme" }, mockContext),
    ).rejects.toThrow(HttpError);
  });

  it("should throw 400 if name is empty", async () => {
    const mockContext = { user: { id: "user-1" }, entities: {} };
    await expect(createOrganization({ name: "" }, mockContext)).rejects.toThrow(
      "Name required",
    );
  });

  it("should throw 403 if user lacks permission", async () => {
    const mockContext = {
      user: { id: "user-1" },
      entities: {
        Organization: {
          findUnique: vi.fn().mockResolvedValue({
            id: "org-1",
            ownerId: "different-user-id", // Not the current user
          }),
        },
      },
    };
    await expect(
      updateOrganization({ id: "org-1", name: "New" }, mockContext),
    ).rejects.toThrow("Not authorized");
  });

  it("should throw 404 if organization not found", async () => {
    const mockContext = {
      user: { id: "user-1" },
      entities: {
        Organization: {
          findUnique: vi.fn().mockResolvedValue(null), // Not found
        },
      },
    };
    await expect(
      updateOrganization({ id: "nonexistent", name: "New" }, mockContext),
    ).rejects.toThrow("not found");
  });
});
```

**Required error scenarios:**

- 401 - Not authenticated (`context.user` is null)
- 400 - Bad request (validation errors: empty strings, invalid format)
- 404 - Resource not found
- 403 - Forbidden (authenticated but no permission)

**Why:** Real code fails. Tests must verify error handling works correctly.

---

**4. Tests Edge Cases (NOT Just Normal Inputs)**

❌ **INVALID - Test Theater:**

```typescript
it("should create organization", async () => {
  const result = await createOrganization({ name: "Test Org" }, mockContext);
  expect(result.name).toBe("Test Org");
});
// Only tests normal input!
```

✅ **VALID - Edge Cases Covered:**

```typescript
describe("createOrganization edge cases", () => {
  it("should reject empty name", async () => {
    await expect(createOrganization({ name: "" }, mockContext)).rejects.toThrow(
      "Name required",
    );
  });

  it("should reject null name", async () => {
    await expect(
      createOrganization({ name: null }, mockContext),
    ).rejects.toThrow();
  });

  it("should reject undefined name", async () => {
    await expect(
      createOrganization({ name: undefined }, mockContext),
    ).rejects.toThrow();
  });

  it("should trim whitespace from name", async () => {
    const result = await createOrganization(
      { name: "  Test Org  " },
      mockContext,
    );
    expect(result.name).toBe("Test Org"); // Whitespace trimmed
  });

  it("should reject name exceeding max length", async () => {
    const longName = "A".repeat(256);
    await expect(
      createOrganization({ name: longName }, mockContext),
    ).rejects.toThrow("too long");
  });

  it("should handle special characters in name", async () => {
    const result = await createOrganization(
      { name: "Test & Co." },
      mockContext,
    );
    expect(result.name).toBe("Test & Co.");
  });
});
```

**Required edge cases:**

- Empty values: `''`, `null`, `undefined`
- Boundary conditions: min/max length, min/max values
- Special characters: `&`, `<`, `>`, quotes
- Array edge cases: empty array `[]`, single item, very large array

**Why:** Edge cases reveal bugs. Most production bugs come from edge cases, not normal inputs.

---

**5. Behavior NOT Implementation (Observable Results)**

❌ **INVALID - Test Theater (Tests Internals):**

```typescript
// Component test - testing internal state
it('should set loading to false', () => {
  const { component } = renderInContext(<OrganizationsPage />);
  expect(component.state.loading).toBe(false); // Internal state!
});

// Operation test - testing internal variables
it('should call validation helper', async () => {
  const validateSpy = vi.spyOn(internalHelpers, 'validateName');
  await createOrganization({ name: 'Test' }, mockContext);
  expect(validateSpy).toHaveBeenCalled(); // Testing internal implementation!
});
```

✅ **VALID - Tests Observable Behavior:**

```typescript
// Component test - testing what user sees
it('should display organizations when loaded', async () => {
  const { mockQuery } = mockServer();
  mockQuery(getOrganizations, [
    { id: '1', name: 'Acme Corp' },
    { id: '2', name: 'TechCo' },
  ]);

  renderInContext(<OrganizationsPage />);

  await waitFor(() => {
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('TechCo')).toBeInTheDocument();
  });
});

// Operation test - testing return value and side effects
it('should return created organization', async () => {
  const mockContext = {
    user: { id: 'user-1' },
    entities: {
      Organization: {
        create: vi.fn().mockResolvedValue({ id: 'org-1', name: 'Acme' }),
      },
    },
  };

  const result = await createOrganization({ name: 'Acme' }, mockContext);

  expect(result.name).toBe('Acme'); // Return value
  expect(mockContext.entities.Organization.create).toHaveBeenCalledWith({
    data: { name: 'Acme' },
  }); // Side effect (database call)
});
```

**Test ONLY:**

- Return values (what the function returns)
- Side effects (database calls, API calls, file writes)
- Observable UI (what user sees in DOM)
- HTTP errors thrown
- Query invalidations

**NEVER test:**

- Internal variables
- Private helper functions
- Component internal state
- Implementation details that could change during refactor

**Why:** Tests should allow refactoring. If you refactor internals, tests should still pass.

---

#### ✅ Verification Checklist

Before committing, verify ALL 5:

- [ ] **Business logic tested** - NOT just existence checks
- [ ] **Meaningful assertions** - Specific values, NOT `.toBeDefined()`
- [ ] **Error paths tested** - 401, 400, 404, 403 scenarios present
- [ ] **Edge cases tested** - Empty values, boundaries, special chars
- [ ] **Behavior tested** - Return values and side effects, NOT internals

**If ANY checkbox is unchecked: 🚫 STOP → Rewrite tests**

---

#### 🤖 Automated Test Quality Verification

**New:** The `/tdd-feature` command now includes automatic test quality verification during RED phase.

**What It Does:**

After test generation, a **test-quality-auditor** runs automatically to:

1. ✅ Run tests and analyze failure reasons
2. ✅ Detect test theater patterns (side effects vs behavior)
3. ✅ Verify mocks are actually used (if present)
4. ✅ Match test pattern to implementation (unit vs integration)
5. ✅ Validate all 5 TDD criteria with code analysis

**If audit FAILS:** Returns to test specification with detailed issues
**If audit PASSES:** Proceeds to commit tests

**Manual Usage:**

```bash
# In Claude Code chat
"Use the test-quality-auditor skill to audit tests in app/src/server/a3/operations.test.ts"
```

**When to use manually:**

- After writing tests yourself (non-AI generated)
- Before committing test changes
- When GREEN phase reveals test issues (retroactive check)
- During code review of test PRs

**Learn More:**

- **Test Quality Auditor Skill:** `.claude/skills/test-quality-auditor.md`
- **Root Cause Analysis:** `docs/TDD-TEST-QUALITY-ANALYSIS.md`
- **Real Examples:** Sprint 2 Day 1 commits (7f274ec, 493ac07)

**Red Flags to Watch For:**

| Category               | Red Flag                                                      | Impact   |
| ---------------------- | ------------------------------------------------------------- | -------- |
| **Test Theater**       | Tests check side effects without verifying cause              | CRITICAL |
| **Test Theater**       | Tests pass via fallback/default mechanism                     | CRITICAL |
| **Mock Misuse**        | Mocks created but function has no parameter to receive them   | HIGH     |
| **Mock Misuse**        | Function uses global instance (DB, fetch) but test uses mocks | HIGH     |
| **Pattern Mismatch**   | Unit test pattern but implementation uses global DB           | HIGH     |
| **Criteria Violation** | No 401/403 auth tests for operations                          | MEDIUM   |
| **Criteria Violation** | No edge case tests (empty, null, boundaries)                  | MEDIUM   |
| **Criteria Violation** | Generic assertions (.toBeDefined(), .toBeTruthy())            | LOW      |

**Philosophy:** Catch test quality issues in RED phase, not GREEN phase. Tests should be "locked" before implementation begins.

---

#### 🔍 RED Phase Quality Control (Framework Constraints)

**Before committing tests in RED phase, verify they are EXECUTABLE** (even if failing).

**Expected RED behavior**: Tests run but FAIL because implementation doesn't exist yet.
**NOT acceptable**: Tests can't run due to syntax errors or framework incompatibility.

##### 1. Tests Must Execute (Even If Failing)

Tests MUST run without syntax errors. Failing tests is EXPECTED in RED, but they must be EXECUTABLE.

❌ **WRONG - Syntax errors prevent execution**:

```
Cannot find module '@/constants/...'
ReferenceError: Cannot access enum before initialization
```

✅ **CORRECT - Tests run and fail for right reason**:

```
❌ Test failed: Cannot find module 'operations' (expected - not implemented yet)
❌ Test failed: expected 'value' but got undefined (expected - no code yet)
```

##### 2. Wasp-Specific Constraints

**Path Aliases (CRITICAL)**:

```typescript
// ❌ WRONG - Wasp test build doesn't support @/ alias
import { X } from "@/constants/file";

// ✅ CORRECT - Use relative paths in test files
import { X } from "../../constants/file";
```

**Reason**: Wasp's test compilation doesn't resolve TypeScript path aliases configured in `tsconfig.json`.

**Enum Hoisting (CRITICAL)**:

```typescript
// ❌ WRONG - Enum undefined in vi.hoisted() scope
const { mockUser } = vi.hoisted(() => ({
  mockUser: { role: DepartmentRole.MEMBER }, // ReferenceError!
}));

// ✅ CORRECT - Use string literals in hoisted scope
const { mockUser } = vi.hoisted(() => ({
  mockUser: { role: "MEMBER" }, // Works - enum value is just a string
}));
```

**Reason**: Vitest's `vi.hoisted()` executes before imports, so enum types are undefined.

##### 3. Testing Library Query Priority

When multiple elements have the same text (e.g., breadcrumb + heading):

```typescript
// ❌ WRONG - Throws if text appears multiple times
expect(screen.getByText("Page Title")).toBeInTheDocument();
// Error: Found multiple elements with the text: Page Title

// ✅ CORRECT - Use semantic role query
expect(screen.getByRole("heading", { name: "Page Title" })).toBeInTheDocument();
```

**Query Priority Hierarchy** (Testing Library best practices):

1. **Role-based** (BEST): `getByRole('button', { name: 'Submit' })`
2. **Label-based**: `getByLabelText('Email')`
3. **Text-based** (FALLBACK): `getByText('Unique text')` - Only if guaranteed unique

**Why**: Role-based queries are:

- More specific (targets semantic HTML)
- More maintainable (survives refactoring)
- Better for accessibility (ensures proper ARIA roles)

##### 4. Pre-Commit Execution Checklist

**MANDATORY before committing tests:**

- [ ] ✅ Tests EXECUTE in watch mode (no timeouts >1000ms)
- [ ] ✅ Watch terminal shows clear failure reasons (not "timed out in 5000ms")
- [ ] `wasp test client run` executes without syntax errors
- [ ] Tests FAIL for right reason (missing implementation, NOT syntax)
- [ ] All imports use relative paths (no `@/` in test files)
- [ ] No enum access in `vi.hoisted()` blocks (use string literals)
- [ ] Queries use semantic roles when possible (`getByRole` preferred over `getByText`)
- [ ] All 5 quality criteria pass (see above sections)

**If ANY checkbox is unchecked → 🚫 DO NOT COMMIT**

**Red Flags from Watch Mode:**

- ❌ **"Test timed out in 5000ms"** → Infrastructure issue (fake timers, mock conflicts)
- ❌ **"Cannot find module"** → Import path error (use `wasp/`, not `@wasp/`)
- ❌ **"ReferenceError: Cannot access enum"** → Hoisting issue (use string literals in vi.hoisted())

##### 5. "Immutable" Rule Clarification

**Test EXPECTATIONS are immutable:**

- ❌ NEVER change assertions (expect.toBe → expect.toBeDefined)
- ❌ NEVER remove test cases
- ❌ NEVER weaken error checks

**Test IMPLEMENTATION is mutable when:**

- ✅ Framework compatibility fixes (path aliases, enum literals)
- ✅ Syntax corrections (no behavior change)
- ✅ Query improvements (getByText → getByRole) - **ONLY in REFACTOR phase**

**Rationale**: The "what" (behavior being tested) is immutable. The "how" (technical implementation) can be fixed for framework constraints.

**Example of acceptable syntax fix (GREEN phase)**:

```typescript
// Before (committed in RED - syntax error)
const { mockUser } = vi.hoisted(() => ({ role: DepartmentRole.MEMBER }));

// After (fixed in GREEN - same behavior, different syntax)
const { mockUser } = vi.hoisted(() => ({ role: "MEMBER" }));

// ✅ Allowed: Enum → string literal (semantically identical)
// ❌ NOT allowed: Changing test expectations or removing assertions
```

**Reference**: See `reports/qa/2025-10-24-test-modifications-sprint-2-detail.md` for real-world case study.

---

#### 📝 Commit Message Template (REQUIRED Format)

When committing tests, include quality verification:

```bash
git add app/src/organization/*.test.ts
git commit -m "test: add Organization CRUD tests (RED)

✅ Test Quality Verified (5/5 criteria passed):
- Business logic: Auth checks, validation, CRUD operations
- Assertions: Specific values (name, id) and behavior verification
- Error paths: 401 (no auth), 400 (validation), 404 (not found), 403 (no permission)
- Edge cases: Empty name, null values, whitespace trimming, max length
- Behavior: Return values and Prisma calls tested (not internals)

Test coverage: 6 tests total
- 2 success paths (create, get all)
- 4 failure paths (401, 400, 404, 403)"
```

**This commit message format is MANDATORY.** It proves test quality verification was performed.

---

#### 🚫 Consequences of Test Theater

If tests do NOT meet all 5 criteria:

- 🚫 **PR will be REJECTED** - No exceptions
- 🚫 **Tests must be rewritten by human** - AI agent will not be trusted to fix
- 🚫 **Rework required** - Delays delivery and wastes team time
- 🚫 **Coverage numbers are MEANINGLESS** - 100% coverage with test theater = 0% value

**Why strict?** Test theater is worse than no tests. It gives false confidence that code is tested when it's not.

**Remember Kent Beck's problem:** AI agents will cheat on tests if allowed. This verification prevents that.

---

5. **Commit tests (makes them immutable)**

   ```bash
   git add app/src/organization/*.test.ts
   git commit -m "test: add Organization CRUD tests (RED)"
   ```

6. **Document RED state**
   - Copy test output showing failure
   - Note expected error messages
   - Confirm tests fail for RIGHT reasons

**You can now stop watch mode (press 'q') or keep it running for GREEN phase.**

### ✅ Phase 1 Complete When:

- [ ] Watch mode shows tests EXECUTE (no timeouts)
- [ ] Tests written and clearly describe expected behavior
- [ ] Tests run and FAIL with expected error messages (not infrastructure errors)
- [ ] All 5 quality criteria verified
- [ ] Tests committed to git (separate commit from implementation)
- [ ] Ready to proceed to implementation

---

## 🟢 Phase 2: GREEN (Minimal Implementation)

**Goal:** Write just enough code to make tests pass.

**Participant:** AI agent (with human oversight)

### Steps

1. **Implement minimal code**

   - Focus: Make tests pass
   - Avoid: Over-engineering, extra features
   - Rule: No test modifications allowed

2. **Run tests**

   ```bash
   cd app
   wasp test client run

   # Goal: All tests GREEN
   ```

3. **Fix failures (code only!)**

   - If tests still fail → modify ONLY implementation code
   - NEVER modify tests to make them pass
   - If test seems wrong → stop and discuss with human

4. **Verify GREEN**
   ```bash
   # All tests pass
   ✓ should create organization
   ✓ should throw 401 if not authenticated
   ✓ should throw 400 if name missing
   ```

### ✅ Phase 2 Complete When:

- [ ] All tests pass
- [ ] No test files were modified
- [ ] Implementation is minimal (no extra features)
- [ ] Ready for refactor

---

## 🔵 Phase 3: REFACTOR (Simplify & Clean)

**Goal:** Improve code quality while keeping tests green.

**Participant:** AI agent (with explicit refactor instructions)

### The Refactoring Principle

> "The art is not in writing code, but in **removing** it."

AI agents naturally write MORE code. Refactoring forces them to write LESS code.

### Refactoring Checklist

Go through each item:

- [ ] **Remove duplication** - Extract repeated code into helpers
- [ ] **Simplify conditionals** - Reduce nested if/else statements
- [ ] **Extract functions** - Break long functions into smaller ones
- [ ] **Improve naming** - Make variable/function names clearer
- [ ] **Remove unused code** - Delete dead variables, imports, functions
- [ ] **Add type safety** - Use TypeScript types to prevent bugs
- [ ] **Remove comments** - Code should be self-documenting
- [ ] **Check: Can I delete any code?** - Always ask this

### Steps

1. **Identify improvement opportunities**

   - Look for code smells
   - Find duplication
   - Spot complex logic

2. **Make ONE refactor at a time**

   ```bash
   # Refactor something
   wasp test client run  # Verify still green

   # Refactor next thing
   wasp test client run  # Verify still green
   ```

3. **Run tests after EACH refactor**

   - Never batch multiple refactors
   - Tests act as safety net
   - Immediate feedback if something breaks

4. **Run coverage check**

   ```bash
   wasp test client run --coverage

   # Goal: ≥80% statements, ≥75% branches
   ```

5. **Commit implementation + refactored code**

   ```bash
   git add app/src/organization/
   git commit -m "feat(organization): implement CRUD operations

   - Add Organization model to schema
   - Implement getOrganizations and createOrganization
   - Add validation and auth checks
   - Coverage: 85% statements, 78% branches"
   ```

### ✅ Phase 3 Complete When:

- [ ] Code is simplified (fewer lines than before refactor)
- [ ] Tests still pass
- [ ] Coverage ≥80% statements, ≥75% branches
- [ ] No code smells remain
- [ ] Ready to commit

---

## 🚫 RED FLAGS - Stop Immediately If:

You observe ANY of these, stop and escalate:

- ❌ **Test file has uncommitted changes during GREEN/REFACTOR**

  - Tests should be committed in Phase 1 (RED)
  - If test changed during GREEN → test cheating!

- ❌ **Test expectations change during implementation**

  - Original: `expect(result.name).toBe('Acme')`
  - Changed to: `expect(result.name).toBeUndefined()`
  - This is test cheating - stop!

- ❌ **Test deleted during GREEN phase**

  - "Test was too hard to pass, so I removed it"
  - This defeats the purpose of TDD

- ❌ **"The test is wrong" during GREEN phase**

  - If test seems incorrect, go back to human
  - Don't modify test to match buggy code

- ❌ **Code grows significantly during REFACTOR**

  - Refactor should REDUCE code size
  - If adding features → wrong phase

- ❌ **Coverage drops below thresholds**
  - Must maintain ≥80% statements, ≥75% branches
  - Fix: Add tests, don't lower thresholds

---

## 📊 Coverage Requirements

### Thresholds (Enforced)

```
Statements:  ≥80%
Branches:    ≥75%
Functions:   ≥80%
Lines:       ≥80%
```

### Check Coverage

```bash
cd app
wasp test client run --coverage

# Output shows:
# File             | % Stmts | % Branch | % Funcs | % Lines
# -----------------|---------|----------|---------|--------
# operations.ts    |   85.71 |    80.00 |   88.89 |   85.71
```

### Improve Coverage

If coverage is low:

1. **Identify uncovered lines** - Check HTML report in `coverage/`
2. **Add missing tests** - Focus on branches (if/else, try/catch)
3. **Test edge cases** - null inputs, empty arrays, error conditions
4. **Don't cheat** - Don't delete code to improve coverage

### Coverage Reports

```bash
# Text report (terminal)
wasp test client run --coverage

# HTML report (browser)
open app/coverage/index.html
```

---

## 💡 Git Workflow Pattern

### Complete Example: Add Organization Feature

```bash
# ============= PHASE 1: RED =============

# 1. Create test file
vim app/src/organization/operations.test.ts

# 2. Write failing tests
# - should create organization
# - should throw 401 if not authenticated
# - should throw 400 if name missing

# 3. Run tests (verify RED)
cd app && wasp test client run
# ❌ Cannot find module 'organization/operations'

# 4. Commit tests only
git add app/src/organization/*.test.ts
git commit -m "test: add Organization CRUD tests (RED)"

# ============= PHASE 2: GREEN =============

# 5. Add model to schema.prisma
vim app/schema.prisma
# model Organization { id, name, ... }

# 6. Run migration
wasp db migrate-dev "Add Organization model"

# 7. Create operations.ts (minimal implementation)
vim app/src/organization/operations.ts

# 8. Update main.wasp
vim app/main.wasp
# query getOrganizations { ... }
# action createOrganization { ... }

# 9. Restart wasp
wasp start

# 10. Run tests (verify GREEN)
cd app && wasp test client run
# ✅ All tests pass!

# ============= PHASE 3: REFACTOR =============

# 11. Refactor: Extract validation helper
vim app/src/organization/operations.ts
cd app && wasp test client run  # Still green!

# 12. Refactor: Simplify error handling
vim app/src/organization/operations.ts
cd app && wasp test client run  # Still green!

# 13. Check coverage
cd app && wasp test client run --coverage
# ✅ 85% statements, 78% branches

# 14. Commit implementation
git add app/schema.prisma app/main.wasp app/src/organization/
git commit -m "feat(organization): implement CRUD operations

- Add Organization model
- Implement getOrganizations and createOrganization
- Add auth and validation checks
- Refactor: Extract validateOrgName helper
- Coverage: 85% statements, 78% branches

Closes #42"
```

---

## 📝 Test File Structure

### Location

```
app/src/
  organization/
    operations.ts              # Implementation
    operations.test.ts         # Unit tests
    OrganizationsPage.tsx      # Component
    OrganizationsPage.spec.tsx # Component tests
```

### Naming Convention

- `*.test.ts` - Unit tests (operations, utils)
- `*.spec.tsx` - Component tests (React components)
- `*.integration.test.ts` - Integration tests (user flows)

---

## 🛠️ Testing Commands Reference

```bash
# Run tests in watch mode (default)
wasp test client

# Run tests once (CI mode)
wasp test client run

# Run with visual UI
wasp test client --ui

# Run with coverage report
wasp test client run --coverage

# Run specific test file
wasp test client run operations.test.ts

# Run tests matching pattern
wasp test client run --grep "Organization"
```

---

## 🎯 Common Pitfalls

### ❌ Writing Tests After Code

**Wrong:**

```bash
1. Write implementation
2. Make it work
3. Write tests that pass
```

**Problem:** Tests just "validate" existing behavior (homework marking). No safety net.

**Right:**

```bash
1. Write tests (RED)
2. Implement minimal code (GREEN)
3. Refactor (tests stay GREEN)
```

### ❌ Skipping Refactor Phase

**Wrong:**

```bash
Tests pass → Commit → Move on
```

**Problem:** Code gets bloated, duplicated, unclear over time.

**Right:**

```bash
Tests pass → Refactor → Tests still pass → Commit
```

### ❌ Over-Engineering in GREEN Phase

**Wrong:**

```bash
"While implementing X, I also added Y and Z for future use"
```

**Problem:** Violates "minimal code" principle. Adds complexity without tests.

**Right:**

```bash
"I implemented exactly what tests require, nothing more"
```

### ❌ Testing Implementation Details

**Wrong:**

```typescript
// Testing internal variables
expect(component.state.isLoading).toBe(false);
```

**Problem:** Tests break when refactoring internals.

**Right:**

```typescript
// Testing observable behavior
expect(screen.getByText("Loaded")).toBeInTheDocument();
```

### ❌ Not Mocking Dependencies

**Wrong:**

```typescript
// Calling real API in test
const result = await fetch("https://api.example.com/data");
```

**Problem:** Tests are slow, flaky, require network.

**Right:**

```typescript
// Mock the API call
const { mockApi } = mockServer();
mockApi({ method: "GET", path: "/data" }, { data: mockData });
```

---

## 🎭 Mocking Standards

**Wasp Project Standard:** `vi.mock()` ONLY

### DO

✅ **Use vi.mock() for ALL mocking:**

```typescript
// SDK integration tests
vi.mock("openai", () => ({
  default: class OpenAI {
    models = { list: vi.fn() };
  },
}));

// Operation tests - Mock context
const mockContext = {
  user: { id: "user-id" },
  entities: { Task: { findMany: vi.fn() } },
};

// Component tests - Mock Wasp hooks
vi.mock("wasp/client/operations", () => ({
  useQuery: vi.fn(),
  createTask: vi.fn(),
}));
```

✅ **Follow existing patterns:**

- 13+ test files use vi.mock()
- Consistent with Wasp operation testing patterns
- Direct control over return values

### DON'T

❌ **NEVER install MSW:**

```bash
# ❌ WRONG - Breaks project consistency
npm install -D msw

# ✅ CORRECT - Use vi.mock() instead
vi.mock('module-name', () => ({ ... }));
```

### Why vi.mock() Over MSW?

| Aspect        | vi.mock()                  | MSW                          |
| ------------- | -------------------------- | ---------------------------- |
| **Speed**     | ✅ Fast (no HTTP overhead) | ⚠️ Slower (HTTP layer)       |
| **Setup**     | ✅ Simple (inline)         | ⚠️ Complex (server config)   |
| **Control**   | ✅ Direct                  | ⚠️ Indirect (handlers)       |
| **Standard**  | ✅ Project standard        | ❌ Not used in project       |
| **Realistic** | ⚠️ Mocks SDK layer         | ✅ Mocks HTTP layer          |
| **Wasp Fit**  | ✅ Matches operation tests | ⚠️ Inconsistent with project |

**Verdict:** vi.mock() is the established project standard. MSW would break consistency.

### When to Use vi.mock()

- **SDK integration tests:** Mock OpenAI, Anthropic, Azure AI, Stripe
- **Operation tests:** Mock context.entities (Prisma delegates)
- **Component tests:** Mock wasp/client/auth, useQuery, useAction
- **Helper tests:** Mock dependencies (logger, validators)

### Complete Mock Example

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { syncModels } from "./operations";

// Mock external SDK
vi.mock("openai", () => ({
  default: class OpenAI {
    models = { list: vi.fn() };
  },
}));

describe("syncModels Operation", () => {
  let mockContext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockContext = {
      user: { id: "user-id", isOwner: true },
      entities: {
        Provider: { findUnique: vi.fn() },
        Model: { upsert: vi.fn() },
      },
    };
  });

  it("syncs models from provider", async () => {
    mockContext.entities.Provider.findUnique.mockResolvedValue({
      id: "provider-id",
      apiKey: "sk-test",
    });

    const result = await syncModels({ providerId: "provider-id" }, mockContext);

    expect(result.synced).toBeGreaterThan(0);
    expect(mockContext.entities.Model.upsert).toHaveBeenCalled();
  });
});
```

**See also:**

- `.claude/agents/wasp-test-automator.md` - Complete mocking patterns
- `app/src/test/CLAUDE.md` - Component test mocking
- `app/src/server/a3/operations.test.ts` - Reference operation test

---

## 📚 Examples

### Unit Test Example (Operation)

```typescript
// app/src/organization/operations.test.ts
import { describe, it, expect } from "vitest";
import { createOrganization } from "./operations";
import { HttpError } from "wasp/server";

describe("createOrganization", () => {
  it("should create organization with valid data", async () => {
    const mockContext = {
      user: { id: "user-1" },
      entities: {
        Organization: {
          create: vi.fn().mockResolvedValue({
            id: "org-1",
            name: "Acme Corp",
          }),
        },
      },
    };

    const result = await createOrganization({ name: "Acme Corp" }, mockContext);

    expect(result.name).toBe("Acme Corp");
    expect(mockContext.entities.Organization.create).toHaveBeenCalledWith({
      data: { name: "Acme Corp" },
    });
  });

  it("should throw 401 if not authenticated", async () => {
    const mockContext = { user: null, entities: {} };

    await expect(
      createOrganization({ name: "Acme" }, mockContext),
    ).rejects.toThrow(HttpError);
  });

  it("should throw 400 if name is empty", async () => {
    const mockContext = {
      user: { id: "user-1" },
      entities: {},
    };

    await expect(createOrganization({ name: "" }, mockContext)).rejects.toThrow(
      "Name required",
    );
  });
});
```

### Component Test Example

```typescript
// app/src/organization/OrganizationsPage.spec.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { renderInContext, mockServer } from 'wasp/client/test';
import { screen, waitFor } from '@testing-library/react';
import OrganizationsPage from './OrganizationsPage';
import { getOrganizations } from 'wasp/client/operations';

describe('OrganizationsPage', () => {
  beforeEach(() => {
    mockServer();
  });

  it('should show loading state initially', () => {
    renderInContext(<OrganizationsPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render organizations when loaded', async () => {
    const { mockQuery } = mockServer();
    mockQuery(getOrganizations, [
      { id: '1', name: 'Acme Corp' },
      { id: '2', name: 'TechCo' },
    ]);

    renderInContext(<OrganizationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('TechCo')).toBeInTheDocument();
    });
  });

  it('should show error message on failure', async () => {
    const { mockQuery } = mockServer();
    mockQuery(getOrganizations, () => {
      throw new Error('Failed to fetch');
    });

    renderInContext(<OrganizationsPage />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

---

## 🔄 Integration with CI/CD

### Pre-commit Hook

Tests and coverage run automatically before commit:

```bash
# .husky/pre-commit
wasp test client run --coverage || {
  echo "❌ Tests failed or coverage below threshold"
  exit 1
}
```

### Pre-push Hook

Full test suite runs before push:

```bash
# .husky/pre-push
wasp test client run --coverage || {
  echo "❌ Test suite failed"
  exit 1
}
```

### GitHub Actions

CI runs tests on every PR:

```yaml
- name: Run tests with coverage
  run: |
    cd app
    wasp test client run --coverage
```

---

## 🎓 Summary

**Remember:**

1. ✅ Tests FIRST, then implementation
2. ✅ Commit tests separately (RED phase)
3. ✅ Minimal code to pass (GREEN phase)
4. ✅ Refactor to simplify (tests stay GREEN)
5. ✅ Coverage ≥80% statements, ≥75% branches
6. ❌ NEVER modify tests during GREEN/REFACTOR
7. ❌ If test seems wrong → stop and ask human

**The Art of Coding:**

> Code is liability, not asset. Less code = better. Refactor ruthlessly.

---

**Questions or issues?** See `CLAUDE.md` for comprehensive testing guide or ask in team chat.
