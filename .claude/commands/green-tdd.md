---
description: GREEN phase - Implement just enough code to make tests pass with automatic artifact storage in sprintdag directory. For large features after /red-tdd completion.
---

# GREEN Phase: Minimal Implementation

Implement just enough code to make tests pass (minimal GREEN phase) with automatic artifact storage in your sprintdag directory structure.

## Usage

```bash
# From same sprintdag directory as /red-tdd
cd tasks/sprints/sprint-3/day-02/
/green-tdd "priority-filtering"

# With explicit feature name
/green-tdd "Add priority filtering to tasks"

# From project root (will detect sprintdag from git context)
/green-tdd "priority-filtering"
```

## Directory Detection & Artifact Storage

This command uses the same directory detection as `/red-tdd` and creates implementation artifacts:

```
📁 Directory Detection:
   → Check path for: tasks/sprints/sprint-X/day-Y/
   → Validate tests/ directory exists (from /red-tdd)
   → Read test-plan.md for implementation guidance

📁 Artifact Structure Created:
   tasks/sprints/sprint-3/day-02/
   ├── tests/                          # From /red-tdd (read-only)
   │   ├── test-plan.md               ← Read for guidance
   │   └── coverage-targets.json      ← Read for validation
   └── implementation/                 # Created by /green-tdd
       ├── implementation-notes.md     # Implementation decisions
       ├── coverage-actual.json        # Actual coverage achieved
       ├── green-failures.md           # Failure diagnosis (if needed)
       └── schema-coordination.md      # Multi-worktree notes (if schema changes)
```

**Benefits:**

- ✅ Implementation artifacts stay with sprintdag context
- ✅ Test plan guidance preserved for review
- ✅ Coverage validation tracked (actual vs targets)
- ✅ Failure diagnosis documented for learning

## Workflow

