---
description: SECURITY phase - Comprehensive OWASP Top 10 security audit and remediation with automatic report storage in sprintdag directory. For large features after implementation completion.
---

# SECURITY Phase: Security Audit & Remediation

Comprehensive security review and fix (critical REVIEW phase) with automatic OWASP compliance tracking in your sprintdag directory structure.

## Usage

```bash
# From same sprintdag directory as other TDD phases
cd tasks/sprints/sprint-3/day-02/
/security-tdd "priority-filtering"

# With explicit feature name
/security-tdd "Add priority filtering to tasks"

# From project root (will detect sprintdag from git context)
/security-tdd "priority-filtering"
```

## Directory Detection & Artifact Storage

This command uses the same directory detection and creates security audit artifacts:

```
📁 Directory Detection:
   → Check path for: tasks/sprints/sprint-X/day-Y/
   → Validate implementation/ directory exists (from /green-tdd)
   → Read ALL prior artifacts for comprehensive audit

📁 Artifact Structure Created:
   tasks/sprints/sprint-3/day-02/
   ├── tests/                          # From /red-tdd (read for expected security)
   │   └── test-plan.md               ← Read for security scenarios
   ├── implementation/                 # From /green-tdd (read for audit context)
   │   └── implementation-notes.md    ← Read for implementation details
   ├── refactor/                       # From /refactor-tdd (optional, read for final code state)
   │   └── complexity-analysis.md     ← Read for risk assessment
   └── security/                       # Created by /security-tdd
       ├── security-audit-[date].md    # Complete OWASP audit report
       ├── security-risks.json         # Risk register (CRITICAL/HIGH/MEDIUM/LOW)
       ├── security-fixes.md           # Remediation log (if fixes applied)
       └── owasp-compliance.md         # OWASP Top 10 coverage matrix
```

**Benefits:**

- ✅ OWASP Top 10 compliance tracked systematically
- ✅ Risk register maintained (prioritized by severity)
- ✅ Remediation documented (what fixed, how, why)
- ✅ Security decisions preserved for audit trail

## Workflow

