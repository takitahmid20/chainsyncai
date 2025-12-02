# Gemini AI Demand Forecasting - Setup & Testing Guide

## Overview
The demand forecasting system uses Google's Gemini AI to analyze 90-day sales history and predict future product demand. It provides actionable recommendations for reordering.

---

## Setup Steps

### 1. Install Required Packages

```bash
cd backend
source venv/bin/activate  # Activate virtual environment
pip install drf-spectacular google-generativeai
```

This will install:
- `drf-spectacular==0.29.0` (API documentation)
- `google-generativeai==0.8.3` (Gemini AI SDK)

### 2. Get Gemini API Key

1. Go to **Google AI Studio**: https://makersuite.google.com/app/apikey
2. Click **"Get API Key"** or **"Create API Key"**
3. Create a new API key (or use existing one)
4. Copy the API key (starts with `AIza...`)

### 3. Add API Key to Environment

Open `backend/.env` and add:

```env
GEMINI_API_KEY=AIzaSy... your-actual-key-here
```

**Important**: Do NOT commit this key to git. The `.env` file should already be in `.gitignore`.

### 4. Run Migrations (if needed)

```bash
source venv/bin/activate
python manage.py migrate
```

### 5. Start the Development Server

```bash
source venv/bin/activate
python manage.py runserver
```

Server should be running at `http://localhost:8000`

---

## API Endpoint

**URL**: `POST http://localhost:8000/api/ai/demand-forecast/`

**Authentication**: Required (JWT token)

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

---

## Testing with Postman

### Step 1: Get Authentication Token

**Create Sign In Request:**

1. Create a new request in Postman
2. Set method to **POST**
3. URL: `http://localhost:8000/api/auth/signin/`
4. Go to **Headers** tab:
   - Key: `Content-Type`, Value: `application/json`
5. Go to **Body** tab:
   - Select **raw**
   - Select **JSON** from dropdown
   - Enter:
   ```json
   {
     "email": "retailer@test.com",
     "password": "password123"
   }
   ```
6. Click **Send**

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Copy the `access` token** - you'll need it for the next request.

---

### Step 2: Test Demand Forecast

**Create Demand Forecast Request:**

1. Create a new request in Postman
2. Set method to **POST**
3. URL: `http://localhost:8000/api/ai/demand-forecast/`
4. Go to **Headers** tab, add:
   - Key: `Content-Type`, Value: `application/json`
   - Key: `Authorization`, Value: `Bearer YOUR_ACCESS_TOKEN_HERE`
     - Replace `YOUR_ACCESS_TOKEN_HERE` with the actual token from Step 1
5. Go to **Body** tab:
   - Select **raw**
   - Select **JSON** from dropdown
   
**Example 1: 30-day forecast for Product ID 1**
```json
{
  "product_id": 1,
  "forecast_days": 30
}
```

**Example 2: 7-day forecast**
```json
{
  "product_id": 5,
  "forecast_days": 7
}
```

**Example 3: 90-day forecast**
```json
{
  "product_id": 10,
  "forecast_days": 90
}
```

6. Click **Send**

---

## Expected Response Format

```json
{
  "product_id": 1,
  "product_name": "Fresh Milk 1L",
  "current_price": "250.00",
  "current_stock": 45,
  "forecast_period_days": 30,
  "generated_at": "2025-01-27T10:30:00Z",
  
  "forecast_summary": {
    "predicted_total_demand": 180,
    "predicted_daily_average": 6.0,
    "confidence_level": "high",
    "trend": "stable"
  },
  
  "recommendations": {
    "should_reorder": true,
    "suggested_order_quantity": 150,
    "reorder_urgency": "soon",
    "estimated_stockout_date": "2025-02-15",
    "risk_assessment": "medium"
  },
  
  "weekly_forecast": [
    {
      "week": 1,
      "predicted_demand": 42,
      "min_demand": 35,
      "max_demand": 50
    },
    {
      "week": 2,
      "predicted_demand": 45,
      "min_demand": 38,
      "max_demand": 52
    }
    // ... more weeks
  ],
  
  "insights": [
    "Product shows consistent demand based on 90-day history",
    "Current stock will last approximately 7 days at predicted rate",
    "Recommend ordering within 2 weeks to avoid stockout"
  ],
  
  "factors_considered": [
    "90-day sales history",
    "Current inventory levels",
    "Historical demand patterns",
    "Seasonal trends"
  ]
}
```

---

## Field Explanations

### Request Fields

| Field | Type | Required | Range | Description |
|-------|------|----------|-------|-------------|
| `product_id` | integer | ✅ Yes | > 0 | Product to forecast |
| `forecast_days` | integer | No (default: 30) | 7-90 | Days to forecast |

### Response Fields

