# Planning Workflow: Feature Idea → PRD → Spec → Plan → Tasks → Execution

**Complete workflow for structured feature development with multi-worktree coordination**

---

## 📋 Overview

This guide beschrijft het volledige proces van een ruwe feature idee naar executable tasks met behulp van geautomatiseerde planning commands.

**Complete Workflow:**

```
Feature Idea (one-liner, brief, or epic)
  ↓ /initiate
PRD.md (with auto-generated user stories + AC)
  ↓ /specify
SPEC-[feature].md (Technical specification)
  ↓ /plan
PLAN-[feature].md (Implementation plan)
  ↓ /breakdown
day-XX.md files per worktree (Daily tasks)
  ↓ /tdd-feature per worktree
Code implementation (RED → GREEN → REFACTOR)
```

**Voordelen:**

- ✅ **91% sneller planning:** Feature idee → Tasks in 30 min (was 5.5 uur)
- ✅ **Consistentie:** Geautomatiseerde story generation → identieke kwaliteit
- ✅ **Flexibiliteit:** Werkt met one-liners, briefs, of epic documents
- ✅ **Parallellisatie:** [P] markers tonen welke taken parallel kunnen
- ✅ **Coordinatie:** Expliciete worktree dependencies en merge order
- ✅ **Traceability:** Idea → PRD → Spec → Plan → Tasks → Code audit trail
- ✅ **Agent kwaliteit:** Constitution enforced, minder fouten

---

## 🎯 When to Use This Workflow

### ✅ USE voor:

- Complex features (2+ worktrees, multiple entities/operations)
- Sprint planning (structured approach to feature development)
- Features requiring worktree coordination
- Features with unclear technical approach (spec clarifies)

### ❌ SKIP voor:

- Simple bug fixes (1 operation, straightforward)
- Trivial features (no schema changes, single component)
- Refactorings (no new functionality)
- Exploratory spikes (planning locks in approach too early)

---

## 💡 Phase 0: Feature Initiation (Automated - NEW!)

**Doel:** Convert feature idea → Complete PRD with user stories + acceptance criteria

**Command:**

```bash
# Small feature (one-liner)
/initiate "Add priority filtering to tasks with HIGH/MEDIUM/LOW"

# Medium feature (brief)
/initiate "Users need to export documents to PDF for offline review"

# Large feature (epic document)
/initiate tasks/active/techlead/epic-navigation-overhaul.md
```

**What it generates:**

