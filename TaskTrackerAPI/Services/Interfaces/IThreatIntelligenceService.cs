using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Security;

namespace TaskTrackerAPI.Services.Interfaces
{
    public interface IThreatIntelligenceService
    {
        Task<ThreatIntelligenceSummaryDTO> GetThreatIntelligenceSummaryAsync();
        Task<IPReputationCheckDTO> CheckIPReputationAsync(string ipAddress);
        Task<List<ThreatIntelligenceDTO>> GetThreatsByTypeAsync(string threatType);
        Task<List<ThreatIntelligenceDTO>> GetThreatsBySeverityAsync(string severity);
        Task<List<ThreatIntelligenceDTO>> GetRecentThreatsAsync(int count = 10);
        Task<bool> AddThreatIntelligenceAsync(string ipAddress, string threatType, string severity, string source, string description, int confidenceScore);
        Task<bool> UpdateThreatStatusAsync(int threatId, bool isActive);
        Task<bool> WhitelistIPAsync(string ipAddress, string reason);
        Task<bool> BlacklistIPAsync(string ipAddress, string reason);
        Task<bool> IsIPBlacklistedAsync(string ipAddress);
        Task<bool> IsIPWhitelistedAsync(string ipAddress);
        Task<List<string>> GetThreatTypesAsync();
        Task<List<string>> GetThreatSourcesAsync();
        Task RefreshThreatIntelligenceAsync();
        Task<int> CleanupOldThreatsAsync(int daysOld = 90);
    }
} 