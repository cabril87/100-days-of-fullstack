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
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

public class SmartSchedulingService : ISmartSchedulingService
{
    private readonly IFamilyCalendarRepository _calendarRepository;
    private readonly IFamilyRepository _familyRepository;
    private readonly IGamificationService _gamificationService;
    private readonly IMapper _mapper;
    private readonly ILogger<SmartSchedulingService> _logger;

    public SmartSchedulingService(
        IFamilyCalendarRepository calendarRepository,
        IFamilyRepository familyRepository,
        IGamificationService gamificationService,
        IMapper mapper,
        ILogger<SmartSchedulingService> logger)
    {
        _calendarRepository = calendarRepository;
        _familyRepository = familyRepository;
        _gamificationService = gamificationService;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<OptimalTimeSlotDTO>> GetOptimalMeetingTimesAsync(
        int familyId, 
        int userId, 
        TimeSpan duration, 
        IEnumerable<int> requiredAttendeeIds,
        DateTime? preferredStartDate = null,
        DateTime? preferredEndDate = null)
    {
        try
        {
            // Validate family access
            if (!await _familyRepository.IsMemberAsync(familyId, userId))
            {
                _logger.LogWarning("User {UserId} attempted to get optimal times for family {FamilyId}", userId, familyId);
                return new List<OptimalTimeSlotDTO>();
            }

            // Set default date range if not provided
            DateTime startDate = preferredStartDate ?? DateTime.Today;
            DateTime endDate = preferredEndDate ?? DateTime.Today.AddDays(14);

            // Get existing events and availability for the family
            var existingEvents = await _calendarRepository.GetEventsInRangeAsync(familyId, startDate, endDate);
            var familyAvailability = await _calendarRepository.GetAvailabilityInRangeAsync(familyId, startDate, endDate);
            
            // Get family members
            var familyMembers = await _familyRepository.GetMembersAsync(familyId);
            var requiredMembers = familyMembers.Where(m => requiredAttendeeIds.Contains(m.Id)).ToList();

            var optimalSlots = new List<OptimalTimeSlotDTO>();

            // Generate time slots and analyze each one
            DateTime currentSlot = startDate.Date.AddHours(8); // Start at 8 AM
            DateTime searchEnd = endDate.Date.AddHours(20); // End at 8 PM

            while (currentSlot.AddMinutes(duration.TotalMinutes) <= searchEnd)
            {
                var slotEnd = currentSlot.Add(duration);
                
                // Skip weekends for now (can be configurable later)
                if (currentSlot.DayOfWeek == DayOfWeek.Saturday || currentSlot.DayOfWeek == DayOfWeek.Sunday)
                {
                    currentSlot = GetNextWorkdayStart(currentSlot);
                    continue;
                }

                // Analyze this time slot
                var slotAnalysis = AnalyzeTimeSlot(currentSlot, slotEnd, requiredMembers, existingEvents, familyAvailability);
                
                if (slotAnalysis.ConfidenceScore >= 70) // Only include high-confidence slots
                {
                    optimalSlots.Add(slotAnalysis);
                }

                // Move to next 30-minute slot
                currentSlot = currentSlot.AddMinutes(30);
            }

            // Sort by confidence score and return top results
            var topSlots = optimalSlots
                .OrderByDescending(s => s.ConfidenceScore)
                .ThenBy(s => s.ConflictCount)
                .Take(10)
                .ToList();

            // Track usage for gamification
            await TrackSmartSchedulingUsageAsync(userId, familyId);

            return topSlots;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting optimal meeting times for family {FamilyId}", familyId);
            return new List<OptimalTimeSlotDTO>();
        }
    }

    private OptimalTimeSlotDTO AnalyzeTimeSlot(
        DateTime startTime, 
        DateTime endTime, 
        IEnumerable<FamilyMember> requiredMembers,
        IEnumerable<FamilyCalendarEvent> existingEvents,
        IEnumerable<FamilyMemberAvailability> availability)
    {
        var availableMembers = new List<AvailableMemberDTO>();
        int conflictCount = 0;
        double confidenceScore = 100.0;

        // Check each required member's availability
        foreach (var member in requiredMembers)
        {
            var memberStatus = AnalyzeMemberAvailability(member, startTime, endTime, existingEvents, availability);
            availableMembers.Add(memberStatus);

            // Adjust confidence based on member status
            switch (memberStatus.AvailabilityStatus)
            {
                case "Busy":
                    confidenceScore -= 30;
                    conflictCount++;
                    break;
                case "Tentative":
                    confidenceScore -= 15;
                    break;
                case "Available":
                    // No penalty
                    break;
            }
        }

        // Determine overall quality
        string quality = confidenceScore switch
        {
            >= 90 => "Optimal",
            >= 75 => "Good",
            >= 60 => "Fair",
            _ => "Poor"
        };

        // Generate reasoning
        string reasoning = GenerateReasoningForTimeSlot(startTime, endTime, availableMembers, conflictCount);

        return new OptimalTimeSlotDTO
        {
            StartTime = startTime,
            EndTime = endTime,
            ConfidenceScore = Math.Max(0, confidenceScore),
            AvailabilityQuality = quality,
            ConflictCount = conflictCount,
            AvailableMembers = availableMembers,
            Reasoning = reasoning
        };
    }

    private AvailableMemberDTO AnalyzeMemberAvailability(
        FamilyMember member,
        DateTime startTime,
        DateTime endTime,
        IEnumerable<FamilyCalendarEvent> existingEvents,
        IEnumerable<FamilyMemberAvailability> availability)
    {
        // Check for conflicting events
        var conflictingEvents = existingEvents.Where(e => 
            e.Attendees.Any(a => a.FamilyMemberId == member.Id) &&
            e.StartTime < endTime && e.EndTime > startTime).ToList();

        if (conflictingEvents.Any())
        {
            return new AvailableMemberDTO
            {
                MemberId = member.Id,
                MemberName = member.Name,
                AvailabilityStatus = "Busy"
            };
        }

        // Check availability settings
        var memberAvailability = availability.Where(a => 
            a.FamilyMemberId == member.Id &&
            a.StartTime <= startTime && a.EndTime >= endTime).ToList();

        if (memberAvailability.Any())
        {
            var busySlot = memberAvailability.FirstOrDefault(a => a.Status == AvailabilityStatus.Busy);
            if (busySlot != null)
            {
                return new AvailableMemberDTO
                {
                    MemberId = member.Id,
                    MemberName = member.Name,
                    AvailabilityStatus = "Busy"
                };
            }

            var tentativeSlot = memberAvailability.FirstOrDefault(a => a.Status == AvailabilityStatus.Tentative);
            if (tentativeSlot != null)
            {
                return new AvailableMemberDTO
                {
                    MemberId = member.Id,
                    MemberName = member.Name,
                    AvailabilityStatus = "Tentative"
                };
            }
        }

        return new AvailableMemberDTO
        {
            MemberId = member.Id,
            MemberName = member.Name,
            AvailabilityStatus = "Available"
        };
    }

    private DateTime GetNextWorkdayStart(DateTime currentDate)
    {
        DateTime nextDay = currentDate.Date.AddDays(1).AddHours(8);
        while (nextDay.DayOfWeek == DayOfWeek.Saturday || nextDay.DayOfWeek == DayOfWeek.Sunday)
        {
            nextDay = nextDay.AddDays(1);
        }
        return nextDay;
    }

    private string GenerateReasoningForTimeSlot(DateTime startTime, DateTime endTime, IEnumerable<AvailableMemberDTO> members, int conflictCount)
    {
        var availableCount = members.Count(m => m.AvailabilityStatus == "Available");
        var busyCount = members.Count(m => m.AvailabilityStatus == "Busy");
        var tentativeCount = members.Count(m => m.AvailabilityStatus == "Tentative");

        if (conflictCount == 0)
        {
            return $"Perfect time slot: All {availableCount} required members are available";
        }
        else if (busyCount > 0)
        {
            return $"Conflicts detected: {busyCount} member(s) busy, {availableCount} available";
        }
        else if (tentativeCount > 0)
        {
            return $"Good time slot: {availableCount} confirmed available, {tentativeCount} tentative";
        }

        return "Time slot analysis completed";
    }

    public async Task<IEnumerable<SmartSchedulingSuggestionDTO>> GetSchedulingSuggestionsAsync(
        int familyId, int userId, SchedulingPreferencesDTO preferences)
    {
        try
        {
            // Get optimal time slots based on preferences
            var optimalSlots = await GetOptimalMeetingTimesAsync(
                familyId, 
                userId, 
                preferences.Duration, 
                preferences.RequiredAttendeeIds,
                preferences.PreferredStartDate,
                preferences.PreferredEndDate);

            var suggestions = new List<SmartSchedulingSuggestionDTO>();

            foreach (var slot in optimalSlots.Take(preferences.MaxSuggestions))
            {
                if (slot.ConfidenceScore >= preferences.MinConfidenceThreshold * 100)
                {
                    // Detect potential conflicts for this slot
                    var conflicts = await DetectPotentialConflictsForSlot(familyId, slot.StartTime, slot.EndTime);

                    var suggestion = new SmartSchedulingSuggestionDTO
                    {
                        TimeSlot = slot,
                        Confidence = slot.ConfidenceScore / 100.0,
                        PotentialConflicts = conflicts,
                        Attendees = slot.AvailableMembers,
                        Reasoning = slot.Reasoning,
                        RequiresRescheduling = conflicts.Any()
                    };

                    suggestions.Add(suggestion);
                }
            }

            return suggestions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting scheduling suggestions for family {FamilyId}", familyId);
            return new List<SmartSchedulingSuggestionDTO>();
        }
    }

    private async Task<IEnumerable<SchedulingConflictDTO>> DetectPotentialConflictsForSlot(int familyId, DateTime startTime, DateTime endTime)
    {
        // This would be implemented to detect potential conflicts for a specific time slot
        // For now, return empty list
        await Task.CompletedTask;
        return new List<SchedulingConflictDTO>();
    }

    // Placeholder implementations for other interface methods
    public async Task<IEnumerable<SchedulingConflictDTO>> DetectSchedulingConflictsAsync(
        int familyId, int userId, DateTime startDate, DateTime endDate)
    {
        // Implementation for conflict detection
        await Task.CompletedTask;
        return new List<SchedulingConflictDTO>();
    }

    public async Task<IEnumerable<ConflictResolutionDTO>> GetConflictResolutionsAsync(
        int familyId, int userId, int conflictId)
    {
        await Task.CompletedTask;
        return new List<ConflictResolutionDTO>();
    }

    public async Task<bool> ResolveConflictAsync(
        int familyId, int userId, int conflictId, ConflictResolutionRequestDTO resolution)
    {
        await TrackConflictResolutionAsync(userId, familyId, resolution.ResolutionType);
        return true;
    }

    public async Task<AvailabilityMatrixDTO> GetAvailabilityMatrixAsync(
        int familyId, int userId, DateTime startDate, DateTime endDate, TimeSpan granularity)
    {
        await Task.CompletedTask;
        return new AvailabilityMatrixDTO();
    }

    public async Task<BatchCalendarOperationResultDTO> BulkCreateEventsAsync(
        int familyId, int userId, IEnumerable<CreateFamilyCalendarEventDTO> events)
    {
        await TrackBatchCalendarOperationAsync(userId, familyId, "BulkCreate", events.Count());
        return new BatchCalendarOperationResultDTO();
    }

    public async Task<BatchCalendarOperationResultDTO> BulkUpdateEventsAsync(
        int familyId, int userId, IEnumerable<BulkUpdateEventRequestDTO> updates)
    {
        await TrackBatchCalendarOperationAsync(userId, familyId, "BulkUpdate", updates.Count());
        return new BatchCalendarOperationResultDTO();
    }

    public async Task<BatchCalendarOperationResultDTO> BulkDeleteEventsAsync(
        int familyId, int userId, IEnumerable<int> eventIds)
    {
        await TrackBatchCalendarOperationAsync(userId, familyId, "BulkDelete", eventIds.Count());
        return new BatchCalendarOperationResultDTO();
    }

    public async Task<BatchCalendarOperationResultDTO> BulkRescheduleEventsAsync(
        int familyId, int userId, BulkRescheduleRequestDTO request)
    {
        await TrackBatchCalendarOperationAsync(userId, familyId, "BulkReschedule", request.EventIds.Count());
        return new BatchCalendarOperationResultDTO();
    }

    public async Task<SchedulingAnalyticsDTO> GetSchedulingAnalyticsAsync(
        int familyId, int userId, DateTime startDate, DateTime endDate)
    {
        await TrackCalendarAnalyticsViewAsync(userId, familyId);
        return new SchedulingAnalyticsDTO();
    }

    public async Task<SchedulingEfficiencyDTO> CalculateSchedulingEfficiencyAsync(
        int familyId, int userId, DateTime startDate, DateTime endDate)
    {
        await Task.CompletedTask;
        return new SchedulingEfficiencyDTO();
    }

    public async Task<IEnumerable<MemberSchedulingPatternDTO>> GetMemberSchedulingPatternsAsync(
        int familyId, int userId)
    {
        await Task.CompletedTask;
        return new List<MemberSchedulingPatternDTO>();
    }

    public async Task<ScheduleOptimizationResultDTO> OptimizeScheduleAsync(
        int familyId, int userId, ScheduleOptimizationRequestDTO request)
    {
        await Task.CompletedTask;
        return new ScheduleOptimizationResultDTO();
    }

    public async Task<AvailabilityPredictionDTO> PredictAvailabilityAsync(
        int familyId, int memberId, int userId, DateTime targetDate)
    {
        await Task.CompletedTask;
        return new AvailabilityPredictionDTO();
    }

    // Gamification tracking methods
    public async Task TrackSmartSchedulingUsageAsync(int userId, int familyId)
    {
        try
        {
            await _gamificationService.ProcessAchievementUnlocksAsync(userId, "smart_scheduling_used", familyId, new Dictionary<string, object> { { "familyId", familyId } });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error tracking smart scheduling usage for user {UserId}", userId);
        }
    }

    public async Task TrackConflictResolutionAsync(int userId, int familyId, string resolutionMethod)
    {
        try
        {
            await _gamificationService.ProcessAchievementUnlocksAsync(userId, "scheduling_conflict_resolved", familyId, new Dictionary<string, object> { { "familyId", familyId }, { "resolutionMethod", resolutionMethod } });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error tracking conflict resolution for user {UserId}", userId);
        }
    }

    public async Task TrackOptimalTimeSelectionAsync(int userId, int familyId, int eventId)
    {
        try
        {
            await _gamificationService.ProcessAchievementUnlocksAsync(userId, "optimal_time_selected", eventId, new Dictionary<string, object> { { "familyId", familyId }, { "eventId", eventId } });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error tracking optimal time selection for user {UserId}", userId);
        }
    }

    public async Task TrackBatchCalendarOperationAsync(int userId, int familyId, string operationType, int operationCount)
    {
        try
        {
            await _gamificationService.ProcessAchievementUnlocksAsync(userId, "batch_calendar_operation", familyId, new Dictionary<string, object> { { "familyId", familyId }, { "operationType", operationType }, { "operationCount", operationCount } });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error tracking batch calendar operation for user {UserId}", userId);
        }
    }

    public async Task TrackAvailabilityUpdateAsync(int userId, int familyId)
    {
        try
        {
            await _gamificationService.ProcessAchievementUnlocksAsync(userId, "availability_updated", familyId, new Dictionary<string, object> { { "familyId", familyId } });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error tracking availability update for user {UserId}", userId);
        }
    }

    public async Task TrackCalendarAnalyticsViewAsync(int userId, int familyId)
    {
        try
        {
            await _gamificationService.ProcessAchievementUnlocksAsync(userId, "calendar_analytics_viewed", familyId, new Dictionary<string, object> { { "familyId", familyId } });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error tracking calendar analytics view for user {UserId}", userId);
        }
    }
} 