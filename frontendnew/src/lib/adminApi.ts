import {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminUser,
  AdminUserListResponse,
  AdminGroup,
} from '@/types/admin';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class AdminApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'AdminApiError';
  }
}

// Helper function to get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_access_token');
}

// Helper function to make authenticated requests
async function makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  if (!token) {
    throw new AdminApiError(401, 'No authentication token available');
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  return response;
}

export const adminApi = {
  // Admin login - Step 1: Initial login
  login: async (data: AdminLoginRequest): Promise<{ requiresOtp: boolean; email?: string; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          staff_id: data.staff_id || 'ADMIN001', // Default admin staff_id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AdminApiError(response.status, errorData.detail || errorData.message || 'Login failed');
      }

      const responseData = await response.json();
      
      // If OTP is required
      if (responseData.requires_otp) {
        return {
          requiresOtp: true,
          email: responseData.email,
          message: responseData.message,
        };
      }
      
      // If no OTP required, store tokens
      if (responseData.access) {
        localStorage.setItem('admin_access_token', responseData.access);
        localStorage.setItem('admin_refresh_token', responseData.refresh);
      }
      
      return { requiresOtp: false };
    } catch (error) {
      throw error;
    }
  },

  // Admin login - Step 2: OTP verification
  verifyOtp: async (username: string, otpCode: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          otp: otpCode,
          method: 'email'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AdminApiError(response.status, errorData.detail || errorData.message || 'OTP verification failed');
      }

      const responseData = await response.json();
      
      // Store tokens after successful OTP verification
      if (responseData.access) {
        localStorage.setItem('admin_access_token', responseData.access);
        localStorage.setItem('admin_refresh_token', responseData.refresh);
      }
    } catch (error) {
      throw error;
    }
  },

  // Admin logout
  logout: async (): Promise<void> => {
    try {
      // Clear stored tokens
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
    } catch (error) {
      // Even if logout fails, clear local storage
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      throw error;
    }
  },

  // Check if admin is authenticated
  checkAuth: async (): Promise<boolean> => {
    try {
      const token = getAuthToken();
      if (!token) return false;
      
      // Try to access user profile to verify token
      const response = await fetch(`${API_BASE_URL}/api/users/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  // Refresh access token
  refreshToken: async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('admin_refresh_token');
      if (!refreshToken) return false;

      const response = await fetch(`${API_BASE_URL}/api/users/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      localStorage.setItem('admin_access_token', data.access);
      return true;
    } catch (error) {
      return false;
    }
  },

  // User Management Functions
  users: {
    // Get all users
    getAll: async (): Promise<AdminUser[]> => {
      try {
        const response = await makeAuthenticatedRequest('/api/users/admin/users/');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new AdminApiError(response.status, errorData.detail || 'Failed to fetch users');
        }
        
        const data = await response.json();
        return data.results || data; // Handle both paginated and non-paginated responses
      } catch (error) {
        throw error;
      }
    },

    // Get a specific user
    getById: async (id: number): Promise<AdminUser> => {
      try {
        const response = await makeAuthenticatedRequest(`/api/users/admin/users/${id}/`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new AdminApiError(response.status, errorData.detail || 'Failed to fetch user');
        }
        
        return await response.json();
      } catch (error) {
        throw error;
      }
    },

    // Get all managers
    getManagers: async (): Promise<AdminUser[]> => {
      try {
        const response = await makeAuthenticatedRequest('/api/users/admin/users/managers/');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new AdminApiError(response.status, errorData.detail || 'Failed to fetch managers');
        }
        
        return await response.json();
      } catch (error) {
        throw error;
      }
    },

    // Toggle user active status
    toggleActive: async (id: number): Promise<{ is_active: boolean }> => {
      try {
        const response = await makeAuthenticatedRequest(`/api/users/admin/users/${id}/toggle_active/`, {
          method: 'POST',
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new AdminApiError(response.status, errorData.detail || 'Failed to toggle user status');
        }
        
        return await response.json();
      } catch (error) {
        throw error;
      }
    },

    // Update user
    update: async (id: number, data: Partial<AdminUser>): Promise<AdminUser> => {
      try {
        const response = await makeAuthenticatedRequest(`/api/users/admin/users/${id}/`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new AdminApiError(response.status, errorData.detail || 'Failed to update user');
        }
        
        return await response.json();
      } catch (error) {
        throw error;
      }
    },

    // Delete user
    delete: async (id: number): Promise<void> => {
      try {
        const response = await makeAuthenticatedRequest(`/api/users/admin/users/${id}/`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new AdminApiError(response.status, errorData.detail || 'Failed to delete user');
        }
      } catch (error) {
        throw error;
      }
    },
  },

  // Groups management
  groups: {
    getAll: async (): Promise<AdminGroup[]> => {
      try {
        const response = await makeAuthenticatedRequest('/api/users/admin/groups/');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new AdminApiError(response.status, errorData.detail || 'Failed to fetch groups');
        }
        
        const data = await response.json();
        return data.results || data;
      } catch (error) {
        throw error;
      }
    },
  },
}; 