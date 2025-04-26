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