# Code Organisatie & Infrastructuur

**Master guide voor directory structuur, file naming, routing, en code placement.**

**Last Updated:** 2025-10-30

---

## 🎯 Wasp/OpenSaaS Fundament

This project is built on **Wasp** (full-stack framework) and the **OpenSaaS** template. This choice fundamentally determines how we organize code.

### Kernprincipes

**1. Vertical (Feature-Based) Structure**

Wasp is ontworpen voor **feature-based development**:

```
✅ CORRECT: Feature owns UI + Server + DB
app/src/{feature}/
├── FeaturePage.tsx       # React UI
├── operations.ts         # Server logic
└── components/           # Feature components

❌ WRONG: Layer-based separation
app/src/frontend/         # All React
app/src/backend/          # All Node.js
```

**Waarom?** Zie [TEAM-STRUCTURE-AND-WASP-PHILOSOPHY.md](TEAM-STRUCTURE-AND-WASP-PHILOSOPHY.md) voor complete rationale.

**2. Declarative Routing**

Routes worden gedeclareerd in `main.wasp`, niet in code:

```wasp
route TasksRoute { path: "/app/tasks", to: TasksPage }
page TasksPage {
  authRequired: true,
  component: import { TasksPage } from "@src/pages/tasks/TasksPage"
}
```

**3. Auto-Generated API**

Operations zijn TypeScript functies, Wasp genereert automatisch:

- REST API endpoints
- Type-safe client imports
- Auto-invalidation

**→ Result:** Één developer kan complete features bouwen (UI + backend).

---

## 🗂️ Directory Structuur

### Hybride Page Organisatie

We gebruiken **twee patronen** voor pages:

```
app/src/
├── pages/                    # 🆕 Product feature pages
│   ├── DashboardPage.tsx
│   └── tasks/
│       ├── TasksOverviewPage.tsx
│       ├── TaskDetailPage.tsx
│       └── TaskEditorPage.tsx
│
└── {feature}/                # 🔧 OpenSaaS template features
    ├── auth/
    │   ├── LoginPage.tsx
    │   └── SignupPage.tsx
    ├── payment/
    │   ├── PricingPage.tsx
    │   └── CheckoutPage.tsx
    └── admin/
        └── dashboards/
            └── AnalyticsDashboardPage.tsx
```

### Complete Structuur (Annotated)

```
app/src/
│
├── pages/                          # PRODUCT PAGES
│   ├── DashboardPage.tsx           # Main dashboard: /app
│   ├── DashboardPage.test.tsx
│   └── tasks/                      # Example feature pages
│       ├── TasksOverviewPage.tsx   # List view: /app/tasks
│       ├── TasksOverviewPage.test.tsx
│       ├── TaskDetailPage.tsx      # Detail view: /app/tasks/:id
│       ├── TaskDetailPage.test.tsx
│       └── TaskEditorPage.tsx      # Edit view: /app/tasks/:id/edit
│
├── components/                     # SHARED COMPONENTS
│   ├── ui/                        # ShadCN components (v2.3.0)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   │
│   ├── layout/                    # Layout components
│   │   ├── TopNavigation.tsx
│   │   ├── TopNavigation.test.tsx
│   │   └── ...
│   │
│   ├── common/                    # Common components
│   │   ├── PlaceholderCard.tsx
│   │   └── ...
│   │
│   └── tasks/                     # Feature-specific components
│       ├── TaskCard.tsx
│       ├── TaskCard.test.tsx
│       ├── CreateTaskDialog.tsx
│       └── filters/
│           └── TaskFilters.tsx
│
├── server/                        # SERVER-ONLY CODE
│   ├── tasks/
│   │   ├── operations.ts          # CRUD operations
│   │   └── operations.test.ts
│   │
│   ├── permissions/
│   │   ├── helpers.ts             # Permission checking
│   │   └── helpers.test.ts
│   │
│   ├── test-utils/                # Server test utilities
│   │   └── mockContext.ts
│   │
│   └── scripts/                   # Admin scripts
│
├── lib/                           # CLIENT UTILITIES
│   ├── tasks/
│   │   ├── constants.ts           # Feature constants
│   │   └── types.ts               # Feature types
│   │
│   ├── permissions/
│   │   └── client-helpers.ts      # Client permission utils
│   │
│   └── utils.ts                   # Tailwind cn() helper
│
├── shared/                        # SHARED CLIENT/SERVER
│   ├── types.ts                   # Shared types
│   └── constants.ts               # Shared constants
│
├── i18n/                          # INTERNATIONALIZATION
│   ├── config.ts
│   └── translations/
│       └── nl.ts
│
├── hooks/                         # REACT HOOKS
│   └── useDebounce.ts
│
├── test/                          # TEST SETUP
│   ├── setup.ts                   # Vitest config
│   └── CLAUDE.md                  # Test guide
│
├── __mocks__/                     # GLOBAL MOCKS
│   └── i18next.ts
│
│
├── auth/                          # 🔧 TEMPLATE: Auth feature
│   ├── LoginPage.tsx              # /login
│   ├── SignupPage.tsx             # /signup
│   └── email-and-pass/
│       ├── EmailVerificationPage.tsx
│       ├── PasswordResetPage.tsx
│       └── RequestPasswordResetPage.tsx
│
├── payment/                       # 🔧 TEMPLATE: Payment feature
│   ├── PricingPage.tsx            # /pricing
│   ├── CheckoutPage.tsx           # /checkout
│   ├── stripe/
│   └── lemonSqueezy/
│
├── admin/                         # 🔧 TEMPLATE: Admin feature
│   ├── dashboards/
│   │   ├── analytics/
│   │   │   └── AnalyticsDashboardPage.tsx
│   │   ├── users/
│   │   │   └── UsersDashboardPage.tsx
│   │   └── messages/
│   │       └── MessagesPage.tsx
│   │
│   ├── elements/
│   │   ├── settings/SettingsPage.tsx
│   │   └── calendar/CalendarPage.tsx
│   │
│   └── layout/
│
├── user/                          # 🔧 TEMPLATE: User feature
│   └── AccountPage.tsx            # /account
│
├── landing-page/                  # 🔧 TEMPLATE: Landing
│   ├── LandingPage.tsx            # /
│   ├── components/
│   └── logos/
│
├── demo-ai-app/                   # 🔧 TEMPLATE: Demo
│   └── DemoAppPage.tsx            # /demo-app
│
├── file-upload/                   # 🔧 TEMPLATE: File upload
│   └── FileUploadPage.tsx         # /file-upload
│
├── analytics/                     # 🔧 TEMPLATE: Analytics
│   └── providers/
│
├── client/                        # 🔧 TEMPLATE: Client utils
│   ├── components/
│   ├── hooks/
│   ├── icons/
│   └── static/
│
└── constants/                     # 🔧 TEMPLATE: Constants
```

