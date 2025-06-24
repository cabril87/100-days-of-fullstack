/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Dashboard;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services
{
    /// <summary>
    /// Unified dashboard service implementation
    /// Aggregates data from multiple services to provide comprehensive dashboard state
    /// Enterprise-grade dashboard data management with caching and performance optimization
    /// </summary>
    public class UnifiedDashboardService : IUnifiedDashboardService
    {
        private readonly IGamificationService _gamificationService;
        private readonly ITaskService _taskService;
        private readonly IFamilyService _familyService;
        private readonly INotificationService _notificationService;
        private readonly ITaskStatisticsService _taskStatisticsService;
        private readonly IFamilyActivityService _familyActivityService;
        private readonly IMapper _mapper;
        private readonly ILogger<UnifiedDashboardService> _logger;
        private readonly IMemoryCache _cache;

        // Cache configuration
        private readonly TimeSpan _dashboardCacheDuration = TimeSpan.FromMinutes(5);
        private readonly TimeSpan _statsCacheDuration = TimeSpan.FromMinutes(2);
        private const string CACHE_KEY_PREFIX = "unified_dashboard";

        /// <summary>
        /// Initializes a new instance of the UnifiedDashboardService class
        /// </summary>
        /// <param name="gamificationService">Service for gamification data</param>
        /// <param name="taskService">Service for task data</param>
        /// <param name="familyService">Service for family data</param>
        /// <param name="notificationService">Service for notification data</param>
        /// <param name="taskStatisticsService">Service for task statistics</param>
        /// <param name="familyActivityService">Service for family activity data</param>
        /// <param name="mapper">AutoMapper instance for object mapping</param>
        /// <param name="logger">Logger instance for logging</param>
        /// <param name="cache">Memory cache for performance optimization</param>
        public UnifiedDashboardService(
            IGamificationService gamificationService,
            ITaskService taskService,
            IFamilyService familyService,
            INotificationService notificationService,
            ITaskStatisticsService taskStatisticsService,
            IFamilyActivityService familyActivityService,
            IMapper mapper,
            ILogger<UnifiedDashboardService> logger,
            IMemoryCache cache)
        {
            _gamificationService = gamificationService ?? throw new ArgumentNullException(nameof(gamificationService));
            _taskService = taskService ?? throw new ArgumentNullException(nameof(taskService));
            _familyService = familyService ?? throw new ArgumentNullException(nameof(familyService));
            _notificationService = notificationService ?? throw new ArgumentNullException(nameof(notificationService));
            _taskStatisticsService = taskStatisticsService ?? throw new ArgumentNullException(nameof(taskStatisticsService));
            _familyActivityService = familyActivityService ?? throw new ArgumentNullException(nameof(familyActivityService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
        }

        /// <summary>
        /// Gets comprehensive dashboard data for the specified user
        /// Aggregates data from multiple services with performance optimization
        /// </summary>
        /// <param name="userId">The unique identifier of the user</param>
        /// <returns>Unified dashboard response containing all necessary dashboard data</returns>
        public async Task<UnifiedDashboardResponseDTO> GetUnifiedDashboardDataAsync(int userId)
        {
            if (userId <= 0)
            {
                throw new ArgumentException("User ID must be a positive integer", nameof(userId));
            }

            string cacheKey = $"{CACHE_KEY_PREFIX}_full_{userId}";
            
            // Check cache first
            if (_cache.TryGetValue(cacheKey, out UnifiedDashboardResponseDTO? cachedResponse))
            {
                _logger.LogInformation("Dashboard data served from cache for user {UserId}", userId);
                if (cachedResponse != null)
                {
                    cachedResponse.Metadata.CacheStatus = "Hit";
                    return cachedResponse;
                }
            }

            Stopwatch stopwatch = Stopwatch.StartNew();

            try
            {
                _logger.LogInformation("Starting unified dashboard data aggregation for user {UserId}", userId);

                // Validate user access
                bool hasAccess = await ValidateUserAccessAsync(userId);
                if (!hasAccess)
                {
                    throw new UnauthorizedAccessException($"User {userId} does not have access to dashboard data");
                }

                // Parallel data aggregation for performance
                Task<DashboardStatsDTO> statsTask = GetDashboardStatsAsync(userId);
                Task<GamificationDataDTO> gamificationTask = GetGamificationDataAsync(userId);
                Task<RecentTasksDataDTO> recentTasksTask = GetRecentTasksDataAsync(userId);
                Task<FamilyDashboardDataDTO> familyTask = GetFamilyDashboardDataAsync(userId);
                Task<DashboardSystemStatusDTO> systemStatusTask = GetSystemStatusAsync(userId);

                // Wait for all tasks to complete
                await Task.WhenAll(statsTask, gamificationTask, recentTasksTask, familyTask, systemStatusTask);

                stopwatch.Stop();

                // Create unified response
                UnifiedDashboardResponseDTO response = new UnifiedDashboardResponseDTO
                {
                    Stats = statsTask.Result,
                    Gamification = gamificationTask.Result,
                    RecentTasks = recentTasksTask.Result,
                    Family = familyTask.Result,
                    SystemStatus = systemStatusTask.Result,
                    Metadata = new DashboardMetadataDTO
                    {
                        GeneratedAt = DateTime.UtcNow,
                        ApiVersion = "1.0",
                        ResponseTimeMs = (int)stopwatch.ElapsedMilliseconds,
                        CacheStatus = "Miss",
                        NextRefreshTime = DateTime.UtcNow.Add(_dashboardCacheDuration)
                    }
                };

                // Cache the response
                _cache.Set(cacheKey, response, _dashboardCacheDuration);

                _logger.LogInformation("Unified dashboard data aggregated successfully for user {UserId} in {ElapsedMs}ms", 
                    userId, stopwatch.ElapsedMilliseconds);

                return response;
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                _logger.LogError(ex, "Error aggregating dashboard data for user {UserId} after {ElapsedMs}ms", 
                    userId, stopwatch.ElapsedMilliseconds);
                throw;
            }
        }

        /// <summary>
        /// Gets dashboard statistics with caching and performance optimization
        /// </summary>
        /// <param name="userId">The unique identifier of the user</param>
        /// <returns>Dashboard statistics data</returns>
        public async Task<DashboardStatsDTO> GetDashboardStatsAsync(int userId)
        {
            string cacheKey = $"{CACHE_KEY_PREFIX}_stats_{userId}";

            if (_cache.TryGetValue(cacheKey, out DashboardStatsDTO? cachedStats))
            {
                if (cachedStats != null)
                {
                    return cachedStats;
                }
            }

            try
            {
                _logger.LogDebug("Fetching dashboard statistics for user {UserId}", userId);

                // Parallel data fetching for performance
                Task<TaskStatisticsDTO> taskStatsTask = _taskStatisticsService.GetTaskStatisticsAsync(userId);
                Task<IEnumerable<TaskItemDTO>> allTasksTask = _taskService.GetAllTasksAsync(userId);
                Task<IEnumerable<FamilyDTO>> familiesTask = _familyService.GetByUserIdAsync(userId);

                await Task.WhenAll(taskStatsTask, allTasksTask, familiesTask);

                TaskStatisticsDTO taskStats = taskStatsTask.Result;
                List<TaskItemDTO> allTasks = allTasksTask.Result.ToList();
                List<FamilyDTO> families = familiesTask.Result.ToList();

                // Calculate statistics
                DashboardStatsDTO stats = new DashboardStatsDTO
                {
                    TasksCompleted = allTasks.Count(t => t.Status == TaskItemStatusDTO.Completed),
                    PendingTasks = allTasks.Count(t => t.Status != TaskItemStatusDTO.Completed),
                    OverdueTasks = allTasks.Count(t => t.DueDate.HasValue && t.DueDate.Value < DateTime.UtcNow && t.Status != TaskItemStatusDTO.Completed),
                    TasksDueToday = allTasks.Count(t => t.DueDate.HasValue && t.DueDate.Value.Date == DateTime.UtcNow.Date),
                    TasksDueThisWeek = allTasks.Count(t => t.DueDate.HasValue && 
                        t.DueDate.Value >= DateTime.UtcNow.Date && 
                        t.DueDate.Value <= DateTime.UtcNow.Date.AddDays(7)),
                    TotalFamilies = families.Count,
                    FamilyMembers = families.SelectMany(f => f.Members ?? new List<FamilyMemberDTO>()).Count(),
                    FamilyTasks = allTasks.Count(t => t.FamilyId.HasValue),
                    ActiveGoals = 0, // TODO: Implement goals service
                    FocusTimeMinutes = 0, // TODO: Implement focus service integration
                    StreakDays = 0, // Will be populated from gamification data
                    FamilyPoints = 0 // Will be populated from gamification data
                };

                // Cache the stats
                _cache.Set(cacheKey, stats, _statsCacheDuration);

                _logger.LogDebug("Dashboard statistics calculated for user {UserId}", userId);

                return stats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating dashboard statistics for user {UserId}", userId);
                
                // Return default stats on error to prevent dashboard failure
                return new DashboardStatsDTO();
            }
        }

        /// <summary>
        /// Gets comprehensive gamification data for the user
        /// </summary>
        /// <param name="userId">The unique identifier of the user</param>
        /// <returns>Comprehensive gamification data</returns>
        public async Task<GamificationDataDTO> GetGamificationDataAsync(int userId)
        {
            try
            {
                _logger.LogDebug("Fetching gamification data for user {UserId}", userId);

                // Parallel gamification data fetching
                Task<UserProgressDTO> progressTask = _gamificationService.GetUserProgressAsync(userId);
                Task<List<UserAchievementDTO>> achievementsTask = _gamificationService.GetUserAchievementsAsync(userId);
                Task<List<UserBadgeDTO>> badgesTask = _gamificationService.GetUserBadgesAsync(userId);
                Task<List<PointTransactionDTO>> transactionsTask = _gamificationService.GetUserPointTransactionsAsync(userId, 10);

                await Task.WhenAll(progressTask, achievementsTask, badgesTask, transactionsTask);

                UserProgressDTO progress = progressTask.Result;
                List<UserAchievementDTO> achievements = achievementsTask.Result;
                List<UserBadgeDTO> badges = badgesTask.Result;
                List<PointTransactionDTO> transactions = transactionsTask.Result;

                // Calculate level progress
                int pointsInCurrentLevel = progress.TotalPoints % 100;
                decimal levelProgress = (decimal)pointsInCurrentLevel;

                GamificationDataDTO gamificationData = new GamificationDataDTO
                {
                    CurrentPoints = progress.TotalPoints,
                    CurrentLevel = progress.CurrentLevel,
                    CurrentStreak = progress.CurrentStreak,
                    TotalAchievements = achievements.Count,
                    TotalBadges = badges.Count,
                    RecentAchievements = achievements.OrderByDescending(a => a.CompletedAt ?? DateTime.MinValue).Take(5).ToList(),
                    RecentBadges = badges.OrderByDescending(b => b.AwardedAt).Take(5).ToList(),
                    RecentPointsEarned = transactions.OrderByDescending(t => t.CreatedAt).Take(10).ToList(),
                    PointsToNextLevel = 100 - pointsInCurrentLevel,
                    LevelProgress = levelProgress,
                    IsLoading = false,
                    LastUpdated = DateTime.UtcNow
                };

                _logger.LogDebug("Gamification data fetched for user {UserId}", userId);

                return gamificationData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching gamification data for user {UserId}", userId);
                
                // Return default gamification data on error
                return new GamificationDataDTO
                {
                    IsLoading = false,
                    LastUpdated = DateTime.UtcNow
                };
            }
        }

        /// <summary>
        /// Gets family dashboard data for the user
        /// </summary>
        /// <param name="userId">The unique identifier of the user</param>
        /// <returns>Family dashboard data</returns>
        public async Task<FamilyDashboardDataDTO> GetFamilyDashboardDataAsync(int userId)
        {
            try
            {
                _logger.LogDebug("Fetching family dashboard data for user {UserId}", userId);

                // Get user's families
                IEnumerable<FamilyDTO> families = await _familyService.GetByUserIdAsync(userId);
                List<FamilyDTO> familyList = families.ToList();

                if (!familyList.Any())
                {
                    return new FamilyDashboardDataDTO();
                }

                // Get primary family
                FamilyDTO? primaryFamily = await _familyService.GetPrimaryFamilyAsync(userId);
                if (primaryFamily == null && familyList.Any())
                {
                    primaryFamily = familyList.First();
                }

                // Get family members if primary family exists
                List<FamilyMemberDTO> familyMembers = new List<FamilyMemberDTO>();
                List<LeaderboardEntryDTO> familyLeaderboard = new List<LeaderboardEntryDTO>();
                
                if (primaryFamily != null)
                {
                    IEnumerable<FamilyMemberDTO> members = await _familyService.GetMembersAsync(primaryFamily.Id, userId);
                    familyMembers = members.ToList();

                    // Get family leaderboard
                    List<LeaderboardEntryDTO> leaderboard = await _gamificationService.GetSpecificFamilyLeaderboardAsync(userId, primaryFamily.Id, "points", 10);
                    familyLeaderboard = leaderboard;
                }

                // Calculate family stats
                FamilyStatsDTO familyStats = new FamilyStatsDTO
                {
                    TotalFamilyPoints = familyLeaderboard.Sum(l => l.Value),
                    TotalFamilyTasksCompleted = 0, // TODO: Implement family task statistics
                    ActiveChallenges = 0, // TODO: Implement family challenges
                    FamilyStreak = 0 // TODO: Implement family streak calculation
                };

                // Get recent family activity
                List<DashboardFamilyActivityDTO> recentActivity = new List<DashboardFamilyActivityDTO>();
                if (primaryFamily != null)
                {
                    try
                    {
                        FamilyActivityPagedResultDTO activityResult = await _familyActivityService.GetAllByFamilyIdAsync(primaryFamily.Id, userId, 1, 10);
                        
                        // Map from Family.FamilyActivityDTO to Dashboard.FamilyActivityDTO
                        recentActivity = activityResult.Activities.Select(activity => new DashboardFamilyActivityDTO
                        {
                            Id = activity.Id,
                            MemberName = activity.ActorName ?? "Unknown User",
                            ActivityType = activity.ActionType ?? "Unknown Activity",
                            Description = activity.Description ?? "",
                            Timestamp = activity.Timestamp,
                            Points = ExtractPointsFromMetadata(activity.Metadata)
                        }).ToList();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to load family activity for family {FamilyId}", primaryFamily.Id);
                    }
                }

                FamilyDashboardDataDTO familyData = new FamilyDashboardDataDTO
                {
                    CurrentFamily = primaryFamily,
                    AllFamilies = familyList,
                    FamilyMembers = familyMembers,
                    RecentActivity = recentActivity,
                    FamilyLeaderboard = familyLeaderboard,
                    PendingInvitations = 0, // TODO: Implement pending invitations count
                    FamilyStats = familyStats
                };

                _logger.LogDebug("Family dashboard data fetched for user {UserId}", userId);

                return familyData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching family dashboard data for user {UserId}", userId);
                
                // Return default family data on error
                return new FamilyDashboardDataDTO();
            }
        }

        /// <summary>
        /// Gets recent tasks data for the user
        /// </summary>
        /// <param name="userId">The unique identifier of the user</param>
        /// <returns>Recent tasks data</returns>
        public async Task<RecentTasksDataDTO> GetRecentTasksDataAsync(int userId)
        {
            try
            {
                _logger.LogDebug("Fetching recent tasks data for user {UserId}", userId);

                // Get all user tasks
                IEnumerable<TaskItemDTO> allTasks = await _taskService.GetAllTasksAsync(userId);
                List<TaskItemDTO> taskList = allTasks.ToList();

                // Parallel task filtering
                Task<List<TaskItemDTO>> recentTask = Task.FromResult(
                    taskList.OrderByDescending(t => t.CreatedAt).Take(10).ToList());
                
                Task<List<TaskItemDTO>> recentlyCompletedTask = Task.FromResult(
                    taskList.Where(t => t.Status == TaskItemStatusDTO.Completed)
                           .OrderByDescending(t => t.UpdatedAt)
                           .Take(5).ToList());
                
                Task<List<TaskItemDTO>> dueTodayTask = Task.FromResult(
                    taskList.Where(t => t.DueDate.HasValue && t.DueDate.Value.Date == DateTime.UtcNow.Date)
                           .ToList());
                
                Task<List<TaskItemDTO>> overdueTask = Task.FromResult(
                    taskList.Where(t => t.DueDate.HasValue && 
                                   t.DueDate.Value < DateTime.UtcNow && 
                                   t.Status != TaskItemStatusDTO.Completed)
                           .ToList());
                
                Task<List<TaskItemDTO>> highPriorityTask = Task.FromResult(
                    taskList.Where(t => t.Priority == 2 || t.Priority == 3) // High = 2, Critical = 3
                           .OrderBy(t => t.DueDate)
                           .Take(5).ToList());

                await Task.WhenAll(recentTask, recentlyCompletedTask, dueTodayTask, overdueTask, highPriorityTask);

                RecentTasksDataDTO recentTasksData = new RecentTasksDataDTO
                {
                    Recent = recentTask.Result,
                    RecentlyCompleted = recentlyCompletedTask.Result,
                    DueToday = dueTodayTask.Result,
                    Overdue = overdueTask.Result,
                    HighPriority = highPriorityTask.Result
                };

                _logger.LogDebug("Recent tasks data fetched for user {UserId}", userId);

                return recentTasksData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching recent tasks data for user {UserId}", userId);
                
                // Return default tasks data on error
                return new RecentTasksDataDTO();
            }
        }

        /// <summary>
        /// Validates user access and permissions for dashboard data
        /// </summary>
        /// <param name="userId">The unique identifier of the user</param>
        /// <returns>True if user has valid access, false otherwise</returns>
        public async Task<bool> ValidateUserAccessAsync(int userId)
        {
            try
            {
                if (userId <= 0)
                {
                    return false;
                }

                // Basic validation - user exists and is active
                // In a real implementation, you would check user status, permissions, etc.
                // For now, we'll assume valid if userId is positive
                return await Task.FromResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating user access for user {UserId}", userId);
                return false;
            }
        }

        /// <summary>
        /// Invalidates cached dashboard data for the specified user
        /// </summary>
        /// <param name="userId">The unique identifier of the user</param>
        /// <returns>True if cache invalidation was successful</returns>
        public async Task<bool> InvalidateDashboardCacheAsync(int userId)
        {
            try
            {
                string fullCacheKey = $"{CACHE_KEY_PREFIX}_full_{userId}";
                string statsCacheKey = $"{CACHE_KEY_PREFIX}_stats_{userId}";

                _cache.Remove(fullCacheKey);
                _cache.Remove(statsCacheKey);

                _logger.LogInformation("Dashboard cache invalidated for user {UserId}", userId);

                return await Task.FromResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invalidating dashboard cache for user {UserId}", userId);
                return false;
            }
        }

        /// <summary>
        /// Extracts points value from activity metadata
        /// </summary>
        /// <param name="metadata">Activity metadata dictionary</param>
        /// <returns>Points value or 0 if not found</returns>
        private static int ExtractPointsFromMetadata(Dictionary<string, object>? metadata)
        {
            if (metadata == null)
                return 0;

            // Try common point keys
            string[] pointKeys = { "points", "pointsEarned", "score", "value" };
            
            foreach (string key in pointKeys)
            {
                if (metadata.TryGetValue(key, out object? pointValue))
                {
                    if (pointValue is int intValue)
                        return intValue;
                    if (pointValue is string strValue && int.TryParse(strValue, out int parsedValue))
                        return parsedValue;
                    if (pointValue is double doubleValue)
                        return (int)doubleValue;
                }
            }

            return 0;
        }

        /// <summary>
        /// Gets system status information for the dashboard
        /// </summary>
        /// <param name="userId">The unique identifier of the user</param>
        /// <returns>Dashboard system status data</returns>
        private async Task<DashboardSystemStatusDTO> GetSystemStatusAsync(int userId)
        {
            try
            {
                _logger.LogDebug("Fetching system status for user {UserId}", userId);

                // Get unread notifications count
                int unreadNotifications = 0;
                try
                {
                    unreadNotifications = await _notificationService.GetUnreadNotificationCountAsync(userId);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get unread notifications count for user {UserId}", userId);
                }

                DashboardSystemStatusDTO systemStatus = new DashboardSystemStatusDTO
                {
                    IsConnected = true, // TODO: Implement real connectivity check
                    SignalRStatus = "Connected", // TODO: Check actual SignalR status
                    LastConnectionCheck = DateTime.UtcNow,
                    UnreadNotifications = unreadNotifications,
                    HealthStatus = "Healthy" // TODO: Implement health check
                };

                return systemStatus;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching system status for user {UserId}", userId);
                
                // Return default status on error
                return new DashboardSystemStatusDTO
                {
                    IsConnected = false,
                    SignalRStatus = "Disconnected",
                    HealthStatus = "Error"
                };
            }
        }
    }
} 