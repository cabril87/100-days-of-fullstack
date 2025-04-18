using System;

namespace TaskTrackerAPI.DTOs
{
    public class ProductivitySummaryDTO
    {
        public double AverageTasksPerDay { get; set; }
        public double AverageTasksPerWeek { get; set; }
        public double AverageCompletionRate { get; set; }
        public required object AverageTimeToComplete { get; set; }
        public required string GeneratedAt { get; set; }
    }
} 