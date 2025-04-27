using AutoMapper;
using System;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.Models.Gamification;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Helpers.Profiles
{
    public class BadgeProfile : Profile
    {
        public BadgeProfile()
        {
            // Badge -> BadgeDTO
            CreateMap<TaskTrackerAPI.Models.Badge, BadgeDTO>()
                .ForMember(dest => dest.IconUrl, opt => opt.MapFrom(src => src.IconPath ?? string.Empty))
                .ForMember(dest => dest.Rarity, opt => opt.MapFrom(src => "Common")); // Default value
                
            // BadgeCreateUpdateDTO -> Badge
            CreateMap<BadgeCreateUpdateDTO, TaskTrackerAPI.Models.Badge>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.IconPath, opt => opt.MapFrom(src => src.IconUrl))
                .ForMember(dest => dest.UserBadges, opt => opt.Ignore());
                
            // UserBadge -> UserBadgeDTO
            CreateMap<TaskTrackerAPI.Models.UserBadge, UserBadgeDTO>()
                .ForMember(dest => dest.Badge, opt => opt.MapFrom(src => src.Badge));
                
            // UserBadgeDTO -> UserBadge
            CreateMap<UserBadgeDTO, TaskTrackerAPI.Models.UserBadge>()
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Badge, opt => opt.Ignore());
        }
    }
} 