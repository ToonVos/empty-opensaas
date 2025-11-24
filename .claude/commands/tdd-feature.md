---
description: Complete TDD workflow orchestrator - RED (Sonnet) → GREEN (Haiku) → REFACTOR (Haiku) → REVIEW (Opus). Use with feature description or document path.
---

# TDD Feature Development Orchestrator

Execute complete Test-Driven Development workflow using hybrid Sonnet + Haiku orchestration for optimal cost/performance.

## Usage

```bash
# With feature description
/tdd-feature "User can filter reports by department"

# With document reference
/tdd-feature tasks/sprint-1/user-stories/a3-filtering.md

# With inline requirements
/tdd-feature "As a manager, I want to view only my department's reports, so I can track my team's progress"
```

## Workflow Orchestration

This command orchestrates 4 phases with strategic model usage:

```
┌─────────────────────────────────────────────────────────┐
│ PHASE 1: RED - Write Failing Tests (Sonnet + Haiku)    │
└─────────────────────────────────────────────────────────┘

0. 🆕 START WATCH MODE (MANDATORY)
   → Launch watch mode: ./scripts/test-watch.sh
   → Keep terminal open throughout RED phase
   → Real-time feedback catches infrastructure issues
   → Output: "Waiting for file changes..."

0.5. 🔍 EXPLORE PHASE (MANDATORY - Before Analysis)
   → Use Task tool with subagent_type='Explore' and thoroughness='very thorough'
   → Gather feature context from codebase:
     * Find similar features/operations (Grep for related patterns)
     * Analyze relevant entities (Read schema.prisma for related models)
     * Review related test files (Glob for similar tests)
     * Check permission patterns needed (Read permission helpers)
     * Examine error handling requirements (Read error-handling patterns)
     * Verify import rules (Read CLAUDE.md import section)
   → Output: Feature context document with patterns, constraints, examples
   → **Why critical:** Prevents implementing features that ignore existing patterns

1. 📋 PLAN PHASE (MANDATORY - Before Test Generation)
   → Use Task tool with subagent_type='Plan' and model='sonnet'
   → Create test generation strategy based on exploration:
     * Plan test scenarios (auth, validation, edge cases, success)
     * Design mock strategy (which entities to mock)
     * **CRITICAL:** Use `vi.mock()` ONLY (NEVER suggest MSW installation - breaks project consistency)
     * Determine test pattern (unit vs integration)
     * Sequence test cases (order matters for readability)
     * Define assertion strategy (what to verify)
     * Plan test data setup (fixtures, factories)
   → Output: Test generation plan with scenarios and patterns
   → **Why critical:** Ensures comprehensive test coverage before writing code

2. Sonnet: backend-architect
   → Review exploration findings and test plan
   → Analyze requirements
   → Design API/component structure
   → Identify test scenarios (auth, validation, edge cases)
   → Specify test pattern (unit vs integration)
   → Output: Detailed test specification

2. Haiku: wasp-test-automator
   → Generate complete test files from specification
   → Follow test pattern guidance
   → Include behavior verification (not just side effects)
   → Apply Wasp import rules
   → Watch terminal auto-runs tests on save
   → Output: Test files

2.5 🆕 VERIFY EXECUTION IN WATCH MODE
   → Check watch terminal output
   → Expected: Tests EXECUTE (no timeouts)
   → Expected: Tests FAIL with clear error (e.g., "Cannot find module")
   → NOT expected: "Test timed out in 5000ms"
   → If timeouts → Fix infrastructure → Watch reruns
   → Output: Confirmation tests execute properly

3. 🆕 Opus: test-quality-auditor
   → Pre-audit: Verify no timeouts, no import errors
   → Run tests, analyze failure reasons
   → Check for test theater patterns (side effects vs behavior)
   → Verify mocks actually used (if present)
   → Match test pattern to implementation
   → Validate 5 TDD criteria with code analysis
   → Output: Pass/Fail + detailed issues

   IF audit FAILS:
     → Return to step 1 with issues
     → Revise test specification
     → Regenerate tests

4. Run tests → Verify FAIL for right reason
5. Git commit: "test: Add [feature] tests"

┌─────────────────────────────────────────────────────────┐
│ PHASE 2: GREEN - Implement Feature (Sonnet + Haiku)    │
└─────────────────────────────────────────────────────────┘

6. 🔍 EXPLORE PHASE (MANDATORY - Before Schema Decisions)
   → Use Task tool with subagent_type='Explore' and thoroughness='medium'
   → Analyze schema impact:
     * Check current schema state (Read schema.prisma)
     * Find related migrations (Glob for migration files)
     * Review entity relationships (Analyze schema graph)
     * Verify migration history (Bash: check migration order)
     * Identify schema conflicts (Grep for entity usage)
   → Output: Schema analysis with change recommendations
   → **Why critical:** Prevents schema conflicts and migration issues

7. Check if schema changes needed:
   Yes → Haiku: wasp-migration-helper
         → Update schema.prisma
         → Run migration
         → Restart wasp
   No  → Continue

8. 📋 PLAN PHASE (MANDATORY - Before Implementation)
   → Use Task tool with subagent_type='Plan' and model='haiku'
   → Create implementation strategy:
     * Plan operation structure (functions, helpers)
     * Design data flow (input → processing → output)
     * Determine Prisma query patterns (findMany, findUnique, etc.)
     * Sequence implementation (start with auth, then logic)
     * Identify code reuse opportunities (existing helpers)
     * Plan file organization (operations.ts structure)
   → Output: Implementation plan with code structure
   → **Why critical:** Implementation is mechanical after tests exist

9. Sonnet: backend-architect (OPTIONAL - if complex business logic)
   → Design implementation approach
   → Choose patterns/algorithms
   → Output: Implementation specification

10. Haiku: wasp-code-generator
   → Generate operations/components from spec and plan
   → Follow Wasp patterns
   → Minimal code to pass tests
   → Output: Implementation code

11. Run tests → Verify GREEN
12. Git commit: "feat: Implement [feature]"

┌─────────────────────────────────────────────────────────┐
│ PHASE 3: REFACTOR - Improve Code (Sonnet + Haiku)      │
└─────────────────────────────────────────────────────────┘

13. 🔍 EXPLORE PHASE (MANDATORY - Before Code Review)
   → Use Task tool with subagent_type='Explore' and thoroughness='medium'
   → Analyze refactoring opportunities:
     * Find duplicated code patterns (Grep for similar logic)
     * Review helper functions in codebase (Glob for utils/)
     * Analyze naming conventions (Read existing code style)
     * Check for extract opportunities (Read DRY violations)
     * Verify test coverage of refactor targets (Run coverage report)
   → Output: Refactoring opportunities list
   → **Why critical:** Identifies safe refactorings with existing test coverage

14. Sonnet: code-reviewer
    → Review exploration findings
    → Identify code smells
    → Suggest refactorings (DRY, extract, rename)
    → Output: Refactoring tasks

15. 📋 PLAN PHASE (MANDATORY - Before Refactoring Execution)
   → Use Task tool with subagent_type='Plan' and model='haiku'
   → Create refactoring strategy:
     * Prioritize refactorings (impact vs effort)
     * Sequence refactoring steps (one at a time, test after each)
     * Plan helper extraction (where to put, how to name)
     * Design constant consolidation (error messages, configs)
     * Identify safe refactorings (guaranteed test pass)
     * Estimate LOC reduction per refactoring
   → Output: Refactoring execution plan
   → **Why critical:** Ensures tests stay green during each refactoring step

16. Haiku: wasp-refactor-executor
    → Execute refactorings according to plan
    → Extract duplicated code
    → Improve naming
    → Consolidate patterns

17. Run tests → Verify STILL GREEN
18. Git commit: "refactor: Simplify [feature] implementation"

┌─────────────────────────────────────────────────────────┐
│ PHASE 4: REVIEW - Security & Quality (Opus)            │
└─────────────────────────────────────────────────────────┘

19. 🔍 EXPLORE PHASE (MANDATORY - Before Security Audit)
   → Use Task tool with subagent_type='Explore' and thoroughness='very thorough'
   → Gather security context:
     * Find authentication patterns used (Grep for auth checks)
     * Analyze permission checking (Read permission helpers)
     * Review input validation (Grep for validation patterns)
     * Check multi-tenant isolation (Read department filters)
     * Verify secrets handling (Grep for .env usage)
     * Examine SQL injection risks (Review Prisma queries)
   → Output: Security context document with patterns and risks
   → **Why critical:** Provides comprehensive security baseline for audit

20. Opus: security-auditor (from marketplace)
    → Review exploration security context
    → OWASP compliance check
    → Auth/permission verification
    → Input validation review
    → Output: Security report

21. Fix any critical issues found
22. Final test run → All GREEN
23. Ready for PR!
```

