'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [staffId, setStaffId] = useState('ADMIN001');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    adminLoginWithOtp, 
    verifyOtp, 
    isAdminAuthenticated, 
    isLoading: authLoading,
    otpStep,
    otpEmail,
    resetOtpState
  } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAdminAuthenticated) {
      router.push('/admin/dashboard');
    }
  }, [isAdminAuthenticated, authLoading, router]);

  const handleInitialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password || !staffId) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const result = await adminLoginWithOtp(username, password, staffId);
      
      if (result.requiresOtp) {
        toast.success(`OTP sent to ${result.email}`);
      } else {
        toast.success('Admin login successful');
        router.push('/admin/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpCode) {
      toast.error('Please enter the OTP code');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(otpCode);
      toast.success('Login successful');
      router.push('/admin/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    resetOtpState();
    setOtpCode('');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (isAdminAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
          <p className="mt-2 text-gray-600">Fontaine Santé SCOS Administration</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {otpStep ? 'Enter OTP Code' : 'Admin Login'}
            </CardTitle>
            <CardDescription>
              {otpStep 
                ? `Enter the verification code sent to ${otpEmail}`
                : 'Sign in with your administrator credentials'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!otpStep ? (
              <form onSubmit={handleInitialLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter admin username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="staffId">Staff ID</Label>
                  <Input
                    id="staffId"
                    type="text"
                    placeholder="Enter staff ID"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
                
                <div className="text-center text-sm text-gray-600">
                  <p>This is the admin portal. For staff login, <a href="/manager/login" className="text-blue-600 hover:underline">click here</a>.</p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOtpVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otpCode">Verification Code</Label>
                  <Input
                    id="otpCode"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleBackToLogin}
                  disabled={isLoading}
                >
                  Back to Login
                </Button>
                
                <div className="text-center text-sm text-gray-600">
                  <p>Didn't receive the code? Check your email or try logging in again.</p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 