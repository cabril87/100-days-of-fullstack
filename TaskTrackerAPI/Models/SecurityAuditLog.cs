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

[Table("SecurityAuditLogs")]
public class SecurityAuditLog
{
    [Key]
    public int Id { get; set; }

    [Required]
    public DateTime Timestamp { get; set; }

    [Required]
    [StringLength(50)]
    public string EventType { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Action { get; set; } = string.Empty;

    [StringLength(45)]
    public string? IpAddress { get; set; }

    [StringLength(500)]
    public string? UserAgent { get; set; }

    public int? UserId { get; set; }

    [StringLength(100)]
    public string? Username { get; set; }

    [StringLength(200)]
    public string? Resource { get; set; }

    [StringLength(50)]
    public string? Severity { get; set; }

    [StringLength(1000)]
    public string? Details { get; set; }

    [StringLength(50)]
    public string? Status { get; set; }

    public bool IsSuccessful { get; set; }

    public bool IsSuspicious { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual User? User { get; set; }
} 