---

## 🚦 Routing Mechanisme

### Wasp Declarative Routing

Routes worden centraal gedefinieerd in `main.wasp`:

```wasp
// STAP 1: Declareer Route
route TaskDetailRoute {
  path: "/app/tasks/:id",
  to: TaskDetailPage
}

// STAP 2: Declareer Page
page TaskDetailPage {
  authRequired: true,
  component: import { TaskDetailPage } from "@src/pages/tasks/TaskDetailPage"
}
```

### Complete Multi-Level Routing Example

```wasp
// Level 0: Dashboard
route DashboardRoute {
  path: "/app",
  to: DashboardPage
}

page DashboardPage {
  authRequired: true,
  component: import { DashboardPage } from "@src/pages/DashboardPage"
}

// Level 1: Feature Overview
route TasksOverviewRoute {
  path: "/app/tasks",
  to: TasksOverviewPage
}

page TasksOverviewPage {
  authRequired: true,
  component: import { TasksOverviewPage } from "@src/pages/tasks/TasksOverviewPage"
}

// Level 2: Detail View
route TaskDetailRoute {
  path: "/app/tasks/:id",
  to: TaskDetailPage
}

page TaskDetailPage {
  authRequired: true,
  component: import { TaskDetailPage } from "@src/pages/tasks/TaskDetailPage"
}

// Level 3: Editor
route TaskEditorRoute {
  path: "/app/tasks/:id/edit",
  to: TaskEditorPage
}

page TaskEditorPage {
  authRequired: true,
  component: import { TaskEditorPage } from "@src/pages/tasks/TaskEditorPage"
}
```

### Import Path Rules

**In `main.wasp`:**

```wasp
// ✅ CORRECT: Use @src/ prefix
component: import { TasksOverviewPage } from "@src/pages/tasks/TasksOverviewPage"

// ❌ WRONG: Relative paths don't work
component: import { TasksOverviewPage } from "../pages/tasks/TasksOverviewPage"
```

**In TypeScript files:**

```typescript
// ✅ CORRECT: Use relative paths
import { TaskCard } from "../../components/tasks/TaskCard";
import { PlaceholderCard } from "../components/common/PlaceholderCard";

// ❌ WRONG: @src/ doesn't work in .ts/.tsx
import { TaskCard } from "@src/components/tasks/TaskCard";
```

### Gebruik in Components

```typescript
import { Link, useParams } from 'react-router-dom'

// Navigation
<Link to="/app/tasks">Go to Tasks</Link>
<Link to={`/app/tasks/${task.id}`}>View Task</Link>

// Get params (type-safe)
const { id } = useParams()
```

---

## 🧩 Component Organisatie

### 3 Categorieën

**1. UI Components** (`components/ui/`)

ShadCN components - design system basis

```
components/ui/
├── button.tsx
├── card.tsx
├── dialog.tsx
├── input.tsx
├── dropdown-menu.tsx
└── ...
```

