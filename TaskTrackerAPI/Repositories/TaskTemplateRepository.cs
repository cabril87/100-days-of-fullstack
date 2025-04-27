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

        // Create the default templates

        // 1. Kanban Board Template
        TaskTemplate kanbanTemplate = new TaskTemplate
        {
            Name = "Kanban Board",
            Description = "A standard kanban board with To Do, In Progress, and Done columns",
            Type = TaskTemplateType.Kanban,
            TemplateData = @"{
                ""columns"": [
                    { ""id"": 1, ""name"": ""To Do"", ""status"": ""ToDo"" },
                    { ""id"": 2, ""name"": ""In Progress"", ""status"": ""InProgress"" },
                    { ""id"": 3, ""name"": ""Done"", ""status"": ""Completed"" }
                ]
            }",
            IsSystemTemplate = true,
            IconUrl = "/images/templates/kanban.png",
            CreatedAt = DateTime.UtcNow
        };

        // 2. Project Management Template
        TaskTemplate projectTemplate = new TaskTemplate
        {
            Name = "Project Management",
            Description = "Project management board with Backlog, To Do, In Progress, Testing, and Done columns",
            Type = TaskTemplateType.ProjectBoard,
            TemplateData = @"{
                ""columns"": [
                    { ""id"": 1, ""name"": ""Backlog"", ""status"": ""Pending"" },
                    { ""id"": 2, ""name"": ""To Do"", ""status"": ""ToDo"" },
                    { ""id"": 3, ""name"": ""In Progress"", ""status"": ""InProgress"" },
                    { ""id"": 4, ""name"": ""Testing"", ""status"": ""OnHold"" },
                    { ""id"": 5, ""name"": ""Done"", ""status"": ""Completed"" }
                ]
            }",
            IsSystemTemplate = true,
            IconUrl = "/images/templates/project.png",
            CreatedAt = DateTime.UtcNow
        };

        // 3. Daily Tasks Template
        TaskTemplate dailyTemplate = new TaskTemplate
        {
            Name = "Daily Tasks",
            Description = "Morning, Afternoon, and Evening task organization",
            Type = TaskTemplateType.Daily,
            TemplateData = @"{
                ""sections"": [
                    { ""id"": 1, ""name"": ""Morning"", ""timeRange"": ""6:00 AM - 12:00 PM"" },
                    { ""id"": 2, ""name"": ""Afternoon"", ""timeRange"": ""12:00 PM - 6:00 PM"" },
                    { ""id"": 3, ""name"": ""Evening"", ""timeRange"": ""6:00 PM - 11:00 PM"" }
                ],
                ""defaultTasks"": [
                    { ""title"": ""Breakfast"", ""sectionId"": 1 },
                    { ""title"": ""Lunch"", ""sectionId"": 2 },
                    { ""title"": ""Dinner"", ""sectionId"": 3 }
                ]
            }",
            IsSystemTemplate = true,
            IconUrl = "/images/templates/daily.png",
            CreatedAt = DateTime.UtcNow
        };

        // Add more default templates as needed

        _context.TaskTemplates.AddRange(kanbanTemplate, projectTemplate, dailyTemplate);
        await _context.SaveChangesAsync();
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

} 