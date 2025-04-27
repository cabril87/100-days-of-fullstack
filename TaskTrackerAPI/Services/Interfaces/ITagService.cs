// Services/Interfaces/ITagService.cs
using TaskTrackerAPI.DTOs.Tags;
using TaskTrackerAPI.DTOs.Tasks;

namespace TaskTrackerAPI.Services.Interfaces;

public interface ITagService
{
    // Basic CRUD operations
    Task<IEnumerable<TagDTO>> GetAllTagsAsync(int userId);
    Task<TagDTO?> GetTagByIdAsync(int tagId, int userId);
    Task<TagDTO> CreateTagAsync(int userId, TagCreateDTO tagDto);
    Task<TagDTO?> UpdateTagAsync(int tagId, int userId, TagUpdateDTO tagDto);
    Task<bool> DeleteTagAsync(int tagId, int userId);
    
    // Additional operations
    Task<bool> IsTagOwnedByUserAsync(int tagId, int userId);
    Task<int> GetTagUsageCountAsync(int tagId, int userId);
    Task<IEnumerable<TagDTO>> SearchTagsAsync(int userId, string searchTerm);
    
    // Task relationship operations
    Task<IEnumerable<TaskItemDTO>> GetTasksByTagAsync(int tagId, int userId);
    Task<Dictionary<string, int>> GetTagStatisticsAsync(int userId);
}