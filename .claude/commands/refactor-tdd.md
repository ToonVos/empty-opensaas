---
description: REFACTOR phase - Improve code quality while keeping tests green with automatic metrics tracking in sprintdag directory. For large features after /green-tdd completion.
---

# REFACTOR Phase: Code Simplification

Improve code quality while keeping tests green (safe REFACTOR phase) with automatic metrics tracking in your sprintdag directory structure.

## Usage

```bash
# From same sprintdag directory as /red-tdd and /green-tdd
cd tasks/sprints/sprint-3/day-02/
/refactor-tdd "priority-filtering"

# With explicit feature name
/refactor-tdd "Add priority filtering to tasks"

# From project root (will detect sprintdag from git context)
/refactor-tdd "priority-filtering"
```

## Directory Detection & Artifact Storage

This command uses the same directory detection and creates refactoring artifacts:

```
📁 Directory Detection:
   → Check path for: tasks/sprints/sprint-X/day-Y/
   → Validate implementation/ directory exists (from /green-tdd)
   → Read implementation-notes.md for refactoring guidance

📁 Artifact Structure Created:
   tasks/sprints/sprint-3/day-02/
   ├── tests/                          # From /red-tdd (read-only)
   │   └── coverage-targets.json      ← Read for baseline
   ├── implementation/                 # From /green-tdd (read-only)
   │   ├── implementation-notes.md    ← Read for guidance
   │   └── coverage-actual.json       ← Read for baseline
   └── refactor/                       # Created by /refactor-tdd
       ├── refactor-report.md          # Refactoring summary
       ├── refactor-metrics.json       # LOC delta, complexity reduction
       ├── complexity-analysis.md      # Before/after complexity
       └── refactor-patterns.md        # Proven patterns applied
```

**Benefits:**

- ✅ Refactoring metrics tracked objectively
- ✅ Complexity reduction measured (before/after)
- ✅ LOC delta documented (code simplified?)
- ✅ Patterns cataloged for reuse

## Workflow

