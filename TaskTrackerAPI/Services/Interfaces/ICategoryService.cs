/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */
// Services/Interfaces/ICategoryService.cs
using TaskTrackerAPI.DTOs.Categories;
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