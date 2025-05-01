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
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Helpers.Profiles
{
    public class NoteProfile : Profile
    {
        public NoteProfile()
        {
            // Note -> NoteDTO
            CreateMap<Note, NoteDTO>()
                .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category.ToString()))
                .ForMember(dest => dest.Format, opt => opt.MapFrom(src => src.Format.ToString()))
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.Username : string.Empty));
            
            // NoteCreateDTO -> Note
            CreateMap<NoteCreateDTO, Note>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.TaskItem, opt => opt.Ignore());
            
            // NoteUpdateDTO -> Note
            CreateMap<NoteUpdateDTO, Note>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
} 