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
using System.Globalization;
using AutoMapper;
using TaskTrackerAPI.DTOs.Auth;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Profiles;

/// <summary>
/// AutoMapper profile for parental control entities
/// </summary>
public class ParentalControlProfile : Profile
{
    public ParentalControlProfile()
    {
        // ParentalControl mappings
        CreateMap<ParentalControl, ParentalControlDTO>()
            .ForMember(dest => dest.AllowedHours, opt => opt.MapFrom(src => src.AllowedHours))
            .ForMember(dest => dest.Parent, opt => opt.MapFrom(src => src.Parent))
            .ForMember(dest => dest.Child, opt => opt.MapFrom(src => src.Child));

        CreateMap<ParentalControlCreateUpdateDTO, ParentalControl>()
            .ForMember(dest => dest.DailyTimeLimit, opt => opt.MapFrom(src => TimeSpan.FromMinutes(src.DailyTimeLimitHours * 60)))
            .ForMember(dest => dest.AllowedHours, opt => opt.MapFrom(src => src.AllowedHours))
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.ParentUserId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Parent, opt => opt.Ignore())
            .ForMember(dest => dest.Child, opt => opt.Ignore())
            .ForMember(dest => dest.PermissionRequests, opt => opt.Ignore());

        // TimeRange mappings
        CreateMap<TimeRange, TimeRangeDTO>();

        CreateMap<TimeRangeCreateDTO, TimeRange>()
            .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src => ParseTimeSpan(src.StartTime)))
            .ForMember(dest => dest.EndTime, opt => opt.MapFrom(src => ParseTimeSpan(src.EndTime)))
            .ForMember(dest => dest.DayOfWeek, opt => opt.MapFrom(src => (DayOfWeek)src.DayOfWeek));

        // PermissionRequest mappings
        CreateMap<PermissionRequest, PermissionRequestDTO>()
            .ForMember(dest => dest.Child, opt => opt.MapFrom(src => src.Child))
            .ForMember(dest => dest.Parent, opt => opt.MapFrom(src => src.Parent));

        CreateMap<PermissionRequestCreateDTO, PermissionRequest>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.ChildUserId, opt => opt.Ignore())
            .ForMember(dest => dest.ParentUserId, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.Ignore())
            .ForMember(dest => dest.RequestedAt, opt => opt.Ignore())
            .ForMember(dest => dest.RespondedAt, opt => opt.Ignore())
            .ForMember(dest => dest.ResponseMessage, opt => opt.Ignore())
            .ForMember(dest => dest.Child, opt => opt.Ignore())
            .ForMember(dest => dest.Parent, opt => opt.Ignore());

        // User mapping for parental control contexts
        CreateMap<User, UserDTO>();

        // ParentalControlSummary mapping
        CreateMap<ParentalControl, ParentalControlSummaryDTO>()
            .ForMember(dest => dest.Child, opt => opt.MapFrom(src => src.Child))
            .ForMember(dest => dest.Settings, opt => opt.MapFrom(src => src))
            .ForMember(dest => dest.PendingRequestsCount, opt => opt.Ignore())
            .ForMember(dest => dest.TodayScreenTimeMinutes, opt => opt.Ignore())
            .ForMember(dest => dest.RemainingScreenTimeMinutes, opt => opt.Ignore())
            .ForMember(dest => dest.IsWithinAllowedHours, opt => opt.Ignore())
            .ForMember(dest => dest.RecentRequests, opt => opt.Ignore());
    }

    /// <summary>
    /// Helper method to parse time string to TimeSpan
    /// </summary>
    /// <param name="timeString">Time string in HH:mm format</param>
    /// <returns>TimeSpan representation</returns>
    private static TimeSpan ParseTimeSpan(string timeString)
    {
        if (TimeSpan.TryParseExact(timeString, @"hh\:mm", CultureInfo.InvariantCulture, out TimeSpan result))
        {
            return result;
        }
        
        throw new ArgumentException($"Invalid time format: {timeString}. Expected format: HH:mm");
    }
} 