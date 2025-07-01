/*
 * Focus Service for Enterprise TaskTracker System
 * Copyright (c) 2025 Carlos Abril Jr
 * Following Enterprise Standards and Family Auth Implementation Checklist
 */

import { apiClient, ApiClientError } from '@/lib/config/api-client';
import type { 
  FocusSessionDTO, 
  FocusSession,
  TaskItemDTO,
  TaskItem,
  DistractionDTO,
  Distraction,
  CreateFocusSessionDTO,
  CompleteFocusSessionDTO,
  CreateDistractionDTO,
  FocusStatisticsDTO,
  FocusStatistics,
  ProductivityInsightsDTO,
  FocusSessionStats,
  BulkDeleteResultDTO,
  BulkDeleteRequest,
  BulkDeleteResult,
  ClearHistoryResultDTO,
  ClearHistoryResult,
  FocusHistoryExportDTO,
  FocusHistoryExport,
  FailedDeleteDTO
} from '@/lib/types/focus';

// ================================
// ERROR HANDLING
// ================================

export class FocusServiceError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, string[]>,
    public sessionId?: number,
    public taskId?: number
  ) {
    super(message);
    this.name = 'FocusServiceError';
  }
}

// ================================
// DATA TRANSFORMATION UTILITIES
// ================================

/**
 * Transform backend focus session DTO to frontend DTO
 * Handles date conversion and property mapping
 */
function transformBackendSessionToFrontend(backendSession: FocusSessionDTO): FocusSession {
  return {
    id: backendSession.id,
    userId: backendSession.userId,
    taskId: backendSession.taskId,
    startTime: new Date(backendSession.startTime),
    endTime: backendSession.endTime ? new Date(backendSession.endTime) : undefined,
    durationMinutes: backendSession.durationMinutes,
    isCompleted: backendSession.isCompleted,
    notes: backendSession.notes,
    sessionQualityRating: backendSession.sessionQualityRating,
    completionNotes: backendSession.completionNotes,
    taskProgressBefore: backendSession.taskProgressBefore,
    taskProgressAfter: backendSession.taskProgressAfter,
    taskCompletedDuringSession: backendSession.taskCompletedDuringSession,
    status: backendSession.status,
    taskItem: backendSession.taskItem ? transformBackendTaskToFrontend(backendSession.taskItem) : undefined,
    distractions: backendSession.distractions?.map(transformBackendDistractionToFrontend)
  };
}

/**
 * Transform backend task DTO to frontend task
 */
function transformBackendTaskToFrontend(backendTask: TaskItemDTO): TaskItem {
  return {
    id: backendTask.id,
    title: backendTask.title,
    description: backendTask.description,
    status: backendTask.status,
    priority: backendTask.priority,
    dueDate: backendTask.dueDate ? new Date(backendTask.dueDate) : undefined,
    createdAt: new Date(backendTask.createdAt),
    updatedAt: backendTask.updatedAt ? new Date(backendTask.updatedAt) : undefined,
    isCompleted: backendTask.isCompleted,
    userId: backendTask.userId,
    progressPercentage: backendTask.progressPercentage,
    actualTimeSpentMinutes: backendTask.actualTimeSpentMinutes,
    categoryId: backendTask.categoryId,
    categoryName: backendTask.categoryName
  };
}

/**
 * Transform backend distraction DTO to frontend distraction
 */
function transformBackendDistractionToFrontend(backendDistraction: DistractionDTO): Distraction {
  return {
    id: backendDistraction.id,
    focusSessionId: backendDistraction.focusSessionId,
    description: backendDistraction.description,
    category: backendDistraction.category,
    timestamp: new Date(backendDistraction.timestamp)
  };
}

/**
 * Transform backend statistics DTO to frontend statistics
 */