```
┌─────────────────────────────────────────────────────────┐
│ PHASE 4: SECURITY - Security Audit & Remediation       │
└─────────────────────────────────────────────────────────┘

0. DIRECTORY DETECTION & PREREQUISITES VALIDATION
   → Detect current directory (sprintdag or project root)
   → Validate implementation/ directory exists
   → Read implementation/implementation-notes.md (must exist)
   → Read tests/test-plan.md (optional, for expected security scenarios)
   → Read refactor/refactor-report.md (optional, for final code state)
   → Check git log for "feat: Implement [feature]" commit
   → Run tests to verify GREEN status
   → Create security/ subdirectory if not exists
   → Output: Prerequisites PASS ✅

1. 🔍 EXPLORE PHASE (MANDATORY - Before Security Audit)
   → Use Task tool with subagent_type='Explore' and thoroughness='very thorough'
   → Gather comprehensive security context:
     * Find authentication patterns used (Grep for context.user checks)
     * Analyze permission checking (Read permission helpers usage)
     * Review input validation (Grep for validation patterns, Zod schemas)
     * Check multi-tenant isolation (Read department filters, organization checks)
     * Verify secrets handling (Grep for .env usage, API keys)
     * Examine SQL injection risks (Review Prisma queries, raw SQL)
     * Check XSS risks (Review user input rendering, HTML sanitization)
     * Analyze CSRF protection (Review form submissions, API endpoints)
     * Check authentication failures (Review login, password reset, token handling)
     * Verify secure configuration (Review env vars, defaults, error messages)
     * Check vulnerable dependencies (Review package.json, npm audit)
     * Examine security logging (Review error handling, audit logs)
   → Output: Security context document with patterns, risks, and file paths
   → **Why critical:** Provides comprehensive security baseline for audit

2. 📋 PLAN PHASE (MANDATORY - Before Security Audit)
   → Use Task tool with subagent_type='Plan' and model='sonnet'
   → Create security audit strategy:
     * Prioritize critical paths (auth, data access, permissions)
     * Design OWASP Top 10 checklist (A01-A10 categories)
     * Plan remediation approach (fix in-place vs rollback)
     * Estimate risk levels per finding (CRITICAL, HIGH, MEDIUM, LOW)
     * Define acceptable risk threshold (block merge if CRITICAL)
     * Sequence audit (high-risk areas first)
     * Plan security test generation (if gaps found)
   → Output: Security audit plan with OWASP checklist
   → **Why critical:** Ensures systematic OWASP coverage

3. SECURITY AUDIT (OWASP TOP 10)
   → Invoke: Task tool with subagent_type='security-auditor' and model='sonnet'
   → Review exploration security context
   → Read implementation/implementation-notes.md for context
   → Run comprehensive OWASP Top 10 compliance check:

     A01: Broken Access Control
     → Check: Auth checks present (context.user validation)
     → Check: Permission checks (department access, role validation)
     → Check: Multi-tenant isolation (organization/department filters)
     → Check: Direct object references (entity ID validation)
     → Check: CORS configuration (if API)
     → Risk: How likely? What impact?

     A02: Cryptographic Failures
     → Check: Passwords hashed (Wasp auth system)
     → Check: Secrets not hardcoded (env vars used)
     → Check: HTTPS enforced (production config)
     → Check: Sensitive data in logs (error messages)
     → Check: Database encryption (Prisma connection)
     → Risk: How likely? What impact?

     A03: Injection
     → Check: SQL injection (Prisma ORM usage, no raw SQL)
     → Check: NoSQL injection (if MongoDB)
     → Check: Command injection (if shell commands)
     → Check: LDAP injection (if directory services)
     → Check: Input validation (Zod schemas)
     → Risk: How likely? What impact?

     A04: Insecure Design
     → Check: Threat modeling (permission design)
     → Check: Secure defaults (enums, configurations)
     → Check: Rate limiting (if API)
     → Check: Business logic flaws (payment flows, state transitions)
     → Check: Security requirements (from tests/test-plan.md)
     → Risk: How likely? What impact?

     A05: Security Misconfiguration
     → Check: Debug mode disabled (production config)
     → Check: Error messages sanitized (no stack traces to user)
     → Check: Unused features disabled (unnecessary endpoints)
     → Check: Default credentials changed (if any)
     → Check: Security headers set (if applicable)
     → Risk: How likely? What impact?

     A06: Vulnerable and Outdated Components
     → Check: Dependencies up-to-date (npm audit)
     → Check: Known vulnerabilities (CVE database)
     → Check: Unused dependencies (package.json cleanup)
     → Check: Component inventory (SBOM)
     → Risk: How likely? What impact?

     A07: Identification and Authentication Failures
     → Check: Session management (Wasp auth)
     → Check: Password policy (if custom auth)
     → Check: Multi-factor authentication (if required)
     → Check: Credential stuffing protection (rate limiting)
     → Check: Session fixation prevention (Wasp handles)
     → Risk: How likely? What impact?

     A08: Software and Data Integrity Failures
     → Check: CI/CD pipeline security (GitHub Actions)
     → Check: Unsigned/unverified code (npm packages)
     → Check: Auto-update without verification (dependencies)
     → Check: Insecure deserialization (if JSON parsing)
     → Risk: How likely? What impact?

     A09: Security Logging and Monitoring Failures
     → Check: Auth failures logged (login attempts)
     → Check: Security events logged (permission denials)
     → Check: Tamper-proof logs (write-only)
     → Check: Log review process (alerts, monitoring)
     → Check: Incident response plan (if breach)
     → Risk: How likely? What impact?

     A10: Server-Side Request Forgery (SSRF)
     → Check: URL validation (if fetching external URLs)
     → Check: Whitelist validation (allowed domains)
     → Check: Network segmentation (if applicable)
     → Check: Disable HTTP redirects (if fetching)
     → Risk: How likely? What impact?

   → Output: Detailed security findings per OWASP category

4. RISK ASSESSMENT
   → Categorize ALL findings by severity:

     CRITICAL (P0 - Block merge):
     - No auth check on sensitive operation
     - SQL injection vulnerability
     - Hardcoded secrets/passwords
     - Broken multi-tenant isolation
     → Action: MUST fix immediately, retest, block merge until resolved

     HIGH (P1 - Fix before merge):
     - Weak permission check (missing role validation)
     - Missing input validation (XSS risk)
     - Insecure error messages (stack traces exposed)
     - Vulnerable dependency (known CVE)
     → Action: Fix before merge, add to PR, verify fixed

     MEDIUM (P2 - Fix soon):
     - Missing security logging (auth events not logged)
     - Weak rate limiting (API abuse possible)
     - Security misconfiguration (debug mode on)
     - Outdated dependency (no known CVE, but old)
     → Action: Document in risk register, fix in next sprint

     LOW (P3 - Nice to have):
     - Missing security header (low impact)
     - Verbose error message (no sensitive data)
     - Unused dependency (no vulnerability)
     → Action: Document in risk register, backlog item

   → Calculate risk score per finding:
     * Likelihood: How easy to exploit? (Low/Medium/High)
     * Impact: What damage if exploited? (Low/Medium/High/Critical)
     * Risk: Likelihood × Impact → Severity (CRITICAL/HIGH/MEDIUM/LOW)

   → Write security/security-risks.json:
     * Findings list (description, category, severity)
     * Risk scores (likelihood, impact, severity)
     * Affected files/functions
     * Remediation recommendations

   → Output: Risk register created

5. REMEDIATION (IF CRITICAL/HIGH FOUND)
   → IF no CRITICAL/HIGH findings:
     ✅ Skip to step 6 (report generation)

   → IF CRITICAL/HIGH findings exist:
     → FOR EACH CRITICAL finding:
       1. Generate fix (wasp-code-generator):
          * Add auth check: if (!context.user) throw HttpError(401)
          * Fix injection: Use Prisma (no raw SQL)
          * Remove secrets: Move to .env.server
          * Fix isolation: Add department filter

       2. Add security test (wasp-test-automator):
          * Test auth failure (401 when not authenticated)
          * Test injection attempt (malicious input rejected)
          * Test tenant isolation (can't access other org's data)

       3. Verify fix:
          * Run new security tests (must PASS)
          * Run existing tests (must still GREEN)
          * Re-audit specific finding (must be resolved)

       4. Commit fix:
          * git add [changed files]
          * git commit -m "fix(security): [specific issue description]"

       5. Document remediation:
          * What: Finding description
          * Why: Risk (likelihood, impact)
          * How: Fix applied (code changes)
          * Verification: Tests added, audit rerun
          * Write to: security/security-fixes.md

     → FOR EACH HIGH finding:
       (Same process as CRITICAL)

   → Output: All CRITICAL/HIGH issues resolved

6. REPORT GENERATION
   → Write security/security-audit-[date].md:
     * Executive Summary:
       - Feature audited
       - Audit date
       - Auditor (security-auditor agent)
       - Risk level (CRITICAL/HIGH/MEDIUM/LOW count)
       - Overall compliance (PASS/FAIL)
     * Audit Scope:
       - Files reviewed (from exploration)
       - OWASP categories checked (A01-A10)
       - Test coverage considered (from tests/test-plan.md)
     * Findings Summary:
       - CRITICAL: X findings (list)
       - HIGH: Y findings (list)
       - MEDIUM: Z findings (list)
       - LOW: W findings (list)
     * OWASP Top 10 Compliance:
       - A01: Broken Access Control → PASS/FAIL (details)
       - A02: Cryptographic Failures → PASS/FAIL (details)
       - ... (all 10 categories)
     * Detailed Findings:
       - Finding ID, Title, Category, Severity
       - Description (what's vulnerable)
       - Location (file, line, function)
       - Risk (likelihood, impact)
       - Recommendation (how to fix)
       - Status (FIXED/OPEN/ACCEPTED)
     * Remediation Summary (if fixes applied):
       - Fixes applied (count)
       - Security tests added (count)
       - Residual risk (remaining issues)
     * Recommendations:
       - Short-term (fix before merge)
       - Long-term (improve over time)
       - Process (team practices)
     * Sign-off:
       - Auditor: security-auditor (Sonnet)
       - Date: [date]
       - Status: APPROVED/CONDITIONAL/REJECTED

   → Write security/owasp-compliance.md:
     * OWASP Top 10 coverage matrix:
       | Category | Applicable | Status | Findings | Notes |
       |----------|-----------|--------|----------|-------|
       | A01 Broken Access Control | YES | PASS | 0 | Auth checks present |
       | A02 Cryptographic Failures | YES | PASS | 0 | Wasp auth, no hardcoded secrets |
       | ... (all 10 categories)
     * Compliance score: X/10 categories PASS
     * Non-applicable categories: (justification)
     * Next audit date: (recommendation)

   → Write security/security-risks.json:
     * Risk register (JSON format for tooling)
     * Findings with severity, status, owner
     * Remediation tracking

   → Write security/security-fixes.md (if fixes applied):
     * Remediation log (chronological)
     * Each fix: What, Why, How, Verification
     * Tests added (security test suite)

   → Output: Complete security documentation

7. FINAL VALIDATION
   → Run full test suite: cd app && wasp test client run
   → Expected: All tests GREEN (including new security tests)
   → If RED: Security fixes broke functionality → Review and fix

   → Run coverage: cd app && wasp test client run --coverage
   → Expected: Coverage maintained or improved (security tests added)

   → Review commit log:
     * Original implementation: "feat: Implement [feature]"
     * Security fixes (if any): "fix(security): [issue]"
     * Security report: "docs: Add security audit for [feature]"

   → Output: All tests GREEN, security documented

8. GIT COMMIT (REPORT & FIXES)
   → Stage security artifacts:
     * git add tasks/sprints/sprint-X/day-Y/security/
   → Stage security fixes (if any):
     * git add app/src/**/*.ts (auth checks, validation)
     * git add app/src/**/*.test.ts (security tests)
   → Commit with message:
     * If fixes applied: Already committed in step 5
     * Report only: "docs: Add security audit for [feature]"
   → Output: Security audit documented

9. SUMMARY & NEXT STEPS
   → Display summary:
     ✅ Audit complete: OWASP Top 10 checked
     ✅ Findings: X CRITICAL, Y HIGH, Z MEDIUM, W LOW
     ✅ Remediation: A fixes applied, B tests added
     ✅ Compliance: C/10 OWASP categories PASS
     ✅ Tests: All GREEN (including security tests)
     ✅ Artifacts: [dag-directory]/security/
     ✅ Status: APPROVED / CONDITIONAL / REJECTED

   → IF CRITICAL issues remain:
     ❌ REJECTED: Cannot merge until CRITICAL issues resolved

   → IF HIGH issues remain:
     ⚠️ CONDITIONAL: Can merge if HIGH issues documented and planned for next sprint

   → IF MEDIUM/LOW only:
     ✅ APPROVED: Safe to merge, document MEDIUM/LOW in risk register

   → Next step:
     ✅ Create PR: All TDD phases complete
     ✅ Reference security audit in PR description
     ✅ Add security checklist to PR
```

