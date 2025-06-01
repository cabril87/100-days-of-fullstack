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
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

/// <summary>
/// Repository interface for BoardTemplate entity operations
/// Follows repository pattern with explicit typing and no var declarations
/// </summary>
public interface IBoardTemplateRepository
{
    /// <summary>
    /// Get all public templates
    /// </summary>
    /// <returns>List of public board templates</returns>
    Task<IEnumerable<BoardTemplate>> GetPublicTemplatesAsync();

    /// <summary>
    /// Get templates created by a specific user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>List of user's board templates</returns>
    Task<IEnumerable<BoardTemplate>> GetTemplatesByUserAsync(int userId);

    /// <summary>
    /// Get template by ID with columns
    /// </summary>
    /// <param name="id">Template ID</param>
    /// <returns>BoardTemplate with default columns if found, null otherwise</returns>
    Task<BoardTemplate?> GetTemplateByIdAsync(int id);

    /// <summary>
    /// Get templates by category
    /// </summary>
    /// <param name="category">Template category</param>
    /// <returns>List of templates in the category</returns>
    Task<IEnumerable<BoardTemplate>> GetTemplatesByCategoryAsync(string category);

    /// <summary>
    /// Get default system templates
    /// </summary>
    /// <returns>List of default board templates</returns>
    Task<IEnumerable<BoardTemplate>> GetDefaultTemplatesAsync();

    /// <summary>
    /// Get most popular templates (by usage count)
    /// </summary>
    /// <param name="limit">Maximum number of templates to return</param>
    /// <returns>List of popular templates</returns>
    Task<IEnumerable<BoardTemplate>> GetPopularTemplatesAsync(int limit = 10);

    /// <summary>
    /// Get highest rated templates
    /// </summary>
    /// <param name="limit">Maximum number of templates to return</param>
    /// <returns>List of highly rated templates</returns>
    Task<IEnumerable<BoardTemplate>> GetTopRatedTemplatesAsync(int limit = 10);

    /// <summary>
    /// Create a new board template
    /// </summary>
    /// <param name="template">Template to create</param>
    /// <returns>Created template with assigned ID</returns>
    Task<BoardTemplate> CreateTemplateAsync(BoardTemplate template);

    /// <summary>
    /// Update an existing board template
    /// </summary>
    /// <param name="template">Template to update</param>
    /// <returns>Updated template</returns>
    Task<BoardTemplate> UpdateTemplateAsync(BoardTemplate template);

    /// <summary>
    /// Delete a board template
    /// </summary>
    /// <param name="id">Template ID to delete</param>
    /// <returns>True if deleted successfully</returns>
    Task<bool> DeleteTemplateAsync(int id);

    /// <summary>
    /// Increment the usage count for a template
    /// </summary>
    /// <param name="id">Template ID</param>
    /// <returns>True if incremented successfully</returns>
    Task<bool> IncrementUsageCountAsync(int id);

    /// <summary>
    /// Add rating to a template
    /// </summary>
    /// <param name="id">Template ID</param>
    /// <param name="rating">Rating value (1-5)</param>
    /// <returns>True if rating added successfully</returns>
    Task<bool> AddRatingAsync(int id, decimal rating);

    /// <summary>
    /// Check if user can edit template (owner or admin)
    /// </summary>
    /// <param name="templateId">Template ID</param>
    /// <param name="userId">User ID</param>
    /// <returns>True if user can edit</returns>
    Task<bool> CanUserEditTemplateAsync(int templateId, int userId);

    /// <summary>
    /// Search templates by name or description
    /// </summary>
    /// <param name="searchTerm">Search term</param>
    /// <returns>List of matching templates</returns>
    Task<IEnumerable<BoardTemplate>> SearchTemplatesAsync(string searchTerm);

    /// <summary>
    /// Get templates with specific tags
    /// </summary>
    /// <param name="tags">Comma-separated tags</param>
    /// <returns>List of templates matching tags</returns>
    Task<IEnumerable<BoardTemplate>> GetTemplatesByTagsAsync(string tags);

    /// <summary>
    /// Get all available categories
    /// </summary>
    /// <returns>List of distinct categories</returns>
    Task<IEnumerable<string>> GetCategoriesAsync();

    /// <summary>
    /// Get template with columns for board creation
    /// </summary>
    /// <param name="id">Template ID</param>
    /// <returns>Template with populated columns</returns>
    Task<BoardTemplate?> GetTemplateWithColumnsAsync(int id);
} 