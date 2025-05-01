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
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models;

public class FamilyCalendarEvent
{
    public int Id { get; set; }
    
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
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    [Required]
    public int FamilyId { get; set; }
    
    [Required]
    public int CreatedById { get; set; }
    
    // Navigation properties
    [ForeignKey("FamilyId")]
    public Family? Family { get; set; }
    
    [ForeignKey("CreatedById")]
    public User? CreatedByUser { get; set; }
    
    public List<FamilyEventAttendee> Attendees { get; set; } = new();
    
    public List<FamilyEventReminder> Reminders { get; set; } = new();
}

public enum EventType
{
    General,
    Birthday,
    Holiday,
    Meeting,
    Appointment,
    Activity,
    Task,
    Other
} 