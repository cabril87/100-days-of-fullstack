// Services/Interfaces/ICategoryService.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces;

public interface ICategoryService
{
    // Basic CRUD operations
    Task<IEnumerable<CategoryDTO>> GetAllCategoriesAsync(int userId);
    Task<PagedResult<CategoryDTO>> GetPagedCategoriesAsync(int userId, PaginationParams paginationParams);
    Task<CategoryDTO?> GetCategoryByIdAsync(int categoryId, int userId);
    Task<CategoryDTO> CreateCategoryAsync(int userId, CategoryCreateDTO categoryDto);
    Task<CategoryDTO?> UpdateCategoryAsync(int categoryId, int userId, CategoryUpdateDTO categoryDto);
    Task<bool> DeleteCategoryAsync(int categoryId, int userId);
    
    // Additional operations
    Task<bool> IsCategoryOwnedByUserAsync(int categoryId, int userId);
    Task<int> GetTaskCountInCategoryAsync(int categoryId, int userId);
    Task<IEnumerable<CategoryDTO>> SearchCategoriesAsync(int userId, string searchTerm);
    Task<Dictionary<string, int>> GetCategoryStatisticsAsync(int userId);
}