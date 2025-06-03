/**
 * Custom Status Service
 * Manages board-specific custom task statuses and workflows
 */

import { 
  CustomTaskStatus, 
  CreateCustomStatusRequest, 
  UpdateCustomStatusRequest,
  StatusTransitionRule,
  TaskStatusType,
  DEFAULT_STATUS_CONFIGURATIONS,
  WORKFLOW_STATUS_TEMPLATES
} from '@/lib/types/task';
import { 
  BoardCustomStatus, 
  CreateBoardCustomStatus, 
  UpdateBoardCustomStatus,
  BoardStatusWorkflow,
  StatusWorkflowTemplate
} from '@/lib/types/board';
import { apiClient } from './apiClient';
import { ApiResponse } from '@/lib/types/api';

export class CustomStatusService {
  private static instance: CustomStatusService;
  private baseUrl = '/v1/boards';

  public static getInstance(): CustomStatusService {
    if (!CustomStatusService.instance) {
      CustomStatusService.instance = new CustomStatusService();
    }
    return CustomStatusService.instance;
  }

  // ==================== BOARD CUSTOM STATUS OPERATIONS ====================

  /**
   * Get all custom statuses for a board
   */
  async getBoardCustomStatuses(boardId: number): Promise<ApiResponse<BoardCustomStatus[]>> {
    console.log('[CustomStatusService] Getting custom statuses for board:', boardId);
    try {
      const response = await apiClient.get<BoardCustomStatus[]>(`${this.baseUrl}/${boardId}/custom-statuses`);
      
      if (response.data) {
        console.log('[CustomStatusService] Found', response.data.length, 'custom statuses');
      }
      
      return response;
    } catch (error: any) {
      console.error('[CustomStatusService] Error getting custom statuses:', error);
      
      // Handle 404 gracefully - the backend endpoint doesn't exist yet
      if (error.status === 404 || (typeof error === 'object' && error.message?.includes('404'))) {
        console.log('[CustomStatusService] Custom statuses endpoint not found, returning empty array');
        return {
          data: [],
          status: 200
        };
      }
      
      return {
        error: error instanceof Error ? error.message : 'Failed to get custom statuses',
        status: 500
      };
    }
  }

  /**
   * Get all available statuses for a board (default + custom)
   */
  async getAllAvailableStatuses(boardId: number): Promise<ApiResponse<CustomTaskStatus[]>> {
    console.log('[CustomStatusService] Getting all available statuses for board:', boardId);
    try {
      // Get custom statuses
      const customStatusesResponse = await this.getBoardCustomStatuses(boardId);
      
      if (customStatusesResponse.error) {
        return customStatusesResponse as ApiResponse<CustomTaskStatus[]>;
      }

      const customStatuses = customStatusesResponse.data || [];
      const customStatusConfigs = customStatuses
        .filter(cs => cs.isActive)
        .map(cs => cs.statusConfig);

      // Combine default statuses with custom ones
      const allStatuses = [...DEFAULT_STATUS_CONFIGURATIONS, ...customStatusConfigs]
        .sort((a, b) => a.order - b.order);

      console.log('[CustomStatusService] Found', allStatuses.length, 'total available statuses');
      
      return {
        data: allStatuses,
        status: 200
      };
    } catch (error: any) {
      console.error('[CustomStatusService] Error getting all available statuses:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get available statuses',
        status: 500
      };
    }
  }

  /**
   * Create a new custom status for a board
   */
  async createBoardCustomStatus(boardId: number, statusData: CreateBoardCustomStatus): Promise<ApiResponse<BoardCustomStatus>> {
    console.log('[CustomStatusService] Creating custom status for board:', boardId);
    try {
      const response = await apiClient.post<BoardCustomStatus>(`${this.baseUrl}/${boardId}/custom-statuses`, statusData);
      
      if (response.data) {
        console.log('[CustomStatusService] Created custom status:', response.data.statusConfig.displayName);
      }
      
      return response;
    } catch (error: any) {
      console.error('[CustomStatusService] Error creating custom status:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to create custom status',
        status: 500
      };
    }
  }

