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
    /// Analytics query model for storing and managing analytics queries
    /// </summary>
    public class AnalyticsQuery
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string QueryDefinition { get; set; } = string.Empty; // JSON

        [Required]
        [StringLength(50)]
        public string QueryType { get; set; } = string.Empty;

        public int UserId { get; set; }

        public bool IsPublic { get; set; } = false;

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public DateTime? LastExecuted { get; set; }

        public int ExecutionCount { get; set; } = 0;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
} 