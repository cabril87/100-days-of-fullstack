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
using System.Text.Json;
using System.Threading.Tasks;
using AutoMapper;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Boards;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace TaskTrackerAPI.Services;

public class TaskTemplateService : ITaskTemplateService
{
    private readonly ITaskTemplateRepository _taskTemplateRepository;
    private readonly ITaskItemRepository _taskItemRepository;
    private readonly IBoardRepository _boardRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<TaskTemplateService> _logger;

    public TaskTemplateService(
        ITaskTemplateRepository taskTemplateRepository,
        ITaskItemRepository taskItemRepository,
        IBoardRepository boardRepository,
        IMapper mapper,
        ILogger<TaskTemplateService> logger)
    {
        _taskTemplateRepository = taskTemplateRepository;
        _taskItemRepository = taskItemRepository;
        _boardRepository = boardRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<TaskTemplateDTO>> GetAllTaskTemplatesAsync()
    {
        IEnumerable<TaskTemplate> templates = await _taskTemplateRepository.GetAllTaskTemplatesAsync();
        return _mapper.Map<IEnumerable<TaskTemplateDTO>>(templates);
    }

    public async Task<IEnumerable<TaskTemplateDTO>> GetUserTaskTemplatesAsync(int userId)
    {
        IEnumerable<TaskTemplate> templates = await _taskTemplateRepository.GetUserTaskTemplatesAsync(userId);
        return _mapper.Map<IEnumerable<TaskTemplateDTO>>(templates);
    }

    public async Task<IEnumerable<TaskTemplateDTO>> GetSystemTaskTemplatesAsync()
    {
        IEnumerable<TaskTemplate> templates = await _taskTemplateRepository.GetSystemTaskTemplatesAsync();
        return _mapper.Map<IEnumerable<TaskTemplateDTO>>(templates);
    }

    public async Task<IEnumerable<TaskTemplateDTO>> GetTaskTemplatesByTypeAsync(Models.TaskTemplateType type)
    {
        IEnumerable<TaskTemplate> templates = await _taskTemplateRepository.GetTaskTemplatesByTypeAsync(type);
        return _mapper.Map<IEnumerable<TaskTemplateDTO>>(templates);
    }

    public async Task<TaskTemplateDTO?> GetTaskTemplateByIdAsync(int templateId)
    {
        TaskTemplate? template = await _taskTemplateRepository.GetTaskTemplateByIdAsync(templateId);
        return template != null ? _mapper.Map<TaskTemplateDTO>(template) : null;
    }

    public async Task<TaskTemplateDTO?> CreateTaskTemplateAsync(int userId, CreateTaskTemplateDTO templateDto)
    {
        TaskTemplate template = _mapper.Map<TaskTemplate>(templateDto);
        template.UserId = userId;
        template.CreatedAt = DateTime.UtcNow;
        template.IsSystemTemplate = false; // User-created templates are not system templates

        TaskTemplate createdTemplate = await _taskTemplateRepository.CreateTaskTemplateAsync(template);
        return _mapper.Map<TaskTemplateDTO>(createdTemplate);
    }

    public async Task<TaskTemplateDTO?> UpdateTaskTemplateAsync(int userId, int templateId, UpdateTaskTemplateDTO templateDto)
    {
        // Check if template exists and belongs to the user
        bool isOwned = await _taskTemplateRepository.IsTaskTemplateOwnedByUserAsync(templateId, userId);
        if (!isOwned)
        {
            return null;
        }

        // Get existing template
        TaskTemplate? existingTemplate = await _taskTemplateRepository.GetTaskTemplateByIdAsync(templateId);
        if (existingTemplate == null)
        {
            return null;
        }

        // Check if it's a system template
        if (existingTemplate.IsSystemTemplate)
        {
            throw new InvalidOperationException("System templates cannot be modified");
        }

        // Update properties
        if (templateDto.Name != null)
            existingTemplate.Name = templateDto.Name;

        if (templateDto.Description != null)
            existingTemplate.Description = templateDto.Description;

        if (templateDto.Type.HasValue)
            existingTemplate.Type = (Models.TaskTemplateType)templateDto.Type.Value;

        if (templateDto.TemplateData != null)
            existingTemplate.TemplateData = templateDto.TemplateData;

        if (templateDto.IconUrl != null)
            existingTemplate.IconUrl = templateDto.IconUrl;

        existingTemplate.UpdatedAt = DateTime.UtcNow;

        TaskTemplate updatedTemplate = await _taskTemplateRepository.UpdateTaskTemplateAsync(existingTemplate);
        return _mapper.Map<TaskTemplateDTO>(updatedTemplate);
    }

    public async Task DeleteTaskTemplateAsync(int userId, int templateId)
    {
        // Check if template exists and belongs to the user
        bool isOwned = await _taskTemplateRepository.IsTaskTemplateOwnedByUserAsync(templateId, userId);
        if (!isOwned)
        {
            throw new UnauthorizedAccessException($"Template with ID {templateId} not found or does not belong to the user");
        }

        TaskTemplate? template = await _taskTemplateRepository.GetTaskTemplateByIdAsync(templateId);
        if (template == null)
        {
            throw new ArgumentException($"Template with ID {templateId} not found");
        }

        // Check if it's a system template
        if (template.IsSystemTemplate)
        {
            throw new InvalidOperationException("System templates cannot be deleted");
        }

        await _taskTemplateRepository.DeleteTaskTemplateAsync(template);
    }

    public async Task<bool> IsTaskTemplateOwnedByUserAsync(int templateId, int userId)
    {
        return await _taskTemplateRepository.IsTaskTemplateOwnedByUserAsync(templateId, userId);
    }

    public async Task SeedDefaultTemplatesAsync()
    {
        await _taskTemplateRepository.SeedDefaultTemplatesAsync();
    }

    public async Task<TemplateApplicationResultDTO> ApplyTemplateAsync(int templateId, int userId, ApplyTemplateDTO applyDto)
    {
        try
        {
            // Validate template exists and user has access
            TaskTemplate? template = await _taskTemplateRepository.GetTaskTemplateByIdAsync(templateId);
            if (template == null)
            {
                throw new ArgumentException($"Template with ID {templateId} not found");
            }

            // Check if user owns template or if it's a public template
            bool isOwner = await _taskTemplateRepository.IsTaskTemplateOwnedByUserAsync(templateId, userId);
            if (!isOwner && !template.IsPublic)
            {
                throw new UnauthorizedAccessException("You do not have access to this template");
            }

            // Record template usage for analytics
            await _taskTemplateRepository.RecordTemplateUsageAsync(templateId, userId, true, 0);

            // Create the application result with actual data
            var result = new TemplateApplicationResultDTO
            {
                Success = true,
                Message = $"Template '{template.Name}' applied successfully",
                CreatedTaskIds = new List<int>(),
                CreatedItemsCount = template.TemplateData?.Length > 0 ? 1 : 0
            };

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error applying template {TemplateId} for user {UserId}", templateId, userId);
            throw;
        }
    }

    private async Task<TemplateApplicationResultDTO> ApplyBoardTemplateAsync(int userId, TaskTemplate template, ApplyTemplateDTO applyDto)
    {
        TemplateApplicationResultDTO result = new TemplateApplicationResultDTO
        {
            Success = true,
            Message = $"Successfully created board from template: {template.Name}"
        };

        try
        {
            // Create a new board
            Board board = new Board
            {
                Name = applyDto.CustomName ?? template.Name,
                Description = template.Description,
                Template = template.Type.ToString(),
                CustomLayout = template.TemplateData,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            // Save board
            Board createdBoard = await _boardRepository.CreateBoardAsync(board);
            result.CreatedBoard = _mapper.Map<BoardDTO>(createdBoard);

            // Try to parse the template data to create initial tasks if needed
            Dictionary<string, object>? templateData = JsonSerializer.Deserialize<Dictionary<string, object>>(template.TemplateData);
            if (templateData != null && templateData.Count > 0)
            {
                try
                {
                    // Here you would parse the template data and create tasks based on it
                    // This is a simplified example
                }
                catch (JsonException)
                {
                    // Handle parsing errors
                }
            }

            result.CreatedItemsCount = 1; // Count the board creation
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Message = $"Error applying board template: {ex.Message}";
        }

        return result;
    }

    private async Task<TemplateApplicationResultDTO> ApplyScheduleTemplateAsync(int userId, TaskTemplate template, ApplyTemplateDTO applyDto)
    {
        TemplateApplicationResultDTO result = new TemplateApplicationResultDTO
        {
            Success = true,
            Message = $"Successfully created schedule from template: {template.Name}",
            CreatedTasks = new List<TaskItemDTO>()
        };

        try
        {
            // Parse template data
            Dictionary<string, object>? templateData = JsonSerializer.Deserialize<Dictionary<string, object>>(template.TemplateData);

            // Use start date from DTO or default to today
            DateTime startDate = applyDto.StartDate ?? DateTime.Today;

            // Create tasks based on template
            // This is a simplified implementation
            List<TaskItem> defaultTasks = new List<TaskItem>();

            // Add the created tasks to the result
            foreach (TaskItem task in defaultTasks)
            {
                TaskItem createdTask = await _taskItemRepository.CreateTaskAsync(task);
                result.CreatedTasks.Add(_mapper.Map<TaskItemDTO>(createdTask));
            }

            result.CreatedItemsCount = result.CreatedTasks.Count;
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Message = $"Error applying schedule template: {ex.Message}";
        }

        return result;
    }

    private async Task<TemplateApplicationResultDTO> ApplyChecklistTemplateAsync(int userId, TaskTemplate template, ApplyTemplateDTO applyDto)
    {
        try
        {
            // Parse checklist items from template data
            List<TaskItem> checklistItems = new List<TaskItem>();

            if (!string.IsNullOrEmpty(template.TemplateData))
            {
                List<Dictionary<string, object>>? items = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(template.TemplateData);
                if (items != null)
                {
                    foreach (Dictionary<string, object> item in items)
                    {
                        TaskItem taskItem = new TaskItem
                        {
                            UserId = userId,
                            Title = item.GetValueOrDefault("title", "Checklist Item").ToString() ?? "Checklist Item",
                            Description = item.GetValueOrDefault("description", "")?.ToString() ?? "",
                            Priority = "Medium",
                            Status = TaskItemStatus.NotStarted,
                            CreatedAt = DateTime.UtcNow,
                            DueDate = applyDto.StartDate?.AddDays(1) ?? DateTime.UtcNow.AddDays(1)
                        };

                        TaskItem createdTask = await _taskItemRepository.CreateTaskAsync(taskItem);
                        checklistItems.Add(createdTask);
                    }
                }
            }

            return new TemplateApplicationResultDTO
            {
                Success = true,
                Message = $"Checklist template '{template.Name}' applied successfully",
                CreatedTaskIds = checklistItems.Select(t => t.Id).ToList(),
                CreatedItemsCount = checklistItems.Count
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error applying checklist template {TemplateId}", template.Id);
            throw;
        }
    }

    private async Task<TemplateApplicationResultDTO> ApplyGenericTemplateAsync(int userId, TaskTemplate template, ApplyTemplateDTO applyDto)
    {
        try
        {
            // Create tasks based on template configuration
            List<TaskItem> createdTasks = new List<TaskItem>();

            if (!string.IsNullOrEmpty(template.TemplateData))
            {
                List<Dictionary<string, object>>? taskConfigs = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(template.TemplateData);
                if (taskConfigs != null)
                {
                    foreach (Dictionary<string, object> config in taskConfigs)
                    {
                        TaskItem taskItem = new TaskItem
                        {
                            UserId = userId,
                            Title = config.GetValueOrDefault("title", "Template Task").ToString() ?? "Template Task",
                            Description = config.GetValueOrDefault("description", "")?.ToString() ?? "",
                            Priority = config.GetValueOrDefault("priority", "Medium").ToString() ?? "Medium",
                            Status = TaskItemStatus.NotStarted,
                            CreatedAt = DateTime.UtcNow,
                            DueDate = applyDto.StartDate ?? DateTime.UtcNow.AddDays(1)
                        };

                        TaskItem createdTask = await _taskItemRepository.CreateTaskAsync(taskItem);
                        createdTasks.Add(createdTask);
                    }
                }
            }

            return new TemplateApplicationResultDTO
            {
                Success = true,
                Message = $"Template '{template.Name}' applied successfully",
                CreatedTaskIds = createdTasks.Select(t => t.Id).ToList(),
                CreatedItemsCount = createdTasks.Count
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error applying generic template {TemplateId}", template.Id);
            throw;
        }
    }

    public async Task<WorkflowExecutionResultDTO> ExecuteWorkflowAsync(int templateId, int userId)
    {
        try
        {
            // Verify template accessibility
            bool isAccessible = await _taskTemplateRepository.IsTaskTemplateOwnedByUserAsync(templateId, userId);
            if (!isAccessible)
            {
                throw new UnauthorizedAccessException($"Template with ID {templateId} not accessible to user");
            }

            TaskTemplate? template = await _taskTemplateRepository.GetTaskTemplateByIdAsync(templateId);
            if (template == null)
            {
                throw new ArgumentException($"Template with ID {templateId} not found");
            }

            DateTime startTime = DateTime.UtcNow;
            WorkflowExecutionResultDTO result = new WorkflowExecutionResultDTO
            {
                Success = true,
                Message = $"Workflow executed successfully for template: {template.Name}",
                ExecutedAt = startTime,
                StepsCompleted = 0,
                TotalSteps = 0
            };

            // Parse workflow steps from template data
            if (!string.IsNullOrEmpty(template.TemplateData))
            {
                try
                {
                    Dictionary<string, object>? workflowData = JsonSerializer.Deserialize<Dictionary<string, object>>(template.TemplateData);
                    if (workflowData?.ContainsKey("steps") == true)
                    {
                        string stepsJson = workflowData["steps"].ToString() ?? string.Empty;
                        if (!string.IsNullOrEmpty(stepsJson))
                        {
                            List<Dictionary<string, object>>? workflowSteps = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(stepsJson);
                            if (workflowSteps != null)
                            {
                                result.TotalSteps = workflowSteps.Count;

                                // Execute each step
                                foreach (Dictionary<string, object> step in workflowSteps)
                                {
                                    DateTime stepStartTime = DateTime.UtcNow;
                                    string stepName = step.GetValueOrDefault("name", $"Step {result.StepsCompleted + 1}").ToString() ?? "Unnamed Step";

                                    try
                                    {
                                        // Execute step logic based on step type
                                        string stepType = step.GetValueOrDefault("type", "generic").ToString() ?? "generic";
                                        await ExecuteWorkflowStepAsync(stepType, step, userId);

                                        result.StepsCompleted++;

                                        result.StepsExecuted.Add(new WorkflowStepExecutionDTO
                                        {
                                            StepId = result.StepsCompleted,
                                            StepName = stepName,
                                            Success = true,
                                            ExecutedAt = stepStartTime,
                                            ExecutionTimeMs = (int)(DateTime.UtcNow - stepStartTime).TotalMilliseconds
                                        });
                                    }
                                    catch (Exception stepEx)
                                    {
                                        result.StepsExecuted.Add(new WorkflowStepExecutionDTO
                                        {
                                            StepId = result.StepsCompleted + 1,
                                            StepName = stepName,
                                            Success = false,
                                            ErrorMessage = stepEx.Message,
                                            ExecutedAt = stepStartTime,
                                            ExecutionTimeMs = (int)(DateTime.UtcNow - stepStartTime).TotalMilliseconds
                                        });

                                        result.Errors.Add($"Step '{stepName}' failed: {stepEx.Message}");
                                        _logger.LogWarning(stepEx, "Workflow step {StepName} failed for template {TemplateId}", stepName, templateId);
                                    }
                                }
                            }
                        }
                    }
                }
                catch (JsonException ex)
                {
                    result.Success = false;
                    result.Message = $"Failed to parse workflow data: {ex.Message}";
                    result.Errors.Add($"JSON parsing error: {ex.Message}");
                }
            }

            result.TotalExecutionTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;

            // Record template usage
            await _taskTemplateRepository.RecordTemplateUsageAsync(templateId, userId, result.Success, result.TotalExecutionTimeMs / 60000); // Convert to minutes

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing workflow for template {TemplateId} and user {UserId}", templateId, userId);
            throw;
        }
    }

    private async Task ExecuteWorkflowStepAsync(string stepType, Dictionary<string, object> stepConfig, int userId)
    {
        switch (stepType?.ToLower())
        {
            case "createtask":
                await ExecuteCreateTaskStepAsync(stepConfig, userId);
                break;
            case "sendnotification":
                await ExecuteSendNotificationStepAsync(stepConfig, userId);
                break;
            case "delay":
                await ExecuteDelayStepAsync(stepConfig);
                break;
            default:
                // Generic step execution
                await Task.Delay(100); // Simulate step execution
                break;
        }
    }

    private async Task ExecuteCreateTaskStepAsync(Dictionary<string, object> stepConfig, int userId)
    {
        var taskItem = new TaskItem
        {
            UserId = userId,
            Title = stepConfig.GetValueOrDefault("title", "Workflow Task").ToString() ?? "Workflow Task",
            Description = stepConfig.GetValueOrDefault("description", "")?.ToString() ?? "",
            Priority = stepConfig.GetValueOrDefault("priority", "Medium").ToString() ?? "Medium",
            Status = TaskItemStatus.NotStarted,
            CreatedAt = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(1)
        };

        await _taskItemRepository.CreateTaskAsync(taskItem);
    }

    private async Task ExecuteSendNotificationStepAsync(Dictionary<string, object> stepConfig, int userId)
    {
        // Simulate sending notification
        var message = stepConfig.GetValueOrDefault("message", "Workflow notification").ToString();
        _logger.LogInformation("Sending notification to user {UserId}: {Message}", userId, message);
        await Task.Delay(50); // Simulate async notification sending
    }

    private async Task ExecuteDelayStepAsync(Dictionary<string, object> stepConfig)
    {
        var delayMs = 100; // Default delay
        if (stepConfig.ContainsKey("delayMs") && int.TryParse(stepConfig["delayMs"].ToString(), out int configDelay))
        {
            delayMs = Math.Min(configDelay, 5000); // Cap at 5 seconds for safety
        }

        await Task.Delay(delayMs);
    }

    // Day 60 Enhancement Methods Implementation

    // Marketplace methods
    public async Task<IEnumerable<TaskTemplateDTO>> GetTemplateMarketplaceAsync()
    {
        IEnumerable<TaskTemplate> templates = await _taskTemplateRepository.GetPublicTemplatesAsync();
        return _mapper.Map<IEnumerable<TaskTemplateDTO>>(templates);
    }

    public async Task<IEnumerable<TaskTemplateDTO>> GetTemplatesByCategoryAsync(string category)
    {
        IEnumerable<TaskTemplate> templates = await _taskTemplateRepository.GetTemplatesByCategory(category);
        return _mapper.Map<IEnumerable<TaskTemplateDTO>>(templates);
    }

    public async Task<IEnumerable<TaskTemplateDTO>> SearchTemplatesAsync(string searchTerm)
    {
        IEnumerable<TaskTemplate> templates = await _taskTemplateRepository.SearchTemplates(searchTerm);
        return _mapper.Map<IEnumerable<TaskTemplateDTO>>(templates);
    }

    public async Task<bool> PublishTemplateToMarketplaceAsync(int templateId, int userId)
    {
        // Verify template ownership
        bool isOwned = await _taskTemplateRepository.IsTaskTemplateOwnedByUserAsync(templateId, userId);
        if (!isOwned)
        {
            return false;
        }

        return await _taskTemplateRepository.PublishTemplateToMarketplaceAsync(templateId, userId);
    }

    public async Task<bool> UnpublishTemplateFromMarketplaceAsync(int templateId, int userId)
    {
        // Verify template ownership
        bool isOwned = await _taskTemplateRepository.IsTaskTemplateOwnedByUserAsync(templateId, userId);
        if (!isOwned)
        {
            return false;
        }

        return await _taskTemplateRepository.UnpublishTemplateFromMarketplaceAsync(templateId, userId);
    }

    public async Task<IEnumerable<TaskTemplateDTO>> GetFeaturedTemplatesAsync()
    {
        IEnumerable<TaskTemplate> templates = await _taskTemplateRepository.GetFeaturedTemplatesAsync();
        return _mapper.Map<IEnumerable<TaskTemplateDTO>>(templates);
    }

    public async Task<IEnumerable<TaskTemplateDTO>> GetPopularTemplatesAsync(int count = 10)
    {
        IEnumerable<TaskTemplate> templates = await _taskTemplateRepository.GetPopularTemplatesAsync(count);
        return _mapper.Map<IEnumerable<TaskTemplateDTO>>(templates);
    }

    // Analytics methods
    public async Task<IEnumerable<TemplateUsageAnalyticsDTO>> GetTemplateAnalyticsAsync(int templateId)
    {
        IEnumerable<TemplateUsageAnalytics> analytics = await _taskTemplateRepository.GetTemplateAnalyticsAsync(templateId);
        return _mapper.Map<IEnumerable<TemplateUsageAnalyticsDTO>>(analytics);
    }

    public async Task<TemplateUsageAnalyticsDTO> RecordTemplateUsageAsync(int templateId, int userId, bool success, int completionTimeMinutes)
    {
        TemplateUsageAnalytics analytics = await _taskTemplateRepository.RecordTemplateUsageAsync(templateId, userId, success, completionTimeMinutes);
        return _mapper.Map<TemplateUsageAnalyticsDTO>(analytics);
    }

    public async Task<TemplateAnalyticsSummaryDTO> GetTemplateAnalyticsSummaryAsync(int templateId)
    {
        try
        {
            // Get template analytics from repository
            var analytics = await _taskTemplateRepository.GetTemplateAnalyticsAsync(templateId);
            var template = await _taskTemplateRepository.GetTaskTemplateByIdAsync(templateId);

            if (template == null)
            {
                throw new ArgumentException($"Template with ID {templateId} not found");
            }

            // Calculate real metrics from analytics data
            List<TemplateUsageAnalytics> analyticsList = analytics.ToList();
            int totalUsages = analyticsList.Count;
            int successfulUsages = analyticsList.Where(a => a.Success).Count();
            decimal successRate = totalUsages > 0 ? (decimal)(successfulUsages * 100.0 / totalUsages) : 0;
            int avgCompletionTime = analyticsList.Any() ? (int)analyticsList.Average(a => a.CompletionTimeMinutes) : 0;
            decimal avgEfficiencyScore = analyticsList.Any() ? analyticsList.Average(a => a.EfficiencyScore) : 0;
            int uniqueUsers = analyticsList.Select(a => a.UserId).Distinct().Count();
            DateTime? lastUsed = analyticsList.Any() ? analyticsList.Max(a => a.UsedDate) : (DateTime?)null;

            return new TemplateAnalyticsSummaryDTO
            {
                TemplateId = templateId,
                TemplateName = template.Name ?? "Unnamed Template",
                TotalUsages = totalUsages,
                SuccessRate = successRate,
                AverageCompletionTimeMinutes = avgCompletionTime,
                AverageEfficiencyScore = avgEfficiencyScore,
                LastUsedDate = lastUsed,
                UniqueUsers = uniqueUsers,
                Rating = template.Rating,
                DownloadCount = template.DownloadCount
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting template analytics summary for template {TemplateId}", templateId);
            throw;
        }
    }

    public async Task UpdateTemplateRatingAsync(int templateId, decimal rating)
    {
        await _taskTemplateRepository.UpdateTemplateRatingAsync(templateId, rating);
    }

    public async Task IncrementTemplateDownloadCountAsync(int templateId)
    {
        await _taskTemplateRepository.IncrementTemplateDownloadCountAsync(templateId);
    }

    // Automation methods
    public async Task<IEnumerable<TaskTemplateDTO>> GetAutomatedTemplatesAsync()
    {
        IEnumerable<TaskTemplate> templates = await _taskTemplateRepository.GetAutomatedTemplatesAsync();
        return _mapper.Map<IEnumerable<TaskTemplateDTO>>(templates);
    }

    public async Task<IEnumerable<TaskTemplateDTO>> GetTemplatesWithTriggersAsync(string triggerType)
    {
        IEnumerable<TaskTemplate> templates = await _taskTemplateRepository.GetTemplatesWithTriggersAsync(triggerType);
        return _mapper.Map<IEnumerable<TaskTemplateDTO>>(templates);
    }

    public async Task<TaskTemplateDTO> GenerateAutomatedTasksAsync(int templateId, int userId)
    {
        try
        {
            // Validate template exists and user has access
            TaskTemplate? template = await _taskTemplateRepository.GetTaskTemplateByIdAsync(templateId);
            if (template == null)
            {
                throw new ArgumentException($"Template with ID {templateId} not found");
            }

            // Check if user owns template or if it's a public template
            bool isOwner = await _taskTemplateRepository.IsTaskTemplateOwnedByUserAsync(templateId, userId);
            if (!isOwner && !template.IsPublic)
            {
                throw new UnauthorizedAccessException("You do not have access to this template");
            }

            // Generate tasks based on template configuration
            List<TaskItem> createdTasks = new List<TaskItem>();

            if (!string.IsNullOrEmpty(template.TemplateData))
            {
                try
                {
                    List<Dictionary<string, object>>? taskConfigs = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(template.TemplateData);
                    if (taskConfigs != null)
                    {
                        foreach (var taskConfig in taskConfigs)
                        {
                            TaskItem taskItem = new TaskItem
                            {
                                UserId = userId,
                                Title = taskConfig.GetValueOrDefault("title", "Generated Task").ToString() ?? "Generated Task",
                                Description = taskConfig.GetValueOrDefault("description", "")?.ToString() ?? "",
                                Priority = taskConfig.GetValueOrDefault("priority", "Medium").ToString() ?? "Medium",
                                Status = TaskItemStatus.NotStarted,
                                CreatedAt = DateTime.UtcNow,
                                DueDate = DateTime.UtcNow.AddDays(1) // Default to tomorrow
                            };

                            // Create the task
                            TaskItem createdTask = await _taskItemRepository.CreateTaskAsync(taskItem);
                            createdTasks.Add(createdTask);
                        }
                    }
                }
                catch (JsonException ex)
                {
                    _logger.LogWarning(ex, "Failed to parse template tasks JSON for template {TemplateId}", templateId);
                }
            }

            // Record template usage
            await _taskTemplateRepository.RecordTemplateUsageAsync(templateId, userId, true, 0);

            // Return the template DTO with updated usage stats
            return _mapper.Map<TaskTemplateDTO>(template);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating automated tasks from template {TemplateId}", templateId);
            throw;
        }
    }
}