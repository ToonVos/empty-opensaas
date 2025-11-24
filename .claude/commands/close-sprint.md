---
description: Archive sprint artifacts, generate retrospective, update living Lessons Learned document, consolidate ALL reports, create PR for team review
---

# Close Sprint: Sprint Completion & Knowledge Capture

Systematically close a sprint by capturing lessons learned, consolidating all reports, archiving artifacts, and creating a PR for team review.

## Usage

```bash
# From sprint directory (auto-detects sprint number)
cd tasks/sprints/sprint-03/
/close-sprint

# With explicit sprint number
/close-sprint 3

# Dry-run mode (preview only, no changes)
/close-sprint 3 --dry-run
```

## Purpose

This command is the **final step** in the sprint lifecycle, ensuring:

1. ✅ **Knowledge Capture** - Extract lessons learned from ALL artifacts and reports
2. ✅ **Report Consolidation** - Summarize ALL report types (QA, Security, PR Reviews, Test Quality, etc.)
3. ✅ **Living Documentation** - Update `docs/LESSONS-LEARNED.md` with implementation tracking
4. ✅ **Sprint Archiving** - Move artifacts to `tasks/archive/YYYY-MM/sprint-X/`
5. ✅ **Team Review** - Create PR for team to review sprint closure
6. ✅ **Cleanup** - Remove temporary files and prepare for next sprint

**Model:** Haiku for exploration, Sonnet for synthesis and report generation

---

## 🆕 Execution Workflow (MANDATORY PHASES)

This command MUST follow the **THINK → EXPLORE → PLAN → EXECUTE** pattern.

---

## Phase 0: PREREQUISITES VALIDATION

**Check before starting:**

1. ✅ Sprint directory exists (`tasks/sprints/sprint-X/`)
2. ✅ Current git status is clean (no uncommitted changes)
3. ✅ All critical PRs merged to develop (verify via `gh pr list`)
4. ✅ Target archive directory doesn't exist (prevent overwrite)

**If prerequisites fail:**

- Provide clear error message
- Suggest remediation steps
- Allow user to override with `--force` (with warning)

---

## Phase 1: 🔍 EXPLORE (Sprint Completion Analysis)

**When:** After prerequisites pass, BEFORE any archiving or report generation

**Agent:** Task tool with `subagent_type='Explore'` and `thoroughness='very thorough'`

**What to explore:**

### 1.1 Sprint Structure Analysis

**Actions:**

```bash
# List all worktree subdirectories
ls tasks/sprints/sprint-X/

# Find all feature READMEs
find tasks/sprints/sprint-X/ -name "README.md" -type f

# Check for TDD artifacts in each worktree
find tasks/sprints/sprint-X/ -type d -name "tests"
find tasks/sprints/sprint-X/ -type d -name "implementation"
find tasks/sprints/sprint-X/ -type d -name "refactor"
find tasks/sprints/sprint-X/ -type d -name "security"
```

**Output needed:**

- List of worktree directories (dev1/, dev2/, dev3/, etc.)
- Feature descriptions from READMEs
- TDD artifact completeness matrix per worktree

### 1.2 Report Discovery (ALL TYPES)

**CRITICAL:** Discover ALL report types, not just QA and Security!

**Actions:**

```bash
# Find all reports subdirectories
ls -la reports/

# For each subdirectory, find sprint-related reports
# QA Reports
find reports/qa/ -name "*sprint-X*" -o -name "*2025-10*" -o -name "*2025-11*"

# Security Audit Reports
find reports/security-audit/ -name "*sprint-X*" -o -name "*2025-10*" -o -name "*2025-11*"

# PR Review Reports
find reports/pr-reviews/ -name "*sprint-X*" -o -name "*2025-10*" -o -name "*2025-11*" 2>/dev/null

# Test Quality Reports
find reports/test-quality/ -name "*sprint-X*" -o -name "*2025-10*" -o -name "*2025-11*" 2>/dev/null

# Research Reports
find reports/research/ -name "*sprint-X*" -o -name "*2025-10*" -o -name "*2025-11*" 2>/dev/null

# Architecture Decision Records
find reports/architecture/ -name "*sprint-X*" -o -name "*2025-10*" -o -name "*2025-11*" 2>/dev/null

# Any other report subdirectories
find reports/ -maxdepth 1 -type d ! -name reports
```

**Output needed:**

- Complete inventory of ALL report types found
- Count per report type
- Date ranges per report type
- Identify which report types need consolidation

### 1.3 PR Merge Status

**Actions:**

```bash
# Get all merged PRs to develop since sprint start
gh pr list --state merged --base develop --limit 50 --json number,title,mergedAt,headRefName

# Filter by sprint timeframe or branch naming pattern
# (e.g., feature/sprint-X-*, feature/dev1-*, feature/dev2-*)

# Check for unmerged PRs that should be in sprint
gh pr list --state open --base develop --json number,title,headRefName
```

**Output needed:**

- List of merged PRs with sprint context
- Any deferred/incomplete features
- Features completed vs planned

### 1.4 Test Coverage Analysis

**Actions:**

```bash
# Find coverage reports in sprint artifacts
find tasks/sprints/sprint-X/ -name "coverage-actual.json"
find tasks/sprints/sprint-X/ -name "coverage-targets.json"
find tasks/sprints/sprint-X/ -name "*coverage*.md"

# Read coverage summaries from implementation/ artifacts
# Extract percentages (statements, branches, functions, lines)
```

**Output needed:**

- Average coverage across all worktrees
- Coverage by feature
- Comparison to targets (80%/75%)

### 1.5 Documentation Updates

**Actions:**

```bash
# Check which docs/ files were created/updated during sprint
cd docs/
git log --since="[sprint-start-date]" --until="[sprint-end-date]" --name-only --pretty=format: | sort -u

# Check skills created/modified
cd .claude/skills/
git log --since="[sprint-start-date]" --until="[sprint-end-date]" --name-only --pretty=format: | sort -u

# Check commands created/modified
cd .claude/commands/
git log --since="[sprint-start-date]" --until="[sprint-end-date]" --name-only --pretty=format: | sort -u

# Check CLAUDE.md updates
git log --since="[sprint-start-date]" --until="[sprint-end-date]" -p -- "**/CLAUDE.md"
```

**Output needed:**

- Documentation files created/updated
- Skills added/modified with descriptions
- Commands added/modified with descriptions
- CLAUDE.md sections updated

### 1.6 Temporary Files Cleanup

**Actions:**

```bash
# List .tmp/ files related to sprint
ls -lah .tmp/*sprint-X* 2>/dev/null

# Find files older than 7 days
find .tmp/ -type f -mtime +7 2>/dev/null
```

**Output needed:**

- List of files to cleanup
- Total size to be freed

**Exploration Output:** Comprehensive sprint inventory document with:

- Worktree completion matrix
- ALL report types inventory (with counts)
- PR merge summary
- Test coverage summary
- Documentation changes
- Cleanup targets

**Why critical:** Provides complete context for knowledge capture and ensures no reports are missed.

---

## Phase 2: 📋 PLAN (Knowledge Capture Strategy)

**When:** After exploration complete, BEFORE report generation

**Agent:** Task tool with `subagent_type='Plan'` and `model='sonnet'`

**What to plan:**

### 2.1 Lessons Learned Extraction

**Plan how to extract lessons from ALL sources:**

1. **QA Reports:**

   - Test strategy issues
   - Test quality patterns (5 TDD criteria violations)
   - Mock strategy inconsistencies
   - Infrastructure improvement requests

2. **Security Audits:**

   - OWASP Top 10 patterns
   - Permission check patterns
   - Backend-driven authorization
   - Input validation strategies

