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
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.DTOs.Notifications;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces;

/// <summary>
/// Unified interface for all real-time messaging via SignalR
/// Consolidates gamification, notifications, tasks, boards, and templates into a single service
/// </summary>
public interface IUnifiedRealTimeService
{
    #region Gamification Real-Time Events
    
    /// <summary>
    /// Send points earned notification to a user
    /// </summary>
    Task SendPointsEarnedAsync(int userId, int points, string reason, int? relatedEntityId = null);

    /// <summary>
    /// Send achievement unlocked notification to a user
    /// </summary>
    Task SendAchievementUnlockedAsync(int userId, string achievementName, int achievementId, int points);

    /// <summary>
    /// Send level up notification to a user
    /// </summary>
    Task SendLevelUpAsync(int userId, int newLevel, int oldLevel);

    /// <summary>
    /// Send streak updated notification to a user
    /// </summary>
    Task SendStreakUpdatedAsync(int userId, int currentStreak, bool isNewRecord);

    /// <summary>
    /// Send badge earned notification to a user
    /// </summary>
    Task SendBadgeEarnedAsync(int userId, string badgeName, int badgeId, string rarity);

    /// <summary>
    /// Send challenge progress notification to a user
    /// </summary>
    Task SendChallengeProgressAsync(int userId, string challengeName, int progress, int target, bool isCompleted);

    /// <summary>
    /// Send reward redeemed notification to a user
    /// </summary>
    Task SendRewardRedeemedAsync(int userId, string rewardName, int pointsCost);

    #endregion

    #region Notification Real-Time Events

    /// <summary>
    /// Send a notification to a specific user
    /// </summary>
    Task SendNotificationToUserAsync(int userId, NotificationDTO notification);
    
    /// <summary>
    /// Send a notification to all members of a family
    /// </summary>
    Task SendNotificationToFamilyAsync(int familyId, NotificationDTO notification);
    
    /// <summary>
    /// Send a notification update (such as read status change) to a user
    /// </summary>
    Task SendNotificationUpdateToUserAsync(int userId, int notificationId, bool isRead);
    
    /// <summary>
    /// Send notification count update to a user
    /// </summary>
    Task SendNotificationCountUpdateAsync(int userId, NotificationCountsDTO counts);

    #endregion

    #region Task Real-Time Events

    /// <summary>
    /// Notify user(s) about a task creation
    /// </summary>
    Task NotifyTaskCreatedAsync(int userId, TaskItemDTO task);
    
    /// <summary>
    /// Notify user(s) about a task update
    /// </summary>
    Task NotifyTaskUpdatedAsync(int userId, TaskItemDTO task, TaskItemDTO previousState);
    
    /// <summary>
    /// Notify user(s) about a task deletion
    /// </summary>
    Task NotifyTaskDeletedAsync(int userId, int taskId, int? boardId);
    
    /// <summary>
    /// Notify about multiple tasks being updated in a batch operation
    /// </summary>
    Task NotifyTaskBatchUpdateAsync(int userId, List<TaskStatusUpdateResponseDTO> updates);
    
    /// <summary>
    /// Notify about a conflict detected during update
    /// </summary>
    Task NotifyTaskConflictAsync(int userId, TaskConflictDTO conflict);

    /// <summary>
    /// ✨ NEW: Enhanced task completion notification with comprehensive gamification data
    /// </summary>
    Task NotifyTaskCompletedAsync(int userId, TaskCompletionEventDTO completionEvent);

    #endregion

    #region Board Real-Time Events

    /// <summary>
    /// Notify when a user joins a board
    /// </summary>
    Task NotifyUserJoinedBoardAsync(int boardId, int userId, string username);

    /// <summary>
    /// Notify when a user leaves a board
    /// </summary>
    Task NotifyUserLeftBoardAsync(int boardId, int userId, string username);

    /// <summary>
    /// Notify when a board column is updated
    /// </summary>
    Task NotifyColumnUpdatedAsync(int boardId, object columnData);

    /// <summary>
    /// Notify when WIP limit is violated
    /// </summary>
    Task NotifyWipLimitViolationAsync(int boardId, int columnId, string columnName, int currentCount, int wipLimit);

    /// <summary>
    /// Send board analytics update to users
    /// </summary>
    Task SendBoardAnalyticsUpdateAsync(int boardId, object analyticsData);

    #endregion

    #region Template Marketplace Real-Time Events

    /// <summary>
    /// Notify when a template is published to the marketplace
    /// </summary>
    Task NotifyTemplatePublishedAsync(int templateId, string templateName, string authorName);

    /// <summary>
    /// Send marketplace analytics update
    /// </summary>
    Task SendMarketplaceAnalyticsUpdateAsync(object analyticsData);

    #endregion

    #region Family Real-Time Events

    /// <summary>
    /// ✨ NEW: Send family activity event to all family members
    /// </summary>
    Task SendFamilyActivityAsync(int familyId, FamilyActivityEventDTO activityEvent);

    /// <summary>
    /// ✨ NEW: Send family milestone celebration to all family members
    /// </summary>
    Task SendFamilyMilestoneAsync(int familyId, FamilyMilestoneEventDTO milestoneEvent);

    #endregion
} 