/**
 * Enhanced Board Service
 * Comprehensive service for all board-related operations
 */

import { 
  Board, 
  BoardColumn, 
  BoardSettings, 
  BoardTemplate, 
  CreateBoard, 
  UpdateBoard,
  CreateBoardColumn,
  UpdateBoardColumn,
  CreateBoardFromTemplateDTO,
  UpdateBoardSettings,
  ColumnStatistics,
  WipLimitStatus,
  BoardAnalytics,
  TemplateMarketplaceFilter,
  BoardExportData,
  BoardImportResult,
  BoardValidationResult,
  BoardDetail,
  CreateBoardTemplate,
  TaskReorder,
  ColumnOrder,
  BoardFilter
} from '@/lib/types/board';
import { apiClient } from './apiClient';
import { handleApiError } from '@/lib/utils/errorHandler';
import { ApiResponse } from '@/lib/types/api';
import { TaskStatus, TaskStatusType } from '@/lib/types/task';
import { apiService } from './apiService';

// ==================== BOARD CRUD OPERATIONS ====================

export class BoardService {
  private static instance: BoardService;
  private baseUrl = '/v1/boards';
  private templateUrl = '/v1/board-templates';

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
  async getAllBoards(): Promise<ApiResponse<Board[]>> {
    console.log('[BoardService] Getting all boards');
    try {
      const response = await apiClient.get<Board[]>(this.baseUrl);
      
      if (response.data) {
        console.log('[BoardService] Found', response.data.length, 'boards');
        return response;
      }
      
      return { data: [], status: response.status };
    } catch (error: any) {
      console.error('[BoardService] Error getting boards:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get boards',
        status: 500
      };
    }
  }

  /**
   * Get a specific board by ID
   */
  async getBoardById(boardId: number): Promise<ApiResponse<Board>> {
    console.log('[BoardService] Getting board:', boardId);
    try {
      const response = await apiClient.get<any>(`${this.baseUrl}/${boardId}`);
      
      if (response.data) {
        // Convert columns if they are included in the board response
        if (response.data.columns && Array.isArray(response.data.columns)) {
          response.data.columns = response.data.columns.map((col: any) => this.convertColumnFromBackend(col));
        }
        
        console.log('[BoardService] Found board:', response.data.name);
        return {
          data: response.data as Board,
          status: response.status
        };
      }
      
      return response;
    } catch (error: any) {
      console.error('[BoardService] Error getting board:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get board',
        status: 500
      };
    }
  }

  /**
   * Get a board with tasks
   */
  async getBoardWithTasks(boardId: number): Promise<ApiResponse<BoardDetail>> {
    console.log('[BoardService] Getting board with tasks:', boardId);
    try {
      const response = await apiClient.get<BoardDetail>(`${this.baseUrl}/${boardId}/tasks`);
      
      if (response.data) {
        console.log('[BoardService] Found board with', response.data.tasks?.length || 0, 'tasks');
      }
      
      return response;
    } catch (error: any) {
      console.error('[BoardService] Error getting board with tasks:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get board with tasks',
        status: 500
      };
    }
  }

  /**
   * Create a new board
   */
  async createBoard(boardData: CreateBoard): Promise<ApiResponse<Board>> {
    console.log('[BoardService] Creating board:', boardData.name);
    try {
      const response = await apiClient.post<Board>(this.baseUrl, boardData);
      
      if (response.data) {
        console.log('[BoardService] Created board:', response.data.name);
      }
      
      return response;
    } catch (error: any) {
      console.error('[BoardService] Error creating board:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to create board',
        status: 500
      };
    }
  }

  /**
   * Update an existing board
   */
  async updateBoard(boardId: number, boardData: UpdateBoard): Promise<ApiResponse<Board>> {
    console.log('[BoardService] Updating board:', boardId);
    try {
      const response = await apiClient.put<Board>(`${this.baseUrl}/${boardId}`, boardData);
      
      if (response.data) {
        console.log('[BoardService] Updated board:', response.data.name);
      }
      
      return response;
    } catch (error: any) {
      console.error('[BoardService] Error updating board:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to update board',
        status: 500
      };
    }
  }

