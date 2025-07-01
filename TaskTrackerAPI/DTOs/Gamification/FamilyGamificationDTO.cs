/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Gamification
{
    /// <summary>
    /// Family gamification profile DTO containing aggregated family data
    /// </summary>
    public class FamilyGamificationProfileDTO
    {
        public int FamilyId { get; set; }
        public string FamilyName { get; set; } = string.Empty;
        public int TotalFamilyPoints { get; set; }
        public int FamilyLevel { get; set; }
        public int FamilyStreak { get; set; }
        public string FamilyRank { get; set; } = "Bronze";
        public List<FamilyBadgeDTO> FamilyBadges { get; set; } = new();
        public List<FamilyGamificationAchievementDTO> FamilyAchievements { get; set; } = new();
        public List<FamilyGoalDTO> WeeklyGoals { get; set; } = new();
        public FamilyChallengeDTO? MonthlyChallenge { get; set; }
        public FamilyGamificationSettingsDTO Settings { get; set; } = new();
        public FamilyGamificationStatsDTO Statistics { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    /// <summary>
    /// Family goal DTO for family-specific objectives
    /// </summary>
    public class FamilyGoalDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int TargetValue { get; set; }
        public int CurrentValue { get; set; }
        public string Unit { get; set; } = "tasks";
        public string Type { get; set; } = "family";
        public string Priority { get; set; } = "medium";
        public DateTime? DueDate { get; set; }
        public List<int> AssignedTo { get; set; } = new();
        public List<GoalRewardDTO> Rewards { get; set; } = new();
        public string Status { get; set; } = "active";
        public int CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// DTO for creating a new family goal
    /// </summary>
    public class CreateFamilyGoalDTO
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int TargetValue { get; set; }

        [StringLength(50)]
        public string Unit { get; set; } = "tasks";

        [StringLength(20)]
        public string Type { get; set; } = "family";

        [StringLength(10)]
        public string Priority { get; set; } = "medium";

        public DateTime? DueDate { get; set; }

        public List<int> AssignedTo { get; set; } = new();

        public List<GoalRewardDTO> Rewards { get; set; } = new();
    }

    /// <summary>
    /// DTO for updating goal progress
    /// </summary>
    public class UpdateGoalProgressDTO
    {
        [Range(0, int.MaxValue)]
        public int Progress { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }
    }

    /// <summary>
    /// Family-specific challenge DTO
    /// </summary>
    public class FamilyChallengeDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = "weekly";
        public string Difficulty { get; set; } = "medium";
        public string Icon { get; set; } = "🏆";
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TargetPoints { get; set; }
        public int CurrentProgress { get; set; }
        public List<int> Participants { get; set; } = new();
        public List<ChallengeRewardDTO> Rewards { get; set; } = new();
        public List<ChallengeMilestoneDTO> Milestones { get; set; } = new();
        public string Status { get; set; } = "active";
        public bool IsOptional { get; set; }
        public List<string> AgeRestrictions { get; set; } = new();
        public int FamilyId { get; set; }
    }

    /// <summary>
    /// DTO for updating member gamification preferences
    /// </summary>
    public class UpdateMemberGamificationPreferencesDTO
    {
        [StringLength(20)]
        public string CelebrationStyle { get; set; } = "normal";

        public List<string> PreferredCategories { get; set; } = new();

        public bool GoalReminders { get; set; } = true;

        public bool AchievementSharing { get; set; } = true;

        public bool LeaderboardParticipation { get; set; } = true;

        public bool MotivationalMessages { get; set; } = true;

        [StringLength(30)]
        public string DifficultyPreference { get; set; } = "steady_progress";
    }

    /// <summary>
    /// DTO for updating family gamification settings
    /// </summary>
    public class UpdateFamilyGamificationSettingsDTO
    {
        public bool IsEnabled { get; set; } = true;

        [StringLength(20)]
        public string DifficultyLevel { get; set; } = "normal";

        [StringLength(20)]
        public string CelebrationLevel { get; set; } = "normal";

        public bool SoundEnabled { get; set; } = true;

        public bool AnimationsEnabled { get; set; } = true;

        public bool WeeklyGoalsEnabled { get; set; } = true;

        public bool MonthlyChallengesEnabled { get; set; } = true;

        public bool LeaderboardEnabled { get; set; } = true;

        public bool PublicRankingOptIn { get; set; } = false;

        public ParentalOversightSettingsDTO ParentalOversight { get; set; } = new();

        public GamificationNotificationSettingsDTO Notifications { get; set; } = new();

        public RewardSettingsDTO Rewards { get; set; } = new();
    }

    /// <summary>
    /// Supporting DTOs for family gamification
    /// </summary>
    public class FamilyBadgeDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string Type { get; set; } = "family";
        public DateTime EarnedAt { get; set; }
        public string EarnedBy { get; set; } = "family";
        public int DisplayPriority { get; set; }
        public bool IsLimited { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }

    public class FamilyGamificationAchievementDTO
    {
        public int Id { get; set; }
        public string Type { get; set; } = "family";
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string Rarity { get; set; } = "common";
        public string Category { get; set; } = "task_completion";
        public int PointsReward { get; set; }
        public DateTime? UnlockedAt { get; set; }
        public string UnlockedBy { get; set; } = "family";
        public string ShareableMessage { get; set; } = string.Empty;
        public int? FamilyBonus { get; set; }
    }

    public class GoalRewardDTO
    {
        public string Type { get; set; } = "points";
        public string Value { get; set; } = "0";
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public List<int> EligibleMembers { get; set; } = new();
    }

    public class ChallengeRewardDTO
    {
        public string Type { get; set; } = "points";
        public string Value { get; set; } = "0";
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public bool IsForFamily { get; set; }
        public bool RequiresParentApproval { get; set; }
    }

    public class ChallengeMilestoneDTO
    {
        public int Percentage { get; set; }
        public string Title { get; set; } = string.Empty;
        public ChallengeRewardDTO Reward { get; set; } = new();
        public bool IsReached { get; set; }
        public DateTime? ReachedAt { get; set; }
    }

    public class FamilyGamificationSettingsDTO
    {
        public bool IsEnabled { get; set; } = true;
        public string DifficultyLevel { get; set; } = "normal";
        public string CelebrationLevel { get; set; } = "normal";
        public bool SoundEnabled { get; set; } = true;
        public bool AnimationsEnabled { get; set; } = true;
        public bool WeeklyGoalsEnabled { get; set; } = true;
        public bool MonthlyChallengesEnabled { get; set; } = true;
        public bool LeaderboardEnabled { get; set; } = true;
        public bool PublicRankingOptIn { get; set; } = false;
        public ParentalOversightSettingsDTO ParentalOversight { get; set; } = new();
        public GamificationNotificationSettingsDTO Notifications { get; set; } = new();
        public RewardSettingsDTO Rewards { get; set; } = new();
    }

    public class ParentalOversightSettingsDTO
    {
        public bool RequireApprovalForRewards { get; set; } = false;
        public int? MaxPointsPerDay { get; set; }
        public List<string> RestrictedCategories { get; set; } = new();
        public bool AllowPeerComparison { get; set; } = true;
        public bool ScreenTimeRewards { get; set; } = true;
        public bool AllowanceIntegration { get; set; } = false;
        public string ReportingFrequency { get; set; } = "weekly";
    }

    public class GamificationNotificationSettingsDTO
    {
        public bool Achievements { get; set; } = true;
        public bool LevelUp { get; set; } = true;
        public bool StreakReminders { get; set; } = true;
        public bool GoalDeadlines { get; set; } = true;
        public bool FamilyChallenges { get; set; } = true;
        public bool LeaderboardUpdates { get; set; } = true;
        public bool EncouragementMessages { get; set; } = true;
        public string Frequency { get; set; } = "immediate";
    }

    public class RewardSettingsDTO
    {
        public decimal? PointsToAllowanceRatio { get; set; }
        public bool ScreenTimeRewards { get; set; } = false;
        public bool PrivilegeRewards { get; set; } = true;
        public List<CustomRewardDTO> CustomRewards { get; set; } = new();
        public bool AutoRedemption { get; set; } = false;
        public bool ParentApprovalRequired { get; set; } = false;
    }

    public class CustomRewardDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Cost { get; set; }
        public string Type { get; set; } = "privilege";
        public string Icon { get; set; } = string.Empty;
        public bool IsAvailable { get; set; } = true;
        public bool RequiresParentApproval { get; set; } = false;
        public List<string> AgeRestrictions { get; set; } = new();
        public int? CooldownPeriod { get; set; }
    }

    public class FamilyGamificationStatsDTO
    {
        public int TotalPointsEarned { get; set; }
        public int TotalTasksCompleted { get; set; }
        public int TotalAchievementsUnlocked { get; set; }
        public int AverageFamilyStreak { get; set; }
        public string MostActiveDay { get; set; } = "Monday";
        public int MostProductiveHour { get; set; } = 14;
        public string TopCategory { get; set; } = "task_completion";
        public List<WeeklyProgressDTO> WeeklyProgress { get; set; } = new();
        public List<MonthlyProgressDTO> MonthlyProgress { get; set; } = new();
        public List<MemberContributionDTO> MemberContributions { get; set; } = new();
        public EngagementMetricsDTO EngagementMetrics { get; set; } = new();
    }

    public class WeeklyProgressDTO
    {
        public DateTime WeekStart { get; set; }
        public DateTime WeekEnd { get; set; }
        public int TotalPoints { get; set; }
        public int TasksCompleted { get; set; }
        public int AchievementsUnlocked { get; set; }
        public int FamilyStreak { get; set; }
        public decimal ParticipationRate { get; set; }
    }

    public class MonthlyProgressDTO
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public int TotalPoints { get; set; }
        public int TasksCompleted { get; set; }
        public int AchievementsUnlocked { get; set; }
        public int ChallengesCompleted { get; set; }
        public int AverageStreak { get; set; }
        public int TopPerformer { get; set; }
    }

    public class MemberContributionDTO
    {
        public int UserId { get; set; }
        public string MemberName { get; set; } = string.Empty;
        public int PointsContributed { get; set; }
        public int TasksContributed { get; set; }
        public int AchievementsEarned { get; set; }
        public int LeadershipMoments { get; set; }
        public int HelpfulActions { get; set; }
        public int ConsistencyScore { get; set; }
    }

    public class EngagementMetricsDTO
    {
        public int DailyActiveUsers { get; set; }
        public int WeeklyActiveUsers { get; set; }
        public int AverageSessionDuration { get; set; }
        public List<FeatureUsageDTO> FeatureUsage { get; set; } = new();
        public decimal RetentionRate { get; set; }
        public decimal? SatisfactionScore { get; set; }
    }

    public class FeatureUsageDTO
    {
        public string Feature { get; set; } = string.Empty;
        public int UsageCount { get; set; }
        public DateTime LastUsed { get; set; }
        public int PopularityRank { get; set; }
    }
} 