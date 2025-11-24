# Project Agents

Specialized AI agents for Wasp development workflow with hybrid Haiku + Sonnet orchestration.

## Overview

This project leverages **2 built-in Claude Code agents** (Plan + Explore) for codebase exploration, plus **9 custom agents** (5 Wasp-specific + 4 architecture/security) for intelligent TDD workflow automation with 82% cost savings vs all-Sonnet approach.

## Agent Strategy

| Agent                      | Model  | Phase    | Purpose                                 | Cost | Source     |
| -------------------------- | ------ | -------- | --------------------------------------- | ---- | ---------- |
| **wasp-test-automator**    | Haiku  | RED      | Generate Wasp operation tests           | $    | Custom     |
| **test-quality-auditor**   | Sonnet | RED      | Verify test quality before commit       | $$   | Custom     |
| **wasp-code-generator**    | Haiku  | GREEN    | Generate operations/entities/components | $    | Custom     |
| **wasp-refactor-executor** | Haiku  | REFACTOR | Execute mechanical refactorings         | $    | Custom     |
| **wasp-migration-helper**  | Haiku  | Schema   | Database migration workflow             | $    | Custom     |
| **backend-architect**      | Sonnet | Planning | Backend architecture & API design       | $$   | Copied [1] |
| **graphql-architect**      | Sonnet | Planning | GraphQL schema design & optimization    | $$   | Copied [1] |
| **tdd-orchestrator**       | Sonnet | Planning | TDD workflow coordination & governance  | $$   | Copied [1] |
| **security-auditor**       | Sonnet | Review   | Security audits & OWASP compliance      | $$   | Copied [2] |

**Total token cost per feature: ~$0.018 (vs $0.10 all-Sonnet) - 82% savings**

**[1]** Copied from `backend-development` plugin
**[2]** Copied from `security-scanning` plugin

---

## Built-in Claude Code Agents

Claude Code provides two specialized built-in agents for codebase exploration and planning, designed to work efficiently with isolated context windows.

### 🆕 MANDATORY Integration in Process Commands

**ALL process commands now use the THINK → EXPLORE → PLAN → EXECUTE pattern:**

| Command        | Explore Points | Plan Points | Total Agents |
| -------------- | -------------- | ----------- | ------------ |
| `/initiate`    | 1              | 2           | 3            |
| `/specify`     | 1              | 1           | 2            |
| `/plan`        | 1              | 1           | 2            |
| `/breakdown`   | 1              | 1           | 2            |
| `/tdd-feature` | 4              | 4           | 8            |
| `/review-pr`   | 2              | 1           | 3            |
| **TOTAL**      | **10**         | **10**      | **20**       |

**Why:** Prevents "acting too quickly" - ensures thorough thinking, exploration, and planning before execution.

**See:** Individual command files in `.claude/commands/` for specific integration points.

### Explore Agent (Context Gathering)

**Model:** Haiku (fast codebase search)
**Purpose:** Gather comprehensive codebase context without polluting main chat context

**Key Characteristics:**

- **Thoroughness Levels:** `quick`, `medium`, `very thorough` (MANDATORY specification)
- **Context Strategy:** Isolated context window for codebase exploration
- **Tools Available:** Read, Glob, Grep, Bash (read-only operations)
- **Invocation:** Task tool with `subagent_type='Explore'`

**Thoroughness Mapping:**

- `quick`: Mechanical tasks (/breakdown)
- `medium`: Standard features (/plan, /tdd-feature GREEN/REFACTOR)
- `very thorough`: Critical decisions (/initiate, /specify, /tdd-feature RED/REVIEW, /review-pr)

**When to Use:**

- BEFORE any technical decisions in process commands
- Finding similar features and patterns in codebase
- Analyzing entity relationships and dependencies
- Reviewing test patterns and coverage
- Checking permission and error handling patterns

**Example Usage:**

