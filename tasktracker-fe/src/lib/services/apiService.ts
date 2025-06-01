import { ApiResponse } from '@/lib/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getCsrfToken = (): string => {
  console.log('Getting CSRF token from cookies');
  const cookies = document.cookie.split(';');
  console.log('All cookies:', cookies);
  
  const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
  
  if (csrfCookie) {
    const encodedToken = csrfCookie.split('=')[1];
    try {
      const token = decodeURIComponent(encodedToken);
      console.log('Found CSRF token:', token);
      return token;
    } catch (e) {
      console.error('Error decoding CSRF token:', e);
      return encodedToken;
    }
  }
  
  console.warn('No CSRF token found in cookies');
  return '';
};


const fetchCsrfToken = async (): Promise<void> => {
  try {
    console.log('Fetching new CSRF token');
    const response = await fetch(`${API_URL}/v1/auth/csrf`, {
      method: 'GET',
      credentials: 'include', 
    });
    
    console.log('CSRF fetch response status:', response.status);
    
    // Try to get the token from the response
    const csrfToken = response.headers.get('X-CSRF-TOKEN') || '';
    if (csrfToken) {
      console.log('CSRF token from response header:', csrfToken);
    } else {
      // If not in headers, check if it was set as a cookie
      console.log('No CSRF token in response headers, checking cookies');
      
      // This will force cookie processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get the token from cookies (getCsrfToken() logs results internally)
      getCsrfToken();
    }
  } catch {
    console.error('Error fetching CSRF token');
  }
};

const getHeaders = (includeAuth: boolean = true): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-CSRF-TOKEN': getCsrfToken()
  };

  if (includeAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};


const processResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  try {
    if (response.status === 204) {
      return { status: 204 };
    }
    
    // Special handling for 401 Unauthorized
    if (response.status === 401) {
      return {
        error: 'You need to log in to access this resource',
        status: 401
      };
    }

    // Only try to parse JSON if there's content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (response.ok) {
        return {
          data: data.data || data as T, // Support both wrapped and unwrapped responses
          status: response.status
        };
      }
      
      return {
        error: data.message || data.error || 'An error occurred',
        status: response.status,
        details: data.errors || data.details || null
      };
    } else {
      // Handle non-JSON responses
      if (response.ok) {
        return { status: response.status };
      } else {
        return {
          error: `Server returned ${response.status} ${response.statusText}`,
          status: response.status
        };
      }
    }
  } catch {
    console.error('Error processing response');
    return {
      error: 'Failed to process response',
      status: response.status || 500
    };
  }
};

// Function to check if token is expired or will expire soon
const isTokenExpiredOrExpiringSoon = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('token') || '';
  if (!token) return true;
  
  try {
    // Parse JWT payload
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    
    // Check if token has an expiration
    if (!payload.exp) return false;
    
    // Get expiration time and current time
    const expTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    // Check if token is expired or will expire in the next minute
    const willExpireSoon = (expTime - currentTime) < 60000; // 60 seconds
    
    return expTime <= currentTime || willExpireSoon;
  } catch (e) {
    console.error('Error checking token expiration:', e);
    return true; // Consider token expired if we can't check it
  }
};

// Create a variable to track if a token refresh is in progress
let isRefreshingToken = false;
// Queue of pending requests that are waiting for token refresh
let refreshQueue: Array<() => void> = [];

// Process all requests in the queue with the new token
const processRefreshQueue = () => {
  refreshQueue.forEach(callback => callback());
  refreshQueue = [];
};

