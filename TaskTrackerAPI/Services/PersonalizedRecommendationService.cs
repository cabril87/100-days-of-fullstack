using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using TaskTrackerAPI.DTOs.ML;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Models.ML;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services
{
    /// <summary>
    /// Service implementation for personalized template recommendations
    /// </summary>
    public class PersonalizedRecommendationService : IPersonalizedRecommendationService
    {
        private readonly IAdaptationLearningRepository _adaptationRepository;
        private readonly ITaskTemplateRepository _templateRepository;
        private readonly ITaskItemRepository _taskRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<PersonalizedRecommendationService> _logger;

        private const string ALGORITHM_VERSION = "2.0";

        public PersonalizedRecommendationService(
            IAdaptationLearningRepository adaptationRepository,
            ITaskTemplateRepository templateRepository,
            ITaskItemRepository taskRepository,
            IMapper mapper,
            ILogger<PersonalizedRecommendationService> logger)
        {
            _adaptationRepository = adaptationRepository;
            _templateRepository = templateRepository;
            _taskRepository = taskRepository;
            _mapper = mapper;
            _logger = logger;
        }

        #region Recommendation Generation

        public async Task<List<TemplateRecommendationDto>> GetPersonalizedRecommendationsAsync(RecommendationRequestDto request)
        {
            _logger.LogInformation("Generating personalized recommendations for user {UserId}", request.UserId);

            UserLearningProfile? userProfile = await _adaptationRepository.GetUserLearningProfileAsync(request.UserId);
            if (userProfile == null)
            {
                return await GetFallbackRecommendationsAsync(request.UserId);
            }

            IEnumerable<TaskTemplate> templates = await _templateRepository.GetAllTaskTemplatesAsync();
            List<TemplateRecommendationDto> recommendations = new List<TemplateRecommendationDto>();

            foreach (TaskTemplate template in templates.Take(request.Count))
            {
                TemplateRecommendationDto recommendation = new TemplateRecommendationDto
                {
                    TemplateId = template.Id,
                    TemplateName = template.Name,
                    TemplateDescription = template.Description ?? "",
                    CategoryId = null,
                    CategoryName = template.Category ?? "",
                    Score = 0.7,
                    Confidence = 0.6,
                    RecommendationReason = "Recommended based on user profile",
                    AlgorithmVersion = ALGORITHM_VERSION,
                    CreatedAt = DateTime.UtcNow
                };

                recommendations.Add(recommendation);
            }

            return recommendations;
        }

        public async Task<List<TemplateRecommendationDto>> GetRecommendationsForContextAsync(int userId, Dictionary<string, object> context)
        {
            RecommendationRequestDto request = new RecommendationRequestDto
            {
                UserId = userId,
                Context = context,
                Count = 5,
                IncludeReasons = true
            };

            return await GetPersonalizedRecommendationsAsync(request);
        }

        public async Task<TemplateRecommendationDto?> GetRecommendationForTemplateAsync(int userId, int templateId)
        {
            TaskTemplate? template = await _templateRepository.GetTaskTemplateByIdAsync(templateId);
            if (template == null) return null;

            UserLearningProfile? userProfile = await _adaptationRepository.GetUserLearningProfileAsync(userId);
            if (userProfile == null) return null;

            return new TemplateRecommendationDto
            {
                TemplateId = template.Id,
                TemplateName = template.Name,
                TemplateDescription = template.Description ?? "",
                CategoryId = null,
                CategoryName = template.Category ?? "",
                Score = 0.7,
                Confidence = 0.6,
                RecommendationReason = "Recommended based on template analysis",
                AlgorithmVersion = ALGORITHM_VERSION,
                CreatedAt = DateTime.UtcNow
            };
        }

        #endregion

        #region Recommendation Scoring

        public async Task<double> CalculateTemplateScoreAsync(int userId, int templateId, Dictionary<string, object>? context = null)
        {
            UserLearningProfile? userProfile = await _adaptationRepository.GetUserLearningProfileAsync(userId);
            TaskTemplate? template = await _templateRepository.GetTaskTemplateByIdAsync(templateId);
            
            if (userProfile == null || template == null) return 0.0;

            // Simplified scoring for now
            return 0.7;
        }

        public async Task<List<RecommendationScoreDto>> GenerateRecommendationScoresAsync(int userId, List<int> templateIds)
        {
            List<RecommendationScoreDto> scores = new List<RecommendationScoreDto>();

            foreach (int templateId in templateIds)
            {
                double score = await CalculateTemplateScoreAsync(userId, templateId);
                TaskTemplate? template = await _templateRepository.GetTaskTemplateByIdAsync(templateId);
                UserLearningProfile? userProfile = await _adaptationRepository.GetUserLearningProfileAsync(userId);

                if (template != null && userProfile != null)
                {
                    RecommendationScoreDto recommendationScore = await CreateRecommendationScoreAsync(
                        userId, templateId, score, 0.6, "Generated recommendation");
                    scores.Add(recommendationScore);
                }
            }

            return scores;
        }

        public async Task<RecommendationScoreDto> CreateRecommendationScoreAsync(int userId, int templateId, double score, double confidence, string reason)
        {
            RecommendationScore recommendationScore = new RecommendationScore
            {
                UserId = userId,
                TemplateId = templateId,
                Score = score,
                Confidence = confidence,
                RecommendationReason = reason,
                AlgorithmVersion = ALGORITHM_VERSION,
                ScoringFactors = "{}",
                RecommendationContext = JsonConvert.SerializeObject(new { timestamp = DateTime.UtcNow }),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            RecommendationScore created = await _adaptationRepository.CreateRecommendationScoreAsync(recommendationScore);
            return _mapper.Map<RecommendationScoreDto>(created);
        }

        #endregion

        #region Recommendation Feedback

        public async Task<RecommendationScoreDto> RecordRecommendationFeedbackAsync(RecommendationFeedbackDto feedbackDto)
        {
            List<RecommendationScore> recommendations = await _adaptationRepository.GetRecommendationScoresAsync(feedbackDto.RecommendationId);
            RecommendationScore? recommendation = recommendations.FirstOrDefault(r => r.Id == feedbackDto.RecommendationId);

            if (recommendation == null)
            {
                throw new InvalidOperationException($"Recommendation {feedbackDto.RecommendationId} not found");
            }

            recommendation.UserFeedback = feedbackDto.UserFeedback;
            recommendation.SatisfactionRating = feedbackDto.SatisfactionRating;
            recommendation.WasUsed = feedbackDto.WasUsed;
            recommendation.FeedbackAt = DateTime.UtcNow;
            recommendation.UpdatedAt = DateTime.UtcNow;

            RecommendationScore updated = await _adaptationRepository.UpdateRecommendationScoreAsync(recommendation);
            return _mapper.Map<RecommendationScoreDto>(updated);
        }

        public async Task MarkRecommendationsAsShownAsync(List<int> recommendationIds)
        {
            await _adaptationRepository.MarkRecommendationsAsShownAsync(recommendationIds);
        }

        public async Task<RecommendationScoreDto> RecordTemplateUsageAsync(int userId, int templateId)
        {
            List<RecommendationScore> existingRecommendations = await _adaptationRepository.GetRecommendationScoresAsync(userId, templateId);
            RecommendationScore? latestRecommendation = existingRecommendations
                .OrderByDescending(r => r.CreatedAt)
                .FirstOrDefault();

            if (latestRecommendation != null)
            {
                latestRecommendation.WasUsed = true;
                latestRecommendation.UpdatedAt = DateTime.UtcNow;
                
                if (!latestRecommendation.UserFeedback.HasValue)
                {
                    latestRecommendation.UserFeedback = 1; // Implicit positive feedback for usage
                }

                RecommendationScore updated = await _adaptationRepository.UpdateRecommendationScoreAsync(latestRecommendation);
                return _mapper.Map<RecommendationScoreDto>(updated);
            }

            // Create a new recommendation score for usage tracking
            return await CreateRecommendationScoreAsync(userId, templateId, 0.8, 0.7, "Used template");
        }

        #endregion

        #region Recommendation Analytics

        public async Task<RecommendationMetricsDto> GetRecommendationMetricsAsync(int userId, DateTime? since = null)
        {
            Dictionary<string, double> metrics = await _adaptationRepository.GetRecommendationMetricsAsync(userId, since);
            List<RecommendationScore> recommendations = await _adaptationRepository.GetRecommendationScoresAsync(userId);

            if (since.HasValue)
            {
                recommendations = recommendations.Where(r => r.CreatedAt >= since.Value).ToList();
            }

            Dictionary<string, int> categoryCounts = new Dictionary<string, int>();

            foreach (RecommendationScore rec in recommendations)
            {
                TaskTemplate? template = await _templateRepository.GetTaskTemplateByIdAsync(rec.TemplateId);
                string categoryName = template?.Category ?? "Unknown";
                categoryCounts[categoryName] = categoryCounts.GetValueOrDefault(categoryName, 0) + 1;
            }

            return new RecommendationMetricsDto
            {
                TotalRecommendations = (int)metrics.GetValueOrDefault("TotalRecommendations", 0),
                RecommendationsShown = recommendations.Count(r => r.WasShown),
                RecommendationsAccepted = recommendations.Count(r => r.UserFeedback == 1),
                RecommendationsUsed = recommendations.Count(r => r.WasUsed),
                AcceptanceRate = metrics.GetValueOrDefault("AcceptanceRate", 0),
                UsageRate = metrics.GetValueOrDefault("UsageRate", 0),
                AverageConfidence = metrics.GetValueOrDefault("AverageConfidence", 0),
                AverageSatisfactionRating = metrics.GetValueOrDefault("AverageSatisfaction", 0),
                RecommendationsByCategory = categoryCounts,
                PerformanceByAlgorithmVersion = new Dictionary<string, double>(),
                PeriodStart = since ?? DateTime.UtcNow.AddDays(-30),
                PeriodEnd = DateTime.UtcNow
            };
        }

        public async Task<List<RecommendationScoreDto>> GetRecommendationHistoryAsync(int userId, int? templateId = null)
        {
            List<RecommendationScore> recommendations = await _adaptationRepository.GetRecommendationScoresAsync(userId, templateId);
            return recommendations.Select(r => _mapper.Map<RecommendationScoreDto>(r)).ToList();
        }

        public async Task<Dictionary<string, double>> GetRecommendationPerformanceAsync(int userId)
        {
            return await _adaptationRepository.GetRecommendationMetricsAsync(userId);
        }

        #endregion

        #region Algorithm Management

        public async Task RefreshRecommendationsAsync(int userId)
        {
            _logger.LogInformation("Refreshing recommendations for user {UserId}", userId);

            IEnumerable<TaskTemplate> templates = await _templateRepository.GetAllTaskTemplatesAsync();
            List<int> templateIds = templates.Select(t => t.Id).ToList();

            await GenerateRecommendationScoresAsync(userId, templateIds);

            _logger.LogInformation("Refreshed recommendations for {Count} templates for user {UserId}", 
                templateIds.Count, userId);
        }

        public async Task<List<TemplateRecommendationDto>> GetFallbackRecommendationsAsync(int userId)
        {
            IEnumerable<TaskTemplate> templates = await _templateRepository.GetPopularTemplatesAsync(10);
            
            return templates.Select(template => new TemplateRecommendationDto
            {
                TemplateId = template.Id,
                TemplateName = template.Name,
                TemplateDescription = template.Description ?? "",
                CategoryId = null,
                CategoryName = template.Category ?? "",
                Score = 0.7,
                Confidence = 0.5,
                RecommendationReason = "Popular template - recommended due to high general usage",
                AlgorithmVersion = ALGORITHM_VERSION,
                CreatedAt = DateTime.UtcNow
            }).ToList();
        }

        public async Task OptimizeRecommendationAlgorithmAsync(int userId)
        {
            _logger.LogInformation("Optimizing recommendation algorithm for user {UserId}", userId);
            
            Dictionary<string, double> metrics = await GetRecommendationPerformanceAsync(userId);
            double acceptanceRate = metrics.GetValueOrDefault("AcceptanceRate", 0);
            
            if (acceptanceRate < 0.3)
            {
                _logger.LogWarning("Low acceptance rate ({AcceptanceRate}) for user {UserId} - algorithm needs improvement", 
                    acceptanceRate, userId);
            }
        }

        #endregion
    }
} 