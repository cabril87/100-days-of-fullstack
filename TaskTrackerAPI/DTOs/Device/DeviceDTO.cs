using System;

namespace TaskTrackerAPI.DTOs.Device;

public class DeviceDTO
{
    public int Id { get; set; }
    public string DeviceId { get; set; } = string.Empty;
    public string DeviceName { get; set; } = string.Empty;
    public string DeviceType { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
    public DateTime LastActiveAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateDeviceDTO
{
    public string DeviceId { get; set; } = string.Empty;
    public string DeviceName { get; set; } = string.Empty;
    public string DeviceType { get; set; } = string.Empty;
    public string DeviceToken { get; set; } = string.Empty;
}

public class UpdateDeviceDTO
{
    public string DeviceName { get; set; } = string.Empty;
    public string DeviceToken { get; set; } = string.Empty;
}

public class VerifyDeviceDTO
{
    public string VerificationCode { get; set; } = string.Empty;
} 