## Prerequisites

Before running `/security-tdd`:

1. ✅ **Implementation complete** (git log shows "feat: Implement [feature]")
2. ✅ **Tests GREEN** (wasp test client run passes)
3. ✅ **Implementation notes exist** (implementation/implementation-notes.md from /green-tdd)
4. ✅ **(Optional) Refactoring complete** (refactor/refactor-report.md from /refactor-tdd)

## Exit Criteria

This command completes successfully when:

1. ✅ Security audit complete (OWASP Top 10 checked)
2. ✅ No CRITICAL issues remaining (or all fixed)
3. ✅ HIGH issues fixed or documented (with plan)
4. ✅ Risk register created (all findings tracked)
5. ✅ Compliance matrix generated (OWASP coverage)
6. ✅ Security report written (comprehensive audit)
7. ✅ Tests still GREEN (including new security tests)

## Artifacts Created

After successful completion, you'll find:

```
tasks/sprints/sprint-3/day-02/security/
├── security-audit-2025-11-06.md    # Complete OWASP audit report
├── security-risks.json             # Risk register (CRITICAL/HIGH/MEDIUM/LOW)
├── security-fixes.md               # Remediation log (if fixes applied)
└── owasp-compliance.md             # OWASP Top 10 coverage matrix

app/src/**/*.test.ts                # Security tests (if added, committed)
app/src/**/*.ts                     # Security fixes (if applied, committed)
```

