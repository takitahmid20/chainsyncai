from rest_framework import serializers
from .models import Product, ProductImage, ProductCategory
from django.utils.text import slugify


class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ['id', 'name', 'slug', 'description']
        read_only_fields = ['id', 'slug']


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_image(self, obj):
        if obj.image:
            # Return Cloudinary URL directly
            return obj.image.url
        return None


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.supplier_profile.business_name', read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'category', 'category_name',
            'price', 'discount_price', 'unit', 'stock_quantity', 
            'minimum_order_quantity', 'sku', 'brand', 'status', 
            'is_featured', 'supplier_name', 'images', 'discount_percentage',
            'is_available', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'supplier_name', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Auto-generate slug from name
        validated_data['slug'] = slugify(validated_data['name'])
        
        # Add supplier from request context
        validated_data['supplier'] = self.context['request'].user
        
        return super().create(validated_data)
    
    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock quantity cannot be negative")
        return value
    
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value
    
    def validate(self, data):
        # Check discount price is less than price
        if data.get('discount_price') and data.get('price'):
            if data['discount_price'] >= data['price']:
                raise serializers.ValidationError({
                    'discount_price': 'Discount price must be less than regular price'
                })
        return data


class ProductListSerializer(serializers.ModelSerializer):
    """Simplified serializer for product listings"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.supplier_profile.business_name', read_only=True)
    supplier = serializers.IntegerField(source='supplier.id', read_only=True)
    primary_image = serializers.SerializerMethodField()
    discount_percentage = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category_name', 'price', 
            'discount_price', 'discount_percentage', 'unit', 
            'stock_quantity', 'status', 'supplier', 'supplier_name', 
            'primary_image', 'is_featured', 'images'
        ]
    
    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if primary:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary.image.url)
        return None
