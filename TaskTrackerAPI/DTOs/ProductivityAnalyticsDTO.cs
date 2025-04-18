using System;
using System.Collections.Generic;

namespace TaskTrackerAPI.DTOs
{
    public class ProductivityAnalyticsDTO
    {
        public DateTime GeneratedAt { get; set; }
        public List<TimeOfDayProductivityDTO> TimeOfDayAnalytics { get; set; } = new();
        public List<DailyProductivityDTO> DailyProductivity { get; set; } = new();
        public List<WeeklyProductivityDTO> WeeklyProductivity { get; set; } = new();
        public List<MonthlyProductivityDTO> MonthlyProductivity { get; set; } = new();
        public double AverageCompletionRate { get; set; }
        public double AverageTasksPerDay { get; set; }
        public double AverageTasksPerWeek { get; set; }
        public TimeSpan AverageTimeToComplete { get; set; }
    }

    public class TimeOfDayProductivityDTO
    {
        public string TimeFrame { get; set; } = string.Empty;
        public int CompletedTasks { get; set; }
        public int CreatedTasks { get; set; }
        public double CompletionRate { get; set; }
    }

    public class DailyProductivityDTO
    {
        public DateTime Date { get; set; }
        public int CompletedTasks { get; set; }
        public int CreatedTasks { get; set; }
        public double CompletionRate { get; set; }
        public double EfficiencyScore { get; set; }
    }

    public class WeeklyProductivityDTO
    {
        public int WeekNumber { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int CompletedTasks { get; set; }
        public int CreatedTasks { get; set; }
        public double CompletionRate { get; set; }
        public List<string> TopCategories { get; set; } = new();
        public double EfficiencyScore { get; set; }
    }

    public class MonthlyProductivityDTO
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public int CompletedTasks { get; set; }
        public int CreatedTasks { get; set; }
        public double CompletionRate { get; set; }
        public List<string> TopCategories { get; set; } = new();
        public double EfficiencyScore { get; set; }
    }
} 