# Multi-Worktree Development Guide

**Date:** 2025-10-27
**Version:** 2.0 - Complete Isolation Architecture
**Status:** Production Ready

**Purpose:** Complete guide for parallel multi-worktree development with **isolated databases and ports** per worktree.

**Related docs:**

- **Scripts reference:** `scripts/CLAUDE.md` (detailed script documentation)
- **Wasp development:** `app/CLAUDE.md` (operations, migrations, Wasp commands)
- **Task management:** `tasks/CLAUDE.md` (daily tasks, worktree-specific tasks)

---

## 🚀 What's New in v2.0

**Complete Isolation Architecture:**

| Feature            | v1.0 (Old)          | v2.0 (NEW)                                  |
| ------------------ | ------------------- | ------------------------------------------- |
| **Database**       | Shared              | ✨ Isolated per worktree                    |
| **Ports**          | 3000/3001 only      | ✨ Auto-mapped (3000/3001, 3100/3101, etc.) |
| **Prisma Studio**  | One at a time       | ✨ All 5 simultaneously                     |
| **Port conflicts** | Manual coordination | ✨ Zero conflicts (auto-detection)          |
| **Test data**      | Shared between all  | ✨ Isolated per worktree                    |
| **Migrations**     | Sync required       | ✨ Independent per database                 |

**Result:** True parallel development - **zero coordination needed**.

---

## 📖 Overview

### What is Multi-Worktree Development?

**Git worktrees** = Multiple branches checked out simultaneously in separate directories.

**Our Setup (5 Worktrees):**

```
/Users/you/Projects/LEANAICOACH/
├── lean-ai-coach/        # develop → Ports 3000/3001, DB 5432, Studio 5555
├── lean-ai-coach-Dev1/   # Dev1    → Ports 3100/3101, DB 5433, Studio 5556
├── lean-ai-coach-Dev2/   # Dev2    → Ports 3200/3201, DB 5434, Studio 5557
├── lean-ai-coach-Dev3/   # Dev3    → Ports 3300/3301, DB 5435, Studio 5558
└── lean-ai-coach-tl/     # TechLead→ Ports 3400/3401, DB 5436, Studio 5559
```

**Each worktree has:**

- ✅ Own frontend server (different port)
- ✅ Own backend server (different port)
- ✅ Own PostgreSQL database (Docker container)
- ✅ Own Prisma Studio (different port)
- ✅ Auto-detection (zero manual config)

---

## 🎯 Port & Database Mapping

**Automatic Port Assignment:**

| Worktree                        | Frontend | Backend | Database | Studio | Container Name    |
| ------------------------------- | -------- | ------- | -------- | ------ | ----------------- |
| **develop** (lean-ai-coach)     | 3000     | 3001    | 5432     | 5555   | wasp-dev-db-main  |
| **Dev1** (lean-ai-coach-Dev1)   | 3100     | 3101    | 5433     | 5556   | wasp-dev-db-dev1  |
| **Dev2** (lean-ai-coach-Dev2)   | 3200     | 3201    | 5434     | 5557   | wasp-dev-db-dev2  |
| **Dev3** (lean-ai-coach-Dev3)   | 3300     | 3301    | 5435     | 5558   | wasp-dev-db-dev3  |
| **TechLead** (lean-ai-coach-tl) | 3400     | 3401    | 5436     | 5559   | wasp-dev-db-tl    |
| **AnGr1** (lean-ai-coach-AnGr1) | 3500     | 3501    | 5437     | 5560   | wasp-dev-db-angr1 |

**How it works:**

1. Script detects worktree directory name
2. Looks up port mapping in `scripts/worktree-config.sh`
3. Exports environment variables
4. Starts servers on correct ports
5. Connects to worktree-specific database

**Zero configuration needed!**

---

## 🚀 Quick Start

### Daily Development Workflow

**Morning startup:**

```bash
# 1. Navigate to your worktree
cd /Users/you/Projects/LEANAICOACH/lean-ai-coach-Dev1

# 2. Start servers (auto-detects Dev1, uses ports 3100/3101)
./scripts/safe-start.sh

# Output:
# 📍 Worktree Configuration:
#    Name:     Dev1
#    Frontend: http://localhost:3100
#    Backend:  http://localhost:3101
#    Database: wasp-dev-db-dev1 (port 5433)
#    Studio:   http://localhost:5556
#
# 🚀 Starting servers for Dev1...
```

