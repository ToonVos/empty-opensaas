---
description: Convert PRD to technical specification with Wasp constraints, worktree distribution strategy, and test requirements.
---

# Specify: PRD → Technical Spec

Convert a Product Requirements Document (PRD) into a detailed technical specification with Wasp-specific constraints, worktree distribution strategy, and test coverage requirements.

## Usage

```bash
# With PRD file path
/specify tasks/active/techlead/PRD-SPRINT-02-DOCUMENT-MANAGEMENT.md

# With PRD in current directory
/specify PRD-DOCUMENT-SECTIONS.md

# Inline (for quick specs)
/specify "Add priority filtering to reports with HIGH/MEDIUM/LOW enum"
```

## Purpose

This command bridges the gap between **business requirements** (PRD) and **technical implementation** by:

1. ✅ Translating user stories → Technical features
2. ✅ Identifying Wasp-specific constraints (imports, auth, entities)
3. ✅ Defining worktree distribution strategy ([P] parallel work)
4. ✅ Specifying test coverage requirements (5 TDD criteria)
5. ✅ Establishing acceptance criteria for review

**Model:** Sonnet (requires technical reasoning and Wasp framework knowledge)

## 🆕 Execution Workflow (MANDATORY PHASES)

This command MUST follow the **THINK → EXPLORE → PLAN → EXECUTE** pattern:

### Phase 1: 🔍 EXPLORE (MANDATORY - Before Technical Decisions)

**When:** Immediately after reading PRD, BEFORE any technical decisions
**Agent:** Use Task tool with `subagent_type='Explore'` and `thoroughness='very thorough'`

**What to explore:**

1. Find similar features for pattern reference (Grep for operations patterns)
2. Analyze existing entity relationships (Read schema.prisma + main.wasp)
3. Review permission checking patterns (Read permissions helpers)
4. Examine error handling conventions (Read error-handling templates)
5. Identify reusable components (Glob for component patterns)
6. Check current worktree branches (Bash: git branch -a)

**Output:** Architecture context document with patterns, entities, constraints

**Why critical:** Ensures technical decisions align with existing codebase architecture

### Phase 2: 📋 PLAN (MANDATORY - Before Writing SPEC)

**When:** After Explore completes, BEFORE writing SPEC
**Agent:** Use Task tool with `subagent_type='Plan'` and `model='sonnet'`

**What to plan:**

1. Decide which entities need creation vs modification
2. Plan worktree distribution (which features can be parallel)
3. Design operation signatures (args/returns)
4. Strategize database migration sequence
5. Define test scenario coverage
6. Identify coordination points between worktrees

**Output:** Technical plan with worktree assignments, dependencies, migration order

**Why critical:** Strategic planning prevents rework and coordination issues

### Phase 3: ✅ EXECUTE (Generate SPEC)

**When:** After Plan completes
**Agent:** Direct Sonnet execution (not via Task tool)

**What to generate:** Use exploration findings + technical plan to create comprehensive SPEC.md

---

## Output Structure

The command generates a technical specification file:

```
tasks/active/techlead/current/SPEC-[FEATURE-NAME].md
```

**Template sections:**

````markdown
# [Feature Name] Technical Specification

Generated from: [PRD file path]
Date: [YYYY-MM-DD]

## Feature Overview

[High-level summary: What problem does this solve? What value does it provide?]

## User Stories Covered

- [ ] User story 1 from PRD
- [ ] User story 2 from PRD
- [ ] User story 3 from PRD

## Technical Constraints (Wasp-Specific)

### Import Rules

- MUST use `wasp/entities` for entity types
- MUST use `@prisma/client` for enum runtime values
- MUST use relative paths in .ts/.tsx files
- MUST use `@src/...` in main.wasp only

### Navigation

- 2-level top navigation (NO sidebar)
- Tier 1: Overview (grid/list)
- Tier 2: Detail (read-only)
- Tier 3: Editor (edit mode)

### Authentication & Permissions

- MUST check `context.user` (401 if null)
- MUST verify department access (403 if no permission)
- Roles: VIEWER (read), MEMBER (edit), MANAGER (delete)

### Error Handling

- 401: Not authenticated
- 403: No permission
- 404: Resource not found
- 400: Validation error

## Entities Required

### New Entities

- [EntityName]: [Description]
  - Field 1: Type
  - Field 2: Type
  - Relations: [Related entities]

### Modified Entities

- [EntityName]: Add [fields/relations]

## Operations Required

### Queries

- `getThings`: [Description]
  - Args: { filters }
  - Returns: Thing[]
  - Auth: VIEWER+

### Actions

- `createThing`: [Description]
  - Args: { data }
  - Returns: Thing
  - Auth: MEMBER+

## Components Required

### Pages

