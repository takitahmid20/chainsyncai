from django.db import models
from products.models import Product


class InventoryLog(models.Model):
    """Track inventory changes for products"""
    
    ACTION_CHOICES = [
        ('add', 'Stock Added'),
        ('remove', 'Stock Removed'),
        ('order', 'Order Placed'),
        ('return', 'Product Returned'),
        ('adjust', 'Manual Adjustment'),
    ]
    
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='inventory_logs'
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    quantity = models.IntegerField()
    previous_stock = models.IntegerField()
    new_stock = models.IntegerField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'inventory_logs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.product.name} - {self.action} ({self.quantity})"
