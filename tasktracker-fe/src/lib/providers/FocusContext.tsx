'use client';

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode,
  useCallback,
  useRef
} from 'react';
import { useToast } from '@/lib/hooks/useToast';
import { useAuth } from '@/lib/providers/AuthContext';
import { focusService } from '@/lib/services/focusService';
import { 
  FocusSession, 
  FocusStatistics, 
  Distraction,
  FocusRequest, 
  DistractionCreate 
} from '@/lib/types/focus';
import { Task } from '@/lib/types/task';

interface FocusContextType {
  // State - ALL FROM API ONLY
  currentSession: FocusSession | null;
  isLoading: boolean;
  error: string | null;
  statistics: FocusStatistics | null;
  history: FocusSession[];
  suggestions: Task[];
  
  // Actions - ALL API CALLS
  startFocusSession: (taskId: number, notes?: string) => Promise<boolean>;
  endFocusSession: (sessionId?: number) => Promise<boolean>;
  pauseFocusSession: (sessionId?: number) => Promise<boolean>;
  resumeFocusSession: (sessionId: number) => Promise<boolean>;
  recordDistraction: (description: string, category: string) => Promise<boolean>;
  
  // Data fetching - ALL API CALLS
  fetchCurrentSession: () => Promise<FocusSession | null>;
  fetchStatistics: (startDate?: Date, endDate?: Date) => Promise<FocusStatistics | null>;
  fetchHistory: () => Promise<FocusSession[]>;
  fetchSuggestions: (count?: number) => Promise<Task[]>;
  fetchSessionDistractions: (sessionId: number) => Promise<Distraction[]>;
  clearError: () => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

// Request deduplication cache (to prevent 429 errors)
interface RequestCache {
  [key: string]: {
    promise: Promise<any>;
    timestamp: number;
  };
}

// Rate limiting tracker (to prevent 429 errors)
interface RateLimitTracker {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

export function FocusProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  // ALL STATE IS FROM API - NO MOCK DATA
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<FocusStatistics | null>(null);
  const [history, setHistory] = useState<FocusSession[]>([]);
  const [suggestions, setSuggestions] = useState<Task[]>([]);

  // Request caching and rate limiting (to prevent 429 errors)
  const requestCacheRef = useRef<RequestCache>({});
  const rateLimitRef = useRef<RateLimitTracker>({});

  // Cache duration (3 minutes)
  const CACHE_DURATION = 3 * 60 * 1000;
  
