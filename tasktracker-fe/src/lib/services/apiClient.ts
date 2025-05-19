/**
 * API Client
 * 
 * A modern API client that uses our method override utilities
 * to ensure compatibility with various backends.
 */

import { ApiResponse } from '@/lib/types/api';
import { applyMethodOverride, toPascalCase } from './apiMethodOverride';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Get CSRF token from cookies
 */
function getCsrfToken(): string {
  if (typeof document === 'undefined') return '';
  
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
}

/**
 * Get authentication token from storage
 */
function getAuthToken(options: { suppressAuthError?: boolean } = {}): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try localStorage first
  const localToken = localStorage.getItem('token');
  if (localToken) {
    if (!options.suppressAuthError) {
      console.log('[apiClient] Found token in localStorage');
    }
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
 * Generic API request function with method override support
 */
async function apiRequest<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  data?: any,
  options: {
    requiresAuth?: boolean,
    useMethodOverride?: boolean,
    usePascalCase?: boolean,
    useFormData?: boolean,
    suppressAuthError?: boolean
  } = {}
): Promise<ApiResponse<T>> {
  try {
    // Get CSRF token for non-GET requests
    let csrfToken = '';
    if (method !== 'GET') {
      csrfToken = await getCsrfToken();
      if (!options.suppressAuthError) {
        console.log('[apiClient] Got CSRF token from cookies:', csrfToken);
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
      if (!options.suppressAuthError) {
        console.log('[apiClient] Added auth token to headers');
      }
    }

    // Add CSRF token for non-GET requests
    if (method !== 'GET' && csrfToken) {
      headers['X-CSRF-TOKEN'] = csrfToken;
      if (!options.suppressAuthError) {
        console.log('[apiClient] Added CSRF token to headers:', csrfToken);
      }
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers,
      credentials: 'include'
    };

    // Add body for non-GET requests
    if (method !== 'GET' && data) {
      if (options.useFormData) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          formData.append(key, value as string);
        });
        requestOptions.body = formData;
        // Remove Content-Type header for FormData
        const { 'Content-Type': _, ...restHeaders } = headers;
        requestOptions.headers = restHeaders;
      } else {
        requestOptions.body = JSON.stringify(data);
      }
    }

    // Log the request
    if (!options.suppressAuthError) {
      console.log(`[apiClient] ${method} request to ${API_URL}${endpoint}`, {
        ...requestOptions,
        headers: { ...requestOptions.headers, Authorization: authToken ? 'Bearer [REDACTED]' : undefined }
      });
    }

    // Make the request
    const response = await fetch(`${API_URL}${endpoint}`, requestOptions);

    // Log the response status
    if (!options.suppressAuthError) {
      console.log(`[apiClient] Response status: ${response.status} ${response.statusText}`);
    }

    // Handle authentication errors
    if (response.status === 401) {
      if (!options.suppressAuthError) {
        console.log('[apiClient] Received 401 response');
        
        // Don't automatically clear tokens - instead just warn the user
        // This allows recovering from temporary auth issues without forcing re-login
        console.warn('[apiClient] Authentication failed but tokens preserved for retry');
      }
      
      // Return the error but don't clear tokens
      return {
        error: options.suppressAuthError ? undefined : 'Authentication required. Please try again or re-login if the issue persists.',
        status: 401
      };
    }

    // Handle rate limiting
    if (response.status === 429) {
      return {
        error: 'Too many requests. Please try again later.',
        status: 429
      };
    }

    // Handle 500 server errors with more detailed reporting
    if (response.status === 500) {
      console.error(`[apiClient] Server error (500) occurred when calling ${endpoint}`);
      // Try to extract error details from response if available
      try {
        const errorText = await response.text();
        console.error('[apiClient] Server error details:', errorText);
        
        // Try to parse as JSON if possible
        try {
          const errorJson = JSON.parse(errorText);
          return {
            error: errorJson.message || errorJson.error || 'Server error occurred',
            details: errorJson.errors || errorJson.details || errorJson.stackTrace || null,
            status: 500
          };
        } catch (jsonError) {
          // Not JSON, return the text
          return {
            error: 'Server error occurred',
            details: errorText.substring(0, 200) + (errorText.length > 200 ? '...' : ''),
            status: 500
          };
        }
      } catch (textError) {
        // Couldn't even get the text
        return {
          error: 'Unknown server error',
          status: 500
        };
      }
    }

    // Handle non-JSON or no-content responses
    if (response.status === 204) {
      // Special handling for logout
      if (endpoint === '/v1/auth/logout') {
        console.log('[apiClient] Logout detected, clearing all storage');
        // Clear local storage and session storage
        localStorage.clear();
        sessionStorage.clear();
        // Clear cookies
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.trim().split('=');
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        });
      }
      return { status: 204 };
    }

    // Try to parse the response as JSON
    try {
      const text = await response.text();

      // Handle empty responses
      if (!text) {
        if (response.ok) {
          return { status: response.status };
        }
        return { 
          error: `Empty response with status ${response.status}`,
          status: response.status
        };
      }

      // Parse JSON
      const json = JSON.parse(text);

      // Handle 404 specifically
      if (response.status === 404) {
        return {
          error: json.message || 'Resource not found',
          status: 404
        };
      }

      // Successful response
      if (response.ok) {
        // Check if the response is already in ApiResponse format
        if (json.data !== undefined) {
          return {
            data: json.data as T,
            status: response.status
          };
        }

        // Otherwise, wrap the response in ApiResponse format
        return {
          data: json as T,
          status: response.status
        };
      }

      // Error response
      return {
        error: json.message || json.error || 'Unknown error',
        details: json.errors || json.details || null,
        status: response.status
      };
    } catch (parseError) {
      // Handle non-JSON responses
      console.error('[apiClient] Error parsing response:', parseError);

      if (response.ok) {
        return { status: response.status };
      }

      return {
        error: `Error parsing response: ${response.statusText}`,
        status: response.status
      };
    }
  } catch (error) {
    console.error('[apiClient] Request failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Request failed',
      status: 0
    };
  }
}

