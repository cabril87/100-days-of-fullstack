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

using System.Collections.Generic;

namespace TaskTrackerAPI.DTOs.Analytics
{
    /// <summary>
    /// Family-specific analytics data transfer object
    /// </summary>
    public class FamilyAnalyticsDTO
    {
        public FamilyProductivityDTO FamilyProductivity { get; set; } = new();
        public List<MemberComparisonDTO> MemberComparisons { get; set; } = new();
        public CollaborationMetricsDTO CollaborationMetrics { get; set; } = new();
    }

    /// <summary>
    /// Overall family productivity metrics
    /// </summary>
    public class FamilyProductivityDTO
    {
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public double FamilyCompletionRate { get; set; }
        public double AverageTasksPerMember { get; set; }
    }

    /// <summary>
    /// Individual family member comparison data
    /// </summary>
    public class MemberComparisonDTO
    {
        public int MemberId { get; set; }
        public string MemberName { get; set; } = string.Empty;
        public int TasksCompleted { get; set; }
        public double CompletionRate { get; set; }
        public double ProductivityScore { get; set; }
        public double AverageCompletionTime { get; set; }
    }

    /// <summary>
    /// Family collaboration and teamwork metrics
    /// </summary>
    public class CollaborationMetricsDTO
    {
        public int SharedTasks { get; set; }
        public double CollaborativeCompletionRate { get; set; }
        public List<string> MostActiveCollaborators { get; set; } = new();
        public double TeamEfficiencyScore { get; set; }
    }
} 