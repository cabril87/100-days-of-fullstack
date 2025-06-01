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

namespace TaskTrackerAPI.DTOs.Tasks;

// Template Rating DTOs
public class RateTemplateDTO
{
    [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
    public decimal Rating { get; set; }
}

// Template Usage Recording DTOs
public class RecordUsageDTO
{
    public bool Success { get; set; }
    
    [Range(0, int.MaxValue, ErrorMessage = "Completion time must be non-negative")]
    public int CompletionTimeMinutes { get; set; }
}

// Automation Execution DTOs
public class ExecuteAutomationDTO
{
    public Dictionary<string, object> Context { get; set; } = new Dictionary<string, object>();
}

// System Health DTOs
public class AutomationHealthDTO
{
    public string Status { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public int ActiveRulesCount { get; set; }
    public int TriggersProcessedToday { get; set; }
    public string SystemLoad { get; set; } = string.Empty;
}

// Bulk Operations DTOs
public class BulkEvaluationRequestDTO
{
    [Required]
    [MinLength(1, ErrorMessage = "At least one trigger type is required")]
    public List<string> TriggerTypes { get; set; } = new List<string>();
}

public class BulkEvaluationResultDTO
{
    public bool Success { get; set; }
    public int ProcessedRules { get; set; }
    public int TriggeredRules { get; set; }
    public List<string> Errors { get; set; } = new List<string>();
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    
    public int TotalExecutionTimeMs => EndTime.HasValue ? 
        (int)(EndTime.Value - StartTime).TotalMilliseconds : 0;
} 