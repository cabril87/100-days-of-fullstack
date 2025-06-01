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
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Boards;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces;

/// <summary>
/// Service interface for board column business logic
/// Follows service pattern with comprehensive operations
/// </summary>
public interface IBoardColumnService
{
    /// <summary>
    /// Get all columns for a specific board with task counts
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>List of enhanced board column DTOs</returns>
    Task<IEnumerable<EnhancedBoardColumnDTO>> GetBoardColumnsAsync(int boardId, int userId);

    /// <summary>
    /// Get visible columns for a board (not hidden)
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>List of visible board column DTOs</returns>
    Task<IEnumerable<EnhancedBoardColumnDTO>> GetVisibleBoardColumnsAsync(int boardId, int userId);

    /// <summary>
    /// Get a specific board column by ID
    /// </summary>
    /// <param name="columnId">Column ID</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Enhanced board column DTO if found</returns>
    Task<EnhancedBoardColumnDTO?> GetColumnByIdAsync(int columnId, int userId);

    /// <summary>
    /// Create a new board column
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="createDto">Column creation data</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Created column DTO</returns>
    Task<EnhancedBoardColumnDTO> CreateColumnAsync(int boardId, CreateEnhancedBoardColumnDTO createDto, int userId);

    /// <summary>
    /// Update an existing board column
    /// </summary>
    /// <param name="columnId">Column ID</param>
    /// <param name="updateDto">Column update data</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Updated column DTO</returns>
    Task<EnhancedBoardColumnDTO> UpdateColumnAsync(int columnId, UpdateEnhancedBoardColumnDTO updateDto, int userId);

    /// <summary>
    /// Delete a board column (with safety checks)
    /// </summary>
    /// <param name="columnId">Column ID</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>True if deleted successfully</returns>
    Task<bool> DeleteColumnAsync(int columnId, int userId);

    /// <summary>
    /// Reorder columns for a board
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="columnOrders">List of column order changes</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>True if reordering was successful</returns>
    Task<bool> ReorderColumnsAsync(int boardId, List<ColumnOrderDTO> columnOrders, int userId);

    /// <summary>
    /// Duplicate a column within the same board
    /// </summary>
    /// <param name="columnId">Source column ID</param>
    /// <param name="newName">New column name</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Duplicated column DTO</returns>
    Task<EnhancedBoardColumnDTO> DuplicateColumnAsync(int columnId, string newName, int userId);

    /// <summary>
    /// Get column by mapped task status
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="status">Task status</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Column mapped to the status</returns>
    Task<EnhancedBoardColumnDTO?> GetColumnByStatusAsync(int boardId, TaskItemStatus status, int userId);

    /// <summary>
    /// Check if WIP limit is reached for a column
    /// </summary>
    /// <param name="columnId">Column ID</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>WIP limit status information</returns>
    Task<WipLimitStatusDTO> GetWipLimitStatusAsync(int columnId, int userId);

    /// <summary>
    /// Toggle column visibility (show/hide)
    /// </summary>
    /// <param name="columnId">Column ID</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Updated column DTO</returns>
    Task<EnhancedBoardColumnDTO> ToggleColumnVisibilityAsync(int columnId, int userId);

    /// <summary>
    /// Set column as done column (affects completion tracking)
    /// </summary>
    /// <param name="columnId">Column ID</param>
    /// <param name="isDone">Whether column represents completion</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Updated column DTO</returns>
    Task<EnhancedBoardColumnDTO> SetColumnAsDoneAsync(int columnId, bool isDone, int userId);

    /// <summary>
    /// Get statistics for a specific column
    /// </summary>
    /// <param name="columnId">Column ID</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Column statistics</returns>
    Task<ColumnStatisticsDTO> GetColumnStatisticsAsync(int columnId, int userId);

    /// <summary>
    /// Create default columns for a new board
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="templateId">Optional template ID to copy from</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>List of created default columns</returns>
    Task<IEnumerable<EnhancedBoardColumnDTO>> CreateDefaultColumnsAsync(int boardId, int? templateId, int userId);

    /// <summary>
    /// Validate column operations (WIP limits, dependencies, etc.)
    /// </summary>
    /// <param name="columnId">Column ID</param>
    /// <param name="operation">Operation type</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Validation result</returns>
    Task<ColumnValidationResultDTO> ValidateColumnOperationAsync(int columnId, string operation, int userId);
} 