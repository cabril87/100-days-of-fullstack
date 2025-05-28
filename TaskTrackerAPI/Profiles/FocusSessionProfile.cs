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
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Profiles
{
    public class FocusSessionProfile : Profile
    {
        public FocusSessionProfile()
        {
            // FocusSessionCreateDto -> FocusSession
            CreateMap<FocusSessionCreateDto, FocusSession>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.EndTime, opt => opt.Ignore())
                .ForMember(dest => dest.IsCompleted, opt => opt.MapFrom(src => false))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => SessionStatus.InProgress))
                .ForMember(dest => dest.DurationMinutes, opt => opt.MapFrom(src => 0))
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.TaskItem, opt => opt.Ignore())
                .ForMember(dest => dest.Distractions, opt => opt.Ignore())
                .ForMember(dest => dest.SessionQualityRating, opt => opt.Ignore())
                .ForMember(dest => dest.CompletionNotes, opt => opt.Ignore())
                .ForMember(dest => dest.TaskProgressBefore, opt => opt.MapFrom(src => 0))
                .ForMember(dest => dest.TaskProgressAfter, opt => opt.MapFrom(src => 0))
                .ForMember(dest => dest.TaskCompletedDuringSession, opt => opt.MapFrom(src => false));

            // DistractionCreateDto -> Distraction
            CreateMap<DistractionCreateDto, Distraction>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.FocusSessionId, opt => opt.MapFrom(src => src.SessionId))
                .ForMember(dest => dest.Timestamp, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.FocusSession, opt => opt.Ignore());

            // TaskTimeTrackingDto mappings
            CreateMap<TaskItem, TaskTimeTrackingDto>()
                .ForMember(dest => dest.TaskId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.EstimatedTimeMinutes, opt => opt.MapFrom(src => src.EstimatedTimeMinutes))
                .ForMember(dest => dest.ActualTimeSpentMinutes, opt => opt.MapFrom(src => src.ActualTimeSpentMinutes))
                .ForMember(dest => dest.TotalFocusSessions, opt => opt.Ignore()) // Calculated separately
                .ForMember(dest => dest.AverageSessionLength, opt => opt.Ignore()) // Calculated separately
                .ForMember(dest => dest.TimeEfficiencyRating, opt => opt.Ignore()) // Calculated separately
                .ForMember(dest => dest.IsCompleted, opt => opt.MapFrom(src => src.IsCompleted))
                .ForMember(dest => dest.CompletedAt, opt => opt.MapFrom(src => src.CompletedAt))
                .ForMember(dest => dest.FocusSessions, opt => opt.Ignore()); // Mapped separately

            // FocusSession -> FocusSessionSummaryDto
            CreateMap<FocusSession, FocusSessionSummaryDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.DistractionCount, opt => opt.MapFrom(src => src.Distractions.Count));
        }
    }
} 