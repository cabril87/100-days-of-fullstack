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

namespace TaskTrackerAPI.DTOs.Tasks;

/// <summary>
/// DTO for representing productivity data for a specific period
/// </summary>
public class ProductivityPeriodDTO
{
    /// <summary>
    /// The period identifier (week number, month, etc.)
    /// </summary>
    public int PeriodNumber { get; set; }
    
    /// <summary>
    /// Number of tasks completed in this period
    /// </summary>
    public int CompletedTasks { get; set; }
} 