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
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.DTOs.Analytics;

namespace TaskTrackerAPI.DTOs.Dashboard
{
    /// <summary>
    /// Unified dashboard response DTO - contains all dashboard data in a single API call
    /// Designed to eliminate multiple API calls and optimize frontend performance
    /// Enterprise-grade comprehensive dashboard data aggregation
    /// </summary>
    public class UnifiedDashboardResponseDTO
    {
        /// <summary>
        /// User-specific dashboard statistics and metrics
        /// </summary>
        public DashboardStatsDTO Stats { get; set; } = new();

        /// <summary>
        /// Complete gamification data including points, achievements, badges, and progress
        /// </summary>
        public GamificationDataDTO Gamification { get; set; } = new();

        /// <summary>
        /// Recent tasks data for quick access and overview
        /// </summary>
        public RecentTasksDataDTO RecentTasks { get; set; } = new();

        /// <summary>
        /// Family information and related data
        /// </summary>
        public FamilyDashboardDataDTO Family { get; set; } = new();

        /// <summary>
        /// System and connectivity status information
        /// </summary>
        public DashboardSystemStatusDTO SystemStatus { get; set; } = new();

        /// <summary>
        /// Dashboard metadata and timing information
        /// </summary>
        public DashboardMetadataDTO Metadata { get; set; } = new();
    }

    /// <summary>
    /// Dashboard statistics and key metrics DTO
    /// </summary>
    public class DashboardStatsDTO
    {
        /// <summary>
        /// Total tasks completed by the user
        /// </summary>
        public int TasksCompleted { get; set; } = 0;

        /// <summary>
        /// Number of active goals
        /// </summary>
        public int ActiveGoals { get; set; } = 0;

        /// <summary>
        /// Total focus time in minutes
        /// </summary>
        public int FocusTimeMinutes { get; set; } = 0;

        /// <summary>
        /// Current streak of consecutive active days
        /// </summary>
        public int StreakDays { get; set; } = 0;

        /// <summary>
        /// Number of family members across all families
        /// </summary>
        public int FamilyMembers { get; set; } = 0;

        /// <summary>
        /// Total family tasks assigned to the user
        /// </summary>
        public int FamilyTasks { get; set; } = 0;

        /// <summary>
        /// Combined family points from all families
        /// </summary>
        public int FamilyPoints { get; set; } = 0;

        /// <summary>
        /// Total number of families the user belongs to
        /// </summary>
        public int TotalFamilies { get; set; } = 0;

        /// <summary>
        /// Number of pending tasks (not completed)
        /// </summary>
        public int PendingTasks { get; set; } = 0;

        /// <summary>
        /// Number of overdue tasks
        /// </summary>
        public int OverdueTasks { get; set; } = 0;

        /// <summary>
        /// Tasks due today
        /// </summary>
        public int TasksDueToday { get; set; } = 0;

        /// <summary>
        /// Tasks due this week
        /// </summary>
        public int TasksDueThisWeek { get; set; } = 0;
    }

    /// <summary>
    /// Comprehensive gamification data DTO
    /// </summary>
    public class GamificationDataDTO
    {
        /// <summary>
        /// Current total points earned by the user
        /// </summary>
        public int CurrentPoints { get; set; } = 0;

        /// <summary>
        /// Current level of the user
        /// </summary>
        public int CurrentLevel { get; set; } = 1;

        /// <summary>
        /// Current consecutive activity streak
        /// </summary>
        public int CurrentStreak { get; set; } = 0;

        /// <summary>
        /// Total number of achievements unlocked
        /// </summary>
        public int TotalAchievements { get; set; } = 0;

        /// <summary>
        /// Total number of badges earned
        /// </summary>
        public int TotalBadges { get; set; } = 0;

        /// <summary>
        /// List of recently unlocked achievements (last 5)
        /// </summary>
        public List<UserAchievementDTO> RecentAchievements { get; set; } = new();

        /// <summary>
        /// List of recently earned badges (last 5)
        /// </summary>
        public List<UserBadgeDTO> RecentBadges { get; set; } = new();

        /// <summary>
        /// Recent points earned events (last 10)
        /// </summary>
        public List<PointTransactionDTO> RecentPointsEarned { get; set; } = new();

        /// <summary>
        /// Points needed to reach the next level
        /// </summary>
        public int PointsToNextLevel { get; set; } = 100;

        /// <summary>
        /// Progress percentage within current level (0-100)
        /// </summary>
        public decimal LevelProgress { get; set; } = 0;

        /// <summary>
        /// Indicates if data is currently being loaded
        /// </summary>
        public bool IsLoading { get; set; } = false;