  /**
   * Update a custom status
   */
  async updateBoardCustomStatus(
    boardId: number, 
    statusId: string, 
    updateData: UpdateBoardCustomStatus
  ): Promise<ApiResponse<BoardCustomStatus>> {
    console.log('[CustomStatusService] Updating custom status:', statusId);
    try {
      const response = await apiClient.put<BoardCustomStatus>(
        `${this.baseUrl}/${boardId}/custom-statuses/${statusId}`, 
        updateData
      );
      
      if (response.data) {
        console.log('[CustomStatusService] Updated custom status:', response.data.statusConfig.displayName);
      }
      
      return response;
    } catch (error: any) {
      console.error('[CustomStatusService] Error updating custom status:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to update custom status',
        status: 500
      };
    }
  }

  /**
   * Delete a custom status
   */
  async deleteBoardCustomStatus(boardId: number, statusId: string): Promise<ApiResponse<void>> {
    console.log('[CustomStatusService] Deleting custom status:', statusId);
    try {
      const response = await apiClient.delete<void>(`${this.baseUrl}/${boardId}/custom-statuses/${statusId}`);
      console.log('[CustomStatusService] Custom status deleted successfully');
      return response;
    } catch (error: any) {
      console.error('[CustomStatusService] Error deleting custom status:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to delete custom status',
        status: 500
      };
    }
  }

  /**
   * Reorder custom statuses
   */
  async reorderBoardCustomStatuses(
    boardId: number, 
    statusOrders: { statusId: string; order: number }[]
  ): Promise<ApiResponse<void>> {
    console.log('[CustomStatusService] Reordering custom statuses for board:', boardId);
    try {
      const response = await apiClient.put<void>(
        `${this.baseUrl}/${boardId}/custom-statuses/reorder`, 
        { statusOrders }
      );
      console.log('[CustomStatusService] Custom statuses reordered successfully');
      return response;
    } catch (error: any) {
      console.error('[CustomStatusService] Error reordering custom statuses:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to reorder custom statuses',
        status: 500
      };
    }
  }

  // ==================== WORKFLOW OPERATIONS ====================

  /**
   * Apply a workflow template to a board
   */
  async applyWorkflowTemplate(
    boardId: number, 
    templateId: string,
    replaceExisting: boolean = false
  ): Promise<ApiResponse<BoardCustomStatus[]>> {
    console.log('[CustomStatusService] Applying workflow template:', templateId, 'to board:', boardId);
    
    try {
      const template = WORKFLOW_STATUS_TEMPLATES[templateId as keyof typeof WORKFLOW_STATUS_TEMPLATES];
      
      if (!template) {
        return {
          error: `Workflow template '${templateId}' not found`,
          status: 404
        };
      }

      // If replacing existing, get current statuses to delete them first
      if (replaceExisting) {
        const currentStatusesResponse = await this.getBoardCustomStatuses(boardId);
        if (currentStatusesResponse.data) {
          // Delete existing custom statuses
          await Promise.all(
            currentStatusesResponse.data.map(status => 
              this.deleteBoardCustomStatus(boardId, status.id)
            )
          );
        }
      }

      // Create new statuses from template
      const createdStatuses: BoardCustomStatus[] = [];
      
      for (const statusTemplate of template) {
        const statusData: CreateBoardCustomStatus = {
          boardId,
          name: statusTemplate.name,
          displayName: statusTemplate.displayName,
          color: statusTemplate.color,
          category: statusTemplate.category,
          order: statusTemplate.order
        };

        const response = await this.createBoardCustomStatus(boardId, statusData);
        if (response.data) {
          createdStatuses.push(response.data);
        }
      }

      console.log('[CustomStatusService] Applied workflow template with', createdStatuses.length, 'statuses');
      
      return {
        data: createdStatuses,
        status: 200
      };
    } catch (error: any) {
      console.error('[CustomStatusService] Error applying workflow template:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to apply workflow template',
        status: 500
      };
    }
  }

