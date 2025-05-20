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
using TaskTrackerAPI.Models.Gamification;

namespace TaskTrackerAPI.Helpers.MappingProfiles
{
    public class AchievementMappingProfile : Profile
    {
        public AchievementMappingProfile()
        {
            // Map from Achievement model to AchievementDTO
            CreateMap<Achievement, AchievementDTO>();
            
            // Map from AchievementCreateUpdateDTO to Achievement model
            CreateMap<AchievementCreateUpdateDTO, Achievement>();
            
            // Map from UserAchievement to UserAchievementDTO
            CreateMap<UserAchievement, UserAchievementDTO>()
                .ForMember(dest => dest.Achievement, opt => opt.MapFrom(src => src.Achievement));
        }
    }
} 