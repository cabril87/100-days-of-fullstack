/**
 * Authentication Utilities
 * Centralized logic for determining authentication requirements across the app
 */

// Public pages that don't require authentication
export const PUBLIC_PAGES = [
  // Core public pages
  '/',
  '/about',
  '/contact',
  '/features',
  '/pricing',
  '/blog',
  '/docs',
  '/privacy',
  '/terms',
  
  // Support & Help pages (publicly accessible)
  '/support',
  '/help',
  '/customer-support',
  '/community',
  '/faq',
  
  // Authentication pages
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/cookie-test', // Development testing
];

// Pages that should redirect to login if not authenticated
export const PROTECTED_PAGES = [
  '/dashboard',
  '/tasks',
  '/family',
  '/families',
  '/settings',
  '/profile',
  '/admin',
  '/gamification',
];

// Pages that should show navigation but work for both auth states
export const HYBRID_PAGES = [
  '/support',
  '/help',
  '/customer-support',
  '/contact',
  '/community',
];

/**
 * Check if a page is completely public (no auth needed, minimal UI)
 */
export function isPublicPage(pathname: string): boolean {
  return PUBLIC_PAGES.some(page => 
    pathname === page || 
    (page !== '/' && pathname.startsWith(page + '/'))
  );
}

/**
 * Check if a page requires authentication
 */
export function isProtectedPage(pathname: string): boolean {
  return PROTECTED_PAGES.some(page => 
    pathname === page || 
    pathname.startsWith(page + '/')
  );
}

/**
 * Check if a page is hybrid (works with or without auth)
 */
export function isHybridPage(pathname: string): boolean {
  return HYBRID_PAGES.some(page => 
    pathname === page || 
    pathname.startsWith(page + '/')
  );
}

/**
 * Check if authentication should be initialized for this page
 * Only skip auth initialization on the FIRST load of pure public pages
 * Once auth is initialized, maintain it across all pages
 */
export function shouldSkipInitialAuth(pathname: string): boolean {
  // Skip INITIAL auth initialization on:
  // 1. Pure public pages - prevent unnecessary API calls
  // 2. Auth pages - prevent interference with login/register process
  const skipAuthPages = [
    // Pure public pages
    '/',
    '/about',
    '/contact',
    '/features',
    '/pricing',
    '/blog',
    '/docs',
    '/privacy',
    '/terms',
    
    // Auth pages - critical to skip to prevent login interference
    '/auth/login',
    '/auth/register', 
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/auth/cookie-test',
  ];
  
  return skipAuthPages.some(page => 
    pathname === page || 
    (page !== '/' && pathname.startsWith(page + '/'))
  );
}

/**
 * Check if navigation components should show authentication features
 */
export function shouldShowAuthFeatures(pathname: string): boolean {
  return !isPublicPage(pathname) || isHybridPage(pathname);
}

/**
 * Check if sidebar should be available
 */
export function shouldShowSidebar(pathname: string, isAuthenticated: boolean): boolean {
  // Never show sidebar on pure public pages
  if (isPublicPage(pathname) && !isHybridPage(pathname)) {
    return false;
  }
  
  // Only show sidebar if authenticated
  return isAuthenticated;
}

/**
 * Get navigation mode for current page
 */
export function getNavigationMode(pathname: string): 'public' | 'hybrid' | 'authenticated' {
  if (isPublicPage(pathname) && !isHybridPage(pathname)) {
    return 'public';
  }
  
  if (isHybridPage(pathname)) {
    return 'hybrid';
  }
  
  return 'authenticated';
} 