function transformBackendStatisticsToFrontend(backendStats: FocusStatisticsDTO): FocusStatistics {
  return {
    totalMinutesFocused: backendStats.totalMinutesFocused,
    sessionCount: backendStats.sessionCount,
    distractionCount: backendStats.distractionCount,
    distractionsByCategory: backendStats.distractionsByCategory,
    averageSessionLength: backendStats.averageSessionLength,
    dailyFocusMinutes: backendStats.dailyFocusMinutes,
    // Computed properties
    focusEfficiencyScore: backendStats.sessionCount > 0 
      ? Math.max(0, 1 - (backendStats.distractionCount / backendStats.sessionCount / 5)) 
      : 0,
    averageDistractions: backendStats.sessionCount > 0 
      ? backendStats.distractionCount / backendStats.sessionCount 
      : 0,
    bestFocusDay: Object.entries(backendStats.dailyFocusMinutes)
      .sort(([,a], [,b]) => b - a)[0]?.[0]
  };
}

/**
 * Transform array of backend sessions to frontend sessions
 */
function transformBackendSessionsToFrontend(backendSessions: FocusSessionDTO[]): FocusSession[] {
  if (!Array.isArray(backendSessions)) {
    console.warn('⚠️ transformBackendSessionsToFrontend: Expected array but got:', typeof backendSessions);
    return [];
  }

  return backendSessions.map(session => {
    try {
      return transformBackendSessionToFrontend(session);
    } catch (error) {
      console.error('❌ Failed to transform backend session:', session, error);
      // Return a minimal valid session to prevent crashes
      return {
        id: session.id || 0,
        userId: session.userId || 0,
        taskId: session.taskId || 0,
        startTime: new Date(),
        durationMinutes: 0,
        isCompleted: false,
        taskProgressBefore: 0,
        taskProgressAfter: 0,
        taskCompletedDuringSession: false,
        status: 'Interrupted' as const
      };
    }
  });
}

// ================================
// ENTERPRISE FOCUS SERVICE
// ================================

export class FocusService {
  private readonly baseUrl = '/v1/focus';

