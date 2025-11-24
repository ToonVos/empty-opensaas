# Multi-Worktree Database & Server Strategie

**Date:** 2025-10-18
**Version:** 1.0
**Status:** Decision Required - Review & Select Strategy

**Context:** Bij multi-worktree development met Wasp ontstaat de vraag: hoe gaan frontend server, backend server, en database naast elkaar functioneren? Dit document analyseert het probleem en presenteert 3 strategieën met voor/nadelen.

---

## 🎯 Probleemstelling

### Wasp's Server Architectuur

Wanneer je `wasp start` runt, start Wasp **3 processen**:

| Component           | Type     | Poort | Functie                                 |
| ------------------- | -------- | ----- | --------------------------------------- |
| PostgreSQL Database | Database | 5432  | Data opslag (shared state)              |
| Backend Server      | Node.js  | 3001  | API endpoints, operations, auth         |
| Frontend Dev Server | Vite     | 3000  | React app serving, hot reload, proxying |

### Het Conflict

**Wanneer je meerdere worktrees hebt:**

```
/Users/toonvos/Projects/LEANAICOACH/
├── lean-ai-coach-tl/           # TechLead worktree
├── lean-ai-coach-a3-crud/      # A3-CRUD worktree
├── lean-ai-coach-a3-sections/  # A3-Sections worktree
└── lean-ai-coach-a3-ai/        # A3-AI worktree
```

**En je probeert `wasp start` in meerdere worktrees tegelijk:**

```bash
# In lean-ai-coach-tl/
wasp start  # ✅ Servers starten: 3000, 3001, 5432

# In lean-ai-coach-a3-crud/
wasp start  # ❌ ERROR: Port 3000 already in use!
            # ❌ ERROR: Port 3001 already in use!
            # ❌ ERROR: Database already running!
```

### Kernvragen

1. **Kunnen meerdere worktrees dezelfde database delen?**
2. **Kunnen meerdere worktrees tegelijk servers draaien?**
3. **Hoe test je changes in verschillende feature branches?**
4. **Hoe voorkom je migration conflicts?**
5. **Hoe werk je parallel zonder elkaar te blokkeren?**

---

## 📐 Constraints & Randvoorwaarden

### Wasp Limitaties

1. **Geen native multi-instance support**

   - Wasp CLI verwacht standaard poorten (3000, 3001)
   - Custom poorten zijn NIET officieel gedocumenteerd
   - `wasp start` heeft geen `--port` flag

2. **Single database per project**

   - `wasp db migrate-dev` target 1 `DATABASE_URL`
   - Geen multi-database support out-of-the-box

3. **Type generation is directory-local**
   - `.wasp/` directory per worktree
   - Types regenereren bij `wasp start`
   - Geen shared type cache

### PostgreSQL Constraints

1. **Eén PostgreSQL instance per poort**

   - Default: `localhost:5432`
   - Kan meerdere databases hosten (`leanai_dev`, `leanai_test`, etc.)
   - Concurrent connections mogelijk

2. **Migration state tracking**
   - `_prisma_migrations` table in elke database
   - Migrations moeten sequentieel (timestamp-based)
   - Concurrent migrations op ZELFDE database = unsafe

### Development Workflow Constraints

1. **Hot reload vereist running server**

   - Code changes → Vite hot reload (frontend)
   - Operation changes → Node restart (backend)
   - Schema changes → Migration + restart (full)

2. **Database is shared state**
   - Test data is global (all worktrees see same data)
   - Seed scripts kunnen conflicteren
   - Rollback affects all worktrees

---

## 🎨 Strategie 1: Eén Actieve Worktree Per Keer

### Concept

**Slechts 1 worktree heeft `wasp start` draaien tegelijk.**

```
┌─────────────────────────────────────────────────────────┐
│  PostgreSQL Database (5432)                             │
│  ┌───────────────────────────────────────┐              │
│  │ leanai_dev (single shared database)   │              │
│  └───────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
                        ▲
                        │ DATABASE_URL
                        │
┌───────────────────────┴─────────────────────────────────┐
│  ACTIEVE WORKTREE: lean-ai-coach-tl/                    │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Backend (3001)  │  │ Frontend (3000) │              │
│  │ wasp start      │  │ Vite dev server │              │
│  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  INACTIEVE WORKTREES (geen servers)                     │
│  ├── lean-ai-coach-a3-crud/       (code editing)        │
│  ├── lean-ai-coach-a3-sections/   (git operations)      │
│  └── lean-ai-coach-a3-ai/         (reviewing)           │
└─────────────────────────────────────────────────────────┘
```

### Implementatie

#### Daily Workflow

```bash
# 🌅 MORNING: Choose worktree for today
cd /Users/toonvos/Projects/LEANAICOACH/lean-ai-coach-a3-crud

# Pull latest from develop (get foundation changes)
git pull origin develop

# Apply migrations (if any new ones)
wasp db migrate-dev

# Start servers (ONLY in this worktree)
wasp start
# ✅ Backend: http://localhost:3001
# ✅ Frontend: http://localhost:3000
# ✅ Database: localhost:5432/leanai_dev

# 💻 DURING DAY: Develop in this worktree
vim app/src/a3/A3OverviewPage.tsx
# Changes hot-reload in browser

# 🔄 SWITCH WORKTREE (if needed)
# Stop current servers
Ctrl+C

# Switch worktree
cd ../lean-ai-coach-a3-sections

# Start servers here
wasp start
```

#### Editing in Inactive Worktrees

```bash
# Servers running in lean-ai-coach-tl/

# Open ANOTHER terminal, different worktree
cd /Users/toonvos/Projects/LEANAICOACH/lean-ai-coach-a3-crud

# ✅ CAN DO: Edit code
vim app/src/a3/A3OverviewPage.tsx

# ✅ CAN DO: Git operations
git add .
git commit -m "feat: overview filters"
git push

# ✅ CAN DO: Run tests
wasp test client run

# ❌ CANNOT DO: See hot reload (servers not running here)
# ❌ CANNOT DO: Test in browser (frontend not running)
```

#### Testing Changes in Inactive Worktree

**Optie A: Switch servers**

```bash
# Stop servers in lean-ai-coach-tl/
cd /Users/toonvos/Projects/LEANAICOACH/lean-ai-coach-tl
Ctrl+C

# Start in lean-ai-coach-a3-crud/
cd ../lean-ai-coach-a3-crud
wasp start
# Now test at localhost:3000
```

**Optie B: Merge to develop first**

```bash
# In lean-ai-coach-a3-crud/
git push origin feature/a3-crud

# Create PR → Merge to develop

# In lean-ai-coach/ (develop worktree)
git pull
wasp start
# Test merged changes
```

