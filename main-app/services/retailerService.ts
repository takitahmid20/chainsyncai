import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export interface RetailerProfile {
  id: number;
  shop_name: string;
  owner_name: string;
  shop_address: string;
  business_category: string;
  is_profile_complete: boolean;
  created_at: string;
  updated_at: string;
}

class RetailerService {
  async getProfile(): Promise<RetailerProfile> {
    try {
      console.log('🔍 Fetching retailer profile from:', API_ENDPOINTS.PROFILE.RETAILER);
      const response = await apiClient.get(API_ENDPOINTS.PROFILE.RETAILER);
      console.log('✅ Profile fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch profile:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateProfile(data: Partial<RetailerProfile>): Promise<RetailerProfile> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PROFILE.RETAILER, data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to update profile:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const retailerService = new RetailerService();