```
┌─────────────────────────────────────────────────────────┐
│ PHASE 2: GREEN - Implement Feature                     │
└─────────────────────────────────────────────────────────┘

0. DIRECTORY DETECTION & PREREQUISITES VALIDATION
   → Detect current directory (sprintdag or project root)
   → Validate tests/ directory exists
   → Read tests/test-plan.md (must exist from /red-tdd)
   → Read tests/coverage-targets.json (must exist from /red-tdd)
   → Check git log for "test: Add [feature]" commit
   → Run tests to verify RED status
   → Create implementation/ subdirectory if not exists
   → Output: Prerequisites PASS ✅

   ⚠️  IF PREREQUISITES FAIL - STOP IMMEDIATELY:

   ❌ DO NOT proceed to Step 1 (Explore)
   ❌ DO NOT proceed to implementation
   ❌ DO NOT create any files
   ❌ DO NOT make any commits

   ✅ INSTEAD - Ask user what to do:

   Display error message:
   "❌ Prerequisites FAILED - Cannot proceed with GREEN phase

   Missing:
   - [list each missing item]

   The RED phase must be completed first. What would you like to do?

   Options:
   1. Run /red-tdd first to write tests
   2. Cancel and fix prerequisites manually
   3. Provide more context about the feature

   Please choose an option or cancel the command."

   Wait for user response before proceeding.

1. 🔍 EXPLORE PHASE (MANDATORY - Before Schema Decisions)
   → Use Task tool with subagent_type='Explore' and thoroughness='medium'
   → Analyze schema impact:
     * Check current schema state (Read schema.prisma)
     * Find related migrations (Glob for migration files)
     * Review entity relationships (Analyze schema graph)
     * Check parallel worktree changes (git fetch + compare branches)
     * Verify migration history (check migration sequence)
     * Identify schema conflicts (Grep for entity usage)
     * Analyze entity usage patterns (Read existing operations)
   → Output: Schema analysis with change recommendations
   → **Why critical:** Prevents schema conflicts and migration issues

2. SCHEMA MIGRATION (IF NEEDED)
   → Check if schema changes required (from exploration)

   IF YES:
     → Invoke: Task tool with subagent_type='wasp-migration-helper' and model='haiku'
     → Multi-worktree coordination:
       * Check parallel branches for schema changes
       * Determine migration order (who goes first)
       * Document coordination in schema-coordination.md
     → Update schema.prisma:
       * Add/modify models, fields, enums
       * Follow Prisma naming conventions
     → Run migration:
       * wasp db migrate-dev --name "Description of change"
       * Verify migration succeeded
     → MANDATORY RESTART:
       * Stop wasp (Ctrl+C)
       * Run: ./scripts/safe-start.sh
       * Verify types regenerated (.wasp/ directory)
     → Type validation:
       * Import types in test file
       * Verify no "Property does not exist" errors
       * Document in implementation/type-check-[feature].md
     → Output: Schema updated, types regenerated

   IF NO:
     → Continue to implementation planning

3. 📋 PLAN PHASE (MANDATORY - Before Implementation)
   → Use Task tool with subagent_type='Plan' and model='haiku'
   → Read tests/test-plan.md for guidance
   → Create implementation strategy:
     * Plan operation structure (functions, helpers)
     * Design data flow (input → processing → output)
     * Determine Prisma query patterns (findMany, findUnique, where clauses)
     * Sequence implementation (auth first → validation → business logic)
     * Identify code reuse opportunities (existing helpers)
     * Plan file organization (operations.ts structure)
     * Map test scenarios to implementation (which operation handles which test)
     * Estimate implementation complexity per operation
   → Output: Implementation plan with code structure
   → **Why critical:** Implementation is mechanical after tests exist

4. ARCHITECTURE REVIEW (OPTIONAL)
   → Only if complex business logic identified in exploration
   → Invoke: Task tool with subagent_type='backend-architect' and model='sonnet'
   → Design implementation approach:
     * Choose algorithms (sorting, filtering, aggregation)
     * Select patterns (repository, service layer)
     * Consider performance (N+1 queries, pagination)
     * Plan transaction boundaries (if multi-step updates)
   → Output: Implementation specification
   → **When to use:** Complex calculations, multi-entity operations, performance concerns

5. CODE GENERATION
   → Invoke: Task tool with subagent_type='wasp-code-generator' and model='haiku'
   → Generate implementation from test expectations:
     * Operations (with type annotations)
     * Main.wasp declarations (query/action)
     * Helper functions (minimal, only if needed)
     * Error handling (401/403/404/400 from test scenarios)
     * Prisma queries (based on test assertions)
   → Follow Wasp patterns:
     * Import rules (wasp/, @prisma/client for enums)
     * Auth checks (context.user first)
     * Type annotations (GetTasks<Args, Return>)
     * Error handling (HttpError with status codes)
   → RESTART REMINDER:
     * If schema changed: Remind to restart wasp
     * If main.wasp changed: Remind to restart wasp
   → Output: Implementation code files

6. VALIDATION LOOP (ITERATE UNTIL GREEN)
   → Run tests: cd app && wasp test client run
   → Check results:

     IF ALL TESTS GREEN:
       ✅ Proceed to step 7 (coverage validation)

     IF TESTS RED:
       → Analyze failure pattern:
         * Logic error (wrong calculation, filter)
         * Type error (wrong type annotation)
         * Schema mismatch (field doesn't exist)
         * Import error (wrong import path)
         * Auth error (context.user check missing)
       → Categorize failure (diagnosis):
         * LOGIC: Fix business logic implementation
         * TYPE: Fix type annotations or schema
         * SCHEMA: Re-run migration or fix entity
         * IMPORT: Fix import paths (wasp/, @prisma/client)
         * AUTH: Add auth checks (401/403 handling)
       → Generate targeted fix (not blind retry)
       → Document in implementation/green-failures.md:
         * What failed (test name, error message)
         * Root cause (category + analysis)
         * Fix applied (code changes)
       → Re-run tests (max 3 iterations)
       → Output: Diagnostic log updated

       IF STILL RED AFTER 3 ATTEMPTS:
         ❌ Escalate to human:
         "Tests still failing after 3 attempts. Manual debugging required.
          See implementation/green-failures.md for diagnosis."

   → Output: All tests GREEN ✅

7. COVERAGE VALIDATION
   → Run tests with coverage: cd app && wasp test client run --coverage
   → Read tests/coverage-targets.json (expected coverage)
   → Compare actual vs expected:
     * Statements: actual ≥ expected?
     * Branches: actual ≥ expected?
     * Functions: actual ≥ expected?
     * Lines: actual ≥ expected?
   → Check delta:
     * If actual < expected - 10%: ❌ FAIL (implementation incomplete)
     * If actual > expected + 10%: ⚠️ WARNING (added untested code)
     * If within ±10%: ✅ PASS
   → Write implementation/coverage-actual.json:
     * Actual coverage metrics
     * Comparison with targets
     * Delta analysis
   → Output: Coverage validation result

8. WRITE ARTIFACTS TO implementation/ DIRECTORY
   → Create artifact directory: [dag-directory]/implementation/
   → Write implementation-notes.md:
     * Implementation approach (high-level decisions)
     * Code organization (which files, why)
     * Patterns used (helpers, filters, validators)
     * Known duplication (flagged for refactoring)
     * Complexity hotspots (functions to refactor later)
     * Performance considerations (N+1 queries, pagination)
     * Coverage gaps (areas to improve in future)
   → Write coverage-actual.json:
     * Actual coverage metrics (statements, branches, functions, lines)
     * Per-file coverage (if available)
     * Comparison with targets (from tests/coverage-targets.json)
   → Write green-failures.md (if failures occurred):
     * Iteration log (each attempt)
     * Failure diagnoses (categorized)
     * Fixes applied (code changes)
     * Lessons learned (patterns to avoid)
   → Write schema-coordination.md (if schema changed):
     * Schema changes made (models, fields, enums)
     * Migration sequence (order in multi-worktree)
     * Parallel branches (conflicts avoided)
     * Type regeneration (verification steps)
   → Output: Artifacts written to implementation/ subdirectory

9. GIT COMMIT
   → Stage implementation files:
     * git add app/src/**/*.ts (operations, helpers)
     * git add app/main.wasp (query/action declarations)
     * git add app/schema.prisma (if changed)
     * git add app/migrations/*.sql (if schema changed)
   → Verify tests still pass: cd app && wasp test client run
   → Commit with message:
     * If schema changed: "feat: Add [feature] with schema migration"
     * If no schema change: "feat: Implement [feature]"
   → Output: Implementation committed

10. SUMMARY & NEXT STEPS
    → Display summary:
      ✅ Tests: X/X GREEN
      ✅ Coverage: Y% (target: Z%)
      ✅ Implementation committed: [commit hash]
      ✅ Artifacts: [dag-directory]/implementation/
      ✅ Schema changes: [yes/no]
    → Next step: Run /refactor-tdd "[feature-name]" to improve code quality
```

