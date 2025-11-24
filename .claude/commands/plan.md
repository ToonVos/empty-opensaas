---
description: Convert technical spec to detailed implementation plan with task breakdown, worktree coordination, and TDD workflow.
---

# Plan: Spec → Implementation Plan

Convert a technical specification into a detailed implementation plan with task breakdown, database migration steps, worktree coordination, and TDD workflow phases.

## Usage

```bash
# With spec file
/plan tasks/active/techlead/current/SPEC-DOCUMENT-MANAGEMENT.md

# With spec name (assumes current dir)
/plan SPEC-DOCUMENT-SECTIONS.md

# From /specify output
/specify PRD.md
/plan SPEC-[generated].md
```

## Purpose

This command transforms **technical specifications** into **actionable implementation plans** by:

1. ✅ Breaking spec into worktree-specific tasks
2. ✅ Defining database migration sequence
3. ✅ Mapping tasks to TDD phases (RED/GREEN/REFACTOR)
4. ✅ Establishing coordination points between worktrees
5. ✅ Specifying exact file paths for implementations

**Model:** Sonnet (requires planning and dependency analysis)

## 🆕 Execution Workflow (MANDATORY PHASES)

This command MUST follow the **THINK → EXPLORE → PLAN → EXECUTE** pattern:

### Phase 1: 🔍 EXPLORE (MANDATORY - Implementation Context)

**When:** Immediately after reading SPEC, BEFORE task breakdown
**Agent:** Use Task tool with `subagent_type='Explore'` and `thoroughness='medium'`

**What to explore:**

1. Find similar operation implementations (Grep for operation patterns)
2. Analyze test file patterns (Read \*.test.ts examples)
3. Review refactoring opportunities (Grep for duplicated code)
4. Check current migrations (Glob for migration files)
5. Examine component structures (Glob for page/component patterns)
6. Verify current git branch status per worktree (Bash: check worktree status)

**Output:** Implementation context with file examples, patterns, current state

**Why critical:** Ensures implementation follows existing patterns and avoids conflicts

### Phase 2: 📋 PLAN (MANDATORY - Task Planning Strategy)

**When:** After Explore completes, BEFORE writing PLAN
**Agent:** Use Task tool with `subagent_type='Plan'` and `model='sonnet'`

**What to plan:**

1. Break each worktree into RED/GREEN/REFACTOR phases
2. Sequence database migrations (who goes first)
3. Identify coordination checkpoints (pull points, merge order)
4. Plan file creation order (schemas → operations → components)
5. Estimate task complexity (time per phase)
6. Define validation steps per task

**Output:** Detailed phase-by-phase plan with coordination strategy

**Why critical:** Strategic task sequencing prevents deadlocks and rework

### Phase 3: ✅ EXECUTE (Generate PLAN)

**When:** After Plan completes
**Agent:** Direct Sonnet execution

**What to generate:** Use exploration + plan to create detailed PLAN.md with specific tasks, files, steps

---

## Output Structure

The command generates an implementation plan file:

```
tasks/active/techlead/current/PLAN-[FEATURE-NAME].md
```

**Template sections:**

````markdown
# [Feature Name] Implementation Plan

Generated from: [SPEC file path]
Date: [YYYY-MM-DD]

## Overview

[Brief description of implementation approach]

## Worktree Assignment

[P] = Can run in parallel
[ ] = Sequential (has dependencies)

### [P] Worktree: [name]

Branch: feature/[name]
Focus: [What this worktree implements]

### [P] Worktree: [name]

Branch: feature/[name]
Focus: [What this worktree implements]

### [ ] Worktree: [name]

Branch: feature/[name]
Focus: [Integration - depends on above]

## Implementation Details

### Worktree 1: [name]

#### Phase 0: Schema Changes (if needed)

**Files:** app/schema.prisma, app/main.wasp

Steps:

1. [ ] Edit schema.prisma: [Changes]
2. [ ] Update main.wasp: [Entity declarations]
3. [ ] Run: wasp db migrate-dev "[Description]"
4. [ ] Run: ./scripts/safe-start.sh (MANDATORY)
5. [ ] Verify: Types in .wasp/ directory

**Coordination:** If other worktrees also modify schema, coordinate via:

- Pull latest from develop before migration
- Use separate migration for each worktree
- Communicate schema changes to team

#### Phase 1: RED (Write Tests)