3. **PR Reviews:**

   - Code review patterns
   - Common violations
   - Architecture decisions
   - Refactoring patterns

4. **Test Quality Reports:**

   - Test theater detection
   - Coverage patterns
   - Test quality evolution

5. **Refactor Reports:**

   - Design patterns applied (Strategy, Factory, etc.)
   - Type safety improvements
   - Code complexity reduction

6. **Process Artifacts:**
   - Time estimation lessons (planned vs actual)
   - Multi-worktree coordination
   - TDD workflow refinements

**Output:** Lesson extraction plan with categories and sources

### 2.2 Report Consolidation Strategy

**Plan summaries for EACH report type found:**

**Mandatory summaries:**

- `QA-SUMMARY-SPRINT-[N]-[date].md` → `reports/qa/`
- `SECURITY-SUMMARY-SPRINT-[N]-[date].md` → `reports/security-audit/`

**Conditional summaries (if reports exist):**

- `PR-REVIEW-SUMMARY-SPRINT-[N]-[date].md` → `reports/pr-reviews/`
- `TEST-QUALITY-SUMMARY-SPRINT-[N]-[date].md` → `reports/test-quality/`
- `RESEARCH-SUMMARY-SPRINT-[N]-[date].md` → `reports/research/`
- `ARCHITECTURE-SUMMARY-SPRINT-[N]-[date].md` → `reports/architecture/`

**For each summary, plan:**

- What to extract (key findings, patterns, metrics)
- How to categorize (by severity, by type, by feature)
- What to preserve vs summarize

### 2.3 Archiving Strategy

**Plan file operations:**

```bash
# 1. Create archive directory
mkdir -p tasks/archive/[YYYY-MM]/sprint-X/

# 2. Move sprint artifacts (preserve structure)
mv tasks/sprints/sprint-X/* tasks/archive/[YYYY-MM]/sprint-X/

# 3. Files to preserve:
#    - All worktree subdirectories (dev1/, dev2/, etc.)
#    - All TDD artifacts (tests/, implementation/, refactor/, security/)
#    - All planning documents (README.md, PLAN.md, etc.)
#    - Sprint-specific retrospective (generate in Phase 3)

# 4. Files NOT to archive:
#    - node_modules/ (if present)
#    - .DS_Store, .vite/, dist/, build/
#    - *.tmp, *.log
```

**Validation:**

- Ensure no data loss
- Verify all critical artifacts included
- Check archive size (should be reasonable)

### 2.4 Living Document Update Strategy

**Plan `docs/LESSONS-LEARNED.md` updates:**

**Structure:**

```markdown
# Lessons Learned (Living Document)

Last updated: [date] (Sprint [N] closure)

## How This Document Works

[Explanation of living document concept]

## Category: [Category Name]

### Lesson: [Lesson Title]

**Discovered in:** Sprint [N] ([specific context])
**What we learned:** [Description]
**Implementation:**

- ✅ Code: [file paths]
- ✅ Tests: [test files]
- ✅ Docs: [documentation]
- ✅ Skills: [skills created/modified]
- ✅ Commands: [commands created/modified]
- ✅ Scripts: [scripts created]
- ✅ CLAUDE.md: [sections updated]
  **Status:** ✅ PROCESSED | ⚠️ PARTIAL | ❌ TODO
  **Sprint:** [N]
```

**Categories to update:**

1. TDD Workflow
2. Multi-Worktree Coordination
3. Security Patterns
4. Architecture Patterns
5. Test Quality
6. Tooling Improvements
7. Process Improvements
8. Time Estimation
9. Import Rules & Common Errors
10. Anti-Patterns

**For each lesson:**

- WHERE it was implemented (specific file paths)
- HOW it was implemented (brief description)
- STATUS (has it been fully processed?)
- SPRINT reference (traceability)

### 2.5 PR Creation Strategy

**Plan PR description structure:**

```markdown
# Sprint [N] Closure

## Summary

[One-paragraph overview]

## Changes

### 📚 Knowledge Captured

- Lessons Learned: +[N] lessons in [M] categories
- Retrospective: [location]
- Reports consolidated: [list all types]

### 📦 Archived

- Sprint artifacts: [location]
- TDD artifacts preserved
- Cleanup: [N] files removed

### 📊 Sprint Metrics

- Features: [completed/planned]
- Test coverage: [percentage]
- Security: [findings resolved]
- Velocity: [actual vs planned]

### 💡 Key Lessons Learned

[Top 3-5 lessons with brief summaries]

## Review Checklist

[Items for team to verify]

## References

[Links to key documents]
```

**Planning Output:** Knowledge capture execution plan with:

- Lesson extraction strategy per report type
- Report consolidation structure per type
- Archiving file operations
- Living document update outline
- PR description template

**Why critical:** Strategic planning prevents missing critical lessons and ensures comprehensive knowledge capture.

---

## Phase 3: Generate Report Summaries

**Execute report generation based on plan:**

### 3.1 Sprint Retrospective (MANDATORY)

**Create:** `RETROSPECTIVE-[YYYY-MM-DD].md` in sprint archive

**Structure:**

```markdown
# Sprint [N] Retrospective

**Date:** [YYYY-MM-DD]
**Duration:** [Start date] to [End date]
**Branch:** [main branch used]

---

## Sprint Goal

[Extract from sprint planning or infer from artifacts]

---

## What Went Well ✅

[Analyze artifacts for positive outcomes:]

- High test coverage achieved ([percentage])
- Security audit score improved ([before] → [after])
- [Feature X] delivered ahead of schedule
- Multi-worktree coordination effective
- [Other positive outcomes]

---

## What Didn't Go Well ❌

[Analyze for challenges:]

- Time estimation: [planned] vs [actual] ([percentage] overrun)
- [Specific technical challenges]
- [Process bottlenecks]
- [Communication gaps]
- [Other issues]

---

## Metrics 📊

### Development Metrics

- **Features completed:** [X]/[Y] ([percentage]%)
- **Test coverage:** [average]% (Target: 80%/75%)
- **Lines of code:** +[added] / -[removed]
- **Commits:** [count]
- **PRs merged:** [count]

### Quality Metrics

- **Test quality:** [5 TDD criteria pass rate]
- **Code reviews:** [count] reviews completed
- **Refactoring cycles:** [count] REFACTOR phases
- **Security score:** [before]/100 → [after]/100

### Security Metrics

- **CRITICAL issues:** [count] (all resolved/deferred)
- **HIGH issues:** [count] ([resolved]/[total])
- **MEDIUM issues:** [count] ([resolved]/[total])
- **LOW issues:** [count] ([resolved]/[total])
- **OWASP compliance:** [percentage]%

### Velocity Metrics

- **Story points:** [actual] / [planned] ([percentage]%)
- **Velocity:** [points per day]
- **Sprint duration:** [planned] vs [actual]

---

## Action Items for Next Sprint 🎯

[Generate from analysis:]

| Action | Owner    | Priority | Deadline           | Category  |
| ------ | -------- | -------- | ------------------ | --------- |
| [Item] | TechLead | High     | Sprint [N+1] Day 1 | Process   |
| [Item] | DevTeam  | Medium   | Sprint [N+1]       | Technical |
| [Item] | QA       | Low      | Sprint [N+1]       | Quality   |

---

## Lessons Learned Summary

[Top 5 lessons - brief summaries, full details in docs/LESSONS-LEARNED.md]

1. **[Category]:** [Brief lesson]
2. **[Category]:** [Brief lesson]
3. **[Category]:** [Brief lesson]
4. **[Category]:** [Brief lesson]
5. **[Category]:** [Brief lesson]

See `docs/LESSONS-LEARNED.md` for complete implementation details.

---

## Security Summary 🔐

[Aggregate from all security audits:]

**Audits completed:** [count]
**Total findings:** [count]
**Resolved:** [count] ([percentage]%)
**Deferred:** [count] with tracking

**Critical findings:**

- [Brief description of each CRITICAL issue and resolution]

**OWASP Top 10 Coverage:**
[List covered categories with compliance status]

---

## References

- **Sprint planning:** [link to planning doc if exists]
- **PRs merged:** [list PR numbers with links]
- **Artifacts archived:** `tasks/archive/[YYYY-MM]/sprint-[N]/`
- **Lessons learned:** `docs/LESSONS-LEARNED.md`
- **Report summaries:** `reports/**/[summaries generated]`

---

**Retrospective generated by:** Claude Code `/close-sprint` command
**Generated:** [timestamp]
```

