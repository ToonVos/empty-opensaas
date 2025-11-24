# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ Context Management (CRITICAL)

**Before starting ANY new task:**

1. **Check remaining context tokens** - Always monitor token budget
2. **Assess task complexity** - Estimate tokens needed for completion
3. **If insufficient context remains** - Ask user to use **'compact'** mode to create new conversation with summary
4. **Never start complex tasks** with <30,000 tokens remaining

**Why:** Running out of context mid-task leads to incomplete work and wasted effort.

**File Paths (CRITICAL):** ALWAYS use absolute paths (`/Users/toonvos/.../app/src/file.ts`), NEVER relative (`../app/src/file.ts`). Relative paths from wrong working directory create `app/app/` double nesting.

---

## 🚨 DATABASE MIGRATIONS - NEVER TOUCH DATABASE DIRECTLY {#database-critical}

**CRITICAL AI/AGENT RULE: NEVER modify database yourself. Use `wasp-migration-helper` agent for ALL schema changes.**

| ❌ ABSOLUTELY FORBIDDEN       | ✅ REQUIRED WORKFLOW (Agent Executes)                                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Direct SQL/psql commands      | 1. Use `wasp-migration-helper` agent                                                                                                                    |
| Prisma Studio manual edits    | 2. Agent: Edit schema → migrate → restart → update code                                                                                                 |
| `prisma migrate dev` (manual) | 3. **If agent fails:** ASK USER for help with error details. User can invoke `wasp-database` skill manually. **NEVER attempt database fixes yourself.** |
| `prisma db push`              |                                                                                                                                                         |
| Migration file edits          |                                                                                                                                                         |

**Why NEVER touch database:**

- Direct changes bypass Wasp's type generation system
- Break multi-worktree database isolation
- Create migration conflicts across worktrees

**Multi-worktree coordination:** Pull schema changes from git BEFORE agent runs migration

