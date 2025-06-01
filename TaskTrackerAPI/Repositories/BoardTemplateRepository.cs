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
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories;

/// <summary>
/// Repository implementation for BoardTemplate entity operations
/// Uses explicit typing and follows established repository patterns
/// </summary>
public class BoardTemplateRepository : IBoardTemplateRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<BoardTemplateRepository> _logger;

    public BoardTemplateRepository(ApplicationDbContext context, ILogger<BoardTemplateRepository> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardTemplate>> GetPublicTemplatesAsync()
    {
        try
        {
            _logger.LogInformation("Getting public board templates");

            List<BoardTemplate> templates = await _context.BoardTemplates
                .Include(t => t.CreatedBy)
                .Include(t => t.DefaultColumns)
                .Where(t => t.IsPublic)
                .OrderByDescending(t => t.UsageCount)
                .ThenBy(t => t.Name)
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} public board templates", templates.Count);
            return templates;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting public board templates");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardTemplate>> GetTemplatesByUserAsync(int userId)
    {
        try
        {
            _logger.LogInformation("Getting board templates for user {UserId}", userId);

            List<BoardTemplate> templates = await _context.BoardTemplates
                .Include(t => t.CreatedBy)
                .Include(t => t.DefaultColumns)
                .Where(t => t.CreatedByUserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} board templates for user {UserId}", templates.Count, userId);
            return templates;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting board templates for user {UserId}", userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardTemplate?> GetTemplateByIdAsync(int id)
    {
        try
        {
            _logger.LogInformation("Getting board template by ID {TemplateId}", id);

            BoardTemplate? template = await _context.BoardTemplates
                .Include(t => t.CreatedBy)
                .Include(t => t.DefaultColumns)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (template != null)
            {
                _logger.LogInformation("Found board template {TemplateId}: {TemplateName}", id, template.Name);
            }
            else
            {
                _logger.LogWarning("Board template {TemplateId} not found", id);
            }

            return template;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting board template {TemplateId}", id);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardTemplate>> GetTemplatesByCategoryAsync(string category)
    {
        try
        {
            _logger.LogInformation("Getting board templates by category {Category}", category);

            List<BoardTemplate> templates = await _context.BoardTemplates
                .Include(t => t.CreatedBy)
                .Include(t => t.DefaultColumns)
                .Where(t => t.Category == category && t.IsPublic)
                .OrderByDescending(t => t.UsageCount)
                .ThenBy(t => t.Name)
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} board templates for category {Category}", templates.Count, category);
            return templates;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting board templates by category {Category}", category);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardTemplate>> GetDefaultTemplatesAsync()
    {
        try
        {
            _logger.LogInformation("Getting default board templates");

            List<BoardTemplate> templates = await _context.BoardTemplates
                .Include(t => t.CreatedBy)
                .Include(t => t.DefaultColumns)
                .Where(t => t.IsDefault)
                .OrderBy(t => t.Name)
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} default board templates", templates.Count);
            return templates;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting default board templates");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardTemplate>> GetPopularTemplatesAsync(int limit = 10)
    {
        try
        {
            _logger.LogInformation("Getting {Limit} most popular board templates", limit);

            List<BoardTemplate> templates = await _context.BoardTemplates
                .Include(t => t.CreatedBy)
                .Include(t => t.DefaultColumns)
                .Where(t => t.IsPublic)
                .OrderByDescending(t => t.UsageCount)
                .ThenByDescending(t => t.AverageRating)
                .Take(limit)
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} popular board templates", templates.Count);
            return templates;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting popular board templates");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardTemplate>> GetTopRatedTemplatesAsync(int limit = 10)
    {
        try
        {
            _logger.LogInformation("Getting {Limit} top-rated board templates", limit);

            List<BoardTemplate> templates = await _context.BoardTemplates
                .Include(t => t.CreatedBy)
                .Include(t => t.DefaultColumns)
                .Where(t => t.IsPublic && t.AverageRating.HasValue && t.RatingCount > 0)
                .OrderByDescending(t => t.AverageRating)
                .ThenByDescending(t => t.RatingCount)
                .Take(limit)
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} top-rated board templates", templates.Count);
            return templates;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting top-rated board templates");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardTemplate> CreateTemplateAsync(BoardTemplate template)
    {
        try
        {
            _logger.LogInformation("Creating board template {TemplateName}", template.Name);

            template.CreatedAt = DateTime.UtcNow;
            template.UpdatedAt = null;

            _context.BoardTemplates.Add(template);
            int result = await _context.SaveChangesAsync();

            if (result > 0)
            {
                _logger.LogInformation("Successfully created board template {TemplateId}: {TemplateName}", 
                    template.Id, template.Name);
            }
            else
            {
                _logger.LogWarning("Failed to create board template {TemplateName}", template.Name);
            }

            return template;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating board template {TemplateName}", template.Name);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardTemplate> UpdateTemplateAsync(BoardTemplate template)
    {
        try
        {
            _logger.LogInformation("Updating board template {TemplateId}: {TemplateName}", 
                template.Id, template.Name);

            template.UpdatedAt = DateTime.UtcNow;

            _context.BoardTemplates.Update(template);
            int result = await _context.SaveChangesAsync();

            if (result > 0)
            {
                _logger.LogInformation("Successfully updated board template {TemplateId}: {TemplateName}", 
                    template.Id, template.Name);
            }
            else
            {
                _logger.LogWarning("Failed to update board template {TemplateId}: {TemplateName}", 
                    template.Id, template.Name);
            }

            return template;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating board template {TemplateId}: {TemplateName}", 
                template.Id, template.Name);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<bool> DeleteTemplateAsync(int id)
    {
        try
        {
            _logger.LogInformation("Deleting board template {TemplateId}", id);

            BoardTemplate? template = await _context.BoardTemplates
                .FirstOrDefaultAsync(t => t.Id == id);

            if (template == null)
            {
                _logger.LogWarning("Board template {TemplateId} not found for deletion", id);
                return false;
            }

            _context.BoardTemplates.Remove(template);
            int result = await _context.SaveChangesAsync();

            bool success = result > 0;
            if (success)
            {
                _logger.LogInformation("Successfully deleted board template {TemplateId}: {TemplateName}", 
                    id, template.Name);
            }
            else
            {
                _logger.LogWarning("Failed to delete board template {TemplateId}", id);
            }

            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting board template {TemplateId}", id);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<bool> IncrementUsageCountAsync(int id)
    {
        try
        {
            _logger.LogInformation("Incrementing usage count for template {TemplateId}", id);

            BoardTemplate? template = await _context.BoardTemplates
                .FirstOrDefaultAsync(t => t.Id == id);

            if (template == null)
            {
                _logger.LogWarning("Board template {TemplateId} not found for usage increment", id);
                return false;
            }

            template.UsageCount++;
            template.UpdatedAt = DateTime.UtcNow;

            int result = await _context.SaveChangesAsync();
            bool success = result > 0;

            if (success)
            {
                _logger.LogInformation("Successfully incremented usage count for template {TemplateId} to {UsageCount}", 
                    id, template.UsageCount);
            }
            else
            {
                _logger.LogWarning("Failed to increment usage count for template {TemplateId}", id);
            }

            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error incrementing usage count for template {TemplateId}", id);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<bool> AddRatingAsync(int id, decimal rating)
    {
        try
        {
            _logger.LogInformation("Adding rating {Rating} to template {TemplateId}", rating, id);

            if (rating < 1 || rating > 5)
            {
                _logger.LogWarning("Invalid rating {Rating} for template {TemplateId}. Must be between 1 and 5", rating, id);
                return false;
            }

            BoardTemplate? template = await _context.BoardTemplates
                .FirstOrDefaultAsync(t => t.Id == id);

            if (template == null)
            {
                _logger.LogWarning("Board template {TemplateId} not found for rating", id);
                return false;
            }

            // Calculate new average rating
            decimal currentTotal = (template.AverageRating ?? 0) * template.RatingCount;
            decimal newTotal = currentTotal + rating;
            int newCount = template.RatingCount + 1;
            decimal newAverage = newTotal / newCount;

            template.AverageRating = Math.Round(newAverage, 2);
            template.RatingCount = newCount;
            template.UpdatedAt = DateTime.UtcNow;

            int result = await _context.SaveChangesAsync();
            bool success = result > 0;

            if (success)
            {
                _logger.LogInformation("Successfully added rating to template {TemplateId}. New average: {AverageRating} ({RatingCount} ratings)", 
                    id, template.AverageRating, template.RatingCount);
            }
            else
            {
                _logger.LogWarning("Failed to add rating to template {TemplateId}", id);
            }

            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding rating to template {TemplateId}", id);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<bool> CanUserEditTemplateAsync(int templateId, int userId)
    {
        try
        {
            _logger.LogInformation("Checking if user {UserId} can edit template {TemplateId}", userId, templateId);

            bool canEdit = await _context.BoardTemplates
                .AnyAsync(t => t.Id == templateId && t.CreatedByUserId == userId);

            _logger.LogInformation("User {UserId} can edit template {TemplateId}: {CanEdit}", userId, templateId, canEdit);
            return canEdit;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if user {UserId} can edit template {TemplateId}", userId, templateId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardTemplate>> SearchTemplatesAsync(string searchTerm)
    {
        try
        {
            _logger.LogInformation("Searching board templates with term: {SearchTerm}", searchTerm);

            string lowerSearchTerm = searchTerm.ToLower();

            List<BoardTemplate> templates = await _context.BoardTemplates
                .Include(t => t.CreatedBy)
                .Include(t => t.DefaultColumns)
                .Where(t => t.IsPublic && 
                           (t.Name.ToLower().Contains(lowerSearchTerm) || 
                            (t.Description != null && t.Description.ToLower().Contains(lowerSearchTerm))))
                .OrderByDescending(t => t.UsageCount)
                .ThenBy(t => t.Name)
                .ToListAsync();

            _logger.LogInformation("Found {Count} templates matching search term: {SearchTerm}", templates.Count, searchTerm);
            return templates;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching board templates with term: {SearchTerm}", searchTerm);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardTemplate>> GetTemplatesByTagsAsync(string tags)
    {
        try
        {
            _logger.LogInformation("Getting board templates with tags: {Tags}", tags);

            List<BoardTemplate> templates = await _context.BoardTemplates
                .Include(t => t.CreatedBy)
                .Include(t => t.DefaultColumns)
                .Where(t => t.IsPublic && t.Tags != null && t.Tags.Contains(tags))
                .OrderByDescending(t => t.UsageCount)
                .ThenBy(t => t.Name)
                .ToListAsync();

            _logger.LogInformation("Found {Count} templates with tags: {Tags}", templates.Count, tags);
            return templates;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting board templates with tags: {Tags}", tags);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<string>> GetCategoriesAsync()
    {
        try
        {
            _logger.LogInformation("Getting all board template categories");

            List<string> categories = await _context.BoardTemplates
                .Where(t => t.IsPublic && !string.IsNullOrEmpty(t.Category))
                .Select(t => t.Category!)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            _logger.LogInformation("Found {Count} board template categories", categories.Count);
            return categories;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting board template categories");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardTemplate?> GetTemplateWithColumnsAsync(int id)
    {
        try
        {
            _logger.LogInformation("Getting board template {TemplateId} with columns for board creation", id);

            BoardTemplate? template = await _context.BoardTemplates
                .Include(t => t.CreatedBy)
                .Include(t => t.DefaultColumns.OrderBy(c => c.Order))
                .FirstOrDefaultAsync(t => t.Id == id);

            if (template != null)
            {
                _logger.LogInformation("Retrieved template {TemplateId} with {ColumnCount} columns", 
                    id, template.DefaultColumns.Count);
            }
            else
            {
                _logger.LogWarning("Board template {TemplateId} not found for board creation", id);
            }

            return template;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting board template {TemplateId} with columns", id);
            throw;
        }
    }
} 