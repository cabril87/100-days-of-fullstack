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
using AutoMapper;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Profiles;

/// <summary>
/// AutoMapper profile for family activity entities
/// </summary>
public class FamilyActivityProfile : Profile
{
    public FamilyActivityProfile()
    {
        CreateMap<FamilyActivity, FamilyActivityDTO>()
            .ForMember(dest => dest.ActorName, opt => opt.MapFrom(src => src.Actor != null ? src.Actor.Username : string.Empty))
            .ForMember(dest => dest.ActorDisplayName, opt => opt.MapFrom(src => 
                src.Actor != null ? GetDisplayName(src.Actor) : string.Empty))
            .ForMember(dest => dest.ActorAvatarUrl, opt => opt.MapFrom(src => (string?)null))
            .ForMember(dest => dest.TargetName, opt => opt.MapFrom(src => src.Target != null ? src.Target.Username : null))
            .ForMember(dest => dest.TargetDisplayName, opt => opt.MapFrom(src => 
                src.Target != null ? GetDisplayName(src.Target) : null))
            .ForMember(dest => dest.Metadata, opt => opt.Ignore());
        
        CreateMap<FamilyActivityCreateDTO, FamilyActivity>()
            .ForMember(dest => dest.Timestamp, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.Metadata, opt => opt.Ignore())
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Family, opt => opt.Ignore())
            .ForMember(dest => dest.Actor, opt => opt.Ignore())
            .ForMember(dest => dest.Target, opt => opt.Ignore());
    }
    
    private static string GetDisplayName(User user)
    {
        if (string.IsNullOrEmpty(user.FirstName) && string.IsNullOrEmpty(user.LastName))
        {
            return user.Username;
        }
        
        return $"{user.FirstName} {user.LastName}".Trim();
    }
} 