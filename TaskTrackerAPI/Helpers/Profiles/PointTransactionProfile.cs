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