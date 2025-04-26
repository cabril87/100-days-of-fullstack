using AutoMapper;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Profiles;

public class FamilyProfile : Profile
{
    public FamilyProfile()
    {
        // Entity to DTO
        CreateMap<Family, FamilyDTO>();
        
        // DTO to Entity
        CreateMap<FamilyCreateDTO, Family>();
        CreateMap<FamilyUpdateDTO, Family>()
            .ForAllMembers(opts => opts
                .Condition((src, dest, srcMember) => srcMember != null));
    }
}