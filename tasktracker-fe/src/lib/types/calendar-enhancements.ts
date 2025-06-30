// Advanced Calendar Enhancement Types for Enterprise TaskTracker System
// Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md - Explicit Types Only
// Copyright (c) 2025 TaskTracker Enterprise

// ============================================================================
// GESTURE SYSTEM TYPES
// ============================================================================

export interface CalendarGestureProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onPinchZoom: (scale: number) => void;
  onLongPress: (event: React.TouchEvent<HTMLDivElement>) => void;
  isEnabled: boolean;
  minimumSwipeDistance: number;
  longPressDuration: number;
}

export interface TouchGestureEvent {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  duration: number;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  scale?: number;
}

export interface HapticFeedbackPattern {
  pattern: 'light' | 'medium' | 'heavy' | 'start' | 'success' | 'error';
  vibrationMs: number | number[];
}

// ============================================================================
// CONFLICT DETECTION TYPES
// ============================================================================

export interface ConflictDetectionDTO {
  hasConflicts: boolean;
  conflicts: EventConflictDTO[];
  suggestions: ConflictResolutionDTO[];
  familyAvailability: FamilyMemberAvailabilityDTO[];
}

export interface EventConflictDTO {
  conflictingEventId: number;
  conflictingEventTitle: string;
  conflictingEventStart: Date;
  conflictingEventEnd: Date;
  conflictType: 'overlap' | 'back_to_back' | 'travel_time' | 'double_booking';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedFamilyMembers: number[];
  resolutionSuggestions: string[];
}

export interface ConflictResolutionDTO {
  suggestionId: string;
  suggestedStartTime: Date;
  suggestedEndTime: Date;
  rationale: string;
  confidence: number;
  travelTimeBuffer: number;
  familyMemberImpact: FamilyMemberImpactDTO[];
}

export interface FamilyMemberAvailabilityDTO {
  userId: number;
  userName: string;
  isAvailable: boolean;
  conflictingEvents: EventConflictDTO[];
  suggestedAlternatives: Date[];
  preferredTimeSlots: TimeSlotDTO[];
}

export interface TimeSlotDTO {
  startTime: Date;
  endTime: Date;
  isPreferred: boolean;
  availabilityScore: number;
}

export interface FamilyMemberImpactDTO {
  userId: number;
  impactLevel: 'none' | 'minimal' | 'moderate' | 'significant';
  description: string;
}

// ============================================================================
// SMART SUGGESTIONS TYPES
// ============================================================================

export interface SmartSuggestionDTO {
  suggestionId: string;
  suggestionType: 'duration' | 'location' | 'timing' | 'title' | 'participants';
  suggestedValue: string | number | Date;
  confidence: number;
  reasoning: string;
  learningSource: 'user_patterns' | 'family_patterns' | 'ai_analysis' | 'common_practice';
}

export interface DurationPresetDTO {
  label: string;
  minutes: number;
  icon: string;
  isCustom: boolean;
  usageFrequency: number;
}

export interface EventPatternDTO {
  patternId: string;
  eventType: string;
  commonDuration: number;
  commonLocation: string;
  commonParticipants: number[];
  frequency: number;
  lastUsed: Date;
}

// ============================================================================
// MOBILE ENHANCEMENT TYPES
// ============================================================================

export interface MobileCalendarEnhancementsProps {
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
  hapticSettings: HapticFeedbackSettings;
}

export interface HapticFeedbackSettings {
  isEnabled: boolean;
  intensity: 'light' | 'medium' | 'heavy';
  patterns: {
    navigation: HapticFeedbackPattern;
    confirmation: HapticFeedbackPattern;
    error: HapticFeedbackPattern;
    success: HapticFeedbackPattern;
  };
}

export interface PullToRefreshState {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  refreshThreshold: number;
}

// ============================================================================
// CALENDAR INTELLIGENCE TYPES
// ============================================================================

