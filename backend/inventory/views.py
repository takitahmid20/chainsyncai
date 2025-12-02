from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Sum, Count, F
from django.db import transaction
from datetime import datetime, timedelta

from products.models import Product
from sales.models import DailySale
from .models import InventoryLog
from .serializers import (
    InventoryProductSerializer,
    InventoryLogSerializer,
    StockUpdateSerializer,
    AIRestockSuggestionSerializer,
    BulkRestockSerializer,
)


class InventoryPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class InventoryListView(APIView):
    """
    GET /api/inventory/
    Get all products in retailer's inventory with stock status (paginated)
    """
    permission_classes = [IsAuthenticated]
    pagination_class = InventoryPagination
    
    def get(self, request):
        # Get retailer's products from orders or create mock inventory
        retailer = request.user
        
        # For now, get all products the retailer might be interested in
        # In production, this would be filtered by retailer's actual inventory
        products = Product.objects.filter(
            status__in=['active', 'out_of_stock']
        ).select_related('category', 'supplier').order_by('-created_at')
        
        # Apply filters
        search = request.query_params.get('search', '')
        category = request.query_params.get('category', '')
        stock_status = request.query_params.get('stock_status', '')
        
        if search:
            products = products.filter(
                Q(name__icontains=search) | 
                Q(sku__icontains=search) |
                Q(brand__icontains=search)
            )
        
        if category and category != 'all':
            products = products.filter(category__slug=category)
        
        if stock_status and stock_status != 'all':
            if stock_status == 'out':
                products = products.filter(stock_quantity=0)
            elif stock_status == 'low':
                products = products.filter(
                    stock_quantity__gt=0,
                    stock_quantity__lte=F('minimum_order_quantity')
                )
            elif stock_status == 'good':
                products = products.filter(
                    stock_quantity__gt=F('minimum_order_quantity')
                )
        
        # Calculate summary stats (before pagination)
        total_products = products.count()
        low_stock = products.filter(
            stock_quantity__gt=0,
            stock_quantity__lte=F('minimum_order_quantity')
        ).count()
        out_of_stock = products.filter(stock_quantity=0).count()
        in_stock = products.filter(
            stock_quantity__gt=F('minimum_order_quantity')
        ).count()
        
        # Apply pagination
        paginator = InventoryPagination()
        paginated_products = paginator.paginate_queryset(products, request, view=self)
        
        if paginated_products is not None:
            serializer = InventoryProductSerializer(paginated_products, many=True)
            return Response({
                'count': paginator.page.paginator.count,
                'next': paginator.get_next_link(),
                'previous': paginator.get_previous_link(),
                'total_pages': paginator.page.paginator.num_pages,
                'current_page': paginator.page.number,
                'page_size': paginator.page_size,
                'products': serializer.data,
                'summary': {
                    'total_products': total_products,
                    'in_stock': in_stock,
                    'low_stock': low_stock,
                    'out_of_stock': out_of_stock,
                }
            })
        
        # Fallback if pagination fails
        serializer = InventoryProductSerializer(products, many=True)
        
        return Response({
            'count': paginator.page.paginator.count,
            'next': paginator.get_next_link(),
            'previous': paginator.get_previous_link(),
            'total_pages': paginator.page.paginator.num_pages,
            'current_page': paginator.page.number,
            'page_size': paginator.page_size,
            'products': serializer.data,
            'summary': {
                'total_products': total_products,
                'in_stock': in_stock,
                'low_stock': low_stock,
                'out_of_stock': out_of_stock,
            }
        })


class StockUpdateView(APIView):
    """
    POST /api/inventory/update/
    Update stock quantity for a product
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = StockUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = serializer.validated_data
        
        try:
            product = Product.objects.get(id=data['product_id'])
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        with transaction.atomic():
            previous_stock = product.stock_quantity
            
            # Calculate new stock
            if data['action'] == 'add':
                new_stock = previous_stock + data['quantity']
            elif data['action'] == 'remove':
                new_stock = max(0, previous_stock - data['quantity'])
            else:  # adjust
                new_stock = data['quantity']
            
            # Update product
            product.stock_quantity = new_stock
            
            # Update status
            if new_stock == 0:
                product.status = 'out_of_stock'
            elif product.status == 'out_of_stock' and new_stock > 0:
                product.status = 'active'
            
            product.save()
            
            # Create inventory log
            InventoryLog.objects.create(
                product=product,
                action=data['action'],
                quantity=data['quantity'],
                previous_stock=previous_stock,
                new_stock=new_stock,
                notes=data.get('notes', '')
            )
        
        return Response({
            'message': 'Stock updated successfully',
            'product': InventoryProductSerializer(product).data
        })


class LowStockView(APIView):
    """
    GET /api/inventory/low-stock/
    Get products with low or out of stock
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get products with low stock
        low_stock_products = Product.objects.filter(
            status__in=['active', 'out_of_stock'],
            stock_quantity__lte=F('minimum_order_quantity')
        ).select_related('category', 'supplier').order_by('stock_quantity')
        
        serializer = InventoryProductSerializer(low_stock_products, many=True)
        
        return Response({
            'products': serializer.data,
            'count': low_stock_products.count()
        })


