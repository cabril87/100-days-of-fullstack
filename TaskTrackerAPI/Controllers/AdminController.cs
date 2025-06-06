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
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.DTOs.Auth;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;

namespace TaskTrackerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly IGamificationService _gamificationService;
        private readonly IAdminService _adminService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(
            IGamificationService gamificationService,
            IAdminService adminService,
            ILogger<AdminController> logger)
        {
            _gamificationService = gamificationService;
            _adminService = adminService;
            _logger = logger;
        }

        /// <summary>
        /// Gets reset statistics showing what data will be cleared (Admin only)
        /// </summary>
        [HttpGet("gamification/reset-stats")]
        public async Task<ActionResult<GamificationResetStatsDTO>> GetResetStats()
        {
            try
            {
                int userId = GetCurrentUserId();
                
                if (!IsAdminUser())
                {
                    return Forbid("Only admin users can access reset functionality");
                }

                GamificationResetStatsDTO resetStats = await _gamificationService.GetResetStatsAsync(userId);
                return Ok(resetStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reset stats");
                return StatusCode(500, "Internal server error while getting reset stats");
            }
        }

        /// <summary>
        /// Resets all gamification data for the current admin user (Admin only - FOR TESTING)
        /// </summary>
        [HttpPost("gamification/reset")]
        public async Task<ActionResult<bool>> ResetGamificationData()
        {
            try
            {
                int userId = GetCurrentUserId();
                
                if (!IsAdminUser())
                {
                    return Forbid("Only admin users can reset gamification data");
                }

                _logger.LogWarning($"Admin user {userId} is resetting their gamification data for testing purposes");
                
                bool success = await _gamificationService.ResetUserGamificationDataAsync(userId);
                
                if (success)
                {
                    return Ok(new { 
                        success = true, 
                        message = "Gamification data has been completely reset for testing purposes",
                        userId = userId
                    });
                }
                else
                {
                    return StatusCode(500, "Failed to reset gamification data");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting gamification data");
                return StatusCode(500, "Internal server error while resetting gamification data");
            }
        }

        /// <summary>
        /// Gets comprehensive gamification status after reset (Admin only)
        /// </summary>
        [HttpGet("gamification/status")]
        public async Task<ActionResult> GetGamificationStatus()
        {
            try
            {
                int userId = GetCurrentUserId();
                
                if (!IsAdminUser())
                {
                    return Forbid("Only admin users can access this endpoint");
                }

                UserProgressDTO userProgress = await _gamificationService.GetUserProgressAsync(userId);
                List<UserAchievementDTO> achievements = await _gamificationService.GetUserAchievementsAsync(userId);
                List<UserBadgeDTO> badges = await _gamificationService.GetUserBadgesAsync(userId);
                GamificationResetStatsDTO resetStats = await _gamificationService.GetResetStatsAsync(userId);
                
                return Ok(new
                {
                    UserProgress = userProgress,
                    AchievementCount = achievements.Count,
                    BadgeCount = badges.Count,
                    ResetStats = resetStats,
                    Message = "Current gamification status for admin user"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting gamification status");
                return StatusCode(500, "Internal server error while getting gamification status");
            }
        }

        /// <summary>
        /// Creates a new user with optional family assignment (Admin only)
        /// </summary>
        [HttpPost("users/create")]
        public async Task<ActionResult<AdminUserCreateResponseDTO>> CreateUser([FromBody] AdminUserCreateDTO userCreateDto)
        {
            try
            {
                int adminUserId = GetCurrentUserId();
                
                if (!IsAdminUser())
                {
                    return Forbid("Only admin users can create new users");
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                AdminUserCreateResponseDTO result = await _adminService.CreateUserWithFamilyAssignmentAsync(adminUserId, userCreateDto);
                
                _logger.LogInformation($"Admin {adminUserId} successfully created user: {result.User.Username}");
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized admin user creation attempt");
                return Forbid(ex.Message);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid arguments for user creation");
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation during user creation");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user via admin");
                return StatusCode(500, "Internal server error while creating user");
            }
        }

        /// <summary>
        /// Gets all families accessible to the admin for user assignment (Admin only)
        /// </summary>
        [HttpGet("families/accessible")]
        public async Task<ActionResult<List<AdminFamilySelectionDTO>>> GetAccessibleFamilies()
        {
            try
            {
                int adminUserId = GetCurrentUserId();
                
                if (!IsAdminUser())
                {
                    return Forbid("Only admin users can access family information");
                }

                List<AdminFamilySelectionDTO> families = await _adminService.GetAdminAccessibleFamiliesAsync(adminUserId);
                
                _logger.LogInformation($"Retrieved {families.Count} accessible families for admin {adminUserId}");
                return Ok(families);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting accessible families");
                return StatusCode(500, "Internal server error while getting accessible families");
            }
        }

        /// <summary>
        /// Gets all available family roles for user assignment (Admin only)
        /// </summary>
        [HttpGet("families/roles")]
        public async Task<ActionResult<List<FamilyRoleDTO>>> GetFamilyRoles()
        {
            try
            {
                if (!IsAdminUser())
                {
                    return Forbid("Only admin users can access family role information");
                }

                List<FamilyRoleDTO> roles = await _adminService.GetFamilyRolesAsync();
                
                _logger.LogInformation($"Retrieved {roles.Count} family roles");
                return Ok(roles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting family roles");
                return StatusCode(500, "Internal server error while getting family roles");
            }
        }

        private int GetCurrentUserId()
        {
            string? userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedAccessException("Invalid user ID in token");
            }
            return userId;
        }

        private bool IsAdminUser()
        {
            // Check if the user is the seeded admin user (typically user ID 1)
            // You can also check by username or email if preferred
            int userId = GetCurrentUserId();
            
            // Seeded admin user is typically ID 1
            if (userId == 1) return true;
            
            // Additional check: admin role claim
            string? roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            if (roleClaim == "Admin") return true;
            
            // Additional check: admin username
            string? usernameClaim = User.FindFirst(ClaimTypes.Name)?.Value;
            if (usernameClaim?.ToLower() == "admin") return true;
            
            return false;
        }
    }
} 