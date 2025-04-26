using AutoMapper;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Profiles;

public class FamilyMemberProfile : Profile
{
    public FamilyMemberProfile()
    {
        // Entity to DTO
        CreateMap<FamilyMember, FamilyMemberDTO>()
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role));
        CreateMap<FamilyMember, FamilyPersonDTO>();
        CreateMap<FamilyMember, FamilyPersonDetailDTO>();

        // DTO to Entity
        CreateMap<FamilyMemberCreateDTO, FamilyMember>();
        CreateMap<CreateFamilyPersonDTO, FamilyMember>();
        CreateMap<FamilyMemberUpdateDTO, FamilyMember>();
        CreateMap<UpdateFamilyPersonDTO, FamilyMember>()
            .ForAllMembers(opts => opts
                .Condition((src, dest, srcMember) => srcMember != null));
    }
} 