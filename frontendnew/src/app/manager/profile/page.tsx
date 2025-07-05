'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, User, Mail, Phone, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';

interface ProfileFormData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  position: string;
}

export default function ManagerProfilePage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    position: ''
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/manager/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        position: user.position || ''
      });
    }
  }, [user]);

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

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const response = await authApi.updateProfile(formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      
      // Optionally refresh the user data in the auth context
      window.location.reload();
    } catch (error: any) {
      console.error('Profile update failed:', error);
      
      // Handle specific field errors from ApiError
      if (error.data) {
        if (error.data.email) {
          toast.error(`Email: ${error.data.email[0]}`);
        } else if (error.data.username) {
          toast.error(`Username: ${error.data.username[0]}`);
        } else if (error.data.phone_number) {
          toast.error(`Phone: ${error.data.phone_number[0]}`);
        } else {
          toast.error(error.message || 'Failed to update profile. Please check your input.');
        }
      } else {
        toast.error(error.message || 'Network error. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original user data
    if (user) {
      setFormData({
        email: user.email || '',
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        position: user.position || ''
      });
    }
    setIsEditing(false);
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
                onClick={() => router.push('/manager/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600">Manage your account information</p>
              </div>
            </div>
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your username"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your email address"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone_number"
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your job position"
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user?.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Staff Member:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user?.is_staff 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user?.is_staff ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Member Since:</span>
                  <span className="text-sm text-gray-600">
                    {user?.date_joined 
                      ? new Date(user.date_joined).toLocaleDateString() 
                      : 'N/A'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/manager/change-password')}
                >
                  Change Password
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/manager/security-questions')}
                >
                  Update Security Questions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 