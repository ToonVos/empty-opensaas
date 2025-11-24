#!/bin/bash
# scripts/safe-start.sh
# Safe start for multi-agent/multi-worktree development on single machine
#
# Purpose: Start dev servers with worktree-specific ports and databases
# Use case: Multiple AI agents or developers working in parallel worktrees on 1 Mac
# Usage: ./scripts/safe-start.sh [--clean]
#   --clean: Also run `wasp clean` before starting (regenerates types)

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'  # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source worktree configuration
source "$SCRIPT_DIR/worktree-config.sh"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Safe Start - Multi-Worktree Dev                              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Show worktree configuration
echo -e "${BLUE}📍 Worktree Configuration:${NC}"
echo -e "   Name:     ${GREEN}${WORKTREE_NAME}${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:${FRONTEND_PORT}${NC}"
echo -e "   Backend:  ${GREEN}http://localhost:${BACKEND_PORT}${NC}"
echo -e "   Database: ${GREEN}${DB_NAME}${NC} (port ${DB_PORT})"
echo -e "   Studio:   ${GREEN}http://localhost:${STUDIO_PORT}${NC}"
echo ""

# Step 1: Check database and environment
echo -e "${YELLOW}🗄️  Checking database...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}  ⚠️  Docker is not running!${NC}"
    echo -e "${YELLOW}  → Please start Docker Desktop${NC}"
    exit 1
fi

# Use db-manager to start/check database
"$SCRIPT_DIR/db-manager.sh" start > /dev/null 2>&1 || {
    echo -e "${YELLOW}  Starting database for this worktree...${NC}"
    "$SCRIPT_DIR/db-manager.sh" start
}

echo -e "${GREEN}  ✅ Database ready: ${DB_NAME}${NC}"

# Check if .env.server exists in app directory
if [ ! -f "app/.env.server" ]; then
    echo -e "${YELLOW}  Creating app/.env.server from example...${NC}"
    if [ -f "app/.env.server.example" ]; then
        cp app/.env.server.example app/.env.server
        echo -e "${GREEN}  ✅ Created app/.env.server${NC}"
    else
        echo -e "${RED}  ❌ app/.env.server.example not found!${NC}"
        exit 1
    fi
fi

# Update DATABASE_URL in .env.server with worktree-specific port
echo -e "${YELLOW}  Updating DATABASE_URL for this worktree...${NC}"
if grep -q "^DATABASE_URL=" app/.env.server; then
    # Replace existing DATABASE_URL
    sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=${DATABASE_URL}|" app/.env.server
else
    # Add DATABASE_URL if it doesn't exist
    echo "DATABASE_URL=${DATABASE_URL}" >> app/.env.server
fi

# Update CLIENT_URL and SERVER_URL
if grep -q "^CLIENT_URL=" app/.env.server; then
    sed -i '' "s|^CLIENT_URL=.*|CLIENT_URL=${CLIENT_URL}|" app/.env.server
else
    echo "CLIENT_URL=${CLIENT_URL}" >> app/.env.server
fi

if grep -q "^SERVER_URL=" app/.env.server; then
    sed -i '' "s|^SERVER_URL=.*|SERVER_URL=${SERVER_URL}|" app/.env.server
else
    echo "SERVER_URL=${SERVER_URL}" >> app/.env.server
fi

echo -e "${GREEN}  ✅ Environment configured${NC}"
echo ""

# Step 2: Kill existing servers
echo -e "${YELLOW}🧹 Cleaning up existing servers...${NC}"

# Kill Vite frontend
if lsof -ti:${FRONTEND_PORT} > /dev/null 2>&1; then
    echo -e "${RED}  💀 Killing process on port ${FRONTEND_PORT} (Vite/frontend)${NC}"
    kill -9 $(lsof -ti:${FRONTEND_PORT}) || true
    echo -e "${GREEN}  ✅ Port ${FRONTEND_PORT} freed${NC}"
else
    echo -e "  ℹ️  Port ${FRONTEND_PORT} is free"
