/**
 * AI Orders Service
 * Handles AI-generated order suggestions
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export interface AIOrderItem {
  product_id: number;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  predicted_demand: number;
  current_shop_stock: number;
  days_until_stockout: number | null;
  urgency: 'urgent' | 'soon' | 'normal' | 'not_needed';
}

export interface AIOrder {
  id: string;
  type: string;
  supplier_id: number;
  supplier_name: string;
  title: string;
  reason: string;
  confidence_score: number;
  total_items: number;
  total_quantity: number;
  total_amount: number;
  items: AIOrderItem[];
  forecast_period_days: number;
  estimated_delivery_days: string;
  generated_at: string;
  expires_at: string;
  insights: string[];
}

export interface AIOrdersResponse {
  orders: AIOrder[];
}

export interface ApproveOrderResponse {
  message: string;
  order_id: number;
  total_amount: number;
  total_items: number;
}

class AIOrdersService {
  /**
   * Get AI-generated order suggestions
   */
  async getAIOrders(maxOrders: number = 5): Promise<AIOrder[]> {
    try {
      const response = await apiClient.post<AIOrder[]>(
        API_ENDPOINTS.AI.ORDERS,
        { max_orders: maxOrders }
      );
      return response.data;
    } catch (error: any) {
      console.error('Get AI orders error:', error);
      throw error;
    }
  }

  /**
   * Approve an AI-generated order and convert to actual order
   */
  async approveOrder(
    aiOrderId: string,
    deliveryDetails?: {
      delivery_address?: string;
      delivery_contact?: string;
      delivery_notes?: string;
    }
  ): Promise<ApproveOrderResponse> {
    try {
      const response = await apiClient.post<ApproveOrderResponse>(
        API_ENDPOINTS.AI.APPROVE_ORDER,
        {
          ai_order_id: aiOrderId,
          ...deliveryDetails,
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Approve AI order error:', error);
      throw error;
    }
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return `৳${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }

  /**
   * Get urgency color for UI
   */
  getUrgencyColor(urgency: string): string {
    switch (urgency) {
      case 'urgent':
        return '#EF4444'; // red
      case 'soon':
        return '#F59E0B'; // amber
      case 'normal':
        return '#10B981'; // green
      default:
        return '#6B7280'; // gray
    }
  }

  /**
   * Get confidence color for UI
   */
  getConfidenceColor(score: number): string {
    if (score >= 85) return '#10B981'; // green
    if (score >= 70) return '#F59E0B'; // amber
    return '#EF4444'; // red
  }
}

export default new AIOrdersService();
