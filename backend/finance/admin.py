from django.contrib import admin
from .models import LoanSuggestion, LoanInquiry


@admin.register(LoanSuggestion)
class LoanSuggestionAdmin(admin.ModelAdmin):
    list_display = [
        'retailer', 'suggested_amount', 'risk_level', 
        'credit_score', 'created_at'
    ]
    list_filter = ['risk_level', 'created_at']
    search_fields = ['retailer__email', 'retailer__retailer_profile__shop_name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Retailer', {
            'fields': ('retailer',)
        }),
        ('Loan Details', {
            'fields': (
                'suggested_amount', 'min_amount', 'max_amount',
                'suggested_tenure_months', 'estimated_monthly_payment',
                'interest_rate'
            )
        }),
        ('Risk Assessment', {
            'fields': (
                'risk_level', 'credit_score', 'business_stability_score',
                'payment_history_score'
            )
        }),
        ('Business Metrics', {
            'fields': ('avg_monthly_sales', 'avg_monthly_orders')
        }),
        ('Recommendations', {
            'fields': ('eligibility_reason', 'recommendation_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(LoanInquiry)
class LoanInquiryAdmin(admin.ModelAdmin):
    list_display = ['retailer', 'viewed_at', 'suggestion']
    list_filter = ['viewed_at']
    search_fields = ['retailer__email']
    readonly_fields = ['viewed_at']
