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

using System.Collections.Generic;

namespace TaskTrackerAPI.DTOs.Focus;

/// <summary>
/// DTO for bulk delete operation results
/// </summary>
public class BulkDeleteResultDto
{
    /// <summary>
    /// Number of sessions requested for deletion
    /// </summary>
    public int RequestedCount { get; set; }

    /// <summary>
    /// List of successfully deleted session IDs
    /// </summary>
    public List<int> SuccessfulDeletes { get; set; } = new();

    /// <summary>
    /// List of failed deletions with reasons
    /// </summary>
    public List<FailedDeleteDto> FailedDeletes { get; set; } = new();

    /// <summary>
    /// Number of successful deletions
    /// </summary>
    public int SuccessCount => SuccessfulDeletes.Count;

    /// <summary>
    /// Number of failed deletions
    /// </summary>
    public int FailedCount => FailedDeletes.Count;

    /// <summary>
    /// Success rate as percentage
    /// </summary>
    public double SuccessRate => RequestedCount > 0 ? (double)SuccessCount / RequestedCount * 100 : 0;
}

/// <summary>
/// DTO for failed deletion information
/// </summary>
public class FailedDeleteDto
{
    /// <summary>
    /// Session ID that failed to delete
    /// </summary>
    public int SessionId { get; set; }

    /// <summary>
    /// Reason for deletion failure
    /// </summary>
    public string Reason { get; set; } = string.Empty;
} 