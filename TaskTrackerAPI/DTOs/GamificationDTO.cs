using System;
using System.Collections.Generic;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs
{
    // User progress DTOs
    public class UserProgressDTO
    {
        public int UserId { get; set; }
        public int Level { get; set; }
        public int CurrentPoints { get; set; }
        public int TotalPointsEarned { get; set; }
        public int NextLevelThreshold { get; set; }
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public DateTime? LastActivityDate { get; set; }
    }

    // Achievement DTOs
    public class AchievementDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int PointValue { get; set; }
        public string? IconPath { get; set; }
        public bool IsHidden { get; set; }
        public int Difficulty { get; set; }
    }

    public class UserAchievementDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public AchievementDTO Achievement { get; set; } = null!;
        public DateTime UnlockedAt { get; set; }
    }

    // Badge DTOs
    public class BadgeDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int PointValue { get; set; }
        public string IconPath { get; set; } = string.Empty;
        public bool IsSpecial { get; set; }
    }

    public class UserBadgeDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public BadgeDTO Badge { get; set; } = null!;
        public DateTime AwardedAt { get; set; }
        public bool IsDisplayed { get; set; }
    }

    public class BadgeToggleDTO
    {
        public int BadgeId { get; set; }
        public bool IsDisplayed { get; set; }
    }

    // Reward DTOs
    public class RewardDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int PointCost { get; set; }
        public int MinimumLevel { get; set; }
        public string? IconPath { get; set; }
        public bool IsActive { get; set; }
        public int? Quantity { get; set; }
        public DateTime? ExpirationDate { get; set; }
    }

    public class UserRewardDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public RewardDTO Reward { get; set; } = null!;
        public DateTime RedeemedAt { get; set; }
        public bool IsUsed { get; set; }
        public DateTime? UsedAt { get; set; }
    }

    // Challenge DTOs
    public class ChallengeDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int PointReward { get; set; }
        public string ChallengeType { get; set; } = string.Empty;
        public int TargetCount { get; set; }
        public string? AdditionalCriteria { get; set; }
        public bool IsActive { get; set; }
        public int Difficulty { get; set; }
    }

    public class UserChallengeDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public ChallengeDTO Challenge { get; set; } = null!;
        public DateTime EnrolledAt { get; set; }
        public int CurrentProgress { get; set; }
        public bool IsComplete { get; set; }
        public DateTime? CompletedAt { get; set; }
        public bool IsRewardClaimed { get; set; }
    }

    // Point transaction DTO
    public class PointTransactionDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int Points { get; set; }
        public string TransactionType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int? TaskId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // Daily login DTOs
    public class LoginStatusDTO
    {
        public bool HasClaimedToday { get; set; }
        public int CurrentStreak { get; set; }
        public int PotentialPoints { get; set; }
    }

    // Stats and suggestions DTOs
    public class GamificationStatsDTO
    {
        public UserProgressDTO Progress { get; set; } = null!;
        public int CompletedTasks { get; set; }
        public int AchievementsUnlocked { get; set; }
        public int BadgesEarned { get; set; }
        public int RewardsRedeemed { get; set; }
        public double ConsistencyScore { get; set; }
        public Dictionary<string, int> CategoryStats { get; set; } = new Dictionary<string, int>();
        public List<LeaderboardEntryDTO> TopUsers { get; set; } = new List<LeaderboardEntryDTO>();
    }

    public class LeaderboardEntryDTO
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int Value { get; set; }
        public int Rank { get; set; }
    }

    public class GamificationSuggestionDTO
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int? RelevantId { get; set; }
        public int PotentialPoints { get; set; }
        public double RelevanceScore { get; set; }
    }

    // Input DTOs
    public class AddPointsDTO
    {
        public int Points { get; set; }
        public string TransactionType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int? TaskId { get; set; }
    }

    public class RedeemRewardDTO
    {
        public int RewardId { get; set; }
    }

    public class UseRewardDTO
    {
        public int UserRewardId { get; set; }
    }

    public class EnrollChallengeDTO
    {
        public int ChallengeId { get; set; }
    }

    public class ChallengeProgressDTO
    {
        public string ActivityType { get; set; } = string.Empty;
        public int RelatedEntityId { get; set; }
    }
} 