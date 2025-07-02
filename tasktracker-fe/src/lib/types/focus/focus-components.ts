// ============================================================================
// FOCUS COMPONENT TYPES - .cursorrules compliant
// ============================================================================
// Only types, enums, and unions - NO Props interfaces (those are in lib/props/focus/)

import type { 
  FocusSession, 
  ProductivityInsightsDTO, 
  TaskItem, 
  CreateDistractionDTO,
  CompleteFocusSessionDTO,
  FocusSessionState,
  TimerState,
  DistractionCategory,
  CreateFocusSessionDTO
} from './focus';

// Focus Mode Types
export type FocusMode = 'timer' | 'session' | 'break' | 'longBreak';

export type SessionType = 'focus' | 'break' | 'longBreak';

export type TimerDisplay = 'digital' | 'analog' | 'progress' | 'minimal';

// Sort Types
export type TaskSortType = 'priority' | 'dueDate' | 'name' | 'estimatedTime';

// Timeframe Types
export type TimeframeType = 'day' | 'week' | 'month' | 'year';

// Size Types
export type WidgetSize = 'small' | 'medium' | 'large';

// Theme Types
export type FocusTheme = 'minimal' | 'gamified' | 'professional';

// Distraction Types
export type DistractionType = 'notification' | 'website' | 'app' | 'other';

// Statistics Types
export type StatisticType = 'totalTime' | 'sessions' | 'productivity' | 'streaks';

// Session completion data type
export type SessionCompletionData = {
  duration: number;
  completedTasks: TaskItem[];
  distractions: number;
  focusScore: number;
};

// Date range type
export type DateRange = {
  start: Date;
  end: Date;
};

// Custom styles type
export type CustomStyles = Record<string, string>;

// Session data type
export type SessionData = {
  id: number;
  duration: number;
  focusScore: number;
  distractionsCount: number;
  completedAt: Date;
};

// Break data type
export type BreakData = {
  duration: number;
  type: SessionType;
  completedAt: Date;
}; 