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

namespace TaskTrackerAPI.DTOs.Tasks
{
    public class TaskProgressUpdateDto
    {
        /// <summary>
        /// Progress percentage of task completion (0-100)
        /// </summary>
        [Required]
        [Range(0, 100, ErrorMessage = "Progress percentage must be between 0 and 100")]
        public int ProgressPercentage { get; set; }

        /// <summary>
        /// Optional notes about the progress update
        /// </summary>
        [MaxLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
        public string? Notes { get; set; }
    }
} 