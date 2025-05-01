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
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models;

public class FamilyEventReminder
{
    public int Id { get; set; }
    
    [Required]
    public int EventId { get; set; }
    
    [Required]
    public int TimeBeforeInMinutes { get; set; }
    
    public ReminderMethod ReminderMethod { get; set; } = ReminderMethod.Notification;
    
    public bool Sent { get; set; } = false;
    
    public DateTime? SentAt { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    [ForeignKey("EventId")]
    public FamilyCalendarEvent? Event { get; set; }
}

public enum ReminderMethod
{
    Notification,
    Email,
    SMS,
    All
} 