**Import:**

```typescript
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
```

**Versie:** ALLEEN ShadCN v2.3.0 (Tailwind v4 incompatible!)

**2. Layout Components** (`components/layout/`)

App-wide layout elementen

```
components/layout/
├── TopNavigation.tsx
├── TopNavigation.test.tsx
└── ...
```

**Import:**

```typescript
import { TopNavigation } from "../../components/layout/TopNavigation";
```

**3. Feature Components** (`components/{feature}/`)

Feature-specifieke componenten in **hybrid structure** (flat + sub-folders):

```
components/tasks/
├── TaskCard.tsx                  # Flat (shared)
├── TaskCard.test.tsx
├── TaskListView.tsx              # Flat (overview)
├── PriorityBadge.tsx             # Flat (shared)
├── filters/                      # Sub-folder (overview filters)
│   ├── CategoryFilter.tsx
│   ├── StatusFilter.tsx
│   └── AssigneeFilter.tsx
├── renderers/                    # Sub-folder (detail view)
│   ├── TaskInfoRenderer.tsx
│   ├── DescriptionRenderer.tsx
│   ├── index.ts
│   └── types.ts
└── editor/                       # Sub-folder (editor)
    ├── navigation/
    ├── layout/
    └── fields/
```

**Pattern:**

- **Flat components**: Shared across pages OR no cohesive group (TaskCard, PriorityBadge)
- **Sub-folders**: Page-specific cohesive groups (filters, renderers, editor)
- **Decision criteria**: Based on feature cohesion and single-page usage

**Import:**

```typescript
// Flat components (relative paths)
import { TaskCard } from "../../components/tasks/TaskCard";
import { TaskListView } from "../../components/tasks/TaskListView";

// Sub-folder components (relative paths)
import { CategoryFilter } from "../../components/tasks/filters/CategoryFilter";
import { TaskInfoRenderer } from "../../components/tasks/renderers/TaskInfoRenderer";
```

### Component → Page Relatie

```
Page (Multi-level)
  ↓ uses
Layout Components (TopNavigation)
  ↓ uses
Feature Components (TaskCard, CreateTaskDialog)
  ↓ uses
UI Components (Button, Card, Dialog)
```

**Voorbeeld:**

```typescript
// pages/tasks/TasksOverviewPage.tsx
import { TopNavigation } from '../../components/layout/TopNavigation'
import { TaskCard } from '../../components/tasks/TaskCard'
import { CreateTaskDialog } from '../../components/tasks/CreateTaskDialog'
import { Button } from '@/components/ui/button'

export function TasksOverviewPage() {
  return (
    <>
      <TopNavigation />
      <main>
        <CreateTaskDialog />
        {tasks?.map(task => <TaskCard key={task.id} task={task} />)}
      </main>
    </>
  )
}
```

---

## 🔧 Server Code Organisatie

### Operations Pattern

```
server/{feature}/
└── operations.ts          # CRUD + business logic
```

### Operations Refactoring Pattern

When `operations.ts` grows beyond **300 lines** OR logic becomes reusable, extract helpers to maintain readability:

```
server/{feature}/
├── operations.ts          # Main entry point (CRUD + business logic)
├── validators.ts          # Optional: Extracted input validation
├── filters.ts             # Optional: Extracted Prisma query building
├── activityLog.ts         # Optional: Domain-specific helpers
├── rateLimit.ts           # Optional: Security helpers
└── seed.ts                # Optional: Development seed data
```

**Example (Feature with Refactoring):**

```
server/tasks/
├── operations.ts          # Wasp operations (main entry)
├── validators.ts          # Zod schemas, validation functions
├── filters.ts             # Query building, filter composition
├── helpers.ts             # Domain-specific helper functions
├── rateLimit.ts           # Rate limiting checks
├── seed.ts                # Development seed logic
├── seed-data.ts           # Test data fixtures
└── seed-helpers.ts        # Seed utility functions
```

**When to Extract:**

- `operations.ts` exceeds 300 lines
- Logic is reused across multiple operations
- Validation/filtering logic obscures business logic
- Following DRY principle during REFACTOR phase

**Benefits:**

- Maintains readable `operations.ts` as main entry point
- Enables focused unit testing of helpers
- Follows single responsibility principle
- Supports maintainable TDD workflow

**Voorbeeld:**

```typescript
// server/tasks/operations.ts
import { HttpError } from "wasp/server";
import type { GetTasks, CreateTask } from "wasp/server/operations";

// Query
export const getTasks: GetTasks = async (args, context) => {
  if (!context.user) throw new HttpError(401);

  return context.entities.Task.findMany({
    where: { userId: context.user.id },
  });
};

// Action
export const createTask: CreateTask = async (args, context) => {
  if (!context.user) throw new HttpError(401);

  return context.entities.Task.create({
    data: { ...args, userId: context.user.id },
  });
};
```

**Declaratie in `main.wasp`:**

