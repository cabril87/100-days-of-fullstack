'use client';

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode,
  useCallback
} from 'react';
import { useToast } from '@/lib/hooks/useToast';
import { useAuth } from '@/lib/providers/AuthContext';
import { 
  focusService, 
  FocusSession, 
  FocusStatistics, 
  FocusRequest, 
  Distraction,
  DistractionCreate 
} from '@/lib/services/focusService';
import { Task } from '@/lib/types/task';

interface FocusContextType {
  // State
  currentSession: FocusSession | null;
  isLoading: boolean;
  error: string | null;
  statistics: FocusStatistics | null;
  history: FocusSession[];
  suggestions: Task[];
  
  // Actions
  startFocusSession: (taskId: number, notes?: string) => Promise<boolean>;
  endFocusSession: (sessionId?: number) => Promise<boolean>;
  pauseFocusSession: (sessionId?: number) => Promise<boolean>;
  resumeFocusSession: (sessionId: number) => Promise<boolean>;
  recordDistraction: (description: string, category: string) => Promise<boolean>;
  
  // Data fetching
  fetchCurrentSession: () => Promise<FocusSession | null>;
  fetchStatistics: (startDate?: Date, endDate?: Date) => Promise<FocusStatistics | null>;
  fetchHistory: () => Promise<FocusSession[]>;
  fetchSuggestions: (count?: number) => Promise<Task[]>;
  clearError: () => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export function FocusProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<FocusStatistics | null>(null);
  const [history, setHistory] = useState<FocusSession[]>([]);
  const [suggestions, setSuggestions] = useState<Task[]>([]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch current focus session
  const fetchCurrentSession = useCallback(async (): Promise<FocusSession | null> => {
    if (!isAuthenticated) return null;
    
    setIsLoading(true);
    try {
      const response = await focusService.getCurrentFocusSession();
      
      if (response.data) {
        setCurrentSession(response.data);
        return response.data;
      } else {
        setCurrentSession(null);
        return null;
      }
    } catch (err) {
      console.error('Error fetching current focus session:', err);
      setError('Failed to fetch current focus session');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Start a focus session
  const startFocusSession = useCallback(async (taskId: number, notes?: string): Promise<boolean> => {
    if (!isAuthenticated) {
      setError('You must be logged in to start a focus session');
      return false;
    }
    
    setIsLoading(true);
    try {
      const request: FocusRequest = { taskId, notes };
      const response = await focusService.startFocusSession(request);
      
      if (response.data) {
        setCurrentSession(response.data);
        showToast('Focus session started successfully', 'success');
        return true;
      } else {
        setError(response.error || 'Failed to start focus session');
        return false;
      }
    } catch (err) {
      console.error('Error starting focus session:', err);
      setError('Failed to start focus session');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, showToast]);

  // End a focus session
  const endFocusSession = useCallback(async (sessionId?: number): Promise<boolean> => {
    if (!isAuthenticated) {
      setError('You must be logged in to end a focus session');
      return false;
    }
    
    setIsLoading(true);
    try {
      const response = await focusService.endFocusSession(sessionId);
      
      if (response.data) {
        setCurrentSession(null);
        showToast('Focus session ended successfully', 'success');
        return true;
      } else {
        setError(response.error || 'Failed to end focus session');
        return false;
      }
    } catch (err) {
      console.error('Error ending focus session:', err);
      setError('Failed to end focus session');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, showToast]);

  // Pause a focus session
  const pauseFocusSession = useCallback(async (sessionId?: number): Promise<boolean> => {
    if (!isAuthenticated) {
      setError('You must be logged in to pause a focus session');
      return false;
    }
    
    setIsLoading(true);
    try {
      const response = await focusService.pauseFocusSession(sessionId);
      
      if (response.data) {
        setCurrentSession(response.data);
        showToast('Focus session paused', 'info');
        return true;
      } else {
        setError(response.error || 'Failed to pause focus session');
        return false;
      }
    } catch (err) {
      console.error('Error pausing focus session:', err);
      setError('Failed to pause focus session');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, showToast]);

  // Resume a focus session
  const resumeFocusSession = useCallback(async (sessionId: number): Promise<boolean> => {
    if (!isAuthenticated) {
      setError('You must be logged in to resume a focus session');
      return false;
    }
    
    setIsLoading(true);
    try {
      const response = await focusService.resumeFocusSession(sessionId);
      
      if (response.data) {
        setCurrentSession(response.data);
        showToast('Focus session resumed', 'success');
        return true;
      } else {
        setError(response.error || 'Failed to resume focus session');
        return false;
      }
    } catch (err) {
      console.error('Error resuming focus session:', err);
      setError('Failed to resume focus session');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, showToast]);

  // Record a distraction
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
      
      const response = await focusService.recordDistraction(distraction);
      
      if (response.data) {
        showToast('Distraction recorded', 'info');
        return true;
      } else {
        setError(response.error || 'Failed to record distraction');
        return false;
      }
    } catch (err) {
      console.error('Error recording distraction:', err);
      setError('Failed to record distraction');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentSession, showToast]);

  // Fetch focus statistics
  const fetchStatistics = useCallback(async (startDate?: Date, endDate?: Date): Promise<FocusStatistics | null> => {
    if (!isAuthenticated) return null;
    
    setIsLoading(true);
    try {
      const response = await focusService.getFocusStatistics(startDate, endDate);
      
      if (response.data) {
        setStatistics(response.data);
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch focus statistics');
        return null;
      }
    } catch (err) {
      console.error('Error fetching focus statistics:', err);
      setError('Failed to fetch focus statistics');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch focus history
  const fetchHistory = useCallback(async (): Promise<FocusSession[]> => {
    if (!isAuthenticated) return [];
    
    setIsLoading(true);
    try {
      const response = await focusService.getFocusHistory();
      
      if (response.data) {
        setHistory(response.data);
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch focus history');
        return [];
      }
    } catch (err) {
      console.error('Error fetching focus history:', err);
      setError('Failed to fetch focus history');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch focus suggestions
  const fetchSuggestions = useCallback(async (count: number = 5): Promise<Task[]> => {
    if (!isAuthenticated) return [];
    
    setIsLoading(true);
    try {
      const response = await focusService.getFocusSuggestions(count);
      
      if (response.data) {
        setSuggestions(response.data);
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch focus suggestions');
        return [];
      }
    } catch (err) {
      console.error('Error fetching focus suggestions:', err);
      setError('Failed to fetch focus suggestions');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Check for active session on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentSession();
    }
  }, [isAuthenticated, fetchCurrentSession]);

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