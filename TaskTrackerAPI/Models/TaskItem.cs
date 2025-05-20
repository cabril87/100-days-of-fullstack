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
// Models/TaskItem.cs (formerly Task.cs)
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models;

public class TaskItem
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    public TaskItemStatus Status { get; set; } = TaskItemStatus.NotStarted;

    public DateTime? DueDate { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? CompletedAt { get; set; }

    public bool IsCompleted { get; set; } = false;

    [MaxLength(50)]
    public string Priority { get; set; } = "Medium";

    [Required]
    public int UserId { get; set; }

    public int? CategoryId { get; set; }

    public int? EstimatedTimeMinutes { get; set; }

    public int? BoardId { get; set; }

    public string? BoardColumn { get; set; }

    public int? BoardOrder { get; set; }

    public double? PositionX { get; set; }

    public double? PositionY { get; set; }

    public int? AssignedToId { get; set; }

    public int? AssignedToFamilyMemberId { get; set; }

    public bool IsRecurring { get; set; } = false;

    public string? RecurringPattern { get; set; }

    public DateTime? LastRecurrence { get; set; }

    public DateTime? NextRecurrence { get; set; }

    public int? AssignedByUserId { get; set; }
    public int? FamilyId { get; set; }
    public bool RequiresApproval { get; set; } = false;
    public int? ApprovedByUserId { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? AssignedToName { get; set; }

    // For optimistic concurrency
    [ConcurrencyCheck]
    public long Version { get; set; } = 1;

    // Navigation properties
    [ForeignKey("UserId")]
    public User? User { get; set; }

    [ForeignKey("CategoryId")]
    public Category? Category { get; set; }

    [ForeignKey("BoardId")]
    public Board? Board { get; set; }

    [ForeignKey("AssignedToId")]
    public User? AssignedTo { get; set; }

    [ForeignKey("AssignedToFamilyMemberId")]
    public FamilyMember? AssignedToFamilyMember { get; set; }

    [ForeignKey("AssignedByUserId")]
    public virtual User? AssignedByUser { get; set; }

    [ForeignKey("ApprovedByUserId")]
    public virtual User? ApprovedByUser { get; set; }

    [ForeignKey("FamilyId")]
    public virtual Family? Family { get; set; }

    // Collection of checklist items (sub-tasks)
    public virtual ICollection<ChecklistItem>? ChecklistItems { get; set; }
}