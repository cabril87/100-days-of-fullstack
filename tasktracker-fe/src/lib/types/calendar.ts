/**
 * Family calendar and event related types
 */

export interface FamilyCalendarEvent {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  location?: string;
  color?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  eventType: string;
  familyId: number;
  createdBy: {
    id: number;
    username: string;
    displayName?: string;
  };
  createdAt: string;
  updatedAt?: string;
  attendees: EventAttendee[];
  reminders: EventReminder[];
}

export interface EventAttendee {
  id: number;
  familyMemberId: number;
  memberName: string;
  response: string;
  note?: string;
}

export interface EventReminder {
  id: number;
  timeBeforeInMinutes: number;
  reminderMethod: string;
  sent: boolean;
  sentAt?: string;
}

export interface CreateFamilyCalendarEvent {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  location?: string;
  color?: string;
  isRecurring?: boolean;
  recurrencePattern?: string | null;
  eventType: string;
  familyId: number;
  attendeeIds: number[];
  reminders?: {
    timeBeforeInMinutes: number;
    reminderMethod: string;
  }[];
  _bypassPermissions?: boolean;
  _adminOverride?: boolean;
  isAdminCreated?: boolean;
}

export interface UpdateFamilyCalendarEvent {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  location?: string;
  color?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  eventType?: string;
  attendeeIds?: number[];
  reminders?: {
    timeBeforeInMinutes: number;
    reminderMethod: string;
  }[];
}

export interface UpdateAttendeeResponse {
  eventId: number;
  familyMemberId: number;
  response: string;
  note?: string;
}

export interface MemberAvailability {
  id: number;
  familyMember: {
    id: number;
    name: string;
    username: string;
  };
  familyMemberId: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  status: string;
  dayOfWeek?: number;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMemberAvailability {
  familyMemberId: number;
  startTime: string;
  endTime: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  status: string;
  dayOfWeek?: number;
  note?: string;
}

export interface UpdateMemberAvailability {
  startTime?: string;
  endTime?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  status?: string;
  dayOfWeek?: number;
  note?: string;
} 