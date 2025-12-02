/**
 * Retailer Orders Screen
 * View and manage all orders with tabs: Active, AI Orders, History, Returns
 * Based on html2/retailer/orders.html design
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius } from '@/constants/Spacing';

// Order status types
type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'in-transit' | 'delivered' | 'cancelled';
type TabType = 'active' | 'ai-orders' | 'history' | 'returns';

interface Order {
  id: string;
  orderNumber: string;
  supplier: string;
  date: string;
  status: OrderStatus;
  amount: number;
}

// Mock data
const activeOrders: Order[] = [
  { id: '1', orderNumber: '#1048', supplier: 'Unilever BD', date: '5 Nov', status: 'in-transit', amount: 12000 },
  { id: '2', orderNumber: '#1047', supplier: 'ACI Ltd', date: '4 Nov', status: 'processing', amount: 8500 },
  { id: '3', orderNumber: '#1046', supplier: 'Square Food', date: '3 Nov', status: 'confirmed', amount: 15300 },
  { id: '4', orderNumber: '#1045', supplier: 'Pran Foods', date: '2 Nov', status: 'pending', amount: 6750 },
];

const historyOrders: Order[] = [
  { id: '5', orderNumber: '#1044', supplier: 'Unilever BD', date: '28 Oct', status: 'delivered', amount: 14200 },
  { id: '6', orderNumber: '#1043', supplier: 'ACI Ltd', date: '25 Oct', status: 'delivered', amount: 9800 },
  { id: '7', orderNumber: '#1042', supplier: 'Square Food', date: '22 Oct', status: 'delivered', amount: 11500 },
];

export default function OrdersScreen() {
  const [selectedTab, setSelectedTab] = useState<TabType>('active');
  const [refreshing, setRefreshing] = useState(false);

  const tabs = [
    { key: 'active' as TabType, label: 'Active', count: 4 },
    { key: 'ai-orders' as TabType, label: 'AI Orders', count: 2, isAI: true },
    { key: 'history' as TabType, label: 'History', count: null },
    { key: 'returns' as TabType, label: 'Returns', count: 1, isWarning: true },
  ];

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { bg: '#FEF3C7', text: '#92400E', icon: 'time-outline' };
      case 'confirmed':
        return { bg: '#DBEAFE', text: '#1E40AF', icon: 'checkmark-circle-outline' };
      case 'processing':
        return { bg: '#E0E7FF', text: '#4338CA', icon: 'sync-outline' };
      case 'in-transit':
        return { bg: '#E0E7FF', text: '#4338CA', icon: 'car-outline' };
      case 'delivered':
        return { bg: '#D1FAE5', text: '#065F46', icon: 'checkmark-done-outline' };
      case 'cancelled':
        return { bg: '#FEE2E2', text: '#991B1B', icon: 'close-circle-outline' };
      default:
        return { bg: Colors.neutral[100], text: Colors.neutral[600], icon: 'help-outline' };
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const renderOrderCard = ({ item }: { item: Order }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderCardHeader}>
          <View style={styles.orderCardLeft}>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <Text style={styles.orderDate}>{item.date}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Ionicons name={statusStyle.icon as any} size={14} color={statusStyle.text} />
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status === 'in-transit' ? 'In Transit' : 
               item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.orderCardBody}>
          <View style={styles.supplierRow}>
            <Ionicons name="business-outline" size={16} color={Colors.neutral[500]} />
            <Text style={styles.supplierName}>{item.supplier}</Text>
          </View>
        </View>

        <View style={styles.orderCardFooter}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amount}>৳{item.amount.toLocaleString()}</Text>
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
    <ScrollView style={styles.aiOrdersContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>AI Predicted Orders</Text>
      
      {/* AI Order Card 1 */}
      <View style={styles.aiCard}>
        <View style={styles.aiCardHeader}>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={14} color="#8b5cf6" />
            <Text style={styles.aiBadgeText}>AI Predicted</Text>
          </View>
          <View style={styles.confidenceScore}>
            <Text style={styles.confidenceValue}>90%</Text>
            <Text style={styles.confidenceLabel}>Confidence</Text>
          </View>
        </View>

        <View style={styles.aiCardBody}>
          <Text style={styles.aiCardTitle}>Weekly Restock Recommendation</Text>
          <Text style={styles.aiCardReason}>Based on sales trends, these products need restocking to meet demand.</Text>

          <View style={styles.aiItems}>
            <View style={styles.aiItem}>
              <Text style={styles.aiItemIcon}>🥤</Text>
              <View style={styles.aiItemDetails}>
                <Text style={styles.aiItemName}>Coca Cola 250ml</Text>
                <Text style={styles.aiItemQty}>Qty: 100 units</Text>
              </View>
              <Text style={styles.aiItemPrice}>৳2,500</Text>
            </View>
            <View style={styles.aiItem}>
              <Text style={styles.aiItemIcon}>🧼</Text>
              <View style={styles.aiItemDetails}>
                <Text style={styles.aiItemName}>Detergent 1kg</Text>
                <Text style={styles.aiItemQty}>Qty: 50 units</Text>
              </View>
              <Text style={styles.aiItemPrice}>৳4,250</Text>
            </View>
            <View style={styles.aiItem}>
              <Text style={styles.aiItemIcon}>🥛</Text>
              <View style={styles.aiItemDetails}>
                <Text style={styles.aiItemName}>Fresh Milk 1L</Text>
                <Text style={styles.aiItemQty}>Qty: 60 units</Text>
              </View>
              <Text style={styles.aiItemPrice}>৳5,700</Text>
            </View>
          </View>

          <View style={styles.aiInsights}>
            <View style={styles.insightTag}>
              <Ionicons name="trending-up" size={12} color="#059669" />
              <Text style={styles.insightText}>90% match to sales forecast</Text>
            </View>
            <View style={styles.insightTag}>
              <Ionicons name="time-outline" size={12} color="#0284c7" />
              <Text style={styles.insightText}>Delivery: 2-3 days</Text>
            </View>
          </View>

          <View style={styles.aiTotal}>
            <Text style={styles.aiTotalLabel}>Total Amount:</Text>
            <Text style={styles.aiTotalValue}>৳12,450</Text>
          </View>
        </View>

        <View style={styles.aiCardActions}>
          <TouchableOpacity style={styles.rejectButton}>
            <Ionicons name="close" size={18} color="#dc2626" />
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.approveButton}>
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.approveButtonText}>Approve Order</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* AI Order Card 2 */}
      <View style={styles.aiCard}>
        <View style={styles.aiCardHeader}>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={14} color="#8b5cf6" />
            <Text style={styles.aiBadgeText}>AI Predicted</Text>
          </View>
          <View style={styles.confidenceScore}>
            <Text style={styles.confidenceValue}>85%</Text>
            <Text style={styles.confidenceLabel}>Confidence</Text>
          </View>
        </View>

        <View style={styles.aiCardBody}>
          <Text style={styles.aiCardTitle}>Snacks Category Boost</Text>
          <Text style={styles.aiCardReason}>Weekend demand spike expected based on historical patterns.</Text>

          <View style={styles.aiItems}>
            <View style={styles.aiItem}>
              <Text style={styles.aiItemIcon}>🍟</Text>
              <View style={styles.aiItemDetails}>
                <Text style={styles.aiItemName}>Chips Family Pack</Text>
                <Text style={styles.aiItemQty}>Qty: 40 units</Text>
              </View>
              <Text style={styles.aiItemPrice}>৳4,800</Text>
            </View>
            <View style={styles.aiItem}>
              <Text style={styles.aiItemIcon}>🍫</Text>
              <View style={styles.aiItemDetails}>
                <Text style={styles.aiItemName}>Chocolate Bars</Text>
                <Text style={styles.aiItemQty}>Qty: 80 units</Text>
              </View>
              <Text style={styles.aiItemPrice}>৳3,200</Text>
            </View>
          </View>

          <View style={styles.aiInsights}>
            <View style={styles.insightTag}>
              <Ionicons name="trending-up" size={12} color="#059669" />
              <Text style={styles.insightText}>85% match to sales forecast</Text>
            </View>
            <View style={styles.insightTag}>
              <Ionicons name="time-outline" size={12} color="#0284c7" />
              <Text style={styles.insightText}>Delivery: 1-2 days</Text>
            </View>
          </View>

          <View style={styles.aiTotal}>
            <Text style={styles.aiTotalLabel}>Total Amount:</Text>
            <Text style={styles.aiTotalValue}>৳8,000</Text>
          </View>
        </View>

        <View style={styles.aiCardActions}>
          <TouchableOpacity style={styles.rejectButton}>
            <Ionicons name="close" size={18} color="#dc2626" />
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.approveButton}>
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.approveButtonText}>Approve Order</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    switch (selectedTab) {
      case 'active':
        return (
          <View style={styles.ordersContainer}>
            <Text style={styles.sectionTitle}>Active Orders</Text>
            <FlatList
              data={activeOrders}
              renderItem={renderOrderCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.ordersList}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
          </View>
        );
      case 'ai-orders':
        return renderAIOrders();
      case 'history':
        return (
          <View style={styles.ordersContainer}>
            <Text style={styles.sectionTitle}>Order History</Text>
            <FlatList
              data={historyOrders}
              renderItem={renderOrderCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.ordersList}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
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
  approveButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: '#fff',
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
