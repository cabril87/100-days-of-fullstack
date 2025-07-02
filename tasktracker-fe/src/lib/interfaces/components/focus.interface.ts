// Focus Component Interfaces - Moved from lib/types/focus-components.ts for .cursorrules compliance
// lib/interfaces/components/focus.interface.ts

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
} from '@/lib/types/focus';

// ============================================================================
// FOCUS MODE MANAGER COMPONENT INTERFACES
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
// FOCUS TIMER COMPONENT INTERFACES
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
// TASK SELECTION MODAL INTERFACES
// ============================================================================

export interface TaskSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskSelect: (task: TaskItem, createDto: CreateFocusSessionDTO) => Promise<void>;
  userId?: number;
  className?: string;
}

// ============================================================================
// SESSION COMPLETION DIALOG INTERFACES
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
// DISTRACTION RECORDING MODAL INTERFACES
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
// FOCUS ANALYTICS DASHBOARD INTERFACES
// ============================================================================

export interface FocusAnalyticsDashboardProps {
  className?: string;
  userId?: number;
  timeRange?: 'day' | 'week' | 'month' | 'year';
  showInsights?: boolean;
  showHistory?: boolean;
}

// ============================================================================
// FOCUS HISTORY LIST INTERFACES
// ============================================================================

export interface FocusHistoryListProps {
  className?: string;
  userId?: number;
  pageSize?: number;
  onSessionSelect?: (session: FocusSession) => void;
}

// ============================================================================
// FOCUS STREAK COUNTER INTERFACES
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
// FOCUS PAGE COMPONENT INTERFACES
// ============================================================================

export interface FocusPageProps {
  userId: number;
  initialSession?: FocusSession | null;
  initialTasks?: TaskItem[];
  className?: string;
}

// ============================================================================
// FOCUS SESSION MANAGER INTERFACES
// ============================================================================

export interface FocusSessionManagerProps {
  className?: string;
  userId?: number;
  showTaskDetails?: boolean;
  showStreakCounter?: boolean;
  showKeyboardHelp?: boolean;
  refreshTrigger?: number; // ✅ NEW: Trigger to force session reload
  onSessionStateChange?: (state: FocusSessionState) => void;
  onSessionComplete?: (session: FocusSession) => void;
}

// ============================================================================
// FOCUS STATISTICS WIDGET INTERFACES
// ============================================================================

export interface FocusStatisticsWidgetProps {
  className?: string;
  userId?: number;
  compact?: boolean;
  showTrends?: boolean;
}

// ============================================================================
// PRODUCTIVITY INSIGHTS INTERFACES
// ============================================================================

export interface ProductivityInsightsProps {
  className?: string;
  insights: ProductivityInsightsDTO;
  onInsightClick?: (insight: string) => void;
}

// ============================================================================
// FOCUS HISTORY MANAGEMENT INTERFACES
// ============================================================================

export interface FocusHistoryManagementProps {
  className?: string;
  userId?: number;
  sessions?: FocusSession[];
  onSessionsChange?: (sessions: FocusSession[]) => void;
  showExportOptions?: boolean;
  showBulkOperations?: boolean;
  showDeleteConfirmation?: boolean;
} 