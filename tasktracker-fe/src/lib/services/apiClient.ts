/**
 * API Client with Request Throttling
 * 
 * A modern API client that includes throttling to prevent 429 errors
 */

import { ApiResponse } from '@/lib/types/api';
import { toPascalCase } from '@/lib/services/apiMethodOverride';
import { apiThrottler } from '@/lib/utils/apiThrottler';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Get CSRF token from cookies
 */
async function getCsrfToken(): Promise<string> {
  try {
    // First try to get from cookies
    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
    
    if (csrfCookie) {
      const rawCsrfToken = csrfCookie.split('=')[1];
      // Properly decode the token from URL encoding
      return rawCsrfToken ? decodeURIComponent(rawCsrfToken) : '';
    }
    
    // If not in cookies, try localStorage
    const localToken = localStorage.getItem('csrfToken');
    if (localToken) {
      return localToken;
    }
    
    // If no token found, try to refresh it
    const { refreshCsrfToken } = await import('../utils/security');
    const newToken = await refreshCsrfToken();
    return newToken || '';
  } catch (error) {
    console.error('[apiClient] Error extracting CSRF token:', error);
    return '';
  }
}

/**
 * Get authentication token from storage
 */
function getAuthToken(options: { suppressAuthError?: boolean } = {}): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try localStorage first
  const localToken = localStorage.getItem('token');
  if (localToken) {
    return localToken;
  }
  
  // Then try sessionStorage
  const sessionToken = sessionStorage.getItem('token');
  if (sessionToken) {
    if (!options.suppressAuthError) {
      console.log('[apiClient] Found token in sessionStorage');
    }
    return sessionToken;
  }
  
  if (!options.suppressAuthError) {
    console.log('[apiClient] No auth token found in storage');
  }
  return null;
}

/**
 * Convert an object to a FormData instance
 */
function formDataFromObject(obj: Record<string, unknown>): FormData {
  const formData = new FormData();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      // Handle File objects
      if (value instanceof File) {
        formData.append(key, value);
      }
      // Handle arrays
      else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, String(item));
        });
      }
      // Handle other values
      else {
        formData.append(key, String(value));
      }
    }
  });
  return formData;
}

/**
 * Convert an object to a query string
 */
function objectToQueryString(obj: Record<string, unknown>): string {
  return Object.entries(obj)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map((item) => `${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`)
          .join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    })
    .join('&');
}

/**
 * Handle API response and convert to ApiResponse format
 */
async function handleApiResponse<T>(response: Response, endpoint?: string): Promise<ApiResponse<T>> {
  // Handle no-content responses
  if (response.status === 204) {
    return { status: 204 };
  }
  
  try {
    const contentType = response.headers.get('content-type');
    
    // If not JSON, return the status
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      
      if (response.ok) {
        return { status: response.status };
      }
      
      // Check if this is an expected 404 for certain endpoints
      const isExpected404 = response.status === 404 && endpoint && (
        endpoint.includes('/focus/current') ||
        endpoint.includes('/family/current-family') ||
        endpoint.includes('/v1/focus/current') ||
        endpoint.includes('/v1/family/current-family')
      );
      
      if (!isExpected404) {
        console.error(`[apiClient] HTTP ${response.status} for ${endpoint}:`, text || response.statusText);
      }
      
      return {
        error: text || response.statusText,
        status: response.status
      };
    }
    
    // Parse JSON response
    const json = await response.json();
    
    // Success response
    if (response.ok) {
      // Check if response is already wrapped
      if (json.data !== undefined) {
        return {
          data: json.data,
          status: response.status
        };
      }
      
      // Otherwise, wrap the response
      return {
        data: json as T,
        status: response.status
      };
    }
    
    // Error response - check if it's an expected 404
    const isExpected404 = response.status === 404 && endpoint && (
      endpoint.includes('/focus/current') ||
      endpoint.includes('/family/current-family') ||
      endpoint.includes('/v1/focus/current') ||
      endpoint.includes('/v1/family/current-family')
    );
    
    if (!isExpected404) {
      console.error(`[apiClient] API Error ${response.status} for ${endpoint}:`, json.message || json.error || 'Unknown error');
    }
    
    return {
      error: json.message || json.error || 'Unknown error',
      details: json.errors || json.details || null,
      status: response.status
    };
  } catch (error) {
    console.error('[apiClient] Error parsing response:', error);
    
    return {
      error: 'Failed to parse response',
      status: response.status
    };
  }
}

