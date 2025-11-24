#!/usr/bin/env bash
# scripts/seed-demo-user.sh
# Seeds a basic demo user for testing

set -e

echo "🌱 Seeding demo user for OpenSaaS boilerplate..."
echo ""

# Change to app directory
cd "$(dirname "$0")/../app"

# Run seed (assumes seedDemoUser function exists in main.wasp)
if ! wasp db seed seedDemoUser 2>&1; then
  echo ""
  echo "⚠️  Note: seedDemoUser function not found in main.wasp"
  echo "   To add it, create:"
  echo "   1. app/src/server/scripts/seedDemoUser.ts"
  echo "   2. Add to main.wasp: db.seeds = [seedDemoUser]"
  echo ""
  echo "   See OpenSaaS template for example seed scripts"
  exit 1
fi

echo ""
echo "✅ Demo user seeded successfully!"
echo ""
echo "Login credentials:"
echo "  Email: demo@example.com"
echo "  Password: DemoPassword123!"
echo "  URL: http://localhost:3000/login"
echo ""
