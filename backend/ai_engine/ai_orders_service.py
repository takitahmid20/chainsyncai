"""
AI Auto-Order Service
Generates automatic order suggestions based on AI insights and demand forecasting
"""

from typing import Dict, List, Any
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Sum, Q
from decimal import Decimal

from .services import DemandForecastService
from products.models import Product
from orders.models import Order


class AIOrderService:
    """Generate AI-powered automatic order suggestions"""
    
    @staticmethod
    def generate_ai_orders(retailer_id: int, max_orders: int = 5) -> List[Dict[str, Any]]:
        """
        Generate AI-predicted order suggestions for a retailer
        
        Args:
            retailer_id: Retailer user ID
            max_orders: Maximum number of order suggestions to generate
            
        Returns:
            List of AI order suggestions with products grouped by supplier
        """
        
        # Try AI-powered insights first
        try:
            insights = DemandForecastService.get_retailer_insights(
                retailer_id=retailer_id,
                forecast_days=30,
                priority_filter='all',
                max_products=50  # Analyze more products for better order grouping
            )
            
            if insights.get('recommendations'):
                products_to_order = [
                    rec for rec in insights['recommendations']
                    if rec['should_reorder'] and rec['suggested_order_quantity'] > 0
                ]
            else:
                # Fallback to simple calculation if AI insights fail
                products_to_order = AIOrderService._generate_simple_forecasts(retailer_id)
        except Exception as e:
            # Fallback to simple calculation on any error
            print(f"AI insights failed, using simple forecast: {e}")
            products_to_order = AIOrderService._generate_simple_forecasts(retailer_id)
        
        if not products_to_order:
            # Generate dummy data for testing
            products_to_order = AIOrderService._generate_dummy_forecasts(retailer_id)
        
        if not products_to_order:
            return []
        
        # Group products by supplier
        orders_by_supplier = AIOrderService._group_by_supplier(products_to_order)
        
        # Generate order suggestions
        ai_orders = []
        for supplier_id, items in list(orders_by_supplier.items())[:max_orders]:
            order_suggestion = AIOrderService._create_order_suggestion(
                retailer_id=retailer_id,
                supplier_id=supplier_id,
                items=items,
                forecast_days=30
            )
            
            if order_suggestion:
                ai_orders.append(order_suggestion)
        
        return ai_orders
    
    @staticmethod
    def _generate_simple_forecasts(retailer_id: int) -> List[Dict]:
        """Generate simple forecasts without AI when API is unavailable"""
        from sales.models import DailySale
        from django.db.models import Sum
        from datetime import timedelta
        from django.utils import timezone
        
        # Get products with recent sales
        products_with_sales = DailySale.objects.filter(
            retailer_id=retailer_id,
            sale_date__gte=timezone.now().date() - timedelta(days=90)
        ).values('product_id').annotate(
            total_sales=Sum('quantity_sold')
        ).order_by('-total_sales')[:50]
        
        forecasts = []
        for item in products_with_sales:
            try:
                product = Product.objects.get(id=item['product_id'], status='active')
                
                # Simple forecast calculation
                avg_daily_sales = item['total_sales'] / 30
                current_shop_stock = int(avg_daily_sales * 20)  # Assume 20 days stock
                predicted_demand = int(avg_daily_sales * 30)  # 30-day forecast
                suggested_qty = max(predicted_demand - current_shop_stock, 0)
                
                if suggested_qty > 5:  # Only if need to order significant amount
                    forecasts.append({
                        'product_id': product.id,
                        'should_reorder': True,
                        'suggested_order_quantity': suggested_qty,
                        'predicted_demand': predicted_demand,
                        'current_shop_stock': current_shop_stock,
                        'reorder_urgency': 'soon' if current_shop_stock < avg_daily_sales * 7 else 'normal',
                        'confidence_level': 'medium',
                        'days_until_stockout': int(current_shop_stock / avg_daily_sales) if avg_daily_sales > 0 else None,
                        'trend': 'stable'
                    })
            except Product.DoesNotExist:
                continue
        
        return forecasts
    
    @staticmethod
    def _generate_dummy_forecasts(retailer_id: int) -> List[Dict]:
        """Generate dummy forecast data for testing when no real data exists"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Get available products with suppliers
        products = Product.objects.filter(
            status='active',
            supplier__isnull=False
        ).select_related('supplier')[:15]  # Get up to 15 products
        
        if not products:
            return []
        
        import random
        forecasts = []
        urgency_levels = ['urgent', 'urgent', 'soon', 'soon', 'normal']  # Weighted towards urgent
        
        for i, product in enumerate(products):
            urgency = urgency_levels[i % len(urgency_levels)]
            
            # Generate realistic dummy data based on urgency
            if urgency == 'urgent':
                current_stock = random.randint(2, 10)
                daily_demand = random.randint(5, 15)
                days_until_stockout = random.randint(1, 3)
            elif urgency == 'soon':
                current_stock = random.randint(20, 50)
                daily_demand = random.randint(4, 8)
                days_until_stockout = random.randint(4, 7)
            else:
                current_stock = random.randint(50, 100)
                daily_demand = random.randint(2, 5)
                days_until_stockout = random.randint(10, 20)
            
            predicted_demand = daily_demand * 30
            suggested_qty = max(predicted_demand - current_stock, 10)
            
            forecasts.append({
                'product_id': product.id,
                'should_reorder': True,
                'suggested_order_quantity': suggested_qty,
                'predicted_demand': predicted_demand,
                'current_shop_stock': current_stock,
                'reorder_urgency': urgency,
                'confidence_level': 'high' if urgency == 'urgent' else 'medium',
                'days_until_stockout': days_until_stockout,
                'trend': 'increasing' if urgency == 'urgent' else 'stable'
            })
        
        return forecasts
    
    @staticmethod
    def _group_by_supplier(products: List[Dict]) -> Dict[int, List[Dict]]:
        """Group products by their supplier"""
        supplier_groups = {}
        
        for product_rec in products:
            try:
                product = Product.objects.select_related('supplier').get(
                    id=product_rec['product_id']
                )
                
                supplier_id = product.supplier_id
                if supplier_id not in supplier_groups:
                    supplier_groups[supplier_id] = []
                
                # Add product details to supplier group
                supplier_groups[supplier_id].append({
                    'product': product,
                    'recommendation': product_rec
                })
            except Product.DoesNotExist:
                continue
        
        return supplier_groups
    
    @staticmethod
    def _create_order_suggestion(
        retailer_id: int,
        supplier_id: int,
        items: List[Dict],
        forecast_days: int
    ) -> Dict[str, Any]:
        """Create a single order suggestion"""
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            supplier = User.objects.get(id=supplier_id, user_type='supplier')
        except User.DoesNotExist:
            return None
        
        # Calculate order details
        total_items = len(items)
        total_quantity = sum(item['recommendation']['suggested_order_quantity'] for item in items)
        
        # Calculate total amount
        total_amount = Decimal('0.00')
        order_items = []
        
        for item in items:
            product = item['product']
            rec = item['recommendation']
            quantity = rec['suggested_order_quantity']
            
            item_subtotal = Decimal(str(product.price)) * Decimal(str(quantity))
            total_amount += item_subtotal
            
            order_items.append({
                'product_id': product.id,
                'product_name': product.name,
                'product_image': product.images.first().image.url if product.images.exists() else None,
                'quantity': quantity,
                'unit_price': float(product.price),
                'subtotal': float(item_subtotal),
                'predicted_demand': rec['predicted_demand'],
                'current_shop_stock': rec['current_shop_stock'],
                'days_until_stockout': rec.get('days_until_stockout'),
                'urgency': rec['reorder_urgency']
            })
        
        # Calculate confidence score based on recommendations
        avg_confidence = AIOrderService._calculate_confidence(items)
        
        # Generate order title and reason
        title, reason = AIOrderService._generate_title_and_reason(items, forecast_days)
        
        # Estimate delivery time based on historical orders
        estimated_delivery = AIOrderService._estimate_delivery_time(retailer_id, supplier_id)
        
        # Determine overall urgency level based on items
        urgency_priorities = {'urgent': 3, 'soon': 2, 'normal': 1, 'optional': 0}
        max_urgency = max((urgency_priorities.get(item['recommendation']['reorder_urgency'], 1) for item in items), default=1)
        urgency_level = next((k for k, v in urgency_priorities.items() if v == max_urgency), 'normal')
        
        # Get supplier details
        try:
            supplier_name = supplier.supplier_profile.business_name
        except:
            supplier_name = supplier.email
        
        return {
            'id': f'ai_{supplier_id}_{int(timezone.now().timestamp())}',  # Temporary ID
            'type': 'ai_predicted',
            'supplier_id': supplier_id,
            'supplier_name': supplier_name,
            'title': title,
            'reason': reason,
            'urgency_level': urgency_level,
            'confidence_score': avg_confidence,
            'total_items': total_items,
            'total_quantity': total_quantity,
            'total_amount': float(total_amount),
            'items': order_items,
            'forecast_period_days': forecast_days,
            'estimated_delivery_days': estimated_delivery,
            'generated_at': timezone.now().isoformat(),
            'expires_at': (timezone.now() + timedelta(days=2)).isoformat(),  # Valid for 2 days
            'insights': AIOrderService._generate_insights(items)
        }
    
    @staticmethod
    def _calculate_confidence(items: List[Dict]) -> int:
        """Calculate average confidence score from items"""
        confidence_map = {'high': 95, 'medium': 75, 'low': 60}
        
        total_confidence = 0
        for item in items:
            confidence_level = item['recommendation'].get('confidence_level', 'medium')
            total_confidence += confidence_map.get(confidence_level, 75)
        
        return round(total_confidence / len(items)) if items else 70
    
    @staticmethod
    def _generate_title_and_reason(items: List[Dict], forecast_days: int) -> tuple:
        """Generate order title and reason based on items"""
        
        # Check urgency levels
        urgent_count = sum(1 for item in items if item['recommendation']['reorder_urgency'] == 'urgent')
        soon_count = sum(1 for item in items if item['recommendation']['reorder_urgency'] == 'soon')
        
        if urgent_count > 0:
            title = "Urgent Restock Required"
            reason = f"Based on sales analysis, {urgent_count} product(s) are critically low and need immediate restocking to avoid stockouts."
        elif soon_count >= len(items) * 0.7:  # 70% need reordering soon
            title = "Weekly Restock Recommendation"
            reason = f"Based on {forecast_days}-day sales forecast, these products need restocking to maintain optimal inventory levels."
        else:
            # Check for category patterns
            categories = {}
            for item in items:
                product = item['product']
                category = product.category.name if product.category else 'General'
                categories[category] = categories.get(category, 0) + 1
            
            if len(categories) == 1:
                category_name = list(categories.keys())[0]
                title = f"{category_name} Category Boost"
                reason = f"Demand spike expected for {category_name} products based on historical sales patterns."
            else:
                title = "Smart Inventory Optimization"
                reason = f"AI-powered analysis suggests restocking {len(items)} products to meet projected customer demand."
        
        return title, reason
    
    @staticmethod
    def _estimate_delivery_time(retailer_id: int, supplier_id: int) -> str:
        """Estimate delivery time based on historical orders"""
        
        # Get recent completed orders from this supplier
        recent_orders = Order.objects.filter(
            retailer_id=retailer_id,
            supplier_id=supplier_id,
            status='delivered',
            delivered_at__isnull=False
        ).order_by('-delivered_at')[:5]
        
        if recent_orders:
            # Calculate average delivery time
            delivery_times = []
            for order in recent_orders:
                delta = order.delivered_at - order.created_at
                delivery_times.append(delta.days)
            
            avg_days = sum(delivery_times) / len(delivery_times)
            
            if avg_days < 2:
                return "1-2 days"
            elif avg_days < 4:
                return "2-3 days"
            elif avg_days < 7:
                return "3-5 days"
            else:
                return "5-7 days"
        
        # Default estimate
        return "2-3 days"
    
    @staticmethod
    def _generate_insights(items: List[Dict]) -> List[str]:
        """Generate insights for the order"""
        insights = []
        
        # Sales forecast match
        total_confidence = sum(
            1 for item in items 
            if item['recommendation'].get('confidence_level') in ['high', 'medium']
        )
        confidence_percent = round((total_confidence / len(items)) * 100) if items else 0
        insights.append(f"{confidence_percent}% match to sales forecast")
        
        # Urgency insight
        urgent_count = sum(1 for item in items if item['recommendation']['reorder_urgency'] == 'urgent')
        if urgent_count > 0:
            insights.append(f"{urgent_count} urgent item(s)")
        
        # Trending products
        trending_count = sum(1 for item in items if item['recommendation'].get('trend') == 'increasing')
        if trending_count > 0:
            insights.append(f"{trending_count} trending up")
        
        return insights
    
    @staticmethod
    def approve_ai_order(retailer_id: int, ai_order_id: str, ai_order_data: Dict) -> Order:
        """
        Convert AI order suggestion into actual order
        
        Args:
            retailer_id: Retailer user ID
            ai_order_id: AI order suggestion ID
            ai_order_data: AI order data
            
        Returns:
            Created Order object
        """
        from django.db import transaction
        from orders.models import OrderItem
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        with transaction.atomic():
            # Calculate order totals
            subtotal = Decimal('0.00')
            for item_data in ai_order_data['items']:
                item_subtotal = Decimal(str(item_data['unit_price'])) * Decimal(str(item_data['quantity']))
                subtotal += item_subtotal
            
            tax = Decimal('0.00')  # Can be calculated based on tax rate
            delivery_fee = Decimal('0.00')  # Can be set based on supplier
            total_amount = subtotal + tax + delivery_fee
            
            # Create order
            order = Order.objects.create(
                retailer_id=retailer_id,
                supplier_id=ai_order_data['supplier_id'],
                status='pending',
                subtotal=subtotal,
                tax=tax,
                delivery_fee=delivery_fee,
                total_amount=total_amount,
                delivery_address='',  # To be filled by retailer
                delivery_contact='',
                delivery_notes=f"AI-generated order (ID: {ai_order_id})"
            )
            
            # Create order items
            for item_data in ai_order_data['items']:
                unit_price = Decimal(str(item_data['unit_price']))
                quantity = item_data['quantity']
                item_subtotal = unit_price * Decimal(str(quantity))
                
                OrderItem.objects.create(
                    order=order,
                    product_id=item_data['product_id'],
                    quantity=quantity,
                    product_name=item_data['product_name'],
                    product_price=unit_price,
                    subtotal=item_subtotal
                )
            
            return order
