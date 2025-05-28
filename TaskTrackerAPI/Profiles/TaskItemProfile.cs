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
                .ForMember(dest => dest.Tags, opt => opt.Ignore());
            
            // TaskItem -> TaskItemResponseDTO (for API responses)
            CreateMap<TaskItem, TaskItemResponseDTO>()
                .ForMember(dest => dest.CategoryName, opt => 
                    opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty))
                .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => ConvertPriorityToInt(src.Priority)))
                .ForMember(dest => dest.Tags, opt => opt.Ignore());
            
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
                .ForMember(dest => dest.EstimatedTimeMinutes, opt => opt.MapFrom(src => src.EstimatedMinutes))
                .ForMember(dest => dest.ActualTimeSpentMinutes, opt => opt.Ignore())
                .ForMember(dest => dest.ProgressPercentage, opt => opt.MapFrom(src => 0))
                .ForMember(dest => dest.RecurringPattern, opt => opt.MapFrom(src => src.RecurrencePattern))
                .ForMember(dest => dest.Version, opt => opt.MapFrom(src => 1))
                .ForMember(dest => dest.AssignedToName, opt => opt.Ignore());

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
                .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => ConvertIntToStringPriority(src.Priority)))
                .ForMember(dest => dest.Family, opt => opt.Ignore())
                .ForMember(dest => dest.EstimatedTimeMinutes, opt => opt.MapFrom(src => src.EstimatedMinutes))
                .ForMember(dest => dest.ActualTimeSpentMinutes, opt => opt.MapFrom(src => 0))
                .ForMember(dest => dest.ProgressPercentage, opt => opt.MapFrom(src => 0))
                .ForMember(dest => dest.RecurringPattern, opt => opt.MapFrom(src => src.RecurrencePattern))
                .ForMember(dest => dest.ChecklistItems, opt => opt.Ignore())
                .ForMember(dest => dest.Board, opt => opt.Ignore())
                .ForMember(dest => dest.AssignedTo, opt => opt.Ignore())
                .ForMember(dest => dest.AssignedToName, opt => opt.Ignore())
                .ForMember(dest => dest.IsCompleted, opt => opt.MapFrom(src => src.Status == TaskItemStatus.Completed))
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
                    src.Status.HasValue ? src.Status.Value == TaskItemStatus.Completed : (bool?)null))
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
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

        private string ConvertIntToStringPriority(int priority)
        {
            switch (priority)
            {
                case 4:
                    return "Critical";
                case 3:
                    return "High";
                case 2:
                    return "Medium";
                case 1:
                    return "Low";
                default:
                    return "Medium";
            }
        }
    }
} 
