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
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Boards;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

public class BoardService : IBoardService
{
    private readonly IBoardRepository _boardRepository;
    private readonly ITaskItemRepository _taskItemRepository;
    private readonly IMapper _mapper;

    public BoardService(
        IBoardRepository boardRepository,
        ITaskItemRepository taskItemRepository,
        IMapper mapper)
    {
        _boardRepository = boardRepository;
        _taskItemRepository = taskItemRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<BoardDTO>> GetAllBoardsAsync(int userId)
    {
        IEnumerable<Board> boards = await _boardRepository.GetAllBoardsAsync(userId);
        List<BoardDTO> boardDtos = _mapper.Map<IEnumerable<BoardDTO>>(boards).ToList();

        // Get task counts for each board
        foreach (BoardDTO boardDto in boardDtos)
        {
            IEnumerable<TaskItem> tasks = await _boardRepository.GetTasksByBoardIdAsync(boardDto.Id);
            boardDto.TaskCount = tasks.Count();
        }

        return boardDtos;
    }

    public async Task<BoardDTO?> GetBoardByIdAsync(int userId, int boardId)
    {
        // Ensure board exists and belongs to user
        bool isOwned = await _boardRepository.IsBoardOwnedByUserAsync(boardId, userId);
        if (!isOwned)
        {
            return null;
        }

        Board? board = await _boardRepository.GetBoardByIdAsync(boardId);
        if (board == null)
        {
            return null;
        }

        BoardDTO boardDto = _mapper.Map<BoardDTO>(board);
        IEnumerable<TaskItem> tasks = await _boardRepository.GetTasksByBoardIdAsync(boardId);
        boardDto.TaskCount = tasks.Count();

        return boardDto;
    }

    public async Task<BoardDetailDTO?> GetBoardWithTasksAsync(int userId, int boardId)
    {
        // Ensure board exists and belongs to user
        bool isOwned = await _boardRepository.IsBoardOwnedByUserAsync(boardId, userId);
        if (!isOwned)
        {
            return null;
        }

        Board? board = await _boardRepository.GetBoardWithColumnsAsync(boardId);
        if (board == null)
        {
            return null;
        }

        BoardDetailDTO boardDetailDto = _mapper.Map<BoardDetailDTO>(board);
        IEnumerable<TaskItem> tasks = await _boardRepository.GetTasksByBoardIdAsync(boardId);
        boardDetailDto.Tasks = _mapper.Map<IEnumerable<TaskItemDTO>>(tasks);
        boardDetailDto.TaskCount = tasks.Count();

        return boardDetailDto;
    }

    public async Task<BoardDTO?> CreateBoardAsync(int userId, CreateBoardDTO boardDto)
    {
        // Create the board
        Board board = _mapper.Map<Board>(boardDto);
        board.UserId = userId;
        board.CreatedAt = DateTime.UtcNow;

        Board createdBoard = await _boardRepository.CreateBoardAsync(board);

        // Debug logging
        Console.WriteLine($"🔧 BoardService.CreateBoardAsync: Board '{boardDto.Name}' created with ID {createdBoard.Id}");
        Console.WriteLine($"🔧 BoardDto.Columns is null: {boardDto.Columns == null}");
        Console.WriteLine($"🔧 BoardDto.Columns count: {boardDto.Columns?.Count() ?? 0}");
        if (boardDto.Columns != null)
        {
            foreach (var col in boardDto.Columns)
            {
                Console.WriteLine($"🔧 Column from DTO: {col.Name} (Status: {col.Status}, Order: {col.Order})");
            }
        }

        // Create board columns if provided, or create default columns if none provided
        if (boardDto.Columns != null && boardDto.Columns.Any())
        {
            // User provided columns - create them
            Console.WriteLine($"🔧 BoardService: Creating {boardDto.Columns.Count()} user-provided columns for board {createdBoard.Id}");
            
            // Check if columns already exist for this board (safety check)
            Board? boardWithExistingColumns = await _boardRepository.GetBoardWithColumnsAsync(createdBoard.Id);
            if (boardWithExistingColumns?.Columns?.Any() == true)
            {
                Console.WriteLine($"⚠️ BoardService: Board {createdBoard.Id} already has {boardWithExistingColumns.Columns.Count} columns! Skipping column creation to prevent duplicates.");
                return _mapper.Map<BoardDTO>(boardWithExistingColumns);
            }
            
            foreach (BoardColumnCreateDTO columnDto in boardDto.Columns)
            {
                BoardColumn column = _mapper.Map<BoardColumn>(columnDto);
                column.BoardId = createdBoard.Id;
                column.CreatedAt = DateTime.UtcNow;
                // Ensure proper mapping of missing properties
                column.IsHidden = false;
                column.IsCollapsible = true;
                column.IsDoneColumn = column.MappedStatus == TaskItemStatus.Completed;
                column.Icon = column.Icon ?? GetDefaultIconForStatus(column.MappedStatus);

                Console.WriteLine($"🔧 Creating column: {column.Name} (Status: {column.MappedStatus}, Order: {column.Order})");
                await _boardRepository.CreateBoardColumnAsync(column);
            }
            Console.WriteLine($"✅ BoardService: Finished creating user-provided columns for board {createdBoard.Id}");
        }
        else
        {
            // No columns provided - create default columns
            Console.WriteLine($"🔧 BoardService: No columns provided, creating default columns for board {createdBoard.Id}");
            BoardColumn[] defaultColumns = new[]
            {
                new BoardColumn
                {
                    BoardId = createdBoard.Id,
                    Name = "To Do",
                    Order = 0,
                    Color = "#EF4444",
                    Icon = "folder",
                    MappedStatus = TaskItemStatus.NotStarted,
                    IsHidden = false,
                    IsDoneColumn = false,
                    IsCollapsible = true,
                    CreatedAt = DateTime.UtcNow
                },
                new BoardColumn
                {
                    BoardId = createdBoard.Id,
                    Name = "In Progress", 
                    Order = 1,
                    Color = "#F59E0B",
                    Icon = "clock",
                    MappedStatus = TaskItemStatus.InProgress,
                    IsHidden = false,
                    IsDoneColumn = false,
                    IsCollapsible = true,
                    CreatedAt = DateTime.UtcNow
                },
                new BoardColumn
                {
                    BoardId = createdBoard.Id,
                    Name = "Completed",
                    Order = 2,
                    Color = "#10B981",
                    Icon = "check-circle",
                    MappedStatus = TaskItemStatus.Completed,
                    IsHidden = false,
                    IsDoneColumn = true,
                    IsCollapsible = true,
                    CreatedAt = DateTime.UtcNow
                }
            };

            foreach (BoardColumn column in defaultColumns)
            {
                await _boardRepository.CreateBoardColumnAsync(column);
            }
        }

        // Reload board with columns to ensure we return complete data
        Board? boardWithColumns = await _boardRepository.GetBoardWithColumnsAsync(createdBoard.Id);
        
        // Debug: Log final column count
        Console.WriteLine($"🔧 BoardService: Final board has {boardWithColumns?.Columns?.Count ?? 0} columns");
        if (boardWithColumns?.Columns != null)
        {
            foreach (var col in boardWithColumns.Columns)
            {
                Console.WriteLine($"🔧 Final column: {col.Name} (ID: {col.Id}, Status: {col.MappedStatus}, Order: {col.Order})");
            }
        }
        
        return _mapper.Map<BoardDTO>(boardWithColumns ?? createdBoard);
    }

    private static string GetDefaultIconForStatus(TaskItemStatus status)
    {
        return status switch
        {
            TaskItemStatus.NotStarted => "folder",
            TaskItemStatus.InProgress => "clock",
            TaskItemStatus.OnHold => "pause",
            TaskItemStatus.Completed => "check-circle",
            TaskItemStatus.Pending => "clock",
            _ => "folder"
        };
    }

    public async Task<BoardDTO?> UpdateBoardAsync(int userId, int boardId, UpdateBoardDTO boardDto)
    {
        // Ensure board exists and belongs to user
        bool isOwned = await _boardRepository.IsBoardOwnedByUserAsync(boardId, userId);
        if (!isOwned)
        {
            return null;
        }

        // Get the existing board
        Board? existingBoard = await _boardRepository.GetBoardByIdAsync(boardId);
        if (existingBoard == null)
        {
            return null;
        }

        // Update properties
        if (boardDto.Name != null)
            existingBoard.Name = boardDto.Name;
            
        if (boardDto.Description != null)
            existingBoard.Description = boardDto.Description;

        existingBoard.UpdatedAt = DateTime.UtcNow;

        Board updatedBoard = await _boardRepository.UpdateBoardAsync(existingBoard);
        BoardDTO boardResult = _mapper.Map<BoardDTO>(updatedBoard);

        // Get task count
        IEnumerable<TaskItem> tasks = await _boardRepository.GetTasksByBoardIdAsync(boardId);
        boardResult.TaskCount = tasks.Count();

        return boardResult;
    }

    public async Task DeleteBoardAsync(int userId, int boardId)
    {
        // Ensure board exists and belongs to user
        bool isOwned = await _boardRepository.IsBoardOwnedByUserAsync(boardId, userId);
        if (!isOwned)
        {
            throw new ArgumentException($"Board with ID {boardId} not found or does not belong to the user");
        }

        Board? board = await _boardRepository.GetBoardByIdAsync(boardId);
        if (board != null)
        {
            await _boardRepository.DeleteBoardAsync(board);
        }
    }

    public async Task<bool> IsBoardOwnedByUserAsync(int boardId, int userId)
    {
        return await _boardRepository.IsBoardOwnedByUserAsync(boardId, userId);
    }

    public async Task<BoardDTO?> ReorderTaskInBoardAsync(int userId, int boardId, TaskReorderDTO reorderDto)
    {
        // Ensure board exists and belongs to user
        bool isOwned = await _boardRepository.IsBoardOwnedByUserAsync(boardId, userId);
        if (!isOwned)
        {
            return null;
        }

        // Ensure task exists and belongs to user
        bool isTaskOwned = await _taskItemRepository.IsTaskOwnedByUserAsync(reorderDto.TaskId, userId);
        if (!isTaskOwned)
        {
            throw new UnauthorizedAccessException($"Task with ID {reorderDto.TaskId} does not belong to the user");
        }

        Board? updatedBoard = await _boardRepository.ReorderTaskInBoardAsync(
            boardId, 
            reorderDto.TaskId, 
            (int)reorderDto.SourceStatus, 
            (int)reorderDto.TargetStatus, 
            reorderDto.TargetPosition
        );

        if (updatedBoard == null)
        {
            return null;
        }

        BoardDTO boardDto = _mapper.Map<BoardDTO>(updatedBoard);
        IEnumerable<TaskItem> tasks = await _boardRepository.GetTasksByBoardIdAsync(boardId);
        boardDto.TaskCount = tasks.Count();

        return boardDto;
    }
} 