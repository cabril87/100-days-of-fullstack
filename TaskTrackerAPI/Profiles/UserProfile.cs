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
using TaskTrackerAPI.Models;
using UserDTO = TaskTrackerAPI.DTOs.User.UserDTO;
using UserMinimalDTO = TaskTrackerAPI.DTOs.User.UserMinimalDTO;
using AuthUserDTO = TaskTrackerAPI.DTOs.Auth.UserDTO;

namespace TaskTrackerAPI.Profiles
{
public class UserProfile : Profile
{
    public UserProfile()
    {
            // Map for User.UserDTO
        CreateMap<User, UserDTO>()
            .ForMember(dest => dest.DisplayName, opt => 
                    opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));
                
            // Map for UserMinimalDTO
        CreateMap<User, UserMinimalDTO>()
            .ForMember(dest => dest.DisplayName, opt => 
                    opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));
                    
            // Map for Auth.UserDTO - added to fix AutoMapper missing mapping
            CreateMap<User, AuthUserDTO>()
                .ForMember(dest => dest.DisplayName, opt => 
                    opt.MapFrom(src => $"{src.FirstName} {src.LastName}"))
                .ForMember(dest => dest.Role, opt => 
                    opt.MapFrom(src => src.Role))
                .ForMember(dest => dest.AgeGroup, opt => 
                    opt.MapFrom(src => src.AgeGroup));
        }
    }
} 