## Agent Assignment Strategy

| Phase    | Step | Task                        | Model  | Agent                  | Reason                        |
| -------- | ---- | --------------------------- | ------ | ---------------------- | ----------------------------- |
| RED      | 0.5  | **Context exploration**     | Haiku  | **Explore** (built-in) | Fast codebase search          |
| RED      | 1    | **Test planning**           | Sonnet | **Plan** (built-in)    | Strategic test design         |
| RED      | 2    | Requirements analysis       | Sonnet | backend-architect      | Complex reasoning             |
| RED      | 2    | Test generation             | Haiku  | wasp-test-automator    | Pattern-based                 |
| RED      | 3    | Test quality audit          | Opus   | test-quality-auditor   | Critical quality verification |
| GREEN    | 6    | **Schema exploration**      | Haiku  | **Explore** (built-in) | Analyze migration impact      |
| GREEN    | 7    | Schema design               | Haiku  | wasp-migration-helper  | Mechanical workflow           |
| GREEN    | 8    | **Implementation planning** | Haiku  | **Plan** (built-in)    | Structure code approach       |
| GREEN    | 9    | Architecture decisions      | Sonnet | backend-architect      | Complex design (optional)     |
| GREEN    | 10   | Code generation             | Haiku  | wasp-code-generator    | Pattern-based                 |
| REFACTOR | 13   | **Refactoring exploration** | Haiku  | **Explore** (built-in) | Find refactoring targets      |
| REFACTOR | 14   | Code smell detection        | Sonnet | code-reviewer          | Pattern recognition           |
| REFACTOR | 15   | **Refactoring planning**    | Haiku  | **Plan** (built-in)    | Sequence safe refactorings    |
| REFACTOR | 16   | Refactoring execution       | Haiku  | wasp-refactor-executor | Mechanical transforms         |
| REVIEW   | 19   | **Security exploration**    | Haiku  | **Explore** (built-in) | Gather security context       |
| REVIEW   | 20   | Security audit              | Opus   | security-auditor       | Critical analysis             |

