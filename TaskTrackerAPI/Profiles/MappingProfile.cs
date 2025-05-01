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
using TaskTrackerAPI.Models;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.DTOs.Tags;
using TaskTrackerAPI.DTOs.Categories;
using TaskTrackerAPI.DTOs.Family;

namespace TaskTrackerAPI.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Map from TaskItem to TaskItemDTO (legacy)
            CreateMap<TaskItem, TaskItemDTO>()
                .ForMember(dest => dest.CategoryName, opt => 
                    opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty))
                .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => ConvertPriorityToInt(src.Priority)))
                .ForMember(dest => dest.Tags, opt => opt.Ignore());
            
            // Map from TaskItem to TaskItemResponseDTO (new)
            CreateMap<TaskItem, TaskItemResponseDTO>()
                .ForMember(dest => dest.CategoryName, opt => 
                    opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty))
                .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => ConvertPriorityToInt(src.Priority)))
                .ForMember(dest => dest.Tags, opt => opt.Ignore());
                
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
                .ForMember(dest => dest.ApprovedByUserName, opt => opt.MapFrom(src => 
                    src.ApprovedByUser != null ? src.ApprovedByUser.Username : null))
                .ForMember(dest => dest.FamilyName, opt => opt.MapFrom(src => 
                    src.Family != null ? src.Family.Name : null))
                .ForMember(dest => dest.IsApproved, opt => opt.MapFrom(src => 
                    src.ApprovedByUserId.HasValue));
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