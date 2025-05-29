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
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces;

public interface ISmartSchedulingService
{
    // Smart Scheduling Methods
    Task<IEnumerable<OptimalTimeSlotDTO>> GetOptimalMeetingTimesAsync(
        int familyId, 
        int userId, 
        TimeSpan duration, 
        IEnumerable<int> requiredAttendeeIds,
        DateTime? preferredStartDate = null,
        DateTime? preferredEndDate = null
    );

    Task<IEnumerable<SmartSchedulingSuggestionDTO>> GetSchedulingSuggestionsAsync(
        int familyId,
        int userId,
        SchedulingPreferencesDTO preferences
    );

    // Conflict Detection Methods
    Task<IEnumerable<SchedulingConflictDTO>> DetectSchedulingConflictsAsync(
        int familyId,
        int userId,
        DateTime startDate,
        DateTime endDate
    );

    Task<IEnumerable<ConflictResolutionDTO>> GetConflictResolutionsAsync(
        int familyId,
        int userId,
        int conflictId
    );

    Task<bool> ResolveConflictAsync(
        int familyId,
        int userId,
        int conflictId,
        ConflictResolutionRequestDTO resolution
    );

    // Availability Matrix Methods
    Task<AvailabilityMatrixDTO> GetAvailabilityMatrixAsync(
        int familyId,
        int userId,
        DateTime startDate,
        DateTime endDate,
        TimeSpan granularity
    );

    // Batch Operations Methods
    Task<BatchCalendarOperationResultDTO> BulkCreateEventsAsync(
        int familyId,
        int userId,
        IEnumerable<CreateFamilyCalendarEventDTO> events
    );

    Task<BatchCalendarOperationResultDTO> BulkUpdateEventsAsync(
        int familyId,
        int userId,
        IEnumerable<BulkUpdateEventRequestDTO> updates
    );

    Task<BatchCalendarOperationResultDTO> BulkDeleteEventsAsync(
        int familyId,
        int userId,
        IEnumerable<int> eventIds
    );

    Task<BatchCalendarOperationResultDTO> BulkRescheduleEventsAsync(
        int familyId,
        int userId,
        BulkRescheduleRequestDTO request
    );

    // Analytics Methods
    Task<SchedulingAnalyticsDTO> GetSchedulingAnalyticsAsync(
        int familyId,
        int userId,
        DateTime startDate,
        DateTime endDate
    );

    Task<SchedulingEfficiencyDTO> CalculateSchedulingEfficiencyAsync(
        int familyId,
        int userId,
        DateTime startDate,
        DateTime endDate
    );

    Task<IEnumerable<MemberSchedulingPatternDTO>> GetMemberSchedulingPatternsAsync(
        int familyId,
        int userId
    );

    // Optimization Methods
    Task<ScheduleOptimizationResultDTO> OptimizeScheduleAsync(
        int familyId,
        int userId,
        ScheduleOptimizationRequestDTO request
    );

    Task<AvailabilityPredictionDTO> PredictAvailabilityAsync(
        int familyId,
        int memberId,
        int userId,
        DateTime targetDate
    );

    // Gamification Tracking Methods
    Task TrackSmartSchedulingUsageAsync(int userId, int familyId);
    Task TrackConflictResolutionAsync(int userId, int familyId, string resolutionMethod);
    Task TrackOptimalTimeSelectionAsync(int userId, int familyId, int eventId);
    Task TrackBatchCalendarOperationAsync(int userId, int familyId, string operationType, int operationCount);
    Task TrackAvailabilityUpdateAsync(int userId, int familyId);
    Task TrackCalendarAnalyticsViewAsync(int userId, int familyId);
} 