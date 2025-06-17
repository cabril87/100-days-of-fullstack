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
using TaskTrackerAPI.DTOs.Boards;


namespace TaskTrackerAPI.DTOs.Tasks
{
    
    /// Data transfer object for task templates
    
    public class TaskTemplateDTO
    {
        
        /// Unique identifier for the template
        
        public int Id { get; set; }

        
        /// Name of the template
        
        [Required]
        [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
        public string Name { get; set; } = string.Empty;

        
        /// Description of the template
        
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }

        
        /// Type of template (Custom, Daily, Weekly, etc.)
        
        public TaskTemplateTypeDTO Type { get; set; } = TaskTemplateTypeDTO.Custom;

        
        /// JSON template data
        
        [Required]
        public string TemplateData { get; set; } = string.Empty;

        
        /// User ID who created the template (null for system templates)
        
        public int? CreatedByUserId { get; set; }

        
        /// Date when the template was created
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        
        /// Date when the template was last updated
        
        public DateTime? UpdatedAt { get; set; }

        
        /// Tags associated with this template
        
        public List<string>? Tags { get; set; }

        
        /// Category of the template
        
        [StringLength(50)]
        public string? Category { get; set; }

        
        /// Number of times this template has been used
        
        public int UsageCount { get; set; } = 0;
        
        /// Checklist items if this is a checklist template
        
        public List<ChecklistTemplateItemDTO>? ChecklistItems { get; set; }
        
        // Marketplace Fields
        
        /// Price in points for this template (0 for free)
        
        public int Price { get; set; } = 0;
        
        /// Whether this is a premium template
        
        public bool IsPremium { get; set; } = false;
        
        /// Whether this template is published to marketplace
        
        public bool IsPublic { get; set; } = false;
        
        /// Value proposition for the template
        
        public string? ValueProposition { get; set; }
        
        /// Prerequisites for using this template
        
        public string? Prerequisites { get; set; }
        
        /// Success stories and testimonials
        
        public string? SuccessStories { get; set; }
        
        /// Number of times this template has been purchased
        
        public int PurchaseCount { get; set; } = 0;
        
        /// Template success rate percentage
        
        public decimal SuccessRate { get; set; } = 0.0m;
        
        /// Template rating (1-5 stars)
        
        public decimal Rating { get; set; } = 0.0m;
        
        /// Number of downloads/uses
        
        public int DownloadCount { get; set; } = 0;
    }

    
    /// DTO for creating a task template
    
    public class CreateTaskTemplateDTO
    {
        
        /// Name of the template
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        
        /// Description of the template
        
        [StringLength(500)]
        public string? Description { get; set; }

        
        /// Template data as JSON
        
        [Required]
        public string TemplateData { get; set; } = string.Empty;

        
        /// Template category
        
        [StringLength(50)]
        public string? Category { get; set; }

        
        /// Tags for the template
        
        public List<string>? Tags { get; set; }
        
        /// Checklist items for checklist templates
        
        public List<CreateChecklistTemplateItemDTO>? ChecklistItems { get; set; }
    }

    
    /// DTO for applying a template to create tasks
    
    public class ApplyTemplateDTO
    {
        
        /// Template ID to apply
        
        [Required]
        public int TemplateId { get; set; }
        
        /// Custom name to use for the created entity
        public string? CustomName { get; set; }
        
        /// Start date for schedule templates
        public DateTime? StartDate { get; set; }
        
        /// Optional overrides for template values
        
        public Dictionary<string, object>? Overrides { get; set; }
    }

    
    /// DTO for updating a task template
    public class UpdateTaskTemplateDTO
    {
        /// Name of the template
        public string? Name { get; set; }
        
        /// Description of the template
        public string? Description { get; set; }
        
        /// Type of template
        public TaskTemplateTypeDTO? Type { get; set; }
        
        /// Template data as JSON
        public string? TemplateData { get; set; }
        
        /// URL to icon image
        public string? IconUrl { get; set; }
    }

    
    /// Result of applying a template
    
    public class TemplateApplicationResultDTO
    {
        /// Whether the template application was successful
        public bool Success { get; set; }
        
        /// IDs of tasks created from the template
        
        public List<int> CreatedTaskIds { get; set; } = new List<int>();
        
        /// Success message
        
        public string Message { get; set; } = string.Empty;
        
        /// Number of tasks created
        
        public int TaskCount => CreatedTaskIds.Count;

        /// Number of items created (tasks, boards, etc.)
        public int CreatedItemsCount { get; set; }

        /// Board created from the template
        public BoardDTO? CreatedBoard { get; set; }

        /// List of tasks created from the template
        public List<TaskItemDTO> CreatedTasks { get; set; } = new List<TaskItemDTO>();
    }
} 