```
┌─────────────────────────────────────────────────────────┐
│ PHASE 3: REFACTOR - Improve Code Quality               │
└─────────────────────────────────────────────────────────┘

0. DIRECTORY DETECTION & PREREQUISITES VALIDATION
   → Detect current directory (sprintdag or project root)
   → Validate implementation/ directory exists
   → Read implementation/implementation-notes.md (must exist from /green-tdd)
   → Read implementation/coverage-actual.json (baseline coverage)
   → Check git log for "feat: Implement [feature]" commit
   → Run tests to verify GREEN status
   → Create refactor/ subdirectory if not exists
   → Output: Prerequisites PASS ✅

1. 🔍 EXPLORE PHASE (MANDATORY - Before Code Review)
   → Use Task tool with subagent_type='Explore' and thoroughness='medium'
   → Analyze refactoring opportunities:
     * Find duplicated code patterns (Grep for similar logic)
     * Review helper functions in codebase (Glob for utils/)
     * Analyze naming conventions (Read existing code style)
     * Check for DRY violations (Read duplication patterns)
     * Verify test coverage of refactor targets (which code is safe to refactor)
     * Identify magic numbers/strings (Grep for hardcoded values)
     * Find long functions (Read functions >50 LOC)
     * Check cyclomatic complexity (count if/switch/loop statements)
   → Output: Refactoring opportunities list with file paths and patterns
   → **Why critical:** Identifies safe refactorings with existing test coverage

2. CODE SMELL DETECTION
   → Invoke: Task tool with subagent_type='code-reviewer' and model='sonnet'
   → Review exploration findings
   → Read implementation/implementation-notes.md for known issues
   → Identify code smells:
     * Duplicated Code - Same logic repeated ≥2 times
     * Long Method - Functions >50 LOC
     * Large Class - Files >300 LOC
     * Long Parameter List - Functions >4 parameters
     * Magic Numbers/Strings - Hardcoded values
     * Complex Conditionals - Nested if/switch statements
     * Feature Envy - Function accessing other object's data excessively
     * Data Clumps - Same group of variables passed together
   → Suggest refactorings (priority order):
     * Extract Function - Pull out duplicated logic
     * Extract Constant - Replace magic values
     * Extract Helper - Create reusable utility
     * Rename - Improve clarity
     * Simplify Conditional - Reduce nesting
     * Consolidate Pattern - Merge similar implementations
   → Prioritize by impact/effort:
     * HIGH impact, LOW effort → Do first
     * HIGH impact, HIGH effort → Do if time permits
     * LOW impact, any effort → Skip (not worth it)
   → Output: Prioritized refactoring tasks

3. 📋 PLAN PHASE (MANDATORY - Before Refactoring Execution)
   → Use Task tool with subagent_type='Plan' and model='haiku'
   → Create refactoring execution strategy:
     * Sequence refactoring steps (one at a time, test after each)
     * Plan helper extraction:
       - Where to put (app/src/utils/[category]/)
       - What to name (follow existing conventions)
       - Which operations use it (findAll references)
     * Design constant consolidation:
       - Error messages (app/src/constants/errors.ts)
       - Config values (app/src/constants/config.ts)
     * Identify safe refactorings:
       - Covered by tests (≥80% coverage)
       - Pure functions (no side effects)
       - Isolated modules (low coupling)
     * Estimate LOC reduction per refactoring:
       - Extract function: -10 to -30 LOC
       - Extract constant: -5 to -15 LOC
       - Consolidate pattern: -20 to -50 LOC
     * Calculate complexity reduction:
       - Measure cyclomatic complexity before
       - Estimate complexity after
     * Plan validation after each refactoring:
       - Run tests (must stay GREEN)
       - Check coverage (must not decrease)
       - Verify no new functionality added
   → Output: Refactoring execution plan with numbered steps
   → **Why critical:** Ensures tests stay green during each refactoring step

4. MEASURE BASELINE METRICS
   → Count lines of code (before refactoring):
     * Total LOC in implementation files
     * LOC per file
     * LOC per function
   → Calculate cyclomatic complexity (before refactoring):
     * Count decision points (if, switch, loop, &&, ||, ?)
     * Complexity per function
     * Average complexity
   → Run tests with coverage:
     * cd app && wasp test client run --coverage
     * Record baseline coverage (from implementation/coverage-actual.json)
   → Write refactor/baseline-metrics.json:
     * LOC (total, per file, per function)
     * Complexity (total, average, per function)
     * Coverage (statements, branches, functions, lines)
   → Output: Baseline metrics recorded

5. REFACTORING EXECUTION (ONE AT A TIME)
   → Invoke: Task tool with subagent_type='wasp-refactor-executor' and model='haiku'
   → Execute refactorings according to plan (sequentially):

     FOR EACH refactoring in plan:
       1. Apply refactoring (ONE change only):
          * Extract function → Create helper, replace usages
          * Extract constant → Create constant, replace values
          * Rename → Update all references
          * Simplify conditional → Reduce nesting
          * Consolidate pattern → Merge similar code

       2. Run tests immediately:
          * cd app && wasp test client run
          * Expected: All tests GREEN
          * If RED: REVERT refactoring immediately

       3. Check coverage:
          * cd app && wasp test client run --coverage
          * Expected: Coverage maintained or improved
          * If decreased: REVERT refactoring immediately

       4. Verify no new functionality:
          * Check git diff (only code movement, no logic changes)
          * Expected: Same behavior, simpler code
          * If new logic added: REVERT (violates REFACTOR phase)

       5. Commit refactoring:
          * git add [changed files]
          * git commit -m "refactor: [specific change description]"
          * Output: Refactoring committed

     END FOR

   → Output: All refactorings executed (with individual commits)

6. VALIDATION GATE
   → Run final test suite: cd app && wasp test client run
   → Expected: All tests still GREEN ✅
   → If RED: Identify which refactoring broke tests → Revert

   → Run final coverage: cd app && wasp test client run --coverage
   → Expected: Coverage ≥ baseline (from step 4)
   → If decreased: Identify which refactoring reduced coverage → Revert

   → Check code size:
     * Count total LOC (after refactoring)
     * Compare with baseline (from step 4)
     * Expected: LOC reduced OR modularized (NOT increased)
     * If increased: Review refactorings → Identify unnecessary additions

   → Calculate complexity:
     * Count cyclomatic complexity (after refactoring)
     * Compare with baseline (from step 4)
     * Expected: Complexity reduced OR equal (NOT increased)
     * If increased: Simplification failed → Review refactorings

   → Verify no new functionality:
     * Review all commits since GREEN phase
     * Check for new tests (NOT allowed in REFACTOR)
     * Check for new operations (NOT allowed in REFACTOR)
     * Expected: Same functionality, better code
     * If new functionality found: REVERT to GREEN phase

   → Output: Validation PASS ✅

7. MEASURE FINAL METRICS
   → Count lines of code (after refactoring):
     * Total LOC in implementation files
     * LOC per file
     * LOC per function
   → Calculate cyclomatic complexity (after refactoring):
     * Count decision points
     * Complexity per function
     * Average complexity
   → Run tests with coverage:
     * cd app && wasp test client run --coverage
     * Record final coverage
   → Calculate deltas:
     * LOC delta: final - baseline (negative = simplified)
     * Complexity delta: final - baseline (negative = simplified)
     * Coverage delta: final - baseline (positive = improved)
   → Write refactor/refactor-metrics.json:
     * Baseline metrics (from step 4)
     * Final metrics
     * Deltas (LOC, complexity, coverage)
     * Refactoring count (number of refactorings applied)
   → Output: Final metrics recorded

8. WRITE ARTIFACTS TO refactor/ DIRECTORY
   → Create artifact directory: [dag-directory]/refactor/
   → Write refactor-report.md:
     * Executive summary (what was refactored, why)
     * Refactorings applied (list with descriptions)
     * Code smells addressed (which smells, how fixed)
     * Helpers extracted (file paths, usage count)
     * Constants consolidated (which constants, where)
     * Metrics improvement (LOC delta, complexity delta)
     * Tests status (all GREEN, coverage maintained)
     * Lessons learned (patterns to apply to other features)
   → Write refactor-metrics.json:
     * Baseline metrics (LOC, complexity, coverage)
     * Final metrics
     * Deltas (improvements achieved)
     * Refactoring count
   → Write complexity-analysis.md:
     * Cyclomatic complexity per function (before/after)
     * Complexity hotspots identified
     * Complexity reduction strategies applied
     * Remaining complexity (if any, why acceptable)
   → Write refactor-patterns.md:
     * Patterns applied (extract function, extract constant, etc.)
     * Pattern descriptions (what, when to use)
     * Code examples (before/after)
     * Reusability notes (apply to similar features)
   → Output: Artifacts written to refactor/ subdirectory

9. GIT COMMIT (FINAL)
   → Note: Individual refactorings already committed (step 5)
   → Stage artifact files:
     * git add tasks/sprints/sprint-X/day-Y/refactor/
   → Commit artifacts:
     * git commit -m "docs: Add refactoring report for [feature]"
   → Optional: Squash refactor commits (if desired):
     * git rebase -i [green-commit-hash]
     * Squash all "refactor:" commits into one
     * New message: "refactor: Simplify [feature] implementation"
   → Output: Refactoring documented

10. SUMMARY & NEXT STEPS
    → Display summary:
      ✅ Tests: X/X still GREEN
      ✅ Code simplified: -Y LOC, -Z complexity
      ✅ Coverage: Maintained at W% (or improved to V%)
      ✅ Refactorings: N refactorings applied
      ✅ Artifacts: [dag-directory]/refactor/
      ✅ Commits: [commit hashes]
    → Next step: Run /security-tdd "[feature-name]" for security audit
```

