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
using TaskTrackerAPI.Models.Gamification;
using System;
using System.Linq;

namespace TaskTrackerAPI.Profiles;

/// <summary>
/// AutoMapper profile for family gamification mappings
/// </summary>
public class FamilyGamificationProfile : Profile
{
    public FamilyGamificationProfile()
    {
        // FamilyMember aggregation to FamilyGamificationProfileDTO
        CreateMap<Family, FamilyGamificationProfileDTO>()
            .ForMember(dest => dest.FamilyId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.FamilyName, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.TotalFamilyPoints, opt => opt.Ignore()) // Calculated in service
            .ForMember(dest => dest.FamilyLevel, opt => opt.Ignore()) // Calculated in service
            .ForMember(dest => dest.FamilyStreak, opt => opt.Ignore()) // Calculated in service
            .ForMember(dest => dest.FamilyRank, opt => opt.Ignore()) // Calculated in service
            .ForMember(dest => dest.FamilyBadges, opt => opt.Ignore()) // Aggregated in service
            .ForMember(dest => dest.FamilyAchievements, opt => opt.Ignore()) // Aggregated in service
            .ForMember(dest => dest.WeeklyGoals, opt => opt.Ignore()) // Aggregated in service
            .ForMember(dest => dest.MonthlyChallenge, opt => opt.Ignore()) // Aggregated in service
            .ForMember(dest => dest.Settings, opt => opt.Ignore()) // Aggregated in service
            .ForMember(dest => dest.Statistics, opt => opt.Ignore()) // Aggregated in service
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt));

        // Simplified mappings - only map basic properties that definitely exist
        // Complex DTOs like FamilyChallengeDTO and FamilyBadgeDTO are aggregation objects
        // that should be constructed in the service layer with business logic

        // Family gamification DTOs are primarily aggregation objects
        // constructed in the service layer with complex business logic
        
        // Achievement to FamilyGamificationAchievementDTO 
        CreateMap<Achievement, FamilyGamificationAchievementDTO>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => "family"))
            .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
            .ForMember(dest => dest.Icon, opt => opt.MapFrom(src => src.IconUrl))
            .ForMember(dest => dest.Rarity, opt => opt.MapFrom(src => src.Difficulty.ToString().ToLower())) // Map from difficulty
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category))
            .ForMember(dest => dest.PointsReward, opt => opt.MapFrom(src => src.PointValue))
            .ForMember(dest => dest.UnlockedAt, opt => opt.Ignore()) // From UserAchievement
            .ForMember(dest => dest.UnlockedBy, opt => opt.Ignore()) // Aggregated in service
            .ForMember(dest => dest.ShareableMessage, opt => opt.Ignore()) // Generated in service
            .ForMember(dest => dest.FamilyBonus, opt => opt.Ignore()); // Calculated in service
    }
} 