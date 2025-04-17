using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

public interface ITagRepository
{
    Task<IEnumerable<Tag>> GetTagsForUserAsync(int userId);
    Task<Tag?> GetTagByIdAsync(int tagId, int userId);
    Task<Tag> CreateTagAsync(Tag tag);
    Task UpdateTagAsync(Tag tag);
    Task DeleteTagAsync(int tagId, int userId);
    
    Task<bool> IsTagOwnedByUserAsync(int tagId, int userId);
    Task<bool> IsTagUsedInTasksAsync(int tagId);
    Task<int> GetTagUsageCountAsync(int tagId);
    Task<IEnumerable<Tag>> SearchTagsAsync(int userId, string searchTerm);
    
    Task<IEnumerable<TaskItem>> GetTasksByTagAsync(int tagId, int userId);
}