**That's it!** Server running on 3100/3101, database on 5433.

**Switch to different worktree:**

```bash
# Dev2 wants to work
cd /Users/you/Projects/LEANAICOACH/lean-ai-coach-Dev2
./scripts/safe-start.sh

# Output:
#    Frontend: http://localhost:3200  ← Different port!
#    Backend:  http://localhost:3201
#    Database: wasp-dev-db-dev2 (port 5434)  ← Different database!

# Dev1 STILL RUNNING on 3100/3101!
# NO CONFLICTS!
```

---

## 🛠️ Essential Scripts

### 1. `safe-start.sh` - Smart Server Start

**Auto-detects worktree** and starts on correct ports + database.

```bash
# Standard start
./scripts/safe-start.sh

# With wasp clean (regenerate types)
./scripts/safe-start.sh --clean
```

**What it does:**

1. Detects worktree → Loads port config
2. Starts worktree-specific database (if not running)
3. Updates `.env.server` with correct DATABASE_URL
4. Kills processes on THIS worktree's ports only
5. Generates `app/.env.client` from template (for Vite build-time config)
6. Exports environment variables:
   - `PORT`, `VITE_PORT` - Server/Vite ports
   - `WASP_WEB_CLIENT_URL`, `WASP_SERVER_URL` - Wasp runtime config
   - `FRONTEND_URL`, `BACKEND_URL` - For seedDemoUser and E2E tests
   - `FRONTEND_PORT`, `BACKEND_PORT` - For E2E test scripts
7. Starts Wasp servers

### 2. `db-manager.sh` - Database Lifecycle

**Manage all worktree databases:**

```bash
# View status of ALL databases
./scripts/db-manager.sh status

# Output:
# WORKTREE    CONTAINER           PORT    STATUS
# develop     wasp-dev-db-main    5432    RUNNING
# Dev1        wasp-dev-db-dev1    5433    RUNNING
# Dev2        wasp-dev-db-dev2    5434    STOPPED
# Dev3        wasp-dev-db-dev3    5435    NOT CREATED
# TechLead    wasp-dev-db-tl      5436    RUNNING

# Start database for current worktree
./scripts/db-manager.sh start

# Reset database (DELETE ALL DATA)
./scripts/db-manager.sh clean

# Stop all databases
./scripts/db-manager.sh stopall
```

### 3. `db-studio.sh` - Prisma Studio Launcher

**Launch Prisma Studio on worktree-specific port:**

```bash
# Start Studio for current worktree
./scripts/db-studio.sh
# → Opens http://localhost:5556 (if Dev1)

# Start ALL Studios simultaneously
./scripts/db-studio.sh --all
# → Opens:
#   develop:  http://localhost:5555
#   Dev1:     http://localhost:5556
#   Dev2:     http://localhost:5557
#   Dev3:     http://localhost:5558
#   TechLead: http://localhost:5559
```

**View all 5 databases side-by-side in browser tabs!**

### 4. `multi-start.sh` - Parallel Launcher (Power Users)

**Start multiple worktrees simultaneously:**

```bash
# Start all 5 worktrees in separate terminal tabs
./scripts/multi-start.sh

# Start all + all Prisma Studios
./scripts/multi-start.sh --with-studio

# Start only specific worktrees
./scripts/multi-start.sh dev1 dev2 tl
```

**Uses iTerm/Terminal automation** to open tabs.

---

## 💼 Common Workflows

### Workflow A: Solo Developer with Multiple Features

**Morning:**

```bash
cd ~/Projects/LEANAICOACH/lean-ai-coach-Dev1
./scripts/safe-start.sh
# Work on feature A (frontend 3100, DB dev1)
```

**Switch features:**

```bash
cd ~/Projects/LEANAICOACH/lean-ai-coach-Dev2
./scripts/safe-start.sh
# Work on feature B (frontend 3200, DB dev2)
# Feature A STILL AVAILABLE on 3100!
```

**Compare features:**

```
Browser tabs:
- Tab 1: http://localhost:3100 (Feature A)
- Tab 2: http://localhost:3200 (Feature B)
Side-by-side comparison!
```

