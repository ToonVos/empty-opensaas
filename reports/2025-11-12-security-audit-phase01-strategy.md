# Security Audit Strategy: Phase 01 - AI Model Discovery & Operations

**Report Type:** Security Audit - Strategy & Execution Plan  
**Date:** 2025-11-12  
**Scope:** Phase 01 AI Infrastructure Implementation  
**Feature:** AI Provider Management, Model Discovery, Configuration, System Prompts  
**Status:** ⚠️ READY FOR EXECUTION

**Source Context:** `/reports/Phase01-Security-Context.md` (1071 lines, 18 files analyzed)  
**Target Agent:** security-auditor (Opus)  
**Estimated Duration:** 2-3 hours

---

## Executive Summary

### Feature Risk Profile

**Overall Risk Level:** LOW (based on preliminary analysis)

**Risk Factors:**

- **Data Sensitivity:** HIGH (API keys, encrypted secrets)
- **Attack Surface:** MEDIUM (10 operations, external API calls)
- **Authentication Requirements:** HIGH (owner-only access)
- **Complexity:** MEDIUM (encryption, multi-provider, versioning)

**Risk Matrix:**

```
                      IMPACT
              LOW    MEDIUM   HIGH   CRITICAL
         ┌──────────────────────────────────┐
    HIGH │        │        │  API   │        │
LIKE-    │        │        │ Keys   │        │
LI-  MED │        │ Input  │        │        │
HOOD     │        │  Val   │        │        │
     LOW │        │        │        │        │
         └──────────────────────────────────┘
```

**Preliminary Assessment (from exploration):**

- ✅ Mature security patterns detected
- ✅ Strong cryptographic controls (AES-256-CBC)
- ✅ Comprehensive audit logging
- ⚠️ 3 critical gaps identified (must address)

---

### Success Criteria

**Audit PASSES if:**

1. ✅ ALL CRITICAL issues resolved (0 remaining)
2. ✅ ALL HIGH issues fixed or documented
3. ✅ MEDIUM/LOW issues in risk register
4. ✅ Security test coverage ≥80% for critical paths
5. ✅ OWASP Top 10 compliance verified

**Blocking Conditions (MERGE DENIED if):**

- 🔴 ANY CRITICAL severity finding unresolved
- 🔴 HIGH severity findings without remediation plan
- 🔴 Security tests FAILING

---

### Known Gaps from Exploration

**Must address during audit:**

| Gap                               | Location       | Severity | Action                                  |
| --------------------------------- | -------------- | -------- | --------------------------------------- |
| Missing `.env.server.example`     | Root/app/      | HIGH     | Flag as finding, create example         |
| `User.isOwner` field not verified | schema.prisma  | HIGH     | Verify field exists (CONFIRMED line 17) |
| No `deleteAIProvider` operation   | operations.ts  | MEDIUM   | Document as incomplete CRUD             |
| Section validation missing        | `updatePrompt` | MEDIUM   | Flag for input validation review        |

**Status Update:** `User.isOwner` VERIFIED in schema.prisma:17 ✅

---

## Audit Execution Strategy

### 1. Priority Ordering

**Audit OWASP categories in this order:**

```
Phase 1: FOUNDATION (30 min)
├─ A01: Broken Access Control       (Authentication & Authorization)
└─ A07: Identification & Auth       (Wasp auth delegation)

Phase 2: DATA PROTECTION (30 min)
├─ A02: Cryptographic Failures      (API key encryption, secrets)
└─ A08: Software & Data Integrity   (Prompt versioning, audit log)

Phase 3: ATTACK SURFACE (40 min)
├─ A03: Injection                   (Input validation, SQL injection)
└─ A10: SSRF                        (External API calls)

Phase 4: CONFIGURATION (30 min)
├─ A04: Insecure Design             (Architecture review)
├─ A05: Security Misconfiguration   (Error handling, defaults)
└─ A06: Vulnerable Components       (Dependencies)

Phase 5: MONITORING (20 min)
└─ A09: Logging & Monitoring        (Audit log coverage)
```

**Rationale:**

- **Foundation first:** Auth failures = total breach
- **Data protection:** API keys = crown jewels
- **Attack surface:** Most common attack vectors
- **Configuration:** Environmental/architectural issues
- **Monitoring:** Detection capabilities

---

### 2. OWASP Top 10 Audit Checklist

#### A01: Broken Access Control

**Priority:** CRITICAL  
**Estimated Time:** 20 minutes

**Specific Checks:**

| Check                             | File:Line             | Evidence to Collect                                               | Pass Criteria                                  |
| --------------------------------- | --------------------- | ----------------------------------------------------------------- | ---------------------------------------------- |
| ✅ All operations have auth check | operations.ts:119-901 | `requireOwnerAuth()` or `requireOwnerWithOrganization()` at start | Present in ALL 10 operations                   |
| ✅ Owner-only access enforced     | auth-helpers.ts:31-39 | `context.user.isOwner` check                                      | Throws 403 if false                            |
| ✅ Organization filtering         | operations.ts:536-547 | `where: { organizationId }` in queries                            | Multi-tenant ops filtered                      |
| ✅ Direct object reference checks | operations.ts:293-298 | `findUnique()` + 404 throw                                        | Existence validated before access              |
| ✅ No privilege escalation paths  | operations.ts:ALL     | Permission checks immutable                                       | No bypass mechanisms                           |
| ✅ User.isOwner field exists      | schema.prisma:17      | Field definition                                                  | ✅ VERIFIED: `isOwner Boolean @default(false)` |

**Evidence Format:**

````markdown
### A01: Broken Access Control

**Status:** ✅ PASS / ⚠️ ISSUES FOUND / 🔴 CRITICAL FAILURE

**Findings:**

- [SEVERITY] Description
  - Location: file:line
  - Evidence: Code snippet
  - Impact: Likelihood × Impact = Risk
  - Remediation: Specific fix

**Code Evidence:**

```typescript
// operations.ts:124
if (!context.user) throw new HttpError(401);
if (!context.user.isOwner) throw new HttpError(403);
```
````

````

**Pass/Fail Criteria:**

- ✅ PASS: All operations protected, no bypass found
- ⚠️ PARTIAL: Minor gaps (e.g., missing check in non-critical operation)
- 🔴 FAIL: Any operation accessible without auth OR privilege escalation possible

---

#### A02: Cryptographic Failures

**Priority:** CRITICAL
**Estimated Time:** 25 minutes

**Specific Checks:**

