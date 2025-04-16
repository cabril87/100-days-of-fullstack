using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<Category>> GetAllAsync(int userId);
        Task<Category> GetByIdAsync(int categoryId, int userId);
        Task<Category> CreateAsync(Category category);
        Task<Category> UpdateAsync(Category category);
        Task<bool> DeleteAsync(int categoryId, int userId);
        Task<bool> ExistsAsync(int categoryId, int userId);
        Task<int> GetTaskCountByCategoryAsync(int categoryId, int userId);
    }
}