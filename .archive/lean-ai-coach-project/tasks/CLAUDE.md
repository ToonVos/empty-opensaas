# Task Management Guide

**AUTO-LOADED**: This file is automatically loaded by Claude Code when you work with files in the `tasks/` directory.

**Parent context**: Root CLAUDE.md provides project overview, import rules, code style, and testing rules.

---

## Daily Task Workflow

### CREATE Daily Task File

```bash
# COPY template
cp tasks/templates/daily-task.md tasks/active/{your-worktree}/current/day-01.md

# EDIT with today's goals and tasks
vim tasks/active/{your-worktree}/current/day-01.md
```

### Daily Task Format (USE THIS EXACTLY)

```markdown
# Day XX - Sprint N - [YYYY-MM-DD]

## Goals

- [ ] Goal 1
- [ ] Goal 2
- [ ] Goal 3

## Tasks

### Task 1: [Task Name]

**Branch:** feature/TL-description
**Status:** ⏳ In Progress | ✅ Done | ❌ Blocked

**Steps:**

1. [ ] Step 1
2. [ ] Step 2
3. [ ] Step 3

**Notes:**

- Note 1
- Note 2

---

### Task 2: [Next Task]

...

## Blockers

- None | List blockers here

## Learnings

- Learning 1
- Learning 2

## Tomorrow

- Plan for tomorrow
```

### Daily Workflow (DO THIS)

**Morning:**

1. CREATE or UPDATE day-XX.md
2. LIST goals for today
3. BREAK DOWN into specific tasks

**During Day:**

1. CHECK OFF completed items
2. ADD notes and learnings
3. UPDATE blockers

**End of Day:**

1. REVIEW what's done
2. PLAN tomorrow
3. COMMIT progress:

```bash
git add tasks/active/{your-worktree}/current/day-XX.md
git commit -m "docs(tasks): day XX progress"
```

---

## Sprint Workflow

### Sprint Planning (Start of Sprint)

```bash
# CREATE sprint directory
mkdir tasks/sprints/sprint-N

# COPY template
cp tasks/templates/sprint-planning.md tasks/sprints/sprint-N/planning.md

# EDIT with sprint goals
vim tasks/sprints/sprint-N/planning.md
```

### Sprint Planning Format

```markdown
# Sprint N Planning

**Dates:** YYYY-MM-DD to YYYY-MM-DD (2 weeks)

**Sprint Goal:**
[One sentence main objective]

## User Stories

### Story 1: [Story Name]

**As a** [role]
**I want** [feature]
**So that** [benefit]

**Acceptance Criteria:**

- [ ] Criterion 1
- [ ] Criterion 2

**Estimate:** X points
**Assigned:** [Name] (feature/XX-description)

## Capacity

- TechLead: 40 hours = ~10 points
- Backend: 40 hours = ~10 points
- Frontend: 40 hours = ~10 points

**Total:** 120 hours = ~30 story points
```

### Sprint End (Last Day of Sprint)

```bash
# 1. WRITE retrospective
cp tasks/templates/retrospective.md tasks/sprints/sprint-N/retrospective.md
vim tasks/sprints/sprint-N/retrospective.md

# 2. ARCHIVE sprint
MONTH=$(date +%Y-%m)
mkdir -p tasks/archive/$MONTH
mv tasks/sprints/sprint-N tasks/archive/$MONTH/

# 3. ARCHIVE current tasks
mv tasks/active/{your-worktree}/current tasks/archive/$MONTH/{your-worktree}/
mkdir tasks/active/{your-worktree}/current

# 4. COMMIT archive
git add tasks/archive/$MONTH/
git commit -m "docs(tasks): archive sprint N"
```

### Retrospective Format

```markdown
# Sprint N Retrospective

**Date:** YYYY-MM-DD

## What Went Well ✅

- Item 1
- Item 2

## What Didn't Go Well ❌

- Item 1
- Item 2

## Action Items 🎯

| Action   | Owner | Deadline | Status     |
| -------- | ----- | -------- | ---------- |
| Action 1 | Name  | Date     | ⏳ Pending |

## Metrics 📊

- **Velocity:** Y/X points = Z%
- **Test coverage:** X%
- **Bugs:** N found, M fixed
```

