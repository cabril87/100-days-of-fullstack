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

namespace TaskTrackerAPI.DTOs.Family;

public class UserDeviceDTO
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string DeviceId { get; set; } = string.Empty;
    public string DeviceType { get; set; } = string.Empty;
    public string DeviceName { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastActiveAt { get; set; }
    public string UserName { get; set; } = string.Empty;
}

public class UserDeviceRegisterDTO
{
    [Required]
    public string DeviceId { get; set; } = string.Empty;
    
    [Required]
    public string DeviceToken { get; set; } = string.Empty;
    
    [Required]
    public string DeviceType { get; set; } = string.Empty;
    
    public string DeviceName { get; set; } = string.Empty;
}

public class UserDeviceUpdateDTO
{
    [Required]
    public string DeviceToken { get; set; } = string.Empty;
    
    public string DeviceName { get; set; } = string.Empty;
}

public class UserDeviceVerifyDTO
{
    [Required]
    public string DeviceId { get; set; } = string.Empty;
    
    [Required]
    public string VerificationCode { get; set; } = string.Empty;
}

public class DeviceTrustDTO
{
    [Required]
    public string DeviceId { get; set; } = string.Empty;
    
    [Required]
    public bool Trusted { get; set; }
    
    public string? Name { get; set; }
} 