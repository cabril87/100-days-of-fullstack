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
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;
using System;

namespace TaskTrackerAPI.Profiles;

public class FamilyCalendarProfile : Profile
{
    public FamilyCalendarProfile()
    {
        // FamilyCalendarEvent to FamilyCalendarEventDTO
        CreateMap<FamilyCalendarEvent, FamilyCalendarEventDTO>()
            .ForMember(dest => dest.EventType, opt => opt.MapFrom(src => src.EventType.ToString()))
            .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.CreatedByUser));

        // CreateFamilyCalendarEventDTO to FamilyCalendarEvent
        CreateMap<CreateFamilyCalendarEventDTO, FamilyCalendarEvent>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedById, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedByUser, opt => opt.Ignore())
            .ForMember(dest => dest.Family, opt => opt.Ignore())
            .ForMember(dest => dest.Attendees, opt => opt.Ignore())
            .ForMember(dest => dest.Reminders, opt => opt.Ignore());

        // FamilyEventAttendee to EventAttendeeDTO
        CreateMap<FamilyEventAttendee, EventAttendeeDTO>()
            .ForMember(dest => dest.MemberName, opt => opt.MapFrom(src => 
                src.FamilyMember != null ? src.FamilyMember.Name : string.Empty))
            .ForMember(dest => dest.Response, opt => opt.MapFrom(src => src.Response.ToString()));

        // FamilyEventReminder to EventReminderDTO
        CreateMap<FamilyEventReminder, EventReminderDTO>()
            .ForMember(dest => dest.ReminderMethod, opt => opt.MapFrom(src => src.ReminderMethod.ToString()));

        // FamilyMemberAvailability to FamilyMemberAvailabilityDTO
        CreateMap<FamilyMemberAvailability, FamilyMemberAvailabilityDTO>()
            .ForMember(dest => dest.MemberName, opt => opt.MapFrom(src => 
                src.FamilyMember != null ? src.FamilyMember.Name : string.Empty))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

        // CreateFamilyMemberAvailabilityDTO to FamilyMemberAvailability
        CreateMap<CreateFamilyMemberAvailabilityDTO, FamilyMemberAvailability>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.FamilyMember, opt => opt.Ignore());

        // UpdateFamilyMemberAvailabilityDTO to FamilyMemberAvailability
        CreateMap<UpdateFamilyMemberAvailabilityDTO, FamilyMemberAvailability>()
            .ForAllMembers(opts => opts
                .Condition((src, dest, srcMember) => srcMember != null));
    }
} 