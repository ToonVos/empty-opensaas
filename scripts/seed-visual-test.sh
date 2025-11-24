#!/bin/bash
# Seed demo user with complete A3 data for visual testing
# Usage: ./scripts/seed-visual-test.sh

set -e  # Exit on error

# Get script directory and source worktree config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/worktree-config.sh"

echo "🌱 Seeding demo user with A3 data..."
echo ""

# Navigate to app directory (where main.wasp is located)
cd "$(dirname "$0")/../app"

# Run the seed function
wasp db seed seedDemoUserWithA3

echo ""
echo "✅ Seed complete!"
echo ""
echo "📝 You can now log in with:"
echo ""
echo "   🏢 ORGANIZATION USER (customer/klant):"
echo "      Email: demo@leancoach.nl"
echo "      Password: DemoPassword123!"
echo ""
echo "   👑 OWNER USER (app beheerder):"
echo "      Email: owner@leancoach.nl"
echo "      Password: OwnerPassword123!"
echo ""
echo "🌐 Open browser to: ${CLIENT_URL}/login"
echo ""
