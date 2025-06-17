/*
 * API Client Configuration
 * Copyright (c) 2025 Carlos Abril Jr
 */

// ================================
// API CONFIGURATION
// ================================

// Base API configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  VERSION: 'v1', // Note: v1 may not be needed for hubs in the future
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// API endpoints structure based on backend routing
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    BASE: `/${API_CONFIG.VERSION}/auth`,
    REGISTER: '/register',
    LOGIN: '/login',
    LOGOUT: '/logout',
    REFRESH_TOKEN: '/refresh-token',
    PROFILE: '/profile',
    CHANGE_PASSWORD: '/change-password',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    USERS: '/users',
    // MFA endpoints
    MFA_SETUP: '/mfa/setup',
    MFA_VERIFY_SETUP: '/mfa/verify-setup',
    MFA_VERIFY: '/mfa/verify',
    MFA_DISABLE: '/mfa/disable',
    MFA_BACKUP_CODES: '/mfa/backup-codes',
    MFA_STATUS: '/mfa/status',
    MFA_BACKUP_CODE: '/mfa/backup-code',
  },
  
  // Task endpoints (future implementation)
  TASKS: {
    BASE: `/${API_CONFIG.VERSION}/taskitems`,
    BY_ID: (id: number) => `/${id}`,
    BY_STATUS: (status: string) => `/status/${status}`,
    BY_CATEGORY: (categoryId: number) => `/category/${categoryId}`,
    OVERDUE: '/overdue',
    DUE_TODAY: '/due-today',
    DUE_THIS_WEEK: '/due-this-week',
    COMPLETE_BATCH: '/complete-batch',
  },
  
  // Family endpoints
  FAMILY: {
    BASE: `/${API_CONFIG.VERSION}/family`,
    CURRENT: '/current',
    BY_ID: (id: number) => `/${id}`,
    MEMBERS: (id: number) => `/${id}/members`,
    LEAVE: '/leave',
    STATS: (id: number) => `/${id}/stats`,
    CHECK_EMAIL: (email: string) => `/check-email/${encodeURIComponent(email)}`,
    ROLES: '/roles',
  },
  
  // Invitation endpoints
  INVITATIONS: {
    BASE: `/${API_CONFIG.VERSION}/invitations`,
    SENT: '/sent',
    PENDING: '/pending',
    ACCEPT: '/accept',
    DECLINE: '/decline',
    BY_TOKEN: (token: string) => `/token/${token}`,
    CANCEL: (id: number) => `/${id}/cancel`,
    RESEND: (id: number) => `/${id}/resend`,
    BULK: '/bulk',
    BULK_CANCEL: '/bulk-cancel',
    CHECK_PENDING: (email: string) => `/check-pending/${encodeURIComponent(email)}`,
  },
  
  // Parental control endpoints
  PARENTAL_CONTROLS: {
    BASE: `/${API_CONFIG.VERSION}/parental-controls`,
    BY_CHILD: (childId: number) => `/child/${childId}`,
    BY_PARENT: '/parent',
    BY_ID: (childId: number) => `/${childId}`,
    SUMMARY: (childId: number) => `/${childId}/summary`,
    PERMISSION_REQUESTS: '/permission-requests',
    PENDING_REQUESTS: '/permission-requests/pending',
    RESPOND: (requestId: number) => `/permission-requests/${requestId}/respond`,
    BULK_RESPOND: '/permission-requests/bulk-respond',
    SCREEN_TIME: (childId: number) => `/${childId}/screen-time`,
    REMAINING_TIME: (childId: number) => `/${childId}/screen-time/remaining`,
    ALLOWED_HOURS: (childId: number) => `/${childId}/allowed-hours/check`,
    VALIDATE_PERMISSION: (childId: number) => `/validate-permission/${childId}`,
  },
  
  // Gamification endpoints (future implementation)
  GAMIFICATION: {
    BASE: `/${API_CONFIG.VERSION}/gamification`,
    PROGRESS: '/progress',
    POINTS: '/points',
    ACHIEVEMENTS: '/achievements',
    BADGES: '/badges',
    LEADERBOARD: '/leaderboard',
    CHALLENGES: '/challenges',
    REWARDS: '/rewards',
    STATS: '/stats',
  },
  
  // Health and system endpoints
  HEALTH: {
    BASE: `/${API_CONFIG.VERSION}/health`,
    DETAILS: '/details',
    DATABASE: '/database',
  },
} as const;

// SignalR Hub endpoints - Consolidated architecture (2 hubs instead of 7)
export const HUB_ENDPOINTS = {
  // Main hub handles: tasks, notifications, gamification, boards, templates
  MAIN: '/hubs/main',
  // Calendar hub handles: calendar events, availability, focus mode
  CALENDAR: '/hubs/calendar',
  
  // Legacy endpoints - DEPRECATED (kept for backward compatibility during migration)
  // TODO: Remove these after frontend migration is complete
  TASKS: '/hubs/main', // Redirects to main hub
  NOTIFICATIONS: '/hubs/main', // Redirects to main hub
  GAMIFICATION: '/hubs/main', // Redirects to main hub
  ENHANCED_BOARD: '/hubs/main', // Redirects to main hub
  TEMPLATE_MARKETPLACE: '/hubs/main', // Redirects to main hub
} as const;

// ================================
// HTTP CLIENT UTILITIES
// ================================

// Standard headers for API requests
export const getDefaultHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// Headers with authentication - Updated for cookie-based auth
export const getAuthHeaders = (): HeadersInit => {
  // Cookies are automatically included with credentials: 'include'
  // No need to manually add Authorization header since backend reads HTTP-only cookies
  
  const headers = {
    ...getDefaultHeaders(),
  } as Record<string, string>;
  
  // Add CSRF header for state-changing operations (DELETE, POST, PUT)
  // This helps with CSRF protection even in development
  const csrfToken = getCsrfTokenFromCookie();
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  
  return headers;
};

