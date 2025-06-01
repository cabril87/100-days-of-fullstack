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

public class TemplateUsageAnalytics
{
    public int Id { get; set; }
    
    [Required]
    public int TemplateId { get; set; }
    
    [Required]
    public int UserId { get; set; }
    
    public DateTime UsedDate { get; set; } = DateTime.UtcNow;
    
    public int CompletionTimeMinutes { get; set; } = 0;
    
    public bool Success { get; set; } = true;
    
    [StringLength(500)]
    public string? Notes { get; set; }
    
    public int TasksCreated { get; set; } = 0;
    
    public int TasksCompleted { get; set; } = 0;
    
    public decimal EfficiencyScore { get; set; } = 0.0m;
    
    [StringLength(1000)]
    public string? Feedback { get; set; }
    
    public DateTime? CompletedAt { get; set; }
    
    // Navigation properties
    public virtual TaskTemplate? Template { get; set; }
    
    public virtual User? User { get; set; }
} 