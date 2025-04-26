using AutoMapper;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Profiles;

public class InvitationProfile : Profile
{
    public InvitationProfile()
    {
        // Entity to DTO
        CreateMap<Invitation, InvitationDTO>()
            .ForMember(dest => dest.FamilyRole, opt => opt.MapFrom(src => src.Role));
        
        // DTO to Entity
        CreateMap<InvitationCreateDTO, Invitation>()
            .ForMember(dest => dest.RoleId, opt => opt.MapFrom(src => src.FamilyRoleId));
    }
} 