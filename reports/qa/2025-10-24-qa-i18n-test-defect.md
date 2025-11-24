# QA Report: react-i18next Test Best Practice Violation

**Date:** 2025-10-24
**Sprint:** Sprint 2 - A3 Overview Implementation
**Phase:** GREEN (Test Implementation)
**Severity:** Medium - Test Quality Issue
**Status:** Pending Review

---

## Summary

During GREEN phase implementation of A3 Overview filters, discovered that StatusFilter.test.tsx checks for **translated text** ("Draft", "In Progress", "Completed") instead of **i18n keys** ("filters.statusDraft", etc.).

**This violates react-i18next official testing best practices.**

**Impact:** 1/8 filter tests failing, but implementation works correctly in browser.

---

## Problem Statement

### Current Test Implementation

From `app/src/components/a3/filters/StatusFilter.test.tsx:29-31`:

```typescript
it("displays all A3Status enum values in dropdown", async () => {
  // BEHAVIOR: Dropdown shows DRAFT, IN_PROGRESS, and COMPLETED options
  const user = userEvent.setup();

  render(<StatusFilter value="" onChange={vi.fn()} />);

  const select = screen.getByTestId("status-filter-select");
  await user.click(select);

  // ❌ ANTI-PATTERN: Checking translated text
  expect(screen.getByText("Draft")).toBeInTheDocument();
  expect(screen.getByText("In Progress")).toBeInTheDocument();
  expect(screen.getByText("Completed")).toBeInTheDocument();
});
```

### What's Wrong

Tests are checking for **English translations** ("Draft") but:

1. **Implementation uses Dutch**: `t('filters.statusDraft')` → "Concept" (in browser)
2. **Standard mock returns keys**: `t: (key) => key` → "filters.statusDraft" (in tests)
3. **Language-dependent**: Tests would break if we change from English to any other language

---

## react-i18next Official Best Practices

### Official Recommendation

From react-i18next documentation and industry best practices:

**Tests should check i18n KEYS, not translated text.**

### Standard Mock Pattern

```typescript
// ✅ BEST PRACTICE - Standard react-i18next test mock
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Returns key unchanged
    i18n: { changeLanguage: () => new Promise(() => {}), language: "en" },
  }),
}));
```

**Why return keys?**

1. **Language-independent**: Tests don't break when changing languages
2. **Maintainable**: No need to update tests when changing translations
3. **Clear intent**: Tests verify correct key usage, not translation quality
4. **Standard practice**: Recommended approach across React community

### What Tests Should Check

```typescript
// ❌ ANTI-PATTERN (our current test)
expect(screen.getByText("Draft")).toBeInTheDocument();
expect(screen.getByText("In Progress")).toBeInTheDocument();

// ✅ BEST PRACTICE (what tests should do)
expect(screen.getByText("filters.statusDraft")).toBeInTheDocument();
expect(screen.getByText("filters.statusInProgress")).toBeInTheDocument();
expect(screen.getByText("filters.statusCompleted")).toBeInTheDocument();
```

---

## Evidence

### Web Research Findings

**Source:** react-i18next testing documentation and community best practices

**Key Points:**

1. **Standard mock**: `t: (key) => key` is the recommended approach
2. **Reasoning**: Tests should verify application behavior, not translation quality
3. **Translation testing**: Should be done separately with dedicated i18n test suites
4. **Component tests**: Should verify correct key usage and component logic

### Why Our Mock Failed to Apply

Multiple attempts to apply standard mock failed:

1. **`vi.mock()` in test/setup.ts** - Not overriding Wasp imports
2. **`__mocks__/react-i18next.ts`** - Not being loaded
3. **`vitest.config.ts` alias** - Wasp build system overrides

**Root cause:** Wasp framework's custom build system manages module resolution differently than standard Vite.

**Discovery:** After research, realized the mock IS working correctly (returns keys). **The test expectations are wrong** - they're checking for translations instead of keys.

---

## Current State

### Test Results

- **7/8 filter tests PASSING** (87.5%)
- **1 test FAILING**: "displays all A3Status enum values in dropdown"

**Failure message:**

```
TestingLibraryElementError: Unable to find an element with the text: Draft
```

**What's in DOM:** `"filters.statusDraft"` (the i18n key)
**What test expects:** `"Draft"` (English translation)

### Implementation Status

**✅ Implementation CORRECT:**

