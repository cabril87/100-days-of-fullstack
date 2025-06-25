/*
 * Calendar Service for Enterprise TaskTracker System
 * Copyright (c) 2025 Carlos Abril Jr
 * Following Enterprise Standards and Family Auth Implementation Checklist
 */

import { apiClient } from '@/lib/config/api-client';
import { ApiResponse } from '@/lib/types/api-responses';
import type { CalendarEventDTO } from '@/lib/types/calendar';

// ================================
// BACKEND CALENDAR DTOs - ALIGNED WITH API
// ================================

interface BackendCalendarEventDTO {
  id: number;
  title: string;
  description?: string;
  startTime: string; // ISO string from API
  endTime: string; // ISO string from API
  isAllDay: boolean;
  location?: string;
  color?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  eventType: string;
  familyId: number;
  createdBy: {
    id: number;
    name: string;
  };
  createdAt: string; // ISO string from API
  updatedAt?: string; // ISO string from API
}

export interface CreateCalendarEventDTO {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  location?: string;
  color?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  eventType: string;
  familyId: number;
}

export interface CalendarStatsDTO {
  tasksThisWeek: number;
  completedThisWeek: number;
  totalPoints: number;
  streakDays: number;
  upcomingDeadlines: number;
  familyEvents: number;
  personalEvents: number;
  achievementsThisMonth: number;
}

// ================================
// ERROR HANDLING
// ================================

export class CalendarServiceError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'CalendarServiceError';
  }
}

// ================================
// DATA TRANSFORMATION UTILITIES
// ================================

/**
 * Transform backend calendar event DTO to frontend DTO
 * Handles date conversion and property mapping
 */
function transformBackendEventToFrontend(backendEvent: BackendCalendarEventDTO): CalendarEventDTO {
  return {
    id: backendEvent.id,
    title: backendEvent.title,
    description: backendEvent.description,
    // Map backend startTime/endTime to frontend startDate/endDate
    startDate: new Date(backendEvent.startTime),
    endDate: new Date(backendEvent.endTime),
    isAllDay: backendEvent.isAllDay,
    color: backendEvent.color || '#3b82f6', // Default blue color
    familyId: backendEvent.familyId,
    createdByUserId: backendEvent.createdBy.id,
    eventType: backendEvent.eventType as any, // Type conversion needed
    createdAt: new Date(backendEvent.createdAt),
    updatedAt: backendEvent.updatedAt ? new Date(backendEvent.updatedAt) : new Date(),
    // Additional properties that may be missing from backend
    taskId: undefined,
    achievementId: undefined,
    recurrence: backendEvent.isRecurring ? {
      type: 'weekly', // Default value - map from recurrencePattern if needed
      interval: 1,
      endDate: undefined
    } : undefined
  };
}

/**
 * Transform array of backend events to frontend events
 */