```typescript
Task(
  subagent_type="Explore",
  description="Explore feature context",
  model="haiku",  // Optional - defaults to haiku
  prompt="Use thoroughness='very thorough' to gather context:
  1. Find similar features (Grep for patterns)
  2. Analyze entities (Read schema.prisma)
  3. Review test patterns (Glob for *.test.ts)
  Return: Context document with file paths and examples"
)
```

**Output:** File paths, code snippets, patterns, constraints

### Plan Agent (Strategic Planning)

**Model:** Sonnet or Haiku (complexity-dependent)
**Purpose:** Create execution strategy before implementation

**Key Characteristics:**

- **Model Choice:** Sonnet for creative planning, Haiku for mechanical breakdown
- **Context Strategy:** Strategic reasoning based on exploration findings
- **Tools Available:** Read, Glob, Grep, Bash (read-only operations)
- **Invocation:** Task tool with `subagent_type='Plan'`

**Model Selection:**

- `sonnet`: Creative/complex planning (/initiate, /specify, /plan, /review-pr, /tdd-feature RED)
- `haiku`: Mechanical planning (/breakdown, /tdd-feature GREEN/REFACTOR)

**When to Use:**

- AFTER exploration, BEFORE execution
- Breaking down complex tasks into phases
- Sequencing implementation steps
- Planning coordination between worktrees
- Designing test strategies
- Prioritizing review areas

**Example Usage:**

```typescript
Task(
  subagent_type="Plan",
  description="Plan test generation strategy",
  model="sonnet",  // Use sonnet for strategic planning
  prompt="Based on exploration, create strategy:
  1. Plan test scenarios (auth, validation, edge cases)
  2. Design mock strategy
  3. Determine test pattern (unit vs integration)
  4. Sequence test cases
  Return: Detailed plan with numbered steps"
)
```

**Output:** Structured strategy with sequencing, dependencies, validation steps

### Legacy Plan Mode (Different from Plan Agent!)

**Model:** Sonnet (read-only in plan mode)
**Purpose:** Interactive planning session with user (DEPRECATED in favor of Plan Agent)

**Key Characteristics:**

- **Permission Level:** Read-only (cannot modify files when in plan mode)
- **Context Strategy:** Thorough analysis for creating implementation plans
- **Tools Available:** Read, Glob, Grep, Bash (read-only operations)
- **Activation:** Automatically active when Claude Code runs in plan mode with `claude --permission-mode plan`

**When to Use (DEPRECATED):**

- Planning complex multi-file feature implementations (USE `/plan` command instead)
- Understanding unfamiliar architecture before making changes
- Creating structured implementation plans for team review
- Analyzing dependencies and impact of proposed changes
- Iterating on development approach before committing

**Example Usage:**

```
# Activate plan mode (read-only)
claude --permission-mode plan

# Or during session: Press Shift+Tab to cycle to plan mode
```

**Benefits:**

- ✅ Forces systematic thinking before implementation
- ✅ Prevents accidental file modifications during exploration
- ✅ Isolated context prevents main chat pollution
- ✅ Comprehensive analysis using Sonnet's reasoning capabilities

---

### Explore Agent

**Model:** Haiku (context-efficient)
**Purpose:** Rapid codebase exploration and question-answering

**Key Characteristics:**

- **Permission Level:** Depends on mode (can be read-write in normal mode)
- **Context Strategy:** Efficient search with isolated context windows
- **Tools Available:** Read, Glob, Grep (optimized for finding information)
- **Activation:** Use Task tool with `subagent_type=Explore`

**When to Use:**

- Onboarding to new codebase sections
- Quick answers like "Where is error handling implemented?"
- Searching for specific code patterns or implementations
- Understanding edge cases in existing code
- Parallel exploration of multiple directories in large codebases

**Activation Examples:**

```typescript
// Via Task tool
Task tool with:
  subagent_type: "Explore"
  prompt: "Find all components that use the A3 entity"
  model: "haiku"  // Cost-efficient

// Natural language (Claude auto-invokes)
"Explore the codebase to understand how authentication works"
"Search for all error handling patterns"
```

