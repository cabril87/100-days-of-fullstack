using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.DTOs.Security;
using TaskTrackerAPI.Models.Security;
using TaskTrackerAPI.Services.Interfaces;
using System.Text.Json;

namespace TaskTrackerAPI.Services
{
    public class ThreatIntelligenceService : IThreatIntelligenceService
    {
        private readonly ApplicationDbContext _context;
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
            ApplicationDbContext context,
            ILogger<ThreatIntelligenceService> logger,
            IMapper mapper,
            HttpClient httpClient)
        {
            _context = context;
            _logger = logger;
            _mapper = mapper;
            _httpClient = httpClient;
        }

        public async Task<ThreatIntelligenceSummaryDTO> GetThreatIntelligenceSummaryAsync()
        {
            try
            {
                var threats = await _context.ThreatIntelligence
                    .Where(t => t.IsActive)
                    .ToListAsync();

                var summary = new ThreatIntelligenceSummaryDTO
                {
                    TotalThreats = threats.Count,
                    ActiveThreats = threats.Count(t => t.IsActive),
                    CriticalThreats = threats.Count(t => t.Severity == "Critical"),
                    HighThreats = threats.Count(t => t.Severity == "High"),
                    MediumThreats = threats.Count(t => t.Severity == "Medium"),
                    LowThreats = threats.Count(t => t.Severity == "Low"),
                    BlacklistedIPs = threats.Count(t => t.IsBlacklisted),
                    WhitelistedIPs = threats.Count(t => t.IsWhitelisted),
                    AverageThreatScore = threats.Any() ? threats.Average(t => t.ConfidenceScore) : 0,
                    LastUpdated = DateTime.UtcNow
                };

                // Threat type breakdown
                summary.ThreatTypeBreakdown = threats
                    .GroupBy(t => t.ThreatType)
                    .Select(g => new ThreatTypeCountDTO
                    {
                        ThreatType = g.Key,
                        Count = g.Count(),
                        Severity = g.OrderByDescending(t => _threatTypeScores.GetValueOrDefault(t.ThreatType, 0))
                                   .First().Severity
                    })
                    .OrderByDescending(t => t.Count)
                    .ToList();

                // Threat source breakdown
                summary.ThreatSourceBreakdown = threats
                    .GroupBy(t => t.ThreatSource)
                    .Select(g => new ThreatSourceCountDTO
                    {
                        Source = g.Key,
                        Count = g.Count(),
                        AverageConfidence = g.Average(t => t.ConfidenceScore)
                    })
                    .OrderByDescending(t => t.Count)
                    .ToList();

                // Recent threats
                summary.RecentThreats = _mapper.Map<List<ThreatIntelligenceDTO>>(
                    threats.OrderByDescending(t => t.LastSeen).Take(10));

                // Top threat countries
                summary.TopThreatCountries = threats
                    .Where(t => !string.IsNullOrEmpty(t.Country))
                    .GroupBy(t => t.Country)
                    .OrderByDescending(g => g.Count())
                    .Take(10)
                    .Select(g => g.Key)
                    .ToList();

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
                var result = new IPReputationCheckDTO
                {
                    IPAddress = ipAddress,
                    CheckedAt = DateTime.UtcNow
                };

                // Check local threat intelligence database
                var localThreat = await _context.ThreatIntelligence
                    .Where(t => t.IPAddress == ipAddress && t.IsActive)
                    .OrderByDescending(t => t.ConfidenceScore)
                    .FirstOrDefaultAsync();

                if (localThreat != null)
                {
                    result.IsThreat = true;
                    result.ThreatLevel = localThreat.Severity;
                    result.ThreatTypes.Add(localThreat.ThreatType);
                    result.ConfidenceScore = localThreat.ConfidenceScore;
                    result.RecommendedAction = GetRecommendedAction(localThreat.Severity, localThreat.ThreatType);
                    return result;
                }

                // Check if IP is whitelisted
                var whitelisted = await _context.ThreatIntelligence
                    .AnyAsync(t => t.IPAddress == ipAddress && t.IsWhitelisted);

                if (whitelisted)
                {
                    result.IsThreat = false;
                    result.ThreatLevel = "Safe";
                    result.ConfidenceScore = 100;
                    result.RecommendedAction = "Allow";
                    return result;
                }

                // Perform basic pattern analysis
                var patternAnalysis = AnalyzeIPPatterns(ipAddress);
                if (patternAnalysis.IsSuspicious)
                {
                    result.IsThreat = true;
                    result.ThreatLevel = "Medium";
                    result.ThreatTypes.AddRange(patternAnalysis.ThreatTypes);
                    result.ConfidenceScore = patternAnalysis.ConfidenceScore;
                    result.RecommendedAction = "Monitor";

                    // Log this as a new threat
                    await AddThreatIntelligenceAsync(ipAddress, "Suspicious", "Medium", "Pattern Analysis", 
                        patternAnalysis.Description, patternAnalysis.ConfidenceScore);
                }
                else
                {
                    result.IsThreat = false;
                    result.ThreatLevel = "Low";
                    result.ConfidenceScore = 10;
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
                var threats = await _context.ThreatIntelligence
                    .Where(t => t.ThreatType == threatType && t.IsActive)
                    .OrderByDescending(t => t.LastSeen)
                    .ToListAsync();

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
                var threats = await _context.ThreatIntelligence
                    .Where(t => t.Severity == severity && t.IsActive)
                    .OrderByDescending(t => t.ConfidenceScore)
                    .ToListAsync();

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
                var threats = await _context.ThreatIntelligence
                    .Where(t => t.IsActive)
                    .OrderByDescending(t => t.LastSeen)
                    .Take(count)
                    .ToListAsync();

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
                var existingThreat = await _context.ThreatIntelligence
                    .FirstOrDefaultAsync(t => t.IPAddress == ipAddress && t.ThreatType == threatType);

                if (existingThreat != null)
                {
                    // Update existing threat
                    existingThreat.LastSeen = DateTime.UtcNow;
                    existingThreat.ReportCount++;
                    existingThreat.ConfidenceScore = Math.Max(existingThreat.ConfidenceScore, confidenceScore);
                    existingThreat.UpdatedAt = DateTime.UtcNow;
                    existingThreat.IsActive = true;
                }
                else
                {
                    // Add new threat
                    var threat = new ThreatIntelligence
                    {
                        IPAddress = ipAddress,
                        ThreatType = threatType,
                        Severity = severity,
                        ThreatSource = source,
                        Description = description,
                        ConfidenceScore = confidenceScore,
                        FirstSeen = DateTime.UtcNow,
                        LastSeen = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        ReportCount = 1,
                        IsActive = true
                    };

                    _context.ThreatIntelligence.Add(threat);
                }

                await _context.SaveChangesAsync();
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
                var threat = await _context.ThreatIntelligence.FindAsync(threatId);
                if (threat != null)
                {
                    threat.IsActive = isActive;
                    threat.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    return true;
                }
                return false;
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
                var existingThreat = await _context.ThreatIntelligence
                    .FirstOrDefaultAsync(t => t.IPAddress == ipAddress);

                if (existingThreat != null)
                {
                    existingThreat.IsWhitelisted = true;
                    existingThreat.IsBlacklisted = false;
                    existingThreat.Description = $"Whitelisted: {reason}";
                    existingThreat.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    var whitelist = new ThreatIntelligence
                    {
                        IPAddress = ipAddress,
                        ThreatType = "Whitelist",
                        Severity = "Safe",
                        ThreatSource = "Manual",
                        Description = $"Whitelisted: {reason}",
                        ConfidenceScore = 100,
                        FirstSeen = DateTime.UtcNow,
                        LastSeen = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        IsWhitelisted = true,
                        IsActive = true
                    };

                    _context.ThreatIntelligence.Add(whitelist);
                }

                await _context.SaveChangesAsync();
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
                var existingThreat = await _context.ThreatIntelligence
                    .FirstOrDefaultAsync(t => t.IPAddress == ipAddress);

                if (existingThreat != null)
                {
                    existingThreat.IsBlacklisted = true;
                    existingThreat.IsWhitelisted = false;
                    existingThreat.Severity = "Critical";
                    existingThreat.Description = $"Blacklisted: {reason}";
                    existingThreat.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    var blacklist = new ThreatIntelligence
                    {
                        IPAddress = ipAddress,
                        ThreatType = "Blacklist",
                        Severity = "Critical",
                        ThreatSource = "Manual",
                        Description = $"Blacklisted: {reason}",
                        ConfidenceScore = 100,
                        FirstSeen = DateTime.UtcNow,
                        LastSeen = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        IsBlacklisted = true,
                        IsActive = true
                    };

                    _context.ThreatIntelligence.Add(blacklist);
                }

                await _context.SaveChangesAsync();
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
                return await _context.ThreatIntelligence
                    .AnyAsync(t => t.IPAddress == ipAddress && t.IsBlacklisted && t.IsActive);
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
                return await _context.ThreatIntelligence
                    .AnyAsync(t => t.IPAddress == ipAddress && t.IsWhitelisted && t.IsActive);
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
                return await _context.ThreatIntelligence
                    .Where(t => t.IsActive)
                    .Select(t => t.ThreatType)
                    .Distinct()
                    .OrderBy(t => t)
                    .ToListAsync();
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
                return await _context.ThreatIntelligence
                    .Where(t => t.IsActive)
                    .Select(t => t.ThreatSource)
                    .Distinct()
                    .OrderBy(t => t)
                    .ToListAsync();
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
                var cutoffDate = DateTime.UtcNow.AddDays(-daysOld);
                var oldThreats = await _context.ThreatIntelligence
                    .Where(t => t.LastSeen < cutoffDate && !t.IsBlacklisted && !t.IsWhitelisted)
                    .ToListAsync();

                _context.ThreatIntelligence.RemoveRange(oldThreats);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Cleaned up {Count} old threat intelligence records", oldThreats.Count);
                return oldThreats.Count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up old threats");
                return 0;
            }
        }

        private (bool IsSuspicious, List<string> ThreatTypes, int ConfidenceScore, string Description) AnalyzeIPPatterns(string ipAddress)
        {
            var threatTypes = new List<string>();
            var isSuspicious = false;
            var confidenceScore = 0;
            var description = "";

            // Check for private/local IP ranges
            if (_knownMaliciousPatterns.Any(pattern => ipAddress.StartsWith(pattern)))
            {
                isSuspicious = true;
                threatTypes.Add("Private IP");
                confidenceScore = 30;
                description = "Private or local IP address detected";
            }

            // Check for suspicious patterns (this is a simplified example)
            if (ipAddress.Contains("..") || ipAddress.Length > 15)
            {
                isSuspicious = true;
                threatTypes.Add("Malformed IP");
                confidenceScore = 60;
                description = "Malformed IP address detected";
            }

            // Add more sophisticated pattern analysis here
            // In a real implementation, you would integrate with external threat feeds

            return (isSuspicious, threatTypes, confidenceScore, description);
        }

        private string GetRecommendedAction(string severity, string threatType)
        {
            return severity switch
            {
                "Critical" => "Block immediately",
                "High" => "Block and investigate",
                "Medium" => "Monitor closely",
                "Low" => "Log and monitor",
                _ => "Monitor"
            };
        }

        private async Task GenerateSampleThreatDataAsync()
        {
            var sampleThreats = new List<ThreatIntelligence>
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
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
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
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Country = "Unknown",
                    ReportCount = 15,
                    IsActive = true
                }
            };

            foreach (var threat in sampleThreats)
            {
                var existing = await _context.ThreatIntelligence
                    .FirstOrDefaultAsync(t => t.IPAddress == threat.IPAddress && t.ThreatType == threat.ThreatType);

                if (existing == null)
                {
                    _context.ThreatIntelligence.Add(threat);
                }
            }

            await _context.SaveChangesAsync();
        }
    }
} 