- i18n configuration working (`app/src/i18n.ts`)
- Dutch translations loading in browser
- Filters display "Concept", "In behandeling", "Afgerond"

**❌ Test expectations INCORRECT:**

- Checking for English text that never appears
- Violates react-i18next best practices

---

## Root Cause Analysis

### How This Happened

1. **RED phase test generation**: wasp-test-automator agent generated tests
2. **Test pattern assumption**: Agent assumed tests should check translated text (common anti-pattern)
3. **Mock misunderstanding**: Tests written for custom mock that returns translations, not standard mock that returns keys
4. **Not caught in RED phase**: Tests written before implementation existed

### Why This Is a Test DEFECT

This is **NOT a design choice** - it's a **technical error**:

1. ❌ Violates react-i18next official recommendations
2. ❌ Makes tests language-dependent (breaks if we change from English)
3. ❌ Makes tests translation-dependent (breaks if we change wording)
4. ❌ Creates maintenance burden (update tests every time translations change)
5. ❌ Doesn't match standard mock pattern (`t: (key) => key`)

**Classification:** Test DEFECT - can be fixed in GREEN phase per TDD rules.

---

## Impact Assessment

### Current Impact

1. **Test Reliability**: 1/8 tests failing due to incorrect expectations
2. **Developer Confusion**: Why do tests check for English when app is Dutch?
3. **Maintenance Burden**: Would need custom mock to return translations (anti-pattern)

### Future Impact (If Not Fixed)

1. **Language Lock-in**: Can't change UI language without updating tests
2. **Translation Changes**: Tests break when improving UX copy
3. **Team Onboarding**: New developers confused by anti-pattern
4. **Technical Debt**: Workarounds accumulate (custom mocks, translation files in test setup)

---

## Solution

### Proposed Fix

Update test expectations to check for **i18n keys** instead of **translated text**.

### Implementation

**File:** `app/src/components/a3/filters/StatusFilter.test.tsx`

**Lines 29-31** - Change from:

```typescript
expect(screen.getByText("Draft")).toBeInTheDocument();
expect(screen.getByText("In Progress")).toBeInTheDocument();
expect(screen.getByText("Completed")).toBeInTheDocument();
```

**To:**

```typescript
expect(screen.getByText("filters.statusDraft")).toBeInTheDocument();
expect(screen.getByText("filters.statusInProgress")).toBeInTheDocument();
expect(screen.getByText("filters.statusCompleted")).toBeInTheDocument();
```

**File:** `app/src/test/setup.ts`

**Lines 9-49** - Verify standard mock (already correct):

```typescript
vi.mock("react-i18next", () => {
  const translations: Record<string, string> = {
    // ... translation map
  };

  return {
    useTranslation: () => ({
      t: (key: string) => translations[key] || key, // ✅ Returns key if not in map
      i18n: {
        changeLanguage: () => new Promise(() => {}),
        language: "en",
      },
    }),
    Trans: ({ children }: any) => children,
    initReactI18next: {
      type: "3rdParty",
      init: () => {},
    },
  };
});
```

**SIMPLIFICATION:** Actually, since we're checking for keys, we can simplify the mock to the standard pattern:

```typescript
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // ✅ BEST PRACTICE: Always return key
    i18n: {
      changeLanguage: () => new Promise(() => {}),
      language: "en",
    },
  }),
  Trans: ({ children }: any) => children,
  initReactI18next: {
    type: "3rdParty",
    init: () => {},
  },
}));
```

**Benefit:** Simpler mock, follows industry standard, no translation map maintenance.

---

## Expected Outcome

### After Fix

1. **8/8 filter tests PASSING** ✅
2. **Standard mock pattern** ✅
3. **Language-independent tests** ✅
4. **Maintainable test suite** ✅
5. **Aligned with react-i18next best practices** ✅

### No Implementation Changes

**Implementation code is CORRECT** - no changes needed to:

- `StatusFilter.tsx`
- `DepartmentFilter.tsx`
- `A3OverviewPage.tsx`
- `i18n.ts`

**Only test files change** - fixing test expectations to match best practices.

---

## Rationale for Fixing in GREEN Phase

### TDD Rules on Test Modifications

**From `docs/TDD-WORKFLOW.md`:**

> Tests are immutable during GREEN phase **UNLESS they contain defects**.

**What constitutes a defect:**

