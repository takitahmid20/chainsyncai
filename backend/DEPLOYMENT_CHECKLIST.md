# Fly.io Deployment Checklist

## Pre-Deployment ✅

### 1. Code Preparation
- [ ] All changes committed to Git
- [ ] `.env` files in `.gitignore`
- [ ] `requirements.txt` updated with all dependencies
- [ ] Database migrations created (`python manage.py makemigrations`)
- [ ] Django check passes (`python manage.py check --deploy`)
- [ ] Tests passing (if applicable)

### 2. Environment Setup
- [ ] Fly.io account created
- [ ] Fly CLI installed (`curl -L https://fly.io/install.sh | sh`)
- [ ] Logged in to Fly (`fly auth login`)
- [ ] NeonDB database created
- [ ] Cloudinary account set up
- [ ] Google AI API key obtained

### 3. Configuration Files
- [ ] `fly.toml` configured (app name, region, resources)
- [ ] `Dockerfile` optimized (multi-stage build)
- [ ] `start.sh` executable (`chmod +x start.sh`)
- [ ] `.dockerignore` includes unnecessary files
- [ ] Health check configured in `fly.toml`

## Deployment Steps 🚀

### Step 1: Initial Setup
```bash
cd backend
fly launch --no-deploy
# App name: chainsync-backend
# Region: sin (Singapore)
# PostgreSQL: No (using NeonDB)
# Redis: No (add later)
```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Completed

---

### Step 2: Configure Secrets

**Critical Secrets** (MUST set before first deploy):

```bash
# Django Core
fly secrets set SECRET_KEY="$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')"
fly secrets set DEBUG="False"
fly secrets set ALLOWED_HOSTS="chainsync-backend.fly.dev"
```

**Status**: ⬜

```bash
# Database (NeonDB) - Use your actual credentials
fly secrets set DATABASE_URL="postgresql://user:password@host.neon.tech/chainsync?sslmode=require"
```

**Status**: ⬜

```bash
# JWT Authentication
fly secrets set JWT_SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(64))')"
```

**Status**: ⬜

```bash
# CORS (Update with your actual frontend URL)
fly secrets set CORS_ALLOWED_ORIGINS="https://your-frontend.vercel.app"
```

**Status**: ⬜

```bash
# Google AI
fly secrets set GEMINI_API_KEY="your-actual-api-key-here"
```

**Status**: ⬜

```bash
# Cloudinary (Use your actual credentials)
fly secrets set CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
```

**Status**: ⬜

**Optional Secrets**:

```bash
# Auto-create superuser on first deploy
fly secrets set DJANGO_SUPERUSER_USERNAME="admin"
fly secrets set DJANGO_SUPERUSER_EMAIL="admin@chainsync.ai"
fly secrets set DJANGO_SUPERUSER_PASSWORD="SecurePassword123!"
```

**Status**: ⬜

**Verify secrets set**:
```bash
fly secrets list
```

**Status**: ⬜

---

### Step 3: First Deployment

```bash
fly deploy
```

**Expected output**:
- ✅ Building Docker image
- ✅ Pushing to registry
- ✅ Running release command (migrations)
- ✅ Starting application
- ✅ Health checks passing

**Status**: ⬜

**Deployment time**: ~3-5 minutes

---

### Step 4: Post-Deployment Verification

**Check deployment status**:
```bash
fly status
```
**Expected**: `✓ 1 instances running`

**Status**: ⬜

---

**View logs**:
```bash
fly logs
```
**Look for**: 
- "Starting Gunicorn server..."
- "Booting worker"
- No errors

**Status**: ⬜

---

**Test admin page**:
```bash
fly open
# Then navigate to /admin/
```
**Expected**: Admin login page loads

**Status**: ⬜

---

**Test API documentation**:
```bash
curl https://chainsync-backend.fly.dev/api/schema/swagger-ui/
```
**Expected**: HTTP 200, Swagger UI HTML

**Status**: ⬜

---

### Step 5: Create Superuser (if not auto-created)

```bash
fly ssh console
python manage.py createsuperuser
# Username: admin
# Email: admin@chainsync.ai
# Password: [enter secure password]
exit
```

**Status**: ⬜

---

### Step 6: Test Authentication

**Get auth token**:
```bash
curl -X POST https://chainsync-backend.fly.dev/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@chainsync.ai",
    "password": "YourPassword"
  }'
```

**Expected**: 
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {...}
}
```

**Status**: ⬜

**Save your token**: _______________________

---

### Step 7: Test AI Endpoints

**Test demand forecast**:
```bash
curl -X POST https://chainsync-backend.fly.dev/api/ai/demand-forecast/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "forecast_days": 30
  }'