**Thoroughness Levels:**

- **"quick"** - Fast surface-level search (1-2 locations)
- **"medium"** - Moderate exploration (3-5 locations, common patterns)
- **"very thorough"** - Comprehensive analysis (all relevant files, edge cases)

**Benefits:**

- ✅ Low cost (uses Haiku instead of Sonnet)
- ✅ Fast responses for specific questions
- ✅ Can parallelize multiple exploration tasks
- ✅ Doesn't bloat main conversation context

---

### Plan vs Explore: When to Use Which

| Aspect               | Plan Agent                               | Explore Agent                        |
| -------------------- | ---------------------------------------- | ------------------------------------ |
| **Primary Purpose**  | Systematic implementation planning       | Quick codebase Q&A                   |
| **Model**            | Sonnet (more capable)                    | Haiku (efficient)                    |
| **Permission Mode**  | Read-only (in plan mode)                 | Depends on mode                      |
| **Best For**         | Complex features, architecture decisions | Specific questions, pattern searches |
| **Context Usage**    | Thorough analysis                        | Targeted exploration                 |
| **Typical Duration** | Longer (comprehensive planning)          | Shorter (rapid answers)              |
| **Parallelization**  | Single systematic task                   | Multiple parallel searches           |
| **Cost**             | Higher (Sonnet)                          | Lower (Haiku)                        |
| **Output**           | Implementation plan                      | Answers, code locations              |

**Practical Decision Tree:**

```
Need to understand codebase?
├─ For planning implementation → Use Plan Agent
│  └─ Want systematic approach, prevent edits
│
└─ For quick questions → Use Explore Agent
   └─ Want fast answers, specific searches
```

---

### Context Efficiency Pattern

Both Plan and Explore agents use **isolated context windows**, which means:

1. **No Main Chat Pollution:** Agent exploration doesn't consume your main conversation tokens
2. **Parallel Tasks:** Run multiple Explore agents simultaneously on large codebases
3. **Focus:** Main chat stays focused on current implementation work
4. **Cost Control:** Use cheaper models (Haiku) for exploration without sacrificing main chat capability

**Example Workflow:**

```
1. Start session in plan mode (Plan Agent active)
2. Plan Agent analyzes codebase, creates implementation plan
3. Exit plan mode, switch to normal mode
4. During implementation: Use Explore Agent for specific questions
   - "Where is validation implemented?"
   - "Find all usages of getDepartmentAccess helper"
5. Main chat focuses on actual coding work
```

**Cost Comparison:**

| Approach                                           | Tokens Used                  | Cost |
| -------------------------------------------------- | ---------------------------- | ---- |
| **Without agents:** Explore codebase in main chat  | 50,000 main context          | High |
| **With Explore agent:** Isolated Haiku exploration | 50,000 isolated + 5,000 main | Low  |

---

## Custom Agents (Wasp-Specific)

### 1. wasp-test-automator

**Model:** Haiku
**Purpose:** Generate comprehensive test suites following Wasp TDD patterns

**Activation:**

```
"generate tests for getTasks operation"
"create test file for A3 sections"
"TDD: start RED phase for user authentication"
```

**What it knows:**

- ✅ Wasp import rules (`wasp/entities`, `@prisma/client` for enums)
- ✅ 5 test quality criteria (from tdd-workflow skill)
- ✅ Auth test patterns (401, 403)
- ✅ Validation tests (400)
- ✅ Edge cases (empty, null, boundaries)

**Example output:**

```typescript
// Complete test file with:
import { getTasks } from 'wasp/server/operations'
import type { Task } from 'wasp/entities'
import { TaskStatus } from '@prisma/client'

describe('getTasks', () => {
  it('throws 401 when not authenticated', async () => { ... })
  it('filters by department correctly', async () => { ... })
  it('handles empty results', async () => { ... })
})
```

**See:** `.claude/agents/wasp-test-automator.md`

---

### 2. wasp-code-generator