---

## Sprintdag Directory Structure & TDD Artifacts (NEW)

### Overview

**Phased TDD commands** (`/red-tdd`, `/green-tdd`, `/refactor-tdd`, `/security-tdd`) automatically detect your sprintdag directory and store artifacts there.

**Why?** All artifacts stay with the sprint context where they were created - no cleanup needed, everything archived together at sprint end.

### Sprintdag Directory Structure

```
tasks/sprints/sprint-3/
├── planning.md                      # Sprint planning
├── retrospective.md                 # Sprint retrospective
├── day-01/                          # Monday
│   └── README.md                    # Feature doelstelling
├── day-02/                          # Tuesday - Feature: Priority filtering
│   ├── README.md                    # "Implement priority filtering for A3 tasks"
│   ├── tests/                       # Created by /red-tdd
│   │   ├── test-plan.md            # Test strategy document
│   │   ├── test-suite-map.md       # Test unit boundaries (if multi-file)
│   │   ├── coverage-targets.json   # Expected coverage metrics
│   │   └── test-strategy-*.md      # Component-specific strategies
│   ├── implementation/              # Created by /green-tdd
│   │   ├── implementation-notes.md # Implementation decisions
│   │   ├── coverage-actual.json    # Actual coverage achieved
│   │   ├── green-failures.md       # Failure diagnosis (if failures occurred)
│   │   └── schema-coordination.md  # Multi-worktree notes (if schema changed)
│   ├── refactor/                    # Created by /refactor-tdd
│   │   ├── refactor-report.md      # Refactoring summary
│   │   ├── refactor-metrics.json   # LOC delta, complexity reduction
│   │   ├── complexity-analysis.md  # Before/after complexity
│   │   └── refactor-patterns.md    # Proven patterns applied
│   └── security/                    # Created by /security-tdd
│       ├── security-audit-[date].md # Complete OWASP audit report
│       ├── owasp-compliance.md      # OWASP Top 10 coverage matrix
│       └── security-risks.json      # Risk register (CRITICAL/HIGH/MEDIUM/LOW)
├── day-03/                          # Wednesday
│   └── README.md
├── day-04/                          # Thursday
│   └── README.md
└── day-05/                          # Friday
    └── README.md
```

### Directory Detection (Automatic)

**TDD commands automatically detect sprintdag directory:**

```bash
# Working in sprintdag directory (RECOMMENDED)
cd tasks/sprints/sprint-3/day-02/
/red-tdd "Add priority filtering"
# → Detects: tasks/sprints/sprint-3/day-02/
# → Creates: day-02/tests/ subdirectory

# Working from project root (fallback)
/red-tdd "Add priority filtering"
# → Prompts: Not in sprintdag directory, use project root?
# → User confirms or cancels
```

### Workflow Example

```bash
# Sprint 3, Day 2: Priority filtering feature
cd tasks/sprints/sprint-3/day-02/

# Step 0: Create feature doelstelling (MANDATORY before /red-tdd)
echo "Implement priority filtering for A3 tasks" > README.md

# Step 1: RED phase (write tests)
/red-tdd "Add priority filtering to tasks"
# → Creates: day-02/tests/test-plan.md
# → Creates: day-02/tests/coverage-targets.json
# → Commits: test: Add priority filtering tests (RED)

# Step 2: GREEN phase (implement)
/green-tdd "priority-filtering"
# → Reads: day-02/tests/test-plan.md (for guidance)
# → Creates: day-02/implementation/implementation-notes.md
# → Creates: day-02/implementation/coverage-actual.json
# → Commits: feat: Implement priority filtering

# Step 3: REFACTOR phase (improve code)
/refactor-tdd "priority-filtering"
# → Reads: day-02/implementation/implementation-notes.md (for known issues)
# → Creates: day-02/refactor/refactor-report.md
# → Creates: day-02/refactor/refactor-metrics.json
# → Commits: refactor: Simplify priority filtering

# Step 4: SECURITY phase (audit)
/security-tdd "priority-filtering"
# → Reads: ALL prior artifacts (tests/, implementation/, refactor/)
# → Creates: day-02/security/security-audit-2025-11-06.md
# → Creates: day-02/security/owasp-compliance.md
# → Commits: docs: Add security audit for priority filtering

# Step 5: Day complete - Close day-02, open day-03
cd ../day-03/
echo "Next feature description" > README.md
```

