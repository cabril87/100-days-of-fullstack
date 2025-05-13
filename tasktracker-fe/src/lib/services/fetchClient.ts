import { useAuth } from '@/lib/providers/AuthContext';
import { ApiResponse } from '@/lib/types/api';
import { useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Constants
const REQUEST_TIMEOUT = 30000; // 30 seconds timeout for requests

// Types for internal use
type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface FetchOptions extends RequestInit {
  method: RequestMethod;
  headers?: Record<string, string>;
  data?: any;
  requiresAuth?: boolean;
  timeout?: number;
}

// Global state for request handling
let isRefreshingToken = false;
const requestQueue: Array<() => Promise<Response>> = [];

// Helper functions
const getCsrfToken = (): string => {
  if (typeof window === 'undefined') return '';
  
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
  
  if (csrfCookie) {
    const encodedToken = csrfCookie.split('=')[1];
    try {
      return decodeURIComponent(encodedToken);
    } catch (e) {
      console.error('Error decoding CSRF token:', e);
      return encodedToken;
    }
  }
  
  return '';
};

const fetchCsrfToken = async (): Promise<void> => {
  try {
    await fetch(`${API_URL}/v1/auth/csrf`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store'
    });
    
    // Wait a bit for cookies to be set
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
  }
};

// Process all requests in the queue with the new token
const processQueue = (newToken: string): void => {
  requestQueue.forEach(callback => callback());
  requestQueue.length = 0;
};

// Main fetch client class
class FetchClient {
  private accessToken: string | null = null;
  
