using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.ML;
using TaskTrackerAPI.Models.ML;

namespace TaskTrackerAPI.Services.Interfaces
{
    /// <summary>
    /// Service interface for adaptation learning system
    /// </summary>
    public interface IAdaptationLearningService
    {
        // User Learning Profile management
        Task<UserLearningProfileDto?> GetUserLearningProfileAsync(int userId);
        Task<UserLearningProfileDto> CreateUserLearningProfileAsync(CreateUserLearningProfileDto createDto);
        Task<UserLearningProfileDto> UpdateUserLearningProfileAsync(int userId, UpdateUserLearningProfileDto updateDto);
        Task<bool> DeleteUserLearningProfileAsync(int userId);

        // Adaptation and learning
        Task<UserLearningProfileDto> AdaptUserPreferencesAsync(int userId);
        Task<AdaptationEventDto> RecordAdaptationEventAsync(CreateAdaptationEventDto createDto);
        Task<AdaptationEventDto> UpdateAdaptationFeedbackAsync(int adaptationEventId, AdaptationFeedbackDto feedbackDto);

        // Learning analytics
        Task<AdaptationMetricsDto> GetAdaptationMetricsAsync(int userId, DateTime? since = null);
        Task<LearningInsightsDto> GetLearningInsightsAsync(int userId);
        Task<List<AdaptationTrendDto>> GetAdaptationTrendsAsync(int userId, int days = 30);

        // Continuous learning
        Task ProcessUserBehaviorDataAsync(int userId, Dictionary<string, object> behaviorData);
        Task<bool> ShouldTriggerAdaptationAsync(int userId);
        Task<List<RecommendationInsightDto>> GeneratePersonalizationInsightsAsync(int userId);
    }
} 