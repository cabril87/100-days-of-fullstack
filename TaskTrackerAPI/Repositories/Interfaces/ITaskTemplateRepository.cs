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

public interface ITaskTemplateRepository
{
    Task<IEnumerable<TaskTemplate>> GetAllTaskTemplatesAsync();
    Task<IEnumerable<TaskTemplate>> GetUserTaskTemplatesAsync(int userId);
    Task<IEnumerable<TaskTemplate>> GetSystemTaskTemplatesAsync();
    Task<IEnumerable<TaskTemplate>> GetTaskTemplatesByTypeAsync(TaskTemplateType type);
    Task<TaskTemplate?> GetTaskTemplateByIdAsync(int templateId);
    Task<TaskTemplate> CreateTaskTemplateAsync(TaskTemplate template);
    Task<TaskTemplate> UpdateTaskTemplateAsync(TaskTemplate template);
    Task DeleteTaskTemplateAsync(TaskTemplate template);
    Task<bool> IsTaskTemplateOwnedByUserAsync(int templateId, int userId);
    Task SeedDefaultTemplatesAsync();
    Task<TaskItem?> GetSharedTaskByIdAsync(int taskId);
    Task<IEnumerable<TaskItem>> GetTasksAssignedToFamilyMemberAsync(int familyMemberId);
    Task<IEnumerable<TaskItem>> GetFamilyTasksAsync(int familyId);
    Task<bool> AssignTaskToFamilyMemberAsync(int taskId, int familyMemberId, int assignedByUserId, bool requiresApproval);
    Task<bool> UnassignTaskFromFamilyMemberAsync(int taskId);
    Task<bool> ApproveTaskAsync(int taskId, int approverUserId, string? comment);
    Task<bool> IsUserFamilyTaskOwnerAsync(int taskId, int userId);
    
    // Day 60 Enhancement Methods
    
    // Marketplace methods
    Task<IEnumerable<TaskTemplate>> GetPublicTemplatesAsync();
    Task<IEnumerable<TaskTemplate>> GetTemplatesByCategory(string category);
    Task<IEnumerable<TaskTemplate>> SearchTemplates(string searchTerm);
    Task<bool> PublishTemplateToMarketplaceAsync(int templateId, int userId);
    Task<bool> UnpublishTemplateFromMarketplaceAsync(int templateId, int userId);
    Task<IEnumerable<TaskTemplate>> GetFeaturedTemplatesAsync();
    Task<IEnumerable<TaskTemplate>> GetPopularTemplatesAsync(int count = 10);
    
    // Analytics methods
    Task<TemplateUsageAnalytics> RecordTemplateUsageAsync(int templateId, int userId, bool success, int completionTimeMinutes);
    Task<IEnumerable<TemplateUsageAnalytics>> GetTemplateAnalyticsAsync(int templateId);
    Task<decimal> GetTemplateSuccessRateAsync(int templateId);
    Task<int> GetTemplateUsageCountAsync(int templateId);
    Task UpdateTemplateRatingAsync(int templateId, decimal rating);
    Task IncrementTemplateDownloadCountAsync(int templateId);
    
    // Automation methods
    Task<IEnumerable<TaskTemplate>> GetAutomatedTemplatesAsync();
    Task<IEnumerable<TaskTemplate>> GetTemplatesWithTriggersAsync(string triggerType);
    
    // Template Purchase methods
    Task<bool> HasUserPurchasedTemplateAsync(int userId, int templateId);
    Task<TemplatePurchase> CreateTemplatePurchaseAsync(TemplatePurchase purchase);
    Task<List<TemplatePurchase>> GetUserTemplatePurchasesAsync(int userId);
    Task<bool> UpdateTemplatePurchaseCountAsync(int templateId);
}