  constructor() {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('token');
    }
  }
  
  async fetch<T>(url: string, options: FetchOptions): Promise<ApiResponse<T>> {
    const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh-token');
    const requiresAuth = options.requiresAuth !== false && !isAuthRequest;
    
    // Add trailing slash if not present and not a query param URL
    if (!url.endsWith('/') && !url.includes('?')) {
      url = `${url}/`;
    }
    
    // Ensure fresh CSRF token
    await fetchCsrfToken();
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };
    
    // Add CSRF token
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-TOKEN'] = csrfToken;
    }
    
    // Add authorization token if required
    if (requiresAuth) {
      // Use token from instance state or localStorage
      const token = this.accessToken || localStorage.getItem('token');
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (requiresAuth) {
        // Token required but not available - attempt to refresh?
        return {
          error: 'Authentication required',
          status: 401,
        };
      }
    }
    
    // Prepare request
    const fetchOptions: RequestInit = {
      method: options.method,
      headers,
      credentials: 'include',
      body: options.data ? JSON.stringify(options.data) : undefined,
    };
    
    // Create timeout promise
    const timeout = options.timeout || REQUEST_TIMEOUT;
    const timeoutPromise = new Promise<Response>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timed out after ${timeout}ms`));
      }, timeout);
    });
    
    try {
      // Execute request with timeout
      const fetchPromise = fetch(`${API_URL}${url}`, fetchOptions);
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      // Handle 401 Unauthorized - attempt token refresh if not already refreshing
      if (response.status === 401 && requiresAuth && !isRefreshingToken) {
        console.log('Request unauthorized, attempting token refresh...');
        
        isRefreshingToken = true;
        
        try {
          // Queue this request for retry after token refresh
          const retryPromise = new Promise<Response>((resolve) => {
            requestQueue.push(async () => {
              const newToken = localStorage.getItem('token');
              
              if (newToken) {
                headers['Authorization'] = `Bearer ${newToken}`;
                this.accessToken = newToken;
                
                const retryResponse = await fetch(`${API_URL}${url}`, {
                  ...fetchOptions,
                  headers: {
                    ...fetchOptions.headers,
                    'Authorization': `Bearer ${newToken}`,
                  },
                });
                
                resolve(retryResponse);
              } else {
                // No token after refresh, still return the original 401
                resolve(response);
              }
            });
          });
          
          // Attempt refresh token
          await this.refreshTokenRequest();
          
          // Get the retried response after token refresh
          const refreshedResponse = await retryPromise;
          return this.processResponse<T>(refreshedResponse);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          this.clearAuthData();
          
          return {
            error: 'Session expired. Please log in again.',
            status: 401,
          };
        } finally {
          isRefreshingToken = false;
        }
      }
      
      // Process normal response
      return this.processResponse<T>(response);
    } catch (error) {
      console.error('Fetch error:', error);
      
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }
  
  // Method to specifically handle token refresh
  private async refreshTokenRequest(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const csrfToken = getCsrfToken();
    const fingerprint = localStorage.getItem('fingerprint') || '';
    
    const response = await fetch(`${API_URL}/v1/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
      },
      body: JSON.stringify({ refreshToken, fingerprint }),
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.accessToken) {
        // Update stored tokens
        localStorage.setItem('token', data.accessToken);
        this.accessToken = data.accessToken;
        
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        
        // Process any queued requests with new token
        processQueue(data.accessToken);
        return true;
      }
    }
    
    this.clearAuthData();
    throw new Error('Token refresh failed');
  }
  
  // Process a response into our standard ApiResponse format
  private async processResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      if (response.status === 204) {
        return { status: 204 };
      }
      
      // Check if the response has JSON content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        if (response.ok) {
          return {
            data: data.data || data as T,
            status: response.status,
          };
        }
        
        return {
          error: data.message || data.error || 'An error occurred',
          status: response.status,
          details: data.errors || data.details || null,
        };
      } else {
        if (response.ok) {
          return { status: response.status };
        } else {
          return {
            error: `Server returned ${response.status} ${response.statusText}`,
            status: response.status,
          };
        }
      }
    } catch (error) {
      console.error('Error processing response:', error);
      return {
        error: 'Failed to process response',
        status: response.status || 500,
      };
    }
  }
  
  // Clear all auth data
  private clearAuthData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('fingerprint');
      this.accessToken = null;
    }
  }
  
  // Convenience methods for common HTTP methods
  async get<T>(url: string, params?: Record<string, any>, options: Partial<FetchOptions> = {}): Promise<ApiResponse<T>> {
    let queryUrl = url;
    
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const queryString = queryParams.toString();
      if (queryString) {
        queryUrl = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
      }
    }
    
    return this.fetch<T>(queryUrl, {
      method: 'GET',
      ...options,
    });
  }
  
  async post<T>(url: string, data?: any, options: Partial<FetchOptions> = {}): Promise<ApiResponse<T>> {
    return this.fetch<T>(url, {
      method: 'POST',
      data,
      ...options,
    });
  }
  
  async put<T>(url: string, data?: any, options: Partial<FetchOptions> = {}): Promise<ApiResponse<T>> {
    return this.fetch<T>(url, {
      method: 'PUT',
      data,
      ...options,
    });
  }
  
  async patch<T>(url: string, data?: any, options: Partial<FetchOptions> = {}): Promise<ApiResponse<T>> {
    return this.fetch<T>(url, {
      method: 'PATCH',
      data,
      ...options,
    });
  }
  
  async delete<T>(url: string, options: Partial<FetchOptions> = {}): Promise<ApiResponse<T>> {
    return this.fetch<T>(url, {
      method: 'DELETE',
      ...options,
    });
  }
  
  // Set token manually (useful when the auth context updates the token)
  setToken(token: string | null): void {
    this.accessToken = token;
  }
}

// Create and export a singleton instance
export const fetchClient = new FetchClient();

// Hook to create fetchClient with current auth context
export function useFetchClient() {
  const auth = useAuth();
  
  // Update the token whenever it changes in the auth context
  useEffect(() => {
    const token = auth.getAccessToken();
    fetchClient.setToken(token);
  }, [auth]);
  
  return fetchClient;
} 