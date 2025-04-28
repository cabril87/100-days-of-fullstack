using AutoMapper;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Helpers.Profiles
{
    public class TaskTemplateProfile : Profile
    {
        public TaskTemplateProfile()
        {
            // TaskTemplate -> TaskTemplateDTO
            CreateMap<TaskTemplate, TaskTemplateDTO>();
            
            // TaskTemplateDTO -> TaskTemplate
            CreateMap<TaskTemplateDTO, TaskTemplate>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
        }
    }
} 