using System;
using System.Collections.Generic;

namespace TaskTrackerAPI.DTOs.Security
{
    public class BehavioralAnalyticsDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string IPAddress { get; set; } = string.Empty;
        public string ActionType { get; set; } = string.Empty;
        public string ResourceAccessed { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public TimeSpan SessionDuration { get; set; }
        public int ActionsPerMinute { get; set; }
        public int DataVolumeAccessed { get; set; }
        public string Country { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string DeviceType { get; set; } = string.Empty;
        public string Browser { get; set; } = string.Empty;
        public string OperatingSystem { get; set; } = string.Empty;
        public bool IsAnomalous { get; set; }
        public double AnomalyScore { get; set; }
        public string RiskLevel { get; set; } = string.Empty;
        public string AnomalyReason { get; set; } = string.Empty;
        public bool IsNewLocation { get; set; }
        public bool IsNewDevice { get; set; }
        public bool IsOffHours { get; set; }
        public bool IsHighVelocity { get; set; }
        public double DeviationFromBaseline { get; set; }
        public bool IsOutsideNormalPattern { get; set; }
    }

    public class BehavioralAnalyticsSummaryDTO
    {
        public int TotalBehaviorRecords { get; set; }
        public int AnomalousActivities { get; set; }
        public int CriticalAnomalies { get; set; }
        public int HighRiskActivities { get; set; }
        public int MediumRiskActivities { get; set; }
        public int LowRiskActivities { get; set; }
        public int NewLocationAccess { get; set; }
        public int NewDeviceAccess { get; set; }
        public int OffHoursActivities { get; set; }
        public int HighVelocityActivities { get; set; }
        public double AverageAnomalyScore { get; set; }
        public List<UserBehaviorSummaryDTO> TopAnomalousUsers { get; set; } = new();
        public List<BehaviorPatternDTO> CommonPatterns { get; set; } = new();
        public List<BehavioralAnalyticsDTO> RecentAnomalies { get; set; } = new();
        public List<string> TopAnomalyReasons { get; set; } = new();
        public DateTime LastAnalyzed { get; set; }
    }

    public class UserBehaviorSummaryDTO
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int TotalActivities { get; set; }
        public int AnomalousActivities { get; set; }
        public double AnomalyPercentage { get; set; }
        public double AverageAnomalyScore { get; set; }
        public string HighestRiskLevel { get; set; } = string.Empty;
        public DateTime LastActivity { get; set; }
        public List<string> CommonAnomalyReasons { get; set; } = new();
    }

    public class BehaviorPatternDTO
    {
        public string PatternType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Frequency { get; set; }
        public double RiskScore { get; set; }
        public List<string> AffectedUsers { get; set; } = new();
    }

    public class AnomalyDetectionResultDTO
    {
        public bool IsAnomalous { get; set; }
        public double AnomalyScore { get; set; }
        public string RiskLevel { get; set; } = string.Empty;
        public List<string> AnomalyReasons { get; set; } = new();
        public string RecommendedAction { get; set; } = string.Empty;
        public DateTime AnalyzedAt { get; set; }
    }

    public class UserBaselineDTO
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public List<string> TypicalLocations { get; set; } = new();
        public List<string> TypicalDevices { get; set; } = new();
        public TimeSpan TypicalSessionDuration { get; set; }
        public int TypicalActionsPerMinute { get; set; }
        public List<string> TypicalActionTypes { get; set; } = new();
        public TimeSpan TypicalActiveHours { get; set; }
        public DateTime BaselineCreated { get; set; }
        public DateTime LastUpdated { get; set; }
    }
} 