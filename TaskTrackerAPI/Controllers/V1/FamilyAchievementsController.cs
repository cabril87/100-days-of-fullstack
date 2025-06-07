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
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Extensions;
using TaskTrackerAPI.Controllers.V2;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.Attributes;

namespace TaskTrackerAPI.Controllers.V1
{
    /// <summary>
    /// Family achievements controller - manages family-wide achievements and rewards.
    /// Accessible to all authenticated users (RegularUser and above).
    /// </summary>
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [Authorize]
    [RequireRole(UserRole.RegularUser)]
    public class FamilyAchievementsController : BaseApiController
    {
        private readonly IFamilyAchievementService _achievementService;
        private readonly ILogger<FamilyAchievementsController> _logger;

        public FamilyAchievementsController(
            IFamilyAchievementService achievementService,
            ILogger<FamilyAchievementsController> logger)
        {
            _achievementService = achievementService;
            _logger = logger;
        }

        // GET: api/FamilyAchievements
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FamilyAchievementDTO>>> GetAllAchievements()
        {
            try
            {
                IEnumerable<FamilyAchievementDTO> achievements = await _achievementService.GetAllAsync();
                return Ok(achievements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all family achievements");
                return StatusCode(500, "An error occurred while retrieving family achievements");
            }
        }

        // GET: api/FamilyAchievements/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<FamilyAchievementDTO>> GetAchievementById(int id)
        {
            try
            {
                FamilyAchievementDTO? achievement = await _achievementService.GetByIdAsync(id);
                if (achievement == null)
                    return NotFound();

                return Ok(achievement);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving family achievement {AchievementId}", id);
                return StatusCode(500, "An error occurred while retrieving the family achievement");
            }
        }

        // GET: api/FamilyAchievements/family/{familyId}
        [HttpGet("family/{familyId}")]
        public async Task<ActionResult<IEnumerable<FamilyAchievementDTO>>> GetAchievementsByFamilyId(int familyId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                IEnumerable<FamilyAchievementDTO> achievements = await _achievementService.GetByFamilyIdAsync(familyId, userId);
                return Ok(achievements);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving achievements for family {FamilyId}", familyId);
                return StatusCode(500, "An error occurred while retrieving family achievements");
            }
        }

        // GET: api/FamilyAchievements/family/{familyId}/completed
        [HttpGet("family/{familyId}/completed")]
        public async Task<ActionResult<IEnumerable<FamilyAchievementDTO>>> GetCompletedAchievementsByFamilyId(int familyId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                IEnumerable<FamilyAchievementDTO> achievements = await _achievementService.GetCompletedByFamilyIdAsync(familyId, userId);
                return Ok(achievements);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving completed achievements for family {FamilyId}", familyId);
                return StatusCode(500, "An error occurred while retrieving completed family achievements");
            }
        }

        // GET: api/FamilyAchievements/family/{familyId}/in-progress
        [HttpGet("family/{familyId}/in-progress")]
        public async Task<ActionResult<IEnumerable<FamilyAchievementDTO>>> GetInProgressAchievementsByFamilyId(int familyId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                IEnumerable<FamilyAchievementDTO> achievements = await _achievementService.GetInProgressByFamilyIdAsync(familyId, userId);
                return Ok(achievements);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving in-progress achievements for family {FamilyId}", familyId);
                return StatusCode(500, "An error occurred while retrieving in-progress family achievements");
            }
        }

        // POST: api/FamilyAchievements
        [HttpPost]
        public async Task<ActionResult<FamilyAchievementDTO>> CreateAchievement([FromBody] FamilyAchievementCreateDTO achievementDto)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                FamilyAchievementDTO achievement = await _achievementService.CreateAsync(achievementDto, userId);
                return CreatedAtAction(nameof(GetAchievementById), new { id = achievement.Id }, achievement);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating family achievement");
                return StatusCode(500, "An error occurred while creating the family achievement");
            }
        }

        // PUT: api/FamilyAchievements/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<FamilyAchievementDTO>> UpdateAchievement(int id, [FromBody] FamilyAchievementUpdateDTO achievementDto)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                FamilyAchievementDTO? achievement = await _achievementService.UpdateAsync(id, achievementDto, userId);
                
                if (achievement == null)
                    return NotFound();
                    
                return Ok(achievement);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating family achievement {AchievementId}", id);
                return StatusCode(500, "An error occurred while updating the family achievement");
            }
        }

        // DELETE: api/FamilyAchievements/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAchievement(int id)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                bool result = await _achievementService.DeleteAsync(id, userId);
                
                if (!result)
                    return NotFound();
                    
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting family achievement {AchievementId}", id);
                return StatusCode(500, "An error occurred while deleting the family achievement");
            }
        }

        // POST: api/FamilyAchievements/{id}/progress
        [HttpPost("{id}/progress")]
        public async Task<ActionResult> UpdateProgress(int id, [FromBody] ProgressUpdateDTO progressDto)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                bool result = await _achievementService.UpdateProgressAsync(id, progressDto.MemberId, progressDto.ProgressIncrease, userId);
                
                if (!result)
                    return NotFound();
                    
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating progress for achievement {AchievementId}", id);
                return StatusCode(500, "An error occurred while updating achievement progress");
            }
        }

        // GET: api/FamilyAchievements/leaderboard
        [HttpGet("leaderboard")]
        public async Task<ActionResult<IEnumerable<FamilyLeaderboardDTO>>> GetLeaderboard([FromQuery] int limit = 10)
        {
            try
            {
                IEnumerable<FamilyLeaderboardDTO> leaderboard = await _achievementService.GetLeaderboardAsync(limit);
                return Ok(leaderboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving achievement leaderboard");
                return StatusCode(500, "An error occurred while retrieving the achievement leaderboard");
            }
        }

        // GET: api/FamilyAchievements/family/{familyId}/stats
        [HttpGet("family/{familyId}/stats")]
        public async Task<ActionResult<FamilyLeaderboardDTO>> GetFamilyStats(int familyId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                FamilyLeaderboardDTO? stats = await _achievementService.GetFamilyStatsAsync(familyId, userId);
                
                if (stats == null)
                    return NotFound();
                    
                return Ok(stats);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving achievement stats for family {FamilyId}", familyId);
                return StatusCode(500, "An error occurred while retrieving family achievement statistics");
            }
        }

        // POST: api/FamilyAchievements/task/{taskId}/complete
        [HttpPost("task/{taskId}/complete")]
        public async Task<ActionResult> TrackTaskCompletion(int taskId, [FromBody] TaskCompletionDTO completionDto)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                bool result = await _achievementService.TrackTaskCompletionAsync(taskId, completionDto.MemberId, userId);
                
                if (!result)
                    return NotFound();
                    
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error tracking task completion for task {TaskId}", taskId);
                return StatusCode(500, "An error occurred while tracking task completion");
            }
        }
    }
} 