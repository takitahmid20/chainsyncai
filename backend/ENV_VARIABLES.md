# ChainSync AI - Environment Variables Reference

## Development vs Production

### Development (.env.development)
```bash
DEBUG=True
SECRET_KEY=dev-secret-key-not-for-production
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
```

### Production (.env.production - DO NOT COMMIT)
```bash
DEBUG=False
SECRET_KEY=<generate-strong-64-char-key>
ALLOWED_HOSTS=chainsync-backend.fly.dev,api.chainsync.ai
CORS_ALLOWED_ORIGINS=https://chainsync.ai,https://app.chainsync.ai
```

## All Environment Variables

### Django Core
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | ✅ Yes | - | Django secret key (64+ chars) |
| `DEBUG` | ✅ Yes | False | Debug mode (False in production) |
| `ALLOWED_HOSTS` | ✅ Yes | - | Comma-separated list of allowed hosts |
| `DJANGO_SETTINGS_MODULE` | No | chainsync.settings | Settings module path |

### Database (NeonDB PostgreSQL)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ Yes* | - | Full PostgreSQL connection string |
| `DB_NAME` | ✅ Yes* | chainsync | Database name |
| `DB_USER` | ✅ Yes* | postgres | Database user |
| `DB_PASSWORD` | ✅ Yes* | - | Database password |
| `DB_HOST` | ✅ Yes* | localhost | Database host |
| `DB_PORT` | No | 5432 | Database port |

*Use either `DATABASE_URL` OR individual DB_* variables

### JWT Authentication
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET_KEY` | ✅ Yes | - | JWT signing key (different from SECRET_KEY) |
| `JWT_ACCESS_TOKEN_LIFETIME` | No | 48 hours | Access token expiry |
| `JWT_REFRESH_TOKEN_LIFETIME` | No | 7 days | Refresh token expiry |

### CORS Configuration
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CORS_ALLOWED_ORIGINS` | ✅ Yes | - | Comma-separated list of frontend URLs |
| `CORS_ALLOW_CREDENTIALS` | No | True | Allow cookies in CORS requests |

### AI Services (Google Gemini)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | - | Google AI API key |
| `GEMINI_MODEL` | No | gemini-2.5-flash | Model name |
| `GEMINI_TEMPERATURE` | No | 0.7 | Response creativity (0-1) |
| `GEMINI_MAX_TOKENS` | No | 2048 | Max response tokens |

### Cloudinary (Media Storage)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CLOUDINARY_URL` | ✅ Yes* | - | Full Cloudinary URL |
| `CLOUDINARY_CLOUD_NAME` | ✅ Yes* | - | Cloud name |
| `CLOUDINARY_API_KEY` | ✅ Yes* | - | API key |
| `CLOUDINARY_API_SECRET` | ✅ Yes* | - | API secret |

*Use either `CLOUDINARY_URL` OR individual CLOUDINARY_* variables

### Redis (Optional - for caching)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_URL` | No | - | Redis connection URL |
| `CACHE_TTL` | No | 1800 | Cache TTL in seconds (30 min) |

### Email (Optional - for notifications)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EMAIL_BACKEND` | No | console | Email backend |
| `EMAIL_HOST` | No | - | SMTP host |
| `EMAIL_PORT` | No | 587 | SMTP port |
| `EMAIL_USE_TLS` | No | True | Use TLS |
| `EMAIL_HOST_USER` | No | - | SMTP username |
| `EMAIL_HOST_PASSWORD` | No | - | SMTP password |
| `DEFAULT_FROM_EMAIL` | No | noreply@chainsync.ai | Default sender |

### Superuser Auto-Creation
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DJANGO_SUPERUSER_USERNAME` | No | - | Admin username (auto-created on first deploy) |
| `DJANGO_SUPERUSER_EMAIL` | No | - | Admin email |
| `DJANGO_SUPERUSER_PASSWORD` | No | - | Admin password |

### Server Configuration
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 8000 | Server port (Fly.io sets automatically) |
| `GUNICORN_WORKERS` | No | 4 | Number of Gunicorn workers |
| `GUNICORN_THREADS` | No | 2 | Threads per worker |
| `GUNICORN_TIMEOUT` | No | 120 | Request timeout (seconds) |

## How to Generate Secrets

### Django SECRET_KEY
```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

