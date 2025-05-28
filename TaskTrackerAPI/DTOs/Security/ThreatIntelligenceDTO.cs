using System;
using System.Collections.Generic;

namespace TaskTrackerAPI.DTOs.Security
{
    public class ThreatIntelligenceDTO
    {
        public int Id { get; set; }
        public string IPAddress { get; set; } = string.Empty;
        public string ThreatType { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string ThreatSource { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int ConfidenceScore { get; set; }
        public bool IsActive { get; set; }
        public DateTime FirstSeen { get; set; }
        public DateTime LastSeen { get; set; }
        public string Country { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string ISP { get; set; } = string.Empty;
        public int ReportCount { get; set; }
        public bool IsWhitelisted { get; set; }
        public bool IsBlacklisted { get; set; }
    }

    public class ThreatIntelligenceSummaryDTO
    {
        public int TotalThreats { get; set; }
        public int ActiveThreats { get; set; }
        public int CriticalThreats { get; set; }
        public int HighThreats { get; set; }
        public int MediumThreats { get; set; }
        public int LowThreats { get; set; }
        public int BlacklistedIPs { get; set; }
        public int WhitelistedIPs { get; set; }
        public List<ThreatTypeCountDTO> ThreatTypeBreakdown { get; set; } = new();
        public List<ThreatSourceCountDTO> ThreatSourceBreakdown { get; set; } = new();
        public List<ThreatIntelligenceDTO> RecentThreats { get; set; } = new();
        public List<string> TopThreatCountries { get; set; } = new();
        public double AverageThreatScore { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class ThreatTypeCountDTO
    {
        public string ThreatType { get; set; } = string.Empty;
        public int Count { get; set; }
        public string Severity { get; set; } = string.Empty;
    }

    public class ThreatSourceCountDTO
    {
        public string Source { get; set; } = string.Empty;
        public int Count { get; set; }
        public double AverageConfidence { get; set; }
    }

    public class IPReputationCheckDTO
    {
        public string IPAddress { get; set; } = string.Empty;
        public bool IsThreat { get; set; }
        public string ThreatLevel { get; set; } = string.Empty;
        public List<string> ThreatTypes { get; set; } = new();
        public int ConfidenceScore { get; set; }
        public string RecommendedAction { get; set; } = string.Empty;
        public DateTime CheckedAt { get; set; }
    }
} 