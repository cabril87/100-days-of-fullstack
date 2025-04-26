using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories;

public class BoardRepository : IBoardRepository
{
    private readonly ApplicationDbContext _context;

    public BoardRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Board>> GetAllBoardsAsync(int userId)
    {
        return await _context.Boards
            .Where(b => b.UserId == userId)
            .OrderBy(b => b.Name)
            .ToListAsync();
    }

    public async Task<Board?> GetBoardByIdAsync(int boardId)
    {
        return await _context.Boards
            .FirstOrDefaultAsync(b => b.Id == boardId);
    }

    public async Task<IEnumerable<TaskItem>> GetTasksByBoardIdAsync(int boardId)
    {
        return await _context.Tasks
            .Where(t => t.BoardId == boardId)
            .OrderBy(t => t.BoardOrder)
            .ToListAsync();
    }

    public async Task<Board> CreateBoardAsync(Board board)
    {
        _context.Boards.Add(board);
        await _context.SaveChangesAsync();
        return board;
    }

    public async Task<Board> UpdateBoardAsync(Board board)
    {
        board.UpdatedAt = DateTime.UtcNow;
        _context.Boards.Update(board);
        await _context.SaveChangesAsync();
        return board;
    }

    public async Task DeleteBoardAsync(Board board)
    {
        _context.Boards.Remove(board);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> IsBoardOwnedByUserAsync(int boardId, int userId)
    {
        return await _context.Boards
            .AnyAsync(b => b.Id == boardId && b.UserId == userId);
    }

    public async Task<Board?> ReorderTaskInBoardAsync(int boardId, int taskId, int? positionX, int? positionY, int? boardOrder)
    {
        Board? board = await _context.Boards.FirstOrDefaultAsync(b => b.Id == boardId);
        if (board == null)
            return null;

        TaskItem? task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == taskId && t.BoardId == boardId);
        if (task == null)
            return null;

        if (positionX.HasValue)
            task.PositionX = positionX.Value;
            
        if (positionY.HasValue)
            task.PositionY = positionY.Value;
            
        if (boardOrder.HasValue)
            task.BoardOrder = boardOrder.Value;

        task.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        
        return board;
    }
} 