### Workflow B: Two AI Developers (Parallel Work)

**Developer 1 (morning):**

```bash
cd lean-ai-coach-Dev1
./scripts/safe-start.sh
# Servers: 3100/3101, Database: dev1
# Working on overview page
```

**Developer 2 (same time!):**

```bash
cd lean-ai-coach-Dev2
./scripts/safe-start.sh
# Servers: 3200/3201, Database: dev2
# Working on detail page
```

**NO CONFLICTS!** Both work independently.

**Integration testing:**

```bash
cd lean-ai-coach  # develop worktree
git pull origin develop  # Get merged features
./scripts/safe-start.sh  # Test combined on 3000
```

### Workflow C: Database Isolation Benefits

**Dev1: Testing with production-like data:**

```bash
cd lean-ai-coach-Dev1
./scripts/safe-start.sh
# Seed realistic data for screenshot
./scripts/seed-visual-test.sh
# Database dev1 has demo data
```

**Dev2: Testing with edge cases (same time!):**

```bash
cd lean-ai-coach-Dev2
./scripts/safe-start.sh
# Create edge case data manually
# Database dev2 has edge cases
```

**No interference!** Each database is isolated.

---

## 🔧 Worktree Management

### Creating New Worktree

**Step 1: Create worktree**

```bash
cd ~/Projects/LEANAICOACH/lean-ai-coach  # Main worktree
git worktree add ../lean-ai-coach-Dev1 -b feature/sprint-2-overview
```

**Step 2: Navigate and start**

```bash
cd ../lean-ai-coach-Dev1
./scripts/safe-start.sh
# Auto-detects Dev1 → Uses ports 3100/3101, database 5433
```

**Done!** Worktree ready with isolated environment.

### Listing Worktrees

```bash
git worktree list
# /path/to/lean-ai-coach       52cff37 [feature/TL-techlead]
# /path/to/lean-ai-coach-Dev1   579589a [feature/sprint-2-overview]
# /path/to/lean-ai-coach-Dev2   313c736 [feature/sprint-2-detail]
```

### Removing Worktree

**After feature merged:**

```bash
cd ~/Projects/LEANAICOACH/lean-ai-coach  # Navigate OUT of worktree first
git worktree remove ../lean-ai-coach-Dev1
git branch -d feature/sprint-2-overview

# Optional: Clean up database container
docker rm -f wasp-dev-db-dev1
```

---

## 📋 Database Management

### View Database Status

```bash
./scripts/db-manager.sh status

# Shows:
# - Which databases are running
# - Port numbers
# - Container names
```

### Start Database

```bash
# Auto-start for current worktree
./scripts/db-manager.sh start

# Or specify worktree
./scripts/db-manager.sh start lean-ai-coach-Dev2
```

**Creates Docker PostgreSQL container** if doesn't exist.

### Reset Database

```bash
# DELETE ALL DATA in current worktree database
./scripts/db-manager.sh clean

# Recreates empty database
# Useful for: Fresh start, clean slate testing
```

### Sync Migrations

**When Dev1 creates migration:**

```bash
# In Dev1 worktree:
vim app/schema.prisma  # Add field
wasp db migrate-dev "Add email field"
git commit -m "schema: add email to User"
git push origin feature/sprint-2-overview
```

**Dev2 syncs after merge:**

```bash
# In Dev2 worktree:
git pull origin develop  # Get migration files
wasp db migrate-dev      # Apply to Dev2's database
./scripts/safe-start.sh  # Restart for type updates
```

**Key point:** Migration **files** shared via git, but applied to **separate databases**.

---

## 🧪 Testing Workflows

### Test in Isolation

```bash
cd lean-ai-coach-Dev1
./scripts/safe-start.sh
# Test at http://localhost:3100
# Database: dev1 (isolated test data)
```

### Test Integration

```bash
cd lean-ai-coach  # develop worktree
git pull origin develop  # All merged features
./scripts/safe-start.sh
# Test at http://localhost:3000
# Database: main (integration data)
```

### Compare Before/After

```bash
# Keep develop running:
cd lean-ai-coach
./scripts/safe-start.sh
# → http://localhost:3000 (current state)

# Start feature in parallel:
cd lean-ai-coach-Dev1
./scripts/safe-start.sh
# → http://localhost:3100 (new feature)

# Open both in browser side-by-side!
```

