// Calendar Types for Enterprise TaskTracker System
// Following clean architecture - types mirror backend DTOs exactly

import { User } from '../auth/auth';
import { FamilyTaskItemDTO } from '../tasks/task.type';

// Simple achievement display type for calendar integration
export interface AchievementDisplayDTO {
  id: number;
  name: string;
  description: string;
  pointValue: number;
  iconUrl?: string;
  earnedAt: Date;
}

// ============================================================================
// CALENDAR EVENT TYPES - Mirror Backend FamilyCalendarEvent Model
// ============================================================================

export interface CalendarEventDTO {
  id: number;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  location?: string;
  color: string;
  familyId?: number;
  createdByUserId: number;
  taskId?: number;
  achievementId?: number;
  eventType: CalendarEventType;
  recurrence?: CalendarRecurrence;
  createdAt: Date;
  updatedAt: Date;
}

export type CalendarEventType = 
  | 'task' 
  | 'achievement' 
  | 'family_activity' 
  | 'celebration' 
  | 'reminder' 
  | 'meeting'
  | 'deadline';

export interface CalendarRecurrence {
  type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  daysOfWeek?: number[]; // 0-6, Sunday = 0
}

// ============================================================================
// CALENDAR VIEW TYPES - Apple-like Calendar Interface
// ============================================================================

export type CalendarViewType = 'month' | 'week' | 'day' | 'list';

export interface CalendarViewConfig {
  viewType: CalendarViewType;
  currentDate: Date;
  showWeekends: boolean;
  showTaskPoints: boolean;
  showAchievements: boolean;
  compactMode: boolean;
}

export interface CalendarDayData {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  events: CalendarEventDTO[];
  tasks: FamilyTaskItemDTO[];
  totalPoints: number;
  hasAchievements: boolean;
  isSelected: boolean;
}

export interface CalendarWeekData {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  days: CalendarDayData[];
  totalEvents: number;
  totalPoints: number;
  completedTasks: number;
}

export interface CalendarMonthData {
  month: number;
  year: number;
  monthName: string;
  weeks: CalendarWeekData[];
  totalEvents: number;
  totalPoints: number;
  totalTasks: number;
  completedTasks: number;
}

// ============================================================================
// GAMIFICATION INTEGRATION TYPES
// ============================================================================

export interface CalendarGamificationData {
  dailyPoints: Record<string, number>; // Date string -> points
  weeklyStreaks: Record<string, number>; // Week string -> streak days
  monthlyAchievements: AchievementDisplayDTO[];
  taskCompletionRates: Record<string, number>; // Date string -> completion %
  familyActivityLevels: Record<string, number>; // Date string -> activity level
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

// ============================================================================
// CALENDAR PAGE PROPS - Following Enterprise Component Patterns
// ============================================================================

export interface CalendarPageProps {
  user: User;
  initialData: CalendarInitialData;
}

export interface CalendarInitialData {
  events: CalendarEventDTO[];
  familyTasks: FamilyTaskItemDTO[];
  achievements: AchievementDisplayDTO[];
  stats: CalendarStatsDTO;
}

export interface CalendarPageWrapperProps {
  user: User;
  initialData: CalendarInitialData;
}

// ============================================================================
// CALENDAR COMPONENT PROPS
// ============================================================================

export interface AppleCalendarViewProps {
  viewType: CalendarViewType;
  currentDate: Date;
  selectedDate?: Date | null;
  events: CalendarEventDTO[];
  tasks: FamilyTaskItemDTO[];
  onDateSelect: (date: Date) => void;
  onEventSelect: (event: CalendarEventDTO) => void;
  onTaskSelect: (task: FamilyTaskItemDTO) => void;
  gamificationData: CalendarGamificationData;
  className?: string;
  onCreateEvent?: (selectedDate: Date, selectedTime?: string) => void;
}

export interface CalendarControlsProps {
  viewType: CalendarViewType;
  currentDate: Date;
  onViewChange: (viewType: CalendarViewType) => void;
  onDateChange: (date: Date) => void;
  onToday: () => void;
  stats: CalendarStatsDTO;
  className?: string;
}

export interface CalendarEventCardProps {
  event: CalendarEventDTO;
  isCompact?: boolean;
  showPoints?: boolean;
  onClick?: (event: CalendarEventDTO) => void;
  className?: string;
}

export interface CalendarTaskCardProps {
  task: FamilyTaskItemDTO;
  isCompact?: boolean;
  showPoints?: boolean;
  onClick?: (task: FamilyTaskItemDTO) => void;
  onComplete?: (taskId: number) => void;
  className?: string;
}

// ============================================================================
// CALENDAR DASHBOARD WIDGET TYPES
// ============================================================================

export interface CalendarDashboardWidgetProps {
  userId: number;
  viewMode: 'simple' | 'advanced';
  events: CalendarEventDTO[];
  upcomingTasks: FamilyTaskItemDTO[];
  stats: CalendarStatsDTO;
  onNavigateToCalendar: () => void;
  className?: string;
}

export interface MiniCalendarProps {
  currentDate: Date;
  selectedDate?: Date;
  events: CalendarEventDTO[];
  tasks: FamilyTaskItemDTO[];
  onDateSelect: (date: Date) => void;
  showTaskDots?: boolean;
  showAchievementBadges?: boolean;
  className?: string;
}

// ============================================================================
// CALENDAR API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CalendarEventsRequestDTO {
  startDate: Date;
  endDate: Date;
  familyId?: number;
  eventTypes?: CalendarEventType[];
  includeTasks?: boolean;
  includeAchievements?: boolean;
}

