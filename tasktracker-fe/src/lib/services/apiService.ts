
import { ApiResponse } from '@/lib/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getCsrfToken = (): string => {
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
    });
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

    const data = await response.json();
    
    if (response.ok) {
      return {
        data: data as T,
        status: response.status
      };
    }
    
    return {
      error: data.message || 'An error occurred',
      status: response.status,
      details: data.errors || data.details || null
    };
  } catch (_error) {
    return {
      error: 'Failed to process response',
      status: response.status || 500
    };
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
      if (requiresAuth) {
        await fetchCsrfToken();
      }
      
      const csrfToken = getCsrfToken();
      const dataWithToken = {
        ...data,
        csrfToken 
      };
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
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