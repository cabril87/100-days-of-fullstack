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

namespace TaskTrackerAPI.DTOs.Activity
{
    /// <summary>
    /// Data transfer object for user activity items
    /// </summary>
    public class UserActivityDTO
    {
        /// <summary>
        /// Unique identifier for the activity
        /// </summary>
        public string Id { get; set; } = string.Empty;

        /// <summary>
        /// Type of activity (task_completion, achievement, level_up, etc.)
        /// </summary>
        public string Type { get; set; } = string.Empty;

        /// <summary>
        /// Display title for the activity
        /// </summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Detailed description of the activity
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Points associated with this activity
        /// </summary>
        public int Points { get; set; }

        /// <summary>
        /// Timestamp when the activity occurred
        /// </summary>
        public DateTime Timestamp { get; set; }

        /// <summary>
        /// Additional data related to the activity
        /// </summary>
        public UserActivityDataDTO? Data { get; set; }
    }

    /// <summary>
    /// Data transfer object for additional activity data
    /// </summary>
    public class UserActivityDataDTO
    {
        /// <summary>
        /// Related task ID if applicable
        /// </summary>
        public string? TaskId { get; set; }

        /// <summary>
        /// Transaction type from the gamification system
        /// </summary>
        public string? TransactionType { get; set; }

        /// <summary>
        /// Achievement ID if applicable
        /// </summary>
        public int? AchievementId { get; set; }

        /// <summary>
        /// Badge ID if applicable
        /// </summary>
        public int? BadgeId { get; set; }

        /// <summary>
        /// Challenge ID if applicable
        /// </summary>
        public int? ChallengeId { get; set; }

        /// <summary>
        /// Reward ID if applicable
        /// </summary>
        public int? RewardId { get; set; }

        /// <summary>
        /// Previous level for level up activities
        /// </summary>
        public int? OldLevel { get; set; }

        /// <summary>
        /// New level for level up activities
        /// </summary>
        public int? NewLevel { get; set; }

        /// <summary>
        /// Streak length for streak activities
        /// </summary>
        public int? StreakLength { get; set; }
    }

    /// <summary>
    /// Data transfer object for activity filter criteria
    /// </summary>
    public class UserActivityFilterDTO
    {
        /// <summary>
        /// Filter by activity type
        /// </summary>
        public string? Type { get; set; }

        /// <summary>
        /// Date range filter (all, today, week, month)
        /// </summary>
        public string DateRange { get; set; } = "all";

        /// <summary>
        /// Custom start date for filtering
        /// </summary>
        public DateTime? StartDate { get; set; }

        /// <summary>
        /// Custom end date for filtering
        /// </summary>
        public DateTime? EndDate { get; set; }

        /// <summary>
        /// Search term for title/description
        /// </summary>
        public string? Search { get; set; }

        /// <summary>
        /// Maximum number of results to return
        /// </summary>
        [Range(1, 100)]
        public int Limit { get; set; } = 20;

        /// <summary>
        /// Number of results to skip (for pagination)
        /// </summary>
        [Range(0, int.MaxValue)]
        public int Offset { get; set; } = 0;
    }

    /// <summary>
    /// Data transfer object for activity statistics
    /// </summary>
    public class UserActivityStatsDTO
    {
        /// <summary>
        /// Total number of activities
        /// </summary>
        public int TotalActivities { get; set; }

        /// <summary>
        /// Total points earned
        /// </summary>
        public int TotalPoints { get; set; }

        /// <summary>
        /// Number of activities today
        /// </summary>
        public int ActivitiesToday { get; set; }

        /// <summary>
        /// Points earned today
        /// </summary>
        public int PointsToday { get; set; }

        /// <summary>
        /// Current activity streak
        /// </summary>
        public int CurrentStreak { get; set; }

        /// <summary>
        /// Longest activity streak achieved
        /// </summary>
        public int LongestStreak { get; set; }
    }

    /// <summary>
    /// Data transfer object for activity timeline data
    /// </summary>
    public class UserActivityTimelineDTO
    {
        /// <summary>
        /// Date labels for the timeline
        /// </summary>
        public string[] Labels { get; set; } = Array.Empty<string>();

        /// <summary>
        /// Activity count data points
        /// </summary>
        public int[] Data { get; set; } = Array.Empty<int>();

        /// <summary>
        /// Points data points
        /// </summary>
        public int[] PointsData { get; set; } = Array.Empty<int>();
    }

    /// <summary>
    /// Data transfer object for paginated activity results
    /// </summary>
    public class UserActivityPagedResultDTO
    {
        /// <summary>
        /// List of activities
        /// </summary>
        public IEnumerable<UserActivityDTO> Activities { get; set; } = new List<UserActivityDTO>();

        /// <summary>
        /// Total number of activities matching the filter
        /// </summary>
        public int Total { get; set; }

        /// <summary>
        /// Whether there are more results available
        /// </summary>
        public bool HasMore { get; set; }

        /// <summary>
        /// Current offset
        /// </summary>
        public int Offset { get; set; }

        /// <summary>
        /// Current limit
        /// </summary>
        public int Limit { get; set; }
    }
} 