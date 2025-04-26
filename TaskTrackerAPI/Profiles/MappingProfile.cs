using AutoMapper;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using System.Linq;

namespace TaskTrackerAPI.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Map from TaskItem to TaskItemDTO
            CreateMap<TaskItem, TaskItemDTO>()
                .ForMember(dest => dest.CategoryName, opt => 
                    opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty))
                .ForMember(dest => dest.Tags, opt => opt.Ignore());
            
            // Map from Tag to TagDTO
            CreateMap<Tag, TagDTO>();
            
            // Map from Category to CategoryDTO
            CreateMap<Category, CategoryDTO>();

             CreateMap<TaskItem, FamilyTaskItemDTO>()
            .ForMember(dest => dest.AssignedByUserName, opt => opt.MapFrom(src => 
                src.AssignedByUser != null ? src.AssignedByUser.Username : null))
            .ForMember(dest => dest.AssignedToUserName, opt => opt.MapFrom(src => 
                src.AssignedToFamilyMember != null ? src.AssignedToFamilyMember.User.Username : null))
            .ForMember(dest => dest.ApprovedByUserName, opt => opt.MapFrom(src => 
                src.ApprovedByUser != null ? src.ApprovedByUser.Username : null))
            .ForMember(dest => dest.FamilyName, opt => opt.MapFrom(src => 
                src.Family != null ? src.Family.Name : null))
            .ForMember(dest => dest.IsApproved, opt => opt.MapFrom(src => 
                src.ApprovedByUserId.HasValue));
        }
    }
}