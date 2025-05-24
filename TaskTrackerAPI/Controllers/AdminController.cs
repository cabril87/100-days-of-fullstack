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
using TaskTrackerAPI.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System;

namespace TaskTrackerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly IGamificationService _gamificationService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(IGamificationService gamificationService, ILogger<AdminController> logger)
        {
            _gamificationService = gamificationService;
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

                var resetStats = await _gamificationService.GetResetStatsAsync(userId);
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

                var userProgress = await _gamificationService.GetUserProgressAsync(userId);
                var achievements = await _gamificationService.GetUserAchievementsAsync(userId);
                var badges = await _gamificationService.GetUserBadgesAsync(userId);
                var resetStats = await _gamificationService.GetResetStatsAsync(userId);
                
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

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
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
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            if (roleClaim == "Admin") return true;
            
            // Additional check: admin username
            var usernameClaim = User.FindFirst(ClaimTypes.Name)?.Value;
            if (usernameClaim?.ToLower() == "admin") return true;
            
            return false;
        }
    }
} 