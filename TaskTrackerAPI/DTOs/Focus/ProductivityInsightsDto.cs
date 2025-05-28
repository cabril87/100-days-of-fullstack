using System;
using System.Collections.Generic;

namespace TaskTrackerAPI.DTOs.Focus
{
    public class ProductivityInsightsDto
    {
        public TimeOfDayInsights TimeOfDayPatterns { get; set; } = new();
        public FocusStreakData StreakData { get; set; } = new();
        public CorrelationInsights Correlations { get; set; } = new();
        public TaskTypeFocusInsights TaskTypeInsights { get; set; } = new();
        public List<ProductivityRecommendation> Recommendations { get; set; } = new();
    }

    public class TimeOfDayInsights
    {
        public Dictionary<int, double> HourlyQualityRatings { get; set; } = new();
        public Dictionary<int, int> HourlySessionCounts { get; set; } = new();
        public Dictionary<int, double> HourlyAverageLength { get; set; } = new();
        public Dictionary<int, double> HourlyCompletionRates { get; set; } = new();
        public int BestFocusHour { get; set; }
        public int WorstFocusHour { get; set; }
        public double BestHourQuality { get; set; }
        public double WorstHourQuality { get; set; }
    }

    public class FocusStreakData
    {
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public int QualityStreak { get; set; } // Consecutive high-quality sessions
        public List<StreakPeriod> StreakHistory { get; set; } = new();
        public double StreakImpactOnProductivity { get; set; }
    }

    public class StreakPeriod
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Length { get; set; }
        public double AverageQuality { get; set; }
    }

    public class CorrelationInsights
    {
        public double SessionLengthQualityCorrelation { get; set; }
        public double DistractionQualityCorrelation { get; set; }
        public double TaskProgressSessionQualityCorrelation { get; set; }
        public double CompletionRateQualityCorrelation { get; set; }
    }

    public class TaskTypeFocusInsights
    {
        public Dictionary<string, double> CategoryEffectiveness { get; set; } = new();
        public Dictionary<string, double> CategoryAverageQuality { get; set; } = new();
        public Dictionary<string, int> CategorySessionCounts { get; set; } = new();
        public string MostFocusedCategory { get; set; } = string.Empty;
        public string HighestQualityCategory { get; set; } = string.Empty;
    }

    public class ProductivityRecommendation
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int Priority { get; set; } // 1-5, 1 being highest
        public Dictionary<string, object> Data { get; set; } = new();
    }
} 