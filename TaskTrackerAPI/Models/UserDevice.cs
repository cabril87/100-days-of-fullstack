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