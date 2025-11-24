# QA Report: Filter Type Inconsistency Between Tests and Backend

**Date:** 2025-10-24
**Sprint:** Sprint 2 - A3 Overview Implementation
**Phase:** GREEN (Test Implementation)
**Severity:** Medium - Design Inconsistency
**Status:** Pending Review

---

## Summary

During GREEN phase implementation of A3 Overview filters (StatusFilter, DepartmentFilter), a type inconsistency was discovered between the test specifications (RED phase) and Wasp backend operation signatures.

**Tests expect:** Empty string `""` for "no filter" state
**Backend expects:** `undefined` for optional filter parameters

---

## Technical Analysis

### Backend Signature (Wasp Standard)

From `app/src/server/a3/operations.ts:68-75`:

```typescript
export const getA3Documents: GetA3Documents<
  {
    departmentId?: string; // Optional = undefined when not filtering
    status?: A3Status; // Optional = undefined when not filtering
    search?: string;
    includeArchived?: boolean;
  },
  A3Document[]
>;
```

**Wasp pattern:** Optional parameters (`?:`) use `undefined` to indicate "not provided"

### Test Specification (RED Phase)

From `app/src/components/a3/filters/StatusFilter.test.tsx:24,39,58`:

```typescript
// Line 24: Test with empty filter
render(<StatusFilter value="" onChange={vi.fn()} />);

// Line 58: Expect onChange called with empty string
expect(handleChange).toHaveBeenCalledWith("");
```

**Test pattern:** Empty string `""` represents "no filter selected"

---

## Root Cause

The RED phase test author chose **React form convention** (empty string for uncontrolled state) without considering **Wasp backend typing** (undefined for optional parameters).

This creates a **type mismatch**:

```
UI Layer (Tests)     Filter Component     Backend API
─────────────────    ────────────────     ───────────
value=""         →   Must convert    →   status: undefined
value={DRAFT}    →   Pass through    →   status: A3Status.DRAFT
```

---

## Impact Assessment

### Current Impact (GREEN Phase)

1. **TypeScript Compilation Errors**

   - `Type '""' is not assignable to type 'A3Status | undefined'`
   - Cannot implement without type assertions or union types

2. **Implementation Complexity**

   - Requires conversion layer: `"" → undefined`
   - Props accept `A3Status | ""` externally, convert to `A3Status | undefined` internally
   - Increases cognitive load for developers

3. **Inconsistent with Codebase**
   - Other Wasp operations use `undefined` for optionals
   - Breaking convention creates maintenance burden

### Future Impact (If Not Addressed)

1. **Developer Confusion**

   - Why do filters use `""` when all other code uses `undefined`?
   - Risk of bugs when copying patterns

2. **Refactoring Difficulty**
   - Any backend changes require understanding conversion layer
   - Cannot use filters directly with backend types

---

## Options Analysis

### Option A: Implement Conversion Layer (Respect RED Phase)

**Approach:**

- Filter components are **dumb**: pass through `""` exactly as selected
- Filter `onChange` signature: `(value: A3Status | "") => void`
- **Parent component (A3OverviewPage)** converts `"" → undefined` before backend query

**Pros:**

- ✅ Respects TDD principle: tests are immutable in GREEN phase
- ✅ Tests pass without modification
- ✅ Filter components simple and testable
- ✅ Single responsibility: Filter = UI, Parent = business logic

**Cons:**

- ❌ Inconsistent with Wasp patterns
- ❌ Parent must understand empty string convention
- ❌ TypeScript types: `A3Status | ""`

**Code Example:**

```typescript
// Filter component (dumb/presentational)
interface StatusFilterProps {
  value: A3Status | "";  // Accept empty string
  onChange: (value: A3Status | "") => void;  // Pass through empty string
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  // Simply pass through whatever user selects
  return <Select value={value} onValueChange={onChange} />
}

// Parent component (smart/container) - CONVERSION HAPPENS HERE
const [selectedStatus, setSelectedStatus] = useState<A3Status | ''>('');

const { data } = useQuery(getA3Documents, {
  status: selectedStatus || undefined,  // Convert "" → undefined for backend
});

<StatusFilter value={selectedStatus} onChange={setSelectedStatus} />
```

### Option B: Fix Tests in REFACTOR Phase

**Approach:**

- Now: Implement Option A to make tests GREEN
- REFACTOR phase: Update tests to use `undefined`
- Align entire codebase with Wasp patterns

**Pros:**

- ✅ Eventually consistent with Wasp
- ✅ Simpler long-term maintenance
- ✅ Follows TDD workflow (can modify tests in REFACTOR)

**Cons:**

- ❌ Temporary technical debt
- ❌ Requires second pass in REFACTOR

---

## Recommendation

**Implement Option A now, plan Option B for REFACTOR phase**

### Rationale

1. **TDD Discipline:** Tests were committed in RED phase and are considered "immutable" during GREEN phase. Modifying them now violates TDD workflow.

