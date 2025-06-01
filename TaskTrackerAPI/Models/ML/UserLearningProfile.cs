using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models.ML
{
    /// <summary>
    /// Represents a user's learning profile for adaptation and personalization
    /// </summary>
    public class UserLearningProfile
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        /// <summary>
        /// Preferred task complexity level (1-10)
        /// </summary>
        public int PreferredComplexity { get; set; } = 5;

        /// <summary>
        /// Preferred time of day for tasks (0-23 hours)
        /// </summary>
        public int PreferredTimeOfDay { get; set; } = 9;

        /// <summary>
        /// Preferred task duration in minutes
        /// </summary>
        public int PreferredDuration { get; set; } = 30;

        /// <summary>
        /// Most productive category ID
        /// </summary>
        public int? PreferredCategoryId { get; set; }

        /// <summary>
        /// Learning velocity - how quickly user adapts to new templates
        /// </summary>
        public double LearningVelocity { get; set; } = 1.0;

        /// <summary>
        /// Success rate pattern - encoded learning pattern
        /// </summary>
        public string SuccessPattern { get; set; } = string.Empty;

        /// <summary>
        /// Procrastination tendency (0.0-1.0)
        /// </summary>
        public double ProcrastinationTendency { get; set; } = 0.3;

        /// <summary>
        /// Focus session preference pattern
        /// </summary>
        public string FocusPattern { get; set; } = string.Empty;

        /// <summary>
        /// Template usage frequency pattern
        /// </summary>
        public string UsageFrequencyPattern { get; set; } = string.Empty;

        /// <summary>
        /// Motivation factors - JSON encoded
        /// </summary>
        public string MotivationFactors { get; set; } = "{}";

        /// <summary>
        /// Challenge acceptance rate
        /// </summary>
        public double ChallengeAcceptanceRate { get; set; } = 0.5;

        /// <summary>
        /// Automation preference level (0.0-1.0)
        /// </summary>
        public double AutomationPreference { get; set; } = 0.7;

        /// <summary>
        /// Social interaction preference (0.0-1.0)
        /// </summary>
        public double SocialPreference { get; set; } = 0.5;

        /// <summary>
        /// Last adaptation date
        /// </summary>
        public DateTime LastAdaptationDate { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Adaptation confidence score (0.0-1.0)
        /// </summary>
        public double AdaptationConfidence { get; set; } = 0.1;

        /// <summary>
        /// Number of data points used for learning
        /// </summary>
        public int DataPointCount { get; set; } = 0;

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