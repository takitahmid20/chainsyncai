import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export interface ForecastSummary {
  predicted_total_demand: number;
  predicted_daily_average: number;
  confidence_level: string;
  trend: string;
}

export interface ForecastRecommendations {
  should_reorder: boolean;
  suggested_order_quantity: number;
  reorder_urgency: string;
  estimated_stockout_date: string;
  risk_assessment: string;
}

export interface ProductForecast {
  product_id: number;
  product_name: string;
  current_price: number;
  current_stock: number;
  forecast_period_days: number;
  generated_at: string;
  forecast_summary: ForecastSummary;
  recommendations: ForecastRecommendations;
  insights: string[];
}

export interface ProductRecommendation {
  product_id: number;
  product_name: string;
  current_shop_stock: number; // Retailer's shop inventory
  avg_daily_sales: number; // Average daily sales
  predicted_demand: number; // Expected customer demand
  should_reorder: boolean;
  suggested_order_quantity: number; // How much to order from supplier
  reorder_urgency: string;
  days_until_stockout: number;
  quick_insight: string;
}

export interface AIInsightsResponse {
  retailer_id: number;
  generated_at: string;
  forecast_period_days: number;
  summary: {
    total_products_analyzed: number;
    products_need_reorder: number;
    urgent_reorders: number;
    soon_reorders: number;
    total_suggested_order_value: number;
    average_stock_days_remaining: number;
  };
  recommendations: ProductRecommendation[];
  urgent_products: ProductRecommendation[];
  soon_products: ProductRecommendation[];
  trending_up_products: ProductRecommendation[];
}

// Smart Product Analysis Types
export interface SmartProductAnalysis {
  product_id: number;
  product_name: string;
  supplier_name: string;
  current_stock: number;
  unit_price: number;
  demand_score: number; // 0-100
  urgency_score: number; // 0-100
  predicted_demand_30d: number;
  daily_avg_demand: number;
  confidence_level: string;
  should_reorder: boolean;
  suggested_order_qty: number;
  estimated_stockout_date: string | null;
  days_until_stockout: number;
  reorder_urgency: string;
  trend: string;
}

export interface SmartAnalysisResponse {
  retailer_id: number;
  analysis_date: string;
  forecast_period_days: number;
  summary: {
    total_products_analyzed: number;
    high_demand_products_count: number;
    products_need_reorder: number;
    critical_low_stock_count: number;
    average_demand_score: number;
    total_reorder_value: number;
    currency: string;
  };
  top_demand_products: SmartProductAnalysis[];
  reorder_recommendations: SmartProductAnalysis[];
  low_stock_alerts: SmartProductAnalysis[];
  all_products: SmartProductAnalysis[];
  insights: {
    highest_demand_product: SmartProductAnalysis | null;
    most_urgent_reorder: SmartProductAnalysis | null;
    most_critical_stock: SmartProductAnalysis | null;
    recommendation: string;
  };
}

class ForecastService {
  async getProductForecast(productId: number, forecastDays: number = 30): Promise<ProductForecast> {
    try {
      console.log('🔍 Fetching product forecast from:', '/api/ai/forecast/');
      const response = await apiClient.post('/api/ai/forecast/', {
        product_id: productId,
        forecast_days: forecastDays,
      });
      console.log('✅ Forecast fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch forecast:', error.response?.data || error.message);
      throw error;
    }
  }

  async getRetailerInsights(
    forecastDays: number = 30,
    priorityFilter: string = 'all',
    maxProducts: number = 20
  ): Promise<AIInsightsResponse> {
    try {
      console.log('🔍 Fetching retailer insights from:', '/api/ai/insights/');
      const response = await apiClient.post('/api/ai/insights/', {
        forecast_days: forecastDays,
        priority_filter: priorityFilter,
        max_products: maxProducts,
      });
      console.log('✅ Insights fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch insights:', error.response?.data || error.message);
      throw error;
    }
  }

  async getSmartProductAnalysis(
    forecastDays: number = 30,
    topProducts: number = 10
  ): Promise<SmartAnalysisResponse> {
    try {
      console.log('🤖 Fetching smart product analysis from:', '/api/ai/analysis/smart/');
      const response = await apiClient.post('/api/ai/analysis/smart/', {
        forecast_days: forecastDays,
        top_products: topProducts,
      });
      console.log('✅ Smart analysis fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch smart analysis:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const forecastService = new ForecastService();
