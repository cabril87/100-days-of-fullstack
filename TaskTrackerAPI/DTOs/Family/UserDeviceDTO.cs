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