# Scripts Directory Context

**AUTO-LOADED** when Claude Code works with files in `scripts/`. **Parent context**: Root CLAUDE.md provides project overview, import rules, testing rules.

---

## ⚡ Multi-Worktree Architecture (NEW)

**Complete isolation for parallel AI development**: Each worktree gets own database + ports + Prisma Studio.

### Port Mapping

| Worktree                         | Frontend | Backend | Database | Studio |
| -------------------------------- | -------- | ------- | -------- | ------ |
| **main** (opensaas-main)         | 3000     | 3001    | 5432     | 5555   |
| **dev1** (opensaas-dev1)         | 3100     | 3101    | 5433     | 5556   |
| **dev2** (opensaas-dev2)         | 3200     | 3201    | 5434     | 5557   |
| **dev3** (opensaas-dev3)         | 3300     | 3301    | 5435     | 5558   |
| **techlead** (opensaas-techlead) | 3400     | 3401    | 5436     | 5559   |

**Key Features:**

- ✅ Auto-detection of current worktree
- ✅ Separate Docker PostgreSQL per worktree
- ✅ Parallel servers without conflicts
- ✅ Multiple Prisma Studios simultaneously
- ✅ Isolated test data and migrations

---

## Quick Reference

| Script                 | When To Use                              | Critical Notes                       |
| ---------------------- | ---------------------------------------- | ------------------------------------ |
| `safe-start.sh`        | **ALWAYS** for starting servers          | Auto-detects worktree, dynamic ports |
| `db-manager.sh`        | Database lifecycle (start/stop/clean)    | Per-worktree database management     |
| `db-studio.sh`         | Launch Prisma Studio                     | Worktree-specific port               |
| `seed-demo-user.sh`    | Start all worktrees parallel             | Seeds demo@example.com user          |
| `test-watch.sh`        | TDD RED phase watch mode                 | Worktree-aware port checks           |
| `fix-react-version.sh` | After `wasp clean` (auto via safe-start) | Fixes React 19 → 18                  |
| `seed-demo-user.sh`    | Seed basic demo user for testing         | Creates demo@example.com             |
| `setup-mcp.sh`         | First-time setup, MCP config changes     | Requires Claude Code restart         |

---

## worktree-config.sh - Central Configuration (NEW)

### Purpose

**Single source of truth** for worktree port mappings. Sourced by all other scripts.

### What It Provides

```bash
# Exported variables (auto-set when sourced)
WORKTREE_NAME     # develop, Dev1, Dev2, Dev3
FRONTEND_PORT     # 3000, 3100, 3200, 3300
BACKEND_PORT      # 3001, 3101, 3201, 3301
DB_PORT           # 5432, 5433, 5434, 5435
STUDIO_PORT       # 5555, 5556, 5557, 5558
DB_NAME           # wasp-dev-db-main, wasp-dev-db-dev1, etc.
DATABASE_URL      # postgresql://dev:dev@localhost:{DB_PORT}/dev
CLIENT_URL        # http://localhost:{FRONTEND_PORT}
SERVER_URL        # http://localhost:{BACKEND_PORT}
```

### Usage in Other Scripts

```bash
# Source at top of script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/worktree-config.sh"

# Now use variables
echo "Starting on port ${FRONTEND_PORT}"
```

### Detection Logic

1. Get git worktree root directory name
2. Match against known patterns:
   - `opensaas-main` → main (3000/3001/5432/5555)
   - `opensaas-dev1` → dev1 (3100/3101/5433/5556)
   - `opensaas-dev2` → dev2 (3200/3201/5434/5557)
   - `opensaas-dev3` → dev3 (3300/3301/5435/5558)
   - `opensaas-techlead` → techlead (3400/3401/5436/5559)
   - `opensaas-cto` → cto (shares main: 3000/3001/5432/5555)
3. Export all variables

---

## db-manager.sh - Database Lifecycle (NEW)

### Purpose

**Manage Docker PostgreSQL containers per worktree**. Ensures complete database isolation.

### Commands

