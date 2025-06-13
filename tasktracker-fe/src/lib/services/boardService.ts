/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */

import { apiClient } from '../config/api-client';
import { 
  BoardDTO, 
  BoardDetailDTO, 
  CreateBoardDTO, 
  UpdateBoardDTO, 
  BoardColumnCreateDTO, 
  BoardColumnUpdateDTO, 
  TaskReorderDTO 
} from '../types/board';

/**
 * Board service for managing Kanban boards
 */
export class BoardService {
  private static readonly BASE_URL = '/v1/boards';

  /**
   * Get all boards for the current user
   */
  static async getBoards(): Promise<BoardDTO[]> {
    try {
      const response = await apiClient.get<BoardDTO[]>(this.BASE_URL);
      return response;
    } catch (error) {
      console.error('Error fetching boards:', error);
      throw error;
    }
  }

  /**
   * Get a specific board with detailed information
   */
  static async getBoardById(boardId: number): Promise<BoardDetailDTO> {
    try {
      const response = await apiClient.get<BoardDetailDTO>(`${this.BASE_URL}/${boardId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching board ${boardId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new board
   */
  static async createBoard(createBoardDto: CreateBoardDTO): Promise<BoardDTO> {
    try {
      const response = await apiClient.post<BoardDTO>(this.BASE_URL, createBoardDto);
      return response;
    } catch (error) {
      console.error('Error creating board:', error);
      throw error;
    }
  }

  /**
   * Update an existing board
   */
  static async updateBoard(boardId: number, updateBoardDto: UpdateBoardDTO): Promise<BoardDTO> {
    try {
      const response = await apiClient.put<BoardDTO>(`${this.BASE_URL}/${boardId}`, updateBoardDto);
      return response;
    } catch (error) {
      console.error(`Error updating board ${boardId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a board
   */
  static async deleteBoard(boardId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_URL}/${boardId}`);
    } catch (error) {
      console.error(`Error deleting board ${boardId}:`, error);
      throw error;
    }
  }

  /**
   * Add a column to a board
   */
  static async addColumn(boardId: number, columnDto: BoardColumnCreateDTO): Promise<BoardDTO> {
    try {
      const response = await apiClient.post<BoardDTO>(`${this.BASE_URL}/${boardId}/columns`, columnDto);
      return response;
    } catch (error) {
      console.error(`Error adding column to board ${boardId}:`, error);
      throw error;
    }
  }

  /**
   * Update a board column
   */
  static async updateColumn(boardId: number, columnId: number, columnDto: BoardColumnUpdateDTO): Promise<BoardDTO> {
    try {
      const response = await apiClient.put<BoardDTO>(`${this.BASE_URL}/${boardId}/columns/${columnId}`, columnDto);
      return response;
    } catch (error) {
      console.error(`Error updating column ${columnId} in board ${boardId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a board column
   */
  static async deleteColumn(boardId: number, columnId: number): Promise<BoardDTO> {
    try {
      const response = await apiClient.delete<BoardDTO>(`${this.BASE_URL}/${boardId}/columns/${columnId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting column ${columnId} from board ${boardId}:`, error);
      throw error;
    }
  }

  /**
   * Reorder columns in a board
   */
  static async reorderColumns(boardId: number, columnOrders: Array<{ columnId: number; order: number }>): Promise<BoardDTO> {
    try {
      const response = await apiClient.post<BoardDTO>(`${this.BASE_URL}/${boardId}/columns/reorder`, { columnOrders });
      return response;
    } catch (error) {
      console.error(`Error reordering columns in board ${boardId}:`, error);
      throw error;
    }
  }

  /**
   * Move a task to a different column/status
   */
  static async moveTask(taskReorderDto: TaskReorderDTO): Promise<void> {
    try {
      await apiClient.post(`${this.BASE_URL}/${taskReorderDto.boardId}/tasks/reorder`, taskReorderDto);
    } catch (error) {
      console.error('Error moving task:', error);
      throw error;
    }
  }

  /**
   * Get boards for a specific family
   */
  static async getFamilyBoards(familyId: number): Promise<BoardDTO[]> {
    try {
      const response = await apiClient.get<BoardDTO[]>(`/v1/families/${familyId}/boards`);
      return response;
    } catch (error) {
      console.error(`Error fetching family boards for family ${familyId}:`, error);
      throw error;
    }
  }

  /**
   * Create a board for a specific family
   */
  static async createFamilyBoard(familyId: number, createBoardDto: CreateBoardDTO): Promise<BoardDTO> {
    try {
      const response = await apiClient.post<BoardDTO>(`/v1/families/${familyId}/boards`, createBoardDto);
      return response;
    } catch (error) {
      console.error(`Error creating family board for family ${familyId}:`, error);
      throw error;
    }
  }

  /**
   * Get board analytics and statistics
   */
  static async getBoardAnalytics(boardId: number): Promise<{
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    completionRate: number;
    columnStats: Array<{
      columnId: number;
      columnName: string;
      taskCount: number;
      wipLimitReached: boolean;
    }>;
  }> {
    try {
      const response = await apiClient.get<{
        totalTasks: number;
        completedTasks: number;
        inProgressTasks: number;
        pendingTasks: number;
        completionRate: number;
        columnStats: Array<{
          columnId: number;
          columnName: string;
          taskCount: number;
          wipLimitReached: boolean;
        }>;
      }>(`${this.BASE_URL}/${boardId}/analytics`);
      return response;
    } catch (error) {
      console.error(`Error fetching board analytics for board ${boardId}:`, error);
      throw error;
    }
  }

  /**
   * Duplicate a board
   */
  static async duplicateBoard(boardId: number, newName: string): Promise<BoardDTO> {
    try {
      const response = await apiClient.post<BoardDTO>(`${this.BASE_URL}/${boardId}/duplicate`, { name: newName });
      return response;
    } catch (error) {
      console.error(`Error duplicating board ${boardId}:`, error);
      throw error;
    }
  }

  /**
   * Archive a board (soft delete)
   */
  static async archiveBoard(boardId: number): Promise<void> {
    try {
      await apiClient.post(`${this.BASE_URL}/${boardId}/archive`);
    } catch (error) {
      console.error(`Error archiving board ${boardId}:`, error);
      throw error;
    }
  }

  /**
   * Restore an archived board
   */
  static async restoreBoard(boardId: number): Promise<void> {
    try {
      await apiClient.post(`${this.BASE_URL}/${boardId}/restore`);
    } catch (error) {
      console.error(`Error restoring board ${boardId}:`, error);
      throw error;
    }
  }
}

export default BoardService; 