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

namespace TaskTrackerAPI.DTOs.Analytics
{
    /// <summary>
    /// Comprehensive analytics data transfer object
    /// </summary>
    public class AdvancedAnalyticsDTO
    {
        public List<TaskTrendDTO> TaskTrends { get; set; } = new();
        public ProductivityMetricsDTO ProductivityMetrics { get; set; } = new();
        public TimeAnalysisDTO TimeAnalysis { get; set; } = new();
        public List<CategoryBreakdownDTO> CategoryBreakdown { get; set; } = new();
    }

    /// <summary>
    /// Task trend data over time
    /// </summary>
    public class TaskTrendDTO
    {
        public DateTime Date { get; set; }
        public int TasksCreated { get; set; }
        public int TasksCompleted { get; set; }
        public int TasksOverdue { get; set; }
        public double CompletionRate { get; set; }
    }

    /// <summary>
    /// Productivity metrics and patterns
    /// </summary>
    public class ProductivityMetricsDTO
    {
        public double DailyAverage { get; set; }
        public List<WeeklyTrendDTO> WeeklyTrends { get; set; } = new();
        public List<int> PeakHours { get; set; } = new();
        public double EfficiencyScore { get; set; }
    }

    /// <summary>
    /// Weekly productivity trend
    /// </summary>
    public class WeeklyTrendDTO
    {
        public string Week { get; set; } = string.Empty;
        public int TasksCompleted { get; set; }
        public double AverageCompletionTime { get; set; }
        public double ProductivityScore { get; set; }
    }

    /// <summary>
    /// Time analysis and patterns
    /// </summary>
    public class TimeAnalysisDTO
    {
        public double AverageCompletionTime { get; set; }
        public int MostProductiveHour { get; set; }
        public string MostProductiveDay { get; set; } = string.Empty;
        public double TotalTimeSpent { get; set; }
        public List<TimeDistributionDTO> TimeDistribution { get; set; } = new();
    }

    /// <summary>
    /// Time distribution by hour
    /// </summary>
    public class TimeDistributionDTO
    {
        public int Hour { get; set; }
        public int TaskCount { get; set; }
        public double CompletionRate { get; set; }
    }

    /// <summary>
    /// Category breakdown and analysis
    /// </summary>
    public class CategoryBreakdownDTO
    {
        public string Category { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
        public double CompletionRate { get; set; }
        public double AverageTime { get; set; }
    }
} 