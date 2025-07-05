'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isAdminAuthenticated, isLoading: adminLoading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !adminLoading) {
      if (isAdminAuthenticated) {
        router.push('/admin/dashboard');
      } else if (isAuthenticated) {
        router.push('/manager/dashboard');
      }
    }
  }, [isAuthenticated, isAdminAuthenticated, isLoading, adminLoading, router]);

  if (isLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Fontaine Santé SCOS</h1>
          <p className="text-gray-600 mb-4">Staff Communication & Operations System</p>
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (isAdminAuthenticated || isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Fontaine Santé SCOS</h1>
          <p className="text-xl text-gray-600">Staff Communication & Operations System</p>
          <p className="text-gray-500 mt-2">Please select your portal to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Admin Portal */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-blue-600">Admin Portal</CardTitle>
              <CardDescription>
                For system administrators to manage users and system settings
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-sm text-gray-600">
                <p>• Create and manage manager accounts</p>
                <p>• System configuration</p>
                <p>• Full administrative access</p>
              </div>
              <Button 
                onClick={() => router.push('/admin/login')} 
                className="w-full"
                size="lg"
              >
                Admin Login
              </Button>
            </CardContent>
          </Card>

          {/* Manager Portal */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-600">Manager Portal</CardTitle>
              <CardDescription>
                For managers to access staff management and operations
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-sm text-gray-600">
                <p>• Staff registration and management</p>
                <p>• Reports and analytics</p>
                <p>• Operational oversight</p>
              </div>
              <Button 
                onClick={() => router.push('/manager/login')} 
                className="w-full"
                size="lg"
                variant="outline"
              >
                Manager Login
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12 text-sm text-gray-500">
          <p>Need help? Contact your system administrator.</p>
        </div>
      </div>
    </div>
  );
}
