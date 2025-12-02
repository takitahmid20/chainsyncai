from django.db import models
from django.conf import settings


class SupplierProfile(models.Model):
    """Supplier profile with required fields for MVP"""
    
    SUPPLIER_TYPE_CHOICES = [
        ('wholesaler', 'Wholesaler'),
        ('distributor', 'Distributor'),
        ('manufacturer', 'Manufacturer'),
    ]
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='supplier_profile'
    )
    business_name = models.CharField(max_length=255)
    supplier_type = models.CharField(
        max_length=50,
        choices=SUPPLIER_TYPE_CHOICES
    )
    business_address = models.TextField()
    main_product_category = models.CharField(max_length=255)
    
    # Additional fields
    is_profile_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'supplier_profiles'
        verbose_name = 'Supplier Profile'
        verbose_name_plural = 'Supplier Profiles'
    
    def __str__(self):
        return f"{self.business_name} - {self.user.email}"
    
    def save(self, *args, **kwargs):
        # Auto-mark profile as complete if all required fields are filled
        if self.business_name and self.supplier_type and self.business_address and self.main_product_category:
            self.is_profile_complete = True
        super().save(*args, **kwargs)
