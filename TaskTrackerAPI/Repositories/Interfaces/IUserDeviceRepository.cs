using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

public interface IUserDeviceRepository
{
    Task<IEnumerable<UserDevice>> GetAllAsync();
    Task<UserDevice?> GetByIdAsync(int id);
    Task<IEnumerable<UserDevice>> GetByUserIdAsync(int userId);
    Task<UserDevice?> GetByDeviceIdAsync(string deviceId);
    Task<UserDevice?> GetByUserIdAndDeviceIdAsync(int userId, string deviceId);
    Task<UserDevice> CreateAsync(UserDevice device);
    Task<UserDevice?> UpdateAsync(UserDevice device);
    Task<bool> DeleteAsync(int id);
    Task<bool> DeviceExistsAsync(string deviceId);
    Task<bool> IsUserDeviceAsync(int userId, string deviceId);
    Task<bool> ValidateDeviceAsync(int userId, string deviceId, string deviceToken);
    Task<bool> UpdateLastActiveAsync(int deviceId);
    Task<bool> VerifyDeviceAsync(string deviceId, string verificationCode);
} 