#!/bin/bash
# scripts/setup-mcp.sh
# Setup MCP Playwright server for Claude Code
#
# Purpose: Copy .mcp.json to global Claude config location
# Usage: ./scripts/setup-mcp.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'  # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  MCP Playwright Setup for Claude Code ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if .mcp.json exists in project root
if [ ! -f ".mcp.json" ]; then
    echo -e "${RED}❌ .mcp.json not found in project root!${NC}"
    exit 1
fi

# Create Claude config directory if it doesn't exist
mkdir -p ~/.config/claude

# Copy .mcp.json to global location
cp .mcp.json ~/.config/claude/mcp.json

echo -e "${GREEN}✅ MCP configuration copied to ~/.config/claude/mcp.json${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: You must restart Claude Code for MCP servers to load!${NC}"
echo ""
echo -e "${BLUE}After restarting Claude Code, you'll have access to:${NC}"
echo -e "  • Browser automation tools (mcp__playwright__*)"
echo -e "  • Screenshot and snapshot capabilities"
echo -e "  • Web testing tools"
echo ""
