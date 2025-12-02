from django.urls import path
from .views import (
    RecordSaleView,
    DailySalesListView,
    SalesSummaryView,
    SalesAnalyticsView
)

urlpatterns = [
    # Record a sale (deduct stock)
    path('record/', RecordSaleView.as_view(), name='record_sale'),
    
    # Get sales list
    path('daily/', DailySalesListView.as_view(), name='daily_sales'),
    
    # Get sales summary
    path('summary/', SalesSummaryView.as_view(), name='sales_summary'),
    
    # Get analytics
    path('analytics/', SalesAnalyticsView.as_view(), name='sales_analytics'),
]