- `ThingsOverviewPage.tsx`: Tier 1 view (grid/list)
- `ThingDetailPage.tsx`: Tier 2 view (read-only)
- `ThingEditorPage.tsx`: Tier 3 view (edit mode)

### Shared Components

- `ThingCard.tsx`: Grid item
- `ThingListItem.tsx`: List item
- `ThingForm.tsx`: Edit form

## Worktree Distribution Strategy

### [P] Worktree 1: [name] (Parallel)

**Branch:** feature/[name]
**Focus:** [Core functionality]
**Tasks:**

- [ ] Task 1
- [ ] Task 2

### [P] Worktree 2: [name] (Parallel)

**Branch:** feature/[name]
**Focus:** [Related functionality]
**Tasks:**

- [ ] Task 1
- [ ] Task 2

### Worktree 3: [name] (Sequential - depends on 1 & 2)

**Branch:** feature/[name]
**Focus:** [Integration]
**Tasks:**

- [ ] Task 1
- [ ] Task 2

**Coordination Notes:**

- Worktree 1 & 2 can run in parallel (no shared entities)
- Worktree 3 must wait for 1 & 2 schema changes to be merged
- Schema changes: Coordinate via feature branches (pull before migrate)

## Test Coverage Requirements

### Test Quality Criteria (ALL 5 MUST PASS)

1. ✅ Tests business logic (NOT existence checks)
2. ✅ Meaningful assertions (specific values, NOT `.toBeDefined()`)
3. ✅ Error paths tested (401, 403, 404, 400 scenarios)
4. ✅ Edge cases tested (empty values, boundaries, special chars)
5. ✅ Behavior tested (return values/side effects, NOT internals)

### Coverage Thresholds

- Statements: ≥80%
- Branches: ≥75%
- Functions: ≥80%
- Lines: ≥80%

### Test Scenarios Required

**Auth scenarios:**

- [ ] 401: Not authenticated (context.user = null)
- [ ] 403: No department permission

**Validation scenarios:**

- [ ] 400: Required field missing
- [ ] 400: Invalid enum value
- [ ] 400: Data format error

**Edge cases:**

- [ ] Empty results (no data)
- [ ] Boundary values (min/max)
- [ ] Special characters in input

**Success scenarios:**

- [ ] Happy path (normal input)
- [ ] With filters/options
- [ ] Multiple results

## Acceptance Criteria

**Functional:**

- [ ] User can [action] successfully
- [ ] Correct data is displayed
- [ ] Navigation flows work

**Technical:**

- [ ] All Wasp import rules followed
- [ ] Permission checks on all operations
- [ ] Error handling for all failure modes
- [ ] Database migration successful

**Quality:**

- [ ] All tests pass (GREEN)
- [ ] 5 TDD quality criteria met
- [ ] Coverage ≥80%/≥75%
- [ ] Code refactored (DRY, clear names)

## Database Migration Plan

```bash
# Worktree 1: Add/modify entities
1. Edit app/schema.prisma
2. wasp db migrate-dev "Description"
3. ./scripts/safe-start.sh (MANDATORY)

# Worktree 2: Pull worktree 1's schema changes
1. git fetch origin feature/worktree-1-branch
2. git merge origin/feature/worktree-1-branch
3. Edit app/schema.prisma (add your entities)
4. wasp db migrate-dev "Description"
5. ./scripts/safe-start.sh
```
````

## Design System Notes

**Colors:**

- Primary: [Specify if custom colors needed]
- Status colors: Use Wasp defaults

**Components:**

- Use ShadCN v2.3.0 ONLY (locked version)
- Fix import path after install: `s/lib/utils` → `../../lib/utils`

**Layout:**

- Top nav: 2 levels (no sidebar)
- Grid: 3 columns (desktop), 1 column (mobile)
- Cards: Consistent padding/spacing

## Security Considerations

**CRITICAL:**

- ✅ Server-side auth ONLY (client checks = cosmetic)
- ✅ Never save passwords as plain text (use Wasp auth)
- ✅ Database URL via env() (NEVER hardcode)
- ✅ Secrets in .env.server (NEVER commit)

**Multi-tenant isolation:**

- [ ] All queries filtered by department
- [ ] Permission checks on all mutations
- [ ] User can only access their org's data

## Next Steps

After this spec is approved:

1. **Generate plan:** `/plan SPEC-[FEATURE-NAME].md`
2. **Generate tasks:** `/breakdown PLAN-[FEATURE-NAME].md`
3. **Execute:** `/tdd-feature` in each worktree

---

**Questions or concerns?** Review with team before proceeding to /plan.

````

## Example Execution

**Command:**

```bash
/specify tasks/active/techlead/PRD-SPRINT-02-DOCUMENT-MANAGEMENT.md
````

**Input PRD (excerpt):**

```markdown
# PRD: A3 Overview & Detail Pages

