using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.ML
{
    /// <summary>
    /// DTO for Template Recommendation
    /// </summary>
    public class TemplateRecommendationDto
    {
        public int TemplateId { get; set; }
        public string TemplateName { get; set; } = string.Empty;
        public string TemplateDescription { get; set; } = string.Empty;
        public int? CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        
        [Range(0.0, 1.0)]
        public double Score { get; set; }
        
        [Range(0.0, 1.0)]
        public double Confidence { get; set; }
        
        public string RecommendationReason { get; set; } = string.Empty;
        public Dictionary<string, object> ScoringFactors { get; set; } = new();
        public Dictionary<string, object> Context { get; set; } = new();
        public string AlgorithmVersion { get; set; } = "1.0";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// DTO for Recommendation Score
    /// </summary>
    public class RecommendationScoreDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int TemplateId { get; set; }
        
        [Range(0.0, 1.0)]
        public double Score { get; set; }
        
        [Range(0.0, 1.0)]
        public double Confidence { get; set; }
        
        public string RecommendationReason { get; set; } = string.Empty;
        public string ScoringFactors { get; set; } = "{}";
        
        [Range(-1, 1)]
        public int? UserFeedback { get; set; }
        
        public bool WasUsed { get; set; } = false;
        
        [Range(1, 5)]
        public int? SatisfactionRating { get; set; }
        
        public string AlgorithmVersion { get; set; } = "1.0";
        public string RecommendationContext { get; set; } = "{}";
        public bool WasShown { get; set; } = false;
        public DateTime? ShownAt { get; set; }
        public DateTime? FeedbackAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// DTO for providing feedback on a recommendation
    /// </summary>
    public class RecommendationFeedbackDto
    {
        [Required]
        public int RecommendationId { get; set; }
        
        [Range(-1, 1)]
        public int UserFeedback { get; set; }
        
        [Range(1, 5)]
        public int? SatisfactionRating { get; set; }
        
        public bool WasUsed { get; set; } = false;
        public string? Comments { get; set; }
    }

    /// <summary>
    /// DTO for requesting recommendations
    /// </summary>
    public class RecommendationRequestDto
    {
        [Required]
        public int UserId { get; set; }
        
        [Range(1, 50)]
        public int Count { get; set; } = 10;
        
        public int? CategoryId { get; set; }
        
        [Range(0.0, 1.0)]
        public double? MinConfidence { get; set; } = 0.3;
        
        public Dictionary<string, object> Context { get; set; } = new();
        public bool IncludeReasons { get; set; } = true;
        public bool ExcludeRecentlyShown { get; set; } = true;
        public int ExcludeRecentlyShownHours { get; set; } = 24;
    }

    /// <summary>
    /// DTO for recommendation performance metrics
    /// </summary>
    public class RecommendationMetricsDto
    {
        public int TotalRecommendations { get; set; }
        public int RecommendationsShown { get; set; }
        public int RecommendationsAccepted { get; set; }
        public int RecommendationsUsed { get; set; }
        public double AcceptanceRate { get; set; }
        public double UsageRate { get; set; }
        public double AverageConfidence { get; set; }
        public double AverageSatisfactionRating { get; set; }
        public Dictionary<string, int> RecommendationsByCategory { get; set; } = new();
        public Dictionary<string, double> PerformanceByAlgorithmVersion { get; set; } = new();
        public DateTime PeriodStart { get; set; }
        public DateTime PeriodEnd { get; set; }
    }
} 