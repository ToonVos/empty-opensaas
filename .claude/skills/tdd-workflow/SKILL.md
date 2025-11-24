---
name: tdd-workflow
description: Complete Test-Driven Development workflow for AI-assisted development. Use when writing tests, implementing TDD, or verifying test quality. Includes RED-GREEN-REFACTOR phases, 5 quality criteria, test cheating detection, and coverage requirements.
triggers:
  [
    "test",
    "TDD",
    "testing",
    "write tests",
    "test coverage",
    "RED phase",
    "GREEN phase",
    "REFACTOR",
    "test quality",
  ]
version: 1.0
last_updated: 2025-10-18
allowed_tools: [Read, Write, Edit, Bash]
---

# TDD Workflow Skill

## Quick Reference

**When to use this skill:**

- Writing tests for new features
- Implementing Test-Driven Development
- Verifying test quality
- Debugging failing tests
- Reviewing test coverage

**Key Principle:** Tests FIRST, then implementation. Tests act as guardrails against AI hallucinations.

---

## The Test Cheating Problem

### Why AI Agents Delete Tests

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

## 2-Phase TDD Solution

### Phase 1: RED (Write & Commit Tests)

**Goal:** Define expected behavior through failing tests.

**Participants:** Human developer + AI agent collaborate

**Steps:**

1. **Understand the requirement**

   - What feature/fix are we implementing?
   - What are the acceptance criteria?
   - What edge cases exist?

2. **Write failing test(s)**

   ```bash
   # Create test file
   touch app/src/organization/operations.test.ts

   # Write test for expected behavior
   ```

3. **Run tests to verify RED**

   ```bash
   cd app
   wasp test client run

   # Expected: Test FAILS with meaningful error
   # e.g., "Cannot find module" or "Expected X, got undefined"
   ```

4. **BLOCKING STEP: Verify Test Quality (REQUIRED)**

   Before committing tests, ALL 5 criteria MUST PASS (see next section).

   **If ANY criterion fails: STOP → Rewrite tests → Re-verify**

5. **Commit tests (makes them immutable)**

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

**Phase 1 Complete When:**

- [ ] Tests written and clearly describe expected behavior
- [ ] Tests run and FAIL with expected error messages
- [ ] Tests committed to git (separate commit from implementation)
- [ ] Ready to proceed to implementation

### Phase 2: GREEN + REFACTOR (Implement & Simplify)

**Goal:** Write just enough code to make tests pass, then simplify.

**Participant:** AI agent (with human oversight)

**GREEN Steps:**

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

**GREEN Complete When:**

- [ ] All tests pass
- [ ] No test files were modified
- [ ] Implementation is minimal (no extra features)

**REFACTOR Steps:**

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

3. **Refactoring Checklist:**

   - [ ] Remove duplication - Extract repeated code into helpers
   - [ ] Simplify conditionals - Reduce nested if/else statements
   - [ ] Extract functions - Break long functions into smaller ones
   - [ ] Improve naming - Make variable/function names clearer
   - [ ] Remove unused code - Delete dead variables, imports, functions
   - [ ] Add type safety - Use TypeScript types to prevent bugs
   - [ ] Remove comments - Code should be self-documenting
   - [ ] Check: Can I delete any code? - Always ask this

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

**REFACTOR Complete When:**

- [ ] Code is simplified (fewer lines than before refactor)
- [ ] Tests still pass
- [ ] Coverage ≥80% statements, ≥75% branches
- [ ] No code smells remain

---

## 5 MUST PASS Test Quality Criteria

**Before committing tests, ALL 5 criteria below MUST PASS.**

**If ANY criterion fails: STOP → Rewrite tests → Re-verify**

**This is MANDATORY. Test theater will result in PR rejection and rework.**

### 1. Tests Business Logic (NOT Existence)

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

### 2. Meaningful Assertions (NOT Generic Checks)

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

### 3. Tests Error Paths (NOT Just Happy Path)

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

### 4. Tests Edge Cases (NOT Just Normal Inputs)

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

### 5. Behavior NOT Implementation (Observable Results)

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
- **Component library choice** (native vs Radix/ShadCN)
- **Implementation-specific methods** (`selectOptions` assumes native `<select>`)

