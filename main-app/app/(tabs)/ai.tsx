/**
 * Retailer AI Insights Screen
 * AI-powered analytics, forecasts, and recommendations
 * Based on html2/retailer/ai-insights.html design
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius } from '@/constants/Spacing';

const { width } = Dimensions.get('window');

interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'neutral';
  confidence: number;
}

interface CategoryPerformance {
  id: string;
  name: string;
  icon: string;
  revenue: number;
  percentage: number;
  color: string;
}

const mockInsights: Insight[] = [
  {
    id: '1',
    title: 'Beverage Sales Surge',
    description: 'Your beverage sales are trending +22% this month',
    type: 'positive',
    confidence: 95,
  },
  {
    id: '2',
    title: 'Stock Alert',
    description: 'Detergent powder stock may run out in 3 days',
    type: 'warning',
    confidence: 88,
  },
  {
    id: '3',
    title: 'Customer Pattern',
    description: 'Weekend sales are 35% higher than weekdays',
    type: 'neutral',
    confidence: 92,
  },
];

const categoryPerformance: CategoryPerformance[] = [
  { id: '1', name: 'Beverages', icon: '🥤', revenue: 45280, percentage: 85, color: '#6366f1' },
  { id: '2', name: 'Snacks', icon: '🍪', revenue: 38920, percentage: 72, color: '#22c55e' },
  { id: '3', name: 'Rice & Grains', icon: '🍚', revenue: 32150, percentage: 60, color: '#fb923c' },
  { id: '4', name: 'Personal Care', icon: '🧴', revenue: 28640, percentage: 54, color: '#a855f7' },
];

const recommendations = [
  {
    id: '1',
    title: 'Restock Detergent',
    description: 'Based on sales velocity, restock within 3 days',
    priority: 'high',
    action: 'Order Now',
  },
  {
    id: '2',
    title: 'Promote Snacks',
    description: 'Weekend demand expected to spike by 40%',
    priority: 'medium',
    action: 'View Details',
  },
  {
    id: '3',
    title: 'Price Optimization',
    description: 'Beverage prices can be adjusted for better margins',
    priority: 'low',
    action: 'Review',
  },
];

export default function AIScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  const getInsightTypeStyle = (type: string) => {
    switch (type) {
      case 'positive':
        return { bg: '#D1FAE5', text: '#065F46', icon: 'trending-up' };
      case 'warning':
        return { bg: '#FEF3C7', text: '#92400E', icon: 'warning' };
      case 'neutral':
        return { bg: '#DBEAFE', text: '#1E40AF', icon: 'information-circle' };
      default:
        return { bg: Colors.neutral[100], text: Colors.neutral[600], icon: 'information-circle' };
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return { bg: '#FEE2E2', text: '#991B1B' };
      case 'medium':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'low':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      default:
        return { bg: Colors.neutral[100], text: Colors.neutral[600] };
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.aiBadge}>
          <Ionicons name="sparkles" size={16} color="#8b5cf6" />
          <Text style={styles.aiBadgeText}>AI-Generated Summary</Text>
        </View>
        <Text style={styles.heroTitle}>
          Your beverage sales are trending{' '}
          <Text style={styles.highlightStat}>+22%</Text>{' '}
          this month
        </Text>
        <View style={styles.heroMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={Colors.neutral[500]} />
            <Text style={styles.metaText}>Updated 5 mins ago</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="pulse-outline" size={14} color={Colors.neutral[500]} />
            <Text style={styles.metaText}>95% confidence</Text>
          </View>
        </View>
      </View>

      {/* Quick Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Insights</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.insightsScroll}>
          {mockInsights.map((insight) => {
            const typeStyle = getInsightTypeStyle(insight.type);
            return (
              <TouchableOpacity key={insight.id} style={styles.insightCard}>
                <View style={[styles.insightIconContainer, { backgroundColor: typeStyle.bg }]}>
                  <Ionicons name={typeStyle.icon as any} size={24} color={typeStyle.text} />
                </View>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDescription}>{insight.description}</Text>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>{insight.confidence}% confident</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Product Performance */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Product Performance</Text>
          <TouchableOpacity style={styles.periodSelector}>
            <Text style={styles.periodText}>This Week</Text>
            <Ionicons name="chevron-down" size={16} color={Colors.neutral[600]} />
          </TouchableOpacity>
        </View>
        <View style={styles.performanceCard}>
          {categoryPerformance.map((category) => (
            <View key={category.id} style={styles.performanceItem}>
              <Text style={styles.performanceIcon}>{category.icon}</Text>
              <View style={styles.performanceDetails}>
                <View style={styles.performanceHeader}>
                  <Text style={styles.performanceName}>{category.name}</Text>
                  <Text style={styles.performancePercent}>{category.percentage}%</Text>
                </View>
                <Text style={styles.performanceRevenue}>৳{category.revenue.toLocaleString()}</Text>
                <View style={styles.performanceBarTrack}>
                  <View
                    style={[
                      styles.performanceBarFill,
                      { width: `${category.percentage}%`, backgroundColor: category.color }
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Demand Forecast Chart */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Demand Forecast</Text>
            <Text style={styles.sectionSubtitle}>Next 7 days prediction</Text>
          </View>
          <View style={styles.aiPoweredBadge}>
            <Ionicons name="sparkles" size={12} color="#8b5cf6" />
            <Text style={styles.aiPoweredText}>AI Powered</Text>
          </View>
        </View>
        <View style={styles.chartCard}>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="analytics-outline" size={48} color={Colors.neutral[300]} />
            <Text style={styles.chartPlaceholderText}>Forecast chart visualization</Text>
          </View>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.primary.main }]} />
              <Text style={styles.legendText}>Actual Sales</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#a855f7', borderStyle: 'dashed' }]} />
              <Text style={styles.legendText}>AI Forecast</Text>
            </View>
          </View>
        </View>
      </View>

      {/* AI Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Recommendations</Text>
        <View style={styles.recommendationsCard}>
          {recommendations.map((rec) => {
            const priorityStyle = getPriorityStyle(rec.priority);
            return (
              <View key={rec.id} style={styles.recommendationItem}>
                <View style={styles.recommendationLeft}>
                  <View style={styles.recommendationHeader}>
                    <Text style={styles.recommendationTitle}>{rec.title}</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
                      <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
                        {rec.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.recommendationDescription}>{rec.description}</Text>
                </View>
                <TouchableOpacity style={styles.recommendationAction}>
                  <Text style={styles.recommendationActionText}>{rec.action}</Text>
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

  // Period Selector
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.background.paper,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  periodText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[700],
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