## Prerequisites

Before running `/green-tdd`:

1. ✅ **Tests exist and committed** (git log shows "test: Add [feature]")
2. ✅ **Tests are RED** (wasp test client run fails)
3. ✅ **Test plan exists** (tests/test-plan.md from /red-tdd)
4. ✅ **Coverage targets exist** (tests/coverage-targets.json from /red-tdd)
5. ✅ **5 TDD criteria PASS** (verified by /red-tdd audit)

## Exit Criteria

This command completes successfully when:

1. ✅ All tests GREEN
2. ✅ No test files modified (tests remain immutable)
3. ✅ Coverage ≥ targets (from tests/coverage-targets.json)
4. ✅ Implementation committed to git
5. ✅ Artifacts written to implementation/ directory

## Artifacts Created

After successful completion, you'll find:

```
tasks/sprints/sprint-3/day-02/implementation/
├── implementation-notes.md     # Implementation decisions
├── coverage-actual.json        # Actual coverage achieved
├── green-failures.md           # Failure diagnosis (if failures occurred)
└── schema-coordination.md      # Multi-worktree notes (if schema changed)

app/src/**/*.ts                 # Implementation files (committed)
app/main.wasp                   # Query/action declarations (committed)
app/schema.prisma               # Schema changes (if needed, committed)
app/migrations/*.sql            # Migration files (if schema changed, committed)
```

## Agent Assignment

| Step | Task                    | Model  | Agent                  | Reason                    |
| ---- | ----------------------- | ------ | ---------------------- | ------------------------- |
| 1    | Schema exploration      | Haiku  | **Explore** (built-in) | Analyze migration impact  |
| 2    | Schema migration        | Haiku  | wasp-migration-helper  | Mechanical workflow       |
| 3    | Implementation planning | Haiku  | **Plan** (built-in)    | Structure code approach   |
| 4    | Architecture decisions  | Sonnet | backend-architect      | Complex design (optional) |
| 5    | Code generation         | Haiku  | wasp-code-generator    | Pattern-based generation  |

## New Capabilities for Large Features

**vs Unified /tdd-feature:**

1. **Incremental Implementation** - Implement operation by operation

   - Sequence operations (simplest first)
   - Commit after each operation passes tests
   - Enable progressive debugging