| Check | File:Line | Evidence to Collect | Pass Criteria |
|-------|-----------|---------------------|---------------|
| ✅ Strong encryption algorithm | encryption.ts:67-87 | AES-256-CBC usage | NIST-approved algorithm |
| ✅ Random IV per encryption | encryption.ts:76 | `crypto.randomBytes(16)` | IV never reused |
| ✅ Encryption key from env var | encryption.ts:26-48 | `process.env.API_KEY_ENCRYPTION_KEY` | Not hardcoded |
| ✅ Key validation | encryption.ts:32-44 | 64 hex char check, 32-byte buffer | Strict format enforcement |
| ✅ No plaintext API keys in DB | operations.ts:197 | `encryptApiKey()` before create | Encrypted at rest |
| ✅ Decryption only when needed | operations.ts:309 | Only in testFn() calls | Minimal plaintext exposure |
| ✅ API keys masked in responses | operations.ts:137-148 | `maskApiKey()` usage | Never exposed |
| ⚠️ Encryption key documentation | .env.server.example | File existence | ❌ MISSING (flag as HIGH) |

**Risk Assessment:**

- **Likelihood if encryption weak:** MEDIUM (requires DB access)
- **Impact if encryption broken:** CRITICAL (all API keys compromised)
- **Current Risk:** LOW (strong encryption + key in env var)

**Evidence Format:**

```markdown
### A02: Cryptographic Failures

**Encryption Implementation:**
```typescript
// encryption.ts:67-87
const iv = crypto.randomBytes(16)  // ✅ Random IV
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)  // ✅ AES-256
````

**Findings:**

- [HIGH] Missing .env.server.example documentation
  - Location: Root directory
  - Impact: Developers may not know encryption key is required
  - Remediation: Create .env.server.example with API_KEY_ENCRYPTION_KEY placeholder

````

---

#### A03: Injection

**Priority:** HIGH
**Estimated Time:** 25 minutes

**Specific Checks:**

| Check | File:Line | Evidence to Collect | Pass Criteria |
|-------|-----------|---------------------|---------------|
| ✅ No raw SQL | operations.ts:ALL | 100% Prisma ORM | Zero raw SQL queries |
| ✅ Input validation on name | validation.ts:48-67 | Whitelist + regex | Alphanumeric only |
| ✅ Input validation on apiKey | validation.ts:86-102 | Length limits | 10-500 chars |
| ✅ Input validation on params | validation.ts:220-241 | Range checks | Temperature/topP 0-1 |
| ✅ Input validation on prompt | validation.ts:195-207 | Length limit | Max 10k chars |
| ⚠️ Section validation missing | operations.ts:711 | `args.section` NOT validated | ❌ GAP FOUND (flag as MEDIUM) |
| ✅ Parameterized queries | operations.ts:ALL | Prisma object literals | Not string interpolation |
| ✅ Dynamic where clauses safe | operations.ts:491-503 | Object literal construction | Not string concatenation |

**Test Coverage Check:**

```bash
# Should run during audit
grep -r "describe.*injection" app/src/server/ai/*.test.ts
grep -r "malicious.*input" app/src/server/ai/*.test.ts
````

**Expected:** Tests for SQL injection attempts, XSS in prompts, command injection

**Evidence Format:**

```markdown
### A03: Injection

**Database Queries:** 100% Prisma ORM ✅

**Input Validation Coverage:**

- ✅ Provider name: Whitelist ["OpenAI", "Anthropic", "Azure OpenAI"]
- ✅ API key: Length 10-500 chars
- ✅ Temperature/topP: Range 0-1
- ⚠️ Section: NOT VALIDATED

**Findings:**

- [MEDIUM] Section validation missing in updatePrompt
  - Location: operations.ts:711
  - Risk: Invalid section values could bypass logic
  - Remediation: Add validateSection() with enum check
```

---

#### A04: Insecure Design

**Priority:** MEDIUM  
**Estimated Time:** 20 minutes

**Specific Checks:**

| Check                        | File:Line                    | Evidence to Collect                  | Pass Criteria          |
| ---------------------------- | ---------------------------- | ------------------------------------ | ---------------------- |
| ✅ Encryption-at-rest design | encryption.ts:FULL           | Encrypt before store, decrypt on use | Secure by design       |
| ✅ Audit logging design      | auditLogger.ts:FULL          | Log all security events              | Complete trail         |
| ✅ Rate limiting on tests    | operations.ts:285-395        | 10 tests/hour limit                  | Abuse prevention       |
| ✅ Prompt versioning         | prompt-versioning-helpers.ts | Rollback capability                  | Data integrity         |
| ⚠️ No delete operation       | operations.ts                | Missing deleteAIProvider             | Incomplete CRUD        |
| ⚠️ No rate limit on creation | operations.ts:177-215        | No throttling                        | Provider spam possible |
| ✅ Error handling resilience | operations.ts:568-571        | Audit failure doesn't block          | Availability preserved |

**Architecture Review:**

- **Separation of concerns:** ✅ Encryption, validation, audit in separate modules
- **Defense in depth:** ✅ Multiple layers (auth → validation → audit)
- **Least privilege:** ✅ Owner-only access enforced

**Evidence Format:**

```markdown
### A04: Insecure Design

**Architecture Patterns:**

- ✅ Encryption-at-rest: API keys encrypted before DB write
- ✅ Rate limiting: 10 connection tests per hour
- ✅ Audit logging: Fire-and-forget pattern (resilience)

**Findings:**

- [MEDIUM] Incomplete CRUD: No deleteAIProvider operation
  - Impact: Cannot remove providers (security liability)
  - Remediation: Implement delete with audit logging
- [MEDIUM] No rate limiting on provider creation
  - Impact: Potential provider spam
  - Remediation: Add rate limit (e.g., 5 providers/day)
```

---

#### A05: Security Misconfiguration

**Priority:** MEDIUM  
**Estimated Time:** 20 minutes

**Specific Checks:**

| Check                        | File:Line             | Evidence to Collect                 | Pass Criteria                 |
| ---------------------------- | --------------------- | ----------------------------------- | ----------------------------- |
| ✅ Timeouts configured       | operations.ts:224-228 | 10s timeout, 1 retry                | Resource exhaustion prevented |
| ✅ Error messages sanitized  | operations.ts:329-368 | Generic messages for unknown errors | No stack traces               |
| ✅ No debug output           | operations.ts:ALL     | Only console.error for internal     | No sensitive data logged      |
| ✅ Environment variables     | encryption.ts:27      | `process.env` usage                 | No hardcoded secrets          |
| ⚠️ Missing env documentation | .env.server.example   | File missing                        | Deployment gap                |
| ✅ Proper HTTP status codes  | operations.ts:ALL     | 401/403/404/400/429/409             | Standard codes                |
| ✅ Default secure            | schema.prisma:420-424 | `status: INACTIVE` default          | Opt-in activation             |

**Configuration Files to Check:**

- `.env.server.example` (missing - HIGH finding)
- `schema.prisma` (defaults secure)
- `main.wasp` (auth configured)

**Evidence Format:**

```markdown
### A05: Security Misconfiguration

**Secure Defaults:**