```wasp
query getTasks {
  fn: import { getTasks } from "@src/server/tasks/operations",
  entities: [Task]
}

action createTask {
  fn: import { createTask } from "@src/server/tasks/operations",
  entities: [Task]
}
```

### Permission Helpers

```
server/permissions/
└── helpers.ts             # Reusable permission checks (SERVER-SIDE ENFORCEMENT)
```

**Voorbeeld:**

```typescript
// server/permissions/helpers.ts
export async function canUserAccessResource(
  userId: string,
  resourceId: string,
  context,
) {
  const resource = await context.entities.Resource.findUnique({
    where: { id: resourceId },
  });

  if (!resource) return false;
  if (resource.userId === userId) return true;

  // Check additional permissions (team, organization, etc.)...
  return false;
}
```

### Client Permission Helpers

**⚠️ CRITICAL:** Client-side permissions are for **UI convenience only** (showing/hiding buttons). **Server-side enforcement** in operations is **mandatory** for security.

```
lib/permissions/
├── taskPermissions.ts     # Task permission helpers (client-side UI checks)
├── projectPermissions.ts  # Project permission helpers
└── resourcePermissions.ts # Resource permission helpers
```

**Pattern:** One file per feature for permission helpers.

**Example (Task Feature):**

```typescript
// lib/permissions/taskPermissions.ts
import type { Role } from "@prisma/client";

/**
 * Client-Side Permission Helpers for Tasks
 *
 * These helpers run in the browser and check UI-level permissions based on
 * user data from useAuth(). They determine button visibility but do NOT
 * enforce security (server-side operations enforce actual security).
 *
 * Server-side enforcement: app/src/server/permissions/helpers.ts
 */

interface User {
  id: string;
  role: Role;
  teamMemberships?: Array<{ teamId: string; role: Role }>;
}

interface Task {
  authorId: string;
  teamId: string | null;
}

/**
 * canEditTask - Check if user can edit a task (client-side UI check)
 * @param user - User object from useAuth()
 * @param task - Task object
 * @returns true if user is author OR has appropriate role
 */
export function canEditTask(user: User | null, task: Task): boolean {
  if (!user) return false;

  // Author can always edit their own task
  if (task.authorId === user.id) return true;

  // Check team-based permissions if task belongs to a team
  if (task.teamId && user.teamMemberships) {
    const membership = user.teamMemberships.find(
      (m) => m.teamId === task.teamId,
    );
    return membership?.role === "ADMIN" || membership?.role === "MANAGER";
  }

  return false;
}
```

**Rationale:**

- Matches feature-based component organization
- Enables parallel development (one file per feature)
- Clear ownership and maintainability
- Proper TypeScript typing with Prisma types

### Test Utilities

```
server/test-utils/
└── mockContext.ts         # Mock context for tests
```

---

## 📐 Architecture Flow

### Request Lifecycle

```
1. USER REQUEST
   URL: /app/tasks/abc-123
   ↓

2. WASP ROUTING (main.wasp)
   route TaskDetailRoute { path: "/app/tasks/:id", to: TaskDetailPage }
   ↓

3. PAGE COMPONENT (pages/tasks/TaskDetailPage.tsx)
   - Calls useQuery(getTask, { id })
   ↓

4. WASP CLIENT (auto-generated)
   - HTTP POST /operations/getTask
   ↓

5. WASP SERVER (auto-generated)
   - Calls server/tasks/operations.ts:getTask()
   ↓

6. OPERATION (server/tasks/operations.ts)
   - Checks auth
   - Queries database via context.entities
   - Returns data
   ↓

7. WASP CLIENT (auto-generated)
   - Receives data
   - Updates cache
   - Re-renders page
   ↓

8. PAGE RENDERS
   - Uses components from components/tasks/
   - Displays data
```

### Multi-Level Navigation Mapping

```
LEVEL 0: Dashboard
  Route: /app
  Page:  pages/DashboardPage.tsx
  ↓

LEVEL 1: Feature Overview
  Route: /app/tasks
  Page:  pages/tasks/TasksOverviewPage.tsx
  Query: getTasks
  ↓

LEVEL 2: Detail View
  Route: /app/tasks/:id
  Page:  pages/tasks/TaskDetailPage.tsx
  Query: getTask
  ↓

LEVEL 3: Editor
  Route: /app/tasks/:id/edit
  Page:  pages/tasks/TaskEditorPage.tsx
  Query: getTask
  Action: updateTask
```

---

## 🔍 Waar Plaats Ik...?

### Decision Tree: Nieuwe Page

