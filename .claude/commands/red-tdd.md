---
description: RED phase - Write comprehensive, high-quality tests with automatic artifact storage in sprintdag directory. For large features requiring extensive test planning.
---

# RED Phase: Test Specification & Generation

Write comprehensive, high-quality tests (immutable RED phase) with automatic artifact storage in your sprintdag directory structure.

## Usage

```bash
# From sprintdag directory
cd tasks/sprints/sprint-3/day-02/
/red-tdd "Add priority filtering to tasks"

# From project root (will ask for confirmation)
/red-tdd "Add priority filtering to tasks"

# With document reference
/red-tdd tasks/sprints/sprint-3/day-02/README.md
```

## Directory Detection & Artifact Storage

This command automatically detects your sprintdag directory and organizes artifacts:

```
📁 Current Directory Detection:
   → Check path for: tasks/sprints/sprint-X/day-Y/
   → If found: Use as artifact root
   → If not found: Fallback to project root + ask confirmation

📁 Artifact Structure Created:
   tasks/sprints/sprint-3/day-02/
   ├── README.md (feature doelstelling - must exist!)
   └── tests/                          # Created by /red-tdd
       ├── test-plan.md                # Test strategy document
       ├── test-suite-map.md           # Test unit boundaries
       ├── coverage-targets.json       # Expected coverage metrics
       └── test-strategy-*.md          # Component-specific strategies
```

**Benefits:**

- ✅ All test artifacts stay with sprintdag context
- ✅ No cleanup needed (archived with sprint)
- ✅ Traceable: Review test decisions from specific day
- ✅ Cross-phase: /green-tdd reads from tests/ directory

## Workflow

