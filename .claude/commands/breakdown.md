---
description: Convert implementation plan to daily task files with [P] markers, worktree coordination notes, and TDD phase indicators.
---

# Breakdown: Plan → Daily Task Files

Convert an implementation plan into daily task files for each worktree with [P] parallel markers, coordination notes, TDD phase indicators, and agent recommendations.

## Usage

```bash
# With plan file
/breakdown tasks/active/techlead/current/PLAN-DOCUMENT-MANAGEMENT.md

# With plan name (assumes current dir)
/breakdown PLAN-DOCUMENT-SECTIONS.md

# From /plan output
/plan SPEC.md
/breakdown PLAN-[generated].md
```

## Purpose

This command transforms **implementation plans** into **executable daily task files** by:

1. ✅ Generating task files for each worktree (tasks/active/[worktree]/current/)
2. ✅ Adding [P] markers for parallel work
3. ✅ Including coordination notes between worktrees
4. ✅ Specifying TDD phases (RED/GREEN/REFACTOR)
5. ✅ Recommending which agent to use per task

**Model:** Haiku (mechanical task breakdown from structured plan)

## 🆕 Execution Workflow (MANDATORY PHASES)

This command MUST follow the **THINK → EXPLORE → PLAN → EXECUTE** pattern:

### Phase 1: 🔍 EXPLORE (MANDATORY - Task Context)

**When:** After reading PLAN, BEFORE generating task files
**Agent:** Use Task tool with `subagent_type='Explore'` and `thoroughness='quick'`

**What to explore:**

1. Check existing task file format (Read tasks/active/_/current/day-_.md)
2. Find agent invocation examples (Grep for 'Task tool' usage)
3. Review coordination note patterns (Read prior coordination examples)
4. Verify worktree directory structure (Bash: ls tasks/active/)
5. Check date/sprint format conventions (Read task templates)

**Output:** Task file format reference and current structure

**Why critical:** Ensures consistent task file formatting across worktrees

### Phase 2: 📋 PLAN (MANDATORY - Task Distribution)

**When:** After Explore completes, BEFORE writing task files
**Agent:** Use Task tool with `subagent_type='Plan'` and `model='haiku'`

**What to plan:**

1. Decide which tasks go in which worktree's day-01.md
2. Plan blocker tracking (which tasks wait for others)
3. Sequence validation steps per task
4. Design coordination note structure
5. Determine agent recommendations per task type
6. Estimate daily task capacity

**Output:** Task distribution map per worktree

**Why critical:** Balanced task distribution prevents bottlenecks

### Phase 3: ✅ EXECUTE (Generate Task Files)

**When:** After Plan completes
**Agent:** Direct Haiku execution

**What to generate:** Use task format + distribution plan to create day-XX.md files with structured tasks

---

## Output Structure

The command generates multiple task files:

```
tasks/active/
├── [worktree-1]/
│   └── current/
│       └── day-01.md (generated)
├── [worktree-2]/
│   └── current/
│       └── day-01.md (generated)
└── [worktree-3]/
    └── current/
        └── day-01.md (generated)
```

**Template per worktree:**

