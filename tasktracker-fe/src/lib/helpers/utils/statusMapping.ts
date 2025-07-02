/*
 * Enterprise Status Mapping Utilities
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * Robust system for mapping board columns to core task statuses with custom aliases
 */

import { TaskItemStatus } from '@/lib/types/tasks';
import { BoardColumnDTO, BoardColumnCreateDTO, StatusMappingConfig, CoreStatusValidation } from '@/lib/types/boards';

/**
 * Default status aliases for different contexts
 */
export const DEFAULT_STATUS_MAPPINGS: Record<string, StatusMappingConfig> = {
  default: {
    notStartedAlias: 'To Do',
    pendingAlias: 'In Progress',
    completedAlias: 'Completed',
    descriptions: {
      notStarted: 'Tasks that haven\'t been started yet',
      pending: 'Tasks currently being worked on',
      completed: 'Tasks that have been finished'
    }
  },
  mealPlanning: {
    notStartedAlias: 'Meal Ideas',
    pendingAlias: 'Cooking',
    completedAlias: 'Served',
    descriptions: {
      notStarted: 'Meal ideas and recipes to try',
      pending: 'Meals currently being prepared',
      completed: 'Meals that have been served'
    }
  },
  projectManagement: {
    notStartedAlias: 'Backlog',
    pendingAlias: 'Active Sprint',
    completedAlias: 'Done',
    descriptions: {
      notStarted: 'Features and tasks in the backlog',
      pending: 'Tasks currently in development',
      completed: 'Completed and deployed features'
    }
  },
  familyChores: {
    notStartedAlias: 'Assigned',
    pendingAlias: 'In Progress',
    completedAlias: 'Completed',
    descriptions: {
      notStarted: 'Chores assigned to family members',
      pending: 'Chores currently being done',
      completed: 'Chores that have been finished'
    }
  },
  eventPlanning: {
    notStartedAlias: 'Ideas',
    pendingAlias: 'Planning',
    completedAlias: 'Executed',
    descriptions: {
      notStarted: 'Event ideas and concepts',
      pending: 'Events being planned and organized',
      completed: 'Events that have been successfully executed'
    }
  }
};

/**
 * Core status mapping utilities
 */
export class StatusMappingService {
  
  /**
   * Validates that a board has all three core statuses
   * Enterprise rule: First = NotStarted, Middle = InProgress/Pending, Last = Completed
   */
  static validateCoreStatuses(columns: BoardColumnDTO[]): CoreStatusValidation {
    const statuses = columns.map(col => col.status);
    const hasNotStarted = statuses.includes(TaskItemStatus.NotStarted);
    const hasProgress = statuses.includes(TaskItemStatus.Pending) || statuses.includes(TaskItemStatus.InProgress);
    const hasCompleted = statuses.includes(TaskItemStatus.Completed);
    
    const missingStatuses: TaskItemStatus[] = [];
    const suggestions: string[] = [];
    
    if (!hasNotStarted) {
      missingStatuses.push(TaskItemStatus.NotStarted);
      suggestions.push('🎯 Add a starting column (e.g., "To Do", "Ideas", "Backlog")');
    }
    
    if (!hasProgress) {
      missingStatuses.push(TaskItemStatus.Pending);
      suggestions.push('⚡ Add a progress column (e.g., "In Progress", "Working", "Active")');
    }
    
    if (!hasCompleted) {
      missingStatuses.push(TaskItemStatus.Completed);
      suggestions.push('🏆 Add a completion column (e.g., "Done", "Completed", "Finished")');
    }
    
    return {
      hasNotStarted,
      hasPending: hasProgress,
      hasCompleted,
      missingStatuses,
      suggestions
    };
  }
  
  /**
   * Maps a column position to the appropriate core status
   * Enterprise Rule: First = NotStarted (0), Middle = InProgress (1) or Pending (3), Last = Completed (4)
   */
  static mapColumnToStatus(column: BoardColumnDTO, allColumns: BoardColumnDTO[]): TaskItemStatus {
    // If status is explicitly set, use it
    if (column.status !== undefined) {
      return column.status;
    }
    
    // Sort columns by order
    const sortedColumns = [...allColumns].sort((a, b) => a.order - b.order);
    const columnIndex = sortedColumns.findIndex(col => col.id === column.id);
    
    // Enterprise mapping rules
    if (columnIndex === 0) {
      return TaskItemStatus.NotStarted; // 0
    } else if (columnIndex === sortedColumns.length - 1) {
      return TaskItemStatus.Completed; // 4
    } else {
      // Middle columns: Use InProgress for active work, Pending for waiting/review
      const columnName = column.name.toLowerCase();
      if (columnName.includes('progress') || columnName.includes('doing') || columnName.includes('active') || columnName.includes('working')) {
        return TaskItemStatus.InProgress; // 1
      } else {
        return TaskItemStatus.Pending; // 3 - for review, waiting, planning, etc.
      }
    }
  }

