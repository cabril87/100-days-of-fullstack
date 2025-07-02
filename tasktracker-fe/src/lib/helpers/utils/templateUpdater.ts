/*
 * Enterprise Template Updater
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * Comprehensive system to update all board templates with proper status mapping
 */

import { TaskItemStatus } from '@/lib/types/tasks';
import { BoardTemplate, BoardColumnCreateDTO, StatusMappingConfig } from '@/lib/types/boards';
import { StatusMappingService } from './statusMapping';

/**
 * Enterprise Template Updater - ensures all templates follow status mapping rules
 */
export class TemplateUpdater {
  
  /**
   * Updates a single template with proper enterprise status mapping
   */
  static updateTemplate(template: BoardTemplate): BoardTemplate {
    // Apply enterprise status mapping to columns
    const updatedColumns = StatusMappingService.assignEnterpriseStatuses(template.columns);
    
    // Generate status mapping based on template category
    const statusMapping = this.generateStatusMapping(template);
    
    // Add aliases and descriptions to columns
    const enhancedColumns = this.enhanceColumnsWithAliases(updatedColumns, statusMapping);
    
    return {
      ...template,
      columns: enhancedColumns,
      statusMapping
    };
  }
  
  /**
   * Updates all templates in a template array
   */
  static updateAllTemplates(templates: BoardTemplate[]): BoardTemplate[] {
    return templates.map(template => this.updateTemplate(template));
  }
  
  /**
   * Generates appropriate status mapping based on template category and name
   */
  private static generateStatusMapping(template: BoardTemplate): StatusMappingConfig {
    const templateName = template.name.toLowerCase();
    
    // Meal Planning
    if (templateName.includes('meal') || templateName.includes('cooking')) {
      return {
        notStartedAlias: 'Meal Ideas',
        pendingAlias: 'Cooking',
        completedAlias: 'Served',
        descriptions: {
          notStarted: 'Meal ideas and recipes to try',
          pending: 'Meals being prepared or ingredients being gathered',
          completed: 'Meals that have been served'
        }
      };
    }
    
    // Family Chores
    if (templateName.includes('chore') || templateName.includes('cleaning')) {
      return {
        notStartedAlias: 'Assigned',
        pendingAlias: 'In Progress',
        completedAlias: 'Complete',
        descriptions: {
          notStarted: 'Chores assigned to family members',
          pending: 'Chores currently being worked on',
          completed: 'Chores that have been finished'
        }
      };
    }
    
    // Default mapping
    return {
      notStartedAlias: 'To Do',
      pendingAlias: 'In Progress',
      completedAlias: 'Done',
      descriptions: {
        notStarted: 'Tasks that haven\'t been started yet',
        pending: 'Tasks currently being worked on',
        completed: 'Tasks that have been finished'
      }
    };
  }
  
  /**
   * Enhances columns with proper aliases and descriptions based on status mapping
   */
  private static enhanceColumnsWithAliases(
    columns: BoardColumnCreateDTO[], 
    statusMapping: StatusMappingConfig
  ): BoardColumnCreateDTO[] {
    return columns.map((column, index) => {
      const isFirst = index === 0;
      const isLast = index === columns.length - 1;
      
      let alias: string;
      let description: string;
      
      if (isFirst) {
        alias = statusMapping.notStartedAlias;
        description = statusMapping.descriptions.notStarted;
      } else if (isLast) {
        alias = statusMapping.completedAlias;
        description = statusMapping.descriptions.completed;
      } else {
        alias = statusMapping.pendingAlias;
        description = statusMapping.descriptions.pending;
      }
      
      return {
        ...column,
        Alias: alias,
        Description: description
      };
    });
  }
  
  /**
   * Validates that a template follows enterprise rules
   */
  static validateTemplate(template: BoardTemplate): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // Check minimum columns
    if (template.columns.length < 3) {
      issues.push('Template must have at least 3 columns (Start → Progress → Complete)');
      suggestions.push('Add missing columns to complete the workflow');
    }
    
    // Check status mapping
    const sortedColumns = [...template.columns].sort((a, b) => a.Order - b.Order);
    const firstColumn = sortedColumns[0];
    const lastColumn = sortedColumns[sortedColumns.length - 1];
    
    if (firstColumn && firstColumn.Status !== TaskItemStatus.NotStarted) {
      issues.push('First column must have NotStarted status');
      suggestions.push('Set first column status to NotStarted (0)');
    }
    
    if (lastColumn && lastColumn.Status !== TaskItemStatus.Completed) {
      issues.push('Last column must have Completed status');
      suggestions.push('Set last column status to Completed (4)');
    }
    
    // Check middle columns
    const middleColumns = sortedColumns.slice(1, -1);
    const hasValidMiddleStatuses = middleColumns.every(col => 
      col.Status === TaskItemStatus.InProgress || 
      col.Status === TaskItemStatus.Pending ||
      col.Status === TaskItemStatus.OnHold
    );
    
    if (!hasValidMiddleStatuses) {
      issues.push('Middle columns must use InProgress, Pending, or OnHold status');
      suggestions.push('Update middle column statuses to valid progress states');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }
  
  /**
   * Generates user guidance for template setup
   */
  static generateTemplateGuidance(template: BoardTemplate): string[] {
    const guidance: string[] = [];
    const validation = this.validateTemplate(template);
    
    if (validation.isValid) {
      guidance.push('✅ Template follows enterprise standards');
      guidance.push('🎯 First column maps to "Not Started" status');
      guidance.push('⚡ Middle columns map to "In Progress" or "Pending" status');
      guidance.push('🏆 Last column maps to "Completed" status');
    } else {
      guidance.push('⚠️ Template needs updates to meet enterprise standards:');
      guidance.push(...validation.suggestions);
    }
    
    return guidance;
  }
}

/**
 * Template validation and auto-fix utilities
 */
export class TemplateValidator {
  
  /**
   * Auto-fixes common template issues
   */
  static autoFixTemplate(template: BoardTemplate): BoardTemplate {
    let fixedTemplate = { ...template };
    
    // Ensure minimum 3 columns
    if (fixedTemplate.columns.length < 3) {
      fixedTemplate = this.ensureMinimumColumns(fixedTemplate);
    }
    
    // Apply enterprise status mapping
    fixedTemplate = TemplateUpdater.updateTemplate(fixedTemplate);
    
    return fixedTemplate;
  }
  
  /**
   * Ensures template has minimum required columns
   */
  private static ensureMinimumColumns(template: BoardTemplate): BoardTemplate {
    const columns = [...template.columns];
    
    // Add default columns if missing
    if (columns.length === 0) {
      columns.push(
        { Name: 'To Do', Order: 0, Color: '#6B7280', Status: TaskItemStatus.NotStarted },
        { Name: 'In Progress', Order: 1, Color: '#3B82F6', Status: TaskItemStatus.InProgress },
        { Name: 'Done', Order: 2, Color: '#10B981', Status: TaskItemStatus.Completed }
      );
    } else if (columns.length === 1) {
      columns.push(
        { Name: 'In Progress', Order: 1, Color: '#3B82F6', Status: TaskItemStatus.InProgress },
        { Name: 'Done', Order: 2, Color: '#10B981', Status: TaskItemStatus.Completed }
      );
    } else if (columns.length === 2) {
      // Insert middle column
      columns.splice(1, 0, {
        Name: 'In Progress',
        Order: 1,
        Color: '#3B82F6',
        Status: TaskItemStatus.InProgress
      });
      // Update orders
      columns.forEach((col, index) => col.Order = index);
    }
    
    return {
      ...template,
      columns
    };
  }
} 
