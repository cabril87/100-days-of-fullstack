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

namespace TaskTrackerAPI.Models
{
    /// <summary>
    /// Model representing a task assignment to a user
    /// </summary>
    public class TaskAssignment
    {
        /// <summary>
        /// Unique identifier for the assignment
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// ID of the task being assigned
        /// </summary>
        [Required]
        public int TaskId { get; set; }

        /// <summary>
        /// ID of the user the task is assigned to
        /// </summary>
        [Required]
        public int AssignedToUserId { get; set; }

        /// <summary>
        /// ID of the user who assigned the task
        /// </summary>
        [Required]
        public int AssignedByUserId { get; set; }

        /// <summary>
        /// Date when the task was assigned
        /// </summary>
        [Required]
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Notes about the assignment
        /// </summary>
        [StringLength(200)]
        public string? Notes { get; set; }

        /// <summary>
        /// Whether the assignment has been accepted
        /// </summary>
        [Required]
        public bool IsAccepted { get; set; } = false;

        /// <summary>
        /// Date when the assignment was accepted
        /// </summary>
        public DateTime? AcceptedAt { get; set; }

        // Navigation properties
        [ForeignKey("TaskId")]
        public TaskItem? Task { get; set; }

        [ForeignKey("AssignedToUserId")]
        public User? AssignedToUser { get; set; }

        [ForeignKey("AssignedByUserId")]
        public User? AssignedByUser { get; set; }
    }
} 