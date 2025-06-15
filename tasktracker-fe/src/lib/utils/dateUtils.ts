/**
 * 🕐 COMPREHENSIVE TIMEZONE UTILITIES FOR TASKTRACKER
 * 
 * This module provides enterprise-grade timezone handling between Docker backend (UTC) 
 * and frontend (user's local timezone). Use these utilities consistently across the app.
 * 
 * PROBLEM SOLVED: Backend sends UTC timestamps without 'Z' suffix (e.g., '2025-06-14T13:18:50.792277')
 * JavaScript interprets these as local time instead of UTC, causing 4-hour timezone errors.
 * 
 * SOLUTION: Enhanced timezone detection and forced UTC interpretation with 'Z' suffix.
 */

/**
 * 🎯 MAIN FUNCTION: Converts backend date to local timezone
 * 
 * Use this for ALL date parsing from backend APIs
 * Handles: strings, Date objects, null/undefined
 * 
 * @example
 * const createdDate = parseBackendDate(task.createdAt);
 * const dueDate = parseBackendDate(task.dueDate);
 */
export function parseBackendDate(dateInput: string | Date | undefined | null): Date | null {
  if (!dateInput) return null;
  
  try {
    let date: Date;
    
    if (typeof dateInput === 'string') {
      const dateStr = dateInput.trim();
      
      // Enhanced timezone detection (avoids false positives from date hyphens)
      const hasTimezone = dateStr.endsWith('Z') || 
                          dateStr.match(/[+-]\d{2}:?\d{2}$/) !== null; // Matches +05:00, -04:00, +0500, -0400
      
      if (!hasTimezone) {
        // Backend in Docker stores UTC timestamps without 'Z' suffix
        // Force interpretation as UTC by adding 'Z'
        const utcDateString = dateStr + 'Z';
        const withoutZ = new Date(dateStr);
        const withZ = new Date(utcDateString);
        
        // Timezone conversion: Backend UTC timestamp → Local timezone
        
        date = withZ; // Use UTC interpretation
      } else {
        date = new Date(dateStr);
      }
    } else {
      date = dateInput;
    }
    
    // Validate the date
    if (isNaN(date.getTime())) {
      console.error('❌ Invalid date:', dateInput);
      return null;
    }
    
    return date;
  } catch (error) {
    console.error('❌ Error parsing backend date:', error, dateInput);
    return null;
  }
}

/**
 * 🎨 DISPLAY FUNCTION: Smart date formatting with relative/absolute display
 * 
 * Use this for ALL date display in UI components
 * Automatically shows "X minutes ago" for recent dates, full dates for older ones
 * 
 * @example
 * <span>{formatDisplayDate(parseBackendDate(task.createdAt))}</span>
 * <span>{formatDisplayDate(parseBackendDate(task.dueDate), { showRelativeForRecent: false })}</span>
 */
export function formatDisplayDate(date: Date | null, options?: {
  showRelativeForRecent?: boolean;
  maxRelativeDays?: number;
}): string {
  if (!date) return '-';
  
  const { showRelativeForRecent = true, maxRelativeDays = 30 } = options || {};
  
  if (!showRelativeForRecent) {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  // Handle future dates or very old dates - show actual date
  if (diffInMs < 0 || diffInDays > maxRelativeDays) {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } else if (diffInMinutes < 1) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  } else {
    // 24 hours or more - show actual date and time
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}

/**
 * 📤 BACKEND FUNCTION: Converts local date to UTC for backend
 * 
 * Use this when sending dates TO the backend
 * 
 * @example
 * const taskData = {
 *   dueDate: formatDateForBackend(selectedDate)
 * };
 */
export function formatDateForBackend(date: Date): string {
  return date.toISOString();
}

/**
 * 🌍 INFO FUNCTION: Gets user's timezone information
 * 
 * Use this for debugging or displaying timezone info to users
 */
export function getUserTimezone() {
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    offset: new Date().getTimezoneOffset(),
    offsetHours: new Date().getTimezoneOffset() / 60
  };
}

