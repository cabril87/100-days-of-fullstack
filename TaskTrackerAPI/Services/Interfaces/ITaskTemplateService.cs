using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces;

public interface ITaskTemplateService
{
    Task<IEnumerable<TaskTemplateDTO>> GetAllTaskTemplatesAsync();
    Task<IEnumerable<TaskTemplateDTO>> GetUserTaskTemplatesAsync(int userId);
    Task<IEnumerable<TaskTemplateDTO>> GetSystemTaskTemplatesAsync();
    Task<IEnumerable<TaskTemplateDTO>> GetTaskTemplatesByTypeAsync(TaskTemplateType type);
    Task<TaskTemplateDTO?> GetTaskTemplateByIdAsync(int templateId);
    Task<TaskTemplateDTO?> CreateTaskTemplateAsync(int userId, CreateTaskTemplateDTO templateDto);
    Task<TaskTemplateDTO?> UpdateTaskTemplateAsync(int userId, int templateId, UpdateTaskTemplateDTO templateDto);
    Task DeleteTaskTemplateAsync(int userId, int templateId);
    Task<bool> IsTaskTemplateOwnedByUserAsync(int templateId, int userId);
    Task SeedDefaultTemplatesAsync();
    Task<TemplateApplicationResultDTO> ApplyTemplateAsync(int userId, int templateId, ApplyTemplateDTO applyDto);
} 