# ChainSync AI - Fly.io Deployment Guide

## Prerequisites

1. **Fly.io Account**: Sign up at https://fly.io
2. **Fly CLI**: Install with `curl -L https://fly.io/install.sh | sh`
3. **NeonDB Account**: PostgreSQL database (free tier available at https://neon.tech)
4. **Cloudinary Account**: Media storage (https://cloudinary.com)
5. **Google AI API Key**: For Gemini AI features (https://ai.google.dev)

## Required Environment Variables

Create a `.env.production` file for reference (do NOT commit):

```bash
# Django
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=chainsync-backend.fly.dev,your-custom-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend.com,https://your-app.com

# Database (NeonDB)
DB_NAME=chainsync_prod
DB_USER=your_neon_user
DB_PASSWORD=your_neon_password
DB_HOST=your-project.neon.tech
DB_PORT=5432
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET_KEY=your-jwt-secret-key

# AI Services
GEMINI_API_KEY=your-google-gemini-api-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Optional Superuser
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@chainsync.ai
DJANGO_SUPERUSER_PASSWORD=your-admin-password
```

## Deployment Steps

### 1. Login to Fly.io

```bash
fly auth login
```

### 2. Navigate to Backend Directory

```bash
cd "/Volumes/TakiTahmid/Daily Work/1. ChainSync AI/chainsyncai/backend"
```

### 3. Check Existing App (if already created)

```bash
fly status
fly apps list
```

### 4. Create or Update App

**If new deployment:**
```bash
fly launch --no-deploy
# Follow prompts:
# - App name: chainsync-backend
# - Region: sin (Singapore)
# - PostgreSQL: No (using NeonDB)
# - Redis: No (add later if needed)
```

**If app exists:**
```bash
fly apps open  # Check current deployment
```

### 5. Set Secrets (Required - One by One)

```bash
# Django Configuration
fly secrets set SECRET_KEY="your-super-secret-key-generate-new-one"
fly secrets set DEBUG="False"
fly secrets set ALLOWED_HOSTS="chainsync-backend.fly.dev"
fly secrets set CORS_ALLOWED_ORIGINS="https://your-frontend.com"

# Database (NeonDB)
fly secrets set DB_NAME="chainsync_prod"
fly secrets set DB_USER="your_neon_user"
fly secrets set DB_PASSWORD="your_neon_password"
fly secrets set DB_HOST="your-project.neon.tech"
fly secrets set DB_PORT="5432"

# Alternatively, use DATABASE_URL (preferred)
fly secrets set DATABASE_URL="postgresql://user:password@host:5432/database"

# JWT
fly secrets set JWT_SECRET_KEY="your-jwt-secret"

# AI Services
fly secrets set GEMINI_API_KEY="your-google-gemini-api-key"

# Cloudinary
fly secrets set CLOUDINARY_CLOUD_NAME="your_cloud_name"
fly secrets set CLOUDINARY_API_KEY="your_api_key"
fly secrets set CLOUDINARY_API_SECRET="your_api_secret"

# Optional: Auto-create superuser on first deploy
fly secrets set DJANGO_SUPERUSER_USERNAME="admin"
fly secrets set DJANGO_SUPERUSER_EMAIL="admin@chainsync.ai"
fly secrets set DJANGO_SUPERUSER_PASSWORD="SecurePassword123!"
```

### 6. Deploy Application

```bash
fly deploy
```

This will:
- Build Docker image (multi-stage build for optimization)
- Push image to Fly.io registry
- Run migrations (`python manage.py migrate --noinput`)
- Start Gunicorn with 4 workers

### 7. Verify Deployment

```bash
# Check deployment status
fly status

# View logs
fly logs

# Open app in browser
fly open

# Check specific routes
curl https://chainsync-backend.fly.dev/admin/login/
curl https://chainsync-backend.fly.dev/api/schema/swagger-ui/
```

### 8. Post-Deployment Tasks

#### a) Create Superuser (if not auto-created)

```bash
fly ssh console
python manage.py createsuperuser
# Follow prompts
exit
```

#### b) Verify Database Migrations

```bash
fly ssh console -C "python manage.py showmigrations"
```

#### c) Test API Endpoints

```bash
# Get auth token
curl -X POST https://chainsync-backend.fly.dev/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@chainsync.ai","password":"YourPassword"}'

# Test AI insights (replace with your token)
curl -X POST https://chainsync-backend.fly.dev/api/ai/insights/ \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "forecast_days": 30,
    "priority_filter": "urgent",
    "max_products": 5
  }'
```

## Scaling & Optimization

### Increase Resources (if needed)

```bash
# Scale to 2GB RAM
fly scale memory 2048

# Add more VMs
fly scale count 2

# Change to dedicated CPU
fly scale vm dedicated-cpu-1x
```

### Auto-Scaling Configuration

Edit `fly.toml`:
```toml
[http_service]
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1  # Keep 1 always running for faster response
```

### Add Redis for Caching (Recommended for AI features)

```bash
# Create Redis instance
fly redis create

# Set Redis URL
fly secrets set REDIS_URL="redis://default:password@host:6379"
```

Update `requirements.txt`:
```
redis==5.0.1
django-redis==5.4.0
```

## Monitoring & Debugging

### View Logs

```bash
# Real-time logs
fly logs

# Filter by severity
fly logs --filter error

# Last 100 lines
fly logs --lines 100
```

### SSH into Container

```bash
fly ssh console

# Check Python environment
python --version
pip list

# Check Django
python manage.py check

# Run shell
python manage.py shell
```

### Database Console

```bash
fly ssh console
python manage.py dbshell
```

### Restart Application

```bash
fly apps restart chainsync-backend
```

## Continuous Deployment (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: superfly/flyctl-actions/setup-flyctl@master
      
      - name: Deploy to Fly.io
        run: flyctl deploy --remote-only
        working-directory: ./backend
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

## Troubleshooting

### Issue: Health Check Failing

```bash
# Check logs
fly logs --filter healthcheck

# SSH and test manually
fly ssh console
curl http://localhost:8000/admin/login/
```

### Issue: Database Connection Error

```bash
# Verify secrets are set
fly secrets list

# Test database connection
fly ssh console
python manage.py dbshell
```

### Issue: Static Files Not Loading

```bash
# SSH into container
fly ssh console

# Check static files collected
ls -la /app/staticfiles/

# Re-collect static files
python manage.py collectstatic --noinput --clear
```

### Issue: AI API Rate Limits

- **Free Tier**: 10 requests/minute, 250K tokens/minute
- **Solution**: Implement Redis caching or upgrade to paid tier
- **Alternative**: Use background jobs with Celery

### Issue: Slow Response Times

For AI endpoints taking 15-30+ seconds:

1. **Reduce max_products**: Use 5-10 instead of 20-50
2. **Cache results**: Implement Redis caching (30-minute TTL)
3. **Background jobs**: Use Celery for async processing
4. **Progressive loading**: Return partial results as they complete

## Cost Estimation

**Free Tier (Hobby Plan):**
- 1 shared CPU, 256MB RAM
- 3GB persistent storage
- 160GB outbound data transfer
- Automatically pauses when idle

**Recommended Production:**
- 1GB RAM: ~$2/month
- 10GB storage: ~$0.15/GB/month
- Persistent (no auto-pause): ~$5-10/month total

## Security Best Practices

1. ✅ Never commit `.env` files
2. ✅ Use `fly secrets set` for all sensitive data
3. ✅ Set `DEBUG=False` in production
4. ✅ Use strong `SECRET_KEY` (64+ characters)
5. ✅ Configure proper `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`
6. ✅ Enable HTTPS only (`force_https = true`)
7. ✅ Regularly update dependencies
8. ✅ Monitor logs for suspicious activity

## Next Steps

After successful deployment:

1. **Frontend Configuration**: Update API base URL to `https://chainsync-backend.fly.dev`
2. **Custom Domain**: Configure custom domain in Fly.io dashboard
3. **SSL Certificate**: Automatic with Fly.io (Let's Encrypt)
4. **Monitoring**: Set up Sentry or similar error tracking
5. **Backups**: Configure NeonDB automatic backups
6. **CDN**: Use Cloudinary for media, consider CloudFlare for API caching

## Support Resources

- **Fly.io Docs**: https://fly.io/docs/
- **Django Deployment**: https://docs.djangoproject.com/en/5.0/howto/deployment/
- **NeonDB**: https://neon.tech/docs
- **Gemini API**: https://ai.google.dev/docs

---

**Last Updated**: 2025-01-XX  
**Backend Version**: 1.0.0  
**Deployed By**: ChainSync AI Team