## Agent Assignment

| Step | Task                 | Model  | Agent                          | Reason                  |
| ---- | -------------------- | ------ | ------------------------------ | ----------------------- |
| 1    | Security exploration | Haiku  | **Explore** (built-in)         | Gather security context |
| 2    | Audit planning       | Sonnet | **Plan** (built-in)            | OWASP checklist design  |
| 3    | Security audit       | Opus   | security-auditor (marketplace) | Critical OWASP analysis |
| 5    | Fix generation       | Haiku  | wasp-code-generator            | Auth checks, validation |
| 5    | Security tests       | Haiku  | wasp-test-automator            | Security test scenarios |

## New Capabilities for Large Features

**vs Unified /tdd-feature:**

1. **Incremental Security** - Audit per feature unit

   - Not entire codebase (too broad)
   - Feature-specific risks (targeted)
   - Enable parallel audits (multiple features simultaneously)

2. **Risk-Based Remediation** - Prioritized fixing

   - CRITICAL: Block merge, fix immediately
   - HIGH: Fix before merge
   - MEDIUM/LOW: Document, defer to backlog

3. **Security Test Generation** - Automated security tests

   - Auth failure tests (401/403)
   - Injection attempt tests (malicious input)
   - Tenant isolation tests (cross-org access)
   - Add to test suite (regression prevention)

