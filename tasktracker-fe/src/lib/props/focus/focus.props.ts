// ============================================================================
// FOCUS COMPONENT PROPS - .cursorrules compliant
// ============================================================================
// All focus component props moved from lib/types/focus/focus-components.ts

// Focus Core Props
export interface FocusModeManagerProps {
  className?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
  sessionDuration?: number;
  breakDuration?: number;
  longBreakDuration?: number;
  sessionsUntilLongBreak?: number;
  autoStartBreaks?: boolean;
  allowBreakSkip?: boolean;
  focusSound?: string;
  breakSound?: string;
  onSessionComplete?: (sessionData: any) => void;
  onBreakComplete?: (breakData: any) => void;
}

export interface FocusTimerProps {
  className?: string;
  duration?: number;
  isActive?: boolean;
  isPaused?: boolean;
  onComplete?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
  showProgressRing?: boolean;
  showTimeLeft?: boolean;
  allowPause?: boolean;
  allowReset?: boolean;
  customStyles?: Record<string, string>;
}

export interface TaskSelectionModalProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  availableTasks?: any[];
  selectedTasks?: any[];
  onTaskSelect?: (tasks: any[]) => void;
  maxSelectable?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  sortBy?: 'priority' | 'dueDate' | 'name';
}

export interface SessionCompletionDialogProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  sessionData?: {
    duration: number;
    completedTasks: any[];
    distractions: number;
    focusScore: number;
  };
  onContinue?: () => void;
  onTakeBreak?: () => void;
  onFinish?: () => void;
  showStats?: boolean;
  showAchievements?: boolean;
}

export interface DistractionModalProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  distractionType?: 'notification' | 'website' | 'app' | 'other';
  onLogDistraction?: (type: string, notes?: string) => void;
  onIgnore?: () => void;
  showQuickActions?: boolean;
  allowNotes?: boolean;
  commonDistractions?: string[];
  onBlockWebsite?: (url: string) => void;
  onMuteNotifications?: (duration: number) => void;
}

export interface FocusAnalyticsDashboardProps {
  className?: string;
  userId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  showSessionStats?: boolean;
  showProductivityTrends?: boolean;
  showGoalProgress?: boolean;
  showAchievements?: boolean;
}

export interface FocusHistoryListProps {
  className?: string;
  userId?: string;
  sessions?: any[];
  onSessionSelect?: (session: any) => void;
  showFilters?: boolean;
  showExport?: boolean;
  pageSize?: number;
}

export interface FocusStreakCounterProps {
  className?: string;
  userId?: string;
  currentStreak?: number;
  longestStreak?: number;
  showWeeklyGoal?: boolean;
  weeklyTarget?: number;
  onStreakClick?: () => void;
  showCelebration?: boolean;
  theme?: 'minimal' | 'gamified' | 'professional';
}

export interface FocusPageProps {
  className?: string;
  initialMode?: 'timer' | 'session' | 'break';
  showSidebar?: boolean;
  showStats?: boolean;
  showTasks?: boolean;
  allowModeSwitch?: boolean;
}

export interface FocusSessionManagerProps {
  className?: string;
  sessionType?: 'focus' | 'break' | 'longBreak';
  duration?: number;
  tasks?: any[];
  onSessionStart?: () => void;
  onSessionEnd?: (sessionData: any) => void;
  onBreakStart?: () => void;
  onBreakEnd?: () => void;
  showNotifications?: boolean;
  playAudio?: boolean;
  allowDistractionLogging?: boolean;
  autoStartNextSession?: boolean;
}

export interface FocusStatisticsWidgetProps {
  className?: string;
  userId?: string;
  timeframe?: 'day' | 'week' | 'month' | 'year';
  statType?: 'totalTime' | 'sessions' | 'productivity' | 'streaks';
  showComparison?: boolean;
  showTrend?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface ProductivityInsightsProps {
  className?: string;
  userId?: string;
  insights?: any[];
  showRecommendations?: boolean;
  showTrends?: boolean;
  allowDismiss?: boolean;
}

export interface FocusHistoryManagementProps {
  className?: string;
  userId?: string;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowExport?: boolean;
  showBulkActions?: boolean;
} 