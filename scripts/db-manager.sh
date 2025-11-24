#!/bin/bash
# scripts/db-manager.sh
# Database lifecycle management for multi-worktree development
#
# Purpose: Manage Docker PostgreSQL containers per worktree
# Usage:
#   ./scripts/db-manager.sh start [worktree]   - Start database for worktree
#   ./scripts/db-manager.sh stop [worktree]    - Stop database
#   ./scripts/db-manager.sh status             - Show all databases status
#   ./scripts/db-manager.sh clean [worktree]   - Reset database (delete + recreate)
#   ./scripts/db-manager.sh stopall            - Stop all databases

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source worktree configuration
source "$SCRIPT_DIR/worktree-config.sh"

# Database configuration
DB_USER="dev"
DB_PASSWORD="dev"
DB_DATABASE="dev"
POSTGRES_IMAGE="postgres:14"

# Start database for specific worktree
start_database() {
  local worktree=${1:-$DETECTED_WORKTREE}

  # Get config for specified worktree
  get_worktree_config "$worktree"

  echo -e "${BLUE}Starting database for worktree: ${WORKTREE_NAME}${NC}"
  echo -e "${BLUE}  Container: ${DB_NAME}${NC}"
  echo -e "${BLUE}  Port: ${DB_PORT}${NC}"

  # Check if container already exists
  if docker ps -a --format '{{.Names}}' | grep -q "^${DB_NAME}$"; then
    echo -e "${YELLOW}  Container exists, checking status...${NC}"

    # Check if running
    if docker ps --format '{{.Names}}' | grep -q "^${DB_NAME}$"; then
      echo -e "${GREEN}  ✅ Database already running${NC}"
      return 0
    else
      echo -e "${YELLOW}  Starting existing container...${NC}"
      docker start "$DB_NAME" > /dev/null
      echo -e "${GREEN}  ✅ Database started${NC}"
      return 0
    fi
  fi

  # Create new container
  echo -e "${YELLOW}  Creating new container...${NC}"
  docker run -d \
    --name "$DB_NAME" \
    -e POSTGRES_USER="$DB_USER" \
    -e POSTGRES_PASSWORD="$DB_PASSWORD" \
    -e POSTGRES_DB="$DB_DATABASE" \
    -p "${DB_PORT}:5432" \
    "$POSTGRES_IMAGE" > /dev/null

  echo -e "${GREEN}  ✅ Database created and started${NC}"
  echo -e "${YELLOW}  Waiting for database to be ready...${NC}"

  # Wait for database to be ready
  for i in {1..30}; do
    if docker exec "$DB_NAME" pg_isready -U "$DB_USER" > /dev/null 2>&1; then
      echo -e "${GREEN}  ✅ Database is ready${NC}"
      return 0
    fi
    sleep 1
  done

  echo -e "${RED}  ⚠️  Database may not be ready, continuing anyway${NC}"
}

# Stop database
stop_database() {
  local worktree=${1:-$DETECTED_WORKTREE}

  # Get config for specified worktree
  get_worktree_config "$worktree"

  echo -e "${BLUE}Stopping database: ${DB_NAME}${NC}"

  if docker ps --format '{{.Names}}' | grep -q "^${DB_NAME}$"; then
    docker stop "$DB_NAME" > /dev/null
    echo -e "${GREEN}  ✅ Database stopped${NC}"
  else
    echo -e "${YELLOW}  ℹ️  Database not running${NC}"
  fi
}

# Clean (reset) database
clean_database() {
  local worktree=${1:-$DETECTED_WORKTREE}

  # Get config for specified worktree
  get_worktree_config "$worktree"

  echo -e "${YELLOW}⚠️  Cleaning database: ${DB_NAME}${NC}"
  echo -e "${YELLOW}  This will DELETE ALL DATA!${NC}"

  # Check if container exists
  if docker ps -a --format '{{.Names}}' | grep -q "^${DB_NAME}$"; then
    echo -e "${RED}  Removing container...${NC}"
    docker rm -f "$DB_NAME" > /dev/null
    echo -e "${GREEN}  ✅ Container removed${NC}"
  else
    echo -e "${YELLOW}  ℹ️  Container doesn't exist${NC}"
  fi

  # Recreate
  echo -e "${BLUE}  Recreating database...${NC}"
  start_database "$worktree"
}

