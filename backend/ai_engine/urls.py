"""
AI Engine URLs
"""

from django.urls import path
from .views import (
    DemandForecastView, 
    AIInsightsView, 
    AIOrdersView, 
    ApproveAIOrderView, 
    LightGBMForecastView,
    SmartProductAnalysisView
)

urlpatterns = [
    # AI Insights - Analyze all products for retailer
    path('insights/', AIInsightsView.as_view(), name='ai-insights'),
    
    # Demand Forecasting - Single product analysis
    path('forecast/', DemandForecastView.as_view(), name='demand-forecast'),
    path('demand-forecast/', DemandForecastView.as_view(), name='demand-forecast-alt'),  # Legacy support
    
    # LightGBM Forecasting - Advanced ML-based forecasting
    path('forecast/lightgbm/', LightGBMForecastView.as_view(), name='lightgbm-forecast'),
    
    # Smart Product Analysis - Auto-analyze all products with AI
    path('analysis/smart/', SmartProductAnalysisView.as_view(), name='smart-product-analysis'),
    
    # AI Orders - Generate smart order suggestions
    path('orders/', AIOrdersView.as_view(), name='ai-orders'),
    path('orders/approve/', ApproveAIOrderView.as_view(), name='approve-ai-order'),
]