**Store in:** Archive directory (will be moved in Phase 5)

### 3.2 QA Summary (MANDATORY)

**Create:** `reports/qa/QA-SUMMARY-SPRINT-[N]-[YYYY-MM-DD].md`

**Consolidate from all QA reports found in exploration:**

```markdown
# QA Summary - Sprint [N]

**Period:** [Start] to [End]
**Reports analyzed:** [count]

---

## Executive Summary

[2-3 sentences summarizing QA findings]

---

## Test Strategy Issues

### Issue Category 1: [Name]

**Reports:** [list report files]
**Description:** [consolidated description]
**Impact:** [severity]
**Resolution:** [how addressed or deferred]

### Issue Category 2: [Name]

...

---

## Test Quality Defects

[Extract from test quality reports:]

### 5 TDD Criteria Violations

| Criterion              | Violations | Resolution |
| ---------------------- | ---------- | ---------- |
| Business logic testing | [count]    | [status]   |
| Meaningful assertions  | [count]    | [status]   |
| Error path coverage    | [count]    | [status]   |
| Edge case coverage     | [count]    | [status]   |
| Behavior testing       | [count]    | [status]   |

### Common Patterns

- [Pattern 1]: [description and frequency]
- [Pattern 2]: [description and frequency]

---

## Infrastructure Improvements

[Requests for test infrastructure changes:]

- [Improvement 1]: [description, status]
- [Improvement 2]: [description, status]

---

## Anti-Patterns Identified

[Test anti-patterns discovered:]

1. **[Anti-pattern name]**
   - **Description:** [what was found]
   - **Examples:** [file locations]
   - **Remediation:** [how fixed or tracked]

---

## Recommendations

**For Sprint [N+1]:**

1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]

---

## References

**Source reports:**
[List all QA report files analyzed]
```

### 3.3 Security Summary (MANDATORY)

**Create:** `reports/security-audit/SECURITY-SUMMARY-SPRINT-[N]-[YYYY-MM-DD].md`

**Consolidate from all security audit reports:**

```markdown
# Security Summary - Sprint [N]

**Period:** [Start] to [End]
**Audits analyzed:** [count]
**Security score progression:** [before]/100 → [after]/100

---

## Executive Summary

[Security posture overview]

---

## Findings by Severity

### CRITICAL ([count])

[List all CRITICAL findings with resolution status]

| Finding | Location    | Status      | Resolution  |
| ------- | ----------- | ----------- | ----------- |
| [Issue] | [file:line] | ✅ RESOLVED | [how fixed] |

### HIGH ([count])

[Similar table]

### MEDIUM ([count])

[Similar table]

### LOW ([count])

[Similar table]

---

## OWASP Top 10 Compliance

| Category                             | Status       | Notes                                    |
| ------------------------------------ | ------------ | ---------------------------------------- |
| A01:2021 – Broken Access Control     | ✅ COMPLIANT | Backend-driven permissions implemented   |
| A02:2021 – Cryptographic Failures    | ✅ COMPLIANT | Secrets in .env.server only              |
| A03:2021 – Injection                 | ✅ COMPLIANT | Prisma parameterized queries             |
| A04:2021 – Insecure Design           | ⚠️ PARTIAL   | Session timeout deferred to Sprint [N+1] |
| A05:2021 – Security Misconfiguration | ✅ COMPLIANT | CSP headers configured                   |
| A06:2021 – Vulnerable Components     | ✅ COMPLIANT | Dependabot weekly scans                  |
| A07:2021 – Auth Failures             | ✅ COMPLIANT | Wasp auth framework                      |
| A08:2021 – Software/Data Integrity   | ✅ COMPLIANT | Git hooks + CI/CD                        |
| A09:2021 – Logging Failures          | ✅ COMPLIANT | Audit logging implemented                |
| A10:2021 – SSRF                      | ✅ COMPLIANT | No external requests without validation  |

**Overall compliance:** [percentage]%

---

## Deferred Items

[Items tracked for future sprints:]

| Item   | Severity | Reason Deferred | Target Sprint |
| ------ | -------- | --------------- | ------------- |
| [Item] | MEDIUM   | [reason]        | Sprint [N+1]  |

---

## Remediation Patterns Applied

[Document patterns for reuse:]

1. **Backend-driven permissions**

   - Pattern: Server-side auth checks in all operations
   - Implementation: [files]
   - Reusable: Yes

2. **[Other patterns]**

---

## Recommendations

**For Sprint [N+1]:**

1. [Security recommendation]
2. [Security recommendation]

---

## References

**Source audits:**
[List all security audit files analyzed]
```

### 3.4 Conditional Report Summaries

**Generate summaries for additional report types if found:**

#### PR Review Summary

**If:** PR review reports exist
**Create:** `reports/pr-reviews/PR-REVIEW-SUMMARY-SPRINT-[N]-[date].md`
**Content:** Common review findings, approval patterns, change request patterns

#### Test Quality Summary

**If:** Test quality reports exist (beyond QA reports)
**Create:** `reports/test-quality/TEST-QUALITY-SUMMARY-SPRINT-[N]-[date].md`
**Content:** Quality metrics evolution, criteria compliance, test theater detection

#### Research Summary

**If:** Research reports exist
**Create:** `reports/research/RESEARCH-SUMMARY-SPRINT-[N]-[date].md`
**Content:** Technology evaluations, spike results, POC outcomes

#### Architecture Summary

**If:** Architecture decision records exist
**Create:** `reports/architecture/ARCHITECTURE-SUMMARY-SPRINT-[N]-[date].md`
**Content:** ADRs made, patterns adopted, technical debt addressed

---

## Phase 4: Update Living Lessons Learned (CRITICAL!)

**Update:** `docs/LESSONS-LEARNED.md`

**This is a LIVING DOCUMENT - append, don't replace!**

**Workflow:**

1. **First:** Compress PROCESSED lessons from previous sprints (4.0) - keeps document manageable
2. **Then:** Add new Sprint [N] lessons in full detail (4.2) - preserves context for recent work
3. **Finally:** Validate completeness (4.3) - ensures quality

### 4.0 Compress Previous Sprint Lessons (PRE-UPDATE CLEANUP)

**Purpose:** Keep LESSONS-LEARNED.md maintainable by compressing PROCESSED lessons from previous sprints to concise format BEFORE adding new Sprint [N] lessons.

**Why:** As sprints accumulate, the document can become unwieldy with full implementation details for every lesson from every sprint. Once a lesson is ✅ PROCESSED (fully implemented), we only need to keep the essence for future reference.

**Process:**

1. **Read current LESSONS-LEARNED.md**
2. **Identify compression targets:**

   - Lessons with status ✅ PROCESSED
   - From sprints BEFORE current sprint N (Sprint < N)
   - Keep current sprint's lessons in full detail (will be added in 4.2)
   - Keep ⚠️ PARTIAL and ❌ TODO lessons in full detail (still need attention)