4. **Compliance Tracking** - OWASP Top 10 over time

   - Matrix per feature (which categories apply)
   - Score per feature (X/10 PASS)
   - Trend analysis (improving or declining)

5. **Security Debt Register** - Track known issues
   - Deferred MEDIUM/LOW findings
   - Acceptance criteria (why accepted)
   - Remediation plan (when to fix)
   - Owner assignment (who responsible)

## Cross-Phase Integration

**Reads artifacts from all prior phases:**

- ✅ **tests/test-plan.md** (/red-tdd) → Expected security scenarios (auth tests, validation)
- ✅ **implementation-notes.md** (/green-tdd) → Implementation details (patterns used, decisions)
- ✅ **refactor-report.md** (/refactor-tdd, optional) → Final code state (complexity, helpers)
- ✅ **Committed code** → Final implementation for audit

**Creates artifacts for PR:**

- ✅ **security-audit-[date].md** → Reference in PR description
- ✅ **owasp-compliance.md** → Security checklist for reviewers
- ✅ **security-risks.json** → Known issues for project tracking

## Example Execution

**Command:**

```bash
cd tasks/sprints/sprint-3/day-02/
/security-tdd "priority-filtering"
```

**Output:**

```
📁 Directory Detection...
   ✓ Sprintdag directory: tasks/sprints/sprint-3/day-02/
   ✓ implementation/ directory exists (from /green-tdd)
   ✓ Reading: tests/test-plan.md (expected security scenarios)
   ✓ Reading: implementation/implementation-notes.md (implementation context)
   ✓ Reading: refactor/refactor-report.md (final code state)
   ✓ Creating security/ subdirectory

✅ Prerequisites Validation...
   ✓ Git log: feat: Implement priority filtering (b2c3d4e)
   ✓ Git log: refactor: Simplify implementation (e5f6g7h)
   ✓ Tests status: GREEN (7 passing)
   ✓ Implementation notes exist
   ✓ Refactoring complete

🔍 EXPLORE: Gathering security context...
   Model: Haiku (Explore agent)
   ✓ Auth patterns: context.user checks present (operations.ts:12)
   ✓ Permission patterns: requireDepartmentAccess used (operations.ts:15)
   ✓ Input validation: Zod schemas for Priority enum (operations.ts:8)
   ✓ Multi-tenant: Department filters applied (operations.ts:25)
   ✓ Secrets: No hardcoded values, .env.server used
   ✓ SQL injection: Prisma ORM only (no raw SQL)
   ✓ XSS risks: Backend operations (no direct user rendering)

📋 PLAN: Creating security audit strategy...
   Model: Sonnet (Plan agent)
   Audit priorities:
   1. Authentication (context.user validation)
   2. Authorization (department access, role checks)
   3. Input validation (Priority enum, filters)
   4. Multi-tenant isolation (organization/department filters)
   5. OWASP Top 10 coverage (A01-A10)
   Risk threshold: Block merge if CRITICAL

🔒 SECURITY AUDIT: OWASP Top 10 compliance check...
   Model: Sonnet (security-auditor)

   A01: Broken Access Control
   ✓ Auth check: context.user validated (operations.ts:12)
   ✓ Permission check: requireDepartmentAccess (operations.ts:15)
   ✓ Multi-tenant: Department filter applied (operations.ts:25)
   ✓ Direct object refs: ID validation present
   Status: PASS

   A02: Cryptographic Failures
   ✓ Passwords: Wasp auth (hashed automatically)
   ✓ Secrets: .env.server used (no hardcoded)
   ✓ HTTPS: Production config enforced
   ✓ Sensitive data: Not in error messages
   Status: PASS

   A03: Injection
   ✓ SQL injection: Prisma ORM (no raw SQL)
   ✓ Input validation: Zod schema for Priority enum
   ✓ NoSQL injection: N/A (PostgreSQL)
   ✓ Command injection: N/A (no shell commands)
   Status: PASS

   A04: Insecure Design
   ✓ Threat model: Permission design reviewed
   ✓ Secure defaults: Priority enum (defined values)
   ✓ Rate limiting: N/A (internal operations)
   ✓ Business logic: Filter logic verified
   Status: PASS

   A05: Security Misconfiguration
   ✓ Debug mode: Disabled in production
   ✓ Error messages: Sanitized (no stack traces)
   ⚠️ Finding: Verbose error in getTasks (line 45)
   Status: FAIL (1 MEDIUM finding)

   A06: Vulnerable Components
   ✓ Dependencies: npm audit clean
   ✓ Known CVEs: None found
   ✓ Unused deps: Cleaned up
   Status: PASS

   A07: Authentication Failures
   ✓ Session mgmt: Wasp auth handles
   ✓ Password policy: N/A (Wasp default)
   ✓ MFA: N/A (not required)
   ✓ Credential stuffing: Rate limiting (Wasp)
   Status: PASS

   A08: Software Integrity
   ✓ CI/CD: GitHub Actions secure
   ✓ Code signing: npm packages verified
   ✓ Auto-update: Manual (package.json)
   ✓ Deserialization: JSON.parse (safe inputs)
   Status: PASS

   A09: Security Logging
   ⚠️ Finding: Auth failures not logged
   Status: FAIL (1 MEDIUM finding)

   A10: SSRF
   ✓ URL validation: N/A (no external fetches)
   ✓ Whitelist: N/A
   ✓ Network segmentation: N/A
   Status: N/A

   Summary: 8 PASS, 2 FAIL (2 MEDIUM), 1 N/A

📊 RISK ASSESSMENT: Categorizing findings...
   Finding 1: Verbose error message in getTasks
   - Category: A05 (Security Misconfiguration)
   - Location: operations.ts:45
   - Severity: MEDIUM
   - Likelihood: Low (internal error handling)
   - Impact: Medium (potential info disclosure)
   - Recommendation: Sanitize error message

   Finding 2: Auth failures not logged
   - Category: A09 (Security Logging)
   - Location: operations.ts:12
   - Severity: MEDIUM
   - Likelihood: Medium (audit trail gap)
   - Impact: Medium (forensics difficulty)
   - Recommendation: Add security logging

   Risk register: 0 CRITICAL, 0 HIGH, 2 MEDIUM, 0 LOW
   Saved: security/security-risks.json

🔧 REMEDIATION: No CRITICAL/HIGH issues
   ✓ Skipping remediation (MEDIUM issues acceptable)
   ✓ MEDIUM issues documented in risk register
   ✓ Recommendation: Address in future sprint

📝 REPORT GENERATION: Writing security artifacts...
   ✓ security/security-audit-2025-11-06.md (comprehensive report)
   ✓ security/owasp-compliance.md (8/10 PASS, 1 N/A)
   ✓ security/security-risks.json (2 MEDIUM findings)
   ✓ No security-fixes.md (no fixes applied)

✅ FINAL VALIDATION: Verifying completeness...
   ✓ Tests: 7/7 GREEN
   ✓ Coverage: 83% maintained
   ✓ No CRITICAL issues
   ✓ No HIGH issues
   ✓ MEDIUM issues documented

📝 GIT COMMIT: Documenting security audit...
   ✓ Staged: tasks/sprints/sprint-3/day-02/security/
   ✓ Committed: docs: Add security audit for priority filtering
   ✓ Commit hash: g7h8i9j

🎉 SECURITY PHASE COMPLETE!

   Summary:
   ✅ Audit complete: OWASP Top 10 checked
   ✅ Findings: 0 CRITICAL, 0 HIGH, 2 MEDIUM, 0 LOW
   ✅ Remediation: No fixes needed (MEDIUM acceptable)
   ✅ Compliance: 8/10 OWASP categories PASS (1 N/A)
   ✅ Tests: 7/7 GREEN
   ✅ Artifacts: tasks/sprints/sprint-3/day-02/security/
   ✅ Status: APPROVED (safe to merge)

   Next steps:
   ✅ Create PR for priority filtering feature
   ✅ Reference security audit: security/security-audit-2025-11-06.md
   ✅ Add security checklist to PR description
   ✅ MEDIUM issues tracked in risk register for future sprint
```

