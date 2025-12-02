# ChainSync AI Backend

Django REST API for ChainSync AI - B2B Supply Chain Management Platform with AI-Powered Demand Forecasting

## 🚀 Quick Start

### Local Development
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### Production Deployment (Fly.io)
See **[FLY_DEPLOYMENT_GUIDE.md](./FLY_DEPLOYMENT_GUIDE.md)** for complete deployment instructions.

**Quick Deploy:**
```bash
fly auth login
fly launch --no-deploy
# Configure secrets (see ENV_VARIABLES.md)
fly secrets set SECRET_KEY="..." DATABASE_URL="..." GEMINI_API_KEY="..."
fly deploy
```

## 📦 Project Structure

```
backend/
├── chainsync/          # Main project settings
├── users/              # Authentication & user management (JWT, roles)
├── retailers/          # Retailer profiles & dashboard
├── suppliers/          # Supplier profiles & distributor features
├── products/           # Product CRUD & AI auto-fill
├── inventory/          # Stock management & auto-restock
├── orders/             # Order processing & tracking
├── payments/           # Payment processing (cash, credit, installments)
├── ai_engine/          # 🤖 AI demand forecasting & insights (Google Gemini)
├── notifications/      # Push notifications & alerts
├── analytics/          # Sales analytics & insights
├── media/              # Image uploads & AI processing
├── common/             # Shared utilities & helpers
└── manage.py
```

## 🔗 API Endpoints

### Authentication & Users
- `POST /api/auth/register/` - Register new account
- `POST /api/auth/login/` - Login (JWT tokens)
- `POST /api/auth/refresh/` - Refresh access token
- `GET /api/auth/profile/` - Get user profile

### AI Engine 🤖 **NEW**
- `POST /api/ai/demand-forecast/` - Single product demand forecast
- `POST /api/ai/insights/` - Bulk AI insights for all products
- **Docs**: [AI_FEATURES_OVERVIEW.md](./AI_FEATURES_OVERVIEW.md)
- **Testing**: [AI_INSIGHTS_TESTING.md](./Guidelines/AI_INSIGHTS_TESTING.md)

### Products & Inventory
- `GET/POST /api/products/` - Product CRUD
- `GET /api/products/{id}/` - Product details
- `GET /api/inventory/` - Inventory management
- `POST /api/inventory/restock/` - Auto-restock

### Orders & Payments
- `GET/POST /api/orders/` - Order operations
- `GET /api/orders/{id}/track/` - Order tracking
- `POST /api/payments/` - Payment processing
- `GET /api/payments/history/` - Payment history

### API Documentation
- `/api/schema/` - OpenAPI schema (JSON)
- `/api/schema/swagger-ui/` - Swagger UI (interactive)
- `/api/schema/redoc/` - ReDoc (clean docs)

## 🔐 Admin Panel

Access Django admin: `http://localhost:8000/admin/`  
Production: `https://chainsync-backend.fly.dev/admin/`

## 🛠️ Technologies

### Core Framework
- **Django** 5.2.8 - Web framework
- **Django REST Framework** 3.16.1 - API framework
- **drf-spectacular** 0.29.0 - OpenAPI/Swagger documentation

### Authentication & Security
- **djangorestframework-simplejwt** 5.4.1 - JWT authentication
- **django-cors-headers** 4.6.0 - CORS support
- **python-decouple** 3.8 - Environment variable management

### AI & Machine Learning
- **google-genai** 1.52.0 - Google Gemini AI SDK
- **langchain** 0.3.14 - LLM framework
- **numpy** 1.26.4 - Numerical computing

### Database & Storage
- **PostgreSQL** (NeonDB) - Production database
- **psycopg2-binary** 2.9.11 - PostgreSQL adapter
- **dj-database-url** 2.3.0 - Database URL parsing
- **Cloudinary** - Media storage (django-cloudinary-storage 0.3.0)

### Production Server
- **Gunicorn** 21.2.0 - WSGI server (4 workers, 2 threads)
- **Whitenoise** - Static file serving
- **Docker** - Containerization (Python 3.11-slim)

## 📚 Documentation

- **[FLY_DEPLOYMENT_GUIDE.md](./FLY_DEPLOYMENT_GUIDE.md)** - Complete Fly.io deployment guide
- **[ENV_VARIABLES.md](./ENV_VARIABLES.md)** - Environment variables reference
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment checklist
- **[AI_FEATURES_OVERVIEW.md](./AI_FEATURES_OVERVIEW.md)** - AI features documentation
- **[AI_SETUP_GUIDE.md](./AI_SETUP_GUIDE.md)** - AI API setup & testing
- **[AI_INSIGHTS_TESTING.md](./Guidelines/AI_INSIGHTS_TESTING.md)** - Testing AI insights

## 🔧 Configuration

### Required Environment Variables

**Development (.env):**
```bash
SECRET_KEY=dev-key-not-for-production
DEBUG=True
DATABASE_URL=postgresql://user:pass@localhost:5432/chainsync
GEMINI_API_KEY=your-google-ai-key
CLOUDINARY_URL=cloudinary://...
```

**Production (Fly.io secrets):**
```bash
fly secrets set SECRET_KEY="..."
fly secrets set DEBUG="False"
fly secrets set DATABASE_URL="..."
fly secrets set GEMINI_API_KEY="..."
fly secrets set CLOUDINARY_URL="..."
```

See **[ENV_VARIABLES.md](./ENV_VARIABLES.md)** for complete list.

## 🧪 Testing

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test ai_engine

# Check deployment configuration
python manage.py check --deploy

# Validate AI services
python manage.py shell
>>> from ai_engine.services import GeminiAIService
>>> service = GeminiAIService()
```

## 📊 Performance

### AI Endpoints
- **Single product forecast**: 2-5 seconds
- **Bulk insights (5 products)**: 15-25 seconds
- **Bulk insights (20 products)**: 60-120 seconds
- **Free tier limit**: 10 requests/minute (Google Gemini)

### Optimization Recommendations
- Use `max_products` parameter (5-10 for faster response)
- Implement Redis caching (30-minute TTL)
- Consider Celery for background processing
- Use `priority_filter` to focus on urgent items

## 🚢 Deployment

**Production URL**: `https://chainsync-backend.fly.dev`

**Deploy command:**
```bash
fly deploy
```

**Check status:**
```bash
fly status
fly logs
```

**Database migrations:**
```bash
fly ssh console -C "python manage.py migrate"
```

## 📝 License

Proprietary - ChainSync AI © 2025

## 👥 Team

**Development Team**: ChainSync AI  
**Backend Lead**: [Your Name]  
**Contact**: support@chainsync.ai

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0.0  
**Status**: Production Ready ✅