### Artifact Benefits

**Why this structure?**

1. **Context Preservation** - All artifacts stay with sprintdag where created
2. **No Cleanup Needed** - Sprint archiving handles everything at once
3. **Traceability** - Review what happened on specific day months later
4. **Cross-Phase Integration** - Each command reads prior artifacts for guidance
5. **Parallel Development** - Multiple worktrees can work on different days simultaneously

### Cross-Phase Artifact Usage

**Each TDD command reads artifacts from previous commands:**

| Command             | Reads From                               | Why                                                |
| ------------------- | ---------------------------------------- | -------------------------------------------------- |
| **`/green-tdd`**    | `tests/test-plan.md`                     | Implementation guidance (test scenarios, patterns) |
| **`/green-tdd`**    | `tests/coverage-targets.json`            | Coverage validation (actual vs expected)           |
| **`/refactor-tdd`** | `implementation/implementation-notes.md` | Refactoring guidance (known duplication, hotspots) |
| **`/refactor-tdd`** | `implementation/coverage-actual.json`    | Coverage baseline (must not decrease)              |
| **`/security-tdd`** | `tests/test-plan.md`                     | Expected security scenarios (auth tests)           |
| **`/security-tdd`** | `implementation/implementation-notes.md` | Implementation details (patterns used)             |
| **`/security-tdd`** | `refactor/refactor-report.md`            | Final code state (complexity, helpers)             |

### Prerequisites Per Command

**Each command validates artifacts before starting:**

- **`/red-tdd`** requires: README.md (feature doelstelling)
- **`/green-tdd`** requires: tests/ directory (from /red-tdd)
- **`/refactor-tdd`** requires: implementation/ directory (from /green-tdd)
- **`/security-tdd`** requires: implementation/ directory (minimum)

**Validation gates prevent running commands out of order.**

### Sprint Archiving (No Changes Needed)

**Existing sprint archiving process handles TDD artifacts automatically:**

```bash
# End of Sprint 3
MONTH=$(date +%Y-%m)
mkdir -p tasks/archive/$MONTH
mv tasks/sprints/sprint-3 tasks/archive/$MONTH/

# Result: Entire sprint-3/ directory archived (including all TDD artifacts)
# → tasks/archive/2025-11/sprint-3/day-02/tests/
# → tasks/archive/2025-11/sprint-3/day-02/implementation/
# → tasks/archive/2025-11/sprint-3/day-02/refactor/
# → tasks/archive/2025-11/sprint-3/day-02/security/
```

**No separate cleanup for TDD artifacts - everything archived together!**

### Parallel Development (Multi-Worktree)

**Phased TDD commands enable parallel feature development:**

```bash
# Worktree 1 (Dev1): Day 02 - Unit A
cd path/to/Dev1/tasks/sprints/sprint-3/day-02/
/red-tdd "A3 CRUD operations"
/green-tdd "A3-CRUD"
/refactor-tdd "A3-CRUD"

# Worktree 2 (Dev2): Day 03 - Unit B (parallel)
cd path/to/Dev2/tasks/sprints/sprint-3/day-03/
/red-tdd "A3 Section entity"
/green-tdd "A3-Section"
/refactor-tdd "A3-Section"

# Worktree 3 (TechLead): Day 04 - Integration
cd path/to/TechLead/tasks/sprints/sprint-3/day-04/
/security-tdd "A3 Overview & Detail feature"
# → Reads artifacts from BOTH day-02 and day-03
# → Creates comprehensive security report
```

### When to Use Phased TDD Commands

**Decision tree:**

