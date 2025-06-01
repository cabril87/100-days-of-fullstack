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
using System;
using System.Linq;
using AutoMapper;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.DTOs.User;
using TaskTrackerAPI.DTOs.Family;
using System.Collections.Generic;

namespace TaskTrackerAPI.Profiles.Analytics;

/// <summary>
/// AutoMapper profile for User Calendar Analytics and Aggregation
/// </summary>
public class UserCalendarProfile : Profile
{
    public UserCalendarProfile()
    {
        // UserGlobalCalendarDTO mappings
        CreateMap<User, UserGlobalCalendarDTO>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Username))
            .ForMember(dest => dest.Families, opt => opt.Ignore())
            .ForMember(dest => dest.AllEvents, opt => opt.Ignore())
            .ForMember(dest => dest.Statistics, opt => opt.Ignore())
            .ForMember(dest => dest.GeneratedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        // FamilyCalendarEventWithFamilyDTO mappings
        CreateMap<FamilyCalendarEvent, FamilyCalendarEventWithFamilyDTO>()
            .ForMember(dest => dest.Family, opt => opt.MapFrom(src => src.Family))
            .ForMember(dest => dest.FamilyColor, opt => opt.Ignore()) // Set by service
            .ForMember(dest => dest.IsUserCreator, opt => opt.Ignore()) // Set by service
            .ForMember(dest => dest.IsUserAttendee, opt => opt.Ignore()) // Set by service
            .ForMember(dest => dest.UserRole, opt => opt.Ignore()) // Set by service
            .ForMember(dest => dest.EventType, opt => opt.MapFrom(src => src.EventType.ToString()))
            .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.CreatedByUser))
            .ForMember(dest => dest.Attendees, opt => opt.MapFrom(src => src.Attendees))
            .ForMember(dest => dest.Reminders, opt => opt.MapFrom(src => src.Reminders));

        // FamilyEventAttendeeDTO mappings
        CreateMap<FamilyEventAttendee, FamilyEventAttendeeDTO>()
            .ForMember(dest => dest.MemberName, opt => opt.MapFrom(src => 
                src.FamilyMember != null && src.FamilyMember.User != null ? 
                    (src.FamilyMember.User.FirstName + " " + src.FamilyMember.User.LastName).Trim() : 
                    src.FamilyMember != null ? src.FamilyMember.Name : ""))
            .ForMember(dest => dest.FamilyMember, opt => opt.MapFrom(src => src.FamilyMember));

        // FamilyEventReminderDTO mappings
        CreateMap<FamilyEventReminder, FamilyEventReminderDTO>();

        // UserFamilyCalendarSummaryDTO mappings
        CreateMap<Family, UserFamilyCalendarSummaryDTO>()
            .ForMember(dest => dest.FamilyId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.FamilyName, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.FamilyDescription, opt => opt.MapFrom(src => src.Description))
            .ForMember(dest => dest.FamilyColor, opt => opt.Ignore()) // Set by service
            .ForMember(dest => dest.TotalEvents, opt => opt.Ignore())
            .ForMember(dest => dest.UpcomingEvents, opt => opt.Ignore())
            .ForMember(dest => dest.TodayEvents, opt => opt.Ignore())
            .ForMember(dest => dest.UserCreatedEvents, opt => opt.Ignore())
            .ForMember(dest => dest.UserAttendingEvents, opt => opt.Ignore())
            .ForMember(dest => dest.NextEventDate, opt => opt.Ignore())
            .ForMember(dest => dest.LastActivity, opt => opt.Ignore())
            .ForMember(dest => dest.HasPermissionToCreateEvents, opt => opt.Ignore())
            .ForMember(dest => dest.HasPermissionToManageEvents, opt => opt.Ignore())
            .ForMember(dest => dest.UserRole, opt => opt.Ignore());

        // UserAvailabilityDTO mappings
        CreateMap<User, UserAvailabilityDTO>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Date, opt => opt.Ignore())
            .ForMember(dest => dest.IsAvailable, opt => opt.Ignore())
            .ForMember(dest => dest.BusySlots, opt => opt.Ignore())
            .ForMember(dest => dest.AvailableSlots, opt => opt.Ignore())
            .ForMember(dest => dest.ConflictingEvents, opt => opt.Ignore())
            .ForMember(dest => dest.TimeZone, opt => opt.Ignore());

        // CalendarConflictDTO mappings
        CreateMap<FamilyCalendarEvent, CalendarConflictDTO>()
            .ForMember(dest => dest.ConflictDate, opt => opt.MapFrom(src => src.StartTime.Date))
            .ForMember(dest => dest.ConflictStartTime, opt => opt.MapFrom(src => src.StartTime))
            .ForMember(dest => dest.ConflictEndTime, opt => opt.MapFrom(src => src.EndTime))
            .ForMember(dest => dest.ConflictType, opt => opt.Ignore())
            .ForMember(dest => dest.ConflictingEvents, opt => opt.Ignore())
            .ForMember(dest => dest.Severity, opt => opt.Ignore())
            .ForMember(dest => dest.Description, opt => opt.Ignore())
            .ForMember(dest => dest.IsResolved, opt => opt.Ignore())
            .ForMember(dest => dest.DetectedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        // UserCalendarStatisticsDTO mappings
        CreateMap<User, UserCalendarStatisticsDTO>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.TotalFamilies, opt => opt.Ignore())
            .ForMember(dest => dest.TotalEvents, opt => opt.Ignore())
            .ForMember(dest => dest.UpcomingEvents, opt => opt.Ignore())
            .ForMember(dest => dest.PastEvents, opt => opt.Ignore())
            .ForMember(dest => dest.TodayEvents, opt => opt.Ignore())
            .ForMember(dest => dest.ThisWeekEvents, opt => opt.Ignore())
            .ForMember(dest => dest.ThisMonthEvents, opt => opt.Ignore())
            .ForMember(dest => dest.EventsCreatedByUser, opt => opt.Ignore())
            .ForMember(dest => dest.EventsUserAttending, opt => opt.Ignore())
            .ForMember(dest => dest.ActiveConflicts, opt => opt.Ignore())
            .ForMember(dest => dest.ResolvedConflicts, opt => opt.Ignore())
            .ForMember(dest => dest.FamilyStats, opt => opt.Ignore())
            .ForMember(dest => dest.EventTypeDistribution, opt => opt.Ignore())
            .ForMember(dest => dest.DailyActivityPattern, opt => opt.Ignore())
            .ForMember(dest => dest.HourlyActivityPattern, opt => opt.Ignore())
            .ForMember(dest => dest.MonthlyActivityPattern, opt => opt.Ignore())
            .ForMember(dest => dest.AverageEventsPerFamily, opt => opt.Ignore())
            .ForMember(dest => dest.AverageEventsPerWeek, opt => opt.Ignore())
            .ForMember(dest => dest.EventAttendanceRate, opt => opt.Ignore())
            .ForMember(dest => dest.EventCreationRate, opt => opt.Ignore())
            .ForMember(dest => dest.LastEventCreated, opt => opt.Ignore())
            .ForMember(dest => dest.LastEventAttended, opt => opt.Ignore())
            .ForMember(dest => dest.NextUpcomingEvent, opt => opt.Ignore())
            .ForMember(dest => dest.BusiestDayOfWeek, opt => opt.Ignore())
            .ForMember(dest => dest.BusiestHourOfDay, opt => opt.Ignore())
            .ForMember(dest => dest.BusiestFamily, opt => opt.Ignore())
            .ForMember(dest => dest.MostCommonEventType, opt => opt.Ignore())
            .ForMember(dest => dest.GeneratedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        // Helper mappings for nested objects
        CreateMap<FamilyMember, FamilyMemberDTO>()
            .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User))
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role));

        // Family role mappings
        CreateMap<FamilyRole, FamilyRoleDTO>()
            .ForMember(dest => dest.Permissions, opt => opt.MapFrom(src => src.Permissions.Select(p => p.Name).ToList()));

        // FamilyCalendarSummaryDTO mappings
        CreateMap<Family, FamilyCalendarSummaryDTO>()
            .ForMember(dest => dest.MemberCount, opt => opt.MapFrom(src => src.Members.Count))
            .ForMember(dest => dest.Color, opt => opt.Ignore()); // Set by service

        // Collection mappings for efficient processing
        CreateMap<IEnumerable<FamilyCalendarEvent>, IEnumerable<FamilyCalendarEventWithFamilyDTO>>();
        CreateMap<IEnumerable<Family>, IEnumerable<UserFamilyCalendarSummaryDTO>>();
        CreateMap<IEnumerable<FamilyEventAttendee>, IEnumerable<FamilyEventAttendeeDTO>>();
        CreateMap<IEnumerable<FamilyEventReminder>, IEnumerable<FamilyEventReminderDTO>>();

        // FamilyStatisticsSummaryDTO mappings
        CreateMap<Family, FamilyStatisticsSummaryDTO>()
            .ForMember(dest => dest.FamilyId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.FamilyName, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.FamilyColor, opt => opt.Ignore())
            .ForMember(dest => dest.TotalEvents, opt => opt.Ignore())
            .ForMember(dest => dest.UpcomingEvents, opt => opt.Ignore())
            .ForMember(dest => dest.UserCreatedEvents, opt => opt.Ignore())
            .ForMember(dest => dest.UserAttendingEvents, opt => opt.Ignore())
            .ForMember(dest => dest.ParticipationRate, opt => opt.Ignore())
            .ForMember(dest => dest.LastActivity, opt => opt.Ignore())
            .ForMember(dest => dest.MostActiveEventType, opt => opt.Ignore());
    }
} 