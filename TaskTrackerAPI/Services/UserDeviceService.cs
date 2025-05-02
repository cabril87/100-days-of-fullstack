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
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

public class UserDeviceService : IUserDeviceService
{
    private readonly IUserDeviceRepository _deviceRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<UserDeviceService> _logger;

    public UserDeviceService(
        IUserDeviceRepository deviceRepository,
        IMapper mapper,
        ILogger<UserDeviceService> logger)
    {
        _deviceRepository = deviceRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<UserDeviceDTO>> GetAllAsync()
    {
        IEnumerable<UserDevice> devices = await _deviceRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<UserDeviceDTO>>(devices);
    }

    public async Task<UserDeviceDTO?> GetByIdAsync(int id)
    {
        UserDevice? device = await _deviceRepository.GetByIdAsync(id);
        return device != null ? _mapper.Map<UserDeviceDTO>(device) : null;
    }

    public async Task<IEnumerable<UserDeviceDTO>> GetByUserIdAsync(int userId)
    {
        IEnumerable<UserDevice> devices = await _deviceRepository.GetByUserIdAsync(userId);
        return _mapper.Map<IEnumerable<UserDeviceDTO>>(devices);
    }

    public async Task<UserDeviceDTO?> GetByDeviceIdAsync(string deviceId)
    {
        UserDevice? device = await _deviceRepository.GetByDeviceIdAsync(deviceId);
        return device != null ? _mapper.Map<UserDeviceDTO>(device) : null;
    }

    public async Task<UserDeviceDTO> RegisterDeviceAsync(UserDeviceRegisterDTO deviceDto, int userId)
    {
        // Check if device already exists for this user
        UserDevice? existingDevice = await _deviceRepository.GetByUserIdAndDeviceIdAsync(userId, deviceDto.DeviceId);
        if (existingDevice != null)
        {
            // Update device token and last active timestamp
            existingDevice.DeviceToken = deviceDto.DeviceToken ?? existingDevice.DeviceToken;
            existingDevice.DeviceName = deviceDto.DeviceName;
            existingDevice.LastActiveAt = DateTime.UtcNow;
            
            UserDevice? updatedDevice = await _deviceRepository.UpdateAsync(existingDevice);
            return _mapper.Map<UserDeviceDTO>(updatedDevice);
        }

        // Create new device
        UserDevice device = _mapper.Map<UserDevice>(deviceDto);
        device.UserId = userId;
        device.IsVerified = false; // New devices need verification
        device.VerificationCode = await GenerateVerificationCodeAsync();

        UserDevice? createdDevice = await _deviceRepository.CreateAsync(device);
        return _mapper.Map<UserDeviceDTO>(createdDevice);
    }

    public async Task<bool> VerifyDeviceAsync(string deviceId, string verificationCode, int userId)
    {
        UserDevice? device = await _deviceRepository.GetByUserIdAndDeviceIdAsync(userId, deviceId);
        if (device == null)
        {
            _logger.LogWarning("Attempted to verify non-existent device {DeviceId} for user {UserId}", deviceId, userId);
            return false;
        }

        if (device.VerificationCode != verificationCode)
        {
            _logger.LogWarning("Invalid verification code provided for device {DeviceId} by user {UserId}", deviceId, userId);
            return false;
        }

        // Verify the device
        device.IsVerified = true;
        device.VerificationCode = null; // Clear verification code after successful verification
        device.LastActiveAt = DateTime.UtcNow;

        await _deviceRepository.UpdateAsync(device);
        return true;
    }

    public async Task<UserDeviceDTO?> UpdateAsync(int id, UserDeviceUpdateDTO deviceDto, int userId)
    {
        UserDevice? device = await _deviceRepository.GetByIdAsync(id);
        if (device == null || device.UserId != userId)
        {
            if (device == null)
                _logger.LogWarning("Attempted to update non-existent device {DeviceId}", id);
            else
                _logger.LogWarning("User {UserId} attempted to update device {DeviceId} belonging to another user", userId, id);
                
            return null;
        }

        _mapper.Map(deviceDto, device);
        device.LastActiveAt = DateTime.UtcNow;

        UserDevice? updatedDevice = await _deviceRepository.UpdateAsync(device);
        return updatedDevice != null ? _mapper.Map<UserDeviceDTO>(updatedDevice) : null;
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        UserDevice? device = await _deviceRepository.GetByIdAsync(id);
        if (device == null || device.UserId != userId)
        {
            if (device == null)
                _logger.LogWarning("Attempted to delete non-existent device {DeviceId}", id);
            else
                _logger.LogWarning("User {UserId} attempted to delete device {DeviceId} belonging to another user", userId, id);
                
            return false;
        }

        return await _deviceRepository.DeleteAsync(id);
    }

    public async Task<bool> IsDeviceVerifiedAsync(int userId, string deviceId)
    {
        UserDevice? device = await _deviceRepository.GetByUserIdAndDeviceIdAsync(userId, deviceId);
        return device?.IsVerified ?? false;
    }

    public async Task<string> GenerateVerificationCodeAsync()
    {
        return await Task.Run(() => {
            byte[] randomNumber = new byte[4];
            using (RandomNumberGenerator rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
            }
            return Math.Abs(BitConverter.ToInt32(randomNumber, 0) % 1000000).ToString("D6");
        });
    }
} 