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
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Batch;

/// <summary>
/// Result of a batch deletion operation with comprehensive tracking
/// </summary>
public class BatchDeletionResultDTO
{
    /// <summary>
    /// Total number of items requested for deletion
    /// </summary>
    public int RequestedCount { get; set; }
    
    /// <summary>
    /// Total number of items actually processed (successful + failed + skipped)
    /// </summary>
    public int ProcessedCount { get; set; }
    
    /// <summary>
    /// Number of successfully deleted items
    /// </summary>
    public int SuccessCount { get; set; }
    
    /// <summary>
    /// Number of items that failed to delete
    /// </summary>
    public int FailureCount { get; set; }
    
    /// <summary>
    /// Number of items that were skipped (e.g., not owned by user)
    /// </summary>
    public int SkippedCount { get; set; }
    
    /// <summary>
    /// List of successfully deleted task IDs
    /// </summary>
    public List<int> SuccessfulDeletions { get; set; } = new List<int>();
    
    /// <summary>
    /// List of failed deletions with reasons
    /// </summary>
    public List<FailedDeletionDTO> FailedDeletions { get; set; } = new List<FailedDeletionDTO>();
    
    /// <summary>
    /// List of skipped task IDs
    /// </summary>
    public List<int> SkippedDeletions { get; set; } = new List<int>();
    
    /// <summary>
    /// Overall success rate as a percentage
    /// </summary>
    public double SuccessRate => RequestedCount > 0 ? (double)SuccessCount / RequestedCount * 100 : 0;
    
    /// <summary>
    /// Indicates if all requested deletions were successful
    /// </summary>
    public bool IsCompleteSuccess => SuccessCount == RequestedCount && FailureCount == 0;
    
    /// <summary>
    /// Indicates if there were any failures
    /// </summary>
    public bool HasFailures => FailureCount > 0;
}

/// <summary>
/// Details about a failed deletion attempt
/// </summary>
public class FailedDeletionDTO
{
    /// <summary>
    /// ID of the task that failed to delete
    /// </summary>
    [Required]
    public int TaskId { get; set; }
    
    /// <summary>
    /// Human-readable reason for the failure
    /// </summary>
    [Required]
    [StringLength(500)]
    public string Reason { get; set; } = string.Empty;
    
    /// <summary>
    /// Error code for programmatic handling
    /// </summary>
    [StringLength(50)]
    public string ErrorCode { get; set; } = string.Empty;
    
    /// <summary>
    /// Timestamp when the failure occurred
    /// </summary>
    public DateTime FailedAt { get; set; } = DateTime.UtcNow;
} 