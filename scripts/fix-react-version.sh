#!/bin/bash
# scripts/fix-react-version.sh
# Fixes React 19 issue after wasp clean
#
# Problem: After 'wasp clean', npm installs React 19.2.0 (released Oct 1, 2025)
#          but Wasp 0.18 only supports React 18
# Solution: Force install React 18.2.0 in .wasp/out/web-app after build
#
# Usage:
#   ./scripts/fix-react-version.sh
#   OR run automatically after wasp clean via safe-start.sh --clean

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Fix React Version (Force React 18)   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
WEBAPP_DIR="$PROJECT_ROOT/app/.wasp/out/web-app"

# Check if .wasp/out/web-app exists
if [ ! -d "$WEBAPP_DIR" ]; then
    echo -e "${RED}❌ Error: $WEBAPP_DIR not found${NC}"
    echo -e "${YELLOW}   Run 'wasp start' first to generate .wasp directory${NC}"
    exit 1
fi

# Check current React version
CURRENT_VERSION=$(cat "$WEBAPP_DIR/node_modules/react/package.json" 2>/dev/null | grep '"version"' | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')

echo -e "${BLUE}📦 Current React version:${NC} $CURRENT_VERSION"

if [[ "$CURRENT_VERSION" == 18.* ]]; then
    echo -e "${GREEN}✅ React 18 already installed - no fix needed${NC}"
    exit 0
fi

# Fix: Install React 18.2.0
echo ""
echo -e "${YELLOW}🔧 Installing React 18.2.0...${NC}"
cd "$WEBAPP_DIR"
npm install react@18.2.0 react-dom@18.2.0 --save-exact --legacy-peer-deps --silent

# Verify fix
NEW_VERSION=$(cat "$WEBAPP_DIR/node_modules/react/package.json" 2>/dev/null | grep '"version"' | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')

if [[ "$NEW_VERSION" == "18.2.0" ]]; then
    echo -e "${GREEN}✅ Successfully installed React 18.2.0${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Restart wasp servers to apply changes${NC}"
    echo -e "${YELLOW}   → Kill current servers and run 'wasp start'${NC}"
else
    echo -e "${RED}❌ Failed to install React 18.2.0${NC}"
    exit 1
fi
