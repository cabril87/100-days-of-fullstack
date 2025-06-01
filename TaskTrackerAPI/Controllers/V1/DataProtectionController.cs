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
using TaskTrackerAPI.Models;
using System.IO;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using TaskTrackerAPI.Controllers.V2;

namespace TaskTrackerAPI.Controllers.V1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize(Roles = "Admin")]
[AllowAnonymous]
public class DataProtectionController : BaseApiController
{
    private readonly IDataProtectionService _dataProtectionService;
    private readonly ILogger<DataProtectionController> _logger;
    private readonly IHostEnvironment _environment;

    public DataProtectionController(
        IDataProtectionService dataProtectionService,
        ILogger<DataProtectionController> logger,
        IHostEnvironment environment)
    {
        _dataProtectionService = dataProtectionService;
        _logger = logger;
        _environment = environment;
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
        string keyDirectoryPath = Path.Combine(Directory.GetCurrentDirectory(), "Keys");
        DirectoryInfo keyDirectory = new DirectoryInfo(keyDirectoryPath);
        
        // Create a class to hold key file info to avoid anonymous type issues
        List<KeyFileInfo> keyFiles = new List<KeyFileInfo>();
        
        if (keyDirectory.Exists)
        {
            keyFiles = keyDirectory.GetFiles("*.xml")
                .Select(f => new KeyFileInfo
                {
                    Name = f.Name,
                    CreationTime = f.CreationTime,
                    LastWriteTime = f.LastWriteTime,
                    SizeBytes = f.Length
                }).ToList();
        }
        
        return Ok(new
        {
            KeyStoragePath = keyDirectory.FullName,
            KeysExist = keyDirectory.Exists && keyFiles.Any(),
            KeyCount = keyFiles.Count,
            Keys = keyFiles,
            ApplicationName = "TaskTrackerAPI",
            EncryptedFields = new[]
            {
                "User.Email",
                "User.FirstName",
                "User.LastName",
                "UserDevice.DeviceToken",
                "UserDevice.VerificationCode"
            },
            IsProduction = _environment.IsProduction(),
            IsDevelopment = _environment.IsDevelopment()
        });
    }
    
    /// <summary>
    /// Regenerates data protection keys (development only)
    /// </summary>
    /// <returns>Result of key regeneration operation</returns>
    [HttpPost("regenerate")]
    public ActionResult RegenerateKeys()
    {
        if (!_environment.IsDevelopment())
        {
            return BadRequest("This operation is only allowed in development environment");
        }
        
        try
        {
            bool result = _dataProtectionService.RegenerateKeys();
            
            if (result)
            {
                return Ok(new
                {
                    Message = "Successfully regenerated data protection keys",
                    Success = true
                });
            }
            else
            {
                return StatusCode(500, new
                {
                    Message = "Failed to regenerate data protection keys",
                    Success = false
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error regenerating data protection keys");
            return StatusCode(500, new
            {
                Message = "Error regenerating data protection keys",
                Success = false,
                Error = ex.Message
            });
        }
    }
    
    /// <summary>
    /// Resets all data protection keys by deleting them (development only)
    /// </summary>
    /// <returns>Result of key reset operation</returns>
    [HttpPost("reset")]
    [AllowAnonymous]
    public ActionResult ResetKeys([FromQuery] bool confirm = false)
    {
        if (!_environment.IsDevelopment())
        {
            return BadRequest("This operation is only allowed in development environment");
        }
        
        if (!confirm)
        {
            return BadRequest("You must confirm this operation by setting confirm=true. This will delete all existing keys!");
        }
        
        try
        {
            string keyDirectoryPath = Path.Combine(Directory.GetCurrentDirectory(), "Keys");
            DirectoryInfo keyDirectory = new DirectoryInfo(keyDirectoryPath);
            
            if (!keyDirectory.Exists)
            {
                return Ok(new
                {
                    Message = "Key directory does not exist, nothing to reset",
                    Success = true
                });
            }
            
            // Get all key files
            var keyFiles = keyDirectory.GetFiles("*.xml");
            
            // Delete each key file
            foreach (var file in keyFiles)
            {
                file.Delete();
                _logger.LogInformation("Deleted key file: {FileName}", file.Name);
            }
            
            // Regenerate new keys
            bool regenerateResult = _dataProtectionService.RegenerateKeys();
            
            return Ok(new
            {
                Message = $"Successfully reset data protection keys. Deleted {keyFiles.Length} keys and regenerated new ones.",
                Success = true,
                DeletedKeyCount = keyFiles.Length,
                RegenerateSuccess = regenerateResult
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting data protection keys");
            return StatusCode(500, new
            {
                Message = "Error resetting data protection keys",
                Success = false,
                Error = ex.Message
            });
        }
    }

    // Simple class to hold key file information
    private class KeyFileInfo
    {
        public required string Name { get; set; }
        public DateTime CreationTime { get; set; }
        public DateTime LastWriteTime { get; set; }
        public long SizeBytes { get; set; }
    }
} 