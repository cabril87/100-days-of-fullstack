using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Family;

namespace TaskTrackerAPI.Services.Interfaces;

public interface IUserDeviceService
{
    Task<IEnumerable<UserDeviceDTO>> GetAllAsync();
    Task<UserDeviceDTO?> GetByIdAsync(int id);
    Task<IEnumerable<UserDeviceDTO>> GetByUserIdAsync(int userId);
    Task<UserDeviceDTO?> GetByDeviceIdAsync(string deviceId);
    Task<UserDeviceDTO> RegisterDeviceAsync(UserDeviceRegisterDTO deviceDto, int userId);
    Task<bool> VerifyDeviceAsync(string deviceId, string verificationCode, int userId);
    Task<UserDeviceDTO?> UpdateAsync(int id, UserDeviceUpdateDTO deviceDto, int userId);
    Task<bool> DeleteAsync(int id, int userId);
    Task<bool> IsDeviceVerifiedAsync(int userId, string deviceId);
    Task<string> GenerateVerificationCodeAsync();
} 