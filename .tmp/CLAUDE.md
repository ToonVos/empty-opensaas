# .tmp Directory Context

**AUTO-LOADED** when Claude Code works with files in `.tmp/`. **Parent context**: Root CLAUDE.md provides project overview.

---

## Purpose of .tmp/

**Temporary files that should NOT be committed to git**:

```
.tmp/
├── *.sh              # Temporary scripts
├── *.js, *.ts        # Temporary code snippets
├── *.json            # Temporary data files
├── *.txt, *.md       # Temporary notes
└── CLAUDE.md         # This file (committed for guidance)
```

**⚠️ CRITICAL**: Add `.tmp/` to `.gitignore` (except `CLAUDE.md`)

---

## What Belongs in .tmp/

### ✅ Temporary Files (DO put here)

**One-time scripts**:

```bash
# Example: One-time data migration
.tmp/migrate-old-tasks.sh
.tmp/fix-duplicate-users.js
```

**Debug/testing code**:

```typescript
// .tmp/test-api-call.ts
// Quick test of API endpoint
import { getTasks } from "wasp/client/operations";
getTasks().then(console.log);
```

**Temporary data**:

```
.tmp/export-2024-01-15.json
.tmp/backup-before-migration.sql
.tmp/debug-output.txt
```

**Draft documentation** (before moving to docs/):

```
.tmp/draft-architecture.md
.tmp/notes-on-refactoring.txt
```

### ❌ Permanent Files (DON'T put here)

**Production scripts** → `scripts/`:

```
❌ .tmp/seed-users.sh
✅ scripts/seed-demo-user.sh
```

**Documentation** → `docs/`:

```
❌ .tmp/api-guide.md
✅ docs/API-GUIDE.md
```

**Source code** → `app/src/`:

```
❌ .tmp/UserHelper.ts
✅ app/src/lib/userHelpers.ts
```

**Tests** → `app/src/**/*.test.tsx`:

```
❌ .tmp/TaskList.test.tsx
✅ app/src/components/TaskList.test.tsx
```

---

## Cleanup Policy

### Automatic Cleanup

**Recommended**: Add cleanup script to package.json

```json
{
  "scripts": {
    "clean:temp": "find .tmp -type f ! -name 'CLAUDE.md' -mtime +30 -delete",
    "clean:temp:old": "find .tmp -type f ! -name 'CLAUDE.md' -mtime +7 -delete"
  }
}
```

**Run regularly**:

```bash
# Clean files older than 30 days
npm run clean:temp

# Clean files older than 7 days
npm run clean:temp:old
```

### Manual Cleanup

**Monthly review**:

```bash
# List files by age
ls -lt .tmp/

# Delete specific file
rm .tmp/old-script.sh

# Delete all except CLAUDE.md
find .tmp -type f ! -name 'CLAUDE.md' -delete
```

---

## .gitignore Configuration

**Add to `.gitignore`**:

```gitignore
# Temporary files (except guidance)
.tmp/*
!.tmp/CLAUDE.md
```

**Verify ignored**:

```bash
# Should NOT show .tmp/ files (except CLAUDE.md)
git status

# Check specific file is ignored
git check-ignore .tmp/test-script.sh
# Output: .tmp/test-script.sh  (means ignored)
```

---

## Use Cases & Examples

### 1. One-Time Data Migration

**Scenario**: Migrate old task format to new schema

**File**: `.tmp/migrate-tasks-2024-01.sh`

```bash
#!/usr/bin/env bash
# One-time migration: Add priority field to existing tasks

cd app
wasp db reset  # Reset to clean state
wasp db seed   # Seed demo data

# Run migration logic
npx prisma db execute --file ../sql/add-task-priority.sql

echo "Migration complete - verify in Prisma Studio"
```

**After migration succeeds**: Keep file for 30 days (in case rollback needed), then delete

### 2. Debug API Issue

**Scenario**: Test API endpoint behavior

**File**: `.tmp/debug-api.ts`

```typescript
// Quick test of getTasks operation
import { getTasks } from "wasp/client/operations";

async function test() {
  try {
    const tasks = await getTasks({ status: "TODO" });
    console.log("Tasks:", tasks);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
```

**Run**:

```bash
cd app
npx tsx ../.tmp/debug-api.ts
```

