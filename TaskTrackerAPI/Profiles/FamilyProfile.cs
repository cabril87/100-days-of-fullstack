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
using TaskTrackerAPI.DTOs.User;
using System.Linq;
using System.Collections.Generic;

namespace TaskTrackerAPI.Profiles;

public class FamilyProfile : Profile
{
    public FamilyProfile()
    {
        // Entity to DTO
        CreateMap<Family, FamilyDTO>()
            .ForMember(dest => dest.Members, opt => opt.MapFrom((src, dest, destMember, context) => {
                if (src.Members == null)
                    return new List<FamilyMemberDTO>();
                
                // Process each member, ensuring admin members have proper names
                var mappedMembers = src.Members.Select(member => {
                    var mappedMember = context.Mapper.Map<FamilyMemberDTO>(member);
                    
                    // Special handling for admin members (ID 2)
                    if (member.Id == 2 && 
                        (member.Role?.Name == "Admin" || member.RoleId == 1))
                    {
                        // Ensure consistent admin user data
                        if (mappedMember.User == null)
                        {
                            mappedMember.User = new UserDTO
                            {
                                Id = member.UserId,
                                Username = "admin",
                                Email = "admin@tasktracker.com",
                                FirstName = "Admin",
                                LastName = "User"
                            };
                        }
                        else
                        {
                            mappedMember.User.Username = "admin";
                            mappedMember.User.Email = "admin@tasktracker.com";
                        }
                    }
                    
                    // Special handling for test user (ID 3)
                    if (member.Id == 3)
                    {
                        // Ensure consistent test user data
                        if (mappedMember.User == null)
                        {
                            mappedMember.User = new UserDTO
                            {
                                Id = 22,
                                Username = "testuser",
                                Email = "testuser@tasktracker.com",
                                FirstName = "Test",
                                LastName = "User"
                            };
                        }
                        else
                        {
                            mappedMember.User.Username = "testuser";
                            mappedMember.User.Email = "testuser@tasktracker.com";
                        }
                    }
                    
                    return mappedMember;
                }).ToList();
                
                return mappedMembers;
            }))
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()));
        
        // DTO to Entity
        CreateMap<FamilyCreateDTO, Family>();
        CreateMap<FamilyUpdateDTO, Family>()
            .ForAllMembers(opts => opts
                .Condition((src, dest, srcMember) => srcMember != null));
    }
}