/**
 * Retailer Inventory Management Screen
 * Manage products, stock levels, and restock alerts
 * Based on html2/retailer/inventory.html design
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius } from '@/constants/Spacing';

type StockStatus = 'low' | 'good' | 'out';
type Category = 'beverages' | 'dairy' | 'snacks' | 'grocery' | 'cleaning';
type Priority = 'high' | 'medium' | 'low';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: Category;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  imageUrl?: string;
  stockStatus: StockStatus;
}

interface AIOrderItem {
  product: Product;
  suggestedQty: number;
  priority: Priority;
  reason: string;
  isSelected: boolean;
}

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Coca Cola 250ml',
    sku: 'BEV-1001',
    category: 'beverages',
    currentStock: 45,
    minStock: 30,
    maxStock: 200,
    unitPrice: 25,
    stockStatus: 'good',
  },
  {
    id: '2',
    name: 'Detergent Powder 1kg',
    sku: 'CLN-2001',
    category: 'cleaning',
    currentStock: 12,
    minStock: 20,
    maxStock: 100,
    unitPrice: 85,
    stockStatus: 'low',
  },
  {
    id: '3',
    name: 'Fresh Milk 1L',
    sku: 'DAI-3001',
    category: 'dairy',
    currentStock: 8,
    minStock: 15,
    maxStock: 80,
    unitPrice: 95,
    stockStatus: 'low',
  },
  {
    id: '4',
    name: 'Chips Family Pack',
    sku: 'SNK-4001',
    category: 'snacks',
    currentStock: 0,
    minStock: 25,
    maxStock: 150,
    unitPrice: 120,
    stockStatus: 'out',
  },
  {
    id: '5',
    name: 'Basmati Rice 5kg',
    sku: 'GRO-5001',
    category: 'grocery',
    currentStock: 75,
    minStock: 40,
    maxStock: 200,
    unitPrice: 550,
    stockStatus: 'good',
  },
  {
    id: '6',
    name: 'Yogurt Cup 200g',
    sku: 'DAI-3002',
    category: 'dairy',
    currentStock: 18,
    minStock: 20,
    maxStock: 100,
    unitPrice: 35,
    stockStatus: 'low',
  },
];

export default function InventoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Category>('all');
  const [stockFilter, setStockFilter] = useState<'all' | StockStatus>('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiOrderItems, setAIOrderItems] = useState<AIOrderItem[]>([]);

  // Initialize AI order suggestions
  React.useEffect(() => {
    const lowStockProducts = mockProducts.filter(p => p.stockStatus === 'low' || p.stockStatus === 'out');
    const aiSuggestions: AIOrderItem[] = lowStockProducts.map(product => ({
      product,
      suggestedQty: product.maxStock - product.currentStock,
      priority: product.stockStatus === 'out' ? 'high' : 
                product.currentStock < product.minStock / 2 ? 'high' : 'medium',
      reason: product.stockStatus === 'out' 
        ? 'Critical low • Daily essential item'
        : product.currentStock < product.minStock / 2
        ? `Shortage in ${Math.ceil((product.currentStock / product.minStock) * 7)} days • High demand`
        : 'Weekend demand spike expected',
      isSelected: true,
    }));
    setAIOrderItems(aiSuggestions);
  }, []);

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

  const getCategoryLabel = (category: Category) => {
    const labels = {
      beverages: 'Beverages',
      dairy: 'Dairy',
      snacks: 'Snacks',
      grocery: 'Grocery',
      cleaning: 'Cleaning',
    };
    return labels[category];
  };

  const getStockStatusLabel = (status: StockStatus) => {
    const labels = {
      low: 'Low Stock',
      good: 'In Stock',
      out: 'Out of Stock',
    };
    return labels[status];
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStock = stockFilter === 'all' || product.stockStatus === stockFilter;
    return matchesSearch && matchesCategory && matchesStock;
  });

  const lowStockCount = mockProducts.filter(p => p.stockStatus === 'low').length;
  const outOfStockCount = mockProducts.filter(p => p.stockStatus === 'out').length;

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
      i === index ? { ...item, suggestedQty: Math.max(1, qty) } : item
    ));
  };

  const calculateAIOrderTotal = () => {
    return aiOrderItems
      .filter(item => item.isSelected)
      .reduce((sum, item) => sum + (item.product.unitPrice * item.suggestedQty), 0);
  };

  const getSelectedAIItemsCount = () => {
    return aiOrderItems.filter(item => item.isSelected).length;
  };

  const getTotalAIUnits = () => {
    return aiOrderItems
      .filter(item => item.isSelected)
      .reduce((sum, item) => sum + item.suggestedQty, 0);
  };

  const handleApproveAIOrder = () => {
    // TODO: Implement order submission
    const selectedItems = aiOrderItems.filter(item => item.isSelected);
    console.log('Approving AI order:', selectedItems);
    setShowAIModal(false);
    // Show success message
  };

  const renderProductCard = ({ item }: { item: Product }) => {
    const statusStyle = getStockStatusStyle(item.stockStatus);
    const isSelected = selectedProducts.includes(item.id);
    const stockPercentage = (item.currentStock / item.maxStock) * 100;

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
              {getStockStatusLabel(item.stockStatus)}
            </Text>
          </View>
        </View>

        <View style={styles.productCardBody}>
          <View style={styles.productImage}>
            <Ionicons name="cube-outline" size={40} color={Colors.neutral[400]} />
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productSku}>SKU: {item.sku}</Text>
            <View style={styles.productCategory}>
              <Ionicons name="pricetag-outline" size={12} color={Colors.neutral[500]} />
              <Text style={styles.productCategoryText}>{getCategoryLabel(item.category)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.stockProgress}>
          <View style={styles.stockProgressBar}>
            <View
              style={[
                styles.stockProgressFill,
                {
                  width: `${Math.min(stockPercentage, 100)}%`,
                  backgroundColor: item.stockStatus === 'out' ? '#dc2626' :
                                  item.stockStatus === 'low' ? '#f59e0b' : '#10b981'
                }
              ]}
            />
          </View>
          <Text style={styles.stockProgressText}>
            {item.currentStock} / {item.maxStock} units
          </Text>
        </View>

        <View style={styles.productCardFooter}>
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Unit Price</Text>
            <Text style={styles.priceValue}>৳{item.unitPrice}</Text>
          </View>
          <TouchableOpacity style={styles.reorderButton}>
            <Ionicons name="cart-outline" size={16} color="#fff" />
            <Text style={styles.reorderButtonText}>Reorder</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* AI Alert Strip */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <TouchableOpacity style={styles.aiAlertStrip} onPress={() => setShowAIModal(true)}>
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
          <TouchableOpacity style={styles.aiActionButton} onPress={() => setShowAIModal(true)}>
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

      {/* Filter Row */}
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
          {(['beverages', 'dairy', 'snacks', 'grocery', 'cleaning'] as Category[]).map(cat => (
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
      </View>

      {/* Selected Products Bar */}
      {selectedProducts.length > 0 && (
        <View style={styles.bulkActionBar}>
          <Text style={styles.bulkActionText}>
            {selectedProducts.length} item{selectedProducts.length > 1 ? 's' : ''} selected
          </Text>
          <View style={styles.bulkActions}>
            <TouchableOpacity style={styles.bulkButton}>
              <Ionicons name="cart-outline" size={18} color="#fff" />
              <Text style={styles.bulkButtonText}>Bulk Order</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSelectedProducts([])}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
      />

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
                  const subtotal = item.product.unitPrice * item.suggestedQty;

                  return (
                    <View key={item.product.id} style={styles.aiOrderItem}>
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
                            <Text style={styles.aiItemName}>{item.product.name}</Text>
                            <Text style={styles.aiItemSku}>SKU: {item.product.sku}</Text>
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
                            item.product.stockStatus === 'out' && styles.detailValueRed,
                            item.product.stockStatus === 'low' && styles.detailValueOrange
                          ]}>
                            {item.product.currentStock} units
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>AI Suggested Qty:</Text>
                          <View style={styles.qtyInputContainer}>
                            <TouchableOpacity
                              style={styles.qtyButton}
                              onPress={() => updateAIItemQty(index, item.suggestedQty - 10)}
                            >
                              <Ionicons name="remove" size={16} color={Colors.neutral[600]} />
                            </TouchableOpacity>
                            <TextInput
                              style={styles.qtyInput}
                              value={item.suggestedQty.toString()}
                              onChangeText={(text) => updateAIItemQty(index, parseInt(text) || 1)}
                              keyboardType="number-pad"
                            />
                            <TouchableOpacity
                              style={styles.qtyButton}
                              onPress={() => updateAIItemQty(index, item.suggestedQty + 10)}
                            >
                              <Ionicons name="add" size={16} color={Colors.neutral[600]} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Unit Price:</Text>
                          <Text style={styles.detailValue}>৳{item.product.unitPrice}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
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
    marginBottom: Spacing.md,
  },
  filterScrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
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
});
