/*
 * Background Service Management Service
 * Handles background service status monitoring, maintenance notifications, and system optimization
 */

import { apiService } from './apiService';
import { ApiResponse } from '@/lib/types/api';

export interface BackgroundServiceStatus {
  serviceName: string;
  status: string; // Running, Stopped, Error, Idle
  message?: string;
  lastRun?: string;
  nextRun?: string;
  isHealthy: boolean;
  executionCount: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface BackgroundServiceExecution {
  id: number;
  serviceName: string;
  executionTime: string;
  success: boolean;
  details?: string;
  recordsProcessed?: number;
  duration?: string;
  errorMessage?: string;
}

export interface SystemMaintenanceNotification {
  id: number;
  title: string;
  message: string;
  type: string; // Scheduled, Emergency, Completed
  priority: string; // Low, Medium, High, Critical
  scheduledStart?: string;
  scheduledEnd?: string;
  isActive: boolean;
  affectedServices?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMaintenanceNotification {
  title: string;
  message: string;
  type: string;
  priority: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  affectedServices?: string;
}

export interface SystemOptimizationRecommendation {
  id: number;
  category: string; // Performance, Security, Maintenance, Resource
  title: string;
  description: string;
  recommendation: string;
  priority: string; // Low, Medium, High, Critical
  impact: string; // Low, Medium, High
  isImplemented: boolean;
  createdAt: string;
  implementedAt?: string;
  implementationNotes?: string;
}

export interface ServiceMetric {
  serviceName: string;
  executionCount: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  averageExecutionTime?: string;
  lastExecution?: string;
  status: string;
}

export interface BackgroundServiceMetrics {
  totalServices: number;
  runningServices: number;
  errorServices: number;
  idleServices: number;
  overallSuccessRate: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  lastExecutionTime?: string;
  serviceMetrics: ServiceMetric[];
  generatedAt: string;
}

export interface ServiceHealthSummary {
  overallHealth: string;
  totalServices: number;
  healthyServices: number;
  errorServices: number;
  services: BackgroundServiceStatus[];
}

export interface PriorityAdjustmentNotification {
  userId: number;
  taskId: number;
  taskTitle: string;
  previousPriority: string;
  newPriority: string;
  adjustmentReason: string;
  adjustmentTime: string;
  userCanOverride: boolean;
}

class BackgroundServiceService {
  private baseUrl = '/v1/backgroundservice';

  /**
   * Gets the status of all background services (Admin only)
   */
  async getAllServiceStatus(): Promise<ApiResponse<BackgroundServiceStatus[]>> {
    try {
      const response = await apiService.get<BackgroundServiceStatus[]>(
        `${this.baseUrl}/status`
      );
      return response;
    } catch (error) {
      console.error('Error getting all service status:', error);
      throw error;
    }
  }

  /**
   * Gets the status of a specific background service (Admin only)
   */
  async getServiceStatus(serviceName: string): Promise<ApiResponse<BackgroundServiceStatus>> {
    try {
      const response = await apiService.get<BackgroundServiceStatus>(
        `${this.baseUrl}/status/${serviceName}`
      );
      return response;
    } catch (error) {
      console.error('Error getting service status:', error);
      throw error;
    }
  }

  /**
   * Gets execution history for a specific service (Admin only)
   */
  async getServiceExecutionHistory(
    serviceName: string,
    count: number = 10
  ): Promise<ApiResponse<BackgroundServiceExecution[]>> {
    try {
      const response = await apiService.get<BackgroundServiceExecution[]>(
        `${this.baseUrl}/history/${serviceName}?count=${count}`
      );
      return response;
    } catch (error) {
      console.error('Error getting service execution history:', error);
      throw error;
    }
  }

  /**
   * Gets system maintenance notifications
   */
  async getMaintenanceNotifications(
    activeOnly: boolean = true
  ): Promise<ApiResponse<SystemMaintenanceNotification[]>> {
    try {
      const response = await apiService.get<SystemMaintenanceNotification[]>(
        `${this.baseUrl}/maintenance?activeOnly=${activeOnly}`
      );
      return response;
    } catch (error) {
      console.error('Error getting maintenance notifications:', error);
      throw error;
    }
  }