**Agent:** wasp-test-automator (Haiku)

**Files:** app/src/[module]/operations.test.ts

Test cases:

- [ ] [Operation]: 401 "not authenticated"
- [ ] [Operation]: 403 "no permission"
- [ ] [Operation]: 404 (not found) - if applicable
- [ ] [Operation]: 400 "validation error"
- [ ] [Operation]: Success case
- [ ] [Operation]: Edge cases (empty, null, boundaries)

**Quality check:**

- [ ] All 5 TDD criteria PASS (see TDD-WORKFLOW.md)
- [ ] Coverage plan: ≥80% statements, ≥75% branches

**Commit:** `git commit -m "test: Add [feature] tests (RED)"`

**Expected:** Tests FAIL with meaningful errors

#### Phase 2: GREEN (Minimal Implementation)

**Agent:** wasp-code-generator (Haiku)

**Files:**

- app/src/[module]/operations.ts
- app/main.wasp (query/action declarations)

Implementation:

- [ ] [Operation 1]: [Description]

  - Type annotations: [OperationType]<[Args], [Return]>
  - Auth check: if (!context.user) throw HttpError(401)
  - Permission check: [Logic]
  - Prisma query: [Pattern]

- [ ] [Operation 2]: [Description]
  - [Same structure]

**Main.wasp updates:**

```wasp
query [queryName] {
  fn: import { [queryName] } from "@src/[module]/operations",
  entities: [[Entity1], [Entity2]]
}
```
````

**Run:**

```bash
./scripts/safe-start.sh  # Restart for main.wasp changes
wasp test client run     # Verify GREEN
```

**Commit:** `git commit -m "feat: Implement [feature]"`

**Expected:** All tests PASS

#### Phase 3: REFACTOR (Simplify)

**Agent:** wasp-refactor-executor (Haiku)

**Refactoring opportunities:**

- [ ] Extract permission checks → helper function
- [ ] Consolidate Prisma filters → buildFilter() helper
- [ ] Extract validation → validator functions
- [ ] Remove duplication between operations

**Files:** app/src/[module]/utils/

**Run:**

```bash
wasp test client run  # Verify tests STILL PASS after each refactor
```

**Commit:** `git commit -m "refactor: Extract [helpers] for [module]"`

**Expected:** Code simplified, tests still GREEN

#### Phase 4: Component Implementation (if applicable)

**Files:** app/src/[module]/[Component].tsx

**Agent:** General or wasp-code-generator (Haiku)

Components:

- [ ] [Page component]:

  - Use useQuery([queryName])
  - Handle loading, error, empty states
  - Import from wasp/client/operations

- [ ] [Shared component]:
  - Props: [Define interface]
  - Styling: ShadCN v2.3.0 components

**Run:**

```bash
wasp test client run  # Component tests (if written)
```

#### Phase 5: Integration Testing

**Files:** app/src/[module]/[integration].test.ts (if needed)

Tests:

- [ ] User flow: [Step 1] → [Step 2] → [Step 3]
- [ ] Navigation: Click → Route change → Data load

---

### Worktree 2: [name]

[Same structure as Worktree 1]

---

### Worktree 3: [name] (Integration)

**Depends on:** Worktree 1 & 2 complete

**Coordination steps:**

1. [ ] git fetch origin feature/worktree-1
2. [ ] git fetch origin feature/worktree-2
3. [ ] git merge origin/feature/worktree-1
4. [ ] git merge origin/feature/worktree-2
5. [ ] Resolve conflicts (if any)
6. [ ] Implement integration

[Implementation tasks for integration]

---

## Coordination Strategy

### Schema Changes

- Worktree 1: Migrates FIRST (add A3 fields)
- Worktree 2: Pulls worktree 1 branch, then migrates (add DocumentSection)
- Worktree 3: Pulls both branches (no schema changes)

### Merge Order

