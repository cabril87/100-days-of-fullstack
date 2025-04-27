using System;
using System.Collections.Generic;

namespace TaskTrackerAPI.DTOs
{
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