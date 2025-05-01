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
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Helpers.Profiles
{
    public class UserProgressProfile : Profile
    {
        public UserProgressProfile()
        {
            // UserProgress -> UserProgressDTO
            CreateMap<UserProgress, UserProgressDTO>()
                .ForMember(dest => dest.TotalPoints, opt => opt.MapFrom(src => src.CurrentPoints))
                .ForMember(dest => dest.CurrentLevel, opt => opt.MapFrom(src => src.Level))
                .ForMember(dest => dest.PointsToNextLevel, opt => opt.MapFrom(src => src.NextLevelThreshold - src.CurrentPoints))
                .ForMember(dest => dest.LastUpdated, opt => opt.MapFrom(src => src.UpdatedAt));
        }
    }
} 