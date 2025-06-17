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
using AutoMapper;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Boards;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

/// <summary>
/// Service implementation for board column business logic
/// Uses explicit typing and comprehensive business rules
/// </summary>
public class BoardColumnService : IBoardColumnService
{
    private readonly IBoardColumnRepository _boardColumnRepository;
    private readonly IBoardRepository _boardRepository;
    private readonly IBoardTemplateRepository _boardTemplateRepository;
    private readonly ITaskItemRepository _taskItemRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<BoardColumnService> _logger;

    public BoardColumnService(
        IBoardColumnRepository boardColumnRepository,
        IBoardRepository boardRepository,
        IBoardTemplateRepository boardTemplateRepository,
        ITaskItemRepository taskItemRepository,
        IMapper mapper,
        ILogger<BoardColumnService> logger)
    {
        _boardColumnRepository = boardColumnRepository ?? throw new ArgumentNullException(nameof(boardColumnRepository));
        _boardRepository = boardRepository ?? throw new ArgumentNullException(nameof(boardRepository));
        _boardTemplateRepository = boardTemplateRepository ?? throw new ArgumentNullException(nameof(boardTemplateRepository));
        _taskItemRepository = taskItemRepository ?? throw new ArgumentNullException(nameof(taskItemRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc />
    public async Task<IEnumerable<EnhancedBoardColumnDTO>> GetBoardColumnsAsync(int boardId, int userId)
    {
        try
        {
            _logger.LogInformation("Getting board columns for board {BoardId} by user {UserId}", boardId, userId);

            // Verify user has access to board
            await ValidateBoardAccessAsync(boardId, userId);

            IEnumerable<BoardColumn> columns = await _boardColumnRepository.GetColumnsByBoardIdAsync(boardId);
            List<EnhancedBoardColumnDTO> columnDtos = new List<EnhancedBoardColumnDTO>();

            foreach (BoardColumn column in columns)
            {
                EnhancedBoardColumnDTO dto = _mapper.Map<EnhancedBoardColumnDTO>(column);
                
                // Add task count
                dto.TaskCount = await _boardColumnRepository.GetTaskCountAsync(column.Id);
                
                columnDtos.Add(dto);
            }

            _logger.LogInformation("Retrieved {Count} columns for board {BoardId}", columnDtos.Count, boardId);
            return columnDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting board columns for board {BoardId} by user {UserId}", boardId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<EnhancedBoardColumnDTO>> GetVisibleBoardColumnsAsync(int boardId, int userId)
    {
        try
        {
            _logger.LogInformation("Getting visible board columns for board {BoardId} by user {UserId}", boardId, userId);

            IEnumerable<EnhancedBoardColumnDTO> allColumns = await GetBoardColumnsAsync(boardId, userId);
            List<EnhancedBoardColumnDTO> visibleColumns = allColumns.Where(c => !c.IsHidden).ToList();

            _logger.LogInformation("Retrieved {Count} visible columns out of {Total} for board {BoardId}", 
                visibleColumns.Count, allColumns.Count(), boardId);
            
            return visibleColumns;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting visible board columns for board {BoardId} by user {UserId}", boardId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<EnhancedBoardColumnDTO?> GetColumnByIdAsync(int columnId, int userId)
    {
        try
        {
            _logger.LogInformation("Getting column {ColumnId} by user {UserId}", columnId, userId);

            BoardColumn? column = await _boardColumnRepository.GetColumnByIdAsync(columnId);
            if (column == null)
            {
                _logger.LogWarning("Column {ColumnId} not found", columnId);
                return null;
            }

            // Verify user has access to board
            await ValidateBoardAccessAsync(column.BoardId, userId);

            EnhancedBoardColumnDTO dto = _mapper.Map<EnhancedBoardColumnDTO>(column);
            dto.TaskCount = await _boardColumnRepository.GetTaskCountAsync(columnId);

            _logger.LogInformation("Retrieved column {ColumnId}: {ColumnName}", columnId, column.Name);
            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting column {ColumnId} by user {UserId}", columnId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<EnhancedBoardColumnDTO> CreateColumnAsync(int boardId, CreateEnhancedBoardColumnDTO createDto, int userId)
    {
        try
        {
            _logger.LogInformation("Creating column {ColumnName} for board {BoardId} by user {UserId}", 
                createDto.Name, boardId, userId);

            // Verify user has access to board
            await ValidateBoardAccessAsync(boardId, userId);

            // Get next order position
            IEnumerable<BoardColumn> existingColumns = await _boardColumnRepository.GetColumnsByBoardIdAsync(boardId);
            int nextOrder = existingColumns.Any() ? existingColumns.Max(c => c.Order) + 1 : 0;

            BoardColumn column = new BoardColumn
            {
                BoardId = boardId,
                Name = createDto.Name,
                Order = nextOrder,
                TaskLimit = createDto.TaskLimit,
                Color = createDto.Color ?? "#6B7280",
                Icon = createDto.Icon ?? "folder",
                IsHidden = false, // New columns are visible by default
                IsDoneColumn = createDto.IsDoneColumn,
                MappedStatus = _mapper.Map<TaskItemStatus>(createDto.MappedStatus),
                CreatedAt = DateTime.UtcNow
            };

            BoardColumn createdColumn = await _boardColumnRepository.CreateColumnAsync(column);
            EnhancedBoardColumnDTO dto = _mapper.Map<EnhancedBoardColumnDTO>(createdColumn);
            dto.TaskCount = 0; // New column has no tasks

            _logger.LogInformation("Successfully created column {ColumnId}: {ColumnName} for board {BoardId}", 
                createdColumn.Id, createdColumn.Name, boardId);

            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating column {ColumnName} for board {BoardId} by user {UserId}", 
                createDto.Name, boardId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<EnhancedBoardColumnDTO> UpdateColumnAsync(int columnId, UpdateEnhancedBoardColumnDTO updateDto, int userId)
    {
        try
        {
            _logger.LogInformation("Updating column {ColumnId} by user {UserId}", columnId, userId);

            BoardColumn? existingColumn = await _boardColumnRepository.GetColumnByIdAsync(columnId);
            if (existingColumn == null)
            {
                throw new InvalidOperationException($"Column {columnId} not found");
            }

            // Verify user has access to board
            await ValidateBoardAccessAsync(existingColumn.BoardId, userId);

            // Update properties
            if (!string.IsNullOrWhiteSpace(updateDto.Name))
                existingColumn.Name = updateDto.Name;
            
            if (updateDto.TaskLimit.HasValue)
                existingColumn.TaskLimit = updateDto.TaskLimit;
            
            if (!string.IsNullOrWhiteSpace(updateDto.Color))
                existingColumn.Color = updateDto.Color;
            
            if (!string.IsNullOrWhiteSpace(updateDto.Icon))
                existingColumn.Icon = updateDto.Icon;
            
            if (updateDto.IsHidden.HasValue)
                existingColumn.IsHidden = updateDto.IsHidden.Value;
            
            if (updateDto.IsDoneColumn.HasValue)
                existingColumn.IsDoneColumn = updateDto.IsDoneColumn.Value;
            
            if (updateDto.MappedStatus.HasValue)
                existingColumn.MappedStatus = _mapper.Map<TaskItemStatus>(updateDto.MappedStatus.Value);

            existingColumn.UpdatedAt = DateTime.UtcNow;

            BoardColumn updatedColumn = await _boardColumnRepository.UpdateColumnAsync(existingColumn);
            EnhancedBoardColumnDTO dto = _mapper.Map<EnhancedBoardColumnDTO>(updatedColumn);
            dto.TaskCount = await _boardColumnRepository.GetTaskCountAsync(columnId);

            _logger.LogInformation("Successfully updated column {ColumnId}: {ColumnName}", columnId, updatedColumn.Name);
            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating column {ColumnId} by user {UserId}", columnId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<bool> DeleteColumnAsync(int columnId, int userId)
    {
        try
        {
            _logger.LogInformation("Deleting column {ColumnId} by user {UserId}", columnId, userId);

            BoardColumn? column = await _boardColumnRepository.GetColumnByIdAsync(columnId);
            if (column == null)
            {
                _logger.LogWarning("Column {ColumnId} not found for deletion", columnId);
                return false;
            }

            // Verify user has access to board
            await ValidateBoardAccessAsync(column.BoardId, userId);

            // Check if column has tasks
            int taskCount = await _boardColumnRepository.GetTaskCountAsync(columnId);
            if (taskCount > 0)
            {
                throw new InvalidOperationException($"Cannot delete column because it contains {taskCount} tasks. Move or delete tasks first.");
            }

            bool success = await _boardColumnRepository.DeleteColumnAsync(columnId);

            if (success)
            {
                _logger.LogInformation("Successfully deleted column {ColumnId}: {ColumnName}", columnId, column.Name);
            }

            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting column {ColumnId} by user {UserId}", columnId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<bool> ReorderColumnsAsync(int boardId, List<ColumnOrderDTO> columnOrders, int userId)
    {
        try
        {
            _logger.LogInformation("Reordering {Count} columns for board {BoardId} by user {UserId}", 
                columnOrders.Count, boardId, userId);

            // Verify user has access to board
            await ValidateBoardAccessAsync(boardId, userId);

            // Validate all columns belong to the board
            IEnumerable<BoardColumn> boardColumns = await _boardColumnRepository.GetColumnsByBoardIdAsync(boardId);
            List<int> boardColumnIds = boardColumns.Select(c => c.Id).ToList();
            List<int> providedColumnIds = columnOrders.Select(o => o.ColumnId).ToList();

            List<int> invalidColumns = providedColumnIds.Where(id => !boardColumnIds.Contains(id)).ToList();
            if (invalidColumns.Any())
            {
                throw new InvalidOperationException($"Columns {string.Join(", ", invalidColumns)} do not belong to board {boardId}");
            }

            // Convert to Dictionary format expected by repository
            Dictionary<int, int> columnOrderMapping = columnOrders.ToDictionary(co => co.ColumnId, co => co.NewOrder);
            bool success = await _boardColumnRepository.ReorderColumnsAsync(boardId, columnOrderMapping);

            if (success)
            {
                _logger.LogInformation("Successfully reordered columns for board {BoardId}", boardId);
            }

            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reordering columns for board {BoardId} by user {UserId}", boardId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<EnhancedBoardColumnDTO> DuplicateColumnAsync(int columnId, string newName, int userId)
    {
        try
        {
            _logger.LogInformation("Duplicating column {ColumnId} with name {NewName} by user {UserId}", 
                columnId, newName, userId);

            BoardColumn? sourceColumn = await _boardColumnRepository.GetColumnByIdAsync(columnId);
            if (sourceColumn == null)
            {
                throw new InvalidOperationException($"Source column {columnId} not found");
            }

            // Verify user has access to board
            await ValidateBoardAccessAsync(sourceColumn.BoardId, userId);

            // Get next order position
            IEnumerable<BoardColumn> existingColumns = await _boardColumnRepository.GetColumnsByBoardIdAsync(sourceColumn.BoardId);
            int nextOrder = existingColumns.Max(c => c.Order) + 1;

            BoardColumn duplicateColumn = new BoardColumn
            {
                BoardId = sourceColumn.BoardId,
                Name = newName,
                Order = nextOrder,
                TaskLimit = sourceColumn.TaskLimit,
                Color = sourceColumn.Color,
                Icon = sourceColumn.Icon,
                IsHidden = sourceColumn.IsHidden,
                IsDoneColumn = false, // Duplicate columns are not done by default
                MappedStatus = sourceColumn.MappedStatus,
                CreatedAt = DateTime.UtcNow
            };

            BoardColumn createdColumn = await _boardColumnRepository.CreateColumnAsync(duplicateColumn);
            EnhancedBoardColumnDTO dto = _mapper.Map<EnhancedBoardColumnDTO>(createdColumn);
            dto.TaskCount = 0; // New duplicate has no tasks

            _logger.LogInformation("Successfully duplicated column {SourceId} to {NewId}: {NewName}", 
                columnId, createdColumn.Id, newName);

            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error duplicating column {ColumnId} by user {UserId}", columnId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<EnhancedBoardColumnDTO?> GetColumnByStatusAsync(int boardId, TaskItemStatus status, int userId)
    {
        try
        {
            _logger.LogInformation("Getting column for status {Status} in board {BoardId} by user {UserId}", 
                status, boardId, userId);

            // Verify user has access to board
            await ValidateBoardAccessAsync(boardId, userId);

            BoardColumn? column = await _boardColumnRepository.GetColumnByStatusAsync(boardId, status);
            if (column == null)
            {
                _logger.LogWarning("No column found for status {Status} in board {BoardId}", status, boardId);
                return null;
            }

            EnhancedBoardColumnDTO dto = _mapper.Map<EnhancedBoardColumnDTO>(column);
            dto.TaskCount = await _boardColumnRepository.GetTaskCountAsync(column.Id);

            _logger.LogInformation("Found column {ColumnId}: {ColumnName} for status {Status}", 
                column.Id, column.Name, status);

            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting column for status {Status} in board {BoardId} by user {UserId}", 
                status, boardId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<WipLimitStatusDTO> GetWipLimitStatusAsync(int columnId, int userId)
    {
        try
        {
            _logger.LogInformation("Getting WIP limit status for column {ColumnId} by user {UserId}", columnId, userId);

            BoardColumn? column = await _boardColumnRepository.GetColumnByIdAsync(columnId);
            if (column == null)
            {
                throw new InvalidOperationException($"Column {columnId} not found");
            }

            // Verify user has access to board
            await ValidateBoardAccessAsync(column.BoardId, userId);

            int currentTaskCount = await _boardColumnRepository.GetTaskCountAsync(columnId);

            WipLimitStatusDTO status = new WipLimitStatusDTO
            {
                HasWipLimit = column.TaskLimit.HasValue,
                WipLimit = column.TaskLimit,
                CurrentTaskCount = currentTaskCount
            };

            if (status.HasWipLimit)
            {
                status.IsAtLimit = currentTaskCount >= column.TaskLimit!.Value;
                status.IsOverLimit = currentTaskCount > column.TaskLimit!.Value;

                if (status.IsOverLimit)
                {
                    status.Status = "over";
                    status.Message = $"Column is over WIP limit ({currentTaskCount}/{column.TaskLimit})";
                }
                else if (status.IsAtLimit)
                {
                    status.Status = "at";
                    status.Message = $"Column is at WIP limit ({currentTaskCount}/{column.TaskLimit})";
                }
                else
                {
                    status.Status = "under";
                    status.Message = $"Column is under WIP limit ({currentTaskCount}/{column.TaskLimit})";
                }
            }
            else
            {
                status.Status = "none";
                status.Message = "No WIP limit set";
            }

            return status;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting WIP limit status for column {ColumnId} by user {UserId}", columnId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<EnhancedBoardColumnDTO> ToggleColumnVisibilityAsync(int columnId, int userId)
    {
        try
        {
            _logger.LogInformation("Toggling visibility for column {ColumnId} by user {UserId}", columnId, userId);

            BoardColumn? column = await _boardColumnRepository.GetColumnByIdAsync(columnId);
            if (column == null)
            {
                throw new InvalidOperationException($"Column {columnId} not found");
            }

            // Verify user has access to board
            await ValidateBoardAccessAsync(column.BoardId, userId);

            column.IsHidden = !column.IsHidden;
            column.UpdatedAt = DateTime.UtcNow;

            BoardColumn updatedColumn = await _boardColumnRepository.UpdateColumnAsync(column);
            EnhancedBoardColumnDTO dto = _mapper.Map<EnhancedBoardColumnDTO>(updatedColumn);
            dto.TaskCount = await _boardColumnRepository.GetTaskCountAsync(columnId);

            _logger.LogInformation("Successfully toggled visibility for column {ColumnId} to {IsVisible}", 
                columnId, !updatedColumn.IsHidden);

            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling visibility for column {ColumnId} by user {UserId}", columnId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<EnhancedBoardColumnDTO> SetColumnAsDoneAsync(int columnId, bool isDone, int userId)
    {
        try
        {
            _logger.LogInformation("Setting column {ColumnId} as done: {IsDone} by user {UserId}", 
                columnId, isDone, userId);

            BoardColumn? column = await _boardColumnRepository.GetColumnByIdAsync(columnId);
            if (column == null)
            {
                throw new InvalidOperationException($"Column {columnId} not found");
            }

            // Verify user has access to board
            await ValidateBoardAccessAsync(column.BoardId, userId);

            column.IsDoneColumn = isDone;
            column.UpdatedAt = DateTime.UtcNow;

            BoardColumn updatedColumn = await _boardColumnRepository.UpdateColumnAsync(column);
            EnhancedBoardColumnDTO dto = _mapper.Map<EnhancedBoardColumnDTO>(updatedColumn);
            dto.TaskCount = await _boardColumnRepository.GetTaskCountAsync(columnId);

            _logger.LogInformation("Successfully set column {ColumnId} as done: {IsDone}", columnId, isDone);

            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting column {ColumnId} as done by user {UserId}", columnId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<ColumnStatisticsDTO> GetColumnStatisticsAsync(int columnId, int userId)
    {
        try
        {
            _logger.LogInformation("Getting statistics for column {ColumnId} by user {UserId}", columnId, userId);

            BoardColumn? column = await _boardColumnRepository.GetColumnByIdAsync(columnId);
            if (column == null)
            {
                throw new InvalidOperationException($"Column {columnId} not found");
            }

            // Verify user has access to board
            await ValidateBoardAccessAsync(column.BoardId, userId);

            // Get basic statistics
            int totalTasks = await _boardColumnRepository.GetTaskCountAsync(columnId);
            
            // Create statistics DTO
            ColumnStatisticsDTO stats = new ColumnStatisticsDTO
            {
                ColumnId = columnId,
                ColumnName = column.Name,
                TotalTasks = totalTasks,
                LastUpdated = DateTime.UtcNow
            };

            _logger.LogInformation("Retrieved statistics for column {ColumnId}: {TotalTasks} tasks", 
                columnId, totalTasks);

            return stats;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting statistics for column {ColumnId} by user {UserId}", columnId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<EnhancedBoardColumnDTO>> CreateDefaultColumnsAsync(int boardId, int? templateId, int userId)
    {
        try
        {
            _logger.LogInformation("Creating default columns for board {BoardId} with template {TemplateId} by user {UserId}", 
                boardId, templateId, userId);

            // Verify user has access to board
            await ValidateBoardAccessAsync(boardId, userId);

            List<BoardColumn> columnsToCreate = new List<BoardColumn>();

            if (templateId.HasValue)
            {
                // Use template columns
                BoardTemplate? template = await _boardTemplateRepository.GetTemplateWithColumnsAsync(templateId.Value);
                if (template != null && template.DefaultColumns.Any())
                {
                    foreach (BoardTemplateColumn templateColumn in template.DefaultColumns.OrderBy(c => c.Order))
                    {
                        BoardColumn column = new BoardColumn
                        {
                            BoardId = boardId,
                            Name = templateColumn.Name,
                            Order = templateColumn.Order,
                            TaskLimit = templateColumn.TaskLimit,
                            Color = templateColumn.Color,
                            Icon = templateColumn.Icon,
                            IsHidden = false, // Template columns are visible by default
                            IsDoneColumn = templateColumn.IsDoneColumn,
                            MappedStatus = templateColumn.MappedStatus,
                            CreatedAt = DateTime.UtcNow
                        };
                        columnsToCreate.Add(column);
                    }
                }
            }

            // If no template or template had no columns, create standard columns
            if (!columnsToCreate.Any())
            {
                columnsToCreate.AddRange(new[]
                {
                    new BoardColumn
                    {
                        BoardId = boardId,
                        Name = "To Do",
                        Order = 0,
                        Color = "#EF4444",
                        Icon = "folder",
                        IsHidden = false,
                        IsDoneColumn = false,
                        MappedStatus = TaskItemStatus.NotStarted,
                        CreatedAt = DateTime.UtcNow
                    },
                    new BoardColumn
                    {
                        BoardId = boardId,
                        Name = "In Progress",
                        Order = 1,
                        Color = "#F59E0B",
                        Icon = "clock",
                        IsHidden = false,
                        IsDoneColumn = false,
                        MappedStatus = TaskItemStatus.InProgress,
                        CreatedAt = DateTime.UtcNow
                    },
                    new BoardColumn
                    {
                        BoardId = boardId,
                        Name = "Completed",
                        Order = 2,
                        Color = "#10B981",
                        Icon = "check-circle",
                        IsHidden = false,
                        IsDoneColumn = true,
                        MappedStatus = TaskItemStatus.Completed,
                        CreatedAt = DateTime.UtcNow
                    }
                });
            }

            List<EnhancedBoardColumnDTO> createdColumns = new List<EnhancedBoardColumnDTO>();

            foreach (BoardColumn column in columnsToCreate)
            {
                BoardColumn created = await _boardColumnRepository.CreateColumnAsync(column);
                EnhancedBoardColumnDTO dto = _mapper.Map<EnhancedBoardColumnDTO>(created);
                dto.TaskCount = 0;
                createdColumns.Add(dto);
            }

            _logger.LogInformation("Successfully created {Count} default columns for board {BoardId}", 
                createdColumns.Count, boardId);

            return createdColumns;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating default columns for board {BoardId} by user {UserId}", boardId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<ColumnValidationResultDTO> ValidateColumnOperationAsync(int columnId, string operation, int userId)
    {
        try
        {
            _logger.LogInformation("Validating operation {Operation} for column {ColumnId} by user {UserId}", 
                operation, columnId, userId);

            ColumnValidationResultDTO result = new ColumnValidationResultDTO
            {
                Operation = operation,
                IsValid = true
            };

            BoardColumn? column = await _boardColumnRepository.GetColumnByIdAsync(columnId);
            if (column == null)
            {
                result.IsValid = false;
                result.Errors.Add($"Column {columnId} not found");
                return result;
            }

            // Verify user has access to board
            try
            {
                await ValidateBoardAccessAsync(column.BoardId, userId);
            }
            catch (UnauthorizedAccessException)
            {
                result.IsValid = false;
                result.Errors.Add("User does not have access to this board");
                return result;
            }

            // Operation-specific validations
            switch (operation.ToLower())
            {
                case "delete":
                    await ValidateDeleteOperationAsync(column, result);
                    break;
                case "move_task":
                    await ValidateMoveTaskOperationAsync(column, result);
                    break;
                default:
                    result.Warnings.Add($"No specific validation rules for operation: {operation}");
                    break;
            }

            _logger.LogInformation("Validation result for operation {Operation} on column {ColumnId}: {IsValid}", 
                operation, columnId, result.IsValid);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating operation {Operation} for column {ColumnId} by user {UserId}", 
                operation, columnId, userId);
            throw;
        }
    }

    #region Private Helper Methods

    private async Task ValidateBoardAccessAsync(int boardId, int userId)
    {
        Board? board = await _boardRepository.GetBoardByIdAsync(boardId);
        if (board == null)
        {
            throw new InvalidOperationException($"Board {boardId} not found");
        }

        if (board.UserId != userId)
        {
            throw new UnauthorizedAccessException($"User {userId} does not have access to board {boardId}");
        }
    }

    private async Task ValidateDeleteOperationAsync(BoardColumn column, ColumnValidationResultDTO result)
    {
        // Check if column has tasks
        int taskCount = await _boardColumnRepository.GetTaskCountAsync(column.Id);
        if (taskCount > 0)
        {
            result.IsValid = false;
            result.Errors.Add($"Cannot delete column because it contains {taskCount} tasks");
        }
    }

    private async Task ValidateMoveTaskOperationAsync(BoardColumn column, ColumnValidationResultDTO result)
    {
        // Check WIP limit
        if (column.TaskLimit.HasValue)
        {
            int currentTaskCount = await _boardColumnRepository.GetTaskCountAsync(column.Id);
            if (currentTaskCount >= column.TaskLimit.Value)
            {
                result.IsValid = false;
                result.Errors.Add($"Column is at or over WIP limit ({currentTaskCount}/{column.TaskLimit})");
            }
            else if (currentTaskCount == column.TaskLimit.Value - 1)
            {
                result.Warnings.Add($"Moving task will reach WIP limit ({currentTaskCount + 1}/{column.TaskLimit})");
            }
        }
    }

    #endregion
} 