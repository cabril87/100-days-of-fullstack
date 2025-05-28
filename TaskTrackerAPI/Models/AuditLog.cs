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

/// <summary>
/// Represents an audit log entry for tracking operations in the system
/// </summary>
[Table("GeneralAuditLogs")]
public class AuditLog
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(50)]
    public string EntityType { get; set; } = string.Empty;
    
    public int EntityId { get; set; }
    
    [Required]
    [StringLength(20)]
    public string Action { get; set; } = string.Empty;
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    [StringLength(500)]
    public string? Details { get; set; }
    
    [StringLength(50)]
    public string? IpAddress { get; set; }
    
    public int? UserId { get; set; }
} 