```
Is het een OpenSaaS template feature?
(auth, payment, admin, landing, etc.)
├─ YES → src/{feature}/{Feature}Page.tsx
│         Voorbeeld: src/auth/LoginPage.tsx
│
└─ NO → Is het een product feature?
         ├─ YES → src/pages/{feature}/{Feature}Page.tsx
         │         Voorbeelden:
         │         - src/pages/DashboardPage.tsx
         │         - src/pages/tasks/TasksOverviewPage.tsx
         │         - src/pages/tasks/TaskDetailPage.tsx
         │         - src/pages/projects/ProjectsOverviewPage.tsx
         │
         └─ NO → Overleg met team (edge case)
```

**Voorbeelden:**

| Page            | Locatie                                                 | Reden            |
| --------------- | ------------------------------------------------------- | ---------------- |
| Tasks Overview  | `pages/tasks/TasksOverviewPage.tsx`                     | Product feature  |
| Project Detail  | `pages/projects/ProjectDetailPage.tsx`                  | Product feature  |
| Dashboard       | `pages/DashboardPage.tsx`                               | Product feature  |
| Login           | `auth/LoginPage.tsx`                                    | Template feature |
| Pricing         | `payment/PricingPage.tsx`                               | Template feature |
| Admin Dashboard | `admin/dashboards/analytics/AnalyticsDashboardPage.tsx` | Template feature |

### Decision Tree: Nieuwe Component

```
Is het een ShadCN UI component?
├─ YES → components/ui/{component}.tsx
│         Installeer via: npx shadcn@2.3.0 add {component}
│         Fix import: "../../lib/utils"
│
└─ NO → Is het app-wide layout?
         ├─ YES → components/layout/{Component}.tsx
         │         Voorbeelden: TopNavigation, Breadcrumbs
         │
         └─ NO → Is het feature-specifiek?
                  ├─ YES → Is het deel van cohesieve groep (≥3 gerelateerde componenten)?
                  │        ├─ YES → components/{feature}/{group}/{Component}.tsx
                  │        │        Wanneer:
                  │        │        - Groep specifiek voor één page/mode
                  │        │        - Meerdere gerelateerde componenten (≥3)
                  │        │        - Duidelijke cohesie (filters, renderers, editor)
                  │        │
                  │        │        Voorbeelden:
                  │        │        - components/tasks/filters/CategoryFilter.tsx
                  │        │        - components/tasks/renderers/TaskInfoRenderer.tsx
                  │        │        - components/tasks/editor/navigation/SectionTabs.tsx
                  │        │
                  │        └─ NO → components/{feature}/{Component}.tsx (flat)
                  │                 Wanneer:
                  │                 - Shared across pages
                  │                 - No clear cohesive group
                  │                 - Single-purpose component
                  │
                  │                 Voorbeelden:
                  │                 - components/tasks/TaskCard.tsx
                  │                 - components/tasks/TaskListView.tsx
                  │                 - components/tasks/PriorityBadge.tsx
                  │
                  └─ NO → Is het algemeen herbruikbaar?
                           └─ YES → components/common/{Component}.tsx
                                    Voorbeeld: PlaceholderCard.tsx
```

### Decision Tree: Nieuwe Operation

```
Waar hoort de business logic?

1. ALTIJD server-side in operations.ts
   server/{feature}/operations.ts

2. Declareer in main.wasp:
   query {name} {
     fn: import { {name} } from "@src/server/{feature}/operations",
     entities: [{Entity}]
   }

3. Gebruik in client:
   import { {name} } from 'wasp/client/operations'
   const { data } = useQuery({name}, args)
```

**Voorbeelden:**

| Operation  | Locatie                      | Declaration                 |
| ---------- | ---------------------------- | --------------------------- |
| getTasks   | `server/tasks/operations.ts` | `query getTasks { ... }`    |
| createTask | `server/tasks/operations.ts` | `action createTask { ... }` |
| updateTask | `server/tasks/operations.ts` | `action updateTask { ... }` |

### Decision Tree: Test File

```
Waar staat de implementation?
  ↓
Test gaat in SAME directory met .test.{ts,tsx} suffix

Voorbeelden:
- pages/DashboardPage.tsx → pages/DashboardPage.test.tsx
- components/tasks/TaskCard.tsx → components/tasks/TaskCard.test.tsx
- server/tasks/operations.ts → server/tasks/operations.test.ts
- server/permissions/helpers.ts → server/permissions/helpers.test.ts
```

**NIET:**

```
❌ src/tests/pages/DashboardPage.test.tsx    (separate test folder)
❌ src/__tests__/A3Card.test.tsx             (separate test folder)
```

---

## 📝 File Naming Conventions

### Pages

```
{Feature}Page.tsx           # PascalCase + Page suffix

Voorbeelden:
- DashboardPage.tsx
- TasksOverviewPage.tsx
- TaskDetailPage.tsx
- LoginPage.tsx
- PricingPage.tsx
```

### Components

```
{Feature}{Type}.tsx         # PascalCase

Voorbeelden:
- TaskCard.tsx
- CreateTaskDialog.tsx
- TopNavigation.tsx
- PlaceholderCard.tsx
```

### Operations

