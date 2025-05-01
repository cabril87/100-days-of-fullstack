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
using TaskTrackerAPI.Models;
using TaskTrackerAPI.DTOs.User;

namespace TaskTrackerAPI.DTOs.Family;

// DTO for retrieving an event
public class FamilyCalendarEventDTO
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public bool IsAllDay { get; set; }
    public string? Location { get; set; }
    public string? Color { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; }
    public string EventType { get; set; } = "General";
    public int FamilyId { get; set; }
    public UserMinimalDTO CreatedBy { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<EventAttendeeDTO> Attendees { get; set; } = new();
    public List<EventReminderDTO> Reminders { get; set; } = new();
}

// DTO for creating an event
public class CreateFamilyCalendarEventDTO
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Title { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [Required]
    public DateTime StartTime { get; set; }
    
    [Required]
    public DateTime EndTime { get; set; }
    
    public bool IsAllDay { get; set; } = false;
    
    public string? Location { get; set; }
    
    public string? Color { get; set; }
    
    public bool IsRecurring { get; set; } = false;
    
    public string? RecurrencePattern { get; set; }
    
    public EventType EventType { get; set; } = EventType.General;
    
    [Required]
    public int FamilyId { get; set; }
    
    public List<int> AttendeeIds { get; set; } = new();
    
    public List<EventReminderCreateDTO> Reminders { get; set; } = new();
}

// DTO for updating an event
public class UpdateFamilyCalendarEventDTO
{
    [StringLength(100, MinimumLength = 2)]
    public string? Title { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public DateTime? StartTime { get; set; }
    
    public DateTime? EndTime { get; set; }
    
    public bool? IsAllDay { get; set; }
    
    public string? Location { get; set; }
    
    public string? Color { get; set; }
    
    public bool? IsRecurring { get; set; }
    
    public string? RecurrencePattern { get; set; }
    
    public EventType? EventType { get; set; }
    
    public List<int>? AttendeeIds { get; set; }
    
    public List<EventReminderCreateDTO>? Reminders { get; set; }
}

// DTO for attendee response
public class EventAttendeeDTO
{
    public int Id { get; set; }
    public int FamilyMemberId { get; set; }
    public string MemberName { get; set; } = string.Empty;
    public string Response { get; set; } = "NoResponse";
    public string? Note { get; set; }
}

// DTO for updating attendee response
public class UpdateAttendeeResponseDTO
{
    [Required]
    public int EventId { get; set; }
    
    [Required]
    public int FamilyMemberId { get; set; }
    
    [Required]
    public AttendeeResponse Response { get; set; }
    
    public string? Note { get; set; }
}

// DTO for event reminders
public class EventReminderDTO
{
    public int Id { get; set; }
    public int TimeBeforeInMinutes { get; set; }
    public string ReminderMethod { get; set; } = "Notification";
    public bool Sent { get; set; }
    public DateTime? SentAt { get; set; }
}

// DTO for creating event reminders
public class EventReminderCreateDTO
{
    [Required]
    [Range(1, 10080)] // From 1 minute to 1 week (in minutes)
    public int TimeBeforeInMinutes { get; set; } = 15;
    
    public ReminderMethod ReminderMethod { get; set; } = ReminderMethod.Notification;
} 