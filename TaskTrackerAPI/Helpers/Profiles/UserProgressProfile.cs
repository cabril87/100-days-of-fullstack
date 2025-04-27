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