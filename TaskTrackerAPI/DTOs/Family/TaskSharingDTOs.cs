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

namespace TaskTrackerAPI.DTOs.Family
{
    /// <summary>
    /// DTO for approving a completed task
    /// </summary>
    public class TaskApprovalDTO
    {
        /// <summary>
        /// ID of the task to approve
        /// </summary>
        [Required]
        public int TaskId { get; set; }

        /// <summary>
        /// Optional comment about the task approval
        /// </summary>
        [StringLength(500)]
        public string? ApprovalComment { get; set; }
    }

    /// <summary>
    /// DTO for family task items
    /// </summary>
    public class FamilyTaskItemDTO
    {
        /// <summary>
        /// Task ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Task title
        /// </summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Task description
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Task status
        /// </summary>
        public string Status { get; set; } = string.Empty;

        /// <summary>
        /// Task due date
        /// </summary>
        public DateTime? DueDate { get; set; }

        /// <summary>
        /// Task priority
        /// </summary>
        public string Priority { get; set; } = "Medium";

        /// <summary>
        /// ID of the family member assigned to the task
        /// </summary>
        public int? AssignedToFamilyMemberId { get; set; }

        /// <summary>
        /// Name of the family member assigned to the task
        /// </summary>
        public string? AssignedToName { get; set; }

        /// <summary>
        /// ID of the user who assigned the task
        /// </summary>
        public int? AssignedByUserId { get; set; }

        /// <summary>
        /// Name of the user who assigned the task
        /// </summary>
        public string? AssignedByName { get; set; }

        /// <summary>
        /// Username of the user who assigned the task (used for mapping)
        /// </summary>
        public string? AssignedByUserName { get; set; }

        /// <summary>
        /// Username of the family member assigned to the task (used for mapping)
        /// </summary>
        public string? AssignedToUserName { get; set; }

        /// <summary>
        /// Whether the task requires approval when completed
        /// </summary>
        public bool RequiresApproval { get; set; }

        /// <summary>
        /// ID of the user who approved the task
        /// </summary>
        public int? ApprovedByUserId { get; set; }

        /// <summary>
        /// Username of the user who approved the task (used for mapping)
        /// </summary>
        public string? ApprovedByUserName { get; set; }

        /// <summary>
        /// Date the task was approved
        /// </summary>
        public DateTime? ApprovedAt { get; set; }

        /// <summary>
        /// Family ID associated with the task
        /// </summary>
        public int? FamilyId { get; set; }

        /// <summary>
        /// Name of the family (used for mapping)
        /// </summary>
        public string? FamilyName { get; set; }

        /// <summary>
        /// Whether the task is approved (derived property)
        /// </summary>
        public bool IsApproved { get; set; }

        /// <summary>
        /// Date the task was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Date the task was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }

        /// <summary>
        /// Date the task was completed
        /// </summary>
        public DateTime? CompletedAt { get; set; }

        /// <summary>
        /// Whether the task is completed
        /// </summary>
        public bool IsCompleted { get; set; }
    }
} 