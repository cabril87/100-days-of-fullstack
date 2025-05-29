'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/providers/AuthContext';
import { useRouter } from 'next/navigation';
import { FocusMode } from '@/components/focus/FocusMode';
import { Spinner } from '@/components/ui/spinner';

export default function FocusPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Handle authentication redirect - stable effect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/focus');
    }
  }, [authLoading, user, router]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return <FocusMode />;
}