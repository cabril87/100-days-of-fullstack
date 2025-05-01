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

namespace TaskTrackerAPI.Models;

public class UserDevice
{
    public int Id { get; set; }
    
    [Required]
    public int UserId { get; set; }
    
    [Required]
    public string DeviceId { get; set; } = string.Empty;
    
    [Required]
    public string DeviceToken { get; set; } = string.Empty;
    
    [Required]
    public string DeviceType { get; set; } = string.Empty;
    
    public string DeviceName { get; set; } = string.Empty;
    
    public bool IsVerified { get; set; }
    
    public string? VerificationCode { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime LastActiveAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public User User { get; set; } = null!;
}