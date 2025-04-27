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
} 