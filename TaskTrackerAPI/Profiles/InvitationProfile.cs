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
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Profiles;

public class InvitationProfile : Profile
{
    public InvitationProfile()
    {
        // Entity to DTO
        CreateMap<Invitation, InvitationDTO>()
            .ForMember(dest => dest.FamilyRole, opt => opt.MapFrom(src => src.Role));
        
        // DTO to Entity
        CreateMap<InvitationCreateDTO, Invitation>()
            .ForMember(dest => dest.RoleId, opt => opt.MapFrom(src => src.FamilyRoleId));
    }
} 