# Database Migration Conflict Analysis

**Date**: 2025-11-11
**Worktree**: Dev2
**Reporter**: Claude (AI Assistant)
**Severity**: HIGH - Blocks new migrations

---

## Executive Summary

Encountered an unusual Prisma migration conflict where migration `20251107101112_add_audit_logging_fields` attempts to add column `previousVersionId` to `SystemPrompt` table, but Prisma's shadow database validation fails with "column already exists" error. This situation should **never** occur in normal Prisma workflows.

---

## Problem Description

### Error Message

```
Error: P3006

Migration `20251107101112_add_audit_logging_fields` failed to apply cleanly to the shadow database.
Error:
ERROR: column "previousVersionId" of relation "SystemPrompt" already exists
```

### Context

- **Blocking action**: Cannot create new migrations for SystemPrompt schema changes
- **Current schema.prisma**: Contains `previousVersionId` field
- **Migration 20251107101112**: Contains `ALTER TABLE "SystemPrompt" ADD COLUMN "previousVersionId" TEXT;`
- **Symptom**: Prisma shadow database validation fails when attempting `wasp db migrate-dev`

---

## Root Cause Analysis

### Migration Timeline

1. **2025-11-04 (Migration 20251104094036)**

   ```sql
   CREATE TABLE "SystemPrompt" (
       "id" TEXT NOT NULL,
       "section" "A3SectionType" NOT NULL,
       "promptText" TEXT NOT NULL,
       "version" INTEGER NOT NULL DEFAULT 1,
       "isActive" BOOLEAN NOT NULL DEFAULT true,
       "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
       "createdBy" TEXT,
       CONSTRAINT "SystemPrompt_pkey" PRIMARY KEY ("id")
   );
   ```

   **Status**: ✅ `previousVersionId` NOT present (correct initial state)

2. **2025-11-07 (Migration 20251107101112)**

   ```sql
   ALTER TABLE "SystemPrompt" ADD COLUMN "previousVersionId" TEXT;
   ```

   **Status**: ✅ Field added via ALTER TABLE

3. **2025-11-10 (Migration 20251110083241)**

   - Added rate limit fields to AIModel
   - **Status**: ✅ No SystemPrompt changes

4. **Current schema.prisma (2025-11-11)**
   ```prisma
   model SystemPrompt {
     id                String   @id @default(uuid())
     organizationId    String
     section           A3SectionType
     name              String
     promptText        String   @db.Text
     modelId           String
     temperature       Decimal  @default(0.7) @db.Decimal(3, 2)
     maxTokens         Int      @default(1000)
     topP              Decimal  @default(1.0) @db.Decimal(3, 2)
     version           Int      @default(1)
     isActive          Boolean  @default(true)
     createdAt         DateTime @default(now())
     updatedAt         DateTime @updatedAt
     createdBy         String?
     previousVersionId String?  // ← Present in schema.prisma
     // ...relations
   }
   ```
   **Status**: ⚠️ Contains `previousVersionId` AND many NEW fields

### The Anomaly

**What should happen in normal Prisma workflow:**

1. Developer changes schema.prisma
2. Run `prisma migrate dev` → creates migration SQL
3. Migration SQL is applied to database
4. schema.prisma and database are in sync

**What happened here:**

1. ✅ Migration 20251107101112 added `previousVersionId` to database
2. ❌ schema.prisma was later modified to include `previousVersionId` **AND** new fields
3. ❌ Prisma sees schema.prisma with `previousVersionId` + new fields
4. ❌ Prisma tries to validate: "Wait, migration 20251107101112 will add previousVersionId, but schema says it should already exist!"
5. ❌ Shadow database validation fails

**Hypothesis**: Schema.prisma was manually edited to include ALL desired fields at once, rather than incremental migrations. This created a state where:

- Real database: Has `previousVersionId` (from migration 20251107101112)
- schema.prisma: Has `previousVersionId` + 7 new fields
- Prisma validation: Thinks `previousVersionId` will be added twice

---

## Impact Assessment

### Immediate Impact

- ❌ **Cannot create new migrations** for SystemPrompt changes
- ❌ **GREEN phase blocked** - cannot add required fields (organizationId, name, modelId, etc.)
- ❌ **Tests will fail** - schema doesn't match test expectations

### Worktree-Specific

- **Dev2 worktree**: Affected (current worktree)
- **Other worktrees**: Unknown - need to verify if they have same schema.prisma changes

### Data Loss Risk

- ⚠️ **Medium** - Database reset will lose seeded data
- ✅ **Low** - No production data (development only)
- ✅ **Safe** - Can re-seed with `wasp db seed`

---

## Verification Steps

### 1. Check Actual Database State

```bash
# Connect to Dev2 database (port 5434)
psql -h localhost -p 5434 -U postgres -d dev -c "\d \"SystemPrompt\""
```

**Expected columns** (if migration 20251107101112 was applied):

- id, section, promptText, version, isActive, createdAt, createdBy
- ✅ previousVersionId (from migration 20251107101112)

**Missing columns** (what we want to add):

- ❌ organizationId, name, modelId, temperature, maxTokens, topP, updatedAt

### 2. Check Migration History

```sql
SELECT * FROM "_prisma_migrations" ORDER BY finished_at DESC LIMIT 5;
```

**Expected**: Migration 20251107101112 should be marked as applied.

### 3. Check Prisma Cache

```bash
ls -la app/.wasp/build/
```

---

## Possible Solutions