```
┌─────────────────────────────────────────────────────────┐
│ PHASE 1: RED - Write Failing Tests                     │
└─────────────────────────────────────────────────────────┘

0. 🆕 DIRECTORY DETECTION & VALIDATION
   → Detect current directory path
   → Check if in sprintdag directory (tasks/sprints/sprint-X/day-Y/)
   → Validate README.md exists (feature doelstelling)
   → Create tests/ subdirectory if not exists
   → Store artifact root path for later use

0.5. 🆕 START WATCH MODE (MANDATORY)
   → Launch watch mode: ./scripts/test-watch.sh
   → Keep terminal open throughout RED phase
   → Real-time feedback catches infrastructure issues
   → Output: "Waiting for file changes..."

1. 🔍 EXPLORE PHASE (MANDATORY - Before Analysis)
   → Use Task tool with subagent_type='Explore' and thoroughness='very thorough'
   → Gather comprehensive feature context:
     * Find similar features/operations (Grep for related patterns)
     * Analyze relevant entities (Read schema.prisma for related models)
     * Review related test files (Glob for similar tests)
     * Check permission patterns needed (Read permission helpers)
     * Examine error handling requirements (Read error-handling patterns)
     * Verify import rules (Read CLAUDE.md import section)
     * Analyze component types (Dialog, Sheet → 3-layer strategy)
   → Output: Feature context document with patterns, constraints, examples
   → **Why critical:** Prevents implementing features that ignore existing patterns

2. 📋 PLAN PHASE (MANDATORY - Before Test Generation)
   → Use Task tool with subagent_type='Plan' and model='sonnet'
   → Create comprehensive test generation strategy:
     * Plan test scenarios (auth, validation, edge cases, success)
     * Design mock strategy (which entities to mock vs real DB)
     * **CRITICAL:** Use `vi.mock()` ONLY (NEVER suggest MSW installation - breaks project consistency)
     * Determine test pattern (unit vs integration)
     * Assess component type (standard vs portal components)
     * Sequence test cases (order matters for readability)
     * Define assertion strategy (specific, not generic)
     * Plan test data setup (fixtures vs inline vs factories)
     * Identify test helper opportunities (reusable mocks, setups)
     * Estimate coverage targets (≥80% statements, ≥75% branches)
   → Output: Test generation plan with scenarios and patterns
   → **Why critical:** Ensures comprehensive test coverage before writing code

3. ARCHITECTURE ANALYSIS
   → Invoke: Task tool with subagent_type='backend-architect' and model='sonnet'
   → Review exploration findings and test plan
   → Analyze requirements
   → Design API/component structure
   → Identify all test scenarios (auth, validation, edge cases, success)
   → Specify test pattern (unit vs integration)
   → Determine component testing strategy:
     * Standard components: userEvent + waitFor pattern
     * Portal components (Dialog, Sheet): 3-layer test strategy
   → Output: Detailed test specification

4. TEST GENERATION
   → Invoke: Task tool with subagent_type='wasp-test-automator' and model='haiku'
   → Generate complete test files from specification
   → Follow test pattern guidance (unit vs integration)
   → Apply component-specific strategies (3-layer for portals)
   → Include behavior verification (not just side effects)
   → Apply Wasp import rules (wasp/, @prisma/client)
   → Self-validation:
     * Auto-fix path aliases (s/lib/utils → ../../lib/utils)
     * Hoist enum imports (@prisma/client for runtime values)
     * Verify all imports resolve
   → Watch terminal auto-runs tests on save
   → Output: Test files in app/src/**/*.test.ts

5. VERIFY EXECUTION IN WATCH MODE
   → Check watch terminal output
   → Expected: Tests EXECUTE (no timeouts)
   → Expected: Tests FAIL with clear error (e.g., "Cannot find module")
   → NOT expected: "Test timed out in 5000ms"
   → If timeouts → Fix infrastructure → Watch reruns
   → Output: Confirmation tests execute properly

6. TEST QUALITY AUDIT
   → Invoke: Task tool with subagent_type='test-quality-auditor' and model='sonnet'
   → Pre-audit: Verify no timeouts, no import errors
   → Run tests, analyze failure reasons
   → Check for test theater patterns (side effects vs behavior)
   → Verify mocks actually used (if present)
   → Match test pattern to implementation (unit vs integration)
   → Validate 5 TDD criteria with code analysis:
     1. Tests business logic (NOT existence checks)
     2. Meaningful assertions (NOT just .toBeDefined())
     3. Tests error paths (401, 403, 404, 400)
     4. Tests edge cases (empty, null, boundaries)
     5. Tests behavior (NOT implementation details)
   → Output: Pass/Fail + detailed issues

   IF audit FAILS:
     → Return to step 2 (PLAN) with issues
     → Revise test specification
     → Regenerate tests (step 4)
     → Re-audit (step 6)

7. RUN TESTS & VERIFY FAILURES
   → Execute: cd app && wasp test client run
   → Verify ALL tests FAIL for correct reason:
     ✅ "Cannot find module" (operation doesn't exist yet)
     ✅ "Property 'X' does not exist" (entity field missing)
     ❌ "Test timed out" (infrastructure issue - FIX!)
     ❌ "Cannot find module 'wasp/...'" (import error - FIX!)
   → Output: All tests RED (as expected)

8. WRITE ARTIFACTS TO tests/ DIRECTORY
   → Create artifact directory: [dag-directory]/tests/
   → Write test-plan.md:
     * Test scenarios (all cases identified)
     * Mock strategy (what to mock, why)
     * Test pattern (unit vs integration justification)
     * Assertion strategy (what to verify)
     * Test data approach (fixtures/inline/factories)
     * Coverage targets (specific percentages)
   → Write test-suite-map.md (if multi-file):
     * Test file organization
     * Test unit boundaries (what each file tests)
     * Test dependencies (which tests depend on which schema state)
   → Write coverage-targets.json:
     * Expected coverage metrics (statements, branches, functions, lines)
     * Per-file targets (if different from global)
   → Write test-strategy-[component].md (if component tests):
     * Component type (standard vs portal)
     * Testing strategy (userEvent pattern vs 3-layer)
     * Special considerations (polyfills, async waits)
   → Output: Artifacts written to tests/ subdirectory

9. GIT COMMIT (IMMUTABLE)
   → Stage test files only: git add app/src/**/*.test.ts
   → Commit with message: "test: Add [feature] tests (RED)"
   → Output: Tests committed (now immutable)

10. SUMMARY & NEXT STEPS
    → Display summary:
      ✅ Tests written: X test files, Y test cases
      ✅ Test quality: 5 TDD criteria PASS
      ✅ Tests committed: [commit hash]
      ✅ Artifacts: [dag-directory]/tests/
      ✅ Coverage targets: [percentage]
    → Next step: Run /green-tdd "[feature-name]" to implement
```

## Prerequisites

Before running `/red-tdd`:

1. ✅ **Sprintdag directory exists** (tasks/sprints/sprint-X/day-Y/)
2. ✅ **README.md exists** with feature doelstelling
3. ✅ **Watch mode available** (./scripts/test-watch.sh works)
4. ✅ **No uncommitted test changes** (git status clean for tests/)

## Exit Criteria

This command completes successfully when:

