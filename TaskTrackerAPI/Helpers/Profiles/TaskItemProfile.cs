using AutoMapper;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Helpers.Profiles
{
    public class TaskItemProfile : Profile
    {
        public TaskItemProfile()
        {
            // TaskItem -> TaskItemDTO
            CreateMap<TaskItem, TaskItemDTO>()
                .ForMember(dest => dest.CategoryName, opt => 
                    opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty))
                .ForMember(dest => dest.Tags, opt => opt.Ignore());
            
            // TaskItem -> TaskItemResponseDTO (for API responses)
            CreateMap<TaskItem, TaskItemResponseDTO>()
                .ForMember(dest => dest.CategoryName, opt => 
                    opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty))
                .ForMember(dest => dest.Tags, opt => opt.Ignore());
            
            // TaskItemDTO -> TaskItemResponseDTO
            CreateMap<TaskItemDTO, TaskItemResponseDTO>();
            
            // TaskItem -> TaskItemDetailResponseDTO
            CreateMap<TaskItem, TaskItemDetailResponseDTO>()
                .ForMember(dest => dest.Task, opt => opt.MapFrom(src => src));
            
            // TaskItemCreateRequestDTO -> TaskItem
            CreateMap<TaskItemCreateRequestDTO, TaskItem>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CompletedAt, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.AssignedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.AssignedToFamilyMember, opt => opt.Ignore())
                .ForMember(dest => dest.ApprovedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.Family, opt => opt.Ignore());
            
            // TaskItemUpdateRequestDTO -> TaskItem
            CreateMap<TaskItemUpdateRequestDTO, TaskItem>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
} 