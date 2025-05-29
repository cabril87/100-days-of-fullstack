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
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.DTOs.Focus;
using TaskTrackerAPI.Hubs;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

/// <summary>
/// Service for delivering real-time calendar and availability updates via SignalR
/// </summary>
public class CalendarRealTimeService : ICalendarRealTimeService
{
    private readonly IHubContext<CalendarHub> _calendarHubContext;
    private readonly ILogger<CalendarRealTimeService> _logger;

    public CalendarRealTimeService(
        IHubContext<CalendarHub> calendarHubContext,
        ILogger<CalendarRealTimeService> logger)
    {
        _calendarHubContext = calendarHubContext ?? throw new ArgumentNullException(nameof(calendarHubContext));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    #region Calendar Event Updates

    /// <summary>
    /// Send calendar event update to family members
    /// </summary>
    public async Task SendEventUpdateToFamilyAsync(int familyId, FamilyCalendarEventDTO eventDto, string updateType)
    {
        try
        {
            string familyGroup = $"family-calendar-{familyId}";
            object eventUpdate = new
            {
                Type = updateType, // "created", "updated", "deleted"
                Event = eventDto,
                Timestamp = DateTime.UtcNow,
                FamilyId = familyId
            };
            
            await _calendarHubContext.Clients.Group(familyGroup).SendAsync("CalendarEventUpdated", eventUpdate);
            _logger.LogInformation("Sent {UpdateType} event update for event {EventId} to family {FamilyId}", 
                updateType, eventDto.Id, familyId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending event update to family {FamilyId}", familyId);
        }
    }

    /// <summary>
    /// Send batch operation result to family members
    /// </summary>
    public async Task SendBatchOperationResultAsync(int familyId, BatchCalendarOperationResultDTO result)
    {
        try
        {
            string familyGroup = $"family-calendar-{familyId}";
            object batchUpdate = new
            {
                Type = "batch_operation_completed",
                Result = result,
                Timestamp = DateTime.UtcNow,
                FamilyId = familyId
            };
            
            await _calendarHubContext.Clients.Group(familyGroup).SendAsync("BatchOperationCompleted", batchUpdate);
            _logger.LogInformation("Sent batch operation result for family {FamilyId}, operation: {OperationType}", 
                familyId, result.OperationType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending batch operation result to family {FamilyId}", familyId);
        }
    }

    #endregion

    #region Availability Updates

    /// <summary>
    /// Send availability update for a family member
    /// </summary>
    public async Task SendAvailabilityUpdateAsync(int memberId, AvailabilityUpdateDTO update)
    {
        try
        {
            string availabilityGroup = $"member-availability-{memberId}";
            object availabilityUpdate = new
            {
                Type = "availability_updated",
                MemberId = memberId,
                Update = update,
                Timestamp = DateTime.UtcNow
            };
            
            await _calendarHubContext.Clients.Group(availabilityGroup).SendAsync("AvailabilityUpdated", availabilityUpdate);
            _logger.LogInformation("Sent availability update for member {MemberId}", memberId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending availability update for member {MemberId}", memberId);
        }
    }

    /// <summary>
    /// Send availability matrix update to family
    /// </summary>
    public async Task SendAvailabilityMatrixUpdateAsync(int familyId, AvailabilityMatrixDTO matrix)
    {
        try
        {
            string familyGroup = $"family-calendar-{familyId}";
            object matrixUpdate = new
            {
                Type = "availability_matrix_updated",
                FamilyId = familyId,
                Matrix = matrix,
                Timestamp = DateTime.UtcNow
            };
            
            await _calendarHubContext.Clients.Group(familyGroup).SendAsync("AvailabilityMatrixUpdated", matrixUpdate);
            _logger.LogInformation("Sent availability matrix update for family {FamilyId}", familyId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending availability matrix update to family {FamilyId}", familyId);
        }
    }

    #endregion

    #region Conflict Detection

    /// <summary>
    /// Send scheduling conflict notification to affected users
    /// </summary>
    public async Task SendConflictNotificationAsync(int familyId, SchedulingConflictDTO conflict)
    {
        try
        {
            string familyGroup = $"family-calendar-{familyId}";
            object conflictNotification = new
            {
                Type = "scheduling_conflict_detected",
                Conflict = conflict,
                FamilyId = familyId,
                Timestamp = DateTime.UtcNow,
                RequiresAction = conflict.Severity == "Critical" || conflict.Severity == "Major"
            };
            
            await _calendarHubContext.Clients.Group(familyGroup).SendAsync("ConflictDetected", conflictNotification);
            
            // Also send to affected members specifically
            foreach (int memberId in conflict.AffectedMemberIds)
            {
                string memberGroup = $"member-availability-{memberId}";
                await _calendarHubContext.Clients.Group(memberGroup).SendAsync("MemberConflictDetected", conflictNotification);
            }
            
            _logger.LogInformation("Sent conflict notification for family {FamilyId}, severity: {Severity}", 
                familyId, conflict.Severity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending conflict notification to family {FamilyId}", familyId);
        }
    }

    /// <summary>
    /// Send conflict resolution result to family
    /// </summary>
    public async Task SendConflictResolutionAsync(int familyId, ConflictResolutionDTO resolution)
    {
        try
        {
            string familyGroup = $"family-calendar-{familyId}";
            object resolutionUpdate = new
            {
                Type = "conflict_resolved",
                Resolution = resolution,
                FamilyId = familyId,
                Timestamp = DateTime.UtcNow
            };
            
            await _calendarHubContext.Clients.Group(familyGroup).SendAsync("ConflictResolved", resolutionUpdate);
            _logger.LogInformation("Sent conflict resolution for family {FamilyId}, conflict {ConflictId}", 
                familyId, resolution.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending conflict resolution to family {FamilyId}", familyId);
        }
    }

    #endregion

    #region Smart Scheduling

    /// <summary>
    /// Send smart scheduling suggestions to requesting user
    /// </summary>
    public async Task SendSchedulingSuggestionsAsync(int userId, SmartSchedulingSuggestionDTO[] suggestions)
    {
        try
        {
            string userGroup = $"user-calendar-{userId}";
            object suggestionUpdate = new
            {
                Type = "scheduling_suggestions",
                Suggestions = suggestions,
                UserId = userId,
                Timestamp = DateTime.UtcNow,
                Count = suggestions.Length
            };
            
            await _calendarHubContext.Clients.Group(userGroup).SendAsync("SchedulingSuggestionsReceived", suggestionUpdate);
            _logger.LogInformation("Sent {Count} scheduling suggestions to user {UserId}", suggestions.Length, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending scheduling suggestions to user {UserId}", userId);
        }
    }

    /// <summary>
    /// Send optimal time slots to family
    /// </summary>
    public async Task SendOptimalTimeSlotsAsync(int familyId, OptimalTimeSlotDTO[] timeSlots)
    {
        try
        {
            string familyGroup = $"family-calendar-{familyId}";
            object slotsUpdate = new
            {
                Type = "optimal_time_slots",
                TimeSlots = timeSlots,
                FamilyId = familyId,
                Timestamp = DateTime.UtcNow,
                Count = timeSlots.Length
            };
            
            await _calendarHubContext.Clients.Group(familyGroup).SendAsync("OptimalTimeSlotsUpdated", slotsUpdate);
            _logger.LogInformation("Sent {Count} optimal time slots to family {FamilyId}", timeSlots.Length, familyId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending optimal time slots to family {FamilyId}", familyId);
        }
    }

    #endregion

    #region Focus Mode Integration

    /// <summary>
    /// Send focus session update to availability watchers
    /// </summary>
    public async Task SendFocusSessionUpdateAsync(int memberId, FocusSessionUpdateDTO update)
    {
        try
        {
            string availabilityGroup = $"member-availability-{memberId}";
            object focusUpdate = new
            {
                Type = "focus_session_updated",
                MemberId = memberId,
                Update = update,
                Timestamp = DateTime.UtcNow,
                BlocksAvailability = update.Status == "InProgress"
            };
            
            await _calendarHubContext.Clients.Group(availabilityGroup).SendAsync("FocusSessionUpdated", focusUpdate);
            _logger.LogInformation("Sent focus session update for member {MemberId}, status: {Status}", 
                memberId, update.Status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending focus session update for member {MemberId}", memberId);
        }
    }

    /// <summary>
    /// Send optimal focus time suggestions to user
    /// </summary>
    public async Task SendOptimalFocusTimesAsync(int userId, OptimalFocusTimeDTO[] suggestions)
    {
        try
        {
            string userGroup = $"user-calendar-{userId}";
            object focusTimeUpdate = new
            {
                Type = "optimal_focus_times",
                Suggestions = suggestions,
                UserId = userId,
                Timestamp = DateTime.UtcNow,
                Count = suggestions.Length
            };
            
            await _calendarHubContext.Clients.Group(userGroup).SendAsync("OptimalFocusTimesReceived", focusTimeUpdate);
            _logger.LogInformation("Sent {Count} optimal focus time suggestions to user {UserId}", suggestions.Length, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending optimal focus times to user {UserId}", userId);
        }
    }

    /// <summary>
    /// Send family quiet time request to family members
    /// </summary>
    public async Task SendFamilyQuietTimeRequestAsync(int familyId, FamilyQuietTimeRequestDTO request)
    {
        try
        {
            string familyGroup = $"family-calendar-{familyId}";
            object quietTimeRequest = new
            {
                Type = "family_quiet_time_requested",
                Request = request,
                FamilyId = familyId,
                Timestamp = DateTime.UtcNow,
                RequiresResponse = true
            };
            
            await _calendarHubContext.Clients.Group(familyGroup).SendAsync("FamilyQuietTimeRequested", quietTimeRequest);
            _logger.LogInformation("Sent family quiet time request for family {FamilyId}, {Start} to {End}", 
                familyId, request.StartTime, request.EndTime);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending family quiet time request to family {FamilyId}", familyId);
        }
    }

    #endregion

    #region Analytics Updates

    /// <summary>
    /// Send analytics update to family dashboard
    /// </summary>
    public async Task SendAnalyticsUpdateAsync(int familyId, SchedulingAnalyticsDTO analytics)
    {
        try
        {
            string familyGroup = $"family-calendar-{familyId}";
            object analyticsUpdate = new
            {
                Type = "analytics_updated",
                Analytics = analytics,
                FamilyId = familyId,
                Timestamp = DateTime.UtcNow
            };
            
            await _calendarHubContext.Clients.Group(familyGroup).SendAsync("AnalyticsUpdated", analyticsUpdate);
            _logger.LogInformation("Sent analytics update for family {FamilyId}", familyId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending analytics update to family {FamilyId}", familyId);
        }
    }

    /// <summary>
    /// Send scheduling efficiency update to user
    /// </summary>
    public async Task SendEfficiencyUpdateAsync(int userId, SchedulingEfficiencyDTO efficiency)
    {
        try
        {
            string userGroup = $"user-calendar-{userId}";
            object efficiencyUpdate = new
            {
                Type = "efficiency_updated",
                Efficiency = efficiency,
                UserId = userId,
                Timestamp = DateTime.UtcNow
            };
            
            await _calendarHubContext.Clients.Group(userGroup).SendAsync("EfficiencyUpdated", efficiencyUpdate);
            _logger.LogInformation("Sent efficiency update to user {UserId}, score: {Score}%", 
                userId, efficiency.OverallEfficiency);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending efficiency update to user {UserId}", userId);
        }
    }

    #endregion

    #region Notifications Integration

    /// <summary>
    /// Send calendar notification to user
    /// </summary>
    public async Task SendCalendarNotificationAsync(int userId, CalendarNotificationDTO notification)
    {
        try
        {
            string userGroup = $"user-calendar-{userId}";
            object calendarNotification = new
            {
                Type = "calendar_notification",
                Notification = notification,
                UserId = userId,
                Timestamp = DateTime.UtcNow,
                Priority = notification.Priority
            };
            
            await _calendarHubContext.Clients.Group(userGroup).SendAsync("CalendarNotificationReceived", calendarNotification);
            _logger.LogInformation("Sent calendar notification to user {UserId}, type: {NotificationType}", 
                userId, notification.NotificationType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending calendar notification to user {UserId}", userId);
        }
    }

    #endregion
} 