/*
 * Server-Side Authentication Utilities
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * HTTP-only cookie authentication for Next.js Server Components
 * Following Family Auth Implementation Checklist Phase 1 requirements
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { User } from '@/lib/types/auth';

/**
 * Server-side API call utility with automatic cookie authentication
 */
export async function serverApiCall<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...options.headers,
    },
    credentials: 'include', // Include HTTP-only cookies
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh token automatically
        const refreshResult = await refreshServerToken();
        if (refreshResult) {
          // Retry the original request with new token
          const retryOptions = {
            ...defaultOptions,
            headers: {
              ...defaultOptions.headers,
              'Authorization': `Bearer ${refreshResult.accessToken}`,
            },
          };
          const retryResponse = await fetch(url, retryOptions);
          if (retryResponse.ok) {
            return await retryResponse.json();
          }
        }
        // If refresh failed, redirect to login
        throw new Error('Authentication failed');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Server API call failed:', error);
    throw error;
  }
}

/**
 * Get current user session from server-side cookies
 */
export async function getServerSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    
    if (!accessToken) {
      return null;
    }
    
    // Validate token and get user info
    const user = await serverApiCall<{ user: User }>('/api/v1/auth/me');
    return user.user;
  } catch (error) {
    console.error('Failed to get server session:', error);
    return null;
  }
}

/**
 * Refresh access token using HTTP-only refresh cookie
 */
async function refreshServerToken(): Promise<{ accessToken: string } | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${baseUrl}/api/v1/auth/refresh-token/cookie`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return { accessToken: data.accessToken || 'refreshed' };
    }
    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}

/**
 * Check if user is authenticated on server-side
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession();
  return session !== null;
}

/**
 * Require authentication for server components - redirect if not authenticated
 */
export async function requireAuth(redirectTo = '/auth/login'): Promise<User> {
  const session = await getServerSession();
  
  if (!session) {
    redirect(redirectTo);
  }
  
  return session;
}

/**
 * Check user role on server-side
 */
export async function checkRole(requiredRole: string): Promise<boolean> {
  const session = await getServerSession();
  if (!session) return false;
  
  // Global admins have access to everything
  if (session.role === 'GlobalAdmin') return true;
  
  return session.role === requiredRole;
}

/**
 * Require specific role for server components - redirect if not authorized
 */
export async function requireRole(
  requiredRole: string, 
  redirectTo = '/auth/login'
): Promise<User> {
  const session = await requireAuth(redirectTo);
  
  if (!checkRole(requiredRole)) {
    redirect('/403'); // Forbidden page
  }
  
  return session;
}

/**
 * Server-side logout utility
 */
export async function serverLogout(): Promise<void> {
  try {
    await serverApiCall('/api/v1/auth/logout/cookie', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Server logout failed:', error);
  } finally {
    redirect('/auth/login');
  }
}

/**
 * Get server authentication state - wrapper for compatibility
 */
export async function getServerAuth(): Promise<{
  user: User | null;
  isAuthenticated: boolean;
}> {
  const user = await getServerSession();
  return {
    user,
    isAuthenticated: user !== null,
  };
} 