2. **Failure Diagnosis** - Intelligent retry with root cause analysis

   - Categorize failures (logic, type, schema, import, auth)
   - Generate targeted fixes (not blind retry)
   - Document in green-failures.md for learning

3. **Schema Coordination** - Better multi-worktree coordination

   - Check parallel branches for schema changes
   - Determine migration order (who goes first)
   - Document in schema-coordination.md

4. **Type Validation** - Verify types regenerate correctly

   - Check .wasp/ directory for expected types
   - Import types in test file (catch missing types early)
   - Document validation in type-check-[feature].md

5. **Coverage Validation** - Compare actual vs expected coverage
   - Read targets from tests/coverage-targets.json
   - Calculate delta (actual vs expected)
   - Warn if implementation adds untested code

## Cross-Phase Integration

**Reads artifacts from /red-tdd:**

- ✅ **tests/test-plan.md** → Implementation guidance (test scenarios, patterns)
- ✅ **tests/coverage-targets.json** → Coverage validation (expected metrics)
- ✅ **Committed tests** → Prerequisites validation (tests must exist)

**Creates artifacts for /refactor-tdd:**

- ✅ **implementation-notes.md** → Refactoring guidance (known duplication, hotspots)
- ✅ **coverage-actual.json** → Coverage baseline (before refactoring)
- ✅ **Committed implementation** → Refactoring prerequisite (code must exist)

## Example Execution

**Command:**

```bash
cd tasks/sprints/sprint-3/day-02/
/green-tdd "priority-filtering"
```

**Output:**

```
📁 Directory Detection...
   ✓ Sprintdag directory: tasks/sprints/sprint-3/day-02/
   ✓ tests/ directory exists (from /red-tdd)
   ✓ Reading: tests/test-plan.md
   ✓ Reading: tests/coverage-targets.json (80%/75%)
   ✓ Creating implementation/ subdirectory

✅ Prerequisites Validation...
   ✓ Git log: test: Add priority filtering tests (a1b2c3d)
   ✓ Tests status: RED (7 failing)
   ✓ Test plan: tests/test-plan.md exists
   ✓ Coverage targets: 80% statements, 75% branches

🔍 EXPLORE: Analyzing schema impact...
   Model: Haiku (Explore agent)
   ✓ Current schema: Task model (schema.prisma:45)
   ✓ Priority enum: NOT exists (needs creation)
   ✓ Related migrations: 003_add_status_to_task.sql
   ✓ Parallel branches: develop (no schema conflicts)
   Schema changes: REQUIRED (add Priority enum + Task.priority field)

🗄️ SCHEMA MIGRATION: Updating schema...
   Model: Haiku (wasp-migration-helper)
   ✓ Added: enum Priority { LOW, MEDIUM, HIGH }
   ✓ Added: Task.priority Priority @default(MEDIUM)
   ✓ Migration: wasp db migrate-dev --name "Add priority to Task"
   ✓ Restart: ./scripts/safe-start.sh
   ✓ Types: Regenerated (.wasp/out/sdk/wasp/entities/Task.ts)
   ✓ Validation: Priority enum imported successfully

📋 PLAN: Creating implementation strategy...
   Model: Haiku (Plan agent)
   Reading: tests/test-plan.md
   Implementation sequence:
   1. Update getTasks operation (add priority filter)
   2. Update createTask operation (add priority field)
   3. Update updateTask operation (allow priority change)
   Pattern: Integration (Prisma queries)
   Reuse: buildTaskFilter() helper (from status filtering)

💻 CODE GENERATION: Implementing operations...
   Model: Haiku (wasp-code-generator)
   ✓ Updated: app/src/server/a3/operations.ts
     - getTasks: Added priority filtering (Prisma where clause)
     - createTask: Added priority field validation
     - updateTask: Added priority update logic
   ✓ Correct imports: Priority from @prisma/client
   ✓ Auth checks: context.user validation present
   ✓ Error handling: 401/403/400/404 from test scenarios

🔄 VALIDATION LOOP: Running tests...
   Attempt 1:
   ✓ cd app && wasp test client run
   ✓ Result: 7/7 tests GREEN ✅

📊 COVERAGE VALIDATION: Checking coverage...
   ✓ cd app && wasp test client run --coverage
   Actual coverage:
   - Statements: 82% (target: 80%) ✅
   - Branches: 76% (target: 75%) ✅
   - Functions: 85% (target: 80%) ✅
   - Lines: 82% (target: 80%) ✅
   Delta: Within ±10% (PASS)

📝 ARTIFACTS: Writing to implementation/ directory...
   ✓ implementation/implementation-notes.md (decisions documented)
   ✓ implementation/coverage-actual.json (82%/76%/85%/82%)
   ✓ implementation/schema-coordination.md (Priority enum added)

📝 GIT COMMIT: Committing implementation...
   ✓ Staged: app/src/server/a3/operations.ts
   ✓ Staged: app/schema.prisma
   ✓ Staged: app/migrations/004_add_priority_to_task.sql
   ✓ Tests still GREEN: 7/7 passing
   ✓ Committed: feat: Add priority field and filtering to tasks
   ✓ Commit hash: b2c3d4e

🎉 GREEN PHASE COMPLETE!

   Summary:
   ✅ Tests: 7/7 GREEN
   ✅ Coverage: 82% statements, 76% branches (targets: 80%/75%)
   ✅ Implementation committed: b2c3d4e
   ✅ Artifacts: tasks/sprints/sprint-3/day-02/implementation/
   ✅ Schema changes: Yes (Priority enum + Task.priority field)

   Next step:
   → Run: /refactor-tdd "priority-filtering"
```

