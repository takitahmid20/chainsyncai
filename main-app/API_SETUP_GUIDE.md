# ChainSync AI - React Native App Setup

## 🚀 Production-Ready API Integration

### Architecture Overview

```
main-app/
├── config/
│   └── api.ts              # Centralized API configuration & endpoints
├── services/
│   ├── apiClient.ts        # Axios instance with interceptors
│   └── authService.ts      # Authentication API calls
├── utils/
│   └── tokenStorage.ts     # Secure token management
├── app/
│   ├── signup.tsx          # Signup screen with API integration
│   ├── otp-verification.tsx # Email verification screen
│   └── signin.tsx          # Sign in screen
└── .env                    # Environment variables (DO NOT COMMIT)
```

---

## 📦 Installed Packages

- **axios**: HTTP client for API requests
- **@react-native-async-storage/async-storage**: Secure token storage
- **react-native-dotenv**: Environment variable management

---

## ⚙️ Configuration

### 1. Environment Setup

Create `.env` file in `main-app/` directory:

```env
API_BASE_URL=http://YOUR_IP_ADDRESS:8000
API_TIMEOUT=30000
APP_ENV=development
```

**Important**: Replace `YOUR_IP_ADDRESS` with:
- Your computer's local IP (for testing on physical device)
- `127.0.0.1` (for iOS simulator)
- `10.0.2.2` (for Android emulator)

### 2. Find Your IP Address

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```cmd
ipconfig
```

Look for IPv4 Address (usually starts with `192.168.x.x` or `10.0.x.x`)

---

## 🔧 API Configuration

### API Endpoints (`config/api.ts`)

All endpoints are centralized:

```typescript
API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/api/auth/signup/',
    VERIFY_EMAIL: '/api/auth/verify-email/',
    LOGIN: '/api/auth/login/',
    REFRESH_TOKEN: '/api/auth/token/refresh/',
  },
  PROFILE: {
    RETAILER: '/api/retailers/profile/',
    SUPPLIER: '/api/suppliers/profile/',
  },
  PRODUCTS: {
    SUPPLIER_LIST: '/api/products/supplier/products/',
    RETAILER_LIST: '/api/products/retailer/products/',
    // ... more endpoints
  },
  // ... more feature endpoints
}
```

---

## 🔐 Security Features

### 1. Token Management (`utils/tokenStorage.ts`)

- Secure storage using AsyncStorage
- Auto token refresh on 401 errors
- Clean logout with token removal

```typescript
// Save tokens after login
await tokenStorage.saveTokens(accessToken, refreshToken);

// Get current token
const token = await tokenStorage.getAccessToken();

// Logout (clear all data)
await tokenStorage.clearAuth();
```

### 2. API Client (`services/apiClient.ts`)

**Request Interceptor:**
- Automatically adds `Authorization: Bearer <token>` to all requests
- Logs requests in development mode

**Response Interceptor:**
- Auto token refresh on 401 Unauthorized
- Standardized error handling
- Development logging

---

## 📱 Usage Examples

### Signup Flow

```typescript
import { authService } from '../services/authService';

const handleSignup = async () => {
  try {
    const response = await authService.signup({
      email: 'user@example.com',
      password: '123456',
      user_type: 'retailer',
    });
    
    // Navigate to verification screen
    router.push('/otp-verification');
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

### Login Flow

```typescript
const handleLogin = async () => {
  try {
    const response = await authService.login({
      email: 'user@example.com',
      password: '123456',
    });
    
    // Tokens automatically saved
    // Navigate to home screen
    router.replace('/home');
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

### Making Authenticated Requests

```typescript
import apiClient from '../services/apiClient';
import { API_ENDPOINTS } from '../config/api';

// Get products (token automatically added)
const getProducts = async () => {
  const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.RETAILER_LIST);
  return response.data;
};
```

---

## 🧪 Testing

### 1. Start Backend Server

```bash
cd backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

### 2. Update Frontend .env

```env
API_BASE_URL=http://YOUR_IP:8000
```

### 3. Start Expo App

```bash
cd main-app
npm start
```

### 4. Test Signup Flow

1. Open app on device/simulator
2. Navigate to Signup screen
3. Enter email and 6-digit password
4. Select user type (Retailer/Supplier)
5. Click "Sign Up"
6. Check email for verification link
7. Verify email
8. Login with credentials

---

## 🐛 Common Issues

### Issue 1: Network Error

**Problem**: `Network Error` when making API calls

**Solution**:
1. Ensure backend is running on `0.0.0.0:8000`
2. Update `.env` with correct IP address
3. Check firewall settings
4. Verify device/simulator is on same network

### Issue 2: CORS Errors

**Problem**: CORS policy blocking requests

**Solution**: Update Django `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:8081',
    'http://YOUR_IP:8081',
]
```

### Issue 3: Token Refresh Fails

**Problem**: Infinite refresh loop or logout

**Solution**:
- Check JWT token lifetime in backend settings
- Verify refresh token endpoint is working
- Clear app data and try fresh login

---

## 📝 Environment Variables

### Development

```env
API_BASE_URL=http://192.168.1.100:8000
API_TIMEOUT=30000
APP_ENV=development
```

### Production

```env
API_BASE_URL=https://api.chainsync.com
API_TIMEOUT=30000
APP_ENV=production
```

---

## 🔄 API Client Features

✅ **Automatic token injection**
✅ **Auto token refresh on expiry**
✅ **Centralized error handling**
✅ **Request/response logging (dev mode)**
✅ **Timeout handling**
✅ **Network error detection**
✅ **Type-safe endpoints**

---

## 📚 Next Steps

1. ✅ Signup API integration - **DONE**
2. ⬜ Login screen API integration
3. ⬜ Profile completion screens
4. ⬜ Product listing screens
5. ⬜ Cart functionality
6. ⬜ Order management

---

## 🎯 Best Practices

1. **Never commit `.env` file** - Added to `.gitignore`
2. **Use environment variables** - Don't hardcode API URLs
3. **Handle errors gracefully** - Show user-friendly messages
4. **Test on real devices** - Simulators have different network configs
5. **Log in development** - Use `__DEV__` flag for conditional logging
6. **Type safety** - Use TypeScript interfaces for API responses
7. **Token security** - Never log tokens in production

---

## 📞 Support

For issues or questions:
- Check backend logs: `python manage.py runserver`
- Check React Native logs: Metro bundler console
- Use React Native Debugger for network inspection

---

**Last Updated**: November 26, 2025
**Status**: ✅ Ready for development
