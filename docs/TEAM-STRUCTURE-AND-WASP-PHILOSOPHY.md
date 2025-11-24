# Team Structure & Wasp Philosophy

**Why Feature-Based Teams > Role-Based Teams in Wasp**

This document explains Wasp's full-stack architecture philosophy and why the traditional backend/frontend developer split is unnecessary (and potentially counterproductive) in Wasp-based projects.

---

## 🎯 Executive Summary

**Key Findings:**

- ✅ Wasp is explicitly designed as a **full-stack framework** that eliminates backend/frontend boundaries
- ✅ **Feature-based teams** are optimal: one developer owns complete features (UI + operations + DB)
- ✅ **33% faster development** without coordination overhead (6 days → 4 days)
- ✅ **Auto-generated API** and **auto-synced types** remove need for specialized API design
- ❌ Traditional backend/frontend split creates **unnecessary coordination overhead** and **git conflicts**

**Recommendation:**

Use **feature-based worktrees** (`feature-x/`, `dashboard/`, `auth/`) instead of **role-based worktrees** (`backend/`, `frontend/`).

---

## 📐 Wasp's Full-Stack Architecture Philosophy

### What Wasp Docs Say

> "Wasp is fundamentally a **full-stack framework** that blurs traditional backend/frontend boundaries."
>
> "Individual developers can write both UI (React) and server operations (Node.js). **No need for separate backend/frontend developers; one person can own features end-to-end.**"
>
> — Wasp Official Documentation

### Vertical Structure (By Feature)

**Open SaaS Documentation:**

> "We've structured this full-stack app template **vertically (by feature)**. Most directories within `app/src` contain **both the React client code AND NodeJS server code** necessary for implementing its logic."

**Core Principle:**

```
✅ CORRECT: Feature-based
app/src/{feature}/
├── UI code      (React components)
└── Server code  (operations.ts)

❌ WRONG: Layer-based
app/src/frontend/   (all React)
app/src/backend/    (all Node.js)
```

**Implication:** A **feature** = UI + backend in the **SAME directory**, owned by **ONE developer**.

**→ Complete code organization:** [CODE-ORGANIZATION.md](CODE-ORGANIZATION.md) - See this document for detailed directory structure, file naming, and concrete examples.

---

## 🛠 Skillset Analysis

### What Skills Are Required?

| Skill                 | Traditional Backend             | Traditional Frontend     | **Wasp Full-Stack**                |
| --------------------- | ------------------------------- | ------------------------ | ---------------------------------- |
| **React/TypeScript**  | ❌ Not needed                   | ✅ Core                  | ✅ Core                            |
| **Node.js**           | ✅ Core                         | ❌ Not needed            | ✅ Needed (but simple)             |
| **REST API design**   | ✅ Core (HIGH complexity)       | ❌ Not needed            | ❌ **Not needed!**                 |
| **Database queries**  | ✅ Core (SQL - HIGH complexity) | ❌ Not needed            | ✅ Prisma (query builder - MEDIUM) |
| **Auth/Session**      | ✅ Core (HIGH complexity)       | Minimal                  | ❌ **Wasp built-in!**              |
| **Type coordination** | Manual (HIGH complexity)        | Manual (HIGH complexity) | ❌ **Automatic!**                  |

### Key Differences

**Traditional Backend Developer:**

- Expert in Node.js, Express, REST API design, SQL, auth systems
- Designs API endpoints, schemas, HTTP methods
- Manages type contracts manually with frontend

**Wasp Full-Stack Developer:**

- Writes TypeScript functions (`operations.ts`)
- Uses Prisma query builder (NOT raw SQL)
- Auth is built into Wasp framework
- API is auto-generated from `main.wasp` config
- Types automatically flow from server to client

**Prisma Query Example:**

```typescript
// NOT raw SQL:
// SELECT * FROM tasks WHERE userId = ? AND status = ?

// Prisma query builder (much simpler):
const tasks = await context.entities.Task.findMany({
  where: {
    userId: context.user.id,
    status: "DONE",
  },
});
```

**Conclusion:** A good **TypeScript/React developer** can do BOTH in Wasp!

---

## ⚡ Productivity Comparison

### Traditional (Backend + Frontend Split)