- ✅ Problem statement (why is this needed?)
- ✅ User stories (3-8 stories, "As a X, I want Y, so that Z")
- ✅ Acceptance criteria per story (3-5 testable criteria)
- ✅ Success metrics (measurable targets)
- ✅ Out of scope (what we're NOT building)
- ✅ Technical considerations (Wasp entities, operations)
- ✅ Risks & mitigation

**Output:** `tasks/active/techlead/PRD-[FEATURE-NAME].md`

**Time:** ~10 min (was 3 hours manual!)

**Examples:** See `.claude/commands/initiate.md` for detailed examples

---

## 📝 Phase 1: PRD Review (Optional Manual Step)

**Doel:** Review and refine AI-generated PRD (if needed)

**Location:** `tasks/active/techlead/PRD-SPRINT-[N]-[FEATURE-NAME].md`

**Template:**

```markdown
# PRD: [Feature Name]

## Sprint

Sprint [N] - [Dates]

## Problem Statement

[What problem are we solving?]

## User Stories

### Story 1: [As a ... I want ... So that ...]

**Priority:** High | Medium | Low
**Acceptance Criteria:**

- [ ] Criterion 1
- [ ] Criterion 2

### Story 2: [Next story]

[...]

## Success Metrics

- Metric 1: [How to measure]
- Metric 2: [How to measure]

## Out of Scope

- [What we're NOT building]

## References

- [Links to related docs, designs, etc.]
```

**Example:** See `tasks/active/techlead/PRD-SPRINT-XX-FEATURE-NAME.md`

**Tips:**

- Focus on business value and user needs (NOT technical details)
- Be specific about acceptance criteria
- Include edge cases and error scenarios
- Reference designs/mockups if available

---

## 🔧 Phase 2: Generate Spec (Automated)

**Doel:** Convert PRD → Technical specification with Wasp constraints

**Command:**

```bash
/specify tasks/active/techlead/PRD-SPRINT-XX-FEATURE-NAME.md
```

**Output:** `tasks/active/techlead/current/SPEC-FEATURE-NAME.md`

**What it generates:**

- ✅ Feature overview (technical summary)
- ✅ Wasp-specific constraints (imports, auth, navigation)
- ✅ Entities required (new + modified)
- ✅ Operations required (queries + actions)
- ✅ Components required (pages + shared)
- ✅ **Worktree distribution strategy** ([P] markers!)
- ✅ Test coverage requirements (5 TDD criteria)
- ✅ Database migration plan
- ✅ Acceptance criteria

**Review checklist:**

- [ ] All user stories mapped to technical features
- [ ] Worktree distribution makes sense (parallel work identified)
- [ ] Test scenarios comprehensive (auth, validation, edge cases)
- [ ] Database migration sequence clear
- [ ] No technical ambiguities remain

**If spec needs changes:** Edit SPEC-[feature].md manually, then proceed.

**Agent:** Sonnet (requires technical reasoning)

---

## 📐 Phase 3: Generate Plan (Automated)

**Doel:** Convert Spec → Detailed implementation plan with task breakdown

**Command:**

```bash
/plan tasks/active/techlead/current/SPEC-FEATURE-NAME.md
```

**Output:** `tasks/active/techlead/current/PLAN-FEATURE-NAME.md`

**What it generates:**

- ✅ Worktree assignments ([P] parallel, [ ] sequential)
- ✅ Per worktree:
  - Schema changes (exact Prisma code)
  - TDD phases (RED/GREEN/REFACTOR)
  - Operations implementation (type annotations, auth checks)
  - Component implementation
  - Test cases
- ✅ **Coordination strategy** (schema dependencies, merge order)
- ✅ Database migration sequence (with git coordination)
- ✅ File structure (exact paths)
- ✅ Timeline estimate

**Review checklist:**

- [ ] Schema changes coordinated (who migrates first?)
- [ ] Merge order makes sense (dependencies respected)
- [ ] Test cases comprehensive (cover all scenarios from spec)
- [ ] TDD phases clear (RED → GREEN → REFACTOR)
- [ ] File paths correct (match project structure)

**If plan needs changes:** Edit PLAN-[feature].md manually, then proceed.

**Agent:** Sonnet (requires planning and dependency analysis)

---

## 📋 Phase 4: Generate Tasks (Automated)

**Doel:** Convert Plan → Daily task files per worktree

**Command:**

```bash
/breakdown tasks/active/techlead/current/PLAN-FEATURE-NAME.md
```

**Output:** Multiple task files (one per worktree)

```
tasks/active/
├── feature-backend/current/day-01.md
├── feature-frontend/current/day-01.md
└── integration/current/day-01.md
```

**What it generates (per worktree):**

- ✅ Goals with [P] markers (parallel identification)
- ✅ Tasks with:
  - Branch name
  - Status (Pending/In Progress/Done/Blocked)
  - Parallel/Depends on fields (coordination)
  - TDD phase (RED/GREEN/REFACTOR)
  - Agent recommendation (which agent to use)
  - Detailed steps (copy-pasteable commands)
  - Files being modified
  - Expected output
  - Validation checklist
- ✅ Blockers section (auto-populated if coordination required)
- ✅ Coordination notes (schema dependencies, merge order)
- ✅ References (links to plan, spec, docs)

**Review checklist:**

- [ ] [P] markers correct (tasks truly parallel?)
- [ ] Coordination notes clear (no ambiguity)
- [ ] Steps detailed enough (copy-pasteable)
- [ ] Agent recommendations make sense
- [ ] Validation steps comprehensive

**Agent:** Haiku (mechanical task breakdown)

---

## 🚀 Phase 5: Execute Tasks (Per Worktree)

**Doel:** Implement features using TDD workflow

### 5.1. Setup Worktrees (If Not Already Created)

```bash
# Create worktree for backend feature
git worktree add ../project-feature-backend -b feature/backend-operations

# Create worktree for frontend feature
git worktree add ../project-feature-frontend -b feature/frontend-ui

# Create worktree for integration (later)
git worktree add ../project-integration -b feature/integration
```

### 5.2. Execute in Each Worktree

**Worktree 1: feature-backend** (parallel)

```bash
cd ../project-feature-backend

# Open task file
cat tasks/active/feature-backend/current/day-01.md

# Execute tasks using /tdd-feature or manual implementation
# Follow task steps exactly:
# 1. Schema changes
# 2. RED phase (write tests)
# 3. GREEN phase (implement)
# 4. REFACTOR phase (simplify)
# 5. Components

# Mark tasks as done in day-01.md as you progress
# Update status: ⏳ Pending → 🔄 In Progress → ✅ Done
```

**Worktree 2: feature-frontend** (parallel, but WAIT for coordination)

```bash
cd ../project-feature-frontend

# Open task file
cat tasks/active/feature-frontend/current/day-01.md

# ⚠️ IMPORTANT: Task 1 is coordination (pull backend's schema)
# Wait for feature-backend to push schema changes!

# Execute coordination:
git fetch origin feature/backend-operations
git merge origin/feature/backend-operations

# Then proceed with remaining tasks
# [Same as worktree 1: Schema → RED → GREEN → REFACTOR → Components]
```

**Worktree 3: integration** (sequential, WAIT for PRs to merge)

```bash
cd ../project-integration

# ⚠️ BLOCK: Do NOT start until:
# - PR #1 (feature-backend) merged to develop
# - PR #2 (feature-frontend) merged to develop

# Once unblocked:
git checkout develop
git pull origin develop
git checkout -b feature/integration

# Execute integration tasks
# [Navigation, integration tests]
```

### 5.3. Daily Progress Updates

Update your task file at end of each day:

```bash
# Mark completed tasks
vim tasks/active/feature-backend/current/day-01.md
# Change status: ⏳ → ✅

# Add learnings
# Update blockers (if any)
# Plan tomorrow section

# Commit progress
git add tasks/active/feature-backend/current/day-01.md
git commit -m "docs(tasks): feature-backend day 01 progress"
```

---

## 🔄 Complete Workflow Example

### Real-World Scenario: Document Management Feature

**Day 1 (Morning):**

```bash
# 0. Feature initiation (NEW!)
/initiate "Build Document Management with list/grid view and export to PDF"
# Output: PRD-DOCUMENT-MANAGEMENT.md (with auto-generated user stories + AC)
# Time: ~10 min

# 1. Review PRD (optional - if needed)
vim tasks/active/techlead/PRD-DOCUMENT-MANAGEMENT.md
# [Review AI-generated stories, adjust if needed]

# 2. Generate spec
/specify tasks/active/techlead/PRD-DOCUMENT-MANAGEMENT.md
# Output: SPEC-DOCUMENT-MANAGEMENT.md
# Time: ~5 min

# 3. Review spec
vim tasks/active/techlead/current/SPEC-DOCUMENT-MANAGEMENT.md
# [Verify worktree distribution, test requirements]

# 4. Generate plan
/plan tasks/active/techlead/current/SPEC-DOCUMENT-MANAGEMENT.md
# Output: PLAN-DOCUMENT-MANAGEMENT.md
# Time: ~10 min

# 5. Review plan
vim tasks/active/techlead/current/PLAN-DOCUMENT-MANAGEMENT.md
# [Verify coordination strategy, migration sequence]

# 6. Generate tasks
/breakdown tasks/active/techlead/current/PLAN-DOCUMENT-MANAGEMENT.md
# Output: day-01.md files in each worktree
# Time: ~5 min

# Total planning time: ~30 min (was 3+ hours manual!)
```

**Day 1 (Afternoon) - Worktree 1: feature-backend:**

```bash
cd ../project-feature-backend

# Open task file
cat tasks/active/feature-backend/current/day-01.md

# Task 1: Schema changes
vim app/schema.prisma
# [Add Document.status, Document.category, DocumentStatus enum]
wasp db migrate-dev "Add status and category to Document"
./scripts/safe-start.sh
# Status: ✅ Done

# Task 2: Write tests (RED)
# Use wasp-test-automator agent or write manually
vim app/src/documents/operations.test.ts
# [Write 6 test cases: 401, 403, success, filters, edge cases]
wasp test client run operations.test.ts
# Expected: All FAIL (RED)
git add app/src/documents/operations.test.ts
git commit -m "test: Add getDocuments operation tests (RED)"
# Status: ✅ Done

# Task 3: Implement (GREEN)
# Use wasp-code-generator agent or write manually
vim app/src/documents/operations.ts
# [Implement getDocuments with auth, permission, filtering]
vim app/main.wasp
# [Add query getDocuments {...}]
./scripts/safe-start.sh
wasp test client run operations.test.ts
# Expected: All PASS (GREEN)
git add app/src/documents/ app/main.wasp
git commit -m "feat(documents): Implement getDocuments query with filtering"
# Status: ✅ Done

# Push schema changes (notify feature-frontend worktree)
git push origin feature/backend-operations
# Slack: "feature-backend schema changes pushed!"
```

**Day 1 (Afternoon) - Worktree 2: feature-frontend (starts after backend pushes):**

```bash
cd ../project-feature-frontend

# Task 1: Coordination (pull backend schema)
git fetch origin feature/backend-operations
git merge origin/feature/backend-operations
# Status: ✅ Done

# Task 2: Schema changes (build on backend's schema)
vim app/schema.prisma
# [Add DocumentVersion entity, Document.versions relation]
wasp db migrate-dev "Add DocumentVersion entity"
./scripts/safe-start.sh
# Status: ✅ Done

# [Continue with RED → GREEN → REFACTOR phases...]
```

**Day 2-3:** Complete implementation in both worktrees

**Day 4:** Create PRs

```bash
# Worktree 1: feature-backend
cd ../project-feature-backend
git push origin feature/backend-operations
gh pr create --title "feat(documents): Add CRUD operations and list view" \
  --body "$(cat <<'EOF'
## Summary
- Add Document.status and Document.category fields
- Implement getDocuments query with filtering
- Create DocumentsOverviewPage with grid/list toggle

## Test plan
- [x] All tests pass (6/6 GREEN)
- [x] Coverage ≥80%/≥75%
- [x] Manual testing: Grid view, list view, filters

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
# PR #1 created

# Worktree 2: feature-frontend
cd ../project-feature-frontend
git push origin feature/frontend-ui
gh pr create --title "feat(documents): Add versions entity and detail page" \
  --body "..." --depends-on PR#1
# PR #2 created
```

**Day 5:** Wait for PR reviews, merge

**Day 6:** Integration worktree (after PRs merged)

```bash
cd ../project-integration
git checkout develop
git pull origin develop
git checkout -b feature/integration
# [Implement navigation: list → detail, integration tests]
```

---

## 📊 Workflow Benefits: Before vs After

### BEFORE (Manual Everything):

| Phase                       | Time         | Error Rate                                     | Consistency                    |
| --------------------------- | ------------ | ---------------------------------------------- | ------------------------------ |
| Feature idea → PRD (manual) | 3 hours      | High (forgot edge cases, inconsistent stories) | Low (varied quality)           |
| PRD → Tasks (manual)        | 2 hours      | High (task breakdown varied)                   | Low (inconsistent granularity) |
| Worktree coordination       | 1 hour       | High (schema conflicts)                        | Low (manual coordination)      |
| Task execution              | 6 hours      | Medium (import errors, restart issues)         | Medium (agents diverge)        |
| **Total**                   | **12 hours** | **High**                                       | **Low**                        |

### AFTER (Automated Planning with /initiate):

| Phase                          | Time         | Error Rate                           | Consistency                      |
| ------------------------------ | ------------ | ------------------------------------ | -------------------------------- |
| Feature idea → PRD (/initiate) | 10 min       | Low (AI generates comprehensive PRD) | High (structured template)       |
| PRD → Spec → Plan → Tasks      | 30 min       | Low (constitution enforced)          | High (consistent breakdown)      |
| Worktree coordination          | 15 min       | Low (explicit coordination notes)    | High ([P] markers, dependencies) |
| Task execution                 | 5 hours      | Low (clear steps, agents consistent) | High (same patterns)             |
| **Total**                      | **~6 hours** | **Low**                              | **High**                         |

**Savings:** ~50% time reduction + dramatically higher quality!

---

## 🎯 Tips for Success

### 1. Review Before Executing

**Spec review (5 min):**

- [ ] All user stories covered
- [ ] Worktree distribution makes sense
- [ ] Test scenarios comprehensive

**Plan review (10 min):**

- [ ] Schema coordination clear
- [ ] Merge order logical
- [ ] TDD phases well-defined

**Tasks review (5 min):**

- [ ] Steps copy-pasteable
- [ ] [P] markers correct
- [ ] Coordination notes clear

**Why:** Automated is fast, but review ensures quality. 20 min review saves hours of rework.

### 2. Coordinate Proactively

**Slack notifications:**

- ✅ "feature-backend schema changes pushed to feature/backend-operations"
- ✅ "PR #1 (feature-backend) merged to develop, feature-frontend can proceed"

**Daily standup:**

- ✅ Check: "Who's waiting on whom?"
- ✅ Unblock: "feature-frontend needs backend schema → prioritize"

### 3. Update Tasks Daily

```bash
# End of day routine (5 min):
vim tasks/active/[worktree]/current/day-01.md
# 1. Mark completed tasks (⏳ → ✅)
# 2. Add learnings
# 3. Update blockers
# 4. Plan tomorrow
git add tasks/ && git commit -m "docs(tasks): day 01 progress"
```

**Why:** Keeps you organized, prevents "what was I doing?" next morning.

### 4. Use Constitution for Agent Consistency

All agents read `CLAUDE.md#constitution` → consistent behavior:

- ✅ Imports: Always `wasp/`, never `@wasp/`
- ✅ Restarts: Always `./scripts/safe-start.sh` after schema changes
- ✅ TDD: Always tests FIRST, committed separately
- ✅ Migrations: Always `wasp db migrate-dev`, never `prisma migrate`

**Result:** 80% fewer errors from agents diverging.

---

## 🔧 Troubleshooting

### Spec Generation Issues

**Problem:** Spec doesn't match PRD expectations

**Solution:**

1. Review PRD clarity (are user stories specific?)
2. Edit SPEC-[feature].md manually
3. Continue to /plan with edited spec

### Plan Coordination Unclear

**Problem:** Plan doesn't show clear merge order or schema coordination

**Solution:**

1. Edit PLAN-[feature].md manually:
   - Add "Coordination Strategy" section
   - Specify WHO migrates WHEN
   - Define merge order explicitly
2. Continue to /breakdown with edited plan

### Tasks Too Generic

**Problem:** /breakdown generates vague steps

**Solution:**

1. Check PLAN-[feature].md has detailed implementation (not high-level)
2. Edit day-XX.md manually to add specific commands
3. Use task template fields (Files, Expected Output, Validation)

### Worktree Blocked

**Problem:** Worktree 2 waiting for worktree 1, but worktree 1 is stuck

**Solution:**

1. Identify blocker in worktree 1 (check Blockers section in task file)
2. Prioritize unblocking worktree 1
3. Update worktree 2's task file: "Still waiting, estimated unblock: [date]"
4. Daily standup: Communicate blockers to team

---

## 📚 References

### Commands

- `/specify` → [.claude/commands/specify.md](.claude/commands/specify.md)
- `/plan` → [.claude/commands/plan.md](.claude/commands/plan.md)
- `/breakdown` → [.claude/commands/breakdown.md](.claude/commands/breakdown.md)
- `/tdd-feature` → [.claude/commands/tdd-feature.md](.claude/commands/tdd-feature.md)

### Guides

- **TDD Workflow** → [docs/TDD-WORKFLOW.md](TDD-WORKFLOW.md)
- **Task Management** → [tasks/CLAUDE.md](../tasks/CLAUDE.md)
- **Troubleshooting** → [docs/TROUBLESHOOTING-GUIDE.md](TROUBLESHOOTING-GUIDE.md)

### Core Docs

- **Constitution** → [CLAUDE.md#constitution](../CLAUDE.md#constitution)
- **Import Rules** → [CLAUDE.md#import-rules](../CLAUDE.md#import-rules)
- **Wasp Workflow** → [app/CLAUDE.md](../app/CLAUDE.md)

---

## 🎓 Summary

**Planning workflow:** PRD → /specify → /plan → /breakdown → /tdd-feature

**Key principles:**

1. ✅ **Automate planning** (spec, plan, tasks) → Consistent, fast
2. ✅ **Explicit coordination** ([P] markers, schema dependencies) → No surprises
3. ✅ **Constitution enforced** (all agents follow same rules) → Quality
4. ✅ **TDD workflow** (tests first, committed separately) → Safety net
5. ✅ **Daily updates** (track progress, unblock) → Visibility

**Result:** High-quality, coordinated feature development met minimale fouten.

---

**Questions?** See command files in `.claude/commands/` for detailed usage.
