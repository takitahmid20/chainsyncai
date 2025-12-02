# ChainSync AI - Quick Deploy Commands

## 🚀 One-Time Setup (First Deployment)

```bash
# 1. Install Fly CLI (if not installed)
curl -L https://fly.io/install.sh | sh

# 2. Login to Fly.io
fly auth login

# 3. Navigate to backend directory
cd "/Volumes/TakiTahmid/Daily Work/1. ChainSync AI/chainsyncai/backend"

# 4. Launch app (no deploy yet)
fly launch --no-deploy
```

## 🔐 Configure Secrets (Required Before First Deploy)

```bash
# Generate and set Django secret key
fly secrets set SECRET_KEY="$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')"

# Generate and set JWT secret
fly secrets set JWT_SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(64))')"

# Set production mode
fly secrets set DEBUG="False"

# Set allowed hosts
fly secrets set ALLOWED_HOSTS="chainsync-backend.fly.dev"

# Set CORS origins (UPDATE WITH YOUR FRONTEND URL)
fly secrets set CORS_ALLOWED_ORIGINS="https://your-frontend.vercel.app"

# Set database URL (GET FROM NEONDB)
fly secrets set DATABASE_URL="postgresql://user:password@host.neon.tech/chainsync?sslmode=require"

# Set Google AI API key (GET FROM https://ai.google.dev)
fly secrets set GEMINI_API_KEY="your-api-key-here"

# Set Cloudinary (GET FROM https://cloudinary.com)
fly secrets set CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"

# OPTIONAL: Auto-create superuser on first deploy
fly secrets set DJANGO_SUPERUSER_USERNAME="admin"
fly secrets set DJANGO_SUPERUSER_EMAIL="admin@chainsync.ai"
fly secrets set DJANGO_SUPERUSER_PASSWORD="SecurePassword123!"
```

## 🚢 Deploy

```bash
# Deploy application
fly deploy

# Expected time: 3-5 minutes
# Steps: Build → Push → Migrate → Start
```

## ✅ Post-Deployment Verification

```bash
# Check status
fly status

# View logs
fly logs

# Open in browser
fly open

# Test admin panel
open https://chainsync-backend.fly.dev/admin/

# Test API docs
open https://chainsync-backend.fly.dev/api/schema/swagger-ui/
```

## 🔑 Create Superuser (if not auto-created)

```bash
fly ssh console
python manage.py createsuperuser
exit
```

## 🧪 Test API

```bash
# Login to get token
curl -X POST https://chainsync-backend.fly.dev/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@chainsync.ai","password":"YourPassword"}'

# Save your token
export TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."

# Test AI insights
curl -X POST https://chainsync-backend.fly.dev/api/ai/insights/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "forecast_days": 30,
    "priority_filter": "urgent",
    "max_products": 5
  }'
```

## 🔄 Re-Deploy (After Code Changes)

```bash
# Simple redeploy
fly deploy

# Deploy with logs
fly deploy --verbose

# Deploy specific Dockerfile
fly deploy --dockerfile Dockerfile
```

## 📊 Monitoring

```bash
# Real-time logs
fly logs

# Filter by severity
fly logs --filter error

# Last 100 lines
fly logs --lines 100

# Follow logs
fly logs --tail
```

## 🛠️ Troubleshooting

```bash
# SSH into container
fly ssh console

# Check Django configuration
python manage.py check --deploy

# View environment variables
env | grep -E 'SECRET|DB|GEMINI|CLOUDINARY'

# Test database connection
python manage.py dbshell

# Re-collect static files
python manage.py collectstatic --noinput --clear

# Exit SSH
exit

# Restart application
fly apps restart

# View secrets (names only, not values)
fly secrets list

# Set/update a secret
fly secrets set KEY="value"
```

## 📈 Scaling

```bash
# Increase memory to 2GB
fly scale memory 2048

# Add more machines
fly scale count 2

# Dedicated CPU
fly scale vm dedicated-cpu-1x

# View current resources
fly scale show
```

## 🔙 Rollback

```bash
# List releases
fly releases

# Rollback to previous version
fly releases rollback [VERSION_NUMBER]
```

## 🗑️ Cleanup

```bash
# Destroy app (CAUTION!)
fly apps destroy chainsync-backend
```

## 📚 Detailed Guides

- **Full Guide**: [FLY_DEPLOYMENT_GUIDE.md](./FLY_DEPLOYMENT_GUIDE.md)
- **Environment Vars**: [ENV_VARIABLES.md](./ENV_VARIABLES.md)
- **Checklist**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## 🆘 Emergency Commands

```bash
# View machine status
fly status

# Force restart all machines
fly apps restart --force

# Scale to 0 (stop all)
fly scale count 0

# Scale back to 1
fly scale count 1

# View machine IP
fly ips list

# SSH with specific command
fly ssh console -C "python manage.py migrate"
```

---

**⚡ Quick Reference**: Save this file for fast deployment!
