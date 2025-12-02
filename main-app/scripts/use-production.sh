#!/bin/bash
# Switch to Production Environment

echo "🌐 Switching to PRODUCTION environment..."

# Copy production env to .env
cp .env.production .env 2>/dev/null || echo "API_BASE_URL=https://chainsync-backend-winter-sound-6706.fly.dev
APP_ENV=production
API_TIMEOUT=60000" > .env

echo "✅ Now using: https://chainsync-backend-winter-sound-6706.fly.dev"
echo ""
echo "Start the app with:"
echo "  npm start"
echo "  or"
echo "  npx expo start -c"
echo ""
