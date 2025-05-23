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
using TaskTrackerAPI.DTOs.Notifications;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Profiles
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
                
            // NotificationPreference -> NotificationPreferenceDTO
            CreateMap<NotificationPreference, NotificationPreferenceDTO>()
                .ForMember(dest => dest.FamilyName, opt => opt.MapFrom(src => src.Family != null ? src.Family.Name : null));
                
            // UpdateNotificationPreferenceDTO -> NotificationPreference
            CreateMap<UpdateNotificationPreferenceDTO, NotificationPreference>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Family, opt => opt.Ignore());
        }
    }
} 
