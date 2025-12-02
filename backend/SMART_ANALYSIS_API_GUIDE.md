# Smart Product Analysis API - Postman Testing Guide

## 🎯 Overview

The Smart Product Analysis API automatically analyzes **ALL** retailer products using LightGBM AI and provides:
- 📊 Demand scoring for every product (0-100 scale)
- 🔥 High-demand product identification
- 📦 Smart reorder recommendations
- ⚠️ Low stock alerts
- 💡 AI-powered insights

**No product ID required** - just authenticate and get comprehensive analysis!

---

## 📮 API Endpoint

```
POST http://172.16.30.89:8000/api/ai/analysis/smart/
```

---

## 🔐 Step 1: Authentication

### Login Request

**Method:** `POST`  
**URL:** `http://172.16.30.89:8000/api/auth/login/`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "takitahmid25+retailer@gmail.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "takitahmid25+retailer@gmail.com",
    "user_type": "retailer"
  }
}
```

**Action:** Copy the `access` token.

---

## 🤖 Step 2: Smart Product Analysis

### Request Setup

**Method:** `POST`  
**URL:** `http://172.16.30.89:8000/api/ai/analysis/smart/`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <YOUR_ACCESS_TOKEN>
```

**Body (raw JSON):**
```json
{
  "forecast_days": 30,
  "top_products": 5
}
```

**Parameters (Optional):**
- `forecast_days` (default: 30) - Days to forecast ahead
- `top_products` (default: 10) - Number of top products to highlight

---

## 📊 Sample Response

```json
{
  "retailer_id": 7,
  "analysis_date": "2025-12-02T16:14:12.508734+00:00",
  "forecast_period_days": 30,
  
  "summary": {
    "total_products_analyzed": 5,
    "high_demand_products_count": 2,
    "products_need_reorder": 3,
    "critical_low_stock_count": 1,
    "average_demand_score": 45.8,
    "total_reorder_value": 1250.50,
    "currency": "BDT"
  },
  
  "top_demand_products": [
    {
      "product_id": 223,
      "product_name": "Eggs - Swift Commerce Ltd.",
      "supplier_name": "Swift Commerce",
      "current_stock": 3,
      "unit_price": 145.0,
      "demand_score": 85,
      "urgency_score": 70,
      "predicted_demand_30d": 45.5,
      "daily_avg_demand": 1.52,
      "confidence_level": "high",
      "should_reorder": true,
      "suggested_order_qty": 42,
      "estimated_stockout_date": "2025-12-05",
      "days_until_stockout": 3,
      "reorder_urgency": "urgent",
      "trend": "increasing"
    }
  ],
  
  "reorder_recommendations": [
    {
      "product_id": 223,
      "product_name": "Eggs",
      "urgency_score": 95,
      "suggested_order_qty": 42,
      "days_until_stockout": 3
    }
  ],
  
  "low_stock_alerts": [
    {
      "product_id": 223,
      "product_name": "Eggs",
      "current_stock": 3,
      "days_until_stockout": 3,
      "reorder_urgency": "urgent"
    }
  ],
  
  "all_products": [
    // Complete list of all analyzed products
  ],
  
  "insights": {
    "highest_demand_product": {
      "product_id": 223,
      "product_name": "Eggs",
      "demand_score": 85
    },
    "most_urgent_reorder": {
      "product_id": 223,
      "estimated_stockout_date": "2025-12-05"
    },
    "most_critical_stock": {
      "product_id": 223,
      "days_until_stockout": 3
    },
    "recommendation": "🚨 URGENT: 1 products critically low on stock. Immediate action required! 📦 3 products need reordering to maintain optimal inventory levels. ⭐ Top performer: 'Eggs' with demand score 85/100."
  }
}
```

---

## 📈 Understanding the Response

### Summary Section
- **total_products_analyzed**: Total products with sufficient data (14+ days sales history)
- **high_demand_products_count**: Products with demand score ≥ 60
- **products_need_reorder**: Products that should be reordered soon
- **critical_low_stock_count**: Products with urgency score ≥ 70
- **average_demand_score**: Average demand across all products
- **total_reorder_value**: Total cost to fulfill all reorder recommendations

### Product Metrics
- **demand_score** (0-100): How demandable the product is
  - 80-100: Very High Demand 🔥
  - 60-79: High Demand ⭐
  - 40-59: Medium Demand 📊
  - 20-39: Low Demand 📉
  - 0-19: Very Low Demand ❄️

- **urgency_score** (0-100): How urgent to reorder
  - 90-100: Critical - Order NOW! 🚨
  - 70-89: High Priority ⚠️
  - 50-69: Normal Priority 📦
  - 0-49: Low Priority ✅

- **confidence_level**: ML model confidence
  - `high`: MAPE < 15% (very accurate)
  - `medium`: MAPE 15-30% (good accuracy)
  - `low`: MAPE > 30% (less confident)

---

## 🧪 Test Cases

### 1. Default Analysis (30 days, top 10)
```json
{}
```

### 2. Short-term Analysis (7 days)
```json
{
  "forecast_days": 7,
  "top_products": 3
}
```

### 3. Long-term Analysis (90 days)
```json
{
  "forecast_days": 90,
  "top_products": 20
}
```

### 4. Focus on Top Performers
```json
{
  "forecast_days": 30,
  "top_products": 3
}
```

---

## 💡 Use Cases

### 1. Daily Inventory Check
```bash
# Morning routine - check what needs attention
curl -X POST http://172.16.30.89:8000/api/ai/analysis/smart/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"forecast_days": 7}'
```

**Action:** Review `low_stock_alerts` and place urgent orders.

### 2. Weekly Planning
```bash
# Plan purchases for the week
curl -X POST http://172.16.30.89:8000/api/ai/analysis/smart/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"forecast_days": 14}'
```

**Action:** Review `reorder_recommendations` and prepare purchase orders.

### 3. Identify Best Sellers
```bash
# Find top performing products
curl -X POST http://172.16.30.89:8000/api/ai/analysis/smart/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"top_products": 10}'
```

**Action:** Increase stock levels for `top_demand_products`.

### 4. Monthly Forecasting
```bash
# Long-term inventory planning
curl -X POST http://172.16.30.89:8000/api/ai/analysis/smart/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"forecast_days": 30}'
```

**Action:** Budget planning based on `total_reorder_value`.

---

## 🔄 Comparison: Manual vs Smart Analysis

### Manual Approach (Old Way)
```
1. Call /api/ai/forecast/lightgbm/ for product 220
2. Call /api/ai/forecast/lightgbm/ for product 221
3. Call /api/ai/forecast/lightgbm/ for product 222
4. Call /api/ai/forecast/lightgbm/ for product 223
5. Call /api/ai/forecast/lightgbm/ for product 224
6. Manually compare results
7. Manually prioritize reorders