export interface CalendarEventsResponseDTO {
  events: CalendarEventDTO[];
  tasks: FamilyTaskItemDTO[];
  achievements: AchievementDisplayDTO[];
  stats: CalendarStatsDTO;
  totalCount: number;
}

export interface CreateCalendarEventRequestDTO {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  location?: string;
  color: string;
  familyId?: number;
  eventType: CalendarEventType;
  recurrence?: CalendarRecurrence;
  taskId?: number;
}

export interface UpdateCalendarEventRequestDTO extends Partial<CreateCalendarEventRequestDTO> {
  id: number;
}

// ============================================================================
// CALENDAR UTILITIES AND HELPERS
// ============================================================================

export interface CalendarNavigationHelpers {
  goToToday: () => void;
  goToNextPeriod: () => void;
  goToPreviousPeriod: () => void;
  goToSpecificDate: (date: Date) => void;
  changeView: (viewType: CalendarViewType) => void;
}

export interface CalendarDisplayHelpers {
  formatDateForView: (date: Date, viewType: CalendarViewType) => string;
  getEventsByDate: (date: Date) => CalendarEventDTO[];
  getTasksByDate: (date: Date) => FamilyTaskItemDTO[];
  calculateDayPoints: (date: Date) => number;
  isDateHighlighted: (date: Date) => boolean;
}

// ============================================================================
// CALENDAR HOOK RETURN TYPES
// ============================================================================

export interface UseCalendarDataReturn {
  events: CalendarEventDTO[];
  tasks: FamilyTaskItemDTO[];
  achievements: AchievementDisplayDTO[];
  stats: CalendarStatsDTO;
  gamificationData: CalendarGamificationData;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseCalendarViewReturn {
  viewType: CalendarViewType;
  currentDate: Date;
  selectedDate: Date | null;
  viewConfig: CalendarViewConfig;
  navigation: CalendarNavigationHelpers;
  display: CalendarDisplayHelpers;
  setViewType: (viewType: CalendarViewType) => void;
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date | null) => void;
}

// Add conflict resolution types following enterprise standards
export interface ConflictingEventDTO {
  id: string | number;
  title: string;
  startTime: Date;
  endTime: Date;
  type: 'event' | 'task';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  attendees?: string[];
  conflictSeverity: 'low' | 'medium' | 'high';
}

export interface ConflictResolutionDTO {
  type: 'move' | 'shorten' | 'ignore' | 'cancel';
  suggestedTime?: {
    start: string;
    end: string;
  };
  message: string;
  severity: 'info' | 'warning' | 'error';
  autoApply?: boolean;
}

export interface ConflictDetectionRequestDTO {
  newEventStart: Date;
  newEventEnd: Date;
  existingEvents: CalendarEventDTO[];
  existingTasks: FamilyTaskItemDTO[];
  excludeId?: string | number;
  userPreferences?: {
    allowOverlapping: boolean;
    preferredBuffer: number; // minutes
    autoResolve: boolean;
  };
}

export interface ConflictDetectionResponseDTO {
  hasConflicts: boolean;
  conflicts: ConflictingEventDTO[];
  suggestedResolutions: ConflictResolutionDTO[];
  severity: 'none' | 'low' | 'medium' | 'high';
  canProceed: boolean;
} 

// ============================================================================
// FORM HANDLING TYPES - Following Enterprise Standards
// ============================================================================

export interface PendingEventData {
  eventData: {
    title: string;
    description?: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    color: string;
    location?: string;
    isAllDay: boolean;
    isRecurring: boolean;
    recurringPattern?: 'weekly' | 'monthly' | 'yearly';
  };
  conflicts: ConflictingEventDTO[];
}

export interface PriorityOption {
  value: 'low' | 'medium' | 'high' | 'urgent';
  label: string;
  color: string;
}

// ============================================================================
// CALENDAR CONSTANTS - Following Enterprise Standards
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