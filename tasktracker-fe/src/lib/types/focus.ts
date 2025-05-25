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