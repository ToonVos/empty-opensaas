# Documentation & Tasks Organization

## Overview

This guide defines how we organize documentation, manage tasks, and work with multiple git worktrees in the LEAN AI COACH project.

**Key Principles:**

- Clear separation between stable docs (docs/) and work-in-progress (tasks/)
- Each worktree has its own task directory
- Agile workflow: Sprints → Days → Tasks
- Archive completed work monthly
- Documentation has a lifecycle: Work → Review → Stable → Archive

---

## Directory Structure

```
lean-ai-coach/
├── docs/                           # Stable, reviewed documentation
│   ├── ARCHITECTURE_AND_IMPLEMENTATION_PLAN_V2.md
│   ├── TDD-WORKFLOW.md
│   ├── TROUBLESHOOTING-GUIDE.md
│   └── CI-CD-SETUP.md
│
├── tasks/                          # All task-related work
│   ├── active/                     # Current work per worktree
│   │   ├── toon/                   # TechLead's worktree tasks
│   │   │   ├── current/            # Active sprint work
│   │   │   │   ├── day-01.md       # Daily task breakdown
│   │   │   │   ├── day-02.md
│   │   │   │   └── notes.md        # Scratch notes
│   │   │   └── backlog.md          # Worktree-specific backlog
│   │   ├── backend/                # Backend dev's worktree tasks
│   │   └── frontend/               # Frontend dev's worktree tasks
│   │
│   ├── sprints/                    # Sprint planning & retrospectives
│   │   ├── sprint-01/
│   │   │   ├── planning.md         # Sprint goals, user stories
│   │   │   ├── retrospective.md    # What worked, what didn't
│   │   │   └── burndown.md         # Progress tracking
│   │   └── sprint-02/
│   │
│   ├── archive/                    # Completed work
│   │   ├── 2025-01/                # January 2025 archive
│   │   │   ├── toon/
│   │   │   ├── backend/
│   │   │   └── sprint-01/
│   │   └── 2025-02/
│   │
│   └── templates/                  # Task templates
│       ├── daily-task.md
│       ├── sprint-planning.md
│       └── retrospective.md
│
├── .claude/                        # Claude Code resources
│   ├── templates/                  # Code templates
│   │   ├── component.tsx
│   │   ├── operations-patterns.ts
│   │   ├── error-handling-patterns.ts
│   │   └── permission-helpers.ts
│   └── checklists/
│       └── DO_NOT_TOUCH.md
│
└── CLAUDE.md                       # Main Claude Code guide
```

---

## Documentation Categories

### 1. Stable Documentation (docs/)

**Purpose:** Architecture, guides, references that have been reviewed and approved.

**When to create:**

- Architecture decisions (ADRs)
- Workflow guides (TDD, troubleshooting)
- API references
- Setup instructions

**Lifecycle:**

1. Start in tasks/active/{worktree}/current/ as draft
2. Move to docs/ when reviewed and stable
3. Keep updated as project evolves
4. Archive old versions if superseded

**Examples:**

- `docs/ARCHITECTURE_AND_IMPLEMENTATION_PLAN_V2.md` - Project architecture
- `docs/TDD-WORKFLOW.md` - TDD process guide
- `docs/TROUBLESHOOTING-GUIDE.md` - Error diagnostics
- `docs/CI-CD-SETUP.md` - CI/CD configuration

**Naming:** PascalCase with hyphens (e.g., `TDD-WORKFLOW.md`)

---

### 2. Work Documentation (tasks/active/{worktree}/)

**Purpose:** Current tasks, notes, drafts for specific developer/worktree.

**Structure per worktree:**

```
tasks/active/toon/
├── current/              # Active sprint work
│   ├── day-01.md         # Monday tasks
│   ├── day-02.md         # Tuesday tasks
│   ├── day-03.md
│   ├── day-04.md
│   ├── day-05.md
│   └── notes.md          # Scratch pad, quick notes
└── backlog.md            # Worktree-specific backlog
```

**Daily Task Format (day-XX.md):**

```markdown
# Day 01 - Sprint X - [Date]

## Goals

- [ ] Implement user authentication
- [ ] Write tests for auth flow
- [ ] Update documentation

## Tasks

### Task 1: Setup Auth Schema

**Branch:** feature/TL-auth-schema
**Status:** ✅ Done | ⏳ In Progress | ❌ Blocked

**Steps:**

1. [ ] Add User entity to schema.prisma
2. [ ] Run migration
3. [ ] Test with Prisma Studio

**Notes:**

- Used bcrypt for password hashing
- Added email uniqueness constraint

### Task 2: [Next task]

...

## Blockers

- Waiting for backend API endpoint (BE-42)

## Tomorrow

- Continue with OAuth integration
```

**When to archive:**

- End of sprint → Move to tasks/archive/YYYY-MM/{worktree}/

---

### 3. Sprint Documentation (tasks/sprints/)

**Purpose:** Sprint planning, daily logs, retrospectives.

**Structure per sprint:**