/**
 * Generic API request function with throttling and method override support
 */
export async function apiRequest<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  data?: any,
  options: {
    requiresAuth?: boolean,
    useMethodOverride?: boolean,
    usePascalCase?: boolean,
    useFormData?: boolean,
    suppressAuthError?: boolean,
    extraHeaders?: Record<string, string>,
    skipThrottle?: boolean
  } = {}
): Promise<ApiResponse<T>> {
  const throttleKey = `${method}:${endpoint}`;

  // Apply throttling for sensitive endpoints
  const shouldThrottle = !options.skipThrottle && (
    endpoint.includes('/statistics') ||
    endpoint.includes('/analytics') ||
    endpoint.includes('/insights') ||
    method !== 'GET'
  );

  if (shouldThrottle) {
    return apiThrottler.throttledRequest(throttleKey, async () => {
      return makeRequest<T>(endpoint, method, data, options);
    });
  }

  return makeRequest<T>(endpoint, method, data, options);
}

/**
 * Internal function to make the actual request
 */
async function makeRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  data?: any,
  options: {
    requiresAuth?: boolean,
    useMethodOverride?: boolean,
    usePascalCase?: boolean,
    useFormData?: boolean,
    suppressAuthError?: boolean,
    extraHeaders?: Record<string, string>
  } = {}
): Promise<ApiResponse<T>> {
  try {
    // For non-GET requests, refresh the CSRF token first
    if (method !== 'GET') {
      const { refreshCsrfToken } = await import('../utils/security');
      await refreshCsrfToken();
    }
    
    // Get CSRF token for non-GET requests
    let csrfToken = '';
    if (method !== 'GET') {
      csrfToken = await getCsrfToken();
      if (!options.suppressAuthError && csrfToken) {
        console.log('[apiClient] Got CSRF token:', csrfToken);
      }
    }

    // Get auth token - require for all requests except public endpoints
    const authToken = getAuthToken(options);
    if (!authToken) {
      if (!options.suppressAuthError) {
        console.log('[apiClient] No auth token found');
      }
      // For non-GET requests, return 401 immediately
      if (method !== 'GET') {
        return {
          error: 'Authentication required',
          status: 401
        };
      }
    }

    // Prepare headers
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    // Add auth token if available
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
      // Only log auth token addition for non-GET requests to reduce console spam
      if (!options.suppressAuthError && method !== 'GET') {
        console.log('[apiClient] Added auth token to headers');
      }
    }

    // Add CSRF token for non-GET requests
    if (method !== 'GET' && csrfToken) {
      headers['X-CSRF-TOKEN'] = csrfToken;
      headers['X-XSRF-TOKEN'] = csrfToken;
    }

    // Add any extra headers
    if (options.extraHeaders) {
      Object.entries(options.extraHeaders).forEach(([key, value]) => {
        headers[key] = value;
      });
    }

    // Format the data if PascalCase is required (for .NET backend compatibility)
    let formattedData = data;
    if (options.usePascalCase && data) {
      formattedData = toPascalCase(data);
    }

    // Create the request options
    let requestMethod = method;
    let requestUrl = `${API_URL}${endpoint}`;

    // Apply method override if needed
    if (options.useMethodOverride && ['PUT', 'PATCH', 'DELETE'].includes(method)) {
      // Use POST method with override headers
      requestMethod = 'POST';
      headers['X-HTTP-Method-Override'] = method;
      
      // Add _method query parameter
      const separator = requestUrl.includes('?') ? '&' : '?';
      requestUrl = `${requestUrl}${separator}_method=${method}`;
    }

    const requestOptions: RequestInit = {
      method: requestMethod,
      headers,
      credentials: 'include', // Include cookies for CSRF token
    };

    // Add the body for non-GET requests
    if (method !== 'GET' && formattedData !== undefined) {
      requestOptions.body = options.useFormData
        ? formDataFromObject(formattedData)
        : JSON.stringify(formattedData);
    }

    // Build the URL with query parameters for GET requests
    if (method === 'GET' && data) {
      const queryString = objectToQueryString(data);
      requestUrl = `${requestUrl}${requestUrl.includes('?') ? '&' : '?'}${queryString}`;
    }

    // Make the request
    const response = await fetch(requestUrl, requestOptions);

    // Handle the response
    return handleApiResponse<T>(response, endpoint);
  } catch (error) {
    console.error(`[apiClient] Error in ${method} request to ${endpoint}:`, error);
    
    // If it's a 429 error, throw it so throttler can handle retries
    if (error instanceof Error && error.message.includes('429')) {
      throw error;
    }
    
    return {
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      status: 500
    };
  }
}

