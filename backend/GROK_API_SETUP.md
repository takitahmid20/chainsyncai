# Grok API Integration Guide

This guide explains how to set up and use xAI's Grok API in your ChainSync AI backend.

## What Changed?

We replaced Google Gemini AI with xAI's Grok API for all AI-powered features including:
- Demand forecasting
- Auto-order suggestions
- AI insights and recommendations

## Prerequisites

### 1. Get Your Grok API Key

1. Visit [https://console.x.ai/](https://console.x.ai/)
2. Sign in with your X/Twitter account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (it starts with `xai-...`)

### 2. Update Environment Variables

Open `/backend/.env` and update the Grok API key:

```bash
# xAI Grok Configuration
GROK_API_KEY=xai-your-actual-api-key-here
```

**Important:** Replace `your_grok_api_key_here` with your actual API key from xAI console.

## Installation Steps

### 1. Install Dependencies

The implementation uses Python's `requests` library (no special SDK needed):

```bash
cd backend
pip install -r requirements.txt
```

### 2. Remove Old Gemini Package (Optional)

```bash
pip uninstall google-genai
```

### 3. Restart Django Server

```bash
python3 manage.py runserver
```

## API Endpoints (No Changes)

All existing API endpoints remain the same:

### Demand Forecast
```
POST /api/ai/forecast/
{
  "product_id": 1,
  "forecast_days": 30
}
```

### Retailer Insights
```
POST /api/ai/insights/
{
  "forecast_days": 30,
  "priority_filter": "all",
  "max_products": 20
}
```

## Code Changes Summary

### Files Modified:
1. **`ai_engine/services.py`** - Main AI service implementation
   - Renamed `GeminiAIService` → `GrokAIService`
   - Replaced Gemini SDK calls with HTTP requests to Grok API
   - Updated API endpoint to `https://api.x.ai/v1`

2. **`ai_engine/views.py`** - Updated documentation strings

3. **`.env`** - Changed environment variable from `GEMINI_API_KEY` to `GROK_API_KEY`

4. **`requirements.txt`** - Removed `google-genai`, uses `requests` instead

## Grok API Details

### Model Used
- **Model:** `grok-beta`
- **Endpoint:** `https://api.x.ai/v1/chat/completions`
- **Format:** OpenAI-compatible Chat Completions API

### Request Structure
```python
{
    "model": "grok-beta",
    "messages": [
        {
            "role": "system",
            "content": "You are an expert supply chain AI assistant..."
        },
        {
            "role": "user",
            "content": "..."
        }
    ],
    "temperature": 0.7,
    "max_tokens": 2000
}
```

### Response Structure
```python
{
    "choices": [
        {
            "message": {
                "role": "assistant",
                "content": "{...JSON forecast data...}"
            }
        }
    ]
}
```

## Testing the Integration

### 1. Check API Key Configuration

```bash
cd backend
python3 manage.py shell
```

```python
from decouple import config
print(config('GROK_API_KEY'))  # Should print your API key
```

### 2. Test Demand Forecast

```python
from ai_engine.services import GrokAIService

grok = GrokAIService()
forecast = grok.forecast_demand(product_id=1, forecast_days=30)
print(forecast)
```

### 3. Test via API (using curl)

```bash
# Get auth token first
curl -X POST http://172.16.30.89:8000/api/auth/signin/ \
  -H "Content-Type: application/json" \
  -d '{"email": "takitahmid25+retailer@gmail.com", "password": "123456"}'

# Test forecast endpoint
curl -X POST http://172.16.30.89:8000/api/ai/forecast/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "forecast_days": 30}'
```

## Advantages of Grok API

1. **OpenAI-Compatible:** Uses standard Chat Completions API format
2. **No Special SDK Required:** Uses simple HTTP requests
3. **Fast Response Times:** Optimized for production use
4. **Advanced Reasoning:** Grok-beta model excels at analytical tasks
5. **Cost-Effective:** Competitive pricing compared to other AI APIs

## Troubleshooting

### Error: "GROK_API_KEY not found"
- Make sure `.env` file has the correct key
- Restart Django server after updating `.env`

### Error: "401 Unauthorized"
- Check if your API key is valid
- Verify you copied the full key (starts with `xai-`)
- Check if your xAI account has API access enabled

### Error: "Connection timeout"
- Check your internet connection
- Verify xAI API endpoint is accessible: `https://api.x.ai`
- Try increasing timeout in `services.py` (currently 30 seconds)

### Error: "JSON parsing failed"
- The AI might return non-JSON text
- Check the `raw_response` field in error output
- Adjust the system prompt if needed

## Rate Limits

- Check your xAI console for current rate limits
- Default implementation includes 30-second timeout
- Consider implementing caching for frequently requested forecasts

## Cost Considerations

- Grok API charges per token (input + output)
- Each forecast uses ~500-1500 tokens
- Monitor usage in xAI console
- Consider implementing daily limits for production

## Monitoring

Add logging to track AI usage:

```python
import logging
logger = logging.getLogger(__name__)

# In GrokAIService.forecast_demand():
logger.info(f"Grok API call - Product: {product_id}, Tokens: {response.json()['usage']}")
```

## Next Steps

1. Get your Grok API key from [console.x.ai](https://console.x.ai/)
2. Update `.env` with your key
3. Test the integration
4. Monitor usage and costs
5. Consider implementing caching for production

## Support

- **xAI Documentation:** [https://docs.x.ai/](https://docs.x.ai/)
- **API Status:** [https://status.x.ai/](https://status.x.ai/)
- **Discord Community:** Check xAI's official Discord for support

---

**Note:** The frontend (React Native app) requires no changes - all API endpoints remain the same.
