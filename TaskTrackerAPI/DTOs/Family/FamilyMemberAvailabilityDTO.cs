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
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs.Family;

// DTO for retrieving availability
public class FamilyMemberAvailabilityDTO
{
    public int Id { get; set; }
    public int FamilyMemberId { get; set; }
    public string MemberName { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; }
    public string Status { get; set; } = "Available";
    public string? Note { get; set; }
    public int? DayOfWeek { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

// DTO for creating availability
public class CreateFamilyMemberAvailabilityDTO
{
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
}

// DTO for updating availability
public class UpdateFamilyMemberAvailabilityDTO
{
    public DateTime? StartTime { get; set; }
    
    public DateTime? EndTime { get; set; }
    
    public bool? IsRecurring { get; set; }
    
    public string? RecurrencePattern { get; set; }
    
    public AvailabilityStatus? Status { get; set; }
    
    [StringLength(200)]
    public string? Note { get; set; }
    
    public int? DayOfWeek { get; set; }
} 