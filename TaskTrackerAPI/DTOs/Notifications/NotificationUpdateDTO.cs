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

namespace TaskTrackerAPI.DTOs.Notifications;

/// <summary>
/// DTO for real-time notification status updates sent via SignalR
/// </summary>
public class NotificationUpdateDTO
{
    /// <summary>
    /// ID of the notification being updated
    /// </summary>
    public int NotificationId { get; set; }

    /// <summary>
    /// New read status of the notification
    /// </summary>
    public bool IsRead { get; set; }

    /// <summary>
    /// Timestamp when the update occurred
    /// </summary>
    public DateTime UpdatedAt { get; set; }
} 