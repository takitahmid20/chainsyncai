from rest_framework import generics, status, parsers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from datetime import datetime, timedelta
from .models import DailySale, DailySalesSummary
from .serializers import DailySaleSerializer, DailySalesSummarySerializer


class RecordSaleView(generics.CreateAPIView):
    """
    Record a sale and deduct stock
    
    POST /api/sales/record/
    {
        "product": 1,
        "quantity_sold": 2,
        "unit_price": 150.00  // Optional - defaults to product price
    }
    """
    serializer_class = DailySaleSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [parsers.JSONParser, parsers.FormParser, parsers.MultiPartParser]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sale = serializer.save(retailer=request.user)
        
        return Response({
            'success': True,
            'message': 'Sale recorded successfully',
            'sale': DailySaleSerializer(sale).data,
            'remaining_stock': sale.product.stock_quantity
        }, status=status.HTTP_201_CREATED)


class DailySalesListView(generics.ListAPIView):
    """
    Get list of sales for a specific date or date range
    
    GET /api/sales/daily/?date=2025-12-02
    GET /api/sales/daily/?start_date=2025-12-01&end_date=2025-12-07
    GET /api/sales/daily/  // Today's sales
    """
    serializer_class = DailySaleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = DailySale.objects.filter(retailer=user).select_related('product')
        
        # Filter by date
        date_param = self.request.query_params.get('date')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if date_param:
            queryset = queryset.filter(sale_date=date_param)
        elif start_date and end_date:
            queryset = queryset.filter(sale_date__range=[start_date, end_date])
        else:
            # Default to today
            queryset = queryset.filter(sale_date=datetime.now().date())
        
        return queryset


class SalesSummaryView(generics.ListAPIView):
    """
    Get daily sales summary
    
    GET /api/sales/summary/?date=2025-12-02
    GET /api/sales/summary/?start_date=2025-12-01&end_date=2025-12-07
    GET /api/sales/summary/  // Last 7 days
    """
    serializer_class = DailySalesSummarySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = DailySalesSummary.objects.filter(retailer=user)
        
        date_param = self.request.query_params.get('date')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if date_param:
            queryset = queryset.filter(sale_date=date_param)
        elif start_date and end_date:
            queryset = queryset.filter(sale_date__range=[start_date, end_date])
        else:
            # Default to last 7 days
            end = datetime.now().date()
            start = end - timedelta(days=7)
            queryset = queryset.filter(sale_date__range=[start, end])
        
        return queryset


class SalesAnalyticsView(generics.GenericAPIView):
    """
    Get detailed sales analytics
    
    GET /api/sales/analytics/?days=30
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        days = int(request.query_params.get('days', 7))
        
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Get sales in date range
        sales = DailySale.objects.filter(
            retailer=user,
            sale_date__range=[start_date, end_date]
        )
        
        # Overall statistics
        total_sales = sales.count()
        total_revenue = sales.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        total_items = sales.aggregate(Sum('quantity_sold'))['quantity_sold__sum'] or 0
        
        # Top selling products
        top_products = sales.values(
            'product__id',
            'product__name',
            'product__sku'
        ).annotate(
            total_quantity=Sum('quantity_sold'),
            total_revenue=Sum('total_amount'),
            sales_count=Count('id')
        ).order_by('-total_quantity')[:10]
        
        # Daily breakdown
        daily_summary = DailySalesSummary.objects.filter(
            retailer=user,
            sale_date__range=[start_date, end_date]
        ).order_by('sale_date')
        
        return Response({
            'period': {
                'start_date': start_date,
                'end_date': end_date,
                'days': days
            },
            'overall': {
                'total_sales': total_sales,
                'total_revenue': float(total_revenue),
                'total_items_sold': total_items,
                'average_sale_value': float(total_revenue / total_sales) if total_sales > 0 else 0
            },
            'top_products': list(top_products),
            'daily_summary': DailySalesSummarySerializer(daily_summary, many=True).data
        })
