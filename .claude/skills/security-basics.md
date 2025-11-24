# Security Basics - Daily Security Checklist

**Type**: Daily security verification before commits

**Use**: Lightweight security checks (vs security-auditor for comprehensive OWASP audits)

**When**: Before every commit with new code

---

## What This Skill Does

Performs quick security verification to catch common vulnerabilities:

1. ✅ Server-side auth checks in all operations
2. ✅ No hardcoded secrets/URLs
3. ✅ Passwords via Wasp auth only
4. ✅ Client/server env separation correct
5. ✅ No dangerous patterns (SQL injection, XSS)

---

## Checklist

### 1. Server-Side Authorization

**Check ALL operations have auth checks:**

```typescript
// ✅ REQUIRED pattern
export const operation = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Not authenticated");
  }
  // ... rest of operation
};
```

**Questions to verify:**

- [ ] Does every operation check `context.user`?
- [ ] Are permission checks enforced server-side (not client)?
- [ ] Are error codes correct (401 for unauth, 403 for unauthorized)?

---

### 2. No Hardcoded Secrets

**Check for hardcoded credentials:**

```typescript
// ❌ FORBIDDEN - Never hardcode secrets
const apiKey = "sk-1234567890abcdef";
const dbUrl = "postgresql://user:password@localhost/db";
const jwtSecret = "my-secret-key";

// ✅ CORRECT - Use environment variables
const apiKey = process.env.OPENAI_API_KEY;
const dbUrl = process.env.DATABASE_URL;
if (!apiKey) throw new HttpError(500, "API key not configured");
```

**Files to check:**

- [ ] `app/src/server/**/*.ts` - No hardcoded API keys
- [ ] `app/schema.prisma` - Uses `env("DATABASE_URL")`
- [ ] `.env.server` in `.gitignore`
- [ ] No secrets in committed code (check git log if needed)

---

### 3. Password Security

**Verify passwords handled by Wasp auth only:**

```typescript
// ❌ FORBIDDEN - Never store passwords manually
await context.entities.User.create({
  data: { password: args.password }, // ❌ Plain text!
});

import bcrypt from "bcrypt";
const hash = await bcrypt.hash(password, 10); // ❌ Manual hashing!

// ✅ CORRECT - Wasp auth system handles hashing
// Configure in main.wasp, let Wasp manage auth tables
```

**Questions to verify:**

- [ ] Is Wasp auth configured in `main.wasp`?
- [ ] No password fields on User model?
- [ ] No manual bcrypt/password hashing?
- [ ] Seed scripts use `sanitizeAndSerializeProviderData`?

---

### 4. Environment Variable Separation

**Verify correct env var usage:**

```bash
# app/.env.server (NEVER commit!)
DATABASE_URL="postgresql://..."
OPENAI_API_KEY="sk-..."
STRIPE_SECRET_KEY="sk_..."

# app/.env.client (safe to commit example values)
REACT_APP_PUBLIC_URL="http://localhost:3000"
REACT_APP_ANALYTICS_ID="..."
```

**Questions to verify:**

- [ ] Server secrets in `.env.server` (in .gitignore)?
- [ ] Client config in `.env.client` (safe to commit)?
- [ ] Client code uses `import.meta.env.REACT_APP_*`?
- [ ] Server code uses `process.env.*`?
- [ ] No server env vars accessed in client code?

---

### 5. SQL Injection Protection

**Verify using Prisma query builder (not raw SQL):**

```typescript
// ❌ VULNERABLE to SQL injection
const users = await prisma.$queryRaw`
  SELECT * FROM User WHERE email = '${args.email}'
`;

// ✅ SAFE - Prisma auto-escapes
const user = await context.entities.User.findUnique({
  where: { email: args.email },
});
```

**Questions to verify:**

- [ ] Using Prisma query builder (`findUnique`, `findMany`, etc.)?
- [ ] No `$queryRaw` with user input?
- [ ] If using `$queryRaw`, parameters properly escaped?

---

### 6. XSS Protection

**Verify React auto-escaping (no dangerouslySetInnerHTML without sanitization):**

```typescript
// ❌ VULNERABLE to XSS
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SAFE - React escapes by default
<div>{userInput}</div>

// ✅ SAFE - Sanitized if HTML needed
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

**Questions to verify:**

- [ ] Using React's default escaping (no `dangerouslySetInnerHTML`)?
- [ ] If using `dangerouslySetInnerHTML`, input is sanitized with DOMPurify?
- [ ] User input not directly inserted into HTML strings?

---

## Quick Scan Commands

```bash
# Check for hardcoded secrets
grep -r "sk-" app/src/
grep -r "API_KEY.*=" app/src/ | grep -v "process.env"

# Check for password fields
grep -r "password.*:" app/schema.prisma

# Check .gitignore includes .env.server
grep ".env.server" .gitignore

# Check for dangerous patterns
grep -r "dangerouslySetInnerHTML" app/src/
grep -r "\$queryRaw" app/src/server/
```

---

## When to Use vs Security-Auditor

**Use `security-basics` (this skill):**

- ✅ Daily commits
- ✅ Quick verification before push
- ✅ Catching obvious mistakes
- ✅ Takes 2-3 minutes

**Use `security-auditor` agent:**

- ✅ Complete feature implementation
- ✅ Before production deployment
- ✅ Comprehensive OWASP Top 10 audit
- ✅ Detailed security report
- ✅ Takes 15-30 minutes

---

## Common Security Mistakes

### Mistake 1: Client-Side Auth Only

```typescript
// ❌ INSECURE - Client-side check only
if (user?.role !== 'ADMIN') {
  return <div>Access denied</div>
}

// ✅ SECURE - Server-side enforcement
export const adminOperation = async (args, context) => {
  if (!context.user || context.user.role !== 'ADMIN') {
    throw new HttpError(403)
  }
  // Safe to proceed
}
```

### Mistake 2: Secrets in Client Code

```typescript
// ❌ EXPOSED - Client can see this!
const apiKey = import.meta.env.REACT_APP_OPENAI_KEY;

// ✅ SECURE - Server-side only
// File: src/server/ai/operations.ts
const apiKey = process.env.OPENAI_API_KEY;
```

### Mistake 3: No Input Validation

```typescript
// ❌ UNSAFE - No validation
export const createTask = async (args, context) => {
  return await context.entities.Task.create({ data: args });
};

// ✅ SAFE - Validated input
import { z } from "zod";

const CreateTaskInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
});

export const createTask = async (args, context) => {
  const validated = CreateTaskInput.parse(args);
  return await context.entities.Task.create({ data: validated });
};
```

---

## Action Items

After running this checklist:

- [ ] All operations have `context.user` check
- [ ] No hardcoded secrets found
- [ ] Passwords handled by Wasp auth
- [ ] Env vars correctly separated
- [ ] Using Prisma query builder (no raw SQL with user input)
- [ ] No unescaped user input in HTML

**If all pass**: ✅ Code is safe to commit

**If any fail**: ❌ Fix security issues before committing

---

## See Also

- **[docs/SECURITY-RULES.md](../../docs/SECURITY-RULES.md)** - Complete security guide
- **Agent**: `security-auditor` - Comprehensive OWASP audit
- **Skill**: `wasp-operations` - Secure operation patterns
- **Templates**: `.claude/templates/error-handling-patterns.ts` - Auth checks
