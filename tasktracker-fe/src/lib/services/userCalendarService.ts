/**
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import { apiService } from './apiService';

// DTOs matching backend models
export interface UserGlobalCalendarDTO {
    userId: number;
    userName: string;
    families: UserFamilyCalendarSummaryDTO[];
    allEvents: FamilyCalendarEventWithFamilyDTO[];
    statistics: UserCalendarStatisticsDTO;
    generatedAt: string;
}

export interface FamilyCalendarEventWithFamilyDTO extends FamilyCalendarEventDTO {
    family: FamilyCalendarSummaryDTO;
    familyColor: string;
    isUserCreator: boolean;
    isUserAttendee: boolean;
    userRole: string;
}

export interface FamilyCalendarEventDTO {
    id: number;
    familyId: number;
    title: string;
    description: string;
    location: string;
    eventType: string;
    startTime: string;
    endTime: string;
    isAllDay: boolean;
    isRecurring: boolean;
    recurrencePattern?: string;
    priority: string;
    isPrivate: boolean;
    createdById: number;
    createdByName: string;
    createdAt: string;
    lastModified: string;
    attendees: FamilyCalendarEventAttendeeDTO[];
    reminders: FamilyCalendarReminderDTO[];
}

export interface FamilyCalendarEventAttendeeDTO {
    id: number;
    eventId: number;
    familyMemberId: number;
    memberName: string;
    response: string;
    responseDate?: string;
    notes?: string;
}

export interface FamilyCalendarReminderDTO {
    id: number;
    eventId: number;
    reminderTime: string;
    reminderType: string;
    message: string;
    isActive: boolean;
}

export interface UserFamilyCalendarSummaryDTO {
    familyId: number;
    familyName: string;
    familyDescription: string;
    userRole: string;
    familyColor: string;
    totalEvents: number;
    upcomingEvents: number;
    todayEvents: number;
    userCreatedEvents: number;
    userAttendingEvents: number;
    nextEventDate?: string;
    lastActivity: string;
    hasPermissionToCreateEvents: boolean;
    hasPermissionToManageEvents: boolean;
}

export interface FamilyCalendarSummaryDTO {
    id: number;
    name: string;
    description: string;
    color: string;
    memberCount: number;
}

export interface UserAvailabilityDTO {
    userId: number;
    date: string;
    isAvailable: boolean;
    busySlots: TimeSlotDTO[];
    availableSlots: TimeSlotDTO[];
    conflictingEvents: FamilyCalendarEventWithFamilyDTO[];
    timeZone: string;
}

export interface TimeSlotDTO {
    startTime: string;
    endTime: string;
    description: string;
    type: string;
    familyId?: number;
    eventId?: number;
}

export interface CalendarConflictDTO {
    id: number;
    conflictDate: string;
    conflictStartTime: string;
    conflictEndTime: string;
    conflictingEvents: FamilyCalendarEventWithFamilyDTO[];
    conflictType: string;
    severity: string;
    description: string;
    isResolved: boolean;
    detectedAt: string;
}

export interface UserCalendarStatisticsDTO {
    userId: number;
    totalFamilies: number;
    totalEvents: number;
    upcomingEvents: number;
    pastEvents: number;
    todayEvents: number;
    thisWeekEvents: number;
    thisMonthEvents: number;
    eventsCreatedByUser: number;
    eventsUserAttending: number;
    activeConflicts: number;
    resolvedConflicts: number;
    familyStats: FamilyStatisticsSummaryDTO[];
    eventTypeDistribution: { [key: string]: number };
    dailyActivityPattern: { [key: string]: number };
    hourlyActivityPattern: { [key: number]: number };
    monthlyActivityPattern: { [key: string]: number };
    averageEventsPerFamily: number;
    averageEventsPerWeek: number;
    eventAttendanceRate: number;
    eventCreationRate: number;
    lastEventCreated?: string;
    lastEventAttended?: string;
    nextUpcomingEvent?: string;
    busiestDayOfWeek: number;
    busiestHourOfDay: number;
    busiestFamily: string;
    mostCommonEventType: string;
    generatedAt: string;
}

export interface FamilyStatisticsSummaryDTO {
    familyId: number;
    familyName: string;
    familyColor: string;
    totalEvents: number;
    upcomingEvents: number;
    userCreatedEvents: number;
    userAttendingEvents: number;
    participationRate: number;
    lastActivity?: string;
    mostActiveEventType: string;
}

export interface CreateEventRequest {
    familyId: number;
    title: string;
    description: string;
    location: string;
    eventType: string;
    startTime: string;
    endTime: string;
    isAllDay: boolean;
    isRecurring: boolean;
    recurrencePattern?: string;
    priority: string;
    isPrivate: boolean;
    attendeeIds: number[];
    reminders: CreateReminderRequest[];
}

export interface CreateReminderRequest {
    reminderTime: string;
    reminderType: string;
    message: string;
}

export interface UpdateEventRequest extends CreateEventRequest {
    id: number;
}

class UserCalendarService {
    private readonly baseUrl = '/user/calendar';

    // Global calendar aggregation
    async getUserGlobalCalendar(): Promise<UserGlobalCalendarDTO | null> {
        try {
            const response = await apiService.get<UserGlobalCalendarDTO>(`${this.baseUrl}/all-families`);
            return response.data || null;
        } catch (error) {
            console.error('Error getting global calendar:', error);
            return null;
        }
    }

    async getAllUserEvents(): Promise<FamilyCalendarEventWithFamilyDTO[]> {
        try {
            const response = await apiService.get<FamilyCalendarEventWithFamilyDTO[]>(`${this.baseUrl}/all-families/events`);
            return response.data || [];
        } catch (error) {
            console.error('Error getting all user events:', error);
            return [];
        }
    }

    async getAllUserEventsInRange(startDate: string, endDate: string): Promise<FamilyCalendarEventWithFamilyDTO[]> {
        try {
            const response = await apiService.get<FamilyCalendarEventWithFamilyDTO[]>(`${this.baseUrl}/all-families/events/range`, {
                params: { startDate, endDate }
            });
            return response.data || [];
        } catch (error) {
            console.error('Error getting events in range:', error);
            return [];
        }
    }

    async getAllUserEventsToday(): Promise<FamilyCalendarEventWithFamilyDTO[]> {
        try {
            const response = await apiService.get<FamilyCalendarEventWithFamilyDTO[]>(`${this.baseUrl}/all-families/events/today`);
            return response.data || [];
        } catch (error) {
            console.error('Error getting today\'s events:', error);
            return [];
        }
    }

    async getAllUserUpcomingEvents(days: number = 7): Promise<FamilyCalendarEventWithFamilyDTO[]> {
        try {
            const response = await apiService.get<FamilyCalendarEventWithFamilyDTO[]>(`${this.baseUrl}/all-families/events/upcoming`, {
                params: { days }
            });
            return response.data || [];
        } catch (error) {
            console.error('Error getting upcoming events:', error);
            return [];
        }
    }

    // Family summaries
    async getUserFamiliesCalendarSummary(): Promise<UserFamilyCalendarSummaryDTO[]> {
        try {
            const response = await apiService.get<UserFamilyCalendarSummaryDTO[]>(`${this.baseUrl}/families-summary`);
            return response.data || [];
        } catch (error) {
            console.error('Error getting family calendar summaries:', error);
            return [];
        }
    }

    // User availability
    async getUserAvailability(date?: string): Promise<UserAvailabilityDTO | null> {
        try {
            const params = date ? { date } : {};
            const response = await apiService.get<UserAvailabilityDTO>(`${this.baseUrl}/availability`, { params });
            return response.data || null;
        } catch (error) {
            console.error('Error getting user availability:', error);
            return null;
        }
    }

    // Conflict detection
    async getUserCalendarConflicts(): Promise<CalendarConflictDTO[]> {
        try {
            const response = await apiService.get<CalendarConflictDTO[]>(`${this.baseUrl}/conflicts`);
            return response.data || [];
        } catch (error) {
            console.error('Error getting calendar conflicts:', error);
            return [];
        }
    }

    // Statistics and analytics
    async getUserCalendarStatistics(): Promise<UserCalendarStatisticsDTO | null> {
        try {
            const response = await apiService.get<UserCalendarStatisticsDTO>(`${this.baseUrl}/statistics`);
            return response.data || null;
        } catch (error) {
            console.error('Error getting calendar statistics:', error);
            return null;
        }
    }

    // Event management (delegated to family calendar service for specific families)
    async createEvent(request: CreateEventRequest): Promise<FamilyCalendarEventDTO | null> {
        try {
            const response = await apiService.post<FamilyCalendarEventDTO>(`/family/${request.familyId}/calendar/events`, request);
            return response.data || null;
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    }

    async updateEvent(request: UpdateEventRequest): Promise<FamilyCalendarEventDTO | null> {
        try {
            const response = await apiService.put<FamilyCalendarEventDTO>(`/family/${request.familyId}/calendar/events/${request.id}`, request);
            return response.data || null;
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    }

    async deleteEvent(familyId: number, eventId: number): Promise<boolean> {
        try {
            await apiService.delete(`/family/${familyId}/calendar/events/${eventId}`);
            return true;
        } catch (error) {
            console.error('Error deleting event:', error);
            return false;
        }
    }

    async updateEventAttendance(familyId: number, eventId: number, response: string, notes?: string): Promise<boolean> {
        try {
            await apiService.put(`/family/${familyId}/calendar/events/${eventId}/attendance`, {
                response,
                notes
            });
            return true;
        } catch (error) {
            console.error('Error updating event attendance:', error);
            return false;
        }
    }

    // Utility methods for frontend
    formatEventForCalendar(event: FamilyCalendarEventWithFamilyDTO) {
        return {
            id: event.id,
            title: event.title,
            start: new Date(event.startTime),
            end: new Date(event.endTime),
            allDay: event.isAllDay,
            resource: {
                familyId: event.familyId,
                familyName: event.family.name,
                familyColor: event.familyColor,
                eventType: event.eventType,
                priority: event.priority,
                isUserCreator: event.isUserCreator,
                isUserAttendee: event.isUserAttendee,
                location: event.location,
                description: event.description,
                attendees: event.attendees,
                reminders: event.reminders
            }
        };
    }

    getEventTypeColor(eventType: string): string {
        const colors: { [key: string]: string } = {
            'Meeting': '#3b82f6',
            'Appointment': '#10b981',
            'Task': '#f59e0b',
            'Reminder': '#ef4444',
            'Event': '#8b5cf6',
            'Birthday': '#ec4899',
            'Holiday': '#06b6d4',
            'Vacation': '#14b8a6',
            'Work': '#6b7280',
            'Personal': '#84cc16',
            'Family': '#f97316',
            'Social': '#8b5cf6'
        };
        return colors[eventType] || '#6b7280';
    }

    getPriorityColor(priority: string): string {
        const colors: { [key: string]: string } = {
            'Low': '#6b7280',
            'Normal': '#3b82f6',
            'High': '#f59e0b',
            'Critical': '#ef4444'
        };
        return colors[priority] || '#3b82f6';
    }

    formatConflictSeverity(severity: string): { color: string; label: string } {
        const severityMap: { [key: string]: { color: string; label: string } } = {
            'Low': { color: '#84cc16', label: 'Minor Conflict' },
            'Medium': { color: '#f59e0b', label: 'Schedule Conflict' },
            'High': { color: '#ef4444', label: 'Major Conflict' },
            'Critical': { color: '#dc2626', label: 'Critical Conflict' }
        };
        return severityMap[severity] || { color: '#6b7280', label: 'Unknown' };
    }

    isEventHappening(event: FamilyCalendarEventWithFamilyDTO): boolean {
        const now = new Date();
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);
        return now >= start && now <= end;
    }

    isEventUpcoming(event: FamilyCalendarEventWithFamilyDTO, hours: number = 24): boolean {
        const now = new Date();
        const start = new Date(event.startTime);
        const hoursFromNow = new Date(now.getTime() + (hours * 60 * 60 * 1000));
        return start > now && start <= hoursFromNow;
    }

    getEventDuration(event: FamilyCalendarEventWithFamilyDTO): string {
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);
        const durationMs = end.getTime() - start.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours === 0) {
            return `${minutes}m`;
        } else if (minutes === 0) {
            return `${hours}h`;
        } else {
            return `${hours}h ${minutes}m`;
        }
    }
}

export const userCalendarService = new UserCalendarService(); 