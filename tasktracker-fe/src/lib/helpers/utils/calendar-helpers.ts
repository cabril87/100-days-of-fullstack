// Calendar Utility Functions
// Following Enterprise Standards - Helper functions for calendar operations
// Copyright (c) 2025 TaskTracker Enterprise

// ============================================================================
// DATE UTILITY FUNCTIONS
// ============================================================================

/**
 * Safely converts various date inputs to a valid Date object
 * Enterprise-grade type safety with proper error handling
 */
export const getSafeDate = (date: Date | string | number | null | undefined): Date => {
  // Check if it's already a valid Date object
  if (date instanceof Date && !isNaN(date.getTime())) {
    return date;
  }
  
  // Try to convert string or number to Date
  if (typeof date === 'string' || typeof date === 'number') {
    const newDate = new Date(date);
    if (!isNaN(newDate.getTime())) {
      return newDate;
    }
  }
  
  // Fallback with warning
  console.warn('Invalid date provided:', typeof date, date, 'Using current date');
  return new Date();
}; 