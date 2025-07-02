/*
 * Board Service Interfaces
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * CURSORRULES COMPLIANT: Board service interfaces extracted from lib/types/board.ts
 * Contains drag & drop service and board management service interfaces
 */

import { TaskItemResponseDTO } from '../../types/tasks';
import { BoardColumnDTO } from '../api/board.interface';
import { DragAnimationConfig } from '../components/board.interface';

// ================================
// DRAG & DROP SERVICE INTERFACE
// ================================

export interface DragDropService {
  validateDrop: (task: TaskItemResponseDTO, targetColumn: BoardColumnDTO) => DropValidation;
  executeMove: (taskId: number, fromColumn: BoardColumnDTO, toColumn: BoardColumnDTO) => Promise<boolean>;
  getDropAnimation: (fromColumn: BoardColumnDTO, toColumn: BoardColumnDTO) => DragAnimationConfig;
  playMoveSound: (success: boolean) => void;
  showMoveNotification: (task: TaskItemResponseDTO, fromColumn: BoardColumnDTO, toColumn: BoardColumnDTO) => void;
}

export interface DropValidation {
  isValid: boolean;
  reason?: string;
  suggestions?: string[];
  alternativeColumns?: BoardColumnDTO[];
} 