**🆕 Built-in Agents (Explore & Plan):**

- **Explore**: Fast codebase exploration without polluting main context
- **Plan**: Strategic planning before execution
- **Why**: Prevents acting too quickly, ensures thorough thinking before implementation

## HOW TO EXECUTE AGENTS (CRITICAL!)

**⚠️ DO NOT use general-purpose agent!** Each phase has specialized agents that must be invoked correctly.

### Correct Agent Invocation

Use `Task` tool with the correct `subagent_type` for each phase:

**🆕 EXPLORE Phase Example (Before Analysis):**

```
Task(
  subagent_type="Explore",
  description="Explore feature context",
  model="haiku",  # Optional - defaults to haiku
  prompt="Use thoroughness='very thorough' to gather comprehensive feature context:

  1. Find similar features/operations (Grep for patterns like 'priority', 'filter')
  2. Analyze relevant entities (Read schema.prisma for Task, User models)
  3. Review related test files (Glob for **/*.test.ts with similar patterns)
  4. Check permission patterns (Read app/src/permissions/ helpers)
  5. Examine error handling (Read .claude/templates/error-handling-patterns.ts)
  6. Verify import rules (Read CLAUDE.md #import-rules section)

  Return: Structured context document with file paths, code examples, and constraints."
)
```

**🆕 PLAN Phase Example (Before Execution):**