// Export specific HTTP method functions with throttling
export const apiClient = {
  async get<T = any>(endpoint: string, options: { 
    suppressAuthError?: boolean;
    skipThrottle?: boolean;
  } = {}): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, 'GET', undefined, options);
  },

  async post<T = any>(
    endpoint: string,
    data?: any,
    options: {
      extraHeaders?: Record<string, string>;
      skipThrottle?: boolean;
    } = {}
  ): Promise<ApiResponse<T>> {
    console.log(`[apiClient] POST ${endpoint}`, { data, options });
    
    try {
      const response = await apiRequest<T>(endpoint, 'POST', data, options);
      console.log(`[apiClient] POST ${endpoint} response:`, response);
      return response;
    } catch (error) {
      console.error(`[apiClient] POST ${endpoint} error:`, error);
      throw error;
    }
  },

  async put<T = any>(endpoint: string, data?: any, options: { 
    suppressAuthError?: boolean; 
    usePascalCase?: boolean; 
    useFormData?: boolean; 
    extraHeaders?: Record<string, string>;
    skipThrottle?: boolean;
  } = {}): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, 'PUT', data, options);
  },

  async patch<T = any>(endpoint: string, data?: any, options: { 
    suppressAuthError?: boolean; 
    usePascalCase?: boolean; 
    useFormData?: boolean; 
    extraHeaders?: Record<string, string>;
    skipThrottle?: boolean;
  } = {}): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, 'PATCH', data, options);
  },

  async delete<T = any>(endpoint: string, options: { 
    suppressAuthError?: boolean;
    extraHeaders?: Record<string, string>;
    skipThrottle?: boolean;
  } = {}): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, 'DELETE', undefined, options);
  },
    
  /**
   * Special method just for updating tasks
   */
  updateTask: async <T>(id: number, data: any): Promise<ApiResponse<T>> => {
    // Try multiple approaches to ensure the update goes through
    
    // Approach 1: Use PUT with method override
    console.log('[apiClient] updateTask: Trying PUT with method override');
    const putResult = await apiRequest<T>(
      `/v1/taskitems/${id}`, 
      'PUT',
      data,
      { useMethodOverride: true, usePascalCase: true, skipThrottle: true }
    );
    
    if (putResult.status === 200 || putResult.status === 204) {
      console.log('[apiClient] updateTask: PUT succeeded');
      return putResult;
    }
    
    // Approach 2: Try POST with explicit method override in URL
    console.log('[apiClient] updateTask: Trying POST with explicit method override');
    const postResult = await apiRequest<T>(
      `/v1/taskitems/${id}?_method=PUT`, 
      'POST',
      data,
      { useMethodOverride: false, usePascalCase: true, skipThrottle: true }
    );
    
    if (postResult.status === 200 || postResult.status === 204) {
      console.log('[apiClient] updateTask: POST with method override succeeded');
      return postResult;
    }
    
    // Approach 3: Try FormData which can be more compatible with some backends
    console.log('[apiClient] updateTask: Trying FormData');
    const formDataResult = await apiRequest<T>(
      `/v1/taskitems/${id}`, 
      'PUT',
      data,
      { useFormData: true, usePascalCase: true, skipThrottle: true }
    );
    
    if (formDataResult.status === 200 || formDataResult.status === 204) {
      console.log('[apiClient] updateTask: FormData succeeded');
      return formDataResult;
    }
    
    // All approaches failed, return the last error
    console.log('[apiClient] updateTask: All approaches failed');
    return formDataResult;
  }
};