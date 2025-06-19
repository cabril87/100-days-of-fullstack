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
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Boards;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.DTOs.Notifications;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.DTOs.Templates;
using TaskTrackerAPI.Hubs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

/// <summary>
/// Unified service for all real-time messaging via SignalR
/// Consolidates gamification, notifications, tasks, boards, and templates into a single service
/// Follows proper architectural patterns by treating real-time messaging as infrastructure
/// </summary>
public class UnifiedRealTimeService : IUnifiedRealTimeService
{
    private readonly IHubContext<UnifiedMainHub> _unifiedHubContext;
    private readonly ILogger<UnifiedRealTimeService> _logger;

    public UnifiedRealTimeService(
        IHubContext<UnifiedMainHub> unifiedHubContext,
        ILogger<UnifiedRealTimeService> logger)
    {
        _unifiedHubContext = unifiedHubContext ?? throw new ArgumentNullException(nameof(unifiedHubContext));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    #region Gamification Real-Time Events

    /// <summary>
    /// Send points earned notification to a user
    /// </summary>
    public async Task SendPointsEarnedAsync(int userId, int points, string reason, int? relatedEntityId = null)
    {
        try
        {
            GamificationEventDTO eventDto = new GamificationEventDTO
            {
                EventType = "PointsEarned",
                UserId = userId,
                Points = points,
                Reason = reason,
                RelatedEntityId = relatedEntityId,
                Timestamp = DateTime.UtcNow
            };

            await _unifiedHubContext.Clients.User(userId.ToString())
                .SendAsync("ReceiveGamificationEvent", eventDto);

            _logger.LogInformation("Points earned event sent to user {UserId}: {Points} points for {Reason}", 
                userId, points, reason);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send points earned event to user {UserId}", userId);
        }
    }

    /// <summary>
    /// Send achievement unlocked notification to a user
    /// </summary>
    public async Task SendAchievementUnlockedAsync(int userId, string achievementName, int achievementId, int points)
    {
        try
        {
            GamificationEventDTO eventDto = new GamificationEventDTO
            {
                EventType = "AchievementUnlocked",
                UserId = userId,
                AchievementName = achievementName,
                AchievementId = achievementId,
                Points = points,
                Timestamp = DateTime.UtcNow
            };

            await _unifiedHubContext.Clients.User(userId.ToString())
                .SendAsync("ReceiveGamificationEvent", eventDto);

            _logger.LogInformation("Achievement unlocked event sent to user {UserId}: {AchievementName}", 
                userId, achievementName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send achievement unlocked event to user {UserId}", userId);
        }
    }

    /// <summary>
    /// Send level up notification to a user
    /// </summary>
    public async Task SendLevelUpAsync(int userId, int newLevel, int oldLevel)
    {
        try
        {
            GamificationEventDTO eventDto = new GamificationEventDTO
            {
                EventType = "LevelUp",
                UserId = userId,
                NewLevel = newLevel,
                OldLevel = oldLevel,
                Timestamp = DateTime.UtcNow
            };

            await _unifiedHubContext.Clients.User(userId.ToString())
                .SendAsync("ReceiveGamificationEvent", eventDto);

            _logger.LogInformation("Level up event sent to user {UserId}: Level {OldLevel} → {NewLevel}", 
                userId, oldLevel, newLevel);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send level up event to user {UserId}", userId);
        }
    }

    /// <summary>
    /// Send streak updated notification to a user
    /// </summary>
    public async Task SendStreakUpdatedAsync(int userId, int currentStreak, bool isNewRecord)
    {
        try
        {
            GamificationEventDTO eventDto = new GamificationEventDTO
            {
                EventType = "StreakUpdated",
                UserId = userId,
                CurrentStreak = currentStreak,
                IsNewRecord = isNewRecord,
                Timestamp = DateTime.UtcNow
            };

            await _unifiedHubContext.Clients.User(userId.ToString())
                .SendAsync("ReceiveGamificationEvent", eventDto);

            _logger.LogInformation("Streak updated event sent to user {UserId}: {CurrentStreak} days (New Record: {IsNewRecord})", 
                userId, currentStreak, isNewRecord);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send streak updated event to user {UserId}", userId);
        }
    }

    /// <summary>
    /// Send badge earned notification to a user
    /// </summary>
    public async Task SendBadgeEarnedAsync(int userId, string badgeName, int badgeId, string rarity)
    {
        try
        {
            GamificationEventDTO eventDto = new GamificationEventDTO
            {
                EventType = "BadgeEarned",
                UserId = userId,
                BadgeName = badgeName,
                BadgeId = badgeId,
                Rarity = rarity,
                Timestamp = DateTime.UtcNow
            };

            await _unifiedHubContext.Clients.User(userId.ToString())
                .SendAsync("ReceiveGamificationEvent", eventDto);

            _logger.LogInformation("Badge earned event sent to user {UserId}: {BadgeName} ({Rarity})", 
                userId, badgeName, rarity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send badge earned event to user {UserId}", userId);
        }
    }

    /// <summary>
    /// Send challenge progress notification to a user
    /// </summary>
    public async Task SendChallengeProgressAsync(int userId, string challengeName, int progress, int target, bool isCompleted)
    {
        try
        {
            GamificationEventDTO eventDto = new GamificationEventDTO
            {
                EventType = "ChallengeProgress",
                UserId = userId,
                ChallengeName = challengeName,
                Progress = progress,
                Target = target,
                IsCompleted = isCompleted,
                Timestamp = DateTime.UtcNow
            };

            await _unifiedHubContext.Clients.User(userId.ToString())
                .SendAsync("ReceiveGamificationEvent", eventDto);

            _logger.LogInformation("Challenge progress event sent to user {UserId}: {ChallengeName} ({Progress}/{Target})", 
                userId, challengeName, progress, target);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send challenge progress event to user {UserId}", userId);
        }
    }

    /// <summary>
    /// Send reward redeemed notification to a user
    /// </summary>
    public async Task SendRewardRedeemedAsync(int userId, string rewardName, int pointsCost)
    {
        try
        {
            GamificationEventDTO eventDto = new GamificationEventDTO
            {
                EventType = "RewardRedeemed",
                UserId = userId,
                RewardName = rewardName,
                PointsCost = pointsCost,
                Timestamp = DateTime.UtcNow
            };

            await _unifiedHubContext.Clients.User(userId.ToString())
                .SendAsync("ReceiveGamificationEvent", eventDto);

            _logger.LogInformation("Reward redeemed event sent to user {UserId}: {RewardName} for {PointsCost} points", 
                userId, rewardName, pointsCost);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send reward redeemed event to user {UserId}", userId);
        }
    }

    #endregion

    #region Notification Real-Time Events

    /// <summary>
    /// Send a notification to a specific user
    /// </summary>
    public async Task SendNotificationToUserAsync(int userId, NotificationDTO notification)
    {
        try
        {
            await _unifiedHubContext.Clients.User(userId.ToString())
                .SendAsync("ReceiveNotification", notification);

            _logger.LogInformation("Notification sent to user {UserId}: {Title}", userId, notification.Title);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification to user {UserId}", userId);
        }
    }

    /// <summary>
    /// Send a notification to all members of a family
    /// </summary>
    public async Task SendNotificationToFamilyAsync(int familyId, NotificationDTO notification)
    {
        try
        {
            await _unifiedHubContext.Clients.Group($"Family_{familyId}")
                .SendAsync("ReceiveNotification", notification);

            _logger.LogInformation("Notification sent to family {FamilyId}: {Title}", familyId, notification.Title);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification to family {FamilyId}", familyId);
        }
    }

    /// <summary>
    /// Send a notification update (such as read status change) to a user
    /// </summary>
    public async Task SendNotificationUpdateToUserAsync(int userId, int notificationId, bool isRead)
    {
        try
        {
            NotificationUpdateDTO updateDto = new NotificationUpdateDTO
            {
                NotificationId = notificationId,
                IsRead = isRead,
                UpdatedAt = DateTime.UtcNow
            };

            await _unifiedHubContext.Clients.User(userId.ToString())
                .SendAsync("ReceiveNotificationUpdate", updateDto);

            _logger.LogInformation("Notification update sent to user {UserId}: Notification {NotificationId} marked as {Status}", 
                userId, notificationId, isRead ? "read" : "unread");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification update to user {UserId}", userId);
        }
    }

    /// <summary>
    /// Send notification count update to a user
    /// </summary>
    public async Task SendNotificationCountUpdateAsync(int userId, NotificationCountsDTO counts)
    {
        try
        {
            await _unifiedHubContext.Clients.User(userId.ToString())
                .SendAsync("ReceiveNotificationCounts", counts);

            _logger.LogInformation("Notification counts sent to user {UserId}: {UnreadCount} unread", 
                userId, counts.UnreadCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification counts to user {UserId}", userId);
        }
    }

    #endregion

    #region Task Real-Time Events

    /// <summary>
    /// Notify user(s) about a task creation
    /// </summary>
    public async Task NotifyTaskCreatedAsync(int userId, TaskItemDTO task)
    {
        try
        {
            TaskEventDTO eventDto = new TaskEventDTO
            {
                EventType = "TaskCreated",
                UserId = userId,
                Task = task,
                Timestamp = DateTime.UtcNow
            };

            // Notify the user who created the task
            await _unifiedHubContext.Clients.User(userId.ToString())
                .SendAsync("ReceiveTaskEvent", eventDto);

            // If task is assigned to someone else, notify them too
            if (task.AssignedToUserId.HasValue && task.AssignedToUserId.Value != userId)
            {
                await _unifiedHubContext.Clients.User(task.AssignedToUserId.Value.ToString())
                    .SendAsync("ReceiveTaskEvent", eventDto);
            }

            _logger.LogInformation("Task created event sent for task {TaskId} by user {UserId}", task.Id, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send task created event for task {TaskId}", task.Id);
        }
    }

    /// <summary>
    /// Notify user(s) about a task update
    /// </summary>
    public async Task NotifyTaskUpdatedAsync(int userId, TaskItemDTO task, TaskItemDTO previousState)
    {
        try
        {
            TaskEventDTO eventDto = new TaskEventDTO
            {
                EventType = "TaskUpdated",
                UserId = userId,
                Task = task,
                PreviousState = previousState,
                Timestamp = DateTime.UtcNow
            };

            // Notify the user who updated the task
            await _unifiedHubContext.Clients.User(userId.ToString())
                .SendAsync("ReceiveTaskEvent", eventDto);

            // If task is assigned to someone else, notify them too
            if (task.AssignedToUserId.HasValue && task.AssignedToUserId.Value != userId)
            {
                await _unifiedHubContext.Clients.User(task.AssignedToUserId.Value.ToString())
                    .SendAsync("ReceiveTaskEvent", eventDto);
            }

            _logger.LogInformation("Task updated event sent for task {TaskId} by user {UserId}", task.Id, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send task updated event for task {TaskId}", task.Id);
        }
    }

    /// <summary>
    /// Notify user(s) about a task deletion
    /// </summary>
    public async Task NotifyTaskDeletedAsync(int userId, int taskId, int? boardId)
    {
        try
        {
            TaskEventDTO eventDto = new TaskEventDTO
            {
                EventType = "TaskDeleted",
                UserId = userId,
                TaskId = taskId,
                BoardId = boardId,
                Timestamp = DateTime.UtcNow
            };

            await _unifiedHubContext.Clients.User(userId.ToString())
                .SendAsync("ReceiveTaskEvent", eventDto);

            _logger.LogInformation("Task deleted event sent for task {TaskId} by user {UserId}", taskId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send task deleted event for task {TaskId}", taskId);
        }
    }

    /// <summary>
    /// Notify about multiple tasks being updated in a batch operation
    /// </summary>
    public async Task NotifyTaskBatchUpdateAsync(int userId, List<TaskStatusUpdateResponseDTO> updates)
    {
        try
        {
            TaskBatchEventDTO eventDto = new TaskBatchEventDTO
            {
                EventType = "TaskBatchUpdate",
                UserId = userId,
                Updates = updates,
                Timestamp = DateTime.UtcNow
            };

            await _unifiedHubContext.Clients.User(userId.ToString())
                .SendAsync("ReceiveTaskBatchEvent", eventDto);

            _logger.LogInformation("Task batch update event sent for {Count} tasks by user {UserId}", 
                updates.Count, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send task batch update event for user {UserId}", userId);
        }
    }

    /// <summary>
    /// Notify about a conflict detected during update
    /// </summary>
    public async Task NotifyTaskConflictAsync(int userId, TaskConflictDTO conflict)
    {
        try
        {
            await _unifiedHubContext.Clients.User(userId.ToString())
                .SendAsync("ReceiveTaskConflict", conflict);

            _logger.LogInformation("Task conflict event sent to user {UserId} for task {TaskId}", 
                userId, conflict.TaskId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send task conflict event to user {UserId}", userId);
        }
    }

    #endregion

    #region Board Real-Time Events

    /// <summary>
    /// Notify when a user joins a board
    /// </summary>
    public async Task NotifyUserJoinedBoardAsync(int boardId, int userId, string username)
    {
        try
        {
            BoardEventDTO eventDto = new BoardEventDTO
            {
                EventType = "UserJoinedBoard",
                BoardId = boardId,
                UserId = userId,
                Username = username,
                Timestamp = DateTime.UtcNow
            };

            await _unifiedHubContext.Clients.Group($"Board_{boardId}")
                .SendAsync("ReceiveBoardEvent", eventDto);

            _logger.LogInformation("User joined board event sent: User {UserId} joined board {BoardId}", 
                userId, boardId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send user joined board event for board {BoardId}", boardId);
        }
    }

    /// <summary>
    /// Notify when a user leaves a board
    /// </summary>
    public async Task NotifyUserLeftBoardAsync(int boardId, int userId, string username)
    {
        try
        {
            BoardEventDTO eventDto = new BoardEventDTO
            {
                EventType = "UserLeftBoard",
                BoardId = boardId,
                UserId = userId,
                Username = username,
                Timestamp = DateTime.UtcNow
            };

            await _unifiedHubContext.Clients.Group($"Board_{boardId}")
                .SendAsync("ReceiveBoardEvent", eventDto);

            _logger.LogInformation("User left board event sent: User {UserId} left board {BoardId}", 
                userId, boardId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send user left board event for board {BoardId}", boardId);
        }
    }

    /// <summary>
    /// Notify when a board column is updated
    /// </summary>
    public async Task NotifyColumnUpdatedAsync(int boardId, object columnData)
    {
        try
        {
            BoardEventDTO eventDto = new BoardEventDTO
            {
                EventType = "ColumnUpdated",
                BoardId = boardId,
                Data = columnData,
                Timestamp = DateTime.UtcNow
            };

            await _unifiedHubContext.Clients.Group($"Board_{boardId}")
                .SendAsync("ReceiveBoardEvent", eventDto);

            _logger.LogInformation("Column updated event sent for board {BoardId}", boardId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send column updated event for board {BoardId}", boardId);
        }
    }

    /// <summary>
    /// Notify when WIP limit is violated
    /// </summary>
    public async Task NotifyWipLimitViolationAsync(int boardId, int columnId, string columnName, int currentCount, int wipLimit)
    {
        try
        {
            WipLimitViolationDTO violationDto = new WipLimitViolationDTO
            {
                BoardId = boardId,
                ColumnId = columnId,
                ColumnName = columnName,
                CurrentCount = currentCount,
                WipLimit = wipLimit,
                Timestamp = DateTime.UtcNow
            };

            await _unifiedHubContext.Clients.Group($"Board_{boardId}")
                .SendAsync("ReceiveWipLimitViolation", violationDto);

            _logger.LogInformation("WIP limit violation event sent for board {BoardId}, column {ColumnName}: {CurrentCount}/{WipLimit}", 
                boardId, columnName, currentCount, wipLimit);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send WIP limit violation event for board {BoardId}", boardId);
        }
    }

    /// <summary>
    /// Send board analytics update to users
    /// </summary>
    public async Task SendBoardAnalyticsUpdateAsync(int boardId, object analyticsData)
    {
        try
        {
            await _unifiedHubContext.Clients.Group($"Board_{boardId}")
                .SendAsync("ReceiveBoardAnalytics", analyticsData);

            _logger.LogInformation("Board analytics update sent for board {BoardId}", boardId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send board analytics update for board {BoardId}", boardId);
        }
    }

    #endregion

    #region Template Marketplace Real-Time Events

    /// <summary>
    /// Notify when a template is published to the marketplace
    /// </summary>
    public async Task NotifyTemplatePublishedAsync(int templateId, string templateName, string authorName)
    {
        try
        {
            TemplateEventDTO eventDto = new TemplateEventDTO
            {
                EventType = "TemplatePublished",
                TemplateId = templateId,
                TemplateName = templateName,
                AuthorName = authorName,
                Timestamp = DateTime.UtcNow
            };

            await _unifiedHubContext.Clients.All
                .SendAsync("ReceiveTemplateEvent", eventDto);

            _logger.LogInformation("Template published event sent: {TemplateName} by {AuthorName}", 
                templateName, authorName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send template published event for template {TemplateId}", templateId);
        }
    }

    /// <summary>
    /// Send marketplace analytics update
    /// </summary>
    public async Task SendMarketplaceAnalyticsUpdateAsync(object analyticsData)
    {
        try
        {
            await _unifiedHubContext.Clients.All
                .SendAsync("ReceiveMarketplaceAnalyticsUpdate", analyticsData);

            _logger.LogInformation("Marketplace analytics update sent to all connected users");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send marketplace analytics update");
        }
    }

    /// <summary>
    /// ✨ NEW: Enhanced task completion notification with comprehensive gamification data
    /// </summary>
    public async Task NotifyTaskCompletedAsync(int userId, TaskCompletionEventDTO completionEvent)
    {
        try
        {
            // Send to the user who completed the task
            await _unifiedHubContext.Clients.User(userId.ToString())
                .SendAsync("ReceiveTaskCompletionEvent", completionEvent);

            // If it's a family task, send to all family members
            if (completionEvent.FamilyId.HasValue)
            {
                await _unifiedHubContext.Clients.Group($"Family_{completionEvent.FamilyId}")
                    .SendAsync("ReceiveFamilyTaskCompletion", completionEvent);
            }

            _logger.LogInformation("🎉 Enhanced task completion event sent - Task: {TaskTitle}, User: {UserId}, Points: {Points}", 
                completionEvent.TaskTitle, userId, completionEvent.PointsEarned);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to send enhanced task completion event to user {UserId}", userId);
        }
    }

    /// <summary>
    /// ✨ NEW: Send family activity event to all family members
    /// </summary>
    public async Task SendFamilyActivityAsync(int familyId, FamilyActivityEventDTO activityEvent)
    {
        try
        {
            await _unifiedHubContext.Clients.Group($"Family_{familyId}")
                .SendAsync("ReceiveFamilyActivity", activityEvent);

            _logger.LogInformation("👨‍👩‍👧‍👦 Family activity event sent - Family: {FamilyId}, Activity: {ActivityType}", 
                familyId, activityEvent.ActivityType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to send family activity event to family {FamilyId}", familyId);
        }
    }

    /// <summary>
    /// ✨ NEW: Send family milestone celebration to all family members
    /// </summary>
    public async Task SendFamilyMilestoneAsync(int familyId, FamilyMilestoneEventDTO milestoneEvent)
    {
        try
        {
            await _unifiedHubContext.Clients.Group($"Family_{familyId}")
                .SendAsync("ReceiveFamilyMilestone", milestoneEvent);

            _logger.LogInformation("🏆 Family milestone event sent - Family: {FamilyId}, Milestone: {MilestoneType}", 
                familyId, milestoneEvent.MilestoneType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to send family milestone event to family {FamilyId}", familyId);
        }
    }

    #endregion
} 