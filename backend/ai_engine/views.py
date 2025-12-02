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
from .lightgbm_service import lightgbm_service
from .ai_orders_service import AIOrderService
from .serializers import (
    DemandForecastRequestSerializer,
    DemandForecastResponseSerializer,
    AIInsightsRequestSerializer,
    AIInsightsResponseSerializer,
    AIOrdersRequestSerializer,
    AIOrderSerializer,
    ApproveAIOrderRequestSerializer
)


class DemandForecastView(APIView):
    
    
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
        retailer_id = request.user.id  # Use user ID, not profile ID
        
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


class AIOrdersView(APIView):
    """Generate AI-powered order suggestions"""
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        request=AIOrdersRequestSerializer,
        responses={
            200: AIOrderSerializer(many=True),
            403: {'description': 'Retailer access required'},
            500: {'description': 'AI service error'}
        },
        tags=['AI Engine'],
        summary='Generate AI order suggestions',
        description='Analyzes retailer inventory and generates smart order suggestions grouped by supplier'
    )
    def post(self, request):
        """Get AI-generated order suggestions for retailer"""
        
        # Check if user is retailer
        if not hasattr(request.user, 'retailer_profile'):
            return Response(
                {'error': 'Only retailers can access AI order suggestions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validate request
        serializer = AIOrdersRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Invalid request', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        max_orders = serializer.validated_data.get('max_orders', 5)
        retailer_id = request.user.id
        
        try:
            # Generate AI order suggestions
            ai_orders = AIOrderService.generate_ai_orders(
                retailer_id=retailer_id,
                max_orders=max_orders
            )
            
            return Response(ai_orders, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {
                    'error': 'AI order generation failed',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ApproveAIOrderView(APIView):
    """Approve AI order and convert to actual order"""
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        request=ApproveAIOrderRequestSerializer,
        responses={
            201: {'description': 'Order created successfully'},
            400: {'description': 'Invalid request'},
            403: {'description': 'Retailer access required'},
            404: {'description': 'AI order not found'},
            500: {'description': 'Order creation failed'}
        },
        tags=['AI Engine'],
        summary='Approve AI order suggestion',
        description='Converts AI order suggestion into actual order'
    )
    def post(self, request):
        """Approve AI order and create actual order"""
        
        # Check if user is retailer
        if not hasattr(request.user, 'retailer_profile'):
            return Response(
                {'error': 'Only retailers can approve orders'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        retailer_id = request.user.id
        
        # Get AI order data from request
        ai_order_data = request.data.get('ai_order_data')
        
        if not ai_order_data:
            return Response(
                {'error': 'AI order data is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Create actual order from AI suggestion
            order = AIOrderService.approve_ai_order(
                retailer_id=retailer_id,
                ai_order_id=ai_order_data.get('id'),
                ai_order_data=ai_order_data
            )
            
            # Update delivery details if provided
            if request.data.get('delivery_address'):
                order.delivery_address = request.data['delivery_address']
            if request.data.get('delivery_contact'):
                order.delivery_contact = request.data['delivery_contact']
            if request.data.get('delivery_notes'):
                order.delivery_notes = f"{order.delivery_notes}\n{request.data['delivery_notes']}"
            order.save()
            
            return Response(
                {
                    'message': 'Order created successfully',
                    'order_id': order.id,
                    'total_amount': float(order.total_amount),
                    'total_items': order.items.count()
                },
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            return Response(
                {
                    'error': 'Failed to approve AI order',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LightGBMForecastView(APIView):
    """LightGBM-based demand forecasting endpoint"""
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        request=DemandForecastRequestSerializer,
        responses={
            200: DemandForecastResponseSerializer,
            400: {'description': 'Invalid request'},
            500: {'description': 'Forecasting error'}
        },
        tags=['AI Engine'],
        summary='Generate demand forecast using LightGBM',
        description='Uses LightGBM machine learning model to analyze sales history and predict future demand with high accuracy'
    )
    def post(self, request):
        """Generate LightGBM-based demand forecast for a product"""
        
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
            retailer_id = request.user.id
        else:
            return Response(
                {'error': 'Only retailers can access LightGBM forecasting'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            # Call LightGBM service
            forecast_data = lightgbm_service.predict_demand(
                product_id=product_id,
                retailer_id=retailer_id,
                forecast_days=forecast_days,
                retrain=request.data.get('retrain', False)
            )
            
            # Check for errors
            if 'error' in forecast_data:
                return Response(
                    forecast_data,
                    status=status.HTTP_400_BAD_REQUEST if forecast_data['error'] == 'Insufficient data' else status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            return Response(forecast_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {
                    'error': 'LightGBM forecasting failed',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SmartProductAnalysisView(APIView):
    """AI-powered product demand analysis for all retailer products"""
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        responses={
            200: {
                'description': 'Product analysis completed successfully',
                'example': {
                    'retailer_id': 7,
                    'analysis_date': '2025-12-02T16:00:00Z',
                    'total_products_analyzed': 5,
                    'forecast_period_days': 30,
                    'top_demand_products': [],
                    'reorder_recommendations': [],
                    'low_stock_alerts': [],
                    'summary': {}
                }
            },
            403: {'description': 'Retailer access required'},
            500: {'description': 'Analysis failed'}
        },
        tags=['AI Engine'],
        summary='Smart Product Demand Analysis (Auto)',
        description='Automatically analyzes ALL retailer products using LightGBM, identifies high-demand products, and provides smart reorder recommendations'
    )
    def post(self, request):
        """
        Analyze all retailer products and provide smart recommendations
        No input required - analyzes authenticated retailer's entire inventory
        """
        
        # Check if user is retailer
        if not hasattr(request.user, 'retailer_profile'):
            return Response(
                {'error': 'Only retailers can access smart product analysis'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        retailer_id = request.user.id
        forecast_days = request.data.get('forecast_days', 30)
        top_n = request.data.get('top_products', 10)  # Top N products to highlight
        
        try:
            # Call LightGBM service for smart analysis
            analysis_data = lightgbm_service.analyze_all_products(
                retailer_id=retailer_id,
                forecast_days=forecast_days,
                top_n=top_n
            )
            
            return Response(analysis_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {
                    'error': 'Smart product analysis failed',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

