---
name: review-pr
description: Comprehensive PR review by QA/Security/TechLead/PO - checks CI/CD, GitHub Codex comments, architecture, security, TDD compliance, and code quality
usage: /review-pr <PR_NUMBER>
---

# Comprehensive PR Review

You are performing a **comprehensive pull request review** as a team of:

- **QA Lead** - Quality assurance, testing, TDD compliance
- **Security Lead** - Security vulnerabilities, auth, permissions, OWASP
- **Tech Lead** - Architecture, Wasp patterns, technical debt
- **Product Owner** - Business requirements, scope, deliverables

**PR to review:** #{{PR_NUMBER}}

---

## 🆕 Review Workflow (MANDATORY PHASES)

This command MUST follow the **THINK → EXPLORE → PLAN → EXECUTE** pattern across review phases.

---

## Review Process (7 Phases + Agent Integration)

Execute ALL phases systematically. Do NOT skip any phase.

### Phase 1: Data Gathering (Parallel)

**Collect all PR information in parallel:**

```bash
# 1. Get PR metadata
gh pr view {{PR_NUMBER}} --json title,body,author,headRefName,baseRefName,state,url,additions,deletions,changedFiles,labels,reviewDecision,isDraft

# 2. Get CI/CD status
gh pr checks {{PR_NUMBER}}

# 3. Get PR comments (including Codex/bot comments)
gh pr view {{PR_NUMBER}} --comments

# 4. Get PR reviews
gh api repos/{owner}/{repo}/pulls/{{PR_NUMBER}}/reviews

# 5. List changed files (key files only - exclude node_modules, .wasp, dist)
gh pr view {{PR_NUMBER}} --json files --jq '.files[] | select(.path | test("app/src|e2e-tests|docs|schema.prisma|main.wasp")) | .path' | head -50

# 6. Get PR diff for critical files only
gh pr diff {{PR_NUMBER}} -- "app/main.wasp" "app/schema.prisma" "*.test.ts" "*.test.tsx"
```

**Important:** If diff is too large (>300 files), focus on:

- `app/main.wasp` changes
- `app/schema.prisma` changes
- New test files
- Core implementation files (operations, pages, components)

---

### Phase 1.5: 🔍 EXPLORE PHASE (MANDATORY - PR Context Analysis)

**When:** After data gathering, BEFORE any analysis
**Agent:** Use Task tool with `subagent_type='Explore'` and `thoroughness='very thorough'`

**What to explore:**

1. **Categorize changed files:**

   - Schema changes (schema.prisma, migrations/)
   - Operation changes (operations.ts files)
   - Test changes (_.test.ts, _.spec.tsx)
   - Component changes (\*.tsx pages/components)
   - Config changes (main.wasp, .env, etc.)

2. **Find related context:**

   - Similar PRs (Grep for similar patterns in git history)
   - Related issues/tickets (GitHub issue references)
   - Architectural patterns used (Read changed operations for patterns)

3. **Analyze test coverage:**

   - Count test files vs implementation files (ratio check)
   - Identify test types (unit vs integration vs E2E)
   - Check for untested files (Glob for _.ts without matching _.test.ts)

4. **Check migration impact:**

   - Examine schema changes (Read schema.prisma diff)
   - Find migration dependencies (migrations/ directory)
   - Identify breaking changes (backwards compatibility)

5. **Cross-reference with CLAUDE.md:**
   - Import rule compliance areas (identify files to check)
   - Permission patterns used (identify operations to verify)
   - TDD workflow indicators (commit message patterns)

**Output:** PR context analysis document with:

- Categorized file changes
- Risk assessment areas
- Architectural patterns identified
- Test coverage gaps
- Migration impact summary

**Why critical:** Provides comprehensive context for focused review in later phases

---

### Phase 2: CI/CD Compliance Check

**Verify GitHub Actions status:**

1. **Check CI status:**

   - ✅ All checks passing? → PASS
   - ❌ Any check failing? → BLOCKING ISSUE
   - ⏸️ Checks skipped/pending? → INVESTIGATE

2. **If checks failing:**

   - Get failure details: `gh run view <RUN_ID> --log-failed`
   - Categorize errors:
     - ESLint errors → Code quality issue
     - TypeScript errors → Type safety issue
     - Test failures → Functional issue
     - Build failures → Integration issue

3. **Check coverage (if available in CI logs):**
   - Required: ≥80% statements, ≥75% branches
   - If below threshold → WARNING ISSUE

**Output:** CI/CD Status Report with specific failing checks

---

### Phase 3: GitHub Codex/Bot Comments Analysis

**Analyze automated code review comments:**

