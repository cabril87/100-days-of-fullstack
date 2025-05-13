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
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || sessionStorage.getItem('token') || null;
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
    useFormData?: boolean
  } = {}
): Promise<ApiResponse<T>> {
  // Set default options
  const {
    requiresAuth = true,
    useMethodOverride = true,
    usePascalCase = true,
    useFormData = false
  } = options;
  
  try {
    // Make sure the endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Build full URL
    let url = `${API_URL}${normalizedEndpoint}`;
    console.log(`[apiClient] Request to ${method} ${url}`);
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };
    
    // Add authorization if needed and available
    if (requiresAuth) {
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      }
    }
    
    // Add CSRF token if available
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-TOKEN'] = csrfToken;
    }
    
    // Prepare request body
    let body: string | FormData | undefined;
    if (method !== 'GET' && data) {
      // Process data based on configuration
      let processedData = data;
      
      // Convert to PascalCase for .NET backends if requested
      if (usePascalCase) {
        processedData = toPascalCase(data);
      }
      
      // Either use FormData or JSON
      if (useFormData) {
        const formData = new FormData();
        Object.entries(processedData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        body = formData;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(processedData);
      }
    }
    
    // Apply method override if needed (for PUT, PATCH, DELETE)
    let actualMethod = method;
    if (useMethodOverride && method !== 'GET' && method !== 'POST') {
      const override = applyMethodOverride(url, method, headers);
      url = override.url;
      Object.assign(headers, override.headers);
      actualMethod = 'POST'; // Use POST for all non-GET methods with override
    }
    
    // Log request details for debugging
    console.log(`[apiClient] ${actualMethod} request to ${url}`, {
      headers: { ...headers, Authorization: headers.Authorization ? '[REDACTED]' : undefined },
      body: typeof body === 'string' ? JSON.parse(body) : body instanceof FormData ? '[FormData]' : body
    });
    
    // Make the request
    const response = await fetch(url, {
      method: actualMethod,
      headers,
      body,
      credentials: 'include'
    });
    
    // Log the response status
    console.log(`[apiClient] Response status: ${response.status} ${response.statusText}`);
    
    // Handle non-JSON or no-content responses
    if (response.status === 204) {
      return { status: 204 };
    }
    
    // Try to parse the response as JSON
    try {
      const text = await response.text();
      
      // Handle empty responses
      if (!text) {
        return response.ok 
          ? { status: response.status } 
          : { error: `Empty response with status ${response.status}`, status: response.status };
      }
      
      // Parse JSON
      const json = JSON.parse(text);
      
      // Successful response
      if (response.ok) {
        return {
          // Unwrap data if needed (handle both data: {...} and direct response formats)
          data: json.data || json as T,
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
      
      return response.ok
        ? { status: response.status }
        : { 
            error: `Error parsing response: ${response.statusText}`,
            status: response.status
          };
    }
  } catch (error) {
    // Handle network errors
    console.error('[apiClient] Request failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0
    };
  }
}

// Export specific HTTP method functions
export const apiClient = {
  get: <T>(endpoint: string, options = {}) => 
    apiRequest<T>(endpoint, 'GET', undefined, options),
    
  post: <T>(endpoint: string, data?: any, options = {}) => 
    apiRequest<T>(endpoint, 'POST', data, options),
    
  put: <T>(endpoint: string, data?: any, options = {}) => 
    apiRequest<T>(endpoint, 'PUT', data, options),
    
  patch: <T>(endpoint: string, data?: any, options = {}) => 
    apiRequest<T>(endpoint, 'PATCH', data, options),
    
  delete: <T>(endpoint: string, options = {}) => 
    apiRequest<T>(endpoint, 'DELETE', undefined, options),
    
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