```
Feature size?
├─ Small (<5 operations, <500 LOC) → Use /tdd-feature (unified, no artifacts)
└─ Large (>5 operations, >500 LOC) → Use phased commands (with artifacts)
   ├─ /red-tdd → tests/ artifacts
   ├─ /green-tdd → implementation/ artifacts
   ├─ /refactor-tdd → refactor/ artifacts
   └─ /security-tdd → security/ artifacts
```

**Unified `/tdd-feature` doesn't create artifacts** - only use for small features where artifact overhead isn't justified.

### See Also

- **TDD workflow:** [docs/TDD-WORKFLOW.md](../docs/TDD-WORKFLOW.md) - Complete TDD guide with phased approach
- **Command docs:** `.claude/commands/red-tdd.md`, `.claude/commands/green-tdd.md`, `.claude/commands/refactor-tdd.md`, `.claude/commands/security-tdd.md`
- **CLAUDE.md:** TDD workflow section for unified vs phased comparison

---

## Documentation Lifecycle

### WHERE to Document

| Stage       | Location                                      | When to Use                    |
| ----------- | --------------------------------------------- | ------------------------------ |
| **DRAFT**   | `tasks/active/{worktree}/current/notes.md`    | Quick notes, brainstorming     |
| **REVIEW**  | `tasks/active/{worktree}/current/proposal.md` | Structured proposal            |
| **STABLE**  | `docs/FEATURE-GUIDE.md`                       | Reviewed, approved, maintained |
| **ARCHIVE** | `tasks/archive/YYYY-MM/`                      | Completed, historical          |

### Promotion Flow (FOLLOW THIS)

```
1. DRAFT → tasks/active/{worktree}/current/notes.md
   - Quick ideas
   - Exploration
   - Scratchpad

2. REVIEW → tasks/active/{worktree}/current/proposal.md
   - Structure proposal
   - Request team review
   - Refine based on feedback

3. STABLE → docs/FEATURE-GUIDE.md
   - Move to docs/ when approved
   - Maintain long-term
   - Official documentation

4. ARCHIVE → tasks/archive/YYYY-MM/
   - Archive completed work monthly
   - Keep as reference
   - Free up active space
```

### Example Flow

```bash
# Day 1: Brainstorm A3 grid
echo "Ideas for A3 grid..." > tasks/active/toon/current/notes.md

# Day 2-3: Structure proposal
vim tasks/active/toon/current/a3-grid-proposal.md

# Day 4: Team review (make changes)

# Day 5: Approved → Promote to docs
mv tasks/active/toon/current/a3-grid-proposal.md docs/A3-GRID-LAYOUT.md
git add docs/A3-GRID-LAYOUT.md
git commit -m "docs: add A3 grid layout guide"

# End of sprint: Archive old notes
mv tasks/active/toon/current tasks/archive/2025-01/toon/
```

---

## Multi-Worktree Rules

### Worktree Structure

```
tasks/active/
├── toon/        # TechLead worktree
│   ├── current/ # Active tasks
│   └── backlog.md
├── backend/     # Backend dev worktree
│   ├── current/
│   └── backlog.md
└── frontend/    # Frontend dev worktree
    ├── current/
    └── backlog.md
```

**⚠️ NOTE: Feature-Based Development Recommended**

For Wasp-based projects, **feature-based worktrees** are more effective than role-based worktrees (backend/frontend). See **[docs/TEAM-STRUCTURE-AND-WASP-PHILOSOPHY.md](../docs/TEAM-STRUCTURE-AND-WASP-PHILOSOPHY.md)** and **[tasks/PARALLEL-DEVELOPMENT-STRATEGY.md](./PARALLEL-DEVELOPMENT-STRATEGY.md)** for complete analysis.

**Feature-based example:**

```
tasks/active/
├── techlead/      # Foundation & infrastructure
├── a3-crud/       # A3 CRUD + Overview + Detail
├── a3-sections/   # Section editors (8 forms)
└── a3-ai/         # AI integration
```

**Why?** Wasp is a full-stack framework where developers work on complete vertical slices (database → operations → UI). Role-based separation creates unnecessary coordination overhead.

### CRITICAL RULES

1. **ONLY commit your own worktree**

   - ✅ Commit `tasks/active/toon/` if you're toon
   - ❌ NEVER commit `tasks/active/backend/` if you're toon