## User Stories

- As a manager, I want to see all reports in my department
- As a viewer, I want to view A3 report details
- As a member, I want to click on a report to see full details

## Acceptance Criteria

- Overview page shows grid/list toggle
- Cards show: title, status, owner, department
- Click card → navigate to detail page
- Detail page shows all 8 sections read-only
```

**Output SPEC:**

````markdown
# A3 Overview & Detail Technical Specification

Generated from: tasks/active/techlead/PRD-SPRINT-02-DOCUMENT-MANAGEMENT.md
Date: 2025-10-21

## Feature Overview

Implement Tier 1 (Overview) and Tier 2 (Detail) pages for reports following the 3-tier navigation pattern. Users can view reports in grid or list format, and click to view full details.

## User Stories Covered

- [ ] Manager: View all department reports
- [ ] Viewer: View A3 report details
- [ ] Member: Navigate from overview to detail

## Technical Constraints (Wasp-Specific)

### Import Rules

- MUST use `wasp/entities` for A3, Department types
- MUST use `@prisma/client` for DocumentStatus enum runtime values
- MUST use relative paths in .ts/.tsx files

### Navigation

- Tier 1: /app/a3 (Overview - grid/list)
- Tier 2: /app/a3/:id (Detail - read-only)
- Tier 3: /app/a3/:id/edit (Editor - future sprint)

### Authentication & Permissions

- getA3s: VIEWER+ in user's departments
- getDocumentById: VIEWER+ in A3's department
- 401 if not authenticated
- 403 if not in A3's department

## Entities Required

### Modified Entities

- A3: Add sections relation
  - sections: DocumentSection[] (one-to-many)
  - status: DocumentStatus (DRAFT, IN_PROGRESS, COMPLETED)
  - department: Department (many-to-one)

### New Entities

- DocumentSection:
  - id: String
  - a3Id: String
  - sectionNumber: Int (1-8)
  - title: String
  - content: String
  - a3: A3 (relation)

## Operations Required

### Queries

- `getA3s`: Get all reports user can view

  - Args: { departmentId?: string, status?: DocumentStatus }
  - Returns: A3[] with section count
  - Auth: VIEWER+ in department

- `getDocumentById`: Get single A3 with all sections
  - Args: { id: string }
  - Returns: A3 with sections[]
  - Auth: VIEWER+ in A3's department

## Components Required

### Pages

- `DocumentOverviewPage.tsx`: Grid/list view with toggle
- `DocumentDetailPage.tsx`: Read-only detail with 8 sections

### Shared Components

- `DocumentCard.tsx`: Grid item (title, status, owner, dept)
- `DocumentListItem.tsx`: List item (same data, different layout)
- `DocumentSectionCard.tsx`: Section display (read-only)

## Worktree Distribution Strategy

### [P] Worktree 1: a3-crud (Parallel)

**Branch:** feature/a3-crud-operations
**Focus:** A3 CRUD operations + Overview grid
**Tasks:**

- [ ] Add status, department to A3 entity
- [ ] Create getA3s query
- [ ] Create DocumentOverviewPage with grid/list toggle
- [ ] Tests: getA3s (401, 403, success, filters)

### [P] Worktree 2: a3-sections (Parallel)

**Branch:** feature/a3-sections
**Focus:** DocumentSection entity + Detail view
**Tasks:**

- [ ] Create DocumentSection entity
- [ ] Create getDocumentById query (includes sections)
- [ ] Create DocumentDetailPage with section cards
- [ ] Tests: getDocumentById (401, 403, 404, success)

### Worktree 3: integration (Sequential - depends on 1 & 2)

**Branch:** feature/a3-overview-integration
**Focus:** Navigation between overview and detail
**Tasks:**

- [ ] Add navigation: Card click → /app/a3/:id
- [ ] Add back button: Detail → Overview
- [ ] Integration tests: Full user flow

**Coordination Notes:**

- Worktree 1 & 2 can run in parallel (different entities)
- Worktree 2 MUST pull worktree 1's schema changes before adding DocumentSection
- Schema coordination: Use feature branches

## Test Coverage Requirements

### Test Quality Criteria (ALL 5 MUST PASS)

1. ✅ Tests business logic (permission checks, filtering)
2. ✅ Meaningful assertions (verify names, counts, relations)
3. ✅ Error paths tested (401, 403, 404, 400)
4. ✅ Edge cases tested (no A3s, empty filters, missing sections)
5. ✅ Behavior tested (return values, Prisma calls, UI rendering)

### Coverage Thresholds

- Statements: ≥80%
- Branches: ≥75%

### Test Scenarios Required

**getA3s:**

- [ ] 401: Not authenticated
- [ ] 403: User not in any department
- [ ] Success: Returns A3s in user's departments
- [ ] Filter: By status
- [ ] Filter: By department
- [ ] Edge: No A3s (empty array)

**getDocumentById:**

- [ ] 401: Not authenticated
- [ ] 403: User not in A3's department
- [ ] 404: A3 not found
- [ ] Success: Returns A3 with all 8 sections
- [ ] Edge: A3 with 0 sections (possible?)

**DocumentOverviewPage:**

- [ ] Loading state
- [ ] Success: Renders grid
- [ ] Toggle: Switch to list view
- [ ] Error: Shows error message
- [ ] Empty: Shows "no A3s" message

**DocumentDetailPage:**

- [ ] Loading state
- [ ] Success: Renders all sections
- [ ] Error: Shows error message
- [ ] 404: Shows "not found" message

## Acceptance Criteria

**Functional:**

- [ ] Manager can view all department reports
- [ ] Grid view shows cards with title/status/owner/dept
- [ ] List view shows same data (different layout)
- [ ] Click card navigates to /app/a3/:id
- [ ] Detail page shows all 8 sections read-only

**Technical:**

- [ ] Wasp import rules followed (wasp/entities, @prisma/client)
- [ ] Permission checks on getA3s, getDocumentById
- [ ] Error handling: 401, 403, 404
- [ ] Database migrations successful

**Quality:**

- [ ] All tests GREEN
- [ ] 5 TDD quality criteria met
- [ ] Coverage ≥80%/≥75%
- [ ] Code refactored (no duplication)

## Database Migration Plan

```bash
# Worktree 1: a3-crud
1. Edit app/schema.prisma:
   model A3 {
     + status     DocumentStatus @default(DRAFT)
     + department Department @relation(...)
   }