Total: 5 API calls, manual analysis required
```

### Smart Analysis (New Way)
```
1. Call /api/ai/analysis/smart/

Total: 1 API call, automatic analysis & prioritization ✅
```

---

## 📱 Postman Collection Setup

### Step 1: Create Collection
1. Open Postman
2. Click "New" → "Collection"
3. Name: "ChainSync AI - Smart Analysis"

### Step 2: Add Environment
1. Click "Environments" → "+"
2. Name: "ChainSync Production"
3. Variables:
   ```
   base_url: http://172.16.30.89:8000
   access_token: (will be set automatically)
   ```

### Step 3: Add Login Request
1. Add request to collection
2. Name: "Login"
3. Method: POST
4. URL: `{{base_url}}/api/auth/login/`
5. Body: Login JSON (see Step 1)
6. Tests tab:
   ```javascript
   var jsonData = pm.response.json();
   pm.environment.set("access_token", jsonData.access);
   pm.test("Login successful", function () {
       pm.response.to.have.status(200);
   });
   ```

### Step 4: Add Smart Analysis Request
1. Add request to collection
2. Name: "Smart Product Analysis"
3. Method: POST
4. URL: `{{base_url}}/api/ai/analysis/smart/`
5. Headers:
   ```
   Authorization: Bearer {{access_token}}
   Content-Type: application/json
   ```
6. Body: Analysis JSON (see Step 2)
7. Tests tab:
   ```javascript
   pm.test("Analysis successful", function () {
       pm.response.to.have.status(200);
       var jsonData = pm.response.json();
       pm.expect(jsonData).to.have.property('summary');
       pm.expect(jsonData.summary.total_products_analyzed).to.be.above(0);
   });
   ```

### Step 5: Save & Run
1. Save collection
2. Click "Run" → Run collection
3. View results

---

## 🎯 Response Time Benchmarks

| Products Analyzed | Response Time | Efficiency |
|-------------------|---------------|------------|
| 5 products | <2 seconds | ⚡⚡⚡ |
| 10 products | <4 seconds | ⚡⚡ |
| 20 products | <8 seconds | ⚡ |
| 50 products | <20 seconds | ✅ |

*Much faster than calling individual endpoints!*

---

## 🚀 Advanced Features

### Filter by Demand Score
```javascript
// In Postman Tests tab
var jsonData = pm.response.json();
var highDemandOnly = jsonData.all_products.filter(p => p.demand_score >= 70);
console.log("High demand products:", highDemandOnly.length);
```

### Calculate Total Investment
```javascript
var total = jsonData.reorder_recommendations.reduce((sum, p) => 
    sum + (p.suggested_order_qty * p.unit_price), 0
);
console.log("Total investment needed:", total, "BDT");
```

### Export to CSV
```javascript
// Export top products to CSV format
var csv = "Product,Demand Score,Stock,Reorder Qty\n";
jsonData.top_demand_products.forEach(p => {
    csv += `${p.product_name},${p.demand_score},${p.current_stock},${p.suggested_order_qty}\n`;
});
console.log(csv);
```

---

## 💼 Business Intelligence

### Key Insights You Get

1. **Inventory Health Score**: Average demand score indicates overall inventory health
2. **Cash Flow Planning**: `total_reorder_value` helps budget planning
3. **Risk Assessment**: `critical_low_stock_count` shows business risk
4. **Growth Opportunities**: `high_demand_products` reveal expansion opportunities
5. **Efficiency Metrics**: Products analyzed vs products with data shows data quality

### Decision Making

**If `critical_low_stock_count` > 0:**
- Priority: URGENT
- Action: Place orders immediately
- Budget: Allocate emergency funds

**If `average_demand_score` < 30:**
- Priority: REVIEW
- Action: Analyze slow-moving products
- Strategy: Consider product mix optimization

**If `high_demand_products_count` > 50% of total:**
- Priority: OPPORTUNITY
- Action: Increase investment in top performers
- Strategy: Scale up high-demand categories

---

## 🛠️ Troubleshooting

### "No products found"
**Cause:** Retailer has no purchase history  
**Solution:** Make at least one order first

### "total_products_analyzed": 0
**Cause:** Products don't have 14+ days of sales data  
**Solution:** Continue recording daily sales, wait for data accumulation

### Low confidence levels
**Cause:** Insufficient or inconsistent sales data  
**Solution:** Improve daily sales recording, wait for more historical data

### Slow response
**Cause:** Analyzing many products (50+)  
**Solution:** Use `top_products` parameter to limit response size

---

## 📊 Sample Workflow

```
Morning Routine (9 AM):
├─ 1. Login to get token
├─ 2. Run Smart Analysis (7-day forecast)
├─ 3. Check low_stock_alerts
├─ 4. Place urgent orders
└─ 5. Update inventory spreadsheet

