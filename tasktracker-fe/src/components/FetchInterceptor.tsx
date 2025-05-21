'use client';

import { useEffect } from 'react';

/**
 * FetchInterceptor component to prevent caching issues with family-related API calls
 * This helps ensure we don't see stale data after CRUD operations
 */
export default function FetchInterceptor() {
  useEffect(() => {
    // Store the original fetch function
    const originalFetch = window.fetch;
    
    // Create a new fetch function that intercepts requests
    window.fetch = async function(input, init) {
      // Get the URL from input (which could be a string or Request object)
      const urlString = typeof input === 'string' 
        ? input 
        : input instanceof Request 
          ? input.url 
          : String(input);
      
      // Intercept family-related API calls
      if (urlString.includes('/api/v1/family') || urlString.includes('/family/')) {
        console.log('[DEBUG] Intercepted family API call:', urlString);
        
        // Ensure init object exists
        const updatedInit = init || {};
        
        // Add cache-busting headers
        updatedInit.headers = {
          ...updatedInit.headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        };
        
        // For GET requests, add a timestamp parameter to break cache
        let modifiedInput = input;
        if (!updatedInit.method || updatedInit.method === 'GET') {
          if (typeof input === 'string') {
            const separator = urlString.includes('?') ? '&' : '?';
            const cacheBuster = `_t=${Date.now()}`;
            modifiedInput = urlString + separator + cacheBuster;
            console.log('[DEBUG] Added cache busting parameter to URL:', modifiedInput);
          } else if (input instanceof Request) {
            // For Request objects, we need to create a new Request with the modified URL
            const url = new URL(input.url);
            url.searchParams.append('_t', Date.now().toString());
            modifiedInput = new Request(url.toString(), input);
            console.log('[DEBUG] Added cache busting parameter to Request URL:', url.toString());
          }
        }
        
        // Call the original fetch with our modified parameters
        return originalFetch.call(window, modifiedInput, updatedInit);
      }
      
      // For non-family requests, proceed as normal
      return originalFetch.call(window, input, init);
    };
    
    // Clean up by restoring the original fetch when the component unmounts
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // This component doesn't render anything
  return null;
} 