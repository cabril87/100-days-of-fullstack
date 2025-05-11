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
  } catch (_error) {
    console.error('Error fetching CSRF token:', _error);
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
  } catch (_error) {
    console.error('Error processing response:', _error);
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

export const apiService = {

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
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
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });
      
      return processResponse<T>(response);
    } catch (_error) {
      return {
        error: 'Network error or service unavailable',
        status: 0
      };
    }
  },
  

  async post<T>(endpoint: string, data: any, requiresAuth = true): Promise<ApiResponse<T>> {
    try {
      // First try to get a fresh CSRF token
      await fetchCsrfToken();
      
      // Get auth token from storage (if available)
      let authToken = '';
      if (typeof window !== 'undefined') {
        authToken = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
        
        // Validate token by checking expiration
        if (authToken) {
          try {
            const parts = authToken.replace('Bearer ', '').split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              const expiry = payload.exp ? new Date(payload.exp * 1000) : null;
              
              if (expiry && expiry < new Date()) {
                console.log("Token expired, clearing from storage");
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                authToken = '';
              }
            }
          } catch (e) {
            console.error("Error validating token:", e);
          }
        }
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
      
      // Add CSRF token
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        headers['X-CSRF-TOKEN'] = csrfToken;
      }
      
      // Prepare payload - ensure we're sending clean data
      const payload = JSON.stringify(data);
      
      console.log('API Request:', {
        url: `${API_URL}${endpoint}`,
        method: 'POST',
        headers: { 
          ...headers, 
          Authorization: headers.Authorization ? '[REDACTED]' : undefined 
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
      
      console.log(`API Response status: ${response.status}`);
      
      // Try to read response body for better debugging
      const clonedResponse = response.clone();
      let responseBody = '';
      try {
        responseBody = await clonedResponse.text();
        console.log('Response body:', responseBody);
      } catch (e) {
        console.error('Error reading response body:', e);
      }
      
      // Handle common error cases
      if (response.status === 400) {
        return {
          error: responseBody || 'Bad request',
          status: 400
        };
      }
      
      if (response.status === 401) {
        // Clear invalid token on authentication failure
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        
        return {
          error: 'Authentication failed. Please log in again.',
          status: 401
        };
      }
      
      // Try to parse success responses
      if (response.status >= 200 && response.status < 300 && responseBody) {
        try {
          const parsedData = JSON.parse(responseBody);
          
          // Handle TaskTrackerAPI's specific response format
          if (parsedData.success && parsedData.data) {
            console.log('Detected TaskTrackerAPI response format with data property');
            return {
              data: parsedData.data,
              status: response.status
            };
          }
          
          // Handle case where data is directly in the response without nesting
          return {
            data: parsedData.data || parsedData,
            status: response.status
          };
        } catch (e) {
          console.error('Error parsing success response:', e);
        }
      }
      
      return processResponse<T>(response);
    } catch (error) {
      console.error('Network error in post:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error or service unavailable',
        status: 0
      };
    }
  },

  async put<T>(endpoint: string, data: any, requiresAuth = true): Promise<ApiResponse<T>> {
    try {
      await fetchCsrfToken();
      
      const csrfToken = getCsrfToken();
      const dataWithToken = {
        ...data,
        csrfToken
      };
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(requiresAuth),
        body: JSON.stringify(dataWithToken),
        credentials: 'include'
      });
      
      return processResponse<T>(response);
    } catch (_error) {
      return {
        error: 'Network error or service unavailable',
        status: 0
      };
    }
  },
  

  async patch<T>(endpoint: string, data: any, requiresAuth = true): Promise<ApiResponse<T>> {
    try {
      await fetchCsrfToken();
      
      const csrfToken = getCsrfToken();
      const dataWithToken = {
        ...data,
        csrfToken
      };
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PATCH',
        headers: getHeaders(requiresAuth),
        body: JSON.stringify(dataWithToken),
        credentials: 'include'
      });
      
      return processResponse<T>(response);
    } catch (_error) {
      return {
        error: 'Network error or service unavailable',
        status: 0
      };
    }
  },
  
 
  async delete<T>(endpoint: string, requiresAuth = true): Promise<ApiResponse<T>> {
    try {
      await fetchCsrfToken();
      
      // Check if token is expired (don't interrupt request if not required)
      if (requiresAuth && isTokenExpiredOrExpiringSoon()) {
        console.log('Auth token expired or expiring soon before DELETE request');
        return {
          error: 'Authentication token expired. Please refresh the page and try again.',
          status: 401
        };
      }
      
      const csrfToken = getCsrfToken();
      const body = { csrfToken };
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(requiresAuth),
        body: JSON.stringify(body),
        credentials: 'include'
      });
      
      return processResponse<T>(response);
    } catch (_error) {
      return {
        error: 'Network error or service unavailable',
        status: 0
      };
    }
  }
}; 