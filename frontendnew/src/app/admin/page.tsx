'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminPage() {
  const { isAdminAuthenticated, isLoading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAdminAuthenticated) {
        router.push('/admin/dashboard');
      } else {
        router.push('/admin/login');
      }
    }
  }, [isAdminAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Admin Portal</h1>
        <div className="text-lg">Loading...</div>
      </div>
    </div>
  );
} 