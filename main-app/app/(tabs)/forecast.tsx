/**
 * Demand Forecasting Screen
 * AI-powered demand forecasting and reorder recommendations
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
import { 
  forecastService, 
  ProductRecommendation,
  SmartAnalysisResponse,
  SmartProductAnalysis 
} from '@/services/forecastService';
import { handleApiError } from '@/services/apiClient';
import { cartService } from '@/services/cartService';

export default function ForecastScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [smartAnalysis, setSmartAnalysis] = useState<SmartAnalysisResponse | null>(null);
  const [addingToCart, setAddingToCart] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await forecastService.getSmartProductAnalysis(30, 10);
      setSmartAnalysis(data);
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleAddToCart = async (productId: number, quantity: number) => {
    try {
      setAddingToCart(prev => ({ ...prev, [productId]: true }));
      
      await cartService.addToCart(productId, quantity);
      
      Alert.alert(
        '✓ Added to Cart',
        `${quantity} units added successfully.\n\nView your cart in the Cart tab to checkout.`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      
      // Parse error response
      const errorData = error?.response?.data;
      
      // Check for structured stock error
      if (errorData?.available_stock) {
        const availableStock = parseInt(errorData.available_stock[0] || errorData.available_stock);
        const requested = parseInt(errorData.requested_quantity?.[0] || errorData.requested_quantity || quantity);
        
        if (availableStock > 0) {
          Alert.alert(
            'Limited Stock Available',
            `Only ${availableStock} units available at supplier. You requested ${requested} units.\n\nWould you like to add ${availableStock} units instead?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: `Add ${availableStock}`, 
                onPress: () => handleAddToCart(productId, availableStock)
              }
            ]
          );
        } else {
          Alert.alert(
            'Out of Stock',
            'This product is currently out of stock at the supplier. Please try again later.',
            [{ text: 'OK' }]
          );
        }
        return;
      }
      
      // Check for generic stock error message
      const errorMessage = errorData?.error || 
                          errorData?.quantity?.[0] || 
                          handleApiError(error);
      
      if (errorMessage.includes('available')) {
        const availableMatch = errorMessage.match(/(\d+)\s+items?\s+available/i);
        if (availableMatch) {
          const availableStock = parseInt(availableMatch[1]);
          Alert.alert(
            'Limited Stock',
            `Only ${availableStock} units available. Would you like to add ${availableStock} units instead?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: `Add ${availableStock}`, 
                onPress: () => handleAddToCart(productId, availableStock)
              }
            ]
          );
          return;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return '#dc2626';
      case 'soon':
        return '#f59e0b';
      case 'normal':
        return '#3b82f6';
      default:
        return Colors.neutral[500];
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return 'alert-circle';
      case 'soon':
        return 'warning';
      default:
        return 'checkmark-circle';
    }
  };

  const renderRecommendationCard = (item: ProductRecommendation) => {
    const urgencyColor = getUrgencyColor(item.reorder_urgency);
    const urgencyIcon = getUrgencyIcon(item.reorder_urgency);
    const isAddingToCart = addingToCart[item.product_id] || false;

    return (
      <View key={item.product_id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.productName}>{item.product_name}</Text>
            <Text style={styles.productId}>#{item.product_id}</Text>
          </View>
          <View style={[styles.urgencyBadge, { backgroundColor: urgencyColor + '20' }]}>
            <Ionicons name={urgencyIcon as any} size={14} color={urgencyColor} />
            <Text style={[styles.urgencyText, { color: urgencyColor }]}>
              {item.reorder_urgency.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Shop Stock</Text>
              <Text style={styles.statValue}>{item.current_shop_stock}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Customer Demand</Text>
              <Text style={styles.statValue}>{item.predicted_demand}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Days Left</Text>
              <Text style={[styles.statValue, item.days_until_stockout <= 5 && styles.dangerText]}>
                {item.days_until_stockout}
              </Text>
            </View>
          </View>

          {item.should_reorder && (
            <View style={styles.reorderSection}>
              <View style={styles.reorderInfo}>
                <Ionicons name="cart-outline" size={20} color={Colors.primary.main} />
                <Text style={styles.reorderText}>
                  Reorder: {item.suggested_order_quantity} units
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.addToCartButton, isAddingToCart && styles.addToCartButtonDisabled]}
                onPress={() => handleAddToCart(item.product_id, item.suggested_order_quantity)}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="cart" size={18} color="#fff" />
                    <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.insightText}>{item.quick_insight}</Text>
        </View>
      </View>
    );
  };

  const renderSmartAnalysisCard = (item: SmartProductAnalysis) => {
    const isAddingToCart = addingToCart[item.product_id] || false;
    
    // Determine badge color based on demand score
    const getDemandBadgeColor = (score: number) => {
      if (score >= 60) return '#10b981'; // Green - High demand
      if (score >= 30) return '#f59e0b'; // Orange - Medium demand
      return '#6b7280'; // Gray - Low demand
    };

    const demandColor = getDemandBadgeColor(item.demand_score);

    return (
      <View key={item.product_id} style={styles.card}>
        {/* Header with demand score */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.productName}>{item.product_name}</Text>
            <Text style={styles.productId}>
              Supplier: {item.supplier_name} • ৳{item.unit_price}
            </Text>
          </View>
          <View style={[styles.demandBadge, { backgroundColor: demandColor + '20' }]}>
            <Ionicons name="trending-up" size={16} color={demandColor} />
            <Text style={[styles.demandScoreText, { color: demandColor }]}>
              {item.demand_score}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Stock</Text>
            <Text style={styles.statValue}>{item.current_stock}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Daily Avg</Text>
            <Text style={styles.statValue}>{item.daily_avg_demand.toFixed(2)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>30d Demand</Text>
            <Text style={styles.statValue}>{item.predicted_demand_30d.toFixed(1)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Days Left</Text>
            <Text style={[
              styles.statValue,
              item.days_until_stockout <= 7 && styles.dangerText
            ]}>
              {item.days_until_stockout > 365 ? '365+' : item.days_until_stockout}
            </Text>
          </View>
        </View>

        {/* Confidence & Trend */}
        <View style={styles.badgeRow}>
          <View style={[styles.smallBadge, { backgroundColor: Colors.primary.main + '20' }]}>
            <Text style={[styles.smallBadgeText, { color: Colors.primary.main }]}>
              {item.confidence_level.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.smallBadge, { backgroundColor: Colors.neutral[200] }]}>
            <Ionicons 
              name={item.trend === 'increasing' ? 'trending-up' : item.trend === 'decreasing' ? 'trending-down' : 'remove'} 
              size={12} 
              color={Colors.neutral[700]} 
            />
            <Text style={[styles.smallBadgeText, { color: Colors.neutral[700] }]}>
              {item.trend}
            </Text>
          </View>
          {item.urgency_score >= 70 && (
            <View style={[styles.smallBadge, { backgroundColor: '#dc2626' + '20' }]}>
              <Ionicons name="alert-circle" size={12} color="#dc2626" />
              <Text style={[styles.smallBadgeText, { color: '#dc2626' }]}>
                URGENT
              </Text>
            </View>
          )}
        </View>

        {/* Reorder Section */}
        {item.should_reorder && (
          <View style={styles.reorderSection}>
            <View style={styles.reorderInfo}>
              <Ionicons name="cart-outline" size={20} color={Colors.primary.main} />
              <Text style={styles.reorderText}>
                Reorder: {item.suggested_order_qty} units
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addToCartButton, isAddingToCart && styles.addToCartButtonDisabled]}
              onPress={() => handleAddToCart(item.product_id, item.suggested_order_qty)}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="cart" size={18} color="#fff" />
                  <Text style={styles.addToCartButtonText}>Add</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderSmartAnalysisView = () => {
    if (!smartAnalysis) return null;

    return (
      <>
        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryHeader}>
            <Text style={styles.sectionTitle}>🤖 AI Smart Analysis</Text>
            <Text style={styles.summarySubtitle}>{smartAnalysis.insights.recommendation}</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.summaryCard}>
              <Ionicons name="cube-outline" size={24} color={Colors.primary.main} />
              <Text style={styles.summaryValue}>{smartAnalysis.summary.total_products_analyzed}</Text>
              <Text style={styles.summaryLabel}>Analyzed</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="flame-outline" size={24} color="#10b981" />
              <Text style={styles.summaryValue}>{smartAnalysis.summary.high_demand_products_count}</Text>
              <Text style={styles.summaryLabel}>High Demand</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="cart-outline" size={24} color="#f59e0b" />
              <Text style={styles.summaryValue}>{smartAnalysis.summary.products_need_reorder}</Text>
              <Text style={styles.summaryLabel}>Need Reorder</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="alert-circle-outline" size={24} color="#dc2626" />
              <Text style={styles.summaryValue}>{smartAnalysis.summary.critical_low_stock_count}</Text>
              <Text style={styles.summaryLabel}>Critical</Text>
            </View>
          </View>

          <View style={styles.totalValueCard}>
            <Text style={styles.totalValueLabel}>Total Reorder Value</Text>
            <Text style={styles.totalValueAmount}>
              ৳{smartAnalysis.summary.total_reorder_value.toFixed(2)}
            </Text>
            <Text style={styles.avgScoreText}>
              Avg Demand Score: {smartAnalysis.summary.average_demand_score.toFixed(1)}/100
            </Text>
          </View>
        </View>

        {/* Top Demand Products */}
        {smartAnalysis.top_demand_products.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Top Demand Products</Text>
            <Text style={styles.sectionSubtitle}>
              Highest performing products based on AI analysis
            </Text>
            {smartAnalysis.top_demand_products.map(renderSmartAnalysisCard)}
          </View>
        )}

        {/* Low Stock Alerts */}
        {smartAnalysis.low_stock_alerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Low Stock Alerts</Text>
            <Text style={styles.sectionSubtitle}>Products running out soon</Text>
            {smartAnalysis.low_stock_alerts.map(renderSmartAnalysisCard)}
          </View>
        )}

        {/* Reorder Recommendations */}
        {smartAnalysis.reorder_recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📦 Reorder Recommendations</Text>
            <Text style={styles.sectionSubtitle}>
              {smartAnalysis.summary.products_need_reorder} products need reordering
            </Text>
            {smartAnalysis.reorder_recommendations.slice(0, 10).map(renderSmartAnalysisCard)}
          </View>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.aiIconContainer}>
            <Ionicons name="sparkles" size={48} color={Colors.primary.main} />
          </View>
          <ActivityIndicator size="large" color={Colors.primary.main} style={styles.loader} />
          <Text style={styles.loadingTitle}>
            AI is Analyzing Your Products...
          </Text>
          <Text style={styles.loadingSubtitle}>
            Using machine learning to forecast demand and optimize inventory
          </Text>
          <View style={styles.loadingSteps}>
            <View style={styles.loadingStep}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.loadingStepText}>Fetching sales data</Text>
            </View>
            <View style={styles.loadingStep}>
              <ActivityIndicator size="small" color={Colors.primary.main} />
              <Text style={styles.loadingStepText}>Running AI models</Text>
            </View>
            <View style={styles.loadingStep}>
              <Ionicons name="ellipse-outline" size={20} color={Colors.neutral[300]} />
              <Text style={[styles.loadingStepText, styles.loadingStepTextInactive]}>
                Generating insights
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {renderSmartAnalysisView()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background.default,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  aiIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  loader: {
    marginVertical: Spacing.lg,
  },
  loadingTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  loadingSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  loadingSteps: {
    alignSelf: 'stretch',
    backgroundColor: Colors.background.paper,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  loadingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingStepText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  loadingStepTextInactive: {
    color: Colors.text.secondary,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: Colors.background.default,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[600],
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
    marginBottom: Spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: Colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.default,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  toggleButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[600],
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  summaryContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  summaryHeader: {
    marginBottom: Spacing.md,
  },
  summarySubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
    marginBottom: Spacing.md,
    marginTop: -Spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.background.default,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  summaryValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
    marginTop: Spacing.xs,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
    marginTop: 4,
    textAlign: 'center',
  },
  totalValueCard: {
    marginTop: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.primary.main + '10',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  totalValueLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
    marginBottom: Spacing.xs,
  },
  totalValueAmount: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.main,
  },
  avgScoreText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
    marginTop: Spacing.xs,
  },
  section: {
    padding: Spacing.lg,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  productName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  productId: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[500],
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  urgencyText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  demandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  demandScoreText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  cardBody: {
    gap: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border.light,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[600],
    marginBottom: 4,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
  },
  dangerText: {
    color: '#dc2626',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  smallBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  smallBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    textTransform: 'uppercase',
  },
  reorderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    backgroundColor: Colors.primary.main + '10',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  reorderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  reorderText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary.main,
    flex: 1,
  },
  addToCartButton: {
    backgroundColor: Colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 80,
    justifyContent: 'center',
  },
  addToCartButtonDisabled: {
    opacity: 0.6,
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  insightText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[700],
    fontStyle: 'italic',
  },
});
