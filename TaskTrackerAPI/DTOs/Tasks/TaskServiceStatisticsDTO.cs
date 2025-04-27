using System;
using System.Collections.Generic;

namespace TaskTrackerAPI.DTOs.Tasks
{
    /// <summary>
    /// Data transfer object for task service statistics
    /// </summary>
    public class TimeRangeTaskStatisticsDTO
    {
        /// <summary>
        /// Total number of tasks
        /// </summary>
        public int TotalTasks { get; set; }
        
        /// <summary>
        /// Number of completed tasks
        /// </summary>
        public int CompletedTasksCount { get; set; }
        
        /// <summary>
        /// Number of in-progress tasks
        /// </summary>
        public int InProgressTasksCount { get; set; }
        
        /// <summary>
        /// Number of tasks in other statuses (not completed or in-progress)
        /// </summary>
        public int OtherStatusTasksCount { get; set; }
        
        /// <summary>
        /// Number of overdue tasks
        /// </summary>
        public int OverdueTasksCount { get; set; }
        
        /// <summary>
        /// Number of tasks due today
        /// </summary>
        public int DueTodayCount { get; set; }
        
        /// <summary>
        /// Number of tasks due this week
        /// </summary>
        public int DueThisWeekCount { get; set; }
        
        /// <summary>
        /// Number of tasks due next week
        /// </summary>
        public int DueNextWeekCount { get; set; }
        
        /// <summary>
        /// Tasks grouped by category
        /// </summary>
        public Dictionary<string, int> TasksByCategory { get; set; } = new Dictionary<string, int>();
        
        /// <summary>
        /// Tasks grouped by tag
        /// </summary>
        public Dictionary<string, int> TasksByTag { get; set; } = new Dictionary<string, int>();
        
        /// <summary>
        /// Recently modified tasks
        /// </summary>
        public List<TaskItemDTO> RecentlyModifiedTasks { get; set; } = new List<TaskItemDTO>();
        
        /// <summary>
        /// Recently completed tasks
        /// </summary>
        public List<TaskItemDTO> RecentlyCompletedTasks { get; set; } = new List<TaskItemDTO>();
    }
} 