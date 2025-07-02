// Calendar Component Types and Interfaces
// Following Enterprise Standards - Component-specific types
// Copyright (c) 2025 TaskTracker Enterprise

import type { CalendarEventDTO } from './calendar';
import type { FamilyTaskItemDTO } from '../tasks/task.type';
import type { FamilyMemberDTO, FamilyDTO } from '../family/family-invitation';

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

// Note: Core business logic types moved to lib/types/calendar.ts per enterprise standards

// Note: Constants moved to lib/types/calendar.ts per enterprise standards