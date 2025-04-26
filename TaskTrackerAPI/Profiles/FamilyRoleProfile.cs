using AutoMapper;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Profiles;

public class FamilyRoleProfile : Profile
{
    public FamilyRoleProfile()
    {
        // Entity to DTO
        CreateMap<FamilyRole, FamilyRoleDTO>();
        
        // DTO to Entity
        CreateMap<FamilyRoleCreateDTO, FamilyRole>();
        CreateMap<FamilyRoleUpdateDTO, FamilyRole>()
            .ForAllMembers(opts => opts
                .Condition((src, dest, srcMember) => srcMember != null));
    }
} 