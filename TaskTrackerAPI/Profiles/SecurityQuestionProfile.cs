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
using TaskTrackerAPI.DTOs.Auth;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Profiles;

/// <summary>
/// AutoMapper profile for SecurityQuestion mappings
/// Handles conversion between SecurityQuestion entities and DTOs
/// </summary>
public class SecurityQuestionProfile : Profile
{
    public SecurityQuestionProfile()
    {
        // Entity to DTO mappings
        CreateMap<SecurityQuestion, SecurityQuestionDisplayDTO>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Question, opt => opt.MapFrom(src => src.Question))
            .ForMember(dest => dest.QuestionOrder, opt => opt.MapFrom(src => src.QuestionOrder))
            .ForMember(dest => dest.IsAgeAppropriate, opt => opt.MapFrom(src => src.IsAgeAppropriate))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
            .ForMember(dest => dest.LastUsedAt, opt => opt.MapFrom(src => src.LastUsedAt));

        // DTO to Entity mappings for creation
        CreateMap<SecurityQuestionSetupDTO, SecurityQuestion>()
            .ForMember(dest => dest.Question, opt => opt.MapFrom(src => src.Question1))
            .ForMember(dest => dest.EncryptedAnswer, opt => opt.MapFrom(src => src.Answer1))
            .ForMember(dest => dest.QuestionOrder, opt => opt.MapFrom(src => 1))
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.IsAgeAppropriate, opt => opt.Ignore())
            .ForMember(dest => dest.MinimumAgeGroup, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.LastUsedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UsageCount, opt => opt.Ignore())
            .ForMember(dest => dest.IsActive, opt => opt.Ignore());

        // DTO to Entity mappings for updates
        CreateMap<SecurityQuestionUpdateDTO, SecurityQuestion>()
            .ForMember(dest => dest.Question, opt => opt.MapFrom(src => src.Question1))
            .ForMember(dest => dest.EncryptedAnswer, opt => opt.MapFrom(src => src.Answer1))
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.QuestionOrder, opt => opt.Ignore())
            .ForMember(dest => dest.IsAgeAppropriate, opt => opt.Ignore())
            .ForMember(dest => dest.MinimumAgeGroup, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.LastUsedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UsageCount, opt => opt.Ignore())
            .ForMember(dest => dest.IsActive, opt => opt.Ignore());

        // Age group enum mappings
        CreateMap<FamilyMemberAgeGroup, string>()
            .ConvertUsing(src => src.ToString());

        CreateMap<string, FamilyMemberAgeGroup>()
            .ConvertUsing(src => Enum.IsDefined(typeof(FamilyMemberAgeGroup), src) ? (FamilyMemberAgeGroup)Enum.Parse(typeof(FamilyMemberAgeGroup), src) : FamilyMemberAgeGroup.Adult);
    }
} 