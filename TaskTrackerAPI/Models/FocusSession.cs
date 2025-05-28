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
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models
{
    public class FocusSession
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int TaskId { get; set; }

        [Required]
        public DateTime StartTime { get; set; } = DateTime.UtcNow;

        public DateTime? EndTime { get; set; }

        public int DurationMinutes { get; set; } = 25; // Default to 25 minutes (Pomodoro)

        public bool IsCompleted { get; set; } = false;

        public string? Notes { get; set; }

        /// <summary>
        /// Quality rating of the focus session (1-5 stars)
        /// </summary>
        [Range(1, 5)]
        public int? SessionQualityRating { get; set; }

        /// <summary>
        /// Notes about what was accomplished during the session
        /// </summary>
        public string? CompletionNotes { get; set; }

        /// <summary>
        /// Task progress percentage before starting the session
        /// </summary>
        [Range(0, 100)]
        public int TaskProgressBefore { get; set; } = 0;

        /// <summary>
        /// Task progress percentage after completing the session
        /// </summary>
        [Range(0, 100)]
        public int TaskProgressAfter { get; set; } = 0;

        /// <summary>
        /// Whether the task was marked as completed during this session
        /// </summary>
        public bool TaskCompletedDuringSession { get; set; } = false;

        public SessionStatus Status { get; set; } = SessionStatus.InProgress;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("TaskId")]
        public virtual TaskItem TaskItem { get; set; } = null!;
        
        public virtual ICollection<Distraction> Distractions { get; set; } = new List<Distraction>();
    }

    public enum SessionStatus
    {
        InProgress,
        Completed,
        Interrupted,
        Paused
    }
} 