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
using System;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Helpers.Profiles
{
    public class ChallengeProfile : Profile
    {
        public ChallengeProfile()
        {
            // Challenge -> ChallengeDTO
            CreateMap<Challenge, ChallengeDTO>()
                .ForMember(dest => dest.EndDate, opt => opt.MapFrom(src => src.EndDate ?? DateTime.MaxValue))
                .ForMember(dest => dest.ChallengeType, opt => opt.MapFrom(src => string.Empty));
            
            // UserChallenge -> UserChallengeDTO
            CreateMap<UserChallenge, UserChallengeDTO>()
                .ForMember(dest => dest.Challenge, opt => opt.MapFrom(src => src.Challenge))
                .ForMember(dest => dest.IsComplete, opt => opt.MapFrom(src => src.IsCompleted));
            
            // UserChallenge -> UserChallengeProgressDTO
            CreateMap<UserChallenge, UserChallengeProgressDTO>()
                .ForMember(dest => dest.ChallengeTitle, opt => opt.MapFrom(src => src.Challenge != null ? src.Challenge.Name : string.Empty))
                .ForMember(dest => dest.RequiredProgress, opt => opt.MapFrom(src => 100))
                .ForMember(dest => dest.IsCompleted, opt => opt.MapFrom(src => src.IsCompleted));
        }
    }
} 