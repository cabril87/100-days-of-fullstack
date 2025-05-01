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

namespace TaskTrackerAPI.DTOs.Tasks
{
    /// <summary>
    /// DTO for quick task creation with minimal required fields
    /// </summary>
    public class QuickTaskDTO
    {
        /// <summary>
        /// Title of the task (required)
        /// </summary>
        [Required]
        [StringLength(100, MinimumLength = 3)]
        public string Title { get; set; } = string.Empty;
        
        /// <summary>
        /// Optional description
        /// </summary>
        [StringLength(500)]
        public string? Description { get; set; }
        
        /// <summary>
        /// Due date (optional, defaults to today if not provided)
        /// </summary>
        public DateTime? DueDate { get; set; } = DateTime.Today;
        
        /// <summary>
        /// Priority (optional, defaults to Medium (1))
        /// </summary>
        public int? Priority { get; set; } = 1; // 0=Low, 1=Medium, 2=High, 3=Urgent
    }
} 