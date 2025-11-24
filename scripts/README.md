# Scripts Directory

Development helper scripts for the OpenSaaS Boilerplate project (Wasp 0.18 framework).

## Multi-Worktree Isolation

**Complete parallel development**: Each worktree gets its own database + ports + Prisma Studio. Zero coordination needed between developers!

| Worktree     | Frontend | Backend | Database | Studio |
| ------------ | -------- | ------- | -------- | ------ |
| **develop**  | 3000     | 3001    | 5432     | 5555   |
| **Dev1**     | 3100     | 3101    | 5433     | 5556   |
| **Dev2**     | 3200     | 3201    | 5434     | 5557   |
| **Dev3**     | 3300     | 3301    | 5435     | 5558   |
| **TechLead** | 3400     | 3401    | 5436     | 5559   |

## Quick Reference

| Script                 | Purpose                                   | Usage                                      |
| ---------------------- | ----------------------------------------- | ------------------------------------------ |
| `safe-start.sh`        | Start dev servers (auto-detects worktree) | `./scripts/safe-start.sh [--clean]`        |
| `db-manager.sh`        | Database lifecycle (start/stop/status)    | `./scripts/db-manager.sh [command]`        |
| `db-studio.sh`         | Launch Prisma Studio (worktree-aware)     | `./scripts/db-studio.sh [--all]`           |
| `multi-start.sh`       | Start all worktrees parallel              | `./scripts/multi-start.sh [--with-studio]` |
| `test-watch.sh`        | TDD watch mode (worktree-aware)           | `./scripts/test-watch.sh`                  |
| `fix-react-version.sh` | Fix React 18 after `wasp clean`           | `./scripts/fix-react-version.sh`           |
| `seed-visual-test.sh`  | Seed demo user with A3 data               | `./scripts/seed-visual-test.sh`            |
| `setup-mcp.sh`         | Setup MCP Playwright for Claude Code      | `./scripts/setup-mcp.sh`                   |

---

## safe-start.sh

**Worktree-aware server start** - Auto-detects your worktree and uses the correct ports + database.

### Purpose

Complete isolation per worktree! Automatically configures ports, database, and environment for your current worktree.

### What It Does (NEW!)

1. 🎯 **Auto-detects current worktree** → Loads correct port configuration
2. 📊 **Shows worktree config** → Frontend/Backend/Database/Studio ports
3. 🗄️ **Starts worktree-specific database** → Separate Docker container per worktree
4. ⚙️ **Updates .env.server** → Sets correct DATABASE_URL for this worktree
5. 💀 **Kills processes on YOUR ports** → Dynamic (not hardcoded 3000/3001)
6. 📄 **Generates .env.client** → From template with worktree-specific values
7. 🌐 **Exports environment vars** → For Wasp runtime & E2E tests:
   - `PORT`, `VITE_PORT` - Server/Vite dev server ports
   - `WASP_WEB_CLIENT_URL`, `WASP_SERVER_URL` - Wasp runtime URLs
   - `FRONTEND_URL`, `BACKEND_URL` - For seedDemoUser + E2E tests
   - `FRONTEND_PORT`, `BACKEND_PORT` - For E2E test scripts
8. 🧹 **Optionally runs wasp clean** → With React 18 auto-fix
9. 🚀 **Starts Wasp servers** → On worktree-specific ports

### Usage

```bash
# Standard start (auto-detects worktree)
./scripts/safe-start.sh

# With wasp clean (regenerates types + fixes React 18)
./scripts/safe-start.sh --clean
```

**Example output (Dev1 worktree):**

```
📍 Worktree Configuration:
   Name:     Dev1
   Frontend: http://localhost:3100
   Backend:  http://localhost:3101
   Database: wasp-dev-db-dev1 (port 5433)
   Studio:   http://localhost:5556
```

### When To Use