2. **Shared docs go to docs/**

   - ✅ `docs/FEATURE-GUIDE.md` (shared)
   - ❌ `tasks/active/toon/feature-guide.md` (wrong location)

3. **Sprint docs are shared**

   - `tasks/sprints/` visible to ALL
   - Commit sprint planning and retros for team

4. **Archive regularly**
   - End of sprint: Archive current/
   - End of month: Archive sprint folders
   - Keep tasks/ clean and focused

---

## Archive Workflow

### Monthly Archive (End of Month)

```bash
# CREATE archive directory
MONTH=$(date +%Y-%m)  # e.g., 2025-01
mkdir -p tasks/archive/$MONTH

# ARCHIVE your worktree's current tasks
mv tasks/active/{your-worktree}/current tasks/archive/$MONTH/{your-worktree}/

# CREATE fresh current directory
mkdir tasks/active/{your-worktree}/current

# COMMIT archive
git add tasks/archive/$MONTH/
git commit -m "docs(tasks): archive $MONTH tasks"
```

### Sprint Archive (End of Sprint)

```bash
# MOVE sprint folder to archive
MONTH=$(date +%Y-%m)
mkdir -p tasks/archive/$MONTH
mv tasks/sprints/sprint-N tasks/archive/$MONTH/

# COMMIT
git add tasks/archive/$MONTH/
git commit -m "docs(sprint): archive sprint N"
```

### What to Archive

**DO Archive:**

- ✅ Completed day-XX.md files
- ✅ Finished sprint planning/retro
- ✅ Old proposals (after promoted to docs/)
- ✅ Scratch notes from completed work

**DON'T Archive:**

- ❌ Active documentation (keep in docs/)
- ❌ Ongoing tasks (keep in current/)
- ❌ Code templates (stay in .claude/templates/)

---

## Quick Commands

```bash
# START new day
cp tasks/templates/daily-task.md tasks/active/toon/current/day-01.md

# COMMIT daily progress
git add tasks/active/toon/current/day-01.md
git commit -m "docs(tasks): day 01 progress"

# START new sprint
mkdir tasks/sprints/sprint-01
cp tasks/templates/sprint-planning.md tasks/sprints/sprint-01/planning.md

# ARCHIVE sprint (end of sprint)
MONTH=$(date +%Y-%m)
mkdir -p tasks/archive/$MONTH
mv tasks/sprints/sprint-01 tasks/archive/$MONTH/

# ARCHIVE monthly tasks
mv tasks/active/toon/current tasks/archive/$MONTH/toon/
mkdir tasks/active/toon/current

# PROMOTE to stable docs
mv tasks/active/toon/current/proposal.md docs/FEATURE-GUIDE.md
git add docs/FEATURE-GUIDE.md
git commit -m "docs: add feature guide"
```

---

## Templates Location

**USE these templates:**

- `tasks/templates/daily-task.md` - Daily task structure
- `tasks/templates/sprint-planning.md` - Sprint planning format
- `tasks/templates/retrospective.md` - Sprint retrospective format

**COPY, don't edit templates directly:**

```bash
# ✅ CORRECT - Copy template
cp tasks/templates/daily-task.md tasks/active/toon/current/day-01.md

# ❌ WRONG - Edit template directly
vim tasks/templates/daily-task.md  # Don't do this!
```

---

## Best Practices

### DO

1. CREATE day-XX.md at start of each day
2. COMMIT progress at end of day
3. ARCHIVE at end of sprint AND end of month
4. USE templates for consistency
5. BREAK DOWN large tasks into steps
6. DOCUMENT learnings and blockers
7. PROMOTE stable docs to docs/

### DON'T

1. NEVER commit other worktrees' tasks
2. NEVER skip archiving (keeps tasks/ clean)
3. NEVER edit templates directly (copy first)
4. NEVER put shared docs in tasks/ (use docs/)
5. NEVER let tasks/ accumulate (archive regularly)

---

**→ Complete guide:** tasks/README.md
**→ See also:** Root CLAUDE.md for code style, testing rules
