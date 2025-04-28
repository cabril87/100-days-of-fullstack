using AutoMapper;
using TaskTrackerAPI.DTOs.Notifications;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Helpers.Profiles
{
    public class NotificationProfile : Profile
    {
        public NotificationProfile()
        {
            // Notification -> NotificationDTO
            CreateMap<Notification, NotificationDTO>();
                
            // NotificationCreateDTO -> Notification
            CreateMap<NotificationCreateDTO, Notification>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore());
        }
    }
} 