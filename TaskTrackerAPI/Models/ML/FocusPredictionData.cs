using System;
using System.Collections.Generic;
using Microsoft.ML.Data;

namespace TaskTrackerAPI.Models.ML
{
    /// <summary>
    /// Input data for focus session prediction model
    /// </summary>
    public class FocusPredictionData
    {
        [LoadColumn(0)]
        public float HourOfDay { get; set; }

        [LoadColumn(1)]
        public float DayOfWeek { get; set; }

        [LoadColumn(2)]
        public float PreviousSessionLength { get; set; }

        [LoadColumn(3)]
        public float PreviousDistractionCount { get; set; }

        [LoadColumn(4)]
        public float WeeklyFocusMinutes { get; set; }

        [LoadColumn(5)]
        public float AverageSessionLength { get; set; }

        [LoadColumn(6)]
        public float ConsecutiveDaysActive { get; set; }

        [LoadColumn(7)]
        public float TasksCompletedToday { get; set; }

        [LoadColumn(8)]
        public float StressLevel { get; set; } // 1-10 scale

        [LoadColumn(9)]
        public float SleepHours { get; set; }

        [LoadColumn(10)]
        public float CaffeineIntake { get; set; } // 0-5 scale

        [LoadColumn(11)]
        public float EnvironmentNoise { get; set; } // 1-10 scale

        [LoadColumn(12)]
        public float WorkloadIntensity { get; set; } // 1-10 scale

        // Target variables
        [LoadColumn(13)]
        public float SessionSuccess { get; set; } // 0 or 1 (binary classification)

        [LoadColumn(14)]
        public float PredictedFocusMinutes { get; set; } // Regression target

        [LoadColumn(15)]
        public float PredictedDistractionCount { get; set; } // Regression target
    }

    /// <summary>
    /// Prediction output for focus session success
    /// </summary>
    public class FocusSessionPrediction
    {
        [ColumnName("PredictedLabel")]
        public bool WillSucceed { get; set; }

        [ColumnName("Probability")]
        public float Probability { get; set; }

        [ColumnName("Score")]
        public float Score { get; set; }
    }

    /// <summary>
    /// Prediction output for focus duration
    /// </summary>
    public class FocusDurationPrediction
    {
        [ColumnName("Score")]
        public float PredictedMinutes { get; set; }
    }

    /// <summary>
    /// Prediction output for distraction count
    /// </summary>
    public class DistractionPrediction
    {
        [ColumnName("Score")]
        public float PredictedDistractions { get; set; }
    }

    /// <summary>
    /// Time series data for focus pattern analysis
    /// </summary>
    public class FocusTimeSeriesData
    {
        public DateTime Date { get; set; }
        public float FocusMinutes { get; set; }
        public float SessionCount { get; set; }
        public float DistractionCount { get; set; }
        public float Efficiency { get; set; }
        public float ProductivityScore { get; set; }
    }

    /// <summary>
    /// Time series forecast output
    /// </summary>
    public class FocusForecast
    {
        public float[] ForecastedFocusMinutes { get; set; } = Array.Empty<float>();
        public float[] LowerBoundValues { get; set; } = Array.Empty<float>();
        public float[] UpperBoundValues { get; set; } = Array.Empty<float>();
        public float[] ConfidenceIntervals { get; set; } = Array.Empty<float>();
    }

    /// <summary>
    /// User behavior clustering data
    /// </summary>
    public class UserBehaviorData
    {
        [LoadColumn(0)]
        public float AverageFocusTime { get; set; }

        [LoadColumn(1)]
        public float PreferredSessionLength { get; set; }

        [LoadColumn(2)]
        public float MostProductiveHour { get; set; }

        [LoadColumn(3)]
        public float WeekendActivity { get; set; }

        [LoadColumn(4)]
        public float DistractionTolerance { get; set; }

        [LoadColumn(5)]
        public float ConsistencyScore { get; set; }

        [LoadColumn(6)]
        public float BreakFrequency { get; set; }

        [LoadColumn(7)]
        public float MultitaskingTendency { get; set; }
    }

    /// <summary>
    /// Clustering prediction output
    /// </summary>
    public class UserClusterPrediction
    {
        [ColumnName("PredictedLabel")]
        public uint ClusterId { get; set; }

        [ColumnName("Distance")]
        public float[] Distances { get; set; } = Array.Empty<float>();
    }

    /// <summary>
    /// Comprehensive ML insights result
    /// </summary>
    public class MLInsightsResult
    {
        public FocusSessionPrediction? NextSessionPrediction { get; set; }
        public FocusDurationPrediction? DurationPrediction { get; set; }
        public DistractionPrediction? DistractionPrediction { get; set; }
        public FocusForecast? WeeklyForecast { get; set; }
        public UserClusterPrediction? UserCluster { get; set; }
        public List<string> PersonalizedRecommendations { get; set; } = new();
        public List<string> PredictiveInsights { get; set; } = new();
        public float OverallProductivityScore { get; set; }
        public float ConfidenceLevel { get; set; }
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }
} 