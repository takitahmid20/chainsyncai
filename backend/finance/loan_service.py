"""
Loan Suggestion Service
Analyzes retailer's sales data and provides personalized loan recommendations
"""

from decimal import Decimal
from datetime import datetime, timedelta
from django.db.models import Sum, Avg, Count, Q
from django.utils import timezone
from sales.models import DailySale
from orders.models import Order
from .models import LoanSuggestion


class LoanSuggestionService:
    """Service for generating loan suggestions based on sales data"""
    
    # Loan configuration
    MIN_LOAN_AMOUNT = Decimal('10000')  # ৳10,000
    MAX_LOAN_AMOUNT = Decimal('500000')  # ৳5,00,000
    BASE_INTEREST_RATE = Decimal('12.0')  # 12% annual
    
    # Risk thresholds
    LOW_RISK_THRESHOLD = 70
    MEDIUM_RISK_THRESHOLD = 50
    
    def __init__(self, retailer):
        self.retailer = retailer
        self.today = timezone.now().date()
    
    def generate_suggestion(self):
        """Generate comprehensive loan suggestion"""
        
        # Get business metrics
        metrics = self._calculate_business_metrics()
        
        if not metrics['has_sufficient_data']:
            return {
                'eligible': False,
                'reason': 'Insufficient sales history. Please complete at least 3 months of sales to qualify for loan suggestions.',
                'metrics': metrics
            }
        
        # Calculate credit score
        credit_score = self._calculate_credit_score(metrics)
        
        # Determine risk level
        risk_level = self._determine_risk_level(credit_score)
        
        # Calculate loan amount
        loan_details = self._calculate_loan_amount(metrics, risk_level)
        
        # Calculate repayment terms
        repayment_terms = self._calculate_repayment_terms(
            loan_details['suggested_amount'],
            risk_level
        )
        
        # Generate recommendation notes
        notes = self._generate_recommendation_notes(metrics, credit_score)
        
        # Create or update loan suggestion
        suggestion, created = LoanSuggestion.objects.update_or_create(
            retailer=self.retailer,
            defaults={
                'suggested_amount': loan_details['suggested_amount'],
                'min_amount': loan_details['min_amount'],
                'max_amount': loan_details['max_amount'],
                'risk_level': risk_level,
                'credit_score': credit_score,
                'avg_monthly_sales': metrics['avg_monthly_sales'],
                'avg_monthly_orders': metrics['avg_monthly_orders'],
                'business_stability_score': metrics['stability_score'],
                'payment_history_score': metrics['payment_score'],
                'suggested_tenure_months': repayment_terms['tenure'],
                'estimated_monthly_payment': repayment_terms['monthly_payment'],
                'interest_rate': repayment_terms['interest_rate'],
                'eligibility_reason': self._get_eligibility_reason(credit_score, risk_level),
                'recommendation_notes': notes,
            }
        )
        
        return {
            'eligible': True,
            'suggestion': {
                'id': suggestion.id,
                'suggested_amount': float(suggestion.suggested_amount),
                'min_amount': float(suggestion.min_amount),
                'max_amount': float(suggestion.max_amount),
                'risk_level': suggestion.risk_level,
                'credit_score': suggestion.credit_score,
                'tenure_months': suggestion.suggested_tenure_months,
                'monthly_payment': float(suggestion.estimated_monthly_payment),
                'interest_rate': float(suggestion.interest_rate),
                'eligibility_reason': suggestion.eligibility_reason,
                'recommendation_notes': suggestion.recommendation_notes,
            },
            'metrics': metrics,
            'repayment_schedule': self._generate_repayment_schedule(
                loan_details['suggested_amount'],
                repayment_terms['interest_rate'],
                repayment_terms['tenure']
            )
        }
    
    def _calculate_business_metrics(self):
        """Calculate key business metrics from sales data"""
        
        # Get sales data for last 90 days
        ninety_days_ago = self.today - timedelta(days=90)
        
        sales_data = DailySale.objects.filter(
            retailer=self.retailer,
            sale_date__gte=ninety_days_ago
        )
        
        total_sales = sales_data.aggregate(
            total_amount=Sum('total_amount'),
            total_quantity=Sum('quantity_sold'),
            sales_days=Count('sale_date', distinct=True)
        )
        
        # Get order data
        orders_data = Order.objects.filter(
            retailer=self.retailer,
            created_at__gte=ninety_days_ago
        ).aggregate(
            total_orders=Count('id'),
            total_order_value=Sum('total_amount'),
            completed_orders=Count('id', filter=Q(status='delivered'))
        )
        
        # Calculate metrics
        has_sufficient_data = (
            total_sales['sales_days'] and total_sales['sales_days'] >= 30
        )
        
        avg_monthly_sales = Decimal('0')
        if total_sales['total_amount']:
            days_with_data = total_sales['sales_days'] or 1
            avg_monthly_sales = (total_sales['total_amount'] / days_with_data) * 30
        
        avg_monthly_orders = 0
        if orders_data['total_orders']:
            avg_monthly_orders = int((orders_data['total_orders'] / 90) * 30)
        
        # Calculate stability score (consistency of sales)
        stability_score = self._calculate_stability_score(sales_data)
        
        # Calculate payment history score (order completion rate)
        payment_score = 0
        if orders_data['total_orders'] and orders_data['total_orders'] > 0:
            completion_rate = (orders_data['completed_orders'] or 0) / orders_data['total_orders']
            payment_score = int(completion_rate * 100)
        else:
            payment_score = 50  # Neutral score if no order history
        
        return {
            'has_sufficient_data': has_sufficient_data,
            'total_sales_90d': float(total_sales['total_amount'] or 0),
            'avg_monthly_sales': float(avg_monthly_sales),
            'avg_monthly_orders': avg_monthly_orders,
            'sales_days': total_sales['sales_days'] or 0,
            'stability_score': stability_score,
            'payment_score': payment_score,
            'total_orders': orders_data['total_orders'] or 0,
            'completed_orders': orders_data['completed_orders'] or 0,
        }
    
    def _calculate_stability_score(self, sales_data):
        """Calculate business stability score based on sales consistency"""
        
        # Get weekly sales variance
        weekly_sales = []
        for week in range(12):  # Last 12 weeks
            week_start = self.today - timedelta(days=(week + 1) * 7)
            week_end = week_start + timedelta(days=7)
            
            week_total = sales_data.filter(
                sale_date__gte=week_start,
                sale_date__lt=week_end
            ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
            
            weekly_sales.append(float(week_total))
        
        if not weekly_sales or sum(weekly_sales) == 0:
            return 0
        
        # Calculate coefficient of variation
        avg_sales = sum(weekly_sales) / len(weekly_sales)
        variance = sum((x - avg_sales) ** 2 for x in weekly_sales) / len(weekly_sales)
        std_dev = variance ** 0.5
        
        if avg_sales == 0:
            return 0
        
        cv = std_dev / avg_sales  # Coefficient of variation
        
        # Lower CV = higher stability (inverse relationship)
        # CV of 0 = 100 score, CV of 1+ = 0 score
        stability_score = max(0, min(100, int((1 - cv) * 100)))
        
        return stability_score
    
    def _calculate_credit_score(self, metrics):
        """Calculate credit score (0-100) based on business metrics"""
        
        # Weighted scoring
        sales_score = min(40, int((metrics['avg_monthly_sales'] / 50000) * 40))
        stability_score = int(metrics['stability_score'] * 0.3)
        payment_score = int(metrics['payment_score'] * 0.3)
        
        credit_score = sales_score + stability_score + payment_score
        
        return min(100, max(0, credit_score))
    
    def _determine_risk_level(self, credit_score):
        """Determine risk level based on credit score"""
        
        if credit_score >= self.LOW_RISK_THRESHOLD:
            return 'low'
        elif credit_score >= self.MEDIUM_RISK_THRESHOLD:
            return 'medium'
        else:
            return 'high'
    
    def _calculate_loan_amount(self, metrics, risk_level):
        """Calculate suggested loan amount based on business metrics"""
        
        # Base loan on 2-3 months of average sales
        avg_monthly = Decimal(str(metrics['avg_monthly_sales']))
        
        if risk_level == 'low':
            multiplier = Decimal('3.0')
        elif risk_level == 'medium':
            multiplier = Decimal('2.0')
        else:
            multiplier = Decimal('1.5')
        
        suggested = avg_monthly * multiplier
        
        # Apply bounds
        suggested = max(self.MIN_LOAN_AMOUNT, min(self.MAX_LOAN_AMOUNT, suggested))
        
        # Round to nearest 5000
        suggested = (suggested // 5000) * 5000
        
        # Calculate min and max
        min_amount = max(self.MIN_LOAN_AMOUNT, suggested * Decimal('0.5'))
        max_amount = min(self.MAX_LOAN_AMOUNT, suggested * Decimal('1.5'))
        
        return {
            'suggested_amount': suggested,
            'min_amount': (min_amount // 5000) * 5000,
            'max_amount': (max_amount // 5000) * 5000,
        }
    
    def _calculate_repayment_terms(self, loan_amount, risk_level):
        """Calculate repayment terms based on loan amount and risk"""
        
        # Adjust interest rate based on risk
        if risk_level == 'low':
            interest_rate = self.BASE_INTEREST_RATE
            tenure = 12  # 1 year
        elif risk_level == 'medium':
            interest_rate = self.BASE_INTEREST_RATE + Decimal('2.0')
            tenure = 9  # 9 months
        else:
            interest_rate = self.BASE_INTEREST_RATE + Decimal('4.0')
            tenure = 6  # 6 months
        
        # Calculate monthly payment using EMI formula
        monthly_rate = interest_rate / Decimal('100') / Decimal('12')
        
        if monthly_rate > 0:
            emi = loan_amount * monthly_rate * (
                (1 + monthly_rate) ** tenure
            ) / (
                ((1 + monthly_rate) ** tenure) - 1
            )
        else:
            emi = loan_amount / tenure
        
        return {
            'tenure': tenure,
            'interest_rate': interest_rate,
            'monthly_payment': emi.quantize(Decimal('0.01'))
        }
    
    def _generate_repayment_schedule(self, principal, annual_rate, months):
        """Generate month-by-month repayment schedule"""
        
        monthly_rate = annual_rate / Decimal('100') / Decimal('12')
        
        if monthly_rate > 0:
            emi = principal * monthly_rate * (
                (1 + monthly_rate) ** months
            ) / (
                ((1 + monthly_rate) ** months) - 1
            )
        else:
            emi = principal / months
        
        schedule = []
        balance = principal
        
        for month in range(1, months + 1):
            interest = balance * monthly_rate
            principal_payment = emi - interest
            balance -= principal_payment
            
            schedule.append({
                'month': month,
                'emi': float(emi.quantize(Decimal('0.01'))),
                'principal': float(principal_payment.quantize(Decimal('0.01'))),
                'interest': float(interest.quantize(Decimal('0.01'))),
                'balance': float(max(Decimal('0'), balance).quantize(Decimal('0.01')))
            })
        
        return schedule
    
    def _get_eligibility_reason(self, credit_score, risk_level):
        """Generate eligibility reason based on score"""
        
        if credit_score >= self.LOW_RISK_THRESHOLD:
            return "Excellent! Your consistent sales history and strong business performance make you eligible for our best loan terms."
        elif credit_score >= self.MEDIUM_RISK_THRESHOLD:
            return "Good! Your business shows steady growth. You qualify for a loan with competitive terms."
        else:
            return "Your business is growing! You qualify for a starter loan. Build your sales history for better terms."
    
    def _generate_recommendation_notes(self, metrics, credit_score):
        """Generate personalized recommendation notes"""
        
        notes = []
        
        # Sales performance
        if metrics['avg_monthly_sales'] >= 50000:
            notes.append("✓ Strong monthly sales performance")
        elif metrics['avg_monthly_sales'] >= 25000:
            notes.append("• Good sales growth potential")
        else:
            notes.append("• Build your sales volume for higher loan amounts")
        
        # Business stability
        if metrics['stability_score'] >= 70:
            notes.append("✓ Excellent business stability")
        elif metrics['stability_score'] >= 50:
            notes.append("• Moderate business consistency")
        else:
            notes.append("• Work on maintaining consistent sales")
        
        # Payment history
        if metrics['payment_score'] >= 80:
            notes.append("✓ Strong payment track record")
        elif metrics['payment_score'] >= 60:
            notes.append("• Good order completion rate")
        else:
            notes.append("• Complete more orders to improve score")
        
        # Recommendation
        if credit_score >= 70:
            notes.append("\nRecommendation: Consider using the loan for inventory expansion or bulk purchasing to maximize discounts.")
        elif credit_score >= 50:
            notes.append("\nRecommendation: Use the loan for working capital to stock high-demand products.")
        else:
            notes.append("\nRecommendation: Start with a smaller loan amount and build your credit score for better terms in the future.")
        
        return "\n".join(notes)
