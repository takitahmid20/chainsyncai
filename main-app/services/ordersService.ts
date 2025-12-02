import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export interface OrderItem {
  id: number;
  product: number;
  product_name: string;
  product_price: string;
  quantity: number;
  subtotal: string;
}

export interface Order {
  id: number;
  order_number: string;
  retailer_name: string;
  supplier_name: string;
  status: 'pending' | 'accepted' | 'processing' | 'on_the_way' | 'delivered' | 'cancelled';
  total_amount: string;
  created_at: string;
  total_items: number;
  total_quantity: number;
}

export interface CreateOrderRequest {
  delivery_address: string;
  delivery_contact: string;
  delivery_notes?: string;
  supplier_id: number;
}

export interface CreateOrderResponse {
  message: string;
  order: Order;
}

class OrdersService {
  async getOrders(status?: string): Promise<Order[]> {
    try {
      console.log('🔍 Fetching orders from:', API_ENDPOINTS.ORDERS.LIST);
      const params = status ? { status } : {};
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.LIST, { params });
      console.log('✅ Orders fetched:', response.data.length, 'orders');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch orders:', error.response?.data || error.message);
      throw error;
    }
  }

  async getOrderById(id: number): Promise<Order> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.DETAIL(id));
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch order:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), { status });
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to update order status:', error.response?.data || error.message);
      throw error;
    }
  }

  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      console.log('🛒 Creating order from cart...');
      console.log('Request data:', JSON.stringify(data, null, 2));
      console.log('API Endpoint:', API_ENDPOINTS.ORDERS.CREATE);
      
      const response = await apiClient.post(API_ENDPOINTS.ORDERS.CREATE, data);
      
      console.log('✅ Order created successfully');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to create order');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error config:', {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
      });
      throw error;
    }
  }
}

export const ordersService = new OrdersService();