```
operations.ts               # Lowercase, fixed name

Per feature één operations.ts:
- server/tasks/operations.ts
- server/organization/operations.ts (future)
```

### Tests

```
{FileName}.test.{ts,tsx}    # Same name + .test suffix

Voorbeelden:
- DashboardPage.test.tsx
- A3Card.test.tsx
- operations.test.ts
```

### Utilities & Helpers

```
{purpose}.ts                # Lowercase, descriptive

Voorbeelden:
- lib/utils.ts              # Tailwind cn() helper
- lib/tasks/constants.ts    # Feature constants
- hooks/useDebounce.ts      # Custom hook
- server/permissions/helpers.ts
```

---

## 📦 Concrete Voorbeelden

### Complete Feature Breakdown Example

```
Task Feature Code Locations:

PAGES (Product)
├── pages/DashboardPage.tsx              # Level 0: Shows feature stats
├── pages/tasks/TasksOverviewPage.tsx    # Level 1: List/grid view
├── pages/tasks/TaskDetailPage.tsx       # Level 2: Read-only view
└── pages/tasks/TaskEditorPage.tsx       # Level 3: Edit mode

COMPONENTS (Feature-specific)
├── components/tasks/TaskCard.tsx        # Card component (flat - shared)
├── components/tasks/TaskListView.tsx    # List view (flat - overview)
├── components/tasks/PriorityBadge.tsx   # Status badge (flat - shared)
├── components/tasks/filters/            # Overview filters (sub-folder)
│   ├── CategoryFilter.tsx
│   ├── StatusFilter.tsx
│   └── AssigneeFilter.tsx
├── components/tasks/renderers/          # Detail view (sub-folder)
│   ├── TaskInfoRenderer.tsx
│   └── DescriptionRenderer.tsx
└── components/tasks/editor/             # Editor (sub-folder)
    ├── navigation/SectionTabs.tsx
    ├── layout/ActionBar.tsx
    └── fields/TaskForm.tsx

COMPONENTS (Shared)
└── components/layout/TopNavigation.tsx  # App-wide nav

SERVER (Operations)
├── server/tasks/operations.ts           # CRUD operations
└── server/permissions/helpers.ts        # Permission checks

LIB (Client utilities)
├── lib/tasks/constants.ts               # Feature constants
└── lib/tasks/types.ts                   # Feature types

ROUTING (main.wasp)
├── route DashboardRoute
├── route TasksOverviewRoute
├── route TaskDetailRoute
├── page DashboardPage
├── page TasksOverviewPage
├── page TaskDetailPage
├── query getTasks
├── query getTask
└── action createTask

DATABASE (schema.prisma)
└── model Task { ... }
```

### Complete Auth Feature Breakdown (Template)

```
Auth Feature (OpenSaaS Template):

PAGES (Template - in feature folder)
├── auth/LoginPage.tsx                   # /login
├── auth/SignupPage.tsx                  # /signup
├── auth/email-and-pass/
│   ├── EmailVerificationPage.tsx        # /email-verification
│   ├── PasswordResetPage.tsx            # /password-reset
│   └── RequestPasswordResetPage.tsx     # /request-password-reset

ROUTING (main.wasp)
├── route LoginRoute
├── route SignupRoute
├── page LoginPage
└── page SignupPage

AUTH CONFIG (main.wasp)
└── auth { ... }
```

### File Structure Comparison

```
🆕 PRODUCT FEATURE (Tasks):
pages/tasks/                 ← Pages in dedicated folder
components/tasks/            ← Components separate
server/tasks/                ← Operations separate

🔧 TEMPLATE FEATURE (Auth):
auth/                        ← Pages in feature folder
  ├── LoginPage.tsx
  └── SignupPage.tsx
(no components - uses UI components directly)
(auth operations built into Wasp)
```

### Complete Feature Implementation Example 🎯

**Example Feature** demonstrates complete code organization patterns for this project:

**Key Characteristics:**

- Feature-based vertical slice (database → operations → UI in single feature)
- Proper refactoring (extracted validators/filters for maintainability)
- Test co-location (comprehensive test coverage with strong assertions)
- Clean separation of concerns (pages, components, operations)
- TDD workflow implementation (RED → GREEN → REFACTOR with quality gates)
- Permission patterns (role-based or team-based access control)

**Complete Feature Structure:**

