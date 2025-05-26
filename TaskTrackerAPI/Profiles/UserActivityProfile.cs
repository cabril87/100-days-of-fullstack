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
using TaskTrackerAPI.DTOs.Activity;
using TaskTrackerAPI.DTOs.Gamification;

namespace TaskTrackerAPI.Profiles
{
    /// <summary>
    /// AutoMapper profile for user activity entities
    /// </summary>
    public class UserActivityProfile : Profile
    {
        public UserActivityProfile()
        {
            // Map from PointTransaction to UserActivityDTO
            CreateMap<PointTransactionDTO, UserActivityDTO>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => MapTransactionTypeToActivityType(src.TransactionType)))
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => GetActivityTitle(src.TransactionType, src.Points)))
                .ForMember(dest => dest.Points, opt => opt.MapFrom(src => src.Points))
                .ForMember(dest => dest.Timestamp, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.Data, opt => opt.MapFrom(src => new UserActivityDataDTO
                {
                    TaskId = src.RelatedEntityId.HasValue ? src.RelatedEntityId.Value.ToString() : null,
                    TransactionType = src.TransactionType
                }));

            // Map from UserProgressDTO to UserActivityStatsDTO
            CreateMap<UserProgressDTO, UserActivityStatsDTO>()
                .ForMember(dest => dest.TotalPoints, opt => opt.MapFrom(src => src.TotalPoints))
                .ForMember(dest => dest.CurrentStreak, opt => opt.MapFrom(src => src.CurrentStreak))
                .ForMember(dest => dest.LongestStreak, opt => opt.MapFrom(src => src.HighestStreak))
                .ForMember(dest => dest.TotalActivities, opt => opt.Ignore())
                .ForMember(dest => dest.ActivitiesToday, opt => opt.Ignore())
                .ForMember(dest => dest.PointsToday, opt => opt.Ignore());
        }

        /// <summary>
        /// Maps transaction type to activity type
        /// </summary>
        private static string MapTransactionTypeToActivityType(string transactionType)
        {
            return transactionType.ToLower() switch
            {
                "task_completion" or "task_complete" => "task_completion",
                "achievement_unlock" or "achievement" => "achievement",
                "level_up" => "level_up",
                "badge_earned" or "badge" => "badge",
                "reward_claimed" or "reward" => "reward",
                "challenge_complete" or "challenge" => "challenge",
                "daily_login" or "login" => "login",
                "streak_bonus" or "streak" => "streak",
                "family_bonus" or "family" => "family",
                _ => "points"
            };
        }

        /// <summary>
        /// Gets display title for activity based on transaction type
        /// </summary>
        private static string GetActivityTitle(string transactionType, int points)
        {
            return transactionType.ToLower() switch
            {
                "task_completion" or "task_complete" => "Task completed",
                "achievement_unlock" or "achievement" => "Achievement unlocked",
                "level_up" => "Level up!",
                "badge_earned" or "badge" => "Badge earned",
                "reward_claimed" or "reward" => "Reward claimed",
                "challenge_complete" or "challenge" => "Challenge completed",
                "daily_login" or "login" => "Daily check-in",
                "streak_bonus" or "streak" => "Streak bonus",
                "family_bonus" or "family" => "Family activity",
                _ => points > 0 ? "Points earned" : "Points spent"
            };
        }
    }
} 