```bash
# Start database for current worktree (auto-detects)
./scripts/db-manager.sh start

# Start database for specific worktree
./scripts/db-manager.sh start opensaas-dev1

# Stop database
./scripts/db-manager.sh stop

# Status of ALL databases (table view)
./scripts/db-manager.sh status

# Reset database (DELETE ALL DATA + recreate)
./scripts/db-manager.sh clean

# Stop all databases
./scripts/db-manager.sh stopall
```

### What It Does

**Start:**

1. Check if container exists → Start if stopped
2. If not exists → Create Docker container:
   ```bash
   docker run -d \
     --name wasp-dev-db-{worktree} \
     -e POSTGRES_USER=dev \
     -e POSTGRES_PASSWORD=dev \
     -e POSTGRES_DB=dev \
     -p {DB_PORT}:5432 \
     postgres:14
   ```
3. Wait for database ready (pg_isready check)

**Status Example:**

```
WORKTREE        CONTAINER                 PORT       STATUS
--------        ---------                 ----       ------
develop         wasp-dev-db-main          5432       RUNNING
Dev1            wasp-dev-db-dev1          5433       RUNNING
Dev2            wasp-dev-db-dev2          5434       STOPPED
Dev3            wasp-dev-db-dev3          5435       NOT CREATED
TechLead        wasp-dev-db-tl            5436       RUNNING
```

### Database Configuration

- **Image:** postgres:14
- **User:** dev
- **Password:** dev
- **Database:** dev
- **Port mapping:** {DB_PORT}:5432

### Use Cases

**New worktree first use:**

```bash
cd /path/to/opensaas-dev1
./scripts/db-manager.sh start  # Creates new database
```

**Check all databases:**

```bash
./scripts/db-manager.sh status  # See what's running
```

**Reset test data:**

```bash
./scripts/db-manager.sh clean  # Wipe database, start fresh
```

---

## db-studio.sh - Prisma Studio Launcher (NEW)

### Purpose

**Launch Prisma Studio on worktree-specific port**. Allows multiple Studios open simultaneously.

### Commands

```bash
# Start Studio for current worktree
./scripts/db-studio.sh

# Start Studio for specific worktree
./scripts/db-studio.sh opensaas-dev1

# Start ALL Studios in background (parallel)
./scripts/db-studio.sh --all
```

### What It Does

1. Source worktree-config → Get STUDIO_PORT
2. Kill existing process on that port
3. Navigate to app/ directory
4. Export DATABASE_URL for correct database
5. Launch: `npx prisma studio --port {STUDIO_PORT}`

### Studio URL Access

After starting all Studios with `--all`:

- develop → http://localhost:5555
- Dev1 → http://localhost:5556
- Dev2 → http://localhost:5557
- Dev3 → http://localhost:5558
- TechLead → http://localhost:5559

**View all 4 databases side-by-side in browser tabs!**

### Stopping Studios

```bash
# Kill all Studios
kill $(lsof -ti:5555,5556,5557,5558)

# Kill specific Studio
kill $(lsof -ti:5556)  # Kill Dev1 Studio
```

---

## seed-demo-user.sh - Parallel Launcher (NEW)

### Purpose

**Power user convenience script**: Start multiple worktrees simultaneously in separate terminal tabs.

### Commands

```bash
# Start all 4 worktrees (develop, Dev1, Dev2, Dev3)
./scripts/seed-demo-user.sh

# Start all + all Prisma Studios
./scripts/seed-demo-user.sh --with-studio

# Start only specific worktrees
./scripts/seed-demo-user.sh dev1 dev2
```

### What It Does

**Terminal automation:**

1. Detect terminal type (iTerm2 / macOS Terminal)
2. For each worktree:
   - Open new tab
   - Navigate to worktree directory
   - Run `./scripts/safe-start.sh`
3. If `--with-studio`: Launch all Studios

**Fallback (no terminal automation):**

- Runs in background processes
- Logs to `/tmp/{worktree}-safe-start.log`

### Use Cases

**AI Developer workflow:**

