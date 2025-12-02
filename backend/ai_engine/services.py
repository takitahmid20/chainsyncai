"""
AI Engine Services
Groq AI integration for demand forecasting, auto-order suggestions, and AI insights
"""

import json
import requests
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from django.utils import timezone
from decouple import config

from orders.models import Order, OrderItem
from products.models import Product


class GrokAIService:
    """
    Service class for Groq AI API integration
    Handles demand forecasting, auto-order suggestions, and AI insights
    """
    
    def __init__(self):
        """Initialize Groq AI with API key"""
        api_key = config('GROK_API_KEY', default='')
        if not api_key:
            raise ValueError("GROK_API_KEY not found in environment variables")
        
        self.api_key = api_key
        # Groq API endpoint
        self.base_url = 'https://api.groq.com/openai/v1'
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def get_product_sales_history(self, product_id: int, days: int = 90) -> List[Dict[str, Any]]:
        """
        Get historical sales data for a product
        
        Args:
            product_id: Product ID
            days: Number of days to look back
            
        Returns:
            List of sales records with date, quantity, and revenue
        """
        cutoff_date = timezone.now() - timedelta(days=days)
        
        # Get all order items for this product
        order_items = OrderItem.objects.filter(
            product_id=product_id,
            order__created_at__gte=cutoff_date,
            order__status__in=['delivered', 'pending', 'confirmed']
        ).select_related('order').order_by('order__created_at')
        
        # Aggregate by date
        sales_by_date = {}
        for item in order_items:
            date_key = item.order.created_at.date().isoformat()
            if date_key not in sales_by_date:
                sales_by_date[date_key] = {
                    'date': date_key,
                    'quantity': 0,
                    'revenue': 0
                }
            sales_by_date[date_key]['quantity'] += item.quantity
            sales_by_date[date_key]['revenue'] += float(item.subtotal)
        
        return list(sales_by_date.values())
    
    def get_product_inventory_info(self, product_id: int) -> Dict[str, Any]:
        """Get current inventory information for a product"""
        try:
            product = Product.objects.get(id=product_id)
            # Assuming reorder level is 20% of max stock or minimum 10
            min_order_qty = product.minimum_order_quantity or 1
            estimated_reorder_level = max(int(product.stock_quantity * 0.2), min_order_qty)
            
            return {
                'current_stock': product.stock_quantity,
                'reorder_level': estimated_reorder_level,
                'max_stock_level': product.stock_quantity * 2,  # Estimated max
                'is_low_stock': product.stock_quantity <= estimated_reorder_level,
                'last_updated': product.updated_at.isoformat(),
                'minimum_order_quantity': min_order_qty
            }
        except Product.DoesNotExist:
            return {
                'current_stock': 0,
                'reorder_level': 0,
                'max_stock_level': 0,
                'is_low_stock': True,
                'last_updated': None,
                'minimum_order_quantity': 1
            }
    
    def forecast_demand(
        self, 
        product_id: int, 
        forecast_days: int = 30,
        retailer_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Use Gemini AI to forecast product demand
        
        Args:
            product_id: Product ID to forecast
            forecast_days: Number of days to forecast
            retailer_id: Optional retailer ID for personalized forecasting
            
        Returns:
            Dict with forecast data, insights, and recommendations
        """
        # Get product information
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return {
                'error': 'Product not found',
                'product_id': product_id
            }
        
        # Get sales history
        sales_history = self.get_product_sales_history(product_id, days=90)
        
        # Get inventory info
        inventory_info = self.get_product_inventory_info(product_id)
        
        # Build prompt for Gemini
        prompt = self._build_demand_forecast_prompt(
            product=product,
            sales_history=sales_history,
            inventory_info=inventory_info,
            forecast_days=forecast_days
        )
        
        # Get AI response from Grok
        try:
            response = requests.post(
                f'{self.base_url}/chat/completions',
                headers=self.headers,
                json={
                    'model': 'llama-3.3-70b-versatile',  # Groq's recommended model
                    'messages': [
                        {
                            'role': 'system',
                            'content': 'You are an expert supply chain and demand forecasting AI assistant. Provide responses in valid JSON format only.'
                        },
                        {
                            'role': 'user',
                            'content': prompt
                        }
                    ],
                    'temperature': 0.7,
                    'max_tokens': 2000
                },
                timeout=30
            )
            response.raise_for_status()
            ai_response = response.json()['choices'][0]['message']['content']
            
            # Parse AI response (expecting JSON format)
            forecast_data = self._parse_forecast_response(ai_response)
            
            # Add metadata
            forecast_data['product_id'] = product_id
            forecast_data['product_name'] = product.name
            forecast_data['current_price'] = float(product.price)
            forecast_data['current_stock'] = inventory_info['current_stock']
            forecast_data['forecast_period_days'] = forecast_days
            forecast_data['generated_at'] = timezone.now().isoformat()
            
            return forecast_data
            
        except requests.exceptions.HTTPError as e:
            error_detail = 'Unknown error'
            try:
                error_detail = e.response.json()
            except:
                error_detail = e.response.text
            return {
                'error': f'AI forecasting failed: {str(e)}',
                'error_detail': error_detail,
                'product_id': product_id,
                'product_name': product.name
            }
        except Exception as e:
            return {
                'error': f'AI forecasting failed: {str(e)}',
                'product_id': product_id,
                'product_name': product.name
            }
    
    def _build_demand_forecast_prompt(
        self,
        product: Product,
        sales_history: List[Dict],
        inventory_info: Dict,
        forecast_days: int
    ) -> str:
        """Build detailed prompt for Gemini AI"""
        
        # Calculate summary statistics
        total_sales = sum(item['quantity'] for item in sales_history)
        avg_daily_sales = total_sales / len(sales_history) if sales_history else 0
        total_revenue = sum(item['revenue'] for item in sales_history)
        
        prompt = f"""
You are an expert supply chain and demand forecasting AI assistant for a B2B retail platform.

Analyze the following product data and provide a detailed demand forecast:

**Product Information:**
- Name: {product.name}
- Category: {product.category.name if product.category else 'N/A'}
- Current Price: ৳{product.price}
- SKU: {product.sku}

**Current Inventory Status:**
- Current Stock: {inventory_info['current_stock']} units
- Reorder Level: {inventory_info['reorder_level']} units
- Max Stock Level: {inventory_info['max_stock_level']} units
- Low Stock Alert: {'Yes' if inventory_info['is_low_stock'] else 'No'}

**Sales History (Last 90 days):**
- Total Units Sold: {total_sales}
- Average Daily Sales: {avg_daily_sales:.2f} units
- Total Revenue: ৳{total_revenue:.2f}
- Number of Sales Days: {len(sales_history)}

**Detailed Sales Data:**
{json.dumps(sales_history, indent=2)}

**Task:**
Forecast demand for the next {forecast_days} days and provide actionable insights.

**Required Output Format (JSON):**
{{
  "forecast_summary": {{
    "predicted_total_demand": <number>,
    "predicted_daily_average": <number>,
    "confidence_level": "<high|medium|low>",
    "trend": "<increasing|stable|decreasing>"
  }},
  "weekly_forecast": [
    {{"week": 1, "predicted_demand": <number>, "min_demand": <number>, "max_demand": <number>}},
    {{"week": 2, "predicted_demand": <number>, "min_demand": <number>, "max_demand": <number>}}
  ],
  "recommendations": {{
    "should_reorder": <true|false>,
    "suggested_order_quantity": <number>,
    "reorder_urgency": "<urgent|soon|normal|not_needed>",
    "estimated_stockout_date": "<YYYY-MM-DD or null>",
    "risk_assessment": "<high|medium|low>"
  }},
  "insights": [
    "Insight 1: <detailed insight>",
    "Insight 2: <detailed insight>",
    "Insight 3: <detailed insight>"
  ],
  "factors_considered": [
    "Factor 1",
    "Factor 2"
  ]
}}

Provide ONLY the JSON output, no additional text.
"""
        return prompt
    
    def _parse_forecast_response(self, ai_response: str) -> Dict[str, Any]:
        """Parse and validate AI response"""
        try:
            # Try to extract JSON from response
            # Sometimes AI includes markdown code blocks
            if '```json' in ai_response:
                json_start = ai_response.find('```json') + 7
                json_end = ai_response.find('```', json_start)
                ai_response = ai_response[json_start:json_end].strip()
            elif '```' in ai_response:
                json_start = ai_response.find('```') + 3
                json_end = ai_response.find('```', json_start)
                ai_response = ai_response[json_start:json_end].strip()
            
            forecast_data = json.loads(ai_response)
            
            # Validate required fields
            required_fields = ['forecast_summary', 'recommendations', 'insights']
            for field in required_fields:
                if field not in forecast_data:
                    forecast_data[field] = {}
            
            return forecast_data
            
        except json.JSONDecodeError as e:
            # If JSON parsing fails, return raw response
            return {
                'forecast_summary': {'error': 'Failed to parse AI response'},
                'raw_response': ai_response,
                'parse_error': str(e)
            }


class DemandForecastService:
    """Wrapper service for demand forecasting operations"""
    
    @staticmethod
    def forecast_product_demand(
        product_id: int,
        forecast_days: int = 30,
        retailer_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Public method to forecast demand for a product
        
        Args:
            product_id: Product ID
            forecast_days: Days to forecast (default 30)
            retailer_id: Optional retailer for personalized forecast
            
        Returns:
            Forecast data dictionary
        """
        grok_service = GrokAIService()
        return grok_service.forecast_demand(
            product_id=product_id,
            forecast_days=forecast_days,
            retailer_id=retailer_id
        )
    
    @staticmethod
    def get_retailer_insights(
        retailer_id: int,
        forecast_days: int = 30,
        priority_filter: str = 'all',
        max_products: int = 20
    ) -> Dict[str, Any]:
        """
        Analyze products for a retailer and return prioritized recommendations
        
        Args:
            retailer_id: Retailer user ID
            forecast_days: Days to forecast (default 30)
            priority_filter: 'all', 'urgent', 'soon', or 'low_stock'
            max_products: Maximum number of products to analyze (default 20 for speed)
            
        Returns:
            Dictionary with summary and list of product recommendations
        """
        from django.db.models import Q, Count, Sum
        from datetime import datetime
        
        # Get products with recent sales (prioritize active products)
        products_with_sales = OrderItem.objects.filter(
            order__status__in=['delivered', 'confirmed', 'pending'],
            order__created_at__gte=timezone.now() - timedelta(days=90)
        ).values('product_id').annotate(
            total_sales=Sum('quantity')
        ).order_by('-total_sales')[:max_products]  # Limit to top-selling products
        
        product_ids = [item['product_id'] for item in products_with_sales]
        
        products = Product.objects.filter(
            id__in=product_ids,
            status='active'
        ).select_related('category')
        
        # Also prioritize low-stock products
        low_stock_products = Product.objects.filter(
            status='active',
            stock_quantity__lte=50  # Low stock threshold
        ).exclude(id__in=product_ids)[:10]  # Add up to 10 low-stock products
        
        all_products = list(products) + list(low_stock_products)
        
        recommendations = []
        urgent_products = []
        soon_products = []
        trending_up_products = []
        
        total_order_value = 0
        products_need_reorder = 0
        urgent_count = 0
        soon_count = 0
        total_stock_days = 0
        analyzed_count = 0
        
        grok_service = GrokAIService()
        
        # Process products with progress tracking
        total_to_analyze = len(all_products)
        analyzed_count_progress = 0
        
        for product in all_products:
            analyzed_count_progress += 1
            # You could log progress here: print(f"Analyzing {analyzed_count_progress}/{total_to_analyze}")
            
            try:
                # Get forecast for this product
                forecast = grok_service.forecast_demand(
                    product_id=product.id,
                    forecast_days=forecast_days,
                    retailer_id=retailer_id
                )
                
                # Skip if error
                if 'error' in forecast:
                    continue
                
                # Extract data
                rec = forecast.get('recommendations', {})
                summary = forecast.get('forecast_summary', {})
                
                # Calculate days until stockout
                days_until_stockout = None
                if rec.get('estimated_stockout_date'):
                    try:
                        # Simple date parsing without dateutil
                        stockout_date_str = rec['estimated_stockout_date']
                        if stockout_date_str:
                            from datetime import datetime as dt
                            # Try ISO format first
                            try:
                                stockout_date = dt.fromisoformat(stockout_date_str.replace('Z', '+00:00'))
                            except:
                                # Try simple YYYY-MM-DD format
                                stockout_date = dt.strptime(stockout_date_str.split('T')[0], '%Y-%m-%d')
                            
                            days_until_stockout = (stockout_date - dt.now()).days
                            total_stock_days += days_until_stockout
                            analyzed_count += 1
                    except:
                        pass
                
                # Generate quick insight
                urgency = rec.get('reorder_urgency', 'normal')
                if urgency == 'urgent':
                    quick_insight = f"⚠️ URGENT: Stock running out in {days_until_stockout or '?'} days!"
                elif urgency == 'soon':
                    quick_insight = f"⏰ Order soon: {days_until_stockout or '?'} days remaining"
                elif rec.get('should_reorder'):
                    quick_insight = f"📦 Consider reordering: {rec.get('suggested_order_quantity', 0)} units"
                else:
                    quick_insight = f"✅ Stock sufficient for {days_until_stockout or forecast_days} days"
                
                # Create recommendation item
                recommendation_item = {
                    'product_id': product.id,
                    'product_name': product.name,
                    'product_category': product.category.name if product.category else None,
                    'current_stock': product.stock_quantity,
                    'current_price': float(product.price),
                    'predicted_demand': int(summary.get('predicted_total_demand', 0)),
                    'predicted_daily_average': float(summary.get('predicted_daily_average', 0)),
                    'trend': summary.get('trend', 'stable'),
                    'confidence_level': summary.get('confidence_level', 'medium'),
                    'should_reorder': rec.get('should_reorder', False),
                    'suggested_order_quantity': int(rec.get('suggested_order_quantity', 0)),
                    'reorder_urgency': urgency,
                    'risk_assessment': rec.get('risk_assessment', 'low'),
                    'estimated_stockout_date': rec.get('estimated_stockout_date'),
                    'days_until_stockout': days_until_stockout,
                    'quick_insight': quick_insight
                }
                
                # Apply filters
                if priority_filter == 'urgent' and urgency != 'urgent':
                    continue
                elif priority_filter == 'soon' and urgency not in ['urgent', 'soon']:
                    continue
                elif priority_filter == 'low_stock' and not rec.get('should_reorder'):
                    continue
                
                recommendations.append(recommendation_item)
                
                # Categorize
                if urgency == 'urgent':
                    urgent_products.append(recommendation_item)
                    urgent_count += 1
                elif urgency == 'soon':
                    soon_products.append(recommendation_item)
                    soon_count += 1
                
                if summary.get('trend') == 'increasing':
                    trending_up_products.append(recommendation_item)
                
                # Calculate totals
                if rec.get('should_reorder'):
                    products_need_reorder += 1
                    order_value = float(product.price) * int(rec.get('suggested_order_quantity', 0))
                    total_order_value += order_value
                    
            except Exception as e:
                # Skip products that fail
                continue
        
        # Sort recommendations by urgency
        urgency_order = {'urgent': 0, 'soon': 1, 'normal': 2, 'not_needed': 3}
        recommendations.sort(key=lambda x: urgency_order.get(x['reorder_urgency'], 4))
        
        # Calculate average stock days
        avg_stock_days = total_stock_days / analyzed_count if analyzed_count > 0 else 0
        
        return {
            'retailer_id': retailer_id,
            'generated_at': timezone.now().isoformat(),
            'forecast_period_days': forecast_days,
            'summary': {
                'total_products_analyzed': len(recommendations),
                'products_need_reorder': products_need_reorder,
                'urgent_reorders': urgent_count,
                'soon_reorders': soon_count,
                'total_suggested_order_value': round(total_order_value, 2),
                'average_stock_days_remaining': round(avg_stock_days, 1)
            },
            'recommendations': recommendations,
            'urgent_products': urgent_products[:5],  # Top 5 urgent
            'soon_products': soon_products[:5],  # Top 5 soon
            'trending_up_products': trending_up_products[:5]  # Top 5 trending
        }