| Phase                 | Backend Dev        | Frontend Dev       | Total                    | Issues                     |
| --------------------- | ------------------ | ------------------ | ------------------------ | -------------------------- |
| **Design**            | API spec (1d)      | -                  | 1d                       | Sync meeting needed        |
| **Implement Backend** | Operations (2d)    | -                  | 2d                       | -                          |
| **Sync**              | Meeting (30m)      | Meeting (30m)      | 1h                       | Type contracts discussed   |
| **Integrate**         | -                  | API calls (1d)     | 1d                       | -                          |
| **Bug Fix**           | Type mismatch (2h) | Type mismatch (2h) | 4h                       | Another sync meeting       |
| **Testing**           | E2E tests (1d)     | E2E tests (1d)     | 2d                       | Need both for E2E          |
| **TOTAL**             | **3.5 days**       | **2.5 days**       | **6 days + 2h meetings** | 2 sync meetings, type bugs |

**Problems:**

- 🔴 Coordination overhead (sync meetings)
- 🔴 Type mismatches (manual contracts)
- 🔴 PR dependencies (frontend waits for backend)
- 🔴 Integration bugs (found late)

---

### Wasp (Full-Stack)

| Phase             | Full-Stack Dev          | Total                  | Issues                   |
| ----------------- | ----------------------- | ---------------------- | ------------------------ |
| **Design**        | Feature plan (0.5d)     | 0.5d                   | -                        |
| **Implement Ops** | operations.ts (1d)      | 1d                     | -                        |
| **Implement UI**  | React components (1.5d) | 1.5d                   | Types auto-sync ✅       |
| **Testing**       | E2E tests (1d)          | 1d                     | Single dev controls both |
| **TOTAL**         | **4 days**              | **4 days, 0 meetings** | No coordination overhead |

**Benefits:**

- ✅ No coordination overhead
- ✅ Auto-synced types (no mismatches)
- ✅ No PR dependencies
- ✅ Integration bugs caught early (same developer)

**Time Saving:** **33% faster** (6 days → 4 days) + **zero sync meetings**

---

## 🎨 Use Case Analysis

### Concrete Example: Document Editor Feature

| Component                           | Traditional Approach             | Wasp Approach                 |
| ----------------------------------- | -------------------------------- | ----------------------------- |
| **UI:** Rich text editor with forms | Frontend dev (React specialist)  | ✅ React developer            |
| **Backend:** CRUD operations        | Backend dev (Node.js specialist) | ✅ TypeScript functions       |
| **Database:** Document schema       | Backend dev (DB design)          | ✅ Prisma schema              |
| **API:** External service           | Backend dev (API integration)    | ✅ Node.js fetch in operation |
| **Permissions:** Role-based access  | Backend dev (authorization)      | ✅ Helper functions           |
| **API design:** REST endpoints      | Backend dev (API architect)      | ❌ **Not needed - auto!**     |
| **Type contracts:** Share types     | Both teams coordinate            | ❌ **Auto-generated!**        |

### Traditional Workflow

```
Day 1:    Backend: Design API endpoints
Day 2-3:  Backend: Implement operations
          → Sync meeting (30 min)
Day 4:    Frontend: Integrate API
          → Bug: Type mismatch found
          → Sync meeting (30 min)
Day 5:    Both: Fix type bugs
Day 6:    Both: E2E testing

Total: 6 days + 2 sync meetings + type bugs
```

### Wasp Workflow

```
Day 1:    Write operations.ts (Prisma queries, auth, external API)
Day 2-3:  Write React UI (editor, forms, components)
          → Types automatically sync from operations to UI
Day 4:    E2E testing (single developer controls both)

Total: 4 days + 0 meetings + 0 type bugs
```

**Conclusion:** For medium complexity features (medium complexity UI + medium complexity backend), **one full-stack developer is optimal**.

---

## 🤔 When Does Specialization Make Sense?

### Scenario A: Extreme UI Complexity

**Examples:**

- Complex animations with GSAP/Framer Motion
- Canvas/WebGL rendering
- Advanced accessibility (screen readers, keyboard navigation)
- Complex state management (Redux saga, RxJS)

**Wasp Impact:** None - UI complexity remains

**Verdict:** **UI specialist can help**, but they should ALSO write operations.ts (which is simple in Wasp)

---

### Scenario B: Extreme Backend Complexity