function transformBackendEventsToFrontend(backendEvents: BackendCalendarEventDTO[]): CalendarEventDTO[] {
  if (!Array.isArray(backendEvents)) {
    console.warn('⚠️ transformBackendEventsToFrontend: Expected array but got:', typeof backendEvents);
    return [];
  }

  return backendEvents.map(event => {
    try {
      return transformBackendEventToFrontend(event);
    } catch (error) {
      console.error('❌ Failed to transform backend event:', event, error);
      // Return a minimal valid event to prevent crashes
      return {
        id: event.id || 0,
        title: event.title || 'Invalid Event',
        description: event.description,
        startDate: new Date(),
        endDate: new Date(),
        isAllDay: false,
        color: '#ef4444', // Red color for invalid events
        familyId: event.familyId || 1,
        createdByUserId: event.createdBy?.id || 1,
        eventType: 'General' as any,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  });
}

// ================================
// ENTERPRISE CALENDAR SERVICE
// ================================

export class CalendarService {
  private readonly baseUrl = '/v1';

  /**
   * Get calendar events for a specific family
   * BACKEND: GET /api/v1/family/{familyId}/calendar/events/range?startDate={start}&endDate={end}
   */
  async getFamilyCalendarEvents(
    familyId: number,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEventDTO[]> {
    try {
      console.log('📅 CalendarService: Fetching family calendar events for family:', familyId);
      console.log('📅 CalendarService: Family date range:', { startDate: startDate.toISOString(), endDate: endDate.toISOString() });

      const endpoint = `${this.baseUrl}/family/${familyId}/calendar/events/range?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      console.log('📅 CalendarService: Family endpoint:', endpoint);

      const result = await apiClient.get<BackendCalendarEventDTO[]>(endpoint);
      
      console.log('📅 CalendarService: Family API response:', result);
      console.log('📅 CalendarService: Family events count:', result?.length || 0);

      const transformedEvents = transformBackendEventsToFrontend(result || []);
      console.log('📅 CalendarService: Transformed events:', transformedEvents.length, 'events');

      return transformedEvents;
    } catch (error) {
      console.error('❌ CalendarService: Failed to fetch family calendar events:', error);
      return [];
    }
  }

  /**
   * Get all user's calendar events across all families
   * BACKEND: GET /api/v1/UserCalendar/all-families/events/range?startDate={start}&endDate={end}
   */
  async getAllUserCalendarEvents(
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEventDTO[]> {
    try {
      console.log('📅 CalendarService: Fetching all user calendar events');
      console.log('📅 CalendarService: Date range:', { startDate: startDate.toISOString(), endDate: endDate.toISOString() });

      // Use the correct UserCalendar endpoint that exists on the backend
      const endpoint = `${this.baseUrl}/UserCalendar/all-families/events/range?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      console.log('📅 CalendarService: Calling endpoint:', endpoint);

      const result = await apiClient.get<BackendCalendarEventDTO[]>(endpoint);
      
      console.log('📅 CalendarService: Raw API response:', result);
      console.log('📅 CalendarService: Response type:', typeof result);
      console.log('📅 CalendarService: Is array:', Array.isArray(result));
      
      if (result && Array.isArray(result)) {
        console.log('📅 CalendarService: Events count:', result.length);
        if (result.length > 0) {
          console.log('📅 CalendarService: First event structure:', result[0]);
          console.log('📅 CalendarService: First event keys:', Object.keys(result[0]));
        }
      }

      const transformedEvents = transformBackendEventsToFrontend(result || []);
      console.log('📅 CalendarService: Transformed events:', transformedEvents.length, 'events');
      if (transformedEvents.length > 0) {
        console.log('📅 CalendarService: First transformed event:', transformedEvents[0]);
      }

      return transformedEvents;
    } catch (error) {
      console.error('❌ CalendarService: Failed to fetch user calendar events:', error);
      if (error instanceof Error) {
        console.error('❌ CalendarService: Error message:', error.message);
        console.error('❌ CalendarService: Error stack:', error.stack);
      }
      return [];
    }
  }

  /**
   * Get today's events for a family
   * BACKEND: GET /api/v1/family/{familyId}/calendar/events/today
   */
  async getTodayEvents(familyId: number): Promise<CalendarEventDTO[]> {
    try {
      const result = await apiClient.get<BackendCalendarEventDTO[]>(
        `${this.baseUrl}/family/${familyId}/calendar/events/today`
      );

      return transformBackendEventsToFrontend(result || []);
    } catch (error) {
      console.error('❌ CalendarService: Failed to fetch today events:', error);
      return [];
    }
  }

  /**
   * Get upcoming events for the next N days
   * BACKEND: GET /api/v1/UserCalendar/all-families/events/upcoming?days={days}
   */
  async getUpcomingEvents(days = 7): Promise<CalendarEventDTO[]> {
    try {
      const result = await apiClient.get<BackendCalendarEventDTO[]>(
        `${this.baseUrl}/UserCalendar/all-families/events/upcoming?days=${days}`
      );

      return transformBackendEventsToFrontend(result || []);
    } catch (error) {
      console.error('❌ CalendarService: Failed to fetch upcoming events:', error);
      return [];
    }
  }

  /**
   * Create a new family calendar event
   * BACKEND: POST /api/v1/family/{familyId}/calendar/events
   */
  async createCalendarEvent(
    familyId: number,
    eventData: {
      title: string;
      description?: string;
      startDate: Date;
      endDate: Date;
      isAllDay: boolean;
      color: string;
      eventType: string;
    }
  ): Promise<CalendarEventDTO> {
    try {
      console.log('📅 CalendarService: Creating calendar event for family:', familyId);

      // Align with backend DTO structure - uses StartTime/EndTime not startDate/endDate
      const requestData = {
        title: eventData.title,
        description: eventData.description,
        startTime: eventData.startDate,
        endTime: eventData.endDate,
        isAllDay: eventData.isAllDay,
        color: eventData.color,
        eventType: eventData.eventType,
        familyId
      };

      // API client already unwraps the data from ApiResponse wrapper
      const result = await apiClient.post<BackendCalendarEventDTO>(
        `${this.baseUrl}/family/${familyId}/calendar/events`,
        requestData
      );

      if (!result) {
        throw new CalendarServiceError('No data returned from create event API', 500);
      }

      console.log('✅ CalendarService: Calendar event created successfully:', result.id);
      return transformBackendEventToFrontend(result);
    } catch (error) {
      console.error('❌ CalendarService: Failed to create calendar event:', error);
      throw new CalendarServiceError(
        'Failed to create calendar event. Please try again.',
        500
      );
    }
  }

  /**
   * Update an existing calendar event
   * BACKEND: PUT /api/v1/family/{familyId}/calendar/events/{eventId}
   */
  async updateCalendarEvent(
    familyId: number,
    eventId: number,
    eventData: Partial<CreateCalendarEventDTO>
  ): Promise<CalendarEventDTO> {
    try {
      console.log('📅 CalendarService: Updating calendar event:', eventId);

      // API client already unwraps the data from ApiResponse wrapper
      const result = await apiClient.put<BackendCalendarEventDTO>(
        `${this.baseUrl}/family/${familyId}/calendar/events/${eventId}`,
        eventData
      );

      if (!result) {
        throw new CalendarServiceError('No data returned from update event API', 500);
      }

      console.log('✅ CalendarService: Calendar event updated successfully:', result.id);
      return transformBackendEventToFrontend(result);
    } catch (error) {
      console.error('❌ CalendarService: Failed to update calendar event:', error);
      throw new CalendarServiceError(
        'Failed to update calendar event. Please try again.',
        500
      );
    }
  }

  /**
   * Delete a calendar event
   * BACKEND: DELETE /api/v1/family/{familyId}/calendar/events/{eventId}
   */
  async deleteCalendarEvent(familyId: number, eventId: number): Promise<boolean> {
    try {
      console.log('📅 CalendarService: Deleting calendar event:', eventId);

      await apiClient.delete<boolean>(
        `${this.baseUrl}/family/${familyId}/calendar/events/${eventId}`
      );

      console.log('✅ CalendarService: Calendar event deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ CalendarService: Failed to delete calendar event:', error);
      return false;
    }
  }

  /**
   * Get calendar statistics for dashboard
   * Uses existing UnifiedDashboard stats endpoint for consistency 
   */
  async getCalendarStats(): Promise<CalendarStatsDTO> {
    try {
      console.log('📅 CalendarService: Fetching calendar stats');

      // Use the correct existing UnifiedDashboard stats endpoint
      try {
        const result = await apiClient.get<Record<string, unknown>>(
          `${this.baseUrl}/unifieddashboard/stats`
        );
        
        const dashboardStats = result || {};
        
        // Extract calendar-relevant stats from dashboard
        const getNumberValue = (key: string): number => {
          const value = dashboardStats[key];
          return typeof value === 'number' ? value : 0;
        };
        
        const getArrayLength = (key: string): number => {
          const value = dashboardStats[key];
          return Array.isArray(value) ? value.length : 0;
        };
        
        return {
          tasksThisWeek: getNumberValue('tasksCompleted'),
          completedThisWeek: getNumberValue('tasksCompleted'),
          totalPoints: getNumberValue('totalPoints'),
          streakDays: getNumberValue('streakDays'),
          upcomingDeadlines: getNumberValue('overdueTasks'),
          familyEvents: 0, // Will be populated from calendar events
          personalEvents: 0,
          achievementsThisMonth: getArrayLength('recentAchievements')
        };
      } catch (error) {
        console.warn('⚠️ CalendarService: Dashboard stats endpoint error, using defaults:', error);
        return this.getDefaultStats();
      }
    } catch (error) {
      console.error('❌ CalendarService: Failed to fetch calendar stats:', error);
      return this.getDefaultStats();
    }
  }

  /**
   * Get default calendar statistics for graceful degradation
   */
  private getDefaultStats(): CalendarStatsDTO {
    return {
      tasksThisWeek: 0,
      completedThisWeek: 0,
      totalPoints: 0,
      streakDays: 0,
      upcomingDeadlines: 0,
      familyEvents: 0,
      personalEvents: 0,
      achievementsThisMonth: 0
    };
  }

  /**
   * Get calendar data for a specific month (for Apple calendar view)
   * Enterprise pattern: Parallel API calls for optimal performance
   */
  async getMonthlyCalendarData(
    year: number,
    month: number,
    familyId?: number
  ): Promise<{
    events: CalendarEventDTO[];
    stats: CalendarStatsDTO;
  }> {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      console.log('📅 CalendarService: Fetching monthly calendar data:', { year, month, familyId });

      // Use Promise.all for parallel execution (enterprise performance pattern)
      const [events, stats] = await Promise.all([
        familyId 
          ? this.getFamilyCalendarEvents(familyId, startDate, endDate)
          : this.getAllUserCalendarEvents(startDate, endDate),
        this.getCalendarStats()
      ]);

      return { events, stats };
    } catch (error) {
      console.error('❌ CalendarService: Failed to fetch monthly calendar data:', error);
      throw error;
    }
  }

  /**
   * Get calendar event by ID
   * BACKEND: GET /api/v1/family/{familyId}/calendar/events/{eventId}
   */
  async getCalendarEventById(familyId: number, eventId: number): Promise<CalendarEventDTO | null> {
    try {
      console.log('📅 CalendarService: Fetching calendar event by ID:', eventId);

      const result = await apiClient.get<CalendarEventDTO>(
        `${this.baseUrl}/family/${familyId}/calendar/events/${eventId}`
      );

      return result || null;
    } catch (error) {
      console.error('❌ CalendarService: Failed to fetch calendar event by ID:', error);
      return null;
    }
  }
}

// Export singleton instance following enterprise patterns
export const calendarService = new CalendarService(); 