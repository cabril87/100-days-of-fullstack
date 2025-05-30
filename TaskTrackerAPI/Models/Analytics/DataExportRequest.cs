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
    /// Represents a data export request for analytics data
    /// </summary>
    public class DataExportRequest
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [StringLength(50)]
        public string ExportType { get; set; } = string.Empty; // JSON, CSV, PDF

        [Required]
        [Column(TypeName = "nvarchar(max)")]
        public string DateRange { get; set; } = string.Empty; // JSON

        [Required]
        [Column(TypeName = "nvarchar(max)")]
        public string Filters { get; set; } = string.Empty; // JSON

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "pending"; // pending, processing, completed, failed, cancelled

        [StringLength(500)]
        public string? FilePath { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? CompletedAt { get; set; }

        [StringLength(1000)]
        public string? ErrorMessage { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
} 