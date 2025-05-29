import { apiClient } from './apiClient';
import { ApiResponse } from '@/lib/types/api';
import {
  FamilyCalendarEvent,
  EventAttendee,
  EventReminder,
  CreateFamilyCalendarEvent,
  UpdateFamilyCalendarEvent,
  UpdateAttendeeResponse,
  MemberAvailability,
  CreateMemberAvailability,
  UpdateMemberAvailability
} from '@/lib/types/calendar';

// Re-export types for external consumption
export type {
  FamilyCalendarEvent,
  EventAttendee,
  EventReminder,
  CreateFamilyCalendarEvent,
  UpdateFamilyCalendarEvent,
  UpdateAttendeeResponse,
  MemberAvailability,
  CreateMemberAvailability,
  UpdateMemberAvailability
};

export const familyCalendarService = {
  // Get all events for a family
  getAllEvents: async (familyId: number): Promise<ApiResponse<FamilyCalendarEvent[]>> => {
    return apiClient.get(`/v1/family/${familyId}/calendar/events`);
  },

  // Get events in a date range
  getEventsInRange: async (
    familyId: number,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<FamilyCalendarEvent[]>> => {
    return apiClient.get(
      `/v1/family/${familyId}/calendar/events/range?startDate=${startDate}&endDate=${endDate}`
    );
  },

  // Get a specific event
  getEvent: async (
    familyId: number,
    eventId: number
  ): Promise<ApiResponse<FamilyCalendarEvent>> => {
    return apiClient.get(`/v1/family/${familyId}/calendar/events/${eventId}`);
  },

  // Create a new event
  createEvent: async (
    familyId: number,
    event: CreateFamilyCalendarEvent
  ): Promise<ApiResponse<FamilyCalendarEvent>> => {
    try {
      console.log('[familyCalendarService] Creating event:', event);
      
      // First, make sure we have a fresh CSRF token
      const { refreshCsrfToken, getCsrfToken } = await import('../utils/security');
      await refreshCsrfToken();
      const csrfToken = getCsrfToken();
      
      // Create a properly formatted event object for the API
      const apiEventData = {
        title: event.title,
        description: event.description || '',
        startTime: event.startTime,
        endTime: event.endTime,
        isAllDay: event.isAllDay || false,
        location: event.location || '',
        color: event.color || '#3b82f6',
        isRecurring: event.isRecurring || false,
        recurrencePattern: event.recurrencePattern || null,
        eventType: event.eventType || 'General',
        familyId: familyId,
        attendeeIds: event.attendeeIds || []
      };
      
      console.log('[familyCalendarService] Sending API request with data:', apiEventData);
      
      // Get auth token from storage
      const authToken = localStorage.getItem('token');
        
      // Prepare API URL
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const url = `${API_URL}/v1/family/${familyId}/calendar/events`;
      
      // Prepare headers with all possible CSRF token formats
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // Add authorization header if token exists
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      // Add CSRF token in all possible formats
      if (csrfToken) {
        headers['X-CSRF-TOKEN'] = csrfToken;
        headers['X-XSRF-TOKEN'] = csrfToken;
      }
      
      console.log('[familyCalendarService] Request headers:', {
        ...headers,
        Authorization: headers.Authorization ? '[REDACTED]' : undefined
      });
        
      // Make the direct fetch request for more control
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(apiEventData),
        credentials: 'include'
      });
      
      // Parse the response
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.warn('[familyCalendarService] Non-JSON response:', text);
        data = { message: text };
      }
      
      console.log('[familyCalendarService] Response status:', response.status);
      
      if (response.ok) {
        // If API returns a wrapped response with success property
        if (data.success !== undefined && data.data) {
          console.log('[familyCalendarService] Successfully created event:', data.data);
          return { data: data.data, status: response.status };
      }
      
        // If API returns data directly
        console.log('[familyCalendarService] Successfully created event:', data);
        return { data, status: response.status };
      }
      
      // Handle error responses
      console.error('[familyCalendarService] Error creating event:', data);
      return {
        error: data.message || 'Failed to create event',
        details: { message: JSON.stringify(data) },
        status: response.status
      };
    } catch (error) {
      console.error('[familyCalendarService] Exception creating event:', error);
      return {
        error: 'Failed to create event',
        details: { message: error instanceof Error ? error.message : String(error) },
        status: 400
      };
    }
  },

  // Update an event
  updateEvent: async (
    familyId: number,
    eventId: number,
    event: UpdateFamilyCalendarEvent
  ): Promise<ApiResponse<FamilyCalendarEvent>> => {
    return apiClient.put(`/v1/family/${familyId}/calendar/events/${eventId}`, event);
  },

  // Delete an event
  deleteEvent: async (
    familyId: number,
    eventId: number
  ): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/v1/family/${familyId}/calendar/events/${eventId}`);
  },

  // Get event attendees
  getEventAttendees: async (
    familyId: number,
    eventId: number
  ): Promise<ApiResponse<EventAttendee[]>> => {
    return apiClient.get(`/v1/family/${familyId}/calendar/events/${eventId}/attendees`);
  },

  // Update attendee response
  updateAttendeeResponse: async (
    familyId: number,
    response: UpdateAttendeeResponse
  ): Promise<ApiResponse<EventAttendee>> => {
    return apiClient.put(`/v1/family/${familyId}/calendar/events/attendee-response`, response);
  },

  // Remove attendee
  removeAttendee: async (
    familyId: number,
    eventId: number,
    attendeeId: number
  ): Promise<ApiResponse<void>> => {
    return apiClient.delete(
      `/v1/family/${familyId}/calendar/events/${eventId}/attendees/${attendeeId}`
    );
  },

  // Get today's events
  getEventsDueToday: async (
    familyId: number
  ): Promise<ApiResponse<FamilyCalendarEvent[]>> => {
    return apiClient.get(`/v1/family/${familyId}/calendar/events/today`);
  },

  // Get member availability
  getMemberAvailability: async (
    familyId: number,
    memberId: number
  ): Promise<ApiResponse<MemberAvailability[]>> => {
    return apiClient.get(`/v1/family/${familyId}/availability/${memberId}`);
  },

  // Get family availability
  getFamilyAvailability: async (
    familyId: number
  ): Promise<ApiResponse<MemberAvailability[]>> => {
    return apiClient.get(`/v1/family/${familyId}/availability`);
  },

  // Get availability in range
  getAvailabilityInRange: async (
    familyId: number,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<MemberAvailability[]>> => {
    return apiClient.get(
      `/v1/family/${familyId}/availability/range?startDate=${startDate}&endDate=${endDate}`
    );
  },

  // Create availability
  createAvailability: async (
    familyId: number,
    availability: CreateMemberAvailability
  ): Promise<ApiResponse<MemberAvailability>> => {
    return apiClient.post(`/v1/family/${familyId}/availability`, availability);
  },

  // Update availability
  updateAvailability: async (
    familyId: number,
    availabilityId: number,
    availability: UpdateMemberAvailability
  ): Promise<ApiResponse<MemberAvailability>> => {
    return apiClient.put(`/v1/family/${familyId}/availability/${availabilityId}`, availability);
  },

  // Delete availability
  deleteAvailability: async (
    familyId: number,
    availabilityId: number
  ): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/v1/family/${familyId}/availability/${availabilityId}`);
  },
}; 