### ✅ Voordelen

| Voordeel                   | Uitleg                                                |
| -------------------------- | ----------------------------------------------------- |
| **Geen poort conflicten**  | Slechts 1 server draait → geen port collisions        |
| **Eén database**           | No sync issues, all worktrees see same data           |
| **Simpel te begrijpen**    | Clear mental model: 1 active worktree = 1 running app |
| **Veilig voor migrations** | Migrations run on 1 database, no concurrency issues   |
| **Geen extra setup**       | Works out-of-the-box, no custom configuration         |
| **Predictable**            | Always know which worktree is "live"                  |

### ❌ Nadelen

| Nadeel                            | Uitleg                                                      |
| --------------------------------- | ----------------------------------------------------------- |
| **Slechts 1 feature testbaar**    | Cannot test multiple features simultaneously                |
| **Context switch kost tijd**      | Stop servers → switch → start servers = ~30-60 sec overhead |
| **Niet echt "parallel"**          | Development is parallel, testing is sequential              |
| **Hot reload only in 1 worktree** | Other worktrees need server switch to see changes           |
| **Wisselen is handmatig**         | No automatic switching, manual `wasp start`/stop            |

### 🎯 Best Voor

- ✅ **Solo developer** (1 persoon, meerdere features)
- ✅ **Klein team** (2-3 developers, coördinatie mogelijk)
- ✅ **Feature-based development** (work on 1 feature at a time)
- ✅ **Conservative approach** (safety over speed)

### 🚫 Niet Geschikt Voor

- ❌ **Large team** (5+ developers, too much coordination overhead)
- ❌ **Simultaneous testing** (need to test multiple features at once)
- ❌ **Rapid context switching** (switching every 10 minutes is painful)

---

## 🔀 Strategie 2: Meerdere Databases + Custom Poorten

### Concept

**Elke worktree krijgt eigen database + eigen poorten.**

```
┌─────────────────────────────────────────────────────────┐
│  PostgreSQL Instance (5432)                             │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ leanai_techlead │  │ leanai_a3crud   │              │
│  │ leanai_sections │  │ leanai_ai       │              │
│  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────┘
         ▲                      ▲
         │                      │
┌────────┴────────┐    ┌────────┴────────┐
│ Worktree 1      │    │ Worktree 2      │
│ Backend: 3001   │    │ Backend: 3011   │
│ Frontend: 3000  │    │ Frontend: 3010  │
│ DB: leanai_tl   │    │ DB: leanai_crud │
└─────────────────┘    └─────────────────┘
```

### Implementatie

#### Database Setup

```bash
# Eenmalig: Maak databases per worktree
createdb leanai_techlead
createdb leanai_a3crud
createdb leanai_sections
createdb leanai_ai
```

#### Per-Worktree Configuration

