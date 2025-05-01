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
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Helpers.Profiles
{
    public class PointTransactionProfile : Profile
    {
        public PointTransactionProfile()
        {
            // PointTransaction -> PointTransactionDTO
            CreateMap<PointTransaction, PointTransactionDTO>();
            
            // AddPointsDTO -> PointTransaction
            CreateMap<AddPointsDTO, PointTransaction>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Task, opt => opt.Ignore());
        }
    }
} 