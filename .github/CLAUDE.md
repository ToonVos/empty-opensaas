# .github Directory Context

**AUTO-LOADED** when Claude Code works with files in `.github/`. **Parent context**: Root CLAUDE.md provides project overview, testing workflow.

---

## What's in .github/

**Git hooks, CI/CD configuration, and GitHub-specific files**:

```
.github/
├── workflows/           # GitHub Actions CI/CD (future)
├── COMMIT_CONVENTION.md # Commit message guide
└── CLAUDE.md            # This file
```

**Related directories**:

```
.husky/                  # Git hooks (pre-commit, pre-push)
├── pre-commit           # Runs on every commit
└── _pre-push.sh         # Runs before git push
```

---

## Git Workflow

### Branch Strategy

**Main branches**:

- `main` - Production-ready code (protected)
- `develop` - Integration branch (default)

**Feature branches**:

```
feature/{description}      # New features
fix/{description}          # Bug fixes
refactor/{description}     # Code refactoring
docs/{description}         # Documentation updates
```

**Examples**:

```bash
git checkout -b feature/add-task-filters
git checkout -b fix/login-redirect-error
git checkout -b refactor/simplify-api-calls
```

### Commit Workflow

```bash
# 1. Make changes to code
# 2. Stage files
git add src/components/TaskList.tsx

# 3. Commit (pre-commit hook runs automatically)
git commit -m "feat(tasks): add filter by status"
# Hook runs: prettier, lint-staged, TypeScript check

# 4. Push (pre-push hook runs automatically)
git push
# Hook runs: full TypeScript check, ESLint, Wasp validation
```

**→ Commit message format**: See `COMMIT_CONVENTION.md`

---

## Git Hooks (Husky)

### Pre-Commit Hook

**File: `.husky/pre-commit`**

**Runs on**: Every `git commit`

**What it does**:

1. ✅ Blocks `.env` files from being committed (security)
2. ✅ Runs `lint-staged` on staged files
3. ✅ Runs prettier on Markdown/JSON
4. ✅ Runs TypeScript check (gracefully skips if not installed)

**Example output**:

```bash
$ git commit -m "feat: add new feature"

[pre-commit] 🚫 Blocking .env files...
[pre-commit] ✅ No .env files staged

[pre-commit] Running lint-staged...
✔ Preparing lint-staged...
✔ Running tasks for staged files...
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...

[pre-commit] ✅ All checks passed
[main abc1234] feat: add new feature
```

**If hook fails**:

```bash
$ git commit -m "feat: add feature"

[pre-commit] ❌ TypeScript check failed
src/components/TaskList.tsx:15:5 - error TS2322: Type 'string' is not assignable to type 'number'.

✖ TypeScript check failed
```

**Fix the error, then commit again.**

### Pre-Push Hook

**File: `.husky/_pre-push.sh`**

**Runs on**: Every `git push`

**What it does**:

1. ✅ Runs full TypeScript check (all files, not just staged)
2. ✅ Runs ESLint with auto-fix
3. ✅ Validates Wasp configuration (checks main.wasp syntax)
4. ✅ Gracefully skips checks if tools not installed (for boilerplate)

**Example output**:

```bash
$ git push

[pre-push] Running full TypeScript check...
✔ TypeScript check passed

[pre-push] Running ESLint...
✔ ESLint passed

[pre-push] Validating Wasp config...
✔ Wasp validation passed

[pre-push] ✅ All checks passed - pushing to remote

Enumerating objects: 5, done.
...
To github.com:user/repo.git
   abc1234..def5678  main -> main
```

**If hook fails**:

```bash
$ git push

[pre-push] Running ESLint...
✖ ESLint found 3 errors

src/components/TaskList.tsx
  15:5  error  'status' is assigned a value but never used  @typescript-eslint/no-unused-vars

❌ Pre-push checks failed - fix errors before pushing
```

**Fix the errors, commit, then push again.**

### Bypassing Hooks (Use With Caution)

**⚠️ NOT RECOMMENDED** - Hooks exist for code quality

