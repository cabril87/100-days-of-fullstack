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

        Board? board = await _boardRepository.GetBoardByIdAsync(boardId);
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
        return _mapper.Map<BoardDTO>(createdBoard);
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