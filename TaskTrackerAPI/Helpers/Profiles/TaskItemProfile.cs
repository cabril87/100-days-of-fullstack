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

namespace TaskTrackerAPI.Helpers.Profiles
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
                .ForMember(dest => dest.Family, opt => opt.Ignore());
            
            // TaskItemUpdateRequestDTO -> TaskItem
            CreateMap<TaskItemUpdateRequestDTO, TaskItem>()
                .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => 
                    src.Priority.HasValue ? ConvertIntToStringPriority(src.Priority.Value) : null))
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
                    return "None";
            }
        }
    }
} 