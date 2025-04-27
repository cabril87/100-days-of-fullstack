using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Boards;

namespace TaskTrackerAPI.Services.Interfaces;

public interface IBoardService
{
    Task<IEnumerable<BoardDTO>> GetAllBoardsAsync(int userId);
    Task<BoardDTO?> GetBoardByIdAsync(int userId, int boardId);
    Task<BoardDetailDTO?> GetBoardWithTasksAsync(int userId, int boardId);
    Task<BoardDTO?> CreateBoardAsync(int userId, CreateBoardDTO boardDto);
    Task<BoardDTO?> UpdateBoardAsync(int userId, int boardId, UpdateBoardDTO boardDto);
    Task DeleteBoardAsync(int userId, int boardId);
    Task<bool> IsBoardOwnedByUserAsync(int boardId, int userId);
    Task<BoardDTO?> ReorderTaskInBoardAsync(int userId, int boardId, TaskReorderDTO reorderDto);
} 