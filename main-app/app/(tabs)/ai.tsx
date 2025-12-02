/**
 * Retailer AI Insights Screen
 * AI-powered analytics, forecasts, and recommendations
 * Based on html2/retailer/ai-insights.html design
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius } from '@/constants/Spacing';
import apiClient, { handleApiError } from '@/services/apiClient';
import { API_ENDPOINTS } from '@/config/api';

const { width } = Dimensions.get('window');

interface Recommendation {
  product_id: number;
  product_name: string;
  category: string;
  current_stock: number;
  predicted_demand: number;
  suggested_reorder_quantity: number;
  suggested_reorder_date: string;
  confidence_score: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  reason: string;
  supplier_name?: string;
  unit_price?: number;
  estimated_cost?: number;
}

interface AIInsightsData {
  summary: {
    total_products: number;
    urgent_reorders: number;
    high_priority: number;
    estimated_restock_cost: number;
    forecast_accuracy: number;
    last_updated: string;
  };
  recommendations: Recommendation[];
  message?: string;
}

export default function AIScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [insightsData, setInsightsData] = useState<AIInsightsData | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'urgent' | 'high' | 'medium'>('all');

  useEffect(() => {
    fetchAIInsights();
  }, []);

  const fetchAIInsights = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post(API_ENDPOINTS.AI.INSIGHTS, {
        forecast_days: 30,
        priority_filter: selectedPriority,
        max_products: 20,
      });
      
      setInsightsData(response.data);
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
      Alert.alert('Error', handleApiError(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAIInsights();
  }, [selectedPriority]);

  const getInsightTypeStyle = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { bg: '#FEE2E2', text: '#991B1B', icon: 'alert-circle' };
      case 'high':
        return { bg: '#FEF3C7', text: '#92400E', icon: 'warning' };
      case 'medium':
        return { bg: '#DBEAFE', text: '#1E40AF', icon: 'information-circle' };
      case 'low':
        return { bg: '#D1FAE5', text: '#065F46', icon: 'checkmark-circle' };
      default:
        return { bg: Colors.neutral[100], text: Colors.neutral[600], icon: 'information-circle' };
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { bg: '#FEE2E2', text: '#991B1B' };
      case 'high':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'medium':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'low':
        return { bg: '#D1FAE5', text: '#065F46' };
      default:
        return { bg: Colors.neutral[100], text: Colors.neutral[600] };
    }
  };

  const getCategoryIcon = (category: string): string => {
    if (!category) return '📦';
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('beverage') || categoryLower.includes('drink')) return '🥤';
    if (categoryLower.includes('snack') || categoryLower.includes('biscuit')) return '🍪';
    if (categoryLower.includes('rice') || categoryLower.includes('grain')) return '🍚';
    if (categoryLower.includes('personal') || categoryLower.includes('care')) return '🧴';
    if (categoryLower.includes('dairy') || categoryLower.includes('milk')) return '🥛';
    if (categoryLower.includes('oil')) return '🛢️';
    return '📦';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Analyzing your inventory...</Text>
        </View>
      </View>
    );
  }

  if (!insightsData) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.neutral[400]} />
          <Text style={styles.emptyTitle}>No Insights Available</Text>
          <Text style={styles.emptyMessage}>Unable to load AI insights at this time.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={fetchAIInsights}>
            <Text style={styles.primaryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const topRecommendations = insightsData.recommendations.slice(0, 3);
  const urgentRecommendations = insightsData.recommendations.filter(r => r.priority === 'urgent' || r.priority === 'high');

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.aiBadge}>
          <Ionicons name="sparkles" size={16} color="#8b5cf6" />
          <Text style={styles.aiBadgeText}>AI-Generated Summary</Text>
        </View>
        <Text style={styles.heroTitle}>
          {insightsData.summary.urgent_reorders > 0 ? (
            <>
              <Text style={styles.highlightStat}>{insightsData.summary.urgent_reorders}</Text> urgent reorders needed
            </>
          ) : (
            <>Your inventory is well-stocked</>
          )}
        </Text>
        <View style={styles.heroMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="rgba(255, 255, 255, 0.9)" />
            <Text style={styles.metaText}>
              {new Date(insightsData.summary.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="pulse-outline" size={14} color="rgba(255, 255, 255, 0.9)" />
            <Text style={styles.metaText}>{insightsData.summary.forecast_accuracy}% accuracy</Text>
          </View>
        </View>
      </View>

      {/* Quick Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Priority Items</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.insightsScroll}>
          {topRecommendations.map((rec) => {
            const typeStyle = getInsightTypeStyle(rec.priority);
            return (
              <TouchableOpacity key={rec.product_id} style={styles.insightCard}>
                <View style={[styles.insightIconContainer, { backgroundColor: typeStyle.bg }]}>
                  <Ionicons name={typeStyle.icon as any} size={24} color={typeStyle.text} />
                </View>
                <Text style={styles.insightTitle}>{rec.product_name}</Text>
                <Text style={styles.insightDescription}>{rec.reason}</Text>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>{rec.confidence_score}% confident</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Summary Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inventory Summary</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="cube-outline" size={32} color={Colors.primary.main} />
            <Text style={styles.statValue}>{insightsData.summary.total_products}</Text>
            <Text style={styles.statLabel}>Total Products</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="alert-circle-outline" size={32} color="#ef4444" />
            <Text style={styles.statValue}>{insightsData.summary.urgent_reorders}</Text>
            <Text style={styles.statLabel}>Urgent Reorders</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="warning-outline" size={32} color="#f59e0b" />
            <Text style={styles.statValue}>{insightsData.summary.high_priority}</Text>
            <Text style={styles.statLabel}>High Priority</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash-outline" size={32} color="#10b981" />
            <Text style={styles.statValue}>৳{Math.round(insightsData.summary.estimated_restock_cost).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Restock Cost</Text>
          </View>
        </View>
      </View>

      {/* Category Breakdown */}
      {insightsData.recommendations.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Product Categories</Text>
              <Text style={styles.sectionSubtitle}>Reorder recommendations by category</Text>
            </View>
            <View style={styles.aiPoweredBadge}>
              <Ionicons name="sparkles" size={12} color="#8b5cf6" />
              <Text style={styles.aiPoweredText}>AI Powered</Text>
            </View>
          </View>
          <View style={styles.performanceCard}>
            {Array.from(new Set(insightsData.recommendations.map(r => r.category).filter(Boolean))).slice(0, 4).map((category) => {
              const categoryProducts = insightsData.recommendations.filter(r => r.category === category);
              const totalCost = categoryProducts.reduce((sum, p) => sum + (p.estimated_cost || 0), 0);
              const urgentCount = categoryProducts.filter(p => p.priority === 'urgent').length;
              
              return (
                <View key={category} style={styles.performanceItem}>
                  <Text style={styles.performanceIcon}>{getCategoryIcon(category)}</Text>
                  <View style={styles.performanceDetails}>
                    <View style={styles.performanceHeader}>
                      <Text style={styles.performanceName}>{category}</Text>
                      <Text style={styles.performancePercent}>{categoryProducts.length} items</Text>
                    </View>
                    <Text style={styles.performanceRevenue}>
                      ৳{totalCost.toLocaleString()} • {urgentCount} urgent
                    </Text>
                    <View style={styles.performanceBarTrack}>
                      <View
                        style={[
                          styles.performanceBarFill,
                          { 
                            width: `${Math.min((urgentCount / categoryProducts.length) * 100, 100)}%`,
                            backgroundColor: urgentCount > 0 ? '#ef4444' : '#10b981'
                          }
                        ]}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* AI Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Recommendations</Text>
        <View style={styles.recommendationsCard}>
          {urgentRecommendations.slice(0, 5).map((rec) => {
            const priorityStyle = getPriorityStyle(rec.priority);
            return (
              <View key={rec.product_id} style={styles.recommendationItem}>
                <View style={styles.recommendationLeft}>
                  <View style={styles.recommendationHeader}>
                    <Text style={styles.recommendationTitle}>{rec.product_name}</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
                      <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
                        {rec.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.recommendationDescription}>
                    {rec.reason} • Reorder {rec.suggested_reorder_quantity} units
                  </Text>
                  {rec.supplier_name && (
                    <Text style={styles.recommendationSupplier}>
                      Supplier: {rec.supplier_name}
                    </Text>
                  )}
                </View>
                <TouchableOpacity 
                  style={styles.recommendationAction}
                  onPress={() => Alert.alert(
                    rec.product_name,
                    `Current Stock: ${rec.current_stock}\n` +
                    `Predicted Demand: ${rec.predicted_demand}\n` +
                    `Suggested Order: ${rec.suggested_reorder_quantity} units\n` +
                    `${rec.unit_price ? `Unit Price: ৳${rec.unit_price}\n` : ''}` +
                    `${rec.estimated_cost ? `Total Cost: ৳${rec.estimated_cost.toLocaleString()}` : ''}`,
                    [{ text: 'OK' }]
                  )}
                >
                  <Text style={styles.recommendationActionText}>View Details</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.primary.main} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>

      {/* Bottom Padding */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: Colors.neutral[800],
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  emptyMessage: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  primaryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.md,
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: '#ffffff',
  },

  // Hero Section
  heroSection: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundColor: '#6366f1',
    padding: Spacing.xl,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  aiBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: '#8b5cf6',
  },
  heroTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: '#fff',
    lineHeight: 36,
    marginBottom: Spacing.md,
  },
  highlightStat: {
    color: '#fbbf24',
  },
  heroMeta: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // Section
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[500],
    marginTop: 2,
  },

  // Quick Insights
  insightsScroll: {
    gap: Spacing.md,
  },
  insightCard: {
    width: width * 0.7,
    backgroundColor: Colors.background.paper,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  insightTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.xs,
  },
  insightDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  confidenceBadge: {
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  confidenceText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.neutral[700],
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.background.paper,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[600],
    marginTop: 4,
    textAlign: 'center',
  },

  // Product Performance
  performanceCard: {
    backgroundColor: Colors.background.paper,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  performanceIcon: {
    fontSize: 32,
  },
  performanceDetails: {
    flex: 1,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  performanceName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[900],
  },
  performancePercent: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[600],
  },
  performanceRevenue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
    marginBottom: Spacing.xs,
  },
  performanceBarTrack: {
    height: 6,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  performanceBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },

  // Chart
  chartCard: {
    backgroundColor: Colors.background.paper,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  aiPoweredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f3e8ff',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  aiPoweredText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: '#8b5cf6',
  },
  chartPlaceholder: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  chartPlaceholderText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[400],
    marginTop: Spacing.sm,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
  },
  legendText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[600],
  },

  // Recommendations
  recommendationsCard: {
    gap: Spacing.md,
  },
  recommendationItem: {
    backgroundColor: Colors.background.paper,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recommendationLeft: {
    marginBottom: Spacing.md,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  recommendationTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  recommendationDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
    lineHeight: 20,
  },
  recommendationSupplier: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[500],
    marginTop: 4,
    fontStyle: 'italic',
  },
  recommendationAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.xs,
  },
  recommendationActionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary.main,
  },
});