**Worktree 1: lean-ai-coach-tl/**

```bash
# app/.env.server
DATABASE_URL="postgresql://user:pass@localhost:5432/leanai_techlead"

# Note: Wasp DOESN'T support custom ports natively
# Would need custom Vite/Node config (advanced)
```

**Worktree 2: lean-ai-coach-a3-crud/**

```bash
# app/.env.server
DATABASE_URL="postgresql://user:pass@localhost:5432/leanai_a3crud"

# PROBLEM: How to run on port 3010/3011?
# Wasp doesn't have --port flag
# Would need to modify .wasp/out/server/server.js (breaks on every restart)
```

#### Custom Port Configuration (Hacky)

```bash
# ⚠️ WORKAROUND: Modify generated server
# After `wasp start`, edit .wasp/out/server/server.js

# Find:
const PORT = process.env.PORT || 3001

# Change to:
const PORT = process.env.PORT || 3011  // Custom port

# PROBLEM: This is OVERWRITTEN every time Wasp regenerates!
```

#### Migration Per Database

```bash
# Each worktree runs migrations on its own database

# In lean-ai-coach-tl/
wasp db migrate-dev "Add Organization"
# → Runs on leanai_techlead database

# In lean-ai-coach-a3-crud/
wasp db migrate-dev "Add Organization"
# → Runs on leanai_a3crud database

# PROBLEM: Migration files (.sql) are in git
# Both worktrees get SAME migration files
# But databases drift apart!
```

### ✅ Voordelen

| Voordeel                    | Uitleg                                                |
| --------------------------- | ----------------------------------------------------- |
| **Echt parallel testing**   | Kan meerdere features tegelijk testen                 |
| **Database isolatie**       | Changes in feature A don't affect feature B           |
| **No server conflicts**     | Each worktree has own ports (if configured correctly) |
| **Independent development** | Teams completely independent                          |

### ❌ Nadelen

| Nadeel                        | Uitleg                                          |
| ----------------------------- | ----------------------------------------------- |
| **Wasp ondersteunt dit NIET** | No official support for custom ports            |
| **Hacky workarounds**         | Modify generated code → breaks on regeneration  |
| **Database sync problemen**   | How to share foundation data across databases?  |
| **Migration nightmares**      | Merge conflicts in migration files are hell     |
| **Resource intensief**        | 3-4x servers + databases = heavy CPU/memory     |
| **Seed data duplication**     | Must seed EACH database separately              |
| **Complex troubleshooting**   | Which database has which data? Hard to debug    |
| **Schema drift**              | Databases evolve differently → integration hell |

### ⚠️ Practical Problems

#### Problem 1: Port Configuration

```bash
# Wasp's wasp start command does NOT accept --port
wasp start --port 3010  # ❌ Unknown flag: --port

# Workaround: Environment variable
PORT=3011 wasp start  # ⚠️ May work for backend, but frontend?

# Vite config is ALSO generated by Wasp
# Changing it = breaks on regeneration
```

#### Problem 2: Migration Conflicts

```bash
# Timeline:
# Day 1: TechLead creates migration 20251018120000_add_org.sql
# Day 2: A3-CRUD creates migration 20251018130000_add_a3.sql
# Day 3: Merge both branches to develop

# Result:
app/migrations/
├── 20251018120000_add_org.sql    # From TechLead
├── 20251018130000_add_a3.sql     # From A3-CRUD
└── migration_lock.toml

# Now in develop worktree:
wasp db migrate-dev
# ✅ Runs both migrations sequentially (OK)

# But in TechLead worktree (leanai_techlead database):
wasp db migrate-dev
# ❌ Only has 20251018120000_add_org.sql applied
# Missing 20251018130000_add_a3.sql!
# Database is OUT OF SYNC!

# Solution: Every worktree must pull + re-migrate after merges
# But then: Why have separate databases?
```

#### Problem 3: Shared Foundation Data

```bash
# Foundation data (Slice 1-2):
# - Organizations
# - Departments
# - Users
# - Permissions

# If leanai_techlead has Org "Acme Corp"
# But leanai_a3crud has Org "Test Inc"
# → Cannot test realistic workflows (different data!)

# Solution: Sync foundation data between databases
# But HOW? Manual SQL dumps? Defeats isolation purpose.
```

### 🎯 Best Voor

- ⚠️ **NIET AANBEVOLEN voor Wasp projects**
- Mogelijk voor: Grote teams met microservices (but then, why Wasp?)

### 🚫 Niet Geschikt Voor

- ❌ **Wasp-based projects** (framework doesn't support it)
- ❌ **Small/medium teams** (overhead > benefits)
- ❌ **Rapid iteration** (too much complexity slows down)

### Verdict

❌ **TE COMPLEX voor dit project** - Wasp's architecture actively fights against this approach.

---

## 🌟 Strategie 3: Shared Database + Feature Flags (HYBRID)

### Concept

**1 gedeelde database, 1 actieve server, feature flags om incomplete work te mergen.**

```
┌─────────────────────────────────────────────────────────┐
│  PostgreSQL Database (5432)                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │ leanai_dev (SINGLE SHARED DATABASE)               │  │
│  │ - All foundation data                             │  │
│  │ - All feature data (A3, Sections, Chat, etc.)    │  │
│  │ - Migration state (_prisma_migrations)           │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        ▲
                        │ All worktrees connect here
          ┌─────────────┼─────────────┐
          │             │             │
┌─────────┴───┐  ┌──────┴─────┐  ┌───┴─────────┐
│ Worktree 1  │  │ Worktree 2 │  │ Worktree 3  │
│ (PRIMARY)   │  │ (INACTIVE) │  │ (INACTIVE)  │
│             │  │            │  │             │
│ wasp start  │  │ Code only  │  │ Code only   │
│ ↓           │  │ No servers │  │ No servers  │
│ Backend:    │  │            │  │             │
│ 3001        │  │ git commit │  │ git commit  │
│ Frontend:   │  │ git push   │  │ git push    │
│ 3000        │  │            │  │             │
└─────────────┘  └────────────┘  └─────────────┘
```

**Feature Flags Control What's Visible:**

```typescript
// .env.client (SHARED via git)
REACT_APP_FEATURE_A3_CRUD=true       // ✅ Ready, merged to develop
REACT_APP_FEATURE_A3_SECTIONS=false  // 🚧 In progress, hidden
REACT_APP_FEATURE_A3_AI=false        // 🔜 Not started

// Code in ALL worktrees
import { isFeatureEnabled } from '@/lib/featureFlags'

export function A3OverviewPage() {
  if (!isFeatureEnabled('A3_CRUD')) {
    return <ComingSoonPage feature="A3 CRUD" />
  }

  return <A3OverviewContent />
}
```

### Implementatie

#### Setup: Feature Flag System

**Create: `app/src/shared/featureFlags.ts`**

```typescript
type FeatureFlag =
  | "A3_CRUD"
  | "A3_SECTIONS"
  | "A3_AI"
  | "DASHBOARD"
  | "ORGANIZATION_MANAGEMENT";

const FEATURE_FLAGS: Record<FeatureFlag, boolean> = {
  A3_CRUD: import.meta.env.REACT_APP_FEATURE_A3_CRUD === "true",
  A3_SECTIONS: import.meta.env.REACT_APP_FEATURE_A3_SECTIONS === "true",
  A3_AI: import.meta.env.REACT_APP_FEATURE_A3_AI === "true",
  DASHBOARD: import.meta.env.REACT_APP_FEATURE_DASHBOARD === "true",
  ORGANIZATION_MANAGEMENT:
    import.meta.env.REACT_APP_FEATURE_ORG_MGMT === "true",
};

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag] ?? false;
}

export function requireFeature(flag: FeatureFlag): void {
  if (!isFeatureEnabled(flag)) {
    throw new Error(`Feature ${flag} is not enabled`);
  }
}
```

**`.env.client` (committed to git, shared by all worktrees)**

```bash
# Feature Flags
REACT_APP_FEATURE_A3_CRUD=true
REACT_APP_FEATURE_A3_SECTIONS=false
REACT_APP_FEATURE_A3_AI=false
REACT_APP_FEATURE_DASHBOARD=true
REACT_APP_FEATURE_ORG_MGMT=true
```

#### Workflow: Phase 1 (Foundation)

```bash
# Week 1-3: TechLead worktree is PRIMARY
cd /Users/toonvos/Projects/LEANAICOACH/lean-ai-coach-tl

# Build foundation
vim app/schema.prisma  # Add Organization, Department, User
wasp db migrate-dev "Add foundation schema"

# Develop dashboard
vim app/src/dashboard/DashboardPage.tsx

# Commit to develop frequently
git add .
git commit -m "feat(foundation): dashboard with org stats"
git push origin feature/TL-techlead

# Merge PR to develop
# → All feature worktrees can now pull foundation
```

#### Workflow: Phase 2 (Parallel Development)

**Worktree A: A3-CRUD (Developer 1)**

```bash
cd /Users/toonvos/Projects/LEANAICOACH/lean-ai-coach-a3-crud

# Pull foundation
git pull origin develop
wasp db migrate-dev  # Apply foundation migrations

# Start servers (THIS IS PRIMARY TODAY)
wasp start

# Develop CRUD
vim app/src/a3/A3OverviewPage.tsx

# Feature flag guards incomplete work
export function A3OverviewPage() {
  if (!isFeatureEnabled('A3_CRUD')) {
    return <ComingSoonPage />
  }
  // Rest of code (work in progress)
}

# Commit frequently to feature branch
git add .
git commit -m "feat(a3-crud): overview page WIP"
git push origin feature/a3-crud

# Merge PR to develop (EVEN IF INCOMPLETE!)
# → Flag is false, so feature hidden from users
```

**Worktree B: A3-Sections (Developer 2, SAME TIME)**

```bash
cd /Users/toonvos/Projects/LEANAICOACH/lean-ai-coach-a3-sections

# Pull latest develop (has A3-CRUD's code, but hidden by flag)
git pull origin develop
wasp db migrate-dev

# Develop sections (servers NOT running here)
vim app/src/a3/sections/Section2Form.tsx

# Test: Switch servers
cd ../lean-ai-coach-a3-sections
wasp start  # Now test Section2Form at localhost:3000

# Commit to feature branch
git add .
git commit -m "feat(a3-sections): section 2 form WIP"
git push origin feature/a3-sections

# Merge to develop (flag still false)
```

**Worktree C: Develop (Integration Testing)**

```bash
cd /Users/toonvos/Projects/LEANAICOACH/lean-ai-coach

# This is develop branch (all merged code)
git pull  # Get A3-CRUD + A3-Sections code

# Enable features for testing
vim app/.env.client
REACT_APP_FEATURE_A3_CRUD=true
REACT_APP_FEATURE_A3_SECTIONS=true

# Start servers (integration test)
wasp start

# Test both features together
# If bugs → create issue, assign to team
```

#### Migration Strategy

**CRITICAL RULE: Schema changes ONLY in develop branch (or coordinated)**

```bash
# WRONG: Feature branch makes schema change
cd lean-ai-coach-a3-crud
vim app/schema.prisma  # Add A3Document model
wasp db migrate-dev "Add A3Document"
# ❌ PROBLEM: Other feature branches don't have this yet!

# RIGHT: Coordinate schema changes
# 1. Create schema proposal in feature branch
# 2. Review with team
# 3. Merge to develop FIRST
# 4. All feature branches pull + migrate
```

**Workflow:**

```bash
# Step 1: A3-CRUD needs A3Document model
cd lean-ai-coach-a3-crud
vim app/schema.prisma  # Add model
git add app/schema.prisma
git commit -m "schema: add A3Document model (proposal)"
git push origin feature/a3-crud

# Step 2: Create PR with SCHEMA label
gh pr create --title "SCHEMA: Add A3Document model" --label schema

# Step 3: Team reviews, approves, merges to develop

# Step 4: ALL worktrees pull + migrate
cd /Users/toonvos/Projects/LEANAICOACH/lean-ai-coach-tl
git pull origin develop
wasp db migrate-dev
wasp start  # RESTART

cd ../lean-ai-coach-a3-sections
git pull origin develop
wasp db migrate-dev
# (no restart needed if servers not running)

# Step 5: A3-CRUD continues development
cd ../lean-ai-coach-a3-crud
git pull origin develop  # Get merged schema
# Now A3Document is available everywhere
```

#### Graceful Feature Rollout

```bash
# Week 9: A3-CRUD ready, A3-Sections not yet

# .env.client (in develop branch)
REACT_APP_FEATURE_A3_CRUD=true       # ✅ Enable
REACT_APP_FEATURE_A3_SECTIONS=false  # 🚧 Keep hidden

# Deploy to staging
# Users see:
# - Dashboard ✅
# - A3 Overview ✅
# - A3 Detail ✅
# - A3 Editor with Section 1 only ✅
# - Sections 2-8: "Coming Soon" placeholders

# Week 11: A3-Sections ready
REACT_APP_FEATURE_A3_SECTIONS=true

# Redeploy → All sections now visible
```

### ✅ Voordelen

| Voordeel                      | Uitleg                                             |
| ----------------------------- | -------------------------------------------------- |
| **Best of both worlds**       | Parallel dev (code) + sequential testing (servers) |
| **No port conflicts**         | Only 1 server running at a time                    |
| **Shared database = no sync** | All worktrees see same data, no drift              |
| **Trunk-based development**   | Merge incomplete work safely (hidden by flags)     |
| **Graceful rollout**          | Enable features one-by-one in production           |
| **Early integration**         | Merge daily → find conflicts early                 |
| **Realistic testing**         | Shared data = test with real scenarios             |
| **Migration coordination**    | 1 database = clear migration state                 |

### ❌ Nadelen

| Nadeel                       | Uitleg                                           |
| ---------------------------- | ------------------------------------------------ |
| **Still sequential testing** | Must switch servers to test different features   |
| **Feature flag overhead**    | Wrap incomplete features in `isFeatureEnabled()` |
| **Migration coordination**   | Schema changes need team sync                    |
| **Flag cleanup debt**        | Must remove flags after feature complete         |

### 🎯 Best Voor

- ✅ **Small to medium teams** (1-4 developers)
- ✅ **Wasp-based projects** (works with framework constraints)
- ✅ **Continuous integration** (merge daily)
- ✅ **Iterative delivery** (deploy incomplete features)
- ✅ **Risk mitigation** (early integration = early bug detection)

### Practical Example: Typical Day

```bash
# 09:00 - Developer A (A3-CRUD)
cd lean-ai-coach-a3-crud
wasp start  # Servers running here
# Develop overview filters

# 09:00 - Developer B (A3-Sections) - SAME TIME
cd lean-ai-coach-a3-sections
vim app/src/a3/sections/Section3Form.tsx
# No servers, just code editing
git commit -m "feat: section 3 form"
git push

# 11:00 - Developer B wants to test Section 3
cd lean-ai-coach-a3-crud
Ctrl+C  # Stop servers

cd ../lean-ai-coach-a3-sections
git pull origin develop  # Get latest
wasp start  # Servers now here
# Test Section 3 form

# 13:00 - Integration test
cd /Users/toonvos/Projects/LEANAICOACH/lean-ai-coach  # Develop
git pull  # Get both A3-CRUD and A3-Sections code

# Enable both features
vim app/.env.client
REACT_APP_FEATURE_A3_CRUD=true
REACT_APP_FEATURE_A3_SECTIONS=true

wasp start
# Test both features together
# Find bug: Section 3 doesn't show in CRUD overview
# → Create issue, assign to Developer B
```

### Feature Flag Cleanup

```bash
# After feature complete and stable:

# 1. Remove flag check from code
// Before:
export function A3OverviewPage() {
  if (!isFeatureEnabled('A3_CRUD')) {
    return <ComingSoonPage />
  }
  return <A3OverviewContent />
}

// After:
export function A3OverviewPage() {
  return <A3OverviewContent />
}

# 2. Remove from .env.client
-REACT_APP_FEATURE_A3_CRUD=true

# 3. Remove from featureFlags.ts type
-  | 'A3_CRUD'

# 4. Commit cleanup
git commit -m "refactor: remove A3_CRUD feature flag (stable)"
```

---

## 🤖 Multi-Agent Development on Single Machine

### The Challenge

**NEW SCENARIO:** Multiple AI agents working in parallel worktrees on **THE SAME Mac**.

```
┌────────────────────────────────────────────────┐
│         Mac Machine (1 physical computer)       │
│                                                 │
│  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │ Agent A    │  │ Agent B    │  │ Agent C  │ │
│  │ (Claude)   │  │ (Claude)   │  │ (Claude) │ │
│  │            │  │            │  │          │ │
│  │ Worktree:  │  │ Worktree:  │  │ Worktree:│ │
│  │ tl/        │  │ a3-crud/   │  │ sections/│ │
│  └──────┬─────┘  └──────┬─────┘  └────┬─────┘ │
│         │                │             │       │
│         └────────────────┴─────────────┘       │
│                      │                         │
│              ALL want to start                 │
│              servers SIMULTANEOUSLY!           │
│                      ▼                         │
│         ┌────────────────────────┐             │
│         │ Port 3000/3001/5432    │             │
│         │ (only 1 can claim)     │             │
│         └────────────────────────┘             │
└────────────────────────────────────────────────┘
```

**Timeline Example:**

```
09:00 - Agent A (worktree tl/):
  wasp start
  → ✅ Servers running in tl/

10:00 - Agent B (worktree a3-crud/):
  wasp start
  → ❌ ERROR: Port 3000 already in use!
  → Agent B DOESN'T KNOW Agent A has servers running

Problem: NO COORDINATION between agents!
```

### The Problem

1. **Agents don't communicate**

   - Each agent works independently
   - No shared knowledge of system state
   - Can't ask "who has servers running?"

2. **Port conflicts are inevitable**

   - Agent A starts servers → claims ports
   - Agent B tries to start → gets error
   - Agent B doesn't know how to resolve

3. **Manual coordination impossible**
   - No human to coordinate
   - Agents work in parallel
   - Need automated solution

### The Solution: Safe-Start Script

**Concept:** Script that ALWAYS succeeds (idempotent) by cleaning up FIRST.

```bash
#!/bin/bash
# scripts/safe-start.sh

1. Kill ALL processes on port 3000 (frontend)
2. Kill ALL processes on port 3001 (backend)
3. Wait 2 seconds (cleanup)
4. Run `wasp start` (fresh servers)
```

**Result:** Any agent can "claim" servers at any time, safely.

### Script Specification

```bash
#!/bin/bash
# scripts/safe-start.sh
# Safe start for multi-agent/multi-worktree development on single machine

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🧹 Cleaning up existing servers...${NC}"

# Kill Vite frontend (port 3000)
if lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${RED}💀 Killing process on port 3000${NC}"
    kill -9 $(lsof -ti:3000) || true
fi

# Kill Node backend (port 3001)
if lsof -ti:3001 > /dev/null 2>&1; then
    echo -e "${RED}💀 Killing process on port 3001${NC}"
    kill -9 $(lsof -ti:3001) || true
fi

# Optional: wasp clean (if --clean flag)
if [[ "$1" == "--clean" ]]; then
    echo -e "${YELLOW}🧼 Running wasp clean...${NC}"
    wasp clean
fi

# Small delay for cleanup
sleep 2

# Start fresh servers
echo -e "${GREEN}🚀 Starting servers in $(pwd)${NC}"
echo -e "${GREEN}📍 Worktree: $(basename $(pwd))${NC}"
wasp start
```

### Agent Workflow

**CRITICAL RULE:** Agents NEVER use direct `wasp start`.

```bash
# ❌ NEVER (direct command):
wasp start

# ✅ ALWAYS (safe command):
./scripts/safe-start.sh
```

**Why this works:**

1. **Agent A wants to test** (10:00 AM)

   ```bash
   cd lean-ai-coach-tl
   ./scripts/safe-start.sh
   # → No existing servers → just starts
   # → Servers running in tl/
   ```

2. **Agent B wants to test** (10:30 AM, Agent A still running)

   ```bash
   cd lean-ai-coach-a3-crud
   ./scripts/safe-start.sh
   # → Detects Agent A's servers on ports
   # → Kills them
   # → Starts NEW servers in a3-crud/
   # → Agent B now "owns" servers
   ```

3. **Agent C wants to test** (11:00 AM)
   ```bash
   cd lean-ai-coach-a3-sections
   ./scripts/safe-start.sh
   # → Detects Agent B's servers
   # → Kills them
   # → Starts NEW servers in sections/
   # → Agent C now "owns" servers
   ```

**Result:** First-come-first-served, fully automated, no coordination needed! ✅

### Features

| Feature              | Behavior                               |
| -------------------- | -------------------------------------- |
| **Idempotent**       | Can run multiple times safely          |
| **Aggressive**       | Kills ALL dev servers (no questions)   |
| **Verbose**          | Shows what it's doing (for agent logs) |
| **Fast**             | 2-second delay, minimal overhead       |
| **Works anywhere**   | Can be run from any worktree           |
| **Optional cleanup** | `--clean` flag for `wasp clean` first  |

### Comparison: Without vs With Script

**WITHOUT Script (manual):**

```bash
# Agent B tries to start:
cd lean-ai-coach-a3-crud
wasp start
# ERROR: Port 3000 in use

# Agent needs to:
# 1. Diagnose (lsof -i :3000)
# 2. Find PID
# 3. Kill process
# 4. Retry
# → Complex, error-prone, agents can't handle this
```

**WITH Script (automated):**

```bash
# Agent B runs:
cd lean-ai-coach-a3-crud
./scripts/safe-start.sh
# ✅ Automatic cleanup + start
# → Simple, always works
```

### Integration with Strategieën

**This enhances ALL 3 strategies:**

| Strategie | Without Script                      | With Script               |
| --------- | ----------------------------------- | ------------------------- |
| **1**     | Manual stop/start between worktrees | Automatic cleanup + start |
| **2**     | N/A (separate ports)                | N/A                       |
| **3**     | Manual coordination needed          | Zero coordination needed  |

**Especially powerful for:**

- ✅ Multi-agent development (this scenario!)
- ✅ Solo dev with frequent context switching
- ✅ Small teams (reduces coordination overhead)

### Real-World Timeline

**Day in the life of 3 AI agents:**

```
09:00 - Agent A (Foundation)
  cd lean-ai-coach-tl
  ./scripts/safe-start.sh
  → Servers running, building dashboard
  → Git commits every 30 min

10:30 - Agent B (A3-CRUD)
  cd lean-ai-coach-a3-crud
  ./scripts/safe-start.sh
  → Killed Agent A's servers (Agent A doesn't care, was just committing code)
  → Testing CRUD feature
  → Git commit

11:15 - Agent C (Sections)
  cd lean-ai-coach-a3-sections
  ./scripts/safe-start.sh
  → Killed Agent B's servers
  → Testing Section 3 form

11:45 - Agent B (needs to retest)
  ./scripts/safe-start.sh  # (still in a3-crud/)
  → Killed Agent C's servers
  → Retesting CRUD after merge

12:00 - Integration Test (all agents)
  cd lean-ai-coach  # Develop worktree
  ./scripts/safe-start.sh
  → Test all merged features together
```

**Zero conflicts, zero coordination overhead!** 🎉

### PostgreSQL Handling

**CRITICAL:** Script does NOT kill PostgreSQL (port 5432) by default.

**Why:**

- PostgreSQL may host multiple databases
- May be shared by other apps on Mac
- Killing can cause data corruption

**If database restart needed:**

```bash
# Stop Postgres manually:
brew services stop postgresql@14

# Or kill specific Wasp-managed Postgres:
wasp start db  # In separate terminal
# Then use safe-start.sh in feature worktree
```

### Agent Instructions Summary

**For AI agents working in this codebase:**

1. ✅ **ALWAYS** use `./scripts/safe-start.sh` to start servers
2. ❌ **NEVER** use direct `wasp start`
3. ✅ Safe-start can be run from ANY worktree
4. ✅ Safe-start is SAFE to run anytime (idempotent)
5. ✅ No need to check if servers are running first

**Benefits for agents:**

- Simple: one command always works
- Predictable: no error handling needed
- Autonomous: no human coordination required
- Fast: 2-second overhead only

---

## 📊 Vergelijkingsmatrix

| Criteria                       | Strategie 1: Eén Actieve | Strategie 2: Meerdere DB | Strategie 3: Shared DB + Flags |
| ------------------------------ | ------------------------ | ------------------------ | ------------------------------ |
| **Port Conflicts**             | ✅ Geen                  | ⚠️ Vereist custom config | ✅ Geen                        |
| **Database Sync**              | ✅ N/A (1 database)      | ❌ Handmatig sync        | ✅ N/A (1 database)            |
| **Parallel Testing**           | ❌ Nee                   | ✅ Ja                    | ⚠️ Via flag toggles            |
| **Migration Complexity**       | ✅ Simpel                | ❌ Complex               | ✅ Simpel                      |
| **Wasp Compatibility**         | ✅ Volledig              | ❌ Hacky workarounds     | ✅ Volledig                    |
| **Setup Complexity**           | ✅ Geen (out-of-the-box) | ❌ Hoog                  | ⚠️ Medium (flag system)        |
| **Resource Usage**             | ✅ Laag (1x servers)     | ❌ Hoog (3-4x servers)   | ✅ Laag (1x servers)           |
| **Context Switch Tijd**        | ⚠️ 30-60 sec             | ✅ 0 sec (parallel)      | ⚠️ 30-60 sec                   |
| **Team Coordination**          | ⚠️ Medium                | ✅ Minimal               | ⚠️ Medium (schema changes)     |
| **Continuous Integration**     | ⚠️ Mogelijk              | ❌ Moeilijk              | ✅ Excellent                   |
| **Production Rollout Control** | ❌ All-or-nothing        | ❌ All-or-nothing        | ✅ Gradual (flags)             |
| **Code Overhead**              | ✅ Geen                  | ✅ Geen                  | ⚠️ Flag wrappers               |

**Legend:**

- ✅ Excellent
- ⚠️ Acceptable with trade-offs
- ❌ Problematic

---

## 🚨 Veelvoorkomende Problemen & Oplossingen

### Probleem 1: "Port 3000 already in use"

**Symptoom:**

```bash
wasp start
# Error: Port 3000 is already in use
```

**Diagnose:**

```bash
lsof -i :3000
# COMMAND   PID    USER
# node      12345  toon  lean-ai-coach-tl/.wasp/out/server
```

**Oplossing:**

```bash
# Optie A: Navigate to worktree and stop gracefully
cd /Users/toonvos/Projects/LEANAICOACH/lean-ai-coach-tl
Ctrl+C  # In terminal waar wasp start draait

# Optie B: Kill process
kill -9 $(lsof -t -i:3000)
kill -9 $(lsof -t -i:3001)

# Then start in desired worktree
cd /Users/toonvos/Projects/LEANAICOACH/lean-ai-coach-a3-crud
wasp start
```

---

### Probleem 2: "Migration not applied in new worktree"

**Symptoom:**

```bash
cd lean-ai-coach-a3-sections
wasp start
# Error: Property 'a3Documents' does not exist on type 'Department'
```

**Diagnose:**

```bash
# Check migration status
wasp db studio
# → Open Prisma Studio
# → Check _prisma_migrations table
# → See which migrations are applied

# Or check migration files
ls app/migrations/
# 20251018120000_foundation.sql  (missing in this worktree?)
```

**Oplossing:**

```bash
# Always pull + migrate after switching worktrees
cd lean-ai-coach-a3-sections
git pull origin develop  # Get latest migration files
wasp db migrate-dev      # Apply missing migrations
wasp start               # Restart (regenerate types)
```

**Preventie:**

```bash
# Create alias voor safe worktree switch
# In ~/.zshrc or ~/.bashrc:
alias wt-switch='git pull origin develop && wasp db migrate-dev && wasp clean'

# Usage:
cd lean-ai-coach-a3-sections
wt-switch
wasp start
```

---

### Probleem 3: "Types don't match after merge"

**Symptoom:**

```bash
# After merging schema change from another branch
npm run build
# Error: Type 'A3Document' is missing property 'sections'
```

**Diagnose:**

```bash
# .wasp/ directory has old generated types
ls .wasp/out/sdk/wasp/entities/
# A3Document.ts (outdated)
```

**Oplossing:**

```bash
# Nuclear option: Clean + restart
wasp clean  # Delete .wasp/
wasp start  # Regenerate everything

# Or faster:
Ctrl+C      # Stop wasp
wasp start  # Restart (regenerates types)
```

**Preventie:**

```bash
# Always restart after schema changes
vim app/schema.prisma
wasp db migrate-dev "..."
# DON'T FORGET:
Ctrl+C
wasp start  # ← CRITICAL!
```

---

### Probleem 4: "Concurrent migration creation"

**Symptoom:**

```bash
# Day 1: Developer A creates migration in feature-a
20251018120000_add_feature_a.sql

# Day 2: Developer B creates migration in feature-b (different worktree)
20251018130000_add_feature_b.sql

# Day 3: Merge both to develop
# Result: Conflict in migration order?
```

**Diagnose:**

```bash
# Migrations are timestamp-based (sequential)
# Prisma will run them in chronological order
# Usually OK, but can break if:
# - feature-a adds column X
# - feature-b expects column X doesn't exist
```

**Oplossing:**

**Prevention Strategy (Schema Changes Only in Develop):**

```bash
# ✅ RIGHT: Coordinate schema changes

# Step 1: Feature branch proposes schema (no migration yet)
cd lean-ai-coach-feature-a
vim app/schema.prisma  # Add model
git commit -m "schema: propose FeatureA model"
git push

# Step 2: Create PR, label as "schema"
gh pr create --label schema

# Step 3: After approval, merge to develop

# Step 4: TechLead creates migration in develop
cd lean-ai-coach  # Develop worktree
git pull
wasp db migrate-dev "Add FeatureA model"
git push origin develop

# Step 5: Feature branch pulls migration
cd lean-ai-coach-feature-a
git pull origin develop
wasp db migrate-dev  # Apply
wasp start
```

**Recovery (If conflict already happened):**

```bash
# Both migrations exist in develop
# They conflict (e.g., both add same table)

# Optie A: Squash migrations
wasp db migrate-dev "Squash conflicting migrations"
# Manually edit migration SQL to combine

# Optie B: Reset database (DEV ONLY!)
wasp db reset
wasp db migrate-dev
# All migrations rerun from scratch
```

---

### Probleem 5: "Test data differs between worktrees"

**Symptoom:**

```bash
# In lean-ai-coach-tl: Created org "Acme Corp"
# Switch to lean-ai-coach-a3-crud: Where is "Acme Corp"?
```

**Diagnose:**

```bash
# Check DATABASE_URL in both worktrees
cd lean-ai-coach-tl
cat app/.env.server | grep DATABASE_URL
# DATABASE_URL=postgresql://localhost:5432/leanai_dev

cd ../lean-ai-coach-a3-crud
cat app/.env.server | grep DATABASE_URL
# DATABASE_URL=postgresql://localhost:5432/leanai_dev

# Same database? Yes.
# Then data SHOULD be there.
# Unless: .env.server is in .gitignore (not shared)
```

**Oplossing:**

**Strategie 3 (Shared DB): Database IS shared**

- All worktrees see same data ✅
- If data missing: Check if seeded correctly

```bash
# Seed database (only needed once)
cd lean-ai-coach  # Any worktree
wasp db seed

# All worktrees now see seed data
```

**Strategie 2 (Separate DBs): Data NOT shared**

- Each database needs own seed ❌
- This is WHY Strategy 2 is problematic

---

## 🧭 Decision Framework

### Vragen om jezelf te stellen:

#### 1. Team Size

| Team Size  | Recommended Strategy                             |
| ---------- | ------------------------------------------------ |
| 1 person   | **Strategie 1** (simplicity wins)                |
| 2-3 people | **Strategie 3** (parallel code, sequential test) |
| 4-6 people | **Strategie 3** (with strict coordination)       |
| 7+ people  | **Reconsider Wasp** (framework may not scale)    |

#### 2. Testing Frequency

**Question:** Hoe vaak moet je features testen?

- **Eén keer per dag**: Strategie 1 ✅ (switch worktree 1x/day = OK)
- **Meerdere keren per dag**: Strategie 3 ⚠️ (feature flags helpen)
- **Continuous (elke 10 min)**: Strategie 2 ❌ (maar Wasp ondersteunt niet)

#### 3. Migration Frequency

**Question:** Hoe vaak wijzigt de database schema?

- **Weinig** (1x per week): Strategie 1 of 3 ✅
- **Regelmatig** (daily): Strategie 3 ⚠️ (coördinatie vereist)
- **Constant** (meerdere teams): Strategie 2 ❌ (nightmare)

#### 4. Coordination Willingness

**Question:** Hoeveel coördinatie accepteer je?

- **Minimal**: Strategie 1 ✅ (solo dev, minimal coord)
- **Daily standups**: Strategie 3 ✅ (sync schema changes)
- **Constant communication**: Strategie 2 ❌ (still too complex)

#### 5. Risk Tolerance

**Question:** Hoeveel risk accepteer je?

- **Low** (conservatief): Strategie 1 ✅ (safe, predictable)
- **Medium** (agile): Strategie 3 ✅ (early integration)
- **High** (experimental): Strategie 2 ❌ (too risky even then)

---

## 🎯 Aanbeveling per Scenario

### Scenario A: Solo Developer (1 persoon)

**Situation:**

- Je werkt alleen aan LEAN AI COACH
- Gebruikt worktrees voor feature isolation
- Context switching is makkelijk (1 persoon)

**Aanbeveling:** **Strategie 1** (Eén Actieve Worktree)

**Rationale:**

- Simplicity > flexibility (geen team overhead)
- Context switch is mentaal (toch al bezig met 1 feature)
- No coordination needed
- Lowest complexity

**Workflow:**

```bash
# Morning: Pick feature for today
cd lean-ai-coach-a3-crud
wasp start

# Work on CRUD all day
# Switch if needed:
Ctrl+C
cd ../lean-ai-coach-a3-sections
wasp start
```

---

### Scenario B: Small Team (2-3 developers)

**Situation:**

- 2-3 developers working parallel
- Different features simultaneously
- Daily standup voor coördinatie

**Aanbeveling:** **Strategie 3** (Shared DB + Feature Flags)

**Rationale:**

- Parallel code development ✅
- Shared database = no sync issues ✅
- Feature flags = merge incomplete work ✅
- Daily standup = coordinate schema changes ✅

**Workflow:**

```bash
# Developer A (PRIMARY server)
cd lean-ai-coach-a3-crud
wasp start  # Runs all day

# Developer B (code only)
cd lean-ai-coach-a3-sections
vim app/src/...
git commit && git push
# Test: Slackt Developer A "Can I have servers for 30 min?"

# Integration (daily)
cd lean-ai-coach  # Develop
git pull  # All merged work
wasp start
# Team tests together
```

---

### Scenario C: Medium Team (4-6 developers)

**Situation:**

- 4-6 developers
- Multiple feature teams
- Need parallel testing

**Aanbeveling:** **Strategie 3** (with stricter coordination)

**Rationale:**

- Strategie 2 still niet supported by Wasp
- Strategie 3 can work maar:
  - Need **server scheduling** (calendar: who gets servers when)
  - **Schema change freeze days** (e.g., only Mon/Wed)
  - **Integration environments** (staging always runs develop)

**Workflow:**

```bash
# Server Schedule (Google Calendar)
# Mon 09-12: Developer A (A3-CRUD)
# Mon 13-16: Developer B (A3-Sections)
# Tue 09-12: Developer C (A3-AI)
# ...

# Developer checks calendar, knows when they get servers

# Schema changes: Only on Monday mornings (standup)
# Rest of week: No schema changes (stability)
```

---

### Scenario D: Large Team (7+ developers)

**Situation:**

- 7+ developers
- Multiple products/services
- Enterprise scale

**Aanbeveling:** **Reconsider Wasp** 🚨

**Rationale:**

- Wasp is designed for **small-medium full-stack teams**
- At 7+ developers, need:
  - Microservices architecture (Wasp is monolithic)
  - Independent deployments (Wasp deploys as unit)
  - Separate databases per service (Wasp = 1 DB)

**Alternative:**

- Split into **separate Wasp apps** per product
  - App 1: A3 Tool (Wasp)
  - App 2: 5S Tool (Wasp)
  - App 3: Gemba Tool (Wasp)
- Each app: Own database, own deployment
- Shared: Auth service (SSO), design system

---

## 📌 Final Recommendation: LEAN AI COACH Project

### Voor jouw specifieke situatie:

**Team:** Solo developer (jij) + mogelijk toekomstig team (2-3)

**Project:** LEAN AI COACH MVP (A3 tool)

**Development strategy:** Hybrid Vertical Slices (PARALLEL-DEVELOPMENT-STRATEGY.md)

### ⭐ **AANBEVOLEN: Strategie 3** (Shared DB + Feature Flags)

**Waarom:**

1. **Nu:** Werkt perfect voor solo dev

   - Edit code in alle worktrees
   - Run servers in 1 worktree per keer
   - Shared database = simpel

2. **Later:** Schaalt naar klein team (2-3 people)

   - Feature flags = merge incomplete work
   - Shared DB = no sync issues
   - Trunk-based dev = continuous integration

3. **Toekomst:** Production rollout flexibility
   - Enable features one-by-one
   - A/B testing mogelijk
   - Gradual rollout (pilot users first)

### Implementation Plan

**Week 1-3 (Foundation):**

```bash
# Strategie 1 workflow (jij alleen)
cd lean-ai-coach-tl
wasp start  # Primary worktree
# Build foundation
```

**Week 4+ (Als team groeit):**

```bash
# Setup feature flags
# Create app/src/shared/featureFlags.ts
# Add .env.client flags
# Wrap incomplete features

# Then: Strategie 3 workflow
# - 1 developer has servers
# - Others code + commit
# - Merge to develop with flags
# - Test together in develop worktree
```

**Fallback:**

- If team doesn't grow: Strategie 1 blijft werken
- If team grows >4: Reconsider architecture (microservices?)

---

## 🔄 Migration Path: Van Strategie 1 → Strategie 3

**If you start with Strategy 1, here's how to migrate:**

### Phase 1: Add Feature Flag System (1 hour)

```bash
# Create feature flag module
cat > app/src/shared/featureFlags.ts << 'EOF'
type FeatureFlag = 'A3_CRUD' | 'A3_SECTIONS' | 'A3_AI'

const FLAGS: Record<FeatureFlag, boolean> = {
  A3_CRUD: import.meta.env.REACT_APP_FEATURE_A3_CRUD === 'true',
  A3_SECTIONS: import.meta.env.REACT_APP_FEATURE_A3_SECTIONS === 'true',
  A3_AI: import.meta.env.REACT_APP_FEATURE_A3_AI === 'true',
}

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FLAGS[flag] ?? false
}
EOF

# Add to .env.client
cat >> app/.env.client << 'EOF'
# Feature Flags
REACT_APP_FEATURE_A3_CRUD=false
REACT_APP_FEATURE_A3_SECTIONS=false
REACT_APP_FEATURE_A3_AI=false
EOF

# Commit
git add .
git commit -m "feat: add feature flag system"
```

### Phase 2: Wrap Features (ongoing)

```typescript
// When creating new feature
export function NewFeaturePage() {
  if (!isFeatureEnabled('NEW_FEATURE')) {
    return <ComingSoonPage />
  }

  return <NewFeatureContent />
}
```

### Phase 3: Enable Flags When Ready

```bash
# Feature complete? Enable flag
vim app/.env.client
REACT_APP_FEATURE_A3_CRUD=true

# Commit
git commit -m "feat: enable A3 CRUD feature"
```

### Phase 4: Cleanup Old Flags (after stable)

```bash
# Remove flag check (code stays)
# Remove env var
# Remove from featureFlags.ts type
```

**Total migration effort:** ~2-3 hours (one-time setup)

**Benefits:** Can merge incomplete work, gradual rollout, A/B testing

---

## 📚 Appendix: Worktree Commands Cheat Sheet

### Create Worktree

```bash
# Create feature worktree
git worktree add ../lean-ai-coach-feature-name -b feature/XX-description

# Example
git worktree add ../lean-ai-coach-a3-crud -b feature/a3-crud
```

### List Worktrees

```bash
git worktree list
# /Users/toon/.../lean-ai-coach       ec1d4c6 [develop]
# /Users/toon/.../lean-ai-coach-tl    ec1d4c6 [feature/TL-techlead]
```

### Remove Worktree

```bash
# Navigate out of worktree first
cd /Users/toonvos/Projects/LEANAICOACH/lean-ai-coach

# Remove worktree
git worktree remove ../lean-ai-coach-a3-crud

# Or if directory deleted already
git worktree prune
```

### Switch Worktree (with safety checks)

```bash
# Stop servers in current worktree
Ctrl+C

# Navigate to new worktree
cd ../lean-ai-coach-a3-sections

# Pull latest + migrate (safety)
git pull origin develop
wasp db migrate-dev

# Start servers
wasp start
```

### Sync All Worktrees (after schema change)

```bash
# Create script: sync-worktrees.sh
#!/bin/bash
WORKTREES=(
  "/Users/toonvos/Projects/LEANAICOACH/lean-ai-coach"
  "/Users/toonvos/Projects/LEANAICOACH/lean-ai-coach-tl"
  "/Users/toonvos/Projects/LEANAICOACH/lean-ai-coach-a3-crud"
  "/Users/toonvos/Projects/LEANAICOACH/lean-ai-coach-a3-sections"
)

for WT in "${WORKTREES[@]}"; do
  echo "Syncing $WT..."
  cd "$WT"
  git pull origin develop
  wasp db migrate-dev
  echo "✅ $WT synced"
done

# Usage:
./sync-worktrees.sh
```

---

## ✅ Decision Checklist

**Before choosing strategy, answer:**

- [ ] Hoeveel developers werken parallel? (1 / 2-3 / 4+)
- [ ] Hoe vaak test je features? (1x/day / multiple / constant)
- [ ] Hoe vaak wijzigt database schema? (weekly / daily / constant)
- [ ] Accepteer je feature flag overhead? (yes / no)
- [ ] Accepteer je server switching time? (yes / no)
- [ ] Heb je strikte coördinatie mogelijk? (daily standup / slack / none)

**Based on answers:**

- **Mostly "1" or "solo"**: → **Strategie 1**
- **"2-3" + "daily" + "yes coordination"**: → **Strategie 3**
- **"4+" + "constant" + "no coordination"**: → **Reconsider Wasp**

---

## 📝 Next Steps

1. **Review dit document**
2. **Beantwoord Decision Checklist vragen**
3. **Kies strategie**
4. **Als Strategie 3**: Setup feature flags (Phase 1)
5. **Document beslissing** in `tasks/active/techlead/current/decision-log.md`
6. **Communicate naar team** (als applicable)

---

**Last Updated:** 2025-10-18
**Status:** Decision Required
**Owner:** TechLead (Toon)
**Review:** After reading, update status to "Decision Made: Strategy X"
