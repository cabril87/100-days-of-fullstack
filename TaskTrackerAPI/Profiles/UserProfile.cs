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
using TaskTrackerAPI.DTOs.User;
using UserMinimalDTO = TaskTrackerAPI.DTOs.User.UserMinimalDTO;
using AuthUserDTO = TaskTrackerAPI.DTOs.Auth.UserDTO;
using System;

namespace TaskTrackerAPI.Profiles
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            // Map for User.UserDTO (combined from both profiles)
            CreateMap<User, UserDTO>()
                .ForMember(dest => dest.DisplayName, opt => 
                        opt.MapFrom(src => $"{src.FirstName} {src.LastName}"))
                .ForMember(dest => dest.Username, opt => opt.MapFrom((src, dest) => 
                        !string.IsNullOrEmpty(src.Username) ? src.Username : $"User_{src.Id}"))
                .ForMember(dest => dest.Email, opt => opt.MapFrom((src, dest) => 
                        !string.IsNullOrEmpty(src.Email) ? src.Email : $"user{src.Id}@tasktracker.com"));
            
            // UserDTO -> User (from Helpers.Profiles)
            CreateMap<UserDTO, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore())
                .ForMember(dest => dest.Role, opt => opt.Ignore())
                .ForMember(dest => dest.Tasks, opt => opt.Ignore());
                
            // Map for UserMinimalDTO
            CreateMap<User, UserMinimalDTO>()
                .ForMember(dest => dest.DisplayName, opt => 
                        opt.MapFrom(src => $"{src.FirstName} {src.LastName}"))
                .ForMember(dest => dest.Username, opt => opt.MapFrom((src, dest) => 
                        !string.IsNullOrEmpty(src.Username) ? src.Username : $"User_{src.Id}"));
                        
            // Map for Auth.UserDTO - added to fix AutoMapper missing mapping
            CreateMap<User, AuthUserDTO>()
                .ForMember(dest => dest.DisplayName, opt => 
                    opt.MapFrom(src => $"{src.FirstName} {src.LastName}"))
                .ForMember(dest => dest.Role, opt => 
                    opt.MapFrom(src => src.Role))
                .ForMember(dest => dest.AgeGroup, opt => 
                    opt.MapFrom(src => src.AgeGroup))
                .ForMember(dest => dest.Username, opt => opt.MapFrom((src, dest) => 
                    !string.IsNullOrEmpty(src.Username) ? src.Username : $"User_{src.Id}"));
        }
    }
} 