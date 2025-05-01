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
using TaskTrackerAPI.DTOs.Boards;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Profiles;

public class BoardProfile : Profile
{
    public BoardProfile()
    {
        // Board -> BoardDTO
        CreateMap<Board, BoardDTO>();
        
        // Board -> BoardDetailDTO
        CreateMap<Board, BoardDetailDTO>();
        
        // CreateBoardDTO -> Board
        CreateMap<CreateBoardDTO, Board>();
        
        // UpdateBoardDTO -> Board
        CreateMap<UpdateBoardDTO, Board>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
    }
} 