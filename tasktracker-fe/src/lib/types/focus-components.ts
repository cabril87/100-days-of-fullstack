// Focus Component Types and Interfaces
// Following Enterprise Standards - Component-specific types
// Copyright (c) 2025 TaskTracker Enterprise

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

// ============================================================================
// FOCUS MODE MANAGER COMPONENT PROPS
// ============================================================================

export interface FocusModeManagerProps {
  className?: string;
  userId?: number;
  showTaskDetails?: boolean;
  showStreakCounter?: boolean;
  showKeyboardHelp?: boolean;
  onSessionStateChange?: (state: FocusSessionState) => void;
  onSessionComplete?: (session: FocusSession) => void;
}

// ============================================================================
// FOCUS TIMER COMPONENT PROPS
// ============================================================================

export interface FocusTimerProps {
  session: FocusSession | null;
  timerState: TimerState;
  isLoading?: boolean;
  className?: string;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onRecordDistraction: () => void;
}

// ============================================================================
// TASK SELECTION MODAL PROPS
// ============================================================================

export interface TaskSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskSelect: (task: TaskItem, createDto: CreateFocusSessionDTO) => Promise<void>;
  userId?: number;
  className?: string;
}

// ============================================================================
// SESSION COMPLETION DIALOG PROPS
// ============================================================================

export interface SessionCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  session: FocusSession;
  task: TaskItem;
  onComplete: (completion: CompleteFocusSessionDTO) => void;
  isLoading?: boolean;
  className?: string;
}

// ============================================================================
// DISTRACTION RECORDING MODAL PROPS
// ============================================================================

export interface DistractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number;
  onDistractionRecorded: (distraction: CreateDistractionDTO) => void;
  isLoading?: boolean;
  categories?: DistractionCategory[];
  className?: string;
}

// ============================================================================
// FOCUS ANALYTICS DASHBOARD PROPS
// ============================================================================

export interface FocusAnalyticsDashboardProps {
  className?: string;
  userId?: number;
  timeRange?: 'day' | 'week' | 'month' | 'year';
  showInsights?: boolean;
  showHistory?: boolean;
}

// ============================================================================
// FOCUS HISTORY LIST PROPS
// ============================================================================

export interface FocusHistoryListProps {
  className?: string;
  userId?: number;
  pageSize?: number;
  onSessionSelect?: (session: FocusSession) => void;
}

// ============================================================================
// FOCUS STREAK COUNTER PROPS
// ============================================================================

export interface FocusStreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  qualityStreak: number;
  isLoading?: boolean;
  compact?: boolean;
  showAnimation?: boolean;
  className?: string;
}

// ============================================================================
// FOCUS PAGE COMPONENT PROPS
// ============================================================================

export interface FocusPageProps {
  userId: number;
  initialSession?: FocusSession | null;
  initialTasks?: TaskItem[];
  className?: string;
}

// ============================================================================
// FOCUS SESSION MANAGER PROPS
// ============================================================================

export interface FocusSessionManagerProps {
  className?: string;
  userId?: number;
  showTaskDetails?: boolean;
  showStreakCounter?: boolean;
  showKeyboardHelp?: boolean;
  onSessionStateChange?: (state: FocusSessionState) => void;
  onSessionComplete?: (session: FocusSession) => void;
}

// ============================================================================
// FOCUS STATISTICS WIDGET PROPS
// ============================================================================

export interface FocusStatisticsWidgetProps {
  className?: string;
  userId?: number;
  compact?: boolean;
  showTrends?: boolean;
}

// ============================================================================
// PRODUCTIVITY INSIGHTS PROPS
// ============================================================================

export interface ProductivityInsightsProps {
  className?: string;
  insights: ProductivityInsightsDTO;
  onInsightClick?: (insight: string) => void;
}

// Note: Core business logic types moved to lib/types/focus.ts per enterprise standards 