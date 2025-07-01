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
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Focus;

/// <summary>
/// DTO for bulk delete focus sessions request
/// </summary>
public class BulkDeleteRequestDto
{
    /// <summary>
    /// List of session IDs to delete
    /// </summary>
    [Required]
    [MinLength(1, ErrorMessage = "At least one session ID must be provided")]
    public List<int> SessionIds { get; set; } = new();

    /// <summary>
    /// Optional confirmation token for safety
    /// </summary>
    public string? ConfirmationToken { get; set; }
} 