→ **Agent:** Use `wasp-migration-helper` for schema changes
→ **Manual workflow:** See [Essential Commands](#commands) section
→ **Troubleshooting:** [docs/TROUBLESHOOTING-GUIDE.md](docs/TROUBLESHOOTING-GUIDE.md)

**Terminology:**

- Use `wasp-migration-helper` **agent** for schema changes (preferred, interactive)
- `wasp-database` **skill** provides reference workflow (agent uses this internally)

---

## 📍 Directory-Specific Guides (Auto-Loaded)

Claude automatically loads additional context when you work in these directories:

- **app/** → See **app/CLAUDE.md** for Wasp development patterns (operations, database, ShadCN, design system)
- **app/src/components/** → See **app/src/components/CLAUDE.md** for Radix UI testing (userEvent, polyfills, dropdown patterns)
- **app/src/test/** → See **app/src/test/CLAUDE.md** for Vitest component testing (unit/component tests)
- **e2e-tests/** → See **e2e-tests/CLAUDE.md** for Playwright E2E testing (integration/auth flows)
- **docs/** → See **docs/CLAUDE.md** for permanent documentation guidelines (what belongs in docs/ vs tasks/reports/.tmp/)
- **tasks/** → See **tasks/CLAUDE.md** for task management workflow (daily tasks, sprints, archive)
- **.github/** → See **.github/CLAUDE.md** for CI/CD & git workflow (hooks, commits, PRs)
- **.tmp/** → See **.tmp/CLAUDE.md** for MANDATORY temporary files rules (where to create scripts, cleanup policy)
- **reports/security-audit/** → See **reports/security-audit/CLAUDE.md** for security audit report format (OWASP Top 10, Phase 4 TDD)

###Test Conventions (Quick Ref)

**2 test types, 2 locations:**

| Type                | Tool       | Location                    | Use For                              |
| ------------------- | ---------- | --------------------------- | ------------------------------------ |
| **Component/Unit**  | Vitest     | `app/src/**/*.test.tsx`     | Components, unit logic, mocked ops   |
| **E2E/Integration** | Playwright | `e2e-tests/tests/*.spec.ts` | Auth flows, navigation, real routing |

**Key rules:** Test files next to components • Feature-based naming (NOT week01!) • See guides above for patterns

---

## 🤖 Agent Strategy (Hybrid Haiku + Sonnet)

**THINK → EXPLORE → PLAN → EXECUTE** pattern with **2 built-in** + **4 custom Haiku** + **1 custom Sonnet** + **2 marketplace** agents for 82% cost savings.

### Built-In Agents (See User Preference above)

- **🔍 Explore**: Gather codebase context without polluting main chat (Haiku, isolated context window)
- **📋 Plan**: Create execution strategy before implementation (Sonnet/Haiku, strategic reasoning)

### Custom Wasp Agents

- **wasp-test-automator** (Haiku) - Generate tests following Wasp patterns (RED phase)
- **test-quality-auditor** (Sonnet) - Verify test quality before commit (RED phase quality gate)
- **wasp-code-generator** (Haiku) - Implement operations/components (GREEN phase)
- **wasp-refactor-executor** (Haiku) - Execute mechanical refactorings (REFACTOR phase)
- **wasp-migration-helper** (Haiku) - Complete database migration workflow (Schema changes)

### Marketplace Agents

- **backend-architect** (Sonnet) - Architecture and design decisions (Planning/Design)
- **security-auditor** (Sonnet) - Security audits and OWASP compliance (Review)

**→ Details:** See `.claude/agents/README.md` for complete agent documentation and `.claude/commands/` for command-specific integration patterns.
**→ Planning guide:** [docs/PLANNING-WORKFLOW.md](docs/PLANNING-WORKFLOW.md)

---

## Project Overview

**LEAN AI COACH** is an AI-powered coaching platform for lean methodology built with the Open SaaS template and Wasp framework. The MVP focuses on an A3 Problem Solving tool with an 8-section workflow and context-aware AI chat coaching.

**Tech Stack:**

- **Framework**: Wasp ^0.18.0 (full-stack React + Node.js framework)
- **Frontend**: React 18, TypeScript, Tailwind CSS, ShadCN UI v2, Radix UI
- **Backend**: Node.js, Prisma ORM
- **Database**: PostgreSQL
- **AI**: OpenAI GPT-4 (for section-specific coaching)

---

## ⚠️ User Preference: Thoughtful Execution (CRITICAL)

**The user prefers Claude Code to think thoroughly before acting.**

**Required pattern for ALL work:**

1. **🤔 THINK**: Understand the request completely
2. **🔍 EXPLORE**: Use Explore agent to gather codebase context (isolates context window)
3. **📋 PLAN**: Use Plan agent to create execution strategy (strategic reasoning)
4. **✅ EXECUTE**: Only then proceed with implementation

**Why critical:** Prevents acting too quickly without sufficient context or planning.

**Applies to:**

- ✅ ALL process commands (/initiate, /specify, /plan, /breakdown, /tdd-feature, /review-pr, /close-sprint)
- ✅ Complex multi-file features
- ✅ Architectural decisions
- ❌ Simple one-off tasks (use judgment)

**See:** `.claude/commands/` for command-specific integration details and `.claude/agents/README.md` for agent documentation.

---

## 🔐 Constitution (Immutable Across ALL Worktrees & Agents) {#constitution}

**These rules apply to EVERY agent, EVERY worktree, NO exceptions.**

### Most Critical Rules (Prevent 80% of Errors)

0. **ALWAYS use scripts/** → ALL development operations via `./scripts/*` (NEVER direct wasp/npm/postgres commands) → See [Scripts First](#scripts-first)
1. **Database migrations** → Use `wasp-migration-helper` agent for ALL schema changes (NEVER direct Postgres/Prisma/psql/manual edits) → If agent fails: **ASK USER** for help, **NEVER touch database directly** → See [Database Critical](#database-critical)
2. **Import rules** → `wasp/` NOT `@wasp/`, `@prisma/client` for enum values → See [Import Rules](#import-rules)
3. **Restart after schema changes** → `./scripts/safe-start.sh` (MANDATORY for type regeneration)
4. **TDD workflow** → Tests FIRST, committed separately → [TDD Workflow](docs/TDD-WORKFLOW.md)
5. **Multi-worktree coordination** → Pull schema changes from git BEFORE migrating

### Reference Sections

All constitution rules are detailed in existing sections:

| Rule Category | Section                      | Link                               |
| ------------- | ---------------------------- | ---------------------------------- |
| Imports       | Most common errors           | [Import Rules](#import-rules)      |
| Version locks | ShadCN, Node.js              | [Version Locks](#version-locks)    |
| Code style    | Naming, formatting           | [Code Style](#code-style)          |
| Testing       | 5 quality criteria, coverage | [Testing & TDD](#testing)          |
| Commands      | wasp, git, database          | [Essential Commands](#commands)    |
| Architecture  | Navigation, multi-tenancy    | [Core Architecture](#architecture) |
| Pitfalls      | Common mistakes              | [Common Pitfalls](#pitfalls)       |
| Security      | Auth, secrets, passwords     | [Security Rules](#security)        |

**Why Constitution?** Ensures agent consistency across parallel worktrees and prevents divergent implementations.

---

## 🚀 Scripts First Rule {#scripts-first}

**ALL development operations MUST use `/scripts/` directory wrappers - NEVER use raw wasp/npm/postgres commands directly.**

| Operation               | ❌ NEVER USE                                             | ✅ ALWAYS USE                     | Why                                                         |
| ----------------------- | -------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------- |
| **Start development**   | `wasp start`, `npm start`                                | `./scripts/safe-start.sh`         | Handles multi-worktree ports, DATABASE_URL, process cleanup |
| **Database operations** | `wasp db`, `psql`, `prisma migrate`, Prisma Studio edits | `./scripts/db-manager.sh`         | Worktree-specific database isolation                        |
| **Run tests**           | `cd app && wasp test`, `npm test`                        | `./scripts/test-watch.sh`         | Correct test environment setup                              |
| **E2E tests**           | `npx playwright test`                                    | `./scripts/run-e2e-tests.sh`      | Auto server start + seed + cleanup                          |
| **Clean build**         | `wasp clean`                                             | `./scripts/safe-start.sh --clean` | Includes React 18 fix + proper restart                      |

### Database Changes - Critical AI/Agent Rule

**NEVER modify database directly.** Use `wasp-migration-helper` agent for ALL schema changes.

→ **Complete workflow**: See [Database Critical](#database-critical) section
→ **Script documentation**: `scripts/CLAUDE.md`

---

## Import Rules & Syntax (CRITICAL ⚠️) {#import-rules}

**Most common source of errors!**

| Context     | Wasp Generated                              | Your Code      | Enums                      | ❌ NEVER                  |
| ----------- | ------------------------------------------- | -------------- | -------------------------- | ------------------------- |
| `.ts/.tsx`  | `wasp/entities`<br>`wasp/client/operations` | Relative paths | `@prisma/client` (runtime) | `@wasp/...`<br>`@src/...` |
| `main.wasp` | N/A                                         | `@src/...`     | N/A                        | Relative paths            |

**Enum critical**: Types from `wasp/entities`, Runtime from `@prisma/client`

**Common errors**:

- `Cannot find 'wasp/...'` → Use `wasp/` NOT `@wasp/` + restart
- `Cannot find '@src/...'` → In .ts: use relative path | In main.wasp: correct
- `No exported member 'X'` → Enum runtime values need `@prisma/client`

→ **Complete patterns**: [IMPORT-RULES.md](docs/IMPORT-RULES.md)
→ **Troubleshooting**: `troubleshooting-guide` skill

---

## Version Locks (CRITICAL ⚠️) {#version-locks}

### ShadCN UI Version Lock

**ONLY USE:** ShadCN v2.3.0

```bash
npx shadcn@2.3.0 add button  # ✅ CORRECT
npx shadcn add button         # ❌ BREAKS - uses Tailwind v4
```

**Why:** Newer ShadCN versions require Tailwind v4, which is incompatible with Wasp.

**After EVERY component installation - Fix import path:**

```diff
// In src/components/ui/{component}.tsx
-import { cn } from "s/lib/utils"
+import { cn } from "../../lib/utils"
```

**Common Error:**

```
Cannot find module 's/lib/utils' → Fix import path (step above)
```

### Node.js Version Lock

**REQUIRED:** Node.js >= 22.12

```bash
node --version  # Check your version
```

**Why:** Wasp 0.18+ requires this minimum version.

---

## Code Style & Conventions {#code-style}

### Naming Rules

| Element       | Convention       | Example                            |
| ------------- | ---------------- | ---------------------------------- |
| Components    | PascalCase       | `TaskList.tsx`, `A3Editor.tsx`     |
| Utils/Helpers | camelCase        | `emailHelper.ts`, `formatters.ts`  |
| Operations    | `operations.ts`  | `src/server/a3/operations.ts`      |
| Variables     | camelCase        | `taskList`, `currentUser`          |
| Functions     | camelCase + verb | `getTasks()`, `createA3()`         |
| Booleans      | is/has/should    | `isAuthenticated`, `hasPermission` |
| Constants     | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_TIMEOUT_MS`  |

### Import Order (5 Groups with Blank Lines)

1. External libraries (`react`, `zod`)
2. Wasp imports (`wasp/client/operations`, `wasp/entities`)
3. Absolute imports (`@/components/ui/button`)
4. Relative imports - parent first (`../../lib/utils`)
5. Relative imports - same directory (`./TaskListItem`)

**Code Formatting** (auto-enforced via git hooks): 2 spaces | Single quotes | Semicolons | Max 100 chars

---

## Essential Commands {#commands}

```bash
# Worktree Configuration (Infrastructure - Auto-Loaded by All Scripts)
# scripts/worktree-config.sh          # DO NOT call directly - sourced by all scripts
# Provides: WORKTREE_NAME, FRONTEND_PORT, BACKEND_PORT, DB_PORT, STUDIO_PORT, DB_NAME
# See scripts/CLAUDE.md for port mapping details

# Development (Multi-Worktree with Complete Isolation)
./scripts/safe-start.sh             # Start servers (auto-detects worktree, uses correct ports/DB)
./scripts/safe-start.sh --clean     # With wasp clean + React 18 fix
./scripts/fix-react-version.sh      # Manual React 18 fix (if blank page after wasp clean)
wasp clean                          # Fix weird errors (REQUIRES React 18 fix after!)

# Multi-Worktree Database Management
./scripts/db-manager.sh status      # View all worktree databases status
./scripts/db-manager.sh start       # Start database for current worktree
./scripts/db-manager.sh stop        # Stop database for current worktree
./scripts/db-manager.sh clean       # Reset current worktree database (DELETE ALL DATA)
./scripts/db-manager.sh stopall     # Stop all databases (all worktrees)
./scripts/db-studio.sh              # Prisma Studio for current worktree (auto port)
./scripts/db-studio.sh --all        # Start all 4 Studios simultaneously
./scripts/multi-start.sh            # Start all worktrees parallel (power users)

# Database Seeding
./scripts/seed-visual-test.sh       # Seed demo user: demo@leancoach.nl / DemoPassword123!

# Port Mapping Reference (NEW)
# develop  → 3000/3001 (DB 5432, Studio 5555)
# Dev1     → 3100/3101 (DB 5433, Studio 5556)
# Dev2     → 3200/3201 (DB 5434, Studio 5557)
# Dev3     → 3300/3301 (DB 5435, Studio 5558)
# TechLead → 3400/3401 (DB 5436, Studio 5559)

# Database Migration (Use wasp-migration-helper agent)
# For schema changes, use the agent instead of running commands manually.
# Agent handles: Edit schema → migrate → restart → update code
# Manual reference (if needed):
wasp db migrate-dev --name "Description"  # ✅ CORRECT (agent uses this)
# ❌ NEVER: prisma migrate dev (WRONG)
./scripts/safe-start.sh                   # MANDATORY restart after migration

# Testing (TDD Workflow - ⚠️ MUST run from app/ directory)
# RED Phase - Watch mode (REQUIRED during test writing)
./scripts/test-watch.sh                              # Launch from project root (recommended)
cd app && wasp test client                           # Or run from app/ directory
# Keep terminal open! Auto-runs on file save
# Shows: Real-time test execution feedback

# Manual test runs (verification)
cd app && wasp test client run                       # Run once (all tests)
cd app && wasp test client run src/path/to/test      # Specific test file/directory
cd app && wasp test client run --coverage            # With coverage (≥80%/≥75%)

# GREEN/REFACTOR Phase - One-shot runs
cd app && wasp test client run                       # Verify all green
cd app && wasp test client run --coverage            # Coverage check

# E2E Testing (Playwright - ⚡ Automated Setup)
./scripts/run-e2e-tests.sh                           # ALWAYS use this (auto: servers + seed + tests)
./scripts/run-e2e-tests.sh --headed                  # Show browser during test execution
./scripts/run-e2e-tests.sh --debug                   # Step-by-step debugging mode
./scripts/run-e2e-tests.sh --no-seed                 # Skip database seeding (if already done)
# What it does: ✅ Check/start servers → ✅ Seed database → ✅ Run tests → ✅ Show summary
# See e2e-tests/CLAUDE.md for details

# Code Quality
npx eslint . --ext .ts,.tsx --fix
npx prettier --write "src/**/*.{ts,tsx}"
```

**Common Migration Error:**

```
Property 'newField' does not exist on type 'User'
```

**Fix:** You forgot to restart. Stop wasp (Ctrl+C) and run `wasp start`.

**React 19 Issue (Since Oct 2025):**

After `wasp clean`, npm installs React 19 (breaks app with blank page).

**Fix:** Use `./scripts/safe-start.sh --clean` (auto-fixes) OR run `./scripts/fix-react-version.sh` manually.

**Details:** See `docs/REACT-19-FIX.md`

---

## Core Architecture {#architecture}

**→ Complete code organization:** [docs/CODE-ORGANIZATION.md](docs/CODE-ORGANIZATION.md)

**Quick Reference:**

**Navigation:** 2-level top bar (NO sidebar)

- Niveau 1: Logo, Tools (A3, 5S, Gemba, VSM), Language, User Menu
- Niveau 2: Tool-specific actions

**4-Tier Structure:**

- Tier 0: Dashboard `/app` - Cross-tool overview
- Tier 1: Tool Overview `/app/a3` - Grid/list
- Tier 2: Detail View `/app/a3/:id` - Read-only
- Tier 3: Editor `/app/a3/:id/edit` - Edit with AI chat

**Multi-Tenancy:**

- Organization → Many Departments (hierarchical via `parentId`)
- Users ↔ Departments = Many-to-Many via `UserDepartment`
- DepartmentRole: MANAGER | MEMBER | VIEWER

**Code Organization:**

- Product pages: `src/pages/{tool}/` (A3, 5S, etc.)
- Template pages: `src/{feature}/` (auth, payment, admin)
- Components: `src/components/{category}/` (ui, layout, a3)
- Operations: `src/server/{feature}/operations.ts`

**→ Permission helpers:** `.claude/templates/permission-helpers.ts`

---

## Testing & TDD {#testing}

**CRITICAL**: RED (tests first) → GREEN (code) → REFACTOR (simplify) - Never modify tests after commit!

| Phase        | Command                          | Skill/Command                                | Coverage     |
| ------------ | -------------------------------- | -------------------------------------------- | ------------ |
| **RED**      | `./scripts/test-watch.sh`        | `/red-tdd` (large) or `/tdd-feature` (small) | Write tests  |
| **GREEN**    | `cd app && wasp test client run` | `/green-tdd` (large)                         | Make pass    |
| **REFACTOR** | Tests stay green                 | `/refactor-tdd` (large)                      | Simplify     |
| **SECURITY** | Optional audit                   | `/security-tdd`                              | OWASP Top 10 |

**5 Quality Criteria** (ALL must pass):

1. Business logic (not existence checks)
2. Meaningful assertions
3. Error paths (401, 400, 404, 403)
4. Edge cases (empty, null, boundaries)
5. Behavior not implementation

**Coverage**: ≥80% statements, ≥75% branches

**Red Flags**: Test modified after commit ❌ | Code grows during REFACTOR ❌

**Decision Tree**:

- **Small** (<5 ops, <500 LOC) → `/tdd-feature` (unified, 1 session)
- **Large** (>5 ops, >500 LOC) → Phased commands (`/red-tdd` → `/green-tdd` → `/refactor-tdd` → `/security-tdd`)

→ **Complete workflow**: [TDD-WORKFLOW.md](docs/TDD-WORKFLOW.md)
→ **Test quality**: `tdd-workflow` skill or `test-quality-auditor` skill
→ **Commands**: `.claude/commands/red-tdd.md`, `.claude/commands/tdd-feature.md`

---

## Common Pitfalls {#pitfalls}

| Problem                 | Solution                                            | Skill                                       |
| ----------------------- | --------------------------------------------------- | ------------------------------------------- |
| Client imports server   | Use Wasp operations                                 | `wasp-operations`                           |
| @wasp imports           | Use `wasp/...` (no @)                               | `troubleshooting-guide`                     |
| Enum from wasp/entities | Use `@prisma/client` for values                     | —                                           |
| No auth check           | `if (!context.user) throw HttpError(401)`           | `wasp-operations`                           |
| Forgetting restart      | `./scripts/safe-start.sh` after schema changes      | —                                           |
| useAction by default    | Direct call: `await createTask(data)`               | `wasp-operations`                           |
| Direct wasp start       | Use `./scripts/safe-start.sh` (multi-worktree safe) | —                                           |
| Raw Prisma commands     | Use `wasp db migrate-dev`                           | See [Database Critical](#database-critical) |

**Wasp-Specific**: Use `./scripts/safe-start.sh` | NEVER `npm start` | NEVER modify `.wasp/` | ALWAYS restart after schema changes

**Architecture (LEAN AI COACH)**: 2-level top nav (NO sidebar) | Many-to-many User↔Department | Include VIEWER role

→ **Complete guide**: [COMMON-PITFALLS.md](docs/COMMON-PITFALLS.md)
→ **Troubleshooting**: `troubleshooting-guide` skill

---

## The "DO NOT TOUCH" List {#do-not-touch}

| Severity           | Files                                                                                                | Why                         |
| ------------------ | ---------------------------------------------------------------------------------------------------- | --------------------------- |
| 🚫 **NEVER**       | `.wasp/`, `node_modules/`, `app/dist/`, `app/build/`, `app/.vite/`, `app/migrations/*.sql`           | Auto-generated, overwritten |
| ⚠️ **EXPERT ONLY** | `main.wasp`, `schema.prisma`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.js`, `.husky/*`    | Break entire app if wrong   |
| 🔐 **SECURITY**    | `.env.server`, `.env.client`, `*.pem`, `*.key`, `*credentials.json`, `.env*`                         | Secrets                     |
| ✅ **SAFE**        | `app/src/**/*.ts`, `app/src/**/*.tsx`, `package.json`, `.gitignore`, `.prettierrc`, `.eslintrc.json` | Application code            |

### File Location Rules

| File Type        | Location | Examples                           | Why                                   |
| ---------------- | -------- | ---------------------------------- | ------------------------------------- |
| **Planning .md** | `tasks/` | Task plans, sprints, architecture  | Task management (see tasks/CLAUDE.md) |
| **Docs .md**     | `docs/`  | Guides, workflows, troubleshooting | Documentation (NOT tasks!)            |
| **Temp scripts** | `.tmp/`  | One-time scripts, temp files       | Auto-cleanup (see .tmp/CLAUDE.md)     |

### Red Flags (Stop!)

```bash
// @ts-ignore | // @ts-nocheck                 # Fix root cause, don't suppress
git commit --no-verify | git push --no-verify  # Bypassing hooks?
git push --force origin main/develop           # NEVER on protected branches
npm install wasp@0.12 | npm install react@16   # Downgrading critical deps?
rm app/migrations/2025*                        # Breaks history!
```

### Template Updates (CRITICAL ⚠️)

**NEVER merge latest OpenSaaS template changes into your app**

```bash
# ❌ WRONG - Merging template updates
git remote add template https://github.com/wasp-lang/open-saas
git pull template main  # CAN BREAK CUSTOM CODE!
```

**Why:** Template updates can break your customizations.

**If you need template features:**

1. **Manual porting:** Copy specific features you need
2. **Test thoroughly:** Verify compatibility with your code
3. **Version control:** Commit before attempting integration

**Source:** OpenSaaS docs (:::danger warning)

---

## Error Handling {#error-handling}

| Code    | When            | Example                                         |
| ------- | --------------- | ----------------------------------------------- |
| **401** | `!context.user` | `throw new HttpError(401, 'Not authenticated')` |
| **403** | No permission   | `throw new HttpError(403, 'Not authorized')`    |
| **404** | Not exists      | `throw new HttpError(404, 'Task not found')`    |
| **400** | Validation      | `throw new HttpError(400, 'Required')`          |

**Operation order**: Auth (401) → Exists (404) → Permission (403) → Validation (400) → Business logic

→ **Complete patterns**: [ERROR-HANDLING.md](docs/ERROR-HANDLING.md)
→ **Skill**: `error-handling`
→ **Templates**: `.claude/templates/error-handling-patterns.ts`

---

## Security Rules (CRITICAL ⚠️) {#security}

| Rule            | ❌ WRONG                    | ✅ CORRECT                                        |
| --------------- | --------------------------- | ------------------------------------------------- |
| **Auth**        | Client-side checks          | Server: `if (!context.user) throw HttpError(401)` |
| **Passwords**   | Plain text / manual hashing | Wasp auth (auto-hashed in main.wasp)              |
| **DB URL**      | Hardcoded credentials       | `url = env("DATABASE_URL")` in schema.prisma      |
| **Secrets**     | Client env / committed      | `.env.server` (in .gitignore)                     |
| **Client vars** | Server env                  | `import.meta.env.REACT_APP_*`                     |

**Daily checklist**: Use `security-basics` skill before commits
**Full audit**: Use `security-auditor` agent for OWASP Top 10 compliance

→ **Complete patterns**: [SECURITY-RULES.md](docs/SECURITY-RULES.md)
→ **Templates**: `.claude/templates/error-handling-patterns.ts`

---

## Troubleshooting {#troubleshooting}

**→ Complete guide:** [docs/TROUBLESHOOTING-GUIDE.md](docs/TROUBLESHOOTING-GUIDE.md)

### Top 5 Issues

1. **Import/Type Errors** → Restart with `./scripts/safe-start.sh`, check `wasp/` NOT `@wasp/`, verify entities in main.wasp
2. **Operation Not Working** → Add type annotations, check entities in main.wasp, verify auth check
3. **Auth Not Working** → Use `getEmail(user)` helper, verify main.wasp auth block, check .env.server
4. **Database Issues** → Run `wasp db migrate-dev` after schema changes, restart wasp
5. **Types Not Updating** → ALWAYS restart after schema.prisma or main.wasp changes

**"Bad file descriptor" error?** → See [TROUBLESHOOTING-GUIDE.md](docs/TROUBLESHOOTING-GUIDE.md#build-errors) - Complete solution with `wasp clean` + React 18 fix

### Nuclear Option (Dev Only!)

```bash
wasp clean && rm -rf node_modules .wasp && npm install && wasp db reset && wasp db migrate-dev "Fresh start" && ./scripts/safe-start.sh
```

---

## Implementation Roadmap (MVP) {#roadmap}

**12-week plan** (see `tasks/ARCHITECTURE_AND_IMPLEMENTATION_PLAN_V2.md`):

1. **Slice 1 (Week 1-3)**: Foundation + Multi-tenant + Dashboard
2. **Slice 2 (Week 4-6)**: A3 Overview + Detail
3. **Slice 3 (Week 7-9)**: A3 Editor + 8 Sections
4. **Slice 4 (Week 10-12)**: AI Chat Integration (MVP launch)

---

## Documentation References {#docs}

**START HERE:** This file (CLAUDE.md) is your main guide. For detailed examples, see links below.

### Directory-Specific Guides (Auto-Loaded by Claude)

- **[app/CLAUDE.md](app/CLAUDE.md)** - Wasp development patterns (operations, database, ShadCN, design system, env vars)
- **[tasks/CLAUDE.md](tasks/CLAUDE.md)** - Task management workflow (daily tasks, sprints, archive, multi-worktree)
- **[.github/CLAUDE.md](.github/CLAUDE.md)** - CI/CD & git workflow (hooks, commits, PRs, branch strategy)

### Development Guides (docs/)

- **[TDD-WORKFLOW.md](docs/TDD-WORKFLOW.md)** - Complete TDD workflow, test quality verification, RED/GREEN/REFACTOR
- **[TROUBLESHOOTING-GUIDE.md](docs/TROUBLESHOOTING-GUIDE.md)** - Detailed diagnostic procedures for all error types
- **[CI-CD-SETUP.md](docs/CI-CD-SETUP.md)** - CI/CD pipeline, git hooks, branch strategy
- **[TEAM-STRUCTURE-AND-WASP-PHILOSOPHY.md](docs/TEAM-STRUCTURE-AND-WASP-PHILOSOPHY.md)** - Wasp full-stack philosophy, feature-based vs role-based development
- **[ARCHITECTURE_AND_IMPLEMENTATION_PLAN_V2.md](tasks/ARCHITECTURE_AND_IMPLEMENTATION_PLAN_V2.md)** - Complete architecture (definitive reference)

### Code Templates (.claude/templates/)

**Copy-paste ready examples:**

- **operations-patterns.ts** - Full Wasp operations examples
- **error-handling-patterns.ts** - Complete error handling patterns
- **permission-helpers.ts** - Permission checking helpers
- **test.template.ts** - Test templates
- **dialog-component-test.template.ts** - Dialog component test template
- **combobox-creatable-pattern.md** - Combobox creatable pattern guide

### Conventions

- **[COMMIT_CONVENTION.md](.github/COMMIT_CONVENTION.md)** - Commit message types, format, examples

### External Documentation

- **Open SaaS**: https://docs.opensaas.sh/ | LLM: https://docs.opensaas.sh/llms-full.txt
- **Wasp Framework**: https://wasp.sh/docs/ | LLM: https://wasp.sh/llms-full.txt

---

## Key Files {#key-files}

- **`app/main.wasp`**: Routes, pages, queries, actions, auth (central config)
- **`app/schema.prisma`**: Database schema (single source of truth)
- **`app/.env.server`**: Server secrets (NEVER commit)
- **`app/src/**/operations.ts`\*\*: Backend operations
- **`.cursorrules`**: LLM development guidelines
- **`.husky/`**: Git hooks

---

## When Starting a Task {#task-checklist}

1. **Read** relevant sections of `ARCHITECTURE_AND_IMPLEMENTATION_PLAN_V2.md`
2. **Check** `.cursorrules` for development patterns
3. **Verify** current branch matches task (feature/TL-_, feature/BE-_, etc.)
4. **Run** `wasp clean` if encountering weird errors
5. **Test** locally before committing (hooks will validate)
6. **Create PR** to `develop` when ready (CI will run)

---

## Getting Help {#help}

- **Wasp Discord**: https://discord.gg/rzdnErX
- **Open SaaS GitHub**: https://github.com/wasp-lang/open-saas
- **Wasp Docs**: https://wasp.sh/docs (check latest docs first)
