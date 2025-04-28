using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.Extensions;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Controllers.V1
{
    [ApiController]
    [ApiVersion("1.0")]
    [Authorize]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Route("api/[controller]")]
    public class AchievementsController : ControllerBase
    {
        private readonly IAchievementService _achievementService;
        private readonly ILogger<AchievementsController> _logger;

        public AchievementsController(IAchievementService achievementService, ILogger<AchievementsController> logger)
        {
            _achievementService = achievementService;
            _logger = logger;
        }

        
        /// Get all achievements
        
        /// <returns>List of all achievements</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AchievementDTO>>> GetAchievements()
        {
            try
            {
                IEnumerable<AchievementDTO> achievements = await _achievementService.GetAllAchievementsAsync();
                return Ok(achievements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving achievements");
                return StatusCode(500, "An error occurred while retrieving achievements");
            }
        }

        
        /// Get achievement by ID
        
        /// <param name="id">Achievement ID</param>
        /// <returns>The achievement with the specified ID</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<AchievementDTO>> GetAchievement(int id)
        {
            try
            {
                AchievementDTO? achievement = await _achievementService.GetAchievementByIdAsync(id);

                if (achievement == null)
                {
                    return NotFound();
                }

                return Ok(achievement);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving achievement with ID {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the achievement");
            }
        }

        
        /// Get achievements by category
        
        /// <param name="category">Achievement category</param>
        /// <returns>List of achievements in the specified category</returns>
        [HttpGet("category/{category}")]
        public async Task<ActionResult<IEnumerable<AchievementDTO>>> GetAchievementsByCategory(string category)
        {
            try
            {
               IEnumerable<AchievementDTO> achievements = await _achievementService.GetAchievementsByTypeAsync(category);
                return Ok(achievements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving achievements for category {Category}", category);
                return StatusCode(500, "An error occurred while retrieving achievements by category");
            }
        }

        
        /// Create a new achievement
        
        /// <param name="achievementDto">Achievement data</param>
        /// <returns>The created achievement</returns>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AchievementDTO>> CreateAchievement(AchievementCreateUpdateDTO achievementDto)
        {
            try
            {
                AchievementDTO createdAchievement = await _achievementService.CreateAchievementAsync(achievementDto);
                return CreatedAtAction(nameof(GetAchievement), new { id = createdAchievement.Id, version = "1.0" }, createdAchievement);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating achievement");
                return StatusCode(500, "An error occurred while creating the achievement");
            }
        }

        
        /// Update an existing achievement
        
        /// <param name="id">Achievement ID</param>
        /// <param name="achievementDto">Updated achievement data</param>
        /// <returns>No content if successful</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateAchievement(int id, AchievementCreateUpdateDTO achievementDto)
        {
            try
            {
                bool result = await _achievementService.UpdateAchievementAsync(id, achievementDto);
                
                if (!result)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating achievement with ID {Id}", id);
                return StatusCode(500, "An error occurred while updating the achievement");
            }
        }

        
        /// Delete an achievement
        
        /// <param name="id">Achievement ID</param>
        /// <returns>No content if successful</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAchievement(int id)
        {
            try
            {
                bool result = await _achievementService.DeleteAchievementAsync(id);
                
                if (!result)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting achievement with ID {Id}", id);
                return StatusCode(500, "An error occurred while deleting the achievement");
            }
        }

        
        /// Soft delete (deactivate) an achievement
        
        /// <param name="id">Achievement ID</param>
        /// <returns>No content if successful</returns>
        [HttpPatch("{id}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeactivateAchievement(int id)
        {
            try
            {
                bool result = await _achievementService.DeleteAchievementAsync(id);
                
                if (!result)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating achievement with ID {Id}", id);
                return StatusCode(500, "An error occurred while deactivating the achievement");
            }
        }

        
        /// Get achievements for the current user
        
        /// <returns>List of user's achievements with progress</returns>
        [HttpGet("user")]
        public async Task<ActionResult<IEnumerable<UserAchievementDTO>>> GetUserAchievements()
        {
            try
            {
                string? userId = User.GetUserId(); // Extension method to get user ID from claims
                if (userId == null)
                {
                    return Unauthorized();
                }
                IEnumerable<UserAchievementDTO> userAchievements = await _achievementService.GetUserAchievementsAsync(userId);
                return Ok(userAchievements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user achievements");
                return StatusCode(500, "An error occurred while retrieving user achievements");
            }
        }
    }
} 