## Prerequisites

Before running `/refactor-tdd`:

1. ✅ **Tests are GREEN** (wasp test client run passes)
2. ✅ **Implementation committed** (git log shows "feat: Implement [feature]")
3. ✅ **Implementation notes exist** (implementation/implementation-notes.md from /green-tdd)
4. ✅ **Coverage baseline exists** (implementation/coverage-actual.json from /green-tdd)

## Exit Criteria

This command completes successfully when:

1. ✅ All tests still GREEN
2. ✅ Code simplified (LOC reduced or modularized)
3. ✅ Complexity reduced or equal (NOT increased)
4. ✅ Coverage maintained or improved (NOT decreased)
5. ✅ No new functionality added (behavior unchanged)
6. ✅ Refactoring committed to git
7. ✅ Artifacts written to refactor/ directory

## RED FLAGS - Stop Immediately If:

These indicate REFACTOR phase violations:

- ❌ **Tests RED** → Revert last refactoring
- ❌ **Coverage decreased** → Revert last refactoring
- ❌ **LOC increased significantly** → Review refactorings (added functionality?)
- ❌ **New tests added** → NOT allowed in REFACTOR phase
- ❌ **New operations created** → NOT allowed in REFACTOR phase
- ❌ **Behavior changed** → Revert (REFACTOR must preserve behavior)

