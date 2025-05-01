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

public class FamilyProfile : Profile
{
    public FamilyProfile()
    {
        // Entity to DTO
        CreateMap<Family, FamilyDTO>();
        
        // DTO to Entity
        CreateMap<FamilyCreateDTO, Family>();
        CreateMap<FamilyUpdateDTO, Family>()
            .ForAllMembers(opts => opts
                .Condition((src, dest, srcMember) => srcMember != null));
    }
}