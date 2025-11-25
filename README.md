# Empty OpenSaaS - Production-Ready SaaS Boilerplate

🚀 **Clean OpenSaaS boilerplate with Wasp framework** - Generalized from lean-ai-coach project with complete development workflow, TDD practices, and multi-worktree parallel development setup.

## 📚 Complete Documentation

**→ [Development Workflow (PDF)](docs/DEVELOPMENT-WORKFLOW.md.pdf)** - Complete guide from idea to production (1-2 weeks cycle)

**→ [Wasp & OpenSaaS Technical Guide (PDF)](docs/WASP-OPENSAAS-TECHNICAL.md.pdf)** - Framework features, constraints & design decisions

## ✨ Key Features

### Pre-Built OpenSaaS Features

- ✅ **Authentication** - Email/password, Google OAuth, GitHub OAuth, password reset
- ✅ **Stripe Payments** - Checkout, subscriptions, webhooks, invoices
- ✅ **Admin Dashboard** - Analytics, user metrics, revenue tracking
- ✅ **Multi-Language (i18n)** - i18next integration with language switcher
- ✅ **UI Components** - ShadCN v2.3.0 (40+ accessible components)
- ✅ **Email Templates** - SendGrid integration with React Email templates

### Wasp Framework Benefits

- 🎯 **Declarative Config** - Single `main.wasp` file for routes, pages, operations
- 🔄 **Auto-Generated API** - REST endpoints generated from operations
- 🔒 **Type-Safe** - Auto-synced types from server to client
- 🚦 **Built-in Auth** - Production-ready authentication system
- ⚡ **One Command Setup** - `wasp start` runs everything
- 🔁 **Auto-Invalidation** - Query cache management handled automatically

### Development Workflow

- 📋 **Complete TDD Workflow** - RED → GREEN → REFACTOR → SECURITY phases
- 🌳 **Multi-Worktree Support** - True parallel development (4+ isolated environments)
- 🤖 **AI-Assisted Development** - Custom Claude Code agents for automation
- 📊 **Automated Planning** - `/initiate` → `/specify` → `/plan` → `/breakdown` commands
- 🔍 **Code Quality** - ESLint, Prettier, TypeScript, Husky git hooks
- 🧪 **Testing Stack** - Vitest (unit/component) + Playwright (E2E)

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Tailwind CSS 3** - Utility-first styling
- **ShadCN v2.3.0** - UI components
- **Vite 5** - Build tool
- **i18next** - Multi-language

### Backend

- **Node.js 20** - Runtime
- **Express 4** - Web framework
- **Prisma 5** - ORM
- **PostgreSQL 16** - Database
- **Passport.js** - Auth (wrapped by Wasp)

### Development

- **Wasp 0.18** - Full-stack framework
- **Docker** - Database containers
- **Vitest** - Unit testing
- **Playwright** - E2E testing

## 🚀 Quick Start

### Prerequisites

- Node.js >= 22.12
- Docker (for PostgreSQL)
- Wasp CLI (`curl -sSL https://get.wasp-lang.dev/installer.sh | sh`)

### Setup

```bash
# 1. Clone repository
git clone https://github.com/ToonVos/empty-opensaas.git
cd empty-opensaas

# 2. Install dependencies & start
./scripts/safe-start.sh

# 3. Open browser
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### Development Commands

```bash
# Start development (all servers)
./scripts/safe-start.sh

# Database management
./scripts/db-manager.sh status    # View databases
./scripts/db-studio.sh           # Open Prisma Studio

# Testing
./scripts/test-watch.sh          # Unit/component tests (watch mode)
./scripts/run-e2e-tests.sh       # E2E tests

# Code quality
npx eslint . --ext .ts,.tsx --fix
npx prettier --write "src/**/*.{ts,tsx}"
```

## 📖 Project Structure

```
empty-opensaas/
├── app/
│   ├── main.wasp              # Wasp configuration
│   ├── schema.prisma          # Database schema
│   └── src/
│       ├── auth/              # OpenSaaS: Pre-built auth
│       ├── payment/           # OpenSaaS: Stripe integration
│       ├── admin/             # OpenSaaS: Admin dashboard
│       ├── email/             # OpenSaaS: Email templates
│       ├── i18n/              # OpenSaaS: Multi-language
│       │
│       ├── pages/             # YOUR product pages
│       ├── components/        # YOUR components
│       ├── server/            # YOUR operations
│       └── lib/               # YOUR utilities
│
├── docs/                      # Complete documentation
│   ├── DEVELOPMENT-WORKFLOW.md.pdf
│   └── WASP-OPENSAAS-TECHNICAL.md.pdf
│
├── scripts/                   # Helper scripts
│   ├── safe-start.sh          # Multi-worktree startup
│   ├── db-manager.sh          # Database management
│   └── test-watch.sh          # Test runner
│
├── e2e-tests/                 # Playwright E2E tests
└── tasks/                     # Task management
```

## ⚠️ Critical Constraints

### Import Rules

```typescript
// ❌ WRONG
import { Task } from "@wasp/entities";
import { Component } from "@src/components/...";

// ✅ CORRECT
import type { Task } from "wasp/entities";
import { Component } from "../../components/...";
```

### Enum Runtime Values

```typescript
// ❌ WRONG - Types only, no runtime
import { UserRole } from "wasp/entities";

// ✅ CORRECT - Runtime values from Prisma
import type { User } from "wasp/entities"; // Type only
import { UserRole } from "@prisma/client"; // Runtime
```

### Database Migrations

```bash
# ❌ NEVER use Prisma directly
npx prisma migrate dev

