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

namespace TaskTrackerAPI.DTOs.Focus;

/// <summary>
/// DTO for focus session updates
/// </summary>
public class FocusSessionUpdateDTO
{
    public int SessionId { get; set; }
    public int MemberId { get; set; }
    public string Status { get; set; } = string.Empty; // "InProgress", "Paused", "Completed", "Cancelled"
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public int? DurationMinutes { get; set; }
    public string? TaskTitle { get; set; }
    public int? QualityRating { get; set; }
    public bool BlocksAvailability { get; set; }
}

/// <summary>
/// DTO for optimal focus time suggestions
/// </summary>
public class OptimalFocusTimeDTO
{
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int ConfidenceScore { get; set; }
    public string Reasoning { get; set; } = string.Empty;
    public string QualityLevel { get; set; } = string.Empty; // "Optimal", "Good", "Fair"
    public bool IsQuietTime { get; set; }
    public int ConflictCount { get; set; }
    public string[] BlockingEvents { get; set; } = Array.Empty<string>();
}

/// <summary>
/// DTO for family quiet time requests
/// </summary>
public class FamilyQuietTimeRequestDTO
{
    public int RequestedBy { get; set; }
    public string RequesterName { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Reason { get; set; } = string.Empty;
    public int Priority { get; set; } // 1-5
    public bool RequireConfirmation { get; set; }
    public int[] AffectedMembers { get; set; } = Array.Empty<int>();
    public DateTime RequestedAt { get; set; }
}

/// <summary>
/// DTO for quiet time responses
/// </summary>
public class QuietTimeResponseDTO
{
    public int MemberId { get; set; }
    public string MemberName { get; set; } = string.Empty;
    public string Response { get; set; } = string.Empty; // "accepted", "declined", "conditional"
    public string? Note { get; set; }
    public DateTime? AlternativeStartTime { get; set; }
    public DateTime? AlternativeEndTime { get; set; }
    public DateTime ResponseAt { get; set; }
}

/// <summary>
/// DTO for focus availability blocks
/// </summary>
public class FocusAvailabilityBlockDTO
{
    public string Id { get; set; } = string.Empty;
    public int MemberId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string TaskTitle { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // "scheduled", "active", "completed", "cancelled"
    public string Priority { get; set; } = string.Empty; // "high", "medium", "low"
    public bool AllowInterruptions { get; set; }
    public int? SessionId { get; set; }
}

/// <summary>
/// DTO for focus time analytics
/// </summary>
public class FocusTimeAnalyticsDTO
{
    public int MemberId { get; set; }
    public string MemberName { get; set; } = string.Empty;
    public BestTimeSlotDTO[] BestTimes { get; set; } = Array.Empty<BestTimeSlotDTO>();
    public ProductivityPatternDTO[] ProductivityPatterns { get; set; } = Array.Empty<ProductivityPatternDTO>();
    public ConflictFrequencyDTO[] ConflictFrequency { get; set; } = Array.Empty<ConflictFrequencyDTO>();
    public string[] Recommendations { get; set; } = Array.Empty<string>();
    public DateTime AnalyzedAt { get; set; }
    public string AnalysisPeriod { get; set; } = string.Empty;
}

/// <summary>
/// DTO for best time slots analysis
/// </summary>
public class BestTimeSlotDTO
{
    public int Hour { get; set; }
    public double SuccessRate { get; set; }
    public double AverageQuality { get; set; }
    public int SessionCount { get; set; }
    public string TimeLabel { get; set; } = string.Empty;
}

/// <summary>
/// DTO for productivity patterns
/// </summary>
public class ProductivityPatternDTO
{
    public int DayOfWeek { get; set; }
    public string DayName { get; set; } = string.Empty;
    public double AverageEfficiency { get; set; }
    public int SessionCount { get; set; }
    public double AverageSessionLength { get; set; }
}

/// <summary>
/// DTO for conflict frequency analysis
/// </summary>
public class ConflictFrequencyDTO
{
    public string TimeSlot { get; set; } = string.Empty;
    public int ConflictCount { get; set; }
    public string[] CommonConflictTypes { get; set; } = Array.Empty<string>();
    public double AvoidanceRecommendation { get; set; }
} 