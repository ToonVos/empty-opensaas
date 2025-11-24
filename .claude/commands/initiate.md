---
description: Smart feature initiation - converts any input (one-liner, brief, epic) to complete PRD with user stories and acceptance criteria.
---

# Initiate: Feature Idea → PRD

Intelligently converts any feature input (one-liner, brief, or epic document) into a complete Product Requirements Document (PRD) with auto-generated user stories and acceptance criteria.

## Usage

```bash
# Small feature (one-liner)
/initiate "Add priority filtering to reports with HIGH/MEDIUM/LOW options"

# Medium feature (brief - inline)
/initiate "Users need to export reports to PDF for offline review. Current workaround is screenshot which has poor formatting."

# Medium feature (brief file)
/initiate tasks/active/techlead/feature-brief-export.md

# Large feature/epic (document with multiple stories)
/initiate tasks/active/techlead/epic-navigation-overhaul.md
```

## Purpose

This command is the **first step** in the planning workflow, transforming raw feature ideas into structured PRDs by:

1. ✅ Analyzing input size and complexity
2. ✅ Generating user stories (3-8 stories based on scope)
3. ✅ Creating acceptance criteria per story
4. ✅ Formulating problem statement and success metrics
5. ✅ Choosing workflow: embedded stories (small/medium) or separate breakdown (large epic)

**Model:** Sonnet (requires creative story generation + reasoning about scope)

## 🆕 Execution Workflow (MANDATORY PHASES)

This command MUST follow the **THINK → EXPLORE → PLAN → EXECUTE** pattern:

### Phase 1: 🔍 EXPLORE (MANDATORY - Before PRD Generation)

**When:** Immediately after receiving input, BEFORE generating anything
**Agent:** Use Task tool with `subagent_type='Explore'` and `thoroughness='medium'`

**What to explore:**

1. Search for similar features already implemented (Grep for similar patterns)
2. Find existing entities/operations that might relate (Glob for schema files)
3. Identify design patterns currently used (Read architecture docs)
4. Analyze existing PRDs for format consistency (Read tasks/active/techlead/PRD-\*.md)
5. Review Wasp constraints relevant to this feature type (Read CLAUDE.md sections)

**Output:** Context summary with relevant file paths, patterns, and constraints

**Why critical:** Ensures new features align with existing architecture

### Phase 2: 📋 PLAN (MANDATORY - Before PRD Generation)

**When:** After Explore completes, BEFORE generating PRD
**Agent:** Use Task tool with `subagent_type='Plan'` and `model='sonnet'`

**What to plan:**

1. Determine if input is small/medium/large (affects output structure)
2. Identify which Wasp entities will be needed (based on exploration)
3. Plan story breakdown (3-8 stories based on complexity)
4. Strategize acceptance criteria approach (testable, specific)
5. Define success metrics framework (adoption, performance, quality)

**Output:** Structured plan for PRD content

**Why critical:** Strategic planning ensures complete, consistent PRDs

### Phase 2.5: 📋 PLAN (For Large Epics Only)

**When:** When epic detected (5+ stories), BEFORE creating STORIES.md
**Agent:** Use Task tool with `subagent_type='Plan'` and `model='sonnet'`

**What to plan:**

1. Group related stories by workflow/feature area
2. Identify core vs enhancement vs future stories
3. Determine story dependencies (what blocks what)
4. Find parallel work opportunities ([P] markers)
5. Plan sprint distribution (which stories in which sprint)

**Output:** Story map structure with dependencies

**Why critical:** Epic breakdown requires careful dependency analysis

### Phase 3: ✅ EXECUTE (Generate PRD)

**When:** After Plan completes
**Agent:** Direct Sonnet execution

**What to generate:** Use gathered context + plan to create comprehensive PRD.md

---

## Workflow Decision Tree

The command automatically detects input type and chooses the right workflow:

```
Input Analysis
    ↓
┌─────────────────┬──────────────────────┬────────────────────┐
│  SMALL          │  MEDIUM              │  LARGE (EPIC)      │
│  1-2 sentences  │  1-3 paragraphs      │  Multi-page doc    │
│  1 feature      │  1-2 features        │  5+ user stories   │
└────────┬────────┴──────────┬───────────┴──────────┬─────────┘
         ↓                   ↓                      ↓
   Direct to PRD      Expand to PRD         Epic Breakdown
   (embedded)         (embedded)             (separate + PRD)
         ↓                   ↓                      ↓
     PRD.md              PRD.md              STORIES.md + PRD.md
```