```bash
# Morning startup - start all worktrees at once
./scripts/seed-demo-user.sh

# View URLs (all running parallel)
develop  → http://localhost:3000 & :3001
Dev1     → http://localhost:3100 & :3101
Dev2     → http://localhost:3200 & :3201
Dev3     → http://localhost:3300 & :3301
TechLead → http://localhost:3400 & :3401
```

**Selective start:**

```bash
# Only Dev1 and Dev2 today
./scripts/seed-demo-user.sh dev1 dev2
```

### Terminal Support

| Terminal       | Support       | Notes                       |
| -------------- | ------------- | --------------------------- |
| iTerm2         | ✅ Full       | New tabs with safe-start.sh |
| macOS Terminal | ✅ Full       | New tabs via AppleScript    |
| Other          | ⚠️ Background | Logs to /tmp/\*.log         |

---

## safe-start.sh - Multi-Worktree Safe Server Start (UPDATED)

### Purpose

**ALWAYS use this instead of direct `wasp start`**. Now with **full worktree isolation** - auto-detects worktree and uses correct ports + database.

### What It Does (NEW Multi-Worktree Flow)

```bash
1. Detect worktree      → Source worktree-config.sh for ports/DB
2. Display config       → Show Frontend/Backend/DB/Studio ports
3. Database check       → Start worktree-specific database via db-manager
4. Environment update   → Update .env.server with DATABASE_URL for this worktree
5. Port cleanup         → Kill processes on FRONTEND_PORT & BACKEND_PORT (dynamic!)
6. Generate .env.client → From template with worktree-specific SERVER_URL/PORT
7. Export env vars      → 7 variables for Wasp runtime + E2E tests
8. Optional clean       → Run wasp clean if --clean flag
9. React fix            → Auto-fix React 18 after wasp clean
10. Start servers       → wasp start (frontend + backend on correct ports)
```

### Usage Patterns

```bash
# Standard startup (auto-detects worktree, uses its ports)
./scripts/safe-start.sh

# After schema.prisma changes (regenerate types)
./scripts/safe-start.sh --clean

# After main.wasp changes (regenerate types)
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

### Critical Implementation Details (UPDATED)

**Worktree Detection** (lines 19-23):

```bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/worktree-config.sh"
# Now have: FRONTEND_PORT, BACKEND_PORT, DB_PORT, DB_NAME, etc.
```

**Database Start** (lines 49-55):

```bash
# Use db-manager to ensure worktree-specific database running
"$SCRIPT_DIR/db-manager.sh" start > /dev/null 2>&1 || {
    echo -e "${YELLOW}  Starting database for this worktree...${NC}"
    "$SCRIPT_DIR/db-manager.sh" start
}
```

**Dynamic Port Killing** (lines 98-114):

```bash
# Kill Vite frontend (dynamic port from worktree-config)
if lsof -ti:${FRONTEND_PORT} > /dev/null 2>&1; then
    kill -9 $(lsof -ti:${FRONTEND_PORT}) || true
fi

# Kill Node backend (dynamic port from worktree-config)
if lsof -ti:${BACKEND_PORT} > /dev/null 2>&1; then
    kill -9 $(lsof -ti:${BACKEND_PORT}) || true
fi
```

**.env.client Generation** (lines 146-155):

```bash
# Generate .env.client from template for Vite to read at build time
if [ -f .env.client.template ]; then
  sed -e "s|{{SERVER_URL}}|${SERVER_URL}|g" \
      -e "s|{{FRONTEND_PORT}}|${FRONTEND_PORT}|g" \
      .env.client.template > .env.client
  echo -e "${GREEN}  ✅ Generated .env.client for ${WORKTREE_NAME}${NC}"
fi
# Template ensures Vite builds use correct ports for this worktree
```

**Environment Variables Export** (lines 157-165):

```bash
# 7 environment variables for Wasp runtime + E2E test support
export PORT=${BACKEND_PORT}                    # Backend server port
export VITE_PORT=${FRONTEND_PORT}             # Vite dev server port
export WASP_WEB_CLIENT_URL=${CLIENT_URL}      # Wasp client URL
export WASP_SERVER_URL=${SERVER_URL}          # Wasp server URL
export FRONTEND_URL=${CLIENT_URL}             # For seedDemoUser + E2E tests
export BACKEND_URL=${SERVER_URL}              # For seedDemoUser + E2E tests
export FRONTEND_PORT                          # For E2E test scripts
export BACKEND_PORT                           # For E2E test scripts
# Wasp respects these env vars for custom ports
```

**DATABASE_URL Update in .env.server** (lines 69-90):

```bash
# Update .env.server with worktree-specific DATABASE_URL
if grep -q "^DATABASE_URL=" app/.env.server; then
    sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=${DATABASE_URL}|" app/.env.server
