# Loan Suggestion API Documentation

## Overview
The Loan Suggestion System analyzes a retailer's sales history and provides personalized loan recommendations based on their business performance.

## Features

### 1. **Intelligent Credit Scoring**
- Analyzes 90 days of sales data
- Calculates credit score (0-100) based on:
  - Average monthly sales (40%)
  - Business stability/consistency (30%)
  - Payment history/order completion rate (30%)

### 2. **Risk-Based Assessment**
- **Low Risk** (70+ score): Best terms, 12-month tenure, 12% interest
- **Medium Risk** (50-69 score): Standard terms, 9-month tenure, 14% interest
- **High Risk** (below 50): Starter loan, 6-month tenure, 16% interest

### 3. **Dynamic Loan Amount Calculation**
- Based on 1.5x to 3x of average monthly sales
- Range: ৳10,000 to ৳5,00,000
- Adjusted based on risk level

### 4. **Detailed Repayment Schedule**
- Month-by-month breakdown
- Principal and interest separation
- Running balance tracking

## API Endpoints

### GET /api/finance/loan/suggestion/
Get personalized loan suggestion for authenticated retailer

**Authentication**: Required (Bearer Token)

**Response** (Eligible):
```json
{
  "eligible": true,
  "suggestion": {
    "id": 1,
    "suggested_amount": 75000.0,
    "min_amount": 35000.0,
    "max_amount": 110000.0,
    "risk_level": "medium",
    "credit_score": 65,
    "tenure_months": 9,
    "monthly_payment": 8742.50,
    "interest_rate": 14.0,
    "eligibility_reason": "Good! Your business shows steady growth...",
    "recommendation_notes": "✓ Good sales growth potential\n• Moderate business consistency..."
  },
  "metrics": {
    "total_sales_90d": 150000.0,
    "avg_monthly_sales": 50000.0,
    "avg_monthly_orders": 15,
    "sales_days": 75,
    "stability_score": 68,
    "payment_score": 85,
    "total_orders": 45,
    "completed_orders": 38
  },
  "repayment_schedule": [
    {
      "month": 1,
      "emi": 8742.50,
      "principal": 7875.83,
      "interest": 866.67,
      "balance": 67124.17
    },
    ...
  ]
}
```

**Response** (Not Eligible):
```json
{
  "eligible": false,
  "reason": "Insufficient sales history. Please complete at least 3 months of sales to qualify for loan suggestions.",
  "metrics": {
    "has_sufficient_data": false,
    "total_sales_90d": 5000.0,
    "sales_days": 15,
    ...
  }
}
```

### GET /api/finance/loan/history/
View loan inquiry history

**Authentication**: Required (Bearer Token)

**Response**:
```json
{
  "total_inquiries": 5,
  "history": [
    {
      "viewed_at": "2025-12-02T10:30:00Z",
      "suggested_amount": 75000.0,
      "credit_score": 65,
      "risk_level": "medium"
    },
    ...
  ]
}
```

## How It Works

### 1. **Data Collection**
- Retrieves last 90 days of daily sales data
- Analyzes order history and completion rates
- Calculates business consistency metrics

### 2. **Credit Score Calculation**
```python
# Sales Performance (40 points max)
sales_score = min(40, (avg_monthly_sales / 50000) * 40)

# Business Stability (30 points max)
stability_score = stability_score * 0.3

# Payment History (30 points max)
payment_score = payment_score * 0.3

# Total Credit Score
credit_score = sales_score + stability_score + payment_score
```

### 3. **Loan Amount Formula**
```python
# Multiplier based on risk
if risk_level == 'low':
    multiplier = 3.0  # 3 months of sales
elif risk_level == 'medium':
    multiplier = 2.0  # 2 months of sales
else:
    multiplier = 1.5  # 1.5 months of sales

suggested_amount = avg_monthly_sales * multiplier
```

### 4. **EMI Calculation**
Uses standard EMI formula:
```
EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)

Where:
P = Principal loan amount
r = Monthly interest rate (annual_rate / 12 / 100)
n = Tenure in months
```

## Business Rules

### Eligibility Requirements
- ✓ Minimum 30 days of sales data required
- ✓ Retailer account must be active
- ✓ Must have at least some sales history

### Loan Limits
- Minimum: ৳10,000
- Maximum: ৳5,00,000
- Amounts rounded to nearest ৳5,000

### Interest Rates
- Low Risk: 12% annual
- Medium Risk: 14% annual
- High Risk: 16% annual

### Tenure Options
- Low Risk: 12 months
- Medium Risk: 9 months
- High Risk: 6 months

## Testing the API

### 1. Login to get token
```bash
curl -X POST http://172.16.30.89:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "takitahmid25+retailer@gmail.com",
    "password": "password123"
  }'
```

### 2. Get loan suggestion
```bash
curl -X GET http://172.16.30.89:8000/api/finance/loan/suggestion/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. View history
```bash
curl -X GET http://172.16.30.89:8000/api/finance/loan/history/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

## Example Scenarios

### Scenario 1: Excellent Business (Low Risk)
- **Sales**: ৳75,000/month average
- **Stability**: 85% (very consistent)
- **Orders**: 95% completion rate
- **Result**: 
  - Credit Score: 82
  - Loan: ৳2,25,000 (3x monthly sales)
  - Interest: 12%
  - Tenure: 12 months
  - EMI: ৳20,008/month

### Scenario 2: Growing Business (Medium Risk)
- **Sales**: ৳35,000/month average
- **Stability**: 65% (moderate consistency)
- **Orders**: 80% completion rate
- **Result**:
  - Credit Score: 58
  - Loan: ৳70,000 (2x monthly sales)
  - Interest: 14%
  - Tenure: 9 months
  - EMI: ৳8,167/month

### Scenario 3: New Business (High Risk)
- **Sales**: ৳15,000/month average
- **Stability**: 45% (inconsistent)
- **Orders**: 60% completion rate
- **Result**:
  - Credit Score: 38
  - Loan: ৳20,000 (1.5x monthly sales)
  - Interest: 16%
  - Tenure: 6 months
  - EMI: ৳3,497/month

## Key Insights in Response

### Recommendation Notes
- Sales performance assessment
- Business stability feedback
- Payment track record evaluation
- Personalized recommendations for growth

### Metrics Provided
- Total sales (90 days)
- Average monthly sales
- Average monthly orders
- Business stability score
- Payment history score
- Order completion rate

## Database Models

### LoanSuggestion
- Stores complete loan suggestion details
- One active suggestion per retailer (updates on each request)
- Tracks credit score and risk level
- Includes repayment terms

### LoanInquiry
- Tracks when retailers view loan suggestions
- Links to specific suggestion viewed
- Used for analytics and behavior tracking

## Important Notes

1. **This is a SUGGESTION SYSTEM only** - The platform does NOT provide actual loans
2. **Educational/Informational Purpose** - Helps retailers understand their creditworthiness
3. **External Lenders** - Retailers must approach banks/financial institutions separately
4. **Data Privacy** - All calculations based on retailer's own sales data only
5. **No Guarantees** - Actual loan approval depends on external lenders' criteria

## Future Enhancements

- [ ] Integration with partner financial institutions
- [ ] Multiple loan product options (working capital, equipment, etc.)
- [ ] Comparison with similar businesses
- [ ] Credit improvement tips and recommendations
- [ ] Pre-qualification certificates for partner lenders
