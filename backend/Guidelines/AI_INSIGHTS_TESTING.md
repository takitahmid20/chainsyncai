# AI Insights API - Testing Guide

## 🎯 What's New?

**NEW API Endpoint:** `POST /api/ai/insights/`

This endpoint analyzes **ALL products** for a retailer at once and returns a prioritized list of recommendations!

---

## 🆚 Difference Between APIs

### 1. **Demand Forecast API** (Single Product)
**Endpoint:** `POST /api/ai/demand-forecast/`

**Use:** Analyze ONE specific product  
**Request:**
```json
{
  "product_id": 2,
  "forecast_days": 30
}
```

---

### 2. **AI Insights API** (All Products) ✨ NEW!
**Endpoint:** `POST /api/ai/insights/`

**Use:** Analyze ALL products and get prioritized recommendations  
**Request:**
```json
{
  "forecast_days": 30,
  "priority_filter": "all"
}
```

---

## 📱 Perfect For

### AI Insights Dashboard Page
```
┌─────────────────────────────────┐
│   AI Insights                   │
├─────────────────────────────────┤
│ Summary                         │
│ • 50 products analyzed          │
│ • 12 need reorder               │
│ • 3 URGENT                      │
│ • Total value: ৳150,000         │
├─────────────────────────────────┤
│ Urgent Products (3)             │
│ ⚠️ Premium Rice - 3 days left   │
│ ⚠️ Fresh Milk - 2 days left     │
│ ⚠️ Cooking Oil - 5 days left    │
├─────────────────────────────────┤
│ All Recommendations (12)        │
│ 📦 Product 1 - Order 50 units   │
│ 📦 Product 2 - Order 30 units   │
│ ...                             │
└─────────────────────────────────┘
```

---

## 🧪 How to Test in Postman

### Step 1: Sign In
**POST** `http://localhost:8000/api/auth/signin/`

**Body:**
```json
{
  "email": "retailer@test.com",
  "password": "password123"
}
```

**Copy the `access` token**

---

### Step 2: Test AI Insights (All Products)

**POST** `http://localhost:8000/api/ai/insights/`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Body (Option 1 - Fast: Top 10 Products):**
```json
{
  "forecast_days": 30,
  "priority_filter": "all",
  "max_products": 10
}
```
**⏱️ Response Time: ~30 seconds**

---

**Body (Option 2 - Balanced: Top 20 Products - DEFAULT):**
```json
{
  "forecast_days": 30,
  "priority_filter": "all",
  "max_products": 20
}
```
**⏱️ Response Time: ~1 minute**

---

**Body (Option 3 - Comprehensive: Top 50 Products):**
```json
{
  "forecast_days": 30,
  "priority_filter": "all",
  "max_products": 50
}
```
**⏱️ Response Time: ~3-4 minutes**

---

**Body (Option 4 - Only Urgent, Fast):**
```json
{
  "forecast_days": 30,
  "priority_filter": "urgent",
  "max_products": 10
}
```

---

**Body (Option 5 - Only Low Stock Products):**
```json
{
  "forecast_days": 30,
  "priority_filter": "low_stock",
  "max_products": 15
}
```

---

## 📊 Expected Response

```json
{
  "retailer_id": 1,
  "generated_at": "2025-11-28T10:30:00Z",
  "forecast_period_days": 30,
  
  "summary": {
    "total_products_analyzed": 50,
    "products_need_reorder": 12,
    "urgent_reorders": 3,
    "soon_reorders": 5,
    "total_suggested_order_value": 150000.00,
    "average_stock_days_remaining": 18.5
  },
  
  "recommendations": [
    {
      "product_id": 5,
      "product_name": "Premium Basmati Rice",
      "product_category": "Grains",
      "current_stock": 10,
      "current_price": 250.00,
      
      "predicted_demand": 60,
      "predicted_daily_average": 2.0,
      "trend": "stable",
      "confidence_level": "high",
      
      "should_reorder": true,
      "suggested_order_quantity": 50,
      "reorder_urgency": "urgent",
      "risk_assessment": "high",
      "estimated_stockout_date": "2025-12-01",
      "days_until_stockout": 3,
      
      "quick_insight": "⚠️ URGENT: Stock running out in 3 days!"
    },
    {
      "product_id": 12,
      "product_name": "Fresh Milk 1L",
      "product_category": "Dairy",
      "current_stock": 15,
      "current_price": 120.00,
      
      "predicted_demand": 90,
      "predicted_daily_average": 3.0,
      "trend": "increasing",
      "confidence_level": "high",
      
      "should_reorder": true,
      "suggested_order_quantity": 100,
      "reorder_urgency": "soon",
      "risk_assessment": "medium",
      "estimated_stockout_date": "2025-12-08",
      "days_until_stockout": 10,
      
      "quick_insight": "⏰ Order soon: 10 days remaining"
    },
    {
      "product_id": 25,
      "product_name": "Cooking Oil 5L",
      "product_category": "Oils",
      "current_stock": 200,
      "current_price": 850.00,
      
      "predicted_demand": 30,
      "predicted_daily_average": 1.0,
      "trend": "stable",
      "confidence_level": "medium",
      
      "should_reorder": false,
      "suggested_order_quantity": 0,
      "reorder_urgency": "not_needed",
      "risk_assessment": "low",
      "estimated_stockout_date": null,
      "days_until_stockout": null,
      
      "quick_insight": "✅ Stock sufficient for 30 days"
    }
  ],
  
  "urgent_products": [
    // Top 5 most urgent products
    {...}
  ],
  
  "soon_products": [
    // Top 5 products needing reorder soon
    {...}
  ],
  
  "trending_up_products": [
    // Top 5 trending products (increasing demand)
    {...}
  ]
}
```

