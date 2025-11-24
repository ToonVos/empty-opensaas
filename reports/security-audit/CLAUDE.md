# Security Audit Reports

**AUTO-LOADED**: This file is automatically loaded by Claude Code when working with security audit reports in the `reports/security-audit/` directory.

---

## Purpose

This directory contains **security audit reports** generated during Phase 4 (REVIEW) of the TDD workflow and ad-hoc security assessments.

---

## Report Format Standard

### File Naming Convention

```
YYYY-MM-DD-security-audit-<scope>.md
```

**Examples:**

- `2025-10-23-security-audit-phase4-complete.md` - Full codebase audit (Phase 4 TDD)
- `2025-11-15-security-audit-payment-module.md` - Targeted module audit
- `2025-12-01-security-audit-pre-production.md` - Pre-deployment security check

### Report Structure (MANDATORY)

All security audit reports MUST follow this structure:

````markdown
# Security Audit Report: <Title>

**Date:** YYYY-MM-DD
**Auditor:** <Name/Agent>
**Scope:** <What was audited>
**Standards:** Wasp | OpenSaaS | OWASP Top 10 | CLAUDE.md Constitution

---

## Executive Summary

**Total Findings:** X vulnerabilities
**Critical:** X | **High:** X | **Medium:** X | **Low:** X

**Top Risks:**

1. Brief description
2. Brief description
3. ...

**Overall Security Score:** X/100

---

## Critical Findings

### 🔴 CRITICAL-XX: <Title>

**OWASP Category:** A0X:2021 - <Category Name>
**Severity:** CRITICAL
**Location:** `file/path.ts:line-range`

**Description:**
Clear explanation of vulnerability and impact.

**Evidence:**

```typescript
// Code snippet showing the vulnerability
// ❌ Comment highlighting the issue
```
````

**Remediation:**

```typescript
// Fixed code example
// ✅ Comment showing the fix
```

**Wasp/OpenSaaS Compliance:** ✅ COMPLIANT | ❌ VIOLATES | ⚠️ PARTIAL

---

## High Severity Findings

### 🟠 HIGH-XX: <Title>

[Same format as Critical]

---

## Medium Severity Findings

### 🟡 MEDIUM-XX: <Title>

[Same format as Critical]

---

## Low Severity Findings

### 🟢 LOW-XX: <Title>

[Same format as Critical]

---

## Summary by OWASP Category

| OWASP Category                   | Critical | High | Medium | Low | Total |
| -------------------------------- | -------- | ---- | ------ | --- | ----- |
| **A01 - Broken Access Control**  | X        | X    | X      | X   | **X** |
| **A02 - Cryptographic Failures** | X        | X    | X      | X   | **X** |

| ... (all 10 categories)

---

## Remediation Priority

### 🔴 IMMEDIATE (Fix now)

1. CRITICAL-01: ...
2. CRITICAL-02: ...

### 🟠 HIGH (Fix within 2 weeks)

3. HIGH-01: ...

### 🟡 MEDIUM (Fix before production)

4. MEDIUM-01: ...

### 🟢 LOW (Tech debt)

5. LOW-01: ...

---

## Standards Compliance Matrix

| Standard                   | Status                         | Notes                    |
| -------------------------- | ------------------------------ | ------------------------ |
| **Wasp Framework**         | ✅ PASS / ❌ FAIL / ⚠️ PARTIAL | Critical violations: ... |
| **OpenSaaS Template**      | ✅ PASS / ❌ FAIL / ⚠️ PARTIAL | Deviations: ...          |
| **OWASP Top 10**           | ✅ PASS / ❌ FAIL / ⚠️ PARTIAL | Covered categories: ...  |
| **CLAUDE.md Constitution** | ✅ PASS / ❌ FAIL / ⚠️ PARTIAL | Rule violations: ...     |

---

## Files Requiring Changes

```
path/to/file1.ts  # CRITICAL-01, HIGH-03
path/to/file2.ts  # MEDIUM-05, LOW-02
```

---

## Testing Recommendations

1. **Integration tests:**

   - Test case 1
   - Test case 2

2. **Security unit tests:**

   - Test case 1

3. **Penetration testing:**
   - Manual test 1

---

## Documentation Updates Required

- [ ] Update CLAUDE.md (if conflicts found)
- [ ] Update app/CLAUDE.md (if Wasp patterns changed)
- [ ] Create SECURITY-CHECKLIST.md (if first audit)
- [ ] Update .github/CLAUDE.md (if CI/CD changes needed)

---

## Verification Checklist

- [ ] All CRITICAL findings fixed
- [ ] All HIGH findings fixed
- [ ] All MEDIUM findings fixed (or documented as tech debt)
- [ ] Tests passing after fixes
- [ ] Re-audit completed (no new issues introduced)
- [ ] Documentation updated

---

**End of Report**

