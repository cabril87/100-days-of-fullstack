'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/providers/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, refreshToken, error } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle authentication check and token refresh
  useEffect(() => {
    // Skip if we're not client-side yet, already redirecting, or on auth pages
    if (!isClient || redirecting || typeof window === 'undefined') return;
    
    const currentPath = window.location.pathname;
    if (currentPath.includes('/auth/login') || currentPath.includes('/auth/register')) {
      return;
    }
    
    const handleAuthCheck = async () => {
      // Already authenticated - nothing to do
      if (isAuthenticated && user) return;
      
      // Loading - wait for it to complete
      if (isLoading) return;
      
      // Not authenticated and not loading - try to refresh token once
      if (!isAuthenticated && !isLoading && !isRefreshing) {
        setIsRefreshing(true);
        
        try {
          console.log('AuthGuard: Attempting to refresh token');
          const refreshSuccess = await refreshToken();
          
          if (!refreshSuccess) {
            // Refresh failed - redirect to login
            console.log('AuthGuard: Token refresh failed, redirecting to login');
            setRedirecting(true);
            
            // Get the current path for redirect after login
            const redirectPath = encodeURIComponent(window.location.pathname);
            router.replace(`/auth/login?redirect=${redirectPath}`);
          }
        } catch (error) {
          console.error('AuthGuard: Token refresh error', error);
          setRedirecting(true);
          router.replace('/auth/login');
        } finally {
          setIsRefreshing(false);
        }
      }
      
      // Not authenticated after refresh attempt and no longer loading - redirect
      if (!isAuthenticated && !isLoading && !isRefreshing) {
        setRedirecting(true);
        const redirectPath = encodeURIComponent(window.location.pathname);
        router.replace(`/auth/login?redirect=${redirectPath}`);
    }
    };
    
    handleAuthCheck();
  }, [user, isLoading, isAuthenticated, isClient, refreshToken, router, isRefreshing, redirecting]);

  // Show loading spinner while checking authentication
  if (isLoading || isRefreshing || !isClient || redirecting) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is not authenticated after all checks, don't render children
  if (!isAuthenticated || !user) {
    return null;
  }

  return <>{children}</>;
} 