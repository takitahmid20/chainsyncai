from rest_framework import serializers
from .models import SupplierProfile


class SupplierProfileSerializer(serializers.ModelSerializer):
    """Serializer for supplier profile"""
    
    class Meta:
        model = SupplierProfile
        fields = [
            'id',
            'business_name',
            'supplier_type',
            'business_address',
            'main_product_category',
            'is_profile_complete',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'is_profile_complete', 'created_at', 'updated_at']
    
    def validate(self, data):
        # Ensure all required fields are provided
        required_fields = ['business_name', 'supplier_type', 'business_address', 'main_product_category']
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError({field: 'This field is required'})
        return data
