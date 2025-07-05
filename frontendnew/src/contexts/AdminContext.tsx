'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AdminContextType } from '@/types/admin';
import { adminApi } from '@/lib/adminApi';

interface ExtendedAdminContextType extends AdminContextType {
  otpStep: boolean;
  otpEmail: string;
  pendingUsername: string;
  adminLoginWithOtp: (username: string, password: string, staffId?: string) => Promise<{ requiresOtp: boolean; email?: string; message?: string }>;
  verifyOtp: (otpCode: string) => Promise<void>;
  resetOtpState: () => void;
}

const AdminContext = createContext<ExtendedAdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [otpStep, setOtpStep] = useState<boolean>(false);
  const [otpEmail, setOtpEmail] = useState<string>('');
  const [pendingUsername, setPendingUsername] = useState<string>('');

  // Check if admin is authenticated on app load
  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async (): Promise<boolean> => {
    try {
      const isAuth = await adminApi.checkAuth();
      setIsAdminAuthenticated(isAuth);
      return isAuth;
    } catch (error) {
      setIsAdminAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const adminLoginWithOtp = async (username: string, password: string, staffId: string = 'ADMIN001'): Promise<{ requiresOtp: boolean; email?: string; message?: string }> => {
    try {
      const result = await adminApi.login({ username, password, staff_id: staffId });
      
      if (result.requiresOtp) {
        setOtpStep(true);
        setOtpEmail(result.email || '');
        setPendingUsername(username);
        return result;
      } else {
        setIsAdminAuthenticated(true);
        return result;
      }
    } catch (error) {
      throw error;
    }
  };

  const verifyOtp = async (otpCode: string): Promise<void> => {
    try {
      await adminApi.verifyOtp(pendingUsername, otpCode);
      setIsAdminAuthenticated(true);
      resetOtpState();
    } catch (error) {
      throw error;
    }
  };

  const resetOtpState = () => {
    setOtpStep(false);
    setOtpEmail('');
    setPendingUsername('');
  };

  // Legacy method for backwards compatibility
  const adminLogin = async (username: string, password: string): Promise<void> => {
    const result = await adminLoginWithOtp(username, password);
    if (result.requiresOtp) {
      throw new Error('OTP verification required. Use adminLoginWithOtp method.');
    }
  };

  const adminLogout = () => {
    adminApi.logout().finally(() => {
      setIsAdminAuthenticated(false);
      resetOtpState();
    });
  };

  const value: ExtendedAdminContextType = {
    isAdminAuthenticated,
    isLoading,
    otpStep,
    otpEmail,
    pendingUsername,
    adminLogin,
    adminLoginWithOtp,
    verifyOtp,
    resetOtpState,
    adminLogout,
    checkAdminAuth,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}; 