  /**
   * Get available workflow templates
   */
  getWorkflowTemplates(): StatusWorkflowTemplate[] {
    return Object.entries(WORKFLOW_STATUS_TEMPLATES).map(([id, statuses]) => ({
      id,
      name: id,
      displayName: this.formatWorkflowDisplayName(id),
      description: this.getWorkflowDescription(id),
      category: this.getWorkflowCategory(id),
      statuses: statuses.map(status => ({
        ...status,
        isSystemDefault: false,
        createdAt: undefined,
        updatedAt: undefined
      })),
      isPopular: ['software-development', 'project-management'].includes(id),
      usageCount: this.getWorkflowUsageCount(id)
    }));
  }

  // ==================== STATUS UTILITIES ====================

  /**
   * Get status configuration by name or id
   */
  getStatusConfig(statusId: TaskStatusType, availableStatuses: CustomTaskStatus[]): CustomTaskStatus | undefined {
    return availableStatuses.find(status => 
      status.id === statusId || status.name === statusId
    );
  }

  /**
   * Get status display information
   */
  getStatusDisplayInfo(statusId: TaskStatusType, availableStatuses: CustomTaskStatus[]) {
    const statusConfig = this.getStatusConfig(statusId, availableStatuses);
    
    if (statusConfig) {
      return {
        id: statusConfig.id,
        name: statusConfig.name,
        displayName: statusConfig.displayName,
        color: statusConfig.color,
        icon: statusConfig.icon,
        category: statusConfig.category
      };
    }

    // Fallback for legacy statuses
    const defaultStatus = DEFAULT_STATUS_CONFIGURATIONS.find(status => 
      status.name === statusId || status.id === statusId
    );

    if (defaultStatus) {
      return {
        id: defaultStatus.id,
        name: defaultStatus.name,
        displayName: defaultStatus.displayName,
        color: defaultStatus.color,
        icon: defaultStatus.icon,
        category: defaultStatus.category
      };
    }

    // Ultimate fallback
    return {
      id: String(statusId),
      name: String(statusId),
      displayName: String(statusId).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      color: '#6B7280',
      icon: 'circle',
      category: 'custom' as const
    };
  }

  /**
   * Validate status transition
   */
  isValidStatusTransition(
    fromStatus: TaskStatusType, 
    toStatus: TaskStatusType,
    availableStatuses: CustomTaskStatus[],
    transitionRules?: StatusTransitionRule[]
  ): boolean {
    // If no transition rules defined, allow all transitions
    if (!transitionRules || transitionRules.length === 0) {
      return true;
    }

    // Check if there's a specific rule for this transition
    const rule = transitionRules.find(rule => 
      rule.fromStatusId === fromStatus && rule.toStatusId === toStatus
    );

    if (rule) {
      return rule.isAllowed;
    }

    // If no specific rule found, allow transition by default
    return true;
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private formatWorkflowDisplayName(id: string): string {
    return id.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private getWorkflowDescription(id: string): string {
    const descriptions: Record<string, string> = {
      'software-development': 'Perfect for agile software development teams with code review and testing phases',
      'marketing-campaign': 'Designed for marketing campaigns from ideation to publication',
      'customer-support': 'Optimized for customer support ticket management and escalation',
      'project-management': 'General project management workflow with planning and review phases'
    };

    return descriptions[id] || 'Custom workflow for specialized team processes';
  }

  private getWorkflowCategory(id: string): string {
    const categories: Record<string, string> = {
      'software-development': 'Development',
      'marketing-campaign': 'Marketing',
      'customer-support': 'Support',
      'project-management': 'General'
    };

    return categories[id] || 'Custom';
  }

  private getWorkflowUsageCount(id: string): number {
    const usageCounts: Record<string, number> = {
      'software-development': 1250,
      'project-management': 890,
      'customer-support': 650,
      'marketing-campaign': 420
    };

    return usageCounts[id] || 0;
  }
}

// Export singleton instance
export const customStatusService = CustomStatusService.getInstance(); 