```markdown
# Day [XX] - Sprint [N] - [[YYYY-MM-DD]]

Generated from: [PLAN file path]
Worktree: [worktree-name]
Branch: feature/[branch-name]

## Goals

- [P] [Goal 1 - parallel with other worktrees]
- [P] [Goal 2 - parallel with other worktrees]
- [ ] [Goal 3 - sequential, depends on other worktree]

## Tasks

### [P] Task 1: [Task Name]

**Branch:** feature/[name]
**Status:** ⏳ Pending
**Parallel:** ✅ Can run simultaneously with worktree [other-worktree]
**TDD Phase:** Schema (no tests yet)
**Agent:** wasp-migration-helper

**Steps:**

1. [ ] [Detailed step 1]
2. [ ] [Detailed step 2]
3. [ ] [Detailed step 3]

**Files:**

- app/schema.prisma
- app/main.wasp

**Expected Output:**

- [What should exist after this task]

**Validation:**

- [ ] Types available in .wasp/ directory
- [ ] wasp start works without errors

---

### [P] Task 2: [Next Task]

**Branch:** feature/[name]
**Status:** ⏳ Pending
**Depends on:** Task 1 (schema must be ready)
**Parallel:** ✅ Can run simultaneously with worktree [other-worktree] Task 2
**TDD Phase:** RED
**Agent:** wasp-test-automator

[Same structure as Task 1]

---

### Task 3: [Sequential Task]

**Branch:** feature/[name]
**Status:** ⏳ Pending
**Depends on:** Worktree [other] Task 1 merged to develop
**Parallel:** ❌ Must wait for coordination
**Coordination:** Pull branch feature/[other-worktree] first

[Steps for coordination + implementation]

---

## Blockers

- None currently
- [Auto-populated if coordination is required]

## Coordination Notes

**Schema Changes:**

- [ ] Worktree [other] must push schema changes before we migrate
- [ ] Pull feature/[other-branch] before running migration

**Merge Dependencies:**

- [ ] PR #[X] must be merged before we can proceed with Task N

## Tomorrow

- Continue with GREEN phase
- Start component implementation

## References

- Plan: [PLAN file path]
- Spec: [SPEC file path]
- TDD Workflow: docs/TDD-WORKFLOW.md
```

## Example Execution

**Command:**

```bash
/breakdown tasks/active/techlead/current/PLAN-DOCUMENT-MANAGEMENT.md
```

**Input PLAN (excerpt):**

```markdown
# A3 Overview & Detail Implementation Plan

## Worktree Assignment

### [P] Worktree 1: a3-crud

Branch: feature/a3-crud-operations
Focus: A3 CRUD operations + Overview page

### [P] Worktree 2: a3-sections

Branch: feature/a3-sections
Focus: DocumentSection entity + Detail page
Coordination: Pull worktree 1's schema before migrating

### [ ] Worktree 3: integration

Branch: feature/a3-overview-integration
Depends on: Worktrees 1 & 2 merged
```

**Output Task Files:**

### File 1: tasks/active/a3-crud/current/day-01.md

````markdown
# Day 01 - Sprint 02 - [2025-10-21]

Generated from: tasks/active/techlead/current/PLAN-DOCUMENT-MANAGEMENT.md
Worktree: a3-crud
Branch: feature/a3-crud-operations

## Goals

- [P] Setup A3 schema with status and department (parallel with a3-sections)
- [P] Implement getA3s query with filtering
- [P] Create A3 overview page with grid/list toggle

## Tasks

### [P] Task 1: Add Status and Department to A3 Entity

**Branch:** feature/a3-crud-operations
**Status:** ⏳ Pending
**Parallel:** ✅ Can run simultaneously with a3-sections worktree
**TDD Phase:** Schema (no tests yet)
**Agent:** wasp-migration-helper

**Steps:**

1. [ ] Edit app/schema.prisma:

   ```prisma
   model A3 {
     // Existing fields...
     + status       DocumentStatus   @default(DRAFT)
     + department   Department @relation(fields: [departmentId], references: [id])
     + departmentId String
   }

   + enum DocumentStatus {
   +   DRAFT
   +   IN_PROGRESS
   +   COMPLETED
   + }
   ```
````

2. [ ] Update app/main.wasp (add entity declarations):

   ```wasp
   entity A3 {=psl
     // Copy schema here
   psl=}

   entity DocumentStatus {=psl
     // Copy enum here
   psl=}
   ```

3. [ ] Run migration:

   ```bash
   wasp db migrate-dev "Add status and department to A3"
   ```

4. [ ] Restart Wasp (MANDATORY - types regenerate):

   ```bash
   ./scripts/safe-start.sh
   ```

5. [ ] Verify types exist:
   ```bash
   ls .wasp/out/sdk/wasp/entities/index.ts
   # Should export DocumentStatus type
   ```

**Files:**

- app/schema.prisma (modified)
- app/main.wasp (modified)
- app/migrations/[timestamp]\_add_status_and_department_to_a3/ (generated)

**Expected Output:**

- DocumentStatus enum available in TypeScript
- A3.status field available
- A3.department relation available

**Validation:**

- [ ] `wasp start` works without errors
- [ ] Import `DocumentStatus` from @prisma/client works
- [ ] Import type `A3` from wasp/entities works