## Artifacts Created

After successful completion, you'll find:

```
tasks/sprints/sprint-3/day-02/refactor/
├── refactor-report.md          # Refactoring summary
├── refactor-metrics.json       # LOC delta, complexity reduction
├── complexity-analysis.md      # Before/after complexity
├── refactor-patterns.md        # Proven patterns applied
└── baseline-metrics.json       # Pre-refactoring metrics

app/src/**/*.ts                 # Refactored files (committed)
app/src/utils/[category]/*.ts   # Extracted helpers (committed)
app/src/constants/*.ts          # Consolidated constants (committed)
```

## Agent Assignment

| Step | Task                    | Model  | Agent                  | Reason                     |
| ---- | ----------------------- | ------ | ---------------------- | -------------------------- |
| 1    | Refactoring exploration | Haiku  | **Explore** (built-in) | Find refactoring targets   |
| 2    | Code smell detection    | Sonnet | code-reviewer          | Pattern recognition        |
| 3    | Refactoring planning    | Haiku  | **Plan** (built-in)    | Sequence safe refactorings |
| 5    | Refactoring execution   | Haiku  | wasp-refactor-executor | Mechanical transforms      |

## New Capabilities for Large Features

**vs Unified /tdd-feature:**

1. **Complexity Metrics** - Objective refactoring success measurement

   - Calculate cyclomatic complexity (before/after)
   - Track per function, not just total
   - Document in complexity-analysis.md

2. **Helper Library Strategy** - Build reusable utilities systematically

   - Analyze all operations for common patterns
   - Extract to categorized utils/ directory
   - Test extracted helpers
   - Document usage patterns

3. **Refactoring History** - Track quality improvement over time

   - Log metrics (LOC, complexity, duplication %)
   - Store in project refactoring history
   - Enable trend analysis across features

4. **Safe Refactoring Patterns** - Catalog proven refactorings

   - Extract permission check → requireAuth()
   - Extract filter builder → buildEntityFilter()
   - Extract validator → validateInput(schema)
   - Document in refactor-patterns.md for reuse

5. **Incremental Refactoring** - One change at a time
   - Apply refactoring
   - Run tests (must stay GREEN)
   - Commit immediately
   - Next refactoring
   - Enable rollback per refactoring

## Cross-Phase Integration

**Reads artifacts from /green-tdd:**

- ✅ **implementation-notes.md** → Refactoring guidance (known duplication, hotspots)
- ✅ **coverage-actual.json** → Coverage baseline (must not decrease)
- ✅ **Committed implementation** → Prerequisites validation (code must exist)

**Creates artifacts for /security-tdd:**

- ✅ **refactor-report.md** → Security context (what was simplified, patterns used)
- ✅ **complexity-analysis.md** → Security risk (complex code = higher risk)
- ✅ **Committed refactoring** → Final code for security audit

## Example Execution

**Command:**

```bash
cd tasks/sprints/sprint-3/day-02/
/refactor-tdd "priority-filtering"
```

**Output:**

