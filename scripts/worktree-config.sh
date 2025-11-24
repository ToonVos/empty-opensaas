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
    "opensaas-main" | "Empty OpenSAAS")
      # Main worktree - default ports
      export WORKTREE_NAME="main"
      export FRONTEND_PORT=3000
      export BACKEND_PORT=3001
      export DB_PORT=5432
      export STUDIO_PORT=5555
      export DB_NAME="opensaas-dev-main"
      ;;
    "opensaas-dev1")
      export WORKTREE_NAME="dev1"
      export FRONTEND_PORT=3100
      export BACKEND_PORT=3101
      export DB_PORT=5433
      export STUDIO_PORT=5556
      export DB_NAME="opensaas-dev-dev1"
      ;;
    "opensaas-dev2")
      export WORKTREE_NAME="dev2"
      export FRONTEND_PORT=3200
      export BACKEND_PORT=3201
      export DB_PORT=5434
      export STUDIO_PORT=5557
      export DB_NAME="opensaas-dev-dev2"
      ;;
    "opensaas-dev3")
      export WORKTREE_NAME="dev3"
      export FRONTEND_PORT=3300
      export BACKEND_PORT=3301
      export DB_PORT=5435
      export STUDIO_PORT=5558
      export DB_NAME="opensaas-dev-dev3"
      ;;
    *)
      # Unknown worktree - default to main ports
      export WORKTREE_NAME="unknown"
      export FRONTEND_PORT=3000
      export BACKEND_PORT=3001
      export DB_PORT=5432
      export STUDIO_PORT=5555
      export DB_NAME="opensaas-dev-main"
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
