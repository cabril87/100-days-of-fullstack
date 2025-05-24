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
using TaskTrackerAPI.Models.Gamification;

namespace TaskTrackerAPI.Profiles
{
    public class BadgeProfile : Profile
    {
        public BadgeProfile()
        {
            // Gamification Badge -> BadgeDTO
            CreateMap<Badge, BadgeDTO>()
                .ForMember(dest => dest.IconUrl, opt => opt.MapFrom(src => src.IconUrl ?? string.Empty));
                
            // BadgeCreateUpdateDTO -> Gamification Badge
            CreateMap<BadgeCreateUpdateDTO, Badge>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UserBadges, opt => opt.Ignore());
                
            // Gamification UserBadge -> UserBadgeDTO
            CreateMap<UserBadge, UserBadgeDTO>()
                .ForMember(dest => dest.Badge, opt => opt.MapFrom(src => src.Badge))
                .ForMember(dest => dest.AwardNote, opt => opt.MapFrom(src => src.AwardNote))
                .ForMember(dest => dest.Notes, opt => opt.MapFrom(src => src.AwardNote)); // Map to both properties
                
            // UserBadgeDTO -> Gamification UserBadge
            CreateMap<UserBadgeDTO, UserBadge>()
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Badge, opt => opt.Ignore())
                .ForMember(dest => dest.AwardNote, opt => opt.MapFrom(src => src.AwardNote ?? src.Notes));
        }
    }
} 
