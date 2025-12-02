"""
AI Engine URLs
"""

from django.urls import path
from .views import DemandForecastView, AIInsightsView

urlpatterns = [
    # AI Insights - Analyze all products for retailer
    path('insights/', AIInsightsView.as_view(), name='ai-insights'),
    
    # Demand Forecasting - Single product analysis
    path('demand-forecast/', DemandForecastView.as_view(), name='demand-forecast'),
]