- ✅ **Starting dev servers** (always use this instead of direct `wasp start`)
- ✅ **After schema.prisma changes** (with `--clean`)
- ✅ **After main.wasp changes** (with `--clean`)
- ✅ **Port conflict errors** (auto-kills YOUR worktree's ports)
- ✅ **Multi-worktree development** (complete isolation!)

### Common Issues

**"Wrong ports detected"**
→ Check your worktree name matches expected pattern (opensaas-dev1, etc.)

**"Database not running"**
→ Script auto-starts it - just wait for database ready message.

**"React 19 installed / Blank page"**
→ Use `--clean` flag to auto-fix React version.

---

## db-manager.sh

**Database lifecycle management** - Start, stop, clean databases per worktree.

### Purpose

Manage Docker PostgreSQL containers for each worktree. Each worktree gets its own isolated database.

### Usage

```bash
# Show status of ALL databases (table view)
./scripts/db-manager.sh status

# Start database for current worktree
./scripts/db-manager.sh start

# Start database for specific worktree
./scripts/db-manager.sh start opensaas-dev1

# Stop database
./scripts/db-manager.sh stop

# Reset database (DELETE ALL DATA + recreate)
./scripts/db-manager.sh clean

# Stop all databases
./scripts/db-manager.sh stopall
```

### What It Creates

Each worktree gets:

- **Container name**: `wasp-dev-db-{worktree}` (e.g., wasp-dev-db-dev1)
- **Port**: Unique (5432, 5433, 5434, 5435, 5436)
- **Credentials**: dev/dev/dev (user/password/database)
- **Image**: postgres:14

### Example: Status Command

```
WORKTREE        CONTAINER                 PORT       STATUS
--------        ---------                 ----       ------
develop         wasp-dev-db-main          5432       RUNNING
Dev1            wasp-dev-db-dev1          5433       RUNNING
Dev2            wasp-dev-db-dev2          5434       STOPPED
Dev3            wasp-dev-db-dev3          5435       NOT CREATED
TechLead        wasp-dev-db-tl            5436       RUNNING
```

### When To Use

- ✅ **Check database status** (`status` command)
- ✅ **Start new worktree** (`start` command)
- ✅ **Reset test data** (`clean` command)
- ✅ **Stop all after work** (`stopall` command)

---

## db-studio.sh

**Prisma Studio launcher** - Open database viewer on worktree-specific port.

### Purpose

Launch Prisma Studio with correct port and database for your worktree. Allows multiple Studios open simultaneously!

### Usage

```bash
# Start Studio for current worktree
./scripts/db-studio.sh

# Start Studio for specific worktree
./scripts/db-studio.sh opensaas-dev1

# Start ALL Studios in background (parallel)
./scripts/db-studio.sh --all
```

### Studio URLs

After starting all with `--all`:

- develop → http://localhost:5555
- Dev1 → http://localhost:5556
- Dev2 → http://localhost:5557
- Dev3 → http://localhost:5558
- TechLead → http://localhost:5559

**View all 5 databases side-by-side in browser tabs!**

### Stopping Studios

```bash
# Kill all Studios
kill $(lsof -ti:5555,5556,5557,5558,5559)

# Kill specific Studio
kill $(lsof -ti:5556)  # Dev1 only
```

### When To Use

- ✅ **View database contents**
- ✅ **Edit data manually**
- ✅ **Compare data across worktrees** (with `--all`)

---

## multi-start.sh

**Parallel worktree launcher** - Start all worktrees simultaneously in separate terminal tabs.

### Purpose

Power user convenience script for starting multiple worktrees at once using terminal automation.

### Usage

```bash
# Start all 5 worktrees (develop, Dev1, Dev2, Dev3, TechLead)
./scripts/multi-start.sh

# Start all + all Prisma Studios
./scripts/multi-start.sh --with-studio

# Start only specific worktrees
./scripts/multi-start.sh dev1 dev2

# Show help
./scripts/multi-start.sh --help
```

### What It Does

1. Opens new terminal tab for each worktree
2. Navigates to worktree directory
3. Runs `./scripts/safe-start.sh` in each
4. Optionally launches all Prisma Studios

**Result**: All 5 worktrees running in parallel!

```
develop  → http://localhost:3000 & :3001
Dev1     → http://localhost:3100 & :3101
Dev2     → http://localhost:3200 & :3201
Dev3     → http://localhost:3300 & :3301
TechLead → http://localhost:3400 & :3401
```

### Terminal Support

| Terminal       | Support       | Notes                    |
| -------------- | ------------- | ------------------------ |
| iTerm2         | ✅ Full       | New tabs via AppleScript |
| macOS Terminal | ✅ Full       | New tabs via AppleScript |
| Other          | ⚠️ Background | Logs to /tmp/\*.log      |

### When To Use

- ✅ **Morning startup** - Start all worktrees at once
- ✅ **Demos** - Need all environments running
- ✅ **Multi-agent coordination** - Parallel AI development

---

## test-watch.sh

**TDD watch mode launcher** - Start Vitest in watch mode with worktree-aware checks.

### Purpose

Launch Vitest watch mode for RED phase TDD, with checks for correct worktree server/database.

### Usage

```bash
# From project root (recommended)
./scripts/test-watch.sh

# Or from app/ directory
cd app && wasp test client
```

### What It Does

1. Checks dev servers running on YOUR worktree's ports
2. Verifies database is running (YOUR worktree's database)
3. Navigates to app/ directory
4. Launches: `wasp test client` (watch mode)

### When To Use

- ✅ **TDD RED phase** - Writing tests first
- ✅ **Real-time feedback** - Auto-runs on file save
- ✅ **Component development** - Test-driven React components

**Keep terminal open during development** - tests run automatically on save!

---

## fix-react-version.sh

**Force install React 18** after `wasp clean` (fixes React 19 compatibility issue).

### The Problem

After running `wasp clean`, npm installs React 19.2.0 (released Oct 2025), but Wasp 0.18 only supports React 18. This causes a blank page in the browser.

### The Solution

This script force-installs React 18.2.0 in `.wasp/out/web-app` after Wasp's build.

### Usage

```bash
# Manual fix (if needed)
./scripts/fix-react-version.sh

# Automatic fix (recommended)
./scripts/safe-start.sh --clean
```

### When To Use

- ✅ **After `wasp clean`** (React 19 gets installed)
- ✅ **Blank page in browser** (React version mismatch)
- ❌ **Not needed normally** (use `safe-start.sh --clean` instead)

### How It Works

1. Checks current React version in `.wasp/out/web-app/node_modules`
2. If React 19.x detected → installs React 18.2.0 exact
3. Warns to restart servers (Ctrl+C → `wasp start`)

**Note:** `safe-start.sh --clean` runs this automatically, so you rarely need to call it directly.

---

## seed-visual-test.sh

**Seed demo user with complete A3 data** for visual testing.

### Purpose

Quickly populate the database with a working demo user + realistic A3 document after a `wasp db reset`.

### What It Creates

- ✅ **User**: `demo@example.com` with working password
- ✅ **Organization**: "Demo Corporation" (subdomain: demo)
- ✅ **Department**: "Production"
- ✅ **A3 Document**: "Reduce Production Downtime" with 8 sections
- ✅ **Realistic Content**: Dutch text in all A3 sections

### Usage

```bash
./scripts/seed-visual-test.sh
```

### Login Credentials

After seeding, you can login at http://localhost:3000/login with:

- **Email**: `demo@example.com`
- **Password**: `DemoPassword123!`

### When To Use

- ✅ **After database reset** (lost your demo data)
- ✅ **Visual testing** (need realistic A3 content)
- ✅ **Screenshots** (demo data for mockups)
- ✅ **Client demos** (quick setup)

### Features

- **Idempotent**: Safe to run multiple times (checks if user exists)
- **Complete Auth**: Uses Wasp's `sanitizeAndSerializeProviderData` for proper password hashing
- **Realistic Data**: 8 A3 sections with Dutch production downtime scenario
- **Instant Login**: No email verification needed (`isEmailVerified: true`)

### Output

```
🌱 Seeding demo user with A3 data...
✅ Demo user seeded successfully!

📧 Email: demo@example.com
🔑 Password: DemoPassword123!
📝 A3 ID: 36147b94-0799-4459-a7b5-7400a98228e1
🔗 URL: http://localhost:3000/app/a3/36147b94-0799-4459-a7b5-7400a98228e1
```

### Technical Details

For AI/developers: See implementation at `app/src/server/scripts/seedDemoUser.ts`

- Uses nested Prisma create for User → Auth → AuthIdentity
- Reuses existing Organization/Department if present
- Deletes old demo user if exists (recreates with correct password)
- Creates all 8 A3 section types with JSON content

---

## setup-mcp.sh

**Setup MCP Playwright server** for Claude Code browser automation.

### Purpose

Copies `.mcp.json` to Claude's global config location to enable Playwright tools in Claude Code.

### What It Enables

- 🌐 Browser automation tools (`mcp__playwright__*`)
- 📸 Screenshot and snapshot capabilities
- 🧪 Web testing tools

### Usage

```bash
./scripts/setup-mcp.sh
```

### What It Does

1. Checks `.mcp.json` exists in project root
2. Creates `~/.config/claude/` directory if needed
3. Copies `.mcp.json` → `~/.config/claude/mcp.json`
4. Warns to restart Claude Code

### When To Use

- ✅ **First time setup** (enable MCP tools in Claude Code)
- ✅ **After .mcp.json changes** (update MCP config)
- ✅ **New machine setup** (configure Claude Code)

### Important

**You MUST restart Claude Code** after running this script for MCP servers to load!

---

## Troubleshooting

### Multi-Worktree Issues

#### Wrong Ports Detected

**Symptom**: `safe-start.sh` shows wrong ports for your worktree

**Solution**: Check your worktree name matches expected pattern:

```bash
basename $(pwd)  # Should be: opensaas-dev1, opensaas-dev2, etc.

# Check what config detects
source scripts/worktree-config.sh
echo "Worktree: $WORKTREE_NAME, Frontend: $FRONTEND_PORT"
```

#### Database Connection Refused

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:5433`

**Solution**: Your worktree's database isn't running

```bash
# Check database status
./scripts/db-manager.sh status

# Start database for current worktree
./scripts/db-manager.sh start
```

#### All Databases Stopped

**Symptom**: Docker Desktop restarted, all databases gone

**Solution**: Check status and start needed databases

```bash
./scripts/db-manager.sh status   # See what's running
./scripts/db-manager.sh start    # Start current worktree's DB

# Or use multi-start.sh to restart all worktrees
./scripts/multi-start.sh
```

#### Migrations Out of Sync

**Symptom**: Dev1 has migration that Dev2 doesn't have → conflicts

**Solution**: Migrations are **shared via git** (app/migrations/ in repo). Pull latest:

```bash
git fetch origin
git merge origin/develop

# Then run migrations in YOUR database
wasp db migrate-dev
```

**Important**: Each worktree has **separate database**, but **same migration files** (via git).

---

### Port Conflicts

**Error**: `EADDRINUSE: address already in use :::3100` (or other port)

**Solution**: Run `./scripts/safe-start.sh` - it auto-kills YOUR worktree's ports

**Check manually**:

```bash
source scripts/worktree-config.sh
lsof -ti:$FRONTEND_PORT
lsof -ti:$BACKEND_PORT
```

---

### React Version Issues

**Symptoms**: Blank page in browser after `wasp clean`

**Solution**: Run `./scripts/safe-start.sh --clean` (auto-fixes React 18)

---

### Database Connection

**Error**: `Can't reach database server`

**Solution**:

1. Check Docker is running: `docker info`
2. Check database status: `./scripts/db-manager.sh status`
3. Start database: `./scripts/db-manager.sh start`

---

### Seed Errors

**Error**: `Unique constraint failed on 'subdomain'`

**Solution**: The seed script now handles this automatically (reuses existing org/dept)

**Error**: `Invalid credentials` after seeding

**Solution**: This is now fixed - the script uses proper Wasp email auth with:

```typescript
sanitizeAndSerializeProviderData<"email">({
  hashedPassword: password,
  isEmailVerified: true,
  emailVerificationSentAt: null,
  passwordResetSentAt: null,
});
```

---

## Development Workflow

### Standard Development

```bash
# Daily startup
./scripts/safe-start.sh

# After schema changes
./scripts/safe-start.sh --clean
```

### Visual Testing

```bash
# Reset database
wasp db reset

# Seed demo user
./scripts/seed-visual-test.sh

# Login and test
open http://localhost:3000/login
# Email: demo@example.com
# Password: DemoPassword123!
```

### Multi-Worktree Parallel Development (NEW!)

**Complete isolation** - No coordination needed between developers!

```bash
# Dev1 Agent (separate terminal)
cd ~/Projects/OpenSAAS/opensaas-dev1
./scripts/safe-start.sh
# → Runs on ports 3100/3101, database wasp-dev-db-dev1

# Dev2 Agent (separate terminal) - SIMULTANEOUSLY!
cd ~/Projects/OpenSAAS/opensaas-dev2
./scripts/safe-start.sh
# → Runs on ports 3200/3201, database wasp-dev-db-dev2

# Result: Both running in parallel with isolated databases!
```

**Power user shortcut:**

```bash
# Start all 5 worktrees at once
./scripts/multi-start.sh --with-studio
```

**Check all databases:**

```bash
./scripts/db-manager.sh status
```

---

## Technical Notes

### Wasp Framework

All scripts are designed for **Wasp 0.18** full-stack framework:

- Frontend: React 18 + Vite (dynamic ports)
- Backend: Node.js + Prisma (dynamic ports)
- Database: PostgreSQL via Docker (unique per worktree)

### Multi-Worktree Complete Isolation (NEW!)

Each worktree gets:

- **Own ports**: Frontend, Backend, Database, Prisma Studio
- **Own database**: Separate Docker container with isolated data
- **Auto-detection**: Based on directory name (opensaas-dev1, etc.)
- **Zero coordination**: Developers work independently without conflicts

**How it works:**

1. `worktree-config.sh` detects current worktree via directory name
2. Exports port/database configuration for that worktree
3. All scripts source this config and use the correct settings
4. `safe-start.sh` exports environment vars that Wasp respects

### React Version Lock

Wasp 0.18 requires React 18.x. After `wasp clean`, npm installs React 19.x (latest), breaking the app. Scripts auto-fix this.

---

## See Also

- **[scripts/CLAUDE.md](CLAUDE.md)** - AI-friendly technical documentation
- **[../CLAUDE.md](../CLAUDE.md)** - Project-wide development guide
- **[../docs/TROUBLESHOOTING-GUIDE.md](../docs/TROUBLESHOOTING-GUIDE.md)** - Complete troubleshooting
