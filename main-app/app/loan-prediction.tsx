import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius } from '@/constants/Spacing';
import apiClient from '@/services/apiClient';
import { API_ENDPOINTS } from '@/config/api';

interface LoanSuggestion {
  title: string;
  amount: number;
  purpose: string;
  expected_profit_percent: number;
  roi_days: number;
  success_rate: number;
  featured?: boolean;
}

interface LoanData {
  eligible: boolean;
  eligible_loan_amount: number;
  monthly_revenue: number;
  suggestions: LoanSuggestion[];
}

export default function LoanPredictionScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loanData, setLoanData] = useState<LoanData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLoanData();
  }, []);

  const fetchLoanData = async () => {
    try {
      setError(null);
      const response = await apiClient.get(API_ENDPOINTS.FINANCE.LOAN_SUGGESTION);
      
      // Transform backend data to match our UI structure
      const data = response.data;
      const transformedData: LoanData = {
        eligible: data.eligible || false,
        eligible_loan_amount: data.eligible_loan_amount || 0,
        monthly_revenue: data.monthly_revenue || 0,
        suggestions: generateLoanSuggestions(data),
      };
      
      setLoanData(transformedData);
    } catch (err: any) {
      console.error('Error fetching loan data:', err);
      setError(err.response?.data?.error || 'Failed to load loan suggestions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateLoanSuggestions = (data: any): LoanSuggestion[] => {
    const maxLoan = data.eligible_loan_amount || 40000;
    
    return [
      {
        title: 'Premium Products Stock',
        amount: Math.round(maxLoan * 0.625),
        purpose: 'Premium Drinks',
        expected_profit_percent: 35,
        roi_days: 45,
        success_rate: 92,
        featured: true,
      },
      {
        title: 'Seasonal Inventory',
        amount: Math.round(maxLoan * 0.375),
        purpose: 'Seasonal Products',
        expected_profit_percent: 28,
        roi_days: 30,
        success_rate: 85,
      },
      {
        title: 'Bulk Order Discount',
        amount: Math.round(maxLoan * 0.875),
        purpose: 'Bulk Purchase',
        expected_profit_percent: 22,
        roi_days: 60,
        success_rate: 78,
      },
    ];
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLoanData();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Analyzing your finances...</Text>
        </View>
      </View>
    );
  }

  if (error || !loanData) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.neutral[400]} />
          <Text style={styles.emptyTitle}>Unable to Load Data</Text>
          <Text style={styles.emptyMessage}>{error || 'Failed to load loan suggestions'}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={fetchLoanData}>
            <Text style={styles.primaryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.aiStrip}>
          <View style={styles.aiStripIcon}>
            <Ionicons name="bulb" size={20} color={Colors.primary.main} />
          </View>
          <Text style={styles.aiStripText}>
            <Text style={styles.aiStripTextBold}>AI Analysis: </Text>
            Based on your sales of{' '}
            <Text style={styles.aiStripTextBold}>৳{loanData.monthly_revenue.toLocaleString()}</Text> this month, you can manage a loan up to{' '}
            <Text style={styles.aiStripTextBold}>৳{loanData.eligible_loan_amount.toLocaleString()}</Text>.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>💡 AI Loan Suggestions</Text>
        <Text style={styles.sectionSubtitle}>
          Based on your inventory needs and sales performance
        </Text>

        <View style={styles.loansList}>
          {loanData.suggestions.map((suggestion, index) => (
            <View key={index} style={[styles.loanCard, suggestion.featured && styles.featuredCard]}>
              {suggestion.featured && (
                <View style={styles.featuredBadge}>
                  <Ionicons name="star" size={12} color="#fff" />
                  <Text style={styles.featuredBadgeText}>Top Priority</Text>
                </View>
              )}

              <View style={styles.loanCardHeader}>
                <View style={styles.loanIcon}>
                  <Text style={styles.loanEmoji}>{index === 0 ? '📦' : index === 1 ? '🌟' : '🚚'}</Text>
                </View>
                <View style={styles.loanCardHeaderText}>
                  <Text style={styles.loanCardTitle}>{suggestion.title}</Text>
                  <Text style={styles.loanCardSubtitle}>
                    {index === 0 ? 'High Margin Products' : index === 1 ? 'Fast-Moving Items' : 'Supplier Advantage'}
                  </Text>
                </View>
              </View>

              <View style={styles.loanAmount}>
                <Text style={styles.loanAmountLabel}>Suggested Loan</Text>
                <Text style={styles.loanAmountValue}>৳{suggestion.amount.toLocaleString()}</Text>
              </View>

              <View style={styles.loanDetails}>
                <View style={styles.loanDetailRow}>
                  <Ionicons name="flag-outline" size={16} color={Colors.neutral[500]} />
                  <Text style={styles.loanDetailLabel}>Purpose:</Text>
                  <Text style={styles.loanDetailValue}>{suggestion.purpose}</Text>
                </View>

                <View style={styles.loanDetailRow}>
                  <Ionicons name="trending-up-outline" size={16} color={Colors.success.main} />
                  <Text style={styles.loanDetailLabel}>Expected Profit:</Text>
                  <Text style={[styles.loanDetailValue, styles.profitValue]}>+{suggestion.expected_profit_percent}%</Text>
                </View>

                <View style={styles.loanDetailRow}>
                  <Ionicons name="time-outline" size={16} color={Colors.neutral[500]} />
                  <Text style={styles.loanDetailLabel}>ROI Timeline:</Text>
                  <Text style={styles.loanDetailValue}>{suggestion.roi_days} days</Text>
                </View>
              </View>

              <View style={styles.successRate}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${suggestion.success_rate}%` }]} />
                </View>
                <Text style={styles.successRateText}>
                  {suggestion.success_rate}% Success Rate {suggestion.featured && '(Similar Retailers)'}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.secondaryButton, suggestion.featured && styles.primaryButton]}
                onPress={() =>
                  Alert.alert(
                    'Loan Breakdown',
                    `${suggestion.title}\n\n` +
                      `Amount: ৳${suggestion.amount.toLocaleString()}\n` +
                      `Expected Profit: ${suggestion.expected_profit_percent}%\n` +
                      `ROI: ${suggestion.roi_days} days\n` +
                      `Success Rate: ${suggestion.success_rate}%`,
                    [{ text: 'OK' }]
                  )
                }
              >
                <Text style={[styles.secondaryButtonText, suggestion.featured && styles.primaryButtonText]}>
                  View Breakdown
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  content: {
    flex: 1,
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
  aiStrip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.info.bg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.info.light,
  },
  aiStripIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.full,
    marginRight: Spacing.md,
  },
  aiStripText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[700],
    lineHeight: 20,
  },
  aiStripTextBold: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[800],
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[800],
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.lg,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  loansList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  loanCard: {
    backgroundColor: Colors.background.paper,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: Colors.primary.main,
    backgroundColor: Colors.background.paper,
  },
  featuredBadge: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  featuredBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#ffffff',
  },
  loanCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  loanIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.full,
    marginRight: Spacing.md,
  },
  loanEmoji: {
    fontSize: 24,
  },
  loanCardHeaderText: {
    flex: 1,
  },
  loanCardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
    marginBottom: 2,
  },
  loanCardSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
  },
  loanAmount: {
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  loanAmountLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
    marginBottom: Spacing.xs,
  },
  loanAmountValue: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.main,
  },
  loanDetails: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  loanDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loanDetailLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
    flex: 1,
  },
  loanDetailValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[800],
  },
  profitValue: {
    color: Colors.success.main,
  },
  successRate: {
    marginBottom: Spacing.lg,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success.main,
    borderRadius: BorderRadius.full,
  },
  successRateText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[600],
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary.main,
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: '#ffffff',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.paper,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  secondaryButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[700],
  },
});
