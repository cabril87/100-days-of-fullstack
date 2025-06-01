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
import { gamificationService } from '@/lib/services/gamificationService';
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
  endCurrentAndStartNew: (taskId: number, notes?: string) => Promise<boolean>;
  
  // Data fetching - ALL API CALLS
  fetchCurrentSession: () => Promise<FocusSession | null>;
  fetchStatistics: (startDate?: Date | string, endDate?: Date | string) => Promise<FocusStatistics | null>;
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
        
        // Handle 404 gracefully - no current session is not an error
        if (response.status === 404) {
          console.log('[FocusContext] API Response: No current session (404)');
          setCurrentSession(null);
          return null;
        }
        
        if (response.data) {
          console.log('[FocusContext] API Response: Data received', response.data);
          
          // Validate that this is actually a FocusSession, not a Task
          const data = response.data;
          
          // Check if this looks like a FocusSession (has session-specific fields)
          // A FocusSession should have these core fields
          const isFocusSession = data.hasOwnProperty('startTime') && 
                                data.hasOwnProperty('taskId') &&
                                (data.hasOwnProperty('status') && 
                                 ['InProgress', 'Paused', 'Completed', 'Interrupted'].includes(data.status));
          
          // Check if this looks like a Task (has task-specific fields but NOT session fields)
          // A Task object would have title/description but NOT startTime/taskId
          const isTask = data.hasOwnProperty('title') && 
                        data.hasOwnProperty('description') &&
                        data.hasOwnProperty('createdAt') &&
                        !data.hasOwnProperty('startTime') &&
                        !data.hasOwnProperty('taskId');
          
          if (isFocusSession) {
            console.log('[FocusContext] API Response: Valid focus session found', data);
            setCurrentSession(data);
            return data;
          } else if (isTask) {
            console.log('[FocusContext] API Response: Received Task instead of FocusSession, treating as no active session');
            setCurrentSession(null);
            return null;
          } else {
            console.log('[FocusContext] API Response: Unknown data format, treating as no active session');
            setCurrentSession(null);
            return null;
          }
        } else {
          console.log('[FocusContext] API Response: No current session');
          setCurrentSession(null);
          return null;
        }
      } catch (err: any) {
        // Handle 404 errors gracefully - no current session is normal
        if (err?.status === 404 || err?.response?.status === 404) {
          console.log('[FocusContext] API Response: No current session (404 from catch)');
          setCurrentSession(null);
          return null;
        }
        
        // Only log other errors as actual errors
        console.error('[FocusContext] API Error: fetchCurrentSession', err);
        setError('Failed to fetch current focus session');
        setCurrentSession(null);
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
      // First, check if there's already an active session
      console.log('[FocusContext] Checking for existing active session before starting new one');
      const existingSession = await fetchCurrentSession();
      
      if (existingSession) {
        console.log('[FocusContext] Found existing active session:', existingSession);
        setError(`You already have an active focus session (ID: ${existingSession.id}). Please end it first before starting a new one.`);
        setCurrentSession(existingSession); // Ensure UI shows the existing session
        return false;
      }
      
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
        
        // Handle specific error cases
        if (response.error && response.error.includes('already have an active focus session')) {
          console.log('[FocusContext] Backend reports active session, refreshing current session');
          
          // Force refresh current session to get the active one
          const refreshedSession = await fetchCurrentSession();
          if (refreshedSession) {
            setCurrentSession(refreshedSession);
            setError(`You already have an active focus session (ID: ${refreshedSession.id}). Please end it first before starting a new one.`);
          } else {
            setError('There seems to be an active session on the server. Please refresh the page and try again.');
          }
        } else {
          setError(response.error || 'Failed to start focus session');
        }
        
        return false;
      }
    } catch (err) {
      console.error('[FocusContext] API Error: startFocusSession exception', err);
      setError('Failed to start focus session');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, showToast, fetchCurrentSession]);

  // Achievement tracking system
  const checkAchievements = useCallback(async (session: FocusSession, isCompleted: boolean = false) => {
    try {
      const achievements = [];
      
      // Use actual database achievement IDs and names
      
      // First Focus Achievement (ID: 21) - "Focused" - Complete your first focus session
      if (history.length === 1 && isCompleted) {
        achievements.push({
          id: 21,
          title: 'Focused',
          description: 'Complete your first focus session',
          icon: '🎯',
          points: 25
        });
      }
      
      // Deep Work Achievement (ID: 74) - "Deep Work" - Complete 5 focus sessions over 2 hours each  
      if (isCompleted && session.durationMinutes && session.durationMinutes >= 120) {
        // Count sessions over 2 hours
        const deepWorkSessions = history.filter(s => 
          s.status === 'Completed' && 
          s.durationMinutes && 
          s.durationMinutes >= 120
        ).length + 1; // +1 for current session
        
        if (deepWorkSessions === 5) {
          achievements.push({
            id: 74,
            title: 'Deep Work',
            description: 'Complete 5 focus sessions over 2 hours each',
            icon: '🧠',
            points: 300
          });
        }
      }
      
      // Quality Focus Achievement using Zen Master (ID: 22) - Complete 5 focus sessions
      if (isCompleted) {
        const completedSessions = history.filter(s => s.status === 'Completed').length + 1;
        
        if (completedSessions === 5) {
          achievements.push({
            id: 22,
            title: 'Zen Master',
            description: 'Complete 5 focus sessions',
            icon: '🧘',
            points: 75
          });
        }
        
        // Focus Master (ID: 73) - Complete 25 focus sessions
        if (completedSessions === 25) {
          achievements.push({
            id: 73,
            title: 'Focus Master',
            description: 'Complete 25 focus sessions',
            icon: '🎯',
            points: 250
          });
        }
        
        // Deep Focus (ID: 121) - Complete 100 focus sessions
        if (completedSessions === 100) {
          achievements.push({
            id: 121,
            title: 'Deep Focus',
            description: 'Complete 100 focus sessions',
            icon: '🔥',
            points: 700
          });
        }
      }
      
      // Quality rating based achievement - use session quality for milestone rewards
      if (isCompleted && session.sessionQualityRating === 5) {
        const qualitySessions = history.filter(s => 
          s.status === 'Completed' && s.sessionQualityRating === 5
        ).length + 1;
        
        // Custom quality milestone (not in DB but good for user feedback)
        if (qualitySessions === 1) {
          achievements.push({
            id: 'quality-first',
            title: 'Quality Focus',
            description: 'Achieved your first 5-star focus session',
            icon: '⭐',
            points: 25
          });
        }
      }
      
      // Focus Streak Achievement - check for consistent quality sessions
      const recentQualitySessions = history
        .filter(s => s.status === 'Completed' && s.sessionQualityRating && s.sessionQualityRating >= 4)
        .slice(-4); // Last 4 sessions
      
      if (recentQualitySessions.length >= 4 && isCompleted && session.sessionQualityRating && session.sessionQualityRating >= 4) {
        achievements.push({
          id: 'quality-streak',
          title: 'Focus Streak',
          description: '5 consecutive quality focus sessions',
          icon: '🔥',
          points: 100
        });
      }
      
      // Show achievements to user and track with backend
      if (achievements.length > 0) {
        for (const achievement of achievements) {
          // Show toast notification
          showToast(`🏆 Achievement Unlocked: ${achievement.title}`, 'success');
          
          // Track achievement with gamification service if it's a database achievement
          if (typeof achievement.id === 'number') {
            try {
              // Add points for the achievement
              await gamificationService.addPoints({
                points: achievement.points,
                transactionType: 'Achievement',
                description: `Achievement unlocked: ${achievement.title}`,
                relatedEntityId: achievement.id
              });
              
              console.log(`[FocusContext] Achievement ${achievement.title} tracked with ${achievement.points} points`);
            } catch (error) {
              console.error(`[FocusContext] Failed to track achievement ${achievement.title}:`, error);
              // Continue with other achievements even if one fails
            }
          }
        }
        
        // Store custom achievements in localStorage as backup (non-database achievements)
        const customAchievements = achievements.filter(a => typeof a.id === 'string');
        if (customAchievements.length > 0) {
          const existingAchievements = JSON.parse(localStorage.getItem('focus-achievements') || '[]');
          const newAchievements = customAchievements.filter(a => 
            !existingAchievements.some((ea: any) => ea.id === a.id)
          );
          
          if (newAchievements.length > 0) {
            localStorage.setItem('focus-achievements', 
              JSON.stringify([...existingAchievements, ...newAchievements])
            );
          }
        }
      }
      
    } catch (err) {
      console.error('[FocusContext] Error checking achievements:', err);
    }
  }, [history, showToast]);

  // PURE API CALL - End a focus session
  const endFocusSession = useCallback(async (sessionId?: number): Promise<boolean> => {
    if (!isAuthenticated) {
      setError('You must be logged in to end a focus session');
      return false;
    }
    
    setIsLoading(true);
    try {
      console.log('[FocusContext] API Call: endFocusSession', sessionId);
      
      // Store current session for achievement checking
      const sessionToEnd = currentSession;
      
      const response = await focusService.endFocusSession(sessionId);
      
      if (response.data) {
        console.log('[FocusContext] API Response: Session ended', response.data);
        
        // Check for achievements if we have session data
        if (sessionToEnd) {
          await checkAchievements(response.data, true);
        }
        
        // Immediately clear current session to update UI
        setCurrentSession(null);
        
        showToast('Focus session ended successfully', 'success');
        
        // Clear all caches to force refresh of data
        requestCacheRef.current = {};
        
        // Force refresh current session to ensure clean state
        setTimeout(async () => {
          try {
            await fetchCurrentSession();
          } catch (err) {
            console.log('[FocusContext] No current session after end - this is expected');
          }
        }, 100);
        
        return true;
      } else {
        console.error('[FocusContext] API Error: endFocusSession failed', response.error);
        
        // Handle specific error cases
        if (response.error && response.error.includes('already completed')) {
          console.log('[FocusContext] Session already completed, cleaning up state');
          
          // Check achievements for already completed session
          if (sessionToEnd) {
            await checkAchievements(sessionToEnd, true);
          }
          
          // Clear current session since it's already completed
          setCurrentSession(null);
          
          // Clear all caches
          requestCacheRef.current = {};
          
          // Show appropriate message
          showToast('Session was already completed', 'info');
          
          // Force refresh to get clean state
          setTimeout(async () => {
            try {
              await fetchCurrentSession();
            } catch (err) {
              console.log('[FocusContext] No current session after cleanup - this is expected');
            }
          }, 100);
          
          return true; // Treat as success since the goal (no active session) is achieved
        }
        
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
  }, [isAuthenticated, showToast, fetchCurrentSession, currentSession, checkAchievements]);

  // PURE API CALL - Pause a focus session
  const pauseFocusSession = useCallback(async (sessionId?: number): Promise<boolean> => {
    if (!isAuthenticated) {
      setError('You must be logged in to pause a focus session');
      return false;
    }
    
    // Don't clear session state during pause operation
    setIsLoading(true);
    try {
      console.log('[FocusContext] API Call: pauseFocusSession', sessionId);
      const response = await focusService.pauseFocusSession(sessionId);
      
      if (response.data) {
        console.log('[FocusContext] API Response: Session paused', response.data);
        // Immediately update the session state to show paused status
        setCurrentSession(response.data);
        showToast('Focus session paused', 'info');
        
        // Clear current session cache but keep the session state
        Object.keys(requestCacheRef.current).forEach(key => {
          if (key.includes('current-session')) {
            delete requestCacheRef.current[key];
          }
        });
        
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
    
    // Don't clear session state during resume operation
    setIsLoading(true);
    try {
      console.log('[FocusContext] API Call: resumeFocusSession', sessionId);
      const response = await focusService.resumeFocusSession(sessionId);
      
      if (response.data) {
        console.log('[FocusContext] API Response: Session resumed', response.data);
        // Immediately update the session state to show resumed status
        setCurrentSession(response.data);
        showToast('Focus session resumed', 'success');
        
        // Clear current session cache but keep the session state
        Object.keys(requestCacheRef.current).forEach(key => {
          if (key.includes('current-session')) {
            delete requestCacheRef.current[key];
          }
        });
        
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

  // HELPER FUNCTION - End current session and start a new one
  const endCurrentAndStartNew = useCallback(async (taskId: number, notes?: string): Promise<boolean> => {
    if (!isAuthenticated) {
      setError('You must be logged in to manage focus sessions');
      return false;
    }
    
    setIsLoading(true);
    try {
      const request: FocusRequest = { taskId, notes };
      console.log('[FocusContext] API Call: switchFocusSession', request);
      
      const response = await focusService.switchFocusSession(request);
      
      if (response.data) {
        console.log('[FocusContext] API Response: Session switched successfully', response.data);
        setCurrentSession(response.data);
        showToast('Focus session switched successfully', 'success');
        
        // Clear statistics cache to force refresh
        Object.keys(requestCacheRef.current).forEach(key => {
          if (key.includes('statistics')) {
            delete requestCacheRef.current[key];
          }
        });
        
        return true;
      } else {
        console.error('[FocusContext] API Error: switchFocusSession failed', response.error);
        setError(response.error || 'Failed to switch focus sessions');
        return false;
      }
    } catch (err) {
      console.error('[FocusContext] Error in endCurrentAndStartNew:', err);
      setError('Failed to switch focus sessions');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, showToast]);

  // PURE API CALL - Fetch focus statistics
  const fetchStatistics = useCallback(async (startDate?: Date | string, endDate?: Date | string): Promise<FocusStatistics | null> => {
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
        
        // Convert dates to ISO strings if they are Date objects
        const startDateStr = startDate instanceof Date ? startDate.toISOString() : startDate;
        const endDateStr = endDate instanceof Date ? endDate.toISOString() : endDate;
        
        const response = await focusService.getFocusStatistics(startDateStr, endDateStr);
        
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
      // Initialize with session recovery
      initializeWithRecovery();
    }
  }, [isAuthenticated]);

  // Session recovery system
  const initializeWithRecovery = useCallback(async () => {
    try {
      // Check for persisted session state
      const persistedSession = localStorage.getItem('focus-session-backup');
      
      // Always fetch current session from server first
      const currentServerSession = await fetchCurrentSession();
      
      if (persistedSession && !currentServerSession) {
        // We have a local session but no server session - potential recovery case
        const localSession = JSON.parse(persistedSession);
        
        // Check if local session is recent (within last hour)
        const localSessionTime = new Date(localSession.startTime).getTime();
        const now = Date.now();
        const hourInMs = 60 * 60 * 1000;
        
        if (now - localSessionTime < hourInMs) {
          console.log('[FocusContext] Potential session recovery scenario detected');
          
          // Show recovery dialog to user
          const shouldRecover = window.confirm(
            `It looks like you had an active focus session that may have been interrupted. ` +
            `Would you like to try to recover it?\n\n` +
            `Session: Task ${localSession.taskId}\n` +
            `Started: ${new Date(localSession.startTime).toLocaleTimeString()}`
          );
          
          if (shouldRecover) {
            try {
              // Attempt to restart the session
              const response = await focusService.startFocusSession({
                taskId: localSession.taskId,
                notes: localSession.notes || 'Recovered session'
              });
              
              if (response.data) {
                console.log('[FocusContext] Session recovery successful');
                setCurrentSession(response.data);
              }
            } catch (err) {
              console.log('[FocusContext] Session recovery failed, continuing normally');
            }
          }
        }
      }
      
      // Clean up old persisted sessions
      if (persistedSession) {
        localStorage.removeItem('focus-session-backup');
      }
      
    } catch (err) {
      console.error('[FocusContext] Error during session recovery:', err);
    }
  }, [fetchCurrentSession]);

  // Persist session state for recovery
  useEffect(() => {
    if (currentSession && ['InProgress', 'Paused'].includes(currentSession.status)) {
      // Backup session state to localStorage
      localStorage.setItem('focus-session-backup', JSON.stringify({
        id: currentSession.id,
        taskId: currentSession.taskId,
        startTime: currentSession.startTime,
        status: currentSession.status,
        notes: currentSession.notes,
        durationMinutes: currentSession.durationMinutes
      }));
    } else {
      // Clear backup when session ends
      localStorage.removeItem('focus-session-backup');
    }
  }, [currentSession]);

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
    endCurrentAndStartNew,
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