using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models.ML
{
    /// <summary>
    /// Represents a recommendation score for a template to a user
    /// </summary>
    public class RecommendationScore
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [Required]
        public int TemplateId { get; set; }

        [ForeignKey("TemplateId")]
        public virtual TaskTemplate Template { get; set; } = null!;

        /// <summary>
        /// AI-calculated recommendation score (0.0-1.0)
        /// </summary>
        public double Score { get; set; }

        /// <summary>
        /// Confidence in the recommendation (0.0-1.0)
        /// </summary>
        public double Confidence { get; set; }

        /// <summary>
        /// Reason for recommendation
        /// </summary>
        public string RecommendationReason { get; set; } = string.Empty;

        /// <summary>
        /// Factors that influenced the score - JSON encoded
        /// </summary>
        public string ScoringFactors { get; set; } = "{}";

        /// <summary>
        /// User feedback on recommendation (-1: rejected, 0: ignored, 1: accepted)
        /// </summary>
        public int? UserFeedback { get; set; }

        /// <summary>
        /// Whether user actually used the recommended template
        /// </summary>
        public bool WasUsed { get; set; } = false;

        /// <summary>
        /// User satisfaction with recommendation (1-5 stars)
        /// </summary>
        public int? SatisfactionRating { get; set; }

        /// <summary>
        /// Recommendation algorithm version
        /// </summary>
        public string AlgorithmVersion { get; set; } = "1.0";

        /// <summary>
        /// Context when recommendation was made - JSON encoded
        /// </summary>
        public string RecommendationContext { get; set; } = "{}";

        /// <summary>
        /// Whether this recommendation was shown to user
        /// </summary>
        public bool WasShown { get; set; } = false;

        /// <summary>
        /// When recommendation was shown to user
        /// </summary>
        public DateTime? ShownAt { get; set; }

        /// <summary>
        /// When user provided feedback
        /// </summary>
        public DateTime? FeedbackAt { get; set; }

        /// <summary>
        /// Created date
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Last updated date
        /// </summary>
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
} 