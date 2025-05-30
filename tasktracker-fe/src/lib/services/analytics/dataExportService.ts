/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import { apiRequest } from '../apiClient';
import type {
  DataExportOptions,
  DataExportRequest,
  ExportFormat
} from '../../types/analytics';

/**
 * Service for data export operations
 */
export class DataExportService {
  private readonly baseUrl = '/api/v1/data-export';

  /**
   * Create a new export request
   */
  async createExportRequest(request: CreateExportRequest): Promise<DataExportRequest> {
    const response = await apiRequest<DataExportRequest>(
      this.baseUrl,
      'POST',
      request,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Get export history for the current user
   */
  async getExportHistory(): Promise<DataExportRequest[]> {
    const response = await apiRequest<DataExportRequest[]>(
      this.baseUrl,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Download an export file
   */
  async downloadExport(id: number): Promise<Blob> {
    const response = await apiRequest<Blob>(
      `${this.baseUrl}/${id}/download`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Get export status
   */
  async getExportStatus(id: number): Promise<any> {
    const response = await apiRequest(
      `${this.baseUrl}/${id}/status`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data;
  }

  /**
   * Delete an export request
   */
  async deleteExport(id: number): Promise<void> {
    const response = await apiRequest(
      `${this.baseUrl}/${id}`,
      'DELETE',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
  }

  /**
   * Get available export formats
   */
  async getExportFormats(): Promise<ExportFormat[]> {
    const response = await apiRequest<ExportFormat[]>(
      `${this.baseUrl}/formats`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Cleanup expired exports (admin only)
   */
  async cleanupExpiredExports(): Promise<any> {
    const response = await apiRequest(
      `${this.baseUrl}/cleanup`,
      'POST',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data;
  }

  /**
   * Export data to JSON format
   */
  async exportToJson(
    dataType: string,
    startDate: Date,
    endDate: Date,
    filters?: any
  ): Promise<DataExportRequest> {
    const request: CreateExportRequest = {
      exportType: 'json',
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      filters: filters || {}
    };

    return this.createExportRequest(request);
  }

  /**
   * Export data to CSV format
   */
  async exportToCsv(
    dataType: string,
    startDate: Date,
    endDate: Date,
    filters?: any
  ): Promise<DataExportRequest> {
    const request: CreateExportRequest = {
      exportType: 'csv',
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      filters: filters || {}
    };

    return this.createExportRequest(request);
  }

  /**
   * Export data to PDF format
   */
  async exportToPdf(
    dataType: string,
    startDate: Date,
    endDate: Date,
    filters?: any,
    includeCharts: boolean = false
  ): Promise<DataExportRequest> {
    const request: CreateExportRequest = {
      exportType: 'pdf',
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      filters: {
        ...filters,
        includeCharts
      }
    };

    return this.createExportRequest(request);
  }

  /**
   * Export data to Excel format
   */
  async exportToExcel(
    dataType: string,
    startDate: Date,
    endDate: Date,
    filters?: any
  ): Promise<DataExportRequest> {
    const request: CreateExportRequest = {
      exportType: 'excel',
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      filters: filters || {}
    };

    return this.createExportRequest(request);
  }

  /**
   * Download and save file to user's device
   */
  async downloadAndSaveFile(id: number, filename?: string): Promise<void> {
    try {
      const blob = await this.downloadExport(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `export_${id}_${Date.now()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  /**
   * Get export progress for a specific export
   */
  async getExportProgress(id: number): Promise<ExportProgress> {
    const response = await apiRequest<ExportProgress>(
      `${this.baseUrl}/${id}/progress`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Cancel an ongoing export
   */
  async cancelExport(id: number): Promise<void> {
    const response = await apiRequest(
      `${this.baseUrl}/${id}/cancel`,
      'POST',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
  }

  /**
   * Schedule a recurring export
   */
  async scheduleRecurringExport(request: ScheduleExportRequest): Promise<any> {
    const response = await apiRequest(
      `${this.baseUrl}/schedule`,
      'POST',
      request,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data;
  }

  /**
   * Get scheduled exports
   */
  async getScheduledExports(): Promise<any[]> {
    const response = await apiRequest<any[]>(
      `${this.baseUrl}/scheduled`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Validate export request before submission
   */
  validateExportRequest(request: CreateExportRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate export type
    if (!request.exportType) {
      errors.push('Export type is required');
    }

    // Validate date range
    if (!request.dateRange) {
      errors.push('Date range is required');
    } else {
      const startDate = new Date(request.dateRange.startDate);
      const endDate = new Date(request.dateRange.endDate);
      
      if (isNaN(startDate.getTime())) {
        errors.push('Invalid start date');
      }
      
      if (isNaN(endDate.getTime())) {
        errors.push('Invalid end date');
      }
      
      if (startDate > endDate) {
        errors.push('Start date must be before end date');
      }

      // Check if date range is too large (more than 1 year)
      const oneYear = 365 * 24 * 60 * 60 * 1000;
      if (endDate.getTime() - startDate.getTime() > oneYear) {
        errors.push('Date range cannot exceed 1 year');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get export file size estimate
   */
  async getExportSizeEstimate(request: CreateExportRequest): Promise<number> {
    const response = await apiRequest<{ estimatedSize: number }>(
      `${this.baseUrl}/estimate-size`,
      'POST',
      request,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!.estimatedSize;
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Request types
export interface CreateExportRequest {
  exportType: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  filters: any;
}

export interface ScheduleExportRequest {
  exportType: string;
  schedule: string; // cron expression
  dateRange: {
    startDate: string;
    endDate: string;
  };
  filters: any;
  enabled: boolean;
}

export interface ExportProgress {
  id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  estimatedTimeRemaining?: number; // seconds
  message?: string;
}

// Create and export singleton instance
export const dataExportService = new DataExportService(); 