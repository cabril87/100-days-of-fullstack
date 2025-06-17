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

namespace TaskTrackerAPI.DTOs.Boards;

/// <summary>
/// DTO for WIP limit violation events sent via SignalR
/// </summary>
public class WipLimitViolationDTO
{
    /// <summary>
    /// ID of the board where the violation occurred
    /// </summary>
    public int BoardId { get; set; }

    /// <summary>
    /// ID of the column where the violation occurred
    /// </summary>
    public int ColumnId { get; set; }

    /// <summary>
    /// Name of the column where the violation occurred
    /// </summary>
    public string ColumnName { get; set; } = string.Empty;

    /// <summary>
    /// Current number of tasks in the column
    /// </summary>
    public int CurrentCount { get; set; }

    /// <summary>
    /// WIP limit for the column
    /// </summary>
    public int WipLimit { get; set; }

    /// <summary>
    /// Timestamp when the violation occurred
    /// </summary>
    public DateTime Timestamp { get; set; }
} 