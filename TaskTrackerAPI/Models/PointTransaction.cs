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

public class PointTransaction
{
    public int Id { get; set; }
    
    [Required]
    public int UserId { get; set; }
    
    [Required]
    public int Points { get; set; } // Positive for earning, negative for spending
    
    [Required]
    [StringLength(50)]
    public string TransactionType { get; set; } = string.Empty;
    
    [StringLength(200)]
    public string Description { get; set; } = string.Empty;
    
    public int? TaskId { get; set; } // For task-related transactions
    
    public int? TemplateId { get; set; } // For template purchases
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;
    
    [ForeignKey("TaskId")]
    public virtual TaskItem? Task { get; set; }
    
    [ForeignKey("TemplateId")]
    public virtual TaskTemplate? Template { get; set; }
} 