1. Worktree 1 → develop (PR #X)
2. Worktree 2 → develop (PR #Y, depends on #X)
3. Worktree 3 → develop (PR #Z, depends on #X and #Y)

### Communication Checkpoints

- [ ] Worktree 1 completes schema migration → Notify worktree 2
- [ ] Worktree 1 merges to develop → Worktree 2 pulls and merges
- [ ] Worktrees 1 & 2 merge → Worktree 3 starts

## Database Migration Plan

### Complete migration sequence:

```bash
# Worktree 1: a3-crud
cd worktree-1-path
git checkout feature/a3-crud
vim app/schema.prisma  # Add A3.status, A3.department
wasp db migrate-dev "Add status and department to A3"
./scripts/safe-start.sh
git add app/schema.prisma app/migrations/
git commit -m "feat(schema): Add status and department to A3"
git push origin feature/a3-crud

# Worktree 2: a3-sections (AFTER worktree 1 pushed)
cd worktree-2-path
git checkout feature/a3-sections
git fetch origin feature/a3-crud
git merge origin/feature/a3-crud  # Get worktree 1's schema
vim app/schema.prisma  # Add DocumentSection entity
wasp db migrate-dev "Add DocumentSection entity"
./scripts/safe-start.sh
git add app/schema.prisma app/migrations/
git commit -m "feat(schema): Add DocumentSection entity"
git push origin feature/a3-sections
```

**CRITICAL:**

- ✅ Worktree 2 MUST merge worktree 1's schema before migrating
- ✅ ALWAYS restart after schema changes (types regenerate)
- ✅ Use wasp db migrate-dev (NOT prisma migrate)

## File Structure

After implementation, expected files:

```
app/
├── schema.prisma (modified)
├── main.wasp (modified)
├── src/
│   └── [module]/
│       ├── operations.ts (new)
│       ├── operations.test.ts (new)
│       ├── utils/
│       │   ├── filters.ts (new - refactored helpers)
│       │   └── validators.ts (new - validation logic)
│       ├── [Page].tsx (new)
│       ├── [Page].spec.tsx (new - component tests)
│       └── components/
│           ├── [Component1].tsx (new)
│           └── [Component2].tsx (new)
```

## Test Coverage Plan

### Target coverage per worktree:

**Worktree 1:**

- operations.test.ts: 6 tests (auth, validation, success, filters)
- [Page].spec.tsx: 4 tests (loading, success, error, empty)
- Expected coverage: ~85% statements, ~78% branches

**Worktree 2:**

- operations.test.ts: 5 tests (auth, validation, success, edge cases)
- [Page].spec.tsx: 3 tests (loading, success, error)
- Expected coverage: ~82% statements, ~76% branches

**Worktree 3:**

- integration.test.ts: 2 tests (user flow, navigation)
- Expected coverage: Integration paths covered

## Success Criteria

### Per Worktree:

- [ ] All tests GREEN
- [ ] 5 TDD quality criteria PASS
- [ ] Coverage ≥80%/≥75%
- [ ] Wasp import rules followed
- [ ] Permission checks on all operations
- [ ] Code refactored (DRY)

### Overall:

- [ ] All worktrees merged to develop
- [ ] Integration tests pass
- [ ] No merge conflicts
- [ ] Documentation updated (if needed)

## Risk Mitigation

### Potential Issues:

**Schema conflicts:**

- **Risk:** Worktrees 1 & 2 both modify same entity field
- **Mitigation:** Coordinate via spec (define WHO changes WHAT)

**Dependency deadlock:**

- **Risk:** Worktree 2 waits for 1, but 1 is blocked
- **Mitigation:** Clear merge order, daily standup

**Test conflicts:**

- **Risk:** Integration tests fail due to worktree isolation
- **Mitigation:** Worktree 3 only starts after 1 & 2 merge

**Type errors after merge:**

- **Risk:** Types mismatch between worktrees
- **Mitigation:** ALWAYS restart after pulling schema changes

## Rollback Plan

If implementation fails:

```bash
# Rollback schema changes
git revert [migration-commit]
wasp db migrate-dev "Revert [description]"
./scripts/safe-start.sh

# Rollback code changes
git revert [feature-commit]

# Delete feature branch
git branch -D feature/[name]
git push origin :feature/[name]
```

## Timeline Estimate

**Worktree 1:**

- Schema: 30 min
- RED: 1 hour
- GREEN: 1.5 hours
- REFACTOR: 30 min
- Components: 1 hour
- **Total: ~4.5 hours**

**Worktree 2:**

- Schema: 30 min (includes coordination)
- RED: 45 min
- GREEN: 1 hour
- REFACTOR: 30 min
- Components: 1 hour
- **Total: ~3.75 hours**

**Worktree 3:**

- Integration: 1 hour
- Testing: 30 min
- **Total: ~1.5 hours**

**Overall: ~10 hours** (can run worktrees 1 & 2 in parallel → ~6 hours wall time)

## Next Steps

After this plan is approved:

1. **Generate task files:** `/breakdown PLAN-[FEATURE-NAME].md`
2. **Execute worktrees:** `/tdd-feature` in each worktree
3. **Monitor progress:** Update task files in tasks/active/

---

**Questions or concerns?** Review coordination strategy before starting implementation.

````

## Example Execution

**Command:**

```bash
/plan tasks/active/techlead/current/SPEC-DOCUMENT-MANAGEMENT.md
````

**Output PLAN (excerpt):**

````markdown
# A3 Overview & Detail Implementation Plan

Generated from: tasks/active/techlead/current/SPEC-DOCUMENT-MANAGEMENT.md
Date: 2025-10-21

## Overview

Implement A3 overview (Tier 1) and detail (Tier 2) pages using worktree-based parallel development. Worktrees 1 (a3-crud) and 2 (a3-sections) can run in parallel, followed by worktree 3 (integration) for navigation.

## Worktree Assignment

[P] = Can run in parallel
[ ] = Sequential (has dependencies)

### [P] Worktree 1: a3-crud

Branch: feature/a3-crud-operations
Focus: A3 CRUD operations + Overview page with grid/list toggle

### [P] Worktree 2: a3-sections

Branch: feature/a3-sections
Focus: DocumentSection entity + Detail page with section cards

### [ ] Worktree 3: integration

Branch: feature/a3-overview-integration
Focus: Navigation between overview and detail
Depends on: Worktrees 1 & 2 merged to develop

## Implementation Details

### Worktree 1: a3-crud

#### Phase 0: Schema Changes

**Files:** app/schema.prisma, app/main.wasp

Steps:

1. [ ] Edit schema.prisma:

   ```prisma
   model A3 {
     // Existing fields...
     + status     DocumentStatus   @default(DRAFT)
     + department Department @relation(fields: [departmentId], references: [id])
     + departmentId String
   }

   + enum DocumentStatus {
   +   DRAFT
   +   IN_PROGRESS
   +   COMPLETED
   + }
   ```
````

2. [ ] Update main.wasp:

   ```wasp
   entity A3 {=psl
     // Schema copied here
   psl=}

   entity DocumentStatus {=psl
     // Enum copied here
   psl=}
   ```

3. [ ] Run: `wasp db migrate-dev "Add status and department to A3"`
4. [ ] Run: `./scripts/safe-start.sh`
5. [ ] Verify: Check .wasp/ for DocumentStatus type

**Coordination:** First worktree to migrate - no coordination needed

#### Phase 1: RED (Write Tests)

**Agent:** wasp-test-automator (Haiku)

**Files:** app/src/a3/operations.test.ts

Test cases:

- [ ] getA3s: 401 (not authenticated)
- [ ] getA3s: 403 (user not in any department)
- [ ] getA3s: Success (returns A3s in user's departments)
- [ ] getA3s: Filter by status (only DRAFT)
- [ ] getA3s: Filter by department (specific dept)
- [ ] getA3s: Edge case (no A3s, returns empty array)

**Quality check:**

```bash
wasp test client run operations.test.ts
# Expected: 6 tests, all FAIL (not implemented yet)
```

- [ ] Criterion 1: Tests business logic (permission checks, filtering) ✓
- [ ] Criterion 2: Meaningful assertions (check names, counts) ✓
- [ ] Criterion 3: Error paths (401, 403) ✓
- [ ] Criterion 4: Edge cases (empty array) ✓
- [ ] Criterion 5: Behavior (return values, Prisma calls) ✓

**Commit:** `git commit -m "test: Add getA3s operation tests (RED)"`

#### Phase 2: GREEN (Minimal Implementation)

**Agent:** wasp-code-generator (Haiku)

**Files:** app/src/a3/operations.ts

Implementation:

- [ ] getA3s:

  ```typescript
  export const getA3s: GetA3s<GetA3sArgs, A3[]> = async (args, context) => {
    if (!context.user) throw new HttpError(401);

    const userDepts = await getUserDepartments(context.user.id);
    if (userDepts.length === 0)
      throw new HttpError(403, "No department access");

    const where = {
      departmentId: { in: userDepts.map((d) => d.id) },
      ...(args.status && { status: args.status }),
      ...(args.departmentId && { departmentId: args.departmentId }),
    };

    return await context.entities.A3.findMany({
      where,
      include: {
        department: true,
        sections: { select: { id: true } }, // For count
      },
    });
  };
  ```

**Main.wasp updates:**

```wasp
query getA3s {
  fn: import { getA3s } from "@src/a3/operations",
  entities: [A3, Department, DocumentSection]
}
```

**Run:**

```bash
./scripts/safe-start.sh  # Restart for main.wasp changes
wasp test client run operations.test.ts
# Expected: 6 tests, all PASS
```

**Commit:** `git commit -m "feat(a3): Implement getA3s with filtering"`

[... continues with REFACTOR, Components, etc.]

### Worktree 2: a3-sections

#### Phase 0: Schema Changes

**Files:** app/schema.prisma

**COORDINATION STEP:**

```bash
# MUST pull worktree 1's schema first!
git fetch origin feature/a3-crud-operations
git merge origin/feature/a3-crud-operations
```

Steps:

1. [ ] Edit schema.prisma (now includes worktree 1's changes):

   ```prisma
   model DocumentSection {
     id            String @id @default(uuid())
     a3Id          String
     sectionNumber Int
     title         String
     content       String @db.Text
     a3            A3 @relation(fields: [a3Id], references: [id], onDelete: Cascade)

     @@unique([a3Id, sectionNumber])
   }

   model A3 {
     // Existing fields from worktree 1...
     + sections DocumentSection[]
   }
   ```

2. [ ] Update main.wasp:

   ```wasp
   entity DocumentSection {=psl
     // Schema copied here
   psl=}
   ```

3. [ ] Run: `wasp db migrate-dev "Add DocumentSection entity"`
4. [ ] Run: `./scripts/safe-start.sh`

**Coordination:** Merged worktree 1's schema successfully

[... continues with RED, GREEN, REFACTOR phases...]

## Coordination Strategy

### Schema Changes

- ✅ Worktree 1: Migrates FIRST (add A3.status, A3.department)
- ✅ Worktree 2: MUST pull worktree 1, then migrate (add DocumentSection)
- ✅ Worktree 3: Pulls both (NO schema changes)

### Merge Order

1. PR #1: feature/a3-crud-operations → develop
2. PR #2: feature/a3-sections → develop (depends on #1)
3. PR #3: feature/a3-overview-integration → develop (depends on #1, #2)

### Communication Checkpoints

- [ ] Worktree 1 pushes schema changes → Slack notification
- [ ] Worktree 2 pulls and merges successfully → Confirm in standup
- [ ] Both PRs #1, #2 merged → Worktree 3 starts

[... rest of plan ...]

```

## Integration with Skills

This command leverages:

- **/wasp-operations** - Operation implementation patterns
- **/wasp-database** - Migration workflow
- **/tdd-workflow** - TDD phase structure (RED/GREEN/REFACTOR)
- **/permissions** - Permission checking logic
- **CLAUDE.md** - Worktree coordination rules

## When to Use This Command

✅ **Use for:**

- After `/specify` generates technical spec
- Features with multiple worktrees
- Complex features (3+ operations, multiple entities)
- Features requiring careful coordination

❌ **Don't use for:**

- Simple features (1 operation, no schema changes)
- Bug fixes (implementation is obvious)
- Refactorings (no new features)
- Spikes/experiments (plan locks in approach)

## Output Location

```

tasks/active/techlead/current/PLAN-[FEATURE-NAME].md

````

**Naming convention:**
- PLAN-DOCUMENT-MANAGEMENT.md
- PLAN-PRIORITY-FILTERING.md
- PLAN-USER-PERMISSIONS.md

## Success Criteria

This command completes successfully when:

1. ✅ All spec features broken into worktree-specific tasks
2. ✅ Database migration sequence defined (with coordination)
3. ✅ TDD phases mapped (RED/GREEN/REFACTOR)
4. ✅ File paths specified (where to implement)
5. ✅ Coordination strategy established ([P] markers, merge order)
6. ✅ Timeline estimated

## Next Command

After `/plan` is complete:

```bash
/breakdown PLAN-[FEATURE-NAME].md
````

This will generate daily task files in tasks/active/.

## References

- **Previous:** `/specify` command (generates spec)
- **Next:** `/breakdown` command (generates task files)
- **Parent:** Root CLAUDE.md (worktree coordination rules)
- **Skills:** /tdd-workflow, /wasp-database, /wasp-operations
