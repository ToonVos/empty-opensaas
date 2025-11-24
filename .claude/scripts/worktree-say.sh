#!/bin/bash

# Claude Code Audio Hook - Worktree-aware Text-to-Speech
# Usage: worktree-say.sh [optional: klaar]

# Optional message parameter
MESSAGE="$1"

# Get current directory name
CURRENT_DIR=$(basename "$(pwd)")

# Find the config file (search up the directory tree)
CONFIG_FILE=""
SEARCH_DIR="$(pwd)"

while [ "$SEARCH_DIR" != "/" ]; do
    if [ -f "$SEARCH_DIR/.claude/config/worktree-names.json" ]; then
        CONFIG_FILE="$SEARCH_DIR/.claude/config/worktree-names.json"
        break
    fi
    SEARCH_DIR=$(dirname "$SEARCH_DIR")
done

# Fallback if config not found
if [ -z "$CONFIG_FILE" ]; then
    echo "Warning: worktree-names.json not found, using directory name"
    WORKTREE_NAME="$CURRENT_DIR"
else
    # Parse JSON to get worktree name (using grep and sed for pure bash)
    WORKTREE_NAME=$(grep "\"$CURRENT_DIR\"" "$CONFIG_FILE" | sed 's/.*: "\(.*\)".*/\1/')

    # Fallback to directory name if not found in mapping
    if [ -z "$WORKTREE_NAME" ]; then
        WORKTREE_NAME="$CURRENT_DIR"
    fi
fi

# Speak the worktree name with optional message
if [ -z "$MESSAGE" ]; then
    say "$WORKTREE_NAME"
else
    say "$WORKTREE_NAME $MESSAGE"
fi
