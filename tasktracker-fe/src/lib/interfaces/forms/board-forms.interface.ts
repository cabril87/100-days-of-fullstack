/*
 * Board Form Interfaces
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * CURSORRULES COMPLIANT: Board form interfaces extracted from lib/types/board.ts
 * Contains form data interfaces for board-related forms
 */

import { BoardColumnDTO } from '../api/board.interface';

// ================================
// BOARD FORM DATA INTERFACES
// ================================

export interface ColumnFormData extends BoardColumnDTO {
  isDefault: boolean;
  color?: string;
} 