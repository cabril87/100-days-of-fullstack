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
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models
{
    /// <summary>
    /// Template usage analytics model for tracking template usage patterns
    /// </summary>
    public class TemplateUsageAnalytics
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int TemplateId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public DateTime UsedAt { get; set; }

        public bool Success { get; set; }

        public int CompletionTimeMinutes { get; set; }

        // Navigation properties
        [ForeignKey("TemplateId")]
        public virtual TaskTemplate? Template { get; set; }

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
} 