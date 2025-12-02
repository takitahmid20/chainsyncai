from django.urls import path
from .views import (
    InventoryListView,
    StockUpdateView,
    LowStockView,
    AIRestockSuggestionsView,
    BulkRestockView,
    InventoryLogsView,
)

urlpatterns = [
    # GET /api/inventory/ - List all inventory items
    path('', InventoryListView.as_view(), name='inventory-list'),
    
    # POST /api/inventory/update/ - Update stock quantity
    path('update/', StockUpdateView.as_view(), name='inventory-update'),
    
    # GET /api/inventory/low-stock/ - Get low stock items
    path('low-stock/', LowStockView.as_view(), name='inventory-low-stock'),
    
    # GET /api/inventory/ai-suggestions/ - Get AI restock suggestions
    path('ai-suggestions/', AIRestockSuggestionsView.as_view(), name='inventory-ai-suggestions'),
    
    # POST /api/inventory/bulk-restock/ - Process bulk restock
    path('bulk-restock/', BulkRestockView.as_view(), name='inventory-bulk-restock'),
    
    # GET /api/inventory/logs/ - Get inventory logs
    path('logs/', InventoryLogsView.as_view(), name='inventory-logs'),
]
