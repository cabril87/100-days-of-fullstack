/**
 * Enhanced Board Service
 * Comprehensive service for all board-related operations
 */

import { 
  Board, 
  BoardColumn, 
  BoardSettings, 
  BoardTemplate, 
  CreateBoardDTO, 
  UpdateBoardDTO,
  CreateBoardColumnDTO,
  UpdateBoardColumnDTO,
  CreateBoardFromTemplateDTO,
  UpdateBoardSettingsDTO,
  ColumnStatistics,
  WipLimitStatus,
  BoardAnalytics,
  TemplateMarketplaceFilter,
  BoardExportData,
  BoardImportResult,
  BoardValidationResult
} from '@/lib/types/board';
import { apiClient } from './apiClient';
import { handleApiError } from '@/lib/utils/errorHandler';

// ==================== BOARD CRUD OPERATIONS ====================

export class BoardService {
  private static instance: BoardService;
  private baseUrl = '/api/v1/boards';
  private templateUrl = '/api/v1/board-templates';

  public static getInstance(): BoardService {
    if (!BoardService.instance) {
      BoardService.instance = new BoardService();
    }
    return BoardService.instance;
  }

  // ==================== BOARD OPERATIONS ====================

  /**
   * Get all boards for the current user
   */
  async getUserBoards(): Promise<Board[]> {
    try {
      const response = await apiClient.get(this.baseUrl);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch user boards');
    }
  }

