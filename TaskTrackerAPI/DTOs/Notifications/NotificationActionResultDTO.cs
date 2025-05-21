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
using System.Text.Json.Serialization;

namespace TaskTrackerAPI.DTOs.Notifications;

/// <summary>
/// DTO for notification action results
/// </summary>
public class NotificationActionResultDTO
{
    /// <summary>
    /// The ID of the notification the action was performed on
    /// </summary>
    public int NotificationId { get; set; }
    
    /// <summary>
    /// The action that was performed (e.g. "mark_read", "delete", "mark_all_read", "delete_all")
    /// </summary>
    public string Action { get; set; } = string.Empty;
    
    /// <summary>
    /// Whether the action was successful
    /// </summary>
    public bool Success { get; set; }
    
    /// <summary>
    /// A message describing the result of the action
    /// </summary>
    public string Message { get; set; } = string.Empty;
    
    /// <summary>
    /// Additional data associated with the action result
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public object? Data { get; set; }
} 