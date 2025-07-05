import {
  LoginRequest,
  LoginResponse,
  OTPVerifyRequest,
  OTPVerifyResponse,
  OTPRequestRequest,
  OTPRequestResponse,
  AdminUserRegistrationRequest,
  AdminUserRegistrationResponse,
  SecurityQuestionsResponse,
  SecurityQuestionRequest,
  PasswordResetRequestRequest,
  PasswordResetConfirmRequest,
  User,
} from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.detail || errorData.message || 'Request failed';
      throw new ApiError(response.status, errorMessage, errorData);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, 'Network error occurred', error);
  }
}

export const authApi = {
  // Login with staff_id and password
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return fetchApi<LoginResponse>('/api/users/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Verify OTP and complete login
  verifyOTP: async (data: OTPVerifyRequest): Promise<OTPVerifyResponse> => {
    return fetchApi<OTPVerifyResponse>('/api/users/login/verify/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Request new OTP
  requestOTP: async (data: OTPRequestRequest): Promise<OTPRequestResponse> => {
    return fetchApi<OTPRequestResponse>('/api/users/otp/request/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Admin user registration
  registerUser: async (data: AdminUserRegistrationRequest): Promise<AdminUserRegistrationResponse> => {
    return fetchApi<AdminUserRegistrationResponse>('/api/users/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get security questions
  getSecurityQuestions: async (email: string): Promise<SecurityQuestionsResponse> => {
    return fetchApi<SecurityQuestionsResponse>(`/api/users/security-questions/?email=${encodeURIComponent(email)}`);
  },

  // Verify security question
  verifySecurityQuestion: async (data: SecurityQuestionRequest): Promise<{ message: string; email: string }> => {
    return fetchApi<{ message: string; email: string }>('/api/users/security-questions/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Request password reset
  requestPasswordReset: async (data: PasswordResetRequestRequest): Promise<{ message: string; email: string }> => {
    return fetchApi<{ message: string; email: string }>('/api/users/password/reset/request/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Confirm password reset
  confirmPasswordReset: async (data: PasswordResetConfirmRequest): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>('/api/users/password/reset/confirm/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    return fetchApi<User>('/api/users/profile/');
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<{ message: string; user: User }> => {
    return fetchApi<{ message: string; user: User }>('/api/users/profile/', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    return fetchApi<{ access: string }>('/api/users/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  },
}; 