  /**
   * Enterprise function to automatically assign correct statuses to all columns
   * Ensures first = NotStarted, last = Completed, middle = InProgress/Pending
   */
  static assignEnterpriseStatuses(columns: BoardColumnCreateDTO[]): BoardColumnCreateDTO[] {
    if (columns.length === 0) return columns;
    
    const sortedColumns = [...columns].sort((a, b) => a.Order - b.Order);
    
    return sortedColumns.map((column, index) => {
      const isFirst = index === 0;
      const isLast = index === sortedColumns.length - 1;
      
      let status: TaskItemStatus;
      let isCore: boolean;
      
      if (isFirst) {
        status = TaskItemStatus.NotStarted;
        isCore = true;
      } else if (isLast) {
        status = TaskItemStatus.Completed;
        isCore = true;
      } else {
        // Middle columns: determine if InProgress or Pending based on name
        const columnName = column.Name.toLowerCase();
        if (columnName.includes('progress') || columnName.includes('doing') || 
            columnName.includes('active') || columnName.includes('working') ||
            columnName.includes('cooking') || columnName.includes('preparing')) {
          status = TaskItemStatus.InProgress;
          isCore = false;
        } else {
          status = TaskItemStatus.Pending;
          isCore = false;
        }
      }
      
      return {
        ...column,
        Status: status,
        IsCore: isCore
      };
    });
  }
  
  /**
   * Gets the display alias for a status
   */
  static getStatusAlias(status: TaskItemStatus, mapping?: StatusMappingConfig): string {
    if (!mapping) {
      mapping = DEFAULT_STATUS_MAPPINGS.default;
    }
    
    switch (status) {
      case TaskItemStatus.NotStarted:
        return mapping.notStartedAlias;
      case TaskItemStatus.Pending:
      case TaskItemStatus.InProgress:
        return mapping.pendingAlias;
      case TaskItemStatus.Completed:
        return mapping.completedAlias;
      default:
        return mapping.pendingAlias; // Default to pending for any other status
    }
  }
  
  /**
   * Gets the tooltip description for a status
   */
  static getStatusDescription(status: TaskItemStatus, mapping?: StatusMappingConfig): string {
    if (!mapping) {
      mapping = DEFAULT_STATUS_MAPPINGS.default;
    }
    
    switch (status) {
      case TaskItemStatus.NotStarted:
        return mapping.descriptions.notStarted;
      case TaskItemStatus.Pending:
      case TaskItemStatus.InProgress:
        return mapping.descriptions.pending;
      case TaskItemStatus.Completed:
        return mapping.descriptions.completed;
      default:
        return mapping.descriptions.pending;
    }
  }
  
  /**
   * Ensures a board template has all three core columns
   */
  static ensureCoreColumns(columns: BoardColumnCreateDTO[]): BoardColumnCreateDTO[] {
    // Convert BoardColumnCreateDTO to BoardColumnDTO format for validation
    const columnsForValidation: BoardColumnDTO[] = columns.map((col, index) => ({
      id: index, // Temporary ID for validation
      name: col.Name,
      order: col.Order,
      status: col.Status,
      alias: col.Alias,
      description: col.Description,
      isCore: col.IsCore,
      color: col.Color
    }));
    const validation = this.validateCoreStatuses(columnsForValidation);
    
    if (validation.hasNotStarted && validation.hasPending && validation.hasCompleted) {
      return columns; // Already has all core columns
    }
    
    const enhancedColumns = [...columns];
    let maxOrder = Math.max(...columns.map(col => col.Order), 0);
    
    // Add missing core columns
    if (!validation.hasNotStarted) {
      enhancedColumns.unshift({
        Name: 'To Do',
        Order: 0,
        Status: TaskItemStatus.NotStarted,
        IsCore: true,
        Description: 'Tasks that haven\'t been started yet'
      });
      // Adjust other column orders
      enhancedColumns.slice(1).forEach(col => col.Order++);
      maxOrder++;
    }
    
    if (!validation.hasPending) {
      const insertIndex = validation.hasNotStarted ? 1 : 0;
      enhancedColumns.splice(insertIndex, 0, {
        Name: 'In Progress',
        Order: insertIndex,
        Status: TaskItemStatus.Pending,
        IsCore: true,
        Description: 'Tasks currently being worked on'
      });
      // Adjust subsequent column orders
      enhancedColumns.slice(insertIndex + 1).forEach(col => col.Order++);
      maxOrder++;
    }
    
    if (!validation.hasCompleted) {
      enhancedColumns.push({
        Name: 'Completed',
        Order: maxOrder + 1,
        Status: TaskItemStatus.Completed,
        IsCore: true,
        Description: 'Tasks that have been finished'
      });
    }
    
    return enhancedColumns;
  }
  
