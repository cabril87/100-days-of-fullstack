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
using System.Text.Json;

namespace TaskTrackerAPI.Models;

public class TaskTemplate
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
    
    // Template type to identify special board templates
    public TaskTemplateType Type { get; set; } = TaskTemplateType.Custom;
    
    // Serialized template data - can include board layout, task default settings, etc.
    public string TemplateData { get; set; } = "{}";
    
    // Flag for predefined system templates vs. user-created templates
    public bool IsSystemTemplate { get; set; } = false;
    
    // Optional icon for the template
    public string? IconUrl { get; set; }
    
    // AUTOMATION FIELDS - Day 60 Enhancement
    public bool IsAutomated { get; set; } = false;
    
    [StringLength(2000)]
    public string? AutomationRules { get; set; }
    
    [StringLength(1000)]
    public string? TriggerConditions { get; set; }
    
    // MARKETPLACE FIELDS - Day 60 Enhancement  
    public bool IsPublic { get; set; } = false;
    
    [StringLength(50)]
    public string? Category { get; set; }
    
    public decimal Rating { get; set; } = 0.0m;
    
    public int DownloadCount { get; set; } = 0;
    
    [StringLength(1000)]
    public string? MarketplaceDescription { get; set; }
    
    public DateTime? PublishedDate { get; set; }
    
    // MARKETPLACE PRICING FIELDS - Template Marketplace Enhancement
    public int Price { get; set; } = 0; // Price in points (0 = free)
    
    public bool IsPremium { get; set; } = false;
    
    public int PurchaseCount { get; set; } = 0;
    
    [StringLength(1000)]
    public string? ValueProposition { get; set; }
    
    [StringLength(2000)]
    public string? SuccessStories { get; set; }
    
    [StringLength(500)]
    public string? Prerequisites { get; set; }
    
    // ANALYTICS FIELDS - Day 60 Enhancement
    public int UsageCount { get; set; } = 0;
    
    public decimal SuccessRate { get; set; } = 0.0m;
    
    public int AverageCompletionTimeMinutes { get; set; } = 0;
    
    public DateTime? LastUsedDate { get; set; }
    
    // WORKFLOW FIELDS - Day 60 Enhancement
    [StringLength(5000)]
    public string? WorkflowSteps { get; set; }
    
    [StringLength(2000)]
    public string? ConditionalLogic { get; set; }
    
    public int WorkflowVersion { get; set; } = 1;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    // Foreign keys
    public int? UserId { get; set; } // Null for system templates
    
    // Navigation properties
    public virtual User? User { get; set; }
    
    // Collection of checklist template items
    public virtual ICollection<ChecklistTemplateItem>? ChecklistItems { get; set; }
    
    // Day 60 Navigation properties
    public virtual ICollection<TaskAutomationRule>? AutomationRulesCollection { get; set; }
    
    public virtual ICollection<TemplateUsageAnalytics>? UsageAnalytics { get; set; }
    
    public virtual ICollection<WorkflowStep>? WorkflowStepsCollection { get; set; }
    
    // Helper methods to work with template data
    public T? GetTemplateData<T>() where T : class
    {
        if (string.IsNullOrEmpty(TemplateData))
            return null;
            
        return JsonSerializer.Deserialize<T>(TemplateData);
    }
    
    public void SetTemplateData<T>(T data) where T : class
    {
        TemplateData = JsonSerializer.Serialize(data);
    }
    
    // Day 60 Helper methods for automation
    public T? GetAutomationRules<T>() where T : class
    {
        if (string.IsNullOrEmpty(AutomationRules))
            return null;
            
        return JsonSerializer.Deserialize<T>(AutomationRules);
    }
    
    public void SetAutomationRules<T>(T rules) where T : class
    {
        AutomationRules = JsonSerializer.Serialize(rules);
    }
    
    public T? GetWorkflowSteps<T>() where T : class
    {
        if (string.IsNullOrEmpty(WorkflowSteps))
            return null;
            
        return JsonSerializer.Deserialize<T>(WorkflowSteps);
    }
    
    public void SetWorkflowSteps<T>(T steps) where T : class
    {
        WorkflowSteps = JsonSerializer.Serialize(steps);
    }
}

public enum TaskTemplateType
{
    Custom,
    Board,
    Kanban,
    Timeline,
    Calendar,
    ProjectBoard,
    Checklist,
    Scrum,
    Habit,
    Goal,
    Daily,
    Weekly,
    Monthly,
    Quarterly
} 