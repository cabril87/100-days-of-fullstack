/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import { useState, useEffect, useCallback } from 'react';
import { DataExportRequest, ExportStatus, FilterCriteria, DateRange } from '@/lib/types/analytics';
import { dataExportService } from '@/lib/services/analytics';

interface UseDataExportProps {
  autoLoadHistory?: boolean;
  pollInterval?: number;
}

interface UseDataExportReturn {
  // Export requests
  exportRequests: DataExportRequest[];
  activeExports: DataExportRequest[];
  completedExports: DataExportRequest[];
  
  // Actions
  createExport: (
    exportType: string,
    format: 'json' | 'csv' | 'excel' | 'pdf',
    dateRange: DateRange,
    filters?: FilterCriteria
  ) => Promise<void>;
  downloadExport: (exportId: number) => Promise<void>;
  cancelExport: (exportId: number) => Promise<void>;
  deleteExport: (exportId: number) => Promise<void>;
  retryExport: (exportId: number) => Promise<void>;
  
  // Bulk operations
  downloadMultiple: (exportIds: number[]) => Promise<void>;
  deleteMultiple: (exportIds: number[]) => Promise<void>;
  
  // Progress tracking
  getExportProgress: (exportId: number) => number;
  getExportStatus: (exportId: number) => ExportStatus;
  
  // History management
  loadExportHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
  
  // State
  isLoading: boolean;
  isExporting: boolean;
  error: string | null;
  totalExports: number;
  pendingCount: number;
  completedCount: number;
}

export function useDataExport({
  autoLoadHistory = true,
  pollInterval = 5000 // 5 seconds
}: UseDataExportProps = {}): UseDataExportReturn {
  
  const [exportRequests, setExportRequests] = useState<DataExportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed values
  const activeExports = exportRequests.filter(exp => 
    exp.status === 'pending' || exp.status === 'processing'
  );
  
  const completedExports = exportRequests.filter(exp => 
    exp.status === 'completed'
  );

  const totalExports = exportRequests.length;
  const pendingCount = exportRequests.filter(exp => exp.status === 'pending').length;
  const completedCount = completedExports.length;

  // Load export history
  const loadExportHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const history = await dataExportService.getExportHistory();
      setExportRequests(history);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load export history';
      setError(errorMessage);
      console.error('Load export history error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (autoLoadHistory) {
      loadExportHistory();
    }
  }, [autoLoadHistory, loadExportHistory]);

  // Polling for active exports
  useEffect(() => {
    if (activeExports.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const updatedHistory = await dataExportService.getExportHistory();
        setExportRequests(updatedHistory);
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [activeExports.length, pollInterval]);

  // Create export
  const createExport = useCallback(async (
    exportType: string,
    format: 'json' | 'csv' | 'excel' | 'pdf',
    dateRange: DateRange,
    filters: FilterCriteria = {}
  ) => {
    setIsExporting(true);
    setError(null);

    try {
      const exportRequest = await dataExportService.createExportRequest({
        exportType,
        format,
        dateRange,
        filters,
        includeHeaders: true,
        customFields: []
      });

      setExportRequests(prev => [exportRequest, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create export';
      setError(errorMessage);
      console.error('Create export error:', err);
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Download export
  const downloadExport = useCallback(async (exportId: number) => {
    setError(null);

    try {
      const blob = await dataExportService.downloadExport(exportId);
      const exportRequest = exportRequests.find(exp => exp.id === exportId);
      
      if (!exportRequest) {
        throw new Error('Export request not found');
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `export-${exportId}-${Date.now()}.${getFileExtension(exportRequest.exportType)}`;
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download export';
      setError(errorMessage);
      console.error('Download export error:', err);
    }
  }, [exportRequests]);

  // Cancel export
  const cancelExport = useCallback(async (exportId: number) => {
    setError(null);

    try {
      await dataExportService.cancelExport(exportId);
      setExportRequests(prev => 
        prev.map(exp => 
          exp.id === exportId 
            ? { ...exp, status: 'cancelled' as ExportStatus }
            : exp
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel export';
      setError(errorMessage);
      console.error('Cancel export error:', err);
    }
  }, []);

  // Delete export
  const deleteExport = useCallback(async (exportId: number) => {
    setError(null);

    try {
      await dataExportService.deleteExport(exportId);
      setExportRequests(prev => prev.filter(exp => exp.id !== exportId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete export';
      setError(errorMessage);
      console.error('Delete export error:', err);
    }
  }, []);

  // Retry export
  const retryExport = useCallback(async (exportId: number) => {
    setError(null);

    try {
      const originalExport = exportRequests.find(exp => exp.id === exportId);
      if (!originalExport) {
        throw new Error('Export request not found');
      }

      // Create new export with same parameters
      await createExport(
        originalExport.exportType,
        'json', // Default format, this should come from the original request
        originalExport.dateRange,
        originalExport.filters
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to retry export';
      setError(errorMessage);
      console.error('Retry export error:', err);
    }
  }, [exportRequests, createExport]);

  // Download multiple exports
  const downloadMultiple = useCallback(async (exportIds: number[]) => {
    setError(null);

    try {
      for (const exportId of exportIds) {
        await downloadExport(exportId);
        // Add small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download multiple exports';
      setError(errorMessage);
      console.error('Download multiple exports error:', err);
    }
  }, [downloadExport]);

  // Delete multiple exports
  const deleteMultiple = useCallback(async (exportIds: number[]) => {
    setError(null);

    try {
      await Promise.all(exportIds.map(id => dataExportService.deleteExport(id)));
      setExportRequests(prev => prev.filter(exp => !exportIds.includes(exp.id)));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete multiple exports';
      setError(errorMessage);
      console.error('Delete multiple exports error:', err);
    }
  }, []);

  // Get export progress
  const getExportProgress = useCallback((exportId: number): number => {
    const exportRequest = exportRequests.find(exp => exp.id === exportId);
    if (!exportRequest) return 0;

    switch (exportRequest.status) {
      case 'pending':
        return 0;
      case 'processing':
        return 50; // Estimate, real implementation would track actual progress
      case 'completed':
        return 100;
      case 'failed':
      case 'cancelled':
        return 0;
      default:
        return 0;
    }
  }, [exportRequests]);

  // Get export status
  const getExportStatus = useCallback((exportId: number): ExportStatus => {
    const exportRequest = exportRequests.find(exp => exp.id === exportId);
    return exportRequest?.status || 'failed';
  }, [exportRequests]);

  // Clear history
  const clearHistory = useCallback(async () => {
    setError(null);

    try {
      // Delete all completed exports
      const completedIds = completedExports.map(exp => exp.id);
      if (completedIds.length > 0) {
        await deleteMultiple(completedIds);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear history';
      setError(errorMessage);
      console.error('Clear history error:', err);
    }
  }, [completedExports, deleteMultiple]);

  // Helper function to get file extension
  const getFileExtension = (exportType: string): string => {
    switch (exportType.toLowerCase()) {
      case 'json':
        return 'json';
      case 'csv':
        return 'csv';
      case 'excel':
        return 'xlsx';
      case 'pdf':
        return 'pdf';
      default:
        return 'txt';
    }
  };

  return {
    exportRequests,
    activeExports,
    completedExports,
    createExport,
    downloadExport,
    cancelExport,
    deleteExport,
    retryExport,
    downloadMultiple,
    deleteMultiple,
    getExportProgress,
    getExportStatus,
    loadExportHistory,
    clearHistory,
    isLoading,
    isExporting,
    error,
    totalExports,
    pendingCount,
    completedCount
  };
} 