// Centralized token refresh function
const refreshAuthToken = async (): Promise<boolean> => {
  // Return immediately if already refreshing to prevent multiple refresh calls
  if (isRefreshingToken) {
    return new Promise((resolve) => {
      refreshQueue.push(() => resolve(true));
    });
  }
  
  try {
    console.log('API Service: Refreshing auth token');
    isRefreshingToken = true;
    
    // Get a CSRF token first
    await fetchCsrfToken();
    
    // Call the refresh token endpoint
    const response = await fetch(`${API_URL}/v1/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCsrfToken()
      },
      body: JSON.stringify({
        refreshToken: localStorage.getItem('refreshToken') || ''
      }),
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.accessToken) {
        // Store the new tokens
        localStorage.setItem('token', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        
        console.log('API Service: Token refresh successful');
        processRefreshQueue();
        return true;
      }
    }
    
    // If we get here, refresh failed
    console.error('API Service: Token refresh failed');
    // Clear auth data on refresh failure
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Force the user to log in again - but check if already on login page to prevent loops
    if (typeof window !== 'undefined' && 
        !window.location.pathname.includes('/auth/login')) {
      window.location.href = '/auth/login?expired=true';
    }
    return false;
  } catch (error) {
    console.error('API Service: Error refreshing token', error);
    return false;
  } finally {
    isRefreshingToken = false;
  }
};

export const apiService = {

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      let url = `${API_URL}${endpoint}`;
      
      if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }
      
      // Check if token is expired before making the request
      if (isTokenExpiredOrExpiringSoon()) {
        console.log('Token expired or expiring soon, refreshing before GET request');
        await refreshAuthToken();
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });
      
      // If unauthorized, try to refresh token and retry once
      if (response.status === 401) {
        console.log('Unauthorized response on GET request, attempting token refresh');
        const refreshSuccess = await refreshAuthToken();
        
        if (refreshSuccess) {
          console.log('Token refreshed, retrying GET request');
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include'
          });
          
          return processResponse<T>(retryResponse);
        }
      }
      
      return processResponse<T>(response);
    } catch (_error) {
      return {
        error: 'Network error or service unavailable',
        status: 0
      };
    }
  },
  

  async post<T>(endpoint: string, data: unknown, requiresAuth = true): Promise<ApiResponse<T>> {
    try {
      // First try to get a fresh CSRF token
      await fetchCsrfToken();
      
      // Check if token is expired before making the request
      if (requiresAuth && isTokenExpiredOrExpiringSoon()) {
        console.log('Token expired or expiring soon, refreshing before POST request');
        await refreshAuthToken();
      }
      
      // Get auth token from storage (if available)
      let authToken = '';
      if (typeof window !== 'undefined') {
        authToken = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      }
      
      // Basic headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // Add authorization header if token exists
      if (authToken) {
        headers['Authorization'] = authToken.startsWith('Bearer ') 
          ? authToken 
          : `Bearer ${authToken}`;
      }
      
      // Add CSRF token to both header formats
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        headers['X-CSRF-TOKEN'] = csrfToken;
        headers['X-XSRF-TOKEN'] = csrfToken;
      }
      
      // Prepare payload - ensure we're sending clean data
      const payload = JSON.stringify(data);
      
      console.log(`API POST request to ${API_URL}${endpoint}`, {
        headers: { 
          ...headers, 
          Authorization: headers.Authorization ? '[REDACTED]' : undefined,
          'X-CSRF-TOKEN': csrfToken ? '[PRESENT]' : '[MISSING]'
        },
        data
      });
      
      // Make the request
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: payload,
        credentials: 'include'
      });
      
      console.log(`POST response status: ${response.status}`);
      
      return processResponse<T>(response);
    } catch (error) {
      console.error(`API Service Error (POST ${endpoint}):`, error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 500
      };
    }
  },

  async put<T>(endpoint: string, data?: unknown, requiresAuth = true): Promise<ApiResponse<T>> {
    try {
      // Try to get a fresh CSRF token before making the request
      await fetchCsrfToken();
      
      // Refresh auth token if needed
      if (requiresAuth && isTokenExpiredOrExpiringSoon()) {
        console.log('Token expired or expiring soon, refreshing before PUT request');
        await refreshAuthToken();
      }
      
      // Get auth token from storage
      let authToken = '';
      if (typeof window !== 'undefined') {
        authToken = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      }
      
      // Get CSRF token
      const csrfToken = getCsrfToken();
      
      // Basic headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // Add authorization header if token exists
      if (authToken) {
        headers['Authorization'] = authToken.startsWith('Bearer ') 
          ? authToken 
          : `Bearer ${authToken}`;
      }
      
      // Add CSRF token to both header formats
      if (csrfToken) {
        headers['X-CSRF-TOKEN'] = csrfToken;
        headers['X-XSRF-TOKEN'] = csrfToken;
      }
      
      // Prepare the payload - if no data provided, send empty object
      const payload = data === undefined ? '{}' : JSON.stringify(data);
      
      console.log(`API PUT request to ${API_URL}${endpoint}`, {
        headers: { 
          ...headers, 
          Authorization: headers.Authorization ? '[REDACTED]' : undefined,
          'X-CSRF-TOKEN': csrfToken ? '[PRESENT]' : '[MISSING]'
        },
        data: data || '{}'
      });
      
      // Make the request
      const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'PUT',
          headers,
        body: payload,
          credentials: 'include'
        });
        
      console.log(`PUT response status: ${response.status}`);
      
      return processResponse<T>(response);
    } catch (error) {
      console.error(`API Service Error (PUT ${endpoint}):`, error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 500
      };
    }
  },

  async patch<T>(endpoint: string, data: unknown, requiresAuth = true): Promise<ApiResponse<T>> {
    try {
      // Try to get a fresh CSRF token before making the request
      await fetchCsrfToken();
      
      // Refresh auth token if needed
      if (requiresAuth && isTokenExpiredOrExpiringSoon()) {
        console.log('Token expired or expiring soon, refreshing before PATCH request');
        await refreshAuthToken();
      }
      
      // Get auth token from storage
      let authToken = '';
      if (typeof window !== 'undefined') {
        authToken = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      }
      
      // Get CSRF token
      const csrfToken = getCsrfToken();
      
      // Basic headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // Add authorization header if token exists
      if (authToken) {
        headers['Authorization'] = authToken.startsWith('Bearer ') 
          ? authToken 
          : `Bearer ${authToken}`;
      }
      
      // Add CSRF token to both header formats
      if (csrfToken) {
        headers['X-CSRF-TOKEN'] = csrfToken;
        headers['X-XSRF-TOKEN'] = csrfToken;
      }
      
      // Prepare the payload
      const payload = JSON.stringify(data);
      
      console.log(`API PATCH request to ${API_URL}${endpoint}`, {
        headers: { 
          ...headers, 
          Authorization: headers.Authorization ? '[REDACTED]' : undefined,
          'X-CSRF-TOKEN': csrfToken ? '[PRESENT]' : '[MISSING]'
        },
        data
      });
      
      // Make the request
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PATCH',
        headers,
        body: payload,
        credentials: 'include'
      });
      
      console.log(`PATCH response status: ${response.status}`);
      
      return processResponse<T>(response);
    } catch (error) {
      console.error(`API Service Error (PATCH ${endpoint}):`, error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 500
      };
    }
  },
  
 
  async delete<T>(endpoint: string, requiresAuth = true): Promise<ApiResponse<T>> {
    try {
      // Try to get a fresh CSRF token before making the request
      await fetchCsrfToken();
      
      // Refresh auth token if needed
      if (requiresAuth && isTokenExpiredOrExpiringSoon()) {
        console.log('Token expired or expiring soon, refreshing before DELETE request');
        await refreshAuthToken();
      }
      
      // Get auth token from storage
      let authToken = '';
      if (typeof window !== 'undefined') {
        authToken = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      }
      
      // Get CSRF token
      const csrfToken = getCsrfToken();
      
      // Basic headers
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };
      
      // Add authorization header if token exists
      if (authToken) {
        headers['Authorization'] = authToken.startsWith('Bearer ') 
          ? authToken 
          : `Bearer ${authToken}`;
      }
      
      // Add CSRF token to both header formats
      if (csrfToken) {
        headers['X-CSRF-TOKEN'] = csrfToken;
        headers['X-XSRF-TOKEN'] = csrfToken;
      }
      
      console.log(`API Delete request to ${API_URL}${endpoint}`, { 
        headers: { 
          ...headers, 
          Authorization: headers.Authorization ? '[REDACTED]' : undefined,
          'X-CSRF-TOKEN': csrfToken ? '[PRESENT]' : '[MISSING]'
        } 
      });
      
      // Send the request
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers,
        credentials: 'include'
      });
      
      return processResponse<T>(response);
    } catch (error) {
      console.error(`API Service Error (DELETE ${endpoint}):`, error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 500
      };
    }
  },

  /**
   * Special method to directly update a task - this is a workaround for issues with PUT requests
   * @param id Task ID to update
   * @param data Task data to update
   * @returns API response with the updated task
   */
  async directTaskUpdate<T>(id: number, data: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      // First, refresh the auth token to ensure we're authenticated
      const refreshResponse = await fetch(`${API_URL}/v1/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          refreshToken: localStorage.getItem('refreshToken')
        })
      });
      
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        if (refreshData.accessToken) {
          localStorage.setItem('token', refreshData.accessToken);
          console.log('DirectTaskUpdate: Auth token refreshed');
        }
      }
      
      // Now make the update request
      const url = `${API_URL}/v1/taskitems/${id}`;
      
      // Create the data in PascalCase format
      const updateData: Record<string, unknown> = {};
      
      // Convert from camelCase to PascalCase and handle special cases
      Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        
        // Convert status from string to number
        if (key === 'status') {
          switch(value) {
            case 'todo': updateData.Status = 0; break;
            case 'in-progress': updateData.Status = 1; break;
            case 'done': updateData.Status = 2; break;
          }
        } 
        // Convert priority from string to number
        else if (key === 'priority') {
          switch(value) {
            case 'low': updateData.Priority = 0; break;
            case 'medium': updateData.Priority = 1; break;
            case 'high': updateData.Priority = 2; break;
          }
        }
        // Direct conversion for title and other fields
        else {
          const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
          updateData[pascalKey] = value;
        }
      });
      
      console.log('DirectTaskUpdate: Sending data:', updateData);
      
      // Create FormData (as a fallback in case JSON doesn't work)
      const formData = new FormData();
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      // Get auth token
      const token = localStorage.getItem('token');
      
      // Try POST with _method=PUT first (most compatible)
      const response = await fetch(`${url}?_method=PUT`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-HTTP-Method-Override': 'PUT'
        },
        body: JSON.stringify(updateData),
        credentials: 'include'
      });
      
      console.log('DirectTaskUpdate: Response status:', response.status);
      
      // If JSON POST fails, try FormData
      if (response.status !== 200 && response.status !== 204) {
        console.log('DirectTaskUpdate: JSON POST failed, trying FormData');
        
        const formDataResponse = await fetch(url, {
          method: 'PUT',
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: formData,
          credentials: 'include'
        });
        
        console.log('DirectTaskUpdate: FormData response status:', formDataResponse.status);
        
        if (formDataResponse.ok) {
          return { status: formDataResponse.status };
        }
      } else if (response.ok) {
        return { status: response.status };
      }
      
      return {
        error: 'Failed to update task',
        status: response.status
      };
    } catch (error) {
      console.error('Error in directTaskUpdate:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0
      };
    }
  }
}; 