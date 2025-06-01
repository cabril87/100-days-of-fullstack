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

namespace TaskTrackerAPI.DTOs.Boards;

/// <summary>
/// DTO for column statistics and analytics
/// </summary>
public class ColumnStatisticsDTO
{
    public int ColumnId { get; set; }
    public string ColumnName { get; set; } = string.Empty;
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int OverdueTasks { get; set; }
    public decimal AverageTaskAge { get; set; }
    public decimal AverageTimeInColumn { get; set; } // In hours
    public int TasksMovedIn { get; set; } // Today
    public int TasksMovedOut { get; set; } // Today
    public decimal CompletionRate => TotalTasks > 0 ? (decimal)CompletedTasks / TotalTasks * 100 : 0;
    public Dictionary<string, int> TasksByPriority { get; set; } = new Dictionary<string, int>();
    public Dictionary<string, int> TasksByCategory { get; set; } = new Dictionary<string, int>();
    public DateTime? OldestTaskDate { get; set; }
    public DateTime? NewestTaskDate { get; set; }
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
} 