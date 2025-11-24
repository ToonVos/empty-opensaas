# Sprint 2 Visual Polish - Test Defects Analysis

**Date:** 2025-10-27
**Phase:** GREEN Phase Completion
**Status:** 332/337 tests passing (98.5%)
**Remaining Failures:** 5 tests

---

## Executive Summary

After implementing Sprint 2 Visual Polish features, 5 test failures remain. **Deep analysis reveals ALL 5 are test infrastructure issues, NOT code defects.**

**Recommendation:** Fix tests while preserving test value (no test cheating/mock theater).

---

## Defect 1 & 2: Conflicting Status Badge Color Specs

### Test Failures

```
FAIL: renders status badge with DRAFT color (gray)
  Expected: bg-gray-100, text-gray-800
  Actual:   bg-blue-100, text-blue-800

FAIL: renders status badge with IN_PROGRESS color (blue)
  Expected: bg-blue-100, text-blue-800
  Actual:   bg-yellow-100, text-yellow-800
```

### Root Cause

**SPEC EVOLUTION - Forgotten Test Cleanup**

File: `A3Card.test.tsx`

**OLD tests (lines 120-142):**

- DRAFT = gray (bg-gray-100)
- IN_PROGRESS = blue (bg-blue-100)
- COMPLETED = green (bg-green-100)

**NEW "Visual Polish" tests (lines 222-236):**

- DRAFT = blue (bg-blue-100)
- IN_PROGRESS = yellow (bg-yellow-100)
- COMPLETED = green (bg-green-100)

### Analysis

This is **NOT a code bug**. The visual polish spec intentionally changed badge colors for better UX:

- DRAFT: gray → blue (better visibility)
- IN_PROGRESS: blue → yellow (distinguishable from DRAFT)

The old tests (lines 120-134) should have been **deleted** when visual polish tests were added, but were accidentally left in place.

### Test Value Assessment

- **Old tests (120-134):** ❌ **NO VALUE** - Test obsolete spec
- **Visual polish tests (222-236):** ✅ **HIGH VALUE** - Test current spec

### Recommendation

**DELETE old status badge tests (lines 120-134)** to eliminate redundancy and spec conflict.

**NOT test cheating** because:

- Visual polish tests (222-236) already verify the SAME behavior with correct spec
- Deleting duplicate/obsolete tests is standard refactoring
- No loss of test coverage

---

## Defect 3: i18n Test - Fundamentally Flawed Assertion

### Test Failure

```
FAIL: uses i18n for all visible text strings
  Expected: badge.textContent matches /a3Status\.|IN_PROGRESS/
  Actual:   "In behandeling"
```

### Root Cause

**TEST DESIGN ERROR - Invalid i18n Verification**

File: `A3Card.test.tsx`, lines 208-219

```javascript
it("uses i18n for all visible text strings", async () => {
  const badge = screen.getByTestId("status-badge");
  expect(badge.textContent).toMatch(/a3Status\.|IN_PROGRESS/); // ❌ WRONG
});
```

### Analysis

The test expects badge text to contain EITHER:

1. The i18n **key** (`a3Status.`)
2. The **enum value** (`IN_PROGRESS`)

But the **entire purpose of i18n** is to return **translated text**, not keys!

```javascript
// Mock translates correctly:
"a3Status.IN_PROGRESS": "In behandeling"  // ✅ This IS the correct behavior

// Test expects:
badge.textContent = "a3Status.IN_PROGRESS"  // ❌ Would mean i18n FAILED!
```

This test would **only pass if i18n was BROKEN**.

### Test Value Assessment

❌ **NEGATIVE VALUE** - Test verifies WRONG behavior

### Recommendation

**FIX test assertion** to verify i18n is USED, not that it fails:

```javascript
// Option 1: Verify translated Dutch text (language-specific)
expect(badge.textContent).toBe("In behandeling");

// Option 2: Verify ANY non-empty text (language-agnostic)
expect(badge.textContent).toBeTruthy();
expect(badge.textContent.length).toBeGreaterThan(0);

// Option 3: Delete test (component already uses t() correctly)
```

**NOT test cheating** because:

- Original test verified WRONG behavior
- Fixed test verifies i18n WORKS as designed
- Component code uses `t()` correctly (line 56: `const statusLabel = getStatusLabel(doc.status, t)`)

---

## Defect 4: StatisticsCard - Copy-Paste Test Bug

### Test Failure

```
FAIL: handles missing growth text gracefully
  Expected: "Projecten Overzicht" text found
  Actual:   Text not found (component rendered "Test Card")
```

### Root Cause

**COPY-PASTE ERROR in Test Code**

File: `StatisticsCard.test.tsx`, lines 119-129

```javascript
it("handles missing growth text gracefully", () => {
  const mockMetrics = [{ value: "24", label: "Totaal", color: "default" as const }];

  render(<StatisticsCard title="Test Card" icon={<BarChart3 />} metrics={mockMetrics} />);
  //                              ^^^^^^^^^^^  Renders "Test Card"

  // Card should render without error, growth text absent
  expect(screen.getByText("Projecten Overzicht")).toBeInTheDocument();
  //                       ^^^^^^^^^^^^^^^^^^^^^ Looks for "Projecten Overzicht" ❌
  expect(screen.queryByTestId("growth-text")).not.toBeInTheDocument();
});
```

