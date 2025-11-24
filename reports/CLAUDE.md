# Project Reports

**AUTO-LOADED**: This file is automatically loaded by Claude Code when working with reports in the `reports/` directory.

---

## Purpose

This directory contains **all project reports** including quality assurance, security audits, performance analyses, and other documentation generated during development.

---

## Directory Structure

```
reports/
├── CLAUDE.md                    # This file (general report guidelines)
├── qa/                          # Quality Assurance & TDD validation reports
│   ├── YYYY-MM-DD-qa-*.md      # QA reports
│   └── ...
├── security-audit/              # Security audit reports (OWASP, compliance)
│   ├── CLAUDE.md               # Security-specific guidelines
│   ├── YYYY-MM-DD-security-*.md
│   └── ...
└── [future categories]/         # Performance, architecture reviews, etc.
```

---

## Report Categories & Naming Conventions

### 1. Quality Assurance (QA) Reports

**Directory:** `reports/qa/`

**Naming Convention:**

```
YYYY-MM-DD-qa-<scope>.md
```

**Examples:**

- `2025-10-23-qa-sprint-2-backend-day-2-test-validation.md`
- `2025-11-15-qa-tdd-integrity-review.md`
- `2025-12-01-qa-pre-production-test-coverage.md`

**When to Create:**

- After completing TDD RED-GREEN-REFACTOR cycle
- When verifying test integrity (no test cheating)
- Before major releases (coverage verification)
- When debugging test failures
- Post-mortem analysis after finding test issues

**Key Sections:**

- Executive Summary (TDD integrity status)
- Test Coverage Metrics (unit/integration/E2E)
- Test Change Analysis (git diff verification)
- Quality Verification (5 TDD criteria)
- Recommendations

---

### 2. Security Audit Reports

**Directory:** `reports/security-audit/`

**Naming Convention:**

```
YYYY-MM-DD-security-audit-<scope>.md
```

**Examples:**

- `2025-10-23-security-audit-phase4-complete.md`
- `2025-11-15-security-audit-payment-module.md`
- `2025-12-01-security-audit-pre-production.md`

**When to Create:**

- Phase 4 of TDD workflow (after REFACTOR, before PR)
- Pre-production deployment
- After security incidents
- Quarterly security reviews
- After major dependency updates

**Key Sections:**

- Executive Summary (findings count, severity breakdown)
- OWASP Top 10 mapping
- Critical/High/Medium/Low findings
- Remediation priority
- Standards compliance matrix

**See:** `reports/security-audit/CLAUDE.md` for detailed security report guidelines

---

### 3. Performance Reports (Future)

**Directory:** `reports/performance/` (create when needed)

**Naming Convention:**

```
YYYY-MM-DD-performance-<scope>.md
```

**Examples:**

- `2025-12-15-performance-database-query-optimization.md`
- `2026-01-20-performance-load-testing-results.md`

**When to Create:**

- After performance optimizations
- Load testing results
- Database query analysis
- Frontend bundle size analysis

---

### 4. Architecture Reviews (Future)

**Directory:** `reports/architecture/` (create when needed)

**Naming Convention:**

```
YYYY-MM-DD-architecture-<scope>.md
```

**Examples:**

- `2026-02-01-architecture-decision-record-multi-tenant.md`
- `2026-03-15-architecture-review-microservices-migration.md`

**When to Create:**

- Major architectural decisions (ADRs)
- Architecture review sessions
- Refactoring proposals
- Technology migration plans

---

## Universal Naming Convention

**All reports follow this pattern:**

```
YYYY-MM-DD-<category>-<scope>.md
```

**Components:**

- `YYYY-MM-DD` - ISO date (when report was generated)
- `<category>` - Report type: `qa`, `security-audit`, `performance`, `architecture`
- `<scope>` - Brief description (kebab-case, no spaces)

**Benefits:**

- ✅ Chronological sorting (newest first when sorted desc)
- ✅ Clear categorization
- ✅ Searchable by date or scope
- ✅ Prevents naming conflicts