## Error Handling

**If prerequisites fail:**

```
❌ Prerequisites FAILED

   Missing:
   - implementation/implementation-notes.md not found
   - No "feat:" commit in git log

   Action: Run /green-tdd first to create implementation
```

**If tests are RED:**

```
❌ Tests RED (cannot audit)

   5/7 tests failing

   Action:
   - Fix failing tests first
   - Ensure all tests GREEN before security audit
```

**If CRITICAL issues found:**

```
❌ CRITICAL SECURITY ISSUES FOUND

   Finding 1: No auth check on deleteTask operation
   - Category: A01 (Broken Access Control)
   - Severity: CRITICAL
   - Impact: Any user can delete any task (data loss)

   ACTION: BLOCKING MERGE
   → Generating fix...
   → Adding security test...
   → Verifying fix...
   → Re-auditing...

   ✓ Fix applied: Added context.user check
   ✓ Security test: 401 when not authenticated
   ✓ All tests GREEN
   ✓ Re-audit: CRITICAL issue resolved

   Status: APPROVED (after remediation)
```

**If HIGH issues found:**

```
⚠️ HIGH SECURITY ISSUES FOUND

   Finding 1: Missing input validation on priority filter
   - Category: A03 (Injection)
   - Severity: HIGH
   - Impact: Invalid enum values could bypass filter

   ACTION: FIX BEFORE MERGE
   → Generating fix (Zod schema validation)...
   → Adding security test (invalid enum rejected)...
   → Verifying fix...

   ✓ Fix applied: Zod schema validates Priority enum
   ✓ Security test: 400 when invalid priority
   ✓ All tests GREEN

   Status: APPROVED (after remediation)
```

