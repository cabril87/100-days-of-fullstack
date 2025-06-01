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
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

/// <summary>
/// Repository interface for BoardColumn entity operations
/// Follows repository pattern with explicit typing and no var declarations
/// </summary>
public interface IBoardColumnRepository
{
    /// <summary>
    /// Get all columns for a specific board
    /// </summary>
    /// <param name="boardId">The board ID</param>
    /// <returns>List of board columns ordered by Order property</returns>
    Task<IEnumerable<BoardColumn>> GetColumnsByBoardIdAsync(int boardId);

    /// <summary>
    /// Get a specific board column by ID
    /// </summary>
    /// <param name="id">Column ID</param>
    /// <returns>BoardColumn if found, null otherwise</returns>
    Task<BoardColumn?> GetColumnByIdAsync(int id);

    /// <summary>
    /// Get visible columns for a board (not hidden)
    /// </summary>
    /// <param name="boardId">The board ID</param>
    /// <returns>List of visible board columns</returns>
    Task<IEnumerable<BoardColumn>> GetVisibleColumnsByBoardIdAsync(int boardId);

    /// <summary>
    /// Create a new board column
    /// </summary>
    /// <param name="column">Column to create</param>
    /// <returns>Created column with assigned ID</returns>
    Task<BoardColumn> CreateColumnAsync(BoardColumn column);

    /// <summary>
    /// Update an existing board column
    /// </summary>
    /// <param name="column">Column to update</param>
    /// <returns>Updated column</returns>
    Task<BoardColumn> UpdateColumnAsync(BoardColumn column);

    /// <summary>
    /// Delete a board column
    /// </summary>
    /// <param name="id">Column ID to delete</param>
    /// <returns>True if deleted successfully</returns>
    Task<bool> DeleteColumnAsync(int id);

    /// <summary>
    /// Reorder columns for a board
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="columnOrders">Dictionary of column ID to new order</param>
    /// <returns>True if reordering was successful</returns>
    Task<bool> ReorderColumnsAsync(int boardId, Dictionary<int, int> columnOrders);

    /// <summary>
    /// Get the next available order number for a board
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <returns>Next order number</returns>
    Task<int> GetNextOrderAsync(int boardId);

    /// <summary>
    /// Check if a column belongs to a specific board
    /// </summary>
    /// <param name="columnId">Column ID</param>
    /// <param name="boardId">Board ID</param>
    /// <returns>True if column belongs to board</returns>
    Task<bool> ColumnBelongsToBoardAsync(int columnId, int boardId);

    /// <summary>
    /// Get column by mapped status for a board
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="status">Task status</param>
    /// <returns>Column mapped to the status, null if not found</returns>
    Task<BoardColumn?> GetColumnByStatusAsync(int boardId, TaskItemStatus status);

    /// <summary>
    /// Get task count for a specific column
    /// </summary>
    /// <param name="columnId">Column ID</param>
    /// <returns>Number of tasks in the column</returns>
    Task<int> GetTaskCountAsync(int columnId);

    /// <summary>
    /// Check if column has reached its WIP limit
    /// </summary>
    /// <param name="columnId">Column ID</param>
    /// <returns>True if at or over WIP limit</returns>
    Task<bool> IsWipLimitReachedAsync(int columnId);

    /// <summary>
    /// Get columns that are marked as "done" columns
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <returns>List of done columns</returns>
    Task<IEnumerable<BoardColumn>> GetDoneColumnsAsync(int boardId);
} 