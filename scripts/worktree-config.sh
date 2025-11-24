#!/bin/bash
# scripts/worktree-config.sh
# Worktree-specific configuration for multi-developer parallel development
#
# Purpose: Provides port mapping and database configuration per worktree
# Usage: source scripts/worktree-config.sh
# Exports: WORKTREE_NAME, FRONTEND_PORT, BACKEND_PORT, DB_PORT, STUDIO_PORT, DB_NAME

# Detect current worktree name
get_worktree_name() {
  # Use git to find worktree root (works for both regular repos and worktrees)
  # In git worktrees, .git is a FILE, not a directory, so we need git command
  if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    # Get the top-level directory name of the git worktree
    basename "$(git rev-parse --show-toplevel)"
  else
    # Fallback if not in a git repository
    basename "$(pwd)"
  fi
}

# Get worktree configuration
get_worktree_config() {
  local worktree_name="$1"

  case "$worktree_name" in
    "lean-ai-coach")
      # Main/develop worktree - default ports
      export WORKTREE_NAME="develop"
      export FRONTEND_PORT=3000
      export BACKEND_PORT=3001
      export DB_PORT=5432
      export STUDIO_PORT=5555
      export DB_NAME="wasp-dev-db-develop"
      ;;
    "lean-ai-coach-Dev1")
      export WORKTREE_NAME="Dev1"
      export FRONTEND_PORT=3100
      export BACKEND_PORT=3101
      export DB_PORT=5433
      export STUDIO_PORT=5556
      export DB_NAME="wasp-dev-db-dev1"
      ;;
    "lean-ai-coach-Dev2")
      export WORKTREE_NAME="Dev2"
      export FRONTEND_PORT=3200
      export BACKEND_PORT=3201
      export DB_PORT=5434
      export STUDIO_PORT=5557
      export DB_NAME="wasp-dev-db-dev2"
      ;;
    "lean-ai-coach-Dev3")
      export WORKTREE_NAME="Dev3"
      export FRONTEND_PORT=3300
      export BACKEND_PORT=3301
      export DB_PORT=5435
      export STUDIO_PORT=5558
      export DB_NAME="wasp-dev-db-dev3"
      ;;
    "lean-ai-coach-tl")
      # TechLead worktree - own ports and database
      export WORKTREE_NAME="TechLead"
      export FRONTEND_PORT=3400
      export BACKEND_PORT=3401
      export DB_PORT=5436
      export STUDIO_PORT=5559
      export DB_NAME="wasp-dev-db-tl"
      ;;
    "lean-ai-coach-cto")
      # CTO worktree - mapped to develop (shares main database)
      export WORKTREE_NAME="CTO"
      export FRONTEND_PORT=3000
      export BACKEND_PORT=3001
      export DB_PORT=5432
      export STUDIO_PORT=5555
      export DB_NAME="wasp-dev-db-main"
      ;;
    "lean-ai-coach-AnGr1")
      export WORKTREE_NAME="AnGr1"
      export FRONTEND_PORT=3500
      export BACKEND_PORT=3501
      export DB_PORT=5437
      export STUDIO_PORT=5560
      export DB_NAME="wasp-dev-db-angr1"
      ;;
    *)
      # Unknown worktree - default to main ports
      export WORKTREE_NAME="unknown"
      export FRONTEND_PORT=3000
      export BACKEND_PORT=3001
      export DB_PORT=5432
      export STUDIO_PORT=5555
      export DB_NAME="wasp-dev-db-main"
      ;;
  esac

  # Database URL (used in .env.server)
  export DATABASE_URL="postgresql://dev:dev@localhost:${DB_PORT}/dev"
  export CLIENT_URL="http://localhost:${FRONTEND_PORT}"
  export SERVER_URL="http://localhost:${BACKEND_PORT}"
}

# Auto-configure on source
DETECTED_WORKTREE=$(get_worktree_name)
get_worktree_config "$DETECTED_WORKTREE"

# Export function for manual usage
export -f get_worktree_config
