# Daily Sales API Documentation

## Overview
Track daily shop sales, automatically deduct stock, and view sales analytics.

## Endpoints

### 1. Record a Sale (Deduct Stock)
**POST** `/api/sales/record/`

Records a sale and automatically deducts stock from inventory.

**Request Body:**
```json
{
    "product": 1,
    "quantity_sold": 2,
    "unit_price": 150.00,           // Optional - defaults to product price
    "payment_method": "cash",        // cash, card, mobile, credit
    "customer_name": "John Doe",     // Optional
    "notes": "Regular customer"      // Optional
}
```

**Response:**
```json
{
    "success": true,
    "message": "Sale recorded successfully",
    "sale": {
        "id": 1,
        "product": 1,
        "product_name": "Coca Cola 500ml",
        "product_sku": "CC-500",
        "quantity_sold": 2,
        "unit_price": "150.00",
        "total_amount": "300.00",
        "payment_method": "cash",
        "customer_name": "John Doe",
        "notes": "Regular customer",
        "sale_date": "2025-12-02",
        "created_at": "2025-12-02T10:30:00Z"
    },
    "remaining_stock": 48
}
```

**Example:**
```bash
curl -X POST http://172.16.30.89:8000/api/sales/record/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product": 222,
    "quantity_sold": 2,
    "payment_method": "cash"
  }'
```

---

### 2. Get Daily Sales List
**GET** `/api/sales/daily/`

Get list of sales for a specific date or date range.

**Query Parameters:**
- `date` - Specific date (YYYY-MM-DD)
- `start_date` & `end_date` - Date range
- No params = Today's sales

**Examples:**
```bash
# Today's sales
GET /api/sales/daily/

# Specific date
GET /api/sales/daily/?date=2025-12-02

# Date range
GET /api/sales/daily/?start_date=2025-12-01&end_date=2025-12-07
```

**Response:**
```json
[
    {
        "id": 1,
        "product": 1,
        "product_name": "Coca Cola 500ml",
        "product_sku": "CC-500",
        "quantity_sold": 2,
        "unit_price": "150.00",
        "total_amount": "300.00",
        "payment_method": "cash",
        "customer_name": "John Doe",
        "sale_date": "2025-12-02",
        "created_at": "2025-12-02T10:30:00Z"
    }
]
```

---

### 3. Get Sales Summary
**GET** `/api/sales/summary/`

Get daily sales summary with totals.

**Query Parameters:**
- `date` - Specific date
- `start_date` & `end_date` - Date range
- No params = Last 7 days

**Examples:**
```bash
# Last 7 days
GET /api/sales/summary/

# Specific date
GET /api/sales/summary/?date=2025-12-02

# Date range (last 30 days)
GET /api/sales/summary/?start_date=2025-11-02&end_date=2025-12-02
```

**Response:**
```json
[
    {
        "id": 1,
        "sale_date": "2025-12-02",
        "total_sales": 15,
        "total_items_sold": 42,
        "total_revenue": "6450.00",
        "total_cash": "4200.00",
        "total_card": "1500.00",
        "total_mobile": "750.00",
        "total_credit": "0.00",
        "updated_at": "2025-12-02T18:45:00Z"
    }
]
```

---

### 4. Get Sales Analytics
**GET** `/api/sales/analytics/`

Get detailed analytics with top products and payment breakdown.

**Query Parameters:**
- `days` - Number of days to analyze (default: 7)

**Example:**
```bash
# Last 30 days analytics
GET /api/sales/analytics/?days=30
```

**Response:**
```json
{
    "period": {
        "start_date": "2025-11-02",
        "end_date": "2025-12-02",
        "days": 30
    },
    "overall": {
        "total_sales": 450,
        "total_revenue": 67500.50,
        "total_items_sold": 1250,
        "average_sale_value": 150.00
    },
    "payment_breakdown": {
        "cash": 45000.00,
        "card": 15000.00,
        "mobile": 7500.00,
        "credit": 0.00
    },
    "top_products": [
        {
            "product__id": 1,
            "product__name": "Coca Cola 500ml",
            "product__sku": "CC-500",
            "total_quantity": 120,
            "total_revenue": 18000.00,
            "sales_count": 60
        }
    ],
    "daily_summary": [...]
}
```

---

## Use Cases

### Scenario: Customer buys 2 Coca Cola bottles

1. **Check Product Stock:**
   ```bash
   GET /api/products/retailer/products/
   # Find product ID and current stock
   ```

2. **Record Sale:**
   ```bash
   POST /api/sales/record/
   {
       "product": 1,
       "quantity_sold": 2,
       "payment_method": "cash"
   }
   ```

3. **Result:**
   - ✅ Sale recorded in database
   - ✅ Stock automatically reduced by 2
   - ✅ Daily summary updated
   - ✅ Can be used for AI forecasting

---

## Benefits

✅ **Automatic Stock Management** - No manual stock updates needed
✅ **Daily Sales Tracking** - Track every sale with customer info
✅ **Multiple Payment Methods** - Cash, card, mobile banking, credit
✅ **Sales Analytics** - View trends, top products, revenue
✅ **AI Integration** - Data feeds into demand forecasting
✅ **Performance Reports** - Daily, weekly, monthly summaries

---

## Authentication

All endpoints require authentication:
```bash
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Get token from:
```bash
POST /api/auth/signin/
{
    "email": "retailer@example.com",
    "password": "password123"
}
```
