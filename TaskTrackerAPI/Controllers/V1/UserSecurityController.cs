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
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using TaskTrackerAPI.Controllers.V2;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.DTOs.Security;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Attributes;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Controllers.V1
{
    /// <summary>
    /// User security controller - manages individual user security configurations.
    /// Accessible to all authenticated users (RegularUser and above).
    /// </summary>
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [Authorize]
    [RequireRole(UserRole.RegularUser)]
    public class UserSecurityController : BaseApiController
    {
        private readonly ISecurityMonitoringService _securityMonitoringService;
        private readonly ISessionManagementService _sessionManagementService;
        private readonly ILogger<UserSecurityController> _logger;

        public UserSecurityController(
            ISecurityMonitoringService securityMonitoringService,
            ISessionManagementService sessionManagementService,
            ILogger<UserSecurityController> logger)
        {
            _securityMonitoringService = securityMonitoringService ?? throw new ArgumentNullException(nameof(securityMonitoringService));
            _sessionManagementService = sessionManagementService ?? throw new ArgumentNullException(nameof(sessionManagementService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // ===== SECURITY SETTINGS =====

        /// <summary>
        /// Get current user's security settings
        /// </summary>
        /// <returns>User security settings</returns>
        [HttpGet("settings")]
        [ProducesResponseType(typeof(UserSecuritySettingsDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserSecuritySettingsDTO>> GetSecuritySettings()
        {
            try
            {
                int userId = GetCurrentUserId();
                UserSecuritySettingsDTO settings = await _securityMonitoringService.GetUserSecuritySettingsAsync(userId);
                return Ok(settings);
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Security settings not found");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving security settings for user");
                return StatusCode(500, "An error occurred while retrieving security settings");
            }
        }

        /// <summary>
        /// Create security settings for current user
        /// </summary>
        /// <param name="createDto">Security settings data</param>
        /// <returns>Created security settings</returns>
        [HttpPost("settings")]
        [ProducesResponseType(typeof(UserSecuritySettingsDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<ActionResult<UserSecuritySettingsDTO>> CreateSecuritySettings([FromBody] UserSecuritySettingsCreateDTO createDto)
        {
            try
            {
                int userId = GetCurrentUserId();
                UserSecuritySettingsDTO settings = await _securityMonitoringService.CreateUserSecuritySettingsAsync(userId, createDto);
                return CreatedAtAction(nameof(GetSecuritySettings), new { }, settings);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating security settings for user");
                return StatusCode(500, "An error occurred while creating security settings");
            }
        }

        /// <summary>
        /// Update current user's security settings
        /// </summary>
        /// <param name="updateDto">Security settings data to update</param>
        /// <returns>Updated security settings</returns>
        [HttpPut("settings")]
        [ProducesResponseType(typeof(UserSecuritySettingsDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserSecuritySettingsDTO>> UpdateSecuritySettings([FromBody] UserSecuritySettingsUpdateDTO updateDto)
        {
            try
            {
                int userId = GetCurrentUserId();
                UserSecuritySettingsDTO settings = await _securityMonitoringService.UpdateUserSecuritySettingsAsync(userId, updateDto);
                return Ok(settings);
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Security settings not found");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating security settings for user");
                return StatusCode(500, "An error occurred while updating security settings");
            }
        }

        /// <summary>
        /// Delete current user's security settings
        /// </summary>
        /// <returns>Success status</returns>
        [HttpDelete("settings")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteSecuritySettings()
        {
            try
            {
                int userId = GetCurrentUserId();
                bool deleted = await _securityMonitoringService.DeleteUserSecuritySettingsAsync(userId);
                
                if (deleted)
                {
                    return NoContent();
                }
                
                return NotFound("Security settings not found");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting security settings for user");
                return StatusCode(500, "An error occurred while deleting security settings");
            }
        }

        // ===== SESSIONS MANAGEMENT =====

        /// <summary>
        /// Get current user's active sessions
        /// </summary>
        /// <returns>List of active sessions</returns>
        [HttpGet("sessions")]
        [ProducesResponseType(typeof(IEnumerable<UserSessionDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<IEnumerable<UserSessionDTO>>> GetActiveSessions()
        {
            try
            {
                int userId = GetCurrentUserId();
                List<UserSessionDTO> sessions = await _sessionManagementService.GetUserSessionsAsync(userId, activeOnly: true);
                return Ok(sessions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active sessions for user");
                return StatusCode(500, "An error occurred while retrieving sessions");
            }
        }

        /// <summary>
        /// Terminate a specific session for current user
        /// </summary>
        /// <param name="request">Session termination request</param>
        /// <returns>Success status</returns>
        [HttpPost("sessions/terminate")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> TerminateSession([FromBody] TerminateSessionRequestDTO request)
        {
            try
            {
                int userId = GetCurrentUserId();
                
                // Verify the session belongs to the current user before terminating
                List<UserSessionDTO> userSessions = await _sessionManagementService.GetUserSessionsAsync(userId, activeOnly: true);
                bool sessionBelongsToUser = userSessions.Any(session => session.SessionToken == request.SessionToken);
                
                if (!sessionBelongsToUser)
                {
                    return NotFound("Session not found or does not belong to current user");
                }
                
                await _sessionManagementService.TerminateSessionAsync(request.SessionToken, "Terminated by user");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error terminating session for user");
                return StatusCode(500, "An error occurred while terminating session");
            }
        }

        // ===== DEVICES MANAGEMENT =====

        /// <summary>
        /// Get current user's devices
        /// </summary>
        /// <returns>List of user devices</returns>
        [HttpGet("devices")]
        [ProducesResponseType(typeof(IEnumerable<UserDeviceDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<IEnumerable<UserDeviceDTO>>> GetDevices()
        {
            try
            {
                int userId = GetCurrentUserId();
                List<UserDeviceDTO> devices = await _securityMonitoringService.GetUserDevicesAsync(userId);
                return Ok(devices);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user devices for user");
                return StatusCode(500, "An error occurred while retrieving devices");
            }
        }

        /// <summary>
        /// Update device trust status for current user
        /// </summary>
        /// <param name="deviceId">Device ID</param>
        /// <param name="request">Trust update request</param>
        /// <returns>Success status</returns>
        [HttpPut("devices/{deviceId}/trust")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateDeviceTrust(string deviceId, [FromBody] UpdateDeviceTrustRequestDTO request)
        {
            try
            {
                int userId = GetCurrentUserId();
                
                // Verify the device belongs to the current user
                List<UserDeviceDTO> userDevices = await _securityMonitoringService.GetUserDevicesAsync(userId);
                bool deviceBelongsToUser = userDevices.Any(device => device.DeviceId == deviceId);
                
                if (!deviceBelongsToUser)
                {
                    return NotFound("Device not found or does not belong to current user");
                }
                
                await _securityMonitoringService.UpdateDeviceTrustAsync(userId, deviceId, request.Trusted, request.DeviceName);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating device trust for user");
                return StatusCode(500, "An error occurred while updating device trust");
            }
        }

        // ===== SECURITY OVERVIEW =====

        /// <summary>
        /// Get basic security overview for current user
        /// </summary>
        /// <returns>Basic security overview</returns>
        [HttpGet("overview")]
        [ProducesResponseType(typeof(UserSecurityOverviewDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<UserSecurityOverviewDTO>> GetSecurityOverview()
        {
            try
            {
                int userId = GetCurrentUserId();
                
                // Get user's security data
                UserSecuritySettingsDTO settings = await _securityMonitoringService.GetUserSecuritySettingsAsync(userId);
                List<UserSessionDTO> sessions = await _sessionManagementService.GetUserSessionsAsync(userId, activeOnly: true);
                List<UserDeviceDTO> devices = await _securityMonitoringService.GetUserDevicesAsync(userId);
                
                UserSecurityOverviewDTO overview = new UserSecurityOverviewDTO
                {
                    MfaEnabled = settings.MFAEnabled,
                    ActiveSessionsCount = sessions.Count,
                    TrustedDevicesCount = devices.Count(d => d.IsVerified), // Using IsVerified as trust indicator
                    TotalDevicesCount = devices.Count,
                    LastSecurityScan = DateTime.UtcNow, // You might want to track this properly
                    SecurityScore = CalculateUserSecurityScore(settings, sessions.Count, devices)
                };
                
                return Ok(overview);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving security overview for user");
                return StatusCode(500, "An error occurred while retrieving security overview");
            }
        }

        // ===== HELPER METHODS =====

        /// <summary>
        /// Gets the current user ID from the authentication token
        /// </summary>
        /// <returns>Current user ID</returns>
        /// <exception cref="UnauthorizedAccessException">Thrown when user ID cannot be extracted from token</exception>
        private int GetCurrentUserId()
        {
            string? userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedAccessException("Invalid user ID in token");
            }
            return userId;
        }

        /// <summary>
        /// Calculates a security score for the user based on their settings and usage patterns
        /// </summary>
        /// <param name="settings">User security settings</param>
        /// <param name="sessionCount">Number of active sessions</param>
        /// <param name="devices">User devices</param>
        /// <returns>Security score from 0 to 100</returns>
        private int CalculateUserSecurityScore(UserSecuritySettingsDTO settings, int sessionCount, List<UserDeviceDTO> devices)
        {
            int score = 50; // Base score
            
            if (settings.MFAEnabled) score += 30;
            if (settings.SessionTimeout <= 60) score += 10; // Short session timeout
            if (settings.TrustedDevicesEnabled) score += 5;
            if (sessionCount <= 3) score += 5; // Reasonable number of sessions
            
            int trustedDeviceRatio = devices.Any() ? (int)((devices.Count(d => d.IsVerified) * 100) / devices.Count) : 100;
            if (trustedDeviceRatio >= 80) score += 10;
            
            return Math.Min(100, Math.Max(0, score));
        }
    }
} 