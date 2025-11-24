# Commit Message Convention

**Format**: `<type>(<scope>): <subject>`

**Used by**: Pre-commit hooks, changelog generation, semantic versioning

---

## Format Structure

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Example**:

```
feat(auth): add password reset flow

Implement password reset via email link. Users can request reset,
receive email with token, and set new password.

Closes #123
```

---

## Commit Types

| Type         | When to Use                                         | Example                                       |
| ------------ | --------------------------------------------------- | --------------------------------------------- |
| **feat**     | New feature for the user                            | `feat(tasks): add task filtering by status`   |
| **fix**      | Bug fix for the user                                | `fix(login): correct redirect after login`    |
| **docs**     | Documentation changes                               | `docs(readme): add installation instructions` |
| **style**    | Formatting, missing semicolons (no logic change)    | `style(button): fix indentation`              |
| **refactor** | Code change that neither fixes bug nor adds feature | `refactor(api): simplify error handling`      |
| **perf**     | Performance improvement                             | `perf(tasks): optimize task list rendering`   |
| **test**     | Adding or updating tests                            | `test(auth): add login flow tests`            |
| **chore**    | Build process, dependencies, tooling                | `chore(deps): upgrade react to 18.3.0`        |
| **ci**       | CI/CD configuration changes                         | `ci(github): add automated testing workflow`  |
| **revert**   | Revert previous commit                              | `revert: revert "feat(tasks): add filtering"` |

---

## Scope

**Optional but recommended** - Indicates which part of codebase changed

**Common scopes**:

- `auth` - Authentication/authorization
- `tasks` - Task management feature
- `api` - Backend API changes
- `ui` - UI components
- `db` - Database schema/migrations
- `config` - Configuration files
- `deps` - Dependencies
- `scripts` - Shell scripts

**Examples**:

```
feat(auth): add OAuth login
fix(tasks): resolve duplicate task bug
refactor(api): extract common error handling
chore(deps): update Wasp to 0.18.1
```

---

## Subject

**Rules**:

- ✅ Use imperative mood ("add" not "added" or "adds")
- ✅ Don't capitalize first letter (unless proper noun)
- ✅ No period at the end
- ✅ Limit to 72 characters
- ✅ Be specific and descriptive

**✅ Good Examples**:

```
feat(auth): add password reset via email
fix(tasks): prevent duplicate task creation
refactor(components): extract Button component
docs(api): document authentication endpoints
test(tasks): add unit tests for TaskList
```

**❌ Bad Examples**:

```
feat: Add stuff                    # Vague
fix(tasks): Fixed the bug          # Past tense
feat(auth): Add feature.           # Period at end
refactor: Refactoring everything   # Too broad
wip                                # Not descriptive
update                             # What was updated?
```

---

## Body (Optional)

**Use for**:

- Explaining what and why (not how - code shows how)
- Providing context for reviewers
- Linking to issues or PRs

**Format**:

- Wrap at 72 characters
- Separate from subject with blank line
- Use bullet points for multiple changes

**Example**:

```
feat(tasks): add task priority levels

Add LOW, MEDIUM, HIGH priority levels to tasks. Priority affects
sort order on task list and visual styling.

- Add priority field to Task model
- Update task list to show priority badges
- Sort tasks by priority, then by date

Closes #45
```

---

## Footer (Optional)

**Use for**:

- Referencing issues/PRs
- Breaking changes
- Co-authors

**Common footers**:

```
Closes #123
Fixes #456
Refs #789
BREAKING CHANGE: API endpoint /api/tasks now requires auth
Co-authored-by: Name <email@example.com>
```

---

## Breaking Changes

**For changes that break backward compatibility**

**Format**:

```
feat(api): change task list endpoint response format

BREAKING CHANGE: /api/tasks now returns { data: [], total: 0 }
instead of flat array. Update client code to access data.tasks.
```

**Or in footer**:

```
feat(api): redesign task API

- Change endpoint paths
- Update response format
- Add pagination support

BREAKING CHANGE: All task API endpoints have changed.
See migration guide: docs/api-migration.md
```

---

## Examples by Scenario

### New Feature

```
feat(tasks): implement task filtering

Add dropdown to filter tasks by status (TODO, IN_PROGRESS, DONE).
Filter state persists in URL query params.

Closes #123
```

### Bug Fix

```
fix(auth): prevent redirect loop on token expiry

When auth token expired, user was stuck in redirect loop between
/login and /app. Now explicitly clear expired token and redirect
once to login page.

Fixes #456
```