// Export specific HTTP method functions
export const apiClient = {
  async get<T = any>(endpoint: string, options: { suppressAuthError?: boolean } = {}): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, 'GET', undefined, options);
  },

  async post<T = any>(endpoint: string, data?: any, options: { suppressAuthError?: boolean; usePascalCase?: boolean; useFormData?: boolean } = {}): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, 'POST', data, options);
  },

  async put<T = any>(endpoint: string, data?: any, options: { suppressAuthError?: boolean; usePascalCase?: boolean; useFormData?: boolean } = {}): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, 'PUT', data, options);
  },

  async patch<T = any>(endpoint: string, data?: any, options: { suppressAuthError?: boolean; usePascalCase?: boolean; useFormData?: boolean } = {}): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, 'PATCH', data, options);
  },

  async delete<T = any>(endpoint: string, options: { suppressAuthError?: boolean } = {}): Promise<ApiResponse<T>> {
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
      { useMethodOverride: true, usePascalCase: true }
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
      { useMethodOverride: false, usePascalCase: true }
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
      { useFormData: true, usePascalCase: true }
    );
    
    if (formDataResult.status === 200 || formDataResult.status === 204) {
      console.log('[apiClient] updateTask: FormData succeeded');
      return formDataResult;
    }
    
    // Approach 4: Try a very direct approach with fetch
    console.log('[apiClient] updateTask: Trying direct fetch approach');
    
    try {
      // Convert data to PascalCase and handle enums
      const directData: Record<string, any> = {};
      Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        
        // Convert status from string to number
        if (key === 'status') {
          const statusMap: Record<string, number> = {
            'todo': 0,
            'in-progress': 1,
            'done': 2
          };
          directData.Status = statusMap[value as string] ?? 0;
        } 
        // Convert priority from string to number
        else if (key === 'priority') {
          const priorityMap: Record<string, number> = {
            'low': 0,
            'medium': 1,
            'high': 2
          };
          directData.Priority = priorityMap[value as string] ?? 1;
        }
        // Direct conversion for title and other fields
        else {
          const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
          directData[pascalKey] = value;
        }
      });
      
      // Add Id property explicitly
      directData.Id = id;
      
      // Get token from localStorage
      const token = localStorage.getItem('token') || '';
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      console.log('[apiClient] updateTask: Making direct fetch to', `${API_URL}/v1/taskitems/${id}`);
      console.log('[apiClient] updateTask: With data', directData);
      
      const response = await fetch(`${API_URL}/v1/taskitems/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/json'
        },
        body: JSON.stringify(directData),
        credentials: 'include'
      });
      
      console.log('[apiClient] updateTask: Direct fetch response status:', response.status);
      
      if (response.ok) {
        return { status: response.status };
      }
    } catch (error) {
      console.error('[apiClient] updateTask: Direct fetch error:', error);
    }
    
    // All approaches failed, return the last error
    console.log('[apiClient] updateTask: All approaches failed');
    return formDataResult;
  }
}; 