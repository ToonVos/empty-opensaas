#!/bin/bash
# scripts/db-studio.sh
# Prisma Studio launcher with worktree-specific ports
#
# Purpose: Launch Prisma Studio on worktree-specific port for parallel development
# Usage:
#   ./scripts/db-studio.sh              - Start Studio for current worktree
#   ./scripts/db-studio.sh [worktree]   - Start Studio for specific worktree
#   ./scripts/db-studio.sh --all        - Start all 4 Studios in background

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Source worktree configuration
source "$SCRIPT_DIR/worktree-config.sh"

# Kill process on port
kill_port() {
  local port=$1
  if lsof -ti:"$port" > /dev/null 2>&1; then
    echo -e "${YELLOW}  Killing existing process on port $port${NC}"
    kill -9 $(lsof -ti:"$port") 2>/dev/null || true
    sleep 1
  fi
}

# Start Studio for specific worktree
start_studio() {
  local worktree=${1:-$DETECTED_WORKTREE}
  local background=${2:-false}

  # Get config for specified worktree
  get_worktree_config "$worktree"

  echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  Prisma Studio - ${WORKTREE_NAME}${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${BLUE}  Worktree: ${WORKTREE_NAME}${NC}"
  echo -e "${BLUE}  Database: ${DB_NAME}${NC}"
  echo -e "${BLUE}  Studio URL: http://localhost:${STUDIO_PORT}${NC}"
  echo ""

  # Kill existing process on this port
  kill_port "$STUDIO_PORT"

  # Navigate to app directory
  APP_DIR="$PROJECT_ROOT/app"
  if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}❌ Error: app/ directory not found at $APP_DIR${NC}"
    exit 1
  fi

  cd "$APP_DIR"

  # Check if .wasp directory exists (needs wasp start first)
  if [ ! -d ".wasp" ]; then
    echo -e "${YELLOW}⚠️  Warning: .wasp directory not found${NC}"
    echo -e "${YELLOW}   You may need to run 'wasp start' first to generate Prisma files${NC}"
    echo ""
  fi

  # Set environment variable for database URL
  export DATABASE_URL="${DATABASE_URL}"

  if [ "$background" = true ]; then
    # Background mode for --all
    echo -e "${YELLOW}  Starting in background mode...${NC}"
    nohup npx prisma studio --port "$STUDIO_PORT" --browser none > /dev/null 2>&1 &
    echo -e "${GREEN}  ✅ Studio started in background${NC}"
    echo -e "${GREEN}  📊 URL: http://localhost:${STUDIO_PORT}${NC}"
  else
    # Foreground mode
    echo -e "${GREEN}  🚀 Starting Prisma Studio...${NC}"
    echo -e "${YELLOW}  Press Ctrl+C to stop${NC}"
    echo ""

    # Try using wasp db studio first (preferred)
    if command -v wasp > /dev/null 2>&1; then
      # Wasp doesn't support custom port directly, use npx prisma
      npx prisma studio --port "$STUDIO_PORT"
    else
      # Fallback to npx prisma
      npx prisma studio --port "$STUDIO_PORT"
    fi
  fi
}

# Start all Studios in background
start_all() {
  echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  Starting All Prisma Studios                                  ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
  echo ""

  local worktrees=("lean-ai-coach" "lean-ai-coach-Dev1" "lean-ai-coach-Dev2" "lean-ai-coach-Dev3" "lean-ai-coach-tl")

  for wt in "${worktrees[@]}"; do
    start_studio "$wt" true
    echo ""
  done

  echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  All Studios Started                                           ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${BLUE}Studio URLs:${NC}"
  echo -e "  develop  → http://localhost:5555"
  echo -e "  Dev1     → http://localhost:5556"
  echo -e "  Dev2     → http://localhost:5557"
  echo -e "  Dev3     → http://localhost:5558"
  echo -e "  TechLead → http://localhost:5559"
  echo ""
  echo -e "${YELLOW}To stop all Studios:${NC}"
  echo -e "  kill \$(lsof -ti:5555,5556,5557,5558)"
  echo ""
}

# Show help
show_help() {
  echo -e "${BLUE}Prisma Studio Launcher - Multi-Worktree Development${NC}"
  echo ""
  echo "Usage:"
  echo "  $0                    - Start Studio for current worktree"
  echo "  $0 [worktree]         - Start Studio for specific worktree"
  echo "  $0 --all              - Start all 4 Studios in background"
  echo ""
  echo "Worktree names:"
  echo "  lean-ai-coach       → Studio on port 5555 (develop)"
  echo "  lean-ai-coach-Dev1  → Studio on port 5556 (Dev1)"
  echo "  lean-ai-coach-Dev2  → Studio on port 5557 (Dev2)"
  echo "  lean-ai-coach-Dev3  → Studio on port 5558 (Dev3)"
  echo "  lean-ai-coach-tl    → Studio on port 5559 (TechLead)"
  echo ""
  echo "Examples:"
  echo "  $0                          # Start Studio for current worktree"
  echo "  $0 lean-ai-coach-Dev1       # Start Studio for Dev1"
  echo "  $0 --all                    # Start all Studios in background"
  echo ""
}

# Main command handler
case "${1:-}" in
  --all)
    start_all
    ;;
  --help|-h|help)
    show_help
    ;;
  "")
    # No argument - use current worktree
    start_studio "$DETECTED_WORKTREE" false
    ;;
  *)
    # Worktree specified
    start_studio "$1" false
    ;;
esac