**After debugging**: Delete file (or keep if useful for future debugging)

### 3. Backup Before Risky Operation

**Scenario**: Backup data before major refactoring

**File**: `.tmp/backup-2024-01-15.sql`

```bash
# Export database before refactoring
cd app
wasp db execute --schema-only > ../.tmp/schema-backup-2024-01-15.sql
wasp db execute --data-only > ../.tmp/data-backup-2024-01-15.sql
```

**After refactoring succeeds**: Keep for 30 days, then delete

### 4. Draft Documentation

**Scenario**: Draft API guide before finalizing

**File**: `.tmp/draft-api-guide.md`

```markdown
# API Guide (DRAFT)

## Authentication

...

## Endpoints

...
```

**When finalized**: Move to `docs/API-GUIDE.md` and delete draft

---

## Anti-Patterns

### ❌ Committing Temporary Files

```bash
# WRONG - Committing temp files
git add .tmp/test-script.sh
git commit -m "Add test script"
```

**Why bad**: Clutters git history with temporary code

**Better**: Keep in `.tmp/`, don't commit (already gitignored)

### ❌ Using .tmp/ for Permanent Scripts

```bash
# WRONG - Production script in .tmp/
.tmp/deploy-to-production.sh
```

**Why bad**: Might get deleted by cleanup, not backed up

**Better**: Move to `scripts/deploy-production.sh`

### ❌ Large Files Without Cleanup

```bash
# WRONG - 500MB backup, never deleted
.tmp/full-database-backup-2023-01.sql  # 500MB
```

**Why bad**: Wastes disk space, slows down IDE

**Better**: Delete after 30 days, or move to external backup location

### ❌ Hardcoded Paths in Temp Scripts

```bash
# WRONG - Hardcoded path breaks on other machines
cd /Users/yourname/Projects/app
```

**Why bad**: Won't work for others (if you share script)

**Better**: Use relative paths or environment variables

```bash
# CORRECT
cd "$(dirname "$0")/../app"
```

---

## Best Practices

### 1. Name Files Descriptively

```
✅ .tmp/migrate-tasks-to-new-format-2024-01.sh
✅ .tmp/debug-auth-redirect-issue.ts
✅ .tmp/backup-before-schema-change.sql

❌ .tmp/script.sh
❌ .tmp/test.js
❌ .tmp/temp.txt
```

### 2. Include Date for Time-Sensitive Files

```
✅ .tmp/export-2024-01-15.json
✅ .tmp/backup-2024-01-20.sql

❌ .tmp/export.json  # Which export? When?
```

### 3. Add Comments to Scripts

```bash
#!/usr/bin/env bash
# .tmp/fix-duplicate-tasks.sh
# One-time script to remove duplicate tasks created by bug #456
# Run once, then delete after verifying in Prisma Studio
# Date: 2024-01-15

# Script logic here...
```

### 4. Document in Commit Messages

If temp script solves a bug, reference it:

```
fix(tasks): remove duplicate task creation

Bug caused by race condition in createTask operation.
Added transaction to prevent duplicates.

Used .tmp/fix-duplicate-tasks.sh to clean existing duplicates.

Fixes #456
```

---

## Common Questions

### Q: Should I commit my debug scripts?

**A**: No, keep in `.tmp/` (gitignored). If script is useful long-term, refactor and move to `scripts/`.

### Q: How long should I keep temp files?

**A**:

- **Debug scripts**: Delete after debugging
- **Migration scripts**: Keep 30 days (in case rollback needed)
- **Backups**: Keep 30 days or move to external backup
- **Drafts**: Delete after moving to proper location

### Q: Can I share temp files with team?

**A**: No (gitignored). If you need to share:

1. Refactor into proper script/doc
2. Move to appropriate directory
3. Commit to git

### Q: What if I accidentally deleted a temp file?

**A**: It's not in git, so can't recover. For important files:

1. Move to proper directory before deleting
2. Or keep backups outside repo

---

## See Also

- **[../scripts/CLAUDE.md](../scripts/CLAUDE.md)** - Permanent scripts
- **[../docs/CLAUDE.md](../docs/CLAUDE.md)** - Permanent documentation
- **[../.gitignore](../.gitignore)** - Git ignore rules
- **[../CLAUDE.md](../CLAUDE.md)** - File location rules
