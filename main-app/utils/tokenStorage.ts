/**
 * Secure Token Storage
 * Handles authentication token storage using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@chainsync_access_token';
const REFRESH_TOKEN_KEY = '@chainsync_refresh_token';
const USER_TYPE_KEY = '@chainsync_user_type';
const USER_EMAIL_KEY = '@chainsync_user_email';

export const tokenStorage = {
  /**
   * Save authentication tokens
   */
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [TOKEN_KEY, accessToken],
        [REFRESH_TOKEN_KEY, refreshToken],
      ]);
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  },

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  /**
   * Save user info
   */
  async saveUserInfo(userType: 'retailer' | 'supplier', email: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [USER_TYPE_KEY, userType],
        [USER_EMAIL_KEY, email],
      ]);
    } catch (error) {
      console.error('Error saving user info:', error);
      throw error;
    }
  },

  /**
   * Get user type
   */
  async getUserType(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(USER_TYPE_KEY);
    } catch (error) {
      console.error('Error getting user type:', error);
      return null;
    }
  },

  /**
   * Get user email
   */
  async getUserEmail(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(USER_EMAIL_KEY);
    } catch (error) {
      console.error('Error getting user email:', error);
      return null;
    }
  },

  /**
   * Clear all authentication data
   */
  async clearAuth(): Promise<void> {
    try {
      console.log('🟢 [TokenStorage] Clearing auth data...');
      console.log('🟢 [TokenStorage] Keys to remove:', [TOKEN_KEY, REFRESH_TOKEN_KEY, USER_TYPE_KEY, USER_EMAIL_KEY]);
      await AsyncStorage.multiRemove([
        TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_TYPE_KEY,
        USER_EMAIL_KEY,
      ]);
      console.log('🟢 [TokenStorage] Auth data cleared successfully');
    } catch (error) {
      console.error('🟢 [TokenStorage] Error clearing auth:', error);
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      return token !== null;
    } catch (error) {
      return false;
    }
  },
};

export default tokenStorage;
