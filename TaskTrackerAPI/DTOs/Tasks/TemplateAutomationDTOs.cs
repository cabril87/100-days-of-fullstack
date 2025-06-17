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

// Automation Rule DTOs
public class AutomationRuleDTO
{
    public int Id { get; set; }
    public int TemplateId { get; set; }
    public string TriggerType { get; set; } = string.Empty;
    public string? Conditions { get; set; }
    public string Actions { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public int Priority { get; set; } = 0;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? LastTriggered { get; set; }
    public int TriggerCount { get; set; } = 0;
    public decimal SuccessRate { get; set; } = 0.0m;
}

public class CreateAutomationRuleDTO
{
    [Required]
    public int TemplateId { get; set; }
    
    [Required]
    [StringLength(50)]
    public string TriggerType { get; set; } = string.Empty;
    
    [StringLength(2000)]
    public string? Conditions { get; set; }
    
    [Required]
    [StringLength(2000)]
    public string Actions { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string? Name { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public bool IsActive { get; set; } = true;
    public int Priority { get; set; } = 0;
}

public class UpdateAutomationRuleDTO
{
    [StringLength(50)]
    public string? TriggerType { get; set; }
    
    [StringLength(2000)]
    public string? Conditions { get; set; }
    
    [StringLength(2000)]
    public string? Actions { get; set; }
    
    [StringLength(100)]
    public string? Name { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public bool? IsActive { get; set; }
    public int? Priority { get; set; }
}

// Workflow Step DTOs
public class WorkflowStepDTO
{
    public int Id { get; set; }
    public int TemplateId { get; set; }
    public int StepOrder { get; set; }
    public string StepType { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Configuration { get; set; }
    public string? Conditions { get; set; }
    public bool IsRequired { get; set; } = true;
    public bool IsActive { get; set; } = true;
    public int EstimatedDurationMinutes { get; set; } = 0;
    public string? Dependencies { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateWorkflowStepDTO
{
    [Required]
    public int TemplateId { get; set; }
    
    public int StepOrder { get; set; } = 0;
    
    [Required]
    [StringLength(50)]
    public string StepType { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [StringLength(2000)]
    public string? Configuration { get; set; }
    
    [StringLength(1000)]
    public string? Conditions { get; set; }
    
    public bool IsRequired { get; set; } = true;
    public bool IsActive { get; set; } = true;
    public int EstimatedDurationMinutes { get; set; } = 0;
    
    [StringLength(500)]
    public string? Dependencies { get; set; }
}

public class UpdateWorkflowStepDTO
{
    public int? StepOrder { get; set; }
    
    [StringLength(50)]
    public string? StepType { get; set; }
    
    [StringLength(100)]
    public string? Name { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [StringLength(2000)]
    public string? Configuration { get; set; }
    
    [StringLength(1000)]
    public string? Conditions { get; set; }
    
    public bool? IsRequired { get; set; }
    public bool? IsActive { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    
    [StringLength(500)]
    public string? Dependencies { get; set; }
}

public class TemplateAnalyticsSummaryDTO
{
    public int TemplateId { get; set; }
    public string TemplateName { get; set; } = string.Empty;
    public int TotalUsages { get; set; }
    public decimal SuccessRate { get; set; }
    public int AverageCompletionTimeMinutes { get; set; }
    public decimal AverageEfficiencyScore { get; set; }
    public DateTime? LastUsedDate { get; set; }
    public int UniqueUsers { get; set; }
    public decimal Rating { get; set; }
    public int DownloadCount { get; set; }
}

// Execution Result DTOs
public class AutomationExecutionResultDTO
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<string> ActionsExecuted { get; set; } = new List<string>();
    public List<string> Errors { get; set; } = new List<string>();
    public Dictionary<string, object> Results { get; set; } = new Dictionary<string, object>();
    public DateTime ExecutedAt { get; set; } = DateTime.UtcNow;
    public int ExecutionTimeMs { get; set; }
}

public class WorkflowExecutionResultDTO
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<WorkflowStepExecutionDTO> StepsExecuted { get; set; } = new List<WorkflowStepExecutionDTO>();
    public List<string> Errors { get; set; } = new List<string>();
    public DateTime ExecutedAt { get; set; } = DateTime.UtcNow;
    public int TotalExecutionTimeMs { get; set; }
    public int StepsCompleted { get; set; }
    public int TotalSteps { get; set; }
}

public class WorkflowStepExecutionDTO
{
    public int StepId { get; set; }
    public string StepName { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime ExecutedAt { get; set; }
    public int ExecutionTimeMs { get; set; }
    public Dictionary<string, object> Results { get; set; } = new Dictionary<string, object>();
}

public class WorkflowValidationResultDTO
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = new List<string>();
    public List<string> Warnings { get; set; } = new List<string>();
    public List<WorkflowStepValidationDTO> StepValidations { get; set; } = new List<WorkflowStepValidationDTO>();
}

public class WorkflowStepValidationDTO
{
    public int StepId { get; set; }
    public string StepName { get; set; } = string.Empty;
    public bool IsValid { get; set; }
    public List<string> Issues { get; set; } = new List<string>();
}

// Pattern Analysis and Suggestions DTOs
public class PatternAnalysisDTO
{
    public int UserId { get; set; }
    public string PatternType { get; set; } = string.Empty;
    public Dictionary<string, object> PatternData { get; set; } = new Dictionary<string, object>();
    public decimal Confidence { get; set; }
    public string Description { get; set; } = string.Empty;
    public List<string> SuggestedActions { get; set; } = new List<string>();
}

public class AutomationSuggestionDTO
{
    public string SuggestionType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Confidence { get; set; }
    public Dictionary<string, object> Configuration { get; set; } = new Dictionary<string, object>();
    public List<string> Benefits { get; set; } = new List<string>();
    public int EstimatedTimeSavingsMinutes { get; set; }
}

public class AutomationInsightDTO
{
    public string InsightType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Dictionary<string, object> Data { get; set; } = new Dictionary<string, object>();
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public string Recommendation { get; set; } = string.Empty;
} 