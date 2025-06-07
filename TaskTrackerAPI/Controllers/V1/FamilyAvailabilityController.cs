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
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Extensions;
using TaskTrackerAPI.Controllers.V2;
using TaskTrackerAPI.Attributes;

namespace TaskTrackerAPI.Controllers.V1
{
    /// <summary>
    /// Family availability controller - manages family member availability and scheduling.
    /// Accessible to all authenticated users (RegularUser and above).
    /// </summary>
    [ApiVersion("1.0")]
    [Authorize]
    [RequireRole(UserRole.RegularUser)]
    [ApiController]
    [Route("api/v{version:apiVersion}/family/{familyId}/availability")]
    public class FamilyAvailabilityController : BaseApiController
    {
        private readonly IFamilyCalendarService _calendarService;
        private readonly ILogger<FamilyAvailabilityController> _logger;

        public FamilyAvailabilityController(
            IFamilyCalendarService calendarService,
            ILogger<FamilyAvailabilityController> logger)
        {
            _calendarService = calendarService;
            _logger = logger;
        }

        // GET: api/family/{familyId}/availability
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FamilyMemberAvailabilityDTO>>> GetFamilyAvailability(int familyId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                IEnumerable<FamilyMemberAvailabilityDTO> availabilities = await _calendarService.GetFamilyAvailabilityAsync(familyId, userId);
                return Ok(ApiResponse<IEnumerable<FamilyMemberAvailabilityDTO>>.SuccessResponse(availabilities));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting availability for family {FamilyId}", familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // GET: api/family/{familyId}/availability/range?startDate=2025-05-01&endDate=2025-05-31
        [HttpGet("range")]
        public async Task<ActionResult<IEnumerable<FamilyMemberAvailabilityDTO>>> GetAvailabilityInRange(
            int familyId, 
            [FromQuery] DateTime startDate, 
            [FromQuery] DateTime endDate)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                IEnumerable<FamilyMemberAvailabilityDTO> availabilities = await _calendarService.GetAvailabilityInRangeAsync(familyId, userId, startDate, endDate);
                return Ok(ApiResponse<IEnumerable<FamilyMemberAvailabilityDTO>>.SuccessResponse(availabilities));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting availability in range for family {FamilyId}", familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // GET: api/family/{familyId}/availability/member/{memberId}
        [HttpGet("member/{memberId}")]
        public async Task<ActionResult<IEnumerable<FamilyMemberAvailabilityDTO>>> GetMemberAvailability(int familyId, int memberId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                IEnumerable<FamilyMemberAvailabilityDTO> availabilities = await _calendarService.GetMemberAvailabilityAsync(memberId, userId);
                return Ok(ApiResponse<IEnumerable<FamilyMemberAvailabilityDTO>>.SuccessResponse(availabilities));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting availability for member {MemberId}", memberId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // GET: api/family/{familyId}/availability/{availabilityId}
        [HttpGet("{availabilityId}")]
        public async Task<ActionResult<FamilyMemberAvailabilityDTO>> GetAvailability(int familyId, int availabilityId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                FamilyMemberAvailabilityDTO? availability = await _calendarService.GetAvailabilityByIdAsync(availabilityId, userId);
                
                if (availability == null)
                {
                    return NotFound(ApiResponse<FamilyMemberAvailabilityDTO>.NotFoundResponse("Availability not found"));
                }
                
                return Ok(ApiResponse<FamilyMemberAvailabilityDTO>.SuccessResponse(availability));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting availability {AvailabilityId}", availabilityId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // POST: api/family/{familyId}/availability
        [HttpPost]
        public async Task<ActionResult<FamilyMemberAvailabilityDTO>> CreateAvailability(int familyId, CreateFamilyMemberAvailabilityDTO availabilityDto)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                FamilyMemberAvailabilityDTO? createdAvailability = await _calendarService.CreateAvailabilityAsync(availabilityDto, userId);
                
                if (createdAvailability == null)
                {
                    return BadRequest(ApiResponse<FamilyMemberAvailabilityDTO>.BadRequestResponse("Failed to create availability"));
                }
                
                return CreatedAtAction(nameof(GetAvailability), new { familyId, availabilityId = createdAvailability.Id }, 
                    ApiResponse<FamilyMemberAvailabilityDTO>.SuccessResponse(createdAvailability));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating availability for family {FamilyId}", familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // PUT: api/family/{familyId}/availability/{availabilityId}
        [HttpPut("{availabilityId}")]
        public async Task<ActionResult<FamilyMemberAvailabilityDTO>> UpdateAvailability(
            int familyId, 
            int availabilityId, 
            UpdateFamilyMemberAvailabilityDTO availabilityDto)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                FamilyMemberAvailabilityDTO? updatedAvailability = await _calendarService.UpdateAvailabilityAsync(availabilityId, availabilityDto, userId);
                
                if (updatedAvailability == null)
                {
                    return NotFound(ApiResponse<FamilyMemberAvailabilityDTO>.NotFoundResponse("Availability not found"));
                }
                
                return Ok(ApiResponse<FamilyMemberAvailabilityDTO>.SuccessResponse(updatedAvailability));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating availability {AvailabilityId}", availabilityId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // DELETE: api/family/{familyId}/availability/{availabilityId}
        [HttpDelete("{availabilityId}")]
        public async Task<ActionResult> DeleteAvailability(int familyId, int availabilityId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                bool result = await _calendarService.DeleteAvailabilityAsync(availabilityId, userId);
                
                if (!result)
                {
                    return NotFound(ApiResponse<object>.NotFoundResponse("Availability not found"));
                }
                
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting availability {AvailabilityId}", availabilityId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }
    }
} 