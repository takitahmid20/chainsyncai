# ChainSync API - Postman Testing Guide

## Server Information
- **Base URL**: `http://127.0.0.1:8000`
- **Database**: NeonDB (PostgreSQL)
- **Server Status**: ✅ Running

---

## Authentication Endpoints

### 1. User Signup (Register)

**Endpoint**: `POST http://127.0.0.1:8000/api/auth/register/`

**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
    "email": "retailer@example.com",
    "password": "123456",
    "user_type": "retailer"
}
```

**Valid user_type values**:
- `retailer`
- `supplier`
- `admin`

**Expected Response** (201 Created):
```json
{
    "message": "Signup successful! Please check your email to verify your account.",
    "email": "retailer@example.com",
    "user_type": "retailer"
}
```

**Notes**:
- Password MUST be exactly 6 digits
- Email must be unique
- Verification email will be sent (if Mailjet credentials are configured)

---

### 2. Email Verification

**Endpoint**: `GET http://127.0.0.1:8000/api/auth/verify-email/?token=YOUR_TOKEN_HERE`

**Method**: GET

**Query Parameters**:
- `token`: The verification token from the email

**Alternative** (POST method):
```
POST http://127.0.0.1:8000/api/auth/verify-email/
```

**Body** (raw JSON):
```json
{
    "token": "YOUR_TOKEN_HERE"
}
```

**Expected Response** (200 OK):
```json
{
    "message": "Email verified successfully! You can now login.",
    "email": "retailer@example.com"
}
```

---

### 3. Resend Verification Email

**Endpoint**: `POST http://127.0.0.1:8000/api/auth/resend-verification/`

**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
    "email": "retailer@example.com"
}
```

**Expected Response** (200 OK):
```json
{
    "message": "Verification email sent successfully"
}
```

---

## JWT Token Endpoints

### 4. Get JWT Token (Login)

**Endpoint**: `POST http://127.0.0.1:8000/api/auth/token/`

**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
    "email": "retailer@example.com",
    "password": "123456"
}
```

**Expected Response** (200 OK):
```json
{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 5. Refresh JWT Token

**Endpoint**: `POST http://127.0.0.1:8000/api/auth/token/refresh/`

**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Expected Response** (200 OK):
```json
{
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Testing Flow

### Complete Signup & Login Flow:

1. **Register a new user**
   - POST to `/api/auth/register/`
   - Use 6-digit password (e.g., "123456")
   - Choose user_type: "retailer" or "supplier"

2. **Verify email** (Two options):
   
   **Option A**: Manual verification (skip email)
   - Open Django admin: `http://127.0.0.1:8000/admin/`
   - Login with superuser credentials
   - Find the user and mark `is_verified = True`

   **Option B**: Use verification endpoint
   - Get the token from database or email
   - Call `/api/auth/verify-email/?token=TOKEN`

3. **Login to get JWT tokens**
   - POST to `/api/auth/token/`
   - Save the access and refresh tokens

4. **Make authenticated requests**
   - Add header: `Authorization: Bearer YOUR_ACCESS_TOKEN`

---

## Error Responses

### Invalid Password (not 6 digits):
```json
{
    "password": [
        "Password must be exactly 6 digits"
    ]
}
```

### Duplicate Email:
```json
{
    "email": [
        "user with this email already exists."
    ]
}
```

### Invalid User Type:
```json
{
    "user_type": [
        "\"invalid\" is not a valid choice."
    ]
}
```

### Invalid Verification Token:
```json
{
    "error": "Invalid or expired verification token"
}
```

---

## Quick Test Commands

### Create Superuser (for Django admin):
```bash
cd '/Volumes/TakiTahmid/Daily Work/1. ChainSync AI/chainsyncai/backend'
source venv/bin/activate
python manage.py createsuperuser
```

### Check Server Status:
```bash
curl http://127.0.0.1:8000/api/auth/register/
```

---

## Environment Variables Required

Add these to `/backend/.env`:

```env
# Mailjet (for sending verification emails)
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_SECRET_KEY=your_mailjet_secret_key
MAILJET_SENDER_EMAIL=noreply@chainsync.ai
MAILJET_SENDER_NAME=ChainSync AI

# Frontend URL (for verification links)
FRONTEND_URL=http://localhost:8081
```

**Note**: Without Mailjet credentials, signup will still work but emails won't be sent. You'll need to manually verify users through Django admin.

---

## Current Implementation Status

✅ **Completed**:
- User signup with 6-digit password validation
- Email verification system
- JWT token authentication
- NeonDB PostgreSQL connection
- User model with retailer/supplier types

⏳ **To Do** (not implemented yet):
- Login endpoint logic (use JWT token endpoint for now)
- Other 11 apps functionality
- Frontend API integration

---

## Need Help?

Server running at: **http://127.0.0.1:8000**

Admin panel: **http://127.0.0.1:8000/admin/**

API endpoints prefix: **/api/auth/**
