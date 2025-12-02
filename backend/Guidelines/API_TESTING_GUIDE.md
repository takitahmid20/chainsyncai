# ChainSync API - Complete Testing Guide

## Server: `http://127.0.0.1:8000`

---

## 🔐 Authentication Flow

### 1. Register (Signup)
**POST** `/api/auth/register/`

**Body:**
```json
{
    "email": "retailer1@test.com",
    "password": "123456",
    "user_type": "retailer"
}
```

**Response (201):**
```json
{
    "message": "Signup successful! Please check your email to verify your account.",
    "email": "retailer1@test.com",
    "user_type": "retailer"
}
```

---

### 2. Verify Email
**POST** `/api/auth/verify-email/`

**Body:**
```json
{
    "token": "TOKEN_FROM_DATABASE_OR_EMAIL"
}
```

**OR GET:** `/api/auth/verify-email/?token=TOKEN_HERE`

**Response (200):**
```json
{
    "message": "Email verified successfully! You can now login.",
    "email": "retailer1@test.com"
}
```

---

### 3. Login
**POST** `/api/auth/login/`

**Body:**
```json
{
    "email": "retailer1@test.com",
    "password": "123456"
}
```

**Response (200):**
```json
{
    "message": "Login successful",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "email": "retailer1@test.com",
        "user_type": "retailer",
        "is_profile_complete": false
    }
}
```

**Save the `access` token for authenticated requests!**

---

### 4. Check Profile Status
**GET** `/api/auth/profile-status/`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response (200):**
```json
{
    "user_type": "retailer",
    "is_profile_complete": false,
    "profile": null
}
```

---

## 👤 Retailer Profile

### Get Profile
**GET** `/api/retailers/profile/`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response if not created (404):**
```json
{
    "message": "Profile not created yet"
}
```

---

### Create Retailer Profile
**POST** `/api/retailers/profile/`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
    "shop_name": "ABC General Store",
    "owner_name": "John Doe",
    "shop_address": "123 Main Street, Dhaka",
    "business_category": "grocery"
}
```

**Valid `business_category` values:**
- `grocery`
- `pharmacy`
- `cosmetics`
- `electronics`
- `general_store`
- `online`

**Response (201):**
```json
{
    "message": "Profile created successfully",
    "profile": {
        "id": 1,
        "shop_name": "ABC General Store",
        "owner_name": "John Doe",
        "shop_address": "123 Main Street, Dhaka",
        "business_category": "grocery",
        "is_profile_complete": true,
        "created_at": "2025-11-25T04:52:30.123Z",
        "updated_at": "2025-11-25T04:52:30.123Z"
    }
}
```

---

### Update Retailer Profile
**PUT** `/api/retailers/profile/`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Body (can update any field):**
```json
{
    "shop_name": "ABC Super Store",
    "business_category": "general_store"
}
```

**Response (200):**
```json
{
    "message": "Profile updated successfully",
    "profile": { ... }
}
```

---

## 🏭 Supplier Profile

### Create Supplier Profile
**POST** `/api/suppliers/profile/`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
    "business_name": "XYZ Distributors Ltd.",
    "supplier_type": "wholesaler",
    "business_address": "456 Industrial Area, Chittagong",
    "main_product_category": "FMCG Products"
}
```

**Valid `supplier_type` values:**
- `wholesaler`
- `distributor`
- `manufacturer`

**Response (201):**
```json
{
    "message": "Profile created successfully",
    "profile": {
        "id": 1,
        "business_name": "XYZ Distributors Ltd.",
        "supplier_type": "wholesaler",
        "business_address": "456 Industrial Area, Chittagong",
        "main_product_category": "FMCG Products",
        "is_profile_complete": true,
        "created_at": "2025-11-25T04:52:30.123Z",
        "updated_at": "2025-11-25T04:52:30.123Z"
    }
}
```

---

### Get Supplier Profile
**GET** `/api/suppliers/profile/`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

### Update Supplier Profile
**PUT** `/api/suppliers/profile/`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Body (can update any field):**
```json
{
    "supplier_type": "distributor",
    "main_product_category": "Food & Beverage"
}
```

---

## 🧪 Complete Testing Flow

### For Retailer:

1. **Register** → POST `/api/auth/register/` with `user_type: "retailer"`
2. **Verify** → POST `/api/auth/verify-email/` with token (or use Django admin)
3. **Login** → POST `/api/auth/login/` → Save access token
4. **Check Status** → GET `/api/auth/profile-status/` (should show `is_profile_complete: false`)
5. **Create Profile** → POST `/api/retailers/profile/` with all 4 fields
6. **Check Status Again** → GET `/api/auth/profile-status/` (should show `is_profile_complete: true`)
7. **Get Profile** → GET `/api/retailers/profile/`
8. **Update Profile** → PUT `/api/retailers/profile/`

### For Supplier:

1. **Register** → POST `/api/auth/register/` with `user_type: "supplier"`
2. **Verify** → POST `/api/auth/verify-email/`
3. **Login** → POST `/api/auth/login/` → Save access token
4. **Create Profile** → POST `/api/suppliers/profile/` with all 4 fields
5. **Check Status** → GET `/api/auth/profile-status/`
6. **Get Profile** → GET `/api/suppliers/profile/`

---

## 📋 Quick Reference

### All Endpoints:

**Auth (No token needed):**
- POST `/api/auth/register/`
- POST `/api/auth/verify-email/`
- POST `/api/auth/resend-verification/`
- POST `/api/auth/login/`
- POST `/api/auth/token/` (JWT token)
- POST `/api/auth/token/refresh/` (Refresh JWT)

**Auth (Token required):**
- GET `/api/auth/profile-status/`

**Retailer (Token required, retailer only):**
- GET `/api/retailers/profile/`
- POST `/api/retailers/profile/`
- PUT `/api/retailers/profile/`

**Supplier (Token required, supplier only):**
- GET `/api/suppliers/profile/`
- POST `/api/suppliers/profile/`
- PUT `/api/suppliers/profile/`

---

## ⚠️ Common Errors

### 403 Forbidden - Not verified
```json
{
    "error": "Please verify your email before logging in",
    "email": "user@test.com"
}
```

### 403 Forbidden - Wrong user type
```json
{
    "error": "Only retailers can access this endpoint"
}
```

### 400 Bad Request - Profile already exists
```json
{
    "error": "Profile already exists. Use PUT to update."
}
```

### 404 Not Found - Profile not created
```json
{
    "message": "Profile not created yet"
}
```

---

## 🎯 Testing in Postman

### Create a Postman Collection:

1. **Create Environment Variables:**
   - `base_url`: `http://127.0.0.1:8000`
   - `access_token`: (will be set after login)

2. **After Login, set token:**
   - Go to Tests tab in login request
   - Add script:
   ```javascript
   pm.environment.set("access_token", pm.response.json().access);
   ```

3. **Use token in other requests:**
   - Authorization tab → Type: Bearer Token
   - Token: `{{access_token}}`

---

## 🔑 Admin Panel

**URL:** `http://127.0.0.1:8000/admin/`

**Credentials:**
- Email: `admin@chainsync.ai`
- Password: `123456`

You can manually verify users and view profiles here.

---

## ✅ Status Check

- ✅ User Registration with 6-digit password
- ✅ Email verification
- ✅ Login with JWT tokens
- ✅ Profile completion check
- ✅ Retailer profile (4 fields)
- ✅ Supplier profile (4 fields)
- ✅ NeonDB PostgreSQL connected
- ✅ Mailjet email configured