```
Task(
  subagent_type="Plan",
  description="Plan test generation strategy",
  model="sonnet",  # Use sonnet for strategic planning, haiku for mechanical planning
  prompt="Based on exploration findings, create comprehensive test generation strategy:

  1. Plan test scenarios:
     - Auth: 401 not authenticated, 403 no permission
     - Validation: 400 required field, 400 invalid enum
     - Success: Normal case, with filters, edge cases
  2. Design mock strategy: Which entities to mock vs real DB
  3. Determine test pattern: Unit test vs integration test
  4. Sequence test cases: Logical order for readability
  5. Define assertion strategy: What exactly to verify
  6. Plan test data setup: Fixtures vs inline data

  Return: Detailed test plan with numbered steps and expected outcomes."
)
```

**RED Phase Example:**

```
Task(
  subagent_type="wasp-test-automator",
  description="Generate A3 operation tests",
  prompt="Read requirements from [file] and generate comprehensive tests following Wasp patterns..."
)
```

**GREEN Phase Example:**

```
Task(
  subagent_type="wasp-code-generator",
  description="Implement A3 operations",
  prompt="Read operations.test.ts and implement 7 operations. USE Write tool to CREATE files..."
)
```

**REFACTOR Phase Example:**

```
Task(
  subagent_type="wasp-refactor-executor",
  description="Extract validators and filters",
  prompt="Refactor operations.ts to extract duplicated logic. USE Edit tool to modify files..."
)
```

### Agent Tool Access

Each specialized agent has access to these tools to **actually create and modify files**:

- ✅ **Write** - Create new files
- ✅ **Edit** - Modify existing files
- ✅ **Read** - Read files for context
- ✅ **Bash** - Run commands (tests, migrations)
- ✅ **Glob/Grep** - Search for files and patterns

**Key Point:** Agents will USE these tools to generate actual code files, not just summaries!

### Common Mistake

❌ **WRONG - Using general-purpose agent:**

```
Task(subagent_type="general-purpose", ...)
// Result: Agent gives summary/plan only, DOESN'T create files!
```

✅ **CORRECT - Using specialized agent:**

```
Task(subagent_type="wasp-code-generator", ...)
// Result: Agent USES Write/Edit tools to create actual files!
```

### Verification After Agent Execution

Always verify the agent created the expected files:

```bash
# Check files exist
ls -lh app/src/server/a3/activityLog.ts
ls -lh app/src/server/a3/operations.ts

# Check exports/content
grep "^export const" app/src/server/a3/operations.ts
grep "query getA3Documents" app/main.wasp
```

**If agent only gave a summary:**

→ **Send agent back** with explicit instruction:

```
"You provided only a summary. Please USE the Write tool to CREATE the actual files:
1. Use Write tool → Create app/src/server/a3/activityLog.ts
2. Use Write tool → Create app/src/server/a3/operations.ts
3. Use Edit tool → Add declarations to app/main.wasp"
```

### Required in Agent Prompts

When invoking agents, your prompt MUST include:

1. **Explicit tool usage:** "USE Write tool to CREATE..." or "USE Edit tool to UPDATE..."
2. **File paths:** Full paths to files to create/modify
3. **Context files:** Which files to read for understanding (tests, schemas)
4. **Success criteria:** What to output after completion

**Example Good Prompt:**

```
USE Write tool to CREATE app/src/server/a3/operations.ts with 7 exports.
READ operations.test.ts to understand expectations.
FOLLOW patterns from wasp-operations skill.
OUTPUT: "✅ Created operations.ts (X lines, 7 exports)"
```

**Example Bad Prompt:**

```
"Implement the operations"
// Too vague - agent will give summary instead of creating files
```

## Example Execution

**Command:**

```bash
/tdd-feature "Add priority field to tasks with filtering"
```

**Execution:**

### Phase 1: RED (Test Writing)

