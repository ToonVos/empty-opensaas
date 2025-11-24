# Claude Skills Directory

This directory contains specialized skills that Claude Code uses to provide targeted guidance for specific workflows and procedures.

**Last updated:** 2025-10-24
**Skills version:** 1.1
**Total skills:** 10

---

## How Skills Work

Skills are **model-invoked**: Claude automatically decides when to use them based on your request and the skill's description. You don't need to manually activate them.

**Benefits:**

- 🎯 **On-demand loading** - Skills only load when needed (saves tokens)
- 📚 **Deep expertise** - Complete workflows vs brief summaries
- 🔍 **Auto-triggered** - Claude detects relevant keywords and loads appropriate skills
- ♻️ **Composable** - Skills reference each other when needed

---

## Available Skills

### Tier 1: Critical (Always Recommended)

#### 1. wasp-operations

**File:** `.claude/skills/wasp-operations/SKILL.md` (896 lines, ~3,700 tokens)

**Description:** Complete Wasp operations patterns (queries/actions) with type annotations, auth checks, entity access, and client usage.

**Triggers:**

- "create query", "add action", "operation"
- "backend", "server code", "operations.ts"

**Use when:**

- Creating/modifying Wasp operations
- Implementing queries or actions
- Working with backend code

**Covers:**

- Type annotations (`GetQuery<Args, Return>`)
- Auth checks (`if (!context.user)`)
- Entity access via `context.entities`
- Client-side usage (useQuery, direct await)
- Auto-invalidation behavior

---

#### 2. tdd-workflow

**File:** `.claude/skills/tdd-workflow/SKILL.md` (1,217 lines, ~5,500 tokens)

**Description:** Complete TDD workflow with RED-GREEN-REFACTOR phases, 5 quality criteria, and test cheating detection.

**Triggers:**

- "test", "TDD", "testing"
- "write tests", "test coverage"
- "RED phase", "GREEN phase", "REFACTOR"

**Use when:**

- Writing tests
- Implementing TDD
- Verifying test quality

**Covers:**

- RED-GREEN-REFACTOR workflow
- 5 MUST PASS test quality criteria
- Test cheating problem & solution
- Coverage requirements (≥80%/≥75%)
- RED FLAGS to stop immediately

---

#### 3. shadcn-ui

**File:** `.claude/skills/shadcn-ui/SKILL.md` (182 lines, ~650 tokens)

**Description:** ShadCN UI component installation with CRITICAL version lock (v2.3.0 ONLY) and mandatory import path fix.

**Triggers:**

- "shadcn", "component", "install component"
- "button", "dialog", "card", "UI component"

**Use when:**

- Installing ShadCN components
- Fixing ShadCN import errors

**Covers:**

- Version lock (v2.3.0 ONLY - Tailwind v4 incompatible)
- Installation command with version
- MANDATORY import path fix
- Common errors & solutions

---

### Tier 2: High Value (Frequently Needed)

#### 4. troubleshooting-guide

**File:** `.claude/skills/troubleshooting-guide/SKILL.md` (974 lines, ~5,500 tokens)

**Description:** Complete diagnostic procedures for all Wasp error types with systematic troubleshooting approach.

**Triggers:**

- "error", "not working", "fails"
- "debug", "broken", "fix", "troubleshoot"
- "import error", "auth error", "database error"

**Use when:**

- Encountering errors
- Debugging issues
- Things not working as expected

**Covers:**

- Import/Type errors
- Operation errors
- Auth errors
- Database issues
- Build errors
- Types not updating
- Performance issues
- Nuclear option (last resort)

---

#### 5. wasp-database

**File:** `.claude/skills/wasp-database/SKILL.md` (685 lines, ~2,500 tokens)

**Description:** Complete database migration workflow with MANDATORY restart requirement and PostgreSQL setup.

**Triggers:**

- "migration", "schema change", "database"
- "prisma", "migrate", "schema.prisma"

**Use when:**

- Modifying database schema
- Running migrations
- Setting up PostgreSQL

**Covers:**

- 4-step migration workflow
- MANDATORY restart after migration
- PostgreSQL vs SQLite
- Common migration errors
- Best practices

---

#### 6. wasp-auth

**File:** `.claude/skills/wasp-auth/SKILL.md` (401 lines, ~3,200 tokens)