else
    echo "DATABASE_URL=${DATABASE_URL}" >> app/.env.server
fi

# Also update CLIENT_URL and SERVER_URL for correct ports
```

### Why This Exists

**Problem**: Multiple AI agents or parallel worktrees on single machine → port conflicts + shared database

**Solution**:

1. Kill existing processes on worktree-specific ports
2. Start worktree-specific database
3. Configure environment for correct ports
4. Auto-detect everything - zero manual config

**Wasp Context**: Wasp doesn't handle port conflicts or multi-DB - we wrap it with intelligent detection

---

## fix-react-version.sh - React 18 Enforcement

### Purpose

**Auto-fix React 19 compatibility issue** after `wasp clean`.

### The Problem (Critical for Wasp 0.18)

```
Timeline:
- Oct 1, 2025: React 19.2.0 released
- Wasp 0.18: Only supports React 18.x
- After wasp clean: npm installs latest React (19.x) → blank page
```

### What It Does

```bash
1. Check React version in .wasp/out/web-app/node_modules/react
2. If 19.x detected → npm install react@18.2.0 --save-exact
3. Verify fix successful
4. Warn to restart servers
```

### Implementation Detail

**Critical NPM Flags** (line 53):

```bash
npm install react@18.2.0 react-dom@18.2.0 \
  --save-exact \         # Lock to 18.2.0 exactly
  --legacy-peer-deps \   # Bypass peer dependency warnings
  --silent               # Suppress npm output noise
```

### When Called

**Automatically**: By `safe-start.sh --clean` after wasp clean

**Manually**: Rarely needed - only if blank page after wasp clean

### Wasp-Specific Context

Wasp generates `.wasp/out/web-app` during build. This directory contains the React app with its own `package.json`. The fix installs React 18 _in this generated directory_, not in project root.

**Path**: `app/.wasp/out/web-app/node_modules/react`

---

## seed-demo-user.sh - Demo User Seeding

### Purpose

**Quick setup of demo user with realistic A3 data** for visual testing/screenshots.

### What It Creates

```typescript
// Organization
{
  name: 'Demo Corporation',
  subdomain: 'demo',
  active: true
}

// Department
{
  name: 'Production',
  organizationId: org.id
}

// User (with working password!)
{
  email: 'demo@example.com',
  username: 'demo@example.com',
  organizationId: org.id,
  orgRole: OrgRole.ADMIN,
  // Nested Auth + AuthIdentity
  auth: {
    create: {
      identities: {
        create: {
          providerName: 'email',
          providerUserId: 'demo@example.com',
          providerData: await sanitizeAndSerializeProviderData<'email'>({
            hashedPassword: 'DemoPassword123!',
            isEmailVerified: true,
            emailVerificationSentAt: null,
            passwordResetSentAt: null,
          })
        }
      }
    }
  }
}

// A3 Document
{
  title: 'Reduce Production Downtime - Visual Polish Demo',
  status: A3Status.IN_PROGRESS,
  authorId: user.id,
  organizationId: org.id,
  departmentId: dept.id
}

// 8 A3 Sections
PROJECT_INFO, BACKGROUND, CURRENT_STATE, GOAL,
ROOT_CAUSE, COUNTERMEASURES, IMPLEMENTATION, FOLLOW_UP
```

### Critical Implementation (app/src/server/scripts/seedDemoUser.ts)

**Wasp Auth Password Pattern**:

```typescript
import { sanitizeAndSerializeProviderData } from "wasp/server/auth";

