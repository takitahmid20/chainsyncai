from django.db import models
from django.conf import settings
from products.models import Product


class DailySale(models.Model):
    """Track daily sales for retailers - local shop sales"""
    
    retailer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='daily_sales',
        limit_choices_to={'user_type': 'retailer'}
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='daily_sales'
    )
    quantity_sold = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    sale_date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'daily_sales'
        verbose_name = 'Daily Sale'
        verbose_name_plural = 'Daily Sales'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['retailer', 'sale_date']),
            models.Index(fields=['product', 'sale_date']),
        ]
    
    def __str__(self):
        return f"{self.product.name} - {self.quantity_sold} units on {self.sale_date}"
    
    def save(self, *args, **kwargs):
        # Calculate total amount
        self.total_amount = self.quantity_sold * self.unit_price
        super().save(*args, **kwargs)


class DailySalesSummary(models.Model):
    """Daily summary of sales for quick analytics"""
    
    retailer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='daily_summaries',
        limit_choices_to={'user_type': 'retailer'}
    )
    sale_date = models.DateField()
    total_sales = models.IntegerField(default=0)  # Total number of sales
    total_items_sold = models.IntegerField(default=0)  # Total items/units sold
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'daily_sales_summary'
        verbose_name = 'Daily Sales Summary'
        verbose_name_plural = 'Daily Sales Summaries'
        unique_together = ['retailer', 'sale_date']
        ordering = ['-sale_date']
    
    def __str__(self):
        return f"{self.retailer.email} - {self.sale_date}"
