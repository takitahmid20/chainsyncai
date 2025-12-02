/**
 * Retailer Dashboard - Home Screen
 * Complete dashboard with metrics, quick actions, and insights
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import AISummaryStrip from '@/components/layout/AISummaryStrip';
import FloatingAIButton from '@/components/layout/FloatingAIButton';
import QuickActionButton from '@/components/dashboard/QuickActionButton';
import QuickStatsRow from '@/components/dashboard/QuickStatsRow';
import TopProductsCard from '@/components/dashboard/TopProductsCard';
import AIInsightsModal from '@/components/modals/AIInsightsModal';

export default function HomeScreen() {
  const [showAIInsights, setShowAIInsights] = useState(false);

  const handleAIPress = () => {
    setShowAIInsights(true);
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
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good Morning, Arif!</Text>
          <Text style={styles.subtitle}>Here's your store performance today</Text>
        </View>

        {/* Quick Access Features - 4 columns */}
        <View style={styles.featuresGrid}>
          <QuickActionButton icon="layers-outline" label="AI Insights" />
          <QuickActionButton icon="cube-outline" label="Inventory" />
          <QuickActionButton icon="cart-outline" label="Orders" />
          <QuickActionButton icon="trending-up-outline" label="Loan Prediction" />
          <QuickActionButton icon="notifications-outline" label="Alerts" />
          <QuickActionButton icon="pulse-outline" label="Low Stock" />
          <QuickActionButton icon="cloud-upload-outline" label="Auto Order" />
          <QuickActionButton icon="cash-outline" label="Finance" />
          <QuickActionButton icon="chatbubbles-outline" label="AI Chat" />
        </View>

        {/* Key Metrics - 2 columns */}
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Today's Sales"
            value="৳17,300"
            change="+12% from yesterday"
            changeType="positive"
            icon="cash-outline"
            gradient={['#eff6ff', '#dbeafe']}
            iconColor="#3b82f6"
          />
          <MetricCard
            title="Low Stock Items"
            value="3 items"
            change="Action needed"
            changeType="warning"
            icon="pulse-outline"
            gradient={['#fff7ed', '#fed7aa']}
            iconColor="#fb923c"
          />
          <MetricCard
            title="Next Week Demand"
            value="+24%"
            change="AI Prediction"
            changeType="positive"
            icon="trending-up-outline"
            gradient={['#f0fdf4', '#dcfce7']}
            iconColor="#22c55e"
          />
          <MetricCard
            title="Loan Eligible"
            value="৳30,000"
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