```
tasks/sprints/sprint-01/
├── planning.md           # Sprint goals, user stories, estimates
├── retrospective.md      # What worked, what didn't, action items
└── burndown.md           # Progress tracking
```

**Sprint Planning Format:**

```markdown
# Sprint 1 Planning

**Dates:** 2025-01-13 to 2025-01-26 (2 weeks)

**Sprint Goal:**
Implement multi-tenant organization and department management.

## User Stories

### Story 1: Organization CRUD

**As a** user
**I want** to create and manage organizations
**So that** I can set up multi-tenant structure

**Acceptance Criteria:**

- [ ] Can create organization
- [ ] Can list organizations
- [ ] Can update organization details
- [ ] Can delete organization (soft delete)

**Estimate:** 5 points
**Assigned:** TechLead (feature/TL-org-crud)

### Story 2: Department Management

...

## Capacity

- TechLead: 40 hours
- Backend: 40 hours
- Frontend: 40 hours

**Total:** 120 hours = ~30 story points
```

**Retrospective Format:**

```markdown
# Sprint 1 Retrospective

**Date:** 2025-01-26

## What Went Well

- TDD workflow prevented bugs
- Git hooks caught issues early
- Multi-worktree setup worked smoothly

## What Didn't Go Well

- Schema changes required multiple migrations
- Import errors took time to debug
- ShadCN version mismatch caused issues

## Action Items

- [ ] Document Wasp restart checklist
- [ ] Add import rules to CLAUDE.md
- [ ] Lock ShadCN version in docs

## Metrics

- Velocity: 28 points completed (target 30)
- Test coverage: 87% (target 80%)
- Bugs in production: 0
```

**When to archive:**

- Sprint complete → Move to tasks/archive/YYYY-MM/sprint-N/

---

### 4. Archive (tasks/archive/{YYYY-MM}/)

**Purpose:** Completed work for historical reference.

**Structure:**

```
tasks/archive/
├── 2025-01/
│   ├── toon/
│   │   └── current/          # All daily tasks from January
│   ├── backend/
│   ├── frontend/
│   └── sprint-01/            # Sprint 1 planning + retro
└── 2025-02/
    └── sprint-02/
```

**When to archive:**

- End of month: Move tasks/active/{worktree}/current/ → archive/YYYY-MM/{worktree}/
- End of sprint: Move tasks/sprints/sprint-N/ → archive/YYYY-MM/sprint-N/

**Archive script (manual for now):**

```bash
# End of month archive
MONTH=$(date +%Y-%m)
mkdir -p tasks/archive/$MONTH
mv tasks/active/*/current tasks/archive/$MONTH/

# End of sprint archive
SPRINT=sprint-01
MONTH=2025-01
mv tasks/sprints/$SPRINT tasks/archive/$MONTH/
```

---

### 5. Code Templates (.claude/templates/)

**Purpose:** Reusable code patterns for quick reference.

**Examples:**

- `component.tsx` - React component template
- `operations-patterns.ts` - Wasp operations examples
- `error-handling-patterns.ts` - Error handling patterns
- `permission-helpers.ts` - Permission checking helpers

**Not for tasks!** These are code examples, not task tracking.

---

## Multi-Worktree Workflow

### Setup

Each developer works in separate git worktree:

```bash
# TechLead
git worktree add ../lean-ai-coach-tl feature/TL-techlead

# Backend Developer
git worktree add ../lean-ai-coach-be feature/BE-backend

# Frontend Developer
git worktree add ../lean-ai-coach-fe feature/FE-frontend
```

**Each worktree gets own task directory:**

- TechLead → tasks/active/toon/
- Backend → tasks/active/backend/
- Frontend → tasks/active/frontend/

### Benefits

1. **Isolation:** Each developer has own workspace
2. **No conflicts:** Different branches, different tasks/
3. **Parallel work:** Multiple features simultaneously
4. **Clean history:** Each worktree commits independently

### Rules

