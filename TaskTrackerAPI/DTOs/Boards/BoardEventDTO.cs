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
/// DTO for real-time board events sent via SignalR
/// </summary>
public class BoardEventDTO
{
    /// <summary>
    /// Type of board event (UserJoinedBoard, UserLeftBoard, ColumnUpdated)
    /// </summary>
    public string EventType { get; set; } = string.Empty;

    /// <summary>
    /// ID of the board where the event occurred
    /// </summary>
    public int BoardId { get; set; }

    /// <summary>
    /// ID of the user involved in the event
    /// </summary>
    public int? UserId { get; set; }

    /// <summary>
    /// Username of the user involved in the event
    /// </summary>
    public string? Username { get; set; }

    /// <summary>
    /// Additional data for the event (column data, etc.)
    /// </summary>
    public object? Data { get; set; }

    /// <summary>
    /// Timestamp when the event occurred
    /// </summary>
    public DateTime Timestamp { get; set; }
} 