1. **Extract bot comments:**

   - Look for comments from: `github-actions[bot]`, `codex`, `codecov`, etc.
   - Parse severity: ERROR, WARNING, INFO

2. **Categorize by type:**

   - **Security issues** (SQL injection, XSS, auth bypass)
   - **Performance issues** (N+1 queries, missing indexes)
   - **Code quality** (duplication, complexity, maintainability)
   - **Style violations** (formatting, naming conventions)

3. **Cross-reference with CLAUDE.md rules:**
   - Does comment align with Wasp best practices?
   - Is it a false positive (e.g., Wasp framework standards)?
   - Should it be addressed or documented as exception?

**Output:** Codex Issues Summary with severity and recommendations

---

### Phase 3.5: 📋 PLAN PHASE (MANDATORY - Review Strategy)

**When:** After PR context explored, BEFORE architecture review
**Agent:** Use Task tool with `subagent_type='Plan'` and `model='sonnet'`

**What to plan:**

1. **Prioritize review areas:**

   - Critical paths first (auth, permissions, data access)
   - High-risk changes (schema, main.wasp, security-sensitive operations)
   - Medium-risk changes (business logic, UI components)
   - Low-risk changes (styling, refactoring, tests)

2. **Plan compliance checks:**

   - Which CLAUDE.md rules to verify (based on file changes)
   - Import rule checks (operations files, entity imports)
   - Permission checks (operations with context.user)
   - Error handling checks (HTTP status codes)

3. **Sequence skill invocations:**

   - code-review-wasp skill first (Wasp-specific patterns)
   - Specific skills if needed (wasp-operations, permissions, error-handling)
   - Marketplace agents for deep dive (backend-architect, security-auditor)

4. **Design scoring methodology:**

   - Weight categories (security > architecture > code quality > documentation)
   - Determine blocker vs warning thresholds
   - Define pass/fail criteria per category

5. **Plan agent usage:**
   - Which specialized agents for deep analysis
   - When to use marketplace agents (cost vs value)
   - Sequential vs parallel agent execution

**Output:** Review execution plan with:

- Prioritized review checklist
- Compliance verification strategy
- Agent invocation sequence
- Scoring methodology
- Time estimates per phase

**Why critical:** Strategic review prevents missing critical issues and optimizes reviewer time

---

### Phase 4: Architecture & Wasp Patterns Review

**Use code-review-wasp skill + agents for deep analysis:**

```
# Activate code-review-wasp skill
Use the code-review-wasp skill to analyze the PR changes
```

**Key checks (from skill):**

1. **Import Rules** - wasp/ vs @wasp/, @src/ usage, enum imports
2. **Type Annotations** - All operations have type annotations
3. **Auth Checks** - EVERY operation checks `context.user` first
4. **Entity Declaration** - All entities listed in main.wasp
5. **Error Handling** - Correct HTTP status codes (401, 403, 404, 400)
6. **Database Migrations** - Used `wasp db migrate-dev`, not `prisma`
7. **Client-Side Actions** - Using `await action()`, not `useAction()`
8. **Environment Variables** - Secrets in .env.server, not committed

**If complex architectural changes detected:**

```
Use backend-development:backend-architect to evaluate:
- API design decisions
- Data model changes
- Architecture patterns used
```

**Output:** Architecture Review Report with compliance score

---

### Phase 5: Security Audit

**Use security-auditor agent for critical security review:**

```
Use security-scanning:security-auditor to audit:
1. Authentication and authorization patterns
2. Multi-tenant data isolation
3. Input validation and sanitization
4. SQL injection vulnerabilities
5. XSS vulnerabilities
6. Sensitive data exposure
7. OWASP Top 10 compliance
```

**Critical security checks:**

1. **Server-side auth enforcement:**

   - ALL operations check `context.user`
   - NO client-side only authorization
   - Correct HTTP status codes (401/403)

2. **Multi-tenant isolation:**

   - Department/Organization filters present
   - No cross-tenant data leaks
   - Permission checks before data access

3. **Input validation:**

   - All user inputs validated
   - Zod schemas for API inputs
   - SQL injection prevention (Prisma parameterized queries)

4. **Secrets management:**
   - NO .env files committed
   - NO hardcoded credentials
   - Secrets in .env.server only

**Output:** Security Audit Report with risk levels (CRITICAL, HIGH, MEDIUM, LOW)

---

### Phase 5.5: 🔍 EXPLORE PHASE (MANDATORY - TDD Analysis)

**When:** Before TDD compliance check
**Agent:** Use Task tool with `subagent_type='Explore'` and `thoroughness='medium'`

**What to explore:**