- ✅ Provider status: INACTIVE by default (opt-in activation)
- ✅ API timeouts: 10 seconds (DOS prevention)
- ✅ Error messages: Generic fallback (no info disclosure)

**Findings:**

- [HIGH] Missing .env.server.example
  - Impact: Developers don't know required env vars
  - Remediation: Create with API_KEY_ENCRYPTION_KEY placeholder
```

---

#### A06: Vulnerable Components

**Priority:** MEDIUM  
**Estimated Time:** 15 minutes

**Specific Checks:**

| Check                     | File:Line       | Evidence to Collect                | Pass Criteria       |
| ------------------------- | --------------- | ---------------------------------- | ------------------- |
| ✅ SDK versions recent    | package.json    | openai ^4.104.0, anthropic ^0.68.0 | Latest stable       |
| ✅ Semantic versioning    | package.json    | Caret (^) ranges                   | Auto-patch updates  |
| ✅ No deprecated packages | package.json    | Check deprecation notices          | All maintained      |
| ✅ Built-in crypto module | encryption.ts:1 | Node.js crypto import              | No 3rd party crypto |

**Commands to Run:**

```bash
# Check for vulnerabilities
npm audit --json > /tmp/audit-results.json

# Check outdated packages
npm outdated --json > /tmp/outdated-packages.json

# Analyze results
cat /tmp/audit-results.json | jq '.vulnerabilities'
```

**Evidence Format:**

````markdown
### A06: Vulnerable Components

**NPM Audit Results:**

```json
{
  "vulnerabilities": 0,
  "info": 0,
  "low": 0,
  "moderate": 0,
  "high": 0,
  "critical": 0
}
```
````

**SDK Versions:**

- openai: ^4.104.0 (latest: 4.104.0) ✅
- @anthropic-ai/sdk: ^0.68.0 (latest: 0.68.1) ⚠️ Patch available

**Findings:**

- [LOW] Anthropic SDK patch update available
  - Current: 0.68.0, Latest: 0.68.1
  - Remediation: Update to latest patch version

````

---

#### A07: Identification & Authentication Failures

**Priority:** HIGH
**Estimated Time:** 15 minutes

**Specific Checks:**

| Check | File:Line | Evidence to Collect | Pass Criteria |
|-------|-----------|---------------------|---------------|
| ✅ Auth delegated to Wasp | auth-helpers.ts:31-39 | `context.user` check | Framework handles auth |
| ✅ No password storage | operations.ts:ALL | No password fields | Wasp auth handles |
| ✅ API keys hashed at rest | encryption.ts:67-87 | AES-256 encryption | Secure storage |
| ✅ Owner role enforcement | auth-helpers.ts:36 | `context.user.isOwner` check | Role-based access |
| ✅ No auth bypass | operations.ts:ALL | Auth check FIRST in all ops | No bypass path |

**Wasp Auth Configuration Check:**

```wasp
// main.wasp
auth {
  userEntity: User,
  methods: {
    email: {},
    usernameAndPassword: {}
  }
}
````

**Evidence Format:**

```markdown
### A07: Identification & Authentication

**Authentication Architecture:**

- ✅ Wasp framework handles auth (no custom implementation)
- ✅ Password storage: Delegated to Wasp (bcrypt)
- ✅ Session management: Delegated to Wasp

**Authorization Checks:**

- ✅ requireOwnerAuth() on 7 operations
- ✅ requireOwnerWithOrganization() on 2 operations
- ✅ No operations without auth check

**Findings:** None ✅
```

---

#### A08: Software & Data Integrity Failures

**Priority:** MEDIUM  
**Estimated Time:** 15 minutes

**Specific Checks:**

| Check                        | File:Line                    | Evidence to Collect             | Pass Criteria          |
| ---------------------------- | ---------------------------- | ------------------------------- | ---------------------- |
| ✅ Prompt versioning         | prompt-versioning-helpers.ts | Version history maintained      | Rollback capability    |
| ✅ Audit log integrity       | schema.prisma:117-148        | Immutable audit records         | Cannot delete/modify   |
| ✅ Rollback logging          | operations.ts:735-745        | Audit log on rollback           | Tracked in audit trail |
| ✅ Model sync tracking       | operations.ts:886-895        | System events logged            | Discovery tracked      |
| ⚠️ No signature verification | operations.ts:ALL            | External API responses unsigned | Trust OpenAI/Anthropic |

**Data Integrity Checks:**

```prisma
// schema.prisma:117-148
model AuditLog {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())  // Immutable timestamp
  action    String
  actorId   String
  // ... no UPDATE or DELETE operations exist
}
```

**Evidence Format:**

```markdown
### A08: Software & Data Integrity

**Version Control:**

- ✅ SystemPrompt: Version history with rollback
- ✅ Audit log: Immutable records (create-only)

**External Dependencies:**

- ⚠️ OpenAI/Anthropic responses not signature-verified
- Impact: LOW (official SDKs, HTTPS only)
- Acceptable risk: Trust official providers

**Findings:**

- [LOW] External API responses unsigned
  - Impact: Theoretical MITM attack (mitigated by HTTPS)
  - Remediation: Accept risk (standard practice)
```

---

#### A09: Security Logging & Monitoring Failures

**Priority:** MEDIUM  
**Estimated Time:** 20 minutes

**Specific Checks:**

| Check                               | File:Line                    | Evidence to Collect         | Pass Criteria          |
| ----------------------------------- | ---------------------------- | --------------------------- | ---------------------- |
| ✅ Security events logged           | auditLogger.ts:FULL          | All actions defined         | Complete coverage      |
| ✅ Includes who/what/when           | operations.ts:209-212        | userId, action, timestamp   | Audit trail complete   |
| ✅ Console + database logging       | auditLogger.ts:55-69, 95-119 | Both targets used           | Redundancy             |
| ✅ NO sensitive data in logs        | auditLogger.ts:FULL          | API keys NOT logged         | Secure logging         |
| ⚠️ DELETE action defined but unused | auditLogger.ts:23            | No delete operation         | Incomplete coverage    |
| ✅ Resilience pattern               | operations.ts:568-571        | Audit failure doesn't block | Availability preserved |

**Audit Coverage Matrix:**

| Operation       | Logged | Details Captured                  |
| --------------- | ------ | --------------------------------- |
| Create provider | ✅     | providerId, name                  |
| Update provider | ✅     | providerId, fields changed        |
| Test connection | ✅     | providerId, success, status       |
| Delete provider | ⚠️     | Action defined, operation missing |
| Sync models     | ✅     | providerId, count                 |
| Update config   | ✅     | section, modelId, params          |
| Update prompt   | ✅     | section, version, length          |
| Rollback prompt | ✅     | section, fromVersion, toVersion   |

**Evidence Format:**

````markdown
### A09: Security Logging & Monitoring