```bash
# Skip pre-commit hook
git commit --no-verify -m "feat: urgent fix"

# Skip pre-push hook
git push --no-verify
```

**When acceptable**:

- ✅ Emergency hotfix (document why in commit message)
- ✅ Work-in-progress commit to backup work
- ❌ NEVER on `main` or `develop` branches
- ❌ NEVER to avoid fixing errors

---

## Commit Message Convention

**Format**: `<type>(<scope>): <subject>`

**→ Complete guide**: See `COMMIT_CONVENTION.md`

**Quick reference**:

```bash
# Features
git commit -m "feat(auth): add password reset flow"
git commit -m "feat(tasks): implement task filtering"

# Fixes
git commit -m "fix(login): correct redirect after authentication"
git commit -m "fix(api): handle null values in response"

# Refactoring
git commit -m "refactor(components): extract reusable Button component"

# Docs
git commit -m "docs(readme): add installation instructions"

# Tests
git commit -m "test(tasks): add unit tests for TaskList component"

# Chores
git commit -m "chore(deps): upgrade react to 18.3.0"
```

**Why this format?**

- ✅ Auto-generate changelogs
- ✅ Filter commits by type (`git log --grep="^feat"`)
- ✅ Understand changes without reading code
- ✅ Semantic versioning automation

---

## Creating Pull Requests

### Using Claude Code (Recommended)

**Claude can create PRs directly** via `gh` CLI:

```
User: "Create a pull request for this feature"

Claude:
1. Checks git status
2. Analyzes commits since branch divergence
3. Drafts PR summary based on ALL commits
4. Pushes to remote (if needed)
5. Creates PR with detailed description
```

**PR format**:

```markdown
## Summary

- Implemented task filtering by status
- Added dropdown UI component
- Updated API to support filter parameter

## Test plan

- [ ] Verify filter dropdown appears on task list page
- [ ] Test filtering by TODO status
- [ ] Test filtering by IN_PROGRESS status
- [ ] Test filtering by DONE status
- [ ] Verify filter persists across page refreshes

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### Manual PR Creation

```bash
# 1. Push feature branch
git push -u origin feature/task-filters

# 2. Create PR via GitHub CLI
gh pr create --title "Add task filtering" --body "$(cat <<'EOF'
## Summary
- Implemented task filtering by status
- Added dropdown UI component

## Test plan
- [ ] Test filtering works correctly
- [ ] Test UI is accessible
EOF
)"

# 3. Or use GitHub web interface
# Visit: https://github.com/user/repo/compare/feature/task-filters
```

---

## Git Best Practices

### DO ✅

```bash
# Commit frequently with clear messages
git commit -m "feat(tasks): add task filtering"
git commit -m "test(tasks): add tests for task filtering"
git commit -m "docs(tasks): document filter API"

# Pull before starting work
git pull origin develop

# Keep commits focused (one logical change per commit)
git add src/components/TaskFilter.tsx
git commit -m "feat(tasks): add TaskFilter component"

git add src/server/tasks/operations.ts
git commit -m "feat(api): add filter parameter to getTasks"

# Use branches for features
git checkout -b feature/task-filters

# Write descriptive commit messages
git commit -m "fix(auth): prevent redirect loop when token expires

Previously, expired tokens caused infinite redirect loop between
login and dashboard. Now explicitly clear token and show login form.

Fixes #123"
```

### DON'T ❌

```bash
# Vague commit messages
git commit -m "fix stuff"
git commit -m "wip"
git commit -m "update"

# Commit unrelated changes together
git add .
git commit -m "Add feature and fix bug and update docs"

# Commit directly to main/develop
git checkout main
git commit -m "Quick fix"  # ❌ Use feature branch

# Force push to shared branches
git push --force origin develop  # ❌ Breaks others' work

# Commit secrets
git add .env.server  # ❌ Pre-commit hook blocks this

# Amend pushed commits
git commit --amend  # ❌ Only amend local commits
git push --force

