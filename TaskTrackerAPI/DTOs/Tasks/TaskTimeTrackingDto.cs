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

namespace TaskTrackerAPI.DTOs.Tasks
{
    public class TaskTimeTrackingDto
    {
        /// <summary>
        /// Task identifier
        /// </summary>
        public int TaskId { get; set; }

        /// <summary>
        /// Task title
        /// </summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Estimated time to complete in minutes
        /// </summary>
        public int? EstimatedTimeMinutes { get; set; }

        /// <summary>
        /// Actual time spent on this task from focus sessions
        /// </summary>
        public int ActualTimeSpentMinutes { get; set; }

        /// <summary>
        /// Number of focus sessions for this task
        /// </summary>
        public int TotalFocusSessions { get; set; }

        /// <summary>
        /// Average session length for this task
        /// </summary>
        public double AverageSessionLength { get; set; }

        /// <summary>
        /// Current progress percentage (0-100)
        /// </summary>
        public int ProgressPercentage { get; set; }

        /// <summary>
        /// Time efficiency rating (actual vs estimated)
        /// </summary>
        public double? TimeEfficiencyRating { get; set; }

        /// <summary>
        /// Whether the task is completed
        /// </summary>
        public bool IsCompleted { get; set; }

        /// <summary>
        /// Completion date if task is completed
        /// </summary>
        public DateTime? CompletedAt { get; set; }

        /// <summary>
        /// List of focus sessions for this task
        /// </summary>
        public List<FocusSessionSummaryDto> FocusSessions { get; set; } = new();
    }

    public class FocusSessionSummaryDto
    {
        public int Id { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public int DurationMinutes { get; set; }
        public int? SessionQualityRating { get; set; }
        public string Status { get; set; } = string.Empty;
        public int DistractionCount { get; set; }
    }
} 