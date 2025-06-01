using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.Models.ML;

namespace TaskTrackerAPI.Repositories.Interfaces
{
    /// <summary>
    /// Repository interface for adaptation learning data
    /// </summary>
    public interface IAdaptationLearningRepository
    {
        // User Learning Profile methods
        Task<UserLearningProfile?> GetUserLearningProfileAsync(int userId);
        Task<UserLearningProfile> CreateUserLearningProfileAsync(UserLearningProfile profile);
        Task<UserLearningProfile> UpdateUserLearningProfileAsync(UserLearningProfile profile);
        Task<bool> DeleteUserLearningProfileAsync(int userId);

        // Recommendation Score methods
        Task<List<RecommendationScore>> GetRecommendationScoresAsync(int userId, int? templateId = null);
        Task<RecommendationScore> CreateRecommendationScoreAsync(RecommendationScore score);
        Task<RecommendationScore> UpdateRecommendationScoreAsync(RecommendationScore score);
        Task<List<RecommendationScore>> GetRecentRecommendationsAsync(int userId, int hours = 24);
        Task<List<RecommendationScore>> GetUnshownRecommendationsAsync(int userId, int count = 10);
        Task MarkRecommendationsAsShownAsync(List<int> recommendationIds);

        // Adaptation Event methods
        Task<List<AdaptationEvent>> GetAdaptationEventsAsync(int userId, DateTime? since = null);
        Task<AdaptationEvent> CreateAdaptationEventAsync(AdaptationEvent adaptationEvent);
        Task<AdaptationEvent> UpdateAdaptationEventAsync(AdaptationEvent adaptationEvent);
        Task<List<AdaptationEvent>> GetRecentAdaptationsAsync(int userId, int days = 30);

        // Analytics methods
        Task<Dictionary<AdaptationEventType, int>> GetAdaptationCountsByTypeAsync(int userId, DateTime? since = null);
        Task<double> GetAdaptationSuccessRateAsync(int userId, AdaptationEventType? eventType = null);
        Task<List<RecommendationScore>> GetFeedbackRecommendationsAsync(int userId, DateTime? since = null);
        Task<Dictionary<string, double>> GetRecommendationMetricsAsync(int userId, DateTime? since = null);

        // Learning analytics
        Task<int> GetUserDataPointCountAsync(int userId);
        Task<double> CalculateLearningVelocityAsync(int userId);
        Task<double> CalculateAdaptationConfidenceAsync(int userId);
        Task<List<(DateTime Date, double SuccessRate)>> GetSuccessRateTrendsAsync(int userId, int days = 30);
    }
} 