  /**
   * Delete a board
   */
  async deleteBoard(boardId: number): Promise<ApiResponse<void>> {
    console.log('[BoardService] Deleting board:', boardId);
    try {
      const response = await apiClient.delete<void>(`${this.baseUrl}/${boardId}`);
      console.log('[BoardService] Board deleted successfully');
      return response;
    } catch (error: any) {
      console.error('[BoardService] Error deleting board:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to delete board',
        status: 500
      };
    }
  }

  // ==================== BOARD COLUMN OPERATIONS ====================

  /**
   * Convert backend column format to frontend format
   * Enhanced to support custom statuses
   */
  private convertColumnFromBackend(backendColumn: any): BoardColumn {
    // Handle both uppercase IsHidden and lowercase isHidden
    const isHidden = backendColumn.isHidden ?? backendColumn.IsHidden ?? false;
    
    // Enhanced mapping to support custom statuses
    const mapBackendStatusToFrontend = (backendStatus: number | string): TaskStatusType => {
      // If it's already a string (custom status), return as-is
      if (typeof backendStatus === 'string') {
        return backendStatus;
      }
      
      // If it's a number, map to predefined statuses for backward compatibility
      if (typeof backendStatus === 'number') {
        switch (backendStatus) {
          case 0: // TaskItemStatus.NotStarted
            return TaskStatus.Todo;
          case 1: // TaskItemStatus.InProgress
            return TaskStatus.InProgress;
          case 2: // TaskItemStatus.OnHold (map to custom status)
            return 'on-hold';
          case 3: // TaskItemStatus.Pending (map to custom status)
            return 'pending';
          case 4: // TaskItemStatus.Completed
            return TaskStatus.Done;
          case 5: // TaskItemStatus.Cancelled (map to custom status)
            return 'cancelled';
          default:
            console.warn(`Unknown backend status: ${backendStatus}, defaulting to Todo`);
            return TaskStatus.Todo;
        }
      }
      
      // Fallback
      return TaskStatus.Todo;
    };
    
    return {
      ...backendColumn,
      isVisible: !isHidden, // Convert IsHidden to isVisible
      mappedStatus: mapBackendStatusToFrontend(backendColumn.mappedStatus),
      // Remove the backend properties to avoid confusion
      isHidden: undefined,
      IsHidden: undefined
    } as BoardColumn;
  }

  /**
   * Get all columns for a board
   */
  async getBoardColumns(boardId: number, includeHidden = false): Promise<ApiResponse<BoardColumn[]>> {
    console.log('[BoardService] Getting columns for board:', boardId);
    try {
      const params = includeHidden ? '?includeHidden=true' : '';
      const response = await apiClient.get<any[]>(`${this.baseUrl}/${boardId}/columns${params}`);
      
      if (response.data) {
        // Convert backend format to frontend format
        const convertedColumns = response.data.map(col => this.convertColumnFromBackend(col));
        console.log('[BoardService] Found', convertedColumns.length, 'columns');
        return {
          data: convertedColumns,
          status: response.status
        };
      }
      
      return { data: [], status: response.status };
    } catch (error: any) {
      console.error('[BoardService] Error getting columns:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get columns',
        status: 500
      };
    }
  }

  /**
   * Enhanced mapping for custom statuses
   * Map frontend TaskStatusType to backend format
   */
  private mapTaskStatusToBackend(status: TaskStatusType): number | string {
    // Check if it's a predefined TaskStatus enum value
    if (Object.values(TaskStatus).includes(status as TaskStatus)) {
      switch (status as TaskStatus) {
        case TaskStatus.Todo:
          return 0; // TaskItemStatus.NotStarted
        case TaskStatus.InProgress:
          return 1; // TaskItemStatus.InProgress
        case TaskStatus.Done:
          return 4; // TaskItemStatus.Completed
        default:
          return 0; // Default to NotStarted
      }
    }
    
    // For custom statuses, we'll send the string directly
    // The backend should be updated to handle string status values
    // For now, we'll map common custom statuses to existing numeric values
    switch (status) {
      case 'on-hold':
        return 2; // TaskItemStatus.OnHold
      case 'pending':
        return 3; // TaskItemStatus.Pending
      case 'cancelled':
        return 5; // TaskItemStatus.Cancelled
      default:
        // For other custom statuses, return the string
        // Note: The backend needs to be updated to handle this
        console.log('[BoardService] Using custom status:', status);
        return String(status);
    }
  }

