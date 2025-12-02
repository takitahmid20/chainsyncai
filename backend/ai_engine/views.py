"""
AI Engine Views
API endpoints for AI-powered features: demand forecasting, auto-order, insights
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .services import DemandForecastService
from .serializers import (
    DemandForecastRequestSerializer,
    DemandForecastResponseSerializer,
    AIInsightsRequestSerializer,
    AIInsightsResponseSerializer
)


class DemandForecastView(APIView):
    """
    POST /api/ai/demand-forecast/
    
    Generate AI-powered demand forecast for a product using xAI Grok.
    
    Analyzes historical sales data, current inventory, and market trends
    to predict future demand and provide actionable recommendations.
    
    **Required permissions:** Authenticated users (retailers)
    
    **Request Body:**
    ```json
    {
        "product_id": 1,
        "forecast_days": 30
    }
    ```
    
    **Response:**
    ```json
    {
        "product_id": 1,
        "product_name": "Product Name",
        "current_price": 100.50,
        "current_stock": 50,
        "forecast_period_days": 30,
        "generated_at": "2025-11-28T10:00:00Z",
        "forecast_summary": {
            "predicted_total_demand": 150,
            "predicted_daily_average": 5.0,
            "confidence_level": "high",
            "trend": "increasing"
        },
        "recommendations": {
            "should_reorder": true,
            "suggested_order_quantity": 100,
            "reorder_urgency": "soon",
            "estimated_stockout_date": "2025-12-15",
            "risk_assessment": "medium"
        },
        "insights": [
            "Sales trend shows steady growth",
            "Current stock will last approximately 10 days"
        ]
    }
    ```
    """
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        request=DemandForecastRequestSerializer,
        responses={
            200: DemandForecastResponseSerializer,
            400: {'description': 'Invalid request'},
            500: {'description': 'AI service error'}
        },
        tags=['AI Engine'],
        summary='Generate demand forecast using AI',
        description='Uses xAI Grok to analyze sales history and predict future demand'
    )
    def post(self, request):
        """Generate demand forecast for a product"""
        
        # Validate request
        serializer = DemandForecastRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Invalid request', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        product_id = serializer.validated_data['product_id']
        forecast_days = serializer.validated_data.get('forecast_days', 30)
        
        # Get retailer ID if user is retailer
        retailer_id = None
        if hasattr(request.user, 'retailer_profile'):
            retailer_id = request.user.retailer_profile.id
        
        try:
            # Call AI service
            forecast_data = DemandForecastService.forecast_product_demand(
                product_id=product_id,
                forecast_days=forecast_days,
                retailer_id=retailer_id
            )
            
            # Check for errors in forecast
            if 'error' in forecast_data:
                return Response(
                    forecast_data,
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Return forecast
            return Response(forecast_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {
                    'error': 'Demand forecasting failed',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AIInsightsView(APIView):
    """
    POST /api/ai/insights/
    
    Analyze ALL products for a retailer and return prioritized recommendations.
    
    This endpoint analyzes the retailer's entire inventory, forecasts demand for
    each product, and returns a comprehensive list of recommendations sorted by
    priority (urgent → soon → normal → not needed).
    
    **Perfect for:** AI Insights Dashboard, Reorder Recommendations Page
    
    **Required permissions:** Authenticated retailers
    
    **Request Body:**
    ```json
    {
        "forecast_days": 30,
        "priority_filter": "all",
        "max_products": 20
    }
    ```
    
    **Query Parameters:**
    - `forecast_days` (optional, default: 30): Days to forecast (7-90)
    - `priority_filter` (optional, default: "all"): 
      - "all": All products
      - "urgent": Only urgent reorders
      - "soon": Urgent + soon
      - "low_stock": Products needing reorder
    - `max_products` (optional, default: 20): Maximum products to analyze (5-50)
      - Lower = Faster response (e.g., 10 products = ~30 seconds)
      - Higher = More comprehensive (e.g., 50 products = ~3-4 minutes)
    
    **Response:**
    ```json
    {
        "retailer_id": 1,
        "generated_at": "2025-11-28T10:00:00Z",
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
                "product_name": "Premium Rice",
                "current_stock": 10,
                "predicted_demand": 60,
                "should_reorder": true,
                "suggested_order_quantity": 50,
                "reorder_urgency": "urgent",
                "days_until_stockout": 3,
                "quick_insight": "⚠️ URGENT: Stock running out in 3 days!"
            },
            ...
        ],
        "urgent_products": [...],
        "soon_products": [...],
        "trending_up_products": [...]
    }
    ```
    """
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        request=AIInsightsRequestSerializer,
        responses={
            200: AIInsightsResponseSerializer,
            400: {'description': 'Invalid request'},
            403: {'description': 'Retailer access required'},
            500: {'description': 'AI service error'}
        },
        tags=['AI Engine'],
        summary='Get AI insights for all products',
        description='Analyzes all retailer products and returns prioritized reorder recommendations'
    )
    def post(self, request):
        """Get AI insights and recommendations for all retailer products"""
        
        # Check if user is retailer
        if not hasattr(request.user, 'retailer_profile'):
            return Response(
                {'error': 'Only retailers can access AI insights'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validate request
        serializer = AIInsightsRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Invalid request', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        forecast_days = serializer.validated_data.get('forecast_days', 30)
        priority_filter = serializer.validated_data.get('priority_filter', 'all')
        max_products = serializer.validated_data.get('max_products', 20)
        retailer_id = request.user.retailer_profile.id
        
        try:
            # Call AI service to analyze all products
            insights_data = DemandForecastService.get_retailer_insights(
                retailer_id=retailer_id,
                forecast_days=forecast_days,
                priority_filter=priority_filter,
                max_products=max_products
            )
            
            return Response(insights_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {
                    'error': 'AI insights generation failed',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