```
DATABASE (schema.prisma)
└── model Task
    ├── Related models (Comments, Attachments, etc.)
    ├── User relationships (author, assignee)
    └── Metadata (timestamps, status)

PAGES (Product - Multi-level)
├── pages/DashboardPage.tsx              # Level 0: Feature overview
├── pages/tasks/TasksOverviewPage.tsx    # Level 1: List with filters
└── pages/tasks/TaskDetailPage.tsx       # Level 2: Detail view

COMPONENTS (Feature-based)
├── components/tasks/
│   ├── TaskCard.tsx                     # Card component
│   ├── TaskListView.tsx                 # List/grid display
│   ├── CreateTaskDialog.tsx             # Create dialog (portal component)
│   ├── StatisticsDashboard.tsx          # Analytics cards
│   ├── StatisticsCard.tsx               # Individual stat card
│   ├── PriorityBadge.tsx                # Status indicator
│   └── filters/                         # Filter components
│       ├── StatusFilter.tsx
│       ├── CategoryFilter.tsx
│       └── AssigneeFilter.tsx

COMPONENTS (Shared)
├── components/common/
│   ├── PlaceholderCard.tsx              # Empty state card
│   ├── LoadingState.tsx                 # Loading indicator
│   ├── EmptyState.tsx                   # No results state
│   └── ErrorState.tsx                   # Error display
│
└── components/layout/
    ├── TopNavigation.tsx                # App-wide navigation
    ├── SecondaryNavigation.tsx          # Feature-specific actions
    └── AppLayout.tsx                    # Layout wrapper

SERVER (Operations - Refactored)
├── server/tasks/
│   ├── operations.ts                    # Wasp operations (main entry)
│   ├── validators.ts                    # Zod schemas (extracted)
│   ├── filters.ts                       # Prisma query building (extracted)
│   ├── helpers.ts                       # Domain-specific helpers
│   ├── rateLimit.ts                     # Rate limiting checks
│   ├── seed.ts                          # Development seed logic
│   ├── seed-data.ts                     # Test data fixtures
│   └── seed-helpers.ts                  # Seed utility functions

CLIENT UTILITIES
├── lib/tasks/
│   ├── formatting.ts                    # Date/text formatting
│   └── styling.ts                       # CSS class helpers
│
├── lib/permissions/
│   └── taskPermissions.ts               # Client permission checks
│
└── hooks/
    ├── useTaskFilters.ts                # Filter state management
    ├── useTaskStatistics.ts             # Statistics calculation
    └── useDebounce.ts                   # Search debounce

CONSTANTS
├── constants/
│   ├── taskSpecs.ts                     # Feature specifications
│   └── taskStatus.ts                    # Status label mappings

ROUTING (main.wasp)
├── route DashboardRoute { path: "/app" }
├── route TasksOverviewRoute { path: "/app/tasks" }
├── route TaskDetailRoute { path: "/app/tasks/:id" }
├── query getTasks                       # List with filters
├── query getTask                        # Single task
├── action createTask                    # Create new task
├── action updateTask                    # Update metadata
├── action deleteTask                    # Delete task
└── action archiveTask                   # Archive task

TESTS (Co-located)
├── Component tests                      # Vitest + Testing Library
├── Operation tests                      # Server-side unit tests
├── Integration tests                    # Seed verification
└── Security tests                       # Permission enforcement
```

**Quality Standards:**

- **Test Coverage:** ≥80% statement coverage target, ≥75% branch coverage
- **Test Quality:** Strong assertions (verify behavior, not existence)
- **Code Organization:** Follow CODE-ORGANIZATION.md patterns consistently
- **TDD Compliance:** RED → GREEN → REFACTOR workflow with quality gates

**Key Patterns to Follow:**

1. **Refactoring Pattern** → Extract helpers when >300 lines (validators, filters)
2. **Permission Pattern** → Client helpers in `lib/permissions/{feature}Permissions.ts`
3. **Seed Pattern** → Development seed data in `server/{feature}/seed.ts`
4. **Component Testing** → 3-layer strategy for portal components (Dialog, Sheet)
5. **Feature Isolation** → Complete vertical slice owned by feature

**→ Use this structure as template** for implementing new features.

---

## 🎨 Import Patterns

### From Pages

```typescript
// pages/tasks/TasksOverviewPage.tsx

// Wasp imports (operations)
import { useQuery } from "wasp/client/operations";
import { getTasks } from "wasp/client/operations";

// Layout components (relative path, up 2 levels)
import { TopNavigation } from "../../components/layout/TopNavigation";

// Feature components - Flat (relative path, up 2 levels)
import { TaskCard } from "../../components/tasks/TaskCard";
import { TaskListView } from "../../components/tasks/TaskListView";

// Feature components - Sub-folders (relative path, up 2 levels)
import { CategoryFilter } from "../../components/tasks/filters/CategoryFilter";
import { StatusFilter } from "../../components/tasks/filters/StatusFilter";

// UI components (@ alias ONLY)
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// React Router
import { Link } from "react-router-dom";

// i18n
import { useTranslation } from "react-i18next";
```

```typescript
// pages/tasks/TaskDetailPage.tsx

// Feature components - Sub-folders (relative paths)
import { TaskInfoRenderer } from "../../components/tasks/renderers/TaskInfoRenderer";
import { DescriptionRenderer } from "../../components/tasks/renderers/DescriptionRenderer";

// Feature components - Flat (relative paths)
import { TaskListView } from "../../components/tasks/TaskListView";
import { PriorityBadge } from "../../components/tasks/PriorityBadge";

// UI components (@ alias ONLY)
import { Button } from "@/components/ui/button";
```

