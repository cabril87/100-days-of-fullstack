/**
 * Centralized Authentication Configuration
 * 
 * This file contains all authentication patterns and utilities
 * following Next.js App Router best practices.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { User } from '@/lib/types';

// ==========================================
// 1. ROUTE CLASSIFICATION
// ==========================================

export const AUTH_ROUTES = {
  // Public routes - no auth required
  PUBLIC: [
    '/',
    '/about', 
    '/contact',
    '/pricing',
    '/support',
    '/privacy',
    '/terms'
  ],
  
  // Auth routes - redirect if already authenticated
  AUTH: [
    '/auth/login',
    '/auth/register', 
    '/auth/forgot-password'
  ],
  
  // Protected routes - require authentication
  PROTECTED: [
    '/dashboard',
    '/tasks',
    '/family',
    '/families', 
    '/settings',
    '/profile',
    '/admin'
  ],
  
  // Hybrid routes - work for both states
  HYBRID: [
    '/help',
    '/docs'
  ]
} as const;

// ==========================================
// 2. ROUTE HELPERS
// ==========================================

export function getRouteType(pathname: string) {
  if (AUTH_ROUTES.PUBLIC.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return 'PUBLIC';
  }
  if (AUTH_ROUTES.AUTH.some(route => pathname.startsWith(route))) {
    return 'AUTH';
  }
  if (AUTH_ROUTES.PROTECTED.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return 'PROTECTED';
  }
  if (AUTH_ROUTES.HYBRID.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return 'HYBRID';
  }
  return 'UNKNOWN';
}

// ==========================================
// 3. SERVER-SIDE AUTH (No Redirects)
// ==========================================

/**
 * Get server session without redirecting
 * Use this for data fetching in Server Components
 */
export async function getServerSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    
    if (!accessToken) {
      return null;
    }

    // Make API call to verify session
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/me`, {
      headers: {
        'Cookie': `access_token=${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always fresh for auth
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Fetch authenticated data for server components
 */
export async function fetchAuthenticatedData<T>(
  endpoint: string,
  fallback: T
): Promise<T> {
  try {
    const session = await getServerSession();
    if (!session) return fallback;

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      headers: {
        'Cookie': `access_token=${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return fallback;
    }

    return await response.json();
  } catch {
    return fallback;
  }
}

// ==========================================
// 4. REDIRECT HELPERS
// ==========================================

/**
 * Redirect to login with return URL
 */
export function redirectToLogin(returnUrl?: string) {
  const loginUrl = returnUrl 
    ? `/auth/login?redirect=${encodeURIComponent(returnUrl)}`
    : '/auth/login';
  redirect(loginUrl);
}

/**
 * Redirect authenticated users away from auth pages
 */
export function redirectFromAuth() {
  redirect('/dashboard');
}

// ==========================================
// 5. PAGE PATTERNS
// ==========================================

/**
 * Pattern for protected pages
 */
export async function ProtectedPagePattern(
  pathname: string,
  dataFetcher?: () => Promise<unknown>
): Promise<{ session: User; data: unknown }> {
  const session = await getServerSession();
  
  if (!session) {
    redirectToLogin(pathname);
    // This line should never be reached due to redirect, but TypeScript needs explicit return
    throw new Error('Not authenticated');
  }
  
  const data = dataFetcher ? await dataFetcher() : null;
  
  return { session, data };
}

/**
 * Pattern for auth pages
 */
export async function AuthPagePattern() {
  const session = await getServerSession();
  
  if (session) {
    redirectFromAuth();
  }
  
  return { session: null };
}

/**
 * Pattern for public/hybrid pages
 */
export async function PublicPagePattern(dataFetcher?: () => Promise<unknown>) {
  const session = await getServerSession();
  const data = dataFetcher ? await dataFetcher() : null;
  
  return { session, data };
} 