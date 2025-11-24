#!/bin/bash
# Automated E2E Test Runner with Setup
# Handles server startup, database seeding, and test execution
# Usage: ./scripts/run-e2e-tests.sh [--no-seed] [--headed] [--debug]

set -e  # Exit on error

# Get script directory and source worktree config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/worktree-config.sh"

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Parse flags
SKIP_SEED=false
HEADED=false
DEBUG=false
PLAYWRIGHT_FLAGS=""

for arg in "$@"; do
  case $arg in
    --no-seed)
      SKIP_SEED=true
      ;;
    --headed)
      HEADED=true
      PLAYWRIGHT_FLAGS="$PLAYWRIGHT_FLAGS --headed"
      ;;
    --debug)
      DEBUG=true
      PLAYWRIGHT_FLAGS="$PLAYWRIGHT_FLAGS --debug"
      ;;
    *)
      echo -e "${RED}Unknown flag: $arg${NC}"
      echo "Usage: $0 [--no-seed] [--headed] [--debug]"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  E2E Test Runner - LEAN AI COACH       ${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Get project root (script is in scripts/)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Export FRONTEND_URL for Playwright config (uses CLIENT_URL from worktree-config)
export FRONTEND_URL=${CLIENT_URL}

# Export worktree-specific auth storage path (for authentication isolation)
export E2E_STORAGE_STATE="./storage-state/auth-${WORKTREE_NAME}.json"

echo -e "${GREEN}Worktree: ${WORKTREE_NAME}${NC}"
echo -e "${GREEN}Frontend URL: ${FRONTEND_URL}${NC}"
echo -e "${GREEN}Auth State: ${E2E_STORAGE_STATE}${NC}"
echo ""

# ============================================================================
# STEP 1: Check if Wasp servers are running
# ============================================================================

echo -e "${YELLOW}[1/4] Checking Wasp servers...${NC}"

if lsof -ti:${FRONTEND_PORT} > /dev/null 2>&1 && lsof -ti:${BACKEND_PORT} > /dev/null 2>&1; then
  echo -e "${GREEN}  ✅ Servers running on ports ${FRONTEND_PORT} (Vite) and ${BACKEND_PORT} (Node)${NC}"

  # Health check
  if curl -s ${CLIENT_URL} > /dev/null && curl -s ${SERVER_URL}/auth/me > /dev/null; then
    echo -e "${GREEN}  ✅ Health check passed${NC}"
  else
    echo -e "${RED}  ❌ Servers not responding - restarting...${NC}"
    ./scripts/safe-start.sh &
    WASP_PID=$!
    sleep 10  # Give servers time to start
  fi
else
  echo -e "${YELLOW}  ⚠️  Servers not running - starting now...${NC}"
  ./scripts/safe-start.sh &
  WASP_PID=$!

  # Wait for servers to be ready
  echo -e "${YELLOW}  ⏳ Waiting for servers to start...${NC}"

  MAX_WAIT=60
  ELAPSED=0
  while [ $ELAPSED -lt $MAX_WAIT ]; do
    if lsof -ti:${FRONTEND_PORT} > /dev/null 2>&1 && lsof -ti:${BACKEND_PORT} > /dev/null 2>&1; then
      # Double check with health check
      if curl -s ${CLIENT_URL} > /dev/null 2>&1 && curl -s ${SERVER_URL}/auth/me > /dev/null 2>&1; then
        echo -e "${GREEN}  ✅ Servers started successfully (${ELAPSED}s)${NC}"
        break
      fi
    fi

    sleep 2
    ELAPSED=$((ELAPSED + 2))

    if [ $((ELAPSED % 10)) -eq 0 ]; then
      echo -e "${YELLOW}     Still waiting... (${ELAPSED}s / ${MAX_WAIT}s)${NC}"
    fi
  done

  if [ $ELAPSED -ge $MAX_WAIT ]; then
    echo -e "${RED}  ❌ Servers failed to start within ${MAX_WAIT}s${NC}"
    echo -e "${YELLOW}  💡 Try running './scripts/safe-start.sh' manually and check for errors${NC}"
    exit 1
  fi
fi

echo ""

# ============================================================================
# STEP 2: Seed database (unless --no-seed flag)
# ============================================================================

if [ "$SKIP_SEED" = false ]; then
  echo -e "${YELLOW}[2/4] Seeding database with demo user + A3 documents...${NC}"

  # Run seed script (idempotent - safe to run multiple times)
  if ./scripts/seed-visual-test.sh > /tmp/seed-output.log 2>&1; then
    echo -e "${GREEN}  ✅ Database seeded successfully${NC}"

    # Extract and show key info from seed output
    if grep -q "demo@example.com" /tmp/seed-output.log; then
      echo -e "${GREEN}  📧 Demo user: demo@example.com / DemoPassword123!${NC}"
    fi

    if grep -q "8 A3 Documents" /tmp/seed-output.log; then
      echo -e "${GREEN}  📊 Created: 8 A3 documents across 3 departments${NC}"
    fi
  else
    echo -e "${RED}  ❌ Seed failed!${NC}"
    echo -e "${YELLOW}  📋 Seed output:${NC}"
    cat /tmp/seed-output.log
    echo ""
    echo -e "${YELLOW}  💡 Check if Wasp servers are running: wasp start${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}[2/4] Skipping database seed (--no-seed flag)${NC}"
  echo -e "${YELLOW}  ⚠️  Assuming database already seeded with demo user${NC}"
fi

echo ""

# ============================================================================
# STEP 3: Run E2E tests
# ============================================================================

echo -e "${YELLOW}[3/4] Running E2E tests...${NC}"
echo ""

cd e2e-tests

# Build Playwright command
PLAYWRIGHT_CMD="npx playwright test --config=playwright.local.config.ts --reporter=list $PLAYWRIGHT_FLAGS"

echo -e "${BLUE}  Command: $PLAYWRIGHT_CMD${NC}"
echo ""

# Export environment variables for Playwright
export FRONTEND_URL=${CLIENT_URL}
export BACKEND_URL=${SERVER_URL}
export E2E_STORAGE_STATE="./storage-state/auth-${WORKTREE_NAME}.json"

# Run tests and capture exit code
set +e  # Don't exit on test failure
$PLAYWRIGHT_CMD
TEST_EXIT_CODE=$?
set -e

echo ""

# ============================================================================
# STEP 4: Summary
# ============================================================================

echo -e "${YELLOW}[4/4] Test Summary${NC}"
echo ""

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}════════════════════════════════════════${NC}"
  echo -e "${GREEN}  ✅ ALL E2E TESTS PASSED!               ${NC}"
  echo -e "${GREEN}════════════════════════════════════════${NC}"