1. ✅ Tests execute without syntax errors
2. ✅ All tests FAIL for correct reason (not timeout/import errors)
3. ✅ 5 TDD criteria PASS (verified by test-quality-auditor)
4. ✅ Tests committed to git (immutable)
5. ✅ Artifacts written to tests/ directory

## Artifacts Created

After successful completion, you'll find:

```
tasks/sprints/sprint-3/day-02/tests/
├── test-plan.md              # Test strategy document
├── test-suite-map.md         # Test organization (if multi-file)
├── coverage-targets.json     # Expected coverage
└── test-strategy-*.md        # Component-specific strategies

app/src/**/*.test.ts          # Committed test files (immutable)
```

## Agent Assignment

| Step | Task                  | Model  | Agent                  | Reason                        |
| ---- | --------------------- | ------ | ---------------------- | ----------------------------- |
| 1    | Context exploration   | Haiku  | **Explore** (built-in) | Fast codebase search          |
| 2    | Test planning         | Sonnet | **Plan** (built-in)    | Strategic test design         |
| 3    | Requirements analysis | Sonnet | backend-architect      | Complex reasoning             |
| 4    | Test generation       | Haiku  | wasp-test-automator    | Pattern-based generation      |
| 6    | Test quality audit    | Opus   | test-quality-auditor   | Critical quality verification |

## New Capabilities for Large Features

**vs Unified /tdd-feature:**

1. **Test Decomposition** - Split large features into testable units

   - Analyze feature boundaries
   - Create test-suite-map.md with unit organization
   - Enable parallel test writing (multiple /red-tdd sessions)

2. **Test Helper Extraction** - Build reusable test utilities

   - Identify duplication patterns in mocks/fixtures
   - Extract to app/src/test/helpers/\*.ts
   - Document in test-plan.md

3. **Component Type Assessment** - Earlier portal detection

   - Analyze component imports (Dialog, Sheet, AlertDialog)
   - Choose 3-layer vs standard strategy
   - Document in test-strategy-[component].md

4. **Test Data Factory** - Generate realistic test data

   - Plan fixture strategy (inline vs factory)
   - Generate factories in app/src/test/factories/\*.ts
   - Reuse across test files

5. **Artifact Persistence** - State preserved for /green-tdd
   - Test plan available for implementation phase
   - Coverage targets tracked across phases
   - Decisions documented and traceable

## Cross-Phase Integration

**This command prepares for /green-tdd:**

- ✅ **test-plan.md** → /green-tdd reads test scenarios for implementation guidance
- ✅ **coverage-targets.json** → /green-tdd validates actual coverage meets targets
- ✅ **test-suite-map.md** → /green-tdd knows which units to implement
- ✅ **Committed tests** → /green-tdd prerequisite validation (tests must exist & be committed)

## Example Execution

**Command:**

```bash
cd tasks/sprints/sprint-3/day-02/
/red-tdd "Add priority filtering to tasks"
```

**Output:**

