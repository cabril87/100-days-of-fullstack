// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5211/api';

// Type for API error responses
export type ApiError = {
  statusCode: number;
  message: string;
  errors?: string[];
};

// User DTO type matching the backend
export type UserDTO = {
  id: number;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  createdAt: string;
};

// Tokens response DTO matching the backend
export type TokensResponseDTO = {
  accessToken: string;
  refreshToken: string;
  expiration: string;
  user: UserDTO;
};

// Generic API response type based on your C# ApiResponse<T> structure
export type ApiResponse<T> = {
  statusCode: number;
  succeeded: boolean;
  message: string | null;
  errors: string[] | null;
  data: T | null;
};

// API options type for our fetch wrapper
type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  requiresAuth?: boolean;
};

// Main API fetch function
export async function apiFetch<T>(
  endpoint: string, 
  options: ApiOptions = {}
): Promise<T | ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    requiresAuth = true,
  } = options;

  // Prepare headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add auth token if required and available
  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Prepare the request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include',
  };

  // Add body if present
  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}/${endpoint}`, requestOptions);
    
    // For 404 errors, throw immediately to avoid JSON parsing errors
    if (response.status === 404) {
      throw {
        statusCode: 404,
        message: `Endpoint not found: ${endpoint}`,
      } as ApiError;
    }
    
    const data = await response.json();
    
    // Debug logging
    console.log(`API Response for ${endpoint}:`, data);
    
    if (!response.ok) {
      throw {
        statusCode: response.status,
        message: data.message || 'An error occurred',
        errors: data.errors,
      } as ApiError;
    }

    // Check if response is API wrapped format
    if (data.hasOwnProperty('succeeded') && data.hasOwnProperty('data')) {
      return data as ApiResponse<T>;
    }
    
    // Otherwise return direct response data
    return data as T;
  } catch (error) {
    if ((error as ApiError).statusCode) {
      throw error;
    }
    throw {
      statusCode: 500,
      message: (error as Error).message || 'Network error',
    } as ApiError;
  }
}

// API endpoint functions
export const api = {
  // Auth endpoints
  auth: {
    login: (credentials: { email: string; password: string }) => 
      apiFetch<TokensResponseDTO>('Auth/login', { method: 'POST', body: credentials, requiresAuth: false }),
    register: (userData: { email: string; username: string; password: string; confirmPassword: string }) => 
      apiFetch<TokensResponseDTO>('Auth/register', { method: 'POST', body: userData, requiresAuth: false }),
    refreshToken: () => 
      apiFetch<TokensResponseDTO>('Auth/refresh-token', { method: 'POST' }),
    logout: () => 
      apiFetch('Auth/logout', { method: 'POST' }),
  },

  // Task endpoints
  tasks: {
    getAll: () => apiFetch('TaskItems'),
    getById: (id: number) => apiFetch(`TaskItems/${id}`),
    create: (task: any) => apiFetch('TaskItems', { method: 'POST', body: task }),
    update: (id: number, task: any) => apiFetch(`TaskItems/${id}`, { method: 'PUT', body: task }),
    delete: (id: number) => apiFetch(`TaskItems/${id}`, { method: 'DELETE' }),
  },

  // Category endpoints
  categories: {
    getAll: () => apiFetch('Categories'),
    create: (category: any) => apiFetch('Categories', { method: 'POST', body: category }),
    update: (id: number, category: any) => apiFetch(`Categories/${id}`, { method: 'PUT', body: category }),
    delete: (id: number) => apiFetch(`Categories/${id}`, { method: 'DELETE' }),
  },

  // Statistics endpoints
  statistics: {
    getAll: () => apiFetch('Statistics'),
    getProductivitySummary: () => apiFetch('Statistics/productivity-summary'),
    getCompletionRate: () => apiFetch('Statistics/completion-rate'),
    getTasksByStatusDistribution: () => apiFetch('Statistics/status-distribution'),
  },
}; 