// CRITICAL: Must use <'email'> type parameter for email auth
const providerData = await sanitizeAndSerializeProviderData<"email">({
  hashedPassword: "DemoPassword123!", // Plaintext → auto hashed
  isEmailVerified: true, // Skip email verification
  emailVerificationSentAt: null, // Required for email provider
  passwordResetSentAt: null, // Required for email provider
});

// Create user with nested Auth + AuthIdentity
await prisma.user.create({
  data: {
    // ... user fields
    auth: {
      create: {
        identities: {
          create: {
            providerName: "email",
            providerUserId: "demo@example.com",
            providerData, // Serialized auth data
          },
        },
      },
    },
  },
});
```

**Idempotent Logic** (lines 30-72):

```typescript
// Check if demo user exists
const existingAuth = await prisma.auth.findFirst({
  where: {
    identities: {
      some: {
        providerName: 'email',
        providerUserId: 'demo@example.com'
      }
    }
  },
  include: { user: true }
})

if (existingAuth?.user) {
  // Delete old user, reuse or create org/dept
  await prisma.user.delete({ where: { id: existingAuth.user.id } })
}

// Get or create organization (avoid unique constraint errors)
let org = await prisma.organization.findUnique({
  where: { subdomain: 'demo' }
})
if (!org) {
  org = await prisma.organization.create({ ... })
}
```

### Common Errors Fixed

**❌ Old Approach (Broken)**:

```typescript
providerData: await sanitizeAndSerializeProviderData({
  hashedPassword: password, // Missing type parameter + email fields
});
```

**Why It Failed**: Email auth requires type parameter + extra fields

**✅ Correct Approach**:

```typescript
providerData: await sanitizeAndSerializeProviderData<"email">({
  hashedPassword: password,
  isEmailVerified: true,
  emailVerificationSentAt: null,
  passwordResetSentAt: null,
});
```

### Wasp-Specific Context

**Auth Table Structure**:

```
User (your model)
  → Auth (Wasp-managed)
    → AuthIdentity (Wasp-managed, stores hashed password)
```

Cannot seed users with passwords via normal Prisma because:

- Password hashing requires Wasp's `sanitizeAndSerializeProviderData`
- Auth data stored separately from User model
- Must use nested create pattern

### Login Credentials

```
Email: demo@example.com
Password: DemoPassword123!
URL: http://localhost:3000/login
```

---

## setup-mcp.sh - MCP Playwright Configuration

### Purpose

**Enable browser automation tools in Claude Code** via MCP (Model Context Protocol).

### What It Does

```bash
1. Check .mcp.json exists in project root
2. Create ~/.config/claude/ directory
3. Copy .mcp.json → ~/.config/claude/mcp.json
4. Warn to restart Claude Code
```

### MCP Enabled Tools

After setup + Claude Code restart:

- `mcp__playwright__*` - Browser automation
- Screenshot capabilities
- Web testing tools

### Implementation

**Simple file copy** (lines 29-32):

```bash
mkdir -p ~/.config/claude
cp .mcp.json ~/.config/claude/mcp.json
```

### Critical Note

**Claude Code MUST be restarted** for MCP servers to load!

---

## Common Mistakes (DO NOT DO)

### ❌ Using `wasp start` directly

```bash
# WRONG - Doesn't handle port conflicts
wasp start

# RIGHT - Kills conflicting processes first
./scripts/safe-start.sh
```

### ❌ Using `npm start` in app/

```bash
# WRONG - This is a Wasp project, not plain React
cd app && npm start

# RIGHT - Use Wasp CLI
./scripts/safe-start.sh
```

### ❌ Manual React version fix without restart

```bash
# WRONG - Changes won't apply without restart
./scripts/fix-react-version.sh
# ... continue working ...

# RIGHT - Restart servers after fix
./scripts/fix-react-version.sh
# Kill servers (Ctrl+C)
wasp start
```

### ❌ Creating seed user without email auth fields

```typescript
// WRONG - Missing email-specific fields
providerData: await sanitizeAndSerializeProviderData({
  hashedPassword: password,
});

