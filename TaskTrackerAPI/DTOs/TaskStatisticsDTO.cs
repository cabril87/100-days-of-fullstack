// 1. First, let's create the TaskStatisticsDTO
using System;
using System.Collections.Generic;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs
{

    public class TaskStatisticsDTO
    {
        // Total counts by status
        public int TotalTasks { get; set; }
        public int CompletedTasksCount { get; set; }
        public int InProgressTasksCount { get; set; }
        public int OtherStatusTasksCount { get; set; }
        public int OverdueTasksCount { get; set; }
        
        // Category-based statistics
        public Dictionary<string, int> TasksByCategory { get; set; } = new Dictionary<string, int>();
        
        // Due date grouping
        public int DueTodayCount { get; set; }
        public int DueThisWeekCount { get; set; }
        public int DueNextWeekCount { get; set; }
        
        // Tag-based statistics
        public Dictionary<string, int> TasksByTag { get; set; } = new Dictionary<string, int>();
        
        // Recent activity
        public List<TaskItemDTO> RecentlyModifiedTasks { get; set; } = new List<TaskItemDTO>();
        public List<TaskItemDTO> RecentlyCompletedTasks { get; set; } = new List<TaskItemDTO>();
    }
}