```
📁 Directory Detection...
   ✓ Sprintdag directory: tasks/sprints/sprint-3/day-02/
   ✓ implementation/ directory exists (from /green-tdd)
   ✓ Reading: implementation/implementation-notes.md
   ✓ Reading: implementation/coverage-actual.json (82%/76%)
   ✓ Creating refactor/ subdirectory

✅ Prerequisites Validation...
   ✓ Git log: feat: Implement priority filtering (b2c3d4e)
   ✓ Tests status: GREEN (7 passing)
   ✓ Implementation notes: Known duplication in filter logic
   ✓ Coverage baseline: 82% statements, 76% branches

🔍 EXPLORE: Analyzing refactoring opportunities...
   Model: Haiku (Explore agent)
   ✓ Duplication found: Priority filtering logic (3 occurrences)
   ✓ Similar pattern: Status filtering (src/server/a3/operations.ts:145)
   ✓ Helper opportunity: buildTaskFilter() (extract common filter logic)
   ✓ Magic strings: Error messages (5 hardcoded strings)
   ✓ Long function: getTasks (67 LOC, complexity 12)

🔍 CODE SMELL DETECTION: Identifying smells...
   Model: Sonnet (code-reviewer)
   Code smells found:
   1. Duplicated Code: Filter building logic (3 times)
      → Refactoring: Extract buildTaskFilter() helper
      → Impact: HIGH (DRY violation), Effort: LOW
   2. Magic Strings: Error messages (5 occurrences)
      → Refactoring: Extract ERROR_MESSAGES constant
      → Impact: MEDIUM (maintainability), Effort: LOW
   3. Long Method: getTasks (67 LOC, complexity 12)
      → Refactoring: Extract filter building, validation
      → Impact: HIGH (readability), Effort: MEDIUM
   Prioritized: Refactoring 1 → 2 → 3

📋 PLAN: Creating refactoring execution strategy...
   Model: Haiku (Plan agent)
   Refactoring sequence:
   1. Extract buildTaskFilter() helper
      - Where: app/src/server/a3/utils/filters.ts
      - Usage: getTasks, getMyTasks, getDepartmentTasks
      - Estimated LOC reduction: -25 LOC
   2. Extract ERROR_MESSAGES constant
      - Where: app/src/constants/errors.ts
      - Usage: 5 operations in operations.ts
      - Estimated LOC reduction: -10 LOC
   3. Simplify getTasks by using helpers
      - Use buildTaskFilter() from step 1
      - Use ERROR_MESSAGES from step 2
      - Estimated LOC reduction: -15 LOC
   Total estimated LOC reduction: -50 LOC (from 245 to 195)

📊 BASELINE METRICS: Measuring before refactoring...
   LOC: 245 (operations.ts)
   Complexity: Average 8.5, Max 12 (getTasks)
   Coverage: 82% statements, 76% branches
   Saved: refactor/baseline-metrics.json

🔧 REFACTORING EXECUTION: Applying refactorings...
   Model: Haiku (wasp-refactor-executor)

   Refactoring 1/3: Extract buildTaskFilter()
   ✓ Created: app/src/server/a3/utils/filters.ts
   ✓ Updated: operations.ts (replaced 3 occurrences)
   ✓ Tests: 7/7 GREEN ✅
   ✓ Coverage: 82% maintained ✅
   ✓ Committed: refactor: Extract buildTaskFilter helper (c3d4e5f)

   Refactoring 2/3: Extract ERROR_MESSAGES constant
   ✓ Created: app/src/constants/errors.ts
   ✓ Updated: operations.ts (replaced 5 strings)
   ✓ Tests: 7/7 GREEN ✅
   ✓ Coverage: 82% maintained ✅
   ✓ Committed: refactor: Extract error message constants (d4e5f6g)

   Refactoring 3/3: Simplify getTasks
   ✓ Updated: getTasks function (used helpers)
   ✓ Reduced: getTasks from 67 to 42 LOC (-25 LOC)
   ✓ Tests: 7/7 GREEN ✅
   ✓ Coverage: 83% improved ✅ (+1%)
   ✓ Committed: refactor: Simplify getTasks implementation (e5f6g7h)

✅ VALIDATION GATE: Verifying refactoring quality...
   ✓ Tests: 7/7 still GREEN
   ✓ Coverage: 83% (maintained, +1%)
   ✓ LOC: Reduced from 245 to 195 (-50 LOC, -20%)
   ✓ Complexity: Average 6.5 (reduced from 8.5, -24%)
   ✓ No new functionality added

📊 FINAL METRICS: Measuring after refactoring...
   LOC: 195 (operations.ts) - REDUCED by 50 (-20%)
   Complexity: Average 6.5, Max 9 - REDUCED by 2.0 (-24%)
   Coverage: 83% statements, 77% branches - IMPROVED by 1%
   Refactorings: 3 applied successfully
   Saved: refactor/refactor-metrics.json

📝 ARTIFACTS: Writing to refactor/ directory...
   ✓ refactor/refactor-report.md (summary + lessons learned)
   ✓ refactor/refactor-metrics.json (LOC -50, complexity -24%)
   ✓ refactor/complexity-analysis.md (before/after per function)
   ✓ refactor/refactor-patterns.md (extract helper, extract constant)

📝 GIT COMMIT: Documenting refactoring...
   ✓ Staged: tasks/sprints/sprint-3/day-02/refactor/
   ✓ Committed: docs: Add refactoring report for priority filtering
   ✓ Commit hash: f6g7h8i

🎉 REFACTOR PHASE COMPLETE!

   Summary:
   ✅ Tests: 7/7 still GREEN
   ✅ Code simplified: -50 LOC (-20%), -2.0 complexity (-24%)
   ✅ Coverage: Improved to 83% statements, 77% branches (+1%)
   ✅ Refactorings: 3 refactorings applied
   ✅ Artifacts: tasks/sprints/sprint-3/day-02/refactor/
   ✅ Commits: c3d4e5f, d4e5f6g, e5f6g7h, f6g7h8i

   Next step:
   → Run: /security-tdd "priority-filtering"
```