1. **Analyze commit history:**

   - Examine commit message sequence (Bash: gh pr view commits)
   - Identify commit patterns (test:, feat:, refactor: prefixes)
   - Check commit order (RED before GREEN before REFACTOR)
   - Verify separate commits per phase

2. **Read test files for quality:**

   - Read test files (_.test.ts, _.spec.tsx)
   - Check for 5 quality criteria patterns:
     - Business logic tests (not just existence checks)
     - Meaningful assertions (specific values, not toBeDefined)
     - Error path coverage (401, 403, 404, 400 tests)
     - Edge case coverage (empty, null, boundaries)
     - Behavior testing (return values, not internals)

3. **Analyze test-to-implementation ratio:**

   - Count implementation files (_.ts, _.tsx operations/components)
   - Count test files (_.test.ts, _.spec.tsx)
   - Calculate ratio (should be close to 1:1 or better)

4. **Check test assertions:**

   - Grep for test patterns (expect statements)
   - Identify test theater patterns (toBeDefined, toBeInstanceOf without behavior)
   - Find mock usage (verify mocks are actually used)

5. **Review coverage reports:**
   - Read CI logs for coverage output
   - Extract coverage percentages (statements, branches)
   - Identify untested critical paths

**Output:** TDD compliance analysis with:

- Commit sequence analysis
- Test quality assessment (5 criteria)
- Test-to-code ratio
- Coverage summary
- Test theater detection

**Why critical:** Provides objective data for TDD compliance verification

---

### Phase 6: TDD & Test Quality Review

**Verify TDD workflow compliance based on exploration:**

1. **Review commit history analysis from exploration**

2. **Verify RED → GREEN → REFACTOR pattern:**

   - Tests committed BEFORE implementation?
   - Commit message convention followed?
   - REFACTOR phase reduced code size?

3. **Check test quality (5 criteria from tdd-workflow skill):**

   - ✅ Tests business logic (not existence checks)
   - ✅ Meaningful assertions (verify behavior)
   - ✅ Tests error paths (401, 400, 404, 403)
   - ✅ Tests edge cases (empty, null, boundaries)
   - ✅ Behavior not implementation testing

4. **Coverage analysis:**
   - Check CI logs for coverage report
   - Verify ≥80% statements, ≥75% branches
   - Identify untested critical paths

**Red flags:**

- ❌ Test files modified during GREEN/REFACTOR → Test cheating
- ❌ No test files in PR → Missing tests
- ❌ Code grows during REFACTOR → Wrong refactoring
- ❌ Coverage below threshold → Insufficient testing

**Output:** TDD Compliance Report with test quality score

---

### Phase 7: Product Owner Review

**Verify business requirements and deliverables:**

1. **Scope alignment:**

   - Does PR match JIRA/issue requirements?
   - Are all acceptance criteria met?
   - Any scope creep detected?

2. **Documentation:**

   - CHANGELOG.md updated?
   - PR description complete (Summary, Test Plan)?
   - README updated if needed?

3. **User impact:**
   - Breaking changes documented?
   - Migration guide provided?
   - Feature flags used for gradual rollout?

**Output:** Product Alignment Report

---

## Final Report Structure

**Generate comprehensive report in this exact format:**

