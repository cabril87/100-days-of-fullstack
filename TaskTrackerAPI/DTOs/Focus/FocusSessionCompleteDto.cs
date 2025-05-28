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
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs
{
    public class FocusSessionCompleteDto
    {
        /// <summary>
        /// Quality rating of the focus session (1-5 stars)
        /// </summary>
        [Range(1, 5, ErrorMessage = "Session quality rating must be between 1 and 5")]
        public int? SessionQualityRating { get; set; }

        /// <summary>
        /// Notes about what was accomplished during the session
        /// </summary>
        [MaxLength(1000, ErrorMessage = "Completion notes cannot exceed 1000 characters")]
        public string? CompletionNotes { get; set; }

        /// <summary>
        /// Task progress percentage after completing the session (0-100)
        /// </summary>
        [Range(0, 100, ErrorMessage = "Task progress must be between 0 and 100")]
        public int? TaskProgressAfter { get; set; }

        /// <summary>
        /// Whether the task was marked as completed during this session
        /// </summary>
        public bool TaskCompletedDuringSession { get; set; } = false;
    }
} 