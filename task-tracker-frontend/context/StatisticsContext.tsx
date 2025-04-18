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
};

// Define statistics context type
type StatisticsContextType = StatisticsState & {
  fetchAllStatistics: () => Promise<void>;
  fetchProductivitySummary: () => Promise<void>;
  fetchCompletionRate: () => Promise<void>;
  fetchTasksByStatusDistribution: () => Promise<void>;
  clearError: () => void;
};

// Create the statistics context
const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined);

// Statistics provider props
type StatisticsProviderProps = {
  children: ReactNode;
};

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
  });

  // Fetch statistics when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  // Fetch all statistics data at once
  const fetchAllData = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Try to fetch all statistics, but don't fail if individual requests fail
      const promises = [
        fetchAllStatistics().catch(e => console.error("Error fetching statistics:", e)),
        fetchProductivitySummary().catch(e => console.error("Error fetching productivity summary:", e)),
        fetchCompletionRate().catch(e => console.error("Error fetching completion rate:", e)),
        fetchTasksByStatusDistribution().catch(e => console.error("Error fetching tasks by status:", e)),
      ];
      
      await Promise.all(promises);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: (error as ApiError).message || 'Failed to fetch statistics data',
      }));
    }
  };

  // Cache for failed endpoints to prevent repeated requests to non-existent endpoints
  const failedEndpoints = new Set<string>();

  // Fetch all statistics
  const fetchAllStatistics = async () => {
    // Skip if we've already determined this endpoint doesn't exist
    if (failedEndpoints.has('statistics')) {
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
      } else if ('data' in response) {
        // Direct response format
        setState((prev) => ({
          ...prev,
          statistics: response as unknown as TaskStatisticsDTO,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: 'message' in response ? response.message : 'Failed to fetch statistics',
        }));
      }
    } catch (error) {
      // If we get a 404, mark this endpoint as failed to prevent future requests
      if ((error as ApiError).statusCode === 404) {
        failedEndpoints.add('statistics');
      }
      
      setState((prev) => ({
        ...prev,
        error: (error as ApiError).message || 'Failed to fetch statistics',
      }));
    }
  };

  // Fetch productivity summary
  const fetchProductivitySummary = async () => {
    // Skip if we've already determined this endpoint doesn't exist
    if (failedEndpoints.has('productivity-summary')) {
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
      } else if ('averageTasksPerDay' in response) {
        // Direct response format
        setState((prev) => ({
          ...prev,
          productivitySummary: response as unknown as ProductivitySummaryDTO,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: 'message' in response ? response.message : 'Failed to fetch productivity summary',
        }));
      }
    } catch (error) {
      // If we get a 404, mark this endpoint as failed to prevent future requests
      if ((error as ApiError).statusCode === 404) {
        failedEndpoints.add('productivity-summary');
      }
      
      setState((prev) => ({
        ...prev,
        error: (error as ApiError).message || 'Failed to fetch productivity summary',
      }));
    }
  };

  // Fetch completion rate
  const fetchCompletionRate = async () => {
    // Skip if we've already determined this endpoint doesn't exist
    if (failedEndpoints.has('completion-rate')) {
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
      } else if ('completionRate' in response) {
        // Direct response format
        setState((prev) => ({
          ...prev,
          completionRate: response as unknown as TaskCompletionRateDTO,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: 'message' in response ? response.message : 'Failed to fetch completion rate',
        }));
      }
    } catch (error) {
      // If we get a 404, mark this endpoint as failed to prevent future requests
      if ((error as ApiError).statusCode === 404) {
        failedEndpoints.add('completion-rate');
      }
      
      setState((prev) => ({
        ...prev,
        error: (error as ApiError).message || 'Failed to fetch completion rate',
      }));
    }
  };

  // Fetch tasks by status distribution
  const fetchTasksByStatusDistribution = async () => {
    // Skip if we've already determined this endpoint doesn't exist
    if (failedEndpoints.has('tasks-by-status')) {
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
      } else if (Array.isArray(response) || (typeof response === 'object' && response !== null)) {
        // Direct response format
        setState((prev) => ({
          ...prev,
          tasksByStatus: response as unknown as Record<string, number>,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: 'message' in response ? response.message : 'Failed to fetch tasks by status',
        }));
      }
    } catch (error) {
      // If we get a 404, mark this endpoint as failed to prevent future requests
      if ((error as ApiError).statusCode === 404) {
        failedEndpoints.add('tasks-by-status');
      }
      
      setState((prev) => ({
        ...prev,
        error: (error as ApiError).message || 'Failed to fetch tasks by status',
      }));
    }
  };

  // Clear error
  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  // Provide statistics context
  return (
    <StatisticsContext.Provider
      value={{
        ...state,
        fetchAllStatistics,
        fetchProductivitySummary,
        fetchCompletionRate,
        fetchTasksByStatusDistribution,
        clearError,
      }}
    >
      {children}
    </StatisticsContext.Provider>
  );
}

// Hook to use statistics context
export function useStatistics() {
  const context = useContext(StatisticsContext);
  if (context === undefined) {
    throw new Error('useStatistics must be used within a StatisticsProvider');
  }
  return context;
} 