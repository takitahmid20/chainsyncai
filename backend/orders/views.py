from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import Order, OrderItem, Cart, CartItem
from products.models import Product
from .serializers import (
    OrderSerializer, 
    OrderCreateSerializer,
    CartSerializer,
    CartItemSerializer
)
import uuid


# ============ CART VIEWS ============

class CartView(APIView):
    """Get or clear cart"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        cart, created = Cart.objects.get_or_create(retailer=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    def delete(self, request):
        """Clear cart"""
        Cart.objects.filter(retailer=request.user).delete()
        return Response({'message': 'Cart cleared'}, status=status.HTTP_200_OK)


class CartItemView(APIView):
    """Add, update, or remove items from cart"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Add item to cart"""
        if request.user.user_type != 'retailer':
            return Response({
                'error': 'Only retailers can add items to cart'
            }, status=status.HTTP_403_FORBIDDEN)
        
        cart, created = Cart.objects.get_or_create(retailer=request.user)
        
        serializer = CartItemSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            product = serializer.validated_data['product']
            quantity = serializer.validated_data['quantity']
            
            # Ensure product is a Product instance
            if not isinstance(product, Product):
                try:
                    product = Product.objects.get(pk=product)
                except Product.DoesNotExist:
                    return Response({
                        'error': 'Product not found'
                    }, status=status.HTTP_404_NOT_FOUND)
            
            # Check if item already in cart
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={'quantity': quantity}
            )
            
            if not created:
                # Update quantity
                cart_item.quantity += quantity
                
                # Validate against stock
                if cart_item.quantity > product.stock_quantity:
                    return Response({
                        'error': f'Only {product.stock_quantity} items available'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                cart_item.save()
            
            return Response({
                'message': 'Item added to cart',
                'cart_item': CartItemSerializer(cart_item).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, item_id):
        """Update cart item quantity"""
        try:
            cart = Cart.objects.get(retailer=request.user)
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            
            quantity = request.data.get('quantity')
            if not quantity or int(quantity) <= 0:
                return Response({
                    'error': 'Invalid quantity'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            quantity = int(quantity)
            
            # Validate against stock
            if quantity > cart_item.product.stock_quantity:
                return Response({
                    'error': f'Only {cart_item.product.stock_quantity} items available'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            cart_item.quantity = quantity
            cart_item.save()
            
            return Response({
                'message': 'Cart updated',
                'cart_item': CartItemSerializer(cart_item).data
            })
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return Response({
                'error': 'Cart item not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, item_id):
        """Remove item from cart"""
        try:
            cart = Cart.objects.get(retailer=request.user)
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            cart_item.delete()
            return Response({
                'message': 'Item removed from cart'
            }, status=status.HTTP_200_OK)
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return Response({
                'error': 'Cart item not found'
            }, status=status.HTTP_404_NOT_FOUND)


# ============ ORDER VIEWS ============

class OrderListCreateView(APIView):
    """List orders or create new order from cart"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """List orders based on user type"""
        if request.user.user_type == 'retailer':
            orders = Order.objects.filter(retailer=request.user)
        elif request.user.user_type == 'supplier':
            orders = Order.objects.filter(supplier=request.user)
        else:
            return Response({'error': 'Invalid user type'}, status=status.HTTP_403_FORBIDDEN)
        
        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            orders = orders.filter(status=status_filter)
        
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    @transaction.atomic
    def post(self, request):
        """Create order from cart items for a specific supplier"""
        if request.user.user_type != 'retailer':
            return Response({
                'error': 'Only retailers can place orders'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Get cart
        try:
            cart = Cart.objects.get(retailer=request.user)
        except Cart.DoesNotExist:
            return Response({
                'error': 'Cart is empty'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Filter cart items by supplier
        supplier_id = serializer.validated_data['supplier_id']
        cart_items = cart.items.filter(product__supplier_id=supplier_id)
        
        if not cart_items.exists():
            return Response({
                'error': 'No items from this supplier in cart'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate totals
        subtotal = sum(item.subtotal for item in cart_items)
        tax = 0  # Can add tax calculation later
        delivery_fee = 0  # Can add delivery fee calculation
        total_amount = subtotal + tax + delivery_fee
        
        # Create order
        order = Order.objects.create(
            retailer=request.user,
            supplier_id=supplier_id,
            order_number=f'ORD-{uuid.uuid4().hex[:8].upper()}',
            status='pending',
            subtotal=subtotal,
            tax=tax,
            delivery_fee=delivery_fee,
            total_amount=total_amount,
            delivery_address=serializer.validated_data['delivery_address'],
            delivery_contact=serializer.validated_data['delivery_contact'],
            delivery_notes=serializer.validated_data.get('delivery_notes', '')
        )
        
        # Create order items and update stock
        for cart_item in cart_items:
            # Check stock availability
            if cart_item.quantity > cart_item.product.stock_quantity:
                transaction.set_rollback(True)
                return Response({
                    'error': f'{cart_item.product.name} - Only {cart_item.product.stock_quantity} available'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create order item
            price = cart_item.product.discount_price if cart_item.product.discount_price else cart_item.product.price
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                product_name=cart_item.product.name,
                product_price=price,
                quantity=cart_item.quantity
            )
            
            # Update product stock
            cart_item.product.stock_quantity -= cart_item.quantity
            if cart_item.product.stock_quantity == 0:
                cart_item.product.status = 'out_of_stock'
            cart_item.product.save()
        
        # Clear cart items for this supplier
        cart_items.delete()
        
        return Response({
            'message': 'Order placed successfully',
            'order': OrderSerializer(order).data
        }, status=status.HTTP_201_CREATED)


class OrderDetailView(APIView):
    """Get or update order"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, order_id):
        try:
            if request.user.user_type == 'retailer':
                order = Order.objects.get(id=order_id, retailer=request.user)
            elif request.user.user_type == 'supplier':
                order = Order.objects.get(id=order_id, supplier=request.user)
            else:
                return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
            
            serializer = OrderSerializer(order)
            return Response(serializer.data)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)


class OrderStatusUpdateView(APIView):
    """Update order status"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def put(self, request, order_id):
        try:
            order = Order.objects.select_for_update().get(id=order_id)
            
            # Check permissions
            if request.user.user_type == 'supplier' and order.supplier != request.user:
                return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
            if request.user.user_type == 'retailer' and order.retailer != request.user:
                return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
            
            new_status = request.data.get('status')
            if not new_status:
                return Response({'error': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate status transitions
            if request.user.user_type == 'retailer':
                # Retailers can only cancel pending orders
                if new_status == 'cancelled' and order.status == 'pending':
                    # Restore stock
                    for item in order.items.all():
                        item.product.stock_quantity += item.quantity
                        if item.product.stock_quantity > 0:
                            item.product.status = 'active'
                        item.product.save()
                    order.status = new_status
                else:
                    return Response({
                        'error': 'You can only cancel pending orders'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            elif request.user.user_type == 'supplier':
                # Suppliers can update order status
                valid_statuses = ['accepted', 'processing', 'on_the_way', 'delivered', 'cancelled']
                if new_status not in valid_statuses:
                    return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
                
                if new_status == 'accepted' and order.status == 'pending':
                    order.accepted_at = timezone.now()
                elif new_status == 'delivered':
                    order.delivered_at = timezone.now()
                elif new_status == 'cancelled':
                    # Restore stock
                    for item in order.items.all():
                        item.product.stock_quantity += item.quantity
                        if item.product.stock_quantity > 0:
                            item.product.status = 'active'
                        item.product.save()
                
                order.status = new_status
            
            order.save()
            
            return Response({
                'message': f'Order status updated to {new_status}',
                'order': OrderSerializer(order).data
            })
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
