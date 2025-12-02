from rest_framework import status, generics, filters
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Product, ProductImage, ProductCategory
from .serializers import (
    ProductSerializer, 
    ProductListSerializer, 
    ProductImageSerializer,
    ProductCategorySerializer
)


class SupplierProductListCreateView(generics.ListCreateAPIView):
    """Supplier can list their products and create new ones"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status']
    search_fields = ['name', 'description', 'sku']
    ordering_fields = ['created_at', 'price', 'stock_quantity']
    ordering = ['-created_at']
    
    def get_queryset(self):
        # Only show supplier's own products
        return Product.objects.filter(supplier=self.request.user).select_related('category')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductSerializer
        return ProductListSerializer
    
    def perform_create(self, serializer):
        # Check if user is supplier
        if self.request.user.user_type != 'supplier':
            raise PermissionError("Only suppliers can create products")
        serializer.save()


class SupplierProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Supplier can view, update, or delete their product"""
    permission_classes = [IsAuthenticated]
    serializer_class = ProductSerializer
    
    def get_queryset(self):
        # Only allow supplier to access their own products
        return Product.objects.filter(supplier=self.request.user)


class ProductImageUploadView(APIView):
    """Upload images for a product"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id, supplier=request.user)
        except Product.DoesNotExist:
            return Response({
                'error': 'Product not found or you do not have permission'
            }, status=status.HTTP_404_NOT_FOUND)
        
        image = request.FILES.get('image')
        is_primary = request.data.get('is_primary', 'false').lower() == 'true'
        
        if not image:
            return Response({
                'error': 'No image provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # If setting as primary, unset other primary images
        if is_primary:
            ProductImage.objects.filter(product=product, is_primary=True).update(is_primary=False)
        
        product_image = ProductImage.objects.create(
            product=product,
            image=image,
            is_primary=is_primary
        )
        
        serializer = ProductImageSerializer(product_image, context={'request': request})
        return Response({
            'message': 'Image uploaded successfully',
            'image': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    def delete(self, request, product_id, image_id):
        try:
            product = Product.objects.get(id=product_id, supplier=request.user)
            image = ProductImage.objects.get(id=image_id, product=product)
            image.delete()
            return Response({
                'message': 'Image deleted successfully'
            }, status=status.HTTP_200_OK)
        except (Product.DoesNotExist, ProductImage.DoesNotExist):
            return Response({
                'error': 'Image not found'
            }, status=status.HTTP_404_NOT_FOUND)


class RetailerProductListView(generics.ListAPIView):
    """Retailers can browse all active products from all suppliers"""
    permission_classes = [IsAuthenticated]
    serializer_class = ProductListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'supplier']
    search_fields = ['name', 'description', 'brand']
    ordering_fields = ['created_at', 'price', 'name']
    ordering = ['-created_at']
    
    def get_queryset(self):
        # Only show active products with stock
        queryset = Product.objects.filter(
            status='active',
            stock_quantity__gt=0
        ).select_related('category', 'supplier__supplier_profile')
        
        # Filter by category slug if provided
        category_slug = self.request.query_params.get('category_slug')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        return queryset


class RetailerProductDetailView(generics.RetrieveAPIView):
    """Retailers can view product details"""
    permission_classes = [IsAuthenticated]
    serializer_class = ProductSerializer
    lookup_field = 'slug'
    
    def get_queryset(self):
        return Product.objects.filter(
            status='active',
            stock_quantity__gt=0
        ).select_related('category', 'supplier__supplier_profile')


class ProductCategoryListView(generics.ListAPIView):
    """List all product categories"""
    permission_classes = [IsAuthenticated]
    serializer_class = ProductCategorySerializer
    queryset = ProductCategory.objects.all()
