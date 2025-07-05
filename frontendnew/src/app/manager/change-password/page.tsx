'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface PasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function ChangePasswordPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSaving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PasswordFormData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

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
    return null;
  }

  const handleInputChange = (field: keyof PasswordFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.current_password || !formData.new_password || !formData.confirm_password) {
      toast.error('All fields are required');
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setSaving(true);
    
    try {
      // This endpoint would need to be implemented in the backend
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/users/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: formData.current_password,
          new_password: formData.new_password
        }),
      });

      if (response.ok) {
        toast.success('Password changed successfully!');
        setFormData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        router.push('/manager/profile');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change failed:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/manager/profile')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
                <p className="text-gray-600">Update your account password</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Password Settings</CardTitle>
            <CardDescription>
              Enter your current password and choose a new one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current_password">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="current_password"
                  type="password"
                  value={formData.current_password}
                  onChange={(e) => handleInputChange('current_password', e.target.value)}
                  placeholder="Enter your current password"
                  className="pl-10"
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="new_password"
                  type="password"
                  value={formData.new_password}
                  onChange={(e) => handleInputChange('new_password', e.target.value)}
                  placeholder="Enter your new password"
                  className="pl-10"
                />
              </div>
              <p className="text-sm text-gray-600">
                Password must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirm_password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                  placeholder="Confirm your new password"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push('/manager/profile')}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Changing Password...' : 'Change Password'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 