**forecast_summary**:
- `predicted_total_demand`: Total units expected to sell in forecast period
- `predicted_daily_average`: Average units per day
- `confidence_level`: `high` / `medium` / `low` (AI's confidence in prediction)
- `trend`: `increasing` / `stable` / `decreasing`

**recommendations**:
- `should_reorder`: `true` if reorder recommended, `false` otherwise
- `suggested_order_quantity`: How many units to order
- `reorder_urgency`: `urgent` / `soon` / `normal` / `not_needed`
- `estimated_stockout_date`: When stock will run out (if applicable)
- `risk_assessment`: `high` / `medium` / `low` stockout risk

**weekly_forecast**: Week-by-week breakdown with min/max demand ranges

---

## Testing Different Scenarios in Postman

### Scenario 1: Low Stock + High Demand (Should Trigger Reorder)

1. First, check which products have low stock:
   - **GET** `http://localhost:8000/api/products/`
   - Add header: `Authorization: Bearer YOUR_TOKEN`
   - Look for products with low `stock_quantity` (< 50 units)

2. Forecast demand for a low-stock product:
   - **POST** `http://localhost:8000/api/ai/demand-forecast/`
   - Headers: `Content-Type: application/json`, `Authorization: Bearer YOUR_TOKEN`
   - Body:
   ```json
   {
     "product_id": 12,
     "forecast_days": 30
   }
   ```

**Expected Response:** `should_reorder: true`, `reorder_urgency: urgent` or `soon`

---

### Scenario 2: High Stock + Low Demand (No Reorder Needed)

Find a product with high stock and forecast:
- Body:
```json
{
  "product_id": 45,
  "forecast_days": 30
}
```

**Expected Response:** `should_reorder: false`, `reorder_urgency: not_needed`

---

### Scenario 3: New Product (Limited Sales History)

Test with a product that has few orders:
- Body:
```json
{
  "product_id": 200,
  "forecast_days": 7
}
```

**Expected Response:** `confidence_level: low`, more conservative recommendations

---

## Postman Collection Setup (Optional)

### Create a Collection

1. In Postman, click **Collections** → **Create Collection**
2. Name it "ChainSync AI"
3. Add folder "Authentication"
4. Add folder "AI Forecasting"

### Set Collection Variables

1. Click on your collection → **Variables** tab
2. Add these variables:
   - `base_url`: `http://localhost:8000`
   - `access_token`: (leave empty, will be set automatically)

### Create Requests

**1. Sign In Request:**
- Method: POST
- URL: `{{base_url}}/api/auth/signin/`
- Body:
```json
{
  "email": "retailer@test.com",
  "password": "password123"
}
```
- **Tests** tab (auto-save token):
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set("access_token", response.access);
}
```

**2. Demand Forecast Request:**
- Method: POST
- URL: `{{base_url}}/api/ai/demand-forecast/`
- Headers: `Authorization: Bearer {{access_token}}`
- Body:
```json
{
  "product_id": 1,
  "forecast_days": 30
}
```

Now you can:
1. Run "Sign In" once to get token (auto-saved)
2. Run "Demand Forecast" multiple times with different product IDs

---

## Troubleshooting

### Error: "GEMINI_API_KEY not found"

**Problem**: API key not set in environment

**Solution**:
1. Check `.env` file exists in `backend/` folder
2. Open `backend/.env` and verify:
   ```
   GEMINI_API_KEY=AIzaSy...your-key-here
   ```
3. Restart the Django server:
   ```bash
   source venv/bin/activate
   python manage.py runserver
   ```

---

### Error: "Product does not exist"

**Problem**: Invalid product_id in request

**Solution**: 
1. Get list of available products in Postman:
   - **GET** `http://localhost:8000/api/products/`
   - Header: `Authorization: Bearer YOUR_TOKEN`
2. Use a valid `product_id` from the response

---

### Error: "Authentication credentials were not provided"

**Problem**: Missing or invalid JWT token

**Solution**:
1. Get a fresh token in Postman:
   - **POST** `http://localhost:8000/api/auth/signin/`
   - Body: `{"email": "retailer@test.com", "password": "password123"}`
2. Copy the `access` token from response
3. In your forecast request, go to **Headers** tab
4. Update `Authorization` header: `Bearer YOUR_NEW_TOKEN`

---

### Error: "No sales history available"

**Problem**: Product has no order history

**Solution**: Use a product with existing orders (IDs 1-50 should have data from seeding)

---

### Error: "Invalid forecast_days"

**Problem**: forecast_days not in range 7-90

**Solution**: Use a value between 7 and 90:
```json
{
  "product_id": 1,
  "forecast_days": 30
}
```

---

### Token Expired Error

**Problem**: JWT token expired (48-hour lifetime)

**Solution**: Sign in again to get a new token (see Step 1 above)

---

## What the AI Analyzes

The Gemini AI considers:

1. **Sales History (90 days)**:
   - Daily order quantities
   - Revenue trends
   - Purchase patterns

2. **Current Inventory**:
   - Stock on hand
   - Reorder level
   - Low stock status

3. **Product Information**:
   - Product name
   - Category
   - Current price

4. **Seasonal Patterns**:
   - Day of week trends
   - Monthly variations

The AI then generates:
- Demand predictions with confidence levels
- Reorder recommendations (yes/no + quantity)
- Risk assessment (stockout probability)
- Actionable insights in plain English

---

## Next Steps: Auto-Order System

Once demand forecasting is working, you can build:

### 1. Auto-Order Detection
```python
# Check if product needs auto-order
forecast = DemandForecastService.forecast_product_demand(product_id, 30)

if forecast['recommendations']['should_reorder'] and forecast['current_stock'] < 50:
    # Trigger auto-order notification
    create_auto_order_suggestion(product_id, forecast)
```

### 2. One-Click Approval UI
- Display forecast summary
- Show recommended quantity
- "Approve Order" button
- Automatically create purchase order when approved

### 3. Loan Suggestion
- Analyze total order cost
- Compare to available balance
- Suggest loan if needed

---

## API Documentation

Once server is running, view full API docs:

**Swagger UI**: http://localhost:8000/api/schema/swagger-ui/

**ReDoc**: http://localhost:8000/api/schema/redoc/

---

## Questions?

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify API key is correct and has quota remaining
3. Ensure product has sales history (use seeded products 1-50)
4. Check JWT token is valid (not expired)

For testing, use products with IDs 1-50 as they have seeded order history.