// Helper function to extract CSRF token from cookies
const getCsrfTokenFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'XSRF-TOKEN' || name === 'csrf_token') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

// Request timeout wrapper
export const withTimeout = <T>(
  promise: Promise<T>, 
  timeoutMs: number = API_CONFIG.TIMEOUT
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
};

// Retry utility with exponential backoff
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = API_CONFIG.RETRY_ATTEMPTS,
  baseDelay: number = API_CONFIG.RETRY_DELAY
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) break;
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// ================================
// API ERROR HANDLING
// ================================

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
  code?: string;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errors?: Record<string, string[]>,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
  
  static fromResponse(response: Response, data?: ApiErrorResponse): ApiClientError {
    return new ApiClientError(
      data?.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      data?.errors,
      data?.code
    );
  }
}

// ================================
// BASE API CLIENT
// ================================

export class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
  }
  
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: ApiErrorResponse | undefined;
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        }
      } catch {
        // Ignore JSON parsing errors
      }
      
      // Log 404s as debug instead of error (common for new users)
      if (response.status === 404) {
        console.debug(`🔍 Resource not found [404]: ${response.url.split('?')[0]}`);
      } else {
        console.error(`❌ API Error [${response.status}]: ${response.url}`, errorData);
      }
      
      throw ApiClientError.fromResponse(response, errorData);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const jsonResponse = await response.json();
      
      // Check if response has the API wrapper format with data property
      if (jsonResponse && typeof jsonResponse === 'object' && 'data' in jsonResponse && 'success' in jsonResponse) {
        // Extract the data from the API wrapper
        return jsonResponse.data as T;
      }
      
      // Return the response as-is if it's not in the wrapper format
      return jsonResponse as T;
    }
    
    // Return empty object for successful responses with no content
    return {} as T;
  }
  
  async get<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
    // Add cache-busting timestamp to prevent stale data issues
    const separator = endpoint.includes('?') ? '&' : '?';
    const cacheBuster = `_t=${Date.now()}`;
    const url = `${this.baseUrl}${endpoint}${separator}${cacheBuster}`;
    
    return withTimeout(
      withRetry(async () => {
        const response = await fetch(url, {
          method: 'GET',
          headers: { 
            ...getAuthHeaders(), 
            ...headers,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          credentials: 'include', // Include cookies for HTTP-only cookie support
        });
        
        return this.handleResponse<T>(response);
      })
    );
  }
  
  async post<T>(endpoint: string, body?: unknown, headers?: HeadersInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Debug logging for POST requests
    console.log('🌐 ApiClient POST:', {
      endpoint,
      url,
      baseUrl: this.baseUrl,
      method: 'POST',
      hasBody: !!body,
      bodyPreview: body ? JSON.stringify(body).substring(0, 200) : 'no body'
    });
    
    return withTimeout(
      withRetry(async () => {
        const response = await fetch(url, {
          method: 'POST',
          headers: { ...getAuthHeaders(), ...headers },
          body: body ? JSON.stringify(body) : undefined,
          credentials: 'include', // Include cookies for HTTP-only cookie support
        });
        
        console.log('📡 ApiClient POST response:', {
          url,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        return this.handleResponse<T>(response);
      })
    );
  }
  
  async put<T>(endpoint: string, body?: unknown, headers?: HeadersInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Determine content type and body format
    const mergedHeaders = { ...getAuthHeaders(), ...headers } as Record<string, string>;
    const contentType = mergedHeaders['Content-Type'] || mergedHeaders['content-type'];
    
    let requestBody: string | undefined;
    if (body !== undefined) {
      if (contentType === 'text/plain') {
        requestBody = String(body);
      } else {
        requestBody = JSON.stringify(body);
      }
    }
    
    // Debug logging for PUT requests
    console.log('🌐 ApiClient PUT:', {
      endpoint,
      url,
      baseUrl: this.baseUrl,
      method: 'PUT',
      hasBody: !!body,
      contentType,
      bodyPreview: requestBody ? requestBody.substring(0, 200) : 'no body'
    });
    
    return withTimeout(
      withRetry(async () => {
        const response = await fetch(url, {
          method: 'PUT',
          headers: mergedHeaders,
          body: requestBody,
          credentials: 'include', // Include cookies for HTTP-only cookie support
        });
        
        console.log('📡 ApiClient PUT response:', {
          url,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        return this.handleResponse<T>(response);
      })
    );
  }
  
  async delete<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    return withTimeout(
      withRetry(async () => {
        const response = await fetch(url, {
          method: 'DELETE',
          headers: { ...getAuthHeaders(), ...headers },
          credentials: 'include', // Include cookies for HTTP-only cookie support
        });
        
        return this.handleResponse<T>(response);
      })
    );
  }
}

// ================================
// SINGLETON INSTANCE
// ================================

export const apiClient = new ApiClient();

// ================================
// UTILITY FUNCTIONS
// ================================

// Build URL with query parameters
export const buildUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  if (!params) return endpoint;
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });
  
  return `${endpoint}?${searchParams.toString()}`;
};

// Check if error is a specific HTTP status
export const isApiError = (error: unknown, status?: number): error is ApiClientError => {
  return error instanceof ApiClientError && (status === undefined || error.statusCode === status);
};

// Extract validation errors from API error
export const getValidationErrors = (error: unknown): Record<string, string[]> => {
  if (error instanceof ApiClientError && error.errors) {
    return error.errors;
  }
  return {};
}; 