**Examples:**

- Complex algorithms (graph algorithms, optimization)
- Real-time data pipelines (Kafka, streaming)
- Machine learning integration (model serving, training)
- High-performance computing

**Wasp Impact:** Partial - Prisma helps with queries, but algorithms remain complex

**Verdict:** **Backend specialist can help**, but they should ALSO write React UI (Wasp abstracts much)

---

### Scenario C: Large Team Size

**Team Size:** >5 developers

**Wasp Impact:** None - coordination complexity remains

**Verdict:** Specialization helps in large teams, **BUT feature-based is still better than layer-based**

**Better approach:**

```
✅ Team A: A3 feature (full-stack)
✅ Team B: Dashboard (full-stack)
✅ Team C: Auth/User management (full-stack)

❌ Team A: All backend
❌ Team B: All frontend
```

---

### Scenario D: Legacy Mindset

**Situation:** Team has backend/frontend specialists with 10+ years experience

**Wasp Impact:** High - skillset must broaden

**Options:**

1. **Cross-train:** Backend dev learns React, Frontend dev learns Node.js/Prisma
2. **Pair programming:** Backend + Frontend work together on features
3. **Gradual transition:** Start with small features, expand over time

**Verdict:** Retraining investment pays off quickly (33% productivity gain)

---

### Project Assessment

