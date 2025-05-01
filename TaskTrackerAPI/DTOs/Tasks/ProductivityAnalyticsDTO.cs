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
    
    /// Data transfer object for productivity analytics
    
    public class ProductivityAnalyticsDTO
    {
        
        /// Start date of the analytics period
        
        public DateTime StartDate { get; set; }

        
        /// End date of the analytics period
        
        public DateTime EndDate { get; set; }

        
        /// Daily task completion counts
        
        public List<DateValuePair> DailyCompletions { get; set; } = new List<DateValuePair>();

        
        /// Task completion by hour of day
        
        public Dictionary<int, int> HourlyDistribution { get; set; } = new Dictionary<int, int>();

        
        /// Task completion by day of week
        
        public Dictionary<DayOfWeek, int> DayOfWeekDistribution { get; set; } = new Dictionary<DayOfWeek, int>();

        
        /// Task completion by category
        
        public List<CategoryActivityDTO> CategoryBreakdown { get; set; } = new List<CategoryActivityDTO>();

        
        /// Task completion rate trend
        
        public List<DateValuePair> CompletionRateTrend { get; set; } = new List<DateValuePair>();

        
        /// Average time to complete tasks
        
        public double AverageCompletionTime { get; set; }

        
        /// Productivity score (0-100)
        
        public double ProductivityScore { get; set; }

        
        /// Best performing day
        
        public DateValuePair BestDay { get; set; } = new DateValuePair();

        
        /// Summary of productivity insights
        
        public ProductivitySummaryDTO Summary { get; set; } = new ProductivitySummaryDTO();
    }

    
    /// Data transfer object for category activity
    
    public class CategoryActivityDTO
    {
        
        /// Category ID
        
        public int CategoryId { get; set; }

        
        /// Category name
        
        public string CategoryName { get; set; } = string.Empty;

        
        /// Number of tasks completed in this category
        
        public int CompletedTasks { get; set; }

        
        /// Percentage of total tasks
        
        public double Percentage { get; set; }
    }

    
    /// Data transfer object for productivity summary
    
    public class ProductivitySummaryDTO
    {
        
        /// Primary insight message
        
        public string PrimaryInsight { get; set; } = string.Empty;

        
        /// List of improvement suggestions
        
        public List<string> Suggestions { get; set; } = new List<string>();
    }
} 