fi

# Kill Node backend
if lsof -ti:${BACKEND_PORT} > /dev/null 2>&1; then
    echo -e "${RED}  💀 Killing process on port ${BACKEND_PORT} (Node/backend)${NC}"
    kill -9 $(lsof -ti:${BACKEND_PORT}) || true
    echo -e "${GREEN}  ✅ Port ${BACKEND_PORT} freed${NC}"
else
    echo -e "  ℹ️  Port ${BACKEND_PORT} is free"
fi

echo ""

# Step 3: Find and navigate to app directory
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
APP_DIR="$PROJECT_ROOT/app"

if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}❌ Error: app/ directory not found at $APP_DIR${NC}"
    exit 1
fi

echo -e "${BLUE}📂 App directory:${NC} $APP_DIR"
cd "$APP_DIR"
echo ""

# Step 4: Optional wasp clean
NEEDS_REACT_FIX=false
if [[ "$1" == "--clean" ]]; then
    echo -e "${YELLOW}🧼 Running wasp clean (regenerating types)...${NC}"
    wasp clean
    echo -e "${GREEN}✅ wasp clean complete${NC}"
    echo ""
    NEEDS_REACT_FIX=true
fi

# Step 5: Small delay for cleanup
echo -e "${YELLOW}⏱️  Waiting 2 seconds for cleanup...${NC}"
sleep 2
echo ""

# Step 6: Generate .env.client from template for Vite to read at build time
if [ -f .env.client.template ]; then
  sed -e "s|{{SERVER_URL}}|${SERVER_URL}|g" \
      -e "s|{{FRONTEND_PORT}}|${FRONTEND_PORT}|g" \
      .env.client.template > .env.client
  echo -e "${GREEN}  ✅ Generated .env.client for ${WORKTREE_NAME}${NC}"
else
  echo -e "${RED}  ❌ Template .env.client.template not found!${NC}"
  exit 1
fi

# Step 7: Export environment variables for Wasp runtime
export PORT=${BACKEND_PORT}
export VITE_PORT=${FRONTEND_PORT}  # For Vite dev server port (multi-worktree isolation)
export WASP_WEB_CLIENT_URL=${CLIENT_URL}
export WASP_SERVER_URL=${SERVER_URL}
export FRONTEND_URL=${CLIENT_URL}  # For seedDemoUser and E2E tests
export BACKEND_URL=${SERVER_URL}   # For seedDemoUser and E2E tests
export FRONTEND_PORT  # For E2E test scripts
export BACKEND_PORT   # For E2E test scripts

# Step 8: Start fresh servers
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  🚀 Starting servers for ${WORKTREE_NAME}${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Frontend:${NC} ${CLIENT_URL}"
echo -e "${GREEN}Backend:${NC}  ${SERVER_URL}"
echo -e "${GREEN}Database:${NC} ${DB_NAME} (port ${DB_PORT})"
echo -e "${GREEN}Studio:${NC}   http://localhost:${STUDIO_PORT} ${YELLOW}(run ./scripts/db-studio.sh)${NC}"
echo ""

# Run wasp start (already in app/ directory)
wasp start &
WASP_PID=$!

# Wait for .wasp/out/web-app to be generated
if [ "$NEEDS_REACT_FIX" = true ]; then
    echo ""
    echo -e "${YELLOW}⏳ Waiting for Wasp build to complete...${NC}"
    while [ ! -d ".wasp/out/web-app/node_modules/react" ]; do
        sleep 2
    done

    echo -e "${YELLOW}🔧 Applying React 18 fix...${NC}"
    "$PROJECT_ROOT/scripts/fix-react-version.sh"

    echo ""
    echo -e "${YELLOW}♻️  Restarting Wasp to apply React 18...${NC}"
    kill $WASP_PID 2>/dev/null || true
    sleep 2
    wasp start
else
    # Wait for wasp start to finish (Ctrl+C to stop)
    wait $WASP_PID
fi
