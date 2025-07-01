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

namespace TaskTrackerAPI.DTOs.Focus;

/// <summary>
/// DTO for clear focus history operation results
/// </summary>
public class ClearHistoryResultDto
{
    /// <summary>
    /// Number of focus sessions deleted
    /// </summary>
    public int DeletedSessionCount { get; set; }

    /// <summary>
    /// Total minutes of focus time deleted
    /// </summary>
    public int TotalMinutesDeleted { get; set; }

    /// <summary>
    /// Date filter applied (if any)
    /// </summary>
    public DateTime? DateFilter { get; set; }

    /// <summary>
    /// When the clear operation was performed
    /// </summary>
    public DateTime ClearedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Total hours deleted (computed property)
    /// </summary>
    public double TotalHoursDeleted => TotalMinutesDeleted / 60.0;
} 