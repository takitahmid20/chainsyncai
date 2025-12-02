/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import apiClient, { handleApiError } from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import tokenStorage from '../utils/tokenStorage';

/**
 * Type Definitions
 */
export interface SignupData {
  email: string;
  password: string;
  user_type: 'retailer' | 'supplier';
}

export interface SignupResponse {
  message: string;
  user_id: string;
  email: string;
  user_type: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  message: string;
  user: {
    email: string;
    user_type: string;
    is_profile_complete: boolean;
  };
}

export interface VerifyEmailData {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
}

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Sign up new user
   */
  async signup(data: SignupData): Promise<SignupResponse> {
    try {
      const payload = {
        email: data.email,
        password: data.password,
        password2: data.password, // Backend requires password confirmation
        user_type: data.user_type,
      };
      
      const response = await apiClient.post<SignupResponse>(
        API_ENDPOINTS.AUTH.SIGNUP,
        payload
      );
      return response.data;
    } catch (error: any) {
      // Pass the full error object to preserve validation errors
      if (error.response) {
        throw error;
      }
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Verify email with token
   */
  async verifyEmail(data: VerifyEmailData): Promise<VerifyEmailResponse> {
    try {
      const response = await apiClient.post<VerifyEmailResponse>(
        API_ENDPOINTS.AUTH.VERIFY_EMAIL,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Login user
   */
  async login(data: LoginData): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        data
      );
      
      const { access, refresh, user } = response.data;
      
      // Save tokens and user info
      await tokenStorage.saveTokens(access, refresh);
      await tokenStorage.saveUserInfo(user.user_type as 'retailer' | 'supplier', user.email);
      
      return response.data;
    } catch (error: any) {
      // Pass the full error object to preserve validation errors
      if (error.response) {
        throw error;
      }
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      console.log('🟡 [AuthService] Starting logout...');
      await tokenStorage.clearAuth();
      console.log('🟡 [AuthService] Logout completed successfully');
    } catch (error) {
      console.error('🟡 [AuthService] Logout error:', error);
      await tokenStorage.clearAuth();
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return await tokenStorage.isAuthenticated();
  },

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<{ userType: string | null; email: string | null }> {
    const userType = await tokenStorage.getUserType();
    const email = await tokenStorage.getUserEmail();
    return { userType, email };
  },
};

export default authService;