**Description:** Complete Wasp authentication setup with minimal User model and helper functions.

**Triggers:**

- "auth", "authentication", "login", "signup"
- "user", "protected route", "getEmail", "password"

**Use when:**

- Setting up authentication
- Implementing login/signup
- Working with user data
- Creating protected routes

**Covers:**

- Minimal User model (id only)
- Auth configuration in main.wasp
- getEmail/getUsername helpers
- Protected routes (client & server)
- Password security
- Advanced: Email on User model

---

#### 7. code-quality

**File:** `.claude/skills/code-quality/SKILL.md` (520 lines, ~4,200 tokens)

**Description:** Complete code quality workflow with ESLint, Prettier, TypeScript, Husky hooks, and type safety standards.

**Triggers:**

- "lint", "eslint", "prettier", "typescript"
- "type check", "code quality", "format"
- "pre-commit", "pre-push", "tsc", "husky"

**Use when:**

- Before committing code
- Fixing linting/type errors
- Understanding automated checks
- Setting up code quality workflow

**Covers:**

- Pre-commit checks (lint-staged, Prettier, TypeScript)
- Pre-push checks (full TypeScript, Wasp validation, ESLint)
- Manual check commands
- Type safety standards (reference to LINTING-STANDARDS.md)
- Common fixes for lint/type errors
- Complete quality workflow

---

### Tier 3: Medium Value (Specialized Use Cases)

#### 8. error-handling

**File:** `.claude/skills/error-handling/SKILL.md` (817 lines, ~3,600 tokens)

**Description:** Complete error handling patterns with HTTP status codes, validation, and retry logic.

**Triggers:**

- "error handling", "http error", "validation"
- "try catch", "400", "401", "403", "404", "500"

**Use when:**

- Implementing error handling
- Adding validation
- Working with HTTP errors

**Covers:**

- HTTP status codes (401, 403, 404, 400, 409, 500)
- Server-side error handling
- Client-side error handling
- Zod validation
- Retry logic
- Error logging

---

#### 9. permissions

**File:** `.claude/skills/permissions/SKILL.md` (842 lines, ~3,500 tokens)

**Description:** Multi-tenant permission checking with organization/department/role patterns.

**Triggers:**

- "permission", "authorization", "access control"
- "role", "MANAGER", "MEMBER", "VIEWER"
- "canAccess", "canEdit"

**Use when:**

- Implementing permission checks
- Setting up role-based access
- Working with multi-tenant data

**Covers:**

- Organization-level permissions
- Department-level permissions (hierarchical)
- Role-based access (MANAGER, MEMBER, VIEWER)
- Permission helper functions
- Batch permission checks
- Query filtering by permissions

---

#### 10. wasp-jobs

**File:** `.claude/skills/wasp-jobs/SKILL.md` (452 lines, ~2,400 tokens)

**Description:** Background jobs with PgBoss (requires PostgreSQL).

**Triggers:**

- "background job", "scheduled task", "cron"
- "job", "email queue", "async task", "PgBoss"

**Use when:**

- Implementing async tasks
- Setting up scheduled jobs
- Creating email queues
- Background processing

**Covers:**

- Job definition in main.wasp
- Job implementation patterns
- PgBoss executor (PostgreSQL required)
- Scheduling (cron + programmatic)
- Email queue pattern
- Batch processing
- Error handling in jobs

---

## Skill Structure

Each skill directory contains:

```
.claude/skills/
├── skill-name/
│   └── SKILL.md          # Main skill file with YAML frontmatter
└── README.md             # This file
```

**SKILL.md format:**

```yaml
---
name: skill-name
description: What this skill does and when to use it
triggers: ["keyword1", "keyword2", "keyword3"]
version: 1.0
last_updated: 2025-10-18
allowed_tools: [Read, Write, Edit, Bash] # Optional
---
# Skill Content
[Complete workflow, patterns, examples]
```

---

## Token Economics

**Skills are loaded on-demand:**

- Not all skills load at once
- Claude selects 1-2 relevant skills per task
- Typical task load: ~3,000-6,000 tokens (1-2 skills)

**Typical scenarios:**