**Model:** Haiku
**Purpose:** Generate Wasp operations, entities, pages, components

**Activation:**

```
"implement getTasks operation"
"generate code for A3 creation"
"GREEN phase: make tests pass for priority filtering"
```

**What it knows:**

- ✅ Wasp operation patterns (type annotations, auth checks)
- ✅ Entity declarations in main.wasp
- ✅ Error handling (HttpError with correct status codes)
- ✅ Prisma query patterns
- ✅ React component patterns with Wasp hooks

**ALWAYS reminds you:**

```
⚠️ NEXT STEPS:
1. Add query to app/main.wasp
2. Restart: ./scripts/safe-start.sh
```

**Example output:**

```typescript
export const getTasks: GetTasks<GetTasksInput, Task[]> = async (args, context) => {
  if (!context.user) throw new HttpError(401)
  const hasPermission = await checkDepartmentAccess(...)
  if (!hasPermission) throw new HttpError(403)
  return await context.entities.Task.findMany({ where: { ... } })
}
```

**See:** `.claude/agents/wasp-code-generator.md`

---

### 3. wasp-refactor-executor

**Model:** Haiku
**Purpose:** Execute mechanical refactorings (DRY, extract, rename)

**Activation:**

```
"refactor: extract permission checking"
"DRY up error handling in components"
"extract buildTaskFilter helper"
```

**What it does:**

- ✅ Extract duplicated code into helpers
- ✅ Rename variables for clarity
- ✅ Consolidate error handling patterns
- ✅ Move code to appropriate locations
- ✅ Extract constants from magic values

**Safety guarantees:**

- Tests MUST be GREEN before refactoring
- Tests MUST stay GREEN after refactoring
- Code size should reduce (or stay same)
- No new functionality added

**Example:**

```typescript
// Before: Duplicated auth in 5 operations
if (!context.user) throw new HttpError(401)
const hasPermission = await checkPermission(...)
if (!hasPermission) throw new HttpError(403)

// After: Extracted helper
await requireDepartmentAccess(context, args.deptId)
```

**See:** `.claude/agents/wasp-refactor-executor.md`

---

### 4. wasp-migration-helper

**Model:** Haiku
**Purpose:** Guide complete Wasp database migration workflow

**Activation:**

```
"add priority field to Task entity"
"create A3Section entity"
"change Task-Department to many-to-many"
```

**Critical workflow it enforces:**

```bash
1. Edit app/schema.prisma
2. wasp db migrate-dev "Description"  # NOT prisma!
3. ./scripts/safe-start.sh             # MANDATORY restart!
4. Update code to use new types
```

**What it prevents:**

- ❌ Forgetting to restart (→ type errors)
- ❌ Using `prisma migrate` (→ bypasses Wasp)
- ❌ Skipping main.wasp entity declaration
- ❌ Data loss from unsafe renames

**See:** `.claude/agents/wasp-migration-helper.md`

---

## Architecture & Security Agents (Copied from Plugins)

These agents were originally from Claude Code marketplace plugins but are now included in the project for portability.

### backend-architect

**Model:** Sonnet
**Purpose:** Backend architecture & API design decisions
**Source:** Copied from `backend-development` plugin

**When to use:**

- API design (REST endpoints, resource structure)
- Technology selection (which framework/library to use)
- Pattern choice (repository pattern, service layer, etc.)
- Complex business logic design
- Microservices boundaries and communication patterns

**Invocation:**

```
"Use backend-architect to design the document management API structure"
```

**See:** `.claude/agents/backend-architect.md`

---

### graphql-architect

**Model:** Sonnet
**Purpose:** GraphQL schema design & optimization
**Source:** Copied from `backend-development` plugin

**When to use:**

- GraphQL schema design and evolution
- Query performance optimization
- Resolver implementation patterns
- Federation and distributed GraphQL
- Real-time subscriptions architecture

**Invocation:**

```
"Use graphql-architect to design the GraphQL schema for the task management feature"
```

