# Security Rules (Complete Guide)

**Quick Reference**: [CLAUDE.md#security](../CLAUDE.md#security)

**Skills**:

- `security-basics` - Daily security checks before commits
- `security-auditor` - Complete OWASP Top 10 audit

---

## Critical Security Rules

### Rule 1: Server-Side Authorization ONLY

**Client-side authorization is COSMETIC ONLY** - easily bypassed by anyone who can open browser DevTools!

#### ❌ WRONG - Client-Side Check (INSECURE!)

```typescript
// File: src/pages/AdminPage.tsx
import { useAuth } from 'wasp/client/auth'

export function AdminPage() {
  const { data: user } = useAuth()

  // ❌ INSECURE - User can bypass this with DevTools!
  if (user?.role !== 'ADMIN') {
    return <div>Access denied</div>
  }

  return <div>Admin Dashboard</div>
}
```

**Why insecure**: User can modify React component in browser, delete the check, and access admin page.

#### ✅ CORRECT - Server-Side Enforcement (SECURE)

```typescript
// File: src/server/admin/operations.ts
import type { GetAdminData } from "wasp/server/operations";
import { HttpError } from "wasp/server";
import { UserRole } from "@prisma/client";

export const getAdminData: GetAdminData = async (args, context) => {
  // ✅ SECURE - Enforced on server, user cannot bypass
  if (!context.user) {
    throw new HttpError(401, "Not authenticated");
  }

  if (context.user.role !== UserRole.ADMIN) {
    throw new HttpError(403, "Admin access required");
  }

  // Safe to proceed - auth enforced server-side
  return await context.entities.AdminData.findMany();
};
```

```typescript
// File: src/pages/AdminPage.tsx
import { useQuery } from 'wasp/client/operations'
import { getAdminData } from 'wasp/client/operations'

export function AdminPage() {
  // Server will return 403 if user is not admin
  const { data, error } = useQuery(getAdminData)

  if (error?.statusCode === 403) {
    return <div>Access denied</div>
  }

  return <div>{/* Render admin data */}</div>
}
```

**Rule**: ALWAYS enforce permissions on server operations. Client checks are for UX only (showing/hiding UI elements).

---

### Rule 2: Password Security

**NEVER save passwords as plain text or implement password hashing manually!**

#### ❌ WRONG - Manual Password Storage

```typescript
// ❌ INSECURE - DO NOT DO THIS!
await context.entities.User.create({
  data: {
    email: args.email,
    password: args.password, // Plain text password in database!
  },
});
```

```typescript
// ❌ ALSO WRONG - Manual hashing
import bcrypt from "bcrypt";

const hashedPassword = await bcrypt.hash(args.password, 10);
await context.entities.User.create({
  data: {
    email: args.email,
    password: hashedPassword, // Still wrong - Wasp manages auth!
  },
});
```

**Why wrong**: Wasp manages authentication separately. Passwords are NOT stored on User model!

#### ✅ CORRECT - Use Wasp Auth System

**Configure in main.wasp:**

```wasp
app leanAiCoach {
  // ...
  auth: {
    userEntity: User,
    methods: {
      usernameAndPassword: {},  // Wasp handles password hashing automatically
      email: {                  // Or use email auth
        fromField: {
          name: "OpenSaaS Boilerplate",
          email: "noreply@example.com"
        },
        emailVerification: {
          clientRoute: EmailVerificationRoute,
        },
        passwordReset: {
          clientRoute: PasswordResetRoute,
        }
      }
    },
    onAuthFailedRedirectTo: "/login",
    onAuthSucceededRedirectTo: "/app"
  }
}
```

**Wasp automatically handles:**

- Password hashing (bcrypt)
- Salt generation
- Secure password comparison
- Password reset tokens
- Email verification tokens

**Seeding users with passwords** (for testing):

```typescript
// File: app/src/server/scripts/seedDemoUser.ts
import { sanitizeAndSerializeProviderData } from "wasp/server/auth";

export const seedDemoUser = async (prismaClient) => {
  // ✅ CORRECT - Use Wasp's auth helpers
  const providerData = await sanitizeAndSerializeProviderData<"email">({
    hashedPassword: "DemoPassword123!", // Wasp auto-hashes this
    isEmailVerified: true,
    emailVerificationSentAt: null,
    passwordResetSentAt: null,
  });

  await prismaClient.user.create({
    data: {
      email: "demo@example.com",
      username: "demo@example.com",
      auth: {
        create: {
          identities: {
            create: {
              providerName: "email",
              providerUserId: "demo@example.com",
              providerData,
            },
          },
        },
      },
    },
  });
};
```

**Rule**: Use Wasp auth system. NEVER implement password storage manually!

---

### Rule 3: Database URL Security

**MUST use env() in schema.prisma - NEVER hardcode credentials!**

#### ❌ WRONG - Hardcoded Database URL

```prisma
// app/schema.prisma
datasource db {
  provider = "postgresql"
  url      = "postgresql://dev:dev@localhost:5432/dev" // ❌ EXPOSED!
}
```

**Why wrong**: Credentials are visible in git history, hard to change per environment.

#### ✅ CORRECT - Environment Variable

```prisma
// app/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // ✅ REQUIRED
}
```

```bash
# app/.env.server (NEVER commit this file!)
DATABASE_URL="postgresql://dev:dev@localhost:5432/dev"

# Different per environment:
# - Development: localhost:5432
# - Staging: staging-db.example.com:5432
# - Production: production-db.example.com:5432
```

**Rule**: NEVER hardcode database URLs, API keys, or credentials anywhere!

---

### Rule 4: Environment Variable Separation

**Server secrets vs Client config - NEVER expose server secrets to client!**

#### Server-Only Secrets (.env.server)

```bash
# app/.env.server - NEVER commit to git!
DATABASE_URL="postgresql://..."
OPENAI_API_KEY="sk-..."
STRIPE_SECRET_KEY="sk_..."
JWT_SECRET="..."
SENDGRID_API_KEY="..."

# ⚠️ Add to .gitignore!
```

**Access in server operations:**

```typescript
// File: src/server/ai/operations.ts
import { HttpError } from "wasp/server";

export const generateCoaching = async (args, context) => {
  // ✅ Server-side - env vars accessible
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new HttpError(500, "OpenAI API key not configured");
  }

  // Use apiKey to call OpenAI...
};
```

#### Client-Safe Config (.env.client)

```bash
# app/.env.client - Safe to commit (example values)
REACT_APP_PUBLIC_URL="http://localhost:3000"
REACT_APP_ANALYTICS_ID="G-XXXXXXXXX"
REACT_APP_GOOGLE_CLIENT_ID="..."

# ⚠️ Prefix with REACT_APP_ required for Vite!
```

**Access in React components:**

```typescript
// File: src/pages/LandingPage.tsx

export function LandingPage() {
  // ✅ Client-side - only REACT_APP_ vars accessible
  const analyticsId = import.meta.env.REACT_APP_ANALYTICS_ID;

  // ❌ undefined on client (secure!)
  const apiKey = import.meta.env.OPENAI_API_KEY;
  console.log(apiKey); // undefined
}
```

**Rule**:

- Server secrets → `.env.server` (NEVER commit, add to .gitignore)
- Client config → `.env.client` (safe to commit with example values)
- Client CANNOT access server env vars (enforced by Wasp)

---

## Security Checklist (Daily)

**Before every commit, verify:**

### 1. Server-Side Auth Checks

```typescript
// ✅ Every operation must check auth
export const operation = async (args, context) => {
  if (!context.user) throw new HttpError(401);
  // ... rest of operation
};
```

### 2. No Hardcoded Secrets

```typescript
// ❌ NEVER
const apiKey = "sk-1234567890abcdef";

// ✅ ALWAYS
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new HttpError(500, "API key not configured");
```

### 3. Passwords via Wasp Auth Only

```typescript
// ❌ NEVER manually hash passwords
import bcrypt from "bcrypt";
const hash = await bcrypt.hash(password, 10);

// ✅ ALWAYS use Wasp auth system
// Configure in main.wasp, let Wasp handle hashing
```

### 4. Database URL from Env

```prisma
// ✅ ALWAYS
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 5. Client Env Separation

```bash
# ✅ Server secrets → .env.server (in .gitignore)
DATABASE_URL="..."
OPENAI_API_KEY="..."

# ✅ Client config → .env.client (safe to commit)
REACT_APP_PUBLIC_URL="..."
```

**Use `security-basics` skill for interactive checklist!**

---

## Common Security Vulnerabilities

### SQL Injection (Protected by Prisma)

**❌ WRONG - Raw SQL with user input:**

```typescript
// ❌ VULNERABLE to SQL injection!
const users = await prisma.$queryRaw`
  SELECT * FROM User WHERE email = '${args.email}'
`;
```

**✅ CORRECT - Use Prisma query builder:**

```typescript
// ✅ SAFE - Prisma auto-escapes parameters
const user = await context.entities.User.findUnique({
  where: { email: args.email },
});
```

**Rule**: Use Prisma query builder. Avoid `$queryRaw` with user input.

---

### XSS (Cross-Site Scripting)

**❌ WRONG - Unescaped user input:**

```typescript
// ❌ VULNERABLE to XSS!
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**✅ CORRECT - React auto-escapes:**

```typescript
// ✅ SAFE - React escapes by default
<div>{userInput}</div>

// If you MUST render HTML (rare), sanitize first
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

**Rule**: Let React handle escaping. Only use `dangerouslySetInnerHTML` with sanitized input.

---

### CSRF (Cross-Site Request Forgery)

**Protected by Wasp automatically** - Wasp includes CSRF tokens in all authenticated requests.

**No action needed** - Wasp handles this for you!

---

### Rate Limiting (TODO)

**Current status**: Not yet implemented

**Recommended**: Add rate limiting to auth endpoints:

```typescript
// TODO: Add to main.wasp when Wasp supports it
// Or implement custom middleware
```

---

## OWASP Top 10 Coverage

| Vulnerability                      | Protection                               | Status    |
| ---------------------------------- | ---------------------------------------- | --------- |
| **A01: Broken Access Control**     | Server-side auth checks in operations    | ✅ Manual |
| **A02: Cryptographic Failures**    | Wasp auth + env vars + HTTPS             | ✅ Wasp   |
| **A03: Injection**                 | Prisma query builder (auto-escapes)      | ✅ Prisma |
| **A04: Insecure Design**           | Code review + security-auditor skill     | ⚠️ Manual |
| **A05: Security Misconfiguration** | .env separation + .gitignore             | ✅ Config |
| **A06: Vulnerable Components**     | Dependabot + npm audit                   | ✅ Auto   |
| **A07: Authentication Failures**   | Wasp auth system                         | ✅ Wasp   |
| **A08: Data Integrity Failures**   | Input validation (Zod schemas)           | ⚠️ Manual |
| **A09: Logging Failures**          | TODO: Add structured logging             | ❌ TODO   |
| **A10: SSRF**                      | No external URL fetching from user input | ✅ Design |

**Use `security-auditor` agent for complete OWASP audit!**

---

## Security Best Practices

### Input Validation (Zod)

```typescript
// File: src/server/tasks/operations.ts
import { z } from "zod";

const CreateTaskInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

export const createTask = async (args, context) => {
  // ✅ Validate input before using
  const validated = CreateTaskInput.parse(args);

  return await context.entities.Task.create({
    data: validated,
  });
};
```

### Sanitize User Input (for rich text)

```typescript
import DOMPurify from "dompurify";

export const createA3Section = async (args, context) => {
  // ✅ Sanitize rich text before storing
  const sanitizedContent = DOMPurify.sanitize(args.content);

  return await context.entities.Section.create({
    data: {
      ...args,
      content: sanitizedContent,
    },
  });
};
```

### Secure File Uploads

```typescript
// TODO: Implement when file upload feature added
// - Validate file type (whitelist)
// - Check file size
// - Scan for malware
// - Store with random filename
// - Use CDN with signed URLs
```

---

## Emergency Response

### Suspected Security Breach

1. **Immediately**: Revoke all API keys in `.env.server`
2. **Rotate**: DATABASE_URL, JWT_SECRET, all third-party API keys
3. **Audit**: Check git history for exposed secrets (`git log -p`)
4. **Notify**: Inform users if data potentially exposed (GDPR requirement)

### Secrets Committed to Git

**If you accidentally commit `.env.server`:**

```bash
# 1. Remove from current commit
git rm --cached app/.env.server
git commit -m "Remove accidentally committed secrets"

# 2. Purge from history (CAREFUL!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch app/.env.server" \
  --prune-empty --tag-name-filter cat -- --all

# 3. Force push (if already pushed)
git push origin --force --all

# 4. IMMEDIATELY rotate ALL secrets in that file!
# - New DATABASE_URL password
# - New OPENAI_API_KEY
# - New STRIPE_SECRET_KEY
# - etc.
```

**Better**: Use tools like `git-secrets` or `gitleaks` to prevent this!

---

## See Also

- **[CLAUDE.md#security](../CLAUDE.md#security)** - Quick reference
- **Skill**: `security-basics` - Daily security checklist
- **Agent**: `security-auditor` - Complete OWASP Top 10 audit
- **Templates**: `.claude/templates/error-handling-patterns.ts` - Secure operation patterns
- **Wasp Docs**: https://wasp.sh/docs/auth/overview - Authentication guide
