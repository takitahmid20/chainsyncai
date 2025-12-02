/**
 * Retailer Inventory Management Screen
 * Manage products, stock levels, and restock alerts
 * Based on html2/retailer/inventory.html design
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius } from '@/constants/Spacing';
import {
  inventoryService,
  InventoryProduct,
  AIRestockSuggestion,
  StockStatus,
} from '@/services/inventoryService';
import { cartService } from '@/services/cartService';
import { generateAIOrders, autoExecuteOrders, AIOrder } from '@/services/aiOrderService';

type Category = 'all' | string;
type Priority = 'high' | 'medium' | 'low';

interface AIOrderItem extends AIRestockSuggestion {
  isSelected: boolean;
}

export default function InventoryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category>('all');
  const [stockFilter, setStockFilter] = useState<'all' | StockStatus>('all');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiOrderItems, setAIOrderItems] = useState<AIOrderItem[]>([]);
  const [addingToCart, setAddingToCart] = useState<{ [key: number]: boolean }>({});
  const [bulkOrdering, setBulkOrdering] = useState(false);
  
  // Auto Order state
  const [showAutoOrderModal, setShowAutoOrderModal] = useState(false);
  const [aiOrders, setAIOrders] = useState<AIOrder[]>([]);
  const [selectedAIOrders, setSelectedAIOrders] = useState<string[]>([]);
  const [loadingAIOrders, setLoadingAIOrders] = useState(false);
  const [executingOrders, setExecutingOrders] = useState(false);
  
  // API state
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch inventory data
  const fetchInventory = useCallback(async (page = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      
      const response = await inventoryService.getInventory({
        search: searchQuery || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        stock_status: stockFilter !== 'all' ? stockFilter : undefined,
        page,
        page_size: 10,
      });
      
      if (append) {
        setProducts(prev => [...prev, ...response.products]);
      } else {
        setProducts(response.products);
      }
      
      setCurrentPage(response.current_page);
      setTotalPages(response.total_pages);
      setTotalCount(response.count);
      setHasMore(response.next !== null);
      setLowStockCount(response.summary.low_stock);
      setOutOfStockCount(response.summary.out_of_stock);
      
      // Extract unique categories (only on first load)
      if (page === 1) {
        const uniqueCategories = [...new Set(response.products.map(p => p.category_slug).filter(Boolean))];
        setCategories(uniqueCategories);
      }
      
    } catch (error: any) {
      console.error('Failed to fetch inventory:', error);
      Alert.alert('Error', 'Failed to load inventory. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, categoryFilter, stockFilter]);

  // Fetch AI suggestions
  const fetchAISuggestions = async () => {
    try {
      const response = await inventoryService.getAIRestockSuggestions();
      const suggestions: AIOrderItem[] = response.suggestions.map(s => ({
        ...s,
        isSelected: true,
      }));
      setAIOrderItems(suggestions);
      setShowAIModal(true);
    } catch (error: any) {
      console.error('Failed to fetch AI suggestions:', error);
      Alert.alert('Error', 'Failed to load AI suggestions. Please try again.');
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await fetchInventory(1);
    setRefreshing(false);
  };
  
  // Handle load more
  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      setLoadingMore(true);
      fetchInventory(currentPage + 1, true);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchInventory(1);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        setCurrentPage(1);
        fetchInventory(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchInventory(1);
  }, [categoryFilter, stockFilter]);

  const getStockStatusStyle = (status: StockStatus) => {
    switch (status) {
      case 'low':
        return { bg: '#FEF3C7', text: '#92400E', icon: 'warning-outline' };
      case 'good':
        return { bg: '#D1FAE5', text: '#065F46', icon: 'checkmark-circle-outline' };
      case 'out':
        return { bg: '#FEE2E2', text: '#991B1B', icon: 'close-circle-outline' };
    }
  };

  const getCategoryLabel = (category: string) => {
    // Capitalize first letter
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getStockStatusLabel = (status: StockStatus) => {
    const labels = {
      low: 'Low Stock',
      good: 'In Stock',
      out: 'Out of Stock',
    };
    return labels[status];
  };

  const toggleProductSelection = (id: number) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      // Deselect all
      setSelectedProducts([]);
    } else {
      // Select all current products
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return { bg: '#FEE2E2', text: '#991B1B' };
      case 'medium':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'low':
        return { bg: '#DBEAFE', text: '#1E40AF' };
    }
  };

  const toggleAIItem = (index: number) => {
    setAIOrderItems(prev => prev.map((item, i) => 
      i === index ? { ...item, isSelected: !item.isSelected } : item
    ));
  };

  const updateAIItemQty = (index: number, qty: number) => {
    setAIOrderItems(prev => prev.map((item, i) => 
      i === index ? { ...item, suggested_quantity: Math.max(1, qty) } : item
    ));
  };

  const calculateAIOrderTotal = () => {
    return aiOrderItems
      .filter(item => item.isSelected)
      .reduce((sum, item) => sum + item.estimated_cost, 0);
  };

  const getSelectedAIItemsCount = () => {
    return aiOrderItems.filter(item => item.isSelected).length;
  };

  const getTotalAIUnits = () => {
    return aiOrderItems
      .filter(item => item.isSelected)
      .reduce((sum, item) => sum + item.suggested_quantity, 0);
  };

  const handleReorder = async (product: InventoryProduct) => {
    try {
      setAddingToCart(prev => ({ ...prev, [product.id]: true }));
      
      // Determine quantity: use minimum order quantity or 1, whichever is higher
      const quantity = Math.max(product.minimum_order_quantity, 1);
      
      await cartService.addToCart(product.id, quantity);
      
      Alert.alert(
        'Added to Cart',
        `${product.name} (${quantity} ${product.unit}) has been added to your cart.`,
        [
          {
            text: 'Continue Shopping',
            style: 'cancel',
          },
          {
            text: 'View Cart',
            onPress: () => router.push('/cart'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      const errorMessage = error?.response?.data?.error || 'Failed to add product to cart. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const handleBulkOrder = async () => {
    if (selectedProducts.length === 0) {
      Alert.alert('No Selection', 'Please select at least one product to order.');
      return;
    }

    // Get selected products details
    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));
    
    // Calculate total
    const totalItems = selectedProductsData.length;
    const totalUnits = selectedProductsData.reduce((sum, p) => 
      sum + Math.max(p.minimum_order_quantity, 1), 0
    );
    const totalCost = selectedProductsData.reduce((sum, p) => {
      const quantity = Math.max(p.minimum_order_quantity, 1);
      const price = parseFloat(p.discount_price || p.price);
      return sum + (quantity * price);
    }, 0);

    // Show confirmation
    Alert.alert(
      'Confirm Bulk Order',
      `Add ${totalItems} product(s) (${totalUnits} total units) to cart?\n\nEstimated Total: ৳${totalCost.toFixed(2)}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Add to Cart',
          onPress: async () => {
            try {
              setBulkOrdering(true);
              
              let successCount = 0;
              let failCount = 0;
              const failedProducts: string[] = [];
              
              // Add each product to cart
              for (const product of selectedProductsData) {
                try {
                  const quantity = Math.max(product.minimum_order_quantity, 1);
                  await cartService.addToCart(product.id, quantity);
                  successCount++;
                } catch (error: any) {
                  console.error(`Failed to add product ${product.id} to cart:`, error);
                  failCount++;
                  failedProducts.push(product.name);
                }
              }
              
              // Clear selection
              setSelectedProducts([]);
              
              // Show result
              if (successCount > 0) {
                const message = failCount > 0
                  ? `${successCount} item(s) added to cart successfully.\n${failCount} item(s) failed to add.`
                  : `Successfully added ${successCount} item(s) to cart!`;
                
                Alert.alert(
                  'Bulk Order Complete',
                  message,
                  [
                    {
                      text: 'Continue Shopping',
                      style: 'cancel',
                    },
                    {
                      text: 'View Cart',
                      onPress: () => router.push('/cart'),
                    },
                  ]
                );
              } else {
                Alert.alert(
                  'Bulk Order Failed',
                  'Failed to add products to cart. Please try again.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error: any) {
              console.error('Bulk order error:', error);
              Alert.alert('Error', 'An error occurred while processing bulk order.');
            } finally {
              setBulkOrdering(false);
            }
          },
        },
      ]
    );
  };

  const handleApproveAIOrder = async () => {
    const selectedItems = aiOrderItems.filter(item => item.isSelected);
    
    if (selectedItems.length === 0) {
      Alert.alert('No Items', 'Please select at least one item to order.');
      return;
    }

    try {
      // Add all selected items to cart
      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];
      
      for (const item of selectedItems) {
        try {
          await cartService.addToCart(item.product_id, item.suggested_quantity);
          successCount++;
        } catch (error: any) {
          console.error(`Failed to add product ${item.product_id} to cart:`, error);
          failCount++;
          
          // Extract error message from response
          const errorMsg = error?.response?.data?.error || 
                          error?.response?.data?.message ||
                          error?.message ||
                          'Unknown error';
          
          errors.push(`${item.product_name}: ${errorMsg}`);
        }
      }
      
      setShowAIModal(false);
      
      if (successCount > 0) {
        const message = failCount > 0
          ? `${successCount} item(s) added successfully.\n\n${failCount} failed:\n${errors.join('\n')}`
          : `Successfully added ${successCount} item(s) to cart!`;
        
        Alert.alert(
          'Added to Cart',
          message,
          [
            {
              text: 'Continue Shopping',
              style: 'cancel',
            },
            {
              text: 'View Cart',
              onPress: () => router.push('/cart'),
            },
          ]
        );
      } else {
        Alert.alert(
          'Failed to Add Items', 
          `Could not add items to cart:\n\n${errors.join('\n\n')}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Failed to process AI order:', error);
      Alert.alert('Error', 'Failed to process order. Please try again.');
    }
  };

  // Auto Order Functions
  const handleAutoOrderClick = async () => {
    try {
      setLoadingAIOrders(true);
      setShowAutoOrderModal(true);
      
      const orders = await generateAIOrders(10); // Get up to 10 AI order suggestions
      setAIOrders(orders);
      
      // Pre-select urgent orders
      const urgentOrderIds = orders
        .filter(order => order.urgency_level === 'urgent')
        .map(order => order.id);
      setSelectedAIOrders(urgentOrderIds);
    } catch (error: any) {
      console.error('Failed to generate AI orders:', error);
      Alert.alert('Error', 'Failed to generate AI order suggestions. Please try again.');
      setShowAutoOrderModal(false);
    } finally {
      setLoadingAIOrders(false);
    }
  };

  const toggleAIOrderSelection = (orderId: string) => {
    setSelectedAIOrders(prev => 
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleExecuteAutoOrders = async () => {
    if (selectedAIOrders.length === 0) {
      Alert.alert('No Orders Selected', 'Please select at least one order to execute.');
      return;
    }

    const selectedOrdersData = aiOrders.filter(order => selectedAIOrders.includes(order.id));
    const totalCost = selectedOrdersData.reduce((sum, order) => sum + order.estimated_total, 0);
    const totalProducts = selectedOrdersData.reduce((sum, order) => sum + order.total_items, 0);

    Alert.alert(
      'Confirm Auto Order',
      `Execute ${selectedAIOrders.length} order(s)?\n\n` +
      `Total Products: ${totalProducts}\n` +
      `Estimated Cost: ৳${totalCost.toLocaleString()}\n\n` +
      `This will automatically create orders with your suppliers.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Execute Orders', 
          style: 'default',
          onPress: async () => {
            try {
              setExecutingOrders(true);
              const selectedOrdersData = aiOrders.filter(order => selectedAIOrders.includes(order.id));
              const results = await autoExecuteOrders(selectedOrdersData);
              
              setShowAutoOrderModal(false);
              
              if (results.success.length > 0) {
                const message = results.failed.length > 0
                  ? `${results.success.length} order(s) created successfully.\n\n` +
                    `${results.failed.length} failed:\n` +
                    results.failed.map(f => `Order: ${f.error}`).join('\n')
                  : `Successfully created ${results.success.length} order(s)!`;
                
                Alert.alert(
                  'Auto Order Complete',
                  message,
                  [
                    {
                      text: 'View Orders',
                      onPress: () => router.push('/orders'),
                    },
                    {
                      text: 'OK',
                      style: 'cancel',
                    },
                  ]
                );
                
                // Refresh inventory after orders
                fetchInventory(1, false);
              } else {
                Alert.alert(
                  'Auto Order Failed',
                  `Could not create orders:\n\n${results.failed.map(f => f.error).join('\n')}`,
                  [{ text: 'OK' }]
                );
              }
            } catch (error: any) {
              console.error('Failed to execute auto orders:', error);
              Alert.alert('Error', 'Failed to execute auto orders. Please try again.');
            } finally {
              setExecutingOrders(false);
            }
          }
        },
      ]
    );
  };

  const getAutoOrderSummary = () => {
    const selected = aiOrders.filter(order => selectedAIOrders.includes(order.id));
    return {
      totalOrders: selected.length,
      totalProducts: selected.reduce((sum, order) => sum + order.total_items, 0),
      totalCost: selected.reduce((sum, order) => sum + order.estimated_total, 0),
      urgentOrders: selected.filter(order => order.urgency_level === 'urgent').length,
    };
  };

  const renderProductCard = ({ item }: { item: InventoryProduct }) => {
    const statusStyle = getStockStatusStyle(item.stock_status);
    const isSelected = selectedProducts.includes(item.id);
    const stockPercentage = item.stock_percentage;
    const unitPrice = parseFloat(item.discount_price || item.price);

    return (
      <TouchableOpacity
        style={[styles.productCard, isSelected && styles.productCardSelected]}
        onPress={() => toggleProductSelection(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.productCardHeader}>
          <View style={styles.productCheckbox}>
            <Ionicons
              name={isSelected ? 'checkbox' : 'square-outline'}
              size={24}
              color={isSelected ? Colors.primary.main : Colors.neutral[400]}
            />
          </View>
          <View style={[styles.productStatusBadge, { backgroundColor: statusStyle.bg }]}>
            <Ionicons name={statusStyle.icon as any} size={12} color={statusStyle.text} />
            <Text style={[styles.productStatusText, { color: statusStyle.text }]}>
              {getStockStatusLabel(item.stock_status)}
            </Text>
          </View>
        </View>

        <View style={styles.productCardBody}>
          <View style={styles.productImage}>
            <Ionicons name="cube-outline" size={40} color={Colors.neutral[400]} />
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productSku}>SKU: {item.sku || `PRD-${item.id}`}</Text>
            {item.category_name && (
              <View style={styles.productCategory}>
                <Ionicons name="pricetag-outline" size={12} color={Colors.neutral[500]} />
                <Text style={styles.productCategoryText}>{item.category_name}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.stockProgress}>
          <View style={styles.stockProgressBar}>
            <View
              style={[
                styles.stockProgressFill,
                {
                  width: `${Math.min(stockPercentage, 100)}%`,
                  backgroundColor: item.stock_status === 'out' ? '#dc2626' :
                                  item.stock_status === 'low' ? '#f59e0b' : '#10b981'
                }
              ]}
            />
          </View>
          <Text style={styles.stockProgressText}>
            {item.stock_quantity} / {item.minimum_order_quantity * 3} units
          </Text>
        </View>

        <View style={styles.productCardFooter}>
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Unit Price</Text>
            <Text style={styles.priceValue}>৳{unitPrice.toFixed(2)}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.reorderButton, addingToCart[item.id] && styles.reorderButtonDisabled]}
            onPress={() => handleReorder(item)}
            disabled={addingToCart[item.id]}
          >
            {addingToCart[item.id] ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="cart-outline" size={16} color="#fff" />
                <Text style={styles.reorderButtonText}>Reorder</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* AI Alert Strip */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <TouchableOpacity style={styles.aiAlertStrip} onPress={fetchAISuggestions}>
          <View style={styles.aiAlertIcon}>
            <Ionicons name="sparkles" size={16} color="#8b5cf6" />
          </View>
          <View style={styles.aiAlertText}>
            <Text style={styles.aiAlertTitle}>
              <Text style={styles.aiAlertBold}>AI Alert: </Text>
              {lowStockCount > 0 && `${lowStockCount} low stock items`}
              {lowStockCount > 0 && outOfStockCount > 0 && ', '}
              {outOfStockCount > 0 && `${outOfStockCount} out of stock`}
            </Text>
          </View>
          <TouchableOpacity style={styles.aiActionButton} onPress={handleAutoOrderClick}>
            <Text style={styles.aiActionButtonText}>Auto Order</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={Colors.neutral[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={Colors.neutral[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Row - Categories */}
      {categories.length > 0 && (
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
            <TouchableOpacity
              style={[styles.filterChip, categoryFilter === 'all' && styles.filterChipActive]}
              onPress={() => setCategoryFilter('all')}
            >
              <Text style={[styles.filterChipText, categoryFilter === 'all' && styles.filterChipTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, categoryFilter === cat && styles.filterChipActive]}
                onPress={() => setCategoryFilter(cat)}
              >
                <Text style={[styles.filterChipText, categoryFilter === cat && styles.filterChipTextActive]}>
                  {getCategoryLabel(cat)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Stock Filter Row */}
      <View style={styles.stockFilterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
          <TouchableOpacity
            style={[styles.stockFilterChip, stockFilter === 'all' && styles.stockFilterChipActive]}
            onPress={() => setStockFilter('all')}
          >
            <Text style={[styles.stockFilterChipText, stockFilter === 'all' && styles.stockFilterChipTextActive]}>
              All Status
            </Text>
          </TouchableOpacity>
          {(['low', 'good', 'out'] as StockStatus[]).map(status => (
            <TouchableOpacity
              key={status}
              style={[styles.stockFilterChip, stockFilter === status && styles.stockFilterChipActive]}
              onPress={() => setStockFilter(status)}
            >
              <Text style={[styles.stockFilterChipText, stockFilter === status && styles.stockFilterChipTextActive]}>
                {getStockStatusLabel(status)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={styles.selectAllButton}
          onPress={handleSelectAll}
        >
          <Ionicons 
            name={selectedProducts.length === products.length ? "checkbox" : "square-outline"} 
            size={18} 
            color={Colors.primary.main} 
          />
          <Text style={styles.selectAllText}>
            {selectedProducts.length === products.length ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Selected Products Bar */}
      {selectedProducts.length > 0 && (
        <View style={styles.bulkActionBar}>
          <Text style={styles.bulkActionText}>
            {selectedProducts.length} item{selectedProducts.length > 1 ? 's' : ''} selected
          </Text>
          <View style={styles.bulkActions}>
            <TouchableOpacity 
              style={[styles.bulkButton, bulkOrdering && styles.bulkButtonDisabled]}
              onPress={handleBulkOrder}
              disabled={bulkOrdering}
            >
              {bulkOrdering ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="cart-outline" size={18} color="#fff" />
                  <Text style={styles.bulkButtonText}>Bulk Order</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSelectedProducts([])}
              disabled={bulkOrdering}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Products List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Loading inventory...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color={Colors.neutral[300]} />
          <Text style={styles.emptyText}>No products found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductCard}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => {
            if (loadingMore) {
              return (
                <View style={styles.loadingMore}>
                  <ActivityIndicator size="small" color={Colors.primary.main} />
                  <Text style={styles.loadingMoreText}>Loading more products...</Text>
                </View>
              );
            }
            if (!hasMore && products.length > 0) {
              return (
                <View style={styles.endOfList}>
                  <Text style={styles.endOfListText}>
                    Showing {products.length} of {totalCount} products
                  </Text>
                </View>
              );
            }
            return null;
          }}
        />
      )}

      {/* Add Product FAB */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* AI Auto Order Modal */}
      <Modal
        visible={showAIModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAIModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Ionicons name="sparkles" size={24} color="#8b5cf6" />
                <Text style={styles.modalTitle}>AI Suggested Order</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAIModal(false)}>
                <Ionicons name="close" size={24} color={Colors.neutral[600]} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Info Banner */}
              <View style={styles.aiInfoBanner}>
                <Ionicons name="information-circle-outline" size={20} color={Colors.primary.main} />
                <Text style={styles.aiInfoText}>
                  Based on sales trends, these products need restocking to avoid shortage.
                </Text>
              </View>

              {/* AI Order Items */}
              <View style={styles.aiOrderList}>
                {aiOrderItems.map((item, index) => {
                  const priorityStyle = getPriorityStyle(item.priority);
                  const subtotal = item.unit_price * item.suggested_quantity;

                  return (
                    <View key={item.product_id} style={styles.aiOrderItem}>
                      {/* Item Header */}
                      <View style={styles.aiOrderItemHeader}>
                        <TouchableOpacity
                          style={styles.aiItemCheckSection}
                          onPress={() => toggleAIItem(index)}
                        >
                          <Ionicons
                            name={item.isSelected ? 'checkbox' : 'square-outline'}
                            size={24}
                            color={item.isSelected ? Colors.primary.main : Colors.neutral[400]}
                          />
                          <View style={styles.aiItemNameSection}>
                            <Text style={styles.aiItemName}>{item.product_name}</Text>
                            <Text style={styles.aiItemSku}>SKU: {item.product_sku}</Text>
                          </View>
                        </TouchableOpacity>
                        <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
                          <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
                            {item.priority === 'high' ? 'High Priority' : 
                             item.priority === 'medium' ? 'Medium' : 'Low'}
                          </Text>
                        </View>
                      </View>

                      {/* Item Details */}
                      <View style={styles.aiOrderItemDetails}>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Current Stock:</Text>
                          <Text style={[
                            styles.detailValue,
                            item.current_stock === 0 && styles.detailValueRed,
                            item.current_stock > 0 && item.current_stock <= item.min_stock && styles.detailValueOrange
                          ]}>
                            {item.current_stock} units
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>AI Suggested Qty:</Text>
                          <View style={styles.qtyInputContainer}>
                            <TouchableOpacity
                              style={styles.qtyButton}
                              onPress={() => updateAIItemQty(index, item.suggested_quantity - 10)}
                            >
                              <Ionicons name="remove" size={16} color={Colors.neutral[600]} />
                            </TouchableOpacity>
                            <TextInput
                              style={styles.qtyInput}
                              value={item.suggested_quantity.toString()}
                              onChangeText={(text) => updateAIItemQty(index, parseInt(text) || 1)}
                              keyboardType="number-pad"
                            />
                            <TouchableOpacity
                              style={styles.qtyButton}
                              onPress={() => updateAIItemQty(index, item.suggested_quantity + 10)}
                            >
                              <Ionicons name="add" size={16} color={Colors.neutral[600]} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Unit Price:</Text>
                          <Text style={styles.detailValue}>৳{item.unit_price.toFixed(2)}</Text>
                        </View>
                        <View style={[styles.detailRow, styles.detailRowTotal]}>
                          <Text style={styles.detailLabelBold}>Subtotal:</Text>
                          <Text style={styles.detailValueBold}>৳{subtotal.toLocaleString()}</Text>
                        </View>
                      </View>

                      {/* AI Reason */}
                      <View style={styles.aiReason}>
                        <Ionicons name="trending-up-outline" size={14} color="#059669" />
                        <Text style={styles.aiReasonText}>{item.reason}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Order Summary */}
              <View style={styles.orderSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Items:</Text>
                  <Text style={styles.summaryValue}>{getSelectedAIItemsCount()} products</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Quantity:</Text>
                  <Text style={styles.summaryValue}>{getTotalAIUnits()} units</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                  <Text style={styles.summaryLabelBold}>Estimated Total:</Text>
                  <Text style={styles.summaryValueLarge}>৳{calculateAIOrderTotal().toLocaleString()}</Text>
                </View>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowAIModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={handleApproveAIOrder}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.modalButtonPrimaryText}>Approve Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Auto Order Modal */}
      <Modal
        visible={showAutoOrderModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAutoOrderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Ionicons name="flash" size={24} color="#f59e0b" />
                <Text style={styles.modalTitle}>AI Auto Order System</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAutoOrderModal(false)}>
                <Ionicons name="close" size={24} color={Colors.neutral[600]} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {loadingAIOrders ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.primary.main} />
                  <Text style={styles.loadingText}>Analyzing inventory and generating smart orders...</Text>
                </View>
              ) : aiOrders.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="checkmark-circle-outline" size={64} color={Colors.success.main} />
                  <Text style={styles.emptyText}>All Stocked Up!</Text>
                  <Text style={styles.emptySubtext}>No urgent reorders needed at this time.</Text>
                </View>
              ) : (
                <>
                  {/* Info Banner */}
                  <View style={styles.aiInfoBanner}>
                    <Ionicons name="information-circle-outline" size={20} color={Colors.primary.main} />
                    <Text style={styles.aiInfoText}>
                      AI has analyzed your inventory and sales patterns. Select orders to execute automatically.
                    </Text>
                  </View>

                  {/* AI Orders List */}
                  <View style={styles.aiOrderList}>
                    {aiOrders.map((order) => {
                      const isSelected = selectedAIOrders.includes(order.id);
                      const urgencyLevel = order.urgency_level || 'normal';
                      const urgencyColor = urgencyLevel === 'urgent' ? '#ef4444' :
                                          urgencyLevel === 'soon' ? '#f59e0b' : '#22c55e';

                      return (
                        <TouchableOpacity
                          key={order.id}
                          style={[styles.autoOrderCard, isSelected && styles.autoOrderCardSelected]}
                          onPress={() => toggleAIOrderSelection(order.id)}
                          activeOpacity={0.7}
                        >
                          {/* Order Header */}
                          <View style={styles.autoOrderHeader}>
                            <View style={styles.autoOrderCheckSection}>
                              <Ionicons
                                name={isSelected ? 'checkbox' : 'square-outline'}
                                size={24}
                                color={isSelected ? Colors.primary.main : Colors.neutral[400]}
                              />
                              <View style={styles.autoOrderSupplierSection}>
                                <Text style={styles.autoOrderSupplier}>{order.supplier_name}</Text>
                                <View style={styles.autoOrderMetaRow}>
                                  <View style={[styles.urgencyBadge, { backgroundColor: `${urgencyColor}15` }]}>
                                    <Text style={[styles.urgencyText, { color: urgencyColor }]}>
                                      {urgencyLevel.toUpperCase()}
                                    </Text>
                                  </View>
                                  <Text style={styles.autoOrderMeta}>{order.total_items} products</Text>
                                </View>
                              </View>
                            </View>
                            <View style={styles.confidenceSection}>
                              <Text style={styles.confidenceLabel}>Confidence</Text>
                              <Text style={styles.confidenceValue}>{Math.round(order.confidence_score * 100)}%</Text>
                            </View>
                          </View>

                          {/* Order Details */}
                          <View style={styles.autoOrderDetails}>
                            <View style={styles.autoOrderDetailRow}>
                              <Ionicons name="cube-outline" size={16} color={Colors.neutral[500]} />
                              <Text style={styles.autoOrderDetailText}>
                                {order.total_quantity} total units
                              </Text>
                            </View>
                            <View style={styles.autoOrderDetailRow}>
                              <Ionicons name="calendar-outline" size={16} color={Colors.neutral[500]} />
                              <Text style={styles.autoOrderDetailText}>
                                Delivery: {order.delivery_estimate}
                              </Text>
                            </View>
                            <View style={styles.autoOrderDetailRow}>
                              <Ionicons name="information-circle-outline" size={16} color={Colors.neutral[500]} />
                              <Text style={styles.autoOrderDetailText} numberOfLines={2}>
                                {order.reason}
                              </Text>
                            </View>
                          </View>

                          {/* Order Total */}
                          <View style={styles.autoOrderFooter}>
                            <Text style={styles.autoOrderTotalLabel}>Estimated Total:</Text>
                            <Text style={styles.autoOrderTotalValue}>৳{(order.total_amount || 0).toLocaleString()}</Text>
                          </View>

                          {/* Product Preview */}
                          <View style={styles.productPreview}>
                            <Text style={styles.productPreviewLabel}>Products:</Text>
                            <Text style={styles.productPreviewText} numberOfLines={2}>
                              {order.items?.map(item => item.product_name).join(', ') || 'No products'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Summary */}
                  {selectedAIOrders.length > 0 && (
                    <View style={styles.orderSummary}>
                      <Text style={styles.orderSummaryTitle}>Selected Orders Summary</Text>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Orders:</Text>
                        <Text style={styles.summaryValue}>{getAutoOrderSummary().totalOrders}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Products:</Text>
                        <Text style={styles.summaryValue}>{getAutoOrderSummary().totalProducts}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Urgent Orders:</Text>
                        <Text style={[styles.summaryValue, styles.summaryValueUrgent]}>
                          {getAutoOrderSummary().urgentOrders}
                        </Text>
                      </View>
                      <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                        <Text style={styles.summaryLabelBold}>Total Cost:</Text>
                        <Text style={styles.summaryValueLarge}>
                          ৳{getAutoOrderSummary().totalCost.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            {/* Modal Footer */}
            {!loadingAIOrders && aiOrders.length > 0 && (
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalButtonSecondary}
                  onPress={() => setShowAutoOrderModal(false)}
                >
                  <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButtonPrimary,
                    (selectedAIOrders.length === 0 || executingOrders) && styles.modalButtonDisabled
                  ]}
                  onPress={handleExecuteAutoOrders}
                  disabled={selectedAIOrders.length === 0 || executingOrders}
                >
                  {executingOrders ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="flash" size={20} color="#fff" />
                      <Text style={styles.modalButtonPrimaryText}>
                        Execute {selectedAIOrders.length} Order(s)
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  
  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[600],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[700],
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
  
  // AI Alert Strip
  aiAlertStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#faf5ff',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#e9d5ff',
    gap: Spacing.sm,
  },
  aiAlertIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAlertText: {
    flex: 1,
  },
  aiAlertTitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[700],
  },
  aiAlertBold: {
    fontWeight: Typography.fontWeight.bold,
    color: '#8b5cf6',
  },
  aiActionButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  aiActionButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: '#fff',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.paper,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[900],
  },

  // Filters
  filterRow: {
    marginBottom: Spacing.sm,
  },
  stockFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingRight: Spacing.lg,
  },
  filterScrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary.light + '20',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary.light,
  },
  selectAllText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary.main,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.paper,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  filterChipActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  filterChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.neutral[600],
  },
  filterChipTextActive: {
    color: '#fff',
  },
  stockFilterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
  },
  stockFilterChipActive: {
    backgroundColor: Colors.primary.light + '40',
  },
  stockFilterChipText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.neutral[600],
  },
  stockFilterChipTextActive: {
    color: Colors.primary.main,
    fontWeight: Typography.fontWeight.bold,
  },

  // Bulk Actions
  bulkActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary.light + '20',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  bulkActionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary.main,
  },
  bulkActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  bulkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  bulkButtonDisabled: {
    backgroundColor: Colors.neutral[400],
    opacity: 0.7,
  },
  bulkButtonText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: '#fff',
  },
  clearButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  clearButtonText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[600],
  },

  // Products List
  productsList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },

  // Product Card
  productCard: {
    backgroundColor: Colors.background.paper,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productCardSelected: {
    borderColor: Colors.primary.main,
    borderWidth: 2,
    backgroundColor: Colors.primary.light + '10',
  },
  productCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  productCheckbox: {
    width: 24,
    height: 24,
  },
  productStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  productStatusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  productCardBody: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  productImage: {
    width: 60,
    height: 60,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  productSku: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[500],
    marginBottom: 4,
  },
  productCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  productCategoryText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[600],
  },
  stockProgress: {
    marginBottom: Spacing.md,
  },
  stockProgressBar: {
    height: 6,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  stockProgressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  stockProgressText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[600],
    textAlign: 'right',
  },
  productCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  priceSection: {
    gap: 4,
  },
  priceLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[500],
  },
  priceValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  reorderButtonDisabled: {
    backgroundColor: Colors.neutral[400],
    opacity: 0.7,
  },
  reorderButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: '#fff',
  },

  // FAB
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.background.paper,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    maxHeight: '90%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
  },
  modalBody: {
    paddingHorizontal: Spacing.lg,
  },
  aiInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary.light + '20',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  aiInfoText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[700],
    lineHeight: 20,
  },
  aiOrderList: {
    gap: Spacing.md,
  },
  aiOrderItem: {
    backgroundColor: Colors.background.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  aiOrderItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  aiItemCheckSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  aiItemNameSection: {
    flex: 1,
  },
  aiItemName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  aiItemSku: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[500],
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  priorityText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  aiOrderItemDetails: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailRowTotal: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    marginTop: Spacing.xs,
  },
  detailLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
  },
  detailLabelBold: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
  },
  detailValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[900],
  },
  detailValueRed: {
    color: '#dc2626',
    fontWeight: Typography.fontWeight.semibold,
  },
  detailValueOrange: {
    color: '#f59e0b',
    fontWeight: Typography.fontWeight.semibold,
  },
  detailValueBold: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
  },
  qtyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.background.paper,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  qtyButton: {
    padding: Spacing.xs,
  },
  qtyInput: {
    width: 50,
    textAlign: 'center',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[900],
    paddingVertical: 4,
  },
  aiReason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#f0fdf4',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  aiReasonText: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    color: '#065F46',
  },
  orderSummary: {
    backgroundColor: Colors.background.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryRowTotal: {
    paddingTop: Spacing.md,
    borderTopWidth: 2,
    borderTopColor: Colors.border.light,
    marginTop: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
  },
  summaryLabelBold: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
  },
  summaryValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[900],
  },
  summaryValueLarge: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.main,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[700],
  },
  modalButtonPrimary: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary.main,
  },
  modalButtonPrimaryText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: '#fff',
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  
  // Auto Order Modal Styles
  autoOrderCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  autoOrderCardSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: 'rgba(99, 102, 241, 0.03)',
  },
  autoOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  autoOrderCheckSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    flex: 1,
  },
  autoOrderSupplierSection: {
    flex: 1,
  },
  autoOrderSupplier: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  autoOrderMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  autoOrderMeta: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[600],
  },
  confidenceSection: {
    alignItems: 'flex-end',
  },
  confidenceLabel: {
    fontSize: 10,
    color: Colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  confidenceValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.success.main,
  },
  autoOrderDetails: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
    paddingLeft: 32,
  },
  autoOrderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  autoOrderDetailText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
    flex: 1,
  },
  autoOrderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    marginTop: Spacing.xs,
  },
  autoOrderTotalLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[700],
  },
  autoOrderTotalValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.main,
  },
  productPreview: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  productPreviewLabel: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  productPreviewText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[600],
    lineHeight: 16,
  },
  orderSummaryTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.sm,
  },
  summaryValueUrgent: {
    color: '#ef4444',
    fontWeight: Typography.fontWeight.bold,
  },
  
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  loadingMoreText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
  },
  endOfList: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  endOfListText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[500],
    fontStyle: 'italic',
  },
});
