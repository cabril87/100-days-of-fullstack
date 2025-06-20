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
using AutoMapper;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Models.Security;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.DTOs.Tags;
using TaskTrackerAPI.DTOs.Categories;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.DTOs.Security;


// Clean aliases for enum mappings
using ModelTaskItemStatus = TaskTrackerAPI.Models.TaskItemStatus;
using DtoTaskItemStatus = TaskTrackerAPI.DTOs.Tasks.TaskItemStatusDTO;
using ModelUserRole = TaskTrackerAPI.Models.UserRole;
using DtoUserRole = TaskTrackerAPI.DTOs.Auth.UserRoleDTO;
using ModelNotificationType = TaskTrackerAPI.Models.NotificationType;
using DtoNotificationType = TaskTrackerAPI.DTOs.Notifications.NotificationTypeDTO;
using ModelFamilyMemberAgeGroup = TaskTrackerAPI.Models.FamilyMemberAgeGroup;
using DtoFamilyMemberAgeGroup = TaskTrackerAPI.DTOs.Family.FamilyMemberAgeGroupDTO;
using ModelFamilyRelationship = TaskTrackerAPI.Models.FamilyRelationship;
using DtoFamilyRelationship = TaskTrackerAPI.DTOs.Family.FamilyRelationshipDTO;
using ModelFamilyRelationshipType = TaskTrackerAPI.Models.FamilyRelationshipType;
using DtoFamilyRelationshipType = TaskTrackerAPI.DTOs.Family.FamilyRelationshipTypeDTO;
using ModelTaskPriority = TaskTrackerAPI.Models.TaskPriority;
using DtoTaskPriority = TaskTrackerAPI.DTOs.Tasks.TaskPriorityDTO;
using ModelNotificationPriority = TaskTrackerAPI.Models.NotificationPriority;
using DtoNotificationPriority = TaskTrackerAPI.DTOs.Notifications.NotificationPriorityDTO;
using ModelAttendeeResponse = TaskTrackerAPI.Models.AttendeeResponse;
using DtoAttendeeResponse = TaskTrackerAPI.DTOs.Family.AttendeeResponseDTO;
using ModelReminderMethod = TaskTrackerAPI.Models.ReminderMethod;
using DtoReminderMethod = TaskTrackerAPI.DTOs.Family.ReminderMethodDTO;
using ModelAvailabilityStatus = TaskTrackerAPI.Models.AvailabilityStatus;
using DtoAvailabilityStatus = TaskTrackerAPI.DTOs.Family.AvailabilityStatusDTO;
using ModelTaskTemplateType = TaskTrackerAPI.Models.TaskTemplateType;
using DtoTaskTemplateType = TaskTrackerAPI.DTOs.Tasks.TaskTemplateTypeDTO;


