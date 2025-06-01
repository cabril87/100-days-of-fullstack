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
using TaskTrackerAPI.DTOs.Family;

namespace TaskTrackerAPI.DTOs.User;

// Global calendar view for a user across all families
public class UserGlobalCalendarDTO
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public List<UserFamilyCalendarSummaryDTO> Families { get; set; } = new();
    public List<FamilyCalendarEventWithFamilyDTO> AllEvents { get; set; } = new();
    public UserCalendarStatisticsDTO Statistics { get; set; } = null!;
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}

// Calendar event with family context information
public class FamilyCalendarEventWithFamilyDTO : FamilyCalendarEventDTO
{
    public FamilyCalendarSummaryDTO Family { get; set; } = null!;
    public string FamilyColor { get; set; } = "#3b82f6";
    public bool IsUserCreator { get; set; }
    public bool IsUserAttendee { get; set; }
    public string UserRole { get; set; } = "Member";
}

// Summary information about a family's calendar
public class UserFamilyCalendarSummaryDTO
{
    public int FamilyId { get; set; }
    public string FamilyName { get; set; } = string.Empty;
    public string FamilyDescription { get; set; } = string.Empty;
    public string UserRole { get; set; } = "Member";
    public string FamilyColor { get; set; } = "#3b82f6";
    public int TotalEvents { get; set; }
    public int UpcomingEvents { get; set; }
    public int TodayEvents { get; set; }
    public int UserCreatedEvents { get; set; }
    public int UserAttendingEvents { get; set; }
    public DateTime? NextEventDate { get; set; }
    public DateTime LastActivity { get; set; }
    public bool HasPermissionToCreateEvents { get; set; } = true;
    public bool HasPermissionToManageEvents { get; set; }
}

// Simplified family info for event context
public class FamilyCalendarSummaryDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Color { get; set; } = "#3b82f6";
    public int MemberCount { get; set; }
}

// User's availability information
public class UserAvailabilityDTO
{
    public int UserId { get; set; }
    public DateTime Date { get; set; }
    public bool IsAvailable { get; set; } = true;
    public List<TimeSlotDTO> BusySlots { get; set; } = new();
    public List<TimeSlotDTO> AvailableSlots { get; set; } = new();
    public List<FamilyCalendarEventWithFamilyDTO> ConflictingEvents { get; set; } = new();
    public string TimeZone { get; set; } = "UTC";
}

// Time slot representation
public class TimeSlotDTO
{
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = "Available"; // Available, Busy, Conflict
    public int? FamilyId { get; set; }
    public int? EventId { get; set; }
}

// Calendar conflict information
public class CalendarConflictDTO
{
    public int Id { get; set; }
    public DateTime ConflictDate { get; set; }
    public DateTime ConflictStartTime { get; set; }
    public DateTime ConflictEndTime { get; set; }
    public List<FamilyCalendarEventWithFamilyDTO> ConflictingEvents { get; set; } = new();
    public string ConflictType { get; set; } = "TimeOverlap"; // TimeOverlap, DoubleBooking, ResourceConflict
    public string Severity { get; set; } = "Medium"; // Low, Medium, High, Critical
    public string Description { get; set; } = string.Empty;
    public bool IsResolved { get; set; }
    public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
}

// Comprehensive calendar statistics for a user
public class UserCalendarStatisticsDTO
{
    public int UserId { get; set; }
    public int TotalFamilies { get; set; }
    public int TotalEvents { get; set; }
    public int UpcomingEvents { get; set; }
    public int PastEvents { get; set; }
    public int TodayEvents { get; set; }
    public int ThisWeekEvents { get; set; }
    public int ThisMonthEvents { get; set; }
    public int EventsCreatedByUser { get; set; }
    public int EventsUserAttending { get; set; }
    public int ActiveConflicts { get; set; }
    public int ResolvedConflicts { get; set; }
    
    // Family-specific stats
    public List<FamilyStatisticsSummaryDTO> FamilyStats { get; set; } = new();
    
    // Event type distribution
    public Dictionary<string, int> EventTypeDistribution { get; set; } = new();
    
    // Activity patterns
    public Dictionary<string, int> DailyActivityPattern { get; set; } = new(); // Day of week -> count
    public Dictionary<int, int> HourlyActivityPattern { get; set; } = new(); // Hour -> count
    public Dictionary<string, int> MonthlyActivityPattern { get; set; } = new(); // Month -> count
    
    // Performance metrics
    public double AverageEventsPerFamily { get; set; }
    public double AverageEventsPerWeek { get; set; }
    public double EventAttendanceRate { get; set; }
    public double EventCreationRate { get; set; }
    
    // Recent activity
    public DateTime? LastEventCreated { get; set; }
    public DateTime? LastEventAttended { get; set; }
    public DateTime? NextUpcomingEvent { get; set; }
    
    // Productivity insights
    public int BusiestDayOfWeek { get; set; } // 0 = Sunday, 6 = Saturday
    public int BusiestHourOfDay { get; set; } // 0-23
    public string BusiestFamily { get; set; } = string.Empty;
    public string MostCommonEventType { get; set; } = string.Empty;
    
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}

// Family-specific statistics summary
public class FamilyStatisticsSummaryDTO
{
    public int FamilyId { get; set; }
    public string FamilyName { get; set; } = string.Empty;
    public string FamilyColor { get; set; } = "#3b82f6";
    public int TotalEvents { get; set; }
    public int UpcomingEvents { get; set; }
    public int UserCreatedEvents { get; set; }
    public int UserAttendingEvents { get; set; }
    public double ParticipationRate { get; set; }
    public DateTime? LastActivity { get; set; }
    public string MostActiveEventType { get; set; } = string.Empty;
} 