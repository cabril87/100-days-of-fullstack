'use client';

import FamilySeedingPanel from '@/components/admin/FamilySeedingPanel';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function FamilySeedingPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user is global admin
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const isGlobalAdmin = user.email === 'admin@tasktracker.com' || user.role.toLowerCase() === 'globaladmin';
    if (!isGlobalAdmin) {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  // Don't render anything while checking auth
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isGlobalAdmin = user.email === 'admin@tasktracker.com' || user.role.toLowerCase() === 'globaladmin';
  if (!isGlobalAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Family Seeding</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Global admin tools for creating test families with realistic data. Use this for development and testing purposes.
        </p>
      </div>

      <FamilySeedingPanel />
    </div>
  );
} 