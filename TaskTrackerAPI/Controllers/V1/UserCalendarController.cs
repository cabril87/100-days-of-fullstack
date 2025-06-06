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
using TaskTrackerAPI.DTOs.User;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Extensions;
using TaskTrackerAPI.Controllers.V2;

namespace TaskTrackerAPI.Controllers.V1
{
    [ApiVersion("1.0")]
    [Authorize]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class UserCalendarController : BaseApiController
    {
        private readonly IUserCalendarService _userCalendarService;
        private readonly ILogger<UserCalendarController> _logger;

        public UserCalendarController(
            IUserCalendarService userCalendarService,
            ILogger<UserCalendarController> logger)
        {
            _userCalendarService = userCalendarService;
            _logger = logger;
        }

        // GET: api/user/calendar/all-families
        [HttpGet("all-families")]
        public async Task<ActionResult<UserGlobalCalendarDTO>> GetAllFamiliesCalendar()
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                UserGlobalCalendarDTO globalCalendar = await _userCalendarService.GetUserGlobalCalendarAsync(userId);
                return Ok(ApiResponse<UserGlobalCalendarDTO>.SuccessResponse(globalCalendar));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting global calendar for user");
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // GET: api/user/calendar/all-families/events
        [HttpGet("all-families/events")]
        public async Task<ActionResult<IEnumerable<FamilyCalendarEventWithFamilyDTO>>> GetAllFamiliesEvents()
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                IEnumerable<FamilyCalendarEventWithFamilyDTO> events = await _userCalendarService.GetAllUserEventsAsync(userId);
                return Ok(ApiResponse<IEnumerable<FamilyCalendarEventWithFamilyDTO>>.SuccessResponse(events));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all family events for user");
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // GET: api/user/calendar/all-families/events/range?startDate=2025-05-01&endDate=2025-05-31
        [HttpGet("all-families/events/range")]
        public async Task<ActionResult<IEnumerable<FamilyCalendarEventWithFamilyDTO>>> GetAllFamiliesEventsInRange(
            [FromQuery] DateTime startDate, 
            [FromQuery] DateTime endDate)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                IEnumerable<FamilyCalendarEventWithFamilyDTO> events = await _userCalendarService.GetAllUserEventsInRangeAsync(userId, startDate, endDate);
                return Ok(ApiResponse<IEnumerable<FamilyCalendarEventWithFamilyDTO>>.SuccessResponse(events));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all family events in range for user");
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // GET: api/user/calendar/all-families/events/today
        [HttpGet("all-families/events/today")]
        public async Task<ActionResult<IEnumerable<FamilyCalendarEventWithFamilyDTO>>> GetAllFamiliesEventsToday()
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                IEnumerable<FamilyCalendarEventWithFamilyDTO> events = await _userCalendarService.GetAllUserEventsTodayAsync(userId);
                return Ok(ApiResponse<IEnumerable<FamilyCalendarEventWithFamilyDTO>>.SuccessResponse(events));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting today's events for user");
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // GET: api/user/calendar/all-families/events/upcoming?days=7
        [HttpGet("all-families/events/upcoming")]
        public async Task<ActionResult<IEnumerable<FamilyCalendarEventWithFamilyDTO>>> GetAllFamiliesUpcomingEvents(
            [FromQuery] int days = 7)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                IEnumerable<FamilyCalendarEventWithFamilyDTO> events = await _userCalendarService.GetAllUserUpcomingEventsAsync(userId, days);
                return Ok(ApiResponse<IEnumerable<FamilyCalendarEventWithFamilyDTO>>.SuccessResponse(events));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting upcoming events for user");
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // GET: api/user/calendar/families-summary
        [HttpGet("families-summary")]
        public async Task<ActionResult<IEnumerable<UserFamilyCalendarSummaryDTO>>> GetFamiliesCalendarSummary()
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                IEnumerable<UserFamilyCalendarSummaryDTO> summaries = await _userCalendarService.GetUserFamiliesCalendarSummaryAsync(userId);
                return Ok(ApiResponse<IEnumerable<UserFamilyCalendarSummaryDTO>>.SuccessResponse(summaries));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting families calendar summary for user");
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // GET: api/user/calendar/availability?date=2025-05-01
        [HttpGet("availability")]
        public async Task<ActionResult<UserAvailabilityDTO>> GetUserAvailability([FromQuery] DateTime? date = null)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                DateTime targetDate = date ?? DateTime.Today;
                UserAvailabilityDTO availability = await _userCalendarService.GetUserAvailabilityAsync(userId, targetDate);
                return Ok(ApiResponse<UserAvailabilityDTO>.SuccessResponse(availability));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user availability");
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // GET: api/user/calendar/conflicts
        [HttpGet("conflicts")]
        public async Task<ActionResult<IEnumerable<CalendarConflictDTO>>> GetUserCalendarConflicts()
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                IEnumerable<CalendarConflictDTO> conflicts = await _userCalendarService.GetUserCalendarConflictsAsync(userId);
                return Ok(ApiResponse<IEnumerable<CalendarConflictDTO>>.SuccessResponse(conflicts));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user calendar conflicts");
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // GET: api/user/calendar/statistics
        [HttpGet("statistics")]
        public async Task<ActionResult<UserCalendarStatisticsDTO>> GetUserCalendarStatistics()
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                UserCalendarStatisticsDTO statistics = await _userCalendarService.GetUserCalendarStatisticsAsync(userId);
                return Ok(ApiResponse<UserCalendarStatisticsDTO>.SuccessResponse(statistics));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user calendar statistics");
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }
    }
} 