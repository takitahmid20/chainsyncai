import apiClient from './apiClient';

export type StockStatus = 'low' | 'good' | 'out';

export interface InventoryProduct {
  id: number;
  name: string;
  sku: string;
  slug: string;
  category_name: string;
  category_slug: string;
  stock_quantity: number;
  minimum_order_quantity: number;
  price: string;
  discount_price?: string;
  unit: string;
  brand: string;
  status: string;
  stock_status: StockStatus;
  stock_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface InventorySummary {
  total_products: number;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
}

export interface InventoryListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  total_pages: number;
  current_page: number;
  page_size: number;
  products: InventoryProduct[];
  summary: InventorySummary;
}

export interface StockUpdateRequest {
  product_id: number;
  quantity: number;
  action: 'add' | 'remove' | 'adjust';
  notes?: string;
}

export interface StockUpdateResponse {
  message: string;
  product: InventoryProduct;
}

export interface AIRestockSuggestion {
  product_id: number;
  product_name: string;
  product_sku: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  suggested_quantity: number;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  unit_price: number;
  estimated_cost: number;
}

export interface AIRestockSummary {
  total_items: number;
  total_units: number;
  total_cost: number;
  high_priority_count: number;
}

export interface AIRestockSuggestionsResponse {
  suggestions: AIRestockSuggestion[];
  summary: AIRestockSummary;
}

export interface BulkRestockRequest {
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

export interface BulkRestockResponse {
  message: string;
  success_count: number;
  failed_count: number;
  failed_items?: Array<{
    product_id: number;
    error: string;
  }>;
}

export interface InventoryLog {
  id: number;
  product: number;
  product_name: string;
  product_sku: string;
  action: 'add' | 'remove' | 'order' | 'return' | 'adjust';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  notes: string;
  created_at: string;
}

export interface InventoryLogsResponse {
  logs: InventoryLog[];
  count: number;
}

class InventoryService {
  /**
   * Get all inventory items with optional filters and pagination
   */
  async getInventory(params?: {
    search?: string;
    category?: string;
    stock_status?: string;
    page?: number;
    page_size?: number;
  }): Promise<InventoryListResponse> {
    console.log('[InventoryService] Fetching inventory with params:', params);
    
    try {
      const response = await apiClient.get<InventoryListResponse>('/api/inventory/', {
        params,
      });
      
      console.log('[InventoryService] Inventory fetched successfully:', {
        totalCount: response.data.count,
        currentPage: response.data.current_page,
        totalPages: response.data.total_pages,
        productsCount: response.data.products.length,
        summary: response.data.summary,
      });
      
      return response.data;
    } catch (error: any) {
      console.error('[InventoryService] Failed to fetch inventory:', error);
      console.error('[InventoryService] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }

  /**
   * Update stock quantity for a product
   */
  async updateStock(data: StockUpdateRequest): Promise<StockUpdateResponse> {
    console.log('[InventoryService] Updating stock:', data);
    
    try {
      const response = await apiClient.post<StockUpdateResponse>(
        '/api/inventory/update/',
        data
      );
      
      console.log('[InventoryService] Stock updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[InventoryService] Failed to update stock:', error);
      console.error('[InventoryService] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }

  /**
   * Get low stock items
   */
  async getLowStock(): Promise<InventoryListResponse> {
    console.log('[InventoryService] Fetching low stock items');
    
    try {
      const response = await apiClient.get<InventoryListResponse>(
        '/api/inventory/low-stock/'
      );
      
      console.log('[InventoryService] Low stock items fetched:', {
        count: response.data.products.length,
      });
      
      return response.data;
    } catch (error: any) {
      console.error('[InventoryService] Failed to fetch low stock items:', error);
      throw error;
    }
  }

  /**
   * Get AI-powered restock suggestions
   */
  async getAIRestockSuggestions(): Promise<AIRestockSuggestionsResponse> {
    console.log('[InventoryService] Fetching AI restock suggestions');
    
    try {
      const response = await apiClient.get<AIRestockSuggestionsResponse>(
        '/api/inventory/ai-suggestions/'
      );
      
      console.log('[InventoryService] AI suggestions fetched successfully:', {
        suggestionsCount: response.data.suggestions.length,
        summary: response.data.summary,
      });
      
      return response.data;
    } catch (error: any) {
      console.error('[InventoryService] Failed to fetch AI suggestions:', error);
      console.error('[InventoryService] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }

  /**
   * Process bulk restock order
   */
  async bulkRestock(data: BulkRestockRequest): Promise<BulkRestockResponse> {
    console.log('[InventoryService] Processing bulk restock:', {
      itemsCount: data.items.length,
    });
    
    try {
      const response = await apiClient.post<BulkRestockResponse>(
        '/api/inventory/bulk-restock/',
        data
      );
      
      console.log('[InventoryService] Bulk restock completed:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[InventoryService] Failed to process bulk restock:', error);
      console.error('[InventoryService] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }

  /**
   * Get inventory change logs
   */
  async getInventoryLogs(productId?: number): Promise<InventoryLogsResponse> {
    console.log('[InventoryService] Fetching inventory logs', {
      productId,
    });
    
    try {
      const response = await apiClient.get<InventoryLogsResponse>(
        '/api/inventory/logs/',
        {
          params: productId ? { product_id: productId } : undefined,
        }
      );
      
      console.log('[InventoryService] Inventory logs fetched:', {
        count: response.data.count,
      });
      
      return response.data;
    } catch (error: any) {
      console.error('[InventoryService] Failed to fetch inventory logs:', error);
      throw error;
    }
  }
}

export const inventoryService = new InventoryService();