        /// <summary>
        /// Last time gamification data was updated
        /// </summary>
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Recent tasks data DTO
    /// </summary>
    public class RecentTasksDataDTO
    {
        /// <summary>
        /// List of recent tasks (last 10 tasks)
        /// </summary>
        public List<TaskItemDTO> Recent { get; set; } = new();

        /// <summary>
        /// List of recently completed tasks (last 5)
        /// </summary>
        public List<TaskItemDTO> RecentlyCompleted { get; set; } = new();

        /// <summary>
        /// List of tasks due today
        /// </summary>
        public List<TaskItemDTO> DueToday { get; set; } = new();

        /// <summary>
        /// List of overdue tasks
        /// </summary>
        public List<TaskItemDTO> Overdue { get; set; } = new();

        /// <summary>
        /// High priority tasks that need attention
        /// </summary>
        public List<TaskItemDTO> HighPriority { get; set; } = new();
    }

    /// <summary>
    /// Family dashboard data DTO
    /// </summary>
    public class FamilyDashboardDataDTO
    {
        /// <summary>
        /// Current primary family information
        /// </summary>
        public FamilyDTO? CurrentFamily { get; set; }

        /// <summary>
        /// List of all families the user belongs to
        /// </summary>
        public List<FamilyDTO> AllFamilies { get; set; } = new();

        /// <summary>
        /// Family members from the current family
        /// </summary>
        public List<FamilyMemberDTO> FamilyMembers { get; set; } = new();

        /// <summary>
        /// Recent family activity and updates
        /// </summary>
        public List<DashboardFamilyActivityDTO> RecentActivity { get; set; } = new();

        /// <summary>
        /// Family leaderboard data (top performers)
        /// </summary>
        public List<LeaderboardEntryDTO> FamilyLeaderboard { get; set; } = new();

        /// <summary>
        /// Pending family invitations
        /// </summary>
        public int PendingInvitations { get; set; } = 0;

        /// <summary>
        /// Family-wide statistics
        /// </summary>
        public FamilyStatsDTO FamilyStats { get; set; } = new();
    }

    /// <summary>
    /// Family statistics DTO
    /// </summary>
    public class FamilyStatsDTO
    {
        /// <summary>
        /// Total points earned by the family
        /// </summary>
        public int TotalFamilyPoints { get; set; } = 0;

        /// <summary>
        /// Total tasks completed by family members
        /// </summary>
        public int TotalFamilyTasksCompleted { get; set; } = 0;

        /// <summary>
        /// Number of active family challenges
        /// </summary>
        public int ActiveChallenges { get; set; } = 0;

        /// <summary>
        /// Current family streak
        /// </summary>
        public int FamilyStreak { get; set; } = 0;
    }

    /// <summary>
    /// Dashboard family activity DTO for recent activities
    /// </summary>
    public class DashboardFamilyActivityDTO
    {
        /// <summary>
        /// Unique identifier for the activity
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Family member who performed the activity
        /// </summary>
        public string MemberName { get; set; } = string.Empty;

        /// <summary>
        /// Type of activity performed
        /// </summary>
        public string ActivityType { get; set; } = string.Empty;

        /// <summary>
        /// Description of the activity
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Points earned from the activity
        /// </summary>
        public int Points { get; set; } = 0;

        /// <summary>
        /// When the activity occurred
        /// </summary>
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Dashboard system status DTO
    /// </summary>
    public class DashboardSystemStatusDTO
    {
        /// <summary>
        /// Indicates if the user is connected to real-time services
        /// </summary>
        public bool IsConnected { get; set; } = true;

        /// <summary>
        /// SignalR connection status
        /// </summary>
        public string SignalRStatus { get; set; } = "Connected";

        /// <summary>
        /// Last time the connection was verified
        /// </summary>
        public DateTime LastConnectionCheck { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Number of unread notifications
        /// </summary>
        public int UnreadNotifications { get; set; } = 0;

        /// <summary>
        /// System health status
        /// </summary>
        public string HealthStatus { get; set; } = "Healthy";
    }

    /// <summary>
    /// Dashboard metadata DTO
    /// </summary>
    public class DashboardMetadataDTO
    {
        /// <summary>
        /// When the dashboard data was generated
        /// </summary>
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Version of the API that generated the response
        /// </summary>
        public string ApiVersion { get; set; } = "1.0";

        /// <summary>
        /// Time taken to generate the response in milliseconds
        /// </summary>
        public int ResponseTimeMs { get; set; } = 0;

        /// <summary>
        /// Cache status for this response
        /// </summary>
        public string CacheStatus { get; set; } = "Miss";

        /// <summary>
        /// Next recommended refresh time
        /// </summary>
        public DateTime NextRefreshTime { get; set; } = DateTime.UtcNow.AddMinutes(5);
    }
} 