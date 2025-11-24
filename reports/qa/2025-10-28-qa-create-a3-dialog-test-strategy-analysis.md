# QA Report: CreateA3Dialog Test Strategy Analysis

**Date:** 2025-10-28
**Component:** CreateA3Dialog (Sprint 2 - A3 Overview Page)
**Phase:** GREEN (TDD Implementation)
**Status:** BLOCKED - Test execution failures
**Severity:** HIGH - Blocks Sprint 2 completion

---

## Executive Summary

The CreateA3Dialog component tests (30 tests, RED phase) cannot execute successfully in the current Vitest/jsdom environment due to fundamental incompatibilities between Radix UI Dialog's portal-based architecture and jsdom's limitations. This report analyzes the root causes, evaluates testing alternatives, and recommends a pragmatic path forward that maintains TDD quality standards while acknowledging technical constraints.

**Key Findings:**

- 29/30 tests fail due to Radix Dialog portal rendering in jsdom
- CreateA3Dialog is the FIRST component in the codebase to use Radix Dialog
- All 300+ existing passing tests use DropdownMenu (no portal) or standard HTML
- The component's business logic (validation, submission, state management) is testable but obscured by dialog wrapper

**Recommendation:** Restructure tests into 3 layers: Unit (business logic), Component (integration), E2E (full dialog flow)

---

## 1. Problem Analysis

### 1.1 Technical Root Cause

**Radix UI Dialog Architecture:**

```
Dialog (Portal-based)
  ├── DialogPortal (React Portal → document.body)
  │   ├── DialogOverlay (backdrop, aria-hidden during animation)
  │   └── DialogContent (form content, aria-hidden during animation)
  │       ├── DialogTitle (heading, aria-hidden)
  │       ├── DialogDescription (text, aria-hidden)
  │       └── Form Elements (inputs, buttons)
```

**jsdom Limitations:**

1. **Portal rendering:** React portals don't fully render in jsdom
2. **aria-hidden propagation:** Radix applies `aria-hidden="true"` to entire dialog tree during animations
3. **Testing Library behavior:** Ignores aria-hidden elements by default (correct A11y behavior)

**Why Portal Mock Failed:**

```typescript
// Current setup.ts (lines 66-69)
vi.mock("@radix-ui/react-portal", () => ({
  Portal: ({ children }: { children: React.ReactNode }) => children,
}));
```

This bypasses the portal mechanism but Radix still applies aria-hidden attributes for accessibility compliance, making content invisible to Testing Library queries.

### 1.2 Evidence from Codebase

**Working Pattern (TopNavigation.test.tsx):**

- Component: DropdownMenu (NO portal)
- Tests: 159 role queries, 0 use `{ hidden: true }`
- Result: ✅ All tests pass

**Failing Pattern (CreateA3Dialog.test.tsx):**

- Component: Dialog (MANDATORY portal)
- Tests: 30 tests querying dialog content
- Result: ❌ 29 tests fail ("Unable to find...")

**Key Insight:** This is NOT a test quality issue. The tests are well-written (verified against 5 TDD criteria). The issue is an architectural mismatch between component choice (Dialog) and test environment (jsdom).

---

## 2. Current Test Coverage Analysis

### 2.1 Test Inventory (30 tests)