namespace TaskTrackerAPI.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // ===== ENUM CONVERSIONS =====
            // TaskItemStatus: Models ↔ DTOs
            CreateMap<ModelTaskItemStatus, DtoTaskItemStatus>();
            CreateMap<DtoTaskItemStatus, ModelTaskItemStatus>();
            
            // UserRole: Models ↔ DTOs  
            CreateMap<ModelUserRole, DtoUserRole>();
            CreateMap<DtoUserRole, ModelUserRole>();
            
            // NotificationType: Models ↔ DTOs
            CreateMap<ModelNotificationType, DtoNotificationType>();
            CreateMap<DtoNotificationType, ModelNotificationType>();
            
            // FamilyMemberAgeGroup: Models ↔ DTOs
            CreateMap<ModelFamilyMemberAgeGroup, DtoFamilyMemberAgeGroup>();
            CreateMap<DtoFamilyMemberAgeGroup, ModelFamilyMemberAgeGroup>();
            
            // FamilyRelationship: Models ↔ DTOs
            CreateMap<ModelFamilyRelationship, DtoFamilyRelationship>();
            CreateMap<DtoFamilyRelationship, ModelFamilyRelationship>();
            
            // FamilyRelationshipType: Models ↔ DTOs
            CreateMap<ModelFamilyRelationshipType, DtoFamilyRelationshipType>();
            CreateMap<DtoFamilyRelationshipType, ModelFamilyRelationshipType>();
            
            // TaskPriority: Models ↔ DTOs
            CreateMap<ModelTaskPriority, DtoTaskPriority>();
            CreateMap<DtoTaskPriority, ModelTaskPriority>();
            
            // NotificationPriority: Models ↔ DTOs
            CreateMap<ModelNotificationPriority, DtoNotificationPriority>();
            CreateMap<DtoNotificationPriority, ModelNotificationPriority>();
            
            // AttendeeResponse: Models ↔ DTOs
            CreateMap<ModelAttendeeResponse, DtoAttendeeResponse>();
            CreateMap<DtoAttendeeResponse, ModelAttendeeResponse>();
            
            // ReminderMethod: Models ↔ DTOs
            CreateMap<ModelReminderMethod, DtoReminderMethod>();
            CreateMap<DtoReminderMethod, ModelReminderMethod>();
            
            // AvailabilityStatus: Models ↔ DTOs
            CreateMap<ModelAvailabilityStatus, DtoAvailabilityStatus>();
            CreateMap<DtoAvailabilityStatus, ModelAvailabilityStatus>();
            
            // TaskTemplateType: Models ↔ DTOs
            CreateMap<ModelTaskTemplateType, DtoTaskTemplateType>();
            CreateMap<DtoTaskTemplateType, ModelTaskTemplateType>();
            
            // Map from TaskItem to TaskItemDTO (legacy)
            CreateMap<TaskItem, TaskItemDTO>()
                .ForMember(dest => dest.CategoryName, opt => 
                    opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty))
                .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => ConvertPriorityToInt(src.Priority)))
                .ForMember(dest => dest.AssignedToUserId, opt => opt.MapFrom(src => 
                    src.AssignedToFamilyMember != null ? src.AssignedToFamilyMember.UserId : (int?)null))
                .ForMember(dest => dest.AssignedToUserName, opt => opt.MapFrom(src => 
                    src.AssignedToFamilyMember != null && src.AssignedToFamilyMember.User != null ? 
                    src.AssignedToFamilyMember.User.FirstName ?? src.AssignedToFamilyMember.User.Username : null))
                .ForMember(dest => dest.Tags, opt => opt.MapFrom(src => 
                    src.TaskTags != null ? src.TaskTags.Where(tt => tt.Tag != null).Select(tt => new TagDto
                    {
                        Id = tt.Tag!.Id,
                        Name = tt.Tag!.Name,
                        Color = "#6366f1" // Default color since Tag model doesn't have Color
                    }).ToList() : new List<TagDto>()));
            
            // Map from TaskItem to TaskItemResponseDTO (new)
            CreateMap<TaskItem, TaskItemResponseDTO>()
                .ForMember(dest => dest.CategoryName, opt => 
                    opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty))
                .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => ConvertPriorityToInt(src.Priority)))
                .ForMember(dest => dest.AssignedToUserId, opt => opt.MapFrom(src => 
                    src.AssignedToFamilyMember != null ? src.AssignedToFamilyMember.UserId : (int?)null))
                .ForMember(dest => dest.AssignedToUserName, opt => opt.MapFrom(src => 
                    src.AssignedToFamilyMember != null && src.AssignedToFamilyMember.User != null ? 
                    src.AssignedToFamilyMember.User.FirstName ?? src.AssignedToFamilyMember.User.Username : null))
                .ForMember(dest => dest.Tags, opt => opt.MapFrom(src => 
                    src.TaskTags != null ? src.TaskTags.Where(tt => tt.Tag != null).Select(tt => new TagDto
                    {
                        Id = tt.Tag!.Id,
                        Name = tt.Tag!.Name,
                        Color = "#6366f1" // Default color since Tag model doesn't have Color
                    }).ToList() : new List<TagDto>()));
                
            // Map from TaskItemDTO to TaskItemResponseDTO
            CreateMap<TaskItemDTO, TaskItemResponseDTO>();
            
            // Map from Tag to TagDTO (legacy)
            CreateMap<Tag, TagDTO>();
            
            // Map from Category to CategoryDTO
            CreateMap<Category, CategoryDTO>();

            // Map from TaskItem to FamilyTaskItemDTO
            CreateMap<TaskItem, FamilyTaskItemDTO>()
                .ForMember(dest => dest.AssignedByUserName, opt => opt.MapFrom(src => 
                    src.AssignedByUser != null ? src.AssignedByUser.Username : null))
                .ForMember(dest => dest.AssignedToUserName, opt => opt.MapFrom(src => 
                    src.AssignedToFamilyMember != null ? src.AssignedToFamilyMember.User.Username : null))
                .ForMember(dest => dest.AssignedToName, opt => opt.MapFrom(src => 
                    src.AssignedToName != null ? src.AssignedToName : 
                    src.AssignedToFamilyMember != null && src.AssignedToFamilyMember.User != null ? 
                    src.AssignedToFamilyMember.User.Username : null))
                .ForMember(dest => dest.ApprovedByUserName, opt => opt.MapFrom(src => 
                    src.ApprovedByUser != null ? src.ApprovedByUser.Username : null))
                .ForMember(dest => dest.FamilyName, opt => opt.MapFrom(src => 
                    src.Family != null ? src.Family.Name : null))
                .ForMember(dest => dest.IsApproved, opt => opt.MapFrom(src => 
                    src.ApprovedByUserId.HasValue));

            // Security-related mappings
            CreateMap<SecurityMetrics, SecurityMetricDTO>();
            CreateMap<SecurityAuditLog, SecurityAuditLogDTO>();
            
            // Enhanced security mappings
            CreateMap<FailedLoginAttempt, FailedLoginAttemptDTO>();
            CreateMap<UserSession, UserSessionDTO>()
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.Username : "Unknown"))
                .ForMember(dest => dest.DeviceId, opt => opt.MapFrom(src => 
                    $"{src.DeviceType ?? "Unknown"}_{src.Browser ?? "Unknown"}_{src.OperatingSystem ?? "Unknown"}".Replace(" ", "")))
                .ForMember(dest => dest.DeviceName, opt => opt.MapFrom(src => 
                    !string.IsNullOrEmpty(src.Browser) && !string.IsNullOrEmpty(src.OperatingSystem) 
                        ? $"{src.Browser} on {src.OperatingSystem}" : null))
                .ForMember(dest => dest.Location, opt => opt.MapFrom(src => 
                    !string.IsNullOrEmpty(src.City) && !string.IsNullOrEmpty(src.Country) 
                        ? $"{src.City}, {src.Country}" 
                        : src.Country))
                .ForMember(dest => dest.IsTrusted, opt => opt.MapFrom(src => !src.IsSuspicious))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt.ToString("O")))
                .ForMember(dest => dest.LastActivityAt, opt => opt.MapFrom(src => src.LastActivity.ToString("O")))
                .ForMember(dest => dest.ExpiresAt, opt => opt.MapFrom(src => src.ExpiresAt.HasValue ? src.ExpiresAt.Value.ToString("O") : ""))
                .ForMember(dest => dest.SessionDuration, opt => opt.MapFrom(src => 
                    src.IsActive ? DateTime.UtcNow - src.CreatedAt : 
                    (src.TerminatedAt ?? DateTime.UtcNow) - src.CreatedAt))
                .ForMember(dest => dest.IsCurrentSession, opt => opt.Ignore());
            
            // Advanced security mappings
            CreateMap<ThreatIntelligence, ThreatIntelligenceDTO>();


            // User Security Settings mappings
            CreateMap<UserSecuritySettings, UserSecuritySettingsDTO>();
            CreateMap<UserSecuritySettingsCreateDTO, UserSecuritySettings>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.DataExportRequestDate, opt => opt.Ignore())
                .ForMember(dest => dest.AccountDeletionRequest, opt => opt.Ignore())
                .ForMember(dest => dest.AccountDeletionRequestDate, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
        }

        private int ConvertPriorityToInt(string priority)
        {
            switch (priority?.ToLower())
            {
                case "critical":
                    return 4;
                case "high":
                    return 3;
                case "medium":
                    return 2;
                case "low":
                    return 1;
                default:
                    return 0;
            }
        }
    }
}