/**
 * Progress tracking and analytics related types
 */

import { Task } from './task';
import { Board, BoardColumn } from './board';

export interface ProgressData {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTime: number; // in days
  throughput: number; // tasks completed per week
  velocity: number; // story points per sprint
}

export interface ColumnProgress {
  columnId: number;
  columnName: string;
  taskCount: number;
  completedTasksInColumn: number;
  averageTimeInColumn: number; // in days
  wipUtilization: number; // percentage
  throughputRate: number; // tasks per week
  bottleneckIndicator: boolean;
}

export interface TimelineData {
  date: string;
  completed: number;
  created: number;
  moved: number;
  archived: number;
}

export interface TaskMetrics {
  taskId: number;
  title: string;
  status: string;
  priority: string;
  timeInCurrentStatus: number; // hours
  totalCycleTime: number; // hours
  leadTime: number; // hours
  blockedTime: number; // hours
  moveCount: number;
  assigneeChanges: number;
}

export interface TeamPerformanceMetrics {
  memberId: string;
  memberName: string;
  tasksCompleted: number;
  averageCompletionTime: number;
  tasksInProgress: number;
  tasksOverdue: number;
  velocityTrend: number[];
  productivityScore: number;
}

export interface BoardAnalytics {
  boardId: number;
  boardName: string;
  dateRange: {
    start: string;
    end: string;
  };
  progress: ProgressData;
  columns: ColumnProgress[];
  timeline: TimelineData[];
  teamMetrics: TeamPerformanceMetrics[];
  bottlenecks: BottleneckAnalysis[];
  trends: TrendAnalysis;
}

export interface BottleneckAnalysis {
  columnId: number;
  columnName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  averageWaitTime: number; // hours
  taskCount: number;
  recommendations: string[];
}

export interface TrendAnalysis {
  velocityTrend: 'increasing' | 'decreasing' | 'stable';
  throughputTrend: 'increasing' | 'decreasing' | 'stable';
  completionRateTrend: 'improving' | 'declining' | 'stable';
  averageCycleTimeTrend: 'decreasing' | 'increasing' | 'stable';
  predictedCapacity: number;
  burndownData: BurndownPoint[];
}

export interface BurndownPoint {
  date: string;
  remaining: number;
  completed: number;
  ideal: number;
}

export interface PriorityDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface StatusDistribution {
  todo: number;
  inProgress: number;
  review: number;
  done: number;
  blocked: number;
  custom: Record<string, number>;
}

export interface ProgressReportConfig {
  timeRange: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  customDateRange?: {
    start: string;
    end: string;
  };
  includeMetrics: string[];
  groupBy: 'user' | 'column' | 'priority' | 'label';
  filterBy?: {
    assignees?: string[];
    priorities?: string[];
    labels?: string[];
    statuses?: string[];
  };
}

export interface ProgressAlert {
  id: string;
  type: 'bottleneck' | 'overdue' | 'velocity_drop' | 'wip_limit' | 'cycle_time_increase';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  recommendations: string[];
  createdAt: string;
  isAcknowledged: boolean;
}

// Dashboard Props Interfaces
export interface ProgressTrackingDashboardProps {
  board: Board;
  columns: BoardColumn[];
  tasks: Task[];
  analytics?: BoardAnalytics;
  isOpen: boolean;
  onClose: () => void;
  onExportReport?: (config: ProgressReportConfig) => Promise<void>;
  onConfigureAlerts?: (alerts: ProgressAlert[]) => Promise<void>;
} 