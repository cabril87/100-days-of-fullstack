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
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Family;

// Smart Scheduling DTOs
public class OptimalTimeSlotDTO
{
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public double ConfidenceScore { get; set; } // 0-100
    public string AvailabilityQuality { get; set; } = "Good"; // Optimal, Good, Fair, Poor
    public int ConflictCount { get; set; }
    public IEnumerable<AvailableMemberDTO> AvailableMembers { get; set; } = new List<AvailableMemberDTO>();
    public string Reasoning { get; set; } = string.Empty;
}

public class AvailableMemberDTO
{
    public int MemberId { get; set; }
    public string MemberName { get; set; } = string.Empty;
    public string AvailabilityStatus { get; set; } = "Available"; // Available, Busy, Tentative
}

public class SmartSchedulingSuggestionDTO
{
    public OptimalTimeSlotDTO TimeSlot { get; set; } = new();
    public double Confidence { get; set; }
    public IEnumerable<SchedulingConflictDTO> PotentialConflicts { get; set; } = new List<SchedulingConflictDTO>();
    public IEnumerable<AvailableMemberDTO> Attendees { get; set; } = new List<AvailableMemberDTO>();
    public string Reasoning { get; set; } = string.Empty;
    public bool RequiresRescheduling { get; set; }
}

public class SchedulingPreferencesDTO
{
    [Required]
    public TimeSpan Duration { get; set; }
    
    [Required]
    public IEnumerable<int> RequiredAttendeeIds { get; set; } = new List<int>();
    
    public IEnumerable<int> OptionalAttendeeIds { get; set; } = new List<int>();
    
    public DateTime? PreferredStartDate { get; set; }
    public DateTime? PreferredEndDate { get; set; }
    
    public IEnumerable<TimeRangeDTO> PreferredTimeRanges { get; set; } = new List<TimeRangeDTO>();
    
    public int MaxSuggestions { get; set; } = 5;
    public double MinConfidenceThreshold { get; set; } = 0.7;
    public bool AllowConflicts { get; set; } = false;
}

public class TimeRangeDTO
{
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public DayOfWeek? DayOfWeek { get; set; }
}

// Conflict Detection DTOs
public class SchedulingConflictDTO
{
    public int Id { get; set; }
    public string ConflictType { get; set; } = string.Empty; // TimeOverlap, ResourceConflict, AvailabilityConflict
    public string Severity { get; set; } = "Medium"; // Minor, Major, Critical
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public IEnumerable<ConflictingEventDTO> ConflictingEvents { get; set; } = new List<ConflictingEventDTO>();
    public IEnumerable<int> AffectedMemberIds { get; set; } = new List<int>();
    public string Description { get; set; } = string.Empty;
    public DateTime DetectedAt { get; set; }
    public bool IsResolved { get; set; }
}

public class ConflictingEventDTO
{
    public int EventId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public IEnumerable<int> AttendeeIds { get; set; } = new List<int>();
}

public class ConflictResolutionDTO
{
    public int Id { get; set; }
    public string ResolutionType { get; set; } = string.Empty; // Reschedule, Split, Cancel, Override
    public string Description { get; set; } = string.Empty;
    public int ImpactScore { get; set; } // 1-10 scale
    public bool AutoApplicable { get; set; }
    public IEnumerable<ResolutionActionDTO> Actions { get; set; } = new List<ResolutionActionDTO>();
    public DateTime? SuggestedStartTime { get; set; }
    public DateTime? SuggestedEndTime { get; set; }
}

public class ResolutionActionDTO
{
    public string ActionType { get; set; } = string.Empty; // Move, Cancel, Modify, Split
    public int EventId { get; set; }
    public string Description { get; set; } = string.Empty;
    public Dictionary<string, object> Parameters { get; set; } = new();
}

public class ConflictResolutionRequestDTO
{
    [Required]
    public int ConflictId { get; set; }
    
    [Required]
    public string ResolutionType { get; set; } = string.Empty;
    
    public IEnumerable<ResolutionActionDTO> Actions { get; set; } = new List<ResolutionActionDTO>();
    
    public string Notes { get; set; } = string.Empty;
}

// Availability Matrix DTOs
public class AvailabilityMatrixDTO
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public TimeSpan Granularity { get; set; }
    public IEnumerable<FamilyMemberSummaryDTO> Members { get; set; } = new List<FamilyMemberSummaryDTO>();
    public IEnumerable<TimeSlotAvailabilityDTO> TimeSlots { get; set; } = new List<TimeSlotAvailabilityDTO>();
    public IEnumerable<OptimalTimeSlotDTO> OptimalSlots { get; set; } = new List<OptimalTimeSlotDTO>();
    public MatrixMetadataDTO Metadata { get; set; } = new();
}

