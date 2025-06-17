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
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories;

public class TaskTemplateRepository : ITaskTemplateRepository
{
    private readonly ApplicationDbContext _context;

    public TaskTemplateRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TaskTemplate>> GetAllTaskTemplatesAsync()
    {
        return await _context.TaskTemplates
            .OrderBy(t => t.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<TaskTemplate>> GetUserTaskTemplatesAsync(int userId)
    {
        return await _context.TaskTemplates
            .Where(t => t.UserId == userId || t.IsSystemTemplate)
            .OrderBy(t => t.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<TaskTemplate>> GetSystemTaskTemplatesAsync()
    {
        return await _context.TaskTemplates
            .Where(t => t.IsSystemTemplate)
            .OrderBy(t => t.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<TaskTemplate>> GetTaskTemplatesByTypeAsync(TaskTemplateType type)
    {
        return await _context.TaskTemplates
            .Where(t => t.Type == type)
            .OrderBy(t => t.Name)
            .ToListAsync();
    }

    public async Task<TaskTemplate?> GetTaskTemplateByIdAsync(int templateId)
    {
        return await _context.TaskTemplates
            .FirstOrDefaultAsync(t => t.Id == templateId);
    }

    public async Task<TaskTemplate> CreateTaskTemplateAsync(TaskTemplate template)
    {
        _context.TaskTemplates.Add(template);
        await _context.SaveChangesAsync();
        return template;
    }

    public async Task<TaskTemplate> UpdateTaskTemplateAsync(TaskTemplate template)
    {
        template.UpdatedAt = DateTime.UtcNow;
        _context.TaskTemplates.Update(template);
        await _context.SaveChangesAsync();
        return template;
    }

    public async Task DeleteTaskTemplateAsync(TaskTemplate template)
    {
        _context.TaskTemplates.Remove(template);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> IsTaskTemplateOwnedByUserAsync(int templateId, int userId)
    {
        TaskTemplate? template = await _context.TaskTemplates
            .FirstOrDefaultAsync(t => t.Id == templateId);

        if (template == null)
            return false;

        // System templates are accessible to all users
        if (template.IsSystemTemplate)
            return true;

        return template.UserId == userId;
    }

    public async Task SeedDefaultTemplatesAsync()
    {
        // Check if default templates already exist
        if (await _context.TaskTemplates.AnyAsync(t => t.IsSystemTemplate))
            return;

        // Use the comprehensive template seeding system
        var logger = Microsoft.Extensions.Logging.Abstractions.NullLogger.Instance;
        await TaskTrackerAPI.Data.SeedData.TemplateSeedData.SeedTemplatesAsync(_context, logger);
    }

    public Task<TaskItem?> GetSharedTaskByIdAsync(int taskId)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<TaskItem>> GetTasksAssignedToFamilyMemberAsync(int familyMemberId)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<TaskItem>> GetFamilyTasksAsync(int familyId)
    {
        throw new NotImplementedException();
    }

    public Task<bool> AssignTaskToFamilyMemberAsync(int taskId, int familyMemberId, int assignedByUserId, bool requiresApproval)
    {
        throw new NotImplementedException();
    }

    public Task<bool> UnassignTaskFromFamilyMemberAsync(int taskId)
    {
        throw new NotImplementedException();
    }

    public Task<bool> ApproveTaskAsync(int taskId, int approverUserId, string? comment)
    {
        throw new NotImplementedException();
    }

    public Task<bool> IsUserFamilyTaskOwnerAsync(int taskId, int userId)
    {
        throw new NotImplementedException();
    }

    // Day 60 Enhancement Methods Implementation
    
    // Marketplace methods
    public async Task<IEnumerable<TaskTemplate>> GetPublicTemplatesAsync()
    {
        return await _context.TaskTemplates
            .Where(t => t.IsPublic)
            .OrderByDescending(t => t.DownloadCount)
            .ThenByDescending(t => t.Rating)
            .ToListAsync();
    }

    public async Task<IEnumerable<TaskTemplate>> GetTemplatesByCategory(string category)
    {
        return await _context.TaskTemplates
            .Where(t => t.Category == category && (t.IsPublic || t.IsSystemTemplate))
            .OrderBy(t => t.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<TaskTemplate>> SearchTemplates(string searchTerm)
    {
        return await _context.TaskTemplates
            .Where(t => (t.IsPublic || t.IsSystemTemplate) && 
                       (t.Name.Contains(searchTerm) || 
                        t.Description.Contains(searchTerm) ||
                        (t.MarketplaceDescription != null && t.MarketplaceDescription.Contains(searchTerm))))
            .OrderBy(t => t.Name)
            .ToListAsync();
    }

    public async Task<bool> PublishTemplateToMarketplaceAsync(int templateId, int userId)
    {
        TaskTemplate? template = await _context.TaskTemplates
            .FirstOrDefaultAsync(t => t.Id == templateId && t.UserId == userId);
            
        if (template == null)
            return false;
            
        template.IsPublic = true;
        template.PublishedDate = DateTime.UtcNow;
        template.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UnpublishTemplateFromMarketplaceAsync(int templateId, int userId)
    {
        TaskTemplate? template = await _context.TaskTemplates
            .FirstOrDefaultAsync(t => t.Id == templateId && t.UserId == userId);
            
        if (template == null)
            return false;
            
        template.IsPublic = false;
        template.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<TaskTemplate>> GetFeaturedTemplatesAsync()
    {
        return await _context.TaskTemplates
            .Where(t => t.IsPublic && t.Rating >= 4.0m)
            .OrderByDescending(t => t.Rating)
            .ThenByDescending(t => t.DownloadCount)
            .Take(10)
            .ToListAsync();
    }

    public async Task<IEnumerable<TaskTemplate>> GetPopularTemplatesAsync(int count = 10)
    {
        return await _context.TaskTemplates
            .Where(t => t.IsPublic)
            .OrderByDescending(t => t.DownloadCount)
            .ThenByDescending(t => t.UsageCount)
            .Take(count)
            .ToListAsync();
    }
    
    // Analytics methods
    public async Task<TemplateUsageAnalytics> RecordTemplateUsageAsync(int templateId, int userId, bool success, int completionTimeMinutes)
    {
        TemplateUsageAnalytics analytics = new TemplateUsageAnalytics
        {
            TemplateId = templateId,
            UserId = userId,
            UsedAt = DateTime.UtcNow,
            Success = success,
            CompletionTimeMinutes = completionTimeMinutes
        };
        
        _context.TemplateUsageAnalytics.Add(analytics);
        
        // Update template statistics
        TaskTemplate? template = await _context.TaskTemplates.FindAsync(templateId);
        if (template != null)
        {
            template.UsageCount++;
            template.LastUsedDate = DateTime.UtcNow;
            
            // Recalculate success rate
            IEnumerable<TemplateUsageAnalytics> allUsages = await _context.TemplateUsageAnalytics
                .Where(a => a.TemplateId == templateId)
                .ToListAsync();
            
            int totalUsages = allUsages.Count() + 1;
            int successfulUsages = allUsages.Count(a => a.Success) + (success ? 1 : 0);
            template.SuccessRate = totalUsages > 0 ? (decimal)successfulUsages / totalUsages * 100 : 0;
            
            // Update average completion time
            IEnumerable<int> completionTimes = allUsages
                .Where(a => a.CompletionTimeMinutes > 0)
                .Select(a => a.CompletionTimeMinutes)
                .Concat(new[] { completionTimeMinutes });
            template.AverageCompletionTimeMinutes = completionTimes.Any() ? (int)completionTimes.Average() : 0;
        }
        
        await _context.SaveChangesAsync();
        return analytics;
    }

    public async Task<IEnumerable<TemplateUsageAnalytics>> GetTemplateAnalyticsAsync(int templateId)
    {
        return await _context.TemplateUsageAnalytics
            .Where(a => a.TemplateId == templateId)
            .OrderByDescending(a => a.UsedAt)
            .ToListAsync();
    }

    public async Task<decimal> GetTemplateSuccessRateAsync(int templateId)
    {
        IEnumerable<TemplateUsageAnalytics> analytics = await _context.TemplateUsageAnalytics
            .Where(a => a.TemplateId == templateId)
            .ToListAsync();
            
        if (!analytics.Any())
            return 0;
            
        int successfulUsages = analytics.Count(a => a.Success);
        return (decimal)successfulUsages / analytics.Count() * 100;
    }

    public async Task<int> GetTemplateUsageCountAsync(int templateId)
    {
        return await _context.TemplateUsageAnalytics
            .CountAsync(a => a.TemplateId == templateId);
    }

    public async Task UpdateTemplateRatingAsync(int templateId, decimal rating)
    {
        TaskTemplate? template = await _context.TaskTemplates.FindAsync(templateId);
        if (template != null)
        {
            template.Rating = rating;
            template.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task IncrementTemplateDownloadCountAsync(int templateId)
    {
        TaskTemplate? template = await _context.TaskTemplates.FindAsync(templateId);
        if (template != null)
        {
            template.DownloadCount++;
            template.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
    
    // Automation methods
    public async Task<IEnumerable<TaskTemplate>> GetAutomatedTemplatesAsync()
    {
        return await _context.TaskTemplates
            .Where(t => t.IsAutomated)
            .OrderBy(t => t.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<TaskTemplate>> GetTemplatesWithTriggersAsync(string triggerType)
    {
        return await _context.TaskTemplates
            .Where(t => t.IsAutomated && t.TriggerConditions != null && t.TriggerConditions.Contains(triggerType))
            .OrderBy(t => t.Name)
            .ToListAsync();
    }

    // Template Purchase methods
    public async Task<bool> HasUserPurchasedTemplateAsync(int userId, int templateId)
    {
        return await _context.TemplatePurchases
            .AnyAsync(tp => tp.UserId == userId && tp.TemplateId == templateId);
    }

    public async Task<TemplatePurchase> CreateTemplatePurchaseAsync(TemplatePurchase purchase)
    {
        _context.TemplatePurchases.Add(purchase);
        await _context.SaveChangesAsync();
        return purchase;
    }

    public async Task<List<TemplatePurchase>> GetUserTemplatePurchasesAsync(int userId)
    {
        return await _context.TemplatePurchases
            .Where(tp => tp.UserId == userId)
            .Include(tp => tp.Template)
            .OrderByDescending(tp => tp.PurchasedAt)
            .ToListAsync();
    }

    public async Task<bool> UpdateTemplatePurchaseCountAsync(int templateId)
    {
        TaskTemplate? template = await _context.TaskTemplates.FindAsync(templateId);
        if (template != null)
        {
            template.PurchaseCount++;
            template.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }
        return false;
    }
} 