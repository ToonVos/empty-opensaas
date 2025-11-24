# Security Checklist

**Comprehensive pre-commit and pre-deploy security verification checklist for OpenSaaS Boilerplate**

> **Mandatory:** Run this checklist before EVERY commit to `main`/`develop` and BEFORE every production deployment.

---

## Quick Status Check

Run this first to get an overview:

```bash
# Security audit status
npm run security:check

# Or manually:
npm audit
cd app && wasp test client run
grep -r "HttpError(401)" app/src/**/operations.ts | wc -l  # Should match operation count
```

---

## Pre-Commit Checklist

### 1. Authentication & Authorization ✅

**Every operation MUST have:**

```bash
# Check all operations have auth
grep -L "if (!context.user)" app/src/**/operations.ts
# ✅ Should return NOTHING (all files have auth check)
```

- [ ] ALL operations start with `if (!context.user) throw new HttpError(401)`
- [ ] NO client-side only auth checks (client auth is cosmetic!)
- [ ] Permission checks use server-side helpers from `app/src/server/permissions/`
- [ ] NO operations skip auth check (not even admin-only!)

**Multi-tenant isolation:**

```bash
# Check org isolation in user operations
grep -n "organizationId: context.user.organizationId" app/src/user/operations.ts
# ✅ Should appear in getPaginatedUsers and updateIsUserAdminById
```

- [ ] User operations filter by `organizationId`
- [ ] File operations verify org isolation
- [ ] A3 operations use department isolation helpers
- [ ] NO cross-org data leakage possible

### 2. Input Validation ✅

- [ ] ALL operation inputs validated with Zod schemas
- [ ] Validation uses `ensureArgsSchemaOrThrowHttpError`
- [ ] String inputs trimmed: `.trim()`
- [ ] Enum values validated with `z.enum()` or `z.nativeEnum()`
- [ ] NO raw user input in database queries

**Check for missing validation:**

```bash
# Find operations without schema validation
grep -L "ensureArgsSchemaOrThrowHttpError" app/src/**/operations.ts
# ✅ Should return NOTHING
```

### 3. Error Handling ✅

- [ ] Correct HTTP status codes:
  - `401` - Not authenticated
  - `403` - Not authorized (permission denied)
  - `404` - Resource not found
  - `400` - Invalid input
  - `409` - Conflict (duplicate)
  - `500` - Server error (unexpected)
- [ ] Error messages DON'T reveal sensitive info
- [ ] Try/catch blocks in operations catch `HttpError` separately
- [ ] NO generic `Error` thrown (use `HttpError` instead)

**Check IDOR pattern (fetch → check → modify):**

```bash
# Update/Delete operations should fetch first
grep -A 10 "DeleteTask\|UpdateTask" app/src/demo-ai-app/operations.ts | grep "findUnique"
# ✅ Should find fetch before update/delete
```

### 4. Database Security ✅

- [ ] `schema.prisma` uses `env("DATABASE_URL")`
- [ ] NO hardcoded connection strings
- [ ] Cascade deletes configured correctly
- [ ] Indexes on security-critical fields:
  - `@@index([organizationId])`
  - `@@index([userId])`
  - `@@index([departmentId])`
- [ ] Enum values from `@prisma/client` (NOT `wasp/entities`)

**Check env usage:**

```bash
grep -n "url.*=" app/schema.prisma
# ✅ Should show: url = env("DATABASE_URL")
```

### 5. Environment Variables ✅

- [ ] Server secrets in `app/.env.server` (NOT committed!)
- [ ] Client public vars in `app/.env.client`
- [ ] `.env.server.example` and `.env.client.example` exist
- [ ] NO secrets in code (API keys, passwords)
- [ ] Server env NOT accessible in client code

**Check for hardcoded secrets:**

```bash
# Search for potential secrets in code
grep -r "sk-\|secret.*=\|password.*=" app/src/ --exclude-dir=node_modules
# ✅ Should return NOTHING (secrets in .env files only)
```

### 6. Wasp Framework Compliance ✅

- [ ] Import paths correct:
  - `wasp/` NOT `@wasp/`
  - `@prisma/client` for enum VALUES
  - `wasp/entities` for enum TYPES
- [ ] Operations have type annotations: `GetQuery<Args, Return>`
- [ ] Entities listed in `main.wasp`
- [ ] Auth helpers used: `getEmail(user)` NOT `user.email`

**Check imports:**

```bash
# Find incorrect @wasp imports
grep -r "@wasp/" app/src/ --include="*.ts" --include="*.tsx"
# ✅ Should return NOTHING
```

### 7. Client-Server Separation ✅

- [ ] Client code NEVER imports from `app/src/server/`
- [ ] Operations used for ALL server communication
- [ ] `process.env` ONLY in server code
- [ ] `import.meta.env.REACT_APP_*` ONLY in client code
- [ ] Prisma client NOT accessible in browser

### 8. Third-Party Integration Security ✅

**Webhooks:**

- [ ] Stripe webhook signature verification active
- [ ] LemonSqueezy webhook signature verification active
- [ ] Webhook errors logged (for attack detection)
- [ ] NO webhook bypasses signature check

**API Keys:**

- [ ] OpenAI API key in `.env.server`
- [ ] Payment processor keys in `.env.server`
- [ ] Email provider keys in `.env.server`
- [ ] Analytics tokens appropriate for public/private

---

## Pre-Deploy Checklist (Production)

### 1. Security Audit ✅

```bash
# Run comprehensive security audit
npm run security:audit
# Or manual:
cd reports/security-audit && ls -lt | head -5
# ✅ Should show recent audit report (<7 days old)
```

