# Production Security Settings - Add to settings.py

## ⚠️ Important Security Settings for Production

Add these settings to `backend/chainsync/settings.py` when deploying to production:

```python
# At the top with other imports
from decouple import config

# Security Settings for Production
DEBUG = config('DEBUG', default=False, cast=bool)

# HTTPS/SSL Settings (Fly.io handles SSL termination)
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# HSTS (HTTP Strict Transport Security)
SECURE_HSTS_SECONDS = config('SECURE_HSTS_SECONDS', default=31536000, cast=int)  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Cookie Security
SESSION_COOKIE_SECURE = config('SESSION_COOKIE_SECURE', default=True, cast=bool)
CSRF_COOKIE_SECURE = config('CSRF_COOKIE_SECURE', default=True, cast=bool)
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True

# Additional Security Headers
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# Allowed Hosts
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

# CORS Settings
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='').split(',')
CORS_ALLOW_CREDENTIALS = True

# Secret Key (MUST be set in production via environment variable)
SECRET_KEY = config('SECRET_KEY')
```

## Development Override

For local development, create `.env` file:

```bash
DEBUG=True
SECRET_KEY=dev-secret-key-for-local-only
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
```

## Production Environment Variables (Fly.io)

Set these via `fly secrets set`:

```bash
# Core Security
fly secrets set DEBUG="False"
fly secrets set SECRET_KEY="$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')"

# SSL/HTTPS (Fly.io handles termination, we just enforce HTTPS redirect)
fly secrets set SECURE_SSL_REDIRECT="True"
fly secrets set SESSION_COOKIE_SECURE="True"
fly secrets set CSRF_COOKIE_SECURE="True"
fly secrets set SECURE_HSTS_SECONDS="31536000"

# Allowed Hosts
fly secrets set ALLOWED_HOSTS="chainsync-backend.fly.dev,api.chainsync.ai"

# CORS (update with your actual frontend URLs)
fly secrets set CORS_ALLOWED_ORIGINS="https://chainsync.ai,https://app.chainsync.ai"
```

## drf-spectacular Warnings (Non-Critical)

The warnings about `drf_spectacular.W001` and `drf_spectacular.W002` are **non-critical**:
- They only affect API documentation quality
- The API itself works perfectly fine
- You can fix them later by adding `@extend_schema` decorators to views

To suppress these warnings (optional):

```python
# In settings.py
SPECTACULAR_SETTINGS = {
    'TITLE': 'ChainSync AI API',
    'DESCRIPTION': 'B2B Supply Chain Management with AI',
    'VERSION': '1.0.0',
    # Suppress warnings
    'WARNINGS': {
        'W001': False,  # Type hint warnings
        'W002': False,  # Serializer guessing warnings
    },
}
```

## Security Checklist Before Production

- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY` (64+ characters, randomly generated)
- [ ] `ALLOWED_HOSTS` set to specific domains (no wildcards)
- [ ] `CORS_ALLOWED_ORIGINS` set to specific frontend URLs
- [ ] `SECURE_SSL_REDIRECT=True`
- [ ] `SESSION_COOKIE_SECURE=True`
- [ ] `CSRF_COOKIE_SECURE=True`
- [ ] `SECURE_HSTS_SECONDS=31536000` (1 year)
- [ ] Database password is strong (16+ characters)
- [ ] JWT_SECRET_KEY different from SECRET_KEY
- [ ] All API keys (Gemini, Cloudinary) rotated from development
- [ ] `.env` file in `.gitignore`
- [ ] All secrets set via `fly secrets set` (not in code)

## Current Status

✅ **Deployment files ready** - fly.toml, Dockerfile, start.sh optimized  
⚠️ **Security settings** - Need to be added to settings.py before production  
✅ **Documentation complete** - All guides created  
✅ **Django check passes** - Only expected warnings for dev mode

## Next Action

1. Add security settings to `settings.py` (copy from above)
2. Test locally with `DEBUG=False` to verify
3. Deploy to Fly.io with production secrets
4. Run `fly ssh console -C "python manage.py check --deploy"` after deployment
5. Verify no security warnings remain

---

**Note**: These warnings appear because `DEBUG=True` in development. Once you set `DEBUG=False` in production and configure security settings, they will disappear.
