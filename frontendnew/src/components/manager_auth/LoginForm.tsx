'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const LoginForm: React.FC = () => {
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, verifyOTP } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await login(staffId, password);
      if (response.requires_otp) {
        setEmail(response.email);
        setStep('otp');
        toast.success('OTP sent to your email');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOTP(email, otp, 'email');
      toast.success('Login successful');
      router.push('/manager/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await authApi.requestOTP({ email, method: 'email' });
      toast.success('New OTP sent to your email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP');
    }
  };

  if (step === 'otp') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Verify OTP</CardTitle>
          <CardDescription>
            Enter the verification code sent to {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOTPVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>
            
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResendOTP}
                className="text-sm"
              >
                Resend OTP
              </Button>
            </div>
            
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep('login')}
                className="text-sm"
              >
                Back to Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Manager Login</CardTitle>
        <CardDescription>
          Enter your staff ID and password provided by the administrator
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="staffId">Staff ID</Label>
            <Input
              id="staffId"
              type="text"
              placeholder="Enter your staff ID"
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
          
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.push('/forgot-password')}
              className="text-sm"
            >
              Forgot Password?
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-600 mt-4">
            <p>For administrator access, <a href="/admin/login" className="text-blue-600 hover:underline">click here</a></p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 