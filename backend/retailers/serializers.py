from rest_framework import serializers
from .models import RetailerProfile


class RetailerProfileSerializer(serializers.ModelSerializer):
    """Serializer for retailer profile"""
    
    class Meta:
        model = RetailerProfile
        fields = [
            'id',
            'shop_name',
            'owner_name',
            'shop_address',
            'business_category',
            'is_profile_complete',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'is_profile_complete', 'created_at', 'updated_at']
    
    def validate(self, data):
        # Ensure all required fields are provided
        required_fields = ['shop_name', 'owner_name', 'shop_address', 'business_category']
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError({field: 'This field is required'})
        return data
