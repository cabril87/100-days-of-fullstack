// Repositories/Interfaces/ICategoryRepository.cs
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

public interface ICategoryRepository
{
    // Basic CRUD
    Task<IEnumerable<Category>> GetCategoriesForUserAsync(int userId);
    Task<Category?> GetCategoryByIdAsync(int categoryId, int userId);
    Task<Category> CreateCategoryAsync(Category category);
    Task UpdateCategoryAsync(Category category);
    Task DeleteCategoryAsync(int categoryId, int userId);
    
    // Additional operations
    Task<bool> IsCategoryOwnedByUserAsync(int categoryId, int userId);
    Task<bool> HasTasksAsync(int categoryId);
    Task<int> GetCategoryTaskCountAsync(int categoryId);
    Task<IEnumerable<Category>> SearchCategoriesAsync(int userId, string searchTerm);
}