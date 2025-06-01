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
namespace TaskTrackerAPI.DTOs.Boards;

/// <summary>
/// DTO for WIP limit status monitoring
/// </summary>
public class WipLimitStatusDTO
{
    public int ColumnId { get; set; }
    public string ColumnName { get; set; } = string.Empty;
    public bool HasWipLimit { get; set; }
    public int? WipLimit { get; set; }
    public int CurrentTaskCount { get; set; }
    public bool IsAtLimit { get; set; }
    public bool IsOverLimit { get; set; }
    public bool IsLimitExceeded => WipLimit.HasValue && CurrentTaskCount > WipLimit.Value;
    public bool IsNearLimit => WipLimit.HasValue && CurrentTaskCount >= (WipLimit.Value * 0.8);
    public decimal UtilizationPercentage => WipLimit.HasValue ? (decimal)CurrentTaskCount / WipLimit.Value * 100 : 0;
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
} 