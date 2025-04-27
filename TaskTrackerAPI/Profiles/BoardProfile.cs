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