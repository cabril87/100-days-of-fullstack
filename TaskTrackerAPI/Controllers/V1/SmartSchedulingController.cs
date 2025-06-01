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
using System.Linq;
using TaskTrackerAPI.Controllers.V2;

namespace TaskTrackerAPI.Controllers.V1
{
    [ApiVersion("1.0")]
    [Authorize]
    [ApiController]
    [Route("api/v{version:apiVersion}/family/{familyId}/smart-scheduling")]
    [Route("api/family/{familyId}/smart-scheduling")]
    public class SmartSchedulingController : BaseApiController
    {
        private readonly ISmartSchedulingService _smartSchedulingService;
        private readonly ILogger<SmartSchedulingController> _logger;

        public SmartSchedulingController(
            ISmartSchedulingService smartSchedulingService,
            ILogger<SmartSchedulingController> logger)
        {
            _smartSchedulingService = smartSchedulingService;
            _logger = logger;
        }

        // GET: api/family/{familyId}/smart-scheduling/optimal-times
        [HttpGet("optimal-times")]
        public async Task<ActionResult<IEnumerable<OptimalTimeSlotDTO>>> GetOptimalMeetingTimes(
            int familyId,
            [FromQuery] int durationMinutes,
            [FromQuery] string requiredAttendeeIds,
            [FromQuery] DateTime? preferredStartDate = null,
            [FromQuery] DateTime? preferredEndDate = null)
        {
            try
            {
                if (durationMinutes <= 0)
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse("Duration must be positive"));
                }

