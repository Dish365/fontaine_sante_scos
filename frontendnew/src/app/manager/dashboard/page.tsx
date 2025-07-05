'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ManagerDashboardPage() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/manager/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  const handleLogout = () => {
    logout();
    router.push('/manager/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.first_name}!</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Name:</span> {user?.first_name} {user?.last_name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {user?.email}
              </div>
              <div>
                <span className="font-medium">Position:</span> {user?.position}
              </div>
              {user?.phone_number && (
                <div>
                  <span className="font-medium">Phone:</span> {user.phone_number}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => router.push('/manager/profile')} 
                variant="outline" 
                className="w-full"
              >
                Edit Profile
              </Button>
              <Button 
                onClick={() => router.push('/manager/change-password')} 
                variant="outline" 
                className="w-full"
              >
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span>API Status:</span>
                <span className="text-green-600 font-medium">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Login:</span>
                <span className="text-sm text-gray-600">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Account Status:</span>
                <span className={`font-medium ${user?.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {user?.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Manager-specific Content */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Manager Tools</CardTitle>
              <CardDescription>Management and oversight functions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  onClick={() => router.push('/manager/suppliers')} 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <span className="font-medium">Supplier Management</span>
                  <span className="text-sm text-gray-600">Manage suppliers</span>
                </Button>
                
                <Button 
                  onClick={() => router.push('/manager/reports')} 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <span className="font-medium">Reports</span>
                  <span className="text-sm text-gray-600">Generate reports</span>
                </Button>
                
                <Button 
                  onClick={() => router.push('/manager/settings')} 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <span className="font-medium">Settings</span>
                  <span className="text-sm text-gray-600">System configuration</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent actions and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity to display.</p>
                <p className="text-sm mt-2">This section will show your recent management actions and system notifications.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 