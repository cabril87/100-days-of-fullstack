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
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Tasks
{
    /// <summary>
    /// Data transfer object for checklist template items
    /// </summary>
    public class ChecklistTemplateItemDTO
    {
        /// <summary>
        /// Unique identifier for the checklist template item
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Text description of the checklist template item
        /// </summary>
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Text { get; set; } = string.Empty;
        
        /// <summary>
        /// Order/position of the item in the checklist template
        /// </summary>
        public int DisplayOrder { get; set; } = 0;
        
        /// <summary>
        /// ID of the parent task template this checklist item belongs to
        /// </summary>
        public int TaskTemplateId { get; set; }
        
        /// <summary>
        /// Date when the template item was created
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// Date when the template item was last updated
        /// </summary>
        public DateTime? UpdatedAt { get; set; }
    }
    
    /// <summary>
    /// DTO for creating a new checklist template item
    /// </summary>
    public class CreateChecklistTemplateItemDTO
    {
        /// <summary>
        /// Text description of the checklist template item
        /// </summary>
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Text { get; set; } = string.Empty;
        
        /// <summary>
        /// Order/position of the item in the checklist template
        /// </summary>
        public int DisplayOrder { get; set; } = 0;
        
        /// <summary>
        /// ID of the parent task template this checklist item belongs to
        /// </summary>
        public int TaskTemplateId { get; set; }
    }
} 