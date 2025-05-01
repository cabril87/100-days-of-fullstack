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

public class Notification
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int UserId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(500)]
    public string Message { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string NotificationType { get; set; } = string.Empty;
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [Required]
    public bool IsRead { get; set; } = false;
    
    public DateTime? ReadAt { get; set; }
    
    public bool IsImportant { get; set; } = false;
    
    public NotificationType? Type { get; set; }
    
    public int? RelatedEntityId { get; set; }
    
    [MaxLength(50)]
    public string RelatedEntityType { get; set; } = string.Empty;
    
    public int? CreatedByUserId { get; set; }
    
    // Navigation properties
    [ForeignKey("UserId")]
    public User? User { get; set; }
    
    [ForeignKey("CreatedByUserId")]
    public User? CreatedBy { get; set; }
}

public enum NotificationType
{
    Info,
    Success,
    Warning,
    Error,
    TaskDue,
    TaskCompleted,
    TaskReminder,
    BoardInvite,
    FamilyAssignment,
    SystemUpdate
} 