  // Rate limit settings (max 10 requests per minute per endpoint)
  const RATE_LIMIT_MAX = 10;
  const RATE_LIMIT_WINDOW = 60 * 1000;

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Generate cache key for requests
  const generateCacheKey = useCallback((endpoint: string, params?: any) => {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${endpoint}_${paramStr}`;
  }, []);

  // Check rate limit
  const checkRateLimit = useCallback((endpoint: string): boolean => {
    const now = Date.now();
    const tracker = rateLimitRef.current[endpoint];

    if (!tracker || now > tracker.resetTime) {
      rateLimitRef.current[endpoint] = {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW
      };
      return true;
    }

    if (tracker.count >= RATE_LIMIT_MAX) {
      console.warn(`[FocusContext] Rate limit exceeded for ${endpoint}. Please wait.`);
      return false;
    }

    tracker.count++;
    return true;
  }, []);

  // Get from cache or make request
  const cachedRequest = useCallback(async (
    cacheKey: string,
    requestFn: () => Promise<any>,
    skipCache: boolean = false
  ): Promise<any> => {
    const now = Date.now();
    const cached = requestCacheRef.current[cacheKey];

    // Return cached promise if it's still active
    if (cached && now - cached.timestamp < CACHE_DURATION && !skipCache) {
      console.log(`[FocusContext] Using cached request for ${cacheKey}`);
      return cached.promise;
    }

    // Create new request
    const promise = requestFn();
    requestCacheRef.current[cacheKey] = {
      promise,
      timestamp: now
    };

    // Clean up cache entry after completion
    promise.finally(() => {
      setTimeout(() => {
        delete requestCacheRef.current[cacheKey];
      }, 1000);
    });

    return promise;
  }, []);

  // PURE API CALL - Fetch current focus session
  const fetchCurrentSession = useCallback(async (): Promise<FocusSession | null> => {
    if (!isAuthenticated) return null;
    
    const endpoint = 'current-session';
    if (!checkRateLimit(endpoint)) {
      return currentSession;
    }

    const cacheKey = generateCacheKey(endpoint);
    
    return cachedRequest(cacheKey, async () => {
      setIsLoading(true);
      try {
        console.log('[FocusContext] API Call: getCurrentFocusSession');
        const response = await focusService.getCurrentFocusSession();
        
        if (response.data) {
          console.log('[FocusContext] API Response: Current session found', response.data);
          setCurrentSession(response.data);
          return response.data;
        } else {
          console.log('[FocusContext] API Response: No current session');
          setCurrentSession(null);
          return null;
        }
      } catch (err) {
        console.error('[FocusContext] API Error: fetchCurrentSession', err);
        setError('Failed to fetch current focus session');
        return null;
      } finally {
        setIsLoading(false);
      }
    });
  }, [isAuthenticated, currentSession, checkRateLimit, generateCacheKey, cachedRequest]);

  // PURE API CALL - Start a focus session
  const startFocusSession = useCallback(async (taskId: number, notes?: string): Promise<boolean> => {
    if (!isAuthenticated) {
      setError('You must be logged in to start a focus session');
      return false;
    }
    
    setIsLoading(true);
    try {
      const request: FocusRequest = { taskId, notes };
      console.log('[FocusContext] API Call: startFocusSession', request);
      
      const response = await focusService.startFocusSession(request);
      
      if (response.data) {
        console.log('[FocusContext] API Response: Session started', response.data);
        setCurrentSession(response.data);
        showToast('Focus session started successfully', 'success');
        
        // Clear statistics cache to force refresh
        Object.keys(requestCacheRef.current).forEach(key => {
          if (key.includes('statistics')) {
            delete requestCacheRef.current[key];
          }
        });
        
        return true;
      } else {
        console.error('[FocusContext] API Error: startFocusSession failed', response.error);
        setError(response.error || 'Failed to start focus session');
        return false;
      }
    } catch (err) {
      console.error('[FocusContext] API Error: startFocusSession exception', err);
      setError('Failed to start focus session');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, showToast]);

  // PURE API CALL - End a focus session
  const endFocusSession = useCallback(async (sessionId?: number): Promise<boolean> => {
    if (!isAuthenticated) {
      setError('You must be logged in to end a focus session');
      return false;
    }
    
    setIsLoading(true);
    try {
      console.log('[FocusContext] API Call: endFocusSession', sessionId);
      const response = await focusService.endFocusSession(sessionId);
      
      if (response.data) {
        console.log('[FocusContext] API Response: Session ended', response.data);
        setCurrentSession(null);
        showToast('Focus session ended successfully', 'success');
        
        // Clear statistics and history cache to force refresh
        Object.keys(requestCacheRef.current).forEach(key => {
          if (key.includes('statistics') || key.includes('history')) {
            delete requestCacheRef.current[key];
          }
        });
        
        return true;
      } else {
        console.error('[FocusContext] API Error: endFocusSession failed', response.error);
        setError(response.error || 'Failed to end focus session');
        return false;
      }
    } catch (err) {
      console.error('[FocusContext] API Error: endFocusSession exception', err);
      setError('Failed to end focus session');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, showToast]);

  // PURE API CALL - Pause a focus session
  const pauseFocusSession = useCallback(async (sessionId?: number): Promise<boolean> => {
    if (!isAuthenticated) {
      setError('You must be logged in to pause a focus session');
      return false;
    }
    
    setIsLoading(true);
    try {
      console.log('[FocusContext] API Call: pauseFocusSession', sessionId);
      const response = await focusService.pauseFocusSession(sessionId);
      
      if (response.data) {
        console.log('[FocusContext] API Response: Session paused', response.data);
        setCurrentSession(response.data);
        showToast('Focus session paused', 'info');
        return true;
      } else {
        console.error('[FocusContext] API Error: pauseFocusSession failed', response.error);
        setError(response.error || 'Failed to pause focus session');
        return false;
      }
    } catch (err) {
      console.error('[FocusContext] API Error: pauseFocusSession exception', err);
      setError('Failed to pause focus session');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, showToast]);

  // PURE API CALL - Resume a focus session
  const resumeFocusSession = useCallback(async (sessionId: number): Promise<boolean> => {
    if (!isAuthenticated) {
      setError('You must be logged in to resume a focus session');
      return false;
    }
    
    setIsLoading(true);
    try {
      console.log('[FocusContext] API Call: resumeFocusSession', sessionId);
      const response = await focusService.resumeFocusSession(sessionId);
      
      if (response.data) {
        console.log('[FocusContext] API Response: Session resumed', response.data);
        setCurrentSession(response.data);
        showToast('Focus session resumed', 'success');
        return true;
      } else {
        console.error('[FocusContext] API Error: resumeFocusSession failed', response.error);
        setError(response.error || 'Failed to resume focus session');
        return false;
      }
    } catch (err) {
      console.error('[FocusContext] API Error: resumeFocusSession exception', err);
      setError('Failed to resume focus session');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, showToast]);

  // PURE API CALL - Record a distraction
  const recordDistraction = useCallback(async (description: string, category: string): Promise<boolean> => {
    if (!isAuthenticated || !currentSession) {
      setError('You must be in an active focus session to record a distraction');
      return false;
    }
    
    setIsLoading(true);
    try {
      const distraction: DistractionCreate = {
        sessionId: currentSession.id,
        description,
        category
      };
      
      console.log('[FocusContext] API Call: recordDistraction', distraction);
      const response = await focusService.recordDistraction(distraction);
      
      if (response.data) {
        console.log('[FocusContext] API Response: Distraction recorded', response.data);
        showToast('Distraction recorded', 'info');
        
        // Clear statistics cache to force refresh
        Object.keys(requestCacheRef.current).forEach(key => {
          if (key.includes('statistics')) {
            delete requestCacheRef.current[key];
          }
        });
        
        return true;
      } else {
        console.error('[FocusContext] API Error: recordDistraction failed', response.error);
        setError(response.error || 'Failed to record distraction');
        return false;
      }
    } catch (err) {
      console.error('[FocusContext] API Error: recordDistraction exception', err);
      setError('Failed to record distraction');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentSession, showToast]);

  // PURE API CALL - Fetch focus statistics
  const fetchStatistics = useCallback(async (startDate?: Date, endDate?: Date): Promise<FocusStatistics | null> => {
    if (!isAuthenticated) return null;
    
    const endpoint = 'statistics';
    if (!checkRateLimit(endpoint)) {
      return statistics;
    }

    const params = { startDate, endDate };
    const cacheKey = generateCacheKey(endpoint, params);
    
    return cachedRequest(cacheKey, async () => {
      setIsLoading(true);
      try {
        console.log('[FocusContext] API Call: getFocusStatistics', { startDate, endDate });
        
        const response = await focusService.getFocusStatistics(startDate, endDate);
        
        if (response.data) {
          console.log('[FocusContext] API Response: Statistics received', response.data);
          setStatistics(response.data);
          return response.data;
        } else {
          console.log('[FocusContext] API Response: No statistics data');
          setStatistics(null);
          setError(response.error || 'Failed to fetch focus statistics');
          return null;
        }
      } catch (err) {
        console.error('[FocusContext] API Error: fetchStatistics exception', err);
        setError('Failed to fetch focus statistics');
        return null;
      } finally {
        setIsLoading(false);
      }
    });
  }, [isAuthenticated, statistics, checkRateLimit, generateCacheKey, cachedRequest]);

  // PURE API CALL - Fetch focus history
  const fetchHistory = useCallback(async (): Promise<FocusSession[]> => {
    if (!isAuthenticated) return [];
    
    const endpoint = 'history';
    if (!checkRateLimit(endpoint)) {
      return history;
    }

    const cacheKey = generateCacheKey(endpoint);
    
    return cachedRequest(cacheKey, async () => {
      setIsLoading(true);
      try {
        console.log('[FocusContext] API Call: getFocusHistory');
        const response = await focusService.getFocusHistory();
        
        if (response.data) {
          console.log('[FocusContext] API Response: History received', response.data.length, 'sessions');
          setHistory(response.data);
          return response.data;
        } else {
          console.log('[FocusContext] API Response: No history data');
          setHistory([]);
          setError(response.error || 'Failed to fetch focus history');
          return [];
        }
      } catch (err) {
        console.error('[FocusContext] API Error: fetchHistory exception', err);
        setError('Failed to fetch focus history');
        return [];
      } finally {
        setIsLoading(false);
      }
    });
  }, [isAuthenticated, history, checkRateLimit, generateCacheKey, cachedRequest]);

  // PURE API CALL - Fetch focus suggestions
  const fetchSuggestions = useCallback(async (count: number = 5): Promise<Task[]> => {
    if (!isAuthenticated) return [];
    
    const endpoint = 'suggestions';
    if (!checkRateLimit(endpoint)) {
      return suggestions;
    }

    const cacheKey = generateCacheKey(endpoint, { count });
    
    return cachedRequest(cacheKey, async () => {
      setIsLoading(true);
      try {
        console.log('[FocusContext] API Call: getFocusSuggestions', count);
        const response = await focusService.getFocusSuggestions(count);
        
        if (response.data) {
          console.log('[FocusContext] API Response: Suggestions received', response.data.length, 'tasks');
          setSuggestions(response.data);
          return response.data;
        } else {
          console.log('[FocusContext] API Response: No suggestions data');
          setSuggestions([]);
          setError(response.error || 'Failed to fetch focus suggestions');
          return [];
        }
      } catch (err) {
        console.error('[FocusContext] API Error: fetchSuggestions exception', err);
        setError('Failed to fetch focus suggestions');
        return [];
      } finally {
        setIsLoading(false);
      }
    });
  }, [isAuthenticated, suggestions, checkRateLimit, generateCacheKey, cachedRequest]);

  // PURE API CALL - Fetch session distractions
  const fetchSessionDistractions = useCallback(async (sessionId: number): Promise<Distraction[]> => {
    if (!isAuthenticated) return [];
    
    const endpoint = `distractions-${sessionId}`;
    if (!checkRateLimit(endpoint)) {
      return [];
    }

    const cacheKey = generateCacheKey(endpoint);
    
    return cachedRequest(cacheKey, async () => {
      setIsLoading(true);
      try {
        console.log('[FocusContext] API Call: getSessionDistractions', sessionId);
        const response = await focusService.getSessionDistractions(sessionId);
        
        if (response.data) {
          console.log('[FocusContext] API Response: Distractions received', response.data.length, 'distractions');
          return response.data;
        } else {
          console.log('[FocusContext] API Response: No distractions data');
          setError(response.error || 'Failed to fetch session distractions');
          return [];
        }
      } catch (err) {
        console.error('[FocusContext] API Error: fetchSessionDistractions exception', err);
        setError('Failed to fetch session distractions');
        return [];
      } finally {
        setIsLoading(false);
      }
    });
  }, [isAuthenticated, checkRateLimit, generateCacheKey, cachedRequest]);

  // Check for active session on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentSession();
    }
  }, [isAuthenticated, fetchCurrentSession]);

  // Cleanup cache periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      
      // Clean up request cache
      Object.keys(requestCacheRef.current).forEach(key => {
        const cached = requestCacheRef.current[key];
        if (now - cached.timestamp > CACHE_DURATION) {
          delete requestCacheRef.current[key];
        }
      });
      
      // Clean up rate limit tracker
      Object.keys(rateLimitRef.current).forEach(key => {
        const tracker = rateLimitRef.current[key];
        if (now > tracker.resetTime) {
          delete rateLimitRef.current[key];
        }
      });
    }, 60000); // Clean up every minute

    return () => clearInterval(cleanup);
  }, []);

  // Context value - ALL API DATA, NO MOCK DATA
  const value = {
    currentSession,
    isLoading,
    error,
    statistics,
    history,
    suggestions,
    startFocusSession,
    endFocusSession,
    pauseFocusSession,
    resumeFocusSession,
    recordDistraction,
    fetchCurrentSession,
    fetchStatistics,
    fetchHistory,
    fetchSuggestions,
    fetchSessionDistractions,
    clearError
  };

  return (
    <FocusContext.Provider value={value}>
      {children}
    </FocusContext.Provider>
  );
}

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (context === undefined) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
};