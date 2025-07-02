/*
 * Board Templates & Configuration Interfaces
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * CURSORRULES COMPLIANT: Board template interfaces extracted from lib/types/board.ts
 * Contains board templates, configuration, and status mapping interfaces
 */

import { TaskItemStatus } from '../../types/tasks';
import { BoardColumnDTO, BoardColumnCreateDTO } from '../api/board.interface';

// ================================
// COLUMN CONFIGURATION INTERFACES
// ================================

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

// ================================
// BOARD TEMPLATE INTERFACES
// ================================

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

// ================================
// STATUS MAPPING INTERFACES
// ================================

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

export interface CoreStatusValidation {
  hasNotStarted: boolean;
  hasPending: boolean;
  hasCompleted: boolean;
  missingStatuses: TaskItemStatus[];
  suggestions: string[];
}

// ================================
// STATUS MAPPING UTILITIES INTERFACE
// ================================

export interface StatusMappingUtilities {
  validateCoreStatuses: (columns: BoardColumnDTO[]) => CoreStatusValidation;
  mapColumnToStatus: (column: BoardColumnDTO) => TaskItemStatus;
  getStatusAlias: (status: TaskItemStatus, mapping?: StatusMappingConfig) => string;
  getStatusDescription: (status: TaskItemStatus, mapping?: StatusMappingConfig) => string;
  ensureCoreColumns: (columns: BoardColumnCreateDTO[]) => BoardColumnCreateDTO[];
  generateStatusGuidance: (currentColumns: BoardColumnDTO[]) => string[];
} 