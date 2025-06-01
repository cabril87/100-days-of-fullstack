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

namespace TaskTrackerAPI.DTOs.Boards;

/// <summary>
/// DTO for column validation result
/// </summary>
public class ColumnValidationResultDTO
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = new List<string>();
    public List<string> Warnings { get; set; } = new List<string>();
    public string Operation { get; set; } = string.Empty;
    public Dictionary<string, object> ValidatedProperties { get; set; } = new Dictionary<string, object>();
    public Dictionary<string, object> Context { get; set; } = new Dictionary<string, object>();
} 