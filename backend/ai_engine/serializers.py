"""
AI Engine Serializers
"""

from rest_framework import serializers


class DemandForecastRequestSerializer(serializers.Serializer):
    """Serializer for demand forecast request"""
    product_id = serializers.IntegerField(required=True, help_text="Product ID to forecast")
    forecast_days = serializers.IntegerField(
        required=False, 
        default=30, 
        min_value=7, 
        max_value=90,
        help_text="Number of days to forecast (7-90)"
    )


class WeeklyForecastSerializer(serializers.Serializer):
    """Serializer for weekly forecast data"""
    week = serializers.IntegerField()
    predicted_demand = serializers.FloatField()
    min_demand = serializers.FloatField()
    max_demand = serializers.FloatField()


class ForecastSummarySerializer(serializers.Serializer):
    """Serializer for forecast summary"""
    predicted_total_demand = serializers.FloatField()
    predicted_daily_average = serializers.FloatField()
    confidence_level = serializers.ChoiceField(choices=['high', 'medium', 'low'])
    trend = serializers.ChoiceField(choices=['increasing', 'stable', 'decreasing'])


class RecommendationSerializer(serializers.Serializer):
    """Serializer for AI recommendations"""
    should_reorder = serializers.BooleanField()
    suggested_order_quantity = serializers.FloatField()
    reorder_urgency = serializers.ChoiceField(
        choices=['urgent', 'soon', 'normal', 'not_needed']
    )
    estimated_stockout_date = serializers.CharField(allow_null=True)
    risk_assessment = serializers.ChoiceField(choices=['high', 'medium', 'low'])


class DemandForecastResponseSerializer(serializers.Serializer):
    """Serializer for demand forecast response"""
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    current_price = serializers.FloatField()
    current_stock = serializers.IntegerField()
    forecast_period_days = serializers.IntegerField()
    generated_at = serializers.DateTimeField()
    
    forecast_summary = ForecastSummarySerializer()
    weekly_forecast = WeeklyForecastSerializer(many=True, required=False)
    recommendations = RecommendationSerializer()
    insights = serializers.ListField(child=serializers.CharField())
    factors_considered = serializers.ListField(child=serializers.CharField(), required=False)
    
    # Optional error fields
    error = serializers.CharField(required=False)
    raw_response = serializers.CharField(required=False)


# ============================================
# AI Insights Serializers (All Products Analysis)
# ============================================

class AIInsightsRequestSerializer(serializers.Serializer):
    """Request serializer for AI insights - analyzes all retailer products"""
    forecast_days = serializers.IntegerField(
        required=False, 
        default=30, 
        min_value=7, 
        max_value=90,
        help_text="Number of days to forecast"
    )
    priority_filter = serializers.ChoiceField(
        choices=['all', 'urgent', 'soon', 'low_stock'],
        required=False,
        default='all',
        help_text="Filter recommendations by priority"
    )
    max_products = serializers.IntegerField(
        required=False,
        default=20,
        min_value=5,
        max_value=50,
        help_text="Maximum products to analyze (5-50, default 20 for faster response)"
    )


class ProductRecommendationItemSerializer(serializers.Serializer):
    """Individual product recommendation in the insights list"""
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    product_category = serializers.CharField(allow_null=True)
    current_stock = serializers.IntegerField()
    current_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    # Forecast data
    predicted_demand = serializers.IntegerField()
    predicted_daily_average = serializers.FloatField()
    trend = serializers.ChoiceField(choices=['increasing', 'stable', 'decreasing'])
    confidence_level = serializers.ChoiceField(choices=['high', 'medium', 'low'])
    
    # Recommendation
    should_reorder = serializers.BooleanField()
    suggested_order_quantity = serializers.IntegerField()
    reorder_urgency = serializers.ChoiceField(
        choices=['urgent', 'soon', 'normal', 'not_needed']
    )
    risk_assessment = serializers.ChoiceField(choices=['high', 'medium', 'low'])
    estimated_stockout_date = serializers.CharField(allow_null=True)
    
    # Additional info
    days_until_stockout = serializers.IntegerField(allow_null=True)
    quick_insight = serializers.CharField()


class AIInsightsSummarySerializer(serializers.Serializer):
    """Summary statistics for all products analysis"""
    total_products_analyzed = serializers.IntegerField()
    products_need_reorder = serializers.IntegerField()
    urgent_reorders = serializers.IntegerField()
    soon_reorders = serializers.IntegerField()
    total_suggested_order_value = serializers.DecimalField(max_digits=12, decimal_places=2)
    average_stock_days_remaining = serializers.FloatField()


class AIInsightsResponseSerializer(serializers.Serializer):
    """Response serializer for AI insights - list of all product recommendations"""
    retailer_id = serializers.IntegerField()
    generated_at = serializers.CharField()
    forecast_period_days = serializers.IntegerField()
    
    summary = AIInsightsSummarySerializer()
    recommendations = ProductRecommendationItemSerializer(many=True)
    
    # Categorized lists
    urgent_products = ProductRecommendationItemSerializer(many=True)
    soon_products = ProductRecommendationItemSerializer(many=True)
    trending_up_products = ProductRecommendationItemSerializer(many=True)


# ============================================
# AI Orders Serializers
# ============================================

class AIOrderItemSerializer(serializers.Serializer):
    """Serializer for items in an AI order"""
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    product_image = serializers.CharField(allow_null=True)
    quantity = serializers.IntegerField()
    unit_price = serializers.FloatField()
    subtotal = serializers.FloatField()
    predicted_demand = serializers.IntegerField()
    current_shop_stock = serializers.IntegerField()
    days_until_stockout = serializers.IntegerField(allow_null=True)
    urgency = serializers.ChoiceField(choices=['urgent', 'soon', 'normal', 'not_needed'])


class AIOrderSerializer(serializers.Serializer):
    """Serializer for AI-generated order suggestion"""
    id = serializers.CharField()
    type = serializers.CharField()
    supplier_id = serializers.IntegerField()
    supplier_name = serializers.CharField()
    title = serializers.CharField()
    reason = serializers.CharField()
    confidence_score = serializers.IntegerField()
    total_items = serializers.IntegerField()
    total_quantity = serializers.IntegerField()
    total_amount = serializers.FloatField()
    items = AIOrderItemSerializer(many=True)
    forecast_period_days = serializers.IntegerField()
    estimated_delivery_days = serializers.CharField()
    generated_at = serializers.CharField()
    expires_at = serializers.CharField()
    insights = serializers.ListField(child=serializers.CharField())


class AIOrdersRequestSerializer(serializers.Serializer):
    """Request serializer for AI orders"""
    max_orders = serializers.IntegerField(
        required=False,
        default=5,
        min_value=1,
        max_value=10,
        help_text="Maximum number of order suggestions (1-10)"
    )


class ApproveAIOrderRequestSerializer(serializers.Serializer):
    """Request serializer for approving AI order"""
    ai_order_id = serializers.CharField(required=True)
    delivery_address = serializers.CharField(required=False, allow_blank=True)
    delivery_contact = serializers.CharField(required=False, allow_blank=True)
    delivery_notes = serializers.CharField(required=False, allow_blank=True)