❌ **Implementation Lock-In:**

```typescript
// Assumes native <select> - breaks if Radix UI used
await user.selectOptions(screen.getByTestId("filter"), "value");
```

✅ **Component-Agnostic:**

```typescript
// Works with ANY dropdown implementation
await user.click(screen.getByLabelText("Filter"));
await user.click(screen.getByRole("option", { name: "Draft" }));
```

**Why:** Tests should allow refactoring. If you refactor internals or swap component libraries, tests should still pass.

### Verification Checklist

Before committing, verify ALL 5:

- [ ] **Business logic tested** - NOT just existence checks
- [ ] **Meaningful assertions** - Specific values, NOT `.toBeDefined()`
- [ ] **Error paths tested** - 401, 400, 404, 403 scenarios present
- [ ] **Edge cases tested** - Empty values, boundaries, special chars
- [ ] **Behavior tested** - Return values and side effects, NOT internals

**If ANY checkbox is unchecked: STOP → Rewrite tests**

---

## RED FLAGS - Stop Immediately If:

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

## Coverage Requirements

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

## Git Workflow Integration

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

# 9. Restart wasp (multi-worktree safe)
../scripts/safe-start.sh

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

## Test Templates

See `.claude/templates/test.template.ts` for copy-paste ready templates:

### Unit Test Template (Operations)

```typescript
describe("operationName", () => {
  it("should handle success case", async () => {
    // Arrange
    const mockContext = {
      user: { id: "user-123" },
      entities: {
        EntityName: {
          findMany: vi.fn().mockResolvedValue([
            { id: "1", name: "Test 1" },
            { id: "2", name: "Test 2" },
          ]),
        },
      },
    };

    const args = {
      /* test arguments */
    };

    // Act
    const result = await operationName(args, mockContext);

    // Assert
    expect(result).toBeDefined();
    expect(result).toHaveLength(2);
    expect(mockContext.entities.EntityName.findMany).toHaveBeenCalledWith({
      where: { userId: "user-123" },
    });
  });

  it("should throw 401 if not authenticated", async () => {
    const mockContext = { user: null, entities: {} };
    const args = {
      /* test arguments */
    };

    await expect(operationName(args, mockContext)).rejects.toThrow(HttpError);
    await expect(operationName(args, mockContext)).rejects.toThrow(
      "Not authenticated",
    );
  });

  it("should throw 400 if required field is missing", async () => {
    const mockContext = {
      user: { id: "user-123" },
      entities: {},
    };
    const args = { name: "" }; // Invalid: empty name

    await expect(operationName(args, mockContext)).rejects.toThrow(HttpError);
    await expect(operationName(args, mockContext)).rejects.toThrow(
      "Name required",
    );
  });

  it("should throw 404 if resource not found", async () => {
    const mockContext = {
      user: { id: "user-123" },
      entities: {
        EntityName: {
          findUnique: vi.fn().mockResolvedValue(null), // Not found
        },
      },
    };
    const args = { id: "nonexistent-id" };

    await expect(operationName(args, mockContext)).rejects.toThrow(HttpError);
    await expect(operationName(args, mockContext)).rejects.toThrow("not found");
  });

  it("should throw 403 if user lacks permission", async () => {
    const mockContext = {
      user: { id: "user-123" },
      entities: {
        EntityName: {
          findUnique: vi.fn().mockResolvedValue({
            id: "1",
            userId: "different-user-id", // Owned by different user
          }),
        },
      },
    };
    const args = { id: "1" };

    await expect(operationName(args, mockContext)).rejects.toThrow(HttpError);
    await expect(operationName(args, mockContext)).rejects.toThrow(
      "Not authorized",
    );
  });
});
```

