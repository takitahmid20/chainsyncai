from rest_framework import serializers
from products.models import Product
from .models import InventoryLog


class InventoryProductSerializer(serializers.ModelSerializer):
    """Serializer for product inventory view"""
    stock_status = serializers.SerializerMethodField()
    stock_percentage = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'sku',
            'slug',
            'category_name',
            'category_slug',
            'stock_quantity',
            'minimum_order_quantity',
            'price',
            'discount_price',
            'unit',
            'brand',
            'status',
            'stock_status',
            'stock_percentage',
            'created_at',
            'updated_at',
        ]
    
    def get_stock_status(self, obj):
        """Determine stock status based on quantity"""
        if obj.stock_quantity == 0:
            return 'out'
        elif obj.stock_quantity <= obj.minimum_order_quantity:
            return 'low'
        else:
            return 'good'
    
    def get_stock_percentage(self, obj):
        """Calculate stock percentage (assuming max stock is 3x minimum)"""
        if obj.minimum_order_quantity == 0:
            return 100
        max_stock = obj.minimum_order_quantity * 3
        return min(100, int((obj.stock_quantity / max_stock) * 100))


class InventoryLogSerializer(serializers.ModelSerializer):
    """Serializer for inventory logs"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    
    class Meta:
        model = InventoryLog
        fields = [
            'id',
            'product',
            'product_name',
            'product_sku',
            'action',
            'quantity',
            'previous_stock',
            'new_stock',
            'notes',
            'created_at',
        ]
        read_only_fields = ['created_at']


class StockUpdateSerializer(serializers.Serializer):
    """Serializer for stock update requests"""
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField()
    action = serializers.ChoiceField(choices=['add', 'remove', 'adjust'])
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value


class AIRestockSuggestionSerializer(serializers.Serializer):
    """Serializer for AI-powered restock suggestions"""
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    product_sku = serializers.CharField()
    current_stock = serializers.IntegerField()
    min_stock = serializers.IntegerField()
    max_stock = serializers.IntegerField()
    suggested_quantity = serializers.IntegerField()
    priority = serializers.ChoiceField(choices=['high', 'medium', 'low'])
    reason = serializers.CharField()
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    estimated_cost = serializers.DecimalField(max_digits=10, decimal_places=2)


class BulkRestockSerializer(serializers.Serializer):
    """Serializer for bulk restock requests"""
    items = serializers.ListField(
        child=serializers.DictField(child=serializers.IntegerField())
    )
    
    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Items list cannot be empty")
        
        for item in value:
            if 'product_id' not in item or 'quantity' not in item:
                raise serializers.ValidationError("Each item must have product_id and quantity")
            
            if item['quantity'] <= 0:
                raise serializers.ValidationError("Quantity must be greater than 0")
        
        return value