1. **Never commit other worktree's tasks** - Only commit your own tasks/active/{your-worktree}/
2. **Shared docs go to docs/** - Not tasks/
3. **Archive monthly** - Keep tasks/ directory clean
4. **Sprint docs are shared** - tasks/sprints/ visible to all

---

## Agile Workflow

### Sprint Structure

**2-week sprints:**

- Week 1: Days 1-5 (Monday-Friday)
- Week 2: Days 6-10 (Monday-Friday)

**Sprint ceremonies:**

- **Day 1 (Monday):** Sprint planning (tasks/sprints/sprint-N/planning.md)
- **Days 2-9:** Daily standup (quick, not documented)
- **Day 10 (Friday):** Sprint retrospective (tasks/sprints/sprint-N/retrospective.md)

### Daily Workflow

**Each morning:**

1. Create/update tasks/active/{worktree}/current/day-XX.md
2. List goals for the day
3. Break down into tasks with checkboxes

**During the day:**

1. Work on tasks
2. Check off completed items
3. Add notes/learnings
4. Update blockers

**End of day:**

1. Review what's done
2. Plan tomorrow
3. Commit daily task file: `git add tasks/active/toon/current/day-01.md && git commit -m "docs(tasks): day 01 progress"`

### End of Sprint

**Friday (Day 10):**

1. Complete retrospective (tasks/sprints/sprint-N/retrospective.md)
2. Archive sprint: `mv tasks/sprints/sprint-N tasks/archive/YYYY-MM/`
3. Archive current tasks: `mv tasks/active/toon/current tasks/archive/YYYY-MM/toon/`
4. Create fresh tasks/active/toon/current/ for next sprint

---

## Documentation Lifecycle

```
┌─────────────┐
│   DRAFT     │  tasks/active/{worktree}/current/notes.md
│ (Work Docs) │  Quick notes, ideas, exploration
└──────┬──────┘
       │ Refined, structured
       ▼
┌─────────────┐
│   REVIEW    │  tasks/active/{worktree}/current/proposal.md
│ (Work Docs) │  Structured proposal for review
└──────┬──────┘
       │ Reviewed, approved
       ▼
┌─────────────┐
│   STABLE    │  docs/FEATURE-GUIDE.md
│ (docs/)     │  Official, maintained documentation
└──────┬──────┘
       │ Superseded or completed
       ▼
┌─────────────┐
│   ARCHIVE   │  tasks/archive/YYYY-MM/feature-guide-v1.md
│ (archive/)  │  Historical reference
└─────────────┘
```

**Example flow:**

1. **Day 1:** Brainstorm A3 grid layout → tasks/active/toon/current/notes.md
2. **Day 2-3:** Structure proposal → tasks/active/toon/current/a3-grid-proposal.md
3. **Day 4:** Review with team, refine
4. **Day 5:** Approved → Move to docs/A3-GRID-LAYOUT.md
5. **End of sprint:** Archive old notes → tasks/archive/2025-01/toon/

---

## Best Practices

### 1. Keep Work Isolated

- ✅ Each worktree has own tasks/active/{worktree}/
- ❌ Don't commit other worktrees' tasks
- ✅ Shared docs go to docs/
- ❌ Don't put stable docs in tasks/

### 2. Archive Regularly

- End of sprint: Archive current tasks
- End of month: Archive sprint folders
- Keep tasks/ directory clean and focused on active work

### 3. Use Templates

- Copy from tasks/templates/ to start new tasks
- Maintain consistent format across team
- Update templates based on what works

### 4. Document Decisions

- Architecture decisions → docs/ADR-XXX.md
- Workflow changes → Update docs/
- Quick notes → tasks/active/{worktree}/current/notes.md

### 5. Review Before Promoting

- Draft in tasks/active/
- Review with team
- Promote to docs/ only when stable
- Keep docs/ high quality

---

## Quick Reference Commands

```bash
# Start new sprint
mkdir tasks/sprints/sprint-N
cp tasks/templates/sprint-planning.md tasks/sprints/sprint-N/planning.md

# Start new day
cp tasks/templates/daily-task.md tasks/active/toon/current/day-01.md

# Archive sprint (end of sprint)
SPRINT=sprint-01
MONTH=$(date +%Y-%m)
mkdir -p tasks/archive/$MONTH
mv tasks/sprints/$SPRINT tasks/archive/$MONTH/

# Archive month (end of month)
MONTH=$(date +%Y-%m)
mkdir -p tasks/archive/$MONTH
mv tasks/active/toon/current tasks/archive/$MONTH/toon/
mkdir tasks/active/toon/current

# Commit daily progress
git add tasks/active/toon/current/day-01.md
git commit -m "docs(tasks): day 01 progress"

# Commit sprint retro
git add tasks/sprints/sprint-01/retrospective.md
git commit -m "docs(sprint): sprint 1 retrospective"
```

---

## FAQ

**Q: Where do I put quick notes?**
A: tasks/active/{worktree}/current/notes.md - scratch pad for ideas

**Q: When should I promote to docs/?**
A: When reviewed, approved, and will be maintained long-term

**Q: What if I work on multiple features?**
A: Use separate day-XX.md files or sections within one file

**Q: Do I commit archive/?**
A: Optional - useful for team history, but can .gitignore if too large

**Q: Can I customize my worktree's task structure?**
A: Yes, as long as you follow tasks/active/{worktree}/ root structure

**Q: What about spike/exploration tasks?**
A: Start in tasks/active/{worktree}/current/spike-feature-name.md, archive when done

**Q: How to handle multi-day tasks?**
A: Reference across multiple day-XX.md files, or create dedicated task file

**Q: What if sprint runs longer?**
A: Add day-11.md, day-12.md as needed - not ideal, but flexible

---

## Summary

**Key takeaways:**

1. **docs/** = Stable, reviewed, long-term documentation
2. **tasks/active/{worktree}/** = Current work, isolated per developer
3. **tasks/sprints/** = Sprint planning and retrospectives
4. **tasks/archive/** = Completed work, historical reference
5. **Archive regularly** - Keep active work clean and focused

**Workflow:** Draft → Review → Stable → Archive

**→ See also:** CLAUDE.md#docs-tasks for quick reference