                if (string.IsNullOrWhiteSpace(requiredAttendeeIds))
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse("Required attendee IDs must be provided"));
                }

                // Parse attendee IDs
                List<int> attendeeIds = requiredAttendeeIds.Split(',')
                    .Where(id => int.TryParse(id.Trim(), out _))
                    .Select(id => int.Parse(id.Trim()))
                    .ToList();

                if (!attendeeIds.Any())
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse("At least one valid attendee ID is required"));
                }

                int userId = User.GetUserIdAsInt();
                TimeSpan duration = TimeSpan.FromMinutes(durationMinutes);
                
                IEnumerable<OptimalTimeSlotDTO> optimalSlots = await _smartSchedulingService.GetOptimalMeetingTimesAsync(
                    familyId, userId, duration, attendeeIds, preferredStartDate, preferredEndDate);

                return Ok(ApiResponse<IEnumerable<OptimalTimeSlotDTO>>.SuccessResponse(optimalSlots));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting optimal meeting times for family {FamilyId}", familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // POST: api/family/{familyId}/smart-scheduling/suggestions
        [HttpPost("suggestions")]
        public async Task<ActionResult<IEnumerable<SmartSchedulingSuggestionDTO>>> GetSchedulingSuggestions(
            int familyId,
            [FromBody] SchedulingPreferencesDTO preferences)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    string errors = string.Join("; ", ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage));
                    return BadRequest(ApiResponse<object>.BadRequestResponse($"Invalid input: {errors}"));
                }

                int userId = User.GetUserIdAsInt();
                IEnumerable<SmartSchedulingSuggestionDTO> suggestions = await _smartSchedulingService.GetSchedulingSuggestionsAsync(familyId, userId, preferences);

                return Ok(ApiResponse<IEnumerable<SmartSchedulingSuggestionDTO>>.SuccessResponse(suggestions));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting scheduling suggestions for family {FamilyId}", familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // GET: api/family/{familyId}/smart-scheduling/conflicts
        [HttpGet("conflicts")]
        public async Task<ActionResult<IEnumerable<SchedulingConflictDTO>>> DetectConflicts(
            int familyId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                if (startDate >= endDate)
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse("Start date must be before end date"));
                }

                int userId = User.GetUserIdAsInt();
                IEnumerable<SchedulingConflictDTO> conflicts = await _smartSchedulingService.DetectSchedulingConflictsAsync(familyId, userId, startDate, endDate);

                return Ok(ApiResponse<IEnumerable<SchedulingConflictDTO>>.SuccessResponse(conflicts));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting conflicts for family {FamilyId}", familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // GET: api/family/{familyId}/smart-scheduling/conflicts/{conflictId}/resolutions
        [HttpGet("conflicts/{conflictId}/resolutions")]
        public async Task<ActionResult<IEnumerable<ConflictResolutionDTO>>> GetConflictResolutions(
            int familyId,
            int conflictId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                IEnumerable<ConflictResolutionDTO> resolutions = await _smartSchedulingService.GetConflictResolutionsAsync(familyId, userId, conflictId);

                return Ok(ApiResponse<IEnumerable<ConflictResolutionDTO>>.SuccessResponse(resolutions));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting conflict resolutions for family {FamilyId}, conflict {ConflictId}", familyId, conflictId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // POST: api/family/{familyId}/smart-scheduling/conflicts/{conflictId}/resolve
        [HttpPost("conflicts/{conflictId}/resolve")]
        public async Task<ActionResult> ResolveConflict(
            int familyId,
            int conflictId,
            [FromBody] ConflictResolutionRequestDTO resolution)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    string errors = string.Join("; ", ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage));
                    return BadRequest(ApiResponse<object>.BadRequestResponse($"Invalid input: {errors}"));
                }

                int userId = User.GetUserIdAsInt();
                bool success = await _smartSchedulingService.ResolveConflictAsync(familyId, userId, conflictId, resolution);

                if (!success)
                {
                    return NotFound(ApiResponse<object>.NotFoundResponse("Conflict not found or could not be resolved"));
                }

                return Ok(ApiResponse<object>.SuccessResponse("Conflict resolved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resolving conflict {ConflictId} for family {FamilyId}", conflictId, familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // GET: api/family/{familyId}/smart-scheduling/availability-matrix
        [HttpGet("availability-matrix")]
        public async Task<ActionResult<AvailabilityMatrixDTO>> GetAvailabilityMatrix(
            int familyId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate,
            [FromQuery] int granularityMinutes = 60)
        {
            try
            {
                if (startDate >= endDate)
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse("Start date must be before end date"));
                }

                if (granularityMinutes <= 0)
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse("Granularity must be positive"));
                }

                int userId = User.GetUserIdAsInt();
                TimeSpan granularity = TimeSpan.FromMinutes(granularityMinutes);
                
                AvailabilityMatrixDTO matrix = await _smartSchedulingService.GetAvailabilityMatrixAsync(familyId, userId, startDate, endDate, granularity);

                return Ok(ApiResponse<AvailabilityMatrixDTO>.SuccessResponse(matrix));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting availability matrix for family {FamilyId}", familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // POST: api/family/{familyId}/smart-scheduling/batch/create-events
        [HttpPost("batch/create-events")]
        public async Task<ActionResult<BatchCalendarOperationResultDTO>> BulkCreateEvents(
            int familyId,
            [FromBody] IEnumerable<CreateFamilyCalendarEventDTO> events)
        {
            try
            {
                if (events == null || !events.Any())
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse("No events provided"));
                }

                if (events.Count() > 100)
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse("Maximum 100 events allowed per batch"));
                }

                int userId = User.GetUserIdAsInt();
                BatchCalendarOperationResultDTO result = await _smartSchedulingService.BulkCreateEventsAsync(familyId, userId, events);

                return Ok(ApiResponse<BatchCalendarOperationResultDTO>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error bulk creating events for family {FamilyId}", familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // PUT: api/family/{familyId}/smart-scheduling/batch/update-events
        [HttpPut("batch/update-events")]
        public async Task<ActionResult<BatchCalendarOperationResultDTO>> BulkUpdateEvents(
            int familyId,
            [FromBody] IEnumerable<BulkUpdateEventRequestDTO> updates)
        {
            try
            {
                if (updates == null || !updates.Any())
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse("No updates provided"));
                }

                if (updates.Count() > 100)
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse("Maximum 100 updates allowed per batch"));
                }

                int userId = User.GetUserIdAsInt();
                BatchCalendarOperationResultDTO result = await _smartSchedulingService.BulkUpdateEventsAsync(familyId, userId, updates);

                return Ok(ApiResponse<BatchCalendarOperationResultDTO>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error bulk updating events for family {FamilyId}", familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // DELETE: api/family/{familyId}/smart-scheduling/batch/delete-events
        [HttpDelete("batch/delete-events")]
        public async Task<ActionResult<BatchCalendarOperationResultDTO>> BulkDeleteEvents(
            int familyId,
            [FromQuery] string eventIds)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(eventIds))
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse("Event IDs must be provided"));
                }

                List<int> ids = eventIds.Split(',')
                    .Where(id => int.TryParse(id.Trim(), out _))
                    .Select(id => int.Parse(id.Trim()))
                    .ToList();

                if (!ids.Any())
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse("At least one valid event ID is required"));
                }

                if (ids.Count > 100)
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse("Maximum 100 events allowed per batch"));
                }

                int userId = User.GetUserIdAsInt();
                BatchCalendarOperationResultDTO result = await _smartSchedulingService.BulkDeleteEventsAsync(familyId, userId, ids);

                return Ok(ApiResponse<BatchCalendarOperationResultDTO>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error bulk deleting events for family {FamilyId}", familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // POST: api/family/{familyId}/smart-scheduling/batch/reschedule-events
        [HttpPost("batch/reschedule-events")]
        public async Task<ActionResult<BatchCalendarOperationResultDTO>> BulkRescheduleEvents(
            int familyId,
            [FromBody] BulkRescheduleRequestDTO request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    string errors = string.Join("; ", ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage));
                    return BadRequest(ApiResponse<object>.BadRequestResponse($"Invalid input: {errors}"));
                }

                if (request.EventIds.Count() > 100)
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse("Maximum 100 events allowed per batch"));
                }

                int userId = User.GetUserIdAsInt();
                BatchCalendarOperationResultDTO result = await _smartSchedulingService.BulkRescheduleEventsAsync(familyId, userId, request);

                return Ok(ApiResponse<BatchCalendarOperationResultDTO>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error bulk rescheduling events for family {FamilyId}", familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // GET: api/family/{familyId}/smart-scheduling/analytics
        [HttpGet("analytics")]
        public async Task<ActionResult<SchedulingAnalyticsDTO>> GetSchedulingAnalytics(
            int familyId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                if (startDate >= endDate)
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse("Start date must be before end date"));
                }

                int userId = User.GetUserIdAsInt();
                SchedulingAnalyticsDTO analytics = await _smartSchedulingService.GetSchedulingAnalyticsAsync(familyId, userId, startDate, endDate);

                return Ok(ApiResponse<SchedulingAnalyticsDTO>.SuccessResponse(analytics));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting scheduling analytics for family {FamilyId}", familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // GET: api/family/{familyId}/smart-scheduling/efficiency
        [HttpGet("efficiency")]
        public async Task<ActionResult<SchedulingEfficiencyDTO>> GetSchedulingEfficiency(
            int familyId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                if (startDate >= endDate)
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse("Start date must be before end date"));
                }

                int userId = User.GetUserIdAsInt();
                SchedulingEfficiencyDTO efficiency = await _smartSchedulingService.CalculateSchedulingEfficiencyAsync(familyId, userId, startDate, endDate);

                return Ok(ApiResponse<SchedulingEfficiencyDTO>.SuccessResponse(efficiency));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating scheduling efficiency for family {FamilyId}", familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // GET: api/family/{familyId}/smart-scheduling/member-patterns
        [HttpGet("member-patterns")]
        public async Task<ActionResult<IEnumerable<MemberSchedulingPatternDTO>>> GetMemberSchedulingPatterns(int familyId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                IEnumerable<MemberSchedulingPatternDTO> patterns = await _smartSchedulingService.GetMemberSchedulingPatternsAsync(familyId, userId);

                return Ok(ApiResponse<IEnumerable<MemberSchedulingPatternDTO>>.SuccessResponse(patterns));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting member scheduling patterns for family {FamilyId}", familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // POST: api/family/{familyId}/smart-scheduling/optimize
        [HttpPost("optimize")]
        public async Task<ActionResult<ScheduleOptimizationResultDTO>> OptimizeSchedule(
            int familyId,
            [FromBody] ScheduleOptimizationRequestDTO request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    string errors = string.Join("; ", ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage));
                    return BadRequest(ApiResponse<object>.BadRequestResponse($"Invalid input: {errors}"));
                }

                int userId = User.GetUserIdAsInt();
                ScheduleOptimizationResultDTO result = await _smartSchedulingService.OptimizeScheduleAsync(familyId, userId, request);

                return Ok(ApiResponse<ScheduleOptimizationResultDTO>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error optimizing schedule for family {FamilyId}", familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // GET: api/family/{familyId}/smart-scheduling/predict-availability/{memberId}
        [HttpGet("predict-availability/{memberId}")]
        public async Task<ActionResult<AvailabilityPredictionDTO>> PredictAvailability(
            int familyId,
            int memberId,
            [FromQuery] DateTime targetDate)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                AvailabilityPredictionDTO prediction = await _smartSchedulingService.PredictAvailabilityAsync(familyId, memberId, userId, targetDate);

                return Ok(ApiResponse<AvailabilityPredictionDTO>.SuccessResponse(prediction));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error predicting availability for member {MemberId} in family {FamilyId}", memberId, familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }
    }
} 