### E2E Test Support

**Multi-worktree isolation extends to E2E tests.** Each worktree exports environment variables for testing:

```bash
# These variables are auto-exported by safe-start.sh:
FRONTEND_URL=${CLIENT_URL}    # E.g., http://localhost:3100
BACKEND_URL=${SERVER_URL}     # E.g., http://localhost:3101
FRONTEND_PORT                 # E.g., 3100
BACKEND_PORT                  # E.g., 3101
```

**Usage in E2E tests:**

```typescript
// e2e-tests/tests/a3-overview.spec.ts
const baseURL = process.env.FRONTEND_URL || "http://localhost:3000";

test("navigate to A3 overview", async ({ page }) => {
  await page.goto(baseURL + "/app/a3");
  // Test runs against YOUR worktree's port!
});
```

**Benefits:**

- ✅ Run E2E tests in Dev1 worktree without affecting Dev2
- ✅ Test different feature versions in parallel
- ✅ Isolated test data per worktree

**Template system:**

safe-start.sh generates `app/.env.client` from `app/.env.client.template`:

```bash
# app/.env.client.template
REACT_APP_API_URL={{SERVER_URL}}
REACT_APP_PORT={{FRONTEND_PORT}}

# Generated app/.env.client (Dev1):
REACT_APP_API_URL=http://localhost:3101
REACT_APP_PORT=3100
```

This ensures Vite builds use correct ports at build time.

---

## 🔍 Troubleshooting

### Problem: Wrong Ports Detected

**Symptom:** safe-start.sh shows unexpected ports

**Diagnosis:**

```bash
source scripts/worktree-config.sh
echo "Detected: $WORKTREE_NAME, Port: $FRONTEND_PORT"
```

**Fix:** Worktree name must match expected pattern. Check `scripts/worktree-config.sh`.

### Problem: Database Connection Refused

**Symptom:** `ECONNREFUSED 127.0.0.1:5433`

**Fix:**

```bash
# Check database status
./scripts/db-manager.sh status

# Start database
./scripts/db-manager.sh start
```

### Problem: Migrations Out of Sync

**Symptom:** Dev1 has migration, Dev2 doesn't

**Fix:** Migrations are **in git** - just pull:

```bash
git pull origin develop
wasp db migrate-dev  # Apply to THIS worktree's database
```

### Problem: Port Still In Use

**Symptom:** `EADDRINUSE :::3100`

**Fix:**

```bash
# Check what's on port
lsof -ti:3100

# Kill it
kill -9 $(lsof -ti:3100)

# Or use safe-start (auto-kills)
./scripts/safe-start.sh
```

---

## ✅ Best Practices

### DO:

✅ **Use safe-start.sh** - Auto-detects everything
✅ **View database status** - `./scripts/db-manager.sh status`
✅ **Use multiple Studios** - `./scripts/db-studio.sh --all`
✅ **Reset database** - `./scripts/db-manager.sh clean` for fresh start
✅ **Pull + migrate** - After pulling schema changes
✅ **Name worktrees correctly** - lean-ai-coach-Dev1, lean-ai-coach-Dev2

### DON'T:

❌ **Don't use `wasp start` directly** - Bypasses worktree detection
❌ **Don't manually configure ports** - Auto-detected from directory name
❌ **Don't share .env.server** - Updated automatically per worktree
❌ **Don't delete database containers** - Use `db-manager.sh clean` instead
❌ **Don't forget migrations** - Always run after git pull

---

## 📚 Architecture Details

### How Auto-Detection Works

**1. Worktree directory name detection:**

```bash
# Scripts detect: basename $(git rev-parse --show-toplevel)
# Example: "lean-ai-coach-Dev1"
```

**2. Lookup in `worktree-config.sh`:**

```bash
case "lean-ai-coach-Dev1" in
  "lean-ai-coach-Dev1")
    export FRONTEND_PORT=3100
    export BACKEND_PORT=3101
    export DB_PORT=5433
    export STUDIO_PORT=5556
    export DB_NAME="wasp-dev-db-dev1"
    ;;
esac
```

**3. Environment variables exported:**