**Audit Log Schema:**

```prisma
model AuditLog {
  action      String   // What happened
  actorId     String   // Who did it
  createdAt   DateTime // When it happened
  targetId    String?  // What was affected
  details     Json     // Context data
  success     Boolean  // Outcome
}
```
````

**Coverage Analysis:**

- ✅ 8/9 operations logged (89%)
- ⚠️ DELETE_PROVIDER action defined but no delete operation exists

**Findings:**

- [MEDIUM] Incomplete audit coverage (delete operation missing)
  - Impact: Cannot audit provider deletion (when implemented)
  - Remediation: Implement deleteAIProvider with audit logging

````

---

#### A10: Server-Side Request Forgery (SSRF)

**Priority:** LOW
**Estimated Time:** 15 minutes

**Specific Checks:**

| Check | File:Line | Evidence to Collect | Pass Criteria |
|-------|-----------|---------------------|---------------|
| ✅ No user-controlled URLs | operations.ts:ALL | Official SDKs only | No fetch() with user input |
| ✅ Hardcoded model IDs | constants.ts:24-25 | Model names from constants | Not user-provided |
| ✅ Timeouts configured | operations.ts:224-228 | 10s timeout | Resource exhaustion prevented |
| ✅ Official SDKs only | operations.ts:224-265 | OpenAI, Anthropic SDKs | No arbitrary HTTP |
| ✅ API endpoints hardcoded | SDK internals | Default endpoints used | Not configurable |

**External Request Analysis:**

```typescript
// operations.ts:224-239
const client = new OpenAI({
  apiKey,  // ✅ No URL parameter
  timeout: API_CONNECTION_TIMEOUT_MS,  // ✅ 10s timeout
})

// No baseUrl override → Official OpenAI API only
await client.models.list()  // ✅ Official endpoint
````

**Evidence Format:**

```markdown
### A10: Server-Side Request Forgery (SSRF)

**External API Calls:**

- ✅ OpenAI SDK: Official endpoints only (no baseUrl override)
- ✅ Anthropic SDK: Official endpoints only
- ✅ Azure AI: No external calls (manual config)

**User Input Analysis:**

- ✅ No URL parameters accepted
- ✅ No fetch() with user-controlled URLs
- ✅ Model IDs from constants (not user input)

**Findings:** None ✅
```

---

### 3. Risk Assessment Framework

#### Likelihood Scale

| Level      | Description          | Criteria                                              |
| ---------- | -------------------- | ----------------------------------------------------- |
| **LOW**    | Difficult to exploit | Requires DB access + decryption key OR insider threat |
| **MEDIUM** | Moderate difficulty  | Requires auth bypass OR vulnerable dependency         |
| **HIGH**   | Easy to exploit      | Missing auth check OR weak encryption                 |

#### Impact Scale

| Level        | Description                | Criteria                                     |
| ------------ | -------------------------- | -------------------------------------------- |
| **LOW**      | Minor inconvenience        | Feature unavailable OR minor data exposure   |
| **MEDIUM**   | Data breach (limited)      | Single user data exposed OR temporary outage |
| **HIGH**     | Data breach (extensive)    | Multiple users affected OR prolonged outage  |
| **CRITICAL** | Complete system compromise | All API keys exposed OR full database breach |

#### Risk Matrix

```
                      IMPACT
              LOW    MEDIUM   HIGH   CRITICAL
         ┌──────────────────────────────────┐
    HIGH │  MED   │  HIGH  │  CRIT  │  CRIT  │
LIKE-    │        │        │        │        │
LI-  MED │  LOW   │  MED   │  HIGH  │  CRIT  │
HOOD     │        │        │        │        │
     LOW │  LOW   │  LOW   │  MED   │  HIGH  │
         └──────────────────────────────────┘
```

#### Severity Calculation

**Example 1: Weak Encryption**

- Likelihood: MEDIUM (requires DB access)
- Impact: CRITICAL (all API keys exposed)
- **Risk: CRITICAL** → BLOCK MERGE

**Example 2: Missing .env.server.example**

- Likelihood: HIGH (all developers affected)
- Impact: MEDIUM (deployment misconfiguration)
- **Risk: HIGH** → FIX BEFORE MERGE

**Example 3: No delete operation**

- Likelihood: LOW (feature not implemented)
- Impact: LOW (manual workaround available)
- **Risk: LOW** → DOCUMENT IN BACKLOG

---

### 4. Remediation Approach

#### Severity-Based Response

**CRITICAL Findings:**

- **Action:** FIX IMMEDIATELY (no merge until resolved)
- **Timeline:** Same day
- **Approval:** Security review required after fix
- **Documentation:** security-fixes.md + code comments

**HIGH Findings:**

- **Action:** FIX BEFORE MERGE or DOCUMENT IN RISK REGISTER
- **Timeline:** Before PR approval
- **Approval:** Tech Lead or Security Auditor sign-off
- **Documentation:** security-fixes.md + risk-register.md

**MEDIUM Findings:**

- **Action:** DOCUMENT IN RISK REGISTER + PLAN FOR NEXT SPRINT
- **Timeline:** Next sprint planning
- **Approval:** Product Owner prioritization
- **Documentation:** risk-register.md + backlog ticket

**LOW Findings:**

- **Action:** DOCUMENT IN RISK REGISTER (backlog)
- **Timeline:** No deadline (opportunistic fix)
- **Approval:** None required
- **Documentation:** risk-register.md

---

#### Remediation Workflow

```
Finding Identified
       ↓
Severity Assessment (Likelihood × Impact)
       ↓
   ┌───┴───────────────────────────┐
   │                               │
CRITICAL/HIGH                 MEDIUM/LOW
   │                               │
   ↓                               ↓
Create security-fixes.md      Document in risk-register.md
   ↓                               ↓
Implement fix immediately     Create backlog ticket
   ↓                               ↓
Re-run affected tests        Prioritize in next sprint
   ↓                               ↓
Security review              Track in risk register
   ↓