# Show status of all databases
show_status() {
  echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  Database Status - All Worktrees                              ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
  echo ""

  # Define all worktrees
  local worktrees=("lean-ai-coach" "lean-ai-coach-Dev1" "lean-ai-coach-Dev2" "lean-ai-coach-Dev3" "lean-ai-coach-tl" "lean-ai-coach-AnGr1")
  local names=("develop" "Dev1" "Dev2" "Dev3" "TechLead" "AnGr1")

  printf "%-15s %-25s %-10s %-10s\n" "WORKTREE" "CONTAINER" "PORT" "STATUS"
  printf "%-15s %-25s %-10s %-10s\n" "--------" "---------" "----" "------"

  for i in "${!worktrees[@]}"; do
    local wt="${worktrees[$i]}"
    local name="${names[$i]}"

    # Get config
    get_worktree_config "$wt"

    # Check status
    if docker ps --format '{{.Names}}' | grep -q "^${DB_NAME}$"; then
      printf "%-15s %-25s %-10s ${GREEN}%-10s${NC}\n" "$name" "$DB_NAME" "$DB_PORT" "RUNNING"
    elif docker ps -a --format '{{.Names}}' | grep -q "^${DB_NAME}$"; then
      printf "%-15s %-25s %-10s ${YELLOW}%-10s${NC}\n" "$name" "$DB_NAME" "$DB_PORT" "STOPPED"
    else
      printf "%-15s %-25s %-10s ${RED}%-10s${NC}\n" "$name" "$DB_NAME" "$DB_PORT" "NOT CREATED"
    fi
  done

  echo ""
}

# Stop all databases
stopall_databases() {
  echo -e "${BLUE}Stopping all databases...${NC}"

  local worktrees=("lean-ai-coach" "lean-ai-coach-Dev1" "lean-ai-coach-Dev2" "lean-ai-coach-Dev3" "lean-ai-coach-tl" "lean-ai-coach-AnGr1")

  for wt in "${worktrees[@]}"; do
    get_worktree_config "$wt"
    if docker ps --format '{{.Names}}' | grep -q "^${DB_NAME}$"; then
      echo -e "${YELLOW}  Stopping ${DB_NAME}...${NC}"
      docker stop "$DB_NAME" > /dev/null
    fi
  done

  echo -e "${GREEN}✅ All databases stopped${NC}"
}

# Main command handler
case "${1:-}" in
  start)
    start_database "$2"
    ;;
  stop)
    stop_database "$2"
    ;;
  clean)
    clean_database "$2"
    ;;
  status)
    show_status
    ;;
  stopall)
    stopall_databases
    ;;
  *)
    echo -e "${BLUE}Database Manager - Multi-Worktree Development${NC}"
    echo ""
    echo "Usage:"
    echo "  $0 start [worktree]   - Start database (defaults to current worktree)"
    echo "  $0 stop [worktree]    - Stop database"
    echo "  $0 clean [worktree]   - Reset database (DELETE ALL DATA)"
    echo "  $0 status             - Show all databases status"
    echo "  $0 stopall            - Stop all databases"
    echo ""
    echo "Worktree names:"
    echo "  lean-ai-coach       (develop)"
    echo "  lean-ai-coach-Dev1  (Dev1)"
    echo "  lean-ai-coach-Dev2  (Dev2)"
    echo "  lean-ai-coach-Dev3  (Dev3)"
    echo "  lean-ai-coach-tl    (TechLead)"
    echo "  lean-ai-coach-AnGr1 (AnGr1)"
    echo ""
    exit 1
    ;;
esac