### Detection Logic

**Small (1-2 sentences):**

- Single feature request
- Limited context
- AI must infer problem, users, benefits

**Medium (1-3 paragraphs):**

- Feature description + context
- Problem statement present
- Some user context
- AI expands into full PRD format

**Large (Epic - multi-page):**

- Multiple related features
- 5+ user stories (rough or detailed)
- Complex scope
- AI creates separate STORIES.md for story mapping
- Then combines into PRD.md

## Output Structure

### For Small/Medium Input → PRD.md

```
tasks/active/techlead/PRD-[FEATURE-NAME].md
```

**Generated sections:**

```markdown
# PRD: [Feature Name]

**Generated from:** [Input summary]
**Date:** [YYYY-MM-DD]
**Status:** Draft
**Owner:** Tech Lead
**Sprint:** TBD

---

## Problem Statement

[AI-generated: Why is this needed? What problem does it solve?]

[Based on input, AI infers:]

- Current pain point
- User frustration
- Business impact
- Opportunity cost

## User Stories

[AI generates 3-6 stories based on feature scope]

### Story 1: [As a {role}, I want {feature}, so that {benefit}]

**Priority:** High | Medium | Low [AI assigns based on criticality]

**Acceptance Criteria:**

- [ ] [Specific, testable criterion 1]
- [ ] [Specific, testable criterion 2]
- [ ] [Specific, testable criterion 3]

**Edge Cases:**

- [Edge case 1]
- [Edge case 2]

### Story 2: [Next story]

[Same structure]

## Success Metrics

[AI generates 2-4 metrics]

- **Metric 1:** [How to measure] - Target: [value]
- **Metric 2:** [How to measure] - Target: [value]

Examples:

- User adoption: 70% of managers use export within 2 weeks
- Time savings: 50% reduction in report sharing time
- User satisfaction: NPS score ≥8 for export feature

## Out of Scope

[AI determines what NOT to include]

- [Feature/enhancement that's related but not in scope]
- [Future consideration]

## Technical Considerations

[AI adds Wasp-specific notes]

- Wasp entities required: [List]
- Operations required: [queries/actions]
- External dependencies: [e.g., PDF library]

## Risks & Mitigation

[AI identifies potential risks]

- **Risk 1:** [Description] → **Mitigation:** [Strategy]
- **Risk 2:** [Description] → **Mitigation:** [Strategy]

## References

- [AI suggests relevant docs from project if mentioned]
- Design: [TBD - add link when available]
- Related PRDs: [If applicable]

---

**Next step:** `/specify PRD-[feature].md`
```

---

### For Large Input (Epic) → STORIES.md + PRD.md

**Step 1: Story Breakdown**

```
tasks/active/techlead/STORIES-[EPIC-NAME].md
```

**Generated content:**

```markdown
# User Stories: [Epic Name]

**Generated from:** [Epic document path]
**Date:** [YYYY-MM-DD]
**Status:** Draft - Story Mapping Phase

---

## Epic Vision

[AI extracts or generates high-level vision]

## Story Map

[AI organizes stories by workflow or priority]

### Core Stories (Must Have - Sprint 1)

#### Story 1: [As a ... I want ... So that ...]

**Priority:** High
**Estimate:** [S/M/L based on complexity]
**Dependencies:** None

**Acceptance Criteria:**

- [ ] [Criterion 1]
- [ ] [Criterion 2]

**Technical Notes:**

- Entities: [List]
- Operations: [List]

---

#### Story 2: [Next core story]

[Same structure]

---

### Enhancement Stories (Should Have - Sprint 2)

[AI groups related stories]

---

### Future Stories (Could Have - Backlog)

[AI identifies nice-to-have features]

---

## Story Dependencies

[AI visualizes dependencies]
```

Story 1 (Core Auth)
↓
Story 2 (User Profile) → Story 4 (Settings)
↓
Story 3 (Permissions)

```

## Parallel Work Opportunities

[AI identifies stories that can run in parallel]

- [P] Story 1 + Story 5 (different entities, no conflicts)
- [P] Story 2 + Story 6 (different components)
- [ ] Story 3 (depends on Story 1 + 2)
```

**Step 2: Combine to PRD**

```
tasks/active/techlead/PRD-[EPIC-NAME].md
```

**Generated content:**