// RIGHT - Include all email auth fields
providerData: await sanitizeAndSerializeProviderData<"email">({
  hashedPassword: password,
  isEmailVerified: true,
  emailVerificationSentAt: null,
  passwordResetSentAt: null,
});
```

---

## Troubleshooting

### Multi-Worktree Issues (NEW)

#### Wrong Port Detected

**Symptom**: safe-start.sh shows wrong ports for your worktree

**Diagnosis**:

```bash
# Check current worktree name
basename $(pwd)

# Source config manually to see detection
source scripts/worktree-config.sh
echo "Worktree: $WORKTREE_NAME, Frontend: $FRONTEND_PORT"
```

**Fix**: Worktree name must match expected pattern. Check `scripts/worktree-config.sh` line 30-85 for mappings.

#### Database Connection Refused

**Symptom**: `Error: connect ECONNREFUSED 127.0.0.1:5433` (or other DB port)

**Diagnosis**:

```bash
# Check database status
./scripts/db-manager.sh status

# Check if Docker is running
docker ps
```

**Fix**:

```bash
# Start database for current worktree
./scripts/db-manager.sh start

# Or restart safe-start (auto-starts database)
./scripts/safe-start.sh
```

#### Migrations Out of Sync Between Worktrees

**Symptom**: Dev1 has migration that Dev2 doesn't have → conflicts

**Diagnosis**:

```bash
# Check migrations in each worktree
cd opensaas-dev1
ls app/migrations/

cd opensaas-dev2
ls app/migrations/
```

**Fix**: Migrations are **shared** via git (app/migrations/ in repo). Pull latest:

```bash
git fetch origin
git merge origin/develop

# Then run migrations in your database
wasp db migrate-dev
```

**Important**: Each worktree has **separate database**, but **same migration files** (via git).

#### Prisma Studio Shows Wrong Database

**Symptom**: Opened Studio, seeing other worktree's data

**Diagnosis**:

```bash
# Check which Studio port you opened
# Each worktree has unique Studio port
```

**Fix**: Use correct Studio port for your worktree:

- develop → http://localhost:5555
- Dev1 → http://localhost:5556
- Dev2 → http://localhost:5557
- Dev3 → http://localhost:5558
- TechLead → http://localhost:5559

Or run: `./scripts/db-studio.sh` (auto-detects worktree)

#### All Databases Stopped

**Symptom**: Docker Desktop restarted, all databases gone

**Fix**:

```bash
# Start all databases at once
./scripts/db-manager.sh status  # Check current state

# Start each worktree's database
cd ~/Projects/OpenSAAS/opensaas-dev1
./scripts/db-manager.sh start

# Or let safe-start.sh handle it
./scripts/safe-start.sh  # Auto-starts database
```

**Nuclear option** (recreate all):

```bash
docker ps -a | grep wasp-dev-db | awk '{print $1}' | xargs docker rm -f
# Then run safe-start.sh in each worktree (will recreate)
```

### Port Still In Use After safe-start.sh

**Symptom**: `EADDRINUSE :::3100` despite running safe-start.sh

**Diagnosis**:

```bash
# Check what's on your worktree's ports (auto-detected)
source scripts/worktree-config.sh
lsof -ti:$FRONTEND_PORT
lsof -ti:$BACKEND_PORT
```

**Fix**: Script should auto-kill, but if not:

```bash
source scripts/worktree-config.sh
kill -9 $(lsof -ti:$FRONTEND_PORT)
kill -9 $(lsof -ti:$BACKEND_PORT)
./scripts/safe-start.sh
```

### React 19 Still Installed

**Symptom**: Blank page despite running fix script

**Diagnosis**:

```bash
cat app/.wasp/out/web-app/node_modules/react/package.json | grep version
```

**Fix**:

```bash
./scripts/safe-start.sh --clean  # Auto-fixes + restarts
```

### Invalid Credentials After Seeding

**Symptom**: Can't login with demo@example.com / DemoPassword123!

**Diagnosis**: Check if email auth fields are correct

**Fix**: This is now fixed in latest seed script - delete old user and re-seed:

```bash
# In Prisma Studio: Delete user demo@example.com
./scripts/seed-demo-user.sh
```

### Database Not Running

**Symptom**: `Can't reach database server`

