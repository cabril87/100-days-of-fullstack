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
    public class FocusSessionCreateDto
    {
        [Required]
        public int TaskId { get; set; }
        
        public int DurationMinutes { get; set; } = 25; // Default to 25 minutes (Pomodoro)
        
        public string? Notes { get; set; }
        
        /// <summary>
        /// If true, will automatically end any existing active session and start a new one.
        /// If false (default), will return an error if there's already an active session.
        /// </summary>
        public bool ForceStart { get; set; } = false;
    }
} 