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

namespace TaskTrackerAPI.Models;

public class WorkflowStep
{
    public int Id { get; set; }
    
    [Required]
    public int TemplateId { get; set; }
    
    public int StepOrder { get; set; } = 0;
    
    [Required]
    [StringLength(50)]
    public string StepType { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [StringLength(2000)]
    public string? Configuration { get; set; }
    
    [StringLength(1000)]
    public string? Conditions { get; set; }
    
    public bool IsRequired { get; set; } = true;
    
    public bool IsActive { get; set; } = true;
    
    public int EstimatedDurationMinutes { get; set; } = 0;
    
    [StringLength(500)]
    public string? Dependencies { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public virtual TaskTemplate? Template { get; set; }
}

public enum WorkflowStepType
{
    CreateTask,
    SendNotification,
    UpdateStatus,
    AssignUser,
    SetDueDate,
    AddTag,
    CreateReminder,
    ConditionalBranch,
    WaitForCompletion,
    TriggerAutomation
} 