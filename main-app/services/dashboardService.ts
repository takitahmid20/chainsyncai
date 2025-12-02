/**
 * Dashboard Service
 * Handles dashboard data and analytics
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export interface TopProduct {
  product__id: number;
  product__name: string;
  product__sku: string;
  total_quantity: number;
  total_revenue: string;
  sales_count: number;
}

export interface DashboardStats {
  period: {
    start_date: string;
    end_date: string;
    days: number;
  };
  overall: {
    total_sales: number;
    total_revenue: number;
    total_items_sold: number;
    average_sale_value: number;
  };
  top_products: TopProduct[];
}

/**
 * Get top selling products for dashboard
 * @param days - Number of days to look back (default: 7)
 * @returns Dashboard statistics including top products
 */
export const getTopSellingProducts = async (days: number = 7): Promise<DashboardStats> => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.SALES.ANALYTICS}?days=${days}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching top selling products:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get today's sales summary
 */
export const getTodaysSales = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.SALES.DAILY);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching today\'s sales:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get quick stats for dashboard
 */
export const getQuickStats = async () => {
  try {
    // Fetch today's analytics and pending orders count
    const [analytics, orders] = await Promise.all([
      apiClient.get(`${API_ENDPOINTS.SALES.ANALYTICS}?days=1`),
      apiClient.get(API_ENDPOINTS.ORDERS.LIST),
    ]);

    const pendingOrders = orders.data.filter((order: any) => order.status === 'pending').length;
    const todayRevenue = analytics.data.overall.total_revenue;

    return {
      pendingOrders,
      todayRevenue,
    };
  } catch (error: any) {
    console.error('Error fetching quick stats:', error.response?.data || error.message);
    throw error;
  }
};

export default {
  getTopSellingProducts,
  getTodaysSales,
  getQuickStats,
};
