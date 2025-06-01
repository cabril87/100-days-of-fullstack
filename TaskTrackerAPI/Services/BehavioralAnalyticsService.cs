using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Security;
using TaskTrackerAPI.Models.Security;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;
using System.Text.Json;

namespace TaskTrackerAPI.Services
{
    public class BehavioralAnalyticsService : IBehavioralAnalyticsService
    {
        private readonly IBehavioralAnalyticsRepository _behavioralAnalyticsRepository;
        private readonly ILogger<BehavioralAnalyticsService> _logger;
        private readonly IMapper _mapper;

        // Anomaly detection thresholds
        private const double HIGH_ANOMALY_THRESHOLD = 0.8;
        private const double MEDIUM_ANOMALY_THRESHOLD = 0.6;
        private const double LOW_ANOMALY_THRESHOLD = 0.4;
        private const int MAX_ACTIONS_PER_MINUTE = 30;
        private const int BASELINE_DAYS = 30;

        public BehavioralAnalyticsService(
            IBehavioralAnalyticsRepository behavioralAnalyticsRepository,
            ILogger<BehavioralAnalyticsService> logger,
            IMapper mapper)
        {
            _behavioralAnalyticsRepository = behavioralAnalyticsRepository ?? throw new ArgumentNullException(nameof(behavioralAnalyticsRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public async Task<BehavioralAnalyticsSummaryDTO> GetBehavioralAnalyticsSummaryAsync()
        {
            try
            {
                IEnumerable<BehavioralAnalytics> behaviors = await _behavioralAnalyticsRepository.GetRecentBehavioralAnalyticsAsync(7, 10000);
                List<BehavioralAnalytics> behaviorsList = behaviors.ToList();

                BehavioralAnalyticsSummaryDTO summary = new BehavioralAnalyticsSummaryDTO
                {
                    TotalBehaviorRecords = behaviorsList.Count,
                    AnomalousActivities = behaviorsList.Count(b => b.IsAnomalous),
                    CriticalAnomalies = behaviorsList.Count(b => b.RiskLevel == "Critical"),
                    HighRiskActivities = behaviorsList.Count(b => b.RiskLevel == "High"),
                    MediumRiskActivities = behaviorsList.Count(b => b.RiskLevel == "Medium"),
                    LowRiskActivities = behaviorsList.Count(b => b.RiskLevel == "Low"),
                    NewLocationAccess = behaviorsList.Count(b => b.IsNewLocation),
                    NewDeviceAccess = behaviorsList.Count(b => b.IsNewDevice),
                    OffHoursActivities = behaviorsList.Count(b => b.IsOffHours),
                    HighVelocityActivities = behaviorsList.Count(b => b.IsHighVelocity),
                    AverageAnomalyScore = behaviorsList.Any() ? behaviorsList.Average(b => b.AnomalyScore) : 0,
                    LastAnalyzed = DateTime.UtcNow
                };

                // Top anomalous users
                summary.TopAnomalousUsers = behaviorsList
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
                    behaviorsList.Where(b => b.IsAnomalous)
                             .OrderByDescending(b => b.Timestamp)
                             .Take(10));

                // Top anomaly reasons
                summary.TopAnomalyReasons = behaviorsList
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
                IEnumerable<BehavioralAnalytics> anomalies = await _behavioralAnalyticsRepository.GetAnomalousActivitiesAsync(count);
                return _mapper.Map<List<BehavioralAnalyticsDTO>>(anomalies.ToList());
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
                IEnumerable<BehavioralAnalytics> behaviors = await _behavioralAnalyticsRepository.GetUserBehavioralAnalyticsAsync(userId, from, to, 100);
                return _mapper.Map<List<BehavioralAnalyticsDTO>>(behaviors.ToList());
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
                (int TotalActivities, int AnomalousActivities, double AverageAnomalyScore, DateTime LastActivity) statistics = 
                    await _behavioralAnalyticsRepository.GetUserBehaviorStatisticsAsync(userId, 30);

                if (statistics.TotalActivities == 0)
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

                return new UserBehaviorSummaryDTO
                {
                    UserId = userId,
                    Username = "User", // We'd need to get this separately
                    TotalActivities = statistics.TotalActivities,
                    AnomalousActivities = statistics.AnomalousActivities,
                    AnomalyPercentage = statistics.TotalActivities > 0 ? 
                        (double)statistics.AnomalousActivities / statistics.TotalActivities * 100 : 0,
                    AverageAnomalyScore = statistics.AverageAnomalyScore,
                    HighestRiskLevel = "Medium", // Would need additional logic to determine
                    LastActivity = statistics.LastActivity,
                    CommonAnomalyReasons = new List<string>() // Would need additional repository method
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user behavior summary for user {UserId}", userId);
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
        }

        public async Task<UserBaselineDTO> GetUserBaselineAsync(int userId)
        {
            try
            {
                IEnumerable<BehavioralAnalytics> behaviors = await _behavioralAnalyticsRepository.GetUserBehavioralAnalyticsAsync(
                    userId, DateTime.UtcNow.AddDays(-BASELINE_DAYS), null, 1000);

                List<BehavioralAnalytics> behaviorsList = behaviors.Where(b => !b.IsAnomalous).ToList();

                if (!behaviorsList.Any())
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
                    Username = behaviorsList.First().Username,
                    TypicalLocations = behaviorsList.Where(b => !string.IsNullOrEmpty(b.Country))
                                               .GroupBy(b => $"{b.Country}, {b.City}")
                                               .OrderByDescending(g => g.Count())
                                               .Take(5)
                                               .Select(g => g.Key)
                                               .ToList(),
                    TypicalDevices = behaviorsList.Where(b => !string.IsNullOrEmpty(b.DeviceType))
                                             .GroupBy(b => $"{b.DeviceType} - {b.Browser}")
                                             .OrderByDescending(g => g.Count())
                                             .Take(3)
                                             .Select(g => g.Key)
                                             .ToList(),
                    TypicalSessionDuration = TimeSpan.FromMinutes(behaviorsList.Average(b => b.SessionDuration.TotalMinutes)),
                    TypicalActionsPerMinute = (int)behaviorsList.Average(b => b.ActionsPerMinute),
                    TypicalActionTypes = behaviorsList.GroupBy(b => b.ActionType)
                                                 .OrderByDescending(g => g.Count())
                                                 .Take(5)
                                                 .Select(g => g.Key)
                                                 .ToList(),
                    TypicalActiveHours = CalculateTypicalActiveHours(behaviorsList),
                    BaselineCreated = DateTime.UtcNow.AddDays(-BASELINE_DAYS),
                    LastUpdated = DateTime.UtcNow
                };

                return baseline;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user baseline for user {UserId}", userId);
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
                IEnumerable<(string ActionType, string Pattern, int Count, double RiskScore)> patterns = 
                    await _behavioralAnalyticsRepository.GetCommonBehaviorPatternsAsync(7, 20);

                List<BehaviorPatternDTO> result = new List<BehaviorPatternDTO>();

                foreach ((string ActionType, string Pattern, int Count, double RiskScore) pattern in patterns)
                {
                    result.Add(new BehaviorPatternDTO
                    {
                        PatternType = pattern.ActionType,
                        Description = $"Common pattern for {pattern.ActionType}: {pattern.Pattern}",
                        Frequency = pattern.Count,
                        RiskScore = pattern.RiskScore,
                        AffectedUsers = new List<string>() // Would need additional repository method to populate
                    });
                }

                return result;
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
                IEnumerable<BehavioralAnalytics> activities = await _behavioralAnalyticsRepository.GetHighRiskActivitiesAsync();
                return _mapper.Map<List<BehavioralAnalyticsDTO>>(activities.ToList());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting high-risk activities");
                return new List<BehavioralAnalyticsDTO>();
            }
        }

        public async Task<List<BehavioralAnalyticsDTO>> GetOffHoursActivitiesAsync()
        {
            try
            {
                IEnumerable<BehavioralAnalytics> activities = await _behavioralAnalyticsRepository.GetOffHoursActivitiesAsync();
                return _mapper.Map<List<BehavioralAnalyticsDTO>>(activities.ToList());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting off-hours activities");
                return new List<BehavioralAnalyticsDTO>();
            }
        }

        public async Task<List<BehavioralAnalyticsDTO>> GetNewLocationAccessAsync()
        {
            try
            {
                IEnumerable<BehavioralAnalytics> activities = await _behavioralAnalyticsRepository.GetNewLocationAccessAsync();
                return _mapper.Map<List<BehavioralAnalyticsDTO>>(activities.ToList());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting new location access activities");
                return new List<BehavioralAnalyticsDTO>();
            }
        }

        public async Task<List<BehavioralAnalyticsDTO>> GetNewDeviceAccessAsync()
        {
            try
            {
                IEnumerable<BehavioralAnalytics> activities = await _behavioralAnalyticsRepository.GetNewDeviceAccessAsync();
                return _mapper.Map<List<BehavioralAnalyticsDTO>>(activities.ToList());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting new device access activities");
                return new List<BehavioralAnalyticsDTO>();
            }
        }

        public async Task<bool> LogUserActivityAsync(int userId, string username, string ipAddress, 
            string userAgent, string actionType, string resourceAccessed, int dataVolumeAccessed = 0)
        {
            try
            {
                DateTime timestamp = DateTime.UtcNow;
                TimeSpan sessionDuration = await CalculateSessionDuration(userId, timestamp);
                int actionsPerMinute = await CalculateActionsPerMinute(userId, timestamp);
                (string Country, string City) geolocation = await GetLocationAsync(ipAddress);
                (string DeviceType, string Browser, string OperatingSystem) deviceInfo = ParseUserAgent(userAgent);

                // Analyze behavior for anomalies
                double anomalyScore = await CalculateAnomalyScoreAsync(userId, ipAddress, actionType, timestamp);
                List<string> anomalyReasons = await GetAnomalyReasonsAsync(userId, ipAddress, actionType, timestamp);
                bool isAnomalous = anomalyScore >= LOW_ANOMALY_THRESHOLD;
                string riskLevel = GetRiskLevel(anomalyScore);

                // Check for new location/device
                bool isNewLocation = await IsNewLocationAsync(userId, geolocation.Country, geolocation.City);
                bool isNewDevice = await IsNewDeviceAsync(userId, deviceInfo.DeviceType, deviceInfo.Browser);
                
                // Check for off-hours access
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

                await _behavioralAnalyticsRepository.CreateBehavioralAnalyticsAsync(behaviorRecord);

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
                
                // Get user's historical behavior using available repository method
                IEnumerable<BehavioralAnalytics> historicalBehaviorEnum = await _behavioralAnalyticsRepository.GetUserBehavioralAnalyticsAsync(
                    userId, timestamp.AddDays(-BASELINE_DAYS), timestamp, 1000);
                
                List<BehavioralAnalytics> historicalBehavior = historicalBehaviorEnum.ToList();

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

                // Check velocity - use historical data for approximation
                int recentActions = historicalBehavior.Count(b => b.Timestamp >= timestamp.AddMinutes(-1));

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
                // Get user's historical behavior using available repository method
                IEnumerable<BehavioralAnalytics> historicalBehaviorEnum = await _behavioralAnalyticsRepository.GetUserBehavioralAnalyticsAsync(
                    userId, timestamp.AddDays(-BASELINE_DAYS), timestamp, 1000);
                
                List<BehavioralAnalytics> historicalBehavior = historicalBehaviorEnum.ToList();

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

                // Check for high velocity using historical data
                int recentActions = historicalBehavior.Count(b => b.Timestamp >= timestamp.AddMinutes(-1));

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
                return await _behavioralAnalyticsRepository.CleanupOldBehaviorDataAsync(daysOld);
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
                // Get recent user activities to find last activity
                IEnumerable<BehavioralAnalytics> recentActivities = await _behavioralAnalyticsRepository.GetUserBehavioralAnalyticsAsync(
                    userId, timestamp.AddDays(-1), timestamp, 10);
                
                List<BehavioralAnalytics> activitiesList = recentActivities.OrderByDescending(a => a.Timestamp).ToList();
                
                if (!activitiesList.Any())
                    return TimeSpan.Zero;

                BehavioralAnalytics lastActivity = activitiesList.First();
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
                // Get recent activities from the last minute
                IEnumerable<BehavioralAnalytics> recentActivities = await _behavioralAnalyticsRepository.GetUserBehavioralAnalyticsAsync(
                    userId, timestamp.AddMinutes(-1), timestamp, 100);
                
                return recentActivities.Count();
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
                // Get user's historical locations
                IEnumerable<(string Country, string City, int Count)> historicalLocations = 
                    await _behavioralAnalyticsRepository.GetUserHistoricalLocationsAsync(userId, 90);
                
                return !historicalLocations.Any(loc => loc.Country == country && loc.City == city);
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
                // Get user's historical devices
                IEnumerable<(string DeviceType, string Browser, int Count)> historicalDevices = 
                    await _behavioralAnalyticsRepository.GetUserHistoricalDevicesAsync(userId, 90);
                
                return !historicalDevices.Any(dev => dev.DeviceType == deviceType && dev.Browser == browser);
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