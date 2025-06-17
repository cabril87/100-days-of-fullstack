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

namespace TaskTrackerAPI.DTOs.Tasks;

/// <summary>
/// DTO for real-time task events sent via SignalR
/// </summary>
public class TaskEventDTO
{
    /// <summary>
    /// Type of task event (TaskCreated, TaskUpdated, TaskDeleted)
    /// </summary>
    public string EventType { get; set; } = string.Empty;

    /// <summary>
    /// ID of the user who triggered the event
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// The task data (for create/update events)
    /// </summary>
    public TaskItemDTO? Task { get; set; }

    /// <summary>
    /// Previous state of the task (for update events)
    /// </summary>
    public TaskItemDTO? PreviousState { get; set; }

    /// <summary>
    /// Task ID (for delete events when task object is not available)
    /// </summary>
    public int? TaskId { get; set; }

    /// <summary>
    /// Board ID if the task was on a board
    /// </summary>
    public int? BoardId { get; set; }

    /// <summary>
    /// Timestamp when the event occurred
    /// </summary>
    public DateTime Timestamp { get; set; }
} 