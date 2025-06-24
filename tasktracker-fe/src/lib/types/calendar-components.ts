// Calendar Component Types and Interfaces
// Following Enterprise Standards - Component-specific types
// Copyright (c) 2025 TaskTracker Enterprise

import type { CalendarEventDTO } from './calendar';
import type { FamilyTaskItemDTO } from './task';
import type { FamilyMemberDTO, FamilyDTO } from './family-invitation';
import type { EventFormData } from '../schemas/calendar';

// ============================================================================
// CREATE EVENT SHEET COMPONENT TYPES
// ============================================================================

export interface CreateEventSheetProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date;
    selectedTime?: string;
    familyId?: string;
    allFamilies?: FamilyDTO[];
    familyMembers?: FamilyMemberDTO[];
    existingEvents: CalendarEventDTO[];
    existingTasks: FamilyTaskItemDTO[];
    onEventCreated: (event: CalendarEventDTO) => void;
    onTaskCreated: (task: FamilyTaskItemDTO) => void;
    onEventUpdated: (event: CalendarEventDTO) => void;
    onTaskUpdated: (task: FamilyTaskItemDTO) => void;
    onEventDeleted: (eventId: string) => void;
    onTaskDeleted: (taskId: string) => void;
    // Edit mode props
    isEditMode?: boolean;
    editingEvent?: CalendarEventDTO | null;
    editingTask?: FamilyTaskItemDTO | null;
}

// ============================================================================
// CONFLICT DETECTION TYPES
// ============================================================================

export interface ConflictingEvent {
  id: string | number;
  title: string;
  startTime: Date;
  endTime: Date;
  type: 'event' | 'task';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  attendees?: string[];
}

export interface ConflictResolution {
  type: 'move' | 'shorten' | 'ignore' | 'cancel';
  suggestedTime?: { start: string; end: string };
  message: string;
}

export interface PendingEventData {
  eventData: EventFormData;
  conflicts: ConflictingEvent[];
}

// ============================================================================
// PRIORITY OPTIONS TYPE
// ============================================================================

export interface PriorityOption {
  value: 'low' | 'medium' | 'high' | 'urgent';
  label: string;
  color: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const EVENT_COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#EC4899', // Pink
    '#6366F1', // Indigo
] as const;

export const PRIORITY_OPTIONS: PriorityOption[] = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-purple-100 text-purple-800' },
]; 