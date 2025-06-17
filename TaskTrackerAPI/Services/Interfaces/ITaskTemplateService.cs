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
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.DTOs.Analytics;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces;

public interface ITaskTemplateService
{
    Task<IEnumerable<TaskTemplateDTO>> GetAllTaskTemplatesAsync();
    Task<IEnumerable<TaskTemplateDTO>> GetUserTaskTemplatesAsync(int userId);
    Task<IEnumerable<TaskTemplateDTO>> GetSystemTaskTemplatesAsync();
    Task<IEnumerable<TaskTemplateDTO>> GetTaskTemplatesByTypeAsync(Models.TaskTemplateType type);
    Task<TaskTemplateDTO?> GetTaskTemplateByIdAsync(int templateId);
    Task<TaskTemplateDTO?> CreateTaskTemplateAsync(int userId, CreateTaskTemplateDTO templateDto);
    Task<TaskTemplateDTO?> UpdateTaskTemplateAsync(int userId, int templateId, UpdateTaskTemplateDTO templateDto);
    Task DeleteTaskTemplateAsync(int userId, int templateId);
    Task<bool> IsTaskTemplateOwnedByUserAsync(int templateId, int userId);
    Task SeedDefaultTemplatesAsync();
    Task<TemplateApplicationResultDTO> ApplyTemplateAsync(int userId, int templateId, ApplyTemplateDTO applyDto);
    
    // Day 60 Enhancement Methods
    
    // Marketplace methods
    Task<IEnumerable<TaskTemplateDTO>> GetTemplateMarketplaceAsync();
    Task<IEnumerable<TaskTemplateDTO>> GetTemplatesByCategoryAsync(string category);
    Task<IEnumerable<TaskTemplateDTO>> SearchTemplatesAsync(string searchTerm);
    Task<bool> PublishTemplateToMarketplaceAsync(int templateId, int userId);
    Task<bool> UnpublishTemplateFromMarketplaceAsync(int templateId, int userId);
    Task<IEnumerable<TaskTemplateDTO>> GetFeaturedTemplatesAsync();
    Task<IEnumerable<TaskTemplateDTO>> GetPopularTemplatesAsync(int count = 10);
    
    // Analytics methods
    Task<TemplateUsageRecordDTO> RecordTemplateUsageAsync(int templateId, int userId, bool success, int completionTimeMinutes);
    Task<IEnumerable<TemplateUsageRecordDTO>> GetTemplateAnalyticsAsync(int templateId);
    Task<TemplateAnalyticsSummaryDTO> GetTemplateAnalyticsSummaryAsync(int templateId);
    Task UpdateTemplateRatingAsync(int templateId, decimal rating);
    Task IncrementTemplateDownloadCountAsync(int templateId);
    
    // Automation methods
    Task<IEnumerable<TaskTemplateDTO>> GetAutomatedTemplatesAsync();
    Task<IEnumerable<TaskTemplateDTO>> GetTemplatesWithTriggersAsync(string triggerType);
    Task<TaskTemplateDTO> GenerateAutomatedTasksAsync(int templateId, int userId);
    Task<WorkflowExecutionResultDTO> ExecuteWorkflowAsync(int templateId, int userId);
} 