---

## Common Report Standards

### Metadata Section (Required for All Reports)

```markdown
# <Report Type>: <Title>

**Report Type:** <Category> - <Sub-type>
**Date:** YYYY-MM-DD
**Author:** <Name/Agent>
**Scope:** <What was analyzed>
**Status:** ✅ Verified | ⚠️ Pending Review | 🔴 Action Required

---
```

### Executive Summary (Required for All Reports)

```markdown
## Executive Summary

**Key Findings:**

- Finding 1
- Finding 2
- Finding 3

**Overall Assessment:** <Green/Yellow/Red status>

**Actions Required:** <Number> items

---
```

### Document Footer (Recommended)

```markdown
---

## Document Metadata

**Document Version:** X.Y
**Generated:** YYYY-MM-DD HH:MM:SS +ZZZZ
**Generator:** <Tool/Agent name>
**Review Status:** ✅ Verified | ⚠️ Pending | 🔴 Rejected
**Approval:** <Approver name or "Pending">

**Change Log:**
- YYYY-MM-DD: Initial document generation
- YYYY-MM-DD: Updated after review

---

**END OF REPORT**
```

---

## Report Quality Standards

### All Reports MUST Include

1. ✅ **Clear Purpose** - What was analyzed and why
2. ✅ **Methodology** - How analysis was performed
3. ✅ **Evidence** - Data, screenshots, code snippets, logs
4. ✅ **Findings** - What was discovered
5. ✅ **Recommendations** - What should be done
6. ✅ **Actionable Items** - Specific next steps

### Evidence Requirements

**Code Snippets:**

```typescript
// ❌ BAD - Describe the issue
const problem = ...

// ✅ GOOD - Show the fix
const solution = ...
```

**Data Tables:**
Use Markdown tables for structured data

**Screenshots:**
Store in `reports/assets/<category>/` if needed

**Git References:**

- Include commit SHAs
- Link to specific files with line numbers
- Show git diffs for changes

---

## Report Retention Policy

| Category            | Retention | Archive After | Location                                                |
| ------------------- | --------- | ------------- | ------------------------------------------------------- |
| **QA Reports**      | Keep all  | Never         | `reports/qa/`                                           |
| **Security Audits** | Keep all  | Never         | `reports/security-audit/`                               |
| **Performance**     | Keep all  | 1 year        | `reports/performance/` → `reports/performance/archive/` |
| **Architecture**    | Keep all  | Never         | `reports/architecture/`                                 |

**Archive Policy:**

- Reports older than retention period → move to `archive/` subdirectory
- Compress annually: `tar -czf archive-YYYY.tar.gz archive/`
- Keep compressed archives for 3 years minimum

---

## Integration with Development Workflow

### TDD Workflow Integration

```
┌────────────────────────────────────────────┐
│ RED → GREEN → REFACTOR → REVIEW            │
└────────────────────────────────────────────┘
                            ↓
              ┌─────────────────────────┐
              │ Phase 4: REVIEW (Opus)  │
              └─────────────────────────┘
                            ↓
        ┌───────────────────┴────────────────┐
        │                                     │
   Security Audit                        QA Report
   reports/security-audit/            reports/qa/
   ↓                                  ↓
   YYYY-MM-DD-security-*.md          YYYY-MM-DD-qa-*.md
```

**See:** `docs/TDD-WORKFLOW.md` for complete workflow

---

### Git Workflow Integration

**Before Commit:**

- QA report for test integrity verification

**Before PR:**

- Security audit report (Phase 4)
- QA coverage verification

**Before Production:**

- Complete security audit
- Performance baseline report
- Final QA verification

---

## Tools & Agents

### QA Reports

**Primary:**

- Manual git analysis (`git diff`, `git log`)
- Test execution logs (Vitest, Playwright)
- Coverage tools (`@vitest/coverage-v8`)

**Agents:**

