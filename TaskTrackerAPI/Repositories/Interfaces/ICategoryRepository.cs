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
// Repositories/Interfaces/ICategoryRepository.cs
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

public interface ICategoryRepository
{
    // Basic CRUD
    Task<IEnumerable<Category>> GetCategoriesForUserAsync(int userId);
    Task<PagedResult<Category>> GetPagedCategoriesForUserAsync(int userId, PaginationParams paginationParams);
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