**See:** `.claude/agents/graphql-architect.md`

---

### tdd-orchestrator

**Model:** Sonnet
**Purpose:** TDD workflow coordination & governance
**Source:** Copied from `backend-development` plugin

**When to use:**

- Orchestrating complex TDD workflows across multiple features
- Enforcing TDD discipline and best practices
- Multi-agent workflow coordination
- Test strategy planning for large features
- TDD quality assurance and compliance

**Invocation:**

```
"Use tdd-orchestrator to coordinate TDD workflow for the authentication feature"
```

**See:** `.claude/agents/tdd-orchestrator.md`

---

### security-auditor

**Model:** Sonnet
**Purpose:** Security audits & OWASP compliance
**Source:** Copied from `security-scanning` plugin

**When to use:**

- Before creating PR (comprehensive security review)
- After implementing auth/permissions (validation)
- When handling sensitive data (PII, credentials)
- Multi-tenant isolation verification
- OWASP Top 10 compliance checks
- DevSecOps integration

**Invocation:**

```
"Use security-auditor to perform OWASP Top 10 security audit"
```

**See:** `.claude/agents/security-auditor.md`

---

## Orchestration: /tdd-feature Command

The **hybrid TDD orchestrator** combines all agents:

```bash
/tdd-feature "Add priority field to tasks with filtering"
```

**Executes 4 phases:**

```
Phase 1: RED (Sonnet + Haiku)
  backend-architect → Plan tests
  wasp-test-automator → Generate test files

Phase 2: GREEN (Haiku)
  wasp-migration-helper → Schema changes (if needed)
  wasp-code-generator → Implement feature

Phase 3: REFACTOR (Sonnet + Haiku)
  code-reviewer → Identify code smells
  wasp-refactor-executor → Execute refactorings

Phase 4: REVIEW (Sonnet)
  security-auditor → Security scan
```

**Cost:** ~$0.018 per feature (vs $0.10 all-Sonnet) - 82% savings

**See:** `.claude/commands/tdd-feature.md`

---

## When to Use Which Agent

### Built-in Agents (Codebase Exploration)

| Scenario                      | Agent         | Model  | Why                        |
| ----------------------------- | ------------- | ------ | -------------------------- |
| "Plan feature implementation" | Plan Agent    | Sonnet | Systematic analysis        |
| "Where is X implemented?"     | Explore Agent | Haiku  | Fast search                |
| "Understand codebase section" | Explore Agent | Haiku  | Efficient exploration      |
| "Analyze impact of changes"   | Plan Agent    | Sonnet | Comprehensive dependencies |

### Custom Agents (TDD Workflow & Architecture)

| Scenario                     | Agent                  | Model  | Why                  |
| ---------------------------- | ---------------------- | ------ | -------------------- |
| "Write tests for X"          | wasp-test-automator    | Haiku  | Pattern-based        |
| "Audit test quality"         | test-quality-auditor   | Sonnet | Quality gate         |
| "What pattern should I use?" | backend-architect      | Sonnet | Complex reasoning    |
| "Design GraphQL schema"      | graphql-architect      | Sonnet | Schema expertise     |
| "Coordinate TDD workflow"    | tdd-orchestrator       | Sonnet | Workflow governance  |
| "Implement operation X"      | wasp-code-generator    | Haiku  | Follows spec         |
| "Add field to entity"        | wasp-migration-helper  | Haiku  | Mechanical workflow  |
| "Extract duplicated code"    | wasp-refactor-executor | Haiku  | Mechanical transform |
| "Is this secure?"            | security-auditor       | Sonnet | Critical analysis    |
| "Build complete feature"     | /tdd-feature           | Hybrid | Full workflow        |

---

## Integration with Skills

Agents leverage your existing skills for compact instructions:

**Agents CONSULT skills:**

- `/tdd-workflow` → TDD methodology, 5 quality criteria
- `/wasp-operations` → Operation patterns
- `/wasp-database` → Migration workflow
- `/error-handling` → HTTP status codes
- `/permissions` → Permission checking patterns

