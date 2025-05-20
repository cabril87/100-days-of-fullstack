using System;
using System.Collections.Generic;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Models.Gamification;

namespace TaskTrackerAPI.UnitTests.Mocks
{
    // Mock models to avoid entity framework dependencies in unit tests
    
    // User Progress
    public class UserProgress
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int TotalPoints { get; set; } = 0;
        public int Level { get; set; } = 1;
        public int StreakDays { get; set; } = 0;
        public DateTime LastActivityDate { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
    
    // Point Transaction
    public class PointTransaction
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int Points { get; set; }
        public string Description { get; set; } = string.Empty;
        public string TransactionType { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? TaskId { get; set; }
        public TaskItem? Task { get; set; }
    }
    
    // Achievement - renamed to MockAchievement to avoid conflicts with the Gamification namespace
    public class MockAchievement
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int PointValue { get; set; }
        public string IconName { get; set; } = string.Empty;
        public int RequiredCount { get; set; } = 1;
    }
    
    // User Achievement - renamed to MockUserAchievement to avoid conflicts
    public class MockUserAchievement
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int AchievementId { get; set; }
        public MockAchievement Achievement { get; set; } = null!;
        public bool IsComplete { get; set; }
        public int CurrentProgress { get; set; }
        public DateTime? UnlockedAt { get; set; }
    }
    
    // Badge
    public class Badge
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Tier { get; set; } = string.Empty;
        public string IconName { get; set; } = string.Empty;
    }
    
    // User Badge
    public class UserBadge
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int BadgeId { get; set; }
        public Badge Badge { get; set; } = null!;
        public DateTime AwardedAt { get; set; }
        public bool IsDisplayed { get; set; }
    }
    
    // Reward
    public class Reward
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int PointCost { get; set; }
        public int LevelRequired { get; set; }
        public string IconName { get; set; } = string.Empty;
    }
    
    // User Reward
    public class UserReward
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int RewardId { get; set; }
        public Reward Reward { get; set; } = null!;
        public DateTime RedeemedAt { get; set; }
        public bool IsUsed { get; set; }
        public DateTime? UsedAt { get; set; }
    }
    
    // Challenge
    public class Challenge
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ChallengeType { get; set; } = string.Empty;
        public string ActivityType { get; set; } = string.Empty;
        public int TargetCount { get; set; }
        public int PointReward { get; set; }
        public Badge? Badge { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
    }
    
    // User Challenge
    public class UserChallenge
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ChallengeId { get; set; }
        public Challenge Challenge { get; set; } = null!;
        public int CurrentProgress { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime EnrolledAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
} 