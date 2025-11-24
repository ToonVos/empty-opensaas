#!/bin/bash
# scripts/multi-start.sh
# Start multiple worktrees in parallel (power user convenience script)
#
# Purpose: Launch dev servers for all worktrees simultaneously
# Usage:
#   ./scripts/multi-start.sh              - Start develop, Dev1, Dev2, Dev3
#   ./scripts/multi-start.sh --with-studio - Also start all Prisma Studios
#   ./scripts/multi-start.sh dev1 dev2    - Start only specified worktrees

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Worktree base directory
BASE_DIR="/Users/toonvos/Projects/LEANAICOACH"

# Default worktrees to start
DEFAULT_WORKTREES=("lean-ai-coach" "lean-ai-coach-Dev1" "lean-ai-coach-Dev2" "lean-ai-coach-Dev3" "lean-ai-coach-tl")
WITH_STUDIO=false

# Parse arguments
WORKTREES_TO_START=()
for arg in "$@"; do
  case "$arg" in
    --with-studio)
      WITH_STUDIO=true
      ;;
    --help|-h)
      echo -e "${BLUE}Multi-Worktree Parallel Launcher${NC}"
      echo ""
      echo "Usage:"
      echo "  $0                    - Start all 4 worktrees (develop, Dev1, Dev2, Dev3)"
      echo "  $0 --with-studio      - Also start all Prisma Studios"
      echo "  $0 dev1 dev2          - Start only specified worktrees"
      echo ""
      echo "Worktree names (case-insensitive):"
      echo "  develop, main         → lean-ai-coach"
      echo "  dev1                  → lean-ai-coach-Dev1"
      echo "  dev2                  → lean-ai-coach-Dev2"
      echo "  dev3                  → lean-ai-coach-Dev3"
      echo "  tl, techlead          → lean-ai-coach-tl"
      echo ""
      echo "Examples:"
      echo "  $0                          # Start all 4"
      echo "  $0 --with-studio            # Start all 4 + Studios"
      echo "  $0 dev1 dev2                # Start only Dev1 and Dev2"
      echo ""
      exit 0
      ;;
    develop|main)
      WORKTREES_TO_START+=("lean-ai-coach")
      ;;
    dev1|Dev1)
      WORKTREES_TO_START+=("lean-ai-coach-Dev1")
      ;;
    dev2|Dev2)
      WORKTREES_TO_START+=("lean-ai-coach-Dev2")
      ;;
    dev3|Dev3)
      WORKTREES_TO_START+=("lean-ai-coach-Dev3")
      ;;
    tl|techlead|TechLead)
      WORKTREES_TO_START+=("lean-ai-coach-tl")
      ;;
    *)
      echo -e "${RED}Unknown argument: $arg${NC}"
      echo "Run with --help for usage"
      exit 1
      ;;
  esac
done

# Use defaults if no specific worktrees specified
if [ ${#WORKTREES_TO_START[@]} -eq 0 ]; then
  WORKTREES_TO_START=("${DEFAULT_WORKTREES[@]}")
fi

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Multi-Worktree Parallel Launcher                             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Starting ${#WORKTREES_TO_START[@]} worktree(s)...${NC}"
echo ""

# Check if iTerm is available
if command -v osascript > /dev/null 2>&1 && [ "$TERM_PROGRAM" = "iTerm.app" ]; then
  TERMINAL_TYPE="iterm"
elif command -v osascript > /dev/null 2>&1; then
  TERMINAL_TYPE="terminal"
else
  TERMINAL_TYPE="none"
fi

# Function to start worktree
start_worktree() {
  local worktree=$1
  local worktree_path="${BASE_DIR}/${worktree}"

  if [ ! -d "$worktree_path" ]; then
    echo -e "${RED}  ⚠️  Worktree not found: ${worktree_path}${NC}"
    return 1
  fi

  echo -e "${GREEN}  ✅ Starting ${worktree}${NC}"

  case "$TERMINAL_TYPE" in
    iterm)
      # iTerm2 - open new tab
      osascript <<EOF
tell application "iTerm"
  tell current window
    create tab with default profile
    tell current session
      write text "cd ${worktree_path} && ./scripts/safe-start.sh"
    end tell
  end tell
end tell
EOF
      ;;
    terminal)
      # macOS Terminal - open new tab
      osascript <<EOF
tell application "Terminal"
  activate
  tell application "System Events"
    keystroke "t" using {command down}
  end tell
  do script "cd ${worktree_path} && ./scripts/safe-start.sh" in front window
end tell
EOF
      ;;
    none)
      # Fallback: background process
      echo -e "${YELLOW}  → Running in background (no terminal automation)${NC}"
      (cd "$worktree_path" && ./scripts/safe-start.sh > "/tmp/${worktree}-safe-start.log" 2>&1) &
      echo -e "${YELLOW}  → Log: /tmp/${worktree}-safe-start.log${NC}"
      ;;
  esac
}

# Start all specified worktrees
for worktree in "${WORKTREES_TO_START[@]}"; do
  start_worktree "$worktree"
  sleep 1  # Small delay between starts
done

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Worktrees Started                                             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Show URLs
echo -e "${BLUE}Access URLs:${NC}"
for worktree in "${WORKTREES_TO_START[@]}"; do
  case "$worktree" in
    "lean-ai-coach")
      echo -e "  develop → Frontend: http://localhost:3000 | Backend: http://localhost:3001"
      ;;
    "lean-ai-coach-Dev1")
      echo -e "  Dev1    → Frontend: http://localhost:3100 | Backend: http://localhost:3101"
      ;;
    "lean-ai-coach-Dev2")
      echo -e "  Dev2    → Frontend: http://localhost:3200 | Backend: http://localhost:3201"
      ;;
    "lean-ai-coach-Dev3")
      echo -e "  Dev3     → Frontend: http://localhost:3300 | Backend: http://localhost:3301"
      ;;
    "lean-ai-coach-tl")
      echo -e "  TechLead → Frontend: http://localhost:3400 | Backend: http://localhost:3401"
      ;;
  esac
done

echo ""

# Optionally start all Studios
if [ "$WITH_STUDIO" = true ]; then
  echo -e "${YELLOW}Starting all Prisma Studios...${NC}"
  "${BASE_DIR}/lean-ai-coach/scripts/db-studio.sh" --all
  echo ""
fi

echo -e "${CYAN}💡 Tips:${NC}"
echo -e "   • Each worktree runs in separate terminal tab/background"
echo -e "   • View database status: ${YELLOW}./scripts/db-manager.sh status${NC}"
echo -e "   • Stop all databases: ${YELLOW}./scripts/db-manager.sh stopall${NC}"
if [ "$TERMINAL_TYPE" = "none" ]; then
  echo -e "   • View logs: ${YELLOW}tail -f /tmp/lean-ai-coach-*-safe-start.log${NC}"
fi
echo ""