```
🔍 Starting watch mode...
   Command: ./scripts/test-watch.sh

   ✓ Database running
   ✓ Dev servers running
   ✓ Watch mode active: "Waiting for file changes..."

🎯 Analyzing requirements...
   Model: Sonnet (backend-architect)

   Requirements understood:
   - Add Priority enum (LOW, MEDIUM, HIGH)
   - Add priority field to Task entity
   - Filter tasks by priority in getTasks operation
   - Test cases identified:
     ✓ Auth (401 if not authenticated)
     ✓ Validation (400 if invalid priority)
     ✓ Filtering (returns only matching tasks)
     ✓ Edge cases (no tasks, multiple priorities)

⚡ Generating test files...
   Model: Haiku (wasp-test-automator)

   Created: app/src/server/a3/operations.test.ts
   - 8 test cases
   - All imports correct (wasp/, @prisma/client)
   - Initial quality checks ✓

🔄 Watch mode auto-ran tests...
   ✓ Tests EXECUTE in 342ms (no timeouts)
   ✓ Tests FAIL with clear errors:
     - "Cannot find module 'operations'" (expected)
     - "Priority enum not defined" (expected)

🔍 Auditing test quality...
   Model: Sonnet (test-quality-auditor)

   Pre-audit verification:
   ✓ No timeouts detected (all tests <1000ms)
   ✓ No import errors
   ✓ Tests execute properly

   Running tests...
   ✓ All tests FAIL (as expected)
   ✓ Failure reasons correct (entities don't exist yet)

   Quality checks:
   ✓ Tests verify behavior, not side effects
   ✓ No unused mocks (integration test pattern)
   ✓ Test pattern matches implementation (operations)
   ✓ All 5 TDD criteria met
   ✓ Auth checks present (401 tests)
   ✓ Error paths tested (400, 404)
   ✓ Edge cases covered (empty filter, null values)

   Audit: PASS ✅

📝 Committed: test: Add priority filtering to tasks
```

### Phase 2: GREEN (Implementation)

```
🗄️ Schema changes needed: YES
   Model: Haiku (wasp-migration-helper)

   Updated schema.prisma:
   + enum Priority { LOW, MEDIUM, HIGH }
   + Task.priority Priority @default(MEDIUM)

   Running: wasp db migrate-dev "Add priority to Task"
   ✓ Migration successful

   Restarting: ./scripts/safe-start.sh
   ✓ Types regenerated

💻 Generating code...
   Model: Haiku (wasp-code-generator)

   Updated: app/src/server/a3/operations.ts
   - getTasks: Added priority filtering
   - createTask: Added priority field
   - Correct imports (Priority from @prisma/client)

✅ Tests PASS
   8/8 test cases GREEN

📝 Committed: feat: Add priority field and filtering to tasks
```

### Phase 3: REFACTOR (Code Improvement)

```
🔍 Analyzing code quality...
   Model: Sonnet (code-reviewer)

   Code smells found:
   1. Duplicated filtering logic (priority, status, department)
   2. Magic string in error messages

   Refactoring suggestions:
   - Extract buildTaskFilter() helper
   - Extract ERROR_MESSAGES constants

🔧 Executing refactorings...
   Model: Haiku (wasp-refactor-executor)

   Refactored:
   - Created: app/src/tasks/utils/filters.ts
   - Extracted: buildTaskFilter() helper
   - Consolidated: 3 filter patterns → 1 reusable function
   - Reduced: 23 lines of duplicated code

✅ Tests STILL PASS
   8/8 test cases GREEN (behavior preserved)

📝 Committed: refactor: Extract task filtering logic
```

### Phase 4: REVIEW (Security & Quality)

```
🔒 Security audit...
   Model: Sonnet (security-auditor from marketplace)

   Security checks:
   ✓ Auth check present (401)
   ✓ Input validation (enum values checked)
   ✓ SQL injection: N/A (Prisma ORM)
   ✓ Permission check: Department isolation verified
   ✓ OWASP compliance: PASS

   No critical issues found

   Report saved: reports/security-audit/YYYY-MM-DD-security-audit-<feature>.md

✅ All tests GREEN
   8/8 test cases passing

🎉 READY FOR PR!
```

