/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Board API & DTO Interfaces - Enterprise Compliance
 * Extracted from lib/types/board.ts for .cursorrules compliance
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 */

import { TaskItemStatus, TaskItemResponseDTO } from '@/lib/types/tasks';

/**
 * Core Board API/DTO Interfaces - Backend Aligned
 */

export interface BoardDTO {
  id: number;
  name: string;
  description?: string;
  userId: number;
  columns: BoardColumnDTO[];
  createdAt: string;
  updatedAt?: string;
  taskCount: number;
  isTemplate?: boolean; // Whether this board was created from a template
  templateId?: string; // ID of the original template if created from template
  templateCategory?: string; // Category of the template used
  isCustom?: boolean; // Whether this is a custom user-created board
}

export interface BoardColumnDTO {
  id: number;
  name: string;
  order: number;
  color?: string;
  status: TaskItemStatus;
  alias?: string; // Custom display name for the status
  description?: string; // Tooltip description
  isCore?: boolean; // Whether this is a core column (NotStarted, Pending, Completed)
}

export interface BoardDetailDTO {
  board: BoardDTO;
  tasksByColumn: Record<string, TaskItemResponseDTO[]>;
  tasks: TaskItemResponseDTO[];
  taskCount: number;
}

/**
 * Create/Update Board DTOs - API Request Interfaces
 */

export interface CreateBoardDTO {
  Name: string;
  Description?: string;
  Columns?: BoardColumnCreateDTO[];
}

export interface BoardColumnCreateDTO {
  Name: string;
  Order: number;
  Color?: string;
  Status: TaskItemStatus;
  Alias?: string; // Custom display name for the status
  Description?: string; // Tooltip description
  IsCore?: boolean; // Whether this is a core column
}

export interface UpdateBoardDTO {
  name?: string;
  description?: string;
  columns?: BoardColumnUpdateDTO[];
}

export interface BoardColumnUpdateDTO {
  id?: number;
  name?: string;
  order?: number;
  color?: string;
  status?: TaskItemStatus;
  alias?: string;
  description?: string;
  isCore?: boolean;
}

/**
 * Task Reordering API Interface
 */

export interface TaskReorderDTO {
  taskId: number;
  newStatus: TaskItemStatus;
  newOrder: number;
  boardId: number;
}

/**
 * Board Template Configuration Interface
 */

export interface BoardTemplate {
  name: string;
  description: string;
  columns: BoardColumnCreateDTO[];
  category: 'basic' | 'family' | 'education' | 'health' | 'events' | 'financial' | 'seasonal';
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedSetupTime: number; // in minutes
  recommendedFor: string[];
  columnConfigurations?: Record<string, ColumnConfiguration>;
  statusMapping?: StatusMappingConfig; // Custom status aliases for this template
}

/**
 * Column Configuration Interface
 */

export interface ColumnConfiguration {
  allowedTransitions: TaskItemStatus[];
  maxTasks?: number;
  autoAssign?: boolean;
  requiresApproval?: boolean;
  notificationSettings?: {
    onTaskEnter?: boolean;
    onTaskExit?: boolean;
    onOverflow?: boolean;
  };
}

/**
 * Status Mapping Configuration Interface
 */

export interface StatusMappingConfig {
  notStartedAlias: string; // e.g., "Meal Ideas", "To Do", "Backlog"
  pendingAlias: string; // e.g., "In Progress", "Cooking", "Active"
  completedAlias: string; // e.g., "Served", "Done", "Completed"
  descriptions: {
    notStarted: string; // Tooltip for first column
    pending: string; // Tooltip for middle columns
    completed: string; // Tooltip for last column
  };
}

/**
 * Core Status Validation Interface
 */

export interface CoreStatusValidation {
  hasNotStarted: boolean;
  hasPending: boolean;
  hasCompleted: boolean;
  missingStatuses: TaskItemStatus[];
  suggestions: string[];
} 
