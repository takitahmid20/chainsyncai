from rest_framework import serializers
from .models import DailySale, DailySalesSummary
from products.models import Product


class DailySaleSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    
    class Meta:
        model = DailySale
        fields = [
            'id',
            'product',
            'product_name',
            'product_sku',
            'quantity_sold',
            'unit_price',
            'total_amount',
            'sale_date',
            'created_at'
        ]
        read_only_fields = ['total_amount', 'sale_date', 'created_at']
    
    def validate(self, data):
        product = data.get('product')
        quantity_sold = data.get('quantity_sold')
        
        # Check if product has enough stock
        if product.stock_quantity < quantity_sold:
            raise serializers.ValidationError({
                'quantity_sold': f'Insufficient stock. Available: {product.stock_quantity}'
            })
        
        # Set unit price from product if not provided
        if 'unit_price' not in data or not data['unit_price']:
            data['unit_price'] = product.discount_price if product.discount_price else product.price
        
        return data
    
    def create(self, validated_data):
        product = validated_data['product']
        quantity_sold = validated_data['quantity_sold']
        
        # Deduct stock
        product.stock_quantity -= quantity_sold
        product.save()
        
        # Create sale record
        sale = DailySale.objects.create(**validated_data)
        
        # Update daily summary
        self._update_daily_summary(sale)
        
        return sale
    
    def _update_daily_summary(self, sale):
        """Update or create daily sales summary"""
        from django.db.models import F
        
        summary, created = DailySalesSummary.objects.get_or_create(
            retailer=sale.retailer,
            sale_date=sale.sale_date,
            defaults={
                'total_sales': 0,
                'total_items_sold': 0,
                'total_revenue': 0,
            }
        )
        
        # Update summary
        summary.total_sales = F('total_sales') + 1
        summary.total_items_sold = F('total_items_sold') + sale.quantity_sold
        summary.total_revenue = F('total_revenue') + sale.total_amount
        summary.save()


class DailySalesSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = DailySalesSummary
        fields = [
            'id',
            'sale_date',
            'total_sales',
            'total_items_sold',
            'total_revenue',
            'updated_at'
        ]
        read_only_fields = ['updated_at']