**Result:** Agents are compact (low token cost) while still highly accurate

---

## Installation

### All Agents Included (No Installation Needed)

All 9 agents are included in `.claude/agents/` and automatically available:

**Wasp-Specific (5):**

- `wasp-test-automator.md` - Test generation
- `test-quality-auditor.md` - Test quality verification
- `wasp-code-generator.md` - Code generation
- `wasp-refactor-executor.md` - Refactoring
- `wasp-migration-helper.md` - Database migrations

**Architecture & Security (4):**

- `backend-architect.md` - Backend architecture (copied from plugin)
- `graphql-architect.md` - GraphQL design (copied from plugin)
- `tdd-orchestrator.md` - TDD coordination (copied from plugin)
- `security-auditor.md` - Security audits (copied from plugin)

**Why copied from plugins?**

The 4 architecture/security agents were originally from Claude Code marketplace plugins (`backend-development` and `security-scanning`), but are now copied into the project for:

1. **Portability** - No external plugin dependencies
2. **Version Control** - Agent definitions tracked with project
3. **Customization** - Can modify agents for project needs
4. **Offline Work** - Available without plugin marketplace access

**Note:** If you want the latest versions from the marketplace, you can still install the original plugins, but it's not required.

---

## Cost Optimization Strategy

### Why Haiku + Sonnet Strategy?

| Task Type       | Complexity        | Model  | Cost Multiplier |
| --------------- | ----------------- | ------ | --------------- |
| Test generation | Pattern-based     | Haiku  | 1x              |
| Code generation | Follows spec      | Haiku  | 1x              |
| Refactoring     | Mechanical        | Haiku  | 1x              |
| Migration       | Workflow          | Haiku  | 1x              |
| Test quality    | Quality gate      | Sonnet | 10x             |
| Architecture    | Complex reasoning | Sonnet | 10x             |
| Security audit  | Critical analysis | Sonnet | 10x             |

**Principle:** Use cheapest model that can complete task reliably

**Sonnet replaces Opus:** Research shows Sonnet 4.5 outperforms Opus on coding tasks (77.2% vs 74.5% SWE-bench) while being 5x cheaper.

### Cost Per Feature (Estimated)

| Workflow        | Models         | Cost    |
| --------------- | -------------- | ------- |
| **Traditional** | All Sonnet     | ~$0.10  |
| **Hybrid**      | Haiku + Sonnet | ~$0.018 |
| **Savings**     |                | **82%** |

**Over 100 features:** $8.20 saved!
**Why this works:** Pattern-based tasks (test/code generation) don't need Sonnet's reasoning power, while quality gates and security audits benefit from Sonnet's coding expertise.

---

## Troubleshooting

### Agent not activating

**Symptom:** Agent doesn't respond to activation pattern

**Fix:**

```
# Try explicit invocation:
"Use wasp-test-automator to generate tests for getTasks"

# Or natural language:
"I need the test generator agent to create operation tests"
```

### Generic advice instead of Wasp-specific

**Symptom:** Agent suggests `@wasp/...` imports or `prisma migrate`

**Fix:** Agent may not have activated. Explicitly mention agent name:

```
"Use wasp-code-generator (not generic code generator) to implement this"
```

### Tests not following Wasp patterns

**Symptom:** Tests use wrong imports or missing auth checks

**Fix:** Ensure wasp-test-automator activated:

```
"Use wasp-test-automator to generate tests following Wasp patterns"
```

---

## Agent Self-Validation Pattern

**MANDATORY for ALL code-generating agents**

### The Problem

AI-generated code often contains framework-specific errors that only surface during execution:

