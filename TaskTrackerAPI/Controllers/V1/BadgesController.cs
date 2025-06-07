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
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Linq;
using TaskTrackerAPI.Controllers.V2;
using TaskTrackerAPI.Extensions;
using TaskTrackerAPI.Attributes;

namespace TaskTrackerAPI.Controllers.V1
{
    /// <summary>
    /// Badges controller - manages user badges and achievements.
    /// Accessible to all authenticated users (RegularUser and above).
    /// </summary>
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [Authorize]
    [RequireRole(UserRole.RegularUser)]
    public class BadgesController : BaseApiController
    {
        private readonly ILogger<BadgesController> _logger;
        private readonly IBadgeService _badgeService;

        public BadgesController(ILogger<BadgesController> logger, IBadgeService badgeService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _badgeService = badgeService ?? throw new ArgumentNullException(nameof(badgeService));
        }

        /// <summary>
        /// Get all badges
        /// </summary>
        /// <returns>List of badges</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<BadgeDTO>>> GetAllBadges()
        {
            try
            {
                IEnumerable<BadgeDTO> badges = await _badgeService.GetAllBadgesAsync();
                return Ok(ApiResponse<IEnumerable<BadgeDTO>>.SuccessResponse(badges));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all badges");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<IEnumerable<BadgeDTO>>.FailureResponse("Error retrieving badges", StatusCodes.Status500InternalServerError));
            }
        }

        /// <summary>
        /// Get badge by ID
        /// </summary>
        /// <param name="id">Badge ID</param>
        /// <returns>Badge details</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<BadgeDTO>> GetBadgeById(int id)
        {
            try
            {
                BadgeDTO? badge = await _badgeService.GetBadgeByIdAsync(id);

                if (badge == null)
                {
                    return NotFound(ApiResponse<BadgeDTO>.NotFoundResponse($"Badge with ID {id} not found"));
                }

                return Ok(ApiResponse<BadgeDTO>.SuccessResponse(badge));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving badge with ID {BadgeId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<BadgeDTO>.FailureResponse("Error retrieving badge", StatusCodes.Status500InternalServerError));
            }
        }