2. wasp db migrate-dev "Add status and department to A3"
3. ./scripts/safe-start.sh

# Worktree 2: a3-sections
1. git fetch origin feature/a3-crud-operations
2. git merge origin/feature/a3-crud-operations
3. Edit app/schema.prisma:
   model DocumentSection {
     id            String @id @default(uuid())
     a3Id          String
     sectionNumber Int
     title         String
     content       String
     a3            A3 @relation(fields: [a3Id], references: [id])
   }
4. wasp db migrate-dev "Add DocumentSection entity"
5. ./scripts/safe-start.sh
```
````

## Design System Notes

**Layout:**

- Overview: 3-column grid (desktop), 1-column (mobile)
- Detail: Single column with section cards
- Cards: Consistent 16px padding

**Components:**

- Use ShadCN v2.3.0 Card component
- Fix import after install: `../../lib/utils`

## Security Considerations

**Multi-tenant isolation:**

- [ ] getA3s filtered by user's departments
- [ ] getDocumentById checks user is in A3's department
- [ ] All operations server-side (NOT client-side checks)

## Next Steps

1. Review this spec with team
2. **Generate plan:** `/plan SPEC-DOCUMENT-MANAGEMENT.md`
3. **Generate tasks:** `/breakdown PLAN-DOCUMENT-MANAGEMENT.md`
4. **Execute:** `/tdd-feature` in each worktree

```

## Integration with Skills

This command leverages:

- **/wasp-operations** - Operation patterns for spec generation
- **/permissions** - Permission checking patterns
- **/error-handling** - HTTP status codes and error scenarios
- **CLAUDE.md** - Import rules, navigation patterns, design system

## When to Use This Command

✅ **Use for:**

- Complex features (multiple entities/operations)
- Features requiring worktree coordination
- Features with unclear technical approach
- Sprint planning (spec first, then plan/tasks)

❌ **Don't use for:**

- Simple bug fixes (overkill)
- Trivial features (single operation/component)
- Refactorings (no new functionality)
- Experimental spikes (spec locks in approach)

## Output Location

```

tasks/active/techlead/current/SPEC-[FEATURE-NAME].md

````

**Naming convention:**
- SPEC-DOCUMENT-MANAGEMENT.md
- SPEC-PRIORITY-FILTERING.md
- SPEC-USER-PERMISSIONS.md

## Success Criteria

This command completes successfully when:

1. ✅ All PRD user stories mapped to technical features
2. ✅ Wasp-specific constraints identified and documented
3. ✅ Worktree distribution strategy clear ([P] markers)
4. ✅ Test requirements specified (5 criteria + scenarios)
5. ✅ Database migration plan defined
6. ✅ Acceptance criteria established

## Next Command

After `/specify` is complete:

```bash
/plan SPEC-[FEATURE-NAME].md
````

This will generate the detailed implementation plan.

## References

- **Parent:** Root CLAUDE.md (import rules, navigation patterns)
- **Next:** `/plan` command (implementation planning)
- **Docs:** docs/TDD-WORKFLOW.md (test quality criteria)
- **Skills:** /wasp-operations, /permissions, /error-handling
