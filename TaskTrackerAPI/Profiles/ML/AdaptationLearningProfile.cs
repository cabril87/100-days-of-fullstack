using System;
using AutoMapper;
using TaskTrackerAPI.DTOs.ML;
using TaskTrackerAPI.Models.ML;

namespace TaskTrackerAPI.Profiles.ML
{
    /// <summary>
    /// AutoMapper profile for adaptation learning models and DTOs
    /// </summary>
    public class AdaptationLearningProfile : Profile
    {
        public AdaptationLearningProfile()
        {
            // User Learning Profile mappings
            CreateMap<UserLearningProfile, UserLearningProfileDto>();
            
            CreateMap<CreateUserLearningProfileDto, UserLearningProfile>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.LearningVelocity, opt => opt.MapFrom(src => 1.0))
                .ForMember(dest => dest.SuccessPattern, opt => opt.MapFrom(src => "{}"))
                .ForMember(dest => dest.ProcrastinationTendency, opt => opt.MapFrom(src => 0.3))
                .ForMember(dest => dest.FocusPattern, opt => opt.MapFrom(src => "{}"))
                .ForMember(dest => dest.UsageFrequencyPattern, opt => opt.MapFrom(src => "{}"))
                .ForMember(dest => dest.MotivationFactors, opt => opt.MapFrom(src => "{}"))
                .ForMember(dest => dest.ChallengeAcceptanceRate, opt => opt.MapFrom(src => 0.5))
                .ForMember(dest => dest.LastAdaptationDate, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.AdaptationConfidence, opt => opt.MapFrom(src => 0.1))
                .ForMember(dest => dest.DataPointCount, opt => opt.MapFrom(src => 0))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            // Recommendation Score mappings
            CreateMap<RecommendationScore, RecommendationScoreDto>();
            
            CreateMap<RecommendationFeedbackDto, RecommendationScore>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.RecommendationId))
                .ForMember(dest => dest.UserFeedback, opt => opt.MapFrom(src => src.UserFeedback))
                .ForMember(dest => dest.SatisfactionRating, opt => opt.MapFrom(src => src.SatisfactionRating))
                .ForMember(dest => dest.WasUsed, opt => opt.MapFrom(src => src.WasUsed))
                .ForMember(dest => dest.FeedbackAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            // Adaptation Event mappings
            CreateMap<AdaptationEvent, AdaptationEventDto>();
            
            CreateMap<CreateAdaptationEventDto, AdaptationEvent>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Context, opt => opt.Ignore()) // Will be set manually in service
                .ForMember(dest => dest.OldValues, opt => opt.Ignore()) // Will be set manually in service
                .ForMember(dest => dest.NewValues, opt => opt.Ignore()) // Will be set manually in service
                .ForMember(dest => dest.AlgorithmVersion, opt => opt.MapFrom(src => "1.0"))
                .ForMember(dest => dest.WasSuccessful, opt => opt.Ignore())
                .ForMember(dest => dest.SuccessRateAfter, opt => opt.Ignore())
                .ForMember(dest => dest.UserFeedback, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.MeasuredAt, opt => opt.Ignore());

            CreateMap<AdaptationFeedbackDto, AdaptationEvent>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.AdaptationEventId))
                .ForMember(dest => dest.WasSuccessful, opt => opt.MapFrom(src => src.WasSuccessful))
                .ForMember(dest => dest.SuccessRateAfter, opt => opt.MapFrom(src => src.SuccessRateAfter))
                .ForMember(dest => dest.UserFeedback, opt => opt.MapFrom(src => src.UserFeedback))
                .ForMember(dest => dest.MeasuredAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            // Template Recommendation mappings
            CreateMap<RecommendationRequestDto, RecommendationScore>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));
        }
    }
} 