        /// <summary>
        /// Get badges by category
        /// </summary>
        /// <param name="category">Badge category</param>
        /// <returns>List of badges in the category</returns>
        [HttpGet("category/{category}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<BadgeDTO>>> GetBadgesByCategory(string category)
        {
            try
            {
                IEnumerable<BadgeDTO> badges = await _badgeService.GetBadgesByCategoryAsync(category);
                return Ok(ApiResponse<IEnumerable<BadgeDTO>>.SuccessResponse(badges));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving badges for category {Category}", category);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<IEnumerable<BadgeDTO>>.FailureResponse("Error retrieving badges by category", StatusCodes.Status500InternalServerError));
            }
        }

        /// <summary>
        /// Get badges by rarity
        /// </summary>
        /// <param name="rarity">Badge rarity</param>
        /// <returns>List of badges with the specified rarity</returns>
        [HttpGet("rarity/{rarity}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<BadgeDTO>>> GetBadgesByRarity(string rarity)
        {
            try
            {
                IEnumerable<BadgeDTO> badges = await _badgeService.GetBadgesByRarityAsync(rarity);
                return Ok(ApiResponse<IEnumerable<BadgeDTO>>.SuccessResponse(badges));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving badges for rarity {Rarity}", rarity);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<IEnumerable<BadgeDTO>>.FailureResponse("Error retrieving badges by rarity", StatusCodes.Status500InternalServerError));
            }
        }

        /// <summary>
        /// Create a new badge
        /// </summary>
        /// <param name="badgeDto">Badge data</param>
        /// <returns>Created badge with ID</returns>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<BadgeDTO>> CreateBadge([FromBody] BadgeCreateUpdateDTO badgeDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<BadgeDTO>.BadRequestResponse("Invalid data provided",
                    ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()));
            }

            try
            {
                BadgeDTO createdBadge = await _badgeService.CreateBadgeAsync(badgeDto);
                ApiResponse<BadgeDTO> response = ApiResponse<BadgeDTO>.SuccessResponse(createdBadge, "Badge created successfully");
                return CreatedAtAction(nameof(GetBadgeById), new { id = createdBadge.Id }, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating badge");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<BadgeDTO>.FailureResponse("Error creating badge", StatusCodes.Status500InternalServerError));
            }
        }

        /// <summary>
        /// Update an existing badge
        /// </summary>
        /// <param name="id">Badge ID</param>
        /// <param name="badgeDto">Updated badge data</param>
        /// <returns>No content if successful</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateBadge(int id, [FromBody] BadgeCreateUpdateDTO badgeDto)
        {
            try
            {
            if (!ModelState.IsValid)
            {
                    return BadRequest(ApiResponse<object>.BadRequestResponse("Invalid badge data"));
            }

                bool success = await _badgeService.UpdateBadgeAsync(
                    id, 
                    badgeDto.Name, 
                    badgeDto.Description, 
                    badgeDto.Category, 
                    badgeDto.IconUrl);

                if (!success)
                {
                    return NotFound(ApiResponse<object>.NotFoundResponse($"Badge with ID {id} not found"));
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating badge with ID {BadgeId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.FailureResponse("Error updating badge", StatusCodes.Status500InternalServerError));
            }
        }

        /// <summary>
        /// Delete a badge
        /// </summary>
        /// <param name="id">Badge ID</param>
        /// <returns>No content if successful</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteBadge(int id)
        {
            try
            {
                bool success = await _badgeService.DeleteBadgeAsync(id);

                if (!success)
                {
                    return NotFound(ApiResponse<object>.NotFoundResponse($"Badge with ID {id} not found"));
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting badge with ID {BadgeId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.FailureResponse("Error deleting badge", StatusCodes.Status500InternalServerError));
            }
        }

        /// <summary>
        /// Get badges earned by the current user
        /// </summary>
        /// <returns>List of user badges</returns>
        [HttpGet("my")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<UserBadgeDTO>>> GetMyBadges()
        {
            try
            {
                string? userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return BadRequest(ApiResponse<IEnumerable<UserBadgeDTO>>.BadRequestResponse("User identity not found"));
                }
                
                int userId = int.Parse(userIdClaim);
                IEnumerable<UserBadgeDTO> badges = await _badgeService.GetUserBadgesAsync(userId);
                return Ok(ApiResponse<IEnumerable<UserBadgeDTO>>.SuccessResponse(badges));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving badges for current user");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<IEnumerable<UserBadgeDTO>>.FailureResponse("Error retrieving user badges", StatusCodes.Status500InternalServerError));
            }
        }

        /// <summary>
        /// Get badges earned by a specific user
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <returns>List of user badges</returns>
        [HttpGet("user/{userId}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<UserBadgeDTO>>> GetUserBadges(int userId)
        {
            try
            {
                IEnumerable<UserBadgeDTO> badges = await _badgeService.GetUserBadgesAsync(userId);
                return Ok(ApiResponse<IEnumerable<UserBadgeDTO>>.SuccessResponse(badges));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving badges for user {UserId}", userId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<IEnumerable<UserBadgeDTO>>.FailureResponse("Error retrieving user badges", StatusCodes.Status500InternalServerError));
            }
        }

        /// <summary>
        /// Award a badge to a user
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="badgeId">Badge ID</param>
        /// <param name="awardNote">Optional note about the achievement</param>
        /// <returns>Success status</returns>
        [HttpPost("award")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> AwardBadgeToUser([FromQuery] int userId, [FromQuery] int badgeId, [FromQuery] string? awardNote = null)
        {
            try
            {
                bool success = await _badgeService.AwardBadgeToUserAsync(userId, badgeId, awardNote);

                if (!success)
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse(
                        "Badge could not be awarded. User may already have this badge or the badge does not exist."));
                }

                return Ok(ApiResponse<object>.SuccessResponse(data: new {}, message: "Badge awarded successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error awarding badge {BadgeId} to user {UserId}", badgeId, userId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.FailureResponse("Error awarding badge", StatusCodes.Status500InternalServerError));
            }
        }

        /// <summary>
        /// Update badge display status for the current user
        /// </summary>
        /// <param name="userBadgeId">User badge ID</param>
        /// <param name="isDisplayed">Display status</param>
        /// <returns>Success status</returns>
        [HttpPut("display/{userBadgeId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateMyBadgeDisplayStatus(int userBadgeId, [FromQuery] bool isDisplayed)
        {
            try
            {
                string? userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse("User identity not found"));
                }
                
                int userId = int.Parse(userIdClaim);
                bool success = await _badgeService.UpdateBadgeDisplayStatusAsync(userId, userBadgeId, isDisplayed);

                if (!success)
                {
                    return NotFound(ApiResponse<object>.NotFoundResponse("User badge not found"));
                }

                return Ok(ApiResponse<object>.SuccessResponse(data: new {}, message: "Display status updated successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating display status for user badge {UserBadgeId}", userBadgeId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.FailureResponse("Error updating badge display status", StatusCodes.Status500InternalServerError));
            }
        }

        /// <summary>
        /// Set a badge as featured (pinned) for the current user
        /// </summary>
        /// <param name="userBadgeId">User badge ID</param>
        /// <param name="isFeatured">Featured status</param>
        /// <returns>Success status</returns>
        [HttpPut("featured/{userBadgeId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SetMyBadgeAsFeatured(int userBadgeId, [FromQuery] bool isFeatured)
        {
            try
            {
                string? userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse("User identity not found"));
                }
                
                int userId = int.Parse(userIdClaim);
                bool success = await _badgeService.SetBadgeAsFeaturedAsync(userId, userBadgeId, isFeatured);

                if (!success)
                {
                    return NotFound(ApiResponse<object>.NotFoundResponse("User badge not found"));
                }

                string message = isFeatured ? "Badge set as featured successfully" : "Badge removed from featured successfully";
                return Ok(ApiResponse<object>.SuccessResponse(data: new {}, message: message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating featured status for user badge {UserBadgeId}", userBadgeId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.FailureResponse("Error updating badge featured status", StatusCodes.Status500InternalServerError));
            }
        }
    }
}