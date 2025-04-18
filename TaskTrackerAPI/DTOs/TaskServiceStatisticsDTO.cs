using System;
using System.Collections.Generic;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs
{
    public class TaskServiceStatisticsDTO
    {
        public int TotalTasks { get; set; }
        public int CompletedTasksCount { get; set; }
        public int InProgressTasksCount { get; set; }
        public int OtherStatusTasksCount { get; set; }
        public int OverdueTasksCount { get; set; }
        public int DueTodayCount { get; set; }
        public int DueThisWeekCount { get; set; }
        public int DueNextWeekCount { get; set; }
        public Dictionary<string, int> TasksByCategory { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> TasksByTag { get; set; } = new Dictionary<string, int>();
        public List<TaskItemDTO> RecentlyModifiedTasks { get; set; } = new List<TaskItemDTO>();
        public List<TaskItemDTO> RecentlyCompletedTasks { get; set; } = new List<TaskItemDTO>();
    }
} 