### Component Test Template (React)

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    mockServer();
  });

  it('should render loading state initially', () => {
    renderInContext(<ComponentName />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render data when loaded', async () => {
    const { mockQuery } = mockServer();
    const mockData = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
    ];
    mockQuery(getQueryName, mockData);

    renderInContext(<ComponentName />);

    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });

  it('should render error message on failure', async () => {
    const { mockQuery } = mockServer();
    mockQuery(getQueryName, () => {
      throw new Error('Failed to fetch');
    });

    renderInContext(<ComponentName />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should render empty state when no data', async () => {
    const { mockQuery } = mockServer();
    mockQuery(getQueryName, []); // Empty array

    renderInContext(<ComponentName />);

    await waitFor(() => {
      expect(screen.getByText(/no items/i)).toBeInTheDocument();
    });
  });
});
```

### Edge Case Testing Checklist

When writing tests, consider these edge cases:

**Auth & Permissions:**

- [x] Not authenticated (user = null)
- [x] Authenticated but no permission (different userId)
- [ ] User with different role (VIEWER vs MANAGER)
- [ ] User from different organization/department

**Input Validation:**

- [x] Empty string
- [ ] Null/undefined
- [ ] Too long input (exceeds max length)
- [ ] Invalid format (e.g., email, URL)
- [ ] Special characters (SQL injection, XSS)

**Data States:**

- [x] Resource not found (404)
- [x] Empty array/list
- [ ] Single item vs multiple items
- [ ] Very long list (pagination)

**Error Handling:**

- [x] Network error
- [ ] Database error
- [ ] Timeout
- [ ] Partial failure (some succeed, some fail)

**Business Logic:**

- [ ] Boundary conditions (min/max values)
- [ ] State transitions (draft → published → archived)
- [ ] Cascading deletes/updates

---

## Complete TDD Workflow Example

### Scenario: Add Organization CRUD Feature

**Step 1: RED Phase - Write Tests**

```typescript
// app/src/organization/operations.test.ts
import { describe, it, expect } from "vitest";
import { createOrganization, getOrganizations } from "./operations";
import { HttpError } from "wasp/server";

describe("getOrganizations", () => {
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
  });

  it("should throw 401 if not authenticated", async () => {
    const mockContext = { user: null, entities: {} };
    await expect(getOrganizations(null, mockContext)).rejects.toThrow(
      HttpError,
    );
  });
});

describe("createOrganization", () => {
  it("should create organization with valid data", async () => {
    const mockContext = {
      user: { id: "user-123" },
      entities: {
        Organization: {
          create: vi.fn().mockResolvedValue({ id: "org-1", name: "Acme" }),
        },
      },
    };

    const result = await createOrganization({ name: "Acme" }, mockContext);
    expect(result.name).toBe("Acme");
  });

  it("should throw 401 if not authenticated", async () => {
    const mockContext = { user: null, entities: {} };
    await expect(
      createOrganization({ name: "Acme" }, mockContext),
    ).rejects.toThrow("Not authenticated");
  });

  it("should throw 400 if name is empty", async () => {
    const mockContext = { user: { id: "user-1" }, entities: {} };
    await expect(createOrganization({ name: "" }, mockContext)).rejects.toThrow(
      "Name required",
    );
  });
});
```

Run tests: `cd app && wasp test client run` → All FAIL (expected)

Verify 5 quality criteria → All pass

Commit: `git commit -m "test: add Organization CRUD tests (RED)"`

**Step 2: GREEN Phase - Minimal Implementation**

```typescript
// app/src/organization/operations.ts
import { HttpError } from "wasp/server";
import type {
  GetOrganizations,
  CreateOrganization,
} from "wasp/server/operations";

export const getOrganizations: GetOrganizations = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Not authenticated");
  }

  return context.entities.Organization.findMany();
};

export const createOrganization: CreateOrganization = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Not authenticated");
  }

  if (!args.name || args.name.trim() === "") {
    throw new HttpError(400, "Name required");
  }

  return context.entities.Organization.create({
    data: {
      name: args.name,
      userId: context.user.id,
    },
  });
};
```

Run tests: `cd app && wasp test client run` → All PASS

**Step 3: REFACTOR Phase - Simplify**

```typescript
// app/src/organization/operations.ts (refactored)
import { HttpError } from "wasp/server";
import type {
  GetOrganizations,
  CreateOrganization,
} from "wasp/server/operations";

// Helper function - extracted duplication
function requireAuth(context) {
  if (!context.user) {
    throw new HttpError(401, "Not authenticated");
  }
  return context.user;
}

