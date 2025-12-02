/**
 * Cart Service
 * Handles shopping cart operations for retailers
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/config/api';

export interface CartItem {
  id: number;
  product: number;
  product_details: {
    id: number;
    name: string;
    slug: string;
    price: string;
    stock_quantity: number;
    images: any[];
    supplier?: number;
    supplier_name?: string;
  };
  quantity: number;
  subtotal: string;
}

export interface Cart {
  id: number;
  retailer: number;
  items: CartItem[];
  total_items: number;
  total_amount: string;
  created_at: string;
  updated_at: string;
}

export interface AddToCartRequest {
  product: number;
  quantity: number;
}

export interface AddToCartResponse {
  message: string;
  cart_item: CartItem;
}

class CartService {
  /**
   * Get current cart
   */
  async getCart(): Promise<Cart> {
    const response = await apiClient.get<Cart>(API_ENDPOINTS.CART.GET);
    return response.data;
  }

  /**
   * Add item to cart
   */
  async addToCart(productId: number, quantity: number = 1): Promise<AddToCartResponse> {
    const response = await apiClient.post<AddToCartResponse>(
      API_ENDPOINTS.CART.ADD_ITEM,
      {
        product: productId,
        quantity: quantity,
      }
    );
    return response.data;
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(itemId: number, quantity: number): Promise<{ message: string; cart_item: CartItem }> {
    const response = await apiClient.put<{ message: string; cart_item: CartItem }>(
      API_ENDPOINTS.CART.UPDATE_ITEM(itemId),
      { quantity }
    );
    return response.data;
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(itemId: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.CART.DELETE_ITEM(itemId)
    );
    return response.data;
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.CART.CLEAR
    );
    return response.data;
  }

  /**
   * Get cart item count
   */
  async getCartItemCount(): Promise<number> {
    try {
      const cart = await this.getCart();
      return cart.total_items || 0;
    } catch (error) {
      return 0;
    }
  }
}

export const cartService = new CartService();
export default cartService;
