using AutoMapper;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.DTOs.Gamification;

namespace TaskTrackerAPI.Profiles
{
    public class GamificationProfile : Profile
    {
        public GamificationProfile()
        {
            // Map from GamificationSuggestion to GamificationSuggestionDetailDTO
            CreateMap<GamificationSuggestion, GamificationSuggestionDetailDTO>()
                .ForMember(dest => dest.SuggestionType, opt => opt.MapFrom(src => src.Type))
                .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => (int)Math.Round(src.RelevanceScore * 10)))
                .ForMember(dest => dest.RequiredPoints, opt => opt.MapFrom(src => src.PotentialPoints > 0 ? src.PotentialPoints : (int?)null));
                
            // Map from GamificationSuggestionDetailDTO to GamificationSuggestion
            CreateMap<GamificationSuggestionDetailDTO, GamificationSuggestion>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.SuggestionType))
                .ForMember(dest => dest.RelevanceScore, opt => opt.MapFrom(src => src.Priority / 10.0))
                .ForMember(dest => dest.PotentialPoints, opt => opt.MapFrom(src => src.RequiredPoints ?? 0));
        }
    }
} 