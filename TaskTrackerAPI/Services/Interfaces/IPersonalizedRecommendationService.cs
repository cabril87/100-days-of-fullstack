using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.ML;

namespace TaskTrackerAPI.Services.Interfaces
{
    /// <summary>
    /// Service interface for personalized template recommendations
    /// </summary>
    public interface IPersonalizedRecommendationService
    {
        // Recommendation generation
        Task<List<TemplateRecommendationDto>> GetPersonalizedRecommendationsAsync(RecommendationRequestDto request);
        Task<List<TemplateRecommendationDto>> GetRecommendationsForContextAsync(int userId, Dictionary<string, object> context);
        Task<TemplateRecommendationDto?> GetRecommendationForTemplateAsync(int userId, int templateId);

        // Recommendation scoring
        Task<double> CalculateTemplateScoreAsync(int userId, int templateId, Dictionary<string, object>? context = null);
        Task<List<RecommendationScoreDto>> GenerateRecommendationScoresAsync(int userId, List<int> templateIds);
        Task<RecommendationScoreDto> CreateRecommendationScoreAsync(int userId, int templateId, double score, double confidence, string reason);

        // Recommendation feedback
        Task<RecommendationScoreDto> RecordRecommendationFeedbackAsync(RecommendationFeedbackDto feedbackDto);
        Task MarkRecommendationsAsShownAsync(List<int> recommendationIds);
        Task<RecommendationScoreDto> RecordTemplateUsageAsync(int userId, int templateId);

        // Recommendation analytics
        Task<RecommendationMetricsDto> GetRecommendationMetricsAsync(int userId, DateTime? since = null);
        Task<List<RecommendationScoreDto>> GetRecommendationHistoryAsync(int userId, int? templateId = null);
        Task<Dictionary<string, double>> GetRecommendationPerformanceAsync(int userId);

        // Algorithm management
        Task RefreshRecommendationsAsync(int userId);
        Task<List<TemplateRecommendationDto>> GetFallbackRecommendationsAsync(int userId);
        Task OptimizeRecommendationAlgorithmAsync(int userId);
    }
} 