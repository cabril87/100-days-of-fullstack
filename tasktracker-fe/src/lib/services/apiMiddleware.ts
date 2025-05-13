/**
 * API Middleware
 * 
 * Middleware layer for API requests to handle common pre/post processing.
 */

import { applyMethodOverride, toPascalCase } from '@/lib/services/apiMethodOverride';
import { ApiResponse } from '@/lib/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Common API request middleware that handles:
 * - Method override for PUT/PATCH/DELETE requests
 * - Authentication headers
 * - CSRF tokens
 * - Request/response logging
 */
export async function processApiRequest<T>(
  endpoint: string,
  method: string,
  data?: any,
  requiresAuth: boolean = true
): Promise<ApiResponse<T>> {
  try {
    // Build the full URL
    const url = `${API_URL}${endpoint}`;
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Add authentication if required
    if (requiresAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      }
    }
    
    // Apply method override for PUT/PATCH/DELETE if needed
    const { url: modifiedUrl, headers: modifiedHeaders } = 
      applyMethodOverride(url, method, headers);
    
    // Prepare request options
    const options: RequestInit = {
      method: method === 'GET' ? 'GET' : 'POST', // Use POST for non-GET with method override
      headers: modifiedHeaders,
      credentials: 'include'
    };
    
    // Add request body for non-GET requests
    if (method !== 'GET' && data) {
      // Convert to PascalCase for .NET backends
      const transformedData = toPascalCase(data);
      options.body = JSON.stringify(transformedData);
    }
    
    // Make the request
    console.log(`API ${method} request to ${modifiedUrl}`, { 
      headers: { ...modifiedHeaders, Authorization: '[REDACTED]' },
      data: data ? JSON.stringify(data) : undefined
    });
    
    const response = await fetch(modifiedUrl, options);
    
    // Process the response
    return await processApiResponse<T>(response);
  }
  catch (error) {
    console.error('API request error:', error);
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0
    };
  }
}

/**
 * Process API responses into a consistent format
 */
async function processApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  // Handle no content responses
  if (response.status === 204) {
    return { status: 204 };
  }
  
  // Try to parse response as JSON
  try {
    // Check if there is content to parse
    const text = await response.text();
    if (!text) {
      return { status: response.status };
    }
    
    // Parse JSON if available
    const data = JSON.parse(text);
    
    if (response.ok) {
      return {
        data: data.data || data as T, // Support both wrapped and unwrapped responses
        status: response.status
      };
    }
    
    // Handle error responses
    return {
      error: data.message || data.error || 'An error occurred',
      status: response.status,
      details: data.errors || data.details || null
    };
  }
  catch (error) {
    // Handle non-JSON or parsing errors
    if (response.ok) {
      return { status: response.status };
    }
    
    return {
      error: `Server returned ${response.status} ${response.statusText}`,
      status: response.status
    };
  }
}

export default {
  processApiRequest
}; 