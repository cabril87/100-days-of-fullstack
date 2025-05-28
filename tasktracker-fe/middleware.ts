import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/tasks',
  '/templates',
  '/focus',
  '/notifications',
  '/reminders',
  '/gamification',
  '/family',
  '/profile',
  '/admin'
];

// Define public routes that should redirect to dashboard if authenticated
const publicRoutes = [
  '/auth/login',
  '/auth/register'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the token from cookies
  const token = request.cookies.get('token')?.value;
  const isAuthenticated = !!token;
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current path is a public auth route
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirect authenticated users from auth pages to dashboard
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 