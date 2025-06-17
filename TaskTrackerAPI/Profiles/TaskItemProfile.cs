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
using AutoMapper;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;
using System.Linq;
using System.Collections.Generic;

namespace TaskTrackerAPI.Profiles
{
    public class TaskItemProfile : Profile
    {
        public TaskItemProfile()
        {
            // TaskItem -> TaskItemDTO
            CreateMap<TaskItem, TaskItemDTO>()
                .ForMember(dest => dest.CategoryName, opt => 
                    opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty))
                .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => ConvertPriorityToInt(src.Priority)))
                .ForMember(dest => dest.Tags, opt => opt.MapFrom(src => 
                    src.TaskTags != null ? src.TaskTags.Where(tt => tt.Tag != null).Select(tt => new TagDto
                    {
                        Id = tt.Tag!.Id,
                        Name = tt.Tag!.Name,
                        Color = "#6366f1" // Default color since Tag model doesn't have Color
                    }).ToList() : new List<TagDto>()))
                .ForMember(dest => dest.TagIds, opt => opt.MapFrom(src => 
                    src.TaskTags != null ? src.TaskTags.Select(tt => tt.TagId).ToList() : new List<int>()));
            
            // TaskItem -> TaskItemResponseDTO (for API responses)
            CreateMap<TaskItem, TaskItemResponseDTO>()
                .ForMember(dest => dest.CategoryName, opt => 
                    opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty))
                .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => ConvertPriorityToInt(src.Priority)))
                .ForMember(dest => dest.Tags, opt => opt.MapFrom(src => 
                    src.TaskTags != null ? src.TaskTags.Where(tt => tt.Tag != null).Select(tt => new TagDto
                    {
                        Id = tt.Tag!.Id,
                        Name = tt.Tag!.Name,
                        Color = "#6366f1" // Default color since Tag model doesn't have Color
                    }).ToList() : new List<TagDto>()));
            
            // TaskItemDTO -> TaskItemResponseDTO
            CreateMap<TaskItemDTO, TaskItemResponseDTO>();
            
            // TaskItem -> TaskItemDetailResponseDTO
            CreateMap<TaskItem, TaskItemDetailResponseDTO>()
                .ForMember(dest => dest.Task, opt => opt.MapFrom(src => src));
            
            // TaskItemCreateRequestDTO -> TaskItemDTO (V2 to V1 compatibility)
            CreateMap<TaskItemCreateRequestDTO, TaskItemDTO>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CompletedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CategoryName, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.BoardId, opt => opt.Ignore())
                .ForMember(dest => dest.Tags, opt => opt.Ignore())
                .ForMember(dest => dest.AssignedToName, opt => opt.Ignore())
                .ForMember(dest => dest.Version, opt => opt.Ignore())
                // Convert string priority to int for backward compatibility
                .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => ConvertPriorityStringToInt(src.Priority)))
                // Handle date string to DateTime conversion
                .ForMember(dest => dest.DueDate, opt => opt.MapFrom(src => ConvertDateString(src.DueDate ?? "")))
                // Map EstimatedTimeMinutes correctly
                .ForMember(dest => dest.EstimatedTimeMinutes, opt => opt.MapFrom(src => src.EstimatedTimeMinutes))
                // Map new fields from frontend
                .ForMember(dest => dest.FamilyId, opt => opt.MapFrom(src => src.FamilyId))
                .ForMember(dest => dest.AssignedToUserId, opt => opt.MapFrom(src => src.AssignedToUserId))
                .ForMember(dest => dest.PointsValue, opt => opt.MapFrom(src => src.PointsValue));

            // QuickTaskDTO -> TaskItemDTO  
            CreateMap<QuickTaskDTO, TaskItemDTO>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CompletedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CategoryName, opt => opt.Ignore())
                .ForMember(dest => dest.CategoryId, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.BoardId, opt => opt.Ignore())
                .ForMember(dest => dest.TagIds, opt => opt.Ignore())
                .ForMember(dest => dest.Tags, opt => opt.Ignore())
                .ForMember(dest => dest.EstimatedMinutes, opt => opt.Ignore())
                .ForMember(dest => dest.ActualMinutes, opt => opt.Ignore())
                .ForMember(dest => dest.EstimatedTimeMinutes, opt => opt.Ignore())
                .ForMember(dest => dest.ActualTimeSpentMinutes, opt => opt.Ignore())
                .ForMember(dest => dest.ProgressPercentage, opt => opt.MapFrom(src => 0))
                .ForMember(dest => dest.IsStarred, opt => opt.MapFrom(src => false))
                .ForMember(dest => dest.IsRecurring, opt => opt.MapFrom(src => false))
                .ForMember(dest => dest.RecurrencePattern, opt => opt.Ignore())
                .ForMember(dest => dest.RecurringPattern, opt => opt.Ignore())
                .ForMember(dest => dest.Version, opt => opt.MapFrom(src => 1))
                .ForMember(dest => dest.AssignedToName, opt => opt.Ignore())
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Title))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
                .ForMember(dest => dest.DueDate, opt => opt.MapFrom(src => src.DueDate))
                .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => src.Priority ?? 1))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => TaskItemStatus.NotStarted));
            
            // TaskItemCreateRequestDTO -> TaskItem
            CreateMap<TaskItemCreateRequestDTO, TaskItem>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CompletedAt, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.AssignedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.AssignedToFamilyMember, opt => opt.Ignore())
                .ForMember(dest => dest.ApprovedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => src.Priority))
                .ForMember(dest => dest.Family, opt => opt.Ignore())
                .ForMember(dest => dest.EstimatedTimeMinutes, opt => opt.MapFrom(src => src.EstimatedTimeMinutes))
                .ForMember(dest => dest.ActualTimeSpentMinutes, opt => opt.MapFrom(src => 0))
                .ForMember(dest => dest.ProgressPercentage, opt => opt.MapFrom(src => 0))
                .ForMember(dest => dest.RecurringPattern, opt => opt.MapFrom(src => src.RecurrencePattern))
                .ForMember(dest => dest.ChecklistItems, opt => opt.Ignore())
                .ForMember(dest => dest.Board, opt => opt.Ignore())
                .ForMember(dest => dest.AssignedTo, opt => opt.Ignore())
                .ForMember(dest => dest.AssignedToName, opt => opt.Ignore())
                .ForMember(dest => dest.IsCompleted, opt => opt.MapFrom(src => src.Status.ToString() == "Completed"))
                .ForMember(dest => dest.Version, opt => opt.MapFrom(src => 1))
                .ForMember(dest => dest.AssignedToId, opt => opt.Ignore())
                .ForMember(dest => dest.AssignedToFamilyMemberId, opt => opt.Ignore())
                .ForMember(dest => dest.LastRecurrence, opt => opt.Ignore())
                .ForMember(dest => dest.NextRecurrence, opt => opt.Ignore())
                .ForMember(dest => dest.AssignedByUserId, opt => opt.Ignore())
                .ForMember(dest => dest.FamilyId, opt => opt.Ignore())
                .ForMember(dest => dest.RequiresApproval, opt => opt.MapFrom(src => false))
                .ForMember(dest => dest.ApprovedByUserId, opt => opt.Ignore())
                .ForMember(dest => dest.ApprovedAt, opt => opt.Ignore())
                .ForMember(dest => dest.BoardColumn, opt => opt.Ignore())
                .ForMember(dest => dest.BoardOrder, opt => opt.Ignore())
                .ForMember(dest => dest.PositionX, opt => opt.Ignore())
                .ForMember(dest => dest.PositionY, opt => opt.Ignore());
            
            // TaskItemUpdateRequestDTO -> TaskItem
            CreateMap<TaskItemUpdateRequestDTO, TaskItem>()
                .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => 
                    src.Priority.HasValue ? ConvertIntToStringPriority(src.Priority.Value) : null))
                .ForMember(dest => dest.EstimatedTimeMinutes, opt => opt.MapFrom(src => src.EstimatedMinutes))
                .ForMember(dest => dest.ActualTimeSpentMinutes, opt => opt.MapFrom(src => src.ActualMinutes))
                .ForMember(dest => dest.RecurringPattern, opt => opt.MapFrom(src => src.RecurrencePattern))
                .ForMember(dest => dest.IsCompleted, opt => opt.MapFrom(src => 
                    src.Status.HasValue ? src.Status.Value.ToString() == "Completed" : (bool?)null))
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }

        private int ConvertPriorityToInt(string priority)
        {
            // Handle null or empty
            if (string.IsNullOrEmpty(priority))
                return 1; // Default to Medium
            
            // First try to parse as integer (if already stored as "0", "1", "2", "3")
            if (int.TryParse(priority, out int numericPriority))
            {
                // Clamp to valid range
                return Math.Max(0, Math.Min(3, numericPriority));
            }
            
            // Then try to parse as string
            switch (priority.ToLower())
            {
                case "critical":
                case "urgent":
                case "3":
                    return 3;
                case "high":
                case "2":
                    return 2;
                case "medium":
                case "1":
                    return 1;
                case "low":
                case "0":
                    return 0;
                default:
                    return 1; // Default to Medium
            }
        }

        private string ConvertIntToStringPriority(int priority)
        {
            switch (priority)
            {
                case 3:
                    return "Critical";
                case 2:
                    return "High";
                case 1:
                    return "Medium";
                case 0:
                    return "Low";
                default:
                    return "Medium";
            }
        }

        private int ConvertPriorityStringToInt(string priority)
        {
            switch (priority?.ToLower())
            {
                case "critical":
                    return 3;
                case "high":
                    return 2;
                case "medium":
                    return 1;
                case "low":
                    return 0;
                default:
                    return 1;
            }
        }

        private DateTime? ConvertDateString(string dateString)
        {
            if (string.IsNullOrEmpty(dateString))
                return null;
            return DateTime.Parse(dateString);
        }
    }
} 