2. **Low Risk:** The conversion layer is simple (`"" → undefined`) and localized to filter components.

3. **Defer Decision:** In REFACTOR phase, we can:

   - Measure actual complexity burden
   - Assess if React form convention is valuable
   - Make informed decision with working code

4. **Professional Practice:** Document the issue, implement pragmatically, iterate later.

### Implementation Plan

**GREEN Phase (Now):**

1. Implement filters with conversion layer
2. Document conversion in code comments
3. Add TODO markers for REFACTOR phase
4. Tests pass, feature works

**REFACTOR Phase (Later):**

1. Evaluate if `""` convention adds value
2. If not: Update tests to use `undefined`
3. Remove conversion layer
4. Simplify TypeScript types

---

## Code Comments Template

Add to **filter components**:

```typescript
/**
 * NOTE: Type Inconsistency (Documented in reports/qa/2025-10-24-qa-filter-type-inconsistency.md)
 *
 * This component uses empty string ("") for "no selection" to match React form conventions
 * (as specified in RED phase tests). Parent component must convert "" → undefined for Wasp backend.
 *
 * TODO (REFACTOR): Consider aligning tests with Wasp optional parameter pattern (undefined)
 * to simplify types and remove conversion requirement.
 */
```

Add to **parent component (A3OverviewPage)**:

```typescript
/**
 * NOTE: Empty String Conversion (Documented in reports/qa/2025-10-24-qa-filter-type-inconsistency.md)
 *
 * Filter components use "" for "no selection" (React convention), but Wasp backend expects undefined
 * for optional parameters. We convert here: selectedStatus || undefined before passing to useQuery.
 *
 * TODO (REFACTOR): If tests are updated to use undefined, remove || undefined conversions.
 */
```

---

## Questions for Product Owner / Tech Lead

1. **Accept temporary inconsistency?** Can we proceed with conversion layer in GREEN phase, defer alignment to REFACTOR?

2. **React convention vs Wasp convention:** Should we standardize on one approach project-wide?

3. **Test modification policy:** Can tests be updated in REFACTOR phase if design improves?

---

## Decision

**[ ] APPROVED** - Implement Option A (conversion layer), refactor later
**[ ] REJECTED** - Alternative approach required (specify below)

**Approved by:** **\*\***\_\_\_\_**\*\***
**Date:** **\*\***\_\_\_\_**\*\***

**Notes:**

---

---

## Appendix: Mock Data Type Compatibility Issue

**Issue:** A3Card.test.tsx mock data missing `organizationId` and `archivedAt` fields (TypeScript compilation errors).

**Root Cause:**

- Sprint 2 Backend added multi-tenant schema (`organizationId`) and archive feature (`archivedAt`)
- Tests generated by wasp-test-automator agent with outdated schema knowledge
- Result: Mock data incomplete for current A3Document type

**Analysis:**

| Question                    | Answer | Rationale                                                                                                                                     |
| --------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Raakt bedoelde werking?** | ❌ NO  | Tests verify title, description, status, progress, metadata. NO assertions on organizationId/archivedAt.                                      |
| **Mock theater?**           | ❌ NO  | These are required TypeScript fields, not test behavior. Mock theater = testing side effects instead of behavior. This is type compatibility. |
| **Onbedoeld foutje?**       | ✅ YES | Timing issue - agent generated tests before schema was updated. Technical debt, not design choice.                                            |

**Classification:** **Type Compatibility Fix** (NOT test modification)

Similar to:

```typescript
// Original type
type Person = { name: string; age: number };
const mock = { name: "John", age: 30 }; // ✅ Valid

// Type updated (new required field)
type Person = { name: string; age: number; email: string };
const mock = { name: "John", age: 30 }; // ❌ TypeScript error

// Fix: Add required field (not used in test, just for type compatibility)
const mock = { name: "John", age: 30, email: "test@test.com" }; // ✅ Valid
// Test still only asserts on name/age - email is ignored
```

**Solution:** Add missing fields to mock data with placeholder values:

```typescript
organizationId: "org-test-123",
archivedAt: null
```

**Impact:** ZERO - tests continue verifying same behavior, now with complete type signatures.

**Approved:** This is technical cleanup, not test behavior modification. Proceeds under GREEN phase rules.

---

## Appendix B: Radix UI SelectItem Empty String Constraint

**Issue:** Radix UI (ShadCN base library) does not allow `<Select.Item value="" />`.

**Error Message:**

```
Error: A <Select.Item /> must have a value prop that is not an empty string.
This is because the Select value can be set to an empty string to clear the selection and show the placeholder.
```

**Root Cause:**

- Tests expect `value=""` for "all" option in filters
- Radix UI library constraint: SelectItem **cannot** have empty string value
- This is a **library limitation**, not a test design flaw

**Impact:**

- 25 tests failing (all StatusFilter, DepartmentFilter, and related A3OverviewPage tests)
- Cannot implement filters as specified without workaround

**Solution: Sentinel Value Conversion**

Use `"__all__"` as SelectItem value, convert to `""` in onChange handler:

