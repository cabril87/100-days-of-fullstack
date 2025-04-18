"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from './AuthContext';

// Define statistics types based on your API response models
export type TaskCompletionRateDTO = {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
};

export type TaskDistributionDTO = {
  label: string;
  count: number;
  percentage: number;
};

export type TaskCompletionTimeDTO = {
  averageCompletionTimeInHours: number;
  tasksAnalyzed: number;
};

export type OverdueTasksStatisticsDTO = {
  totalOverdueTasks: number;
  percentageOfAllTasks: number;
  averageDaysOverdue: number;
  overdueByPriority: TaskDistributionDTO[];
};

export type ProductivityDataPointDTO = {
  date: string;
  tasksCompleted: number;
  tasksCreated: number;
};

export type TaskStatisticsDTO = {
  generatedAt: string;
  completionRate: TaskCompletionRateDTO;
  tasksByStatus: TaskDistributionDTO[];
  tasksByPriority: TaskDistributionDTO[];
  tasksByCategory: TaskDistributionDTO[];
  completionTime: TaskCompletionTimeDTO;
  overdueCount: number;
  productivityTrend: ProductivityDataPointDTO[];
  overdueTasks: OverdueTasksStatisticsDTO;
};

export type ProductivitySummaryDTO = {
  averageTasksPerDay: number;
  averageTasksPerWeek: number;
  averageCompletionRate: number;
  averageTimeToComplete: {
    days: number;
    hours: number;
    minutes: number;
    totalHours: number;
  };
  generatedAt: string;
};

// Define statistics context state
type StatisticsState = {
  statistics: TaskStatisticsDTO | null;
  productivitySummary: ProductivitySummaryDTO | null;
  completionRate: TaskCompletionRateDTO | null;
  tasksByStatus: Record<string, number> | null;
  isLoading: boolean;
  error: string | null;
  hasAttemptedFetch: boolean;
};

// Define statistics context type
type StatisticsContextType = StatisticsState & {
  fetchAllStatistics: () => Promise<void>;
  fetchProductivitySummary: () => Promise<void>;
  fetchCompletionRate: () => Promise<void>;
  fetchTasksByStatusDistribution: () => Promise<void>;
  clearError: () => void;
  retryFetchAll: () => Promise<void>;
};

// Create the statistics context
const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined);

// Statistics provider props
type StatisticsProviderProps = {
  children: ReactNode;
};

// Cache for failed endpoints to prevent repeated requests
const failedEndpoints = new Set<string>();
const MAX_RETRY_ATTEMPTS = 2;
let retryAttempts = 0;