// Helper function - extracted validation
function validateName(name: string) {
  if (!name || name.trim() === "") {
    throw new HttpError(400, "Name required");
  }
  return name.trim();
}

export const getOrganizations: GetOrganizations = async (args, context) => {
  requireAuth(context);
  return context.entities.Organization.findMany();
};

export const createOrganization: CreateOrganization = async (args, context) => {
  const user = requireAuth(context);
  const name = validateName(args.name);

  return context.entities.Organization.create({
    data: { name, userId: user.id },
  });
};
```

Run tests: `cd app && wasp test client run` → All PASS (still green after refactor)

Run coverage: `wasp test client run --coverage` → 85% statements, 78% branches

Commit: `git commit -m "feat(organization): implement CRUD operations..."`

---

## Common Test Mistakes

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

## Troubleshooting Test Failures

### Tests Fail During RED Phase

**Expected behavior:** Tests SHOULD fail during RED phase.

**Verify:**

- Tests fail for the RIGHT reasons (not syntax errors)
- Error messages are meaningful
- Tests describe expected behavior clearly

### Tests Fail During GREEN Phase

**Diagnose:**

1. **Check error message** - What specifically is failing?
2. **Verify test is correct** - Does test accurately describe expected behavior?
3. **Check implementation** - Does code match test expectations?
4. **Don't modify test** - Fix implementation only

**Common issues:**

- Missing auth check
- Incorrect validation logic
- Wrong entity method (findUnique vs findMany)
- Missing error handling

### Tests Pass but Coverage is Low

**Diagnose:**

1. Run: `wasp test client run --coverage`
2. Open: `app/coverage/index.html`
3. Identify uncovered lines (red/yellow)

**Fix:**

- Add tests for uncovered branches (if/else)
- Test error paths (try/catch)
- Test edge cases

### Tests Become Slow

**Diagnose:**

1. Check for real API calls (should be mocked)
2. Check for database calls (should be mocked)
3. Check for long timeouts

**Fix:**

- Mock all external dependencies
- Use `vi.fn()` for Prisma entities
- Use `mockServer()` for Wasp operations

---

## Testing Commands Reference

**⚠️ CRITICAL: Always run from app/ directory** (where main.wasp is located)

```bash
# Run tests in watch mode (auto-rerun on changes)
cd app && wasp test client

# Run tests once (CI mode)
cd app && wasp test client run

# Run with visual UI
cd app && wasp test client --ui

# Run with coverage report
cd app && wasp test client run --coverage

# Run specific test directory
cd app && wasp test client run src/components/layout

# Run specific test file
cd app && wasp test client run src/server/a3/operations.test.ts

# Run tests matching pattern (filter by name)
cd app && wasp test client run --grep "Organization"
```

### Common Test Command Errors

**Error: "Couldn't find wasp project root"**

```bash
# ❌ WRONG - Running from project root
wasp test client run

# ✅ CORRECT - cd to app/ first (where main.wasp is)
cd app && wasp test client run
```

**Error: "Unknown option `--testPathPattern`"**

```bash
# ❌ WRONG - Jest syntax (not supported)
cd app && wasp test client run --testPathPattern=layout

# ✅ CORRECT - Vitest syntax (just the path)
cd app && wasp test client run src/components/layout
```

**Error: "Cannot find module '@vitejs/plugin-react'"**

```bash
# ❌ WRONG - Direct vitest call (bypasses Wasp setup)
npx vitest run src/components/layout

# ✅ CORRECT - Use wasp test (includes all deps)
cd app && wasp test client run src/components/layout
```

### Vitest vs Jest Syntax

Wasp uses **Vitest**, not Jest. Common syntax differences:

| Feature        | Jest (❌ WRONG)            | Vitest (✅ CORRECT)  |
| -------------- | -------------------------- | -------------------- |
| Specific path  | `--testPathPattern=path`   | `src/path` (no flag) |
| Filter by name | `--testNamePattern="name"` | `--grep "name"`      |
| Watch mode     | `--watch`                  | Default (no flag)    |

---

## Integration with CI/CD

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

## Summary

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

**Questions or issues?** See `docs/TDD-WORKFLOW.md` for comprehensive guide or ask in team chat.
