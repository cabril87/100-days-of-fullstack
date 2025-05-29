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
using System.Collections.Generic;
using System.Linq;

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

        // Smart Scheduling Mappings
        CreateMap<FamilyMember, FamilyMemberSummaryDTO>()
            .ForMember(dest => dest.MemberId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.Username : string.Empty))
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role))
            .ForMember(dest => dest.AvailabilityScore, opt => opt.MapFrom(src => 85.0)); // Default score, would be calculated

        CreateMap<FamilyMember, AvailableMemberDTO>()
            .ForMember(dest => dest.MemberId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.MemberName, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.AvailabilityStatus, opt => opt.MapFrom(src => "Available")); // Default status

        CreateMap<FamilyCalendarEvent, ConflictingEventDTO>()
            .ForMember(dest => dest.EventId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Title))
            .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src => src.StartTime))
            .ForMember(dest => dest.EndTime, opt => opt.MapFrom(src => src.EndTime))
            .ForMember(dest => dest.AttendeeIds, opt => opt.MapFrom(src => src.Attendees.Select(a => a.FamilyMemberId)));

        // Member efficiency mappings
        CreateMap<FamilyMember, MemberEfficiencyDTO>()
            .ForMember(dest => dest.MemberId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.MemberName, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.PersonalEfficiency, opt => opt.MapFrom(src => 85.0)) // Would be calculated
            .ForMember(dest => dest.ConflictFreeStreak, opt => opt.MapFrom(src => 0)) // Would be calculated
            .ForMember(dest => dest.LastConflict, opt => opt.MapFrom(src => (DateTime?)null)); // Would be calculated

        // Member scheduling pattern mappings
        CreateMap<FamilyMember, MemberSchedulingPatternDTO>()
            .ForMember(dest => dest.MemberId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.MemberName, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.AvailabilityScore, opt => opt.MapFrom(src => 85.0)) // Default, would be calculated
            .ForMember(dest => dest.EventsCreated, opt => opt.MapFrom(src => 0)) // Would be calculated
            .ForMember(dest => dest.ConflictsGenerated, opt => opt.MapFrom(src => 0)) // Would be calculated
            .ForMember(dest => dest.ResponseRate, opt => opt.MapFrom(src => 100.0)) // Default, would be calculated
            .ForMember(dest => dest.PreferredTimes, opt => opt.MapFrom(src => new List<TimeRangeDTO>()))
            .ForMember(dest => dest.BusyPatterns, opt => opt.MapFrom(src => new List<string>()));
    }
} 