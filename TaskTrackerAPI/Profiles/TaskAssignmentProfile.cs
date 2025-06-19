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

namespace TaskTrackerAPI.Profiles
{
    /// <summary>
    /// AutoMapper profile for TaskAssignment mappings
    /// </summary>
    public class TaskAssignmentProfile : Profile
    {
        public TaskAssignmentProfile()
        {
            // TaskAssignment Entity to DTO
            CreateMap<TaskAssignment, TaskAssignmentDTO>()
                .ForMember(dest => dest.TaskTitle, opt => opt.MapFrom(src => src.Task != null ? src.Task.Title : null))
                .ForMember(dest => dest.TaskDescription, opt => opt.MapFrom(src => src.Task != null ? src.Task.Description : null))
                .ForMember(dest => dest.TaskDueDate, opt => opt.MapFrom(src => src.Task != null ? src.Task.DueDate : null))
                .ForMember(dest => dest.TaskPriority, opt => opt.MapFrom(src => src.Task != null ? src.Task.Priority : null))
                .ForMember(dest => dest.FamilyId, opt => opt.MapFrom(src => src.Task != null ? src.Task.FamilyId : null))
                .ForMember(dest => dest.AssignedToUserName, opt => opt.MapFrom(src => src.AssignedToUser != null ? src.AssignedToUser.Username : null))
                .ForMember(dest => dest.AssignedByUserName, opt => opt.MapFrom(src => src.AssignedByUser != null ? src.AssignedByUser.Username : null))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => 
                    src.IsAccepted ? TaskAssignmentStatus.Accepted : TaskAssignmentStatus.Pending))
                .ForMember(dest => dest.AssignmentType, opt => opt.MapFrom(src => 
                    src.Task != null && src.Task.FamilyId.HasValue ? TaskAssignmentType.FamilyMember : TaskAssignmentType.Individual));

            // CreateTaskAssignmentDTO to TaskAssignment Entity
            CreateMap<CreateTaskAssignmentDTO, TaskAssignment>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.AssignedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.IsAccepted, opt => opt.MapFrom(src => false))
                .ForMember(dest => dest.AcceptedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Task, opt => opt.Ignore())
                .ForMember(dest => dest.AssignedToUser, opt => opt.Ignore())
                .ForMember(dest => dest.AssignedByUser, opt => opt.Ignore());

            // TaskAssignmentDTO to TaskAssignment Entity (for updates)
            CreateMap<TaskAssignmentDTO, TaskAssignment>()
                .ForMember(dest => dest.Task, opt => opt.Ignore())
                .ForMember(dest => dest.AssignedToUser, opt => opt.Ignore())
                .ForMember(dest => dest.AssignedByUser, opt => opt.Ignore());
        }
    }
} 