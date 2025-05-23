/**
 * Security utilities for protection against common web vulnerabilities
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize string input to prevent XSS attacks
 * Uses DOMPurify for robust protection
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return DOMPurify.sanitize(input, { 
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
  });
}

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  if (!token) return true;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const { exp } = JSON.parse(jsonPayload);
    const expired = Date.now() >= exp * 1000;
    return expired;
  } catch (e) {
    return true;
  }
}

/**
 * Generate a nonce for CSP
 */
export function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Get CSRF token from cookie or other storage methods
 * @returns The CSRF token or null if not found
 */
export function getCsrfToken(): string | null {
  // Try to get it from cookies first
  const token = getCsrfFromCookie();
  if (token) return token;
  
  // Try localStorage as fallback (less secure but helps in development)
  const localToken = localStorage.getItem('csrfToken');
  if (localToken) return localToken;
  
  // Try to get it from meta tag (if present)
  const metaToken = getMetaCsrfToken();
  if (metaToken) return metaToken;
  
  return null;
}

/**
 * Parse cookies and extract CSRF token
 */
function getCsrfFromCookie(): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'XSRF-TOKEN') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Get CSRF token from meta tag if available
 */
function getMetaCsrfToken(): string | null {
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag) {
    return metaTag.getAttribute('content');
  }
  return null;
}

/**
 * Request a new CSRF token from the server
 * @returns Promise that resolves when token is received
 */
export async function refreshCsrfToken(): Promise<string | null> {
  try {
    console.log('[security] Refreshing CSRF token');
    
    // Choose the appropriate endpoint based on auth state
    const isAuthenticated = !!localStorage.getItem('token');
    const endpoint = isAuthenticated ? 
      '/api/v1/auth/csrf' : 
      '/api/v1/auth/public-csrf';
    
    // In development, use the debug endpoint for more info
    const isDevelopment = process.env.NODE_ENV === 'development';
    const finalEndpoint = isDevelopment ? '/api/v1/auth/debug-csrf' : endpoint;
    
    // The API_URL should be taken from environment variable or default to localhost
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const url = finalEndpoint.startsWith('/api') ? `${API_URL}${finalEndpoint.substring(4)}` : finalEndpoint;
    
    console.log('[security] Fetching CSRF token from:', url);
    
    // Make the request with credentials to ensure cookies are sent/received
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',  // Important for cookies
      cache: 'no-store',       // Don't cache this request
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('[security] Failed to refresh CSRF token:', response.statusText);
      return null;
    }
    
    // Wait a moment for cookies to be set
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Try to extract the token from cookies
    let token = getCsrfToken();
    
    // If token is not in cookies, try to get it from the response
    if (!token) {
      try {
        const data = await response.json();
        if (data.debug && data.debug.newToken) {
          token = data.debug.newToken;
          
          // Store in localStorage as fallback
          if (token) {
            localStorage.setItem('csrfToken', token);
            console.log('[security] Stored token in localStorage:', token);
          }
        }
      } catch (e) {
        console.error('[security] Error parsing token response:', e);
      }
    }
    
    console.log('[security] CSRF token refreshed:', token ? 'success' : 'failed');
    return token;
  } catch (error) {
    console.error('[security] Error refreshing CSRF token:', error);
    return null;
  }
}

/**
 * Adds CSRF token to fetch headers
 * @param headers Existing headers or new Headers object
 * @returns Headers with CSRF token added
 */
export function addCsrfHeader(headers: Headers | Record<string, string> = {}): Headers {
  const token = getCsrfToken();
  const finalHeaders = headers instanceof Headers ? headers : new Headers(headers);
  
  if (token) {
    finalHeaders.set('X-CSRF-TOKEN', token);
  }
  
  return finalHeaders;
} 