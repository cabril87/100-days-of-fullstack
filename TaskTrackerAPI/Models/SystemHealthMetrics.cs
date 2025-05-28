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

namespace TaskTrackerAPI.Models;

[Table("SystemHealthMetrics")]
public class SystemHealthMetrics
{
    [Key]
    public int Id { get; set; }

    [Required]
    public DateTime Timestamp { get; set; }

    [Required]
    [StringLength(50)]
    public string MetricName { get; set; } = string.Empty;

    [Required]
    public double Value { get; set; }

    [StringLength(20)]
    public string? Unit { get; set; }

    [StringLength(50)]
    public string? Category { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    public bool IsHealthy { get; set; } = true;

    public double? ThresholdWarning { get; set; }

    public double? ThresholdCritical { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
} 