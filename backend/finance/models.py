from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()


class LoanSuggestion(models.Model):
    """Store loan suggestions for retailers"""
    
    RISK_LEVELS = [
        ('low', 'Low Risk'),
        ('medium', 'Medium Risk'),
        ('high', 'High Risk'),
    ]
    
    retailer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='loan_suggestions'
    )
    
    # Loan Details
    suggested_amount = models.DecimalField(max_digits=10, decimal_places=2)
    min_amount = models.DecimalField(max_digits=10, decimal_places=2)
    max_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Risk Assessment
    risk_level = models.CharField(max_length=20, choices=RISK_LEVELS)
    credit_score = models.IntegerField(default=0)  # 0-100
    
    # Business Metrics
    avg_monthly_sales = models.DecimalField(max_digits=10, decimal_places=2)
    avg_monthly_orders = models.IntegerField()
    business_stability_score = models.IntegerField(default=0)  # 0-100
    payment_history_score = models.IntegerField(default=0)  # 0-100
    
    # Repayment Terms
    suggested_tenure_months = models.IntegerField()  # 3, 6, 12, 24
    estimated_monthly_payment = models.DecimalField(max_digits=10, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)  # Annual rate
    
    # Additional Info
    eligibility_reason = models.TextField()
    recommendation_notes = models.TextField()
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Loan Suggestion'
        verbose_name_plural = 'Loan Suggestions'
    
    def __str__(self):
        return f"Loan Suggestion for {self.retailer.email} - ৳{self.suggested_amount}"


class LoanInquiry(models.Model):
    """Track when retailers view loan suggestions"""
    
    retailer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='loan_inquiries'
    )
    suggestion = models.ForeignKey(
        LoanSuggestion,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-viewed_at']
        verbose_name = 'Loan Inquiry'
        verbose_name_plural = 'Loan Inquiries'
    
    def __str__(self):
        return f"Inquiry by {self.retailer.email} at {self.viewed_at}"
