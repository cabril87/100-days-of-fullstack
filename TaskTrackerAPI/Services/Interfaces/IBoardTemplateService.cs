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
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Boards;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces;

/// <summary>
/// Service interface for board template business logic
/// Follows service pattern with comprehensive template marketplace functionality
/// </summary>
public interface IBoardTemplateService
{
    /// <summary>
    /// Get all public templates available in marketplace
    /// </summary>
    /// <returns>List of public board template DTOs</returns>
    Task<IEnumerable<BoardTemplateDTO>> GetPublicTemplatesAsync();

    /// <summary>
    /// Get templates created by a specific user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>List of user's board template DTOs</returns>
    Task<IEnumerable<BoardTemplateDTO>> GetUserTemplatesAsync(int userId);

    /// <summary>
    /// Get template by ID with authorization check
    /// </summary>
    /// <param name="templateId">Template ID</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Board template DTO if found and accessible</returns>
    Task<BoardTemplateDTO?> GetTemplateByIdAsync(int templateId, int userId);

    /// <summary>
    /// Get templates by category
    /// </summary>
    /// <param name="category">Template category</param>
    /// <returns>List of templates in the category</returns>
    Task<IEnumerable<BoardTemplateDTO>> GetTemplatesByCategoryAsync(string category);

    /// <summary>
    /// Get most popular templates
    /// </summary>
    /// <param name="limit">Maximum number of templates to return</param>
    /// <returns>List of popular template DTOs</returns>
    Task<IEnumerable<BoardTemplateDTO>> GetPopularTemplatesAsync(int limit = 10);

    /// <summary>
    /// Get highest rated templates
    /// </summary>
    /// <param name="limit">Maximum number of templates to return</param>
    /// <returns>List of top-rated template DTOs</returns>
    Task<IEnumerable<BoardTemplateDTO>> GetTopRatedTemplatesAsync(int limit = 10);

    /// <summary>
    /// Search templates by name or description
    /// </summary>
    /// <param name="searchTerm">Search term</param>
    /// <returns>List of matching template DTOs</returns>
    Task<IEnumerable<BoardTemplateDTO>> SearchTemplatesAsync(string searchTerm);

    /// <summary>
    /// Get templates with specific tags
    /// </summary>
    /// <param name="tags">Comma-separated tags</param>
    /// <returns>List of templates matching tags</returns>
    Task<IEnumerable<BoardTemplateDTO>> GetTemplatesByTagsAsync(string tags);

    /// <summary>
    /// Get all available template categories
    /// </summary>
    /// <returns>List of distinct categories</returns>
    Task<IEnumerable<string>> GetCategoriesAsync();

    /// <summary>
    /// Create a new board template
    /// </summary>
    /// <param name="createDto">Template creation data</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Created template DTO</returns>
    Task<BoardTemplateDTO> CreateTemplateAsync(CreateBoardTemplateDTO createDto, int userId);

    /// <summary>
    /// Update an existing board template
    /// </summary>
    /// <param name="templateId">Template ID</param>
    /// <param name="updateDto">Template update data</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Updated template DTO</returns>
    Task<BoardTemplateDTO> UpdateTemplateAsync(int templateId, UpdateBoardTemplateDTO updateDto, int userId);

    /// <summary>
    /// Delete a board template
    /// </summary>
    /// <param name="templateId">Template ID</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>True if deleted successfully</returns>
    Task<bool> DeleteTemplateAsync(int templateId, int userId);

    /// <summary>
    /// Create a board from a template
    /// </summary>
    /// <param name="templateId">Template ID</param>
    /// <param name="boardName">New board name</param>
    /// <param name="boardDescription">New board description</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Created board DTO</returns>
    Task<BoardDTO> CreateBoardFromTemplateAsync(int templateId, string boardName, string? boardDescription, int userId);

    /// <summary>
    /// Save existing board as a template
    /// </summary>
    /// <param name="boardId">Source board ID</param>
    /// <param name="templateName">Template name</param>
    /// <param name="templateDescription">Template description</param>
    /// <param name="isPublic">Whether template should be public</param>
    /// <param name="category">Template category</param>
    /// <param name="tags">Template tags</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Created template DTO</returns>
    Task<BoardTemplateDTO> SaveBoardAsTemplateAsync(int boardId, string templateName, string? templateDescription, bool isPublic, string? category, string? tags, int userId);

    /// <summary>
    /// Duplicate an existing template
    /// </summary>
    /// <param name="templateId">Source template ID</param>
    /// <param name="newName">New template name</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Duplicated template DTO</returns>
    Task<BoardTemplateDTO> DuplicateTemplateAsync(int templateId, string newName, int userId);

    /// <summary>
    /// Add rating to a template
    /// </summary>
    /// <param name="templateId">Template ID</param>
    /// <param name="rating">Rating value (1-5)</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>True if rating added successfully</returns>
    Task<bool> RateTemplateAsync(int templateId, decimal rating, int userId);

    /// <summary>
    /// Get template usage statistics
    /// </summary>
    /// <param name="templateId">Template ID</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Template statistics DTO</returns>
    Task<TemplateStatisticsDTO> GetTemplateStatisticsAsync(int templateId, int userId);

    /// <summary>
    /// Get template marketplace analytics for admin users
    /// </summary>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Marketplace analytics DTO</returns>
    Task<TemplateMarketplaceAnalyticsDTO> GetMarketplaceAnalyticsAsync(int userId);

    /// <summary>
    /// Report a template for inappropriate content
    /// </summary>
    /// <param name="templateId">Template ID</param>
    /// <param name="reason">Report reason</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>True if report submitted successfully</returns>
    Task<bool> ReportTemplateAsync(int templateId, string reason, int userId);

    /// <summary>
    /// Check if user can edit template (owner or admin)
    /// </summary>
    /// <param name="templateId">Template ID</param>
    /// <param name="userId">User ID</param>
    /// <returns>True if user can edit</returns>
    Task<bool> CanUserEditTemplateAsync(int templateId, int userId);
} 