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
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.DTOs;
using Microsoft.Extensions.Logging;

namespace TaskTrackerAPI.Controllers.V1
{
    [Authorize]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/focus")]
    [ApiController]
    public class FocusController : BaseApiController
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<FocusController> _logger;

        public FocusController(ApplicationDbContext context, ILogger<FocusController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/v1/focus/current
        [HttpGet("current")]
        public async Task<ActionResult<ApiResponse<FocusSession>>> GetCurrentSession()
        {
            int userId = GetUserId();
            
            var session = await _context.FocusSessions
                .Include(fs => fs.TaskItem)
                .Where(fs => fs.UserId == userId && 
                       (fs.Status == SessionStatus.InProgress || fs.Status == SessionStatus.Paused))
                .OrderByDescending(fs => fs.StartTime)
                .FirstOrDefaultAsync();

            if (session == null)
            {
                return ApiNotFound<FocusSession>("No active focus session found");
            }

            return ApiOk(session);
        }

        // POST: api/v1/focus/start
        [HttpPost("start")]
        public async Task<ActionResult<ApiResponse<FocusSession>>> StartFocusSession([FromBody] FocusSessionCreateDto request)
        {
            if (!ModelState.IsValid)
            {
                return ApiBadRequest<FocusSession>("Invalid focus session data");
            }

            int userId = GetUserId();

            // Check if there's already an active session
            var activeSession = await _context.FocusSessions
                .Where(fs => fs.UserId == userId && 
                       (fs.Status == SessionStatus.InProgress || fs.Status == SessionStatus.Paused))
                .FirstOrDefaultAsync();

            if (activeSession != null)
            {
                return ApiBadRequest<FocusSession>("You already have an active focus session");
            }

            // Check if the task exists and belongs to the user
            var task = await _context.Tasks
                .Where(t => t.Id == request.TaskId && t.UserId == userId)
                .FirstOrDefaultAsync();

            if (task == null)
            {
                return ApiNotFound<FocusSession>("Task not found or does not belong to you");
            }

            // Check if the task belongs to the user
            if (task.UserId != userId)
            {
                return ApiForbidden<FocusSession>($"Task with ID {request.TaskId} does not belong to you");
            }

            var focusSession = new FocusSession
            {
                UserId = userId,
                TaskId = request.TaskId,
                StartTime = DateTime.UtcNow,
                DurationMinutes = request.DurationMinutes > 0 ? request.DurationMinutes : 25, // Default to 25 minutes if not specified
                Status = SessionStatus.InProgress,
                Notes = request.Notes
            };

            _context.FocusSessions.Add(focusSession);
            await _context.SaveChangesAsync();

            // Load the task for the response
            await _context.Entry(focusSession)
                .Reference(fs => fs.TaskItem)
                .LoadAsync();

            return ApiCreated(focusSession);
        }

        // POST: api/v1/focus/{id}/end
        [HttpPost("{id}/end")]
        public async Task<ActionResult<ApiResponse<FocusSession>>> EndFocusSession(int id)
        {
            int userId = GetUserId();
            
            var session = await _context.FocusSessions
                .Include(fs => fs.TaskItem)
                .FirstOrDefaultAsync(fs => fs.Id == id && fs.UserId == userId);

            if (session == null)
            {
                return ApiNotFound<FocusSession>("Focus session not found");
            }

            if (session.Status == SessionStatus.Completed)
            {
                return ApiBadRequest<FocusSession>("This focus session is already completed");
            }

            session.EndTime = DateTime.UtcNow;
            session.Status = SessionStatus.Completed;
            session.IsCompleted = true;
            
            // Calculate actual duration in minutes
            TimeSpan duration = session.EndTime.Value - session.StartTime;
            session.DurationMinutes = (int)Math.Ceiling(duration.TotalMinutes);

            await _context.SaveChangesAsync();
            return ApiOk(session);
        }

        // POST: api/v1/focus/current/end
        [HttpPost("current/end")]
        public async Task<ActionResult<ApiResponse<FocusSession>>> EndCurrentFocusSession()
        {
            int userId = GetUserId();
            
            var session = await _context.FocusSessions
                .Include(fs => fs.TaskItem)
                .Where(fs => fs.UserId == userId && 
                       (fs.Status == SessionStatus.InProgress || fs.Status == SessionStatus.Paused))
                .OrderByDescending(fs => fs.StartTime)
                .FirstOrDefaultAsync();

            if (session == null)
            {
                return ApiNotFound<FocusSession>("No active focus session found");
            }

            session.EndTime = DateTime.UtcNow;
            session.Status = SessionStatus.Completed;
            session.IsCompleted = true;
            
            // Calculate actual duration in minutes
            TimeSpan duration = session.EndTime.Value - session.StartTime;
            session.DurationMinutes = (int)Math.Ceiling(duration.TotalMinutes);

            await _context.SaveChangesAsync();
            return ApiOk(session);
        }

        // POST: api/v1/focus/{id}/pause
        [HttpPost("{id}/pause")]
        public async Task<ActionResult<ApiResponse<FocusSession>>> PauseFocusSession(int id)
        {
            int userId = GetUserId();
            
            var session = await _context.FocusSessions
                .Include(fs => fs.TaskItem)
                .FirstOrDefaultAsync(fs => fs.Id == id && fs.UserId == userId);

            if (session == null)
            {
                return ApiNotFound<FocusSession>("Focus session not found");
            }

            if (session.Status != SessionStatus.InProgress)
            {
                return ApiBadRequest<FocusSession>("Only in-progress sessions can be paused");
            }

            session.Status = SessionStatus.Paused;
            await _context.SaveChangesAsync();
            
            return ApiOk(session);
        }

        // POST: api/v1/focus/current/pause
        [HttpPost("current/pause")]
        public async Task<ActionResult<ApiResponse<FocusSession>>> PauseCurrentFocusSession()
        {
            int userId = GetUserId();
            
            var session = await _context.FocusSessions
                .Include(fs => fs.TaskItem)
                .Where(fs => fs.UserId == userId && fs.Status == SessionStatus.InProgress)
                .OrderByDescending(fs => fs.StartTime)
                .FirstOrDefaultAsync();

            if (session == null)
            {
                return ApiNotFound<FocusSession>("No active focus session found");
            }

            session.Status = SessionStatus.Paused;
            await _context.SaveChangesAsync();
            
            return ApiOk(session);
        }

        // POST: api/v1/focus/{id}/resume
        [HttpPost("{id}/resume")]
        public async Task<ActionResult<ApiResponse<FocusSession>>> ResumeFocusSession(int id)
        {
            int userId = GetUserId();
            
            var session = await _context.FocusSessions
                .Include(fs => fs.TaskItem)
                .FirstOrDefaultAsync(fs => fs.Id == id && fs.UserId == userId);

            if (session == null)
            {
                return ApiNotFound<FocusSession>("Focus session not found");
            }

            if (session.Status != SessionStatus.Paused)
            {
                return ApiBadRequest<FocusSession>("Only paused sessions can be resumed");
            }

            session.Status = SessionStatus.InProgress;
            await _context.SaveChangesAsync();
            
            return ApiOk(session);
        }

        // GET: api/v1/focus/suggestions
        [HttpGet("suggestions")]
        public async Task<ActionResult<ApiResponse<List<TaskItem>>>> GetFocusSuggestions([FromQuery] int count = 5)
        {
            int userId = GetUserId();
            
            var suggestions = await _context.Tasks
                .Where(t => t.UserId == userId && t.Status != TaskItemStatus.Completed)
                .OrderByDescending(t => t.Priority)
                .ThenBy(t => t.DueDate)
                .Take(count)
                .ToListAsync();

            return ApiOk(suggestions);
        }

        // POST: api/v1/focus/distraction
        [HttpPost("distraction")]
        public async Task<ActionResult<ApiResponse<Distraction>>> RecordDistraction([FromBody] DistractionCreateDto request)
        {
            if (!ModelState.IsValid)
            {
                return ApiBadRequest<Distraction>("Invalid distraction data");
            }

            int userId = GetUserId();
            
            // Verify the session exists and belongs to the user
            var session = await _context.FocusSessions
                .FirstOrDefaultAsync(fs => fs.Id == request.SessionId && fs.UserId == userId);

            if (session == null)
            {
                return ApiNotFound<Distraction>("Focus session not found");
            }

            var distraction = new Distraction
            {
                FocusSessionId = request.SessionId,
                Description = request.Description,
                Category = request.Category,
                Timestamp = DateTime.UtcNow
            };

            _context.Distractions.Add(distraction);
            await _context.SaveChangesAsync();

            return ApiCreated(distraction);
        }

        // GET: api/v1/focus/statistics
        [HttpGet("statistics")]
        public async Task<ActionResult<ApiResponse<FocusStatisticsDto>>> GetFocusStatistics([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            int userId = GetUserId();
            
            // Default to last 7 days if no dates provided
            var start = startDate ?? DateTime.UtcNow.AddDays(-7);
            var end = endDate ?? DateTime.UtcNow;

            var sessions = await _context.FocusSessions
                .Where(fs => fs.UserId == userId && fs.StartTime >= start && fs.StartTime <= end)
                .Include(fs => fs.Distractions)
                .ToListAsync();

            var statistics = new FocusStatisticsDto
            {
                TotalMinutesFocused = sessions.Sum(s => s.DurationMinutes),
                SessionCount = sessions.Count,
                DistractionCount = sessions.Sum(s => s.Distractions.Count),
                AverageSessionLength = sessions.Any() ? sessions.Average(s => s.DurationMinutes) : 0,
                DistractionsByCategory = sessions
                    .SelectMany(s => s.Distractions)
                    .GroupBy(d => d.Category)
                    .ToDictionary(g => g.Key, g => g.Count()),
                DailyFocusMinutes = sessions
                    .GroupBy(s => s.StartTime.Date)
                    .ToDictionary(
                        g => g.Key.ToString("yyyy-MM-dd"),
                        g => g.Sum(s => s.DurationMinutes)
                    )
            };

            return ApiOk(statistics);
        }

        // GET: api/v1/focus/history
        [HttpGet("history")]
        public async Task<ActionResult<ApiResponse<List<FocusSession>>>> GetFocusHistory()
        {
            int userId = GetUserId();
            
            var history = await _context.FocusSessions
                .Include(fs => fs.TaskItem)
                .Where(fs => fs.UserId == userId)
                .OrderByDescending(fs => fs.StartTime)
                .Take(50) // Limit to 50 most recent sessions
                .ToListAsync();

            return ApiOk(history);
        }

        // GET: api/v1/focus/{id}/distractions
        [HttpGet("{id}/distractions")]
        public async Task<ActionResult<ApiResponse<List<Distraction>>>> GetSessionDistractions(int id)
        {
            int userId = GetUserId();
            
            // Verify the session exists and belongs to the user
            var session = await _context.FocusSessions
                .FirstOrDefaultAsync(fs => fs.Id == id && fs.UserId == userId);

            if (session == null)
            {
                return ApiNotFound<List<Distraction>>("Focus session not found");
            }

            var distractions = await _context.Distractions
                .Where(d => d.FocusSessionId == id)
                .OrderBy(d => d.Timestamp)
                .ToListAsync();

            return ApiOk(distractions);
        }

        // GET: api/v1/focus/test
        [HttpGet("test")]
        [AllowAnonymous]
        public ActionResult<ApiResponse<dynamic>> TestEndpoint()
        {
            int? userId = null;
            
            try
            {
                userId = GetUserId();
            }
            catch (Exception ex)
            {
                // Just log the exception, don't throw
                _logger.LogError(ex, "Error getting user ID");
            }
            
            return ApiOk<dynamic>(new 
            {
                Message = "Focus API test endpoint is working",
                IsAuthenticated = User.Identity?.IsAuthenticated ?? false,
                UserId = userId,
                UserClaims = User.Claims.Select(c => new { Type = c.Type, Value = c.Value }).ToList()
            });
        }
    }
} 