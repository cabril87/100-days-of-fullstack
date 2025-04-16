using AutoMapper;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Map from TaskItem to TaskItemDTO
            CreateMap<TaskItem, TaskItemDTO>()
                .ForMember(dest => dest.CategoryName, opt => 
                    opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty));
            
            // Map from Tag to TagDTO
            CreateMap<Tag, TagDTO>();
        }
    }
}