  /**
   * Get a specific board by ID
   */
  async getBoardById(boardId: number): Promise<Board> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${boardId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to fetch board ${boardId}`);
    }
  }

  /**
   * Create a new board
   */
  async createBoard(boardData: CreateBoardDTO): Promise<Board> {
    try {
      const response = await apiClient.post(this.baseUrl, boardData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to create board');
    }
  }

  /**
   * Update an existing board
   */
  async updateBoard(boardId: number, boardData: UpdateBoardDTO): Promise<Board> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${boardId}`, boardData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to update board ${boardId}`);
    }
  }

  /**
   * Delete a board
   */
  async deleteBoard(boardId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${boardId}`);
    } catch (error) {
      throw handleApiError(error, `Failed to delete board ${boardId}`);
    }
  }

  // ==================== BOARD COLUMN OPERATIONS ====================

  /**
   * Get all columns for a board
   */
  async getBoardColumns(boardId: number): Promise<BoardColumn[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${boardId}/columns`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to fetch columns for board ${boardId}`);
    }
  }

  /**
   * Create a new column
   */
  async createColumn(boardId: number, columnData: CreateBoardColumnDTO): Promise<BoardColumn> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${boardId}/columns`, columnData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to create column');
    }
  }

  /**
   * Update a column
   */
  async updateColumn(boardId: number, columnId: number, columnData: UpdateBoardColumnDTO): Promise<BoardColumn> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${boardId}/columns/${columnId}`, columnData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to update column ${columnId}`);
    }
  }

  /**
   * Delete a column
   */
  async deleteColumn(boardId: number, columnId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${boardId}/columns/${columnId}`);
    } catch (error) {
      throw handleApiError(error, `Failed to delete column ${columnId}`);
    }
  }

  /**
   * Reorder columns
   */
  async reorderColumns(boardId: number, columnOrders: { columnId: number; order: number }[]): Promise<void> {
    try {
      await apiClient.put(`${this.baseUrl}/${boardId}/columns/reorder`, { columnOrders });
    } catch (error) {
      throw handleApiError(error, 'Failed to reorder columns');
    }
  }

  /**
   * Duplicate a column
   */
  async duplicateColumn(boardId: number, columnId: number, newName: string): Promise<BoardColumn> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${boardId}/columns/${columnId}/duplicate`, {
        newName
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to duplicate column ${columnId}`);
    }
  }

  /**
   * Toggle column visibility
   */
  async toggleColumnVisibility(boardId: number, columnId: number): Promise<BoardColumn> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${boardId}/columns/${columnId}/toggle-visibility`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to toggle visibility for column ${columnId}`);
    }
  }

  // ==================== BOARD SETTINGS OPERATIONS ====================

  /**
   * Get board settings
   */
  async getBoardSettings(boardId: number): Promise<BoardSettings> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${boardId}/settings`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to fetch settings for board ${boardId}`);
    }
  }

  /**
   * Update board settings
   */
  async updateBoardSettings(boardId: number, settings: UpdateBoardSettingsDTO): Promise<BoardSettings> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${boardId}/settings`, settings);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to update settings for board ${boardId}`);
    }
  }

  /**
   * Reset board settings to defaults
   */
  async resetBoardSettings(boardId: number): Promise<BoardSettings> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${boardId}/settings/reset`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to reset settings for board ${boardId}`);
    }
  }

  /**
   * Export board settings
   */
  async exportBoardSettings(boardId: number): Promise<string> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${boardId}/settings/export`);
      // Convert response to JSON string for download
      const jsonString = JSON.stringify(response.data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `board-${boardId}-settings.json`;
      a.click();
      URL.revokeObjectURL(url);
      return jsonString;
    } catch (error) {
      throw handleApiError(error, `Failed to export settings for board ${boardId}`);
    }
  }

  /**
   * Import board settings
   */
  async importBoardSettings(boardId: number, settingsFile: File): Promise<BoardSettings> {
    try {
      const formData = new FormData();
      formData.append('settingsFile', settingsFile);
      
      const response = await apiClient.post(`${this.baseUrl}/${boardId}/settings/import`, formData, {
        extraHeaders: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to import settings for board ${boardId}`);
    }
  }

  /**
   * Copy settings from another board
   */
  async copyBoardSettings(sourceBoardId: number, targetBoardId: number): Promise<BoardSettings> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${targetBoardId}/settings/copy`, {
        sourceBoardId
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to copy board settings');
    }
  }

  // ==================== BOARD TEMPLATE OPERATIONS ====================

  /**
   * Get all public templates
   */
  async getPublicTemplates(): Promise<BoardTemplate[]> {
    try {
      const response = await apiClient.get(`${this.templateUrl}/public`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch public templates');
    }
  }

  /**
   * Get user's templates
   */
  async getUserTemplates(): Promise<BoardTemplate[]> {
    try {
      const response = await apiClient.get(`${this.templateUrl}/user`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch user templates');
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(templateId: number): Promise<BoardTemplate> {
    try {
      const response = await apiClient.get(`${this.templateUrl}/${templateId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to fetch template ${templateId}`);
    }
  }

  /**
   * Search templates
   */
  async searchTemplates(searchTerm: string): Promise<BoardTemplate[]> {
    try {
      const endpoint = `${this.templateUrl}/search?q=${encodeURIComponent(searchTerm)}`;
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to search templates');
    }
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string): Promise<BoardTemplate[]> {
    try {
      const response = await apiClient.get(`${this.templateUrl}/category/${category}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to fetch templates for category ${category}`);
    }
  }

  /**
   * Get popular templates
   */
  async getPopularTemplates(limit: number = 10): Promise<BoardTemplate[]> {
    try {
      const endpoint = `${this.templateUrl}/popular?limit=${encodeURIComponent(limit.toString())}`;
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch popular templates');
    }
  }

  /**
   * Get top-rated templates
   */
  async getTopRatedTemplates(limit: number = 10): Promise<BoardTemplate[]> {
    try {
      const endpoint = `${this.templateUrl}/top-rated?limit=${encodeURIComponent(limit.toString())}`;
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch top-rated templates');
    }
  }

  /**
   * Create board from template
   */
  async createBoardFromTemplate(templateId: number, boardData: CreateBoardFromTemplateDTO): Promise<Board> {
    try {
      const response = await apiClient.post(`${this.templateUrl}/${templateId}/create-board`, boardData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to create board from template ${templateId}`);
    }
  }

  /**
   * Save board as template
   */
  async saveBoardAsTemplate(
    boardId: number, 
    templateName: string, 
    templateDescription?: string,
    isPublic: boolean = false,
    category?: string,
    tags?: string
  ): Promise<BoardTemplate> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${boardId}/save-as-template`, {
        templateName,
        templateDescription,
        isPublic,
        category,
        tags
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to save board ${boardId} as template`);
    }
  }

  /**
   * Rate a template
   */
  async rateTemplate(templateId: number, rating: number): Promise<void> {
    try {
      await apiClient.post(`${this.templateUrl}/${templateId}/rate`, { rating });
    } catch (error) {
      throw handleApiError(error, `Failed to rate template ${templateId}`);
    }
  }

  // ==================== ANALYTICS OPERATIONS ====================

  /**
   * Get column statistics
   */
  async getColumnStatistics(boardId: number, columnId: number): Promise<ColumnStatistics> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${boardId}/columns/${columnId}/statistics`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to fetch statistics for column ${columnId}`);
    }
  }

  /**
   * Get WIP limit status for all columns
   */
  async getWipLimitStatus(boardId: number): Promise<WipLimitStatus[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${boardId}/columns/wip-status`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to fetch WIP limit status for board ${boardId}`);
    }
  }

  /**
   * Get comprehensive board analytics
   */
  async getBoardAnalytics(boardId: number, dateRange?: { from: string; to: string }): Promise<BoardAnalytics> {
    try {
      let endpoint = `${this.baseUrl}/${boardId}/analytics`;
      if (dateRange) {
        const queryString = `from=${encodeURIComponent(dateRange.from)}&to=${encodeURIComponent(dateRange.to)}`;
        endpoint += `?${queryString}`;
      }
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to fetch analytics for board ${boardId}`);
    }
  }

  // ==================== EXPORT/IMPORT OPERATIONS ====================

  /**
   * Export board data
   */
  async exportBoard(boardId: number): Promise<string> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${boardId}/export`);
      // Convert response to JSON string for download
      const jsonString = JSON.stringify(response.data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `board-${boardId}-export.json`;
      a.click();
      URL.revokeObjectURL(url);
      return jsonString;
    } catch (error) {
      throw handleApiError(error, `Failed to export board ${boardId}`);
    }
  }

  /**
   * Import board data
   */
  async importBoard(boardFile: File): Promise<BoardImportResult> {
    try {
      const formData = new FormData();
      formData.append('boardFile', boardFile);
      
      const response = await apiClient.post(`${this.baseUrl}/import`, formData, {
        extraHeaders: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to import board');
    }
  }

  // ==================== TASK OPERATIONS ====================

  /**
   * Move task between columns
   */
  async moveTask(
    boardId: number, 
    taskId: number, 
    sourceColumnId: number, 
    destinationColumnId: number,
    newIndex?: number
  ): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${boardId}/tasks/${taskId}/move`, {
        sourceColumnId,
        destinationColumnId,
        newIndex
      });
    } catch (error) {
      throw handleApiError(error, `Failed to move task ${taskId}`);
    }
  }

  /**
   * Bulk move tasks
   */
  async bulkMoveTasks(
    boardId: number,
    taskMoves: Array<{
      taskId: number;
      sourceColumnId: number;
      destinationColumnId: number;
      newIndex?: number;
    }>
  ): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${boardId}/tasks/bulk-move`, { taskMoves });
    } catch (error) {
      throw handleApiError(error, 'Failed to bulk move tasks');
    }
  }

  // ==================== VALIDATION OPERATIONS ====================

  /**
   * Validate board configuration
   */
  async validateBoard(boardId: number): Promise<BoardValidationResult> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${boardId}/validate`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to validate board ${boardId}`);
    }
  }

  /**
   * Validate board settings
   */
  async validateBoardSettings(boardId: number, settings: UpdateBoardSettingsDTO): Promise<BoardValidationResult> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${boardId}/settings/validate`, settings);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to validate settings for board ${boardId}`);
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get available template categories
   */
  async getTemplateCategories(): Promise<string[]> {
    try {
      const response = await apiClient.get(`${this.templateUrl}/categories`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch template categories');
    }
  }

  /**
   * Check if WIP limit is exceeded for a column
   */
  isWipLimitExceeded(column: BoardColumn): boolean {
    return column.taskLimit !== null && 
           column.taskLimit !== undefined && 
           column.taskCount > column.taskLimit;
  }

  /**
   * Calculate WIP limit utilization percentage
   */
  getWipLimitUtilization(column: BoardColumn): number {
    if (!column.taskLimit) return 0;
    return Math.min((column.taskCount / column.taskLimit) * 100, 100);
  }

  /**
   * Get column color based on WIP limit status
   */
  getColumnColorByWipStatus(column: BoardColumn): string {
    if (!column.taskLimit) return column.color;
    
    const utilization = this.getWipLimitUtilization(column);
    
    if (utilization >= 100) return '#ef4444'; // Red - over limit
    if (utilization >= 80) return '#f59e0b';  // Orange - approaching limit
    if (utilization >= 60) return '#eab308';  // Yellow - moderate usage
    
    return column.color; // Default color
  }
}

// Export singleton instance
export const boardService = BoardService.getInstance(); 