## Error Handling

**If prerequisites fail:**

```
❌ Prerequisites FAILED

   Missing:
   - implementation/implementation-notes.md not found
   - No "feat:" commit in git log

   Action: Run /green-tdd first to create implementation
```

**If tests are RED:**

```
❌ Tests RED (cannot refactor)

   5/7 tests failing

   Action:
   - Fix failing tests first
   - Run /green-tdd again if needed
   - Ensure all tests GREEN before refactoring
```

**If refactoring breaks tests:**

```
❌ Refactoring broke tests

   Refactoring: Extract buildTaskFilter()
   Tests before: 7/7 GREEN
   Tests after: 5/7 RED

   Action: REVERTING refactoring...
   ✓ Reverted: Extract buildTaskFilter()
   ✓ Tests: 7/7 GREEN (restored)

   Analysis: Helper function logic error (missing null check)
   Next: Fix helper logic and retry
```

**If coverage decreases:**

```
❌ Coverage decreased after refactoring

   Before: 82% statements
   After: 78% statements
   Delta: -4% (FAIL)

   Refactoring: Simplify getTasks
   Issue: Removed code that was covered by tests

   Action: REVERTING refactoring...
   ✓ Reverted: Simplify getTasks
   ✓ Coverage: 82% (restored)

   Next: Review refactoring approach
```

**If LOC increased:**

```
⚠️ WARNING: Code size increased

   Before: 245 LOC
   After: 268 LOC
   Delta: +23 LOC (+9%)

   Analysis: Added helper functions but didn't remove original code
   Review: Did refactoring actually simplify?

   Action: Review refactorings → Identify unnecessary additions
```

## When to Use This Command

✅ **Use /refactor-tdd for:**

- After /green-tdd completion (implementation exists and committed)
- Large features (>500 LOC, worth simplifying)
- Complex features (high cyclomatic complexity)
- Features with known duplication (flagged in implementation-notes.md)
- Building helper library (extract reusable utilities)

❌ **Skip /refactor-tdd if:**

- Implementation already clean (no duplication, low complexity)
- Small features (<200 LOC, refactoring overhead not worth it)
- Time-sensitive features (refactoring can wait for future sprint)
- Implementation will change soon (wait for stability)

## Integration with Other Commands

**Preceded by:**

- `/red-tdd "[feature]"` - Write tests
- `/green-tdd "[feature]"` - Implement (prerequisite)

**Followed by:**

- `/security-tdd "[feature-name]"` - Security audit

**Reads artifacts from:**

- `implementation/implementation-notes.md` (from /green-tdd) - Refactoring guidance
- `implementation/coverage-actual.json` (from /green-tdd) - Coverage baseline

**Creates artifacts for:**

- `/security-tdd` - refactor-report.md (final code state for audit)

## References

- **Agents:** wasp-refactor-executor, code-reviewer
- **Skills:** /code-quality (refactoring patterns), /wasp-operations (operation patterns)
- **Docs:** docs/TDD-WORKFLOW.md (REFACTOR phase), CLAUDE.md (code style)
- **Templates:** .claude/templates/operations-patterns.ts
- **Marketplace:** None (uses built-in agents)
