/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Board Service Interfaces - Enterprise Compliance
 * Extracted from lib/types/board.ts for .cursorrules compliance
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 */

import { TaskItemStatus, TaskItemResponseDTO } from '@/lib/types/tasks';
import { BoardColumnDTO, StatusMappingConfig, CoreStatusValidation } from '@/lib/interfaces/api/board.interface';
import { 
  DragAnimationConfig, 
  DropValidation 
} from '@/lib/interfaces/components/board.interface';

/**
 * Drag and Drop Service Interface
 */

export interface DragDropService {
  validateDrop: (task: TaskItemResponseDTO, targetColumn: BoardColumnDTO) => DropValidation;
  executeMove: (taskId: number, fromColumn: BoardColumnDTO, toColumn: BoardColumnDTO) => Promise<boolean>;
  getDropAnimation: (fromColumn: BoardColumnDTO, toColumn: BoardColumnDTO) => DragAnimationConfig;
  playMoveSound: (success: boolean) => void;
  showMoveNotification: (task: TaskItemResponseDTO, fromColumn: BoardColumnDTO, toColumn: BoardColumnDTO) => void;
}

/**
 * Status Mapping Utilities Service Interface
 */

export interface StatusMappingUtilities {
  validateCoreStatuses: (columns: BoardColumnDTO[]) => CoreStatusValidation;
  mapColumnToStatus: (column: BoardColumnDTO) => TaskItemStatus;
  getStatusAlias: (status: TaskItemStatus, mapping?: StatusMappingConfig) => string;
  getStatusDescription: (status: TaskItemStatus, mapping?: StatusMappingConfig) => string;
  ensureCoreColumns: (columns: Array<{ name: string; status: string; order?: number }>) => Array<{ name: string; status: string; order?: number }>;
  generateStatusGuidance: (currentColumns: BoardColumnDTO[]) => string[];
} 