- [ ] Security audit report exists (< 7 days old)
- [ ] ZERO critical findings
- [ ] ZERO high findings
- [ ] All medium findings addressed or documented as tech debt
- [ ] OWASP Top 10 compliance verified

### 2. Dependency Audit ✅

**CI/CD Automation:** ✅ Active - See `.github/workflows/pr-checks.yml` (dependency-audit job)

```bash
npm audit --production
cd app && npm audit --production

# Check CI/CD audit status
gh pr checks

# View detailed audit report (if failed)
gh run download <run-id> --name npm-audit-report
```

- [ ] NO critical vulnerabilities
- [ ] NO high vulnerabilities
- [ ] Medium vulnerabilities reviewed and accepted OR fixed
- [ ] Dependencies up to date (< 3 months old)
- [ ] CI/CD dependency-audit job passing ✅

**Process:** See [DEPENDENCY-MANAGEMENT.md](DEPENDENCY-MANAGEMENT.md) for complete dependency management workflow.

### 3. Test Coverage ✅

```bash
cd app && wasp test client run --coverage
```

- [ ] Component/Unit tests: ≥80% coverage
- [ ] E2E tests: ≥75% coverage
- [ ] ALL tests passing (0 failures)
- [ ] NO skipped tests (unless documented)

### 4. Configuration Verification ✅

**main.wasp:**

- [ ] HTTPS enforced (production)
- [ ] Security headers configured (Helmet)
- [ ] CORS properly configured
- [ ] Session timeout configured
- [ ] Email sender configured (NOT Dummy provider!)

**Environment:**

- [ ] ALL production secrets set in Fly.io
- [ ] DATABASE_URL points to production DB
- [ ] OPENAI_API_KEY valid and funded
- [ ] Payment processor keys are LIVE keys (not test)
- [ ] Email sender configured with production account

**Verify secrets:**

```bash
wasp deploy fly cmd --context server secrets list
# ✅ Should show all required secrets
```

### 5. Database ✅

- [ ] All migrations applied
- [ ] Connection pool configured
- [ ] Backups enabled and tested
- [ ] Indexes exist on all foreign keys
- [ ] NO test data in production DB

### 6. Logging & Monitoring ✅

- [ ] Structured logging configured (Winston/Pino)
- [ ] Error tracking configured (Sentry/etc)
- [ ] Audit logging active for:
  - Admin actions
  - Payment events
  - Failed auth attempts
  - Permission errors (403)
- [ ] Log rotation configured
- [ ] NO sensitive data in logs (passwords, tokens)

### 7. Rate Limiting ✅

```bash
# Check for rate limiting implementation
grep -r "rate.*limit\|RateLimit\|ApiUsageLog" app/src/
# ✅ Should find rate limiting code
```

- [ ] OpenAI API rate limited
- [ ] Auth endpoints rate limited
- [ ] Payment endpoints rate limited
- [ ] File upload rate limited

### 8. Performance & Scaling ✅

- [ ] Database queries use pagination
- [ ] NO N+1 query problems
- [ ] Images optimized
- [ ] Bundle size < 500KB (initial load)
- [ ] API response times < 500ms (p95)

---

## Security Incident Response

**If a security issue is discovered:**

1. **Immediate Actions:**

   ```bash
   # Revoke compromised credentials
   wasp deploy fly cmd --context server secrets set OLD_KEY="revoked"

   # Roll back if needed
   git revert <commit-hash>
   git push origin main

   # Notify team
   # Create incident report
   ```

2. **Investigation:**

   - Review logs for exploit attempts
   - Identify affected users/data
   - Determine root cause

3. **Remediation:**

   - Apply security patch
   - Run security audit
   - Update Security Checklist (this file)

4. **Post-Mortem:**
   - Document in `reports/security-audit/YYYY-MM-DD-incident-<title>.md`
   - Update prevention measures
   - Share learnings with team

---

## Automated Checks (Git Hooks)

**Pre-commit hook** (`.husky/pre-commit`) runs:

1. ESLint security rules
2. TypeScript type checking
3. Temporary file cleanup
4. (Future) Security pattern validation

**Pre-push hook** (`.husky/pre-push`) runs:

1. Unit tests
2. Integration tests
3. (Future) Security scan

---

## Security Tools

| Tool                        | Purpose                      | Frequency                | Status      |
| --------------------------- | ---------------------------- | ------------------------ | ----------- |
| **security-auditor** (Opus) | OWASP Top 10 scan            | Phase 4 TDD + Pre-deploy | ✅ Active   |
| **npm audit** (CI/CD)       | Dependency vulnerabilities   | Every PR + Daily         | ✅ Active   |
| **Wasp type checker**       | Type safety                  | Every commit             | ✅ Active   |
| **ESLint security plugin**  | Code pattern vulnerabilities | Every commit             | ✅ Active   |
| **Snyk / Dependabot**       | Automated dependency updates | Weekly                   | ⚠️ Optional |

---

## References

- **Security Audit Reports:** `reports/security-audit/`
- **OWASP Top 10 (2021):** https://owasp.org/Top10/
- **Wasp Security Docs:** https://wasp.sh/docs/auth/overview
- **OpenSaaS Security Guide:** https://docs.opensaas.sh/guides/security/
- **Constitution (Security Rules):** `CLAUDE.md` (root)

---

**Last updated:** 2025-11-05 (Dependency management automation added - Finding 004 remediation)
**Next review:** Before next production deployment

**Recent Changes:**

- 2025-11-05: Added CI/CD npm audit automation + DEPENDENCY-MANAGEMENT.md documentation
- 2025-10-23: Phase 4 Complete Security Audit