```markdown
# 🔍 PR REVIEW REPORT: #{{PR_NUMBER}}

**PR:** [Title]
**Author:** @username
**Branch:** feature/xxx → develop (or main/accept - FLAG if wrong!)
**Size:** +X / -Y lines, N files changed
**Status:** APPROVED ✅ | CHANGES REQUESTED ⚠️ | BLOCKED ❌

---

## Executive Summary

[2-3 sentences summarizing PR quality and merge readiness]

**Verdict:**

- [ ] **APPROVED** - Safe to merge
- [ ] **CONDITIONAL APPROVAL** - Minor fixes needed (non-blocking)
- [ ] **CHANGES REQUESTED** - Significant issues must be fixed
- [ ] **BLOCKED** - Critical issues prevent merge

---

## ❌ BLOCKING ISSUES (Must Fix Before Merge)

[List all CRITICAL issues that prevent merge]

1. **[Category]:** Description
   - **Impact:** Why this is critical
   - **Fix:** Specific action required
   - **Evidence:** CI output / code location

---

## ⚠️ WARNING ISSUES (Should Fix)

[List all important but non-blocking issues]

1. **[Category]:** Description
   - **Impact:** Potential risk
   - **Recommendation:** Suggested fix
   - **Priority:** High / Medium / Low

---

## ✅ PASSED CHECKS

[List all categories that passed review]

- ✅ CI/CD: All checks passing
- ✅ Security: No vulnerabilities detected
- ✅ Architecture: Follows Wasp patterns
- ✅ TDD: Test quality meets criteria
- ✅ Documentation: Complete and accurate

---

## 📊 QUALITY METRICS

| Category          | Score    | Notes                         |
| ----------------- | -------- | ----------------------------- |
| **CI/CD**         | X/10     | [Details]                     |
| **Architecture**  | X/10     | [Wasp compliance]             |
| **Security**      | X/10     | [OWASP compliance]            |
| **Test Quality**  | X/10     | [Coverage + 5 criteria]       |
| **Code Quality**  | X/10     | [SOLID, DRY, maintainability] |
| **Documentation** | X/10     | [Completeness]                |
| **Process**       | X/10     | [Branch strategy, commits]    |
| **OVERALL**       | **X/10** | Weighted average              |

---

## 🎯 DETAILED FINDINGS

### CI/CD Analysis

[Full CI status report]

### Codex/Bot Comments

[Analysis of automated review comments]

### Architecture Review

[Wasp patterns compliance]

### Security Audit

[Security findings with risk levels]

### TDD Compliance

[Test quality and coverage]

### Product Alignment

[Business requirements check]

---

## 📋 ACTION ITEMS

**For PR Author:**

1. [ ] [Action item 1]
2. [ ] [Action item 2]

**For Reviewers:**

1. [ ] [Review item 1]

**For Merge:**

1. [ ] All blocking issues resolved
2. [ ] CI checks passing
3. [ ] 2+ approvals received
4. [ ] Base branch correct (develop)

---

## 💡 RECOMMENDATIONS

**Code Quality:**
[Suggestions for improvement]

**Technical Debt:**
[Issues to track in backlog]

**Process Improvements:**
[Lessons learned for future PRs]

---

## 🔗 REFERENCES

- **PR URL:** [link]
- **CI Run:** [link]
- **Related Issues:** #123, #456
- **Documentation:** [links]

---

**Review completed by:** Claude Code AI (QA/Security/TechLead/PO simulation)
**Review date:** [timestamp]
**Confidence level:** High / Medium / Low
```

---

## Usage Examples

### Example 1: Simple feature PR

```
/review-pr 16
```

### Example 2: With specific focus

```
/review-pr 23
Focus especially on security and multi-tenant isolation
```

### Example 3: Quick review

```
/review-pr 45
Quick review - focus on blocking issues only
```

---

## Special Cases

### Large PRs (>500 files)

- Focus on schema.prisma, main.wasp, and test files
- Request PR to be split if >1000 files
- Recommend GitHub's "Files changed" tab for manual review

### Draft PRs

- Note it's a draft
- Focus on architectural feedback
- Skip nitpicky style issues

### Urgent Hotfixes

- Prioritize security and correctness
- Allow minor style violations
- Ensure tests are present

---

## Integration with Skills & Agents

**This command leverages:**

### Project Skills (Automatic)

- `code-review-wasp` - Wasp-specific patterns review
- `tdd-workflow` - TDD compliance verification
- `wasp-operations` - Operation pattern checks
- `error-handling` - Error handling patterns
- `permissions` - Multi-tenant permission checks

### Custom Agents (On-Demand)

- `wasp-test-automator` (Haiku) - If tests need review
- `wasp-code-generator` (Haiku) - If implementation needs analysis
- `wasp-refactor-executor` (Haiku) - If refactoring suggestions needed

### Marketplace Agents (Strategic)

- `backend-development:backend-architect` (Sonnet) - For architectural decisions
- `security-scanning:security-auditor` (Sonnet) - For security deep-dive

**Agent usage strategy:**

- Skills first (zero cost, instant)
- Custom Haiku agents for pattern-based review (low cost)
- Custom Sonnet agents for quality gates (test-quality-auditor)
- Marketplace Sonnet agents for complex analysis (backend-architect, security-auditor)

---

## Notes for Reviewers

**This command is AI-assisted, not AI-replaced:**

- AI provides comprehensive analysis
- Human judgment still required for:
  - Business logic correctness
  - User experience decisions
  - Strategic trade-offs
  - Context-specific exceptions

**When in doubt:**

- Ask PR author for clarification
- Consult with team lead
- Request additional context in PR description

**Remember:**

- Be constructive, not destructive
- Praise good patterns
- Explain "why" for requested changes
- Distinguish between "must fix" and "nice to have"

---

## Configuration

**Customize review focus (optional):**

Add to your `.claude/config.json`:

```json
{
  "commands": {
    "review-pr": {
      "strictMode": true,
      "focusAreas": ["security", "performance", "tdd"],
      "autoAssignReviewers": false,
      "requireMinimumScore": 7
    }
  }
}
```

---

**Version:** 1.0
**Last Updated:** 2025-10-21
**Maintained By:** TechLead