3. **Compression format:**

**BEFORE compression (full detail - 15-20 lines):**

```markdown
### Lesson: Test Immutability Prevents Test Cheating

**Discovered in:** Sprint 2 (All worktrees, enforced throughout)

**What we learned:**
LLM agents may delete tests instead of fixing code when tests fail. Solution: Commit tests separately in RED phase makes them immutable. Any modification during GREEN/REFACTOR is visible in git history, making test cheating detectable.

**Solution:**

- RED phase: Write tests, commit separately
- GREEN phase: Implement code to pass tests (NO test modifications)
- REFACTOR phase: Improve code while keeping tests green (NO test modifications)

**Implementation:**

- ✅ **Code:** N/A (process pattern)
- ✅ **Tests:** All tests committed separately in RED phase
- ✅ **Docs:** `docs/TDD-WORKFLOW.md` (RED/GREEN/REFACTOR phases)
- ✅ **Skills:** `.claude/skills/tdd-workflow/SKILL.md`
- ✅ **Commands:** `.claude/commands/red-tdd.md`, `.claude/commands/green-tdd.md`, `.claude/commands/refactor-tdd.md`
- ✅ **Scripts:** N/A

**Status:** ✅ PROCESSED
**Sprint:** 2
```

**AFTER compression (concise - 4-5 lines):**

