'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthContextType, LoginResponse } from '@/types/auth';
import { authApi } from '@/lib/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string>('');

  const isAuthenticated = !!user;

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const userData = await authApi.getProfile();
          setUser(userData);
        }
      } catch (error) {
        // Token might be expired, clear it
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (staffId: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await authApi.login({ staff_id: staffId, password });
      if (response.email) {
        setUserEmail(response.email);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (email: string, otp: string, method: 'email' | 'phone' = 'email'): Promise<void> => {
    try {
      const response = await authApi.verifyOTP({ email, otp, method });
      
      // Store tokens
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      
      // Set user data
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setUserEmail('');
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await authApi.refreshToken(refreshTokenValue);
      localStorage.setItem('access_token', response.access);
    } catch (error) {
      // If refresh fails, logout user
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    verifyOTP,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 