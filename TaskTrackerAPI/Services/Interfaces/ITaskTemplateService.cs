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
} 