// Statistics provider component
export function StatisticsProvider({ children }: StatisticsProviderProps) {
  const { isAuthenticated } = useAuth();
  
  const [state, setState] = useState<StatisticsState>({
    statistics: null,
    productivitySummary: null,
    completionRate: null,
    tasksByStatus: null,
    isLoading: false,
    error: null,
    hasAttemptedFetch: false,
  });

  // Fetch statistics when authenticated
  useEffect(() => {
    if (isAuthenticated && !state.hasAttemptedFetch) {
      fetchAllData();
    }
  }, [isAuthenticated, state.hasAttemptedFetch]);

  // Set a timeout to prevent infinite loading if endpoints are unavailable
  useEffect(() => {
    if (state.isLoading) {
      const timeout = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          hasAttemptedFetch: true,
        }));
      }, 5000); // 5 second timeout

      return () => clearTimeout(timeout);
    }
  }, [state.isLoading]);

  // Retry fetching all data
  const retryFetchAll = async () => {
    if (retryAttempts < MAX_RETRY_ATTEMPTS) {
      retryAttempts++;
      await fetchAllData();
    } else {
      console.log(`Maximum retry attempts (${MAX_RETRY_ATTEMPTS}) reached.`);
    }
  };

  // Fetch all statistics data at once
  const fetchAllData = async () => {
    setState((prev) => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      hasAttemptedFetch: true
    }));
    
    try {
      // Use Promise.all with individual catches to prevent one failure from stopping all fetches
      await Promise.all([
        fetchAllStatistics().catch(e => console.error("Error fetching statistics:", e)),
        fetchProductivitySummary().catch(e => console.error("Error fetching productivity summary:", e)),
        fetchCompletionRate().catch(e => console.error("Error fetching completion rate:", e)),
        fetchTasksByStatusDistribution().catch(e => console.error("Error fetching tasks by status:", e)),
      ]);
      
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: (error as ApiError).message || 'Failed to fetch statistics data',
      }));
    }
  };

  // Fetch all statistics
  const fetchAllStatistics = async () => {
    // Skip if we've already determined this endpoint doesn't exist
    if (failedEndpoints.has('Statistics')) {
      return;
    }
    
    try {
      const response = await api.statistics.getAll();
      
      if ('succeeded' in response && response.succeeded && response.data) {
        setState((prev) => ({
          ...prev,
          statistics: response.data,
          isLoading: false,
        }));
      } else if (response && typeof response === 'object') {
        // Direct response format
        setState((prev) => ({
          ...prev,
          statistics: response as unknown as TaskStatisticsDTO,
          isLoading: false,
        }));
      }
    } catch (error) {
      // If we get a 404, mark this endpoint as failed to prevent future requests
      if ((error as ApiError).statusCode === 404) {
        failedEndpoints.add('Statistics');
        console.log('Statistics endpoint not found, will not retry.');
      }
      
      // Don't set error state for 404s to avoid disrupting the UI
      if ((error as ApiError).statusCode !== 404) {
        setState((prev) => ({
          ...prev,
          error: (error as ApiError).message || 'Failed to fetch statistics',
        }));
      }
    }
  };

  // Fetch productivity summary
  const fetchProductivitySummary = async () => {
    // Skip if we've already determined this endpoint doesn't exist
    if (failedEndpoints.has('Statistics/productivity-summary')) {
      return;
    }
    
    try {
      const response = await api.statistics.getProductivitySummary();
      
      if ('succeeded' in response && response.succeeded && response.data) {
        setState((prev) => ({
          ...prev,
          productivitySummary: response.data,
          isLoading: false,
        }));
      } else if (response && typeof response === 'object' && 'averageTasksPerDay' in response) {
        // Direct response format
        setState((prev) => ({
          ...prev,
          productivitySummary: response as unknown as ProductivitySummaryDTO,
          isLoading: false,
        }));
      }
    } catch (error) {
      // If we get a 404, mark this endpoint as failed to prevent future requests
      if ((error as ApiError).statusCode === 404) {
        failedEndpoints.add('Statistics/productivity-summary');
        console.log('Productivity summary endpoint not found, will not retry.');
      }
      
      // Don't set error state for 404s to avoid disrupting the UI
      if ((error as ApiError).statusCode !== 404) {
        setState((prev) => ({
          ...prev,
          error: (error as ApiError).message || 'Failed to fetch productivity summary',
        }));
      }
    }
  };

  // Fetch completion rate
  const fetchCompletionRate = async () => {
    // Skip if we've already determined this endpoint doesn't exist
    if (failedEndpoints.has('Statistics/completion-rate')) {
      return;
    }
    
    try {
      const response = await api.statistics.getCompletionRate();
      
      if ('succeeded' in response && response.succeeded && response.data) {
        setState((prev) => ({
          ...prev,
          completionRate: response.data,
          isLoading: false,
        }));
      } else if (response && typeof response === 'object' && 'completionRate' in response) {
        // Direct response format
        setState((prev) => ({
          ...prev,
          completionRate: response as unknown as TaskCompletionRateDTO,
          isLoading: false,
        }));
      }
    } catch (error) {
      // If we get a 404, mark this endpoint as failed to prevent future requests
      if ((error as ApiError).statusCode === 404) {
        failedEndpoints.add('Statistics/completion-rate');
        console.log('Completion rate endpoint not found, will not retry.');
      }
      
      // Don't set error state for 404s to avoid disrupting the UI
      if ((error as ApiError).statusCode !== 404) {
        setState((prev) => ({
          ...prev,
          error: (error as ApiError).message || 'Failed to fetch completion rate',
        }));
      }
    }
  };

  // Fetch tasks by status distribution
  const fetchTasksByStatusDistribution = async () => {
    // Skip if we've already determined this endpoint doesn't exist
    if (failedEndpoints.has('Statistics/status-distribution')) {
      return;
    }
    
    try {
      const response = await api.statistics.getTasksByStatusDistribution();
      
      if ('succeeded' in response && response.succeeded && response.data) {
        setState((prev) => ({
          ...prev,
          tasksByStatus: response.data,
          isLoading: false,
        }));
      } else if (response && typeof response === 'object') {
        // Direct response format
        setState((prev) => ({
          ...prev,
          tasksByStatus: response as unknown as Record<string, number>,
          isLoading: false,
        }));
      }
    } catch (error) {
      // If we get a 404, mark this endpoint as failed to prevent future requests
      if ((error as ApiError).statusCode === 404) {
        failedEndpoints.add('Statistics/status-distribution');
        console.log('Status distribution endpoint not found, will not retry.');
      }
      
      // Don't set error state for 404s to avoid disrupting the UI
      if ((error as ApiError).statusCode !== 404) {
        setState((prev) => ({
          ...prev,
          error: (error as ApiError).message || 'Failed to fetch task status distribution',
        }));
      }
    }
  };

  // Clear error state
  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  // Create context value
  const contextValue: StatisticsContextType = {
    ...state,
    fetchAllStatistics,
    fetchProductivitySummary,
    fetchCompletionRate,
    fetchTasksByStatusDistribution,
    clearError,
    retryFetchAll,
  };

  return (
    <StatisticsContext.Provider value={contextValue}>
      {children}
    </StatisticsContext.Provider>
  );
}

// Custom hook to use the statistics context
export function useStatistics() {
  const context = useContext(StatisticsContext);
  
  if (!context) {
    throw new Error('useStatistics must be used within a StatisticsProvider');
  }
  
  return context;
} 