### JWT Secret Key
```bash
python -c 'import secrets; print(secrets.token_urlsafe(64))'
```

### Strong Password
```bash
python -c 'import secrets, string; chars = string.ascii_letters + string.digits + string.punctuation; print("".join(secrets.choice(chars) for _ in range(32)))'
```

## Setting Secrets in Fly.io

### Individual Secrets
```bash
fly secrets set SECRET_KEY="$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')"
fly secrets set JWT_SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(64))')"
```

### From File (Bulk Import)
Create `secrets.txt`:
```
SECRET_KEY=your-secret-key
DEBUG=False
DB_PASSWORD=your-db-password
```

Import:
```bash
cat secrets.txt | fly secrets import
```

### List Current Secrets
```bash
fly secrets list
```

### Remove Secret
```bash
fly secrets unset SECRET_NAME
```

## Example Production Configuration

### NeonDB Connection
```bash
# Option 1: Use DATABASE_URL (recommended)
fly secrets set DATABASE_URL="postgresql://username:password@ep-cool-pond-123456.us-east-2.aws.neon.tech/chainsync?sslmode=require"

# Option 2: Use individual variables
fly secrets set DB_NAME="chainsync"
fly secrets set DB_USER="neon_user_abc123"
fly secrets set DB_PASSWORD="very_secure_password_123"
fly secrets set DB_HOST="ep-cool-pond-123456.us-east-2.aws.neon.tech"
fly secrets set DB_PORT="5432"
```

### Cloudinary
```bash
# Option 1: Use CLOUDINARY_URL (recommended)
fly secrets set CLOUDINARY_URL="cloudinary://123456789012345:abcdefghijklmnopqrstuvwxyz@your-cloud-name"

# Option 2: Use individual variables
fly secrets set CLOUDINARY_CLOUD_NAME="your-cloud-name"
fly secrets set CLOUDINARY_API_KEY="123456789012345"
fly secrets set CLOUDINARY_API_SECRET="abcdefghijklmnopqrstuvwxyz"
```

### Google AI (Gemini)
```bash
fly secrets set GEMINI_API_KEY="AIzaSyC-YourActualAPIKeyHere_123456789"
```

### Frontend CORS
```bash
fly secrets set CORS_ALLOWED_ORIGINS="https://chainsync.ai,https://app.chainsync.ai,https://www.chainsync.ai"
```

## Validation

### Check Required Variables
```bash
# SSH into Fly.io container
fly ssh console

# Check environment
python manage.py check --deploy

# Verify database connection
python manage.py dbshell

# Test AI service
python manage.py shell
>>> from ai_engine.services import GeminiAIService
>>> service = GeminiAIService()
>>> print("AI service initialized successfully!")
```

## Security Checklist

- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY` (64+ characters, random)
- [ ] Different `JWT_SECRET_KEY` from `SECRET_KEY`
- [ ] Secure database password (16+ characters)
- [ ] Correct `ALLOWED_HOSTS` (no wildcards)
- [ ] Restricted `CORS_ALLOWED_ORIGINS` (specific domains)
- [ ] All API keys rotated from development
- [ ] `.env` files in `.gitignore`
- [ ] Secrets set via `fly secrets set` (not in code)
- [ ] SSL/TLS enabled (`force_https = true`)

## Troubleshooting

### "No such secret" error
```bash
# List all secrets
fly secrets list

# Set missing secret
fly secrets set MISSING_VAR="value"
```

### Database connection failed
```bash
# Verify DATABASE_URL format
echo $DATABASE_URL

# Test connection
fly ssh console -C "python manage.py dbshell"
```

### CORS errors in frontend
```bash
# Check current setting
fly ssh console
echo $CORS_ALLOWED_ORIGINS

# Update with correct origins
fly secrets set CORS_ALLOWED_ORIGINS="https://your-frontend.vercel.app"
```

### AI API not working
```bash
# Verify API key set
fly secrets list | grep GEMINI

# Test in console
fly ssh console
python manage.py shell
>>> import os
>>> print(os.getenv('GEMINI_API_KEY')[:10] + '...')  # First 10 chars
```

---

**Security Warning**: Never commit `.env` files or expose secrets in code/logs!