**If MEDIUM issues accepted:**

```
⚠️ MEDIUM SECURITY ISSUES (ACCEPTED)

   Finding 1: Verbose error message
   Finding 2: Auth failures not logged

   Risk: ACCEPTED (low likelihood, medium impact)
   Plan: Address in Sprint 4 (Q1 2025)
   Owner: Security team
   Tracking: security/security-risks.json

   Status: CONDITIONAL APPROVAL
```

## When to Use This Command

✅ **Use /security-tdd for:**

- After implementation complete (/green-tdd or /refactor-tdd)
- ALL features (security is not optional)
- High-risk features (auth, payments, data export) - MANDATORY
- Features with external input (user forms, API endpoints)
- Features accessing sensitive data (PII, financial)
- Before creating PR (security audit in PR description)

❌ **Never skip /security-tdd:**

- Even "simple" features need security audit
- Security issues found early = easier/cheaper to fix
- OWASP compliance required for production

## Integration with Other Commands

**Preceded by:**

- `/red-tdd "[feature]"` - Write tests
- `/green-tdd "[feature]"` - Implement
- `/refactor-tdd "[feature]"` (optional) - Improve code

**Followed by:**

- Create PR with security audit reference

**Reads artifacts from:**

- `tests/test-plan.md` (/red-tdd) - Expected security scenarios
- `implementation/implementation-notes.md` (/green-tdd) - Implementation details
- `refactor/refactor-report.md` (/refactor-tdd, optional) - Final code state

