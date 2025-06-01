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
    [Route("api/v{version:apiVersion}/family/{familyId}/calendar")]
    [Route("api/family/{familyId}/calendar")]
    public class FamilyCalendarController : BaseApiController
    {
        private readonly IFamilyCalendarService _calendarService;
        private readonly ILogger<FamilyCalendarController> _logger;

        public FamilyCalendarController(
            IFamilyCalendarService calendarService,
            ILogger<FamilyCalendarController> logger)
        {
            _calendarService = calendarService;
            _logger = logger;
        }

        // GET: api/family/{familyId}/calendar/events
        [HttpGet("events")]
        public async Task<ActionResult<IEnumerable<FamilyCalendarEventDTO>>> GetEvents(int familyId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                IEnumerable<FamilyCalendarEventDTO> events = await _calendarService.GetAllEventsAsync(familyId, userId);
                return Ok(ApiResponse<IEnumerable<FamilyCalendarEventDTO>>.SuccessResponse(events));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting events for family {FamilyId}", familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // GET: api/family/{familyId}/calendar/events/range?startDate=2025-05-01&endDate=2025-05-31
        [HttpGet("events/range")]
        public async Task<ActionResult<IEnumerable<FamilyCalendarEventDTO>>> GetEventsInRange(
            int familyId, 
            [FromQuery] DateTime startDate, 
            [FromQuery] DateTime endDate)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                IEnumerable<FamilyCalendarEventDTO> events = await _calendarService.GetEventsInRangeAsync(familyId, userId, startDate, endDate);
                return Ok(ApiResponse<IEnumerable<FamilyCalendarEventDTO>>.SuccessResponse(events));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting events in range for family {FamilyId}", familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // GET: api/family/{familyId}/calendar/events/{eventId}
        [HttpGet("events/{eventId}")]
        public async Task<ActionResult<FamilyCalendarEventDTO>> GetEvent(int familyId, int eventId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                FamilyCalendarEventDTO? calendarEvent = await _calendarService.GetEventByIdAsync(eventId, userId);
                
                if (calendarEvent == null)
                {
                    return NotFound(ApiResponse<FamilyCalendarEventDTO>.NotFoundResponse("Event not found"));
                }
                
                return Ok(ApiResponse<FamilyCalendarEventDTO>.SuccessResponse(calendarEvent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting event {EventId} for family {FamilyId}", eventId, familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // POST: api/family/{familyId}/calendar/events
        [HttpPost("events")]
        public async Task<ActionResult<FamilyCalendarEventDTO>> CreateEvent(int familyId, CreateFamilyCalendarEventDTO eventDto)
        {
            try
            {
                // Check if model is valid
                if (!ModelState.IsValid)
                {
                    string errors = string.Join("; ", ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage));
                    _logger.LogWarning("Invalid model state: {Errors}", errors);
                    return BadRequest(ApiResponse<object>.BadRequestResponse($"Invalid input: {errors}"));
                }

                // Ensure the familyId in the route matches the one in the DTO
                if (eventDto.FamilyId != familyId)
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse("Family ID in the request body must match the ID in the URL"));
                }
                
                // Get user ID from token
                int userId = User.GetUserIdAsInt();
                _logger.LogInformation("Creating event for family {FamilyId} by user {UserId}", familyId, userId);
                
                // Log request data for debugging
                _logger.LogDebug("Event creation request: {@EventDto}", new
                {
                    Title = eventDto.Title,
                    StartTime = eventDto.StartTime,
                    EndTime = eventDto.EndTime,
                    FamilyId = eventDto.FamilyId,
                    IsAllDay = eventDto.IsAllDay,
                    EventType = eventDto.EventType
                });
                
                // Call service to create event
                FamilyCalendarEventDTO? createdEvent = await _calendarService.CreateEventAsync(eventDto, userId);
                
                if (createdEvent == null)
                {
                    _logger.LogWarning("Failed to create event for family {FamilyId}. Service returned null.", familyId);
                    return BadRequest(ApiResponse<FamilyCalendarEventDTO>.BadRequestResponse("Failed to create event. You may not have permission or there was a validation error."));
                }
                
                _logger.LogInformation("Successfully created event {EventId} for family {FamilyId}", createdEvent.Id, familyId);
                return CreatedAtAction(nameof(GetEvent), new { familyId, eventId = createdEvent.Id }, 
                    ApiResponse<FamilyCalendarEventDTO>.SuccessResponse(createdEvent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating event for family {FamilyId}: {ErrorMessage}", familyId, ex.Message);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse("An unexpected error occurred. Please try again."));
            }
        }

        // PUT: api/family/{familyId}/calendar/events/{eventId}
        [HttpPut("events/{eventId}")]
        public async Task<ActionResult<FamilyCalendarEventDTO>> UpdateEvent(int familyId, int eventId, UpdateFamilyCalendarEventDTO eventDto)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                FamilyCalendarEventDTO? updatedEvent = await _calendarService.UpdateEventAsync(eventId, eventDto, userId);
                
                if (updatedEvent == null)
                {
                    return NotFound(ApiResponse<FamilyCalendarEventDTO>.NotFoundResponse("Event not found"));
                }
                
                return Ok(ApiResponse<FamilyCalendarEventDTO>.SuccessResponse(updatedEvent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating event {EventId} for family {FamilyId}", eventId, familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // DELETE: api/family/{familyId}/calendar/events/{eventId}
        [HttpDelete("events/{eventId}")]
        public async Task<ActionResult> DeleteEvent(int familyId, int eventId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                bool result = await _calendarService.DeleteEventAsync(eventId, userId);
                
                if (!result)
                {
                    return NotFound(ApiResponse<object>.NotFoundResponse("Event not found"));
                }
                
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting event {EventId} for family {FamilyId}", eventId, familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // GET: api/family/{familyId}/calendar/events/{eventId}/attendees
        [HttpGet("events/{eventId}/attendees")]
        public async Task<ActionResult<IEnumerable<EventAttendeeDTO>>> GetEventAttendees(int familyId, int eventId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                IEnumerable<EventAttendeeDTO> attendees = await _calendarService.GetEventAttendeesAsync(eventId, userId);
                return Ok(ApiResponse<IEnumerable<EventAttendeeDTO>>.SuccessResponse(attendees));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting attendees for event {EventId}", eventId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // PUT: api/family/{familyId}/calendar/events/attendee-response
        [HttpPut("events/attendee-response")]
        public async Task<ActionResult<EventAttendeeDTO>> UpdateAttendeeResponse(int familyId, UpdateAttendeeResponseDTO responseDto)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                EventAttendeeDTO? updatedAttendee = await _calendarService.UpdateAttendeeResponseAsync(responseDto, userId);
                
                if (updatedAttendee == null)
                {
                    return NotFound(ApiResponse<EventAttendeeDTO>.NotFoundResponse("Attendee not found"));
                }
                
                return Ok(ApiResponse<EventAttendeeDTO>.SuccessResponse(updatedAttendee));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating attendee response");
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // DELETE: api/family/{familyId}/calendar/events/{eventId}/attendees/{attendeeId}
        [HttpDelete("events/{eventId}/attendees/{attendeeId}")]
        public async Task<ActionResult> RemoveAttendee(int familyId, int eventId, int attendeeId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                bool result = await _calendarService.RemoveAttendeeAsync(eventId, attendeeId, userId);
                
                if (!result)
                {
                    return NotFound(ApiResponse<object>.NotFoundResponse("Attendee not found"));
                }
                
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing attendee {AttendeeId} from event {EventId}", attendeeId, eventId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }
        
        // GET: api/family/{familyId}/calendar/events/today
        [HttpGet("events/today")]
        public async Task<ActionResult<IEnumerable<FamilyCalendarEventDTO>>> GetEventsDueToday(int familyId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                IEnumerable<FamilyCalendarEventDTO> events = await _calendarService.GetEventsDueTodayAsync(familyId, userId);
                return Ok(ApiResponse<IEnumerable<FamilyCalendarEventDTO>>.SuccessResponse(events));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting today's events for family {FamilyId}", familyId);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }
    }
} 