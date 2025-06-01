using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TaskTrackerAPI.Models.ML;

namespace TaskTrackerAPI.DTOs.ML
{
    /// <summary>
    /// DTO for Adaptation Event
    /// </summary>
    public class AdaptationEventDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public AdaptationEventType EventType { get; set; }
        public string Context { get; set; } = "{}";
        public string OldValues { get; set; } = "{}";
        public string NewValues { get; set; } = "{}";
        
        [Range(0.0, 1.0)]
        public double Confidence { get; set; }
        
        [Range(0.0, 1.0)]
        public double Impact { get; set; }
        
        public int DataPointsUsed { get; set; }
        public string AlgorithmVersion { get; set; } = "1.0";
        public double? SuccessRateBefore { get; set; }
        public double? SuccessRateAfter { get; set; }
        public bool? WasSuccessful { get; set; }
        public string? UserFeedback { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? MeasuredAt { get; set; }
    }

    /// <summary>
    /// DTO for creating adaptation events
    /// </summary>
    public class CreateAdaptationEventDto
    {
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public AdaptationEventType EventType { get; set; }
        
        public Dictionary<string, object> Context { get; set; } = new();
        public Dictionary<string, object> OldValues { get; set; } = new();
        public Dictionary<string, object> NewValues { get; set; } = new();
        
        [Range(0.0, 1.0)]
        public double Confidence { get; set; }
        
        [Range(0.0, 1.0)]
        public double Impact { get; set; }
        
        public int DataPointsUsed { get; set; }
        public double? SuccessRateBefore { get; set; }
    }

    /// <summary>
    /// DTO for adaptation metrics and insights
    /// </summary>
    public class AdaptationMetricsDto
    {
        public int UserId { get; set; }
        public int TotalAdaptations { get; set; }
        public int SuccessfulAdaptations { get; set; }
        public double SuccessRate { get; set; }
        public double AverageConfidence { get; set; }
        public double AverageImpact { get; set; }
        public double OverallLearningVelocity { get; set; }
        public Dictionary<AdaptationEventType, int> AdaptationsByType { get; set; } = new();
        public Dictionary<AdaptationEventType, double> SuccessRatesByType { get; set; } = new();
        public List<AdaptationTrendDto> RecentTrends { get; set; } = new();
        public DateTime PeriodStart { get; set; }
        public DateTime PeriodEnd { get; set; }
        public DateTime LastAdaptation { get; set; }
    }

    /// <summary>
    /// DTO for adaptation trends
    /// </summary>
    public class AdaptationTrendDto
    {
        public DateTime Date { get; set; }
        public int AdaptationCount { get; set; }
        public double SuccessRate { get; set; }
        public double AverageConfidence { get; set; }
        public double AverageImpact { get; set; }
    }

    /// <summary>
    /// DTO for learning insights
    /// </summary>
    public class LearningInsightsDto
    {
        public int UserId { get; set; }
        public double LearningVelocity { get; set; }
        public double AdaptationConfidence { get; set; }
        public List<string> StrengthAreas { get; set; } = new();
        public List<string> ImprovementAreas { get; set; } = new();
        public List<RecommendationInsightDto> PersonalizationRecommendations { get; set; } = new();
        public Dictionary<string, double> PreferenceStability { get; set; } = new();
        public Dictionary<string, double> LearningProgress { get; set; } = new();
        public DateTime LastAnalysis { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// DTO for recommendation insights
    /// </summary>
    public class RecommendationInsightDto
    {
        public string Category { get; set; } = string.Empty;
        public string Insight { get; set; } = string.Empty;
        public double Confidence { get; set; }
        public string ActionSuggestion { get; set; } = string.Empty;
        public Dictionary<string, object> SupportingData { get; set; } = new();
    }

    /// <summary>
    /// DTO for adaptation feedback
    /// </summary>
    public class AdaptationFeedbackDto
    {
        [Required]
        public int AdaptationEventId { get; set; }
        
        [Required]
        public bool WasSuccessful { get; set; }
        
        [Range(0.0, 1.0)]
        public double? SuccessRateAfter { get; set; }
        
        public string? UserFeedback { get; set; }
        
        [Range(1, 5)]
        public int? SatisfactionRating { get; set; }
    }
} 