else
  echo -e "${RED}════════════════════════════════════════${NC}"
  echo -e "${RED}  ❌ SOME E2E TESTS FAILED                ${NC}"
  echo -e "${RED}════════════════════════════════════════${NC}"
  echo ""
  echo -e "${YELLOW}Troubleshooting:${NC}"
  echo -e "  1. Check screenshots: ${BLUE}e2e-tests/test-results/${NC}"
  echo -e "  2. Run with --headed flag to see browser: ${BLUE}./scripts/run-e2e-tests.sh --headed${NC}"
  echo -e "  3. Run with --debug flag for step-by-step: ${BLUE}./scripts/run-e2e-tests.sh --debug${NC}"
  echo -e "  4. Check if seed data exists: ${BLUE}${CLIENT_URL}/login${NC}"
  echo -e "     Login: demo@example.com / DemoPassword123!"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Test Breakdown:                        ${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "  • Infrastructure: 4 tests (auth, navigation)"
echo -e "  • Feature:        44 tests (overview, detail)"
echo -e "  • Visual:         3 tests (screenshots)"
echo -e "  • Template:       8 tests (skipped - not in Week 1)"
echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Manual Testing:                        ${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "  📧 Login: ${GREEN}demo@example.com${NC}"
echo -e "  🔑 Pass:  ${GREEN}DemoPassword123!${NC}"
echo -e "  🌐 URL:   ${GREEN}${CLIENT_URL}/login${NC}"
echo ""
echo -e "${BLUE}  Test data includes:${NC}"
echo -e "    • 3 Departments: Production, Logistics, Quality Control"
echo -e "    • 8 A3 Documents: 2 DRAFT, 4 IN_PROGRESS, 2 COMPLETED"
echo -e "    • Locations: Amsterdam, Rotterdam, Eindhoven"
echo ""

exit $TEST_EXIT_CODE