```

**Expected**: AI forecast response (may take 3-5 seconds)

**Status**: ⬜

---

**Test AI insights**:
```bash
curl -X POST https://chainsync-backend.fly.dev/api/ai/insights/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "forecast_days": 30,
    "priority_filter": "urgent",
    "max_products": 5
  }'
```

**Expected**: Insights response with recommendations (may take 15-25 seconds)

**Status**: ⬜

---

## Post-Deployment Tasks ⚙️

### Database Verification
```bash
fly ssh console -C "python manage.py showmigrations"
```
**Expected**: All migrations applied with [X]

**Status**: ⬜

---

### Static Files Check
```bash
fly ssh console
ls -la /app/staticfiles/
exit
```
**Expected**: Static files present (admin/, rest_framework/, etc.)

**Status**: ⬜

---

### Environment Check
```bash
fly ssh console -C "python manage.py check --deploy"
```
**Expected**: "System check identified no issues"

**Status**: ⬜

---

## Monitoring Setup 📊

### Enable Metrics
```bash
fly dashboard
# Navigate to: Metrics tab
# Check: CPU, Memory, Request Rate
```

**Status**: ⬜

---

### Set Up Alerts (Optional)
- [ ] Email alerts for downtime
- [ ] Slack integration for errors
- [ ] Log monitoring (Sentry, LogDNA)

---

## Performance Optimization 🚀

### Current Configuration
- Memory: 1GB
- CPU: 1 shared
- Workers: 4
- Region: Singapore (sin)

### If needed, scale up:
```bash
# Increase memory
fly scale memory 2048

# Add more machines
fly scale count 2

# Dedicated CPU
fly scale vm dedicated-cpu-1x
```

**Status**: ⬜ Not Needed | ⏳ Planned | ✅ Applied

---

## Custom Domain Setup (Optional) 🌐

### Add Domain
```bash
fly certs create api.chainsync.ai
```

### DNS Configuration
Add these records to your domain:
```
Type: CNAME
Name: api
Value: chainsync-backend.fly.dev
```

### Verify Certificate
```bash
fly certs check api.chainsync.ai
```

**Status**: ⬜ Not Needed | ⏳ Planned | ✅ Completed

---

## Troubleshooting 🔧

### Health Checks Failing
```bash
fly logs --filter healthcheck
fly ssh console
curl http://localhost:8000/admin/login/
```

**Issue**: ________________
**Resolved**: ⬜

---

### Database Connection Errors
```bash
fly secrets list | grep DB
fly ssh console -C "python manage.py dbshell"
```

**Issue**: ________________
**Resolved**: ⬜

---

### Static Files Not Loading
```bash
fly ssh console
python manage.py collectstatic --noinput --clear
exit
fly apps restart
```

**Issue**: ________________
**Resolved**: ⬜

---

### AI API Not Working
```bash
fly secrets list | grep GEMINI
fly ssh console
python -c "import os; print(os.getenv('GEMINI_API_KEY')[:10])"
```

**Issue**: ________________
**Resolved**: ⬜

---

## Rollback Plan 🔄

### If deployment fails:
```bash
# List deployments
fly releases

# Rollback to previous version
fly releases rollback [version-number]
```

**Last Known Good Version**: ________________

---

## Cost Tracking 💰

### Current Plan
- [ ] Free tier (auto-pause when idle)
- [ ] Hobby ($5/month, always running)
- [ ] Scale ($29/month, 2GB RAM)

### Estimated Monthly Cost
- Base: $________
- Storage: $________
- Bandwidth: $________
- **Total**: $________

---

## CI/CD Setup (Future) 🤖

### GitHub Actions
- [ ] Create `.github/workflows/deploy.yml`
- [ ] Set `FLY_API_TOKEN` in GitHub secrets
- [ ] Configure automatic deployment on `main` branch

---

## Final Checklist ✅

Before marking deployment as complete:

- [ ] Application deployed successfully
- [ ] All secrets configured
- [ ] Health checks passing
- [ ] Admin panel accessible
- [ ] API documentation working
- [ ] Authentication tested
- [ ] AI endpoints tested
- [ ] Database migrations applied
- [ ] Static files serving
- [ ] Logs monitored
- [ ] Frontend can connect to API
- [ ] CORS configured correctly
- [ ] SSL certificate active (HTTPS working)
- [ ] Documentation updated

---

## Team Sign-Off

**Deployed By**: ________________
**Date**: ________________
**Version**: ________________
**Deployment Status**: ⬜ Development | ⬜ Staging | ⬜ Production

**Notes**:
_______________________________________
_______________________________________
_______________________________________

---

## Emergency Contacts

**Fly.io Support**: https://community.fly.io/
**NeonDB Support**: support@neon.tech
**Team Lead**: ________________
**On-Call**: ________________

---

**Last Updated**: 2025-01-XX
**Next Review**: ________________