**Notes:**

- This is the FIRST schema migration for this feature
- a3-sections worktree will pull this branch later
- Coordinate via Slack when schema is pushed

---

### [P] Task 2: Write Tests for getA3s Query (RED Phase)

**Branch:** feature/a3-crud-operations
**Status:** ⏳ Pending
**Depends on:** Task 1 (schema must be ready)
**Parallel:** ✅ Can run simultaneously with a3-sections Task 2
**TDD Phase:** RED
**Agent:** wasp-test-automator

**Steps:**

1. [ ] Create app/src/a3/operations.test.ts

2. [ ] Write test cases:

   ```typescript
   import { describe, it, expect, vi } from 'vitest'
   import { getA3s } from './operations'
   import { HttpError } from 'wasp/server'
   import type { A3 } from 'wasp/entities'
   import { DocumentStatus } from '@prisma/client'

   describe('getA3s', () => {
     it('throws 401 if not authenticated', async () => { ... })
     it('throws 403 if user not in any department', async () => { ... })
     it('returns A3s in user departments', async () => { ... })
     it('filters by status correctly', async () => { ... })
     it('filters by department correctly', async () => { ... })
     it('returns empty array when no A3s exist', async () => { ... })
   })
   ```

3. [ ] Verify 5 TDD quality criteria:

   - [ ] Criterion 1: Tests business logic (permission checks, filtering) ✓
   - [ ] Criterion 2: Meaningful assertions (check A3.name, A3.status values) ✓
   - [ ] Criterion 3: Error paths (401, 403 scenarios) ✓
   - [ ] Criterion 4: Edge cases (empty array, null filters) ✓
   - [ ] Criterion 5: Behavior (return values, Prisma findMany calls) ✓

4. [ ] Run tests (expect RED):

   ```bash
   wasp test client run operations.test.ts
   # Expected: 6 tests, all FAIL (getA3s not implemented yet)
   ```

5. [ ] Commit tests:
   ```bash
   git add app/src/a3/operations.test.ts
   git commit -m "test: Add getA3s query tests (RED)"
   ```

**Files:**

- app/src/a3/operations.test.ts (new)

**Expected Output:**