# Large commits without context
git commit -m "Refactor everything"  # ❌ What changed?
```

---

## Working with Multiple Worktrees

**→ Complete guide**: Root `docs/MULTI-WORKTREE-DEVELOPMENT.md`

### Quick Reference

```bash
# Create worktree for new feature
git worktree add ../opensaas-dev1 -b feature/task-filters

# Work in worktree
cd ../opensaas-dev1
./scripts/safe-start.sh  # Uses Dev1 ports (3100/3101)

# Commit in worktree
git commit -m "feat(tasks): add filtering"

# Switch back to main worktree
cd ../opensaas-main

# Pull changes from worktree
git fetch
git merge feature/task-filters
```

### Multi-Worktree Git Rules

**DO ✅:**

- ✅ Pull schema changes BEFORE running migrations
- ✅ Use separate branches per worktree
- ✅ Commit migrations to git immediately
- ✅ Coordinate schema changes with team

**DON'T ❌:**

- ❌ Run migrations without pulling latest schema
- ❌ Delete migrations after pushing
- ❌ Modify pushed migrations
- ❌ Work on same branch in multiple worktrees

---

## CI/CD Pipeline (Future)

**Placeholder for GitHub Actions workflows**

**Planned workflows**:

```
.github/workflows/
├── ci.yml               # Run tests on PR
├── deploy-staging.yml   # Deploy to staging on develop
└── deploy-prod.yml      # Deploy to production on main
```

**Typical CI workflow**:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [develop, main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "22"
      - run: npm install
      - run: cd app && npx wasp test client run
      - run: ./scripts/run-e2e-tests.sh
```

**→ Complete CI/CD setup**: Root `docs/CI-CD-SETUP.md`

---

## Troubleshooting Git Issues

### Pre-Commit Hook Fails

**Problem**: `[pre-commit] ❌ TypeScript check failed`

**Solution**:

```bash
# View errors
cd app
npx tsc --noEmit

# Fix errors, then commit again
git commit -m "feat: add feature"
```

### Pre-Push Hook Fails

**Problem**: `[pre-push] ❌ ESLint found errors`

**Solution**:

```bash
# Auto-fix ESLint errors
cd app
npx eslint . --ext .ts,.tsx --fix

# Commit fixes
git add .
git commit -m "fix(lint): resolve ESLint errors"

# Push again
git push
```

### Accidentally Committed .env File

**Problem**: `.env.server` committed to git

**Solution**:

```bash
# 1. Remove from staging
git rm --cached app/.env.server

# 2. Add to .gitignore (should already be there)
echo "app/.env.server" >> .gitignore

# 3. Commit removal
git commit -m "fix(security): remove .env.server from git"

# 4. IMMEDIATELY rotate all secrets in .env.server
# - New DATABASE_URL password
# - New API keys
# - New JWT_SECRET
```

**⚠️ If already pushed**: See root `docs/SECURITY-RULES.md` #emergency-response

### Merge Conflicts in Migrations

**Problem**: Multiple worktrees created migrations, now conflicts

**Solution**:

```bash
# 1. Accept both migrations (don't delete either)
git merge feature/other-worktree
# Resolve conflict: keep both migration files

# 2. Ensure migrations applied in order
cd app
wasp db migrate-dev

# 3. Restart to regenerate types
cd ..
./scripts/safe-start.sh
```

**Prevention**: Coordinate schema changes, pull before migrating

---

## See Also

- **[COMMIT_CONVENTION.md](COMMIT_CONVENTION.md)** - Complete commit message guide
- **[../docs/CI-CD-SETUP.md](../docs/CI-CD-SETUP.md)** - CI/CD pipeline setup
- **[../docs/MULTI-WORKTREE-DEVELOPMENT.md](../docs/MULTI-WORKTREE-DEVELOPMENT.md)** - Multi-worktree git workflow
- **[../.husky/pre-commit](../.husky/pre-commit)** - Pre-commit hook implementation
- **[../.husky/\_pre-push.sh](../.husky/_pre-push.sh)** - Pre-push hook implementation
- **GitHub CLI Docs**: https://cli.github.com/manual/
- **Husky Docs**: https://typicode.github.io/husky/
