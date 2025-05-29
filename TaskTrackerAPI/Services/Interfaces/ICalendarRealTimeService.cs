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
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.DTOs.Focus;
using TaskTrackerAPI.Services;

namespace TaskTrackerAPI.Services.Interfaces;

/// <summary>
/// Interface for real-time calendar, availability, and focus mode updates using SignalR
/// </summary>
public interface ICalendarRealTimeService
{
    #region Calendar Event Updates
    
    /// <summary>
    /// Send calendar event update to family members
    /// </summary>
    /// <param name="familyId">The family ID</param>
    /// <param name="eventDto">The event data</param>
    /// <param name="updateType">Type of update: "created", "updated", "deleted"</param>
    Task SendEventUpdateToFamilyAsync(int familyId, FamilyCalendarEventDTO eventDto, string updateType);
    
    /// <summary>
    /// Send batch operation result to family members
    /// </summary>
    /// <param name="familyId">The family ID</param>
    /// <param name="result">The batch operation result</param>
    Task SendBatchOperationResultAsync(int familyId, BatchCalendarOperationResultDTO result);
    
    #endregion
    
    #region Availability Updates
    
    /// <summary>
    /// Send availability update for a family member
    /// </summary>
    /// <param name="memberId">The family member ID</param>
    /// <param name="update">The availability update data</param>
    Task SendAvailabilityUpdateAsync(int memberId, AvailabilityUpdateDTO update);
    
    /// <summary>
    /// Send availability matrix update to family
    /// </summary>
    /// <param name="familyId">The family ID</param>
    /// <param name="matrix">The updated availability matrix</param>
    Task SendAvailabilityMatrixUpdateAsync(int familyId, AvailabilityMatrixDTO matrix);
    
    #endregion
    
    #region Conflict Detection
    
    /// <summary>
    /// Send scheduling conflict notification to affected users
    /// </summary>
    /// <param name="familyId">The family ID</param>
    /// <param name="conflict">The detected conflict</param>
    Task SendConflictNotificationAsync(int familyId, SchedulingConflictDTO conflict);
    
    /// <summary>
    /// Send conflict resolution result to family
    /// </summary>
    /// <param name="familyId">The family ID</param>
    /// <param name="resolution">The conflict resolution result</param>
    Task SendConflictResolutionAsync(int familyId, ConflictResolutionDTO resolution);
    
    #endregion
    
    #region Smart Scheduling
    
    /// <summary>
    /// Send smart scheduling suggestions to requesting user
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="suggestions">The scheduling suggestions</param>
    Task SendSchedulingSuggestionsAsync(int userId, SmartSchedulingSuggestionDTO[] suggestions);
    
    /// <summary>
    /// Send optimal time slots to family
    /// </summary>
    /// <param name="familyId">The family ID</param>
    /// <param name="timeSlots">The optimal time slots</param>
    Task SendOptimalTimeSlotsAsync(int familyId, OptimalTimeSlotDTO[] timeSlots);
    
    #endregion
    
    #region Focus Mode Integration
    
    /// <summary>
    /// Send focus session update to availability watchers
    /// </summary>
    /// <param name="memberId">The family member ID</param>
    /// <param name="update">The focus session update</param>
    Task SendFocusSessionUpdateAsync(int memberId, FocusSessionUpdateDTO update);
    
    /// <summary>
    /// Send optimal focus time suggestions to user
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="suggestions">The optimal focus time suggestions</param>
    Task SendOptimalFocusTimesAsync(int userId, OptimalFocusTimeDTO[] suggestions);
    
    /// <summary>
    /// Send family quiet time request to family members
    /// </summary>
    /// <param name="familyId">The family ID</param>
    /// <param name="request">The quiet time request</param>
    Task SendFamilyQuietTimeRequestAsync(int familyId, FamilyQuietTimeRequestDTO request);
    
    #endregion
    
    #region Analytics Updates
    
    /// <summary>
    /// Send analytics update to family dashboard
    /// </summary>
    /// <param name="familyId">The family ID</param>
    /// <param name="analytics">The updated analytics data</param>
    Task SendAnalyticsUpdateAsync(int familyId, SchedulingAnalyticsDTO analytics);
    
    /// <summary>
    /// Send scheduling efficiency update to user
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="efficiency">The efficiency data</param>
    Task SendEfficiencyUpdateAsync(int userId, SchedulingEfficiencyDTO efficiency);
    
    #endregion
    
    #region Notifications Integration
    
    /// <summary>
    /// Send calendar notification to user
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="notification">The calendar notification</param>
    Task SendCalendarNotificationAsync(int userId, CalendarNotificationDTO notification);
    
    #endregion
} 