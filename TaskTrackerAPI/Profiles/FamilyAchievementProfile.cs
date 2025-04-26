using AutoMapper;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Profiles;

public class FamilyAchievementProfile : Profile
{
    public FamilyAchievementProfile()
    {
        // Entity to DTO mappings
        CreateMap<FamilyAchievement, FamilyAchievementDTO>();
        
        CreateMap<FamilyAchievementMember, FamilyAchievementMemberDTO>()
            .ForMember(dest => dest.MemberName, opt => 
                opt.MapFrom(src => src.Member != null ? src.Member.Name : string.Empty));
                
        // DTO to Entity mappings
        CreateMap<FamilyAchievementCreateDTO, FamilyAchievement>();
        
        CreateMap<FamilyAchievementUpdateDTO, FamilyAchievement>()
            .ForAllMembers(opts => opts
                .Condition((src, dest, srcMember) => srcMember != null));
    }
} 