```

---

## Severity Definitions

| Severity | Icon | Criteria | Action Required |
|----------|------|----------|-----------------|
| **CRITICAL** | 🔴 | Allows unauthorized access to data, privilege escalation, or complete system compromise | Fix immediately (blocking) |
| **HIGH** | 🟠 | Significant security risk, exploitable with moderate effort | Fix within 2 weeks |
| **MEDIUM** | 🟡 | Security weakness, requires specific conditions to exploit | Fix before production |
| **LOW** | 🟢 | Minor issue, best practice deviation, low likelihood/impact | Tech debt, fix when convenient |

---

## OWASP Top 10 (2021) Categories

**Always map findings to these categories:**

1. **A01:2021 - Broken Access Control**
   Missing auth checks, IDOR, privilege escalation, multi-tenant isolation failures

2. **A02:2021 - Cryptographic Failures**
   Plain-text secrets, weak encryption, missing HTTPS, insecure cookies

3. **A03:2021 - Injection**
   SQL injection, NoSQL injection, command injection, prompt injection

4. **A04:2021 - Insecure Design**
   Missing rate limiting, no abuse prevention, weak business logic

5. **A05:2021 - Security Misconfiguration**
   Default credentials, unnecessary features enabled, missing security headers

6. **A06:2021 - Vulnerable and Outdated Components**
   Known CVEs in dependencies, outdated frameworks

7. **A07:2021 - Identification and Authentication Failures**
   Weak passwords, session fixation, missing session timeout

8. **A08:2021 - Software and Data Integrity Failures**
   Missing webhook signature verification, unsigned updates, insecure deserialization

9. **A09:2021 - Security Logging and Monitoring Failures**
   Missing audit logs, insufficient logging, no alerting on attacks

10. **A10:2021 - Server-Side Request Forgery (SSRF)**
    Unvalidated URLs, internal service exposure

---

## Evidence Requirements

**Each finding MUST include:**

1. ✅ **Location** - Exact file path + line numbers
2. ✅ **Evidence** - Code snippet showing vulnerability
3. ✅ **Remediation** - Fixed code example
4. ✅ **Framework Compliance** - Does it violate Wasp/OpenSaaS/CLAUDE.md standards?

**Use code comments to highlight issues:**
- `// ❌ BAD - ...` for vulnerable code
- `// ✅ GOOD - ...` for fixed code
- `// ⚠️ RISK - ...` for potential issues

---

## When to Create a Security Audit Report

### Mandatory Audits

1. **Phase 4 of TDD Workflow** - After REFACTOR, before PR
   - Triggered by: `/tdd-feature` command (complete workflow)
   - Scope: Feature code + related operations
   - Agent: `security-auditor` (Opus)

2. **Pre-Production Deployment**
   - Before: First production deploy, major releases
   - Scope: Full codebase
   - Agent: `security-auditor` (Opus)

3. **After Security Incident**
   - Triggered by: Vulnerability disclosure, breach, CVE
   - Scope: Affected component + similar patterns
   - Agent: Manual review + `security-auditor`

### Optional Audits

4. **Quarterly Security Review**
   - Schedule: Every 3 months
   - Scope: Operations, auth, payment flows
   - Agent: `security-auditor` (Opus)

5. **Dependency Update Audit**
   - After: Major framework updates (Wasp, Prisma, etc.)
   - Scope: Changed dependencies + integration points
   - Agent: `security-auditor` + npm audit

6. **New Third-Party Integration**
   - Before: Adding payment processors, AI services, etc.
   - Scope: Integration code + webhook handlers
   - Agent: Manual review

---

## Integration with TDD Workflow

```

┌─────────────────────────────────────────────────────────┐
│ PHASE 4: REVIEW - Security & Quality (Opus) │
└─────────────────────────────────────────────────────────┘

14. Opus: security-auditor (from marketplace)
    → OWASP compliance check
    → Auth/permission verification
    → Input validation review
    → Output: Security report in reports/security-audit/

15. Fix any critical issues found
16. Final test run → All GREEN
17. Ready for PR!

````

**Command reference:** See `.claude/commands/tdd-feature.md`

---

## Report Retention

| Report Type | Retention Period | Archive Location |
|-------------|------------------|------------------|
| Phase 4 TDD audits | Keep all | `reports/security-audit/` |
| Pre-production audits | Keep all | `reports/security-audit/` |
| Quarterly reviews | Keep last 4 | `reports/security-audit/archive/` |
| Ad-hoc audits | 1 year | `reports/security-audit/archive/` |

**Archive policy:**
- Move reports older than 1 year to `archive/` subdirectory
- Compress archive with: `tar -czf archive-YYYY.tar.gz archive/`
- Keep compressed archives for 3 years

---

## Tools & Agents

**Primary:**
- **security-auditor** (Opus) - Comprehensive OWASP Top 10 scanning
- **npm audit** - Dependency vulnerability scanning
- **Wasp type checker** - Type safety verification

**Supplementary:**
- **code-reviewer** (Sonnet) - Code quality analysis
- **Manual review** - Complex business logic security

---

## Example Usage

```bash
# Run Phase 4 security audit (part of /tdd-feature workflow)
/tdd-feature "Add priority filtering to A3 documents"

# Ad-hoc security audit
"Run security-auditor agent on payment operations"

# Pre-production audit
"Run comprehensive security audit against all OWASP Top 10 categories for production readiness"
````

---

## Related Documentation

- **Root CLAUDE.md** - Security rules (constitution)
- **app/CLAUDE.md** - Wasp security patterns
- **.github/CLAUDE.md** - CI/CD security checks
- **docs/TDD-WORKFLOW.md** - Phase 4 integration
- **docs/SECURITY-CHECKLIST.md** - Pre-commit/deploy checks

---

## Security Audit Report Template

Copy this template when creating new reports:

```bash
cp reports/security-audit/TEMPLATE.md reports/security-audit/$(date +%Y-%m-%d)-security-audit-<scope>.md
```

**Template location:** `reports/security-audit/TEMPLATE.md` (create if missing)

---

**This directory follows the constitution rules defined in root CLAUDE.md**
