# 🚀 ChainSync AI - Quick Start Guide

## 📱 Development (Localhost)

### Backend
```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```
**URL**: http://172.16.30.89:8000

### Frontend
```bash
cd main-app
npm start
# or
npx expo start
```
Automatically uses: `http://172.16.30.89:8000`

---

## 🌐 Production

### Backend
**URL**: https://chainsync-backend-winter-sound-6706.fly.dev

**Deploy**:
```bash
cd backend
flyctl deploy --app chainsync-backend-winter-sound-6706
```

### Frontend (Build APK)
```bash
cd main-app
export APP_ENV=production
eas build --platform android
```
Automatically uses: `https://chainsync-backend-winter-sound-6706.fly.dev`

---

## 🔄 Switch Environments

### Method 1: Environment Variable
```bash
# Use production backend in development
export API_BASE_URL="https://chainsync-backend-winter-sound-6706.fly.dev"
npx expo start

# Use localhost
export API_BASE_URL="http://172.16.30.89:8000"
npx expo start
```

### Method 2: Edit app.config.js
```javascript
extra: {
  apiBaseUrl: 'https://chainsync-backend-winter-sound-6706.fly.dev',
  // or
  apiBaseUrl: 'http://172.16.30.89:8000',
}
```

---

## 🧪 Test Credentials

**Email**: `takitahmid25+retailer@gmail.com`  
**Password**: `123456`

---

## 🛠️ Common Commands

### Fly.io
```bash
# View logs
flyctl logs --app chainsync-backend-winter-sound-6706

# Check status
flyctl status --app chainsync-backend-winter-sound-6706

# SSH into machine
flyctl ssh console --app chainsync-backend-winter-sound-6706

# Update secrets
flyctl secrets set KEY=value --app chainsync-backend-winter-sound-6706
```

### Django
```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic
```

---

## ✅ Verification Checklist

- [ ] Backend running locally
- [ ] Frontend connects to localhost
- [ ] Can login successfully
- [ ] Production API accessible
- [ ] All endpoints respond correctly
- [ ] Files upload to Cloudinary
- [ ] AI features working

---

## 🆘 Troubleshooting

**Connection refused**:
```bash
# Check if backend is running
curl http://172.16.30.89:8000/admin/
```

**CORS error**:
- Development: `CORS_ALLOW_ALL_ORIGINS=True` (default)
- Production: Add your domain to `CORS_ALLOWED_ORIGINS`

**Environment not switching**:
```bash
# Clear Expo cache
cd main-app
npx expo start -c
```

---

## 📚 Documentation

- **Full Deployment Guide**: See `DEPLOYMENT_SUCCESS.md`
- **API Docs**: https://chainsync-backend-winter-sound-6706.fly.dev/api/docs/
- **Admin Panel**: https://chainsync-backend-winter-sound-6706.fly.dev/admin/

---

**Need help?** Check logs or contact the team!
