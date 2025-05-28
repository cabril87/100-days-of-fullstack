using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Security;

namespace TaskTrackerAPI.Services.Interfaces
{
    public interface IBehavioralAnalyticsService
    {
        Task<BehavioralAnalyticsSummaryDTO> GetBehavioralAnalyticsSummaryAsync();
        Task<AnomalyDetectionResultDTO> AnalyzeUserBehaviorAsync(int userId, string ipAddress, string userAgent, string actionType, string resourceAccessed);
        Task<List<BehavioralAnalyticsDTO>> GetAnomalousActivitiesAsync(int count = 20);
        Task<List<BehavioralAnalyticsDTO>> GetUserBehaviorHistoryAsync(int userId, DateTime? from = null, DateTime? to = null);
        Task<UserBehaviorSummaryDTO> GetUserBehaviorSummaryAsync(int userId);
        Task<UserBaselineDTO> GetUserBaselineAsync(int userId);
        Task<bool> UpdateUserBaselineAsync(int userId);
        Task<List<BehaviorPatternDTO>> GetCommonPatternsAsync();
        Task<List<BehavioralAnalyticsDTO>> GetHighRiskActivitiesAsync();
        Task<List<BehavioralAnalyticsDTO>> GetOffHoursActivitiesAsync();
        Task<List<BehavioralAnalyticsDTO>> GetNewLocationAccessAsync();
        Task<List<BehavioralAnalyticsDTO>> GetNewDeviceAccessAsync();
        Task<bool> LogUserActivityAsync(int userId, string username, string ipAddress, string userAgent, string actionType, string resourceAccessed, int dataVolumeAccessed = 0);
        Task<double> CalculateAnomalyScoreAsync(int userId, string ipAddress, string actionType, DateTime timestamp);
        Task<bool> IsActivityAnomalousAsync(int userId, string ipAddress, string actionType, DateTime timestamp);
        Task<List<string>> GetAnomalyReasonsAsync(int userId, string ipAddress, string actionType, DateTime timestamp);
        Task<int> CleanupOldBehaviorDataAsync(int daysOld = 30);
    }
} 