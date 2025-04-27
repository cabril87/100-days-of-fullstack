using AutoMapper;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Helpers.Profiles
{
    public class RewardProfile : Profile
    {
        public RewardProfile()
        {
            // Reward -> RewardDTO
            CreateMap<Reward, RewardDTO>()
                .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category ?? string.Empty))
                .ForMember(dest => dest.IconUrl, opt => opt.MapFrom(src => src.IconPath ?? string.Empty));

            // UserReward -> UserRewardDTO
            CreateMap<UserReward, UserRewardDTO>()
                .ForMember(dest => dest.Reward, opt => opt.MapFrom(src => src.Reward));
                
            // UserRewardDTO -> UserReward
            CreateMap<UserRewardDTO, UserReward>()
                .ForMember(dest => dest.Reward, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore());
        }
    }
} 