```
📁 Directory Detection...
   ✓ Sprintdag directory: tasks/sprints/sprint-3/day-02/
   ✓ README.md exists: "Implement priority filtering"
   ✓ Creating tests/ subdirectory

🔍 Starting watch mode...
   ✓ ./scripts/test-watch.sh running
   ✓ "Waiting for file changes..."

🔍 EXPLORE: Gathering feature context...
   Model: Haiku (Explore agent)
   ✓ Found similar feature: status filtering (src/server/a3/operations.ts:123)
   ✓ Relevant entities: Task, Priority enum (schema.prisma:45)
   ✓ Permission pattern: requireDepartmentAccess (src/permissions/helpers.ts:12)
   ✓ Test examples: src/server/a3/operations.test.ts

📋 PLAN: Creating test strategy...
   Model: Sonnet (Plan agent)
   Test scenarios identified:
   ✓ Auth: 401 not authenticated
   ✓ Auth: 403 no department access
   ✓ Validation: 400 invalid priority enum
   ✓ Success: Filter by single priority
   ✓ Success: Filter by multiple priorities
   ✓ Edge: No tasks matching filter
   ✓ Edge: Null/undefined priority
   Mock strategy: Integration tests (real DB)
   Coverage target: ≥80% statements, ≥75% branches

🎯 ARCHITECTURE: Analyzing requirements...
   Model: Sonnet (backend-architect)
   ✓ API structure: getTasks(filters: { priority?: Priority[] })
   ✓ Test pattern: Integration (Prisma queries)
   ✓ Test specification: 7 test cases

⚡ TEST GENERATION: Creating test files...
   Model: Haiku (wasp-test-automator)
   ✓ Created: app/src/server/a3/operations.test.ts
   ✓ Self-validation: All imports correct
   ✓ Watch mode: Tests executed (342ms)

🔍 QUALITY AUDIT: Verifying test quality...
   Model: Sonnet (test-quality-auditor)
   Pre-audit:
   ✓ No timeouts (all <1000ms)
   ✓ No import errors
   Test quality:
   ✓ Criterion 1: Tests business logic (filter behavior)
   ✓ Criterion 2: Meaningful assertions (expect exact matches)
   ✓ Criterion 3: Error paths tested (401, 403, 400)
   ✓ Criterion 4: Edge cases covered (empty, null)
   ✓ Criterion 5: Tests behavior (observable results)
   Audit: PASS ✅

✅ TESTS VERIFIED: All RED for correct reasons
   7/7 tests FAIL: "Cannot find module 'operations'" (expected)

📝 ARTIFACTS: Writing to tests/ directory...
   ✓ tests/test-plan.md (test strategy)
   ✓ tests/coverage-targets.json (80%/75% targets)

📝 GIT COMMIT: Committing tests...
   ✓ Staged: app/src/server/a3/operations.test.ts
   ✓ Committed: test: Add priority filtering tests (RED)
   ✓ Commit hash: a1b2c3d

🎉 RED PHASE COMPLETE!

   Summary:
   ✅ Tests written: 1 file, 7 test cases
   ✅ Test quality: 5 TDD criteria PASS
   ✅ Tests committed: a1b2c3d
   ✅ Artifacts: tasks/sprints/sprint-3/day-02/tests/
   ✅ Coverage targets: 80% statements, 75% branches

   Next step:
   → Run: /green-tdd "priority-filtering"
```

## Error Handling

**If directory detection fails:**

```
❌ Not in sprintdag directory
   Current: /Users/user/Projects/lean-ai-coach-Dev3/
   Expected: tasks/sprints/sprint-X/day-Y/

   Options:
   1. cd to sprintdag directory and retry
   2. Continue with project root (will ask confirmation)
```

**If README.md missing:**

```
❌ Feature doelstelling not found
   Expected: README.md in current directory

   Action: Create README.md with feature description
```

**If test quality audit fails:**

```
❌ Test quality audit FAILED

   Issues found:
   - Test theater: Tests check side effects, not behavior
   - Missing auth: No 401/403 tests
   - Generic assertions: Using .toBeDefined()
   - No edge cases: Missing empty/null tests

   Action:
   → Returning to PLAN phase with issues
   → Will revise test specification
   → Will regenerate tests
```

**If watch mode has timeouts:**

```
❌ Tests timing out in watch mode

   Diagnosis:
   - Portal component without 3-layer strategy?
   - Missing await for async operations?
   - Polyfills not loaded?

   Action:
   → Fix infrastructure issues
   → Regenerate tests with correct strategy
   → Watch mode will auto-rerun
```

## When to Use This Command

✅ **Use /red-tdd for:**

- Large features (>5 operations, >500 LOC)
- Complex features (multi-entity, complex business logic)
- Features requiring extensive test planning
- Features split across multiple test files
- Features with portal components (Dialog, Sheet)
- Multi-worktree features (parallel test writing)

❌ **Use /tdd-feature instead for:**

- Small features (<5 operations, <500 LOC)
- Simple CRUD operations
- Features with straightforward test scenarios
- Quick prototyping (want speed, not rigor)

## Integration with Other Commands

**Followed by:**

- `/green-tdd "[feature-name]"` - Implement code to pass tests
- `/refactor-tdd "[feature-name]"` - Improve code quality
- `/security-tdd "[feature-name]"` - Security audit

**Reads artifacts from:**

- `README.md` (current directory) - Feature doelstelling

**Creates artifacts for:**

- `/green-tdd` - test-plan.md, coverage-targets.json
- `/refactor-tdd` - coverage-targets.json (baseline)
- `/security-tdd` - test-plan.md (expected security scenarios)

## References

- **Agents:** wasp-test-automator, test-quality-auditor, backend-architect
- **Skills:** /tdd-workflow (5 TDD criteria), /wasp-operations (test patterns)
- **Docs:** docs/TDD-WORKFLOW.md, docs/TDD-TEST-QUALITY-ANALYSIS.md
- **Templates:** .claude/templates/test.template.ts
- **Marketplace:** backend-development (Sonnet architect)