---

## 🎯 Response Fields Explained

### Summary Object
| Field | Description |
|-------|-------------|
| `total_products_analyzed` | How many products were analyzed |
| `products_need_reorder` | How many need reordering |
| `urgent_reorders` | How many are URGENT |
| `soon_reorders` | How many need reorder "soon" |
| `total_suggested_order_value` | Total cost of all suggested orders |
| `average_stock_days_remaining` | Average days until stockout across all products |

### Recommendation Object
| Field | Description |
|-------|-------------|
| `product_id`, `product_name`, `product_category` | Product details |
| `current_stock`, `current_price` | Current inventory |
| `predicted_demand` | Total units predicted to sell |
| `predicted_daily_average` | Average units per day |
| `trend` | increasing / stable / decreasing |
| `confidence_level` | high / medium / low |
| `should_reorder` | true / false |
| `suggested_order_quantity` | How many units to order |
| `reorder_urgency` | urgent / soon / normal / not_needed |
| `risk_assessment` | high / medium / low |
| `estimated_stockout_date` | Date when stock runs out |
| `days_until_stockout` | Number of days until stockout |
| `quick_insight` | Human-readable summary |

---

## 💡 Filter Options

### Filter: `"all"` (Default)
Returns ALL products analyzed, sorted by urgency

### Filter: `"urgent"`
Returns ONLY products with `reorder_urgency: "urgent"`

### Filter: `"soon"`
Returns products with `reorder_urgency: "urgent"` OR `"soon"`

### Filter: `"low_stock"`
Returns products with `should_reorder: true` (all products needing reorder)

---

## ⚡ Performance Notes

**Processing Time:**
- ~2-5 seconds per product (Gemini AI call)
- **Default (20 products) = ~1 minute**
- **Fast (10 products) = ~30 seconds**
- **Comprehensive (50 products) = ~3-4 minutes**

**Smart Optimization:**
- Analyzes **top-selling products first** (prioritizes high-volume items)
- Includes **low-stock products** automatically (products with < 50 units)
- Skips products with no sales history

**Recommendations:**
- ✅ **Start with 10 products** for testing
- ✅ Use **20 products** (default) for dashboard
- ✅ Use **filters** to get faster, targeted results
- ✅ Cache results for 30 minutes on frontend
- ⚠️ Avoid 50+ products unless necessary (very slow)

---

## 🚀 Mobile App Integration

### React Native Example

```typescript
// AI Insights Screen
const AIInsightsScreen = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const fetchInsights = async (filter = 'all') => {
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:8000/api/ai/insights/',
        {
          forecast_days: 30,
          priority_filter: filter
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      setInsights(response.data);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchInsights();
  }, []);
  
  return (
    <View>
      {/* Summary Cards */}
      <View style={styles.summary}>
        <StatCard 
          title="Products Analyzed" 
          value={insights?.summary?.total_products_analyzed} 
        />
        <StatCard 
          title="Need Reorder" 
          value={insights?.summary?.products_need_reorder} 
          color="orange"
        />
        <StatCard 
          title="Urgent" 
          value={insights?.summary?.urgent_reorders} 
          color="red"
        />
      </View>
      
      {/* Urgent Products Section */}
      <Section title="⚠️ Urgent Reorders">
        {insights?.urgent_products?.map(product => (
          <ProductCard 
            key={product.product_id}
            product={product}
            onPress={() => navigateToProduct(product.product_id)}
          />
        ))}
      </Section>
      
      {/* All Recommendations */}
      <Section title="📦 All Recommendations">
        {insights?.recommendations?.map(product => (
          <RecommendationCard 
            key={product.product_id}
            product={product}
            onReorder={() => handleReorder(product)}
          />
        ))}
      </Section>
    </View>
  );
};
```

---

## 🎉 Summary

### Before (Old API):
- ❌ Had to call API for each product individually
- ❌ 50 products = 50 API calls
- ❌ Slow, inefficient
- ❌ No prioritization

### After (New API):
- ✅ One API call for all products
- ✅ Automatic prioritization (urgent → soon → normal)
- ✅ Summary statistics
- ✅ Categorized lists (urgent, soon, trending)
- ✅ Perfect for dashboard display

**Test it now in Postman!** 🚀