### Refactoring

```
refactor(operations): extract permission checking

Extract repeated permission checking logic into reusable helper
functions. No behavior change, improves maintainability.

- Add hasOrgPermission() helper
- Add hasDeptPermission() helper
- Update all operations to use helpers
```

### Tests

```
test(tasks): add comprehensive TaskList tests

Add unit tests for:
- Rendering empty state
- Rendering task list
- Filtering by status
- Sorting by priority

Coverage: 95% statements, 90% branches
```

### Documentation

```
docs(readme): add multi-worktree setup guide

Document how to set up parallel development environments using
git worktrees. Includes port mapping and database isolation.
```

### Chores

```
chore(deps): upgrade Wasp to 0.18.1

Update Wasp from 0.18.0 to 0.18.1 for bug fixes:
- Fix React 19 compatibility
- Improve migration performance

All tests passing, no breaking changes.
```

### Multiple Files (Related Changes)

```
feat(auth): add two-factor authentication

Complete 2FA implementation:
- Server: Add TOTP generation/verification
- Client: Add 2FA setup UI
- Database: Add user.twoFactorSecret field
- Tests: Add 2FA flow tests

Closes #789
```

---

## Git Commit Workflow with Convention

```bash
# 1. Stage changes
git add src/components/TaskFilter.tsx
git add src/components/TaskFilter.test.tsx

# 2. Commit with conventional format
git commit -m "feat(tasks): add task filtering by status

Add dropdown component to filter tasks. Updates URL query params
to persist filter state across page refreshes.

Closes #123"

# 3. Pre-commit hook validates format
# 4. Push (pre-push hook runs additional checks)
git push
```

---

## Validation

**Pre-commit hook checks**:

- ✅ Commit message format (type, scope, subject)
- ✅ Subject length (<= 72 characters)
- ✅ No trailing period in subject
- ✅ Imperative mood (basic check)

**Manual checks** (not automated):

- Is type appropriate?
- Is scope specific enough?
- Is subject descriptive?
- Does body explain why (if needed)?

---

## Tools

### Generate Changelog

```bash
# Auto-generate changelog from commits
git log --oneline --grep="^feat" --grep="^fix" --grep="^BREAKING"

# Group by type
git log --oneline --grep="^feat" > CHANGELOG-features.txt
git log --oneline --grep="^fix" > CHANGELOG-fixes.txt
```

### Filter Commits by Type

```bash
# All features
git log --grep="^feat"

# All bug fixes
git log --grep="^fix"

# Specific scope
git log --grep="^feat(auth)"
```

### Amend Last Commit Message

```bash
# Fix typo in last commit message (only if not pushed!)
git commit --amend -m "feat(tasks): add filtering by status"
```

---

## Anti-Patterns

### ❌ Vague Messages

```
git commit -m "fix bug"
git commit -m "update code"
git commit -m "changes"
git commit -m "wip"
```

**Why bad**: No context, hard to find commits later

### ❌ Multiple Unrelated Changes

```
git commit -m "feat(tasks): add filtering and fix login bug and update docs"
```

**Why bad**: Mixes features, fixes, and docs - hard to review/revert

**Better**: Split into 3 commits:

```
git commit -m "feat(tasks): add filtering by status"
git commit -m "fix(auth): correct login redirect"
git commit -m "docs(readme): update installation guide"
```

### ❌ Implementation Details in Subject

```
git commit -m "feat(tasks): add useState hook for filter state"
```

**Why bad**: Focuses on implementation (useState), not user benefit

**Better**:

```
git commit -m "feat(tasks): add task filtering by status"
# Body can mention useState if relevant to reviewers
```

### ❌ Past Tense

```
git commit -m "feat(tasks): added filtering"
git commit -m "fix(auth): fixed login bug"
```

**Why bad**: Convention uses imperative mood

**Better**:

```
git commit -m "feat(tasks): add filtering"
git commit -m "fix(auth): fix login redirect"
```

---

## See Also

- **[CLAUDE.md](.github/CLAUDE.md)** - Git workflow and hooks
- **[../.husky/pre-commit](../.husky/pre-commit)** - Pre-commit hook
- **[../.husky/\_pre-push.sh](../.husky/_pre-push.sh)** - Pre-push hook
- **Conventional Commits**: https://www.conventionalcommits.org/
- **Semantic Versioning**: https://semver.org/