```typescript
// In StatusFilter/DepartmentFilter components
<SelectItem value="__all__">{t('filters.allStatuses')}</SelectItem>
<SelectItem value={A3Status.DRAFT}>{t('filters.statusDraft')}</SelectItem>

const handleValueChange = (newValue: string) => {
  // Convert sentinel value to empty string for parent component
  onChange(newValue === "__all__" ? "" : newValue);
};
```

**Justification:**

1. **Respects test expectations** - Tests still receive `onChange("")` as specified
2. **Library compatibility** - Satisfies Radix UI constraint
3. **Minimal complexity** - Single conversion point, localized to filter components
4. **No leakage** - Sentinel value never escapes filter component

**Implementation Location:**

- `app/src/components/a3/filters/StatusFilter.tsx`
- `app/src/components/a3/filters/DepartmentFilter.tsx`

**Alternative Considered:**

- Using `undefined` instead of `""` → Would require test modification (violates TDD RED phase immutability)

**Classification:** **Technical constraint workaround** (NOT design choice)

---

## Appendix C: Test vs Implementation Component Mismatch (BLOCKING)

**Issue:** Tests expect native `<select>` element, implementation uses Radix UI Select.

**Root Cause:**

- Tests (RED phase) use `user.selectOptions(select, value)` - only works with native HTML `<select>`
- Implementation uses Radix UI `<Select>` - custom React component with button + dropdown
- **These are incompatible** - Testing Library `selectOptions()` cannot interact with Radix Select

**Evidence:**

From `StatusFilter.test.tsx:56`:

```typescript
await user.selectOptions(select, ""); // Expects native <select>
```

Error message:

```
Value "" not found in options
```

**Why This Happened:**
Agent-generated tests assumed native `<select>`, but ShadCN/Radix UI was chosen for consistent design system.

**Impact:**

- **8/8 filter tests failing** (all use `selectOptions()`)
- **BLOCKING GREEN phase** - cannot proceed without resolution

**Options:**

### Option A: Use Native `<select>` Elements

**Approach:** Replace Radix Select with styled native `<select>`

**Pros:**

- ✅ Tests pass immediately (no modification)
- ✅ Simpler implementation (~15 lines vs ~40 lines)
- ✅ Accessible by default
- ✅ TDD compliant (respects test immutability)

**Cons:**

- ❌ Less visual consistency with ShadCN components
- ❌ Limited styling options compared to Radix

**Implementation:**

```typescript
// Native select (15 lines, tests pass)
<select
  value={value}
  onChange={(e) => onChange(e.target.value as A3Status | "")}
  className="w-[200px] rounded-md border px-3 py-2"
  data-testid="status-filter-select"
>
  <option value="">{t('filters.allStatuses')}</option>
  <option value={A3Status.DRAFT}>{t('filters.statusDraft')}</option>
</select>
```

### Option B: Update Tests for Radix Select

**Approach:** Modify tests to click dropdown trigger, then click option

**Pros:**

- ✅ Consistent with ShadCN design system
- ✅ More customizable UI

**Cons:**

- ❌ **Violates TDD RED phase immutability** - tests were committed separately
- ❌ Requires rewriting all 8 filter tests
- ❌ More complex test setup (async clicks, waitFor)

**Implementation:**

```typescript
// Would require test modification (violates TDD):
await user.click(screen.getByTestId("status-filter-select"));
await waitFor(() => {
  expect(screen.getByText(t("filters.allStatuses"))).toBeInTheDocument();
});
await user.click(screen.getByText(t("filters.allStatuses")));
```

---

## **BLOCKING DECISION REQUIRED**

**Recommended:** **Option A** (Native `<select>`)

**Rationale:**

1. **TDD Compliance:** Respects test immutability in GREEN phase
2. **Pragmatism:** Simpler code, immediate test success
3. **Accessibility:** Native selects are fully accessible
4. **Performance:** Lighter bundle (no Radix Select dependency for filters)
5. **Defer Complexity:** Can revisit in REFACTOR if UI polish needed

**Risk Assessment:**

- **Low Risk:** Native selects are battle-tested, accessible, and work across all browsers
- **Visual Impact:** Minimal - can style with Tailwind to match design system
- **Future:** If visual consistency becomes priority in REFACTOR, we can replace with Radix AND update tests

**Approval Required:** [ ] Proceed with Option A (native selects) | [ ] Proceed with Option B (modify tests)

---

## References

- **Tests:** `app/src/components/a3/filters/StatusFilter.test.tsx:24,39,58`
- **Backend:** `app/src/server/a3/operations.ts:68-75`
- **TDD Workflow:** `docs/TDD-WORKFLOW.md`
- **Wasp Docs:** https://wasp-lang.dev/docs/data-model/operations/queries
- **Radix UI Docs:** https://www.radix-ui.com/primitives/docs/components/select
- **Schema Changes:** Commits 81be84c, db16a53, 5bdac6d (Sprint 2 Backend)