| Task                  | Skills Loaded         | Tokens |
| --------------------- | --------------------- | ------ |
| Create query          | wasp-operations       | ~3,700 |
| Write tests           | tdd-workflow          | ~5,500 |
| Fix import error      | troubleshooting-guide | ~5,500 |
| Add ShadCN button     | shadcn-ui             | ~650   |
| Run migration         | wasp-database         | ~2,500 |
| Setup auth            | wasp-auth             | ~3,200 |
| Fix linting errors    | code-quality          | ~4,200 |
| Handle errors         | error-handling        | ~3,600 |
| Check permissions     | permissions           | ~3,500 |
| Create background job | wasp-jobs             | ~2,400 |

**Efficiency:**

- Always-loaded (CLAUDE.md + Layer 2): ~8,300 tokens
- Skills (on-demand): +650 to +5,500 tokens
- **Total per task:** ~9,000-14,000 tokens

---

## For Developers

### Creating a New Skill

1. **Create directory:**

   ```bash
   mkdir .claude/skills/new-skill-name
   ```

2. **Create SKILL.md with YAML frontmatter:**

   ```yaml
   ---
   name: new-skill-name
   description: Clear description with trigger keywords
   triggers: ["keyword1", "keyword2"]
   version: 1.0
   last_updated: 2025-10-18
   ---
   ```

3. **Add content:**

   - Quick reference
   - Complete workflows
   - Examples
   - Checklists
   - References

4. **Update this README:**
   - Add to appropriate tier
   - Document triggers and usage

### Skill Best Practices

**Description:**

- Include trigger keywords users would naturally use
- Explain when to use the skill
- Be specific about what it covers

**Content:**

- Focus on one capability per skill (composable)
- Provide complete workflows (end-to-end)
- Include copy-paste ready examples
- Use ✅/❌ markers for do's and don'ts
- Reference templates instead of duplicating

**Length:**

- As long as needed for complete workflow
- Break very long content into sections
- Use supporting files for large code examples

**Triggers:**

- Include natural language keywords
- Add technical terms (error codes, framework names)
- Consider variations (e.g., "test", "tests", "testing")

---

## Skill Relationships

**Skills often work together:**

```
wasp-operations
  ↓
  Uses: error-handling (HTTP codes)
  Uses: permissions (auth checks)
  Uses: wasp-database (entity access)

tdd-workflow
  ↓
  Uses: wasp-operations (testing operations)
  Uses: troubleshooting-guide (test failures)

wasp-auth
  ↓
  Uses: wasp-database (User model)
  Uses: error-handling (validation)
  Uses: wasp-operations (auth operations)

wasp-jobs
  ↓
  Uses: wasp-database (PostgreSQL)
  Uses: error-handling (job errors)
  Uses: wasp-operations (triggering from actions)
```

---

## References

**Root documentation:**

- `CLAUDE.md` - Main guide with critical rules
- `app/CLAUDE.md` - Wasp-specific patterns
- `tasks/CLAUDE.md` - Task management
- `.github/CLAUDE.md` - CI/CD & git workflow

**Templates:**

- `.claude/templates/operations-patterns.ts`
- `.claude/templates/error-handling-patterns.ts`
- `.claude/templates/permission-helpers.ts`
- `.claude/templates/test.template.ts`

**Complete guides:**

- `docs/TDD-WORKFLOW.md`
- `docs/TROUBLESHOOTING-GUIDE.md`
- `docs/CI-CD-SETUP.md`
- `docs/TEAM-STRUCTURE-AND-WASP-PHILOSOPHY.md`

---

## Migration from .cursor/rules

**Date:** 2025-10-18

All content from `app/.cursor/rules/*.mdc` has been migrated to:

- **Layer 1** (CLAUDE.md) - Critical universal rules
- **Layer 2** (app/CLAUDE.md) - Context-specific patterns
- **Skills** (this directory) - Complete workflows

**Why migrate?**

- Claude Code can load skills on-demand
- Better token efficiency (only load what's needed)
- More detailed guidance per topic
- Composable and reusable

**Note:** `.cursor/rules/` files remain for Cursor IDE compatibility.

---

## Maintenance

**When to update skills:**

- Wasp version changes (breaking changes)
- New features added to framework
- Common patterns discovered
- Error patterns identified

**How to update:**

1. Edit relevant SKILL.md file
2. Update version number
3. Update last_updated date
4. Test with example prompts
5. Update this README if triggers change

---

**For questions or improvements:** See project maintainers or CLAUDE.md
