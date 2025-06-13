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

export interface UpdateBoardColumnDTO {
  name?: string;
  description?: string;
  order?: number;
  color?: string;
  icon?: string;
  mappedStatus?: number;
  taskLimit?: number;
  isCollapsible?: boolean;
  isHidden?: boolean;
  isDoneColumn?: boolean;
}

export interface EnhancedBoardColumnDTO {
  id: number;
  boardId: number;
  name: string;
  description?: string;
  order: number;
  color: string;
  icon?: string;
  mappedStatus: number;
  taskLimit?: number;
  isCollapsible: boolean;
  isHidden: boolean;
  isDoneColumn: boolean;
  taskCount: number;
  createdAt: string;
  updatedAt?: string;
}

export class BoardColumnService {
  private static readonly BASE_URL = '/v1/boards';

  /**
   * Update a board column
   */
  static async updateColumn(
    boardId: number, 
    columnId: number, 
    updateDto: UpdateBoardColumnDTO
  ): Promise<EnhancedBoardColumnDTO> {
    try {
      const response = await apiClient.put<EnhancedBoardColumnDTO>(
        `${this.BASE_URL}/${boardId}/columns/${columnId}`, 
        updateDto
      );
      return response;
    } catch (error) {
      console.error(`Error updating column ${columnId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a board column
   */
  static async deleteColumn(boardId: number, columnId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_URL}/${boardId}/columns/${columnId}`);
    } catch (error) {
      console.error(`Error deleting column ${columnId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new board column
   */
  static async createColumn(
    boardId: number, 
    createDto: {
      name: string;
      description?: string;
      order: number;
      color: string;
      icon?: string;
      mappedStatus: number;
      taskLimit?: number;
      isCollapsible?: boolean;
      isDoneColumn?: boolean;
    }
  ): Promise<EnhancedBoardColumnDTO> {
    try {
      const response = await apiClient.post<EnhancedBoardColumnDTO>(
        `${this.BASE_URL}/${boardId}/columns`, 
        createDto
      );
      return response;
    } catch (error) {
      console.error(`Error creating column for board ${boardId}:`, error);
      throw error;
    }
  }

  /**
   * Reorder columns in a board
   */
  static async reorderColumns(
    boardId: number, 
    columnOrders: Array<{ columnId: number; newOrder: number }>
  ): Promise<void> {
    try {
      await apiClient.put(`${this.BASE_URL}/${boardId}/columns/reorder`, columnOrders);
    } catch (error) {
      console.error(`Error reordering columns in board ${boardId}:`, error);
      throw error;
    }
  }

  /**
   * Duplicate a column
   */
  static async duplicateColumn(
    boardId: number, 
    columnId: number, 
    newName: string
  ): Promise<EnhancedBoardColumnDTO> {
    try {
      const response = await apiClient.post<EnhancedBoardColumnDTO>(
        `${this.BASE_URL}/${boardId}/columns/${columnId}/duplicate`, 
        newName
      );
      return response;
    } catch (error) {
      console.error(`Error duplicating column ${columnId}:`, error);
      throw error;
    }
  }

  /**
   * Toggle column visibility
   */
  static async toggleColumnVisibility(
    boardId: number, 
    columnId: number
  ): Promise<EnhancedBoardColumnDTO> {
    try {
      const response = await apiClient.put<EnhancedBoardColumnDTO>(
        `${this.BASE_URL}/${boardId}/columns/${columnId}/toggle-visibility`
      );
      return response;
    } catch (error) {
      console.error(`Error toggling visibility for column ${columnId}:`, error);
      throw error;
    }
  }
} 