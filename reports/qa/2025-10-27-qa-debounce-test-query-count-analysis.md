# QA REPORT: Debounce Test Query Count Analysis

**Date:** 2025-10-27
**Context:** GREEN Phase - Sprint 02 Day 01
**Issue:** A3OverviewPage debounce test expects 1 query but receives 7
**Status:** 🔴 BLOCKED - Requires Decision

---

## EXECUTIVE SUMMARY

**Test Status:** 221/222 passing (99.5%)
**Failing Test:** `A3OverviewPage > Filter Behavior > debounces search input to prevent excessive queries`

**Problem:** Test expects `queryCallCount = 1` after typing, but receives `queryCallCount = 7`

**Root Cause:** Mock implementation counts EVERY useQuery call (including re-renders), not just calls with CHANGED parameters

**Recommendation:** OPTION B - Refine mock to only count calls with different search parameters

---

## DETAILED ANALYSIS

### Test Failure Details

**Location:** `app/src/pages/a3/A3OverviewPage.test.tsx:366`

**Error:**

```
AssertionError: expected 7 to be 1 // Object.is equality

Expected: 1
Received: 7
```

**Test Code:**

```typescript
it("debounces search input to prevent excessive queries", async () => {
  vi.useFakeTimers();
  const user = userEvent.setup({
    advanceTimers: vi.advanceTimersByTime.bind(vi),
  });

  let queryCallCount = 0;
  mockUseQuery.mockImplementation((queryFn, args) => {
    queryCallCount++;  // ← Counts EVERY call
    // ...
  });

  render(<A3OverviewPage />);
  expect(queryCallCount).toBe(1);  // ✅ Initial render

  await user.type(searchInput, "Reduce");  // 6 keystrokes
  expect(queryCallCount).toBe(1);  // ❌ FAILS: Gets 7
});
```

---

## ROOT CAUSE ANALYSIS

### What Happens During Typing

**Step-by-step execution:**

1. **Initial render:** `queryCallCount = 1` ✅
2. **User types "R":** Component re-renders → `useQuery` called → `queryCallCount = 2`
3. **User types "e":** Component re-renders → `useQuery` called → `queryCallCount = 3`
4. **User types "d":** Component re-renders → `useQuery` called → `queryCallCount = 4`
5. **User types "u":** Component re-renders → `useQuery` called → `queryCallCount = 5`
6. **User types "c":** Component re-renders → `useQuery` called → `queryCallCount = 6`
7. **User types "e":** Component re-renders → `useQuery` called → `queryCallCount = 7`

**Result:** `queryCallCount = 7` (1 initial + 6 keystrokes)

### Why This Happens

**React Component Lifecycle:**

- Each keystroke updates `searchTerm` state
- State update triggers component re-render
- Re-render calls `useQuery` hook again
- Mock implementation increments counter

**Debounce Hook Behavior:**

```typescript
const [searchTerm, setSearchTerm] = useState("");
const debouncedSearchTerm = useDebounce(searchTerm, 300);

useQuery(getA3Documents, {
  search: debouncedSearchTerm || undefined, // ← Key dependency
});
```

**The Confusion:**

- `useQuery` is called 7 times (1 initial + 6 re-renders)
- BUT `debouncedSearchTerm` only changes AFTER 300ms
- Real React Query would use cached result if parameters unchanged
- Our mock counts ALL calls, not just calls with NEW parameters

---

## IS THIS A CODE BUG?

**Answer: NO** ❌

**Evidence:**

1. ✅ **useDebounce tests pass** (6/6 GREEN)

   - Proves debounce hook works correctly
   - Delays value updates by 300ms as expected

2. ✅ **Implementation is correct:**

   ```typescript
   const debouncedSearchTerm = useDebounce(searchTerm, 300);

   useQuery(getA3Documents, {
     search: debouncedSearchTerm || undefined,
   });
   ```

   - useQuery dependency is `debouncedSearchTerm`
   - NOT `searchTerm` directly
   - Debounce prevents parameter changes

3. ✅ **Real React Query behavior:**
   - If parameters don't change, returns cached result
   - Doesn't trigger new API calls
   - Our mock doesn't replicate this

**Verdict:** Implementation is correct. Test mock is overly simplistic.

---

## SOLUTION OPTIONS

### OPTION A: Adjust Test Expectations (QUICK FIX)

**Change:**

```typescript
const initialCount = queryCallCount;
await user.type(searchInput, "Reduce");

// Accept that mock is called multiple times
expect(queryCallCount).toBe(initialCount); // Remove this assertion

act(() => {
  vi.advanceTimersByTime(300);
});

expect(queryCallCount).toBe(initialCount + 1); // Keep final assertion
```

**Pros:**

- ✅ Fast (5 minutes)
- ✅ Test passes
- ✅ Verifies debounce completes after 300ms

**Cons:**

- ❌ Doesn't verify "no queries during typing"
- ❌ Loses key debounce behavior verification
- ❌ Test becomes less meaningful

**Risk:** MEDIUM - Test still verifies debounce timing, but not query prevention

---

### OPTION B: Refine Mock to Track Parameter Changes (CORRECT FIX)

**Change:**

```typescript
let queryCallCount = 0;
let lastSearchParam: string | undefined = undefined;

mockUseQuery.mockImplementation((queryFn, args) => {
  // Only count if search parameter CHANGED
  if (args?.search !== lastSearchParam) {
    queryCallCount++;
    lastSearchParam = args?.search;
  }

  // ... rest of mock
});
```

**Pros:**

- ✅ Accurately models React Query behavior
- ✅ Verifies debounce prevents parameter changes
- ✅ Test meaningfully validates debouncing works
- ✅ Reusable pattern for other debounce tests

