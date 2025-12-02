from django.urls import path
from .views import (
    SupplierProductListCreateView,
    SupplierProductDetailView,
    ProductImageUploadView,
    RetailerProductListView,
    RetailerProductDetailView,
    ProductCategoryListView
)

urlpatterns = [
    # Supplier endpoints
    path('supplier/products/', SupplierProductListCreateView.as_view(), name='supplier_products'),
    path('supplier/products/<int:pk>/', SupplierProductDetailView.as_view(), name='supplier_product_detail'),
    path('supplier/products/<int:product_id>/images/', ProductImageUploadView.as_view(), name='product_image_upload'),
    path('supplier/products/<int:product_id>/images/<int:image_id>/', ProductImageUploadView.as_view(), name='product_image_delete'),
    
    # Retailer endpoints
    path('retailer/products/', RetailerProductListView.as_view(), name='retailer_products'),
    path('retailer/products/<slug:slug>/', RetailerProductDetailView.as_view(), name='retailer_product_detail'),
    
    # Common
    path('categories/', ProductCategoryListView.as_view(), name='product_categories'),
]
