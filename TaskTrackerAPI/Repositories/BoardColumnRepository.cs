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
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories;

/// <summary>
/// Repository implementation for BoardColumn entity operations
/// Uses explicit typing and follows established repository patterns
/// </summary>
public class BoardColumnRepository : IBoardColumnRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<BoardColumnRepository> _logger;

    public BoardColumnRepository(ApplicationDbContext context, ILogger<BoardColumnRepository> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardColumn>> GetColumnsByBoardIdAsync(int boardId)
    {
        try
        {
            _logger.LogInformation("Getting columns for board {BoardId}", boardId);

            List<BoardColumn> columns = await _context.BoardColumns
                .Where(c => c.BoardId == boardId)
                .OrderBy(c => c.Order)
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} columns for board {BoardId}", columns.Count, boardId);
            return columns;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting columns for board {BoardId}", boardId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardColumn?> GetColumnByIdAsync(int id)
    {
        try
        {
            _logger.LogInformation("Getting board column by ID {ColumnId}", id);

            BoardColumn? column = await _context.BoardColumns
                .FirstOrDefaultAsync(c => c.Id == id);

            if (column != null)
            {
                _logger.LogInformation("Found board column {ColumnId}: {ColumnName}", id, column.Name);
            }
            else
            {
                _logger.LogWarning("Board column {ColumnId} not found", id);
            }

            return column;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting board column {ColumnId}", id);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardColumn>> GetVisibleColumnsByBoardIdAsync(int boardId)
    {
        try
        {
            _logger.LogInformation("Getting visible columns for board {BoardId}", boardId);

            List<BoardColumn> columns = await _context.BoardColumns
                .Where(c => c.BoardId == boardId && !c.IsHidden)
                .OrderBy(c => c.Order)
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} visible columns for board {BoardId}", columns.Count, boardId);
            return columns;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting visible columns for board {BoardId}", boardId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardColumn> CreateColumnAsync(BoardColumn column)
    {
        try
        {
            _logger.LogInformation("Creating new board column {ColumnName} for board {BoardId}", 
                column.Name, column.BoardId);

            column.CreatedAt = DateTime.UtcNow;
            column.UpdatedAt = null;

            _context.BoardColumns.Add(column);
            int result = await _context.SaveChangesAsync();

            if (result > 0)
            {
                _logger.LogInformation("Successfully created board column {ColumnId}: {ColumnName}", 
                    column.Id, column.Name);
            }
            else
            {
                _logger.LogWarning("Failed to create board column {ColumnName}", column.Name);
            }

            return column;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating board column {ColumnName} for board {BoardId}", 
                column.Name, column.BoardId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardColumn> UpdateColumnAsync(BoardColumn column)
    {
        try
        {
            _logger.LogInformation("Updating board column {ColumnId}: {ColumnName}", 
                column.Id, column.Name);

            column.UpdatedAt = DateTime.UtcNow;

            _context.BoardColumns.Update(column);
            int result = await _context.SaveChangesAsync();

            if (result > 0)
            {
                _logger.LogInformation("Successfully updated board column {ColumnId}: {ColumnName}", 
                    column.Id, column.Name);
            }
            else
            {
                _logger.LogWarning("Failed to update board column {ColumnId}: {ColumnName}", 
                    column.Id, column.Name);
            }

            return column;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating board column {ColumnId}: {ColumnName}", 
                column.Id, column.Name);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<bool> DeleteColumnAsync(int id)
    {
        try
        {
            _logger.LogInformation("Deleting board column {ColumnId}", id);

            BoardColumn? column = await _context.BoardColumns
                .FirstOrDefaultAsync(c => c.Id == id);

            if (column == null)
            {
                _logger.LogWarning("Board column {ColumnId} not found for deletion", id);
                return false;
            }

            _context.BoardColumns.Remove(column);
            int result = await _context.SaveChangesAsync();

            bool success = result > 0;
            if (success)
            {
                _logger.LogInformation("Successfully deleted board column {ColumnId}: {ColumnName}", 
                    id, column.Name);
            }
            else
            {
                _logger.LogWarning("Failed to delete board column {ColumnId}", id);
            }

            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting board column {ColumnId}", id);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<bool> ReorderColumnsAsync(int boardId, Dictionary<int, int> columnOrders)
    {
        try
        {
            _logger.LogInformation("Reordering columns for board {BoardId}", boardId);

            // Get the column IDs to avoid Dictionary.ContainsKey() in LINQ
            var columnIds = columnOrders.Keys.ToList();

            List<BoardColumn> columns = await _context.BoardColumns
                .Where(c => c.BoardId == boardId && columnIds.Contains(c.Id))
                .ToListAsync();

            if (columns.Count == 0)
            {
                _logger.LogWarning("No columns found for reordering in board {BoardId}", boardId);
                return false;
            }

            foreach (BoardColumn column in columns)
            {
                if (columnOrders.TryGetValue(column.Id, out int newOrder))
                {
                    column.Order = newOrder;
                    column.UpdatedAt = DateTime.UtcNow;
                }
            }

            int result = await _context.SaveChangesAsync();
            bool success = result > 0;

            if (success)
            {
                _logger.LogInformation("Successfully reordered {Count} columns for board {BoardId}", 
                    columns.Count, boardId);
            }
            else
            {
                _logger.LogWarning("Failed to reorder columns for board {BoardId}", boardId);
            }

            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reordering columns for board {BoardId}", boardId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<int> GetNextOrderAsync(int boardId)
    {
        try
        {
            _logger.LogInformation("Getting next order for board {BoardId}", boardId);

            int? maxOrder = await _context.BoardColumns
                .Where(c => c.BoardId == boardId)
                .MaxAsync(c => (int?)c.Order);

            int nextOrder = (maxOrder ?? -1) + 1;

            _logger.LogInformation("Next order for board {BoardId} is {NextOrder}", boardId, nextOrder);
            return nextOrder;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting next order for board {BoardId}", boardId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<bool> ColumnBelongsToBoardAsync(int columnId, int boardId)
    {
        try
        {
            _logger.LogInformation("Checking if column {ColumnId} belongs to board {BoardId}", 
                columnId, boardId);

            bool belongs = await _context.BoardColumns
                .AnyAsync(c => c.Id == columnId && c.BoardId == boardId);

            _logger.LogInformation("Column {ColumnId} belongs to board {BoardId}: {Belongs}", 
                columnId, boardId, belongs);

            return belongs;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if column {ColumnId} belongs to board {BoardId}", 
                columnId, boardId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardColumn?> GetColumnByStatusAsync(int boardId, TaskItemStatus status)
    {
        try
        {
            _logger.LogInformation("Getting column for board {BoardId} with status {Status}", 
                boardId, status);

            BoardColumn? column = await _context.BoardColumns
                .FirstOrDefaultAsync(c => c.BoardId == boardId && c.MappedStatus == status);

            if (column != null)
            {
                _logger.LogInformation("Found column {ColumnId} for status {Status} in board {BoardId}", 
                    column.Id, status, boardId);
            }
            else
            {
                _logger.LogWarning("No column found for status {Status} in board {BoardId}", 
                    status, boardId);
            }

            return column;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting column for board {BoardId} with status {Status}", 
                boardId, status);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<int> GetTaskCountAsync(int columnId)
    {
        try
        {
            _logger.LogInformation("Getting task count for column {ColumnId}", columnId);

            // Get the column to find its mapped status and board
            BoardColumn? column = await _context.BoardColumns
                .FirstOrDefaultAsync(c => c.Id == columnId);

            if (column == null)
            {
                _logger.LogWarning("Column {ColumnId} not found", columnId);
                return 0;
            }

            // Count tasks in this board with the column's mapped status
            int taskCount = await _context.Tasks
                .CountAsync(t => t.BoardId == column.BoardId && t.Status == column.MappedStatus);

            _logger.LogInformation("Column {ColumnId} has {TaskCount} tasks", columnId, taskCount);
            return taskCount;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting task count for column {ColumnId}", columnId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<bool> IsWipLimitReachedAsync(int columnId)
    {
        try
        {
            _logger.LogInformation("Checking WIP limit for column {ColumnId}", columnId);

            BoardColumn? column = await _context.BoardColumns
                .FirstOrDefaultAsync(c => c.Id == columnId);

            if (column == null || column.TaskLimit == null)
            {
                _logger.LogInformation("Column {ColumnId} has no WIP limit", columnId);
                return false;
            }

            int taskCount = await GetTaskCountAsync(columnId);
            bool limitReached = taskCount >= column.TaskLimit.Value;

            _logger.LogInformation("Column {ColumnId} WIP limit check: {TaskCount}/{Limit} - Reached: {LimitReached}", 
                columnId, taskCount, column.TaskLimit.Value, limitReached);

            return limitReached;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking WIP limit for column {ColumnId}", columnId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardColumn>> GetDoneColumnsAsync(int boardId)
    {
        try
        {
            _logger.LogInformation("Getting done columns for board {BoardId}", boardId);

            List<BoardColumn> doneColumns = await _context.BoardColumns
                .Where(c => c.BoardId == boardId && c.IsDoneColumn)
                .OrderBy(c => c.Order)
                .ToListAsync();

            _logger.LogInformation("Found {Count} done columns for board {BoardId}", 
                doneColumns.Count, boardId);

            return doneColumns;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting done columns for board {BoardId}", boardId);
            throw;
        }
    }
} 