class AIRestockSuggestionsView(APIView):
    """
    GET /api/inventory/ai-suggestions/
    Get AI-powered restock suggestions based on sales data
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        retailer = request.user
        
        # Get low stock products
        low_stock_products = Product.objects.filter(
            status__in=['active', 'out_of_stock'],
            stock_quantity__lte=F('minimum_order_quantity')
        ).select_related('category', 'supplier')
        
        suggestions = []
        
        for product in low_stock_products:
            # Skip products where stock is less than minimum order quantity
            # These can't be ordered anyway due to validation
            if product.stock_quantity < product.minimum_order_quantity:
                continue
            
            # Calculate suggested quantity based on sales data
            last_30_days = datetime.now().date() - timedelta(days=30)
            
            # Get sales data
            sales_data = DailySale.objects.filter(
                retailer=retailer,
                product=product,
                sale_date__gte=last_30_days
            ).aggregate(
                total_sold=Sum('quantity_sold'),
                avg_daily_sales=Sum('quantity_sold') / 30.0
            )
            
            total_sold = sales_data.get('total_sold') or 0
            avg_daily_sales = sales_data.get('avg_daily_sales') or 0
            
            # Determine priority
            if product.stock_quantity == 0:
                priority = 'high'
                reason = 'Out of stock - Critical reorder needed'
            elif product.stock_quantity < product.minimum_order_quantity / 2:
                priority = 'high'
                reason = f'Very low stock - Only {product.stock_quantity} units remaining'
            else:
                priority = 'medium'
                reason = f'Below minimum threshold - Restock recommended'
            
            # Calculate suggested quantity
            # Aim for 30 days of stock based on sales
            if total_sold > 0:
                suggested_qty = int(avg_daily_sales * 30)
                if suggested_qty > 0:
                    reason += f' • Avg daily sales: {avg_daily_sales:.1f} units'
            else:
                # No sales data, suggest minimum order quantity
                suggested_qty = product.minimum_order_quantity * 2
            
            # Ensure suggested quantity is at least minimum order quantity
            suggested_qty = max(suggested_qty, product.minimum_order_quantity)
            
            # Cap suggested quantity to available stock (important!)
            # Retailers can only order what suppliers have in stock
            if suggested_qty > product.stock_quantity and product.stock_quantity > 0:
                suggested_qty = product.stock_quantity
                reason += f' • Limited to available stock: {product.stock_quantity} units'
            
            # Calculate max stock (3x minimum)
            max_stock = product.minimum_order_quantity * 3
            
            suggestions.append({
                'product_id': product.id,
                'product_name': product.name,
                'product_sku': product.sku or f'PRD-{product.id}',
                'current_stock': product.stock_quantity,
                'min_stock': product.minimum_order_quantity,
                'max_stock': max_stock,
                'suggested_quantity': suggested_qty,
                'priority': priority,
                'reason': reason,
                'unit_price': float(product.discount_price or product.price),
                'estimated_cost': float((product.discount_price or product.price) * suggested_qty),
            })
        
        # Sort by priority (high first) and then by stock quantity
        priority_order = {'high': 0, 'medium': 1, 'low': 2}
        suggestions.sort(key=lambda x: (priority_order[x['priority']], x['current_stock']))
        
        serializer = AIRestockSuggestionSerializer(suggestions, many=True)
        
        # Calculate totals
        total_items = len(suggestions)
        total_units = sum(s['suggested_quantity'] for s in suggestions)
        total_cost = sum(s['estimated_cost'] for s in suggestions)
        high_priority = sum(1 for s in suggestions if s['priority'] == 'high')
        
        return Response({
            'suggestions': serializer.data,
            'summary': {
                'total_items': total_items,
                'total_units': total_units,
                'total_cost': float(total_cost),
                'high_priority_count': high_priority,
            }
        })


class BulkRestockView(APIView):
    """
    POST /api/inventory/bulk-restock/
    Process bulk restock order from AI suggestions
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = BulkRestockSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        items = serializer.validated_data['items']
        retailer = request.user
        
        success_count = 0
        failed_items = []
        
        with transaction.atomic():
            for item in items:
                try:
                    product = Product.objects.get(id=item['product_id'])
                    
                    # Update stock
                    previous_stock = product.stock_quantity
                    new_stock = previous_stock + item['quantity']
                    product.stock_quantity = new_stock
                    
                    # Update status
                    if new_stock > 0 and product.status == 'out_of_stock':
                        product.status = 'active'
                    
                    product.save()
                    
                    # Create inventory log
                    InventoryLog.objects.create(
                        product=product,
                        action='order',
                        quantity=item['quantity'],
                        previous_stock=previous_stock,
                        new_stock=new_stock,
                        notes='Bulk restock from AI suggestions'
                    )
                    
                    success_count += 1
                    
                except Product.DoesNotExist:
                    failed_items.append({
                        'product_id': item['product_id'],
                        'error': 'Product not found'
                    })
                except Exception as e:
                    failed_items.append({
                        'product_id': item['product_id'],
                        'error': str(e)
                    })
        
        return Response({
            'message': f'Successfully restocked {success_count} items',
            'success_count': success_count,
            'failed_count': len(failed_items),
            'failed_items': failed_items if failed_items else None
        })


class InventoryLogsView(APIView):
    """
    GET /api/inventory/logs/
    Get inventory change logs
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        product_id = request.query_params.get('product_id')
        
        logs = InventoryLog.objects.select_related('product').all()
        
        if product_id:
            logs = logs.filter(product_id=product_id)
        
        # Limit to last 100 logs
        logs = logs[:100]
        
        serializer = InventoryLogSerializer(logs, many=True)
        
        return Response({
            'logs': serializer.data,
            'count': logs.count()
        })