```markdown
# PRD: [Epic Name]

**Generated from:** STORIES-[epic-name].md
**Date:** [YYYY-MM-DD]
**Status:** Draft
**Sprint:** Multiple sprints (see story map)

---

## Epic Overview

[AI-generated summary of epic]

## Problem Statement

[Why this epic is needed]

## User Stories

**See detailed story breakdown:** [STORIES-[epic-name].md](STORIES-[epic-name].md)

**Summary:** [X] total stories across [Y] sprints

- Core (Must Have): [N] stories → Sprint 1
- Enhancements (Should Have): [M] stories → Sprint 2
- Future (Could Have): [K] stories → Backlog

### Core Stories (Sprint 1)

[Brief list with links to STORIES.md]

1. [Story 1 title] - High priority
2. [Story 2 title] - High priority
3. [Story 3 title] - Medium priority

### Enhancement Stories (Sprint 2)

[Brief list]

## Success Metrics

[AI generates epic-level metrics]

## Technical Architecture

[AI suggests high-level architecture for epic]

- Multi-tenant considerations
- Database schema changes
- API design patterns

## Implementation Phases

**Phase 1 (Sprint 1):** Core stories
**Phase 2 (Sprint 2):** Enhancements
**Phase 3 (Backlog):** Future features

## Risks & Dependencies

[Epic-level risks]

---

**Next step:** `/specify PRD-[epic].md` (will generate spec for entire epic)
```

---

## Example Executions

### Example 1: Small Input (One-Liner)

**Command:**

```bash
/initiate "Add priority filtering to tasks with HIGH/MEDIUM/LOW options"
```

**AI Processing:**

```
Analyzing input...
  Type: Small (1 sentence)
  Feature: Priority filtering
  Scope: Single feature, clear requirement

Generating PRD...
  Problem: Users can't prioritize tasks
  User stories: 3 generated
    1. View tasks filtered by priority
    2. Assign priority to task
    3. Change task priority
  Acceptance criteria: 9 total (3 per story)
  Success metrics: 2 generated
```

**Output:** `tasks/active/techlead/PRD-PRIORITY-FILTERING.md`

**Generated PRD (excerpt):**

````markdown
# PRD: Task Priority Filtering

**Generated from:** "Add priority filtering to tasks with HIGH/MEDIUM/LOW options"
**Date:** 2025-10-21
**Status:** Draft
**Owner:** Tech Lead
**Sprint:** TBD

---

## Problem Statement

Currently, all tasks are treated equally in the system, making it difficult for users to focus on what matters most. Users lack a way to:

- Identify urgent tasks that need immediate attention
- Differentiate between critical and routine work
- Filter their task list to see only high-priority items

This leads to:

- Important tasks being missed or delayed
- Time wasted scanning through all tasks to find urgent ones
- Reduced productivity and clarity

## User Stories

### Story 1: View Filtered Task List by Priority

**As a** team member
**I want** to filter my task list by priority level (HIGH/MEDIUM/LOW)
**So that** I can focus on the most important tasks first

**Priority:** High

**Acceptance Criteria:**

- [ ] User sees a priority filter dropdown in task overview
- [ ] Selecting "HIGH" shows only tasks marked as HIGH priority
- [ ] Selecting "MEDIUM" shows only MEDIUM priority tasks
- [ ] Selecting "LOW" shows only LOW priority tasks
- [ ] Filter persists across page reloads (saved in URL or local storage)
- [ ] Filter can be cleared to show all tasks

**Edge Cases:**

- No tasks of selected priority → Show "No tasks" message
- User has no permission to view certain tasks → Filter respects permissions

---

### Story 2: Assign Priority to Task

**As a** task creator
**I want** to assign a priority level (HIGH/MEDIUM/LOW) when creating a task
**So that** team members know the urgency level

**Priority:** High

**Acceptance Criteria:**

- [ ] Create task form includes priority dropdown
- [ ] Default priority is MEDIUM if not specified
- [ ] Priority is saved with task in database
- [ ] Priority is visible in task list (badge or color coding)
- [ ] Only users with MEMBER+ role can set priority

**Edge Cases:**

- Invalid priority value → Validation error shown
- Missing priority → Defaults to MEDIUM

---

### Story 3: Change Task Priority

**As a** task owner or manager
**I want** to change the priority of an existing task
**So that** I can adjust urgency as situations change

**Priority:** Medium

**Acceptance Criteria:**

- [ ] Task detail page shows current priority
- [ ] Edit button allows changing priority
- [ ] Only task owner or MANAGER role can change priority
- [ ] Priority change is logged (audit trail)
- [ ] Team members are notified if priority changes to HIGH

