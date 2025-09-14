'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AdminUser } from '@/types/admin';

const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What was the make of your first car?",
  "What city were you born in?",
  "What is the name of your favorite teacher?",
  "What was your childhood nickname?",
  "What is your favorite movie?",
  "What street did you live on as a child?",
  "What is your favorite food?",
  "What is the name of your best friend from childhood?"
];

export default function AdminDashboardPage() {
  const { isAdminAuthenticated, isLoading: authLoading, adminLogout } = useAdmin();
  const router = useRouter();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<AdminUser>>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password1: '',
    password2: '',
    phone_number: '',
    position: 'Manager',
    staff_id: '',
    security_question_1: '',
    security_answer_1: '',
    security_question_2: '',
    security_answer_2: '',
    is_staff: true,
    is_active: true,
    is_superuser: false,
  });

  useEffect(() => {
    if (!authLoading && !isAdminAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAdminAuthenticated, authLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username || !formData.email || !formData.password1 || !formData.first_name || !formData.last_name || !formData.staff_id) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (formData.password1 !== formData.password2) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password1.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    // Enhanced password validation
    const hasUpperCase = /[A-Z]/.test(formData.password1);
    const hasLowerCase = /[a-z]/.test(formData.password1);
    const hasNumbers = /\d/.test(formData.password1);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password1);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      toast.error('Password must contain uppercase, lowercase, numbers, and special characters');
      return;
    }
    
    if (!formData.security_question_1 || !formData.security_answer_1 || !formData.security_question_2 || !formData.security_answer_2) {
      toast.error('Please answer both security questions');
      return;
    }
    
    if (formData.security_question_1 === formData.security_question_2) {
      toast.error('Security questions must be different');
      return;
    }

    setIsCreating(true);
    try {
      // Use the correct API endpoint with proper data mapping and admin token
      const token = localStorage.getItem('admin_access_token'); // Use admin token instead of regular token
      console.log('Making request to:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/users/register/`);
      console.log('Admin token present:', !!token);
      
      if (!token) {
        throw new Error('Admin authentication required. Please log in again.');
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/users/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password1,
          password_confirm: formData.password2,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number || '',
          position: formData.position || 'Manager',
          staff_id: formData.staff_id,
          security_question_1: formData.security_question_1,
          security_answer_1: formData.security_answer_1,
          security_question_2: formData.security_question_2,
          security_answer_2: formData.security_answer_2,
        }),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        // Enhanced error handling with more specific error messages
        let errorMessage = 'Failed to create manager';
        
        if (response.status === 401) {
          errorMessage = 'Admin authentication required. Please log in again.';
        } else if (response.status === 403) {
          errorMessage = 'Admin privileges required. Please contact a system administrator.';
        } else if (response.status === 400 && responseData) {
          // Handle validation errors more specifically
          const errors = [];
          
          for (const [field, fieldErrors] of Object.entries(responseData)) {
            if (Array.isArray(fieldErrors)) {
              if (field === 'password') {
                errors.push(`Password: ${fieldErrors.join(', ')}`);
              } else if (field === 'staff_id') {
                errors.push('Staff ID already exists. Please use a different Staff ID.');
              } else if (field === 'email') {
                errors.push('Email already exists. Please use a different email address.');
              } else if (field === 'username') {
                errors.push('Username already exists. Please choose a different username.');
              } else {
                errors.push(`${field}: ${fieldErrors.join(', ')}`);
              }
            } else if (typeof fieldErrors === 'string') {
              errors.push(`${field}: ${fieldErrors}`);
            }
          }
          
          if (errors.length > 0) {
            errorMessage = errors.join('\n');
          }
        } else if (response.status === 500 && responseData) {
          // Handle server errors
          if (responseData.error && responseData.error.includes('UNIQUE constraint failed: users_user.staff_id')) {
            errorMessage = 'Staff ID already exists. Please use a different Staff ID.';
          } else if (responseData.error && responseData.error.includes('UNIQUE constraint failed: users_user.email')) {
            errorMessage = 'Email already exists. Please use a different email address.';
          } else if (responseData.error && responseData.error.includes('UNIQUE constraint failed: users_user.username')) {
            errorMessage = 'Username already exists. Please choose a different username.';
          } else if (responseData.error) {
            errorMessage = responseData.error;
          }
        } else if (responseData) {
          if (typeof responseData === 'string') {
            errorMessage = responseData;
          } else if (responseData.error) {
            errorMessage = responseData.error;
          } else if (responseData.detail) {
            errorMessage = responseData.detail;
          } else if (responseData.message) {
            errorMessage = responseData.message;
          }
        }
        
        throw new Error(errorMessage);
      }

      toast.success('Manager created successfully');
      setShowCreateDialog(false);
      // Reset form
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password1: '',
        password2: '',
        phone_number: '',
        position: 'Manager',
        staff_id: '',
        security_question_1: '',
        security_answer_1: '',
        security_question_2: '',
        security_answer_2: '',
        is_staff: true,
        is_active: true,
        is_superuser: false,
      });
    } catch (error: any) {
      console.error('Full error:', error);
      toast.error(error.message || 'Failed to create manager');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = () => {
    adminLogout();
    router.push('/admin/login');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage system users and settings</p>
            </div>
            <div className="flex space-x-4">
              <Button onClick={() => router.push('/admin')} variant="outline">
                Django Admin
              </Button>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management Card */}
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Create and manage system users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => setShowCreateDialog(true)} 
                className="w-full"
              >
                Create New Manager
              </Button>
              <Button 
                onClick={() => router.push('/admin/users')} 
                variant="outline" 
                className="w-full"
              >
                View All Users
              </Button>
            </CardContent>
          </Card>

          {/* Quick Links Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Access Django admin sections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/admin/`, '_blank')} 
                variant="outline" 
                className="w-full"
              >
                Django Admin Panel
              </Button>
              <Button 
                onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/admin/auth/group/`, '_blank')} 
                variant="outline" 
                className="w-full"
              >
                Manage Groups
              </Button>
              <Button 
                onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/docs/`, '_blank')} 
                variant="outline" 
                className="w-full"
              >
                API Documentation
              </Button>
            </CardContent>
          </Card>

          {/* System Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Current system status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Backend Status:</span>
                <span className="text-green-600 font-medium">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Admin Session:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Environment:</span>
                <span className="text-sm text-gray-600">Development</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Admin Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-gray-600">
                <p>
                  <strong>Creating Managers:</strong> Use the "Create New Manager" button to add managers who can access the main application dashboard.
                </p>
                <p>
                  <strong>Manager Credentials:</strong> The username and password you create for managers will be used to login to the main application (not this admin panel).
                </p>
                <p>
                  <strong>Django Admin:</strong> For full administrative access, use the Django Admin Panel link.
                </p>
                <p>
                  <strong>Security:</strong> Ensure all managers have strong passwords and complete security questions for account recovery.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Create Manager Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Manager</DialogTitle>
            <DialogDescription>
              Create a manager account that can access the main application dashboard
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateManager} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="manager.username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="manager@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  type="text"
                  placeholder="John"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  type="text"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="staff_id">Staff ID *</Label>
                <Input
                  id="staff_id"
                  name="staff_id"
                  type="text"
                  placeholder="MGR002, MGR003, etc."
                  value={formData.staff_id}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-sm text-gray-500">
                  Use a unique identifier (e.g., MGR002, MGR003, etc.)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password1">Password *</Label>
                <Input
                  id="password1"
                  name="password1"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password1}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                />
                <p className="text-sm text-gray-500">
                  Must be 8+ characters with uppercase, lowercase, numbers, and special characters
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password2">Confirm Password *</Label>
                <Input
                  id="password2"
                  name="password2"
                  type="password"
                  placeholder="Confirm password"
                  value={formData.password2}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Security Questions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Security Questions</h3>
              
              <div className="space-y-2">
                <Label htmlFor="security_question_1">Security Question 1 *</Label>
                <select
                  id="security_question_1"
                  name="security_question_1"
                  value={formData.security_question_1}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select a security question</option>
                  {SECURITY_QUESTIONS.map(question => (
                    <option key={question} value={question}>{question}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="security_answer_1">Answer 1 *</Label>
                <Input
                  id="security_answer_1"
                  name="security_answer_1"
                  type="text"
                  placeholder="Your answer"
                  value={formData.security_answer_1}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="security_question_2">Security Question 2 *</Label>
                <select
                  id="security_question_2"
                  name="security_question_2"
                  value={formData.security_question_2}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select a security question</option>
                  {SECURITY_QUESTIONS.map(question => (
                    <option 
                      key={question} 
                      value={question}
                      disabled={question === formData.security_question_1}
                    >
                      {question}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="security_answer_2">Answer 2 *</Label>
                <Input
                  id="security_answer_2"
                  name="security_answer_2"
                  type="text"
                  placeholder="Your answer"
                  value={formData.security_answer_2}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Manager'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 