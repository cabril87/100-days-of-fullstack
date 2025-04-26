using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using Microsoft.Extensions.Logging;

namespace TaskTrackerAPI.Repositories;

public class UserDeviceRepository : TaskTrackerAPI.Repositories.Interfaces.IUserDeviceRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UserDeviceRepository> _logger;

    public UserDeviceRepository(ApplicationDbContext context, ILogger<UserDeviceRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<UserDevice>> GetAllAsync()
    {
        return await _context.UserDevices
            .Include(d => d.User)
            .ToListAsync();
    }

    public async Task<UserDevice?> GetByIdAsync(int id)
    {
        return await _context.UserDevices
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<IEnumerable<UserDevice>> GetByUserIdAsync(int userId)
    {
        return await _context.UserDevices
            .Where(d => d.UserId == userId)
            .ToListAsync();
    }

    public async Task<UserDevice?> GetByDeviceIdAsync(string deviceId)
    {
        return await _context.UserDevices
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.DeviceId == deviceId);
    }

    public async Task<UserDevice?> GetByUserIdAndDeviceIdAsync(int userId, string deviceId)
    {
        return await _context.UserDevices
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.UserId == userId && d.DeviceId == deviceId);
    }

    public async Task<UserDevice> CreateAsync(UserDevice device)
    {
        _context.UserDevices.Add(device);
        await _context.SaveChangesAsync();
        return device;
    }

    public async Task<UserDevice?> UpdateAsync(UserDevice device)
    {
        _context.UserDevices.Update(device);
        await _context.SaveChangesAsync();
        return device;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var device = await _context.UserDevices.FindAsync(id);
        if (device == null)
        {
            return false;
        }

        _context.UserDevices.Remove(device);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeviceExistsAsync(string deviceId)
    {
        return await _context.UserDevices.AnyAsync(d => d.DeviceId == deviceId);
    }

    public async Task<bool> IsUserDeviceAsync(int userId, string deviceId)
    {
        return await _context.UserDevices.AnyAsync(d => d.UserId == userId && d.DeviceId == deviceId);
    }

    public async Task<bool> ValidateDeviceAsync(int userId, string deviceId, string deviceToken)
    {
        var device = await _context.UserDevices
            .FirstOrDefaultAsync(d => d.UserId == userId && 
                               d.DeviceId == deviceId && 
                               d.DeviceToken == deviceToken);
        
        return device != null;
    }

    public async Task<bool> UpdateLastActiveAsync(int deviceId)
    {
        var device = await _context.UserDevices.FindAsync(deviceId);
        if (device == null)
            return false;

        device.LastActiveAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> VerifyDeviceAsync(string deviceId, string verificationCode)
    {
        var device = await _context.UserDevices
            .FirstOrDefaultAsync(d => d.DeviceId == deviceId && 
                                     d.VerificationCode == verificationCode);
        
        if (device == null)
        {
            return false;
        }

        device.IsVerified = true;
        device.VerificationCode = null;
        device.LastActiveAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        return true;
    }
} 