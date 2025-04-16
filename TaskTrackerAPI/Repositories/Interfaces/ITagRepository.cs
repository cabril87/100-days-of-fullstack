using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces
{
    public interface ITagRepository
    {
        Task<IEnumerable<Tag>> GetAllAsync(int userId);
        Task<Tag> GetByIdAsync(int tagId, int userId);
        Task<Tag> CreateAsync(Tag tag);
        Task<Tag> UpdateAsync(Tag tag);
        Task<bool> DeleteAsync(int tagId, int userId);
        Task<bool> ExistsAsync(int tagId, int userId);
        Task<IEnumerable<Tag>> GetTagsByTaskIdAsync(int taskId, int userId);
        Task<bool> AddTagToTaskAsync(int taskId, int tagId, int userId);
        Task<bool> RemoveTagFromTaskAsync(int taskId, int tagId, int userId);
    }
}