### Option A: Remove Conflicting Line from Old Migration ❌ NOT RECOMMENDED

**Action**: Edit `migrations/20251107101112_add_audit_logging_fields/migration.sql`, remove:

```sql
ALTER TABLE "SystemPrompt" ADD COLUMN "previousVersionId" TEXT;
```

**Pros**:

- Quick fix
- Allows new migration to proceed

**Cons**:

- ❌ **Breaks migration integrity** - editing historical migrations is anti-pattern
- ❌ **Git conflicts** - other worktrees/developers will have mismatched history
- ❌ **Prisma detects tampering** - may refuse to run
- ❌ **Team confusion** - migration file no longer matches what was actually applied

**Verdict**: ❌ **NEVER DO THIS**

---

### Option B: Database Reset + Fresh Migrations ⚠️ DESTRUCTIVE

**Action**:

1. `./scripts/db-manager.sh clean` (drops database)
2. `wasp db migrate-dev` (applies all migrations)
3. `wasp db seed` (restore data)

**Pros**:

- ✅ Clean slate
- ✅ Validates that ALL migrations work from scratch
- ✅ Fixes any accumulated migration debt

**Cons**:

- ⚠️ **Loses all development data**
- ⚠️ **Time consuming** - need to re-seed
- ⚠️ **Doesn't solve root cause** - if schema.prisma still has conflict, problem persists

**Verdict**: ⚠️ **ACCEPTABLE** but need to fix schema.prisma first

---

### Option C: Fix schema.prisma to Match Current DB State ✅ RECOMMENDED

**Action**:

1. Temporarily remove NEW fields from schema.prisma (keep only what's currently in DB)
2. Verify migrations work with `wasp db migrate-dev --name "validate"`
3. Add new fields back to schema.prisma
4. Create migration: `wasp db migrate-dev --name "Add organization and model config to SystemPrompt"`

**Pros**:

- ✅ **Respects migration history**
- ✅ **Incremental approach** - easier to debug
- ✅ **Safe** - can verify at each step
- ✅ **Educates team** - shows correct Prisma workflow

**Cons**:

- ⏱️ Takes longer (2 migrations instead of 1)
- 🔧 Requires manual schema.prisma editing

**Verdict**: ✅ **BEST PRACTICE**

---

### Option D: Wasp Clean + Retry 🎯 QUICK FIX TO TRY FIRST

**Action**:

```bash
wasp clean
./scripts/db-manager.sh clean
wasp db migrate-dev --name "Add organization and model config to SystemPrompt"
```

**Rationale**: Prisma may have cached state causing false positive. Clean rebuild might fix it.

**Pros**:

- ⚡ **Fastest** if it works
- ✅ **Non-destructive** to migration history
- ✅ **Worth trying before more complex solutions**

**Cons**:

- ❓ **May not work** - if real schema mismatch, clean won't help
- ⚠️ **Loses development data** (db clean)

**Verdict**: 🎯 **TRY THIS FIRST**

---

## Recommended Action Plan

### Phase 1: Quick Fix Attempt

1. ✅ `wasp clean` (clear Wasp cache)
2. ✅ `./scripts/db-manager.sh clean` (reset database)
3. ✅ `wasp db migrate-dev --name "Add fields to SystemPrompt"` (apply all migrations + new)
4. ❓ **If succeeds** → Problem was cache-related, proceed to GREEN phase
5. ❌ **If fails** → Move to Phase 2

### Phase 2: Verify Database State

1. Check if `previousVersionId` exists in database:
   ```sql
   \d "SystemPrompt"
   ```
2. Check migration history:
   ```sql
   SELECT * FROM "_prisma_migrations" WHERE name = '20251107101112_add_audit_logging_fields';
   ```

### Phase 3: Fix schema.prisma (if needed)

1. Revert schema.prisma to match current database state (remove new fields)
2. Verify migrations work
3. Add new fields incrementally
4. Create new migration

---

## Prevention Measures

### For Future Development

1. **Never manually edit schema.prisma ahead of migrations**

   - Always: schema change → migrate → commit
   - Never: schema change → commit → migrate later

2. **Use migration workflow strictly**

   ```bash
   # CORRECT workflow:
   1. Edit schema.prisma
   2. wasp db migrate-dev --name "descriptive name"
   3. git add schema.prisma migrations/
   4. git commit -m "migration message"
   ```

3. **Sync schema.prisma with migrations**

   - If pulling changes with migrations, run `wasp db migrate-dev` immediately
   - Don't edit schema.prisma without creating migration right away

4. **Multi-worktree coordination**
   - Before starting work: `git pull && wasp db migrate-dev`
   - After creating migration: Push immediately
   - Communicate migration changes to team

---

## Follow-up Actions

- [ ] Verify actual database state (Phase 2)
- [ ] Implement Phase 1 (Quick Fix)
- [ ] Document outcome in this report
- [ ] If Phase 1 fails: Implement Phase 3
- [ ] Update team documentation with prevention measures
- [ ] Consider adding pre-commit hook to validate schema.prisma matches latest migration

---

## Related Files

- **Schema**: `app/schema.prisma:438-461` (SystemPrompt model)
- **Migrations**: `app/migrations/20251107101112_add_audit_logging_fields/migration.sql:2`
- **Test file**: `app/src/server/ai/prompts.test.ts` (RED phase tests)

---

## Status: OPEN

**Next step**: Execute Phase 1 (Quick Fix Attempt)

**Assigned to**: Claude (AI Assistant)
**Expected resolution**: 2025-11-11 (today)
