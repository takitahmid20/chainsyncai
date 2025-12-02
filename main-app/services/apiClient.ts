/**
 * API Client
 * Centralized Axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, buildUrl } from '../config/api';
import tokenStorage from '../utils/tokenStorage';

/**
 * Create Axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

/**
 * Request Interceptor
 * Automatically adds authentication token to requests
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get access token from storage
    const token = await tokenStorage.getAccessToken();
    
    // Add token to headers if available
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (__DEV__) {
      console.log('📤 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        fullUrl: config.baseURL + config.url,
        data: config.data,
      });
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles token refresh and error responses
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (__DEV__) {
      console.log('📥 API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log error in development
    if (__DEV__) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get refresh token
        const refreshToken = await tokenStorage.getRefreshToken();
        
        if (!refreshToken) {
          // No refresh token, logout user
          await tokenStorage.clearAuth();
          throw new Error('No refresh token available');
        }

        // Request new access token
        const response = await axios.post(
          buildUrl('/api/auth/token/refresh/'),
          { refresh: refreshToken }
        );

        const { access, refresh } = response.data;

        // Save new tokens
        await tokenStorage.saveTokens(access, refresh);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        await tokenStorage.clearAuth();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * API Error Handler
 * Extracts error message from API response
 */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    
    // Check if response has error details
    if (axiosError.response?.data) {
      const data = axiosError.response.data;
      
      // Handle different error formats
      if (typeof data === 'string') {
        return data;
      }
      
      if (data.detail) {
        return data.detail;
      }
      
      if (data.error) {
        return data.error;
      }
      
      if (data.message) {
        return data.message;
      }
      
      // Handle field errors (validation errors)
      if (typeof data === 'object') {
        const firstError = Object.values(data)[0];
        if (Array.isArray(firstError)) {
          return firstError[0];
        }
        if (typeof firstError === 'string') {
          return firstError;
        }
      }
    }
    
    // Network errors
    if (axiosError.message === 'Network Error') {
      return 'Cannot connect to server. Please check:\n1. Backend server is running\n2. You are on the same WiFi network\n3. Your device can reach ' + API_CONFIG.BASE_URL;
    }
    
    // Timeout errors
    if (axiosError.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.';
    }
    
    return axiosError.message || 'An error occurred';
  }
  
  return 'An unexpected error occurred';
};

export default apiClient;