# ✅ ALWAYS use Wasp commands
wasp db migrate-dev "description"
./scripts/safe-start.sh  # MANDATORY restart after!
```

### ShadCN Version Lock

```bash
# ✅ ONLY v2.3.0 (Tailwind v4 incompatible!)
npx shadcn@2.3.0 add button

# After installation, fix import path:
# ❌ import { cn } from "s/lib/utils"
# ✅ import { cn } from "../../lib/utils"
```

## 🔄 Development Workflow (Summary)

**From Idea to Production in 1-2 weeks:**

1. **Planning (30 min)** - `/initiate` → `/specify` → `/plan` → `/breakdown`
2. **Setup (5 min)** - `./scripts/worktree-create.sh feature/name Dev1`
3. **Development (4-6 hours)** - `/tdd-feature "name"` (RED → GREEN → REFACTOR → SECURITY)
4. **Review & Merge (1-2 days)** - `gh pr create` → CI/CD → Merge
5. **Deployment (Auto)** - Staging → QA → Production

**Complete details:** See [DEVELOPMENT-WORKFLOW.md.pdf](docs/DEVELOPMENT-WORKFLOW.md.pdf)

## 🌳 Multi-Worktree Development

**True parallel development** with isolated databases and ports:

| Worktree | Frontend | Backend | Database | Prisma Studio |
| -------- | -------- | ------- | -------- | ------------- |
| develop  | 3000     | 3001    | 5432     | 5555          |
| Dev1     | 3100     | 3101    | 5433     | 5556          |
| Dev2     | 3200     | 3201    | 5434     | 5557          |
| Dev3     | 3300     | 3301    | 5435     | 5558          |
| TechLead | 3400     | 3401    | 5436     | 5559          |

**Benefits:**

- ✅ Zero port conflicts
- ✅ Zero database conflicts
- ✅ No coordination needed between developers
- ✅ Each worktree = complete isolated environment

## 🤖 AI-Assisted Development

**Custom Claude Code agents for automation:**

- `wasp-test-automator` - Generate tests following TDD patterns (RED phase)
- `test-quality-auditor` - Verify test quality (RED phase quality gate)
- `wasp-code-generator` - Implement operations/components (GREEN phase)
- `wasp-refactor-executor` - Execute refactorings (REFACTOR phase)
- `wasp-migration-helper` - Complete database migration workflow
- `backend-architect` - Architecture and design decisions
- `security-auditor` - Security audits and OWASP compliance

**Plus process commands:**

- `/initiate` - Convert idea to PRD with user stories
- `/specify` - Generate technical specification
- `/plan` - Create implementation plan
- `/breakdown` - Generate daily task files
- `/tdd-feature` - Complete TDD workflow orchestrator
- `/review-pr` - Comprehensive PR review

## 🧪 Testing Strategy

**Test Pyramid:**

- **80%** Unit tests (≥80% coverage) - Vitest
- **15%** Integration tests (≥75% coverage) - Vitest + React Testing Library
- **5%** E2E tests (critical flows only) - Playwright

**TDD Workflow:**

1. **RED** - Write tests first (watch mode: `./scripts/test-watch.sh`)
2. **GREEN** - Implement minimal code to pass
3. **REFACTOR** - Improve code quality (tests stay green)
4. **SECURITY** - OWASP Top 10 audit (optional)

## 🔒 Security Best Practices

- ✅ Server-side auth checks (NEVER client-side only)
- ✅ Wasp handles password hashing (bcrypt)
- ✅ Environment variables: `.env.server` (secrets) vs `.env.client` (public)
- ✅ Input validation with Zod
- ✅ Prisma query builder (SQL injection safe)
- ✅ OWASP Top 10 compliance

## 📚 Documentation

### Core Guides (in `docs/`)

- **[DEVELOPMENT-WORKFLOW.md.pdf](docs/DEVELOPMENT-WORKFLOW.md.pdf)** - Complete workflow overview
- **[WASP-OPENSAAS-TECHNICAL.md.pdf](docs/WASP-OPENSAAS-TECHNICAL.md.pdf)** - Framework technical details
- **TDD-WORKFLOW.md** - Test-Driven Development practices
- **TROUBLESHOOTING-GUIDE.md** - Common issues and solutions
- **CODE-ORGANIZATION.md** - Project structure patterns
- **SECURITY-RULES.md** - Security best practices
- **COMMON-PITFALLS.md** - Mistakes to avoid

### External Documentation

- **Wasp Framework:** https://wasp.sh/docs/
- **OpenSaaS Template:** https://docs.opensaas.sh/
- **Prisma ORM:** https://www.prisma.io/docs/

## 🤝 Contributing

This is a clean boilerplate template. Fork it and customize for your own SaaS product!

**Key principles:**

1. Keep OpenSaaS foundation intact (`auth/`, `payment/`, `admin/`, etc.)
2. Add your product features in `pages/`, `components/`, `server/`
3. Follow TDD workflow (RED → GREEN → REFACTOR)
4. Use multi-worktree setup for parallel development
5. Never merge OpenSaaS template updates directly (manual porting only)

## 📝 License

Based on [OpenSaaS](https://opensaas.sh/) template (MIT License) and [Wasp](https://wasp.sh/) framework.

## 🔗 Links

- **Repository:** https://github.com/ToonVos/empty-opensaas
- **Wasp Framework:** https://wasp.sh
- **OpenSaaS Template:** https://opensaas.sh
- **Original Project:** lean-ai-coach (generalized to this boilerplate)

---

**⚡ Ready to build your SaaS?** Start with `./scripts/safe-start.sh` and check the [Development Workflow PDF](docs/DEVELOPMENT-WORKFLOW.md.pdf)!
