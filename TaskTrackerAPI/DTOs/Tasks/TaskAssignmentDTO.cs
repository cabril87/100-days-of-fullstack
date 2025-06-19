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
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Tasks
{
    /// <summary>
    /// Flexible DTO for task assignments - handles both individual and family assignments
    /// </summary>
    public class TaskAssignmentDTO
    {
        /// Unique identifier for the assignment
        public int Id { get; set; }

        /// Task ID being assigned
        [Required]
        public int TaskId { get; set; }

        /// User ID the task is assigned to
        [Required]
        public int AssignedToUserId { get; set; }

        /// User ID of who assigned the task
        [Required]
        public int AssignedByUserId { get; set; }

        /// Date when the task was assigned
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        /// Notes about the assignment
        [StringLength(1000)]
        public string? Notes { get; set; }

        /// Whether the assignment has been accepted
        public bool IsAccepted { get; set; } = false;

        /// Date when the assignment was accepted
        public DateTime? AcceptedAt { get; set; }

        // ✨ Enhanced properties for family collaboration
        public int? FamilyId { get; set; }
        public int? FamilyMemberId { get; set; } // For family member assignments
        public string? AssignedToUserName { get; set; }
        public string? AssignedByUserName { get; set; }
        public string? TaskTitle { get; set; }
        public string? TaskDescription { get; set; }
        public DateTime? TaskDueDate { get; set; }
        public string? TaskPriority { get; set; }
        public bool RequiresApproval { get; set; }
        public int? ApprovedByUserId { get; set; }
        public DateTime? ApprovedAt { get; set; }
        
        [StringLength(500)]
        public string? ApprovalNotes { get; set; }
        
        // ✨ Assignment type for flexibility
        public TaskAssignmentType AssignmentType { get; set; } = TaskAssignmentType.Individual;
        
        // ✨ Status tracking
        public TaskAssignmentStatus Status { get; set; } = TaskAssignmentStatus.Pending;
    }

    /// <summary>
    /// DTO for creating task assignments
    /// </summary>
    public class CreateTaskAssignmentDTO
    {
        /// Task ID to assign
        [Required]
        public int TaskId { get; set; }

        /// User ID to assign the task to
        [Required]
        public int AssignedToUserId { get; set; }

        /// Optional notes about the assignment
        [StringLength(1000)]
        public string? Notes { get; set; }
        
        public bool RequiresApproval { get; set; } = false;
        
        // ✨ Family context (optional)
        public int? FamilyId { get; set; }
        public int? FamilyMemberId { get; set; }
        
        public TaskAssignmentType AssignmentType { get; set; } = TaskAssignmentType.Individual;
    }

    /// <summary>
    /// DTO for batch task assignments
    /// </summary>
    public class BatchAssignmentRequestDTO
    {
        /// <summary>
        /// List of task IDs to assign
        /// </summary>
        [Required]
        public List<int> TaskIds { get; set; } = new List<int>();

        /// <summary>
        /// User ID to assign the tasks to
        /// </summary>
        [Required]
        public int AssignedToUserId { get; set; }

        /// <summary>
        /// Optional notes about the batch assignment
        /// </summary>
        [StringLength(1000)]
        public string? Notes { get; set; }
        
        public bool RequiresApproval { get; set; } = false;
        
        // ✨ Family context (optional)
        public int? FamilyId { get; set; }
        public int? FamilyMemberId { get; set; }
        
        public TaskAssignmentType AssignmentType { get; set; } = TaskAssignmentType.Individual;
    }

    /// <summary>
    /// Types of task assignments
    /// </summary>
    public enum TaskAssignmentType
    {
        Individual = 0,
        FamilyMember = 1,
        FamilyGroup = 2
    }

    /// <summary>
    /// Status of task assignments
    /// </summary>
    public enum TaskAssignmentStatus
    {
        Pending = 0,
        Accepted = 1,
        Declined = 2,
        Completed = 3,
        Approved = 4,
        Rejected = 5
    }
} 