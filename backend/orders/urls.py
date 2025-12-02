from django.urls import path
from .views import (
    CartView,
    CartItemView,
    OrderListCreateView,
    OrderDetailView,
    OrderStatusUpdateView
)

urlpatterns = [
    # Cart endpoints
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/items/', CartItemView.as_view(), name='cart_add_item'),
    path('cart/items/<int:item_id>/', CartItemView.as_view(), name='cart_item_update'),
    
    # Order endpoints
    path('', OrderListCreateView.as_view(), name='orders'),
    path('<int:order_id>/', OrderDetailView.as_view(), name='order_detail'),
    path('<int:order_id>/status/', OrderStatusUpdateView.as_view(), name='order_status_update'),
]