| Factor                 | Typical Small Project Status          | Specialization Needed?           |
| ---------------------- | ------------------------------------- | -------------------------------- |
| **UI Complexity**      | Medium (forms, lists, dashboards)     | ❌ No extreme scenarios          |
| **Backend Complexity** | Medium (CRUD, external APIs, auth)    | ❌ No ML pipelines, no real-time |
| **Team Size**          | Small (1-3 developers)                | ❌ Too small for specialization  |
| **Legacy Mindset**     | Greenfield project (or small codebase | ❌ No legacy constraints         |

**Verdict:** ✅ **Feature-based full-stack development is OPTIMAL for small-medium projects**

---

## 🌳 Git Worktree Strategy

### Current Setup (Role-Based) ❌

```
tasks/active/
├── toon/        # TechLead
├── backend/     # Backend developer
└── frontend/    # Frontend developer
```

**This suggests role-based worktrees.**

---

### Problem with Role-Based

**Scenario:** Building "Document Editor" feature

```
Backend dev works on:
  app/src/documents/operations.ts

Frontend dev works on:
  app/src/documents/DocumentEditorPage.tsx
  app/src/documents/SectionEditor.tsx

Both in SAME directory: app/src/documents/
```

**Problems:**

- 🔴 **Git conflicts** when both touch same directory
- 🔴 **PR dependencies** (frontend PR waits for backend PR)
- 🔴 **Coordination overhead** (sync meetings to align)
- 🔴 **Integration bugs** (found late when PRs merge)

---

### Recommended: Feature-Based Worktrees ✅

```
tasks/active/
├── lead/               # TechLead (infrastructure, architecture)
├── feature-documents/  # Document feature dev (UI + ops + external API)
├── user-dashboard/     # Dashboard dev (charts UI + analytics ops)
└── auth-flow/          # Auth dev (OAuth UI + session mgmt)
```

**Benefits:**

- ✅ **No git conflicts** (different directories)
- ✅ **No PR dependencies** (complete feature in one PR)
- ✅ **No coordination overhead** (no sync meetings)
- ✅ **End-to-end testing** (same developer controls both)
- ✅ **Wasp's vertical structure perfectly aligned**

---

### Concrete Example

**Feature: Document Editor**

**Role-Based (Anti-pattern):**

```
backend/ worktree:
- Create app/src/documents/operations.ts
- PR #1: "feat(documents): add CRUD operations"

↓ (frontend waits for merge)

frontend/ worktree:
- Create app/src/documents/DocumentEditorPage.tsx
- PR #2: "feat(documents): add editor UI"

↓ (integration bugs found)

Both developers:
- Fix type mismatches
- PR #3: "fix(documents): resolve integration bugs"
```

**Feature-Based (Recommended):**

```
feature-documents/ worktree:
- Create app/src/documents/operations.ts
- Create app/src/documents/DocumentEditorPage.tsx
- Create app/src/documents/SectionEditor.tsx
- Test integration locally
- PR #1: "feat(documents): add document editor (UI + ops)"

✅ Complete, tested, ready to merge
```

---

## 👥 Code Review Implications

### Role-Based Reviews

**Backend PR:** "feat(a3): add CRUD operations"

- Backend reviewers: ✅ Can review operations.ts
- Frontend reviewers: ❌ Can't review (no React context)
- **Result:** Siloed review, integration bugs slip through

**Frontend PR:** "feat(a3): add editor UI"

- Frontend reviewers: ✅ Can review React components
- Backend reviewers: ❌ Can't review (no backend context)
- **Result:** Siloed review, integration bugs slip through

---

### Feature-Based Reviews

**Feature PR:** "feat(a3): add document editor (UI + ops)"

- Full-stack reviewers: ✅ Can review ENTIRE feature
- Checks:
  - ✅ Operations have proper auth checks
  - ✅ UI correctly calls operations
  - ✅ Types match between server and client
  - ✅ Error handling works end-to-end
- **Result:** Holistic review, catches integration bugs early

---

## 🎯 Recommendations

### STOP Doing ❌

1. **Separate backend/frontend worktrees**

   - Current: `tasks/active/backend/`, `tasks/active/frontend/`
   - Problem: Git conflicts, coordination overhead

2. **Role-based task breakdown**

   - Current: "Backend task: Add Document CRUD", "Frontend task: Add Document UI"
   - Problem: Dependencies, sync meetings, integration bugs

3. **Separate PRs for same feature**
   - Current: Backend PR #1, Frontend PR #2, Fix PR #3
   - Problem: 3 PRs for 1 feature, delayed integration testing

---

### START Doing ✅

1. **Feature-based worktrees**

   ```
   tasks/active/
   ├── feature-documents/ # Full-stack dev
   ├── dashboard/         # Full-stack dev
   └── auth/              # Full-stack dev
   ```

2. **Feature-based task breakdown**

   - New: "Document Editor feature (UI + operations + external API integration)"
   - Benefit: Clear scope, single owner, complete feature

3. **Complete feature PRs**

   - New: One PR with UI + operations + tests
   - Benefit: Integration tested before PR, holistic reviews

4. **Full-stack developers with specialization**
   - Developer A: Full-stack with **backend expertise** (helps with complex queries, DB design)
   - Developer B: Full-stack with **UI expertise** (helps with complex React, design system)
   - **Both write operations.ts AND React components**
   - Specialization = expertise, not exclusivity

---

## 📋 Implementation Guide

### Step 1: Reorganize Worktrees

**Example Role-Based (Anti-pattern):**

```bash
tasks/active/
├── lead/        # TechLead
├── backend/     # Backend dev
└── frontend/    # Frontend dev
```

**Recommended Feature-Based:**

```bash
tasks/active/
├── lead/               # TechLead (infrastructure, architecture)
├── feature-documents/  # Document feature (complete)
├── user-dashboard/     # Dashboard feature (complete)
└── auth-flow/          # Auth feature (complete)
```

**Migration:**

```bash
# No immediate change needed - do this for NEW features
# Existing worktrees can stay until complete

# For next feature:
git worktree add ../project-feature-documents -b feature/documents
cd ../project-feature-documents
mkdir -p tasks/active/feature-documents/current
```

---

### Step 2: Update Task Templates

**Current daily-task.md:**

```markdown
### Task 1: [Task Name]

**Branch:** feature/BE-description # Role-based prefix
**Status:** ⏳ In Progress
```

**New daily-task.md:**

```markdown
### Task 1: [Feature Name]

**Branch:** feature/documents # Feature-based naming
**Scope:** Full-stack (UI + operations + DB + AI)
**Status:** ⏳ In Progress
```

---

### Step 3: Update PR Workflow

**Current (STOP):**

```bash
# Backend PR
git checkout -b feature/BE-documents-crud
# ... write operations.ts only
gh pr create --title "feat(documents): add CRUD operations"

# Frontend PR (waits for backend merge)
git checkout -b feature/FE-documents-editor
# ... write UI only
gh pr create --title "feat(documents): add editor UI"
```

**New (START):**

```bash
# Feature PR
git checkout -b feature/documents
# ... write operations.ts + UI + tests
gh pr create --title "feat(documents): add document editor (full-stack)"
```

---

### Step 4: Update Sprint Planning

**Current (STOP):**

```markdown
## Sprint N Stories

### Story 1: Document Editor

**Backend tasks:**

- [ ] Design API endpoints
- [ ] Implement CRUD operations
- [ ] Write backend tests

**Frontend tasks:**

- [ ] Design UI components
- [ ] Integrate API
- [ ] Write frontend tests
```

**New (START):**

```markdown
## Sprint N Stories

### Story 1: Document Editor

**Owner:** Developer A (full-stack with UI expertise)

**Tasks:**

- [ ] Design feature (UI + operations)
- [ ] Implement operations.ts (CRUD, permissions, external API)
- [ ] Implement UI (editor, forms)
- [ ] Write E2E tests
- [ ] Code review + merge

**Complexity:** 8 story points (full-stack)
```

---

## ❓ FAQ

### Q: Can a React developer write operations.ts?

**A: YES!** Operations are just TypeScript functions with Prisma queries.

**Example:**

```typescript
// operations.ts - NOT complex!
export const getTasks: GetTasks<void, Task[]> = async (_args, context) => {
  if (!context.user) throw new HttpError(401); // Simple check

  return context.entities.Task.findMany({
    // Prisma query (like LINQ)
    where: { userId: context.user.id },
    orderBy: { createdAt: "desc" },
  });
};
```

If you can write React components, you can write this.

---

### Q: Can a backend developer write React UI?

**A: YES!** Especially with ShadCN UI components.

**Example:**

```typescript
// DocumentEditorPage.tsx - NOT complex with ShadCN!
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuery, updateDocument } from 'wasp/client/operations';

export default function DocumentEditorPage() {
  const { data: document, isLoading } = useQuery(getDocument, { id: '123' });

  const handleSave = async (data) => {
    await updateDocument({ id: '123', data });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <h1>{document.title}</h1>
      <Button onClick={() => handleSave(...)}>Save</Button>
    </Card>
  );
}
```

If you can write Node.js APIs, you can write this.

---

### Q: What about specialization? Should everyone be equally skilled at everything?

**A: NO!** Specialization = expertise, not exclusivity.

**Recommended approach:**

- **Developer A:** Full-stack with **UI expertise**

  - Primary: Complex React (animations, canvas, a11y)
  - Secondary: Operations (CRUD, simple Prisma)
  - **Both UI AND operations**, but UI is strength

- **Developer B:** Full-stack with **backend expertise**
  - Primary: Complex operations (algorithms, performance, DB design)
  - Secondary: UI (forms, grids, ShadCN components)
  - **Both operations AND UI**, but operations is strength

**Benefits:**

- ✅ Can work independently on complete features
- ✅ Can help each other with complex areas
- ✅ No blocking dependencies
- ✅ Broader skillset (career growth)

---

### Q: How do we handle complex features that need deep expertise?

**A: Pair programming or async collaboration.**

**Scenario:** Document Editor needs complex UI (rich text) + complex external API (webhooks)

**Approach 1: Sequential with Review**

```
Week 1: UI expert implements rich text editor + basic operations
Week 2: Backend expert reviews operations, adds webhook integration
Week 3: UI expert reviews webhook integration, polishes UI
```

**Approach 2: Pair Programming**

```
Week 1-2: UI expert + Backend expert pair on feature
- UI expert drives UI implementation
- Backend expert drives operations implementation
- Both learn from each other
```

**Both approaches faster than traditional handoff!**

---

## 📚 References

- **Wasp Docs:** https://wasp.sh/docs/
- **Open SaaS Docs:** https://docs.opensaas.sh/
- **Wasp LLM Full Docs:** https://wasp.sh/llms-full.txt
- **Prisma Query Builder:** https://www.prisma.io/docs/concepts/components/prisma-client

---

## ✅ Action Items

- [ ] Discuss team structure with team (feature-based vs role-based)
- [ ] Plan worktree reorganization (gradual transition)
- [ ] Update task templates (feature-based scope)
- [ ] Update sprint planning template (full-stack stories)
- [ ] Cross-training plan (if needed)
  - Backend dev: React + ShadCN workshop
  - Frontend dev: Prisma + operations workshop

---

**Last Updated:** 2025-10-17
**Status:** Recommended approach for Wasp/OpenSaaS projects
