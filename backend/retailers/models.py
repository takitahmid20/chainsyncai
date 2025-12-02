from django.db import models
from django.conf import settings


class RetailerProfile(models.Model):
    """Retailer profile with required fields for MVP"""
    
    BUSINESS_CATEGORY_CHOICES = [
        ('grocery', 'Grocery'),
        ('pharmacy', 'Pharmacy'),
        ('cosmetics', 'Cosmetics'),
        ('electronics', 'Electronics'),
        ('general_store', 'General Store'),
        ('online', 'Online'),
    ]
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='retailer_profile'
    )
    shop_name = models.CharField(max_length=255)
    owner_name = models.CharField(max_length=255)
    shop_address = models.TextField()
    business_category = models.CharField(
        max_length=50,
        choices=BUSINESS_CATEGORY_CHOICES
    )
    
    # Additional fields
    is_profile_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'retailer_profiles'
        verbose_name = 'Retailer Profile'
        verbose_name_plural = 'Retailer Profiles'
    
    def __str__(self):
        return f"{self.shop_name} - {self.user.email}"
    
    def save(self, *args, **kwargs):
        # Auto-mark profile as complete if all required fields are filled
        if self.shop_name and self.owner_name and self.shop_address and self.business_category:
            self.is_profile_complete = True
        super().save(*args, **kwargs)