  /**
   * Creates a system maintenance notification (Admin only)
   */
  async createMaintenanceNotification(
    notification: CreateMaintenanceNotification
  ): Promise<ApiResponse<SystemMaintenanceNotification>> {
    try {
      const response = await apiService.post<SystemMaintenanceNotification>(
        `${this.baseUrl}/maintenance`,
        notification
      );
      return response;
    } catch (error) {
      console.error('Error creating maintenance notification:', error);
      throw error;
    }
  }

  /**
   * Gets automated system optimization recommendations (Admin only)
   */
  async getOptimizationRecommendations(): Promise<ApiResponse<SystemOptimizationRecommendation[]>> {
    try {
      const response = await apiService.get<SystemOptimizationRecommendation[]>(
        `${this.baseUrl}/recommendations`
      );
      return response;
    } catch (error) {
      console.error('Error getting optimization recommendations:', error);
      throw error;
    }
  }

  /**
   * Gets background service metrics summary (Admin only)
   */
  async getServiceMetrics(
    fromDate?: string,
    toDate?: string
  ): Promise<ApiResponse<BackgroundServiceMetrics>> {
    try {
      let url = `${this.baseUrl}/metrics`;
      const params = [];
      
      if (fromDate) params.push(`fromDate=${fromDate}`);
      if (toDate) params.push(`toDate=${toDate}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await apiService.get<BackgroundServiceMetrics>(url);
      return response;
    } catch (error) {
      console.error('Error getting service metrics:', error);
      throw error;
    }
  }

  /**
   * Gets the current health status of all background services for dashboard display
   */
  async getServiceHealth(): Promise<ApiResponse<ServiceHealthSummary>> {
    try {
      const response = await apiService.get<ServiceHealthSummary>(
        `${this.baseUrl}/health`
      );
      return response;
    } catch (error) {
      console.error('Error getting service health:', error);
      throw error;
    }
  }

  /**
   * Formats service status for display
   */
  formatServiceStatus(status: string): { text: string; color: string; icon: string } {
    switch (status.toLowerCase()) {
      case 'running':
        return { text: 'Running', color: 'text-green-600', icon: '🟢' };
      case 'stopped':
        return { text: 'Stopped', color: 'text-gray-600', icon: '⚪' };
      case 'error':
        return { text: 'Error', color: 'text-red-600', icon: '🔴' };
      case 'idle':
        return { text: 'Idle', color: 'text-blue-600', icon: '🔵' };
      default:
        return { text: 'Unknown', color: 'text-gray-500', icon: '❓' };
    }
  }

  /**
   * Formats priority for display
   */
  formatPriority(priority: string): { text: string; color: string; icon: string } {
    switch (priority.toLowerCase()) {
      case 'critical':
        return { text: 'Critical', color: 'text-red-600', icon: '🚨' };
      case 'high':
        return { text: 'High', color: 'text-orange-600', icon: '⚠️' };
      case 'medium':
        return { text: 'Medium', color: 'text-yellow-600', icon: '⚡' };
      case 'low':
        return { text: 'Low', color: 'text-green-600', icon: '📝' };
      default:
        return { text: 'Unknown', color: 'text-gray-500', icon: '❓' };
    }
  }

  /**
   * Formats execution duration
   */
  formatDuration(duration?: string): string {
    if (!duration) return 'N/A';
    
    // Parse TimeSpan format (HH:mm:ss.fff)
    const parts = duration.split(':');
    if (parts.length >= 3) {
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      const seconds = parseFloat(parts[2]);
      
      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds.toFixed(1)}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds.toFixed(1)}s`;
      } else {
        return `${seconds.toFixed(1)}s`;
      }
    }
    
    return duration;
  }

  /**
   * Gets health color based on percentage
   */
  getHealthColor(percentage: number): string {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Gets overall health status color
   */
  getOverallHealthColor(health: string): string {
    switch (health.toLowerCase()) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }
}

export const backgroundServiceService = new BackgroundServiceService(); 