MERGE APPROVED
```

---

### 5. Security Test Gap Analysis

#### Expected Test Coverage (from TDD)

**Test Plan Location:** `tasks/sprints/sprint-03/dev2/tests/test-plan.md`

**Coverage Requirements:**

- Unit tests: ≥80% statement coverage
- Integration tests: ≥75% statement coverage
- Security scenarios: 100% coverage of auth/validation paths

#### Security Test Scenarios (MUST VERIFY)

**Authentication Tests:**

| Scenario       | Expected Test | Location                        | Status      |
| -------------- | ------------- | ------------------------------- | ----------- |
| No auth token  | 401 error     | operations.test.ts:auth-checks  | ✅ (verify) |
| Non-owner user | 403 error     | operations.test.ts:owner-checks | ✅ (verify) |
| Owner user     | Success       | operations.test.ts:owner-access | ✅ (verify) |

**Validation Tests:**

| Scenario                 | Expected Test | Location                              | Status        |
| ------------------------ | ------------- | ------------------------------------- | ------------- |
| Empty provider name      | 400 error     | validation.test.ts:provider-name      | ✅ (verify)   |
| Invalid characters       | 400 error     | validation.test.ts:provider-name      | ✅ (verify)   |
| Unlisted provider        | 400 error     | validation.test.ts:provider-whitelist | ✅ (verify)   |
| Short API key (<10)      | 400 error     | validation.test.ts:api-key            | ✅ (verify)   |
| Long API key (>500)      | 400 error     | validation.test.ts:api-key            | ✅ (verify)   |
| Temperature out of range | 400 error     | validation.test.ts:temperature        | ✅ (verify)   |
| Invalid section          | 400 error     | validation.test.ts:section            | ⚠️ (missing?) |

**Encryption Tests:**

| Scenario                      | Expected Test         | Location                             | Status      |
| ----------------------------- | --------------------- | ------------------------------------ | ----------- |
| Encrypt/decrypt roundtrip     | Matches original      | encryption.test.ts:roundtrip         | ✅ (verify) |
| Same input → different output | Not equal (random IV) | encryption.test.ts:semantic-security | ✅ (verify) |
| Masking preserves length      | <8 chars = "\*\*\*"   | encryption.test.ts:masking           | ✅ (verify) |

**Integration Tests:**

| Scenario                  | Expected Test          | Location                        | Status      |
| ------------------------- | ---------------------- | ------------------------------- | ----------- |
| OpenAI connection test    | Success with valid key | integration.test.ts:openai      | ✅ (verify) |
| Anthropic connection test | Success with valid key | integration.test.ts:anthropic   | ✅ (verify) |
| Invalid API key           | Error handling         | integration.test.ts:invalid-key | ✅ (verify) |
| Rate limiting             | 429 after 10 tests     | integration.test.ts:rate-limit  | ✅ (verify) |

---

#### Commands to Run During Audit

```bash
# Check test coverage
cd app && wasp test client run --coverage

