using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using AutoMapper;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Boards;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

public class TaskTemplateService : ITaskTemplateService
{
    private readonly ITaskTemplateRepository _taskTemplateRepository;
    private readonly ITaskItemRepository _taskItemRepository;
    private readonly IBoardRepository _boardRepository;
    private readonly IMapper _mapper;

    public TaskTemplateService(
        ITaskTemplateRepository taskTemplateRepository,
        ITaskItemRepository taskItemRepository,
        IBoardRepository boardRepository,
        IMapper mapper)
    {
        _taskTemplateRepository = taskTemplateRepository;
        _taskItemRepository = taskItemRepository;
        _boardRepository = boardRepository;
        _mapper = mapper;
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

    public async Task<TemplateApplicationResultDTO> ApplyTemplateAsync(int userId, int templateId, ApplyTemplateDTO applyDto)
    {
        // Check if template exists and is accessible to the user
        bool isAccessible = await _taskTemplateRepository.IsTaskTemplateOwnedByUserAsync(templateId, userId);
        if (!isAccessible)
        {
            throw new UnauthorizedAccessException($"Template with ID {templateId} not found or not accessible to the user");
        }

        // Get the template
        TaskTemplate? template = await _taskTemplateRepository.GetTaskTemplateByIdAsync(templateId);
        if (template == null)
        {
            throw new ArgumentException($"Template with ID {templateId} not found");
        }

        TemplateApplicationResultDTO result = new TemplateApplicationResultDTO
        {
            Success = true,
            Message = $"Successfully applied template: {template.Name}"
        };

        // Handle different template types
        switch (template.Type)
        {
            case Models.TaskTemplateType.Board:
            case Models.TaskTemplateType.Kanban:
            case Models.TaskTemplateType.ProjectBoard:
                result = await ApplyBoardTemplateAsync(userId, template, applyDto);
                break;
                
            case Models.TaskTemplateType.Daily:
            case Models.TaskTemplateType.Weekly:
            case Models.TaskTemplateType.Monthly:
                result = await ApplyScheduleTemplateAsync(userId, template, applyDto);
                break;
                
            case Models.TaskTemplateType.Checklist:
                result = await ApplyChecklistTemplateAsync(userId, template, applyDto);
                break;
                
            default:
                result = await ApplyGenericTemplateAsync(userId, template, applyDto);
                break;
        }

        return result;
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
        TemplateApplicationResultDTO result = new TemplateApplicationResultDTO
        {
            Success = true,
            Message = $"Successfully created checklist from template: {template.Name}",
            CreatedTasks = new List<TaskItemDTO>()
        };

        try
        {
            // Parse template data to get checklist items
            // This is a simplified implementation
            Dictionary<string, object>? templateData = JsonSerializer.Deserialize<Dictionary<string, object>>(template.TemplateData);
            
            // Create tasks based on checklist items
            // Add them to the result.CreatedTasks list
            
            // Example of adding an await operation:
            await Task.CompletedTask; // Placeholder for actual async operation
            
            result.CreatedItemsCount = result.CreatedTasks.Count;
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Message = $"Error applying checklist template: {ex.Message}";
        }

        return result;
    }

    private async Task<TemplateApplicationResultDTO> ApplyGenericTemplateAsync(int userId, TaskTemplate template, ApplyTemplateDTO applyDto)
    {
        TemplateApplicationResultDTO result = new TemplateApplicationResultDTO
        {
            Success = true,
            Message = $"Successfully applied template: {template.Name}",
            CreatedTasks = new List<TaskItemDTO>()
        };

        try
        {
            // Generic implementation for other template types
            // This is a placeholder
            
            // Example of adding an await operation:
            await Task.CompletedTask; // Placeholder for actual async operation
            
            result.CreatedItemsCount = result.CreatedTasks.Count;
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Message = $"Error applying template: {ex.Message}";
        }

        return result;
    }

    Task<IEnumerable<DTOs.Tasks.TaskTemplateDTO>> ITaskTemplateService.GetAllTaskTemplatesAsync()
    {
        throw new NotImplementedException();
    }

    Task<IEnumerable<DTOs.Tasks.TaskTemplateDTO>> ITaskTemplateService.GetUserTaskTemplatesAsync(int userId)
    {
        throw new NotImplementedException();
    }

    Task<IEnumerable<DTOs.Tasks.TaskTemplateDTO>> ITaskTemplateService.GetSystemTaskTemplatesAsync()
    {
        throw new NotImplementedException();
    }


    Task<DTOs.Tasks.TaskTemplateDTO?> ITaskTemplateService.GetTaskTemplateByIdAsync(int templateId)
    {
        throw new NotImplementedException();
    }



    Task<DTOs.Tasks.TaskTemplateDTO?> ITaskTemplateService.UpdateTaskTemplateAsync(int userId, int templateId, UpdateTaskTemplateDTO templateDto)
    {
        throw new NotImplementedException();
    }

} 