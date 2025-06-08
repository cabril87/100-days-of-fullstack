/**
 * Enterprise-Grade Authentication Middleware
 * 
 * Implements centralized route protection following Next.js best practices
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRouteType } from '@/lib/auth/auth-config';

/**
 * Check if user is authenticated via cookies
 */
function isAuthenticated(request: NextRequest): boolean {
  const accessToken = request.cookies.get('access_token')?.value;
  console.log(`🍪 Middleware - Cookie check: access_token = ${accessToken ? '[PRESENT]' : '[MISSING]'}`);
  return !!accessToken;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`🚨 MIDDLEWARE CALLED - Pathname: ${pathname}`);
  
  const authenticated = isAuthenticated(request);
  const routeType = getRouteType(pathname);
  
  console.log(`🛡️ Middleware - Path: ${pathname}, Authenticated: ${authenticated}, RouteType: ${routeType}`);

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    console.log(`⏭️ Middleware - Skipping ${pathname} (static/api)`);
    return NextResponse.next();
  }

  // Handle different route types
  switch (routeType) {
    case 'PROTECTED':
      if (!authenticated) {
        console.log(`🚫 Middleware - Redirecting unauthenticated user from ${pathname} to login`);
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
      console.log(`✅ Middleware - Allowing authenticated user to access ${pathname}`);
      break;

    case 'AUTH':
      if (authenticated) {
        console.log(`🔄 Middleware - Redirecting authenticated user from ${pathname} to dashboard`);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      console.log(`✅ Middleware - Allowing unauthenticated user to access ${pathname}`);
      break;

    case 'PUBLIC':
    case 'HYBRID':
      // Allow access regardless of auth state
      break;

    default:
      // Unknown routes - treat as public for now
      console.warn(`Unknown route type for ${pathname}`);
      break;
  }

  // Add auth headers for downstream components
  const response = NextResponse.next();
  
  if (authenticated) {
    response.headers.set('x-auth-status', 'authenticated');
  } else {
    response.headers.set('x-auth-status', 'unauthenticated');
  }

  return response;
}

// Next.js requires this config to be statically analyzable
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|.*\\..*$).*)',
  ],
}; 