**Diagnosis**:

```bash
docker ps | grep wasp-dev-db
```

**Fix**:

```bash
# Start database (foreground - will block terminal)
wasp start db

# In new terminal:
./scripts/safe-start.sh
```

---

## Development Workflow (AI Agents)

### Standard Agent Workflow

```bash
# 1. Start servers
./scripts/safe-start.sh

# 2. Work on code...

# 3. After schema changes
./scripts/safe-start.sh --clean

# 4. Seed test data
./scripts/seed-demo-user.sh
```

### Multi-Worktree Parallel Work (UPDATED)

**NOW: Complete isolation per worktree!**

```bash
# Dev1 Agent (worktree: opensaas-dev1)
cd ~/Projects/OpenSAAS/opensaas-dev1
./scripts/safe-start.sh
# → Starts on ports 3100/3101, database wasp-dev-db-dev1

# Dev2 Agent (worktree: opensaas-dev2) - SIMULTANEOUSLY!
cd ~/Projects/OpenSAAS/opensaas-dev2
./scripts/safe-start.sh
# → Starts on ports 3200/3201, database wasp-dev-db-dev2

# Result: Both running in parallel, no conflicts!
# Dev1: http://localhost:3100
# Dev2: http://localhost:3200
```

**Power user shortcut:**

```bash
# Start all 4 worktrees at once
./scripts/seed-demo-user.sh --with-studio
```

### When To Use Each Script

**`safe-start.sh`**:

- ✅ Starting dev servers (always)
- ✅ After schema.prisma changes (with --clean)
- ✅ After main.wasp changes (with --clean)
- ✅ Port conflict errors
- ✅ Weird errors (try --clean first)

**`fix-react-version.sh`**:

- ❌ Rarely needed (auto via safe-start --clean)
- ✅ Only if blank page after wasp clean

**`seed-demo-user.sh`**:

- ✅ After wasp db reset
- ✅ Need demo data for testing
- ✅ Screenshots/mockups
- ✅ Client demos

**`setup-mcp.sh`**:

- ✅ First time Claude Code setup
- ✅ After .mcp.json changes
- ❌ Not needed regularly

---

## Technical Implementation Notes

### Why safe-start.sh Uses kill -9

```bash
kill -9 $(lsof -ti:3000)
```

**Reason**: Vite/Node dev servers don't always respond to SIGTERM (kill -15). Using SIGKILL (-9) ensures processes are terminated immediately.

**Safety**: Safe because these are development servers, not production processes.

### Why fix-react-version.sh Needs --legacy-peer-deps

```bash
npm install react@18.2.0 --legacy-peer-deps
```

**Reason**: Some dependencies expect React 19.x (latest). Using `--legacy-peer-deps` bypasses peer dependency checks.

**Safety**: Safe because we're forcing React 18 for Wasp compatibility - peer warnings can be ignored.

### Why seedDemoUser.ts Uses Nested Create

```typescript
await prisma.user.create({
  data: {
    auth: {
      create: {
        identities: { create: { ... } }
      }
    }
  }
})
```

**Reason**: Wasp's auth system requires User → Auth → AuthIdentity chain. Cannot create User without Auth, cannot create Auth without AuthIdentity.

**Alternative**: Use Wasp's `createUser` helper (but less flexible for seeding)

---

## See Also

- **[README.md](README.md)** - Human-friendly docs
- **[../CLAUDE.md](../CLAUDE.md)** - Project-wide development guide
- **[../app/CLAUDE.md](../app/CLAUDE.md)** - Wasp-specific patterns
- **[../docs/TROUBLESHOOTING-GUIDE.md](../docs/TROUBLESHOOTING-GUIDE.md)** - Complete troubleshooting

---

## File Locations

**Scripts**: `/scripts/*.sh`

**Seed Implementation**: `/app/src/server/scripts/seedDemoUser.ts`

**Wasp Config**: `/app/main.wasp` (db.seeds array)

**Environment**: `/app/.env.server` (created by safe-start.sh if missing)

**Generated React App**: `/app/.wasp/out/web-app` (React 18 fix target)
