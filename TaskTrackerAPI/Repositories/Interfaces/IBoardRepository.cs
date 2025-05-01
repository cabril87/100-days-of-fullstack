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

public interface IBoardRepository
{
    Task<IEnumerable<Board>> GetAllBoardsAsync(int userId);
    Task<Board?> GetBoardByIdAsync(int boardId);
    Task<IEnumerable<TaskItem>> GetTasksByBoardIdAsync(int boardId);
    Task<Board> CreateBoardAsync(Board board);
    Task<Board> UpdateBoardAsync(Board board);
    Task DeleteBoardAsync(Board board);
    Task<bool> IsBoardOwnedByUserAsync(int boardId, int userId);
    Task<Board?> ReorderTaskInBoardAsync(int boardId, int taskId, int? positionX, int? positionY, int? boardOrder);
} 