public class FamilyMemberSummaryDTO
{
    public int MemberId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public double AvailabilityScore { get; set; }
}

public class TimeSlotAvailabilityDTO
{
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public IEnumerable<MemberAvailabilityStatusDTO> MemberStatuses { get; set; } = new List<MemberAvailabilityStatusDTO>();
    public bool HasConflicts { get; set; }
    public int ConflictCount { get; set; }
    public string OverallAvailability { get; set; } = "Available"; // Available, Partial, Busy
}

public class MemberAvailabilityStatusDTO
{
    public int MemberId { get; set; }
    public string Status { get; set; } = "Available"; // Available, Busy, Tentative, OutOfOffice
    public IEnumerable<int> ConflictingEventIds { get; set; } = new List<int>();
}

public class MatrixMetadataDTO
{
    public int TotalTimeSlots { get; set; }
    public int ConflictFreeSlots { get; set; }
    public double ConflictRate { get; set; }
    public DateTime GeneratedAt { get; set; }
    public int TotalMembers { get; set; }
}

// Batch Operations DTOs
public class BatchCalendarOperationResultDTO
{
    public string OperationId { get; set; } = Guid.NewGuid().ToString();
    public string OperationType { get; set; } = string.Empty;
    public bool Success { get; set; }
    public int TotalItems { get; set; }
    public int SuccessfulItems { get; set; }
    public int FailedItems { get; set; }
    public IEnumerable<BatchItemResultDTO> Results { get; set; } = new List<BatchItemResultDTO>();
    public IEnumerable<SchedulingConflictDTO> DetectedConflicts { get; set; } = new List<SchedulingConflictDTO>();
    public DateTime ExecutedAt { get; set; } = DateTime.UtcNow;
    public TimeSpan ExecutionTime { get; set; }
}

public class BatchItemResultDTO
{
    public string ItemId { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string ErrorMessage { get; set; } = string.Empty;
    public int? CreatedEventId { get; set; }
    public FamilyCalendarEventDTO? UpdatedEvent { get; set; }
}

public class BulkUpdateEventRequestDTO
{
    [Required]
    public int EventId { get; set; }
    
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public bool? IsAllDay { get; set; }
    public string? Location { get; set; }
    public string? Color { get; set; }
    public string? EventType { get; set; }
    public IEnumerable<int>? AttendeeIds { get; set; }
}

public class BulkRescheduleRequestDTO
{
    [Required]
    public IEnumerable<int> EventIds { get; set; } = new List<int>();
    
    public TimeSpan? TimeOffset { get; set; }
    public DateTime? NewStartDate { get; set; }
    public DateTime? NewEndDate { get; set; }
    public bool PreserveRelativeTiming { get; set; } = true;
    public bool AllowConflicts { get; set; } = false;
    public bool FindOptimalTimes { get; set; } = false;
}

// Analytics DTOs
public class SchedulingAnalyticsDTO
{
    public double SchedulingEfficiency { get; set; } // 0-100
    public double ConflictRate { get; set; } // 0-100
    public IEnumerable<string> OptimalTimeSlots { get; set; } = new List<string>();
    public IEnumerable<MemberSchedulingPatternDTO> MemberPatterns { get; set; } = new List<MemberSchedulingPatternDTO>();
    public IEnumerable<AnalyticsRecommendationDTO> Recommendations { get; set; } = new List<AnalyticsRecommendationDTO>();
    public SchedulingTrendsDTO Trends { get; set; } = new();
    public DateTime AnalyzedPeriodStart { get; set; }
    public DateTime AnalyzedPeriodEnd { get; set; }
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}

public class MemberSchedulingPatternDTO
{
    public int MemberId { get; set; }
    public string MemberName { get; set; } = string.Empty;
    public IEnumerable<TimeRangeDTO> PreferredTimes { get; set; } = new List<TimeRangeDTO>();
    public IEnumerable<string> BusyPatterns { get; set; } = new List<string>();
    public double AvailabilityScore { get; set; }
    public int EventsCreated { get; set; }
    public int ConflictsGenerated { get; set; }
    public double ResponseRate { get; set; }
}

public class AnalyticsRecommendationDTO
{
    public string Type { get; set; } = string.Empty; // TimeOptimization, ConflictReduction, SchedulingPatterns
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Priority { get; set; } // 1-5
    public IEnumerable<string> ActionItems { get; set; } = new List<string>();
    public double PotentialImprovement { get; set; } // 0-100
}

public class SchedulingTrendsDTO
{
    public IEnumerable<TrendDataPointDTO> ConflictTrends { get; set; } = new List<TrendDataPointDTO>();
    public IEnumerable<TrendDataPointDTO> EfficiencyTrends { get; set; } = new List<TrendDataPointDTO>();
    public IEnumerable<TrendDataPointDTO> EventVolumeTrends { get; set; } = new List<TrendDataPointDTO>();
    public string TrendDirection { get; set; } = "Stable"; // Improving, Stable, Declining
}

public class TrendDataPointDTO
{
    public DateTime Date { get; set; }
    public double Value { get; set; }
    public string Label { get; set; } = string.Empty;
}

public class SchedulingEfficiencyDTO
{
    public double OverallEfficiency { get; set; }
    public double ConflictFreeRate { get; set; }
    public double OptimalTimeUsage { get; set; }
    public double MemberParticipationRate { get; set; }
    public IEnumerable<MemberEfficiencyDTO> MemberEfficiencies { get; set; } = new List<MemberEfficiencyDTO>();
    public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;
}

public class MemberEfficiencyDTO
{
    public int MemberId { get; set; }
    public string MemberName { get; set; } = string.Empty;
    public double PersonalEfficiency { get; set; }
    public int ConflictFreeStreak { get; set; }
    public DateTime? LastConflict { get; set; }
}

// Optimization DTOs
public class ScheduleOptimizationRequestDTO
{
    [Required]
    public DateTime StartDate { get; set; }
    