# Find security-related tests
grep -r "describe.*auth" src/server/ai/*.test.ts
grep -r "describe.*validation" src/server/ai/*.test.ts
grep -r "describe.*encryption" src/server/ai/*.test.ts
grep -r "401\|403\|404\|400" src/server/ai/*.test.ts

# Count test scenarios per category
grep -c "it(" src/server/ai/operations.test.ts
grep -c "it(" src/server/ai/validation.test.ts
grep -c "it(" src/server/ai/encryption.test.ts

# Verify no skipped tests
grep -r "it.skip\|describe.skip" src/server/ai/*.test.ts
```

---

#### Gap Analysis Output Format

```markdown
## Security Test Coverage

**Overall Coverage:**

- Unit tests: 85% (target: ≥80%) ✅
- Integration tests: 78% (target: ≥75%) ✅
- Auth scenarios: 12/12 tested (100%) ✅
- Validation scenarios: 15/16 tested (94%) ⚠️

**Missing Tests:**

- [MEDIUM] Section validation test missing
  - Expected: 400 error for invalid section
  - Location: validation.test.ts (needs addition)
  - Remediation: Add test for A3SectionType validation

**Test Quality Issues:**

- [None found] ✅

**Recommendations:**

1. Add section validation test (validation.test.ts)
2. Verify rate limiting test exercises full 10-request limit
3. Add integration test for audit log resilience (failure scenario)
```

---

### 6. Evidence Collection

#### Required Evidence per OWASP Category

**A01: Broken Access Control**

```markdown
**Code Snippets:**

- requireOwnerAuth() implementation
- All 10 operations' auth checks
- Organization filtering examples

**Configuration:**

- main.wasp operation declarations
- schema.prisma User model (isOwner field)

**Tests:**

- operations.test.ts:auth-checks
- operations.test.ts:owner-checks

**Manual Verification:**

- Attempted access without auth (expect 401)
- Attempted access as non-owner (expect 403)
```

**A02: Cryptographic Failures**

```markdown
**Code Snippets:**

- encryptApiKey() function
- decryptApiKey() function
- getEncryptionKey() validation

**Configuration:**

- .env.server.example (or lack thereof)
- Environment variable usage

**Tests:**

- encryption.test.ts:roundtrip
- encryption.test.ts:semantic-security

**Manual Verification:**

- Database query: SELECT apiKey FROM AIProvider (expect hex:hex format)
- Decryption test with invalid key (expect error)
```

**A03: Injection**

```markdown
**Code Snippets:**

- All validateX() functions
- Prisma query examples (no raw SQL)

**Configuration:**

- schema.prisma (Prisma ORM usage)

**Tests:**

- validation.test.ts:ALL

**Manual Verification:**

- Input malicious provider name (expect 400)
- Input SQL injection attempt (expect 400 or no effect)
```

**A06: Vulnerable Components**

````markdown
**NPM Audit Output:**

```bash
npm audit --json > /tmp/audit-results.json
cat /tmp/audit-results.json | jq
```
````

**Package Versions:**

```bash
npm list openai @anthropic-ai/sdk
```

**Outdated Packages:**

```bash
npm outdated
```

````

---

#### Evidence Storage

**Create directory structure:**

```bash
reports/security-audit/phase01-evidence/
├── code-snippets/
│   ├── auth-checks.ts
│   ├── encryption.ts
│   ├── validation.ts
│   └── ...
├── test-outputs/
│   ├── coverage-report.txt
│   ├── test-results.json
│   └── npm-audit.json
├── database-queries/
│   ├── encrypted-keys-sample.sql
│   └── audit-log-sample.sql
└── screenshots/
    ├── prisma-studio-audit-log.png
    └── ...
````

**Evidence Collection Commands:**

```bash
# Create evidence directory
mkdir -p reports/security-audit/phase01-evidence/{code-snippets,test-outputs,database-queries}

# Capture test coverage
cd app && wasp test client run --coverage > ../reports/security-audit/phase01-evidence/test-outputs/coverage-report.txt

# Capture npm audit
npm audit --json > reports/security-audit/phase01-evidence/test-outputs/npm-audit.json

# Capture key code snippets
cp app/src/server/ai/auth-helpers.ts reports/security-audit/phase01-evidence/code-snippets/
cp app/src/server/ai/encryption.ts reports/security-audit/phase01-evidence/code-snippets/
cp app/src/server/ai/validation.ts reports/security-audit/phase01-evidence/code-snippets/
```

---

### 7. Audit Sequencing & Time Allocation

**Total Estimated Time:** 2-3 hours

#### Phase 1: Foundation (30 min) - CRITICAL PATH

```
09:00-09:15 (15 min) - A01: Broken Access Control
├─ Verify auth checks in all 10 operations
├─ Verify User.isOwner field in schema
├─ Test authorization with/without owner role
└─ Evidence: Code snippets, test results

09:15-09:30 (15 min) - A07: Identification & Authentication
├─ Verify Wasp auth delegation
├─ Verify no custom password storage
├─ Check session management
└─ Evidence: main.wasp auth config
```

**Exit Criteria:** ALL operations protected, no bypass found, or STOP AUDIT (critical failure)

---

#### Phase 2: Data Protection (30 min) - CRITICAL PATH

```
09:30-09:55 (25 min) - A02: Cryptographic Failures
├─ Verify AES-256-CBC implementation
├─ Verify random IV per encryption
├─ Verify encryption key from env var
├─ Check for plaintext API keys in DB
├─ Verify API key masking in responses
├─ Check .env.server.example (expect missing)
└─ Evidence: Encryption code, DB query, npm audit

09:55-10:05 (10 min) - A08: Software & Data Integrity
├─ Verify prompt versioning
├─ Verify audit log immutability
├─ Check rollback logging
└─ Evidence: SystemPrompt schema, audit log tests
```

**Exit Criteria:** Strong encryption verified, API keys protected, or STOP AUDIT (critical failure)

---

#### Phase 3: Attack Surface (40 min) - HIGH PRIORITY

```
10:05-10:30 (25 min) - A03: Injection
├─ Verify 100% Prisma ORM (no raw SQL)
├─ Verify all input validation functions
├─ Test malicious inputs (SQL injection, XSS)
├─ Check section validation (expect missing)
└─ Evidence: Validation tests, code snippets

10:30-10:45 (15 min) - A10: SSRF
├─ Verify no user-controlled URLs
├─ Verify official SDKs only
├─ Verify hardcoded model IDs
├─ Check timeout configuration
└─ Evidence: External API call code
```

**Exit Criteria:** No injection vulnerabilities, no SSRF risk

---

#### Phase 4: Configuration (30 min) - MEDIUM PRIORITY

```
10:45-11:05 (20 min) - A04: Insecure Design
├─ Review architecture patterns
├─ Verify rate limiting on tests
├─ Check for delete operation (expect missing)
├─ Verify error handling resilience
└─ Evidence: Design documentation, code patterns

11:05-11:25 (20 min) - A05: Security Misconfiguration
├─ Verify timeout configuration
├─ Verify error message sanitization
├─ Check default secure settings
├─ Verify .env.server.example (expect missing)
└─ Evidence: Configuration files, default values

11:25-11:40 (15 min) - A06: Vulnerable Components
├─ Run npm audit
├─ Check SDK versions
├─ Verify no deprecated packages
└─ Evidence: npm audit output, package.json
```

**Exit Criteria:** No critical vulnerabilities, secure defaults verified

---

#### Phase 5: Monitoring (20 min) - LOW PRIORITY

```
11:40-12:00 (20 min) - A09: Logging & Monitoring
├─ Verify audit log coverage (expect 89%)
├─ Verify no sensitive data in logs
├─ Check resilience pattern (fire-and-forget)
├─ Verify DELETE_PROVIDER action (expect unused)
└─ Evidence: Audit log schema, test outputs
```

**Exit Criteria:** Adequate logging coverage verified

---

#### Final Review & Report Generation (30 min)

```
12:00-12:30 (30 min) - Consolidate Findings
├─ Compile all evidence
├─ Calculate risk scores
├─ Generate remediation plan
├─ Create risk register
└─ Write final report
```

---

#### Time Allocation Summary

| Phase              | Categories    | Time       | Priority | Blocking? |
| ------------------ | ------------- | ---------- | -------- | --------- |
| 1. Foundation      | A01, A07      | 30 min     | CRITICAL | YES       |
| 2. Data Protection | A02, A08      | 30 min     | CRITICAL | YES       |
| 3. Attack Surface  | A03, A10      | 40 min     | HIGH     | NO        |
| 4. Configuration   | A04, A05, A06 | 30 min     | MEDIUM   | NO        |
| 5. Monitoring      | A09           | 20 min     | LOW      | NO        |
| **TOTAL AUDIT**    | **All 10**    | **2h 30m** | -        | -         |
| Final Review       | Report        | 30 min     | -        | -         |
| **GRAND TOTAL**    | -             | **3h 00m** | -        | -         |

---

### 8. Known Gaps & Handling Strategy

#### Gap 1: Missing .env.server.example

**Status:** HIGH priority finding (from exploration)

**Audit Action:**

1. **Verify absence:** Check if file exists
2. **Flag as HIGH finding:**

   ```markdown
   [HIGH] Missing .env.server.example documentation

   - Location: app/.env.server.example
   - Impact: Developers don't know API_KEY_ENCRYPTION_KEY is required
   - Likelihood: HIGH (affects all developers)
   - Risk: HIGH (deployment failures)
   - Remediation: Create example file with placeholder
   ```

3. **Recommend creation:**
   ```bash
   # Example content
   API_KEY_ENCRYPTION_KEY=<64-hex-chars-generate-with-openssl-rand-hex-32>
   ```

**Block Merge?** YES (HIGH severity)

---

#### Gap 2: User.isOwner Field Verification

**Status:** VERIFIED ✅ (schema.prisma:17)

**Audit Action:**

1. **Confirm existence:** ✅ Already verified
2. **No finding:** Field exists, properly typed
3. **Document verification:**

   ```markdown
   ✅ User.isOwner field verified in schema.prisma:17

   - Type: Boolean
   - Default: false
   - Used in: auth-helpers.ts:36 (requireOwnerAuth)
   ```

**Block Merge?** NO (no issue)

---

#### Gap 3: No deleteAIProvider Operation

**Status:** MEDIUM priority finding (incomplete CRUD)

**Audit Action:**

1. **Verify absence:** Confirm no delete operation
2. **Flag as MEDIUM finding:**

   ```markdown
   [MEDIUM] Incomplete CRUD: No deleteAIProvider operation

   - Location: operations.ts
   - Impact: Cannot remove providers (manual DB workaround required)
   - Likelihood: LOW (feature not yet needed)
   - Risk: MEDIUM (security liability if unused providers accumulate)
   - Remediation: Implement deleteAIProvider with:
     - Owner auth check
     - Soft delete (mark as deleted, don't actually delete)
     - Audit logging (DELETE_PROVIDER action)
     - Cascade handling (deactivate related models)
   ```

3. **Recommend backlog ticket:**
   - Priority: Medium
   - Sprint: Next sprint
   - Complexity: Low (2-4 hours)

**Block Merge?** NO (document in risk register)

---

#### Gap 4: Section Validation Missing

**Status:** MEDIUM priority finding (input validation gap)

**Audit Action:**

1. **Verify absence:** Check updatePrompt operation (line 711)
2. **Flag as MEDIUM finding:**

   ````markdown
   [MEDIUM] Section validation missing in updatePrompt

   - Location: operations.ts:711
   - Impact: Invalid section values could bypass logic
   - Likelihood: MEDIUM (user input not validated)
   - Risk: MEDIUM (data integrity issue)
   - Remediation: Add validateSection() function:
     ```typescript
     function validateSection(section: string): void {
       const validSections = Object.values(A3SectionType);
       if (!validSections.includes(section as A3SectionType)) {
         throw new HttpError(400, `Invalid section: ${section}`);
       }
     }
     ```
   ````

   ```

   ```

3. **Check for test coverage:** Verify if test exists
4. **Recommend fix before merge:** HIGH priority (input validation)

**Block Merge?** NO, but STRONGLY RECOMMEND fixing (security best practice)

---

#### Gap Handling Summary

| Gap                         | Severity    | Block Merge? | Action                       |
| --------------------------- | ----------- | ------------ | ---------------------------- |
| Missing .env.server.example | HIGH        | YES          | Create example file          |
| User.isOwner field          | ✅ VERIFIED | NO           | No action needed             |
| No delete operation         | MEDIUM      | NO           | Document in risk register    |
| Section validation missing  | MEDIUM      | NO           | Recommend fix (not blocking) |

---

## Audit Execution Instructions (for security-auditor agent)

### Pre-Audit Setup

**1. Verify environment:**

```bash
# Check current directory
pwd  # Should be: /Users/toonvos/Projects/LEANAICOACH/lean-ai-coach-Dev2/app

# Verify files exist
ls -la src/server/ai/operations.ts
ls -la src/server/ai/encryption.ts
ls -la src/server/ai/validation.ts
ls -la schema.prisma
```

**2. Create evidence directory:**

```bash
cd /Users/toonvos/Projects/LEANAICOACH/lean-ai-coach-Dev2
mkdir -p reports/security-audit/phase01-evidence/{code-snippets,test-outputs,database-queries}
```

**3. Run baseline tests:**

```bash
cd app
wasp test client run --coverage > ../reports/security-audit/phase01-evidence/test-outputs/coverage-report.txt 2>&1
npm audit --json > ../reports/security-audit/phase01-evidence/test-outputs/npm-audit.json 2>&1
```

---

### Audit Execution Steps

**Follow this sequence EXACTLY:**

#### Step 1: Foundation Audit (30 min) - CRITICAL

Execute Phase 1 checks (A01, A07) as detailed in section "7. Audit Sequencing"

**Output:** `foundation-findings.md`

**Stop Condition:** If ANY CRITICAL finding (auth bypass, no owner checks) → STOP AUDIT, report immediately

---

#### Step 2: Data Protection Audit (30 min) - CRITICAL

Execute Phase 2 checks (A02, A08) as detailed in section "7. Audit Sequencing"

**Output:** `data-protection-findings.md`

**Stop Condition:** If weak encryption OR plaintext secrets → STOP AUDIT, report immediately

---

#### Step 3: Attack Surface Audit (40 min) - HIGH

Execute Phase 3 checks (A03, A10) as detailed in section "7. Audit Sequencing"

**Output:** `attack-surface-findings.md`

---

#### Step 4: Configuration Audit (30 min) - MEDIUM

Execute Phase 4 checks (A04, A05, A06) as detailed in section "7. Audit Sequencing"

**Output:** `configuration-findings.md`

---

#### Step 5: Monitoring Audit (20 min) - LOW

Execute Phase 5 checks (A09) as detailed in section "7. Audit Sequencing"

**Output:** `monitoring-findings.md`

---

#### Step 6: Final Report Generation (30 min)

**Consolidate all findings:**

1. Read all findings files
2. Calculate risk scores (Likelihood × Impact)
3. Sort by severity (CRITICAL → HIGH → MEDIUM → LOW)
4. Generate remediation plan
5. Create risk register
6. Write final report

**Output:** `2025-11-12-security-audit-phase01-complete.md`

---

### Report Format (Required Structure)

````markdown
# Security Audit Report: Phase 01 - AI Model Discovery & Operations

**Report Type:** Security Audit - OWASP Top 10 Compliance  
**Date:** 2025-11-12  
**Auditor:** security-auditor (Opus)  
**Scope:** Phase 01 AI Infrastructure  
**Status:** ✅ APPROVED / ⚠️ CONDITIONAL / 🔴 BLOCKED

---

## Executive Summary

**Overall Risk Level:** LOW / MEDIUM / HIGH / CRITICAL

**Findings Summary:**

- CRITICAL: X findings (BLOCKING)
- HIGH: X findings (FIX BEFORE MERGE)
- MEDIUM: X findings (DOCUMENT)
- LOW: X findings (BACKLOG)

**Merge Recommendation:** ✅ APPROVED / ⚠️ CONDITIONAL / 🔴 BLOCKED

**Conditions (if CONDITIONAL):**

1. Fix HIGH finding: [description]
2. Document MEDIUM findings in risk register
3. Create backlog tickets for LOW findings

---

## OWASP Top 10 Compliance Matrix

| Category                       | Status   | Findings | Severity | Blocking? |
| ------------------------------ | -------- | -------- | -------- | --------- |
| A01: Broken Access Control     | ✅/⚠️/🔴 | X        | MAX      | YES/NO    |
| A02: Cryptographic Failures    | ✅/⚠️/🔴 | X        | MAX      | YES/NO    |
| A03: Injection                 | ✅/⚠️/🔴 | X        | MAX      | YES/NO    |
| A04: Insecure Design           | ✅/⚠️/🔴 | X        | MAX      | YES/NO    |
| A05: Security Misconfiguration | ✅/⚠️/🔴 | X        | MAX      | YES/NO    |
| A06: Vulnerable Components     | ✅/⚠️/🔴 | X        | MAX      | YES/NO    |
| A07: Authentication Failures   | ✅/⚠️/🔴 | X        | MAX      | YES/NO    |
| A08: Data Integrity Failures   | ✅/⚠️/🔴 | X        | MAX      | YES/NO    |
| A09: Logging Failures          | ✅/⚠️/🔴 | X        | MAX      | YES/NO    |
| A10: SSRF                      | ✅/⚠️/🔴 | X        | MAX      | YES/NO    |

**Overall Compliance:** XX% (X/10 categories PASS)

---

## Detailed Findings

### CRITICAL Findings (Blocking)

#### [C01] Finding Title

**OWASP Category:** AXX - Category Name  
**Severity:** CRITICAL (Likelihood: HIGH × Impact: CRITICAL)  
**Location:** file.ts:line

**Description:**
[What is the vulnerability?]

**Evidence:**

```typescript
// Code snippet demonstrating the issue
```
````

**Impact:**
[What damage can this cause?]

**Likelihood:**
[How easy is it to exploit?]

**Remediation:**
[Specific steps to fix]

**Verification:**
[How to verify the fix]

---

### HIGH Findings (Fix Before Merge)

[Same structure as CRITICAL]

---

### MEDIUM Findings (Document in Risk Register)

[Same structure, plus:]

**Accepted Risk Justification:**
[Why is this acceptable to document instead of fix?]

**Mitigation:**
[What controls are in place to reduce risk?]

---

### LOW Findings (Backlog)

[Same structure, plus backlog ticket reference]

---

## Security Test Coverage Analysis

**Overall Coverage:**

- Unit tests: XX% (target: ≥80%)
- Integration tests: XX% (target: ≥75%)
- Security scenarios: XX/XX tested (XXX%)

**Missing Tests:**

- [Test description] (location)

**Test Quality:**

- ✅ All security paths tested
- ⚠️ [Any gaps]

---

## Remediation Plan

### Immediate Actions (Before Merge)

1. [CRITICAL] Fix finding C01

   - Owner: [Name]
   - Deadline: [Date]
   - Verification: [Method]

2. [HIGH] Fix finding H01
   - Owner: [Name]
   - Deadline: [Date]
   - Verification: [Method]

### Next Sprint Actions

1. [MEDIUM] Address finding M01
   - Backlog ticket: [ID]
   - Priority: Medium
   - Estimate: [Hours]

### Backlog

1. [LOW] Address finding L01
   - Backlog ticket: [ID]
   - Priority: Low

---

## Risk Register

| ID  | Finding | Likelihood | Impact   | Risk     | Accepted? | Mitigation        |
| --- | ------- | ---------- | -------- | -------- | --------- | ----------------- |
| C01 | ...     | HIGH       | CRITICAL | CRITICAL | NO        | Fix immediately   |
| H01 | ...     | MEDIUM     | HIGH     | HIGH     | NO        | Fix before merge  |
| M01 | ...     | MEDIUM     | MEDIUM   | MEDIUM   | YES       | Controls in place |
| L01 | ...     | LOW        | LOW      | LOW      | YES       | Backlog           |

---

## Standards Compliance

**OWASP Top 10 2021:** XX% compliant (X/10 categories PASS)  
**GDPR:** N/A (no PII stored)  
**SOC 2:** [If applicable]  
**NIST:** [If applicable]

---

## Approval & Sign-Off

**Security Auditor:** security-auditor (Opus)  
**Date:** 2025-11-12  
**Recommendation:** ✅ APPROVED / ⚠️ CONDITIONAL / 🔴 BLOCKED

**Conditions for Approval:**

- [ ] All CRITICAL findings resolved
- [ ] All HIGH findings resolved or documented
- [ ] Risk register updated
- [ ] Security tests GREEN

**Tech Lead Approval:** [Pending]  
**Date:** [Pending]

---

## Appendices

### Appendix A: OWASP Category Details

[Detailed analysis per category]

### Appendix B: Code Evidence

[Code snippets, screenshots]

### Appendix C: Test Results

[Test output, coverage reports]

### Appendix D: NPM Audit

[npm audit output]

---

**END OF REPORT**

```

---

### Success Criteria Checklist

**Audit completes successfully when:**

- [x] All 10 OWASP categories audited
- [x] All findings documented with severity
- [x] All evidence collected and stored
- [x] Risk scores calculated for all findings
- [x] Remediation plan created
- [x] Risk register populated
- [x] Final report generated
- [x] Merge recommendation clear (APPROVED/CONDITIONAL/BLOCKED)

**Merge APPROVED when:**

- [x] ZERO CRITICAL findings
- [x] ZERO HIGH findings (or all fixed)
- [x] MEDIUM/LOW findings documented in risk register
- [x] Security tests GREEN
- [x] Tech Lead sign-off obtained

---

## Quick Reference Card

### Severity Thresholds

| Severity | Criteria | Merge Status |
|----------|----------|--------------|
| CRITICAL | Likelihood: HIGH × Impact: CRITICAL | 🔴 BLOCKED |
| HIGH | Likelihood: MEDIUM × Impact: HIGH | ⚠️ FIX FIRST |
| MEDIUM | Likelihood: MEDIUM × Impact: MEDIUM | ✅ DOCUMENT |
| LOW | Likelihood: LOW × Impact: LOW | ✅ BACKLOG |

---

### OWASP Category Priority

1. **A01 + A07** - Authentication & Authorization (CRITICAL PATH)
2. **A02 + A08** - Cryptography & Data Integrity (CRITICAL PATH)
3. **A03 + A10** - Injection & SSRF (HIGH PRIORITY)
4. **A04 + A05 + A06** - Design & Configuration (MEDIUM PRIORITY)
5. **A09** - Logging & Monitoring (LOW PRIORITY)

---

### Time Allocation

| Phase | Time | Priority |
|-------|------|----------|
| Foundation | 30 min | CRITICAL |
| Data Protection | 30 min | CRITICAL |
| Attack Surface | 40 min | HIGH |
| Configuration | 30 min | MEDIUM |
| Monitoring | 20 min | LOW |
| Final Report | 30 min | - |
| **TOTAL** | **3h** | - |

---

### Evidence Locations

```

reports/security-audit/phase01-evidence/
├── code-snippets/ # Auth, encryption, validation code
├── test-outputs/ # Coverage reports, npm audit
├── database-queries/ # Encrypted keys samples
└── screenshots/ # Prisma Studio, logs

````

---

### Key Commands

```bash
# Run tests with coverage
cd app && wasp test client run --coverage

# NPM audit
npm audit --json

# Find security tests
grep -r "401\|403\|404\|400" src/server/ai/*.test.ts

# Check for skipped tests
grep -r "it.skip\|describe.skip" src/server/ai/*.test.ts
````

---

### Known Gaps Quick Reference

1. ⚠️ Missing `.env.server.example` (HIGH)
2. ✅ `User.isOwner` verified (NO ISSUE)
3. ⚠️ No `deleteAIProvider` operation (MEDIUM)
4. ⚠️ Section validation missing (MEDIUM)

---

## Next Steps

**After reading this strategy:**

1. **Security-auditor agent:** Execute audit following this plan
2. **Generate final report:** Use template in section "Report Format"
3. **Store evidence:** In `reports/security-audit/phase01-evidence/`
4. **Create risk register:** Based on findings
5. **Obtain sign-off:** Tech Lead approval for merge

**Report location:** `reports/2025-11-12-security-audit-phase01-complete.md`

---

**Document Metadata**

**Document Version:** 1.0  
**Generated:** 2025-11-12  
**Generator:** Claude Code Sonnet  
**Review Status:** ⚠️ Ready for Execution  
**Approval:** Pending security-auditor execution

**Change Log:**

- 2025-11-12: Initial strategy document created

---

**END OF STRATEGY DOCUMENT**
