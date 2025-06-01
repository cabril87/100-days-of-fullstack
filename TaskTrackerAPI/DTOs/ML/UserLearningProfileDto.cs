using System;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.ML
{
    /// <summary>
    /// DTO for User Learning Profile
    /// </summary>
    public class UserLearningProfileDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        [Range(1, 10)]
        public int PreferredComplexity { get; set; } = 5;

        [Range(0, 23)]
        public int PreferredTimeOfDay { get; set; } = 9;

        [Range(5, 480)]
        public int PreferredDuration { get; set; } = 30;

        public int? PreferredCategoryId { get; set; }

        [Range(0.1, 5.0)]
        public double LearningVelocity { get; set; } = 1.0;

        public string SuccessPattern { get; set; } = string.Empty;

        [Range(0.0, 1.0)]
        public double ProcrastinationTendency { get; set; } = 0.3;

        public string FocusPattern { get; set; } = string.Empty;
        public string UsageFrequencyPattern { get; set; } = string.Empty;
        public string MotivationFactors { get; set; } = "{}";

        [Range(0.0, 1.0)]
        public double ChallengeAcceptanceRate { get; set; } = 0.5;

        [Range(0.0, 1.0)]
        public double AutomationPreference { get; set; } = 0.7;

        [Range(0.0, 1.0)]
        public double SocialPreference { get; set; } = 0.5;

        public DateTime LastAdaptationDate { get; set; } = DateTime.UtcNow;

        [Range(0.0, 1.0)]
        public double AdaptationConfidence { get; set; } = 0.1;

        public int DataPointCount { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// DTO for creating a User Learning Profile
    /// </summary>
    public class CreateUserLearningProfileDto
    {
        [Required]
        public int UserId { get; set; }

        [Range(1, 10)]
        public int PreferredComplexity { get; set; } = 5;

        [Range(0, 23)]
        public int PreferredTimeOfDay { get; set; } = 9;

        [Range(5, 480)]
        public int PreferredDuration { get; set; } = 30;

        public int? PreferredCategoryId { get; set; }

        [Range(0.0, 1.0)]
        public double AutomationPreference { get; set; } = 0.7;

        [Range(0.0, 1.0)]
        public double SocialPreference { get; set; } = 0.5;
    }

    /// <summary>
    /// DTO for updating a User Learning Profile
    /// </summary>
    public class UpdateUserLearningProfileDto
    {
        [Range(1, 10)]
        public int? PreferredComplexity { get; set; }

        [Range(0, 23)]
        public int? PreferredTimeOfDay { get; set; }

        [Range(5, 480)]
        public int? PreferredDuration { get; set; }

        public int? PreferredCategoryId { get; set; }

        [Range(0.0, 1.0)]
        public double? AutomationPreference { get; set; }

        [Range(0.0, 1.0)]
        public double? SocialPreference { get; set; }

        [Range(0.0, 1.0)]
        public double? ChallengeAcceptanceRate { get; set; }
    }
} 