**Edge Cases:**

- User lacks permission → 403 error shown
- Task doesn't exist → 404 error shown

---

## Success Metrics

- **Metric 1: Adoption Rate**

  - Measure: % of tasks with assigned priority (not default MEDIUM)
  - Target: ≥60% within 2 weeks of launch

- **Metric 2: Filter Usage**

  - Measure: % of active users using priority filter
  - Target: ≥50% of users filter by priority at least weekly

- **Metric 3: Task Completion**
  - Measure: % of HIGH priority tasks completed on time
  - Target: ≥80% completion rate for HIGH priority

## Out of Scope

- Automatic priority assignment based on due date (future)
- Custom priority levels beyond HIGH/MEDIUM/LOW (future)
- Priority-based task sorting/ordering (future enhancement)
- Email notifications for priority changes (future)

## Technical Considerations

**Wasp Entities Required:**

- Modify Task entity: Add `priority` field (enum: HIGH, MEDIUM, LOW)

**Operations Required:**

- Query: `getTasks` - Add priority filter parameter
- Action: `createTask` - Add priority field
- Action: `updateTask` - Allow priority update

**Database Migration:**

```prisma
enum TaskPriority {
  LOW
  MEDIUM
  HIGH
}

model Task {
  // existing fields...
  + priority TaskPriority @default(MEDIUM)
}
```
````

**UI Components:**

- Priority badge component (color-coded: RED/YELLOW/BLUE)
- Priority filter dropdown
- Priority selector (create/edit forms)

## Risks & Mitigation

**Risk 1: Priority Inflation**

- Description: Users mark everything as HIGH priority, defeating the purpose
- Mitigation: Add validation (max % of HIGH priority tasks per user/dept)

**Risk 2: Permission Confusion**

- Description: Users expect to change priority but lack permission
- Mitigation: Clear UI indicators (disabled button + tooltip explanation)

**Risk 3: Performance**

- Description: Priority filtering on large datasets may be slow
- Mitigation: Add database index on `priority` field

---

**Next step:** `/specify PRD-PRIORITY-FILTERING.md`

````

---

### Example 2: Medium Input (Feature Brief)

**Command:**
```bash
/initiate tasks/active/techlead/feature-brief-export.md
````

**Input file content:**

```markdown
# Feature Brief: Document Export to PDF

Users need to export documents to PDF for offline review and printing.

Currently, users must:

1. Screenshot each section manually
2. Or use browser "Print to PDF" which breaks the layout

Target users:

- Managers who present documents in meetings
- Team leads who review documents offline
- Auditors who need printed documentation

Expected benefit:

- Save 10+ minutes per document export
- Professional-looking PDFs with correct formatting
- Ability to share documents outside the system
```

**AI Processing:**

```
Analyzing input...
  Type: Medium (feature brief, ~4 paragraphs)
  Feature: PDF export with specific layout requirements
  Context: Problem, target users, benefits provided

Expanding to PRD...
  Problem statement: Present (enhancing with details)
  User stories: 4 generated
    1. Export document to PDF
    2. Preview export before download
    3. Include metadata in PDF
    4. Batch export multiple documents
  Acceptance criteria: 12 total (3 per story)
  Success metrics: 3 generated
```

**Output:** `tasks/active/techlead/PRD-DOCUMENT-EXPORT.md`

(Similar structure, 4 user stories, more detailed AC)

---

### Example 3: Large Input (Epic Document)

**Command:**

```bash
/initiate tasks/active/techlead/epic-navigation-overhaul.md
```

**Input file excerpt:**

```markdown
# Epic: Complete Document Navigation Overhaul

## Vision

Redesign the entire document navigation experience to be more intuitive and efficient.

## Current Problems

- Users get lost between overview, detail, and editor
- No breadcrumbs or navigation history
- Back button behavior inconsistent
- Mobile navigation cramped

## Rough User Stories

- As a manager, I want to see where I am in the app
- As a mobile user, I want easy navigation on small screens
- As a viewer, I want to quickly jump between documents
- As an editor, I want to save position when navigating away
- As a power user, I want keyboard shortcuts
- [... 8 more stories ...]
```

**AI Processing:**

```
Analyzing input...
  Type: Large (epic document with 12+ stories)
  Scope: Multi-sprint epic (navigation redesign)
  Complexity: High (affects entire app, multiple user types)

