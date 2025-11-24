# Deferred Security Items

**Report Date:** 2025-10-23
**Security Audit:** Phase 4 Complete
**Deferred To:** Future Sprint(s)

---

## Summary

During the Phase 4 security audit, 11 findings were **deferred** to future implementation rather than being fixed immediately. This document tracks these deferred items, explains the rationale for deferral, and provides guidance for future implementation.

**Total Deferred:** 11 findings

- **HIGH:** 3 findings
- **MEDIUM:** 7 findings
- **LOW:** 1 finding

---

## Deferred Items by Priority

### HIGH Priority (Deferred to Sprint 3+)

#### HIGH-01: OpenAI API Key Validation

- **OWASP:** A05:2021 - Security Misconfiguration
- **Rationale:** OpenAI/GPT features only exist in demo-ai-app (template code), not in core A3 AI Chat feature
- **GitHub Issue:** [#18](https://github.com/ToonVos/lean-ai-coach/issues/18)
- **Defer To:** Sprint 3 - A3 AI Chat Implementation
- **Details:** Validate API key format at startup with clear error messages

#### HIGH-02: OpenAI Prompt Injection Prevention

- **OWASP:** A03:2021 - Injection
- **Rationale:** Prompt injection is only relevant when we have actual AI chat features
- **GitHub Issue:** [#18](https://github.com/ToonVos/lean-ai-coach/issues/18)
- **Defer To:** Sprint 3 - A3 AI Chat Implementation
- **Details:** Implement input sanitization and output validation for AI prompts

#### HIGH-06: OpenAI Error Handling & Rate Limiting

- **OWASP:** A04:2021 - Insecure Design
- **Rationale:** Rate limiting and error handling needed when AI features go live
- **GitHub Issue:** [#18](https://github.com/ToonVos/lean-ai-coach/issues/18)
- **Defer To:** Sprint 3 - A3 AI Chat Implementation
- **Details:** Add retry logic, rate limiting, and user-friendly error messages

---

### MEDIUM Priority (Deferred to Sprint 3+)

#### MEDIUM-02: Session Timeout Configuration

- **OWASP:** A07:2021 - Identification and Authentication Failures
- **Rationale:** Nice-to-have, not critical for MVP; default Wasp timeouts are reasonable
- **Defer To:** Sprint 3 - Production Hardening
- **Implementation:** Configure Wasp session timeout in main.wasp auth config
- **Recommended Value:** 30 days with sliding expiration

#### MEDIUM-04: Input Length Validation

- **OWASP:** A03:2021 - Injection
- **Rationale:** Low risk with current Prisma schema (db enforces limits)
- **Defer To:** Sprint 3 - Form Validation Enhancement
- **Implementation:** Add maxLength to all Zod schemas in operations
- **Recommended Limits:**
  - Title fields: 200 characters
  - Description fields: 2000 characters
  - Email fields: 254 characters

#### MEDIUM-05: Structured Logging (Winston/Pino)

- **OWASP:** A09:2021 - Security Logging and Monitoring Failures
- **Rationale:** Defer to monitoring setup phase; console.log sufficient for development
- **Defer To:** Sprint 4 - Monitoring & Observability
- **Implementation:** Replace console.log with structured logger (Pino recommended)
- **Features Needed:**
  - JSON format logs
  - Log levels (debug, info, warn, error)
  - Request ID correlation
  - Sentry integration

#### MEDIUM-06: Database Connection Pool Limits

- **OWASP:** A04:2021 - Insecure Design
- **Rationale:** Defer to performance tuning phase; default Prisma limits acceptable for MVP
- **Defer To:** Sprint 4 - Performance Tuning
- **Implementation:** Configure Prisma connection pool in schema.prisma
- **Recommended Values:**
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
    connection_limit = 10  // Add this
  }
  ```

#### MEDIUM-07: File Upload Size/Type Validation

- **OWASP:** A04:2021 - Insecure Design
- **Rationale:** File upload feature exists but A3 attachments not yet needed
- **Defer To:** Sprint 3 - A3 Attachments Feature
- **Implementation:** Add file size/type validation in file-upload operations
- **Recommended Limits:**
  - Max file size: 10MB
  - Allowed types: PDF, PNG, JPG, JPEG, CSV, XLSX
  - Virus scanning (ClamAV or CloudFlare WAF)

#### MEDIUM-08: Content Security Policy (CSP) Fine-Tuning

- **OWASP:** A05:2021 - Security Misconfiguration
- **Rationale:** Basic CSP implemented (HIGH-07), fine-tuning can wait
- **Defer To:** Sprint 4 - Production Hardening
- **Implementation:** Tighten CSP directives based on actual app requirements
- **Current State:** Permissive CSP with `unsafe-inline` for development
- **Target State:** Remove `unsafe-inline`, add specific trusted domains

#### MEDIUM-09: Webhook Signature Verification Testing

- **OWASP:** A04:2021 - Insecure Design
- **Rationale:** Webhook code exists but not yet deployed/tested
- **Defer To:** Sprint 3 - Payment Integration Testing
- **Implementation:** Add webhook signature verification tests
- **Testing Needed:**
  - Stripe webhook signature validation
  - LemonSqueezy webhook signature validation
  - Invalid signature rejection tests

#### MEDIUM-10: Rate Limiting (API-Level)

- **OWASP:** A04:2021 - Insecure Design
- **Rationale:** User-level rate limiting sufficient for MVP
- **Defer To:** Sprint 4 - Production Hardening
- **Implementation:** Add express-rate-limit middleware
- **Recommended Limits:**
  - Auth endpoints: 5 requests/15 minutes
  - API endpoints: 100 requests/15 minutes per user
  - Public endpoints: 20 requests/minute per IP

---

### LOW Priority (Defer Indefinitely)

#### LOW-01: Demo App Removal

- **OWASP:** A04:2021 - Insecure Design (attack surface)
- **Rationale:** Template code, low risk, can be removed when no longer needed
- **Defer To:** Post-MVP Cleanup
- **Implementation:** Delete `app/src/demo-ai-app/` directory and remove from main.wasp
- **Consideration:** May want to keep for reference/examples

---

## Implementation Guidelines

### When to Address Deferred Items

1. **OpenAI Security (HIGH-01, HIGH-02, HIGH-06):**

   - **MUST** be addressed before implementing A3 AI Chat
   - **MUST** be addressed before enabling OpenAI features in production
   - Reference: GitHub Issue #18

2. **Input Validation (MEDIUM-04):**

   - Address during form validation enhancement sprint
   - Not critical but improves user experience
   - Low implementation effort (1-2 hours)

3. **Structured Logging (MEDIUM-05):**

   - Address when setting up monitoring infrastructure
   - Required for production observability
   - Moderate implementation effort (4-6 hours)

4. **Performance Items (MEDIUM-06, MEDIUM-10):**

   - Address during performance tuning/load testing
   - Monitor production metrics first
   - Optimize based on actual usage patterns

5. **File Upload (MEDIUM-07):**

   - Address when implementing A3 attachments feature
   - Include in A3 attachment story estimation

6. **CSP Fine-Tuning (MEDIUM-08):**
   - Address before production deployment
   - Test thoroughly to avoid breaking functionality

### TDD Workflow for Deferred Items

When implementing deferred items, follow TDD workflow:

1. **RED Phase:** Write security tests that expect the hardened behavior
2. **GREEN Phase:** Implement the minimum code to pass tests
3. **REFACTOR Phase:** Clean up and optimize
4. **REVIEW Phase:** Run security audit to verify fix

### Documentation Updates Needed

When addressing deferred items, update:

- [ ] `docs/SECURITY-CHECKLIST.md` - Add new checks
- [ ] `CLAUDE.md` - Update security rules if needed
- [ ] `reports/security-audit/[date]-audit.md` - Document resolution
- [ ] This file - Mark item as **RESOLVED** with date

---

## Tracking Resolution

### Resolution Template

When an item is resolved, add this section:

```markdown
**RESOLVED:** [Item ID]

- **Resolution Date:** YYYY-MM-DD
- **Implemented In:** Sprint X
- **Pull Request:** #XX
- **Verified By:** Security audit / Manual testing
- **Notes:** Brief description of implementation
```

### Example (for reference):

**RESOLVED:** MEDIUM-03

- **Resolution Date:** 2025-10-23
- **Implemented In:** Sprint 2 Backend
- **Pull Request:** #N/A (direct commit)
- **Verified By:** Phase 4 security audit + manual testing
- **Notes:** Implemented AuditLog model, helper functions, and integrated into admin/payment operations

---

## Risk Assessment

### Immediate Risk (Before Sprint 3)

**Current Risk:** **LOW**

Rationale:

- OpenAI features not live (demo app only)
- Multi-tenant isolation fixed (CRITICAL-01 through CRITICAL-06)
- Authentication hardened (MEDIUM-01)
- Security headers active (HIGH-07)
- Audit logging operational (MEDIUM-03)

**Acceptable:** ✅ Safe to proceed with current sprint work

### Sprint 3 Risk (Before A3 AI Chat)

**Risk if OpenAI items not addressed:** **HIGH**

Rationale:

- Prompt injection enables data exfiltration
- Missing rate limiting enables quota exhaustion
- Poor error handling enables denial of service

**Action Required:** **MUST resolve HIGH-01, HIGH-02, HIGH-06 before A3 AI Chat goes live**

### Production Risk (Before Deployment)

**Risk if MEDIUM items not addressed:** **MEDIUM**

Rationale:

- Missing structured logging hinders incident response
- Missing CSP fine-tuning increases XSS risk (though mitigated by existing CSP)
- Missing rate limiting enables abuse

**Recommended:** Address MEDIUM-05, MEDIUM-08, MEDIUM-10 before production deployment

---

## Contact & Questions

For questions about deferred items:

- **Security Lead:** Review GitHub Issue #18
- **Sprint Planning:** Reference this document during sprint planning
- **Implementation Questions:** See GitHub issue for detailed implementation guidance

---

**Document Version:** 1.0
**Last Updated:** 2025-10-23
**Next Review:** Sprint 3 Planning