1. Test checks wrong behavior
2. Test violates industry best practices
3. Test has technical errors (syntax, imports, etc.)

### This Is a Defect Because

1. ✅ **Violates industry best practices** - react-i18next official recommendations
2. ✅ **Checks wrong behavior** - checking translated text instead of key usage
3. ✅ **Technical error** - incompatible with standard mock pattern

**Conclusion:** Fixing this in GREEN phase is **TDD-compliant** as it corrects a test defect.

---

## Alternatives Considered

### Alternative 1: Custom Mock with Translations

**Approach:** Make mock return English translations to match test expectations

```typescript
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations = {
        "filters.statusDraft": "Draft",
        "filters.statusInProgress": "In Progress",
        "filters.statusCompleted": "Completed",
        // ... hundreds more
      };
      return translations[key] || key;
    },
  }),
}));
```

**Rejected because:**

- ❌ Anti-pattern (not recommended by react-i18next)
- ❌ Maintenance burden (update mock every time translations added)
- ❌ Language lock-in (tests now depend on English)
- ❌ Duplicates translation logic in test setup

### Alternative 2: Test Real Translations

**Approach:** Load actual translation files in test environment

**Rejected because:**

- ❌ Slow tests (i18n initialization overhead)
- ❌ Tests now test i18n library, not component logic
- ❌ Translation changes break tests (UX copy is not API contract)
- ❌ Violates single responsibility (component tests should test components)

### Alternative 3: Skip Test / Mark as TODO

**Approach:** Comment out failing test, add TODO marker

**Rejected because:**

- ❌ Reduces test coverage
- ❌ Kicks problem down the road
- ❌ Test is valuable (verifies filter displays all statuses)
- ❌ Simple fix available (change 3 lines)

---

## Recommendation

**Fix test expectations to check i18n keys (Solution above)**

### Benefits

1. ✅ Follows react-i18next official best practices
2. ✅ Language-independent tests (can switch from Dutch to English without test changes)
3. ✅ Maintainable (translation changes don't break tests)
4. ✅ Simple standard mock (`t: (key) => key`)
5. ✅ TDD-compliant (fixes test defect in GREEN phase)
6. ✅ All 8 filter tests passing
7. ✅ Professional code quality

### Risk Assessment

**Risk:** Very Low

- Small change (3 lines in one test)
- Standard industry pattern
- No implementation code changes
- Easy to revert if needed

---

## Code Comments

Add to `app/src/components/a3/filters/StatusFilter.tsx` (documentation):

```typescript
/**
 * NOTE: i18n Testing Pattern (Per react-i18next Best Practices)
 *
 * Tests check for i18n KEYS (e.g., "filters.statusDraft"), not translated text.
 * This makes tests language-independent and maintainable.
 *
 * Standard test mock: t: (key) => key (returns key unchanged)
 *
 * See: reports/qa/2025-10-24-qa-i18n-test-defect.md
 * Reference: react-i18next testing documentation
 */
```

---

## Questions for Product Owner / Tech Lead

1. **Approve fix?** Can we update test expectations to check i18n keys instead of translated text?

2. **Mock simplification?** Can we simplify test/setup.ts mock to standard pattern (`t: (key) => key`)?

3. **Documentation?** Should we add i18n testing guidelines to `app/src/test/CLAUDE.md`?

---

## Decision

**[ ] APPROVED** - Fix test expectations to check i18n keys (recommended)
**[ ] REJECTED** - Alternative approach required (specify below)

**Approved by:** **\*\***\_\_\_\_**\*\***
**Date:** **\*\***\_\_\_\_**\*\***

**Notes:**

---

## References

- **Failing Test:** `app/src/components/a3/filters/StatusFilter.test.tsx:29-31`
- **Implementation:** `app/src/components/a3/filters/StatusFilter.tsx`
- **Mock Setup:** `app/src/test/setup.ts:9-49`
- **i18n Config:** `app/src/i18n.ts`
- **react-i18next Docs:** https://react.i18next.com/misc/testing
- **Related QA Report:** `reports/qa/2025-10-24-qa-filter-type-inconsistency.md`

---

## Document Metadata

**Document Version:** 1.0
**Generated:** 2025-10-24
**Generator:** Claude Code (Sonnet)
**Review Status:** ⚠️ Pending Approval
**Approval:** Pending

**Change Log:**

- 2025-10-24: Initial document generation

---

**END OF REPORT**
