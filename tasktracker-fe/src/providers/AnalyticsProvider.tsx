/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  AdvancedAnalytics, 
  FilterCriteria, 
  DashboardConfig,
  DataExportRequest,
  SavedFilter 
} from '@/lib/types/analytics';

interface AnalyticsContextType {
  // Analytics data
  analyticsData: AdvancedAnalytics | null;
  setAnalyticsData: (data: AdvancedAnalytics | null) => void;
  
  // Filters
  activeFilters: FilterCriteria;
  setActiveFilters: (filters: FilterCriteria) => void;
  
  // Dashboard configuration
  dashboardConfig: DashboardConfig | null;
  setDashboardConfig: (config: DashboardConfig | null) => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
  
  // Saved filters
  savedFilters: SavedFilter[];
  setSavedFilters: (filters: SavedFilter[]) => void;
  
  // Export requests
  exportRequests: DataExportRequest[];
  setExportRequests: (requests: DataExportRequest[]) => void;
  
  // Refresh functionality
  refreshData: () => void;
  
  // Cache management
  clearCache: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // State management
  const [analyticsData, setAnalyticsData] = useState<AdvancedAnalytics | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterCriteria>({});
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [exportRequests, setExportRequests] = useState<DataExportRequest[]>([]);

  // Refresh data callback
  const refreshData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    // This would trigger a refetch of analytics data
    // The actual implementation would depend on how data fetching is handled
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  // Clear cache callback
  const clearCache = useCallback(() => {
    setAnalyticsData(null);
    setDashboardConfig(null);
    setError(null);
    setSavedFilters([]);
    setExportRequests([]);
  }, []);

  const value: AnalyticsContextType = {
    analyticsData,
    setAnalyticsData,
    activeFilters,
    setActiveFilters,
    dashboardConfig,
    setDashboardConfig,
    isLoading,
    setIsLoading,
    error,
    setError,
    savedFilters,
    setSavedFilters,
    exportRequests,
    setExportRequests,
    refreshData,
    clearCache,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
} 