- 6 failing test cases
- Tests fail for RIGHT reason (getA3s doesn't exist yet)

**Validation:**

- [ ] All 5 TDD quality criteria PASS
- [ ] Test output shows meaningful error messages
- [ ] Tests are committed (immutable)

**Notes:**

- Tests MUST be committed in RED phase (immutable)
- NEVER modify these tests during GREEN/REFACTOR phases
- If test seems wrong, STOP and discuss with team

---

### [P] Task 3: Implement getA3s Query (GREEN Phase)

**Branch:** feature/a3-crud-operations
**Status:** ⏳ Pending
**Depends on:** Task 2 (tests must exist)
**Parallel:** ✅ Can run simultaneously with a3-sections Task 3
**TDD Phase:** GREEN
**Agent:** wasp-code-generator

**Steps:**

1. [ ] Create app/src/a3/operations.ts

2. [ ] Implement getA3s query (minimal code to pass tests):

   ```typescript
   import type { GetA3s } from "wasp/server/operations";
   import type { A3 } from "wasp/entities";
   import { HttpError } from "wasp/server";

   export const getA3s: GetA3s<GetA3sArgs, A3[]> = async (args, context) => {
     if (!context.user) throw new HttpError(401);

     const userDepts = await getUserDepartments(context.user.id, context);
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
         _count: { select: { sections: true } },
       },
     });
   };
   ```

3. [ ] Add query to app/main.wasp:

   ```wasp
   query getA3s {
     fn: import { getA3s } from "@src/a3/operations",
     entities: [A3, Department]
   }
   ```

4. [ ] Restart Wasp (MANDATORY for main.wasp changes):

   ```bash
   ./scripts/safe-start.sh
   ```

5. [ ] Run tests (expect GREEN):

   ```bash
   wasp test client run operations.test.ts
   # Expected: 6 tests, all PASS
   ```

6. [ ] Commit implementation:
   ```bash
   git add app/src/a3/operations.ts app/main.wasp
   git commit -m "feat(a3): Implement getA3s query with filtering"
   ```

**Files:**

- app/src/a3/operations.ts (new)
- app/main.wasp (modified)

**Expected Output:**

- All 6 tests PASS
- getA3s available in wasp/client/operations

**Validation:**

- [ ] All tests GREEN
- [ ] No test files modified (still immutable)
- [ ] Import from wasp/client/operations works
- [ ] Implementation is minimal (no extra features)

**Notes:**

- Only write code to pass tests (minimal implementation)
- NEVER modify tests during GREEN phase
- If tests still fail, review implementation (NOT tests)

---

### [P] Task 4: Refactor getA3s (REFACTOR Phase)

**Branch:** feature/a3-crud-operations
**Status:** ⏳ Pending
**Depends on:** Task 3 (implementation must pass tests)
**Parallel:** ✅ Can run simultaneously with a3-sections Task 4
**TDD Phase:** REFACTOR
**Agent:** wasp-refactor-executor

**Steps:**

1. [ ] Identify refactoring opportunities:

   - [ ] Extract `getUserDepartments` helper (will be reused)
   - [ ] Extract filter building logic (DRY principle)

2. [ ] Create app/src/a3/utils/permissions.ts:

   ```typescript
   export async function getUserDepartments(userId: string, context: any) {
     const userDepts = await context.entities.UserDepartment.findMany({
       where: { userId },
       include: { department: true },
     });
     return userDepts.map((ud) => ud.department);
   }

   export async function requireDepartmentAccess(context: any) {
     if (!context.user) throw new HttpError(401);
     const depts = await getUserDepartments(context.user.id, context);
     if (depts.length === 0) throw new HttpError(403, "No department access");
     return depts;
   }
   ```

3. [ ] Refactor operations.ts to use helpers:

   ```typescript
   import { requireDepartmentAccess } from './utils/permissions'

   export const getA3s: GetA3s<GetA3sArgs, A3[]> = async (args, context) => {
     const userDepts = await requireDepartmentAccess(context)

     const where = buildA3Filter(args, userDepts)

     return await context.entities.A3.findMany({ where, include: {...} })
   }
   ```

4. [ ] Run tests after EACH refactor:

   ```bash
   wasp test client run operations.test.ts
   # Must stay GREEN after each change
   ```

5. [ ] Verify code is SIMPLER (fewer lines):

   ```bash
   # Before refactor: operations.ts ~40 lines
   # After refactor: operations.ts ~25 lines + utils/ ~20 lines
   # Net result: More modular, reusable helpers
   ```

6. [ ] Commit refactoring:
   ```bash
   git add app/src/a3/
   git commit -m "refactor(a3): Extract permission helpers"
   ```

**Files:**

- app/src/a3/utils/permissions.ts (new)
- app/src/a3/utils/filters.ts (new)
- app/src/a3/operations.ts (modified - simplified)

**Expected Output:**

- Code is DRY (no duplication)
- Helpers are reusable
- Tests still GREEN

**Validation:**

- [ ] All tests still PASS
- [ ] Code size reduced or modularized
- [ ] No new functionality added
- [ ] Helpers can be reused in future operations

---

### [P] Task 5: Implement A3 Overview Page

**Branch:** feature/a3-crud-operations
**Status:** ⏳ Pending
**Depends on:** Task 4 (operations must be implemented)
**Parallel:** ✅ Can run simultaneously with a3-sections Task 5
**TDD Phase:** Component (frontend)
**Agent:** General / wasp-code-generator

**Steps:**

1. [ ] Create app/src/a3/DocumentOverviewPage.tsx:

   ```tsx
   import { useQuery } from "wasp/client/operations";
   import { getA3s } from "wasp/client/operations";
   import { DocumentCard } from "./components/DocumentCard";
   import { useState } from "react";

   export default function DocumentOverviewPage() {
     const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
     const { data: a3s, isLoading, error } = useQuery(getA3s);

     if (isLoading) return <div>Loading...</div>;
     if (error) return <div>Error: {error.message}</div>;

     return (
       <div>
         <div className="flex justify-between">
           <h1>A3 Reports</h1>
           <button
             onClick={() =>
               setViewMode((v) => (v === "grid" ? "list" : "grid"))
             }
           >
             Toggle View
           </button>
         </div>
         <div
           className={
             viewMode === "grid" ? "grid grid-cols-3" : "flex flex-col"
           }
         >
           {a3s?.map((a3) => (
             <DocumentCard key={a3.id} a3={a3} viewMode={viewMode} />
           ))}
         </div>
       </div>
     );
   }
   ```

2. [ ] Create app/src/a3/components/DocumentCard.tsx (grid/list variant)

3. [ ] Add route to app/main.wasp:

   ```wasp
   route A3OverviewRoute { path: "/app/a3", to: DocumentOverviewPage }
   page DocumentOverviewPage {
     component: import { default } from "@src/a3/DocumentOverviewPage"
   }
   ```

4. [ ] Test manually:

   ```bash
   ./scripts/safe-start.sh
   # Navigate to http://localhost:3000/app/a3
   # Verify: Grid view works, toggle works, data loads
   ```

5. [ ] (Optional) Write component tests:

   ```typescript
   // app/src/a3/DocumentOverviewPage.spec.tsx
   describe('DocumentOverviewPage', () => {
     it('shows loading state initially', () => { ... })
     it('renders A3 cards when loaded', () => { ... })
     it('toggles between grid and list view', () => { ... })
   })
   ```

6. [ ] Commit component:
   ```bash
   git add app/src/a3/ app/main.wasp
   git commit -m "feat(a3): Add overview page with grid/list toggle"
   ```

**Files:**

- app/src/a3/DocumentOverviewPage.tsx (new)
- app/src/a3/components/DocumentCard.tsx (new)
- app/src/a3/components/DocumentListItem.tsx (new)
- app/main.wasp (modified)

**Expected Output:**

- Page renders at /app/a3
- Grid/list toggle works
- A3 data displays correctly

**Validation:**

- [ ] Page loads without errors
- [ ] Data from getA3s displays
- [ ] Toggle switches views
- [ ] Responsive layout works

---

## Blockers

- None currently

## Coordination Notes

**Schema Changes:**

- ✅ We are FIRST to migrate (a3-sections will pull our schema)
- [ ] Push schema changes after Task 1
- [ ] Notify a3-sections worktree via Slack

**Merge Dependencies:**

- No dependencies (we can merge to develop first)

## Tomorrow

- Start component tests (optional)
- Prepare for PR review
- Wait for a3-sections to complete before integration

## References

- Plan: tasks/active/techlead/current/PLAN-DOCUMENT-MANAGEMENT.md
- Spec: tasks/active/techlead/current/SPEC-DOCUMENT-MANAGEMENT.md
- TDD Workflow: docs/TDD-WORKFLOW.md
- Import Rules: CLAUDE.md#import-rules

````

### File 2: tasks/active/a3-sections/current/day-01.md

```markdown
# Day 01 - Sprint 02 - [2025-10-21]

Generated from: tasks/active/techlead/current/PLAN-DOCUMENT-MANAGEMENT.md
Worktree: a3-sections
Branch: feature/a3-sections

## Goals

- [ ] Wait for a3-crud schema changes (coordination required)
- [P] Create DocumentSection entity (after pulling a3-crud's schema)
- [P] Implement getDocumentById query with sections
- [P] Create A3 detail page

## Tasks

### Task 1: Pull a3-crud Schema Changes (COORDINATION)

**Branch:** feature/a3-sections
**Status:** ⏳ Pending
**Depends on:** a3-crud worktree Task 1 (schema migration)
**Parallel:** ❌ Must wait for a3-crud
**TDD Phase:** Coordination
**Agent:** Manual (git coordination)

**Steps:**
1. [ ] Wait for notification from a3-crud worktree (Slack/standup)
   - Message should say: "Schema changes pushed to feature/a3-crud-operations"

2. [ ] Fetch a3-crud branch:
   ```bash
   git fetch origin feature/a3-crud-operations
````

3. [ ] Merge a3-crud schema:

   ```bash
   git merge origin/feature/a3-crud-operations
   # This brings in A3.status, A3.department, DocumentStatus enum
   ```

4. [ ] Verify merge successful:

   ```bash
   git status
   # Should show: "All conflicts fixed" or "Already up to date"
   ```

5. [ ] Verify schema includes a3-crud changes:
   ```bash
   cat app/schema.prisma | grep "DocumentStatus"
   # Should show: enum DocumentStatus { DRAFT, IN_PROGRESS, COMPLETED }
   ```

**Files:**

- app/schema.prisma (merged from a3-crud)
- app/main.wasp (merged from a3-crud)

**Expected Output:**

- schema.prisma includes DocumentStatus enum
- schema.prisma includes A3.status field
- No merge conflicts

**Validation:**

- [ ] `git log` shows a3-crud commits
- [ ] schema.prisma has DocumentStatus
- [ ] No conflicts in app/ directory

**Notes:**

- CRITICAL: Do NOT migrate before pulling a3-crud's schema!
- If merge conflicts occur, resolve in favor of a3-crud changes
- Communicate in Slack if blocked

**Blocker:**

- ⏸️ Waiting for a3-crud Task 1 completion

---

### [P] Task 2: Add DocumentSection Entity

**Branch:** feature/a3-sections
**Status:** ⏳ Pending
**Depends on:** Task 1 (a3-crud schema merged)
**Parallel:** ✅ Can run simultaneously with a3-crud Task 2 (they work on different entities)
**TDD Phase:** Schema
**Agent:** wasp-migration-helper

**Steps:**

1. [ ] Edit app/schema.prisma (includes a3-crud's changes):

   ```prisma
   model DocumentSection {
     id            String @id @default(uuid())
     a3Id          String
     sectionNumber Int    @db.Integer
     title         String
     content       String @db.Text

     a3 A3 @relation(fields: [a3Id], references: [id], onDelete: Cascade)

     @@unique([a3Id, sectionNumber])
     @@index([a3Id])
   }

   model A3 {
     // Existing fields (including status, department from a3-crud)...
     + sections DocumentSection[]
   }
   ```

2. [ ] Update app/main.wasp:

   ```wasp
   entity DocumentSection {=psl
     // Copy schema here
   psl=}
   ```

3. [ ] Run migration:

   ```bash
   wasp db migrate-dev "Add DocumentSection entity"
   ```

4. [ ] Restart Wasp:

   ```bash
   ./scripts/safe-start.sh
   ```

5. [ ] Verify types:
   ```bash
   ls .wasp/out/sdk/wasp/entities/
   # Should have DocumentSection type
   ```

**Files:**

- app/schema.prisma (modified)
- app/main.wasp (modified)
- app/migrations/[timestamp]\_add_a3section_entity/ (generated)

**Expected Output:**

- DocumentSection entity available
- A3.sections relation available
- Types regenerated

**Validation:**

- [ ] Import type `DocumentSection` from wasp/entities works
- [ ] A3 includes sections: DocumentSection[] relation
- [ ] wasp start works without errors

**Notes:**

- This migration builds ON TOP of a3-crud's schema
- Push changes after Task 2 for integration worktree

---

[Continue with similar structure for RED/GREEN/REFACTOR/Component phases...]

## Blockers

- ⏸️ Waiting for a3-crud schema changes (Task 1)

## Coordination Notes

**Schema Dependencies:**

- [ ] a3-crud must push schema first
- [ ] Pull feature/a3-crud-operations before migrating
- [ ] Coordinate via Slack when ready

**Merge Order:**

- a3-crud merges FIRST (PR #1)
- We merge SECOND (PR #2, depends on #1)

## Tomorrow

- Continue with GREEN phase after Task 1 unblocks
- Implement getDocumentById query
- Create detail page component

## References

- Plan: tasks/active/techlead/current/PLAN-DOCUMENT-MANAGEMENT.md
- Spec: tasks/active/techlead/current/SPEC-DOCUMENT-MANAGEMENT.md
- Coordination: Wait for a3-crud Slack notification

````

### File 3: tasks/active/integration/current/day-01.md

```markdown
# Day 01 - Sprint 02 - [2025-10-21]

Generated from: tasks/active/techlead/current/PLAN-DOCUMENT-MANAGEMENT.md
Worktree: integration
Branch: feature/a3-overview-integration

## Goals

- [ ] Wait for a3-crud and a3-sections to merge to develop
- [ ] Implement navigation between overview and detail
- [ ] Integration tests

## Tasks

### Task 1: Wait for Dependencies (COORDINATION)

**Branch:** feature/a3-overview-integration
**Status:** ⏳ Pending
**Depends on:**
  - a3-crud PR merged to develop
  - a3-sections PR merged to develop
**Parallel:** ❌ Cannot start until dependencies complete
**TDD Phase:** Coordination
**Agent:** Manual

**Steps:**
1. [ ] Monitor PRs:
   - [ ] PR #1 (a3-crud) merged to develop
   - [ ] PR #2 (a3-sections) merged to develop

2. [ ] Pull latest develop:
   ```bash
   git checkout develop
   git pull origin develop
````

3. [ ] Create integration branch:

   ```bash
   git checkout -b feature/a3-overview-integration
   ```

4. [ ] Verify both features present:

   ```bash
   # Check schema has both changes
   cat app/schema.prisma | grep "DocumentStatus"
   cat app/schema.prisma | grep "DocumentSection"

   # Check operations exist
   ls app/src/a3/operations.ts
   ```

**Expected Output:**

- develop branch has both features
- No conflicts
- Both operations available

**Validation:**

- [ ] wasp start works
- [ ] /app/a3 page loads (from a3-crud)
- [ ] getDocumentById available (from a3-sections)

**Blocker:**

- ⏸️ Waiting for PR #1 and #2 to merge

**Notes:**

- Do NOT start this worktree until both PRs merged
- Estimate: Can start in 2-3 days (after a3-crud and a3-sections complete)

---

[Integration tasks will be added once dependencies are met]

## Blockers

- ⏸️ Waiting for a3-crud PR #1 merge
- ⏸️ Waiting for a3-sections PR #2 merge

## Coordination Notes

**Dependencies:**

- This worktree CANNOT start until others complete
- Monitor daily standup for merge status
- Estimated start: Day 03 or Day 04

## Tomorrow

- Continue waiting
- Review a3-crud and a3-sections code for integration points

## References

- Plan: tasks/active/techlead/current/PLAN-DOCUMENT-MANAGEMENT.md
- Watch: PR #1 (a3-crud), PR #2 (a3-sections)

```

## Integration with Skills

This command leverages:

- **/tdd-workflow** - TDD phase structure for task breakdown
- **tasks/CLAUDE.md** - Task template format
- **CLAUDE.md** - Worktree coordination rules, import rules

## When to Use This Command

✅ **Use for:**

- After `/plan` generates implementation plan
- Features with 2+ worktrees
- Sprints requiring coordinated parallel work
- Features with clear task dependencies

❌ **Don't use for:**

- Simple features (1 worktree, straightforward tasks)
- Ad-hoc bug fixes (not planned work)
- Exploratory spikes (tasks aren't clear yet)

## Output Location

```

tasks/active/
├── [worktree-1]/current/day-[XX].md
├── [worktree-2]/current/day-[XX].md
└── [worktree-3]/current/day-[XX].md

````

**Naming convention:**
- day-01.md, day-02.md, etc. (sequential)
- One file per worktree

## Success Criteria

This command completes successfully when:

1. ✅ Task file created for each worktree
2. ✅ [P] markers added for parallel tasks
3. ✅ Coordination notes included (schema dependencies, merge order)
4. ✅ TDD phases specified (RED/GREEN/REFACTOR)
5. ✅ Agent recommendations provided
6. ✅ Exact file paths specified
7. ✅ Validation steps included

## Next Command

After `/breakdown` is complete:

```bash
# Execute tasks in each worktree
cd worktree-1-path
/tdd-feature "Implement getA3s with filtering"

cd worktree-2-path
/tdd-feature "Implement DocumentSection and detail view"
````

## References

- **Previous:** `/plan` command (generates plan)
- **Next:** `/tdd-feature` command (executes tasks)
- **Template:** tasks/templates/daily-task.md
- **Guide:** tasks/CLAUDE.md (task management workflow)