- Claude Code Sonnet (analysis)
- test-quality-auditor (Opus) - Test quality verification

---

### Security Audit Reports

**Primary:**

- security-auditor (Opus) - OWASP Top 10 scanning

**Supplementary:**

- npm audit (dependencies)
- Wasp type checker

**See:** `reports/security-audit/CLAUDE.md` for security-specific tools

---

## Related Documentation

### Project Documentation

- **Root CLAUDE.md** - Constitution, import rules, code style
- **app/CLAUDE.md** - Wasp development patterns
- **tasks/CLAUDE.md** - Task management workflow
- **.github/CLAUDE.md** - CI/CD & git workflow

### Development Guides

- **docs/TDD-WORKFLOW.md** - Complete TDD workflow with Phase 4
- **docs/TROUBLESHOOTING-GUIDE.md** - Debugging procedures
- **docs/CI-CD-SETUP.md** - CI/CD pipeline

---

## Creating New Report Categories

**When adding a new category:**

1. **Create subdirectory:** `mkdir reports/<category>/`

2. **Create category CLAUDE.md:**

   ```bash
   touch reports/<category>/CLAUDE.md
   ```

3. **Update this file:**

   - Add to directory structure
   - Define naming convention
   - Add to retention policy
   - Document when to create

4. **Create template (optional):**
   ```bash
   touch reports/<category>/TEMPLATE.md
   ```

**Examples of future categories:**

- `reports/testing/` - Test execution reports
- `reports/deployment/` - Deployment logs and verification
- `reports/monitoring/` - Production monitoring reports
- `reports/incidents/` - Post-mortem analyses

---

## Quick Reference

### Create QA Report

```bash
# Manual creation
touch reports/qa/$(date +%Y-%m-%d)-qa-<scope>.md

# Copy this QA report structure as template if needed
```

### Create Security Report

```bash
# Via TDD workflow (automatic)
/tdd-feature "feature description"

# Manual creation
touch reports/security-audit/$(date +%Y-%m-%d)-security-audit-<scope>.md
```

### Find Recent Reports

```bash
# All reports from last 30 days
find reports/ -name "*.md" -mtime -30 -type f

# QA reports only
ls -lt reports/qa/

# Security audits only
ls -lt reports/security-audit/
```

---

## Common Anti-Patterns (AVOID)

| ❌ Anti-Pattern                | ✅ Correct Approach                             |
| ------------------------------ | ----------------------------------------------- |
| No date in filename            | Always use YYYY-MM-DD prefix                    |
| Generic names like "report.md" | Use descriptive scope: `qa-sprint-2-backend.md` |
| Findings without evidence      | Include code snippets, logs, screenshots        |
| No recommendations             | Always provide actionable next steps            |
| No document metadata           | Include version, author, review status          |
| Mixed categories in one report | Separate QA and security reports                |

---

## Report Templates

### QA Report Minimal Template

```markdown
# QA Report: <Title>

**Report Type:** QA - <Sub-type>
**Date:** YYYY-MM-DD
**Scope:** <What was validated>

## Executive Summary

**Status:** ✅ PASS / ⚠️ PARTIAL / 🔴 FAIL

## Test Coverage

- Unit: X/X PASSING
- Integration: X/X PASSING
- E2E: X/X PASSING

## Test Integrity

- [ ] RED phase tests committed separately
- [ ] Tests unchanged during GREEN phase
- [ ] No test deletions
- [ ] All 5 TDD criteria met

## Recommendations

1. Action item 1
2. Action item 2

---

**END OF REPORT**
```

---

### Security Report Minimal Template

See: `reports/security-audit/CLAUDE.md` for complete security report template

---

## Help & Support

**Questions about:**

- QA reports → This file
- Security audits → `reports/security-audit/CLAUDE.md`
- TDD workflow → `docs/TDD-WORKFLOW.md`
- General project → Root `CLAUDE.md`

---

**This directory follows the constitution rules defined in root CLAUDE.md**