### Analysis

**Test BUG:** Line 124 renders `title="Test Card"` but line 127 searches for `"Projecten Overzicht"`.

This appears to be copied from line 13 test (which correctly uses `title="Projecten Overzicht"`).

### Test Value Assessment

✅ **HIGH VALUE** - Tests important edge case (optional prop handling)

Test **intent** is valid: verify component gracefully handles missing `growthText` prop.

### Recommendation

**FIX line 127** to match the rendered title:

```javascript
expect(screen.getByText("Test Card")).toBeInTheDocument();
```

**NOT test cheating** because:

- Test intent remains unchanged (verify component renders without growthText)
- Only fixing obvious copy-paste typo
- Assertion already on line 128 verifies the actual behavior

---

## Defect 5: Filter Count - Mock Infrastructure Bug

### Test Failure

```
FAIL: updates filter count when results are filtered
  Expected: "1" (after filtering to dept-1)
  Actual:   "2 actieve projecten" (unfiltered count)
```

### Root Cause

**TEST INFRASTRUCTURE BUG - Nested beforeEach Overwrites Parent Mock**

File: `A3OverviewPage.test.tsx`

**Parent beforeEach (lines 115-148):** Sets up **dynamic filtering mock**

```javascript
beforeEach(() => {
  mockUseQuery.mockImplementation((queryFn, args) => {
    let filtered = [...mockA3Documents];
    if (args?.departmentId) {
      filtered = filtered.filter((d) => d.departmentId === args.departmentId);  // ✅ Filtering works
    }
    return { data: filtered, ... };
  });
});
```

**Nested beforeEach (lines 726-732):** **OVERWRITES** with static mock

```javascript
describe("Filter Count Indicator", () => {
  beforeEach(() => {
    mockUseQuery.mockReturnValue({
      data: mockA3Documents,  // ❌ STATIC - no filtering!
      isLoading: false,
      error: null,
    });
  });
```

### Analysis

The nested `beforeEach` **overwrites** the parent's `mockImplementation` with `mockReturnValue`, destroying the filtering behavior.

**Evidence:** Other describe blocks that DON'T override the mock work correctly:

- ✅ "Department Filter" (lines 200-258) - Uses parent mock, filtering works
- ✅ "Status Filter" (lines 260-318) - Uses parent mock, filtering works
- ❌ "Filter Count Indicator" (lines 725-767) - Overrides mock, filtering BREAKS

### Test Value Assessment

✅ **HIGH VALUE** - Tests critical UX behavior (count reflects filtered results)

### Recommendation

**DELETE nested beforeEach** (lines 726-732) to inherit parent's dynamic filtering mock.

**NOT test cheating** because:

- Test expectation remains unchanged (count should update on filter)
- Simply using existing parent mock infrastructure correctly
- No weakening of assertions
- Follows pattern used successfully in other describe blocks

---

## Summary & Risk Assessment

| Defect                   | Type               | Fix Required             | Risk | Test Cheating?                                  |
| ------------------------ | ------------------ | ------------------------ | ---- | ----------------------------------------------- |
| #1-2 Status badge colors | Spec evolution     | DELETE old tests         | None | ❌ No - Visual polish tests cover same behavior |
| #3 i18n assertion        | Design error       | FIX assertion            | Low  | ❌ No - Original test verified WRONG behavior   |
| #4 StatisticsCard text   | Copy-paste typo    | FIX search text          | None | ❌ No - Obvious typo fix                        |
| #5 Filter count mock     | Infrastructure bug | DELETE nested beforeEach | None | ❌ No - Use existing parent mock                |

**Overall Risk:** ✅ **MINIMAL**
All fixes preserve or IMPROVE test quality. No test value is lost.

---

## Test Quality Verification (5 TDD Criteria)

### Before Fixes

❌ **Criteria 2 FAIL:** Tests #1-2 verify obsolete spec
❌ **Criteria 5 FAIL:** Test #3 tests implementation detail (expects i18n key in output)
❌ **Criteria 1 FAIL:** Test #4 has typo preventing meaningful assertion
❌ **Criteria 1 FAIL:** Test #5 mock doesn't support tested behavior

### After Fixes

✅ **Criteria 1 PASS:** All tests verify business logic (status colors, i18n works, graceful degradation, filtered counts)
✅ **Criteria 2 PASS:** Meaningful assertions (colors match spec, text rendered, count accurate)
✅ **Criteria 3 PASS:** Error paths tested (missing growthText edge case)
✅ **Criteria 4 PASS:** Edge cases tested (optional props, filtered results)
✅ **Criteria 5 PASS:** Behavior tested, not implementation (user-visible outcomes)

---

## Recommendation

**APPROVE test fixes** with confidence:

1. **Delete** obsolete status badge color tests (lines 120-134 in A3Card.test.tsx)
2. **Fix** i18n test assertion to verify translated text
3. **Fix** StatisticsCard test title typo
4. **Delete** nested beforeEach in Filter Count test

All fixes **strengthen** test suite quality while maintaining TDD discipline.

**Signed:** Claude Code (AI QA Analyst)
**Review Status:** Awaiting Human QA Approval
