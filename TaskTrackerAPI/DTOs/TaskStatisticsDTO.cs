// 1. First, let's create the TaskStatisticsDTO
using System;
using System.Collections.Generic;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs
{
    public class TaskCompletionRateDTO
    {
        public double CompletionRate { get; set; }
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
    }

    public class TaskDistributionDTO
    {
        public string Label { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public class TaskCompletionTimeDTO
    {
        public double AverageCompletionTimeInHours { get; set; }
        public int TasksAnalyzed { get; set; }
    }

    public class ProductivityDataPointDTO
    {
        public DateTime Date { get; set; }
        public int TasksCompleted { get; set; }
        public int TasksCreated { get; set; }
    }

    public class OverdueTasksStatisticsDTO
    {
        public int TotalOverdueTasks { get; set; }
        public double PercentageOfAllTasks { get; set; }
        public double AverageDaysOverdue { get; set; }
        public List<TaskDistributionDTO> OverdueByPriority { get; set; } = new List<TaskDistributionDTO>();
    }

    public class TaskStatisticsDTO
    {
        public TaskCompletionRateDTO CompletionRate { get; set; } = new TaskCompletionRateDTO();
        public List<TaskDistributionDTO> TasksByStatus { get; set; } = new List<TaskDistributionDTO>();
        public List<TaskDistributionDTO> TasksByPriority { get; set; } = new List<TaskDistributionDTO>();
        public List<TaskDistributionDTO> TasksByCategory { get; set; } = new List<TaskDistributionDTO>();
        public TaskCompletionTimeDTO CompletionTime { get; set; } = new TaskCompletionTimeDTO();
        public List<ProductivityDataPointDTO> ProductivityTrend { get; set; } = new List<ProductivityDataPointDTO>();
        public OverdueTasksStatisticsDTO OverdueTasks { get; set; } = new OverdueTasksStatisticsDTO();
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }
}