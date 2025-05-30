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

namespace TaskTrackerAPI.Models.Analytics
{
    /// <summary>
    /// Represents a dashboard widget configuration for custom analytics dashboards
    /// </summary>
    public class DashboardWidget
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [StringLength(50)]
        public string WidgetType { get; set; } = string.Empty; // task-trends, productivity-metrics, etc.

        [Required]
        [Column(TypeName = "nvarchar(max)")]
        public string Position { get; set; } = string.Empty; // JSON: {x, y, w, h}

        [Required]
        [Column(TypeName = "nvarchar(max)")]
        public string Configuration { get; set; } = string.Empty; // JSON: widget-specific config

        public bool IsActive { get; set; } = true;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
} 