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

public class FamilyMemberAvailability
{
    public int Id { get; set; }
    
    [Required]
    public int FamilyMemberId { get; set; }
    
    [Required]
    public DateTime StartTime { get; set; }
    
    [Required]
    public DateTime EndTime { get; set; }
    
    public bool IsRecurring { get; set; } = false;
    
    public string? RecurrencePattern { get; set; }
    
    public AvailabilityStatus Status { get; set; } = AvailabilityStatus.Available;
    
    [StringLength(200)]
    public string? Note { get; set; }
    
    public int? DayOfWeek { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    [ForeignKey("FamilyMemberId")]
    public FamilyMember? FamilyMember { get; set; }
}

public enum AvailabilityStatus
{
    Available,
    Busy,
    Tentative,
    OutOfOffice,
    WorkingRemotely
} 