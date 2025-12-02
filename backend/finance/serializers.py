from rest_framework import serializers
from .models import LoanSuggestion, LoanInquiry


class LoanSuggestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanSuggestion
        fields = [
            'id', 'suggested_amount', 'min_amount', 'max_amount',
            'risk_level', 'credit_score', 'avg_monthly_sales',
            'avg_monthly_orders', 'business_stability_score',
            'payment_history_score', 'suggested_tenure_months',
            'estimated_monthly_payment', 'interest_rate',
            'eligibility_reason', 'recommendation_notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LoanInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanInquiry
        fields = ['id', 'viewed_at']
        read_only_fields = ['id', 'viewed_at']
