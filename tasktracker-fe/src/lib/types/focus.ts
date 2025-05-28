/**
 * Focus and productivity related types
 */

import { Task } from './task';

export interface FocusSession {
  id: number;
  taskId: number;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  isCompleted: boolean;
  notes?: string;
  status: 'InProgress' | 'Completed' | 'Interrupted' | 'Paused';
  task?: Task;
  sessionQualityRating?: number;
  completionNotes?: string;
  taskProgressBefore: number;
  taskProgressAfter: number;
  taskCompletedDuringSession: boolean;
}

export interface FocusStatistics {
  totalMinutesFocused: number;
  sessionCount: number;
  distractionCount: number;
  distractionsByCategory: Record<string, number>;
  averageSessionLength: number;
  dailyFocusMinutes: Record<string, number>;
}

export interface Distraction {
  id: number;
  sessionId: number;
  timestamp: string;
  description: string;
  category: string;
}

export interface DistractionCreate {
  sessionId: number;
  description: string;
  category: string;
}

export interface FocusRequest {
  taskId: number;
  notes?: string;
}

export interface FocusSessionCompleteRequest {
  sessionQualityRating?: number;
  completionNotes?: string;
  taskProgressAfter?: number;
  taskCompletedDuringSession?: boolean;
}

export interface TaskProgressUpdate {
  progressPercentage: number;
  notes?: string;
}

export interface TaskTimeTracking {
  taskId: number;
  title: string;
  estimatedTimeMinutes?: number;
  actualTimeSpentMinutes: number;
  totalFocusSessions: number;
  averageSessionLength: number;
  progressPercentage: number;
  timeEfficiencyRating?: number;
  isCompleted: boolean;
  completedAt?: string;
  focusSessions: FocusSessionSummary[];
}

export interface FocusSessionSummary {
  id: number;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  sessionQualityRating?: number;
  status: string;
  distractionCount: number;
}

export interface ProductivityInsights {
  timeOfDayPatterns: TimeOfDayInsights;
  streakData: FocusStreakData;
  correlations: CorrelationInsights;
  taskTypeInsights: TaskTypeFocusInsights;
  recommendations: ProductivityRecommendation[];
}

export interface TimeOfDayInsights {
  hourlyQualityRatings: Record<number, number>;
  hourlySessionCounts: Record<number, number>;
  hourlyAverageLength: Record<number, number>;
  hourlyCompletionRates: Record<number, number>;
  bestFocusHour: number;
  worstFocusHour: number;
  bestHourQuality: number;
  worstHourQuality: number;
}

export interface FocusStreakData {
  currentStreak: number;
  longestStreak: number;
  qualityStreak: number;
  streakHistory: StreakPeriod[];
  streakImpactOnProductivity: number;
}

export interface StreakPeriod {
  startDate: string;
  endDate: string;
  length: number;
  averageQuality: number;
}

export interface CorrelationInsights {
  sessionLengthQualityCorrelation: number;
  distractionQualityCorrelation: number;
  taskProgressSessionQualityCorrelation: number;
  completionRateQualityCorrelation: number;
}

export interface TaskTypeFocusInsights {
  categoryEffectiveness: Record<string, number>;
  categoryAverageQuality: Record<string, number>;
  categorySessionCounts: Record<string, number>;
  mostFocusedCategory: string;
  highestQualityCategory: string;
}

export interface ProductivityRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: number;
} 