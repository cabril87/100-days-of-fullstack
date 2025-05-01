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
    /// <summary>
    /// Data transfer object for task statistics
    /// </summary>
    public class TaskStatisticsDTO
    {
        /// <summary>
        /// Total number of tasks
        /// </summary>
        public int TotalTasks { get; set; }

        /// <summary>
        /// Number of completed tasks
        /// </summary>
        public int CompletedTasks { get; set; }

        /// <summary>
        /// Number of overdue tasks
        /// </summary>
        public int OverdueTasks { get; set; }

        /// <summary>
        /// Number of tasks due today
        /// </summary>
        public int DueTodayTasks { get; set; }

        /// <summary>
        /// Number of tasks due this week
        /// </summary>
        public int DueThisWeekTasks { get; set; }

        /// <summary>
        /// Tasks by status distribution
        /// </summary>
        public Dictionary<string, int> TasksByStatus { get; set; } = new Dictionary<string, int>();

        /// <summary>
        /// Tasks by priority distribution
        /// </summary>
        public Dictionary<int, int> TasksByPriority { get; set; } = new Dictionary<int, int>();

        /// <summary>
        /// Tasks by category distribution
        /// </summary>
        public Dictionary<string, int> TasksByCategory { get; set; } = new Dictionary<string, int>();

        /// <summary>
        /// Average completion time in minutes
        /// </summary>
        public double AverageCompletionTime { get; set; }

        /// <summary>
        /// Task completion rate (percentage)
        /// </summary>
        public double CompletionRate { get; set; }

        /// <summary>
        /// Most active time of day (hour)
        /// </summary>
        public int MostActiveHour { get; set; }

        /// <summary>
        /// Most active day of week
        /// </summary>
        public DayOfWeek MostActiveDay { get; set; }

        /// <summary>
        /// Completion trend over time
        /// </summary>
        public List<DateValuePair> CompletionTrend { get; set; } = new List<DateValuePair>();
    }

    /// <summary>
    /// Data transfer object for task statistics organized by time periods
    /// </summary>
    public class PeriodTaskStatisticsDTO
    {
        /// <summary>
        /// Statistics for today
        /// </summary>
        public TaskStatisticsDTO Today { get; set; } = new TaskStatisticsDTO();

        /// <summary>
        /// Statistics for this week
        /// </summary>
        public TaskStatisticsDTO ThisWeek { get; set; } = new TaskStatisticsDTO();

        /// <summary>
        /// Statistics for this month
        /// </summary>
        public TaskStatisticsDTO ThisMonth { get; set; } = new TaskStatisticsDTO();

        /// <summary>
        /// Statistics for all time
        /// </summary>
        public TaskStatisticsDTO AllTime { get; set; } = new TaskStatisticsDTO();
    }

    /// <summary>
    /// Data transfer object for date-value pairs
    /// </summary>
    public class DateValuePair
    {
        /// <summary>
        /// The date
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// The value for that date
        /// </summary>
        public int Value { get; set; }
    }

    /// <summary>
    /// Data transfer object for task completion rate
    /// </summary>
    public class TaskCompletionRateDTO
    {
        /// <summary>
        /// Total number of tasks
        /// </summary>
        public int TotalTasks { get; set; }
        
        /// <summary>
        /// Number of completed tasks
        /// </summary>
        public int CompletedTasks { get; set; }
        
        /// <summary>
        /// Completion rate (0-1)
        /// </summary>
        public double CompletionRate { get; set; }
    }
    
    /// <summary>
    /// Data transfer object for task distribution
    /// </summary>
    public class TaskDistributionDTO
    {
        /// <summary>
        /// Label describing the distribution category
        /// </summary>
        public string Label { get; set; } = string.Empty;
        
        /// <summary>
        /// Count of tasks in this category
        /// </summary>
        public int Count { get; set; }
        
        /// <summary>
        /// Percentage of total tasks
        /// </summary>
        public double Percentage { get; set; }
    }
    
    /// <summary>
    /// Data transfer object for productivity data point
    /// </summary>
    public class ProductivityDataPointDTO
    {
        /// <summary>
        /// The date for this data point
        /// </summary>
        public DateTime Date { get; set; }
        
        /// <summary>
        /// Number of tasks completed on this date
        /// </summary>
        public int TasksCompleted { get; set; }
        
        /// <summary>
        /// Number of tasks created on this date
        /// </summary>
        public int TasksCreated { get; set; }
    }
    
    /// <summary>
    /// Data transfer object for task completion time
    /// </summary>
    public class TaskCompletionTimeDTO
    {
        /// <summary>
        /// Average completion time in hours
        /// </summary>
        public double AverageCompletionTimeInHours { get; set; }
        
        /// <summary>
        /// Number of tasks analyzed
        /// </summary>
        public int TasksAnalyzed { get; set; }
    }
    
    /// <summary>
    /// Data transfer object for overdue tasks statistics
    /// </summary>
    public class OverdueTasksStatisticsDTO
    {
        /// <summary>
        /// Total number of overdue tasks
        /// </summary>
        public int TotalOverdueTasks { get; set; }
        
        /// <summary>
        /// Percentage of all tasks that are overdue
        /// </summary>
        public double PercentageOfAllTasks { get; set; }
        
        /// <summary>
        /// Average number of days tasks are overdue
        /// </summary>
        public double AverageDaysOverdue { get; set; }
        
        /// <summary>
        /// Distribution of overdue tasks by priority
        /// </summary>
        public List<TaskDistributionDTO> OverdueByPriority { get; set; } = new List<TaskDistributionDTO>();
    }
} 