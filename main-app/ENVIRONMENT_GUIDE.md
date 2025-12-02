# 🔄 Environment Switcher Guide

## Quick Commands

### Switch to Localhost
```bash
npm run env:localhost
# Then restart app:
npm start
```

### Switch to Production
```bash
npm run env:production
# Then restart app:
npm start
```

### Start with Specific Environment
```bash
# Start with localhost
npm run start:dev

# Start with production
npm run start:prod
```

---

## Manual Method

### Use Localhost:
```bash
# Edit app.config.js or create .env file
API_BASE_URL=http://172.16.30.89:8000
APP_ENV=development
```

### Use Production:
```bash
# Edit app.config.js or create .env file
API_BASE_URL=https://chainsync-backend-winter-sound-6706.fly.dev
APP_ENV=production
```

---

## Current API Endpoints

**Localhost**: `http://172.16.30.89:8000`
**Production**: `https://chainsync-backend-winter-sound-6706.fly.dev`

---

## How It Works

The app automatically detects which backend to use based on:
1. `.env` file (highest priority)
2. `process.env.API_BASE_URL` 
3. `process.env.APP_ENV`
4. Default: localhost for development

---

## Testing the Connection

After switching, test the connection:
```bash
# Check current API URL
npx expo start

# Look for console output showing:
# API Base URL: http://172.16.30.89:8000  (localhost)
# or
# API Base URL: https://...fly.dev  (production)
```

---

## Files Modified

- ✅ `config/api.ts` - Smart URL detection
- ✅ `app.config.js` - Environment configuration
- ✅ `.env.development` - Localhost settings
- ✅ `.env.production` - Production settings
- ✅ `scripts/use-localhost.sh` - Switch to localhost
- ✅ `scripts/use-production.sh` - Switch to production

---

## Troubleshooting

**App still using old URL?**
```bash
# Clear cache and restart
npx expo start -c
```

**Environment not switching?**
```bash
# Manually copy the env file
cp .env.production .env   # For production
cp .env.development .env  # For localhost
npx expo start -c
```

**Want to check current environment?**
- Open app
- Check console logs
- Or check the API calls in Network tab
