#!/bin/bash
# scripts/test-watch.sh
# Launch Vitest in watch mode for TDD RED phase
#
# Purpose: Start test watch mode with proper environment verification
# Use case: RED phase of TDD workflow - catch infrastructure issues immediately
# Usage: ./scripts/test-watch.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'  # No Color

# Get script directory and source worktree config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/worktree-config.sh"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Test Watch Mode - TDD RED Phase      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Show worktree configuration
echo -e "${BLUE}📍 Worktree:${NC} ${WORKTREE_NAME}"
echo -e "${BLUE}   Frontend: ${NC}http://localhost:${FRONTEND_PORT}"
echo -e "${BLUE}   Backend:  ${NC}http://localhost:${BACKEND_PORT}"
echo ""

# Step 1: Check database
echo -e "${YELLOW}🗄️  Checking database...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}  ⚠️  Docker is not running!${NC}"
    echo -e "${YELLOW}  → Please start Docker Desktop${NC}"
    exit 1
fi

# Check if worktree-specific database is running
if docker ps --format '{{.Names}}' | grep -q "^${DB_NAME}$"; then
    echo -e "${GREEN}  ✅ Database running: ${DB_NAME}${NC}"
else
    echo -e "${RED}  ⚠️  Database not running: ${DB_NAME}${NC}"
    echo -e "${YELLOW}  → Run: ./scripts/db-manager.sh start${NC}"
    echo -e "${YELLOW}  → Or run: ./scripts/safe-start.sh (starts database + servers)${NC}"
    exit 1
fi

echo ""

# Step 2: Check if dev servers are running (optional but recommended)
echo -e "${YELLOW}🚀 Checking dev servers...${NC}"

FRONTEND_RUNNING=false
BACKEND_RUNNING=false

if lsof -ti:${FRONTEND_PORT} > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ Frontend running (port ${FRONTEND_PORT})${NC}"
    FRONTEND_RUNNING=true
else
    echo -e "${YELLOW}  ⚠️  Frontend not running (port ${FRONTEND_PORT})${NC}"
fi

if lsof -ti:${BACKEND_PORT} > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ Backend running (port ${BACKEND_PORT})${NC}"
    BACKEND_RUNNING=true
else
    echo -e "${YELLOW}  ⚠️  Backend not running (port ${BACKEND_PORT})${NC}"
fi

if [ "$FRONTEND_RUNNING" = false ] || [ "$BACKEND_RUNNING" = false ]; then
    echo ""
    echo -e "${CYAN}  💡 Tip: Some tests may need dev servers running${NC}"
    echo -e "${CYAN}     Run in another terminal: ./scripts/safe-start.sh${NC}"
    echo ""
    echo -e "${YELLOW}  → Continuing anyway (unit tests will work)${NC}"
fi

echo ""

# Step 3: Navigate to app directory
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
APP_DIR="$PROJECT_ROOT/app"

if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}❌ Error: app/ directory not found at $APP_DIR${NC}"
    exit 1
fi

echo -e "${BLUE}📂 App directory:${NC} $APP_DIR"
cd "$APP_DIR"
echo ""

# Step 4: Instructions
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  🔍 Test Watch Mode Starting                               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📖 RED Phase Workflow:${NC}"
echo -e "${CYAN}   1. Watch mode auto-runs tests when you save files${NC}"
echo -e "${CYAN}   2. Write test → See execution immediately (1-2 seconds)${NC}"
echo -e "${CYAN}   3. Tests should FAIL (implementation doesn't exist yet)${NC}"
echo -e "${CYAN}   4. Verify failure reason is CORRECT (not timeout!)${NC}"
echo ""
echo -e "${YELLOW}✅ GOOD Failure (Ready to commit):${NC}"
echo -e "${GREEN}   ❌ Cannot find module 'operations'${NC}"
echo -e "${GREEN}   ❌ Expected 'Acme' but got undefined${NC}"
echo -e "${GREEN}   ❌ HttpError: Not found${NC}"
echo ""
echo -e "${YELLOW}❌ BAD Failure (Infrastructure issue - FIX NOW):${NC}"
echo -e "${RED}   ⏱️  Test timed out in 5000ms${NC}"
echo -e "${RED}   ⚠️  Cannot find module '@wasp/...' (use wasp/)${NC}"
echo -e "${RED}   ⚠️  ReferenceError: Cannot access enum (hoisting issue)${NC}"
echo ""
echo -e "${CYAN}🎯 Keep this terminal open throughout RED phase!${NC}"
echo -e "${CYAN}   Press 'q' to quit watch mode${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Step 5: Launch watch mode
wasp test client