```markdown
### Lesson: Test Immutability Prevents Test Cheating

**Discovered in:** Sprint 2
**Solution:** Commit tests separately in RED phase to prevent LLM agents from deleting tests during implementation.
**Implementation:** `docs/TDD-WORKFLOW.md`, `.claude/skills/tdd-workflow/SKILL.md`, `.claude/commands/*-tdd.md`
**Status:** ✅ PROCESSED (Sprint 2)
```

**Compression rules:**

- **Title:** Keep unchanged
- **Discovered in:** Simplify to "Sprint X" (remove detailed context)
- **Solution:** Extract core solution in 1-2 sentences (from "What we learned" + "Solution" sections)
- **Implementation:** List only key file paths (not descriptions):
  - Include docs/ files if referenced
  - Include .claude/skills/ if referenced (can use wildcards like `*-tdd.md`)
  - Include .claude/commands/ if referenced
  - Include key scripts/ if referenced
  - Omit "N/A" entries
  - Use comma-separated list in backticks
- **Status:** Keep ✅ PROCESSED, add sprint number in parentheses

**What to compress:**

- ✅ PROCESSED lessons from Sprint 1, 2, 3... up to Sprint (N-1)

**What NOT to compress:**

- ❌ Current Sprint N lessons (not yet added, will be added in 4.2)
- ❌ ⚠️ PARTIAL lessons (still have action items)
- ❌ ❌ TODO lessons (not yet implemented)

**Implementation example:**

```markdown
# For each lesson in each category:

if lesson.status == "✅ PROCESSED" and lesson.sprint < current_sprint_N: # Compress to concise format
compressed = f"""

### Lesson: {lesson.title}

**Discovered in:** Sprint {lesson.sprint}
**Solution:** {extract_core_solution(lesson)}
**Implementation:** {extract_key_files(lesson)}
**Status:** ✅ PROCESSED (Sprint {lesson.sprint})
"""
replace(full_lesson, compressed)
```

**Verify compression:**

- ✅ All PROCESSED lessons from previous sprints compressed
- ✅ Current sprint's new lessons preserved (added in 4.2)
- ✅ PARTIAL/TODO lessons preserved in full detail
- ✅ No information loss (essence captured)
- ✅ Document significantly shorter and more readable

**Benefits:**

- Document stays manageable as project grows (20 sprints = hundreds of lessons)
- Essential information preserved (what, solution, where)
- Recent sprint's lessons remain detailed for context
- Older lessons still searchable and traceable

---

### 4.1 Document Structure

**If file doesn't exist, create with header:**

```markdown
# Lessons Learned (Living Document)

Last updated: [YYYY-MM-DD] (Sprint [N] closure)

---

## How This Document Works

This is a **living document** that grows with each sprint. It captures:

- **WHAT** we learned from each sprint
- **WHERE** each lesson was implemented (code/tests/docs/skills/commands)
- **STATUS** of implementation (PROCESSED = fully implemented, no action needed)
- **TRACEABILITY** back to the sprint where discovered

### Status Legend

- ✅ **PROCESSED** - Fully implemented and documented. No further action needed.
- ⚠️ **PARTIAL** - Partially implemented. Ongoing work or deferred items.
- ❌ **TODO** - Identified but not yet implemented. Tracked for future sprints.

### How to Use This Document

1. **Before starting new features:** Review relevant categories for patterns and anti-patterns
2. **During code reviews:** Reference lessons for context on why we follow certain patterns
3. **Sprint planning:** Check TODO items for technical debt to address
4. **Onboarding:** Use as learning resource for new team members

---
```

**If file exists, update "Last updated" header only.**

### 4.2 Extract and Add Lessons

**Important:** Previous sprints' PROCESSED lessons have been compressed in step 4.0. Now add Sprint [N]'s NEW lessons in FULL detail.

**For Sprint [N], add lessons to appropriate categories:**

**Category: TDD Workflow**

Example lessons to extract from Sprint 2:

```markdown
### Lesson: Test Immutability Prevents Test Cheating

**Discovered in:** Sprint 2 (Backend development, day-02)
**What we learned:**
LLM agents may delete tests instead of fixing code when tests fail. Solution: Commit tests separately in RED phase makes them immutable. Any modification during GREEN/REFACTOR is visible in git history.

**Implementation:**

- ✅ **Code:** N/A (process change, not code implementation)
- ✅ **Tests:** All tests committed separately in RED phase commits (enforced by workflow)
- ✅ **Docs:** `docs/TDD-WORKFLOW.md` (5 quality criteria documented, RED/GREEN/REFACTOR phases)
- ✅ **Skills:** `.claude/skills/tdd-workflow/SKILL.md` (complete TDD patterns and anti-patterns)
- ✅ **Commands:** `.claude/commands/red-tdd.md`, `.claude/commands/green-tdd.md`, `.claude/commands/refactor-tdd.md`, `.claude/commands/security-tdd.md` (phased commands enforce separation)
- ✅ **Scripts:** `./scripts/test-watch.sh` (watch mode automation for RED phase)
- ✅ **CLAUDE.md:** Root `CLAUDE.md` section "Testing & TDD" (comprehensive quick reference)

**Status:** ✅ PROCESSED
**Sprint:** 2

---

### Lesson: 5 TDD Quality Criteria Prevent Test Theater

**Discovered in:** Sprint 2 (QA reports analysis)
**What we learned:**
Tests that only check existence (`toBeDefined()`) or structure (`toBeInstanceOf()`) are "test theater" - they pass without testing actual behavior. 5 criteria prevent this: (1) Test business logic, (2) Meaningful assertions, (3) Error paths, (4) Edge cases, (5) Behavior not implementation.

**Implementation:**

- ✅ **Code:** Test helper utilities in `app/src/test/helpers/` (assertion builders)
- ✅ **Tests:** 560+ tests following criteria (100+ backend, 80+ overview, 60+ detail, rest integration)
- ✅ **Docs:** `docs/TDD-WORKFLOW.md` (5 criteria detailed with examples)
- ✅ **Skills:** `.claude/skills/tdd-workflow/SKILL.md` (criteria checklist)
- ✅ **Commands:** `.claude/commands/red-tdd.md` (includes quality validation)
- ✅ **Agents:** `.claude/agents/test-quality-auditor/` (automated criteria checking)
- ✅ **CLAUDE.md:** "Testing & TDD" section (quick reference table)

**Status:** ✅ PROCESSED
**Sprint:** 2
```

**Category: Multi-Worktree Coordination**

Extract lessons about database isolation, schema ownership, port mapping, etc.

**Category: Security Patterns**

Extract lessons about backend-driven permissions, OWASP compliance, input validation, etc.

**Category: Architecture Patterns**

Extract lessons about Strategy Pattern, type safety, permission helpers, etc.

**Category: Test Quality**

Extract lessons about mock patterns, integration vs unit, coverage thresholds, etc.

**Category: Tooling Improvements**

Extract lessons about React 19 fix, safe-start script, db-manager, etc.

**Category: Process Improvements**

Extract lessons about phased TDD commands, artifact tracking, sprintdag structure, etc.

**Category: Time Estimation**

Extract lessons about 800% overrun, learning curve buffer, realistic estimates, etc.

**Category: Import Rules & Common Errors**

Extract lessons about wasp/ vs @wasp/, enum imports, restart requirements, etc.

**Category: Anti-Patterns**

Extract lessons about client-side auth, useAction overuse, test theater, etc.

### 4.3 Update Guidelines

**For each lesson:**

1. **Check if similar lesson exists** - If yes, update with Sprint N reference instead of duplicating
2. **Use consistent naming** - Clear, descriptive lesson titles
3. **Be specific in Implementation** - Exact file paths, not vague references
4. **Mark status accurately:**
   - ✅ PROCESSED = Fully implemented, no more work needed
   - ⚠️ PARTIAL = Some work done, more needed (specify what's missing)
   - ❌ TODO = Identified, not implemented (add to next sprint backlog)
5. **Add sprint reference** - Enable traceability back to discovery context

**Validation:**

- Every lesson has all required fields
- Every PROCESSED lesson has concrete file paths
- Every TODO lesson has action item or backlog reference
- Categories are logical and consistent

---

## Phase 5: Archive Sprint Artifacts

**Execute archiving operations:**

### 5.1 Create Archive Directory

```bash
# Determine archive month (follow existing pattern)
# Sprint 1 in 2025-10, Sprint 2 in 2025-11, etc.
ARCHIVE_MONTH="2025-11"  # Adjust based on sprint

# Create archive directory
mkdir -p tasks/archive/${ARCHIVE_MONTH}/sprint-[N]/
```

### 5.2 Move Sprint Artifacts

```bash
# Move entire sprint directory to archive
# This preserves all worktree subdirectories and TDD artifacts
mv tasks/sprints/sprint-[N]/* tasks/archive/${ARCHIVE_MONTH}/sprint-[N]/

# Verify move was successful
ls -la tasks/archive/${ARCHIVE_MONTH}/sprint-[N]/

# Remove empty sprint directory
rmdir tasks/sprints/sprint-[N]/
```

### 5.3 Copy Retrospective to Archive

**Move retrospective from temp location to archive:**

```bash
mv RETROSPECTIVE-[date].md tasks/archive/${ARCHIVE_MONTH}/sprint-[N]/
```

### 5.4 Update Archive Index

**Create or update:** `tasks/archive/ARCHIVE-INDEX.md`

**Append entry:**

```markdown
## Sprint [N] - [Sprint Name]

**Period:** [Start date] to [End date]
**Duration:** [X] weeks ([Y] days)
**Location:** `tasks/archive/[YYYY-MM]/sprint-[N]/`

**Features completed:** [X]/[Y] ([percentage]%)
**Test coverage:** [average]%
**Security score:** [before]/100 → [after]/100

**Key deliverables:**

- [Deliverable 1]
- [Deliverable 2]
- [Deliverable 3]

**Key lessons learned:** [count] lessons added to `docs/LESSONS-LEARNED.md`

**Reports consolidated:**

- QA: [count] reports → `reports/qa/QA-SUMMARY-SPRINT-[N]-[date].md`
- Security: [count] audits → `reports/security-audit/SECURITY-SUMMARY-SPRINT-[N]-[date].md`
- [Other report types if exist]

**References:**

- Retrospective: `tasks/archive/[YYYY-MM]/sprint-[N]/RETROSPECTIVE-[date].md`
- Lessons Learned: `docs/LESSONS-LEARNED.md` (Sprint [N] entries)
- PR Closure: #[PR-number]

---
```

### 5.5 Cleanup Temporary Files

```bash
# Remove sprint-related .tmp/ files
rm .tmp/*sprint-[N]* 2>/dev/null

# Remove old temporary files (older than 7 days)
find .tmp/ -type f -mtime +7 -delete 2>/dev/null

# Report cleanup results
echo "Cleaned up [count] temporary files"
```

**Verify archiving:**

- All artifacts moved successfully
- No data loss
- Archive directory structure intact
- Original sprint directory removed

---

## Phase 6: Git Commit & Create PR

### 6.1 Create Feature Branch

```bash
# Create branch for sprint closure
git checkout -b docs/close-sprint-[N]

# Verify we're on the new branch
git branch --show-current
```

### 6.2 Stage Changes

```bash
# Stage archive directory (new location)
git add tasks/archive/[YYYY-MM]/sprint-[N]/

# Stage archive index
git add tasks/archive/ARCHIVE-INDEX.md

# Stage living lessons learned document
git add docs/LESSONS-LEARNED.md

# Stage all report summaries generated
git add reports/qa/QA-SUMMARY-SPRINT-[N]-[date].md
git add reports/security-audit/SECURITY-SUMMARY-SPRINT-[N]-[date].md
# Add conditional summaries if generated
git add reports/pr-reviews/PR-REVIEW-SUMMARY-SPRINT-[N]-[date].md 2>/dev/null
git add reports/test-quality/TEST-QUALITY-SUMMARY-SPRINT-[N]-[date].md 2>/dev/null
git add reports/research/RESEARCH-SUMMARY-SPRINT-[N]-[date].md 2>/dev/null
git add reports/architecture/ARCHITECTURE-SUMMARY-SPRINT-[N]-[date].md 2>/dev/null

# Remove old sprint directory (now archived)
git rm -r tasks/sprints/sprint-[N]/

# Cleanup: remove temporary files
git add .tmp/  # If any cleanup was done
```

### 6.3 Commit Changes

```bash
git commit -m "docs(sprint): archive sprint [N] and capture lessons learned

Sprint [N] Retrospective:
- Features: [X]/[Y] completed ([percentage]%)
- Test coverage: [average]% average (Target: 80%/75%)
- Security: [Z] CRITICAL resolved, [A] outstanding
- Velocity: [actual] vs [planned] ([percentage]%)

Lessons Learned Added:
- TDD workflow improvements ([count] lessons)
- Multi-worktree coordination patterns ([count] lessons)
- Security audit integration ([count] lessons)
- Architecture patterns ([count] lessons)
- [Other categories with counts]

Total: +[N] lessons added to docs/LESSONS-LEARNED.md

Reports Consolidated:
- QA: [count] reports → QA-SUMMARY-SPRINT-[N].md
- Security: [count] audits → SECURITY-SUMMARY-SPRINT-[N].md
[- Other report types if consolidated]

Artifacts Archived:
- Location: tasks/archive/[YYYY-MM]/sprint-[N]/
- TDD artifacts preserved (tests/, implementation/, refactor/, security/)
- Cleanup: [count] .tmp/ files removed

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
"
```

### 6.4 Push Branch

```bash
# Push branch to remote
git push -u origin docs/close-sprint-[N]
```

### 6.5 Create Pull Request

```bash
gh pr create --base develop --title "Sprint [N] Closure: Archive & Lessons Learned" --body "$(cat <<'EOF'
# Sprint [N] Closure

## Summary

Sprint [N] closure with comprehensive knowledge capture, report consolidation, and archival. All lessons learned documented with implementation tracking for future reference.

---

## Changes

### 📚 Knowledge Captured

**Lessons Learned:** `docs/LESSONS-LEARNED.md` (**living document**)
- **Previous sprints:** PROCESSED lessons compressed to concise format (keeps document manageable)
- **Sprint [N]:** +[N] new lessons added in full detail across [M] categories
- Each new lesson includes:
  - ✅ WHERE implemented (specific file paths)
  - ✅ HOW implemented (code/tests/docs/skills/commands/scripts)
  - ✅ STATUS (PROCESSED/PARTIAL/TODO)
  - ✅ SPRINT reference (traceability)

**Categories updated:**
- TDD Workflow ([count] lessons)
- Multi-Worktree Coordination ([count] lessons)
- Security Patterns ([count] lessons)
- Architecture Patterns ([count] lessons)
- Test Quality ([count] lessons)
- Tooling Improvements ([count] lessons)
- Process Improvements ([count] lessons)
- Time Estimation ([count] lessons)
- Import Rules & Common Errors ([count] lessons)
- Anti-Patterns ([count] lessons)

**Sprint Retrospective:** `tasks/archive/[YYYY-MM]/sprint-[N]/RETROSPECTIVE-[date].md`
- Sprint metrics and velocity
- What went well / didn't go well
- Action items for Sprint [N+1]

---

### 📊 Sprint Metrics

**Development:**
- **Features completed:** [X]/[Y] ([percentage]%)
- **Test coverage:** [average]% average
- **Lines of code:** +[added] / -[removed]
- **Commits:** [count]
- **PRs merged:** [count]

**Quality:**
- **Test quality:** [5 TDD criteria compliance]
- **Code reviews:** [count] reviews
- **Refactoring cycles:** [count] REFACTOR phases
- **Security score:** [before]/100 → [after]/100 (+[delta])

**Security:**
- **CRITICAL issues:** [count] (all resolved/deferred)
- **HIGH issues:** [count] ([resolved]/[total])
- **MEDIUM issues:** [count] ([resolved]/[total])
- **OWASP compliance:** [percentage]%

**Velocity:**
- **Story points:** [actual]/[planned] ([percentage]%)
- **Sprint duration:** [planned] vs [actual] ([percentage]% overrun/underrun)

---

### 📦 Reports Consolidated

**QA Reports:** [count] reports → `reports/qa/QA-SUMMARY-SPRINT-[N]-[date].md`
- Test strategy issues identified and addressed
- Test quality defects (5 TDD criteria violations)
- Infrastructure improvements made
- Anti-patterns documented

**Security Audits:** [count] audits → `reports/security-audit/SECURITY-SUMMARY-SPRINT-[N]-[date].md`
- Findings by severity (CRITICAL/HIGH/MEDIUM/LOW)
- OWASP Top 10 compliance matrix
- Deferred items tracking
- Remediation patterns applied

[**If other report types exist, list them:**]
**PR Reviews:** [count] reviews → `reports/pr-reviews/PR-REVIEW-SUMMARY-SPRINT-[N]-[date].md`
**Test Quality:** [count] reports → `reports/test-quality/TEST-QUALITY-SUMMARY-SPRINT-[N]-[date].md`
**Research:** [count] reports → `reports/research/RESEARCH-SUMMARY-SPRINT-[N]-[date].md`
**Architecture:** [count] ADRs → `reports/architecture/ARCHITECTURE-SUMMARY-SPRINT-[N]-[date].md`

---

### 📁 Archived

**Location:** `tasks/archive/[YYYY-MM]/sprint-[N]/`

**Contents:**
- ✅ All worktree subdirectories (dev1/, dev2/, dev3/, etc.)
- ✅ All TDD artifacts preserved:
  - `tests/` - RED phase artifacts (test plans, coverage targets)
  - `implementation/` - GREEN phase artifacts (implementation notes, actual coverage)
  - `refactor/` - REFACTOR phase artifacts (refactor reports, metrics)
  - `security/` - Security phase artifacts (security audits, OWASP compliance)
- ✅ Sprint retrospective
- ✅ Planning documents (if existed)

**Cleanup:**
- ✅ [count] temporary files removed from `.tmp/`
- ✅ Original sprint directory removed from `tasks/sprints/`

---

### 💡 Key Lessons Learned

**Top 5 lessons from Sprint [N]:**

1. **[Category]:** [Brief lesson summary]
   - Status: ✅ PROCESSED
   - Implementation: [brief description of where/how]

2. **[Category]:** [Brief lesson summary]
   - Status: ✅ PROCESSED
   - Implementation: [brief description]

3. **[Category]:** [Brief lesson summary]
   - Status: ⚠️ PARTIAL
   - Implementation: [what's done, what's pending]

4. **[Category]:** [Brief lesson summary]
   - Status: ✅ PROCESSED
   - Implementation: [brief description]

5. **[Category]:** [Brief lesson summary]
   - Status: ❌ TODO
   - Tracked for: Sprint [N+1]

**See `docs/LESSONS-LEARNED.md` for complete implementation details.**

---

## Review Checklist

Please verify:

### Knowledge Capture
- [ ] Previous sprints' PROCESSED lessons compressed to concise format
- [ ] New Sprint [N] lessons added with complete implementation tracking
- [ ] Each new lesson has all required fields (WHERE/HOW/STATUS/SPRINT)
- [ ] Status marks are accurate (PROCESSED/PARTIAL/TODO)
- [ ] Sprint references added for traceability
- [ ] No duplicate lessons created
- [ ] Document remains readable and manageable

### Reports
- [ ] All report summaries are comprehensive
- [ ] Key findings from all reports captured
- [ ] Patterns and anti-patterns documented
- [ ] No important context lost in consolidation

### Archival
- [ ] All sprint artifacts archived properly
- [ ] TDD artifacts preserved (tests/, implementation/, refactor/, security/)
- [ ] Retrospective captures sprint accurately
- [ ] Archive structure is clean and organized

### Process
- [ ] Temporary files cleaned up
- [ ] Archive index updated
- [ ] No broken references or links
- [ ] Ready for next sprint planning

---

## References

**Documentation:**
- **Lessons Learned:** `docs/LESSONS-LEARNED.md` (Sprint [N] entries marked)
- **Retrospective:** `tasks/archive/[YYYY-MM]/sprint-[N]/RETROSPECTIVE-[date].md`
- **Archive index:** `tasks/archive/ARCHIVE-INDEX.md`

**Report Summaries:**
- **QA:** `reports/qa/QA-SUMMARY-SPRINT-[N]-[date].md`
- **Security:** `reports/security-audit/SECURITY-SUMMARY-SPRINT-[N]-[date].md`
[- **Other summaries if generated**]

**Artifacts:**
- **Archive location:** `tasks/archive/[YYYY-MM]/sprint-[N]/`

---

## Next Steps After Merge

1. ✅ Sprint [N] officially closed
2. Review retrospective action items with team
3. Plan Sprint [N+1] goals based on lessons learned
4. Create Sprint [N+1] directory: `mkdir tasks/sprints/sprint-[N+1]/`
5. Update roadmap if needed based on velocity

---

🤖 Generated with [Claude Code](https://claude.com/claude-code) `/close-sprint` command

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**Verify PR creation:**

```bash
# View PR in terminal
gh pr view

# Check PR status
gh pr checks

# Get PR URL
gh pr view --web
```

---

## Phase 7: Summary & Next Steps

**Display comprehensive summary:**

```
🎉 SPRINT [N] CLOSURE PR CREATED!

═══════════════════════════════════════════════════════════════

📚 KNOWLEDGE CAPTURED

   Lessons Learned (LIVING DOCUMENT):
   ✅ docs/LESSONS-LEARNED.md updated
   ✅ Previous sprints' PROCESSED lessons compressed (concise format)
   ✅ +[N] lessons added for Sprint [N] (full detail)
   ✅ Every new lesson has complete implementation tracking:
      - WHERE: Specific file paths
      - HOW: Implementation description
      - STATUS: PROCESSED/PARTIAL/TODO
      - SPRINT: Traceability reference
   ✅ Document remains manageable as project grows

   Sprint Retrospective:
   ✅ tasks/archive/[YYYY-MM]/sprint-[N]/RETROSPECTIVE-[date].md
   ✅ Sprint metrics and velocity
   ✅ What went well / didn't go well
   ✅ Action items for Sprint [N+1]

───────────────────────────────────────────────────────────────

📊 REPORTS CONSOLIDATED

   ✅ QA Summary: reports/qa/QA-SUMMARY-SPRINT-[N]-[date].md
      - [count] reports analyzed
      - Test strategy issues documented
      - Anti-patterns identified

   ✅ Security Summary: reports/security-audit/SECURITY-SUMMARY-SPRINT-[N]-[date].md
      - [count] audits analyzed
      - OWASP Top 10 compliance matrix
      - Security score: [before]/100 → [after]/100

   [If other summaries generated, list them]

───────────────────────────────────────────────────────────────

📦 ARCHIVED

   ✅ Sprint artifacts: tasks/archive/[YYYY-MM]/sprint-[N]/
   ✅ All worktree subdirectories preserved
   ✅ TDD artifacts intact (tests/, implementation/, refactor/, security/)
   ✅ Original sprint directory removed
   ✅ Cleanup: [count] .tmp/ files removed

───────────────────────────────────────────────────────────────

🔀 PULL REQUEST CREATED

   📝 PR #[number]: Sprint [N] Closure: Archive & Lessons Learned
   🔗 URL: [PR URL]
   📌 Branch: docs/close-sprint-[N] → develop
   👥 Ready for team review

   Review items:
   - Knowledge capture completeness
   - Report consolidation quality
   - Archival correctness
   - No broken references

───────────────────────────────────────────────────────────────

📊 SPRINT [N] METRICS

   Development:
   • Features: [X]/[Y] completed ([percentage]%)
   • Test coverage: [average]% average (Target: 80%/75%)
   • Commits: [count]
   • PRs merged: [count]

   Quality:
   • Test quality: [5 TDD criteria compliance]
   • Security score: [before]/100 → [after]/100 (+[delta])
   • OWASP compliance: [percentage]%

   Velocity:
   • Story points: [actual]/[planned] ([percentage]%)
   • Duration: [planned] vs [actual] days

───────────────────────────────────────────────────────────────

💡 NEXT STEPS

   1. 👥 Share PR with team for review:
      gh pr view [number] --web

   2. ✅ Team reviews sprint closure:
      - Verify lessons learned accuracy
      - Check report consolidation
      - Validate archival completeness

   3. 🔀 Merge PR to develop:
      gh pr merge [number] --squash

   4. 📋 Sprint [N+1] planning:
      - Review retrospective action items
      - Plan next sprint goals based on lessons learned
      - Create sprint directory: mkdir tasks/sprints/sprint-[N+1]/

   5. 🚀 Update roadmap if needed based on velocity

───────────────────────────────────────────────────────────────

🔗 QUICK REFERENCES

   View PR:           gh pr view [number]
   Check CI:          gh pr checks [number]
   Open in browser:   gh pr view [number] --web
   Review checklist:  gh pr view [number] --comments

   Lessons Learned:   docs/LESSONS-LEARNED.md
   Retrospective:     tasks/archive/[YYYY-MM]/sprint-[N]/RETROSPECTIVE-[date].md
   Archive:           tasks/archive/[YYYY-MM]/sprint-[N]/

═══════════════════════════════════════════════════════════════

✨ Sprint [N] closure complete! PR ready for team review.
```

---

## Exit Criteria

This command completes successfully when:

1. ✅ **Living Lessons Learned updated** - `docs/LESSONS-LEARNED.md` has:
   - Previous sprints' PROCESSED lessons compressed to concise format (4.0)
   - New Sprint [N] lessons added with complete implementation tracking (4.2)
   - Document remains manageable and readable as project grows
2. ✅ **Sprint retrospective generated** - Comprehensive metrics and analysis in archive
3. ✅ **ALL report types consolidated** - Summaries for QA, Security, and any other report types found
4. ✅ **Sprint artifacts archived** - Complete preservation in `tasks/archive/YYYY-MM/sprint-X/`
5. ✅ **Temporary files cleaned** - `.tmp/` cleanup completed
6. ✅ **Changes committed** - Git commit with conventional message
7. ✅ **PR created** - Pull request ready for team review on develop branch

---

## Artifacts Created

After successful completion:

### Archive Directory

```
tasks/archive/[YYYY-MM]/sprint-[N]/
├── dev1/                              # Worktree 1 artifacts
│   ├── README.md
│   ├── tests/
│   ├── implementation/
│   ├── refactor/
│   └── security/
├── dev2/                              # Worktree 2 artifacts
├── dev3/                              # Worktree 3 artifacts
├── RETROSPECTIVE-[YYYY-MM-DD].md     # Sprint-specific retrospective
└── [any other sprint planning docs]
```

### Report Summaries

```
reports/
├── qa/
│   └── QA-SUMMARY-SPRINT-[N]-[date].md
├── security-audit/
│   └── SECURITY-SUMMARY-SPRINT-[N]-[date].md
├── pr-reviews/                        # If reports exist
│   └── PR-REVIEW-SUMMARY-SPRINT-[N]-[date].md
├── test-quality/                      # If reports exist
│   └── TEST-QUALITY-SUMMARY-SPRINT-[N]-[date].md
├── research/                          # If reports exist
│   └── RESEARCH-SUMMARY-SPRINT-[N]-[date].md
└── architecture/                      # If reports exist
    └── ARCHITECTURE-SUMMARY-SPRINT-[N]-[date].md
```

### Living Documentation

```
docs/
└── LESSONS-LEARNED.md                 # Updated with Sprint [N] lessons
```

### Archive Index

```
tasks/archive/
└── ARCHIVE-INDEX.md                   # Updated with Sprint [N] entry
```

---

## Agent Assignment

| Phase | Task                       | Model  | Agent              | Reason                                            |
| ----- | -------------------------- | ------ | ------------------ | ------------------------------------------------- |
| **0** | Prerequisites validation   | N/A    | Direct             | Simple checks                                     |
| **1** | Sprint completion analysis | Haiku  | Explore (built-in) | Fast file gathering, report discovery             |
| **2** | Knowledge capture strategy | Sonnet | Plan (built-in)    | Strategic synthesis, lesson extraction planning   |
| **3** | Report generation          | Sonnet | Direct             | Creative writing, context-aware synthesis         |
| **4** | Lessons Learned update     | Sonnet | Direct             | Contextual understanding, implementation tracking |
| **5** | Archiving operations       | N/A    | Direct             | File operations (mv, mkdir, rm)                   |
| **6** | Git commit & PR            | N/A    | Direct             | Git operations (commit, push, gh pr)              |
| **7** | Summary display            | N/A    | Direct             | Text formatting and display                       |

**Total estimated cost per execution:** ~$0.04 USD

- Explore (Haiku): $0.003
- Plan (Sonnet): $0.015
- Report generation (Sonnet): $0.015
- Lessons Learned update (Sonnet): $0.007

**Very affordable for comprehensive sprint closure automation!**

---

## Error Handling

### Error 1: Incomplete Sprint (PRs Not Merged)

**Detection:**

```bash
gh pr list --state open --base develop --json number,title,headRefName
# If sprint-related PRs still open
```

**Error message:**

```
❌ INCOMPLETE SPRINT DETECTED

Outstanding PRs that may block closure:
- PR #[number]: [title] ([branch])
  Status: [status]
  Reason: [why blocking]

Options:
1. Wait for PR completion and try again
2. Document as deferred feature in retrospective
3. Cancel sprint closure (fix issues first)

Enter choice [1/2/3]:
```

**Resolution:**

- Option 1: Exit command, wait for merge, re-run
- Option 2: Continue with deferred items documented
- Option 3: Cancel, exit gracefully

### Error 2: Archive Already Exists

**Detection:**

```bash
if [ -d "tasks/archive/[YYYY-MM]/sprint-[N]" ]; then
```

**Error message:**

```
❌ ARCHIVE ALREADY EXISTS

Location: tasks/archive/[YYYY-MM]/sprint-[N]/

This sprint may have already been closed.

Options:
1. Append timestamp to avoid conflict (sprint-[N]-[timestamp]/)
2. Review existing archive and cancel
3. DANGER: Overwrite existing archive (requires --force flag)

Enter choice [1/2/3]:
```

**Resolution:**

- Option 1: Create with timestamp suffix
- Option 2: Exit, let user review manually
- Option 3: Only allow with explicit `--force` flag

### Error 3: No Reports Found

**Detection:**
During exploration, no reports found for sprint period

**Warning message:**

```
⚠️ NO REPORTS FOUND

No QA or Security reports found for Sprint [N].

Expected locations:
- reports/qa/*sprint-[N]* or *[date-range]*
- reports/security-audit/*sprint-[N]* or *[date-range]*

Options:
1. Continue without report consolidation
2. Specify date range manually
3. Cancel and generate reports first

Enter choice [1/2/3]:
```

### Error 4: Git Conflicts

**Detection:**

```bash
git status --porcelain
# If uncommitted changes exist
```

**Error message:**

```
❌ UNCOMMITTED CHANGES DETECTED

You have uncommitted changes in:
[list of files]

Sprint closure requires a clean working directory.

Options:
1. Stash changes and continue (git stash)
2. Commit changes first (manual)
3. Cancel sprint closure

Enter choice [1/2/3]:
```

### Error 5: PR Creation Failed

**Detection:**
`gh pr create` returns non-zero exit code

**Error message:**

```
❌ PR CREATION FAILED

Error: [error message from gh]

Changes have been committed to branch: docs/close-sprint-[N]

Options:
1. Retry PR creation
2. Create PR manually: gh pr create --base develop
3. Push branch for later: Already pushed

Manual PR creation command:
gh pr create --base develop --title "Sprint [N] Closure" --web
```

### Error 6: Lessons Learned Merge Conflict

**Detection:**
Duplicate lesson titles or category conflicts

**Warning message:**

```
⚠️ POTENTIAL DUPLICATE LESSON

Lesson "[title]" may already exist in docs/LESSONS-LEARNED.md

Options:
1. Update existing lesson (add Sprint [N] reference)
2. Rename new lesson to be more specific
3. Skip this lesson (don't add)
4. View existing lesson before deciding

Enter choice [1/2/3/4]:
```

---

## When to Use This Command

### ✅ Use `/close-sprint` for:

1. **End of sprint cycle** - All planned work completed (or documented as deferred)
2. **Before sprint retrospective meeting** - Generate metrics and data for discussion
3. **After all PRs merged** - Code changes integrated to develop branch
4. **Knowledge preservation** - Capture lessons learned while context is fresh
5. **Team visibility** - Create PR for team to review sprint outcomes

### ❌ DON'T use for:

1. **Mid-sprint archiving** - Use manual `mv` commands instead
2. **Single feature completion** - Not sprint-wide closure
3. **Incomplete sprint** - Wait until PRs merged or features deferred
4. **Emergency rollback** - Use `git revert` instead
5. **Experimental sprints** - May not have reports to consolidate

### 🤔 Consider using if:

1. **Some features incomplete** - Use `--allow-incomplete` flag and document deferrals
2. **Reports not yet consolidated** - Command can work without reports (with warning)
3. **Sprint extended** - Close when actually complete, not on calendar date

---

## Integration with Other Commands

### Preceded by:

These commands should complete before running `/close-sprint`:

1. **`/security-tdd`** - Security audits completed for all features
2. **`/refactor-tdd`** - Code quality finalized for all features
3. **`/review-pr`** - All PRs reviewed and merged to develop
4. **Sprint retrospective meeting** (manual) - Team discussion before closure

### Followed by:

After `/close-sprint` PR is merged:

1. **Sprint [N+1] planning** (manual) - Team planning session
2. **`/initiate`** - Create PRDs for Sprint [N+1] features
3. **`/specify`** - Create technical specs for Sprint [N+1] features
4. **`/plan`** - Create implementation plans for Sprint [N+1] features
5. **`/breakdown`** - Create daily task files for Sprint [N+1]

### Workflow Integration:

```
Sprint [N] Development
  ↓
All features complete (or deferred)
  ↓
All PRs merged to develop
  ↓
/close-sprint [N] ← **THIS COMMAND**
  ↓
PR created for team review
  ↓
Team reviews sprint closure
  ↓
PR merged to develop
  ↓
Sprint [N] officially closed
  ↓
Sprint [N+1] planning begins
```

---

## References

### Documentation

- **Task management:** `tasks/CLAUDE.md` (sprint workflow, archive structure)
- **TDD workflow:** `docs/TDD-WORKFLOW.md` (test quality criteria)
- **Planning workflow:** `docs/PLANNING-WORKFLOW.md` (process integration)
- **Multi-worktree:** `docs/MULTI-WORKTREE-DEVELOPMENT.md` (coordination patterns)

### Templates

- **Retrospective:** `tasks/templates/retrospective.md` (sprint retrospective template)

### Related Commands

- **`/review-pr`** - PR review (should precede sprint closure)
- **`/security-tdd`** - Security audits (generates reports for consolidation)
- **`/refactor-tdd`** - Refactoring (generates reports for consolidation)
- **`/initiate`** - Next sprint feature initiation
- **`/breakdown`** - Next sprint task breakdown

### Skills Used

- **`tdd-workflow`** - TDD lessons extraction
- **`troubleshooting-guide`** - Error handling lessons
- **`wasp-operations`** - Architecture lessons
- **`permissions`** - Security lessons
- **`code-quality`** - Quality lessons

---

## Notes

**This is a critical command for knowledge management!**

The `/close-sprint` command ensures that every sprint's learnings are:

1. **Captured** - Extracted from all reports and artifacts
2. **Documented** - Added to living documentation with implementation tracking
3. **Traceable** - Linked back to sprint and specific implementations
4. **Reviewable** - Team validates through PR review
5. **Preserved** - Archived for future reference

**Key principle:** Every lesson must show WHERE and HOW it was implemented, with status tracking. This prevents lessons from being "noted but forgotten."

**Living Document Philosophy:**
`docs/LESSONS-LEARNED.md` is NOT sprint-specific. It's a growing knowledge base that accumulates lessons across ALL sprints. Each lesson is marked with the sprint where discovered, but the document itself lives on and grows with every sprint closure.

---

**Version:** 1.0
**Created:** 2025-11-07
**Command:** `/close-sprint`
**Author:** TechLead
