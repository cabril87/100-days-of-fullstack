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
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs.Focus
{
    /// <summary>
    /// DTO for requesting a new focus session
    /// </summary>
    public class FocusRequestDTO
    {
        public int TaskId { get; set; }
        public string Notes { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for focus session information
    /// </summary>
    public class FocusSessionDTO
    {
        public int Id { get; set; }
        public int TaskId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string Notes { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for creating a distraction record
    /// </summary>
    public class DistractionCreateDTO
    {
        public int SessionId { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for distraction information
    /// </summary>
    public class DistractionDTO
    {
        public int Id { get; set; }
        public int FocusSessionId { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }

    /// <summary>
    /// DTO for focus statistics
    /// </summary>
    public class FocusStatisticsDTO
    {
        public int TotalMinutesFocused { get; set; }
        public int SessionCount { get; set; }
        public int DistractionCount { get; set; }
        public Dictionary<string, int> DistractionsByCategory { get; set; } = new Dictionary<string, int>();
        public int AverageSessionLength { get; set; }
        public Dictionary<string, int> DailyFocusMinutes { get; set; } = new Dictionary<string, int>();
    }
} 