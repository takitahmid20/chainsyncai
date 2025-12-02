/**
 * Retailer Dashboard - Home Screen
 * Complete dashboard with metrics, quick actions, and insights
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import AISummaryStrip from '@/components/layout/AISummaryStrip';
import FloatingAIButton from '@/components/layout/FloatingAIButton';
import QuickActionButton from '@/components/dashboard/QuickActionButton';
import QuickStatsRow from '@/components/dashboard/QuickStatsRow';
import TopProductsCard from '@/components/dashboard/TopProductsCard';
import AIInsightsModal from '@/components/modals/AIInsightsModal';
import { getTopSellingProducts } from '@/services/dashboardService';
import { inventoryService } from '@/services/inventoryService';
import { API_ENDPOINTS } from '@/config/api';
import apiClient from '@/services/apiClient';

interface DashboardMetrics {
  todaySales: number;
  yesterdaySales: number;
  lowStockCount: number;
  outOfStockCount: number;
  demandIncrease: number;
  loanEligible: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    todaySales: 0,
    yesterdaySales: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    demandIncrease: 0,
    loanEligible: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [salesData, inventoryData, loanData] = await Promise.all([
        // Get sales analytics for today and yesterday
        getTopSellingProducts(2).catch(() => ({ overall: { total_revenue: 0 }, top_products: [] })),
        
        // Get inventory summary
        inventoryService.getInventory({ page: 1, page_size: 1 }).catch(() => ({ 
          summary: { low_stock: 0, out_of_stock: 0 } 
        })),
        
        // Get loan eligibility from finance API
        apiClient.get(API_ENDPOINTS.FINANCE.LOAN_SUGGESTION).catch(() => ({ data: { eligible_loan_amount: 0 } })),
      ]);

      // Calculate today's and yesterday's sales
      const todayRevenue = salesData.overall?.total_revenue || 0;
      
      // Get yesterday's sales by fetching 1-day analytics
      const yesterdayData = await getTopSellingProducts(1).catch(() => ({ overall: { total_revenue: 0 } }));
      const yesterdayRevenue = yesterdayData.overall?.total_revenue || 0;
      
      // Calculate percentage change
      const salesChange = yesterdayRevenue > 0 
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100) 
        : 0;

      setMetrics({
        todaySales: todayRevenue,
        yesterdaySales: yesterdayRevenue,
        lowStockCount: inventoryData.summary?.low_stock || 0,
        outOfStockCount: inventoryData.summary?.out_of_stock || 0,
        demandIncrease: salesChange,
        loanEligible: loanData.data?.eligible_loan_amount || 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleAIPress = () => {
    setShowAIInsights(true);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'ai-insights':
        setShowAIInsights(true);
        break;
      case 'inventory':
        router.push('/(tabs)/inventory');
        break;
      case 'orders':
        router.push('/(tabs)/orders');
        break;
      case 'loan-prediction':
        router.push('/loan-prediction');
        break;
      case 'low-stock':
        router.push('/(tabs)/inventory');
        break;
      case 'ai-chat':
        router.push('/(tabs)/ai');
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <AISummaryStrip
        message="Stock up Milk & Detergent — demand up 30% next week"
        onPress={handleAIPress}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good Morning, Arif!</Text>
          <Text style={styles.subtitle}>Here's your store performance today</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.main} />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        ) : (
          <>
            {/* Quick Access Features - 4 columns */}
            <View style={styles.featuresGrid}>
              <QuickActionButton icon="layers-outline" label="AI Insights" onPress={() => handleQuickAction('ai-insights')} />
              <QuickActionButton icon="cube-outline" label="Inventory" onPress={() => handleQuickAction('inventory')} />
              <QuickActionButton icon="cart-outline" label="Orders" onPress={() => handleQuickAction('orders')} />
              <QuickActionButton icon="trending-up-outline" label="Loan Prediction" onPress={() => handleQuickAction('loan-prediction')} />
              <QuickActionButton icon="pulse-outline" label="Low Stock" onPress={() => handleQuickAction('low-stock')} />
              <QuickActionButton icon="chatbubbles-outline" label="AI Chat" onPress={() => handleQuickAction('ai-chat')} />
            </View>

            {/* Key Metrics - 2 columns */}
            <View style={styles.metricsGrid}>
              <MetricCard
                title="Today's Sales"
                value={`৳${metrics.todaySales.toLocaleString()}`}
                change={`${metrics.todaySales > metrics.yesterdaySales ? '+' : ''}${Math.abs(((metrics.todaySales - metrics.yesterdaySales) / (metrics.yesterdaySales || 1) * 100)).toFixed(0)}% from yesterday`}
                changeType={metrics.todaySales >= metrics.yesterdaySales ? "positive" : "negative"}
                icon="cash-outline"
                gradient={['#eff6ff', '#dbeafe']}
                iconColor="#3b82f6"
              />
              <MetricCard
                title="Low Stock Items"
                value={`${metrics.lowStockCount + metrics.outOfStockCount} items`}
                change={metrics.lowStockCount > 0 || metrics.outOfStockCount > 0 ? "Action needed" : "All stocked"}
                changeType={metrics.lowStockCount > 0 || metrics.outOfStockCount > 0 ? "warning" : "positive"}
                icon="pulse-outline"
                gradient={['#fff7ed', '#fed7aa']}
                iconColor="#fb923c"
              />
              <MetricCard
                title="Next Week Demand"
                value={`${metrics.demandIncrease >= 0 ? '+' : ''}${metrics.demandIncrease.toFixed(0)}%`}
                change="AI Prediction"
                changeType="positive"
                icon="trending-up-outline"
                gradient={['#f0fdf4', '#dcfce7']}
                iconColor="#22c55e"
              />
              <MetricCard
                title="Loan Eligible"
                value={`৳${metrics.loanEligible.toLocaleString()}`}
                change="Working capital"
                changeType="info"
                icon="card-outline"
                gradient={['#faf5ff', '#f3e8ff']}
                iconColor="#a855f7"
              />
            </View>

            {/* Quick Stats */}
            <QuickStatsRow />

            {/* Top Products */}
            <TopProductsCard />

            {/* AI Insight Tip */}
            <View style={styles.aiTipCard}>
              <View style={styles.aiTipHeader}>
                <Ionicons name="bulb-outline" size={20} color="#f59e0b" />
                <Text style={styles.aiTipTitle}>AI Insight</Text>
              </View>
              <Text style={styles.aiTipText}>
                Sales peak on weekends. Stock extra items on Fridays.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      <FloatingAIButton onPress={handleAIPress} />
      
      <AIInsightsModal 
        visible={showAIInsights} 
        onClose={() => setShowAIInsights(false)} 
      />
    </View>
  );
}

