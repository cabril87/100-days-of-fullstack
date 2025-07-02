/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Calendar Component Props - .cursorrules compliant
 * 
 * MANDATORY: ALL component props interfaces MUST be in lib/props/
 * NO EXCEPTIONS - ZERO TOLERANCE POLICY
 */

import { ReactNode } from 'react';

// ============================================================================
// CALENDAR CORE PROPS
// ============================================================================

export interface EnterpriseCalendarWrapperProps {
  familyId: number;
  currentView: 'month' | 'week' | 'day';
  selectedDate: Date;
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  onDateChange: (date: Date) => void;
  className?: string;
  enableMobileGestures?: boolean;
  showMiniCalendar?: boolean;
  compactMode?: boolean;
}

export interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: unknown) => void;
  selectedDate?: Date;
  familyId?: number;
  defaultEvent?: {
    title?: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
    allDay?: boolean;
  };
  className?: string;
}

export interface CalendarSidebarProps {
  events: Array<{
    id: number;
    title: string;
    startDate: string;
    startTime?: Date;
    endTime?: Date;
    color?: string;
    type?: string;
  }>;
  tasks: Array<{
    id: number;
    title: string;
    dueDate?: string;
    pointsValue?: number;
  }>;
  stats: {
    totalPoints: number;
    completedThisWeek: number;
    tasksThisWeek: number;
    streakDays: number;
  };
  onCreateEvent: () => void;
  onToggleSidebar: () => void;
  // Legacy props for other components
  familyId?: number;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onEventClick?: (eventId: number) => void;
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export interface CalendarControlsProps {
  currentView: 'month' | 'week' | 'day';
  selectedDate: Date;
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  onDateChange: (date: Date) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onCreateEvent: () => void;
  familyId?: number;
  className?: string;
  showViewSelector?: boolean;
  showCreateButton?: boolean;
  compactMode?: boolean;
}

// ============================================================================
// SMART FAMILY CALENDAR PROPS
// ============================================================================

export interface SmartFamilyEventCreatorProps {
  familyId: number;
  onEventCreated: (event: unknown) => void;
  onClose: () => void;
  isOpen: boolean;
  suggestedTime?: Date;
  conflictResolution?: 'automatic' | 'manual';
  enableIntelligentScheduling?: boolean;
  className?: string;
}

export interface FamilyConflictDetectionProps {
  familyId: number;
  proposedEvent: {
    startTime: Date;
    endTime: Date;
    attendeeIds?: number[];
  };
  onConflictsDetected: (conflicts: Array<{
    memberId: number;
    memberName: string;
    conflictingEvent: {
      id: number;
      title: string;
      startTime: Date;
      endTime: Date;
    };
  }>) => void;
  onResolutionSuggested: (suggestions: Array<{
    type: 'reschedule' | 'notify' | 'skip';
    description: string;
    newTime?: Date;
  }>) => void;
  autoCheck?: boolean;
  className?: string;
}

export interface FamilyAvailabilityManagerProps {
  familyId: number;
  selectedMembers: number[];
  timeRange: {
    start: Date;
    end: Date;
  };
  onAvailabilityLoaded: (availability: Record<number, Array<{
    start: Date;
    end: Date;
    status: 'available' | 'busy' | 'tentative';
  }>>) => void;
  onOptimalTimeFound: (suggestions: Array<{
    start: Date;
    end: Date;
    confidence: number;
    availableMembers: number[];
  }>) => void;
  minimumDuration?: number;
  preferredTimes?: Array<{ start: string; end: string }>;
  className?: string;
}

export interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: Array<{
    memberId: number;
    memberName: string;
    conflictingEvent: {
      id: number;
      title: string;
      startTime: Date;
      endTime: Date;
    };
  }>;
  suggestions: Array<{
    type: 'reschedule' | 'notify' | 'skip';
    description: string;
    newTime?: Date;
  }>;
  onResolutionSelected: (resolution: {
    type: string;
    newTime?: Date;
    notifyMembers?: boolean;
  }) => void;
  className?: string;
}

// ============================================================================
// MOBILE CALENDAR ENHANCEMENTS PROPS
// ============================================================================

// PullToRefreshProps already exists in mobile.props.ts - using that one instead
// export interface PullToRefreshProps {

export interface DurationPresetsProps {
  onDurationSelect: (duration: number) => void;
  selectedDuration?: number;
  presets?: Array<{
    label: string;
    minutes: number;
    icon?: ReactNode;
  }>;
  customDurationEnabled?: boolean;
  className?: string;
}

export interface CalendarMobileEnhancementsProps {
  children: ReactNode;
  enablePullToRefresh?: boolean;
  enableSwipeNavigation?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPullToRefresh?: () => Promise<void>;
  hapticFeedback?: boolean;
  className?: string;
}

// ============================================================================
// CALENDAR DASHBOARD WIDGET PROPS
// ============================================================================

export interface CalendarDashboardWidgetProps {
  familyId?: number;
  userId: number;
  maxEvents?: number;
  timeRange?: 'today' | 'week' | 'month';
  showCreateButton?: boolean;
  compactMode?: boolean;
  onEventClick?: (eventId: number) => void;
  onCreateEvent?: () => void;
  className?: string;
  refreshInterval?: number;
}

// ============================================================================
// CALENDAR EVENT MANAGEMENT PROPS
// ============================================================================

export interface EventFormProps {
  event?: {
    id?: number;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    allDay?: boolean;
    recurrence?: string;
    attendees?: number[];
  };
  familyId: number;
  onSubmit: (eventData: unknown) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  className?: string;
}

export interface EventDetailsProps {
  event: {
    id: number;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    allDay?: boolean;
    organizer?: {
      id: number;
      name: string;
    };
    attendees?: Array<{
      id: number;
      name: string;
      status: 'accepted' | 'declined' | 'pending';
    }>;
  };
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  className?: string;
}

export interface RecurrenceEditorProps {
  recurrence: {
    type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    daysOfWeek?: number[];
    endDate?: Date;
    count?: number;
  };
  onRecurrenceChange: (recurrence: unknown) => void;
  className?: string;
} 