## Cost Analysis

**Traditional (All Sonnet):**

- Test planning: 2K tokens × $3/M = $0.006
- Test generation: 8K tokens × $3/M = $0.024
- Test quality audit: 2K tokens × $3/M = $0.006
- Implementation planning: 3K tokens × $3/M = $0.009
- Code generation: 10K tokens × $3/M = $0.030
- Refactor analysis: 2K tokens × $3/M = $0.006
- Refactoring: 5K tokens × $3/M = $0.015
- Review: 3K tokens × $3/M = $0.009
  **Total: ~$0.105 (~11 cents)**

**Hybrid Orchestration (This Command):**

- Test planning: 2K Sonnet = $0.006
- Test generation: 8K Haiku = $0.002 ⚡
- Test quality audit: 2K Sonnet = $0.006
- Schema migration: 4K Haiku = $0.001 ⚡
- Implementation: 10K Haiku = $0.003 ⚡
- Refactor analysis: 2K Sonnet = $0.006
- Refactoring: 5K Haiku = $0.001 ⚡
- Security review: 3K Opus = $0.045
  **Total: ~$0.070 (~7 cents) - 33% savings!**

## Integration with Skills

This orchestrator leverages your existing skills:

- **/tdd-workflow** - TDD methodology and quality criteria
- **/wasp-operations** - Operation patterns for code generation
- **/wasp-database** - Migration workflow
- **/error-handling** - HTTP status codes
- **/permissions** - Permission checking patterns

## Customization

You can run individual phases:

```bash
# Just RED phase
/tdd-feature "Feature description" --phase=red

# Skip to GREEN (tests already exist)
/tdd-feature "Feature description" --phase=green

# Only REFACTOR
/tdd-feature "Feature description" --phase=refactor
```

## Success Criteria

This command completes successfully when:

1. ✅ All tests pass (GREEN)
2. ✅ Code follows Wasp patterns (imports, types, auth)
3. ✅ 5 test quality criteria met
4. ✅ Code refactored (DRY, clear naming)
5. ✅ Security audit passed (no critical issues)
6. ✅ 3 git commits created (test, feat, refactor)

## Error Handling

If any phase fails:

```
❌ Phase RED failed: Test quality audit failed

   Issues found:
   - Test theater detected: Tests check translation values but not language state
   - Mock misuse: Mocks created but never injected into function
   - Missing error cases: No 401/403 tests
   - Pattern mismatch: Unit test pattern but implementation uses global DB

   Action:
   → Returning to test specification step
   → Will address issues and regenerate tests

❌ Phase GREEN failed: Tests still RED

   Diagnosing...
   - wasp-test-automator: Check test expectations
   - wasp-code-generator: Review implementation

   Suggestions:
   1. Review failing test output
   2. Check if schema migration succeeded
   3. Verify wasp restart completed
   4. Manually debug with wasp-operations skill
```

## When to Use This Command

✅ **Use for:**

- New features (complete workflow)
- CRUD operations (standard pattern)
- Adding fields/entities (with migration)
- Multi-step implementations

❌ **Don't use for:**

- Simple refactorings (use wasp-refactor-executor directly)
- Bug fixes (may not need new tests)
- Trivial changes (overhead too high)
- Experimental spikes (TDD may slow exploration)

## Running Tests

**Quick reference:** `cd app && wasp test client run`

For complete test commands, troubleshooting, and Vitest vs Jest syntax, see:

- **tdd-workflow skill** - "Testing Commands Reference" section
- **CLAUDE.md** - "Essential Commands" section

## References

- **Agents:** wasp-test-automator, wasp-code-generator, wasp-refactor-executor, wasp-migration-helper, test-quality-auditor
- **Skills:** /tdd-workflow, /wasp-operations, /wasp-database
- **Docs:** docs/TDD-WORKFLOW.md, docs/TDD-TEST-QUALITY-ANALYSIS.md, CLAUDE.md
- **Marketplace:** backend-development (Sonnet architect), security-scanning (Opus auditor)
