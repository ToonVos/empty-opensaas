# Demo User Seed Strategy

**Quick Start:** `./scripts/seed-demo-user.sh` → Instant demo user with sample data

---

## The Problem

Na een database reset heb je geen test data meer. Normaal gesproken zou je:

1. Handmatig een user aanmaken via de signup flow
2. Een organization + teams/groups creëren
3. User aan teams koppelen
4. Sample documents/data aanmaken
5. Alle fields invullen met test data

Dit kost **15-20 minuten per test cycle**. Bij visual testing of na elke `wasp db reset` moet je dit herhalen.

**Nog erger:** Je kunt geen user met wachtwoord direct in de database zetten omdat Wasp's auth systeem passwords apart opslaat en hasht.

## The Solution

**One-command demo user seeding with sample data.**

```bash
./scripts/seed-demo-user.sh
```

Na 10 seconden heb je:

- ✅ Demo user met werkende login (`demo@example.com` / `DemoPassword123!`)
- ✅ Organization + Teams structure
- ✅ Sample documents with realistic data
- ✅ All fields populated with test content
- ✅ Klaar voor visual testing, screenshots, demos

---

## Why This Matters: Wasp Auth Architecture

This project is built with **Wasp 0.18** framework. Wasp heeft een specifieke auth architectuur:

```
User (jouw model)
  ↓
Auth (Wasp-managed)
  ↓
AuthIdentity (Wasp-managed, bevat hashed password)
```

### The Challenge

**Je kunt GEEN user met wachtwoord via normale Prisma seeding aanmaken:**

```typescript
// ❌ DIT WERKT NIET
await prisma.user.create({
  data: {
    email: "demo@example.com",
    password: "Demo1234!", // Kan niet - password hoort niet bij User model!
  },
});
```

**Waarom niet?**

- Passwords worden NIET opgeslagen in de User table
- Passwords worden gehashed en opgeslagen in de AuthIdentity table
- AuthIdentity is gekoppeld via Auth table (Wasp-managed)
- Je hebt Wasp's `sanitizeAndSerializeProviderData` helper nodig voor correcte hashing

### The Wasp Solution

Wasp biedt server-side seed functie support met toegang tot auth helpers:

```typescript
// ✅ DIT WERKT - Wasp seed functie
import { sanitizeAndSerializeProviderData } from "wasp/server/auth";

await prisma.user.create({
  data: {
    email: "demo@example.com",
    // Nested create pattern voor auth chain
    auth: {
      create: {
        identities: {
          create: {
            providerName: "email",
            providerUserId: "demo@example.com",
            providerData: await sanitizeAndSerializeProviderData<"email">({
              hashedPassword: "DemoPassword123!", // Auto-hashed door Wasp
              isEmailVerified: true,
              emailVerificationSentAt: null,
              passwordResetSentAt: null,
            }),
          },
        },
      },
    },
  },
});
```

**Key points:**

- `sanitizeAndSerializeProviderData<'email'>` hasht het password automatisch
- Email provider heeft extra velden nodig (isEmailVerified, etc.)
- Nested create maakt User → Auth → AuthIdentity chain in één query
- Password wordt plaintext ingevoerd maar gehashed opgeslagen

---

## What We Seed

### High-Level Overview

| Component            | Details                                     |
| -------------------- | ------------------------------------------- |
| **Organization**     | Demo Corporation (subdomain: demo)          |
| **Teams/Groups**     | Sample team structure                       |
| **User**             | demo@example.com with OrgRole.ADMIN         |
| **User-Team Links**  | Link with appropriate role (MANAGER/MEMBER) |
| **Sample Documents** | Example documents with realistic data       |
| **Related Data**     | Fully populated with test content           |

### The Sample Content

We seed **complete, realistic sample data** tailored to your application's domain:

**Why Sample Data Matters:**

- **Realistic**: Represents actual use cases
- **Complete**: All required fields populated
- **Detailed**: Good for visual testing layouts and edge cases
- **Consistent**: Same data every time for reproducible testing

**What Gets Seeded:**

1. **User data** - Profile, preferences, settings
2. **Organization structure** - Teams, departments, groups
3. **Core entities** - Documents, tasks, or domain-specific records
4. **Relationships** - User-team links, hierarchies, associations
5. **Metadata** - Timestamps, status fields, completion flags

**All records marked with appropriate status** for representative testing.

---

## Technical Implementation

### Idempotent Design

De seed functie is **safe to re-run**:

```typescript
// Check if demo user exists
const existingAuth = await prisma.auth.findFirst({
  where: {
    identities: {
      some: {
        providerName: "email",
        providerUserId: "demo@example.com",
      },
    },
  },
  include: { user: true },
});

if (existingAuth?.user) {
  // Delete and recreate with fresh data
  await prisma.user.delete({ where: { id: existingAuth.user.id } });
}
```

**Benefits:**

- Geen "unique constraint" errors bij herhaling
- Altijd fresh, consistente data
- Safe voor development workflow

### Registered in main.wasp

```wasp
db: {
  seeds: [
    import { seedDemoUser } from "@src/server/scripts/seedDemoUser"
  ]
}
```

Dit maakt `wasp db seed seedDemoUser` command beschikbaar.

---

## Usage

### Quick Start

```bash
# From project root
./scripts/seed-demo-user.sh
```

**Output:**

```
🌱 Seeding demo user with sample data...
✅ Demo user seeded successfully!

📧 Email: demo@example.com
🔑 Password: DemoPassword123!
🔗 Login URL: http://localhost:3000/login
```

### Login Credentials

```
Email:    demo@example.com
Password: DemoPassword123!
URL:      http://localhost:3000/login
```

### When To Use

**Daily Development:**

- ✅ After `wasp db reset` (lost all data)
- ✅ Visual testing of UI components
- ✅ Testing feature layouts with realistic content
- ✅ Screenshots for documentation
- ✅ Client demos

**CI/CD:**

- ✅ E2E test setup (seed before tests run)
- ✅ Staging environment initialization
- ✅ QA environment reset

**NOT Recommended:**

- ❌ Production (use proper onboarding flow)
- ❌ Security testing (use proper auth flows)

---

## Benefits

### 1. Time Savings

**Before:** 15-20 minutes manual setup per test cycle

**After:** 10 seconds automated seeding

**Impact:** 95% tijd besparing bij development & testing

### 2. Consistency

**Problem:** Handmatige data varieert (typos, incomplete sections, unrealistic content)

**Solution:** Elke seed geeft identieke, complete, realistische data

**Impact:** Reproducible bugs, reliable visual testing

### 3. Realistic Testing

**Problem:** Lorem ipsum of minimale test data toont UI issues niet

**Solution:** Complete sample data with realistic content

**Impact:** Layouts, text wrapping, overflow scenarios all tested

### 4. Onboarding

**Problem:** Nieuwe developers moeten auth flow begrijpen voor test data

**Solution:** One command → working demo environment

**Impact:** Snellere onboarding, lagere barrier to entry

---

## Troubleshooting

### Error: "Unique constraint failed on 'subdomain'"

**Cause:** Organization 'demo' bestaat al maar zonder user link

**Fix:** Script handelt dit automatisch af (reuse existing org)

### Error: "Invalid credentials" after seeding

**Cause:** Email auth fields niet compleet in oude versie

**Fix:** Seed script is updated (15-jan-2025) met correcte email auth fields. Re-run seed.

### Error: "Can't reach database server"

**Cause:** Database container niet actief

**Fix:**

```bash
wasp start db  # In separate terminal
./scripts/seed-demo-user.sh  # In main terminal
```

---

## Development Workflow

### Standard Flow

```bash
# 1. Start database (if not running)
wasp start db

# 2. Reset database (clean slate)
wasp db reset

# 3. Seed demo user
./scripts/seed-demo-user.sh

# 4. Start dev servers
./scripts/safe-start.sh

# 5. Open browser
open http://localhost:3000/login
# Login: demo@example.com / DemoPassword123!
```

### Visual Testing Flow

```bash
# Make UI changes...

# Quick verify with demo data
open http://localhost:3000/app  # Navigate to your feature

# Reset if needed
wasp db reset && ./scripts/seed-demo-user.sh
```

---

## See Also

- **[scripts/README.md](../scripts/README.md)** - How to use seed scripts
- **[scripts/CLAUDE.md](../scripts/CLAUDE.md)** - Technical implementation details
- **[app/src/server/scripts/seedDemoUser.ts](../app/src/server/scripts/seedDemoUser.ts)** - Source code
- **[TROUBLESHOOTING-GUIDE.md](TROUBLESHOOTING-GUIDE.md)** - General troubleshooting

---

## Future Enhancements

**Considered for future versions:**

- Multiple demo users (different roles: VIEWER, MEMBER, MANAGER)
- Multiple sample documents (different statuses: DRAFT, IN_PROGRESS, COMPLETED)
- Seed with comments & activity log
- Configurable seed scenarios via CLI flags
- Production-safe seeding voor staging environments

**Current focus:** Keep it simple, reliable, and fast for development workflow.