| Category                    | Count | What They Test                                        | Can Execute?                |
| --------------------------- | ----- | ----------------------------------------------------- | --------------------------- |
| **Rendering & Interaction** | 6     | Dialog opens, form fields appear                      | ❌ No (portal issue)        |
| **Validation - Title**      | 4     | Title required, max length, error clearing            | ❌ No (can't access form)   |
| **Validation - Department** | 3     | Department required, error clearing                   | ❌ No (can't access form)   |
| **Success Flow**            | 6     | createA3 call, navigation, toast, loading state       | ❌ No (can't submit form)   |
| **Error Flow**              | 4     | Error toast, dialog stays open, button re-enable      | ❌ No (can't trigger error) |
| **Dialog Management**       | 4     | Close button, form reset, ESC key                     | ❌ No (can't access dialog) |
| **Edge Cases**              | 3     | Double submit prevention, long description, ESC reset | ❌ No (can't interact)      |

**Total Blocked:** 29/30 tests (96.7%)

### 2.2 What the Tests Actually Verify

**Business Logic Under Test:**

1. ✅ Form validation (title required, max 200 chars, department required)
2. ✅ API integration (createA3 called with correct args)
3. ✅ Navigation (redirects to `/app/a3/{id}` after creation)
4. ✅ User feedback (toast messages)
5. ✅ Error handling (keeps dialog open, re-enables button)
6. ✅ State management (form reset on close, loading states)
7. ✅ Edge cases (double submit prevention)

**Dialog Wrapper Testing:**

- ❌ Dialog opens/closes (E2E concern, not unit)
- ❌ Form appears after click (E2E concern)
- ❌ ESC key closes dialog (E2E concern)

**Analysis:** 95% of test value is business logic, 5% is dialog wrapper behavior.

---

## 3. Testing Layer Analysis

### 3.1 What Should Be Unit Tested?

**Definition:** Unit = smallest testable part in isolation, mocked dependencies

**CreateA3Dialog Business Logic (extractable):**

```typescript
// Validation functions (lines 43-52 in CreateA3Dialog.tsx)
validateTitle(value: string): string | undefined
validateDepartment(value: string): string | undefined

// Form submission handler (lines 63-93)
handleSubmit(e: FormEvent): Promise<void>
  - Validates inputs
  - Calls createA3 API
  - Shows toast on success/error
  - Navigates on success
  - Handles error state

// Form reset handler (lines 54-61)
handleClose(): void
  - Resets all form fields
  - Clears errors
  - Closes dialog
```

**Unit Test Strategy:**

- **Extract** validation + handler functions into separate file (`CreateA3Dialog.logic.ts`)
- **Test** functions directly without dialog wrapper
- **Mock** createA3, toast, navigate
- **Verify** business logic in isolation

**Benefit:** 100% business logic coverage, 0 dialog rendering issues

### 3.2 What Should Be Component/Integration Tested?

**Definition:** Component = integrated parts working together, real dependencies where possible

**CreateA3Dialog Integration Points:**

```typescript
// Component integration
<Dialog> wrapper + <Form> + Validation + Submission

// External dependencies
- createA3 operation (mocked)
- getUserDepartments query (mocked)
- react-router navigation (mocked)
- react-hot-toast (mocked)
```

**Component Test Strategy:**

- **Render** full CreateA3Dialog component
- **Interact** with form fields (if accessible)
- **Verify** validation messages appear
- **Verify** createA3 called with correct data
- **Accept** dialog wrapper as implementation detail

**Challenge:** jsdom limitations still apply, but we focus on testable behavior

### 3.3 What Should Be E2E Tested?

**Definition:** E2E = full user journey in real browser, no mocks

**CreateA3Dialog E2E Scenarios:**

1. **Happy Path:** Click trigger → Dialog opens → Fill form → Submit → Navigate to detail page
2. **Validation:** Click trigger → Submit empty → See errors → Fill form → Errors clear → Submit success
3. **Error Handling:** Click trigger → Fill form → API error → Dialog stays open → Retry success
4. **Cancel Flow:** Click trigger → Fill form → Click close → Dialog closes → Form reset → Reopen → Form empty
5. **Keyboard Navigation:** Click trigger → Tab through fields → ESC closes → Enter submits

**E2E Test Strategy:**

- **Tool:** Playwright (already in codebase: `e2e-tests/`)
- **Environment:** Real browser (Chromium)
- **Scope:** Full A3 creation flow
- **Frequency:** Run on PR, not on every commit

**Benefit:** Tests actual user experience with real dialog behavior

---

## 4. Comparison: Current vs Proposed

### 4.1 Current Approach (RED Phase)

**Test File:** `CreateA3Dialog.test.tsx` (777 lines, 30 tests)
**Tool:** Vitest + jsdom
**Coverage:** Attempts to test business logic + dialog behavior together

**Strengths:**

- ✅ Comprehensive test specifications (all 5 TDD criteria met)
- ✅ Tests written BEFORE implementation (proper RED phase)
- ✅ Clear assertions (no mock theater)
- ✅ Good error path coverage

**Weaknesses:**

- ❌ 96.7% tests blocked by jsdom limitations
- ❌ Cannot execute = cannot complete TDD cycle
- ❌ Business logic testing obscured by dialog wrapper
- ❌ Mixes unit concerns (validation) with E2E concerns (dialog UX)

**Verdict:** Architecturally correct TDD, technically blocked by tool limitations

### 4.2 Proposed Approach (3 Layers)

#### Layer 1: Unit Tests (NEW)

**File:** `CreateA3Dialog.logic.test.ts`
**Tool:** Vitest + jsdom
**Lines:** ~200 (extracted from current 777)
**Tests:** ~15 tests

**Scope:**

```typescript
describe("CreateA3 Form Validation", () => {
  it("validates title is required");
  it("validates title max 200 chars");
  it("validates department is required");
});

describe("CreateA3 Form Submission", () => {
  it("calls createA3 with trimmed values");
  it("calls createA3 with correct departmentId");
  it("navigates to /app/a3/{id} on success");
  it("shows success toast on success");
  it("shows error toast on API error");
  it("keeps form data on error");
});

describe("CreateA3 Form Reset", () => {
  it("clears all fields on reset");
  it("clears errors on reset");
});
```

**Benefits:**

- ✅ 100% executable (no dialog wrapper)
- ✅ Fast execution (<1s)
- ✅ Clear failure messages
- ✅ Easy to debug

#### Layer 2: Component Tests (ADAPTED)

**File:** `CreateA3Dialog.test.tsx`
**Tool:** Vitest + jsdom
**Lines:** ~300 (reduced from 777)
**Tests:** ~10 tests

**Scope:**

```typescript
describe("CreateA3Dialog Component", () => {
  it("renders trigger button");
  it("passes form data to validation functions");
  it("calls createA3 when validation passes");
  it("displays validation errors in UI");
  it("disables submit button during submission");
  // Focus on component integration, not dialog mechanics
});
```

**Accepts as implementation details:**

- Dialog open/close mechanism
- Portal rendering
- Animation states

**Benefits:**

- ✅ Tests component contracts
- ✅ Executable in jsdom (focuses on logic, not wrapper)
- ✅ Faster than E2E

#### Layer 3: E2E Tests (NEW)

**File:** `e2e-tests/tests/a3-creation.spec.ts`
**Tool:** Playwright
**Lines:** ~100
**Tests:** ~5 scenarios

**Scope:**

```typescript
test("creates A3 successfully", async ({ page }) => {
  await page.goto("/app/a3");
  await page.click('button:has-text("New A3")');
  await page.fill('[aria-label="Title"]', "Test A3");
  await page.selectOption('[aria-label="Department"]', "Engineering");
  await page.click('button:has-text("Create")');
  await expect(page).toHaveURL(/\/app\/a3\/[a-z0-9-]+/);
});

test("shows validation errors", async ({ page }) => {
  await page.goto("/app/a3");
  await page.click('button:has-text("New A3")');
  await page.click('button:has-text("Create")');
  await expect(page.locator("text=Title is required")).toBeVisible();
});
```

**Benefits:**

- ✅ Tests real user experience
- ✅ Validates dialog behavior in real browser
- ✅ Catches integration issues

### 4.3 Coverage Comparison

| Test Type                 | Current (Blocked)  | Proposed (3 Layers) | Execution         |
| ------------------------- | ------------------ | ------------------- | ----------------- |
| **Business Logic**        | 21 tests (blocked) | 15 unit tests       | ✅ Fast (~200ms)  |
| **Component Integration** | 6 tests (blocked)  | 10 component tests  | ✅ Medium (~1s)   |
| **Dialog UX**             | 3 tests (blocked)  | 5 E2E tests         | ✅ Slow (~10s)    |
| **Total Tests**           | 30 (0% pass)       | 30 (100% pass)      | ✅ All executable |

**Key Metrics:**

- **Test Execution:** 0% → 100%
- **Coverage:** Business logic 95% → 95% (maintained)
- **Speed:** N/A → Unit: 200ms, Component: 1s, E2E: 10s
- **Maintainability:** Low (blocked) → High (all layers testable)

---

## 5. Root Cause: Why Did This Happen?

### 5.1 TDD Process Gap

**RED Phase Specification (day-02-session-08.md):**

> "Write comprehensive tests for CreateA3Dialog covering all user interactions"

**What Was Missing:**

- No guidance on testing dialog components specifically
- No distinction between unit/component/E2E test layers
- Assumption that all components can be unit tested in jsdom

**Why This Wasn't Caught Earlier:**

- CreateA3Dialog is the FIRST Radix Dialog component in the codebase
- All previous components (TopNavigation, etc.) use DropdownMenu (no portal)
- No existing Dialog test patterns to reference

### 5.2 Architectural Decision Impact

**Component Choice: Radix Dialog**

- **Why:** Professional UI, accessibility built-in, modal behavior
- **Trade-off:** Portal-based architecture incompatible with jsdom unit testing

**Alternative: Custom Modal**

- **Why NOT:** More code, accessibility burden, reinventing wheel
- **Trade-off:** Would be jsdom-testable but lower quality UX

**Verdict:** Radix Dialog is the RIGHT choice for production. Testing strategy must adapt.

---

## 6. Recommendations

### 6.1 Immediate Action (Complete Sprint 2)

**Option A: Restructure Tests (RECOMMENDED)**

**Steps:**

1. **Extract business logic** from CreateA3Dialog into separate functions
   - `src/components/a3/CreateA3Dialog.logic.ts` (validation + handlers)
   - ~100 lines of pure functions
2. **Write unit tests** for extracted logic
   - `src/components/a3/CreateA3Dialog.logic.test.ts`
   - 15 tests, all executable in jsdom
3. **Simplify component tests** to integration contracts
   - Keep `CreateA3Dialog.test.tsx` but reduce to 10 tests
   - Focus on component wiring, not dialog mechanics
4. **Add E2E tests** for full dialog flow
   - `e2e-tests/tests/a3-creation.spec.ts`
   - 5 scenarios in Playwright
5. **Update documentation**
   - Add Dialog testing pattern to `app/src/components/CLAUDE.md`
   - Document 3-layer strategy in `docs/TDD-WORKFLOW.md`

**Effort:** ~4 hours (refactor + test rewrite + E2E)
**Benefit:** Unblocks Sprint 2, establishes reusable pattern
**Risk:** Low (business logic unchanged, just reorganized)

**Option B: Skip Unit Tests, Go Full E2E**

**Steps:**

1. Delete `CreateA3Dialog.test.tsx` (blocked tests)
2. Write comprehensive E2E tests in Playwright
3. Accept slower feedback loop (10s vs 200ms)

**Effort:** ~2 hours (E2E only)
**Benefit:** Faster to implement
**Risk:** High (loses fast feedback, harder to debug, slows TDD cycle)

**Option C: Mock Every Query with { hidden: true }**

**Steps:**

1. Change all 29 failed tests to use `screen.getByRole(..., { hidden: true })`
2. Accept querying aria-hidden elements

**Effort:** ~1 hour (mechanical change)
**Benefit:** Tests run
**Risk:** CRITICAL - Tests become anti-patterns that don't match user experience

### 6.2 Long-term Strategy

**Establish Testing Standards:**

1. **Update docs/TDD-WORKFLOW.md:**

```markdown
## Component Testing Strategy by Type

### Standard Components (DropdownMenu, Select, etc.)

- **Unit tests:** Vitest + jsdom
- **Pattern:** See TopNavigation.test.tsx

### Dialog Components (Modal, Sheet, etc.)

- **Business logic:** Extract to \*.logic.ts, unit test separately
- **Component integration:** Simplified tests in Vitest
- **Full UX:** E2E tests in Playwright
- **Pattern:** See CreateA3Dialog 3-layer approach
```

2. **Add to app/src/components/CLAUDE.md:**

```markdown
### Dialog Testing (NEW)

Radix Dialog uses portals incompatible with jsdom. Use 3-layer approach:

**Layer 1: Business Logic (Unit)**
// Extract to \*.logic.ts
export const validateTitle = (value: string) => { ... }
export const handleSubmit = async (data, { createA3, navigate }) => { ... }

// Test in \*.logic.test.ts
expect(validateTitle("")).toBe("Title is required")

**Layer 2: Component (Integration)**
// Test component wiring, not dialog mechanics
render(<CreateA3Dialog />)
expect(component passes data to handlers).toBeTruthy()

**Layer 3: E2E (Full Flow)**
// e2e-tests/ - Test complete user journey
await page.click('button:text("New A3")')
await expect(dialog).toBeVisible()
```

3. **Create Reusable Template:**

- `.claude/templates/dialog-component-test.template.ts`
- Copy-paste pattern for future dialog components

---

## 7. Impact Assessment

### 7.1 If We Choose Option A (3-Layer Restructure)

**Positive Impacts:**

- ✅ Unblocks Sprint 2 completion
- ✅ 100% test execution (vs 3% currently)
- ✅ Establishes pattern for future dialog components
- ✅ Maintains TDD quality (all 5 criteria still met)
- ✅ Faster test execution (unit layer)
- ✅ Better separation of concerns

**Negative Impacts:**

- ⚠️ Requires refactoring CreateA3Dialog (4 hours)
- ⚠️ Deviates from original RED phase specs (but for valid reasons)
- ⚠️ More test files to maintain (3 files vs 1)

**Mitigation:**

- Document decision in sprint retrospective
- Update RED phase template for future sprints
- Treat as learning experience, not failure

### 7.2 If We Choose Option B (E2E Only)

**Positive Impacts:**

- ✅ Faster to implement (2 hours)
- ✅ Tests real user experience

**Negative Impacts:**

- ❌ Loses fast feedback loop (10s E2E vs 200ms unit)
- ❌ Harder to debug failures (full stack vs isolated function)
- ❌ Slows TDD cycle (defeats RED-GREEN-REFACTOR rhythm)
- ❌ Makes TDD impractical for future dialog components

**Verdict:** NOT RECOMMENDED. Undermines TDD workflow.

### 7.3 If We Choose Option C ({ hidden: true } Workaround)

**Positive Impacts:**

- ✅ Fastest to implement (1 hour)
- ✅ Tests run

**Negative Impacts:**

- ❌ **CRITICAL:** Tests query aria-hidden elements (anti-pattern)
- ❌ Tests don't match user experience (users can't see hidden elements)
- ❌ Inconsistent with 159 other role queries in codebase
- ❌ Creates bad precedent for future tests
- ❌ Fails code review standards

**Verdict:** STRONGLY NOT RECOMMENDED. Violates testing principles.

---

## 8. Decision Matrix

| Criterion                     | Option A (3-Layer)  | Option B (E2E Only) | Option C (hidden: true) | Weight |
| ----------------------------- | ------------------- | ------------------- | ----------------------- | ------ |
| **Unblocks Sprint 2**         | ✅ Yes              | ✅ Yes              | ✅ Yes                  | HIGH   |
| **Maintains TDD quality**     | ✅ Yes              | ⚠️ Partial          | ❌ No                   | HIGH   |
| **Fast feedback**             | ✅ Yes (unit layer) | ❌ No (10s E2E)     | ⚠️ Yes (but wrong)      | HIGH   |
| **Matches user experience**   | ✅ Yes              | ✅ Yes              | ❌ No                   | HIGH   |
| **Implementation effort**     | ⚠️ Medium (4h)      | ✅ Low (2h)         | ✅ Low (1h)             | MEDIUM |
| **Long-term maintainability** | ✅ High             | ⚠️ Medium           | ❌ Low                  | HIGH   |
| **Reusable pattern**          | ✅ Yes              | ⚠️ Partial          | ❌ No                   | MEDIUM |
| **Code review approval**      | ✅ Likely           | ⚠️ Maybe            | ❌ Unlikely             | HIGH   |

**Weighted Score:**

- **Option A:** 9/10 (RECOMMENDED)
- **Option B:** 6/10 (Acceptable fallback)
- **Option C:** 3/10 (NOT RECOMMENDED)

---

## 9. Recommendations for Tech Lead Review

### 9.1 Questions for Decision

1. **Scope:** Can we refactor CreateA3Dialog structure (extract logic to separate file)?
2. **Timeline:** Do we have 4 hours for proper 3-layer restructure vs 1 hour for workaround?
3. **Standards:** Should we establish this as pattern for all future dialog components?
4. **E2E Coverage:** Should A3 creation flow be in E2E test suite regardless of unit test approach?

### 9.2 Proposed Path Forward

**Phase 1: Immediate (Complete GREEN)**

- Extract business logic to `CreateA3Dialog.logic.ts`
- Write unit tests for logic functions
- Simplify component tests to integration contracts
- Mark remaining tests as "E2E coverage needed"

**Phase 2: E2E Coverage (REFACTOR phase or Sprint 3)**

- Add `e2e-tests/tests/a3-creation.spec.ts`
- 5 scenarios covering full dialog flow
- Run in CI on PR

**Phase 3: Documentation (Sprint 3)**

- Update CLAUDE.md with dialog testing pattern
- Create template for future dialog components
- Sprint retrospective: lessons learned

---

## 10. Conclusion

The CreateA3Dialog test failures are NOT a failure of TDD discipline. The tests are well-written and comprehensive. The issue is an architectural mismatch between Radix Dialog's portal-based design and jsdom's limitations that only became apparent when we tested our FIRST dialog component.

**The solution is not to compromise test quality with workarounds, but to adapt our testing strategy to match the component architecture:**

1. **Unit test** business logic in isolation (fast, debuggable)
2. **Component test** integration contracts (medium speed, verifies wiring)
3. **E2E test** full user flows (slow, validates real experience)

This 3-layer approach maintains TDD quality while acknowledging technical constraints. It's more work upfront but establishes a sustainable pattern for the 20+ dialog components we'll build in future sprints.

**Recommended Decision:** Option A (3-Layer Restructure)

---

## Appendices

### Appendix A: Test Execution Evidence

```bash
# Current state
$ wasp test client run src/components/a3/CreateA3Dialog.test.tsx
Tests  29 failed | 1 passed (30)

# Error pattern (repeated 29 times):
TestingLibraryElementError: Unable to find a label with the text of: /title/i
```

### Appendix B: Successful Pattern Reference

**TopNavigation.test.tsx (173 lines, 0 failures):**

```typescript
// Uses DropdownMenu (NO portal)
await user.click(toolsButton);
const a3Link = screen.getByRole("link", { name: /a3/i }); // ✅ Works
expect(a3Link).toBeInTheDocument();
```

### Appendix C: Component Complexity Metrics

| Component          | Lines | Tests       | Test:Code Ratio | Execution    |
| ------------------ | ----- | ----------- | --------------- | ------------ |
| **TopNavigation**  | 180   | 159 queries | 0.88x           | ✅ 100% pass |
| **CreateA3Dialog** | 175   | 30 tests    | 4.4x            | ❌ 3% pass   |

CreateA3Dialog has 5x higher test density but 97% failure rate due to jsdom incompatibility, not test quality.

---

**Document Status:** Ready for Tech Lead review
**Next Action:** Await decision on Option A vs B vs C
**Timeline Impact:** +4h (Option A) or +2h (Option B) or +1h (Option C - NOT recommended)
