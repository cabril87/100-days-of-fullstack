/**
 * API Method Override Utility
 * 
 * This module provides utilities to handle HTTP method overrides for APIs that
 * may not support certain HTTP methods directly (like PUT, PATCH, DELETE)
 */

/**
 * Add method override headers and/or query parameters to a request
 * @param url The base URL to modify
 * @param method The original HTTP method
 * @param headers The headers object to modify
 * @returns Modified URL and headers
 */
export function applyMethodOverride(
  url: string,
  method: string,
  headers: Record<string, string>
): { url: string, headers: Record<string, string> } {
  // Clone the headers to avoid modifying the original
  const newHeaders = { ...headers };
  let newUrl = url;
  
  // Only apply overrides for non-standard methods
  if (['PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    // Add X-HTTP-Method-Override header (works with many servers)
    newHeaders['X-HTTP-Method-Override'] = method.toUpperCase();
    
    // Add _method query parameter (works with Laravel, Rails, etc.)
    const separator = url.includes('?') ? '&' : '?';
    newUrl = `${url}${separator}_method=${method.toUpperCase()}`;
  }
  
  return { url: newUrl, headers: newHeaders };
}

/**
 * Convert object keys from camelCase to PascalCase (for .NET backends)
 * @param data The data object to convert
 * @returns A new object with PascalCase keys
 */
export function toPascalCase(data: Record<string, any>): Record<string, any> {
  if (!data || typeof data !== 'object') return data;
  
  const result: Record<string, any> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    // Skip undefined/null values
    if (value === undefined || value === null) return;
    
    // Convert key to PascalCase
    const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
    
    // Handle nested objects
    if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[pascalKey] = toPascalCase(value);
    } else {
      result[pascalKey] = value;
    }
  });
  
  return result;
}

export default {
  applyMethodOverride,
  toPascalCase
}; 