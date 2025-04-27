using AutoMapper;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.Models.Gamification;
using System;

namespace TaskTrackerAPI.Helpers.Profiles
{
    public class AchievementProfile : Profile
    {
        public AchievementProfile()
        {
            // Achievement -> AchievementDTO
            CreateMap<Achievement, AchievementDTO>()
                .ForMember(dest => dest.Difficulty, opt => opt.MapFrom(src => src.Difficulty.ToString()))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => !src.IsDeleted))
                .ForMember(dest => dest.TargetValue, opt => opt.Ignore())
                .ForMember(dest => dest.UnlockCriteria, opt => opt.Ignore())
                .ForMember(dest => dest.CurrentProgress, opt => opt.Ignore())
                .ForMember(dest => dest.IsUnlocked, opt => opt.Ignore())
                .ForMember(dest => dest.UnlockedAt, opt => opt.Ignore())
                .ForMember(dest => dest.IsHidden, opt => opt.Ignore())
                .ForMember(dest => dest.IsSecret, opt => opt.Ignore())
                .ForMember(dest => dest.RelatedAchievementIds, opt => opt.Ignore())
                .ForMember(dest => dest.UnlockMessage, opt => opt.Ignore());

            // AchievementCreateUpdateDTO -> Achievement
            CreateMap<AchievementCreateUpdateDTO, Achievement>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.Difficulty, opt => opt.MapFrom(src => (AchievementDifficulty)src.Difficulty))
                .ForMember(dest => dest.UserAchievements, opt => opt.Ignore());

            // UserAchievement -> UserAchievementDTO
            CreateMap<UserAchievement, UserAchievementDTO>()
                .ForMember(dest => dest.Achievement, opt => opt.MapFrom(src => src.Achievement))
                .ForMember(dest => dest.CurrentProgress, opt => opt.MapFrom(src => src.Progress))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Achievement != null ? src.Achievement.Name : string.Empty))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Achievement != null ? src.Achievement.Description : string.Empty))
                .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Achievement != null ? src.Achievement.Category : string.Empty))
                .ForMember(dest => dest.PointValue, opt => opt.MapFrom(src => src.Achievement != null ? src.Achievement.PointValue : 0))
                .ForMember(dest => dest.IconUrl, opt => opt.MapFrom(src => src.Achievement != null ? src.Achievement.IconUrl : string.Empty))
                .ForMember(dest => dest.Difficulty, opt => opt.MapFrom(src => src.Achievement != null ? src.Achievement.Difficulty.ToString() : string.Empty))
                .ForMember(dest => dest.TargetProgress, opt => opt.MapFrom(src => src.IsCompleted ? src.Progress : 100))
                .ForMember(dest => dest.IsCompleted, opt => opt.MapFrom(src => src.IsCompleted))
                .ForMember(dest => dest.CompletedAt, opt => opt.MapFrom(src => src.CompletedAt))
                .ForMember(dest => dest.LastUpdated, opt => opt.MapFrom(src => src.StartedAt ?? DateTime.UtcNow));
        }
    }
} 