### From Components

```typescript
// components/tasks/TaskCard.tsx

// Wasp types
import type { Task } from "wasp/entities";

// UI components (@ alias)
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Utils (relative path)
import { cn } from "../../lib/utils";

// React Router
import { Link } from "react-router-dom";

// Icons
import { Edit, Trash } from "lucide-react";
```

### From Operations

```typescript
// server/tasks/operations.ts

// Wasp server imports
import { HttpError } from "wasp/server";
import type { GetTasks, CreateTask } from "wasp/server/operations";

// Wasp entities (types only)
import type { Task, User } from "wasp/entities";

// Prisma enums (runtime values)
import { TaskStatus } from "@prisma/client";

// Permission helpers (relative path)
import { canUserAccessTask } from "../permissions/helpers";
```

---

## 🔗 Gerelateerde Documentatie

| Document                                  | Onderwerp                                    | Link                                          |
| ----------------------------------------- | -------------------------------------------- | --------------------------------------------- |
| **TEAM-STRUCTURE-AND-WASP-PHILOSOPHY.md** | **Waarom** feature-based development         | [Link](TEAM-STRUCTURE-AND-WASP-PHILOSOPHY.md) |
| **CLAUDE.md**                             | Import rules, conventions, core architecture | [Link](../CLAUDE.md)                          |
| **app/CLAUDE.md**                         | Operations patterns, database, ShadCN        | [Link](../app/CLAUDE.md)                      |
| **TDD-WORKFLOW.md**                       | Test organisatie, coverage                   | [Link](TDD-WORKFLOW.md)                       |
| **TROUBLESHOOTING-GUIDE.md**              | Import errors, type issues                   | [Link](TROUBLESHOOTING-GUIDE.md)              |

---

## 📚 Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────┐
│ CODE ORGANIZATION QUICK REFERENCE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ PAGES:                                                          │
│   Product    → src/pages/{feature}/{Feature}Page.tsx           │
│   Template   → src/{feature}/{Feature}Page.tsx                 │
│                                                                 │
│ COMPONENTS:                                                     │
│   UI         → src/components/ui/{component}.tsx               │
│   Layout     → src/components/layout/{Component}.tsx           │
│   Feature    → src/components/{feature}/{Component}.tsx        │
│   Common     → src/components/common/{Component}.tsx           │
│                                                                 │
│ SERVER:                                                         │
│   Operations → src/server/{feature}/operations.ts              │
│   Permissions→ src/server/permissions/helpers.ts               │
│   Test Utils → src/server/test-utils/                          │
│                                                                 │
│ TESTS:                                                          │
│   Location   → Same directory as implementation                │
│   Naming     → {FileName}.test.{ts,tsx}                        │
│                                                                 │
│ ROUTING:                                                        │
│   Config     → main.wasp (declarative)                         │
│   Import     → @src/ in main.wasp, relative in .ts/.tsx        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist: Nieuwe Feature Toevoegen

Voor bijvoorbeeld "Project Management Feature":

**1. Database Schema** (`app/schema.prisma`)

```prisma
model Project {
  id        String   @id @default(uuid())
  title     String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}
```

**2. Migration**

```bash
wasp db migrate-dev "Add project model"
../scripts/safe-start.sh  # Restart required!
```

**3. Operations** (`server/projects/operations.ts`)

```typescript
export const getProjects: GetProjects = async (args, context) => {
  if (!context.user) throw new HttpError(401)
  return context.entities.Project.findMany({ ... })
}
```

**4. Routes & Pages** (`main.wasp`)

```wasp
route ProjectsOverviewRoute { path: "/app/projects", to: ProjectsOverviewPage }
page ProjectsOverviewPage {
  authRequired: true,
  component: import { ProjectsOverviewPage } from "@src/pages/projects/ProjectsOverviewPage"
}

query getProjects {
  fn: import { getProjects } from "@src/server/projects/operations",
  entities: [Project]
}
```

**5. Page Component** (`pages/projects/ProjectsOverviewPage.tsx`)

```typescript
export function ProjectsOverviewPage() {
  const { data: projects } = useQuery(getProjects);
  // ...
}
```

**6. Feature Components** (`components/projects/`)

```
components/projects/
├── ProjectCard.tsx
├── CreateProjectDialog.tsx
└── ...
```

**7. Tests**

```
pages/projects/ProjectsOverviewPage.test.tsx
components/projects/ProjectCard.test.tsx
server/projects/operations.test.ts
```

**8. Update Navigation** (`components/layout/TopNavigation.tsx`)

```typescript
<Link to="/app/projects">Projects</Link>
```

Done! 🎉

---

**Last Updated:** 2025-10-30
**Maintainer:** TechLead
**Status:** Living Document (update bij architectuur changes)
