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

public class TaskAutomationRule
{
    public int Id { get; set; }
    
    [Required]
    public int TemplateId { get; set; }
    
    [Required]
    [StringLength(50)]
    public string TriggerType { get; set; } = string.Empty;
    
    [StringLength(2000)]
    public string? Conditions { get; set; }
    
    [Required]
    [StringLength(2000)]
    public string Actions { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string? Name { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public int Priority { get; set; } = 0;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    public DateTime? LastTriggered { get; set; }
    
    public int TriggerCount { get; set; } = 0;
    
    public decimal SuccessRate { get; set; } = 0.0m;
    
    // Navigation properties
    public virtual TaskTemplate? Template { get; set; }
}

public enum AutomationTriggerType
{
    TaskCreated,
    TaskCompleted,
    TaskOverdue,
    DateSchedule,
    CalendarEvent,
    PatternRecognition,
    UserAction,
    TimeInterval,
    ConditionalLogic
} 