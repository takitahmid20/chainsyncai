#!/bin/bash
# Switch to Localhost Environment

echo "🔧 Switching to LOCALHOST environment..."

# Copy development env to .env
cp .env.development .env 2>/dev/null || echo "API_BASE_URL=http://172.16.30.89:8000
APP_ENV=development
API_TIMEOUT=30000" > .env

echo "✅ Now using: http://172.16.30.89:8000"
echo ""
echo "Start the app with:"
echo "  npm start"
echo "  or"
echo "  npx expo start -c"
echo ""