**Cons:**

- ⚠️ Slightly more complex mock logic
- ⚠️ Takes 10-15 minutes to implement

**Risk:** LOW - Clean solution that properly tests debounce behavior

---

### OPTION C: Use Real React Query (IDEAL BUT EXPENSIVE)

**Change:** Don't mock `useQuery`, use real React Query with MSW for API

**Pros:**

- ✅ Tests real integration
- ✅ No mock drift
- ✅ Most confidence

**Cons:**

- ❌ Requires MSW setup
- ❌ Slower tests
- ❌ Hours of work
- ❌ Out of scope for GREEN phase

**Risk:** N/A - Not recommended for current sprint

---

### OPTION D: Accept 221/222 and Document (PUNT)

**Skip this test, document as known issue**

**Pros:**

- ✅ Fastest (0 minutes code change)
- ✅ 99.5% coverage still excellent

**Cons:**

- ❌ Incomplete test coverage
- ❌ No verification of debounce query prevention
- ❌ Technical debt

**Risk:** LOW - 1 test out of 222 is acceptable, but not ideal

---

## RECOMMENDATION

**OPTION B: Refine Mock to Track Parameter Changes**

**Reasoning:**

1. **Accuracy:** Properly models what we're testing (query prevention during typing)
2. **Completeness:** Verifies full debounce behavior, not just timing
3. **Cost/Benefit:** 10-15 minutes for meaningful test improvement
4. **Best Practice:** Mocks should model real behavior, not just satisfy assertions
5. **Future-proof:** Pattern reusable for other debounce tests

**Implementation:**

```typescript
let queryCallCount = 0;
let previousSearchTerm: string | undefined = undefined;

mockUseQuery.mockImplementation((queryFn, args) => {
  // Only increment counter if search parameter ACTUALLY CHANGED
  const currentSearchTerm = args?.search;

  if (currentSearchTerm !== previousSearchTerm) {
    queryCallCount++;
    previousSearchTerm = currentSearchTerm;
  }

  // Rest of filtering logic...
  let filtered = [...mockA3Documents];
  if (args?.search) {
    const searchLower = args.search.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.title.toLowerCase().includes(searchLower) ||
        d.description.toLowerCase().includes(searchLower),
    );
  }

  return { data: filtered, isLoading: false, error: null };
});
```

**Expected Result:**

- Initial render: `queryCallCount = 1` (search = undefined)
- After typing: `queryCallCount = 1` (search still undefined, debounced)
- After 300ms: `queryCallCount = 2` (search = "Reduce", debounce complete)

✅ Test verifies debounce prevents query parameter changes
✅ Test verifies debounce timing (300ms)
✅ Test verifies final query with correct search term

---

## ALTERNATIVE CONSIDERATION

**If we choose OPTION A** (adjust expectations):

We must document that this test verifies **debounce timing** but NOT **query prevention**. The test would still be valuable but less comprehensive.

**Updated test would verify:**

- ✅ After 300ms, a query with search term is executed
- ❌ During typing, no queries with intermediate search terms occur

**Trade-off:** Faster to implement, but loses key debounce behavior verification.

---

## DECISION REQUIRED

**Question for Product Owner / Tech Lead:**

Which option do you prefer?

- **A:** Quick fix - adjust expectations (5 min, less comprehensive)
- **B:** Correct fix - refine mock logic (15 min, comprehensive) ← **RECOMMENDED**
- **C:** Ideal but expensive - real React Query (hours, out of scope)
- **D:** Punt - accept 221/222 (0 min, technical debt)

**My Recommendation:** **OPTION B**

**Rationale:** Small time investment (15 min) for significantly better test quality and future reusability.

---

## IMPACT ASSESSMENT

### Current Status

- **Tests Passing:** 221/222 (99.5%)
- **Code Coverage:** ~95% for Sprint 2 code
- **Implementation:** Verified correct (useDebounce tests pass)
- **User Experience:** Debouncing works in actual app

### If We Choose OPTION B

- **Time to GREEN:** +15 minutes
- **Test Quality:** Significantly improved
- **Future Benefits:** Pattern reusable for other debounce tests
- **Risk:** Very low (isolated test change)

### If We Choose OPTION A

- **Time to GREEN:** +5 minutes
- **Test Quality:** Acceptable but reduced
- **Future Benefits:** None
- **Risk:** Low (test still validates timing)

### If We Choose OPTION D

- **Time to GREEN:** Immediate
- **Test Quality:** Gap in coverage
- **Future Benefits:** Technical debt
- **Risk:** Low (1 test = 0.5% of suite)

---

## CONCLUSION

**Implementation is CORRECT.** Test mock needs refinement to properly model React Query behavior.

**Recommended Action:** Implement OPTION B - refine mock to track parameter changes.

**Expected Outcome:** 222/222 tests GREEN with comprehensive debounce verification.

---

**Prepared by:** Claude (TDD Orchestrator)
**Awaiting Decision from:** Product Owner / Tech Lead
**Next Step:** Implement chosen option

---

## APPENDIX: Test Philosophy

**What Should This Test Verify?**

1. ✅ **Debounce timing:** Query executes after 300ms delay
2. ✅ **Query prevention:** No queries with intermediate values during typing
3. ✅ **Final result:** Query executes with correct final search term
4. ✅ **UI update:** Results filtered correctly after debounce

**Current Test Status:**

- ✅ Verifies #1 (timing)
- ❌ Fails to verify #2 (prevention) - THIS IS THE GAP
- ✅ Verifies #3 (final result)
- ✅ Verifies #4 (UI update)

**OPTION B fills the gap. OPTION A accepts the gap.**

---

**END OF REPORT**