- Path alias incompatibility (`@/` doesn't work in Wasp test builds)
- Enum hoisting errors (Vitest `vi.hoisted()` runs before imports)
- Query selector ambiguity (Testing Library `getByText` throws with duplicates)

**These errors prevent tests from running, breaking the RED phase.**

### The Solution: Validate Before Commit

**ALL code-generating agents MUST follow this workflow:**

```
1. Generate code/tests
2. Write to file
3. ✅ VALIDATE (run/compile/execute)
4. If errors → Analyze → Fix → goto 3
5. Only commit when validated
```

### wasp-test-automator Validation Rules

**Framework Constraints (Auto-Fix Required):**

#### Path Aliases (Wasp Incompatible)

```typescript
// ❌ NEVER - Agent initially generates (common mistake)
import { X } from "@/path/to/module";

// ✅ ALWAYS - Agent MUST fix to relative path
import { X } from "../../path/to/module";
```

**Auto-fix pattern:**

```javascript
// In agent's fix step:
testCode = testCode.replace(/from ['"]@\//g, (match) =>
  calculateRelativePath(testFilePath, targetPath),
);
```

#### Enum Hoisting (Vitest Incompatible)

```typescript
// ❌ NEVER - Agent initially generates
const { mockUser } = vi.hoisted(() => ({
  role: DepartmentRole.MEMBER, // Undefined!
}));

// ✅ ALWAYS - Agent MUST fix to string literal
const { mockUser } = vi.hoisted(() => ({
  role: "MEMBER", // Works - runtime equivalent
}));
```

**Auto-fix pattern:**

```javascript
// Detect enum access in hoisted blocks
const hoistedBlock = extractHoistedBlock(testCode);
if (containsEnumAccess(hoistedBlock)) {
  testCode = replaceEnumsWithLiterals(testCode);
}
```

#### Testing Library Query Priority

```typescript
// ❌ AVOID - Agent's first attempt (fragile)
screen.getByText("Page Title");

// ✅ PREFER - Agent improves to semantic query
screen.getByRole("heading", { name: "Page Title" });
```

### Validation Workflow (Step 3)

**Command:**

```bash
wasp test client run <generated-test-file>
```

**Expected Outcomes:**

| Phase  | Result                                  | Status  | Action       |
| ------ | --------------------------------------- | ------- | ------------ |
| RED    | Tests run, all FAIL (no implementation) | ✅ PASS | Commit tests |
| GREEN  | Tests run, all PASS (implementation OK) | ✅ PASS | Commit code  |
| Either | Syntax errors prevent execution         | ❌ FAIL | Fix & retry  |

**Example validation outputs:**

```bash
# ✅ VALID RED - Tests execute but fail (expected)
❌ src/operations.test.ts (3 failed, 0 passed)
  ❌ should create organization
    TypeError: Cannot find module 'operations'
  ❌ should throw 401 when not authenticated
    Expected HttpError but got undefined

# ❌ INVALID - Syntax errors (must fix)
❌ src/operations.test.ts (compilation error)
  Error: Cannot resolve module '@/constants/file'
  ReferenceError: Cannot access '__vi_import_4__' before initialization
```

### Error Recovery Loop (Step 4)

When validation fails:

```
1. Parse error messages from test output
2. Identify error type:
   - Path alias? → Calculate relative path
   - Enum hoisting? → Replace with string literal
   - Query ambiguity? → Use getByRole instead
3. Apply appropriate fix
4. Re-run validation (goto step 3)
5. Repeat until validation passes
6. Max 3 iterations (escalate to human if exceeded)
```

**Common error patterns:**

| Error Message                                           | Root Cause              | Auto-Fix                                      |
| ------------------------------------------------------- | ----------------------- | --------------------------------------------- |
| `Cannot resolve module '@/...'`                         | Path alias              | Convert to relative path                      |
| `Cannot access '__vi_import_X__' before initialization` | Enum in hoisted scope   | Replace with string literal                   |
| `Found multiple elements with the text:`                | Ambiguous query         | Use `getByRole()`                             |
| `user.selectOptions` in test code                       | Implementation-specific | Use click-based dropdown pattern              |
| Nested `beforeEach` overrides parent mock               | Mock setup conflict     | Verify nested setup doesn't contradict parent |
| `Cannot find module 'operations'`                       | Missing implementation  | Expected in RED - commit tests                |

### Commit Checklist

**Before committing, agent verifies:**

- [ ] Tests execute without syntax errors
- [ ] Tests fail appropriately (RED) or pass (GREEN)
- [ ] No `@/` path aliases in test files
- [ ] No enum access in `vi.hoisted()` blocks
- [ ] Semantic queries used (`getByRole` > `getByText`)
- [ ] 5 TDD quality criteria met (see `docs/TDD-WORKFLOW.md`)

**If ANY checkbox fails → Agent MUST NOT commit**

### Example: wasp-test-automator Implementation

```typescript
async function generateAndValidateTests(spec) {
  let attempts = 0;
  const MAX_ATTEMPTS = 3;

  while (attempts < MAX_ATTEMPTS) {
    attempts++;

    // 1. Generate test code
    const testCode = await generateTestCode(spec);

    // 2. Write to file
    await writeFile(testPath, testCode);

    // 3. VALIDATE - Run tests
    const result = await runCommand(`wasp test client run ${testPath}`);

    // 4. Check outcome
    if (result.syntaxErrors.length === 0) {
      // Validation passed - tests are executable
      if (spec.phase === "RED" && result.allPassed) {
        throw new Error("RED phase tests should FAIL - check test logic");
      }
      // Success - commit
      await gitCommit(testPath, "test: add tests (RED)");
      return { success: true, attempts };
    }

    // 5. Auto-fix common patterns
    let fixedCode = testCode;

    // Fix path aliases
    if (result.errors.some((e) => e.includes("Cannot resolve module"))) {
      fixedCode = fixPathAliases(fixedCode, testPath);
    }

    // Fix enum hoisting
    if (result.errors.some((e) => e.includes("before initialization"))) {
      fixedCode = fixEnumHoisting(fixedCode);
    }

    // Fix query selectors
    if (result.errors.some((e) => e.includes("Found multiple elements"))) {
      fixedCode = improveQuerySelectors(fixedCode);
    }

    // Write fixed code for next iteration
    await writeFile(testPath, fixedCode);
  }

  // Max attempts exceeded - escalate
  throw new Error(
    `Failed to validate tests after ${MAX_ATTEMPTS} attempts. Human review needed.`,
  );
}
```

### Benefits

1. **Catches errors in RED phase** - Before implementation begins
2. **Reduces human intervention** - Auto-fixes common patterns
3. **Maintains TDD integrity** - Tests are executable before being "locked"
4. **Faster iteration** - No waiting for developer to fix syntax
5. **Better DX** - Developers see meaningful test failures, not syntax errors

### References

- **TDD Workflow**: `docs/TDD-WORKFLOW.md` (section: RED Phase Quality Control)
- **Test Constraints**: `app/src/test/CLAUDE.md` (section: Wasp-Specific Test Constraints)
- **Real Case Study**: `reports/qa/2025-10-24-test-modifications-sprint-2-detail.md`

---

## Contributing New Agents

To add a new custom agent:

1. Create `.claude/agents/[agent-name].md`
2. Use frontmatter:
   ```yaml
   ---
   name: agent-name
   description: Brief description
   model: haiku # or sonnet
   ---
   ```
3. Write compact instructions (refer to skills when possible)
4. Add activation patterns
5. Document cost optimization reasoning
6. Update this README

---

## References

- **Built-in Agents:** Claude Code Plan & Explore agents (this document)
- **Agent Files:** `.claude/agents/*.md` (custom agents)
- **Orchestrator:** `.claude/commands/tdd-feature.md`
- **Skills:** `.claude/skills/*.md`
- **Marketplace:** `ToonVos/agents` repository
- **Project Docs:** `docs/TDD-WORKFLOW.md`, `CLAUDE.md`
- **Claude Code Docs:** https://docs.claude.com/en/docs/claude-code/ (official documentation)