Workflow: Epic breakdown
  Step 1: Create STORIES-NAVIGATION-OVERHAUL.md
    - Story mapping (12 stories → groups)
    - Priority assignment (must/should/could have)
    - Dependencies identified
    - Parallel work opportunities

  Step 2: Create PRD-NAVIGATION-OVERHAUL.md
    - Links to STORIES.md
    - Epic-level metrics
    - Multi-sprint plan
```

**Output Files:**

1. `tasks/active/techlead/STORIES-NAVIGATION-OVERHAUL.md` (story breakdown)
2. `tasks/active/techlead/PRD-NAVIGATION-OVERHAUL.md` (epic PRD)

(Detailed story map with dependencies + comprehensive PRD)

---

## Integration with Existing Workflow

### Complete Planning Flow

```bash
# Phase 0: Feature Initiation (NEW!)
/initiate [input]
→ PRD.md

# Phase 1: Technical Specification (EXISTING)
/specify PRD.md
→ SPEC.md

# Phase 2: Implementation Plan (EXISTING)
/plan SPEC.md
→ PLAN.md

# Phase 3: Task Breakdown (EXISTING)
/breakdown PLAN.md
→ Tasks (day-XX.md per worktree)

# Phase 4: Execution (EXISTING)
/tdd-feature per worktree
→ Code (RED → GREEN → REFACTOR)
```

### Time Savings Analysis

| Phase              | Before (Manual) | After (Automated)  | Savings |
| ------------------ | --------------- | ------------------ | ------- |
| **Feature → PRD**  | 3 hours         | 10 min             | **94%** |
| **PRD → Spec**     | Manual (30 min) | 5 min (/specify)   | 83%     |
| **Spec → Plan**    | Manual (1 hour) | 10 min (/plan)     | 83%     |
| **Plan → Tasks**   | Manual (1 hour) | 5 min (/breakdown) | 92%     |
| **TOTAL PLANNING** | **5.5 hours**   | **30 min**         | **91%** |

---

## When to Use This Command

✅ **USE for:**

- Any new feature idea (one-liner to epic)
- Converting rough notes to structured PRD
- Epic breakdown into user stories
- Consistent PRD formatting across team

❌ **DON'T use for:**

- Bug fixes (no PRD needed - use issue template)
- Documentation updates (not a feature)
- Refactorings (technical only - use /specify directly)

---

## Output Location

```
tasks/active/techlead/
├── PRD-[FEATURE-NAME].md (small/medium features)
├── STORIES-[EPIC-NAME].md (large epics only)
└── PRD-[EPIC-NAME].md (large epics - links to STORIES)
```

**Naming convention:**

- PRD-PRIORITY-FILTERING.md
- PRD-DOCUMENT-EXPORT.md
- STORIES-NAVIGATION-OVERHAUL.md + PRD-NAVIGATION-OVERHAUL.md

---

## AI Prompting Strategy

The command uses Sonnet with specific instructions:

**Story Generation:**

- Extract user roles from context (manager, viewer, member, etc.)
- Identify pain points (current problems)
- Generate "As a X, I want Y, so that Z" format
- Ensure stories are SMART (Specific, Measurable, Achievable, Relevant, Testable)

**Acceptance Criteria Generation:**

- Make criteria testable (observable behavior)
- Include edge cases (empty state, errors, permissions)
- Follow Given-When-Then or checklist format
- Align with TDD-WORKFLOW.md (5 quality criteria)

**Success Metrics Generation:**

- User adoption metrics (% using feature)
- Performance metrics (time saved, efficiency)
- Quality metrics (error rate, satisfaction)
- Make measurable (numbers, percentages, timeframes)

---

## Success Criteria

This command completes successfully when:

1. ✅ PRD generated with 3-8 user stories (appropriate scope)
2. ✅ Each story has 3-5 testable acceptance criteria
3. ✅ Problem statement clearly articulates "why"
4. ✅ Success metrics are measurable
5. ✅ Out of scope section prevents scope creep
6. ✅ Technical considerations align with Wasp framework
7. ✅ Large epics produce separate STORIES.md for mapping

---

## Next Command

After `/initiate` is complete:

```bash
/specify PRD-[feature-name].md
```

This will generate the technical specification.

---

## References

- **Next step:** `/specify` command (technical spec generation)
- **Workflow guide:** [docs/PLANNING-WORKFLOW.md](../docs/PLANNING-WORKFLOW.md)
- **Constitution:** [CLAUDE.md#constitution](../CLAUDE.md#constitution)
- **User story best practices:** See research in planning workflow doc
