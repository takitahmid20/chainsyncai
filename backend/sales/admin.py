from django.contrib import admin
from .models import DailySale, DailySalesSummary


@admin.register(DailySale)
class DailySaleAdmin(admin.ModelAdmin):
    list_display = ['product', 'retailer', 'quantity_sold', 'total_amount', 'sale_date']
    list_filter = ['sale_date', 'retailer']
    search_fields = ['product__name', 'retailer__email']
    date_hierarchy = 'sale_date'
    readonly_fields = ['total_amount', 'sale_date', 'created_at']
    
    fieldsets = (
        ('Sale Information', {
            'fields': ('retailer', 'product', 'quantity_sold', 'unit_price', 'total_amount')
        }),
        ('Date Information', {
            'fields': ('sale_date', 'created_at')
        }),
    )


@admin.register(DailySalesSummary)
class DailySalesSummaryAdmin(admin.ModelAdmin):
    list_display = ['retailer', 'sale_date', 'total_sales', 'total_items_sold', 'total_revenue']
    list_filter = ['sale_date', 'retailer']
    search_fields = ['retailer__email']
    date_hierarchy = 'sale_date'
    readonly_fields = ['updated_at']
