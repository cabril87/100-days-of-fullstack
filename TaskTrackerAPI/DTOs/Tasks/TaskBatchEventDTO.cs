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

namespace TaskTrackerAPI.DTOs.Tasks;

/// <summary>
/// DTO for real-time batch task events sent via SignalR
/// </summary>
public class TaskBatchEventDTO
{
    /// <summary>
    /// Type of batch event (TaskBatchUpdate)
    /// </summary>
    public string EventType { get; set; } = string.Empty;

    /// <summary>
    /// ID of the user who triggered the batch operation
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// List of task updates in the batch operation
    /// </summary>
    public List<TaskStatusUpdateResponseDTO> Updates { get; set; } = new List<TaskStatusUpdateResponseDTO>();

    /// <summary>
    /// Timestamp when the batch operation occurred
    /// </summary>
    public DateTime Timestamp { get; set; }
} 