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
using AutoMapper;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;
using System;

namespace TaskTrackerAPI.Profiles;

public class TaskTemplateProfile : Profile
{
    public TaskTemplateProfile()
    {
        // TaskTemplate mappings
        CreateMap<TaskTemplate, TaskTemplateDTO>()
            .ForMember(dest => dest.CreatedByUserId, opt => opt.MapFrom(src => src.UserId))
            .ForMember(dest => dest.Tags, opt => opt.Ignore())
            .ForMember(dest => dest.ChecklistItems, opt => opt.Ignore())
            .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.Price))
            .ForMember(dest => dest.IsPremium, opt => opt.MapFrom(src => src.IsPremium))
            .ForMember(dest => dest.IsPublic, opt => opt.MapFrom(src => src.IsPublic))
            .ForMember(dest => dest.ValueProposition, opt => opt.MapFrom(src => src.ValueProposition))
            .ForMember(dest => dest.Prerequisites, opt => opt.MapFrom(src => src.Prerequisites))
            .ForMember(dest => dest.SuccessStories, opt => opt.MapFrom(src => src.SuccessStories))
            .ForMember(dest => dest.PurchaseCount, opt => opt.MapFrom(src => src.PurchaseCount))
            .ForMember(dest => dest.SuccessRate, opt => opt.MapFrom(src => src.SuccessRate))
            .ForMember(dest => dest.Rating, opt => opt.MapFrom(src => src.Rating))
            .ForMember(dest => dest.DownloadCount, opt => opt.MapFrom(src => src.DownloadCount));

        CreateMap<CreateTaskTemplateDTO, TaskTemplate>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.ChecklistItems, opt => opt.Ignore())
            .ForMember(dest => dest.AutomationRulesCollection, opt => opt.Ignore())
            .ForMember(dest => dest.UsageAnalytics, opt => opt.Ignore())
            .ForMember(dest => dest.WorkflowStepsCollection, opt => opt.Ignore());

        CreateMap<UpdateTaskTemplateDTO, TaskTemplate>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.ChecklistItems, opt => opt.Ignore())
            .ForMember(dest => dest.AutomationRulesCollection, opt => opt.Ignore())
            .ForMember(dest => dest.UsageAnalytics, opt => opt.Ignore())
            .ForMember(dest => dest.WorkflowStepsCollection, opt => opt.Ignore())
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // Automation Rule mappings
        CreateMap<TaskAutomationRule, AutomationRuleDTO>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.TemplateId, opt => opt.MapFrom(src => src.TemplateId))
            .ForMember(dest => dest.TriggerType, opt => opt.MapFrom(src => src.TriggerType))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
            .ForMember(dest => dest.Conditions, opt => opt.MapFrom(src => src.Conditions))
            .ForMember(dest => dest.Actions, opt => opt.MapFrom(src => src.Actions))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
            .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => src.Priority))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt));

        CreateMap<CreateAutomationRuleDTO, TaskAutomationRule>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Template, opt => opt.Ignore());

        // Workflow Step mappings
        CreateMap<WorkflowStep, WorkflowStepDTO>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.TemplateId, opt => opt.MapFrom(src => src.TemplateId))
            .ForMember(dest => dest.StepOrder, opt => opt.MapFrom(src => src.StepOrder))
            .ForMember(dest => dest.StepType, opt => opt.MapFrom(src => src.StepType))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
            .ForMember(dest => dest.Configuration, opt => opt.MapFrom(src => src.Configuration))
            .ForMember(dest => dest.Conditions, opt => opt.MapFrom(src => src.Conditions))
            .ForMember(dest => dest.IsRequired, opt => opt.MapFrom(src => src.IsRequired))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt));

        CreateMap<CreateWorkflowStepDTO, WorkflowStep>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Template, opt => opt.Ignore());

        // Template Usage Analytics mappings
        CreateMap<TemplateUsageAnalytics, TemplateUsageAnalyticsDTO>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.TemplateId, opt => opt.MapFrom(src => src.TemplateId))
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
            .ForMember(dest => dest.UsedDate, opt => opt.MapFrom(src => src.UsedDate))
            .ForMember(dest => dest.CompletionTimeMinutes, opt => opt.MapFrom(src => src.CompletionTimeMinutes))
            .ForMember(dest => dest.Success, opt => opt.MapFrom(src => src.Success));
    }
} 