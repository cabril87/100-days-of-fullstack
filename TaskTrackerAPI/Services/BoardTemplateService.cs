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
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Boards;
using TaskTrackerAPI.DTOs.Analytics;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

/// <summary>
/// Service implementation for board template business logic
/// Uses explicit typing and comprehensive template marketplace functionality
/// </summary>
public class BoardTemplateService : IBoardTemplateService
{
    private readonly IBoardTemplateRepository _boardTemplateRepository;
    private readonly IBoardRepository _boardRepository;
    private readonly IBoardColumnRepository _boardColumnRepository;
    private readonly IBoardSettingsRepository _boardSettingsRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<BoardTemplateService> _logger;

    public BoardTemplateService(
        IBoardTemplateRepository boardTemplateRepository,
        IBoardRepository boardRepository,
        IBoardColumnRepository boardColumnRepository,
        IBoardSettingsRepository boardSettingsRepository,
        IUserRepository userRepository,
        IMapper mapper,
        ILogger<BoardTemplateService> logger)
    {
        _boardTemplateRepository = boardTemplateRepository ?? throw new ArgumentNullException(nameof(boardTemplateRepository));
        _boardRepository = boardRepository ?? throw new ArgumentNullException(nameof(boardRepository));
        _boardColumnRepository = boardColumnRepository ?? throw new ArgumentNullException(nameof(boardColumnRepository));
        _boardSettingsRepository = boardSettingsRepository ?? throw new ArgumentNullException(nameof(boardSettingsRepository));
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardTemplateDTO>> GetPublicTemplatesAsync()
    {
        try
        {
            _logger.LogInformation("Getting all public templates");

            IEnumerable<BoardTemplate> publicTemplates = await _boardTemplateRepository.GetPublicTemplatesAsync();
            List<BoardTemplateDTO> templateDtos = new List<BoardTemplateDTO>();

            foreach (BoardTemplate template in publicTemplates)
            {
                BoardTemplateDTO dto = _mapper.Map<BoardTemplateDTO>(template);
                templateDtos.Add(dto);
            }

            _logger.LogInformation("Retrieved {Count} public templates", templateDtos.Count);
            return templateDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting public templates");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardTemplateDTO>> GetUserTemplatesAsync(int userId)
    {
        try
        {
            _logger.LogInformation("Getting templates for user {UserId}", userId);

            IEnumerable<BoardTemplate> userTemplates = await _boardTemplateRepository.GetTemplatesByUserAsync(userId);
            List<BoardTemplateDTO> templateDtos = new List<BoardTemplateDTO>();

            foreach (BoardTemplate template in userTemplates)
            {
                BoardTemplateDTO dto = _mapper.Map<BoardTemplateDTO>(template);
                templateDtos.Add(dto);
            }

            _logger.LogInformation("Retrieved {Count} templates for user {UserId}", templateDtos.Count, userId);
            return templateDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting templates for user {UserId}", userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardTemplateDTO?> GetTemplateByIdAsync(int templateId, int userId)
    {
        try
        {
            _logger.LogInformation("Getting template {TemplateId} by user {UserId}", templateId, userId);

            BoardTemplate? template = await _boardTemplateRepository.GetTemplateWithColumnsAsync(templateId);
            if (template == null)
            {
                _logger.LogWarning("Template {TemplateId} not found", templateId);
                return null;
            }

            // Check if user can access template (public or owned by user)
            if (!template.IsPublic && template.CreatedByUserId != userId)
            {
                _logger.LogWarning("User {UserId} does not have access to private template {TemplateId}", userId, templateId);
                return null;
            }

            BoardTemplateDTO dto = _mapper.Map<BoardTemplateDTO>(template);

            _logger.LogInformation("Retrieved template {TemplateId}: {TemplateName}", templateId, template.Name);
            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting template {TemplateId} by user {UserId}", templateId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardTemplateDTO>> GetTemplatesByCategoryAsync(string category)
    {
        try
        {
            _logger.LogInformation("Getting templates by category {Category}", category);

            IEnumerable<BoardTemplate> categoryTemplates = await _boardTemplateRepository.GetTemplatesByCategoryAsync(category);
            List<BoardTemplateDTO> templateDtos = new List<BoardTemplateDTO>();

            foreach (BoardTemplate template in categoryTemplates)
            {
                BoardTemplateDTO dto = _mapper.Map<BoardTemplateDTO>(template);
                templateDtos.Add(dto);
            }

            _logger.LogInformation("Retrieved {Count} templates for category {Category}", templateDtos.Count, category);
            return templateDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting templates by category {Category}", category);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardTemplateDTO>> GetPopularTemplatesAsync(int limit = 10)
    {
        try
        {
            _logger.LogInformation("Getting top {Limit} popular templates", limit);

            IEnumerable<BoardTemplate> popularTemplates = await _boardTemplateRepository.GetPopularTemplatesAsync(limit);
            List<BoardTemplateDTO> templateDtos = new List<BoardTemplateDTO>();

            foreach (BoardTemplate template in popularTemplates)
            {
                BoardTemplateDTO dto = _mapper.Map<BoardTemplateDTO>(template);
                templateDtos.Add(dto);
            }

            _logger.LogInformation("Retrieved {Count} popular templates", templateDtos.Count);
            return templateDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting popular templates");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardTemplateDTO>> GetTopRatedTemplatesAsync(int limit = 10)
    {
        try
        {
            _logger.LogInformation("Getting top {Limit} rated templates", limit);

            IEnumerable<BoardTemplate> topRatedTemplates = await _boardTemplateRepository.GetTopRatedTemplatesAsync(limit);
            List<BoardTemplateDTO> templateDtos = new List<BoardTemplateDTO>();

            foreach (BoardTemplate template in topRatedTemplates)
            {
                BoardTemplateDTO dto = _mapper.Map<BoardTemplateDTO>(template);
                templateDtos.Add(dto);
            }

            _logger.LogInformation("Retrieved {Count} top-rated templates", templateDtos.Count);
            return templateDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting top-rated templates");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardTemplateDTO>> SearchTemplatesAsync(string searchTerm)
    {
        try
        {
            _logger.LogInformation("Searching templates with term {SearchTerm}", searchTerm);

            IEnumerable<BoardTemplate> searchResults = await _boardTemplateRepository.SearchTemplatesAsync(searchTerm);
            List<BoardTemplateDTO> templateDtos = new List<BoardTemplateDTO>();

            foreach (BoardTemplate template in searchResults)
            {
                BoardTemplateDTO dto = _mapper.Map<BoardTemplateDTO>(template);
                templateDtos.Add(dto);
            }

            _logger.LogInformation("Found {Count} templates matching search term {SearchTerm}", templateDtos.Count, searchTerm);
            return templateDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching templates with term {SearchTerm}", searchTerm);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardTemplateDTO>> GetTemplatesByTagsAsync(string tags)
    {
        try
        {
            _logger.LogInformation("Getting templates by tags {Tags}", tags);

            IEnumerable<BoardTemplate> taggedTemplates = await _boardTemplateRepository.GetTemplatesByTagsAsync(tags);
            List<BoardTemplateDTO> templateDtos = new List<BoardTemplateDTO>();

            foreach (BoardTemplate template in taggedTemplates)
            {
                BoardTemplateDTO dto = _mapper.Map<BoardTemplateDTO>(template);
                templateDtos.Add(dto);
            }

            _logger.LogInformation("Retrieved {Count} templates with tags {Tags}", templateDtos.Count, tags);
            return templateDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting templates by tags {Tags}", tags);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<string>> GetCategoriesAsync()
    {
        try
        {
            _logger.LogInformation("Getting all template categories");

            IEnumerable<string> categories = await _boardTemplateRepository.GetCategoriesAsync();
            List<string> categoryList = categories.ToList();

            _logger.LogInformation("Retrieved {Count} template categories", categoryList.Count);
            return categoryList;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting template categories");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardTemplateDTO> CreateTemplateAsync(CreateBoardTemplateDTO createDto, int userId)
    {
        try
        {
            _logger.LogInformation("Creating template {TemplateName} by user {UserId}", createDto.Name, userId);

            // Validate user exists
            await ValidateUserExistsAsync(userId);

            BoardTemplate template = new BoardTemplate
            {
                Name = createDto.Name,
                Description = createDto.Description,
                IsPublic = createDto.IsPublic,
                Category = createDto.Category,
                Tags = createDto.Tags,
                CreatedByUserId = userId,
                UsageCount = 0,
                AverageRating = null,
                RatingCount = 0,
                CreatedAt = DateTime.UtcNow
            };

            BoardTemplate createdTemplate = await _boardTemplateRepository.CreateTemplateAsync(template);

            // Create default columns if provided
            if (createDto.DefaultColumns.Any())
            {
                foreach (CreateBoardTemplateColumnDTO columnDto in createDto.DefaultColumns)
                {
                    BoardTemplateColumn templateColumn = new BoardTemplateColumn
                    {
                        BoardTemplateId = createdTemplate.Id,
                        Name = columnDto.Name,
                        Description = columnDto.Description,
                        Order = columnDto.Order,
                        TaskLimit = columnDto.TaskLimit,
                        Color = columnDto.Color,
                        Icon = columnDto.Icon,
                        IsDoneColumn = columnDto.IsDoneColumn,
                        MappedStatus = _mapper.Map<TaskItemStatus>(columnDto.MappedStatus)
                    };

                    // Note: Template columns don't have CreateTemplateColumnAsync in repository yet
                    // This would need to be added to the repository interface and implementation
                    // For now, we'll skip this step or handle it differently
                }
            }

            // Reload template with columns
            BoardTemplate? templateWithColumns = await _boardTemplateRepository.GetTemplateWithColumnsAsync(createdTemplate.Id);
            BoardTemplateDTO dto = _mapper.Map<BoardTemplateDTO>(templateWithColumns!);

            _logger.LogInformation("Successfully created template {TemplateId}: {TemplateName}", createdTemplate.Id, createdTemplate.Name);
            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating template {TemplateName} by user {UserId}", createDto.Name, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardTemplateDTO> UpdateTemplateAsync(int templateId, UpdateBoardTemplateDTO updateDto, int userId)
    {
        try
        {
            _logger.LogInformation("Updating template {TemplateId} by user {UserId}", templateId, userId);

            BoardTemplate? existingTemplate = await _boardTemplateRepository.GetTemplateByIdAsync(templateId);
            if (existingTemplate == null)
            {
                throw new InvalidOperationException($"Template {templateId} not found");
            }

            // Check if user can edit template
            bool canEdit = await CanUserEditTemplateAsync(templateId, userId);
            if (!canEdit)
            {
                throw new UnauthorizedAccessException($"User {userId} does not have permission to edit template {templateId}");
            }

            // Update properties
            if (!string.IsNullOrWhiteSpace(updateDto.Name))
                existingTemplate.Name = updateDto.Name;
            
            if (updateDto.Description != null)
                existingTemplate.Description = updateDto.Description;
            
            if (updateDto.IsPublic.HasValue)
                existingTemplate.IsPublic = updateDto.IsPublic.Value;
            
            if (updateDto.Category != null)
                existingTemplate.Category = updateDto.Category;
            
            if (updateDto.Tags != null)
                existingTemplate.Tags = updateDto.Tags;

            existingTemplate.UpdatedAt = DateTime.UtcNow;

            BoardTemplate updatedTemplate = await _boardTemplateRepository.UpdateTemplateAsync(existingTemplate);
            BoardTemplateDTO dto = _mapper.Map<BoardTemplateDTO>(updatedTemplate);

            _logger.LogInformation("Successfully updated template {TemplateId}: {TemplateName}", templateId, updatedTemplate.Name);
            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating template {TemplateId} by user {UserId}", templateId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<bool> DeleteTemplateAsync(int templateId, int userId)
    {
        try
        {
            _logger.LogInformation("Deleting template {TemplateId} by user {UserId}", templateId, userId);

            BoardTemplate? template = await _boardTemplateRepository.GetTemplateByIdAsync(templateId);
            if (template == null)
            {
                _logger.LogWarning("Template {TemplateId} not found for deletion", templateId);
                return false;
            }

            // Check if user can delete template
            bool canEdit = await CanUserEditTemplateAsync(templateId, userId);
            if (!canEdit)
            {
                throw new UnauthorizedAccessException($"User {userId} does not have permission to delete template {templateId}");
            }

            bool success = await _boardTemplateRepository.DeleteTemplateAsync(templateId);

            if (success)
            {
                _logger.LogInformation("Successfully deleted template {TemplateId}: {TemplateName}", templateId, template.Name);
            }

            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting template {TemplateId} by user {UserId}", templateId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardDTO> CreateBoardFromTemplateAsync(int templateId, string boardName, string? boardDescription, int userId)
    {
        try
        {
            _logger.LogInformation("Creating board {BoardName} from template {TemplateId} by user {UserId}", 
                boardName, templateId, userId);

            // Validate user exists
            await ValidateUserExistsAsync(userId);

            BoardTemplate? template = await _boardTemplateRepository.GetTemplateWithColumnsAsync(templateId);
            if (template == null)
            {
                throw new InvalidOperationException($"Template {templateId} not found");
            }

            // Check if user can access template
            if (!template.IsPublic && template.CreatedByUserId != userId)
            {
                throw new UnauthorizedAccessException($"User {userId} does not have access to template {templateId}");
            }

            // Create the board
            Board board = new Board
            {
                Name = boardName,
                Description = boardDescription ?? string.Empty,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            Board createdBoard = await _boardRepository.CreateBoardAsync(board);

            // Create board columns from template
            if (template.DefaultColumns.Any())
            {
                foreach (BoardTemplateColumn templateColumn in template.DefaultColumns.OrderBy(c => c.Order))
                {
                    BoardColumn column = new BoardColumn
                    {
                        BoardId = createdBoard.Id,
                        Name = templateColumn.Name,
                        Order = templateColumn.Order,
                        TaskLimit = templateColumn.TaskLimit,
                        Color = templateColumn.Color,
                        Icon = templateColumn.Icon,
                        IsHidden = false, // Default to visible
                        IsDoneColumn = templateColumn.IsDoneColumn,
                        MappedStatus = templateColumn.MappedStatus,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _boardColumnRepository.CreateColumnAsync(column);
                }
            }

            // Create default board settings
            await _boardSettingsRepository.CreateDefaultSettingsAsync(createdBoard.Id);

            // Update template usage count
            await _boardTemplateRepository.IncrementUsageCountAsync(templateId);

            BoardDTO dto = _mapper.Map<BoardDTO>(createdBoard);

            _logger.LogInformation("Successfully created board {BoardId}: {BoardName} from template {TemplateId}", 
                createdBoard.Id, boardName, templateId);

            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating board {BoardName} from template {TemplateId} by user {UserId}", 
                boardName, templateId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardTemplateDTO> SaveBoardAsTemplateAsync(int boardId, string templateName, string? templateDescription, bool isPublic, string? category, string? tags, int userId)
    {
        try
        {
            _logger.LogInformation("Saving board {BoardId} as template {TemplateName} by user {UserId}", 
                boardId, templateName, userId);

            // Verify user has access to board
            await ValidateBoardAccessAsync(boardId, userId);

            // Create the template
            BoardTemplate template = new BoardTemplate
            {
                Name = templateName,
                Description = templateDescription,
                IsPublic = isPublic,
                Category = category,
                Tags = tags,
                CreatedByUserId = userId,
                UsageCount = 0,
                AverageRating = null,
                RatingCount = 0,
                CreatedAt = DateTime.UtcNow
            };

            BoardTemplate createdTemplate = await _boardTemplateRepository.CreateTemplateAsync(template);

            // TODO: Copy board columns to template columns
            // This would require adding template column methods to the repository

            // Reload template with columns
            BoardTemplate? templateWithColumns = await _boardTemplateRepository.GetTemplateWithColumnsAsync(createdTemplate.Id);
            BoardTemplateDTO dto = _mapper.Map<BoardTemplateDTO>(templateWithColumns!);

            _logger.LogInformation("Successfully saved board {BoardId} as template {TemplateId}: {TemplateName}", 
                boardId, createdTemplate.Id, templateName);

            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving board {BoardId} as template {TemplateName} by user {UserId}", 
                boardId, templateName, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardTemplateDTO> DuplicateTemplateAsync(int templateId, string newName, int userId)
    {
        try
        {
            _logger.LogInformation("Duplicating template {TemplateId} with name {NewName} by user {UserId}", 
                templateId, newName, userId);

            BoardTemplate? sourceTemplate = await _boardTemplateRepository.GetTemplateWithColumnsAsync(templateId);
            if (sourceTemplate == null)
            {
                throw new InvalidOperationException($"Source template {templateId} not found");
            }

            // Check if user can access template
            if (!sourceTemplate.IsPublic && sourceTemplate.CreatedByUserId != userId)
            {
                throw new UnauthorizedAccessException($"User {userId} does not have access to template {templateId}");
            }

            // Create duplicate template
            BoardTemplate duplicateTemplate = new BoardTemplate
            {
                Name = newName,
                Description = sourceTemplate.Description,
                IsPublic = false, // Duplicates are private by default
                Category = sourceTemplate.Category,
                Tags = sourceTemplate.Tags,
                CreatedByUserId = userId,
                UsageCount = 0,
                AverageRating = null,
                RatingCount = 0,
                CreatedAt = DateTime.UtcNow
            };

            BoardTemplate createdTemplate = await _boardTemplateRepository.CreateTemplateAsync(duplicateTemplate);

            // TODO: Copy template columns
            // This would require adding template column methods to the repository

            // Reload template with columns
            BoardTemplate? templateWithColumns = await _boardTemplateRepository.GetTemplateWithColumnsAsync(createdTemplate.Id);
            BoardTemplateDTO dto = _mapper.Map<BoardTemplateDTO>(templateWithColumns!);

            _logger.LogInformation("Successfully duplicated template {SourceId} to {NewId}: {NewName}", 
                templateId, createdTemplate.Id, newName);

            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error duplicating template {TemplateId} by user {UserId}", templateId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<bool> RateTemplateAsync(int templateId, decimal rating, int userId)
    {
        try
        {
            _logger.LogInformation("Rating template {TemplateId} with {Rating} by user {UserId}", 
                templateId, rating, userId);

            // Validate rating range
            if (rating < 1 || rating > 5)
            {
                throw new ArgumentException("Rating must be between 1 and 5", nameof(rating));
            }

            BoardTemplate? template = await _boardTemplateRepository.GetTemplateByIdAsync(templateId);
            if (template == null)
            {
                throw new InvalidOperationException($"Template {templateId} not found");
            }

            // Check if user can access template
            if (!template.IsPublic && template.CreatedByUserId != userId)
            {
                throw new UnauthorizedAccessException($"User {userId} does not have access to template {templateId}");
            }

            // Don't allow users to rate their own templates
            if (template.CreatedByUserId == userId)
            {
                throw new InvalidOperationException("Users cannot rate their own templates");
            }

            bool success = await _boardTemplateRepository.AddRatingAsync(templateId, rating);

            if (success)
            {
                _logger.LogInformation("Successfully rated template {TemplateId} with {Rating} by user {UserId}", 
                    templateId, rating, userId);
            }

            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rating template {TemplateId} by user {UserId}", templateId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<TemplateStatisticsDTO> GetTemplateStatisticsAsync(int templateId, int userId)
    {
        try
        {
            _logger.LogInformation("Getting statistics for template {TemplateId} by user {UserId}", templateId, userId);

            BoardTemplate? template = await _boardTemplateRepository.GetTemplateByIdAsync(templateId);
            if (template == null)
            {
                throw new InvalidOperationException($"Template {templateId} not found");
            }

            // Check if user can access template
            if (!template.IsPublic && template.CreatedByUserId != userId)
            {
                throw new UnauthorizedAccessException($"User {userId} does not have access to template {templateId}");
            }

            TemplateStatisticsDTO stats = new TemplateStatisticsDTO
            {
                TemplateId = templateId,
                TemplateName = template.Name,
                UsageCount = template.UsageCount,
                AverageRating = template.AverageRating,
                RatingCount = template.RatingCount,
                CreatedAt = template.CreatedAt,
                LastUsed = null, // Property doesn't exist in model
                BoardsCreated = template.UsageCount // Simplified for now
            };

            _logger.LogInformation("Retrieved statistics for template {TemplateId}: {UsageCount} uses, {RatingCount} ratings", 
                templateId, stats.UsageCount, stats.RatingCount);

            return stats;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting statistics for template {TemplateId} by user {UserId}", templateId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<TemplateMarketplaceAnalyticsDTO> GetMarketplaceAnalyticsAsync(int userId)
    {
        try
        {
            _logger.LogInformation("Getting marketplace analytics by user {UserId}", userId);

            // Use existing methods to get templates
            IEnumerable<BoardTemplate> publicTemplates = await _boardTemplateRepository.GetPublicTemplatesAsync();
            IEnumerable<BoardTemplate> userTemplates = await _boardTemplateRepository.GetTemplatesByUserAsync(userId);
            
            List<BoardTemplate> allTemplates = publicTemplates.Union(userTemplates).ToList();

            TemplateMarketplaceAnalyticsDTO analytics = new TemplateMarketplaceAnalyticsDTO
            {
                TotalTemplates = allTemplates.Count,
                PublicTemplates = allTemplates.Count(t => t.IsPublic),
                PrivateTemplates = allTemplates.Count(t => !t.IsPublic),
                TotalUsages = allTemplates.Sum(t => t.UsageCount),
                AverageRating = (double)(allTemplates.Where(t => t.AverageRating.HasValue).DefaultIfEmpty().Average(t => t?.AverageRating) ?? 0)
            };

            // Get top templates
            List<BoardTemplate> topTemplatesList = allTemplates
                .OrderByDescending(t => t.UsageCount)
                .Take(10)
                .ToList();

            foreach (BoardTemplate template in topTemplatesList)
            {
                TemplateStatisticsDTO stat = new TemplateStatisticsDTO
                {
                    TemplateId = template.Id,
                    TemplateName = template.Name,
                    UsageCount = template.UsageCount,
                    AverageRating = template.AverageRating,
                    RatingCount = template.RatingCount,
                    CreatedAt = template.CreatedAt,
                    LastUsed = null, // Property doesn't exist in model
                    BoardsCreated = template.UsageCount
                };
                analytics.TopTemplates.Add(stat);
            }

            // Get templates by category
            Dictionary<string, int> categoryCounts = allTemplates
                .Where(t => !string.IsNullOrEmpty(t.Category))
                .GroupBy(t => t.Category!)
                .ToDictionary(g => g.Key, g => g.Count());
            
            analytics.TemplatesByCategory = categoryCounts;

            _logger.LogInformation("Retrieved marketplace analytics: {TotalTemplates} templates, {TotalUsages} total uses", 
                analytics.TotalTemplates, analytics.TotalUsages);

            return analytics;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting marketplace analytics by user {UserId}", userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<bool> ReportTemplateAsync(int templateId, string reason, int userId)
    {
        try
        {
            _logger.LogInformation("Reporting template {TemplateId} for reason {Reason} by user {UserId}", 
                templateId, reason, userId);

            BoardTemplate? template = await _boardTemplateRepository.GetTemplateByIdAsync(templateId);
            if (template == null)
            {
                throw new InvalidOperationException($"Template {templateId} not found");
            }

            // Don't allow users to report their own templates
            if (template.CreatedByUserId == userId)
            {
                throw new InvalidOperationException("Users cannot report their own templates");
            }

            // For now, just log the report (repository method doesn't exist yet)
            _logger.LogWarning("Template {TemplateId} reported by user {UserId} for reason: {Reason}", 
                templateId, userId, reason);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reporting template {TemplateId} by user {UserId}", templateId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<bool> CanUserEditTemplateAsync(int templateId, int userId)
    {
        try
        {
            _logger.LogInformation("Checking if user {UserId} can edit template {TemplateId}", userId, templateId);

            BoardTemplate? template = await _boardTemplateRepository.GetTemplateByIdAsync(templateId);
            if (template == null)
            {
                return false;
            }

            // User can edit if they own the template
            bool canEdit = template.CreatedByUserId == userId;

            // TODO: Add admin user check here when admin functionality is implemented
            // canEdit = canEdit || await _userRepository.IsAdminAsync(userId);

            _logger.LogInformation("User {UserId} can edit template {TemplateId}: {CanEdit}", userId, templateId, canEdit);
            return canEdit;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking edit permissions for template {TemplateId} by user {UserId}", templateId, userId);
            throw;
        }
    }

    #region Private Helper Methods

    private async Task ValidateUserExistsAsync(int userId)
    {
        User? user = await _userRepository.GetUserByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException($"User {userId} not found");
        }
    }

    private async Task ValidateBoardAccessAsync(int boardId, int userId)
    {
        Board? board = await _boardRepository.GetBoardByIdAsync(boardId);
        if (board == null)
        {
            throw new InvalidOperationException($"Board {boardId} not found");
        }

        if (board.UserId != userId)
        {
            throw new UnauthorizedAccessException($"User {userId} does not have access to board {boardId}");
        }
    }

    #endregion
} 