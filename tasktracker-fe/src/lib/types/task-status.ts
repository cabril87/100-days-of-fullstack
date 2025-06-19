/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 */

import type { TaskItemStatus } from './task';

/**
 * DTO for updating a task's status
 */
export interface TaskStatusUpdateRequestDTO {
  status: TaskItemStatus;
}

/**
 * DTO for task status update response
 */
export interface TaskStatusUpdateResponseDTO {
  taskId: number;
  previousStatus: TaskItemStatus;
  newStatus: TaskItemStatus;
  updatedAt: string;
}

/**
 * DTO for batch completion of tasks
 */
export interface BatchCompleteRequestDTO {
  taskIds: number[];
}

/**
 * DTO for batch status update of tasks
 */
export interface BatchStatusUpdateRequestDTO {
  /** List of task IDs to update */
  taskIds: number[];
  
  /** New status for all tasks */
  status: TaskItemStatus;
}

/**
 * Simple task status update DTO
 */
export interface TaskStatusUpdateDTO {
  /** New status to set for the task */
  status: TaskItemStatus;
}

/**
 * Bulk status update for multiple tasks
 */
export interface BulkStatusUpdateDTO {
  /** Task IDs to update */
  taskIds: number[];
  
  /** New status to apply to all selected tasks */
  status: TaskItemStatus;
} 