function MetricCard({ title, value, change, changeType, icon, gradient, iconColor }: any) {
  const getChangeStyles = () => {
    switch (changeType) {
      case 'positive':
        return { backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#15803d' };
      case 'negative':
        return { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#dc2626' };
      case 'warning':
        return { backgroundColor: 'rgba(251, 146, 60, 0.15)', color: '#c2410c' };
      case 'info':
        return { backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#4338ca' };
      default:
        return { backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#4338ca' };
    }
  };

  return (
    <TouchableOpacity style={styles.metricCard} activeOpacity={0.7}>
      <LinearGradient colors={gradient} style={styles.metricGradient}>
        <View style={[styles.metricIcon, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.metricContent}>
          <Text style={styles.metricLabel}>{title}</Text>
          <Text style={styles.metricValue}>{value}</Text>
          <View style={[styles.metricChange, getChangeStyles()]}>
            <Text style={[styles.metricChangeText, { color: getChangeStyles().color }]}>
              {change}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
  },

  // Loading State
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },

  // Quick Actions Grid
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metricGradient: {
    padding: 16,
    minHeight: 140,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  metricChange: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  metricChangeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // AI Tip Card
  aiTipCard: {
    backgroundColor: '#fffbeb',
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  aiTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  aiTipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#78350f',
  },
  aiTipText: {
    fontSize: 12,
    color: '#78350f',
    lineHeight: 18,
  },
});
