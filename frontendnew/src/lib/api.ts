// API configuration and utilities
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface ApiResponse<T> {
  results?: T[];
  data?: T;
  count?: number;
  next?: string;
  previous?: string;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // Add authentication token if available
    const token = this.getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    // Add CSRF token if available
    const csrfToken = this.getCSRFToken();
    if (csrfToken && (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE')) {
      config.headers = {
        ...config.headers,
        'X-CSRFToken': csrfToken,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `HTTP ${response.status}` };
        }
        
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  private getAuthToken(): string | null {
    // Try to get auth token from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private getCSRFToken(): string | null {
    // Try to get CSRF token from cookie
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
          return value;
        }
      }
    }
    return null;
  }

  // Suppliers API
  async getSuppliers() {
    const response = await this.request<ApiResponse<any>>('/api/suppliers/suppliers/');
    return response.results || [];
  }

  // Warehouses API
  async getWarehouses() {
    const response = await this.request<ApiResponse<any>>('/api/suppliers/warehouses/');
    return response.results || [];
  }

  // Materials API
  async getMaterials() {
    const response = await this.request<ApiResponse<any>>('/api/suppliers/materials/');
    return response.results || [];
  }

  // Orders API
  async getOrders() {
    const response = await this.request<ApiResponse<any>>('/api/suppliers/orders/');
    return response.results || [];
  }

  async createOrder(orderData: any) {
    return await this.request('/api/suppliers/orders/', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(orderId: string, orderData: any) {
    return await this.request(`/api/suppliers/orders/${orderId}/`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async getOrder(orderId: string) {
    return await this.request(`/api/suppliers/orders/${orderId}/`);
  }

  async markOrderDelivered(orderId: string) {
    return await this.request(`/api/suppliers/orders/${orderId}/mark_delivered/`, {
      method: 'POST',
    });
  }

  // Warehouse capacity API
  async getWarehouseCapacity(warehouseId: string) {
    return await this.request(`/api/suppliers/warehouses/${warehouseId}/capacity_status/`);
  }

  async getCapacityAlerts(warehouseId?: string) {
    const endpoint = warehouseId 
      ? `/api/suppliers/capacity-alerts/by_warehouse/?warehouse_id=${warehouseId}`
      : '/api/suppliers/capacity-alerts/';
    return await this.request<ApiResponse<any>>(endpoint);
  }

  async acknowledgeAlert(alertId: string) {
    return await this.request(`/api/suppliers/capacity-alerts/${alertId}/acknowledge/`, {
      method: 'POST',
    });
  }

  // Authentication API methods
  async login(staffId: string, password: string) {
    return await this.request('/api/users/login/', {
      method: 'POST',
      body: JSON.stringify({ staff_id: staffId, password }),
    });
  }

  async logout() {
    return await this.request('/api/users/logout/', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return await this.request('/api/users/profile/');
  }

  async refreshToken() {
    return await this.request('/api/users/token/refresh/', {
      method: 'POST',
    });
  }

  async register(userData: any) {
    return await this.request('/api/users/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyOTP(otpData: { email: string; otp: string; method: 'email' | 'phone' }) {
    return await this.request('/api/users/login/verify/', {
      method: 'POST',
      body: JSON.stringify(otpData),
    });
  }

  async requestOTP(otpRequest: { email: string; method: 'email' | 'phone' }) {
    return await this.request('/api/users/otp/request/', {
      method: 'POST',
      body: JSON.stringify(otpRequest),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Method to refresh API client when tokens change
export const refreshApiClient = () => {
  // This will cause the next request to re-check the token
  console.log('API client refreshed - will use new token on next request');
};

// Create auth API object for backward compatibility
export const authApi = {
  login: (staffId: string, password: string) => apiClient.login(staffId, password),
  logout: () => apiClient.logout(),
  getCurrentUser: () => apiClient.getCurrentUser(),
  getProfile: () => apiClient.getCurrentUser(), // Alias for backward compatibility
  refreshToken: () => apiClient.refreshToken(),
  register: (userData: any) => apiClient.register(userData),
  verifyOTP: (otpData: { email: string; otp: string; method: 'email' | 'phone' }) => apiClient.verifyOTP(otpData),
  requestOTP: (otpRequest: { email: string; method: 'email' | 'phone' }) => apiClient.requestOTP(otpRequest),
};

// Export individual functions for backward compatibility
export const {
  getSuppliers,
  getWarehouses,
  getMaterials,
  getOrders,
  createOrder,
  updateOrder,
  getOrder,
  markOrderDelivered,
  getWarehouseCapacity,
  getCapacityAlerts,
  acknowledgeAlert,
} = apiClient;