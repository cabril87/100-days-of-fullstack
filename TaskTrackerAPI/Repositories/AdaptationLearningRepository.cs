using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models.ML;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories
{
    /// <summary>
    /// Repository implementation for adaptation learning data
    /// </summary>
    public class AdaptationLearningRepository : IAdaptationLearningRepository
    {
        private readonly ApplicationDbContext _context;

        public AdaptationLearningRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        #region User Learning Profile Methods

        public async Task<UserLearningProfile?> GetUserLearningProfileAsync(int userId)
        {
            return await _context.UserLearningProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);
        }

        public async Task<UserLearningProfile> CreateUserLearningProfileAsync(UserLearningProfile profile)
        {
            _context.UserLearningProfiles.Add(profile);
            await _context.SaveChangesAsync();
            return profile;
        }

        public async Task<UserLearningProfile> UpdateUserLearningProfileAsync(UserLearningProfile profile)
        {
            profile.UpdatedAt = DateTime.UtcNow;
            _context.UserLearningProfiles.Update(profile);
            await _context.SaveChangesAsync();
            return profile;
        }

        public async Task<bool> DeleteUserLearningProfileAsync(int userId)
        {
            UserLearningProfile? profile = await GetUserLearningProfileAsync(userId);
            if (profile == null) return false;

            _context.UserLearningProfiles.Remove(profile);
            await _context.SaveChangesAsync();
            return true;
        }

        #endregion

        #region Recommendation Score Methods

        public async Task<List<RecommendationScore>> GetRecommendationScoresAsync(int userId, int? templateId = null)
        {
            IQueryable<RecommendationScore> query = _context.RecommendationScores
                .Include(r => r.User)
                .Include(r => r.Template)
                .Where(r => r.UserId == userId);

            if (templateId.HasValue)
            {
                query = query.Where(r => r.TemplateId == templateId.Value);
            }

            return await query
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<RecommendationScore> CreateRecommendationScoreAsync(RecommendationScore score)
        {
            _context.RecommendationScores.Add(score);
            await _context.SaveChangesAsync();
            return score;
        }

        public async Task<RecommendationScore> UpdateRecommendationScoreAsync(RecommendationScore score)
        {
            score.UpdatedAt = DateTime.UtcNow;
            _context.RecommendationScores.Update(score);
            await _context.SaveChangesAsync();
            return score;
        }

        public async Task<List<RecommendationScore>> GetRecentRecommendationsAsync(int userId, int hours = 24)
        {
            DateTime cutoffTime = DateTime.UtcNow.AddHours(-hours);
            return await _context.RecommendationScores
                .Include(r => r.Template)
                .Where(r => r.UserId == userId && r.CreatedAt >= cutoffTime)
                .OrderByDescending(r => r.Score)
                .ToListAsync();
        }

        public async Task<List<RecommendationScore>> GetUnshownRecommendationsAsync(int userId, int count = 10)
        {
            return await _context.RecommendationScores
                .Include(r => r.Template)
                .Where(r => r.UserId == userId && !r.WasShown)
                .OrderByDescending(r => r.Score)
                .ThenByDescending(r => r.Confidence)
                .Take(count)
                .ToListAsync();
        }

        public async Task MarkRecommendationsAsShownAsync(List<int> recommendationIds)
        {
            List<RecommendationScore> recommendations = await _context.RecommendationScores
                .Where(r => recommendationIds.Contains(r.Id))
                .ToListAsync();

            foreach (RecommendationScore recommendation in recommendations)
            {
                recommendation.WasShown = true;
                recommendation.ShownAt = DateTime.UtcNow;
                recommendation.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        #endregion

        #region Adaptation Event Methods

        public async Task<List<AdaptationEvent>> GetAdaptationEventsAsync(int userId, DateTime? since = null)
        {
            IQueryable<AdaptationEvent> query = _context.AdaptationEvents
                .Include(e => e.User)
                .Where(e => e.UserId == userId);

            if (since.HasValue)
            {
                query = query.Where(e => e.CreatedAt >= since.Value);
            }

            return await query
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();
        }

        public async Task<AdaptationEvent> CreateAdaptationEventAsync(AdaptationEvent adaptationEvent)
        {
            _context.AdaptationEvents.Add(adaptationEvent);
            await _context.SaveChangesAsync();
            return adaptationEvent;
        }

        public async Task<AdaptationEvent> UpdateAdaptationEventAsync(AdaptationEvent adaptationEvent)
        {
            _context.AdaptationEvents.Update(adaptationEvent);
            await _context.SaveChangesAsync();
            return adaptationEvent;
        }

        public async Task<List<AdaptationEvent>> GetRecentAdaptationsAsync(int userId, int days = 30)
        {
            DateTime cutoffDate = DateTime.UtcNow.AddDays(-days);
            return await _context.AdaptationEvents
                .Where(e => e.UserId == userId && e.CreatedAt >= cutoffDate)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();
        }

        #endregion

        #region Analytics Methods

        public async Task<Dictionary<AdaptationEventType, int>> GetAdaptationCountsByTypeAsync(int userId, DateTime? since = null)
        {
            IQueryable<AdaptationEvent> query = _context.AdaptationEvents
                .Where(e => e.UserId == userId);

            if (since.HasValue)
            {
                query = query.Where(e => e.CreatedAt >= since.Value);
            }

            return await query
                .GroupBy(e => e.EventType)
                .ToDictionaryAsync(g => g.Key, g => g.Count());
        }

        public async Task<double> GetAdaptationSuccessRateAsync(int userId, AdaptationEventType? eventType = null)
        {
            IQueryable<AdaptationEvent> query = _context.AdaptationEvents
                .Where(e => e.UserId == userId && e.WasSuccessful.HasValue);

            if (eventType.HasValue)
            {
                query = query.Where(e => e.EventType == eventType.Value);
            }

            List<AdaptationEvent> events = await query.ToListAsync();
            if (!events.Any()) return 0.0;

            return events.Count(e => e.WasSuccessful == true) / (double)events.Count;
        }

        public async Task<List<RecommendationScore>> GetFeedbackRecommendationsAsync(int userId, DateTime? since = null)
        {
            IQueryable<RecommendationScore> query = _context.RecommendationScores
                .Include(r => r.Template)
                .Where(r => r.UserId == userId && r.UserFeedback.HasValue);

            if (since.HasValue)
            {
                query = query.Where(r => r.FeedbackAt >= since.Value);
            }

            return await query
                .OrderByDescending(r => r.FeedbackAt)
                .ToListAsync();
        }

        public async Task<Dictionary<string, double>> GetRecommendationMetricsAsync(int userId, DateTime? since = null)
        {
            IQueryable<RecommendationScore> query = _context.RecommendationScores
                .Where(r => r.UserId == userId);

            if (since.HasValue)
            {
                query = query.Where(r => r.CreatedAt >= since.Value);
            }

            List<RecommendationScore> recommendations = await query.ToListAsync();
            if (!recommendations.Any())
            {
                return new Dictionary<string, double>
                {
                    ["TotalRecommendations"] = 0,
                    ["AcceptanceRate"] = 0,
                    ["UsageRate"] = 0,
                    ["AverageConfidence"] = 0,
                    ["AverageSatisfaction"] = 0
                };
            }

            List<RecommendationScore> shown = recommendations.Where(r => r.WasShown).ToList();
            List<RecommendationScore> accepted = recommendations.Where(r => r.UserFeedback == 1).ToList();
            List<RecommendationScore> used = recommendations.Where(r => r.WasUsed).ToList();
            List<RecommendationScore> rated = recommendations.Where(r => r.SatisfactionRating.HasValue).ToList();

            return new Dictionary<string, double>
            {
                ["TotalRecommendations"] = recommendations.Count,
                ["AcceptanceRate"] = shown.Any() ? accepted.Count / (double)shown.Count : 0,
                ["UsageRate"] = recommendations.Count > 0 ? used.Count / (double)recommendations.Count : 0,
                ["AverageConfidence"] = recommendations.Average(r => r.Confidence),
                ["AverageSatisfaction"] = rated.Any() ? rated.Average(r => r.SatisfactionRating!.Value) : 0
            };
        }

        #endregion

        #region Learning Analytics Methods

        public async Task<int> GetUserDataPointCountAsync(int userId)
        {
            // Count various data points: task completions, template uses, adaptations, feedback
            int taskCount = await _context.TaskItems.CountAsync(t => t.UserId == userId);
            int templateUseCount = await _context.TemplateUsageAnalytics.CountAsync(u => u.UserId == userId);
            int adaptationCount = await _context.AdaptationEvents.CountAsync(e => e.UserId == userId);
            int feedbackCount = await _context.RecommendationScores.CountAsync(r => r.UserId == userId && r.UserFeedback.HasValue);

            return taskCount + templateUseCount + adaptationCount + feedbackCount;
        }

        public async Task<double> CalculateLearningVelocityAsync(int userId)
        {
            List<AdaptationEvent> recentAdaptations = await GetRecentAdaptationsAsync(userId, 30);
            if (!recentAdaptations.Any()) return 1.0;

            // Calculate learning velocity based on adaptation frequency and success rate
            double adaptationsPerWeek = recentAdaptations.Count / 4.0; // 30 days / ~4 weeks
            double successRate = await GetAdaptationSuccessRateAsync(userId);
            double confidenceAvg = recentAdaptations.Average(a => a.Confidence);

            // Normalize to 0.1 - 5.0 range
            double velocity = (adaptationsPerWeek * successRate * confidenceAvg) + 0.5;
            return Math.Max(0.1, Math.Min(5.0, velocity));
        }

        public async Task<double> CalculateAdaptationConfidenceAsync(int userId)
        {
            int dataPointCount = await GetUserDataPointCountAsync(userId);
            double recentSuccessRate = await GetAdaptationSuccessRateAsync(userId);
            List<AdaptationEvent> recentAdaptations = await GetRecentAdaptationsAsync(userId, 30);

            if (!recentAdaptations.Any()) return 0.1;

            // Calculate confidence based on data points, success rate, and consistency
            double dataPointConfidence = Math.Min(1.0, dataPointCount / 100.0); // Max at 100 data points
            double successConfidence = recentSuccessRate;
            double consistencyConfidence = recentAdaptations.Any() ? recentAdaptations.Average(a => a.Confidence) : 0.5;

            return (dataPointConfidence + successConfidence + consistencyConfidence) / 3.0;
        }

        public async Task<List<(DateTime Date, double SuccessRate)>> GetSuccessRateTrendsAsync(int userId, int days = 30)
        {
            DateTime startDate = DateTime.UtcNow.AddDays(-days);
            List<AdaptationEvent> adaptations = await _context.AdaptationEvents
                .Where(e => e.UserId == userId && e.CreatedAt >= startDate && e.WasSuccessful.HasValue)
                .OrderBy(e => e.CreatedAt)
                .ToListAsync();

            if (!adaptations.Any())
            {
                return new List<(DateTime Date, double SuccessRate)>();
            }

            // Group by week and calculate success rate trends
            List<(DateTime Date, double SuccessRate)> trends = adaptations
                .GroupBy(a => new DateTime(a.CreatedAt.Year, a.CreatedAt.Month, a.CreatedAt.Day).AddDays(-(int)a.CreatedAt.DayOfWeek))
                .Select(g => (
                    Date: g.Key,
                    SuccessRate: g.Count(a => a.WasSuccessful == true) / (double)g.Count()
                ))
                .OrderBy(t => t.Date)
                .ToList();

            return trends;
        }

        #endregion
    }
} 