Weekly Planning (Monday):
├─ 1. Run Smart Analysis (14-day forecast)
├─ 2. Review reorder_recommendations
├─ 3. Contact suppliers
├─ 4. Prepare purchase orders
└─ 5. Budget allocation

Monthly Strategy (1st of month):
├─ 1. Run Smart Analysis (30-day forecast)
├─ 2. Analyze top_demand_products
├─ 3. Review average_demand_score trends
├─ 4. Optimize product mix
└─ 5. Set next month targets
```

---

## 🎓 Pro Tips

1. **Run daily analysis** to catch stockouts early
2. **Compare week-over-week** demand scores to spot trends
3. **Focus on urgency_score** for immediate actions
4. **Use demand_score** for long-term strategy
5. **Track confidence_level** to assess prediction quality
6. **Export insights** to share with team
7. **Set alerts** for critical_low_stock_count > 0
8. **Automate** with Postman monitors or CI/CD

---

## 🔗 Related APIs

- **Single Product Forecast**: `/api/ai/forecast/lightgbm/`
- **Groq AI Forecast**: `/api/ai/forecast/`
- **AI Orders**: `/api/ai/orders/`
- **Retailer Insights**: `/api/ai/insights/`

---

## ✅ Success Criteria

Your Smart Analysis is working correctly if:
- ✅ Response status: 200 OK
- ✅ `total_products_analyzed` > 0
- ✅ `summary` object is present
- ✅ `all_products` array has items
- ✅ Each product has `demand_score` and `urgency_score`
- ✅ `insights.recommendation` provides actionable text

---

**🎉 Happy Analyzing! Your AI-powered inventory assistant is ready to help grow your business!**