    [Required]
    public DateTime EndDate { get; set; }
    
    public IEnumerable<int> EventIds { get; set; } = new List<int>();
    public IEnumerable<OptimizationConstraintDTO> Constraints { get; set; } = new List<OptimizationConstraintDTO>();
    public string OptimizationGoal { get; set; } = "MinimizeConflicts"; // MinimizeConflicts, MaximizeEfficiency, BalanceWorkload
    public bool AllowRescheduling { get; set; } = true;
    public bool AllowCancellation { get; set; } = false;
}

public class OptimizationConstraintDTO
{
    public string Type { get; set; } = string.Empty; // TimeRange, MemberAvailability, EventPriority
    public Dictionary<string, object> Parameters { get; set; } = new();
}

public class ScheduleOptimizationResultDTO
{
    public bool Success { get; set; }
    public double ImprovementScore { get; set; }
    public IEnumerable<OptimizationActionDTO> RecommendedActions { get; set; } = new List<OptimizationActionDTO>();
    public SchedulingAnalyticsDTO BeforeAnalytics { get; set; } = new();
    public SchedulingAnalyticsDTO ProjectedAfterAnalytics { get; set; } = new();
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}

public class OptimizationActionDTO
{
    public string ActionType { get; set; } = string.Empty;
    public int EventId { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime? NewStartTime { get; set; }
    public DateTime? NewEndTime { get; set; }
    public double ImpactScore { get; set; }
}

public class AvailabilityPredictionDTO
{
    public int MemberId { get; set; }
    public DateTime TargetDate { get; set; }
    public string PredictedStatus { get; set; } = "Available";
    public double Confidence { get; set; }
    public IEnumerable<TimeRangeDTO> LikelyAvailableSlots { get; set; } = new List<TimeRangeDTO>();
    public IEnumerable<TimeRangeDTO> LikelyBusySlots { get; set; } = new List<TimeRangeDTO>();
    public string Reasoning { get; set; } = string.Empty;
    public DateTime PredictedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// DTO for availability updates
/// </summary>
public class AvailabilityUpdateDTO
{
    public int MemberId { get; set; }
    public DateTime Date { get; set; }
    public string TimeRange { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // "Available", "Busy", "Tentative", "OutOfOffice"
    public string? Reason { get; set; }
    public bool IsRecurring { get; set; }
}

/// <summary>
/// DTO for calendar notifications
/// </summary>
public class CalendarNotificationDTO
{
    public string NotificationType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty; // "Low", "Medium", "High", "Critical"
    public Dictionary<string, object> Data { get; set; } = new();
    public DateTime? ActionDeadline { get; set; }
    public bool RequiresAction { get; set; }
    public int? RelatedSessionId { get; set; }
    public int? RelatedEventId { get; set; }
} 