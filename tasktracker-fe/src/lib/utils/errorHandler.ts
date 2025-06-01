/**
 * Error Handler Utility
 * Standardized error handling for API operations
 */

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export function handleApiError(error: any, defaultMessage: string): ApiError {
  // If it's already an ApiError, return it
  if (error?.message && typeof error.message === 'string') {
    return {
      message: error.message,
      status: error.status || error.response?.status,
      code: error.code || error.response?.data?.code,
      details: error.details || error.response?.data
    };
  }

  // Handle axios errors
  if (error?.response) {
    return {
      message: error.response.data?.message || defaultMessage,
      status: error.response.status,
      code: error.response.data?.code,
      details: error.response.data
    };
  }

  // Handle network errors
  if (error?.request) {
    return {
      message: 'Network error - please check your connection',
      status: 0,
      code: 'NETWORK_ERROR',
      details: error.request
    };
  }

  // Handle any other errors
  return {
    message: error?.message || defaultMessage,
    status: undefined,
    code: 'UNKNOWN_ERROR',
    details: error
  };
} 