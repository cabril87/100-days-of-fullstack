/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * Focus Component Props - Moved from lib/types/focus/ for .cursorrules compliance
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md enterprise standards
 */

// ============================================================================
// FOCUS COMPONENT BASE PROPS
// ============================================================================

export interface FocusComponentProps {
  className?: string;
  userId: number;
  familyId: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: Record<string, unknown>) => void;
  disabled?: boolean;
  loading?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export interface FocusTimerProps extends FocusComponentProps {
  initialDuration: number;
  onTimerStart?: () => void;
  onTimerPause?: () => void;
  onTimerResume?: () => void;
  onTimerStop?: () => void;
  onTimerComplete?: () => void;
  onTick?: (remainingTime: number) => void;
  autoStart?: boolean;
  showControls?: boolean;
  showProgress?: boolean;
  playSound?: boolean;
  enableNotifications?: boolean;
}

export interface TaskSelectionProps extends FocusComponentProps {
  availableTasks: Array<Record<string, unknown>>;
  selectedTasks?: Array<number>;
  onTaskSelect?: (taskIds: Array<number>) => void;
  onTaskDeselect?: (taskId: number) => void;
  onSelectionComplete?: (tasks: Array<Record<string, unknown>>) => void;
  maxSelectable?: number;
  showTaskDetails?: boolean;
  showEstimatedTime?: boolean;
  allowReordering?: boolean;
  groupBy?: 'priority' | 'category' | 'due_date' | 'project';
}

export interface SessionCompletionProps extends FocusComponentProps {
  session: Record<string, unknown>;
  completedTasks: Array<Record<string, unknown>>;
  timeSpent: number;
  pointsEarned?: number;
  achievementsUnlocked?: Array<Record<string, unknown>>;
  onContinue?: () => void;
  onNewSession?: () => void;
  onReview?: () => void;
  onShare?: () => void;
  showStats?: boolean;
  showAchievements?: boolean;
  showReflection?: boolean;
  autoRedirect?: boolean;
  redirectDelay?: number;
}

export interface FocusAnalyticsProps extends FocusComponentProps {
  analyticsData: Record<string, unknown>;
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'pdf' | 'json') => void;
  onPeriodChange?: (period: string) => void;
  period?: 'day' | 'week' | 'month' | 'year';
  showTrends?: boolean;
  showComparisons?: boolean;
  showGoals?: boolean;
  showInsights?: boolean;
  interactive?: boolean;
}

// ============================================================================
// FOCUS MODE MANAGER COMPONENT PROPS
// ============================================================================

export interface FocusModeManagerProps {
  className?: string;
  userId: number;
  familyId: number;
  onModeStart?: (mode: Record<string, unknown>) => void;
  onModeEnd?: (session: Record<string, unknown>) => void;
  onModeUpdate?: (session: Record<string, unknown>) => void;
  onError?: (error: Error) => void;
  availableModes: Array<Record<string, unknown>>;
  defaultMode?: string;
  showModeSelector?: boolean;
  showSessionHistory?: boolean;
  showAnalytics?: boolean;
  autoSave?: boolean;
  notifications?: boolean;
}

// ============================================================================
// FOCUS SESSION COMPONENT PROPS
// ============================================================================

export interface FocusSessionProps {
  className?: string;
  session: Record<string, unknown>;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  onComplete?: () => void;
  onUpdate?: (session: Record<string, unknown>) => void;
  showTimer?: boolean;
  showTasks?: boolean;
  showProgress?: boolean;
  showNotes?: boolean;
  allowPause?: boolean;
  allowStop?: boolean;
  allowTaskSwitch?: boolean;
}

export interface FocusBreakProps {
  className?: string;
  breakType: 'short' | 'long' | 'meal' | 'custom';
  duration: number;
  onBreakStart?: () => void;
  onBreakEnd?: () => void;
  onBreakSkip?: () => void;
  onBreakExtend?: (additionalTime: number) => void;
  showSuggestions?: boolean;
  showTimer?: boolean;
  showActivities?: boolean;
  allowSkip?: boolean;
  allowExtend?: boolean;
  activities?: Array<Record<string, unknown>>;
}

export interface FocusStatsProps {
  className?: string;
  stats: Record<string, unknown>;
  onStatClick?: (statKey: string) => void;
  onRefresh?: () => void;
  onGoalSet?: (goal: Record<string, unknown>) => void;
  showGoals?: boolean;
  showTrends?: boolean;
  showComparisons?: boolean;
  showInsights?: boolean;
  period?: 'today' | 'week' | 'month' | 'year';
  layout?: 'grid' | 'list' | 'chart';
}

// ============================================================================
// FOCUS SETTINGS COMPONENT PROPS
// ============================================================================

export interface FocusSettingsProps {
  className?: string;
  settings: Record<string, unknown>;
  onSettingsChange?: (settings: Record<string, unknown>) => void;
  onReset?: () => void;
  onSave?: () => void;
  showSoundSettings?: boolean;
  showNotificationSettings?: boolean;
  showTimerSettings?: boolean;
  showBreakSettings?: boolean;
  showAdvancedSettings?: boolean;
  presets?: Array<Record<string, unknown>>;
}

export interface FocusEnvironmentProps {
  className?: string;
  environment: Record<string, unknown>;
  onEnvironmentChange?: (env: Record<string, unknown>) => void;
  onCustomize?: () => void;
  showBackgrounds?: boolean;
  showSounds?: boolean;
  showLighting?: boolean;
  showDistractionBlocking?: boolean;
  presets?: Array<Record<string, unknown>>;
  allowCustomization?: boolean;
} 