using System;
using System.Collections.Generic;
using System.Linq;
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
    public class BehavioralAnalyticsService : IBehavioralAnalyticsService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<BehavioralAnalyticsService> _logger;
        private readonly IMapper _mapper;

        // Anomaly detection thresholds
        private const double HIGH_ANOMALY_THRESHOLD = 0.8;
        private const double MEDIUM_ANOMALY_THRESHOLD = 0.6;
        private const double LOW_ANOMALY_THRESHOLD = 0.4;
        private const int MAX_ACTIONS_PER_MINUTE = 30;
        private const int BASELINE_DAYS = 30;

        public BehavioralAnalyticsService(
            ApplicationDbContext context,
            ILogger<BehavioralAnalyticsService> logger,
            IMapper mapper)
        {
            _context = context;
            _logger = logger;
            _mapper = mapper;
        }

        public async Task<BehavioralAnalyticsSummaryDTO> GetBehavioralAnalyticsSummaryAsync()
        {
            try
            {
                List<BehavioralAnalytics> behaviors = await _context.BehavioralAnalytics
                    .Where(b => b.Timestamp >= DateTime.UtcNow.AddDays(-7))
                    .ToListAsync();

                BehavioralAnalyticsSummaryDTO summary = new BehavioralAnalyticsSummaryDTO
                {
                    TotalBehaviorRecords = behaviors.Count,
                    AnomalousActivities = behaviors.Count(b => b.IsAnomalous),
                    CriticalAnomalies = behaviors.Count(b => b.RiskLevel == "Critical"),
                    HighRiskActivities = behaviors.Count(b => b.RiskLevel == "High"),
                    MediumRiskActivities = behaviors.Count(b => b.RiskLevel == "Medium"),
                    LowRiskActivities = behaviors.Count(b => b.RiskLevel == "Low"),
                    NewLocationAccess = behaviors.Count(b => b.IsNewLocation),
                    NewDeviceAccess = behaviors.Count(b => b.IsNewDevice),
                    OffHoursActivities = behaviors.Count(b => b.IsOffHours),
                    HighVelocityActivities = behaviors.Count(b => b.IsHighVelocity),
                    AverageAnomalyScore = behaviors.Any() ? behaviors.Average(b => b.AnomalyScore) : 0,
                    LastAnalyzed = DateTime.UtcNow
                };

                // Top anomalous users
                summary.TopAnomalousUsers = behaviors
                    .Where(b => b.IsAnomalous)
                    .GroupBy(b => new { b.UserId, b.Username })
                    .Select(g => new UserBehaviorSummaryDTO
                    {
                        UserId = g.Key.UserId,
                        Username = g.Key.Username,
                        TotalActivities = g.Count(),
                        AnomalousActivities = g.Count(b => b.IsAnomalous),
                        AnomalyPercentage = (double)g.Count(b => b.IsAnomalous) / g.Count() * 100,
                        AverageAnomalyScore = g.Average(b => b.AnomalyScore),
                        HighestRiskLevel = g.OrderByDescending(b => GetRiskLevelScore(b.RiskLevel)).First().RiskLevel,
                        LastActivity = g.Max(b => b.Timestamp),
                        CommonAnomalyReasons = g.Where(b => !string.IsNullOrEmpty(b.AnomalyReason))
                                               .Select(b => b.AnomalyReason)
                                               .Distinct()
                                               .ToList()
                    })
                    .OrderByDescending(u => u.AnomalyPercentage)
                    .Take(10)
                    .ToList();

                // Common patterns
                summary.CommonPatterns = await GetCommonPatternsAsync();

                // Recent anomalies
                summary.RecentAnomalies = _mapper.Map<List<BehavioralAnalyticsDTO>>(
                    behaviors.Where(b => b.IsAnomalous)
                             .OrderByDescending(b => b.Timestamp)
                             .Take(10));

                // Top anomaly reasons
                summary.TopAnomalyReasons = behaviors
                    .Where(b => b.IsAnomalous && !string.IsNullOrEmpty(b.AnomalyReason))
                    .GroupBy(b => b.AnomalyReason)
                    .OrderByDescending(g => g.Count())
                    .Take(5)
                    .Select(g => g.Key)
                    .ToList();

                return summary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting behavioral analytics summary");
                return new BehavioralAnalyticsSummaryDTO { LastAnalyzed = DateTime.UtcNow };
            }
        }

        public async Task<AnomalyDetectionResultDTO> AnalyzeUserBehaviorAsync(int userId, string ipAddress, 
            string userAgent, string actionType, string resourceAccessed)
        {
            try
            {
                DateTime timestamp = DateTime.UtcNow;
                double anomalyScore = await CalculateAnomalyScoreAsync(userId, ipAddress, actionType, timestamp);
                List<string> anomalyReasons = await GetAnomalyReasonsAsync(userId, ipAddress, actionType, timestamp);
                bool isAnomalous = anomalyScore >= LOW_ANOMALY_THRESHOLD;
                string riskLevel = GetRiskLevel(anomalyScore);

                AnomalyDetectionResultDTO result = new AnomalyDetectionResultDTO
                {
                    IsAnomalous = isAnomalous,
                    AnomalyScore = anomalyScore,
                    RiskLevel = riskLevel,
                    AnomalyReasons = anomalyReasons,
                    RecommendedAction = GetRecommendedAction(riskLevel, anomalyReasons),
                    AnalyzedAt = timestamp
                };

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing user behavior for user {UserId}", userId);
                return new AnomalyDetectionResultDTO
                {
                    IsAnomalous = false,
                    AnomalyScore = 0,
                    RiskLevel = "Low",
                    AnomalyReasons = new List<string>(),
                    RecommendedAction = "Monitor",
                    AnalyzedAt = DateTime.UtcNow
                };
            }
        }

        public async Task<List<BehavioralAnalyticsDTO>> GetAnomalousActivitiesAsync(int count = 20)
        {
            try
            {
                List<BehavioralAnalytics> anomalies = await _context.BehavioralAnalytics
                    .Where(b => b.IsAnomalous)
                    .OrderByDescending(b => b.AnomalyScore)
                    .ThenByDescending(b => b.Timestamp)
                    .Take(count)
                    .ToListAsync();

                return _mapper.Map<List<BehavioralAnalyticsDTO>>(anomalies);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting anomalous activities");
                return new List<BehavioralAnalyticsDTO>();
            }
        }

        public async Task<List<BehavioralAnalyticsDTO>> GetUserBehaviorHistoryAsync(int userId, DateTime? from = null, DateTime? to = null)
        {
            try
            {
                IQueryable<BehavioralAnalytics> query = _context.BehavioralAnalytics.Where(b => b.UserId == userId);

                if (from.HasValue)
                    query = query.Where(b => b.Timestamp >= from.Value);

                if (to.HasValue)
                    query = query.Where(b => b.Timestamp <= to.Value);

                List<BehavioralAnalytics> behaviors = await query
                    .OrderByDescending(b => b.Timestamp)
                    .Take(100)
                    .ToListAsync();

                return _mapper.Map<List<BehavioralAnalyticsDTO>>(behaviors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user behavior history for user {UserId}", userId);
                return new List<BehavioralAnalyticsDTO>();
            }
        }

        public async Task<UserBehaviorSummaryDTO> GetUserBehaviorSummaryAsync(int userId)
        {
            try
            {
                List<BehavioralAnalytics> behaviors = await _context.BehavioralAnalytics
                    .Where(b => b.UserId == userId && b.Timestamp >= DateTime.UtcNow.AddDays(-30))
                    .ToListAsync();

                if (!behaviors.Any())
                {
                    return new UserBehaviorSummaryDTO
                    {
                        UserId = userId,
                        Username = "Unknown",
                        TotalActivities = 0,
                        AnomalousActivities = 0,
                        AnomalyPercentage = 0,
                        AverageAnomalyScore = 0,
                        HighestRiskLevel = "Low",
                        LastActivity = DateTime.MinValue,
                        CommonAnomalyReasons = new List<string>()
                    };
                }

                UserBehaviorSummaryDTO summary = new UserBehaviorSummaryDTO
                {
                    UserId = userId,
                    Username = behaviors.First().Username,
                    TotalActivities = behaviors.Count,
                    AnomalousActivities = behaviors.Count(b => b.IsAnomalous),
                    AnomalyPercentage = (double)behaviors.Count(b => b.IsAnomalous) / behaviors.Count * 100,
                    AverageAnomalyScore = behaviors.Average(b => b.AnomalyScore),
                    HighestRiskLevel = behaviors.OrderByDescending(b => GetRiskLevelScore(b.RiskLevel)).First().RiskLevel,
                    LastActivity = behaviors.Max(b => b.Timestamp),
                    CommonAnomalyReasons = behaviors.Where(b => !string.IsNullOrEmpty(b.AnomalyReason))
                                                   .Select(b => b.AnomalyReason)
                                                   .GroupBy(r => r)
                                                   .OrderByDescending(g => g.Count())
                                                   .Take(5)
                                                   .Select(g => g.Key)
                                                   .ToList()
                };

                return summary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user behavior summary for user {UserId}", userId);
                return new UserBehaviorSummaryDTO { UserId = userId };
            }
        }

        public async Task<UserBaselineDTO> GetUserBaselineAsync(int userId)
        {
            try
            {
                List<BehavioralAnalytics> behaviors = await _context.BehavioralAnalytics
                    .Where(b => b.UserId == userId && 
                               b.Timestamp >= DateTime.UtcNow.AddDays(-BASELINE_DAYS) &&
                               !b.IsAnomalous)
                    .ToListAsync();

                if (!behaviors.Any())
                {
                    return new UserBaselineDTO
                    {
                        UserId = userId,
                        Username = "Unknown",
                        TypicalLocations = new List<string>(),
                        TypicalDevices = new List<string>(),
                        TypicalSessionDuration = TimeSpan.Zero,
                        TypicalActionsPerMinute = 0,
                        TypicalActionTypes = new List<string>(),
                        TypicalActiveHours = TimeSpan.Zero,
                        BaselineCreated = DateTime.UtcNow,
                        LastUpdated = DateTime.UtcNow
                    };
                }

                UserBaselineDTO baseline = new UserBaselineDTO
                {
                    UserId = userId,
                    Username = behaviors.First().Username,
                    TypicalLocations = behaviors.Where(b => !string.IsNullOrEmpty(b.Country))
                                               .GroupBy(b => $"{b.Country}, {b.City}")
                                               .OrderByDescending(g => g.Count())
                                               .Take(5)
                                               .Select(g => g.Key)
                                               .ToList(),
                    TypicalDevices = behaviors.Where(b => !string.IsNullOrEmpty(b.DeviceType))
                                             .GroupBy(b => $"{b.DeviceType} - {b.Browser}")
                                             .OrderByDescending(g => g.Count())
                                             .Take(3)
                                             .Select(g => g.Key)
                                             .ToList(),
                    TypicalSessionDuration = TimeSpan.FromMinutes(behaviors.Average(b => b.SessionDuration.TotalMinutes)),
                    TypicalActionsPerMinute = (int)behaviors.Average(b => b.ActionsPerMinute),
                    TypicalActionTypes = behaviors.GroupBy(b => b.ActionType)
                                                 .OrderByDescending(g => g.Count())
                                                 .Take(5)
                                                 .Select(g => g.Key)
                                                 .ToList(),
                    TypicalActiveHours = CalculateTypicalActiveHours(behaviors),
                    BaselineCreated = DateTime.UtcNow.AddDays(-BASELINE_DAYS),
                    LastUpdated = DateTime.UtcNow
                };

                return baseline;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user baseline for user {UserId}", userId);
                return new UserBaselineDTO { UserId = userId };
            }
        }

        public Task<bool> UpdateUserBaselineAsync(int userId)
        {
            try
            {
                // This would typically update a stored baseline in the database
                // For now, we'll just log that the baseline was updated
                _logger.LogInformation("Updating baseline for user {UserId}", userId);
                
                // In a real implementation, you would:
                // 1. Calculate new baseline from recent non-anomalous behavior
                // 2. Store it in a UserBaseline table
                // 3. Use it for future anomaly detection
                
                return Task.FromResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user baseline for user {UserId}", userId);
                return Task.FromResult(false);
            }
        }

        public async Task<List<BehaviorPatternDTO>> GetCommonPatternsAsync()
        {
            try
            {
                List<BehavioralAnalytics> behaviors = await _context.BehavioralAnalytics
                    .Where(b => b.Timestamp >= DateTime.UtcNow.AddDays(-7))
                    .ToListAsync();

                List<BehaviorPatternDTO> patterns = new List<BehaviorPatternDTO>();

                // Off-hours access pattern
                int offHoursCount = behaviors.Count(b => b.IsOffHours);
                if (offHoursCount > 0)
                {
                    patterns.Add(new BehaviorPatternDTO
                    {
                        PatternType = "Off-Hours Access",
                        Description = "Users accessing system outside normal business hours",
                        Frequency = offHoursCount,
                        RiskScore = CalculatePatternRiskScore(offHoursCount, behaviors.Count, 0.3),
                        AffectedUsers = behaviors.Where(b => b.IsOffHours)
                                                .Select(b => b.Username)
                                                .Distinct()
                                                .Take(5)
                                                .ToList()
                    });
                }

                // New location access pattern
                var newLocationCount = behaviors.Count(b => b.IsNewLocation);
                if (newLocationCount > 0)
                {
                    patterns.Add(new BehaviorPatternDTO
                    {
                        PatternType = "New Location Access",
                        Description = "Users accessing from new geographic locations",
                        Frequency = newLocationCount,
                        RiskScore = CalculatePatternRiskScore(newLocationCount, behaviors.Count, 0.4),
                        AffectedUsers = behaviors.Where(b => b.IsNewLocation)
                                                .Select(b => b.Username)
                                                .Distinct()
                                                .Take(5)
                                                .ToList()
                    });
                }

                // High velocity pattern
                var highVelocityCount = behaviors.Count(b => b.IsHighVelocity);
                if (highVelocityCount > 0)
                {
                    patterns.Add(new BehaviorPatternDTO
                    {
                        PatternType = "High Velocity Activity",
                        Description = "Users performing rapid successive actions",
                        Frequency = highVelocityCount,
                        RiskScore = CalculatePatternRiskScore(highVelocityCount, behaviors.Count, 0.5),
                        AffectedUsers = behaviors.Where(b => b.IsHighVelocity)
                                                .Select(b => b.Username)
                                                .Distinct()
                                                .Take(5)
                                                .ToList()
                    });
                }

                return patterns.OrderByDescending(p => p.RiskScore).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting common patterns");
                return new List<BehaviorPatternDTO>();
            }
        }

        public async Task<List<BehavioralAnalyticsDTO>> GetHighRiskActivitiesAsync()
        {
            try
            {
                List<BehavioralAnalytics> activities = await _context.BehavioralAnalytics
                    .Where(b => b.RiskLevel == "High" || b.RiskLevel == "Critical")
                    .OrderByDescending(b => b.Timestamp)
                    .Take(50)
                    .ToListAsync();

                return _mapper.Map<List<BehavioralAnalyticsDTO>>(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting high risk activities");
                return new List<BehavioralAnalyticsDTO>();
            }
        }

        public async Task<List<BehavioralAnalyticsDTO>> GetOffHoursActivitiesAsync()
        {
            try
            {
                List<BehavioralAnalytics> activities = await _context.BehavioralAnalytics
                    .Where(b => b.IsOffHours)
                    .OrderByDescending(b => b.Timestamp)
                    .Take(50)
                    .ToListAsync();

                return _mapper.Map<List<BehavioralAnalyticsDTO>>(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting off hours activities");
                return new List<BehavioralAnalyticsDTO>();
            }
        }

        public async Task<List<BehavioralAnalyticsDTO>> GetNewLocationAccessAsync()
        {
            try
            {
                List<BehavioralAnalytics> activities = await _context.BehavioralAnalytics
                    .Where(b => b.IsNewLocation)
                    .OrderByDescending(b => b.Timestamp)
                    .Take(50)
                    .ToListAsync();

                return _mapper.Map<List<BehavioralAnalyticsDTO>>(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting new location access");
                return new List<BehavioralAnalyticsDTO>();
            }
        }

        public async Task<List<BehavioralAnalyticsDTO>> GetNewDeviceAccessAsync()
        {
            try
            {
                List<BehavioralAnalytics> activities = await _context.BehavioralAnalytics
                    .Where(b => b.IsNewDevice)
                    .OrderByDescending(b => b.Timestamp)
                    .Take(50)
                    .ToListAsync();

                return _mapper.Map<List<BehavioralAnalyticsDTO>>(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting new device access");
                return new List<BehavioralAnalyticsDTO>();
            }
        }

        public async Task<bool> LogUserActivityAsync(int userId, string username, string ipAddress, 
            string userAgent, string actionType, string resourceAccessed, int dataVolumeAccessed = 0)
        {
            try
            {
                DateTime timestamp = DateTime.UtcNow;
                
                // Get geolocation data
                (string Country, string City) geolocation = await GetLocationAsync(ipAddress);
                
                // Parse user agent for device info
                (string DeviceType, string Browser, string OperatingSystem) deviceInfo = ParseUserAgent(userAgent);
                
                // Calculate session duration (simplified)
                TimeSpan sessionDuration = await CalculateSessionDuration(userId, timestamp);
                
                // Calculate actions per minute
                int actionsPerMinute = await CalculateActionsPerMinute(userId, timestamp);
                
                // Detect anomalies
                double anomalyScore = await CalculateAnomalyScoreAsync(userId, ipAddress, actionType, timestamp);
                bool isAnomalous = anomalyScore >= LOW_ANOMALY_THRESHOLD;
                string riskLevel = GetRiskLevel(anomalyScore);
                List<string> anomalyReasons = await GetAnomalyReasonsAsync(userId, ipAddress, actionType, timestamp);
                
                // Check for new location/device
                bool isNewLocation = await IsNewLocationAsync(userId, geolocation.Country, geolocation.City);
                bool isNewDevice = await IsNewDeviceAsync(userId, deviceInfo.DeviceType, deviceInfo.Browser);
                
                // Check if off hours
                bool isOffHours = IsOffHours(timestamp);
                
                // Check for high velocity
                bool isHighVelocity = actionsPerMinute > MAX_ACTIONS_PER_MINUTE;
                
                // Calculate deviation from baseline
                double deviationFromBaseline = await CalculateDeviationFromBaseline(userId, actionType, timestamp);
                bool isOutsideNormalPattern = deviationFromBaseline > 0.7;

                BehavioralAnalytics behaviorRecord = new BehavioralAnalytics
                {
                    UserId = userId,
                    Username = username,
                    IPAddress = ipAddress,
                    UserAgent = userAgent,
                    ActionType = actionType,
                    ResourceAccessed = resourceAccessed,
                    Timestamp = timestamp,
                    SessionDuration = sessionDuration,
                    ActionsPerMinute = actionsPerMinute,
                    DataVolumeAccessed = dataVolumeAccessed,
                    Country = geolocation.Country,
                    City = geolocation.City,
                    DeviceType = deviceInfo.DeviceType,
                    Browser = deviceInfo.Browser,
                    OperatingSystem = deviceInfo.OperatingSystem,
                    IsAnomalous = isAnomalous,
                    AnomalyScore = anomalyScore,
                    RiskLevel = riskLevel,
                    AnomalyReason = string.Join(", ", anomalyReasons),
                    IsNewLocation = isNewLocation,
                    IsNewDevice = isNewDevice,
                    IsOffHours = isOffHours,
                    IsHighVelocity = isHighVelocity,
                    DeviationFromBaseline = deviationFromBaseline,
                    IsOutsideNormalPattern = isOutsideNormalPattern,
                    CreatedAt = timestamp
                };

                _context.BehavioralAnalytics.Add(behaviorRecord);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging user activity for user {UserId}", userId);
                return false;
            }
        }

        public async Task<double> CalculateAnomalyScoreAsync(int userId, string ipAddress, string actionType, DateTime timestamp)
        {
            try
            {
                double score = 0.0;
                
                // Get user's historical behavior
                List<BehavioralAnalytics> historicalBehavior = await _context.BehavioralAnalytics
                    .Where(b => b.UserId == userId && 
                               b.Timestamp >= timestamp.AddDays(-BASELINE_DAYS) &&
                               b.Timestamp < timestamp)
                    .ToListAsync();

                if (!historicalBehavior.Any())
                {
                    // New user - moderate anomaly score
                    return 0.5;
                }

                // Check time-based anomalies
                List<int> typicalHours = historicalBehavior.Select(b => b.Timestamp.Hour).ToList();
                int currentHour = timestamp.Hour;
                if (!typicalHours.Contains(currentHour))
                {
                    score += 0.3; // New time of access
                }

                // Check action type frequency
                int actionTypeFrequency = historicalBehavior.Count(b => b.ActionType == actionType);
                int totalActions = historicalBehavior.Count;
                double actionTypeRatio = (double)actionTypeFrequency / totalActions;
                
                if (actionTypeRatio < 0.1) // Rare action type
                {
                    score += 0.2;
                }

                // Check IP address
                int ipFrequency = historicalBehavior.Count(b => b.IPAddress == ipAddress);
                double ipRatio = (double)ipFrequency / totalActions;
                
                if (ipRatio < 0.1) // New or rare IP
                {
                    score += 0.3;
                }

                // Check velocity
                int recentActions = await _context.BehavioralAnalytics
                    .Where(b => b.UserId == userId && 
                               b.Timestamp >= timestamp.AddMinutes(-1) &&
                               b.Timestamp < timestamp)
                    .CountAsync();

                if (recentActions > 10) // High velocity
                {
                    score += 0.4;
                }

                return Math.Min(score, 1.0); // Cap at 1.0
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating anomaly score for user {UserId}", userId);
                return 0.0;
            }
        }

        public async Task<bool> IsActivityAnomalousAsync(int userId, string ipAddress, string actionType, DateTime timestamp)
        {
            double score = await CalculateAnomalyScoreAsync(userId, ipAddress, actionType, timestamp);
            return score >= LOW_ANOMALY_THRESHOLD;
        }

        public async Task<List<string>> GetAnomalyReasonsAsync(int userId, string ipAddress, string actionType, DateTime timestamp)
        {
            List<string> reasons = new List<string>();

            try
            {
                // Get user's historical behavior
                List<BehavioralAnalytics> historicalBehavior = await _context.BehavioralAnalytics
                    .Where(b => b.UserId == userId && 
                               b.Timestamp >= timestamp.AddDays(-BASELINE_DAYS) &&
                               b.Timestamp < timestamp)
                    .ToListAsync();

                if (!historicalBehavior.Any())
                {
                    reasons.Add("New user - no historical behavior");
                    return reasons;
                }

                // Check various anomaly conditions
                List<int> typicalHours = historicalBehavior.Select(b => b.Timestamp.Hour).Distinct().ToList();
                if (!typicalHours.Contains(timestamp.Hour))
                {
                    reasons.Add("Access outside typical hours");
                }

                List<string> knownIPs = historicalBehavior.Select(b => b.IPAddress).Distinct().ToList();
                if (!knownIPs.Contains(ipAddress))
                {
                    reasons.Add("Access from new IP address");
                }

                List<string> commonActions = historicalBehavior.GroupBy(b => b.ActionType)
                                                    .Where(g => g.Count() > historicalBehavior.Count * 0.1)
                                                    .Select(g => g.Key)
                                                    .ToList();
                if (!commonActions.Contains(actionType))
                {
                    reasons.Add("Unusual action type");
                }

                // Check for high velocity
                int recentActions = await _context.BehavioralAnalytics
                    .Where(b => b.UserId == userId && 
                               b.Timestamp >= timestamp.AddMinutes(-1) &&
                               b.Timestamp < timestamp)
                    .CountAsync();

                if (recentActions > 10)
                {
                    reasons.Add("High velocity activity");
                }

                // Check for off-hours access
                if (IsOffHours(timestamp))
                {
                    reasons.Add("Off-hours access");
                }

                return reasons;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting anomaly reasons for user {UserId}", userId);
                return new List<string> { "Error analyzing behavior" };
            }
        }

        public async Task<int> CleanupOldBehaviorDataAsync(int daysOld = 30)
        {
            try
            {
                DateTime cutoffDate = DateTime.UtcNow.AddDays(-daysOld);
                List<BehavioralAnalytics> oldRecords = await _context.BehavioralAnalytics
                    .Where(b => b.Timestamp < cutoffDate)
                    .ToListAsync();

                _context.BehavioralAnalytics.RemoveRange(oldRecords);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Cleaned up {Count} old behavioral analytics records", oldRecords.Count);
                return oldRecords.Count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up old behavior data");
                return 0;
            }
        }

        // Helper methods
        private int GetRiskLevelScore(string riskLevel)
        {
            return riskLevel switch
            {
                "Critical" => 4,
                "High" => 3,
                "Medium" => 2,
                "Low" => 1,
                _ => 0
            };
        }

        private string GetRiskLevel(double anomalyScore)
        {
            return anomalyScore switch
            {
                >= HIGH_ANOMALY_THRESHOLD => "Critical",
                >= MEDIUM_ANOMALY_THRESHOLD => "High",
                >= LOW_ANOMALY_THRESHOLD => "Medium",
                _ => "Low"
            };
        }

        private string GetRecommendedAction(string riskLevel, List<string> anomalyReasons)
        {
            return riskLevel switch
            {
                "Critical" => "Immediate investigation required",
                "High" => "Review and monitor closely",
                "Medium" => "Monitor and log",
                "Low" => "Continue monitoring",
                _ => "No action required"
            };
        }

        private double CalculatePatternRiskScore(int patternCount, int totalCount, double baseRisk)
        {
            double frequency = (double)patternCount / totalCount;
            return Math.Min(frequency * baseRisk * 10, 1.0);
        }

        private TimeSpan CalculateTypicalActiveHours(List<BehavioralAnalytics> behaviors)
        {
            if (!behaviors.Any()) return TimeSpan.Zero;

            List<int> hours = behaviors.Select(b => b.Timestamp.Hour).ToList();
            int minHour = hours.Min();
            int maxHour = hours.Max();
            
            return TimeSpan.FromHours(maxHour - minHour);
        }

        private (string DeviceType, string Browser, string OperatingSystem) ParseUserAgent(string userAgent)
        {
            // Simplified user agent parsing
            string deviceType = "Desktop";
            string browser = "Unknown";
            string os = "Unknown";

            if (userAgent.Contains("Mobile") || userAgent.Contains("Android") || userAgent.Contains("iPhone"))
                deviceType = "Mobile";
            else if (userAgent.Contains("Tablet") || userAgent.Contains("iPad"))
                deviceType = "Tablet";

            if (userAgent.Contains("Chrome"))
                browser = "Chrome";
            else if (userAgent.Contains("Firefox"))
                browser = "Firefox";
            else if (userAgent.Contains("Safari"))
                browser = "Safari";
            else if (userAgent.Contains("Edge"))
                browser = "Edge";

            if (userAgent.Contains("Windows"))
                os = "Windows";
            else if (userAgent.Contains("Mac"))
                os = "macOS";
            else if (userAgent.Contains("Linux"))
                os = "Linux";
            else if (userAgent.Contains("Android"))
                os = "Android";
            else if (userAgent.Contains("iOS"))
                os = "iOS";

            return (deviceType, browser, os);
        }

        private async Task<TimeSpan> CalculateSessionDuration(int userId, DateTime timestamp)
        {
            try
            {
                BehavioralAnalytics? lastActivity = await _context.BehavioralAnalytics
                    .Where(b => b.UserId == userId && b.Timestamp < timestamp)
                    .OrderByDescending(b => b.Timestamp)
                    .FirstOrDefaultAsync();

                if (lastActivity == null)
                    return TimeSpan.Zero;

                TimeSpan duration = timestamp - lastActivity.Timestamp;
                return duration.TotalHours > 8 ? TimeSpan.Zero : duration; // Reset if too long
            }
            catch
            {
                return TimeSpan.Zero;
            }
        }

        private async Task<int> CalculateActionsPerMinute(int userId, DateTime timestamp)
        {
            try
            {
                DateTime oneMinuteAgo = timestamp.AddMinutes(-1);
                return await _context.BehavioralAnalytics
                    .Where(b => b.UserId == userId && b.Timestamp >= oneMinuteAgo && b.Timestamp < timestamp)
                    .CountAsync();
            }
            catch
            {
                return 0;
            }
        }

        private async Task<bool> IsNewLocationAsync(int userId, string country, string city)
        {
            try
            {
                return !await _context.BehavioralAnalytics
                    .AnyAsync(b => b.UserId == userId && b.Country == country && b.City == city);
            }
            catch
            {
                return false;
            }
        }

        private async Task<bool> IsNewDeviceAsync(int userId, string deviceType, string browser)
        {
            try
            {
                return !await _context.BehavioralAnalytics
                    .AnyAsync(b => b.UserId == userId && b.DeviceType == deviceType && b.Browser == browser);
            }
            catch
            {
                return false;
            }
        }

        private bool IsOffHours(DateTime timestamp)
        {
            int hour = timestamp.Hour;
            return hour < 8 || hour > 18 || timestamp.DayOfWeek == DayOfWeek.Saturday || timestamp.DayOfWeek == DayOfWeek.Sunday;
        }

        private async Task<double> CalculateDeviationFromBaseline(int userId, string actionType, DateTime timestamp)
        {
            try
            {
                UserBaselineDTO baseline = await GetUserBaselineAsync(userId);
                
                // Simple deviation calculation based on action type frequency
                if (baseline.TypicalActionTypes.Contains(actionType))
                    return 0.1; // Low deviation for typical actions
                else
                    return 0.8; // High deviation for unusual actions
            }
            catch
            {
                return 0.5; // Default moderate deviation
            }
        }

        private Task<(string Country, string City)> GetLocationAsync(string ipAddress)
        {
            try
            {
                // Simple geolocation implementation to avoid circular dependency
                // In a real implementation, you would call an external geolocation service
                
                // For private/local IPs, return "Local"
                if (ipAddress.StartsWith("192.168.") || ipAddress.StartsWith("10.") || 
                    ipAddress.StartsWith("172.16.") || ipAddress.StartsWith("127.") ||
                    ipAddress == "::1" || ipAddress == "localhost")
                {
                    return Task.FromResult(("Local", "Local"));
                }
                
                // For demonstration, return a default location
                // In production, integrate with ip-api.com, MaxMind, or similar service
                return Task.FromResult(("Unknown", "Unknown"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting location for IP {IPAddress}", ipAddress);
                return Task.FromResult(("Unknown", "Unknown"));
            }
        }
    }
} 