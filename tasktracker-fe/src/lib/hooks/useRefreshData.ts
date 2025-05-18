import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for refreshing data with debouncing
 * 
 * @param fetchFunction - The function to call to refresh data
 * @param options - Configuration options
 * @returns An object with methods and state for refreshing data
 */
export function useRefreshData<T>(
  fetchFunction: () => Promise<T>,
  options: {
    debounceMs?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    initialData?: T;
  } = {}
) {
  // Default options
  const {
    debounceMs = 300,
    onSuccess,
    onError,
    initialData
  } = options;

  // State
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [version, setVersion] = useState(0);

  // Refs
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const fetchFunctionRef = useRef(fetchFunction);

  // Update fetch function ref when it changes
  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
  }, [fetchFunction]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // The refresh function with debouncing
  const refresh = useCallback(async (force = false) => {
    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Function to execute the fetch
    const executeFetch = async () => {
      if (!isMountedRef.current) return;
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchFunctionRef.current();
        if (!isMountedRef.current) return;
        
        setData(result);
        setVersion(prev => prev + 1);
        
        if (onSuccess) {
          onSuccess(result);
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        
        if (onError) {
          onError(error);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    // If force is true, execute immediately, otherwise debounce
    if (force) {
      await executeFetch();
    } else {
      debounceTimerRef.current = setTimeout(executeFetch, debounceMs);
    }
  }, [debounceMs, onSuccess, onError]);

  // Force refresh immediately
  const forceRefresh = useCallback(async () => {
    return refresh(true);
  }, [refresh]);

  // Reset state
  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setIsLoading(false);
    setVersion(0);
  }, [initialData]);

  return {
    data,
    isLoading,
    error,
    refresh,
    forceRefresh,
    reset,
    version
  };
} 