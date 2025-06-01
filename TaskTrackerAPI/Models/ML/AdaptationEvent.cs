using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models.ML
{
    /// <summary>
    /// Represents an adaptation event in the learning system
    /// </summary>
    public class AdaptationEvent
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        /// <summary>
        /// Type of adaptation event
        /// </summary>
        public AdaptationEventType EventType { get; set; }

        /// <summary>
        /// Context of the adaptation - JSON encoded
        /// </summary>
        public string Context { get; set; } = "{}";

        /// <summary>
        /// Old values before adaptation - JSON encoded
        /// </summary>
        public string OldValues { get; set; } = "{}";

        /// <summary>
        /// New values after adaptation - JSON encoded
        /// </summary>
        public string NewValues { get; set; } = "{}";

        /// <summary>
        /// Confidence in the adaptation (0.0-1.0)
        /// </summary>
        public double Confidence { get; set; }

        /// <summary>
        /// Impact of the adaptation (0.0-1.0)
        /// </summary>
        public double Impact { get; set; }

        /// <summary>
        /// Data points used for this adaptation
        /// </summary>
        public int DataPointsUsed { get; set; }

        /// <summary>
        /// Algorithm version that made the adaptation
        /// </summary>
        public string AlgorithmVersion { get; set; } = "1.0";

        /// <summary>
        /// Success rate before adaptation
        /// </summary>
        public double? SuccessRateBefore { get; set; }

        /// <summary>
        /// Success rate after adaptation (measured later)
        /// </summary>
        public double? SuccessRateAfter { get; set; }

        /// <summary>
        /// Whether adaptation was successful
        /// </summary>
        public bool? WasSuccessful { get; set; }

        /// <summary>
        /// User feedback on adaptation
        /// </summary>
        public string? UserFeedback { get; set; }

        /// <summary>
        /// Created date
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// When adaptation success was measured
        /// </summary>
        public DateTime? MeasuredAt { get; set; }
    }

    /// <summary>
    /// Types of adaptation events
    /// </summary>
    public enum AdaptationEventType
    {
        PreferenceUpdate,
        ComplexityAdjustment,
        TimingOptimization,
        CategoryShift,
        DurationAdjustment,
        MotivationFactorUpdate,
        AutomationPreferenceChange,
        SocialPreferenceUpdate,
        LearningVelocityUpdate,
        ProcrastinationPatternUpdate,
        FocusPatternUpdate,
        UsageFrequencyUpdate,
        ChallengeAcceptanceUpdate
    }
} 