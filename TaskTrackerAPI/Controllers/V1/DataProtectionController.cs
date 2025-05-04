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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskTrackerAPI.DTOs.Auth;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Controllers.V1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize(Roles = "Admin")]
public class DataProtectionController : BaseApiController
{
    private readonly IDataProtectionService _dataProtectionService;
    private readonly ILogger<DataProtectionController> _logger;

    public DataProtectionController(
        IDataProtectionService dataProtectionService,
        ILogger<DataProtectionController> logger)
    {
        _dataProtectionService = dataProtectionService;
        _logger = logger;
    }

    /// <summary>
    /// Tests the data protection service by encrypting and decrypting a value
    /// </summary>
    /// <returns>The test result showing original, encrypted, and decrypted values</returns>
    [HttpGet("test")]
    public ActionResult<object> TestEncryption([FromQuery] string value = "Test sensitive data")
    {
        try
        {
            // Encrypt the value
            string? encrypted = _dataProtectionService.Encrypt(value);
            
            // Decrypt the value
            string? decrypted = _dataProtectionService.Decrypt(encrypted);
            
            return Ok(new
            {
                Original = value,
                Encrypted = encrypted,
                Decrypted = decrypted,
                Success = value == decrypted
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error testing data protection service");
            return StatusCode(500, "Error testing data protection");
        }
    }
    
    /// <summary>
    /// Creates a new encryption key with a specific version
    /// </summary>
    /// <param name="version">The version identifier for the new key</param>
    /// <returns>Result of key creation operation</returns>
    [HttpPost("keys")]
    public ActionResult CreateNewKey([FromQuery] string version)
    {
        if (string.IsNullOrWhiteSpace(version))
        {
            return BadRequest("Version cannot be empty");
        }
        
        try
        {
            bool result = _dataProtectionService.CreateNewEncryptionKey(version);
            
            if (result)
            {
                return Ok(new
                {
                    Message = $"Successfully created encryption key for version {version}",
                    Version = version
                });
            }
            else
            {
                return StatusCode(500, "Failed to create encryption key");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating encryption key");
            return StatusCode(500, "Error creating encryption key");
        }
    }
    
    /// <summary>
    /// Gets information about the data protection and encryption configuration
    /// </summary>
    /// <returns>Information about data protection configuration</returns>
    [HttpGet("info")]
    public ActionResult<object> GetInfo()
    {
        DirectoryInfo keyDirectory = new DirectoryInfo(Path.Combine(Directory.GetCurrentDirectory(), "Keys"));
        
        return Ok(new
        {
            KeyStoragePath = keyDirectory.FullName,
            KeysExist = keyDirectory.Exists && keyDirectory.GetFiles().Length > 0,
            ApplicationName = "TaskTrackerAPI",
            EncryptedFields = new[]
            {
                "User.Email",
                "User.FirstName",
                "User.LastName",
                "UserDevice.DeviceToken",
                "UserDevice.VerificationCode"
            }
        });
    }
} 