  /**
   * Generates user guidance for column setup
   */
  static generateStatusGuidance(currentColumns: BoardColumnDTO[]): string[] {
    const validation = this.validateCoreStatuses(currentColumns);
    const guidance: string[] = [];
    
    if (currentColumns.length === 0) {
      guidance.push('🎯 Start by creating your first column for new tasks');
      guidance.push('💡 Every board needs at least 3 columns: Start → Progress → Complete');
      return guidance;
    }
    
    if (!validation.hasNotStarted) {
      guidance.push('📋 Add a starting column (e.g., "To Do", "Ideas", "Backlog")');
    }
    
    if (!validation.hasPending) {
      guidance.push('⚡ Add a progress column (e.g., "In Progress", "Working", "Active")');
    }
    
    if (!validation.hasCompleted) {
      guidance.push('🏆 Add a completion column (e.g., "Done", "Completed", "Finished")');
    }
    
    if (validation.hasNotStarted && validation.hasPending && validation.hasCompleted) {
      guidance.push('✅ Perfect! Your board has all core statuses');
      guidance.push('💡 You can add more columns between start and complete for detailed workflows');
    }
    
    return guidance;
  }
  
  /**
   * Gets the appropriate status mapping for a template category
   */
  static getTemplateStatusMapping(category: string): StatusMappingConfig {
    const mappingKey = category.toLowerCase().replace(/\s+/g, '');
    return DEFAULT_STATUS_MAPPINGS[mappingKey] || DEFAULT_STATUS_MAPPINGS.default;
  }
  
  /**
   * Validates and fixes column order to ensure proper status flow
   */
  static validateColumnOrder(columns: BoardColumnDTO[]): BoardColumnDTO[] {
    const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
    
    // Ensure first column is NotStarted
    if (sortedColumns.length > 0 && sortedColumns[0].status !== TaskItemStatus.NotStarted) {
      const notStartedColumn = sortedColumns.find(col => col.status === TaskItemStatus.NotStarted);
      if (notStartedColumn) {
        // Move NotStarted column to first position
        const otherColumns = sortedColumns.filter(col => col.status !== TaskItemStatus.NotStarted);
        sortedColumns.splice(0, sortedColumns.length, notStartedColumn, ...otherColumns);
      }
    }
    
    // Ensure last column is Completed
    if (sortedColumns.length > 1 && sortedColumns[sortedColumns.length - 1].status !== TaskItemStatus.Completed) {
      const completedColumn = sortedColumns.find(col => col.status === TaskItemStatus.Completed);
      if (completedColumn) {
        // Move Completed column to last position
        const otherColumns = sortedColumns.filter(col => col.status !== TaskItemStatus.Completed);
        sortedColumns.splice(0, sortedColumns.length, ...otherColumns, completedColumn);
      }
    }
    
    // Reorder all columns
    return sortedColumns.map((col, index) => ({
      ...col,
      order: index
    }));
  }
}

/**
 * Real-time status synchronization utilities
 */
export class StatusSyncService {
  
  /**
   * Converts board column status to task table display status
   */
  static getTableDisplayStatus(status: TaskItemStatus, mapping?: StatusMappingConfig): string {
    return StatusMappingService.getStatusAlias(status, mapping);
  }
  
  /**
   * Gets the appropriate status icon for display
   */
  static getStatusIcon(status: TaskItemStatus): string {
    switch (status) {
      case TaskItemStatus.NotStarted:
        return '📋';
      case TaskItemStatus.Pending:
      case TaskItemStatus.InProgress:
        return '⚡';
      case TaskItemStatus.Completed:
        return '🏆';
      case TaskItemStatus.OnHold:
        return '⏸️';
      case TaskItemStatus.Cancelled:
        return '❌';
      default:
        return '📋';
    }
  }
  
  /**
   * Gets the appropriate status color for display
   */
  static getStatusColor(status: TaskItemStatus): string {
    switch (status) {
      case TaskItemStatus.NotStarted:
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case TaskItemStatus.Pending:
      case TaskItemStatus.InProgress:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case TaskItemStatus.Completed:
        return 'text-green-600 bg-green-50 border-green-200';
      case TaskItemStatus.OnHold:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case TaskItemStatus.Cancelled:
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }
} 