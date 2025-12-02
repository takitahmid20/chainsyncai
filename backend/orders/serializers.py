from rest_framework import serializers
from .models import Order, OrderItem, Cart, CartItem
from products.models import Product
from products.serializers import ProductListSerializer
import uuid
from django.utils import timezone


class OrderItemSerializer(serializers.ModelSerializer):
    product_details = ProductListSerializer(source='product', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_price', 
            'quantity', 'subtotal', 'product_details'
        ]
        read_only_fields = ['id', 'product_name', 'product_price', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    retailer_name = serializers.CharField(source='retailer.retailer_profile.shop_name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.supplier_profile.business_name', read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    total_quantity = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'retailer', 'retailer_name', 
            'supplier', 'supplier_name', 'status', 'subtotal', 
            'tax', 'delivery_fee', 'total_amount', 'delivery_address',
            'delivery_contact', 'delivery_notes', 'items', 'total_items',
            'total_quantity', 'created_at', 'updated_at', 'accepted_at', 
            'delivered_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'retailer', 'supplier', 
            'subtotal', 'total_amount', 'created_at', 'updated_at',
            'accepted_at', 'delivered_at'
        ]


class OrderCreateSerializer(serializers.Serializer):
    """Serializer for creating orders from cart"""
    delivery_address = serializers.CharField()
    delivery_contact = serializers.CharField(max_length=20)
    delivery_notes = serializers.CharField(required=False, allow_blank=True)
    supplier_id = serializers.IntegerField()
    
    def validate_supplier_id(self, value):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            supplier = User.objects.get(id=value, user_type='supplier')
        except User.DoesNotExist:
            raise serializers.ValidationError("Supplier not found")
        return value


class CartItemSerializer(serializers.ModelSerializer):
    product_details = ProductListSerializer(source='product', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'subtotal', 'product_details', 'created_at']
        read_only_fields = ['id', 'subtotal', 'created_at']
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value
    
    def validate_product(self, value):
        """Validate that product exists and is available"""
        try:
            product = Product.objects.get(pk=value.pk)
            if product.status != 'active':
                raise serializers.ValidationError("This product is not available")
            return value
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found")
    
    def validate(self, data):
        product = data.get('product')
        quantity = data.get('quantity', 1)
        
        # Ensure product is a Product instance
        if isinstance(product, int):
            try:
                product = Product.objects.get(pk=product)
            except Product.DoesNotExist:
                raise serializers.ValidationError({
                    'product': "Product not found"
                })
        
        # Check stock availability
        if quantity > product.stock_quantity:
            raise serializers.ValidationError({
                'quantity': f"Only {product.stock_quantity} items available in stock"
            })
        
        # Check minimum order quantity
        if quantity < product.minimum_order_quantity:
            raise serializers.ValidationError({
                'quantity': f"Minimum order quantity is {product.minimum_order_quantity}"
            })
        
        return data


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_items', 'total_amount', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
