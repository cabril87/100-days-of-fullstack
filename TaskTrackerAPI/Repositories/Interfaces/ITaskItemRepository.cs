using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

public interface ITaskItemRepository
{
    // Basic CRUD
    Task<IEnumerable<TaskItem>> GetAllTasksAsync(int userId);
    Task<TaskItem?> GetTaskByIdAsync(int id, int userId);
    Task<TaskItem> CreateTaskAsync(TaskItem task);
    Task UpdateTaskAsync(TaskItem task);
    Task DeleteTaskAsync(int id, int userId);
    
    // Filtering operations
    Task<IEnumerable<TaskItem>> GetTasksByStatusAsync(int userId, TaskItemStatus status);
    Task<IEnumerable<TaskItem>> GetTasksByCategoryAsync(int userId, int categoryId);
    Task<IEnumerable<TaskItem>> GetTasksByTagAsync(int userId, int tagId);
    
    // Additional operations
    Task<bool> IsTaskOwnedByUserAsync(int taskId, int userId);
    
    // Tag management
    Task AddTagToTaskAsync(int taskId, int tagId);
    Task RemoveTagFromTaskAsync(int taskId, int tagId);
    Task UpdateTaskTagsAsync(int taskId, IEnumerable<int> tagIds);
    Task<IEnumerable<Tag>> GetTagsForTaskAsync(int taskId);
}