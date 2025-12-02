/**
 * Shopping Cart Screen
 * View and manage cart items before checkout
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius } from '@/constants/Spacing';
import { cartService, Cart, CartItem } from '@/services/cartService';
import { ordersService } from '@/services/ordersService';
import { handleApiError } from '@/services/apiClient';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);
  const [updatingItems, setUpdatingItems] = useState<{ [key: number]: boolean }>({});
  const [removingItems, setRemovingItems] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch (error) {
      console.error('Failed to load cart:', error);
      Alert.alert('Error', handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCart();
    setRefreshing(false);
  }, []);

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
      await cartService.updateCartItem(itemId, newQuantity);
      await loadCart(); // Reload to get updated totals
    } catch (error: any) {
      console.error('Failed to update quantity:', error);
      
      const errorData = error?.response?.data;
      if (errorData?.available_stock) {
        const availableStock = parseInt(errorData.available_stock[0] || errorData.available_stock);
        Alert.alert(
          'Limited Stock',
          `Only ${availableStock} units available at supplier.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', handleApiError(error));
      }
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setRemovingItems(prev => ({ ...prev, [itemId]: true }));
              await cartService.removeFromCart(itemId);
              await loadCart();
            } catch (error) {
              console.error('Failed to remove item:', error);
              Alert.alert('Error', handleApiError(error));
            } finally {
              setRemovingItems(prev => ({ ...prev, [itemId]: false }));
            }
          },
        },
      ]
    );
  };

  const handleClearCart = async () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await cartService.clearCart();
              await loadCart();
            } catch (error) {
              console.error('Failed to clear cart:', error);
              Alert.alert('Error', handleApiError(error));
            }
          },
        },
      ]
    );
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checking out.');
      return;
    }

    // Group items by supplier
    const supplierGroups = cart.items.reduce((groups: any, item) => {
      const supplierId = item.product_details?.supplier || 0;
      if (supplierId && !groups[supplierId]) {
        groups[supplierId] = {
          items: [],
          supplierName: item.product_details?.supplier_name || 'Supplier',
        };
      }
      if (supplierId) {
        groups[supplierId].items.push(item);
      }
      return groups;
    }, {});

    const supplierIds = Object.keys(supplierGroups);
    
    if (supplierIds.length === 0) {
      Alert.alert('Error', 'No valid items in cart.');
      return;
    }

    const totalItems = cart.items.length;
    const orderCount = supplierIds.length;
    
    // Build order summary message
    let summaryMessage = `You have ${totalItems} item(s) from ${orderCount} supplier(s):\n\n`;
    supplierIds.forEach(supplierId => {
      const group = supplierGroups[supplierId];
      summaryMessage += `• ${group.supplierName}: ${group.items.length} item(s)\n`;
    });
    summaryMessage += `\n${orderCount} order(s) will be created.`;

    Alert.alert(
      'Place Orders',
      summaryMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm All Orders',
          onPress: async () => {
            try {
              setLoading(true);
              
              console.log('🛒 Starting checkout process for multiple suppliers...');
              console.log('Total suppliers:', supplierIds.length);
              console.log('Total items:', totalItems);
              
              const createdOrders = [];
              const failedOrders = [];
              
              // Create orders for each supplier
              for (const supplierId of supplierIds) {
                try {
                  console.log(`Creating order for supplier ${supplierId}...`);
                  
                  const response = await ordersService.createOrder({
                    delivery_address: 'Shop Address',
                    delivery_contact: '01700000000',
                    delivery_notes: 'Please deliver during business hours',
                    supplier_id: parseInt(supplierId),
                  });
                  
                  createdOrders.push({
                    orderNumber: response.order.order_number,
                    supplier: supplierGroups[supplierId].supplierName,
                    total: response.order.total_amount,
                  });
                  
                  console.log(`✅ Order created for supplier ${supplierId}:`, response.order.order_number);
                } catch (error: any) {
                  console.error(`❌ Failed to create order for supplier ${supplierId}:`, error);
                  failedOrders.push({
                    supplier: supplierGroups[supplierId].supplierName,
                    error: error?.response?.data?.error || error.message,
                  });
                }
              }
              
              // Reload cart to see cleared items
              await loadCart();
              
              // Show results
              if (createdOrders.length > 0 && failedOrders.length === 0) {
                // All orders successful
                let successMessage = `${createdOrders.length} order(s) placed successfully!\n\n`;
                createdOrders.forEach((order, index) => {
                  successMessage += `${index + 1}. ${order.orderNumber}\n`;
                  successMessage += `   Supplier: ${order.supplier}\n`;
                  successMessage += `   Total: ৳${order.total}\n\n`;
                });
                successMessage += 'View your orders in the Orders tab.';
                
                Alert.alert(
                  '✓ Orders Placed!',
                  successMessage,
                  [
                    { 
                      text: 'View Orders', 
                      onPress: () => router.push('/(tabs)/orders')
                    },
                    { text: 'OK' }
                  ]
                );
              } else if (createdOrders.length > 0 && failedOrders.length > 0) {
                // Partial success
                let message = `${createdOrders.length} order(s) placed, ${failedOrders.length} failed:\n\n`;
                message += 'Successful:\n';
                createdOrders.forEach(order => {
                  message += `✓ ${order.orderNumber} (${order.supplier})\n`;
                });
                message += '\nFailed:\n';
                failedOrders.forEach(failed => {
                  message += `✗ ${failed.supplier}: ${failed.error}\n`;
                });
                
                Alert.alert('Partial Success', message);
              } else {
                // All failed
                let errorMessage = 'All orders failed:\n\n';
                failedOrders.forEach(failed => {
                  errorMessage += `✗ ${failed.supplier}:\n${failed.error}\n\n`;
                });
                
                Alert.alert('Order Failed', errorMessage);
              }
            } catch (error: any) {
              console.error('❌ Checkout process error:', error);
              Alert.alert(
                'Checkout Error', 
                'An unexpected error occurred during checkout. Please try again.'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderCartItem = (item: CartItem) => {
    const isUpdating = updatingItems[item.id] || false;
    const isRemoving = removingItems[item.id] || false;
    const product = item.product_details;

    return (
      <View key={item.id} style={[styles.cartItem, isRemoving && styles.cartItemRemoving]}>
        {/* Product Details */}
        <View style={styles.itemDetails}>
          <Text style={styles.productName} numberOfLines={2}>
            {product?.name || 'Product'}
          </Text>
          <Text style={styles.productPrice}>৳{product?.price || '0'} per unit</Text>
          <View style={styles.stockInfo}>
            <Ionicons name="cube-outline" size={14} color={Colors.neutral[500]} />
            <Text style={styles.stockText}>
              {product?.stock_quantity || 0} available
            </Text>
          </View>
        </View>

        {/* Quantity Controls & Price */}
        <View style={styles.itemActions}>
          <Text style={styles.itemTotal}>৳{item.subtotal}</Text>
          
          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={[styles.quantityButton, isUpdating && styles.quantityButtonDisabled]}
              onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              disabled={isUpdating || isRemoving}
            >
              <Ionicons name="remove" size={18} color={Colors.neutral[700]} />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
            <TouchableOpacity
              style={[styles.quantityButton, isUpdating && styles.quantityButtonDisabled]}
              onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              disabled={isUpdating || isRemoving}
            >
              <Ionicons name="add" size={18} color={Colors.neutral[700]} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item.id)}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <ActivityIndicator size="small" color="#dc2626" />
            ) : (
              <Ionicons name="trash-outline" size={20} color="#dc2626" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="cart-outline" size={80} color={Colors.neutral[300]} />
      </View>
      <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
      <Text style={styles.emptyText}>
        Add products from the Forecast or Inventory tabs to get started
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isEmpty && styles.scrollContentEmpty
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary.main]}
            tintColor={Colors.primary.main}
          />
        }
      >
        {isEmpty ? (
          renderEmptyCart()
        ) : (
          <>
            {/* Cart Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Shopping Cart</Text>
                <Text style={styles.headerSubtitle}>
                  {cart.total_items} {cart.total_items === 1 ? 'item' : 'items'} in your cart
                </Text>
              </View>
              {cart.items.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearCart}
                >
                  <Ionicons name="trash-outline" size={20} color="#dc2626" />
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Cart Items */}
            <View style={styles.itemsContainer}>
              {cart.items.map(renderCartItem)}
            </View>

            {/* Cart Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal ({cart.total_items} items)</Text>
                <Text style={styles.summaryValue}>৳{cart.total_amount}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>৳0.00</Text>
              </View>
              
              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>৳{cart.total_amount}</Text>
              </View>
            </View>

            {/* Spacer for bottom button */}
            <View style={styles.bottomSpacer} />
          </>
        )}
      </ScrollView>

      {/* Checkout Button (Fixed at bottom) */}
      {!isEmpty && (
        <View style={styles.checkoutContainer}>
          <View style={styles.checkoutInfo}>
            <Text style={styles.checkoutLabel}>Total Amount</Text>
            <Text style={styles.checkoutTotal}>৳{cart.total_amount}</Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.default,
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  scrollContentEmpty: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: '#dc2626' + '10',
  },
  clearButtonText: {
    fontSize: Typography.fontSize.sm,
    color: '#dc2626',
    fontWeight: '600',
  },
  itemsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.background.paper,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cartItemRemoving: {
    opacity: 0.5,
  },
  imageContainer: {
    width: 80,
    height: 80,
    marginRight: Spacing.md,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.md,
  },
  placeholderImage: {
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary.main,
    fontWeight: '600',
    marginBottom: 4,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[500],
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: Spacing.sm,
  },
  itemTotal: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary,
    fontWeight: '700',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
    padding: 2,
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background.paper,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'center',
  },
  removeButton: {
    padding: 4,
  },
  summaryContainer: {
    backgroundColor: Colors.background.paper,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  summaryValue: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: Spacing.sm,
  },
  totalLabel: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  totalValue: {
    fontSize: Typography.fontSize['2xl'],
    color: Colors.primary.main,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 120, // Space for fixed checkout button
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  checkoutInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  checkoutLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  checkoutTotal: {
    fontSize: Typography.fontSize['2xl'],
    color: Colors.text.primary,
    fontWeight: '700',
  },
  checkoutButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  checkoutButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