## Error Handling

**If prerequisites fail:**

```
❌ Prerequisites FAILED

   Missing:
   - tests/test-plan.md not found
   - No "test:" commit in git log

   Action: Run /red-tdd first to create tests
```

**If tests are already GREEN:**

```
❌ Tests already GREEN

   All 7 tests passing. Implementation already exists?

   Action:
   - If implementation incomplete: Check which tests should fail
   - If implementation complete: Skip to /refactor-tdd
```

**If coverage validation fails:**

```
❌ Coverage below targets

   Expected: 80% statements, 75% branches
   Actual: 65% statements, 60% branches
   Delta: -15% statements, -15% branches

   Issue: Implementation incomplete (some test scenarios not covered)

   Action:
   - Review tests/test-plan.md for missing scenarios
   - Add missing implementation
   - Re-run tests with coverage
```

**If validation loop fails after 3 attempts:**

```
❌ Tests still RED after 3 attempts

   Last failure: TypeError: Cannot read property 'priority' of undefined
   Category: LOGIC (accessing undefined property)

   Diagnosis saved: implementation/green-failures.md

   Action: Manual debugging required
   - Review failure diagnosis in green-failures.md
   - Check implementation logic in operations.ts
   - Verify Prisma query returns expected data
```

**If schema conflicts detected:**

```
❌ Schema conflict with parallel branch

   Conflict: develop branch also adds Priority enum

   Migration order:
   1. Pull develop schema changes
   2. Merge schema.prisma
   3. Run migration in your branch
   4. Coordinate with team

   Action saved: implementation/schema-coordination.md
```

## When to Use This Command

✅ **Use /green-tdd for:**

- After /red-tdd completion (tests exist and committed)
- Large features (>5 operations, >500 LOC)
- Features requiring schema changes
- Features with complex implementation
- Multi-worktree features (schema coordination needed)

❌ **Use /tdd-feature instead for:**

- Small features (unified workflow sufficient)
- No tests exist yet (use /tdd-feature to do RED+GREEN together)

## Integration with Other Commands

**Preceded by:**

- `/red-tdd "[feature]"` - Write tests (prerequisite)

**Followed by:**

- `/refactor-tdd "[feature-name]"` - Improve code quality
- `/security-tdd "[feature-name]"` - Security audit

**Reads artifacts from:**

- `tests/test-plan.md` (from /red-tdd) - Implementation guidance
- `tests/coverage-targets.json` (from /red-tdd) - Coverage validation

**Creates artifacts for:**

- `/refactor-tdd` - implementation-notes.md (refactoring guidance)
- `/security-tdd` - implementation-notes.md (security context)

## References

- **Agents:** wasp-code-generator, wasp-migration-helper, backend-architect
- **Skills:** /wasp-operations (operation patterns), /wasp-database (migration workflow)
- **Docs:** docs/TDD-WORKFLOW.md, app/CLAUDE.md (schema migration)
- **Templates:** .claude/templates/operations-patterns.ts
- **Marketplace:** backend-development (Sonnet architect)