- `PORT=3101` (backend)
- `WASP_WEB_CLIENT_URL=http://localhost:3100`
- `WASP_SERVER_URL=http://localhost:3101`
- `DATABASE_URL=postgresql://dev:dev@localhost:5433/dev`

**4. Wasp respects env vars** - Starts on custom ports

### Database Isolation

**Each worktree gets own Docker container:**

```bash
docker run -d \
  --name wasp-dev-db-dev1 \
  -e POSTGRES_USER=dev \
  -e POSTGRES_PASSWORD=dev \
  -e POSTGRES_DB=dev \
  -p 5433:5432 \
  postgres:14
```

**Benefits:**

- Isolated test data
- Independent migrations
- Parallel testing
- Easy reset (delete container)

---

## 🎯 Quick Reference

### Essential Commands

```bash
# Start servers (auto-detects worktree)
./scripts/safe-start.sh

# View all databases
./scripts/db-manager.sh status

# Prisma Studio (worktree-specific)
./scripts/db-studio.sh

# All Studios simultaneously
./scripts/db-studio.sh --all

# Start all worktrees parallel (power users)
./scripts/multi-start.sh --with-studio
```

### Port Reference

```bash
# Worktree → Frontend/Backend/DB/Studio
develop  → 3000/3001/5432/5555
Dev1     → 3100/3101/5433/5556
Dev2     → 3200/3201/5434/5557
Dev3     → 3300/3301/5435/5558
TechLead → 3400/3401/5436/5559
AnGr1    → 3500/3501/5437/5560
```

### Common Workflows

```bash
# Daily startup
cd worktree-dir && ./scripts/safe-start.sh

# After git pull with migrations
git pull origin develop
wasp db migrate-dev
./scripts/safe-start.sh

# Reset database
./scripts/db-manager.sh clean

# View all databases
./scripts/db-studio.sh --all
```

---

## 🔗 Related Documentation

**This Project:**

- **Scripts reference:** `scripts/CLAUDE.md` (complete script documentation)
- **Wasp development:** `app/CLAUDE.md` (operations, database, env vars)
- **Troubleshooting:** `docs/TROUBLESHOOTING-GUIDE.md` (complete diagnostic guide)

**Wasp Framework:**

- Wasp docs: https://wasp.sh/docs
- Database: https://wasp.sh/docs/data-model/entities

**Git Worktrees:**

- Git worktree docs: https://git-scm.com/docs/git-worktree

---

## 💡 Tips & Tricks

### Tip 1: Shell Aliases

```bash
# Add to ~/.zshrc or ~/.bashrc:
alias ws='./scripts/safe-start.sh'
alias wsc='./scripts/safe-start.sh --clean'
alias dbs='./scripts/db-manager.sh status'
alias studio='./scripts/db-studio.sh'
```

### Tip 2: Multi-Start Workflow

```bash
# Morning: Start all worktrees at once
./scripts/multi-start.sh --with-studio

# Opens 5 terminal tabs + 5 Studios
# Access any worktree instantly via tab switching
```

### Tip 3: Browser Bookmarks

```
Bookmarks Folder: "Worktrees"
├── develop:  http://localhost:3000
├── Dev1:     http://localhost:3100
├── Dev2:     http://localhost:3200
├── Dev3:     http://localhost:3300
└── TechLead: http://localhost:3400
```

### Tip 4: VS Code Multi-Root

File → Add Folder to Workspace:

- Add all 5 worktrees
- See all in sidebar
- Search across all
- Git per worktree

---

## 🎯 Summary

**v2.0 Multi-Worktree = Complete Isolation:**

✅ **5 Worktrees** - develop, Dev1, Dev2, Dev3, TechLead
✅ **Auto port mapping** - Zero configuration
✅ **Isolated databases** - Own PostgreSQL per worktree
✅ **5 Prisma Studios** - View all simultaneously
✅ **Zero conflicts** - True parallel development

**Key command:**

```bash
./scripts/safe-start.sh  # This is all you need 99% of the time
```

**For detailed script documentation:**

- See `scripts/CLAUDE.md`

**For Wasp-specific development:**

- See `app/CLAUDE.md`

---

**Last Updated:** 2025-10-27
**Version:** 2.0 - Complete Isolation Architecture
**Maintainer:** TechLead
**Status:** Production Ready
