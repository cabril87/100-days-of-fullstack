/*
 * Calendar Component Interfaces
 * Centralized interface definitions for calendar-related components
 * Extracted from components/calendar/ for .cursorrules compliance
 */

import { FamilyMemberDTO } from '@/lib/types/family';
import type { CalendarEventDTO } from '@/lib/types/calendar';
import type { FamilyTaskItemDTO } from '@/lib/types/tasks';
import type { FamilyDTO } from '@/lib/types/family';

// ================================
// MAIN CALENDAR INTERFACES
// ================================

export interface CalendarControlsProps {
  currentDate: Date;
  viewMode: 'month' | 'week' | 'day' | 'agenda';
  onDateChange: (date: Date) => void;
  onViewModeChange: (mode: 'month' | 'week' | 'day' | 'agenda') => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

export interface CalendarSidebarProps {
  selectedDate?: Date;
  events?: Array<{
    id: string;
    title: string;
    start: Date;
    end: Date;
    color?: string;
  }>;
  onEventSelect?: (eventId: string) => void;
  onDateSelect?: (date: Date) => void;
  onCreateEvent?: () => void;
  className?: string;
}

export interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: (event: unknown) => void;
  selectedDate?: Date;
  familyMembers?: FamilyMemberDTO[];
  defaultDuration?: number;
  className?: string;
}

export interface EnterpriseCalendarWrapperProps {
  events: unknown[];
  onEventCreate?: (event: unknown) => void;
  onEventUpdate?: (eventId: string, updates: unknown) => void;
  onEventDelete?: (eventId: string) => void;
  viewMode?: 'month' | 'week' | 'day' | 'agenda';
  selectedDate?: Date;
  readOnly?: boolean;
  className?: string;
}

// ================================
// FAMILY CALENDAR INTERFACES
// ================================

export interface FamilyAvailabilityManagerProps {
  familyId: number;
  familyMembers: FamilyMemberDTO[];
  selectedDate?: Date;
  onAvailabilityUpdate?: (memberId: number, availability: unknown) => void;
  showConflicts?: boolean;
  className?: string;
}

export interface FamilyConflictDetectionProps {
  familyId: number;
  events: unknown[];
  onConflictResolution?: (conflictId: string, resolution: unknown) => void;
  autoResolve?: boolean;
  className?: string;
}

export interface ConflictData {
  id: string;
  type: 'time_overlap' | 'resource_conflict' | 'priority_conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  events: unknown[];
  suggestedResolutions?: Array<{
    id: string;
    description: string;
    action: () => void;
  }>;
}

export interface SmartFamilyEventCreatorProps {
  familyId: number;
  familyMembers: FamilyMemberDTO[];
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: (event: unknown) => void;
  suggestedTimes?: Date[];
  aiAssistance?: boolean;
  className?: string;
}

export interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: ConflictData[];
  onResolveConflict: (conflictId: string, resolution: unknown) => void;
  onResolveAll?: () => void;
  className?: string;
}

// ================================
// MOBILE CALENDAR INTERFACES
// ================================

export interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  refreshing?: boolean;
  threshold?: number;
  className?: string;
}

export interface DurationPresetsProps {
  onDurationSelect: (minutes: number) => void;
  selectedDuration?: number;
  presets?: Array<{
    label: string;
    minutes: number;
    icon?: React.ReactNode;
  }>;
  allowCustom?: boolean;
  className?: string;
}

export interface CalendarMobileEnhancementsProps {
  isEnabled: boolean;
  features: {
    pullToRefresh: boolean;
    hapticFeedback: boolean;
    gestureNavigation: boolean;
    voiceControl: boolean;
    touchOptimization: boolean;
  };
  breakpoint: 'mobile' | 'tablet' | 'desktop' | 'ultrawide';
  touchTargetSize: number;
  hapticSettings: {
    isEnabled: boolean;
    intensity: 'light' | 'medium' | 'heavy';
  };
  onRefresh?: () => Promise<void>;
  onGestureAction?: (action: string) => void;
  onDurationSelect?: (minutes: number) => void;
  children?: React.ReactNode;
  className?: string;
}

// ================================
// EVENT MANAGEMENT INTERFACES
// ================================

export interface EventFormProps {
  event?: unknown;
  familyMembers?: FamilyMemberDTO[];
  onSubmit: (event: unknown) => void;
  onCancel: () => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
  className?: string;
}

export interface EventDetailsProps {
  event: unknown;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  showAttendees?: boolean;
  className?: string;
}

export interface RecurringEventProps {
  event: unknown;
  onUpdateSeries?: (updates: unknown) => void;
  onUpdateInstance?: (instanceId: string, updates: unknown) => void;
  onDeleteSeries?: () => void;
  onDeleteInstance?: (instanceId: string) => void;
  className?: string;
}

// ================================
// CALENDAR NAVIGATION INTERFACES
// ================================

export interface CalendarNavigationProps {
  currentDate: Date;
  viewMode: 'month' | 'week' | 'day' | 'agenda';
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onDateSelect: (date: Date) => void;
  onViewModeChange: (mode: 'month' | 'week' | 'day' | 'agenda') => void;
  showMiniCalendar?: boolean;
  className?: string;
}

export interface MiniCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  highlightedDates?: Date[];
  disabledDates?: Date[];
  showWeekNumbers?: boolean;
  className?: string;
}

// ================================
// CALENDAR WIDGET INTERFACES
// ================================

export interface CalendarDashboardWidgetProps {
  maxEvents?: number;
  timeframe?: 'today' | 'week' | 'month';
  onEventClick?: (eventId: string) => void;
  onCreateEvent?: () => void;
  showCreateButton?: boolean;
  compact?: boolean;
  className?: string;
}

// ============================================================================
// CREATE EVENT SHEET COMPONENT INTERFACES
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