  /**
   * Get current active focus session
   * BACKEND: GET /api/v1/focus/current
   */
  async getCurrentSession(): Promise<FocusSession | null> {
    try {
      console.log('🎯 FocusService: Fetching current focus session');

      const result = await apiClient.get<FocusSessionDTO>(`${this.baseUrl}/current`);
      
      if (!result) {
        console.log('🎯 FocusService: No active session found');
        return null;
      }

      console.log('🎯 FocusService: Current session:', result);
      return transformBackendSessionToFrontend(result);
    } catch (error: unknown) {
      // Defensive programming: Handle 404 as normal "no session" state
      // This prevents uncaught promise rejections per .cursorrules
      
      // Check for ApiClientError instances first (most specific)
      if (error instanceof ApiClientError) {
        if (error.statusCode === 404) {
          console.log('🎯 FocusService: No active session found (ApiClientError 404)');
          return null; // No active session - this is normal
        }
        // Re-throw non-404 ApiClientErrors as FocusServiceError
        throw new FocusServiceError(
          error.message,
          error.statusCode,
          'API_CLIENT_ERROR'
        );
      }
      
      // Check for generic objects with statusCode property
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const apiError = error as { statusCode: number; message?: string };
        if (apiError.statusCode === 404) {
          console.log('🎯 FocusService: No active session found (Generic 404)');
          return null; // No active session - this is normal
        }
      }
      
      // Check for error messages indicating "no session"
      if (error && typeof error === 'object' && 'message' in error) {
        const errorWithMessage = error as { message: string };
        if (errorWithMessage.message.includes('No active focus session') ||
            errorWithMessage.message.includes('404') ||
            errorWithMessage.message.includes('Not Found')) {
          console.log('🎯 FocusService: No active session found (message pattern)');
          return null; // No active session - this is normal
        }
      }
      
      // Only log and throw for truly unexpected errors
      console.error('❌ FocusService: Unexpected error fetching current session:', error);
      throw new FocusServiceError(
        'Failed to fetch current focus session',
        500,
        'FETCH_CURRENT_ERROR'
      );
    }
  }

  /**
   * Start a new focus session
   * BACKEND: POST /api/v1/focus/start
   */
  async startSession(sessionData: CreateFocusSessionDTO): Promise<FocusSession> {
    try {
      console.log('🎯 FocusService: Starting focus session:', sessionData);

      const result = await apiClient.post<FocusSessionDTO>(`${this.baseUrl}/start`, {
        taskId: sessionData.taskId,
        durationMinutes: sessionData.durationMinutes || 25,
        notes: sessionData.notes,
        forceStart: sessionData.forceStart || false
      });

      console.log('🎯 FocusService: Session started successfully:', result);
      
      // Handle null response (API error that was treated as expected)
      if (!result) {
        throw new FocusServiceError(
          'Failed to start focus session - no response from server',
          500,
          'NULL_RESPONSE_ERROR'
        );
      }
      
      return transformBackendSessionToFrontend(result);
    } catch (error) {
      console.error('❌ FocusService: Failed to start session:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('already have an active')) {
          throw new FocusServiceError(
            'You already have an active focus session. End it first or use force start.',
            400,
            'SESSION_EXISTS'
          );
        }
        if (error.message.includes('Task not found')) {
          throw new FocusServiceError(
            'Selected task not found or does not belong to you',
            404,
            'TASK_NOT_FOUND',
            undefined,
            undefined,
            sessionData.taskId
          );
        }
      }
      
      throw new FocusServiceError(
        'Failed to start focus session',
        500,
        'START_SESSION_ERROR'
      );
    }
  }

  /**
   * Switch to a different task (end current + start new)
   * BACKEND: POST /api/v1/focus/switch
   */
  async switchSession(sessionData: CreateFocusSessionDTO): Promise<FocusSession> {
    try {
      console.log('🎯 FocusService: Switching focus session:', sessionData);

      const result = await apiClient.post<FocusSessionDTO>(`${this.baseUrl}/switch`, {
        taskId: sessionData.taskId,
        durationMinutes: sessionData.durationMinutes || 25,
        notes: sessionData.notes
      });

      console.log('🎯 FocusService: Session switched successfully:', result);
      return transformBackendSessionToFrontend(result);
    } catch (error) {
      console.error('❌ FocusService: Failed to switch session:', error);
      throw new FocusServiceError(
        'Failed to switch focus session',
        500,
        'SWITCH_SESSION_ERROR'
      );
    }
  }

  /**
   * Pause current focus session
   * BACKEND: POST /api/v1/focus/current/pause
   * ✅ ENTERPRISE ERROR HANDLING: Comprehensive error categorization
   */
  async pauseCurrentSession(): Promise<FocusSession> {
    try {
      console.log('🎯 FocusService: Pausing current session');

      const result = await apiClient.post<FocusSessionDTO>(`${this.baseUrl}/current/pause`);

      if (!result) {
        throw new FocusServiceError(
          'No response received from pause endpoint',
          500,
          'EMPTY_RESPONSE_ERROR'
        );
      }

      console.log('🎯 FocusService: Session paused successfully:', result);
      return transformBackendSessionToFrontend(result);
    } catch (error: unknown) {
      console.error('❌ FocusService: Failed to pause session:', error);

      // ✅ ENTERPRISE ERROR HANDLING: Explicit error type checking
      if (error instanceof ApiClientError) {
        if (error.statusCode === 404) {
          throw new FocusServiceError(
            'No active session found to pause',
            404,
            'NO_ACTIVE_SESSION',
            undefined,
            undefined,
            undefined
          );
        } else if (error.statusCode === 400) {
          throw new FocusServiceError(
            'Invalid session state for pausing',
            400,
            'INVALID_SESSION_STATE',
            undefined,
            undefined,
            undefined
          );
        } else if (error.statusCode === 500) {
          throw new FocusServiceError(
            'Backend error while pausing session. Please try refreshing.',
            500,
            'BACKEND_ERROR',
            undefined,
            undefined,
            undefined
          );
        }
      }

      // ✅ FALLBACK: Generic error for unknown issues
      throw new FocusServiceError(
        'Failed to pause focus session',
        500,
        'PAUSE_SESSION_ERROR'
      );
    }
  }

  /**
   * Resume paused focus session
   * BACKEND: POST /api/v1/focus/{id}/resume
   * ✅ ENTERPRISE ERROR HANDLING: Comprehensive error categorization
   */
  async resumeSession(sessionId: number): Promise<FocusSession> {
    try {
      console.log('🎯 FocusService: Resuming session:', sessionId);

      const result = await apiClient.post<FocusSessionDTO>(`${this.baseUrl}/${sessionId}/resume`);

      if (!result) {
        throw new FocusServiceError(
          'No response received from resume endpoint',
          500,
          'EMPTY_RESPONSE_ERROR',
          undefined,
          sessionId
        );
      }

      console.log('🎯 FocusService: Session resumed successfully:', result);
      return transformBackendSessionToFrontend(result);
    } catch (error: unknown) {
      console.error('❌ FocusService: Failed to resume session:', error);

      // ✅ ENTERPRISE ERROR HANDLING: Explicit error type checking
      if (error instanceof ApiClientError) {
        if (error.statusCode === 404) {
          throw new FocusServiceError(
            'Session not found or not accessible',
            404,
            'SESSION_NOT_FOUND',
            undefined,
            sessionId
          );
        } else if (error.statusCode === 400) {
          throw new FocusServiceError(
            'Only paused sessions can be resumed',
            400,
            'INVALID_SESSION_STATE',
            undefined,
            sessionId
          );
        } else if (error.statusCode === 500) {
          throw new FocusServiceError(
            'Backend error while resuming session. Please try refreshing.',
            500,
            'BACKEND_ERROR',
            undefined,
            sessionId
          );
        }
      }

      // ✅ FALLBACK: Generic error for unknown issues
      throw new FocusServiceError(
        'Failed to resume focus session',
        500,
        'RESUME_SESSION_ERROR',
        undefined,
        sessionId
      );
    }
  }

  /**
   * End current focus session
   * BACKEND: POST /api/v1/focus/current/end
   * ✅ ENTERPRISE ERROR HANDLING: Comprehensive error categorization
   */
  async endCurrentSession(): Promise<FocusSession> {
    try {
      console.log('🎯 FocusService: Ending current session');

      const result = await apiClient.post<FocusSessionDTO>(`${this.baseUrl}/current/end`);

      if (!result) {
        throw new FocusServiceError(
          'No response received from end endpoint',
          500,
          'EMPTY_RESPONSE_ERROR'
        );
      }

      console.log('🎯 FocusService: Session ended successfully:', result);
      return transformBackendSessionToFrontend(result);
    } catch (error: unknown) {
      console.error('❌ FocusService: Failed to end session:', error);

      // ✅ ENTERPRISE ERROR HANDLING: Explicit error type checking
      if (error instanceof ApiClientError) {
        if (error.statusCode === 404) {
          throw new FocusServiceError(
            'No active session found to end',
            404,
            'NO_ACTIVE_SESSION'
          );
        } else if (error.statusCode === 400) {
          throw new FocusServiceError(
            'Invalid session state for ending',
            400,
            'INVALID_SESSION_STATE'
          );
        } else if (error.statusCode === 500) {
          throw new FocusServiceError(
            'Backend error while ending session. Please try refreshing.',
            500,
            'BACKEND_ERROR'
          );
        }
      }

      // ✅ FALLBACK: Generic error for unknown issues
      throw new FocusServiceError(
        'Failed to end focus session',
        500,
        'END_SESSION_ERROR'
      );
    }
  }

  /**
   * Complete focus session with details
   * BACKEND: PUT /api/v1/focus/{id}/complete
   */
  async completeSession(sessionId: number, completion: CompleteFocusSessionDTO): Promise<FocusSession> {
    try {
      console.log('🎯 FocusService: Completing session:', sessionId, completion);

      const result = await apiClient.put<FocusSessionDTO>(`${this.baseUrl}/${sessionId}/complete`, completion);

      console.log('🎯 FocusService: Session completed successfully:', result);
      return transformBackendSessionToFrontend(result);
    } catch (error) {
      console.error('❌ FocusService: Failed to complete session:', error);
      throw new FocusServiceError(
        'Failed to complete focus session',
        500,
        'COMPLETE_SESSION_ERROR',
        undefined,
        sessionId
      );
    }
  }

  /**
   * Record a distraction during focus session
   * BACKEND: POST /api/v1/focus/distraction
   */
  async recordDistraction(distraction: CreateDistractionDTO): Promise<Distraction> {
    try {
      console.log('🎯 FocusService: Recording distraction:', distraction);

      const result = await apiClient.post<DistractionDTO>(`${this.baseUrl}/distraction`, distraction);

      console.log('🎯 FocusService: Distraction recorded successfully:', result);
      return transformBackendDistractionToFrontend(result);
    } catch (error) {
      console.error('❌ FocusService: Failed to record distraction:', error);
      throw new FocusServiceError(
        'Failed to record distraction',
        500,
        'RECORD_DISTRACTION_ERROR',
        undefined,
        distraction.sessionId
      );
    }
  }

  /**
   * Get focus suggestions for task selection
   * BACKEND: GET /api/v1/focus/suggestions?count={count}
   */
  async getFocusSuggestions(count: number = 5): Promise<TaskItem[]> {
    try {
      console.log('🎯 FocusService: Fetching focus suggestions, count:', count);

      const result = await apiClient.get<TaskItemDTO[]>(`${this.baseUrl}/suggestions?count=${count}`);

      console.log('🎯 FocusService: Suggestions fetched:', result?.length || 0);
      
      if (!result || !Array.isArray(result)) {
        return [];
      }

      return result.map(transformBackendTaskToFrontend);
    } catch (error) {
      console.error('❌ FocusService: Failed to fetch suggestions:', error);
      return []; // Return empty array instead of throwing - suggestions are optional
    }
  }

  /**
   * Get focus statistics
   * BACKEND: GET /api/v1/focus/statistics?startDate={start}&endDate={end}
   */
  async getFocusStatistics(startDate?: Date, endDate?: Date): Promise<FocusStatistics> {
    try {
      console.log('🎯 FocusService: Fetching focus statistics');

      let endpoint = `${this.baseUrl}/statistics`;
      if (startDate && endDate) {
        endpoint += `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      }

      const result = await apiClient.get<FocusStatisticsDTO>(endpoint);

      console.log('🎯 FocusService: Statistics fetched:', result);
      return transformBackendStatisticsToFrontend(result);
    } catch (error) {
      console.error('❌ FocusService: Failed to fetch statistics:', error);
      throw new FocusServiceError(
        'Failed to fetch focus statistics',
        500,
        'FETCH_STATISTICS_ERROR'
      );
    }
  }

  /**
   * Get focus session history
   * BACKEND: GET /api/v1/focus/history
   */
  async getFocusHistory(): Promise<FocusSession[]> {
    try {
      console.log('🎯 FocusService: Fetching focus history');

      const result = await apiClient.get<FocusSessionDTO[]>(`${this.baseUrl}/history`);

      console.log('🎯 FocusService: History fetched:', result?.length || 0, 'sessions');
      return transformBackendSessionsToFrontend(result || []);
    } catch (error) {
      console.error('❌ FocusService: Failed to fetch history:', error);
      throw new FocusServiceError(
        'Failed to fetch focus session history',
        500,
        'FETCH_HISTORY_ERROR'
      );
    }
  }

  /**
   * Get productivity insights
   * BACKEND: GET /api/v1/focus/insights?startDate={start}&endDate={end}
   */
  async getProductivityInsights(startDate?: Date, endDate?: Date): Promise<ProductivityInsightsDTO> {
    try {
      console.log('🎯 FocusService: Fetching productivity insights');

      let endpoint = `${this.baseUrl}/insights`;
      if (startDate && endDate) {
        endpoint += `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      }

      const result = await apiClient.get<ProductivityInsightsDTO>(endpoint);

      console.log('🎯 FocusService: Insights fetched:', result);
      return result;
    } catch (error) {
      console.error('❌ FocusService: Failed to fetch insights:', error);
      throw new FocusServiceError(
        'Failed to fetch productivity insights',
        500,
        'FETCH_INSIGHTS_ERROR'
      );
    }
  }

  /**
   * Get session distractions
   * BACKEND: GET /api/v1/focus/{id}/distractions
   */
  async getSessionDistractions(sessionId: number): Promise<Distraction[]> {
    try {
      console.log('🎯 FocusService: Fetching session distractions:', sessionId);

      const result = await apiClient.get<DistractionDTO[]>(`${this.baseUrl}/${sessionId}/distractions`);

      console.log('🎯 FocusService: Distractions fetched:', result?.length || 0);
      
      if (!result || !Array.isArray(result)) {
        return [];
      }

      return result.map(transformBackendDistractionToFrontend);
    } catch (error) {
      console.error('❌ FocusService: Failed to fetch distractions:', error);
      return []; // Return empty array instead of throwing - distractions are optional
    }
  }

  /**
   * Get user focus statistics for enhanced analytics
   */
  async getUserFocusStats(userId: number): Promise<FocusSessionStats> {
    try {
      console.log('🎯 FocusService: Fetching user focus stats:', userId);

      // Since we don't have a specific stats endpoint, use existing statistics and transform
      const stats = await this.getFocusStatistics();
      
      return {
        totalSessions: stats.sessionCount,
        totalMinutes: stats.totalMinutesFocused,
        averageSessionLength: stats.averageSessionLength,
        currentStreak: 0, // Would need backend support
        longestStreak: 0, // Would need backend support
        thisWeekSessions: Object.values(stats.dailyFocusMinutes).length,
        thisMonthSessions: stats.sessionCount,
        completionRate: stats.focusEfficiencyScore,
        mostProductiveHour: 10, // Default value - would need backend analysis
        favoriteTaskCategory: 'General', // Default value - would need backend analysis
      };
    } catch (error) {
      console.error('❌ FocusService: Failed to fetch user focus stats:', error);
      // Return default stats for graceful degradation
      return {
        totalSessions: 0,
        totalMinutes: 0,
        averageSessionLength: 0,
        currentStreak: 0,
        longestStreak: 0,
        thisWeekSessions: 0,
        thisMonthSessions: 0,
        completionRate: 0,
        mostProductiveHour: 10,
        favoriteTaskCategory: 'General',
      };
    }
  }

  /**
   * Delete a focus session
   * BACKEND: DELETE /api/v1/focus/{id}
   */
  async deleteFocusSession(sessionId: number): Promise<boolean> {
    try {
      console.log('🗑️ FocusService: Deleting session:', sessionId);

      const result = await apiClient.delete<boolean>(`${this.baseUrl}/${sessionId}`);

      console.log('✅ FocusService: Session deleted successfully:', sessionId);
      return result ?? false;
    } catch (error) {
      console.error('❌ FocusService: Failed to delete session:', error);
      throw new FocusServiceError(
        'Failed to delete focus session',
        500,
        'DELETE_SESSION_ERROR'
      );
    }
  }

  /**
   * Bulk delete focus sessions
   * BACKEND: DELETE /api/v1/focus/bulk
   */
  async bulkDeleteFocusSessions(sessionIds: number[]): Promise<BulkDeleteResult> {
    try {
      console.log('🗑️ FocusService: Bulk deleting sessions:', sessionIds.length);

      const request: BulkDeleteRequest = {
        sessionIds,
        confirmationToken: `bulk_delete_${Date.now()}`
      };

             const result = await apiClient.post<BulkDeleteResultDTO>(`${this.baseUrl}/bulk-delete`, request);

      if (!result) {
        throw new Error('No response received from bulk delete');
      }

             const transformedResult: BulkDeleteResult = {
         requestedCount: result.requestedCount,
         successfulDeletes: result.successfulDeletes,
         failedDeletes: result.failedDeletes.map((failed: FailedDeleteDTO) => ({
           sessionId: failed.sessionId,
           reason: failed.reason
         })),
         successCount: result.successCount,
         failedCount: result.failedCount,
         successRate: result.successRate
       };

      console.log('✅ FocusService: Bulk delete completed:', 
        `${transformedResult.successCount}/${transformedResult.requestedCount} successful`);
      
      return transformedResult;
    } catch (error) {
      console.error('❌ FocusService: Bulk delete failed:', error);
      throw new FocusServiceError(
        'Failed to bulk delete focus sessions',
        500,
        'BULK_DELETE_ERROR'
      );
    }
  }

  /**
   * Clear focus history (delete all or before date)
   * BACKEND: DELETE /api/v1/focus/clear-history
   */
  async clearFocusHistory(beforeDate?: Date): Promise<ClearHistoryResult> {
    try {
      console.log('🗑️ FocusService: Clearing history:', beforeDate ? `before ${beforeDate.toISOString()}` : 'all sessions');

             const queryParams = beforeDate ? `?beforeDate=${encodeURIComponent(beforeDate.toISOString())}` : '';
       const result = await apiClient.delete<ClearHistoryResultDTO>(`${this.baseUrl}/clear-history${queryParams}`);

      if (!result) {
        throw new Error('No response received from clear history');
      }

      const transformedResult: ClearHistoryResult = {
        deletedSessionCount: result.deletedSessionCount,
        totalMinutesDeleted: result.totalMinutesDeleted,
        totalHoursDeleted: result.totalHoursDeleted,
        dateFilter: result.dateFilter ? new Date(result.dateFilter) : undefined,
        clearedAt: new Date(result.clearedAt)
      };

      console.log('✅ FocusService: History cleared:', 
        `${transformedResult.deletedSessionCount} sessions (${transformedResult.totalHoursDeleted.toFixed(1)}h)`);
      
      return transformedResult;
    } catch (error) {
      console.error('❌ FocusService: Failed to clear history:', error);
      throw new FocusServiceError(
        'Failed to clear focus history',
        500,
        'CLEAR_HISTORY_ERROR'
      );
    }
  }

  /**
   * Export focus history
   * BACKEND: GET /api/v1/focus/export
   */
  async exportFocusHistory(startDate?: Date, endDate?: Date, format: string = 'json'): Promise<FocusHistoryExport> {
    try {
      console.log('📤 FocusService: Exporting history:', { startDate, endDate, format });

             const queryParams = new URLSearchParams({ format });
       if (startDate) queryParams.set('startDate', startDate.toISOString());
       if (endDate) queryParams.set('endDate', endDate.toISOString());

       const result = await apiClient.get<FocusHistoryExportDTO>(`${this.baseUrl}/export?${queryParams.toString()}`);

      if (!result) {
        throw new Error('No response received from export');
      }

      const transformedResult: FocusHistoryExport = {
        exportDate: new Date(result.exportDate),
        startDate: new Date(result.startDate),
        endDate: new Date(result.endDate),
        totalSessions: result.totalSessions,
        totalMinutes: result.totalMinutes,
        sessions: transformBackendSessionsToFrontend(result.sessions),
        summary: {
          averageSessionLength: result.summary.averageSessionLength,
          completedSessions: result.summary.completedSessions,
          interruptedSessions: result.summary.interruptedSessions,
          totalDistractions: result.summary.totalDistractions,
          completionRate: result.summary.completionRate,
          mostProductiveDay: result.summary.mostProductiveDay,
          totalHours: result.summary.totalHours
        },
        metadata: {
          format: result.metadata.format,
          version: result.metadata.version,
          generatedBy: result.metadata.generatedBy,
          includesPersonalData: result.metadata.includesPersonalData
        }
      };

      console.log('✅ FocusService: History exported:', 
        `${transformedResult.totalSessions} sessions (${transformedResult.totalMinutes}min)`);
      
      return transformedResult;
    } catch (error) {
      console.error('❌ FocusService: Failed to export history:', error);
      throw new FocusServiceError(
        'Failed to export focus history',
        500,
        'EXPORT_HISTORY_ERROR'
      );
    }
  }
}

// ================================
// SINGLETON EXPORT
// ================================

export const focusService = new FocusService(); 