using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Security;
using TaskTrackerAPI.Models.Security;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;
using System.Text.Json;

namespace TaskTrackerAPI.Services
{
    public class ThreatIntelligenceService : IThreatIntelligenceService
    {
        private readonly IThreatIntelligenceRepository _threatRepository;
        private readonly ILogger<ThreatIntelligenceService> _logger;
        private readonly IMapper _mapper;
        private readonly HttpClient _httpClient;

        // Known threat intelligence sources and patterns
        private readonly List<string> _knownMaliciousPatterns = new()
        {
            "192.168.", "10.", "172.16.", "127.", "0.0.0.0", "255.255.255.255"
        };

        private readonly Dictionary<string, int> _threatTypeScores = new()
        {
            { "Malware", 90 },
            { "Botnet", 85 },
            { "Phishing", 80 },
            { "Spam", 60 },
            { "Scanning", 70 },
            { "Brute Force", 75 },
            { "DDoS", 85 },
            { "Suspicious", 50 }
        };

        public ThreatIntelligenceService(
            IThreatIntelligenceRepository threatRepository,
            ILogger<ThreatIntelligenceService> logger,
            IMapper mapper,
            HttpClient httpClient)
        {
            _threatRepository = threatRepository ?? throw new ArgumentNullException(nameof(threatRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        }

        public async Task<ThreatIntelligenceSummaryDTO> GetThreatIntelligenceSummaryAsync()
        {
            try
            {
                // Get threat statistics from repository
                Dictionary<string, int> statistics = await _threatRepository.GetThreatStatisticsAsync();
                IEnumerable<ThreatIntelligence> recentThreats = await _threatRepository.GetRecentThreatsAsync(10);
                IEnumerable<string> topThreatCountries = await _threatRepository.GetTopThreatCountriesAsync(10);

                ThreatIntelligenceSummaryDTO summary = new ThreatIntelligenceSummaryDTO
                {
                    TotalThreats = statistics.GetValueOrDefault("TotalThreats", 0),
                    CriticalThreats = statistics.GetValueOrDefault("CriticalThreats", 0),
                    HighThreats = statistics.GetValueOrDefault("HighThreats", 0),
                    MediumThreats = statistics.GetValueOrDefault("MediumThreats", 0),
                    LowThreats = statistics.GetValueOrDefault("LowThreats", 0),
                    BlacklistedIPs = statistics.GetValueOrDefault("BlacklistedIPs", 0),
                    WhitelistedIPs = statistics.GetValueOrDefault("WhitelistedIPs", 0),
                    LastUpdated = DateTime.UtcNow
                };

                // Recent threats
                summary.RecentThreats = _mapper.Map<List<ThreatIntelligenceDTO>>(recentThreats);

                // Top threat countries
                summary.TopThreatCountries = topThreatCountries.ToList();

                return summary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting threat intelligence summary");
                return new ThreatIntelligenceSummaryDTO { LastUpdated = DateTime.UtcNow };
            }
        }

        public async Task<IPReputationCheckDTO> CheckIPReputationAsync(string ipAddress)
        {
            try
            {
                IPReputationCheckDTO result = new IPReputationCheckDTO
                {
                    IPAddress = ipAddress,
                    CheckedAt = DateTime.UtcNow
                };

                // Check local threat intelligence database using repository
                ThreatIntelligence? localThreat = await _threatRepository.GetThreatByIPAsync(ipAddress);

                if (localThreat != null)
                {
                    result.IsThreat = true;
                    result.ThreatLevel = localThreat.Severity;
                    result.ThreatTypes.Add(localThreat.ThreatType);
                    result.ConfidenceScore = localThreat.ConfidenceScore;
                    result.RecommendedAction = GetRecommendedAction(localThreat.Severity, localThreat.ThreatType);
                    return result;
                }

                // If not found locally, perform basic pattern checks
                result.IsThreat = IsKnownMaliciousPattern(ipAddress);
                if (result.IsThreat)
                {
                    result.ThreatLevel = "Medium";
                    result.ThreatTypes.Add("Pattern Match");
                    result.ConfidenceScore = 60;
                    result.RecommendedAction = "Monitor";
                }
                else
                {
                    result.ThreatLevel = "Safe";
                    result.ConfidenceScore = 95;
                    result.RecommendedAction = "Allow";
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking IP reputation for {IPAddress}", ipAddress);
                return new IPReputationCheckDTO
                {
                    IPAddress = ipAddress,
                    IsThreat = false,
                    ThreatLevel = "Unknown",
                    ConfidenceScore = 0,
                    RecommendedAction = "Monitor",
                    CheckedAt = DateTime.UtcNow
                };
            }
        }

        public async Task<List<ThreatIntelligenceDTO>> GetThreatsByTypeAsync(string threatType)
        {
            try
            {
                IEnumerable<ThreatIntelligence> threats = await _threatRepository.GetThreatsByTypeAsync(threatType);
                return _mapper.Map<List<ThreatIntelligenceDTO>>(threats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting threats by type {ThreatType}", threatType);
                return new List<ThreatIntelligenceDTO>();
            }
        }

        public async Task<List<ThreatIntelligenceDTO>> GetThreatsBySeverityAsync(string severity)
        {
            try
            {
                IEnumerable<ThreatIntelligence> threats = await _threatRepository.GetThreatsBySeverityAsync(severity);
                return _mapper.Map<List<ThreatIntelligenceDTO>>(threats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting threats by severity {Severity}", severity);
                return new List<ThreatIntelligenceDTO>();
            }
        }

        public async Task<List<ThreatIntelligenceDTO>> GetRecentThreatsAsync(int count = 10)
        {
            try
            {
                IEnumerable<ThreatIntelligence> threats = await _threatRepository.GetRecentThreatsAsync(count);
                return _mapper.Map<List<ThreatIntelligenceDTO>>(threats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent threats");
                return new List<ThreatIntelligenceDTO>();
            }
        }

        public async Task<bool> AddThreatIntelligenceAsync(string ipAddress, string threatType, string severity, 
            string source, string description, int confidenceScore)
        {
            try
            {
                ThreatIntelligence? existingThreat = await _threatRepository.GetThreatByIPAndTypeAsync(ipAddress, threatType);

                if (existingThreat != null)
                {
                    // Update existing threat
                    existingThreat.LastSeen = DateTime.UtcNow;
                    existingThreat.ReportCount++;
                    existingThreat.ConfidenceScore = Math.Max(existingThreat.ConfidenceScore, confidenceScore);
                    existingThreat.UpdatedAt = DateTime.UtcNow;
                    existingThreat.IsActive = true;

                    await _threatRepository.UpdateThreatAsync(existingThreat);
                }
                else
                {
                    // Add new threat
                    ThreatIntelligence threat = new ThreatIntelligence
                    {
                        IPAddress = ipAddress,
                        ThreatType = threatType,
                        Severity = severity,
                        ThreatSource = source,
                        Description = description,
                        ConfidenceScore = confidenceScore,
                        FirstSeen = DateTime.UtcNow,
                        LastSeen = DateTime.UtcNow,
                        ReportCount = 1,
                        IsActive = true
                    };

                    await _threatRepository.CreateThreatAsync(threat);
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding threat intelligence for IP {IPAddress}", ipAddress);
                return false;
            }
        }

        public async Task<bool> UpdateThreatStatusAsync(int threatId, bool isActive)
        {
            try
            {
                return await _threatRepository.UpdateThreatStatusAsync(threatId, isActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating threat status for ID {ThreatId}", threatId);
                return false;
            }
        }

        public async Task<bool> WhitelistIPAsync(string ipAddress, string reason)
        {
            try
            {
                ThreatIntelligence? existingThreat = await _threatRepository.GetThreatByIPAsync(ipAddress);

                if (existingThreat != null)
                {
                    existingThreat.IsWhitelisted = true;
                    existingThreat.IsBlacklisted = false;
                    existingThreat.Description = $"Whitelisted: {reason}";
                    existingThreat.UpdatedAt = DateTime.UtcNow;
                    await _threatRepository.UpdateThreatAsync(existingThreat);
                }
                else
                {
                    ThreatIntelligence whitelist = new ThreatIntelligence
                    {
                        IPAddress = ipAddress,
                        ThreatType = "Whitelist",
                        Severity = "Safe",
                        ThreatSource = "Manual",
                        Description = $"Whitelisted: {reason}",
                        ConfidenceScore = 100,
                        FirstSeen = DateTime.UtcNow,
                        LastSeen = DateTime.UtcNow,
                        IsWhitelisted = true,
                        IsActive = true
                    };

                    await _threatRepository.CreateThreatAsync(whitelist);
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error whitelisting IP {IPAddress}", ipAddress);
                return false;
            }
        }

        public async Task<bool> BlacklistIPAsync(string ipAddress, string reason)
        {
            try
            {
                ThreatIntelligence? existingThreat = await _threatRepository.GetThreatByIPAsync(ipAddress);

                if (existingThreat != null)
                {
                    existingThreat.IsBlacklisted = true;
                    existingThreat.IsWhitelisted = false;
                    existingThreat.Severity = "Critical";
                    existingThreat.Description = $"Blacklisted: {reason}";
                    existingThreat.UpdatedAt = DateTime.UtcNow;
                    await _threatRepository.UpdateThreatAsync(existingThreat);
                }
                else
                {
                    ThreatIntelligence blacklist = new ThreatIntelligence
                    {
                        IPAddress = ipAddress,
                        ThreatType = "Blacklist",
                        Severity = "Critical",
                        ThreatSource = "Manual",
                        Description = $"Blacklisted: {reason}",
                        ConfidenceScore = 100,
                        FirstSeen = DateTime.UtcNow,
                        LastSeen = DateTime.UtcNow,
                        IsBlacklisted = true,
                        IsActive = true
                    };

                    await _threatRepository.CreateThreatAsync(blacklist);
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error blacklisting IP {IPAddress}", ipAddress);
                return false;
            }
        }

        public async Task<bool> IsIPBlacklistedAsync(string ipAddress)
        {
            try
            {
                return await _threatRepository.IsIPBlacklistedAsync(ipAddress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if IP is blacklisted {IPAddress}", ipAddress);
                return false;
            }
        }

        public async Task<bool> IsIPWhitelistedAsync(string ipAddress)
        {
            try
            {
                return await _threatRepository.IsIPWhitelistedAsync(ipAddress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if IP is whitelisted {IPAddress}", ipAddress);
                return false;
            }
        }

        public async Task<List<string>> GetThreatTypesAsync()
        {
            try
            {
                IEnumerable<string> threatTypes = await _threatRepository.GetThreatTypesAsync();
                return threatTypes.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting threat types");
                return new List<string>();
            }
        }

        public async Task<List<string>> GetThreatSourcesAsync()
        {
            try
            {
                IEnumerable<string> threatSources = await _threatRepository.GetThreatSourcesAsync();
                return threatSources.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting threat sources");
                return new List<string>();
            }
        }

        public async Task RefreshThreatIntelligenceAsync()
        {
            try
            {
                _logger.LogInformation("Refreshing threat intelligence data");

                // Generate sample threat intelligence data for demonstration
                await GenerateSampleThreatDataAsync();

                _logger.LogInformation("Threat intelligence refresh completed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing threat intelligence");
            }
        }

        public async Task<int> CleanupOldThreatsAsync(int daysOld = 90)
        {
            try
            {
                IEnumerable<ThreatIntelligence> oldThreats = await _threatRepository.GetOldThreatsForCleanupAsync(daysOld);
                int removedCount = await _threatRepository.RemoveThreatsAsync(oldThreats);

                _logger.LogInformation("Cleaned up {Count} old threat intelligence records", removedCount);
                return removedCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up old threats");
                return 0;
            }
        }

        private bool IsKnownMaliciousPattern(string ipAddress)
        {
            return _knownMaliciousPatterns.Any(pattern => ipAddress.StartsWith(pattern));
        }

        private string GetRecommendedAction(string severity, string threatType)
        {
            return severity.ToLower() switch
            {
                "critical" => "Block",
                "high" => "Block",
                "medium" => "Monitor",
                "low" => "Allow",
                _ => "Monitor"
            };
        }

        private async Task GenerateSampleThreatDataAsync()
        {
            List<ThreatIntelligence> sampleThreats = new List<ThreatIntelligence>
            {
                new() {
                    IPAddress = "192.168.1.100",
                    ThreatType = "Scanning",
                    Severity = "Medium",
                    ThreatSource = "Internal Detection",
                    Description = "Port scanning activity detected",
                    ConfidenceScore = 75,
                    FirstSeen = DateTime.UtcNow.AddDays(-2),
                    LastSeen = DateTime.UtcNow.AddHours(-1),
                    Country = "Unknown",
                    ReportCount = 3,
                    IsActive = true
                },
                new() {
                    IPAddress = "10.0.0.50",
                    ThreatType = "Brute Force",
                    Severity = "High",
                    ThreatSource = "Failed Login Monitor",
                    Description = "Multiple failed login attempts",
                    ConfidenceScore = 85,
                    FirstSeen = DateTime.UtcNow.AddDays(-1),
                    LastSeen = DateTime.UtcNow.AddMinutes(-30),
                    Country = "Unknown",
                    ReportCount = 15,
                    IsActive = true
                }
            };

            foreach (ThreatIntelligence threat in sampleThreats)
            {
                ThreatIntelligence? existing = await _threatRepository.GetThreatByIPAndTypeAsync(threat.IPAddress, threat.ThreatType);

                if (existing == null)
                {
                    await _threatRepository.CreateThreatAsync(threat);
                }
            }
        }
    }
} 