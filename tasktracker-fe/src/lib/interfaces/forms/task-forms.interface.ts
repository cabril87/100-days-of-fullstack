/*
 * Task Forms Interfaces - Moved from lib/types/task.ts for .cursorrules compliance
 * lib/interfaces/forms/task-forms.interface.ts
 * Copyright (c) 2025 Carlos Abril Jr
 */

// === TASK FORM DATA INTERFACES ===

export interface CreateTaskFormData {
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string;
  categoryId?: number;
  estimatedTimeMinutes?: number;
  pointsValue?: number;
  familyId?: number;
  assignedToUserId?: number;
  requiresApproval?: boolean;
  tags?: string[];
  // Enhanced fields for TaskCreationModal
  taskContext?: 'individual' | 'family' | 'template';
  saveAsTemplate?: boolean;
  templateName?: string;
  templateCategory?: string;
  isPublicTemplate?: boolean;
}

export interface UpdateTaskFormData {
  title?: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string;
  categoryId?: number;
  estimatedTimeMinutes?: number;
  pointsValue?: number;
  assignedToUserId?: number;
  tags?: string[];
}

export interface CompleteTaskFormData {
  taskId: number;
  actualTimeMinutes?: number;
  completionNotes?: string;
}

export interface CreateTaskCategoryFormData {
  name: string;
  color: string;
  icon?: string;
  description?: string;
}

export interface TaskFilterFormData {
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  isCompleted?: boolean;
  categoryId?: number;
  assignedToUserId?: number;
  dueBefore?: string;
  dueAfter?: string;
  tags?: string[];
  search?: string;
} 