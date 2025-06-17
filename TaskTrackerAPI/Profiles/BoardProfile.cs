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
using TaskTrackerAPI.DTOs.Boards;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Profiles;

public class BoardProfile : Profile
{
    public BoardProfile()
    {
        // Board -> BoardDTO
        CreateMap<Board, BoardDTO>()
            .ForMember(dest => dest.Columns, opt => opt.MapFrom(src => src.Columns));
        
        // Board -> BoardDetailDTO
        CreateMap<Board, BoardDetailDTO>()
            .ForMember(dest => dest.Board, opt => opt.MapFrom(src => src))
            .ForMember(dest => dest.Tasks, opt => opt.Ignore())
            .ForMember(dest => dest.TasksByColumn, opt => opt.Ignore())
            .ForMember(dest => dest.TaskCount, opt => opt.Ignore());
        
        // CreateBoardDTO -> Board
        CreateMap<CreateBoardDTO, Board>()
            .ForMember(dest => dest.Columns, opt => opt.Ignore()); // Columns are handled separately in the service
        
        // UpdateBoardDTO -> Board
        CreateMap<UpdateBoardDTO, Board>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        
        // BoardColumnCreateDTO -> BoardColumn
        CreateMap<BoardColumnCreateDTO, BoardColumn>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.BoardId, opt => opt.Ignore()) // Set by service
            .ForMember(dest => dest.MappedStatus, opt => opt.MapFrom(src => src.Status))
            .ForMember(dest => dest.IsHidden, opt => opt.MapFrom(src => false))
            .ForMember(dest => dest.IsDoneColumn, opt => opt.MapFrom(src => src.Status.ToString() == "Completed"))
            .ForMember(dest => dest.TaskLimit, opt => opt.Ignore())
            .ForMember(dest => dest.Icon, opt => opt.Ignore())
            .ForMember(dest => dest.IsCollapsible, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Board, opt => opt.Ignore())
            .ForMember(dest => dest.Description, opt => opt.Ignore());
        
        // BoardColumn -> BoardColumnDTO
        CreateMap<BoardColumn, BoardColumnDTO>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.MappedStatus));
    }
} 