  /**
   * Create a new column
   */
  async createColumn(boardId: number, columnData: CreateBoardColumn): Promise<ApiResponse<BoardColumn>> {
    console.log('[BoardService] Creating column for board:', boardId);
    console.log('[BoardService] Column data:', columnData);
    
    try {
      // Convert frontend column data to backend format
      const backendColumnData = {
        name: columnData.name,
        description: columnData.description,
        order: columnData.order,
        color: columnData.color || '#6B7280',
        icon: columnData.icon,
        mappedStatus: this.mapTaskStatusToBackend(columnData.mappedStatus),
        taskLimit: columnData.taskLimit,
        isCollapsible: columnData.isCollapsible ?? true,
        isDoneColumn: columnData.isDoneColumn ?? false
      };

      console.log('[BoardService] Backend column data:', backendColumnData);
      console.log('[BoardService] Mapped status:', columnData.mappedStatus, '->', backendColumnData.mappedStatus);

      // Try sending the data directly first (as per the controller signature)
      const response = await apiClient.post<any>(`${this.baseUrl}/${boardId}/columns`, backendColumnData);
      
      if (response.data) {
        // Convert backend format to frontend format
        const convertedColumn = this.convertColumnFromBackend(response.data);
        console.log('[BoardService] Created column:', convertedColumn.name);
        return {
          data: convertedColumn,
          status: response.status
        };
      }
      
      return response;
    } catch (error: any) {
      console.error('[BoardService] Error creating column:', error);
      console.error('[BoardService] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        columnData,
        boardId
      });

      // If the first attempt failed with a validation error about columnDto, try wrapping it
      if (error.response?.status === 400 && error.response?.data?.errors?.columnDto) {
        console.log('[BoardService] Retrying with wrapped columnDto structure...');
        
        try {
          const wrappedData = {
            columnDto: {
              name: columnData.name,
              description: columnData.description,
              order: columnData.order,
              color: columnData.color || '#6B7280',
              icon: columnData.icon,
              mappedStatus: this.mapTaskStatusToBackend(columnData.mappedStatus),
              taskLimit: columnData.taskLimit,
              isCollapsible: columnData.isCollapsible ?? true,
              isDoneColumn: columnData.isDoneColumn ?? false
            }
          };
          
          console.log('[BoardService] Wrapped data:', wrappedData);
          const retryResponse = await apiClient.post<BoardColumn>(`${this.baseUrl}/${boardId}/columns`, wrappedData);
          
          if (retryResponse.data) {
            console.log('[BoardService] Created column with wrapped data:', retryResponse.data.name);
          }
          
          return retryResponse;
        } catch (retryError: any) {
          console.error('[BoardService] Wrapped retry also failed:', retryError);
          return {
            error: retryError instanceof Error ? retryError.message : 'Failed to create column with wrapped data',
            status: retryError.response?.status || 500
          };
        }
      }
      
      return {
        error: error instanceof Error ? error.message : 'Failed to create column',
        status: error.response?.status || 500
      };
    }
  }

  /**
   * Update a column
   */
  async updateColumn(boardId: number, columnId: number, columnData: UpdateBoardColumn): Promise<ApiResponse<BoardColumn>> {
    console.log('[BoardService] Updating column:', columnId);
    try {
      const response = await apiClient.put<any>(`${this.baseUrl}/${boardId}/columns/${columnId}`, columnData);
      
      if (response.data) {
        // Convert backend format to frontend format
        const convertedColumn = this.convertColumnFromBackend(response.data);
        console.log('[BoardService] Updated column:', convertedColumn.name);
        return {
          data: convertedColumn,
          status: response.status
        };
      }
      
      return response;
    } catch (error: any) {
      console.error('[BoardService] Error updating column:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to update column',
        status: 500
      };
    }
  }

  /**
   * Delete a column
   */
  async deleteColumn(boardId: number, columnId: number): Promise<ApiResponse<void>> {
    console.log('[BoardService] Deleting column:', columnId, 'from board:', boardId);
    try {
      const response = await apiClient.delete<void>(`${this.baseUrl}/${boardId}/columns/${columnId}`);
      
      console.log('[BoardService] Raw delete response:', {
        status: response.status,
        data: response.data
      });
      
      // Check for successful status codes
      if (response.status === 204 || response.status === 200) {
        console.log('[BoardService] Column deleted successfully - Status:', response.status);
        return {
          data: undefined,
          status: response.status
        };
      } else {
        console.error('[BoardService] Unexpected status code for deletion:', response.status);
        return {
          error: `Unexpected response status: ${response.status}`,
          status: response.status
        };
      }
    } catch (error: any) {
      console.error('[BoardService] Error deleting column:', error);
      
      // Handle specific HTTP error responses
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        console.error('[BoardService] Delete column HTTP error:', {
          status,
          data: errorData,
          url: error.config?.url,
          method: error.config?.method
        });
        
        // Extract error message from response
        let errorMessage = 'Failed to delete column';
        if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (status === 400) {
          errorMessage = 'Bad request - unable to delete column';
        } else if (status === 404) {
          errorMessage = 'Column not found - may have been already deleted';
        } else if (status === 403) {
          errorMessage = 'Access denied - insufficient permissions';
        }
        
        return {
          error: errorMessage,
          status: status
        };
      }
      
      // Handle network errors
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        console.error('[BoardService] Network error during column deletion');
        return {
          error: 'Network error - please check your connection',
          status: 0
        };
      }
      
      // Fallback for other errors
      return {
        error: error instanceof Error ? error.message : 'Failed to delete column',
        status: 500
      };
    }
  }

  /**
   * Reorder columns
   */
  async reorderColumns(boardId: number, columnOrders: { columnId: number; order: number }[]): Promise<ApiResponse<void>> {
    console.log('[BoardService] Reordering columns for board:', boardId);
    try {
      const response = await apiClient.put<void>(`${this.baseUrl}/${boardId}/columns/reorder`, { columnOrders });
      console.log('[BoardService] Columns reordered successfully');
      return response;
    } catch (error: any) {
      console.error('[BoardService] Error reordering columns:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to reorder columns',
        status: 500
      };
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
  async getBoardSettings(boardId: number): Promise<ApiResponse<BoardSettings>> {
    console.log('[BoardService] Getting settings for board:', boardId);
    try {
      const response = await apiClient.get<BoardSettings>(`${this.baseUrl}/${boardId}/settings`);
      
      if (response.data) {
        console.log('[BoardService] Found board settings');
      }
      
      return response;
    } catch (error: any) {
      console.error('[BoardService] Error getting settings:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get board settings',
        status: 500
      };
    }
  }

  /**
   * Update board settings
   */
  async updateBoardSettings(boardId: number, settings: UpdateBoardSettings): Promise<ApiResponse<BoardSettings>> {
    console.log('[BoardService] Updating settings for board:', boardId);
    try {
      const response = await apiClient.put<BoardSettings>(`${this.baseUrl}/${boardId}/settings`, settings);
      
      if (response.data) {
        console.log('[BoardService] Updated board settings');
      }
      
      return response;
    } catch (error: any) {
      console.error('[BoardService] Error updating settings:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to update board settings',
        status: 500
      };
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
  async getPublicTemplates(): Promise<ApiResponse<BoardTemplate[]>> {
    console.log('[BoardService] Getting public templates');
    try {
      const response = await apiClient.get<BoardTemplate[]>(`${this.templateUrl}/public`, {
        suppressAuthError: true
      });
      
      if (response.data) {
        console.log('[BoardService] Found', response.data.length, 'public templates');
      }
      
      return response;
    } catch (error: any) {
      console.error('[BoardService] Error getting templates:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get templates',
        status: 500
      };
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
   * Get default board for user (creates one if none exists)
   */
  async getDefaultBoard(): Promise<ApiResponse<Board>> {
    console.log('[BoardService] Getting default board');
    try {
      // First try to get all boards
      const boardsResponse = await this.getAllBoards();
      if (boardsResponse.data && boardsResponse.data.length > 0) {
        const board = boardsResponse.data[0];
        console.log('[BoardService] Using existing board as default:', board.name);
        
        // Convert columns if they are included
        if (board.columns && Array.isArray(board.columns)) {
          board.columns = board.columns.map((col: any) => this.convertColumnFromBackend(col));
        }
        
        return {
          data: board,
          status: 200
        };
      }

      // If no boards exist, create a default one
      console.log('[BoardService] No boards found, creating default board');
      const defaultBoardData: CreateBoard = {
        name: 'My First Board',
        description: 'A simple kanban board to get you started'
      };

      const response = await this.createBoard(defaultBoardData);
      if (response.data) {
        console.log('[BoardService] Created default board:', response.data.name);
        
        // Convert columns if they are included
        if (response.data.columns && Array.isArray(response.data.columns)) {
          response.data.columns = response.data.columns.map((col: any) => this.convertColumnFromBackend(col));
        }
      }
      
      return response;
    } catch (error: any) {
      console.error('[BoardService] Error getting default board:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get default board',
        status: 500
      };
    }
  }

  // ==================== WIP LIMIT OPERATIONS ====================

  /**
   * Get WIP limit status for all columns in a board
   */
  async getWipLimitStatus(boardId: number): Promise<ApiResponse<WipLimitStatus[]>> {
    console.log('[BoardService] Getting WIP limit status for board:', boardId);
    try {
      // First get all columns for the board
      const columnsResponse = await this.getBoardColumns(boardId);
      
      if (!columnsResponse.data || columnsResponse.error) {
        console.log('[BoardService] Failed to get columns for WIP status');
        return {
          error: 'Failed to get board columns',
          status: 500
        };
      }

      console.log('[BoardService] Found', columnsResponse.data.length, 'columns');
      
      const wipStatuses: WipLimitStatus[] = [];

      // Get WIP status for each column
      for (const column of columnsResponse.data) {
        try {
          console.log('[BoardService] Getting WIP status for column', column.id + ':', column.name);
          
          // For now, we'll create a simple WIP status based on the column data
          // In a real implementation, this would call a specific API endpoint
          const wipStatus: WipLimitStatus = {
            columnId: column.id,
            columnName: column.name,
            wipLimit: column.taskLimit || undefined,
            currentTaskCount: column.taskCount || 0,
            isAtLimit: column.taskCount >= (column.taskLimit || Number.MAX_SAFE_INTEGER),
            isOverLimit: column.taskCount > (column.taskLimit || Number.MAX_SAFE_INTEGER),
            utilizationPercentage: column.taskLimit ? 
              Math.round((column.taskCount || 0) / column.taskLimit * 100) : 0
          };

          console.log('[BoardService] WIP status for column', column.id + ':', wipStatus);
          wipStatuses.push(wipStatus);
          
          console.log('[BoardService] WIP status retrieved for column', column.id);
        } catch (columnError) {
          console.error('[BoardService] Error getting WIP status for column', column.id + ':', columnError);
          // Continue with other columns even if one fails
        }
      }

      console.log('[BoardService] Retrieved WIP limit status for', wipStatuses.length, 'columns');
      
      return {
        data: wipStatuses,
        status: 200
      };
    } catch (error: any) {
      console.error('[BoardService] Error getting WIP limit status:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get WIP limit status',
        status: 500
      };
    }
  }
}

// Export singleton instance
export const boardService = BoardService.getInstance();