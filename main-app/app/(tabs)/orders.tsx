/**
 * Retailer Orders Screen
 * View and manage all orders with tabs: Active, AI Orders, History, Returns
 * Based on html2/retailer/orders.html design
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius } from '@/constants/Spacing';
import { ordersService, Order } from '@/services/ordersService';
import aiOrdersService, { AIOrder } from '@/services/aiOrdersService';
import { handleApiError } from '@/services/apiClient';

// Order status types matching backend
type OrderStatus = 'pending' | 'accepted' | 'processing' | 'on_the_way' | 'delivered' | 'cancelled';
type TabType = 'active' | 'ai-orders' | 'history' | 'returns';

export default function OrdersScreen() {
  const [selectedTab, setSelectedTab] = useState<TabType>('active');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [aiOrders, setAIOrders] = useState<AIOrder[]>([]);
  const [aiOrdersLoading, setAIOrdersLoading] = useState(false);
  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedOrders = await ordersService.getOrders();
      
      setOrders(fetchedOrders);
      
      // Separate active and history orders
      const active = fetchedOrders.filter(order => 
        ['pending', 'accepted', 'processing', 'on_the_way'].includes(order.status)
      );
      const history = fetchedOrders.filter(order => 
        ['delivered', 'cancelled'].includes(order.status)
      );
      
      setActiveOrders(active);
      setHistoryOrders(history);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      Alert.alert('Error', handleApiError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch AI orders
  const fetchAIOrders = useCallback(async () => {
    try {
      setAIOrdersLoading(true);
      const orders = await aiOrdersService.getAIOrders(5);
      setAIOrders(orders);
    } catch (error) {
      console.error('Failed to fetch AI orders:', error);
      // Don't show alert for AI orders failure, just log it
    } finally {
      setAIOrdersLoading(false);
    }
  }, []);

  // Load orders on mount
  useEffect(() => {
    fetchOrders();
    fetchAIOrders();
  }, [fetchOrders, fetchAIOrders]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }
  };

  const tabs = [
    { key: 'active' as TabType, label: 'Active', count: activeOrders.length },
    { key: 'ai-orders' as TabType, label: 'AI Orders', count: aiOrders.length, isAI: true },
    { key: 'history' as TabType, label: 'History', count: null },
    { key: 'returns' as TabType, label: 'Returns', count: 1, isWarning: true },
  ];

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { bg: '#FEF3C7', text: '#92400E', icon: 'time-outline', label: 'Pending' };
      case 'accepted':
        return { bg: '#DBEAFE', text: '#1E40AF', icon: 'checkmark-circle-outline', label: 'Accepted' };
      case 'processing':
        return { bg: '#E0E7FF', text: '#4338CA', icon: 'sync-outline', label: 'Processing' };
      case 'on_the_way':
        return { bg: '#E0E7FF', text: '#4338CA', icon: 'car-outline', label: 'On The Way' };
      case 'delivered':
        return { bg: '#D1FAE5', text: '#065F46', icon: 'checkmark-done-outline', label: 'Delivered' };
      case 'cancelled':
        return { bg: '#FEE2E2', text: '#991B1B', icon: 'close-circle-outline', label: 'Cancelled' };
      default:
        return { bg: Colors.neutral[100], text: Colors.neutral[600], icon: 'help-outline', label: 'Unknown' };
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchOrders(), fetchAIOrders()]);
    setRefreshing(false);
  }, [fetchOrders, fetchAIOrders]);

  // Handle approve AI order
  const handleApproveOrder = async (orderId: string) => {
    try {
      setApprovingOrderId(orderId);
      
      Alert.alert(
        'Approve Order',
        'Are you sure you want to approve this AI-predicted order?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setApprovingOrderId(null),
          },
          {
            text: 'Approve',
            onPress: async () => {
              try {
                const result = await aiOrdersService.approveOrder(orderId);
                Alert.alert(
                  'Success',
                  `Order #${result.order_id} created successfully!\nTotal: ৳${result.total_amount.toFixed(2)}`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        fetchOrders(); // Refresh orders
                        fetchAIOrders(); // Refresh AI orders
                        setSelectedTab('active'); // Switch to active tab
                      },
                    },
                  ]
                );
              } catch (error) {
                Alert.alert('Error', handleApiError(error));
              } finally {
                setApprovingOrderId(null);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error approving order:', error);
      setApprovingOrderId(null);
    }
  };

  // Handle reject AI order
  const handleRejectOrder = (orderId: string) => {
    Alert.alert(
      'Reject Order',
      'Are you sure you want to reject this AI-predicted order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            // Remove from list
            setAIOrders(prev => prev.filter(order => order.id !== orderId));
            Alert.alert('Order Rejected', 'AI order has been rejected');
          },
        },
      ]
    );
  };

  const renderOrderCard = ({ item }: { item: Order }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderCardHeader}>
          <View style={styles.orderCardLeft}>
            <Text style={styles.orderNumber}>{item.order_number}</Text>
            <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Ionicons name={statusStyle.icon as any} size={14} color={statusStyle.text} />
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>

        <View style={styles.orderCardBody}>
          <View style={styles.supplierRow}>
            <Ionicons name="business-outline" size={16} color={Colors.neutral[500]} />
            <Text style={styles.supplierName}>{item.supplier_name || 'Unknown Supplier'}</Text>
          </View>
          <View style={styles.orderItemsRow}>
            <Ionicons name="cube-outline" size={14} color={Colors.neutral[500]} />
            <Text style={styles.orderItemsText}>
              {item.total_items} {item.total_items === 1 ? 'item' : 'items'} • {item.total_quantity} units
            </Text>
          </View>
        </View>

        <View style={styles.orderCardFooter}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amount}>৳{parseFloat(item.total_amount).toLocaleString()}</Text>
          </View>
          <TouchableOpacity style={styles.trackButton}>
            <Text style={styles.trackButtonText}>Track Order</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAIOrders = () => (
    <ScrollView 
      style={styles.aiOrdersContainer} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.sectionTitle}>AI Predicted Orders</Text>
      
      {aiOrdersLoading && !aiOrders.length ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Generating AI predictions...</Text>
        </View>
      ) : aiOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="sparkles-outline" size={64} color={Colors.neutral[300]} />
          <Text style={styles.emptyTitle}>No AI Predictions Yet</Text>
          <Text style={styles.emptyMessage}>
            AI will analyze your sales patterns and suggest orders when patterns are detected.
          </Text>
        </View>
      ) : (
        aiOrders.map((aiOrder) => (
          <View key={aiOrder.id} style={styles.aiCard}>
            <View style={styles.aiCardHeader}>
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={14} color="#8b5cf6" />
                <Text style={styles.aiBadgeText}>AI Predicted</Text>
              </View>
              <View style={styles.confidenceScore}>
                <Text 
                  style={[
                    styles.confidenceValue, 
                    { color: aiOrdersService.getConfidenceColor(aiOrder.confidence_score) }
                  ]}
                >
                  {aiOrder.confidence_score}%
                </Text>
                <Text style={styles.confidenceLabel}>Confidence</Text>
              </View>
            </View>

            <View style={styles.aiCardBody}>
              <Text style={styles.aiCardTitle}>{aiOrder.title}</Text>
              <Text style={styles.aiCardReason}>{aiOrder.reason}</Text>

              <View style={styles.aiSupplierRow}>
                <Ionicons name="business-outline" size={16} color={Colors.neutral[500]} />
                <Text style={styles.aiSupplierName}>{aiOrder.supplier_name}</Text>
              </View>

              <View style={styles.aiItems}>
                {aiOrder.items.slice(0, 3).map((item, index) => (
                  <View key={index} style={styles.aiItem}>
                    <View style={styles.aiItemDetails}>
                      <Text style={styles.aiItemName} numberOfLines={1}>
                        {item.product_name}
                      </Text>
                      <Text style={styles.aiItemQty}>Qty: {item.quantity} units</Text>
                    </View>
                    <Text style={styles.aiItemPrice}>
                      {aiOrdersService.formatCurrency(item.subtotal)}
                    </Text>
                  </View>
                ))}
                {aiOrder.items.length > 3 && (
                  <Text style={styles.aiItemsMore}>
                    +{aiOrder.items.length - 3} more items
                  </Text>
                )}
              </View>

              <View style={styles.aiInsights}>
                {aiOrder.insights.map((insight, index) => (
                  <View key={index} style={styles.insightTag}>
                    <Ionicons 
                      name={index === 0 ? "trending-up" : "time-outline"} 
                      size={12} 
                      color={index === 0 ? "#059669" : "#0284c7"} 
                    />
                    <Text style={styles.insightText}>{insight}</Text>
                  </View>
                ))}
                {aiOrder.estimated_delivery_days && (
                  <View style={styles.insightTag}>
                    <Ionicons name="car-outline" size={12} color="#0284c7" />
                    <Text style={styles.insightText}>
                      Delivery: {aiOrder.estimated_delivery_days}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.aiTotal}>
                <Text style={styles.aiTotalLabel}>Total Amount:</Text>
                <Text style={styles.aiTotalValue}>
                  {aiOrdersService.formatCurrency(aiOrder.total_amount)}
                </Text>
              </View>
            </View>

            <View style={styles.aiCardActions}>
              <TouchableOpacity 
                style={styles.rejectButton}
                onPress={() => handleRejectOrder(aiOrder.id)}
                disabled={approvingOrderId === aiOrder.id}
              >
                <Ionicons name="close" size={18} color="#dc2626" />
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.approveButton,
                  approvingOrderId === aiOrder.id && styles.approveButtonDisabled
                ]}
                onPress={() => handleApproveOrder(aiOrder.id)}
                disabled={approvingOrderId === aiOrder.id}
              >
                {approvingOrderId === aiOrder.id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Text style={styles.approveButtonText}>Approve Order</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderReturns = () => (
    <ScrollView style={styles.returnsContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Returns & Refunds</Text>
      
      <View style={styles.returnCard}>
        <View style={styles.returnHeader}>
          <View>
            <Text style={styles.returnLabel}>Return ID:</Text>
            <Text style={styles.returnValue}>#R-1021</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="alert-circle-outline" size={12} color="#92400E" />
            <Text style={[styles.statusText, { color: '#92400E' }]}>Pending Review</Text>
          </View>
        </View>

        <View style={styles.returnDetails}>
          <View style={styles.returnDetailRow}>
            <Text style={styles.returnDetailLabel}>Original Order:</Text>
            <Text style={styles.returnDetailValue}>#1042</Text>
          </View>
          <View style={styles.returnDetailRow}>
            <Text style={styles.returnDetailLabel}>Supplier:</Text>
            <Text style={styles.returnDetailValue}>Square Food</Text>
          </View>
          <View style={styles.returnDetailRow}>
            <Text style={styles.returnDetailLabel}>Date:</Text>
            <Text style={styles.returnDetailValue}>1 Nov</Text>
          </View>
          <View style={styles.returnDetailRow}>
            <Text style={styles.returnDetailLabel}>Reason:</Text>
            <Text style={styles.returnDetailValue}>Damaged items (3 units)</Text>
          </View>
          <View style={styles.returnDetailRow}>
            <Text style={styles.returnDetailLabel}>Refund Amount:</Text>
            <Text style={[styles.returnDetailValue, styles.refundAmount]}>৳1,350</Text>
          </View>
        </View>

        <View style={styles.returnActions}>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Contact Supplier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    // Show loading state
    if (loading && !refreshing) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      );
    }

    switch (selectedTab) {
      case 'active':
        return (
          <View style={styles.ordersContainer}>
            <Text style={styles.sectionTitle}>Active Orders</Text>
            {activeOrders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="clipboard-outline" size={64} color={Colors.neutral[400]} />
                <Text style={styles.emptyTitle}>No Active Orders</Text>
                <Text style={styles.emptyMessage}>You don't have any active orders at the moment.</Text>
              </View>
            ) : (
              <FlatList
                data={activeOrders}
                renderItem={renderOrderCard}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.ordersList}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              />
            )}
          </View>
        );
      case 'ai-orders':
        return renderAIOrders();
      case 'history':
        return (
          <View style={styles.ordersContainer}>
            <Text style={styles.sectionTitle}>Order History</Text>
            {historyOrders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="time-outline" size={64} color={Colors.neutral[400]} />
                <Text style={styles.emptyTitle}>No Order History</Text>
                <Text style={styles.emptyMessage}>Your completed orders will appear here.</Text>
              </View>
            ) : (
              <FlatList
                data={historyOrders}
                renderItem={renderOrderCard}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.ordersList}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              />
            )}
          </View>
        );
      case 'returns':
        return renderReturns();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, selectedTab === tab.key && styles.tabActive]}
              onPress={() => setSelectedTab(tab.key)}
            >
              <Text style={[styles.tabText, selectedTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {tab.count !== null && (
                <View style={[
                  styles.tabBadge,
                  tab.isAI && styles.tabBadgeAI,
                  tab.isWarning && styles.tabBadgeWarning
                ]}>
                  <Text style={styles.tabBadgeText}>{tab.count}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  tabsContainer: {
    backgroundColor: Colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    paddingTop: Spacing.sm,
  },
  tabsContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: Spacing.xs,
  },
  tabActive: {
    borderBottomColor: Colors.primary.main,
  },
  tabText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.neutral[600],
  },
  tabTextActive: {
    color: Colors.primary.main,
    fontWeight: Typography.fontWeight.semibold,
  },
  tabBadge: {
    backgroundColor: Colors.neutral[200],
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeAI: {
    backgroundColor: '#e0e7ff',
  },
  tabBadgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  tabBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[700],
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
    padding: Spacing.lg,
  },
  
  // Orders Container & List
  ordersContainer: {
    flex: 1,
  },
  ordersList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  
  // Order Card Styles
  orderCard: {
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
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  orderCardLeft: {
    gap: Spacing.xs,
  },
  orderNumber: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.main,
  },
  orderDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[500],
  },
  orderCardBody: {
    marginBottom: Spacing.md,
  },
  supplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  supplierName: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[900],
    fontWeight: Typography.fontWeight.medium,
  },
  orderItemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  orderItemsText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
  },
  orderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  amountContainer: {
    gap: 4,
  },
  amountLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  trackButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: '#fff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },

  // Loading & Empty States
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[600],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyMessage: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[600],
    textAlign: 'center',
  },

  // AI Orders Styles
  aiOrdersContainer: {
    flex: 1,
    padding: Spacing.lg,
  },
  aiCard: {
    backgroundColor: Colors.background.paper,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  aiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f3e8ff',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  aiBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: '#8b5cf6',
  },
  confidenceScore: {
    alignItems: 'center',
  },
  confidenceValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.main,
  },
  confidenceLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[600],
  },
  aiCardBody: {
    gap: Spacing.md,
  },
  aiCardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
  },
  aiCardReason: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
    lineHeight: 20,
  },
  aiItems: {
    gap: Spacing.sm,
  },
  aiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  aiItemIcon: {
    fontSize: 24,
  },
  aiItemDetails: {
    flex: 1,
  },
  aiItemName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.neutral[900],
  },
  aiItemQty: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[600],
  },
  aiItemPrice: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[900],
  },
  aiInsights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  insightTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.neutral[50],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  insightText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[700],
  },
  aiTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  aiTotalLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[700],
  },
  aiTotalValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
  },
  aiCardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#dc2626',
    backgroundColor: Colors.background.paper,
  },
  rejectButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: '#dc2626',
  },
  approveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary.main,
  },
  approveButtonDisabled: {
    opacity: 0.6,
  },
  approveButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: '#fff',
  },
  aiSupplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  aiSupplierName: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[700],
    fontWeight: Typography.fontWeight.medium,
  },
  aiItemsMore: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[500],
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },

  // Returns Styles
  returnsContainer: {
    flex: 1,
    padding: Spacing.lg,
  },
  returnCard: {
    backgroundColor: Colors.background.paper,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  returnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  returnLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[600],
    marginBottom: 4,
  },
  returnValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[900],
  },
  returnDetails: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  returnDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  returnDetailLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
  },
  returnDetailValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.neutral[900],
  },
  refundAmount: {
    color: Colors.primary.main,
    fontWeight: Typography.fontWeight.bold,
  },
  returnActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    backgroundColor: Colors.background.paper,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[700],
  },
  primaryButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: '#fff',
  },
});