**Creates artifacts for:**

- PR description - security-audit-[date].md (comprehensive audit)
- Project tracking - security-risks.json (risk register)
- Team review - owasp-compliance.md (compliance matrix)

## OWASP Top 10 Quick Reference

| Category                       | Focus              | Common Issues        | Wasp Protections                       |
| ------------------------------ | ------------------ | -------------------- | -------------------------------------- |
| A01: Broken Access Control     | Auth/permissions   | Missing auth checks  | Context.user validation required       |
| A02: Cryptographic Failures    | Secrets/encryption | Hardcoded passwords  | Wasp auth, .env.server                 |
| A03: Injection                 | Input validation   | SQL injection        | Prisma ORM (parameterized)             |
| A04: Insecure Design           | Architecture       | Missing threat model | Permission helpers, department filters |
| A05: Security Misconfiguration | Config/defaults    | Debug mode on        | Production config, error sanitization  |
| A06: Vulnerable Components     | Dependencies       | Outdated packages    | npm audit, regular updates             |
| A07: Authentication Failures   | Login/session      | Weak passwords       | Wasp auth system                       |
| A08: Software Integrity        | Supply chain       | Unsigned code        | npm package verification               |
| A09: Security Logging          | Monitoring         | No audit trail       | Custom logging (add as needed)         |
| A10: SSRF                      | URL fetching       | Unvalidated URLs     | Rare in backend (validate if used)     |

## References

- **Agents:** security-auditor (marketplace), wasp-code-generator, wasp-test-automator
- **Skills:** /tdd-workflow (security tests), /error-handling (auth checks), /permissions (access control)
- **Docs:** reports/security-audit/CLAUDE.md (report format), CLAUDE.md (security rules)
- **Marketplace:** security-scanning (Opus security-auditor)
- **External:** OWASP Top 10 (https://owasp.org/Top10/)
