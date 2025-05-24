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
using TaskTrackerAPI.Models.Gamification;
using TaskTrackerAPI.DTOs.Gamification;
using System;

namespace TaskTrackerAPI.Profiles
{
    public class GamificationProfile : Profile
    {
        public GamificationProfile()
        {
            // User Progress mappings
            CreateMap<UserProgress, UserProgressDTO>()
                .ForMember(dest => dest.TotalPoints, opt => opt.MapFrom(src => src.CurrentPoints))
                .ForMember(dest => dest.CurrentLevel, opt => opt.MapFrom(src => src.Level))
                .ForMember(dest => dest.PointsToNextLevel, opt => opt.MapFrom(src => src.NextLevelThreshold))
                .ForMember(dest => dest.HighestStreak, opt => opt.MapFrom(src => src.LongestStreak))
                .ForMember(dest => dest.LastActivityDate, opt => opt.MapFrom(src => src.LastActivityDate ?? DateTime.UtcNow))
                .ForMember(dest => dest.LastUpdated, opt => opt.MapFrom(src => src.UpdatedAt));

            // Achievement mappings
            CreateMap<Achievement, AchievementDTO>()
                .ForMember(dest => dest.Difficulty, opt => opt.MapFrom(src => src.Difficulty.ToString()));

            CreateMap<UserAchievement, UserAchievementDTO>();

            // Badge mappings are handled in BadgeProfile

            // Reward mappings - Use correct property name
            CreateMap<Reward, RewardDTO>()
                .ForMember(dest => dest.IconUrl, opt => opt.MapFrom(src => src.IconPath ?? string.Empty));

            CreateMap<UserReward, UserRewardDTO>();

            // Challenge mappings - Remove invalid property mappings
            CreateMap<Challenge, ChallengeDTO>();

            CreateMap<UserChallenge, UserChallengeDTO>();

            CreateMap<ChallengeProgress, ChallengeProgressDTO>();

            // Transaction mappings
            CreateMap<PointTransaction, PointTransactionDTO>()
                .ForMember(dest => dest.RelatedEntityId, opt => opt.MapFrom(src => src.TaskId));

            // Leaderboard mappings
            CreateMap<LeaderboardEntry, LeaderboardEntryDTO>()
                .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => string.Empty)); // Default value

            // Stats mappings
            CreateMap<GamificationStats, GamificationStatsDTO>();

            // Suggestions mappings - Enhanced from existing - Remove invalid properties
            CreateMap<GamificationSuggestion, GamificationSuggestionDetailDTO>()
                .ForMember(dest => dest.SuggestionType, opt => opt.MapFrom(src => src.Type))
                .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => (int)Math.Round(src.RelevanceScore * 10)))
                .ForMember(dest => dest.RequiredPoints, opt => opt.MapFrom(src => src.PotentialPoints > 0 ? src.PotentialPoints : (int?)null));
                
            // Map from GamificationSuggestionDetailDTO to GamificationSuggestion
            CreateMap<GamificationSuggestionDetailDTO, GamificationSuggestion>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.SuggestionType))
                .ForMember(dest => dest.RelevanceScore, opt => opt.MapFrom(src => src.Priority / 10.0))
                .ForMember(dest => dest.PotentialPoints, opt => opt.MapFrom(src => src.RequiredPoints ?? 0));

            // Priority Multiplier mappings
            CreateMap<PriorityMultiplier, PriorityMultiplierDTO>()
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => $"{src.Priority} priority tasks get {src.Multiplier:P0} of base points"));

            // Daily Login mappings
            CreateMap<LoginStatus, DailyLoginStatusDetailDTO>()
                .ForMember(dest => dest.UserId, opt => opt.Ignore()) // Set manually
                .ForMember(dest => dest.HasLoggedInToday, opt => opt.MapFrom(src => src.HasClaimedToday))
                .ForMember(dest => dest.ConsecutiveDays, opt => opt.MapFrom(src => src.CurrentStreak))
                .ForMember(dest => dest.TotalLogins, opt => opt.MapFrom(src => 0)) // Default value
                .ForMember(dest => dest.LastLoginDate, opt => opt.Ignore()) // Set manually
                .ForMember(dest => dest.CurrentStreakPoints, opt => opt.MapFrom(src => src.PotentialPoints))
                .ForMember(dest => dest.RewardClaimed, opt => opt.MapFrom(src => src.HasClaimedToday));
        }
    }
} 