export interface CalendarAnalyticsDTO {
  productivityScore: number;
  meetingEfficiency: number;
  familyEngagementLevel: number;
  commonMeetingPatterns: EventPatternDTO[];
  recommendedOptimizations: OptimizationSuggestionDTO[];
  timeManagementInsights: TimeManagementInsightDTO[];
}

export interface OptimizationSuggestionDTO {
  suggestionId: string;
  category: 'time_blocking' | 'meeting_reduction' | 'family_time' | 'buffer_time';
  title: string;
  description: string;
  potentialTimeSavings: number;
  implementationDifficulty: 'easy' | 'medium' | 'hard';
  priority: 'low' | 'medium' | 'high';
}

export interface TimeManagementInsightDTO {
  insightId: string;
  metric: string;
  currentValue: number;
  previousValue: number;
  trend: 'improving' | 'declining' | 'stable';
  recommendation: string;
}

// ============================================================================
// FAMILY COLLABORATION TYPES
// ============================================================================

export interface FamilyEventVotingDTO {
  eventId: number;
  proposedTimeSlots: VotingTimeSlotDTO[];
  votingDeadline: Date;
  requiredParticipants: number[];
  optionalParticipants: number[];
  votingStatus: 'open' | 'closed' | 'decided';
  consensus: boolean;
}

export interface VotingTimeSlotDTO {
  slotId: string;
  startTime: Date;
  endTime: Date;
  votes: FamilyVoteDTO[];
  score: number;
  isWinner: boolean;
}

export interface FamilyVoteDTO {
  userId: number;
  userName: string;
  preference: 'preferred' | 'acceptable' | 'unavailable';
  votedAt: Date;
  comment?: string;
}

export interface FamilyMilestoneDTO {
  milestoneId: number;
  title: string;
  description: string;
  targetDate: Date;
  category: 'birthday' | 'anniversary' | 'achievement' | 'holiday' | 'custom';
  familyMembers: number[];
  isRecurring: boolean;
  reminderSettings: MilestoneReminderDTO[];
  celebrationPlanned: boolean;
}

export interface MilestoneReminderDTO {
  reminderType: 'notification' | 'email' | 'calendar_event';
  daysBeforeEvent: number;
  isEnabled: boolean;
  customMessage: string;
}

// ============================================================================
// ACCESSIBILITY & PERFORMANCE TYPES
// ============================================================================

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  voiceControl: boolean;
}

export interface PerformanceMetrics {
  renderTime: number;
  dataLoadTime: number;
  gestureResponseTime: number;
  cacheHitRate: number;
  memoryUsage: number;
}

export interface CalendarCacheEntry {
  cacheKey: string;
  data: Record<string, unknown>; // Specific to cached content type
  timestamp: Date;
  expiresAt: Date;
  isStale: boolean;
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

export interface UseCalendarGesturesReturn {
  gestureHandlers: {
    onTouchStart: (event: React.TouchEvent<HTMLDivElement>) => void;
    onTouchMove: (event: React.TouchEvent<HTMLDivElement>) => void;
    onTouchEnd: (event: React.TouchEvent<HTMLDivElement>) => void;
  };
  gestureState: {
    isGestureActive: boolean;
    currentGesture: TouchGestureEvent | null;
    lastGesture: TouchGestureEvent | null;
  };
  settings: CalendarGestureProps;
}

export interface UseConflictDetectionReturn {
  checkConflicts: (eventData: Record<string, unknown>) => Promise<ConflictDetectionDTO>;
  conflictState: {
    isChecking: boolean;
    conflicts: EventConflictDTO[];
    suggestions: ConflictResolutionDTO[];
    hasConflicts: boolean;
  };
  resolveConflict: (resolutionId: string) => Promise<boolean>;
}

export interface UseSmartSuggestionsReturn {
  getSuggestions: (eventType: string, context: Record<string, unknown>) => SmartSuggestionDTO[];
  applySuggestion: (suggestionId: string) => void;
  learnFromEvent: (eventData: Record<string, unknown>) => void;
  suggestionState: {
    isLoading: boolean;
    suggestions: SmartSuggestionDTO[];
    patterns: EventPatternDTO[];
  };
} 