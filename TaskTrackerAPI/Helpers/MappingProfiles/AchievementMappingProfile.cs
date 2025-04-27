using AutoMapper;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.Models;

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