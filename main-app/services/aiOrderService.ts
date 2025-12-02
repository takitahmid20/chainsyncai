/**
 * AI Order Service
 * Handles AI-powered automatic order generation
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export interface AIOrderItem {
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  urgency: string;
  days_until_stockout: number | null;
  confidence: string;
}

export interface AIOrder {
  id: string;
  supplier_id: number;
  supplier_name: string;
  items: AIOrderItem[];
  total_items: number;
  total_quantity: number;
  estimated_total: number;
  delivery_estimate: string;
  urgency_level: string;
  confidence_score: number;
  reason: string;
}

export interface AIOrdersResponse {
  orders: AIOrder[];
  summary: {
    total_orders: number;
    total_products: number;
    total_estimated_cost: number;
    urgent_orders: number;
  };
}

/**
 * Generate AI-powered order suggestions
 * @param maxOrders - Maximum number of orders to generate (default: 5)
 */
export const generateAIOrders = async (maxOrders: number = 5): Promise<AIOrder[]> => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AI.ORDERS, {
      max_orders: maxOrders,
    });
    return response.data || [];
  } catch (error: any) {
    console.error('Error generating AI orders:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Approve and create an actual order from AI suggestion
 * @param aiOrderId - The AI order ID to approve
 * @param deliveryDetails - Optional delivery details
 */
export const approveAIOrder = async (
  aiOrderId: string,
  deliveryDetails?: {
    delivery_address?: string;
    delivery_contact?: string;
    delivery_notes?: string;
  }
): Promise<any> => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AI.APPROVE_ORDER, {
      ai_order_id: aiOrderId,
      ...deliveryDetails,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error approving AI order:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Auto-execute AI orders (automatically approve and create orders)
 * @param aiOrders - Array of full AI order objects to execute
 */
export const autoExecuteOrders = async (aiOrders: AIOrder[]): Promise<{
  success: string[];
  failed: Array<{ orderId: string; error: string }>;
}> => {
  const results = {
    success: [] as string[],
    failed: [] as Array<{ orderId: string; error: string }>,
  };

  for (const order of aiOrders) {
    try {
      // Send full order data to backend
      await apiClient.post(API_ENDPOINTS.AI.APPROVE_ORDER, {
        ai_order_data: order,
        delivery_notes: 'Auto-generated order via AI system',
      });
      results.success.push(order.id);
    } catch (error: any) {
      results.failed.push({
        orderId: order.id,
        error: error.response?.data?.error || error.message || 'Unknown error',
      });
    }
  }

  return results;
};

export default {
  generateAIOrders,
  approveAIOrder,
  autoExecuteOrders,
};
