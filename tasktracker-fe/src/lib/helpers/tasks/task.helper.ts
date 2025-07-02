/*
 * Task Helper Functions
 * Extracted utility functions from task-related components
 * Following .cursorrules compliance standards
 */

import { Task, TaskItemStatus } from '@/lib/types/tasks';

// ================================
// TASK STATUS HELPERS
// ================================

/**
 * Gets status color for task display
 */
export const getTaskStatusColor = (status: TaskItemStatus): string => {
  switch (status) {
    case TaskItemStatus.NotStarted:
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case TaskItemStatus.InProgress:
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case TaskItemStatus.OnHold:
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case TaskItemStatus.Pending:
      return 'bg-orange-100 text-orange-700 border-orange-300';
    case TaskItemStatus.Completed:
      return 'bg-green-100 text-green-700 border-green-300';
    case TaskItemStatus.Cancelled:
      return 'bg-red-100 text-red-700 border-red-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

/**
 * Gets priority color for task display
 */
export const getTaskPriorityColor = (priority: string | undefined): string => {
  switch (priority?.toLowerCase()) {
    case 'low':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'high':
      return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'urgent':
      return 'bg-red-100 text-red-700 border-red-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

/**
 * Gets status display name
 */
export const getTaskStatusName = (status: TaskItemStatus): string => {
  switch (status) {
    case TaskItemStatus.NotStarted:
      return 'Not Started';
    case TaskItemStatus.InProgress:
      return 'In Progress';
    case TaskItemStatus.OnHold:
      return 'On Hold';
    case TaskItemStatus.Pending:
      return 'Pending';
    case TaskItemStatus.Completed:
      return 'Completed';
    case TaskItemStatus.Cancelled:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

// ================================
// TASK VALIDATION HELPERS
// ================================

/**
 * Validates task data before submission
 */
export const validateTaskData = (task: Partial<Task>): { 
  isValid: boolean; 
  errors: string[]; 
} => {
  const errors: string[] = [];

  if (!task.title?.trim()) {
    errors.push('Task title is required');
  }

  if (task.title && task.title.length > 200) {
    errors.push('Task title must be less than 200 characters');
  }

  if (task.description && task.description.length > 2000) {
    errors.push('Task description must be less than 2000 characters');
  }

  if (task.estimatedTimeMinutes && task.estimatedTimeMinutes < 0) {
    errors.push('Estimated time cannot be negative');
  }

  if (task.pointsValue && task.pointsValue < 0) {
    errors.push('Points value cannot be negative');
  }

  if (task.dueDate && task.dueDate < new Date()) {
    errors.push('Due date cannot be in the past');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// ================================
// TASK FORMATTING HELPERS
// ================================

/**
 * Formats task duration for display
 */
export const formatTaskDuration = (minutes?: number): string => {
  if (!minutes) return 'Not set';
  
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Formats task due date for display
 */
export const formatTaskDueDate = (dueDate?: Date): string => {
  if (!dueDate) return 'No due date';

  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays <= 7) return `Due in ${diffDays} days`;
  
  return dueDate.toLocaleDateString();
};

/**
 * Gets task completion percentage
 */
export const getTaskCompletionPercentage = (task: Task): number => {
  if (task.status === TaskItemStatus.Completed) return 100;
  if (task.status === TaskItemStatus.Cancelled) return 0;
  if (task.status === TaskItemStatus.NotStarted) return 0;
  if (task.status === TaskItemStatus.InProgress) return 50;
  if (task.status === TaskItemStatus.OnHold) return 25;
  if (task.status === TaskItemStatus.Pending) return 75;
  return 0;
};

// ================================
// TASK FILTERING HELPERS
// ================================

/**
 * Filters tasks based on multiple criteria
 */
export const filterTasks = (
  tasks: Task[], 
  filters: {
    status?: TaskItemStatus[];
    priority?: string[];
    assignee?: number[];
    search?: string;
    dueDate?: { before?: Date; after?: Date };
    tags?: string[];
  }
): Task[] => {
  return tasks.filter(task => {
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(task.status)) return false;
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(task.priority)) return false;
    }

    // Assignee filter
    if (filters.assignee && filters.assignee.length > 0) {
      if (!task.assignedToUserId || !filters.assignee.includes(task.assignedToUserId)) return false;
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(searchLower);
      const descriptionMatch = task.description?.toLowerCase().includes(searchLower);
      if (!titleMatch && !descriptionMatch) return false;
    }

    // Due date filter
    if (filters.dueDate) {
      if (!task.dueDate) return false;
      if (filters.dueDate.before && task.dueDate > filters.dueDate.before) return false;
      if (filters.dueDate.after && task.dueDate < filters.dueDate.after) return false;
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      if (!task.tags || task.tags.length === 0) return false;
      const taskTagNames = task.tags.map(tag => tag.name.toLowerCase());
      const hasMatchingTag = filters.tags.some(filterTag => 
        taskTagNames.includes(filterTag.toLowerCase())
      );
      if (!hasMatchingTag) return false;
    }

    return true;
  });
};

/**
 * Sorts tasks based on specified criteria
 */
export const sortTasks = (
  tasks: Task[], 
  sortBy: 'title' | 'dueDate' | 'priority' | 'status' | 'createdAt',
  direction: 'asc' | 'desc' = 'asc'
): Task[] => {
  const sorted = [...tasks].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) comparison = 0;
        else if (!a.dueDate) comparison = 1;
        else if (!b.dueDate) comparison = -1;
        else comparison = a.dueDate.getTime() - b.dueDate.getTime();
        break;
      case 'priority':
        const priorityOrder = { 'Low': 0, 'Medium': 1, 'High': 2, 'Urgent': 3 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'status':
        comparison = a.status - b.status;
        break;
      case 'createdAt':
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
    }

    return direction === 'desc' ? -comparison : comparison;
  });

  return sorted;
};

// ================================
// TASK ANALYTICS HELPERS
// ================================

/**
 * Calculates task statistics
 */
export const calculateTaskStats = (tasks: Task[]) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === TaskItemStatus.Completed).length;
  const inProgress = tasks.filter(t => t.status === TaskItemStatus.InProgress).length;
  const overdue = tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== TaskItemStatus.Completed).length;
  const totalPoints = tasks.reduce((sum, task) => sum + (task.pointsValue || 0), 0);
  const earnedPoints = tasks
    .filter(t => t.status === TaskItemStatus.Completed)
    .reduce((sum, task) => sum + (task.pointsEarned || 0), 0);

  return {
    total,
    completed,
    inProgress,
    overdue,
    pending: tasks.filter(t => t.status === TaskItemStatus.Pending).length,
    completionRate: total > 0 ? (completed / total) * 100 : 0,
    totalPoints,
    earnedPoints,
    averagePoints: total > 0 ? totalPoints / total : 0
  };
};

/**
 * Groups tasks by specified field
 */
export const groupTasksBy = (
  tasks: Task[], 
  groupBy: 'status' | 'priority' | 'assignee' | 'dueDate'
): Record<string, Task[]> => {
  const groups: Record<string, Task[]> = {};

  tasks.forEach(task => {
    let key: string;

    switch (groupBy) {
      case 'status':
        key = getTaskStatusName(task.status);
        break;
      case 'priority':
        key = task.priority;
        break;
      case 'assignee':
        key = task.assignedToUserName || 'Unassigned';
        break;
      case 'dueDate':
        if (!task.dueDate) {
          key = 'No Due Date';
        } else {
          const today = new Date();
          const diffDays = Math.ceil((task.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays < 0) key = 'Overdue';
          else if (diffDays === 0) key = 'Due Today';
          else if (diffDays <= 7) key = 'Due This Week';
          else if (diffDays <= 30) key = 'Due This Month';
          else key = 'Due Later';
        }
        break;
      default:
        key = 'Unknown';
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(task);
  });

  return groups;
}; 
