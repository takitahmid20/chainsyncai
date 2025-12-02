/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

import Constants from 'expo-constants';

// Get base URL from environment or use default
const getApiBaseUrl = (): string => {
  // Try to get from app.config.js extra
  const extraApiUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  if (extraApiUrl) return extraApiUrl;
  
  // Check if running in production (deployed APK/IPA)
  const appEnv = Constants.expoConfig?.extra?.appEnv;
  if (appEnv === 'production') {
    // Production backend URL (fly.io)
    return 'https://chainsync-backend-winter-sound-6706.fly.dev';
  }
  
  // Fallback to localhost for development
  return 'http://172.16.30.89:8000';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 60000, // 60 seconds
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/**
 * API Endpoints
 * All API endpoints organized by feature
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    SIGNUP: '/api/auth/register/',
    VERIFY_EMAIL: '/api/auth/verify-email/',
    LOGIN: '/api/auth/login/',
    REFRESH_TOKEN: '/api/auth/token/refresh/',
    LOGOUT: '/api/auth/logout/',
  },
  
  // Profile
  PROFILE: {
    RETAILER: '/api/retailers/profile/',
    SUPPLIER: '/api/suppliers/profile/',
  },
  
  // Products
  PRODUCTS: {
    // Supplier endpoints
    SUPPLIER_LIST: '/api/products/supplier/products/',
    SUPPLIER_DETAIL: (id: number) => `/api/products/supplier/products/${id}/`,
    SUPPLIER_IMAGE_UPLOAD: (id: number) => `/api/products/supplier/products/${id}/images/`,
    SUPPLIER_IMAGE_DELETE: (productId: number, imageId: number) => 
      `/api/products/supplier/products/${productId}/images/${imageId}/`,
    
    // Retailer endpoints
    RETAILER_LIST: '/api/products/retailer/products/',
    RETAILER_DETAIL: (slug: string) => `/api/products/retailer/products/${slug}/`,
    CATEGORIES: '/api/products/categories/',
  },
  
  // Orders
  ORDERS: {
    LIST: '/api/orders/',
    CREATE: '/api/orders/',
    DETAIL: (id: number) => `/api/orders/${id}/`,
    UPDATE_STATUS: (id: number) => `/api/orders/${id}/status/`,
  },
  
  // Cart
  CART: {
    GET: '/api/orders/cart/',
    CLEAR: '/api/orders/cart/',
    ADD_ITEM: '/api/orders/cart/items/',
    UPDATE_ITEM: (id: number) => `/api/orders/cart/items/${id}/`,
    DELETE_ITEM: (id: number) => `/api/orders/cart/items/${id}/`,
  },
  
  // Sales
  SALES: {
    RECORD: '/api/sales/record/',
    DAILY: '/api/sales/daily/',
    SUMMARY: '/api/sales/summary/',
    ANALYTICS: '/api/sales/analytics/',
  },
  
  // Finance
  FINANCE: {
    LOAN_SUGGESTION: '/api/finance/loan/suggestion/',
    LOAN_HISTORY: '/api/finance/loan/history/',
  },
  
  // AI
  AI: {
    INSIGHTS: '/api/ai/insights/',
    FORECAST: '/api/ai/forecast/',
    ORDERS: '/api/ai/orders/',
    APPROVE_ORDER: '/api/ai/orders/approve/',
  },
};

/**
 * Build full URL from endpoint
 */
export const buildUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export default API_CONFIG;
