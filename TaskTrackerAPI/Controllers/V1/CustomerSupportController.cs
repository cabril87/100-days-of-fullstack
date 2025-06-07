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
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using System.Threading.Tasks;
using TaskTrackerAPI.Attributes;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace TaskTrackerAPI.Controllers.V1;

/// <summary>
/// Customer Support Controller - User assistance and account recovery functions.
/// Accessible by Customer Support representatives and Global Admins only.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/support")]
[Authorize]
[RequireCustomerSupport] // Customer Support or Global Admin access required
public class CustomerSupportController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CustomerSupportController> _logger;

    public CustomerSupportController(
        ApplicationDbContext context,
        ILogger<CustomerSupportController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Searches for users by email address for customer support purposes.
    /// Returns basic user information without sensitive data.
    /// </summary>
    /// <param name="email">Email address to search for</param>
    /// <returns>User information for support purposes</returns>
    [HttpGet("users/search")]
    public async Task<ActionResult> SearchUserByEmail([FromQuery] string email)
    {
        try
        {
            string supportUserId = GetCurrentUserId();
            _logger.LogInformation("Customer support user {SupportUserId} searching for email: {Email}", 
                supportUserId, email);

            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest("Email parameter is required");
            }

            // Search for user by email
            var user = await _context.Users
                .Where(u => u.Email.ToLower() == email.ToLower())
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.FirstName,
                    u.LastName,
                    u.Role,
                    u.CreatedAt,
                    u.IsActive,
                    u.MFAEnabled,
                    u.AgeGroup
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                _logger.LogInformation("No user found with email: {Email}", email);
                return NotFound(new { message = "No user found with the specified email address" });
            }

            // Return user info for support purposes
            var result = new
            {
                UserId = user.Id,
                Username = user.Username,
                Email = user.Email, // Encrypted field will be automatically decrypted
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
                UserRole = UserRoleConstants.FromString(user.Role).ToString(),
                CreatedAt = user.CreatedAt,
                IsActive = user.IsActive,
                MFAEnabled = user.MFAEnabled,
                AgeGroup = user.AgeGroup.ToString(),
                AccountStatus = user.IsActive ? "Active" : "Inactive"
            };

            _logger.LogInformation("Customer support found user {UserId} for email {Email}", 
                user.Id, email);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching for user by email: {Email}", email);
            return StatusCode(500, "An error occurred while searching for the user");
        }
    }

    /// <summary>
    /// Emergency disable MFA for a user (Customer Support function).
    /// Logs the action for audit purposes.
    /// </summary>
    /// <param name="userId">ID of the user to disable MFA for</param>
    /// <param name="reason">Reason for disabling MFA</param>
    /// <returns>Success confirmation</returns>
    [HttpPost("users/{userId}/disable-mfa")]
    public async Task<ActionResult> EmergencyDisableMFA(int userId, [FromBody] string reason)
    {
        try
        {
            string supportUserId = GetCurrentUserId();
            _logger.LogWarning("Customer support user {SupportUserId} attempting to disable MFA for user {UserId}. Reason: {Reason}", 
                supportUserId, userId, reason);

            if (string.IsNullOrWhiteSpace(reason))
            {
                return BadRequest("Reason is required for MFA disable action");
            }

            // Find the user
            User? user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            if (!user.MFAEnabled)
            {
                return BadRequest("MFA is not enabled for this user");
            }

            // Disable MFA
            user.MFAEnabled = false;
            user.MFASecret = null;
            user.BackupCodes = null;
            user.MFASetupDate = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Log the admin action for audit trail
            _logger.LogWarning("ADMIN ACTION: Customer support user {SupportUserId} disabled MFA for user {UserId} ({Email}). Reason: {Reason}", 
                supportUserId, userId, user.Email, reason);

            var result = new
            {
                Success = true,
                Message = "MFA has been disabled for the user",
                UserId = userId,
                UserEmail = user.Email,
                DisabledBy = supportUserId,
                Reason = reason,
                Timestamp = DateTime.UtcNow
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error disabling MFA for user {UserId}", userId);
            return StatusCode(500, "An error occurred while disabling MFA");
        }
    }

    /// <summary>
    /// Gets basic account information for support purposes.
    /// </summary>
    /// <param name="userId">ID of the user to get info for</param>
    /// <returns>User account information</returns>
    [HttpGet("users/{userId}/account-info")]
    public async Task<ActionResult> GetUserAccountInfo(int userId)
    {
        try
        {
            string supportUserId = GetCurrentUserId();
            _logger.LogInformation("Customer support user {SupportUserId} requesting account info for user {UserId}", 
                supportUserId, userId);

            User? user = await _context.Users
                .Include(u => u.Devices)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound("User not found");
            }

            var result = new
            {
                UserId = user.Id,
                Username = user.Username,
                Email = user.Email,
                FullName = $"{user.FirstName} {user.LastName}".Trim(),
                Role = user.Role,
                UserRole = user.UserRole.ToString(),
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                IsActive = user.IsActive,
                AgeGroup = user.AgeGroup.ToString(),
                MFAEnabled = user.MFAEnabled,
                MFASetupDate = user.MFASetupDate,
                DeviceCount = user.Devices.Count,
                AccountStatus = user.IsActive ? "Active" : "Inactive"
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting account info for user {UserId}", userId);
            return StatusCode(500, "An error occurred while retrieving account information");
        }
    }

    /// <summary>
    /// Gets the current user ID from JWT claims.
    /// </summary>
    /// <returns>Current user ID</returns>
    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "Unknown";
    }
} 