/**
 * 🔧 UTILITY FUNCTIONS: Additional date helpers
 */

/**
 * Formats date for form inputs (YYYY-MM-DD format)
 */
export function formatDateForInput(date: Date | null): string {
  if (!date) return '';
  return date.toISOString().split('T')[0];
}

/**
 * Formats time for form inputs (HH:MM format)
 */
export function formatTimeForInput(date: Date | null): string {
  if (!date) return '';
  return date.toTimeString().slice(0, 5);
}

/**
 * Combines date and time inputs into a single Date object
 */
export function combineDateAndTime(dateStr: string, timeStr: string): Date | null {
  if (!dateStr) return null;
  
  const combinedStr = timeStr ? `${dateStr}T${timeStr}:00` : `${dateStr}T00:00:00`;
  return new Date(combinedStr);
}

/**
 * Checks if a date is today
 */
export function isToday(date: Date | null): boolean {
  if (!date) return false;
  
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Checks if a date is overdue
 */
export function isOverdue(date: Date | null): boolean {
  if (!date) return false;
  
  const now = new Date();
  return date < now;
}

/**
 * Gets the start of day for a given date
 */
export function getStartOfDay(date: Date): Date {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

/**
 * Gets the end of day for a given date
 */
export function getEndOfDay(date: Date): Date {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}

/**
 * 🚨 QUICK FIX FUNCTION: Use this to quickly fix timezone issues anywhere in the app
 * 
 * If you encounter timezone display issues elsewhere:
 * 1. Import this function: import { quickFixTimezone } from '@/lib/utils/dateUtils';
 * 2. Replace your date parsing: const fixedDate = quickFixTimezone(backendDateString);
 * 3. Use the result for display: <span>{fixedDate}</span>
 * 
 * @example
 * // Before (wrong timezone):
 * <span>{task.createdAt}</span>
 * 
 * // After (correct timezone):
 * <span>{quickFixTimezone(task.createdAt)}</span>
 */
export function quickFixTimezone(backendDateString: string | Date | null | undefined): string {
  const parsedDate = parseBackendDate(backendDateString);
  return formatDisplayDate(parsedDate);
}

/**
 * 🔍 DEBUG FUNCTION: Use for troubleshooting timezone issues
 * 
 * @example
 * debugTimezone('Task Creation', task.createdAt);
 */
export function debugTimezone(label: string, date: Date | string) {
  if (process.env.NODE_ENV !== 'development') return;
  
  const parsedDate = typeof date === 'string' ? parseBackendDate(date) : date;
  if (!parsedDate) return;
  
  console.log(`🕐 ${label} Debug:`, {
    input: date,
    parsed: parsedDate,
    localTime: parsedDate.toLocaleString(),
    utcTime: parsedDate.toUTCString(),
    iso: parsedDate.toISOString(),
    ...getUserTimezone()
  });
}

/**
 * 📋 USAGE EXAMPLES FOR COMMON SCENARIOS:
 * 
 * // 1. Task Lists (most common)
 * const createdDate = parseBackendDate(task.createdAt);
 * <span>{formatDisplayDate(createdDate)}</span>
 * 
 * // 2. Due Dates
 * const dueDate = parseBackendDate(task.dueDate);
 * <span className={isOverdue(dueDate) ? 'text-red-500' : ''}>
 *   {formatDisplayDate(dueDate)}
 * </span>
 * 
 * // 3. Form Inputs
 * <input 
 *   type="date" 
 *   value={formatDateForInput(parseBackendDate(task.dueDate))}
 *   onChange={(e) => setDueDate(combineDateAndTime(e.target.value, ''))}
 * />
 * 
 * // 4. Quick Fix (emergency use)
 * <span>{quickFixTimezone(task.createdAt)}</span>
 * 
 * // 5. Calendar Integration
 * const events = tasks.map(task => ({
 *   title: task.title,
 *   start: parseBackendDate(task.createdAt),
 *   end: parseBackendDate(task.dueDate)
 * }));
 */ 