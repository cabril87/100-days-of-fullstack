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
using TaskTrackerAPI.DTOs.Focus;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Controllers.V2;
using TaskTrackerAPI.Attributes;

namespace TaskTrackerAPI.Controllers.V1
{

    /// <summary>
    /// Focus session management controller - handles deep work sessions, productivity tracking, and distraction management.
    /// Accessible to all authenticated users (RegularUser and above).
    /// Integrates with gamification system for focus-based achievements and rewards.
    /// </summary>
    [Authorize]
    [RequireRole(UserRole.RegularUser)] // All authenticated users can access focus features  
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    public class FocusController : BaseApiController
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<FocusController> _logger;
        private readonly IGamificationService _gamificationService;

        public FocusController(ApplicationDbContext context, ILogger<FocusController> logger, IGamificationService gamificationService)
        {
            _context = context;
            _logger = logger;
            _gamificationService = gamificationService;
        }

        // GET: api/v1/focus/current
        [HttpGet("current")]
        public async Task<ActionResult<ApiResponse<FocusSession>>> GetCurrentSession()
        {
            int userId = GetUserId();
            
            FocusSession? session = await _context.FocusSessions
                .Where(fs => fs.UserId == userId && 
                       (fs.Status == SessionStatus.InProgress || fs.Status == SessionStatus.Paused))
                .Include(fs => fs.TaskItem)
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
            FocusSession? activeSession = await _context.FocusSessions
                .Where(fs => fs.UserId == userId && 
                       (fs.Status == SessionStatus.InProgress || fs.Status == SessionStatus.Paused))
                .FirstOrDefaultAsync();

            if (activeSession != null)
            {
                // Check if the request explicitly wants to force start (end existing and start new)
                if (request.ForceStart == true)
                {
                    // End the existing session
                    activeSession.EndTime = DateTime.UtcNow;
                    activeSession.Status = SessionStatus.Completed;
                    activeSession.IsCompleted = true;
                    
                    // Calculate duration for the ended session
                    TimeSpan duration = activeSession.EndTime.Value - activeSession.StartTime;
                    activeSession.DurationMinutes = (int)Math.Ceiling(duration.TotalMinutes);
                    
                    _logger.LogInformation("Ended existing session {SessionId} to start new session for user {UserId}", 
                        activeSession.Id, userId);
                }
                else
                {
                    // Return error with details about the existing session
                    return ApiBadRequest<FocusSession>(
                        $"You already have an active focus session (ID: {activeSession.Id}, Task: {activeSession.TaskId}, Status: {activeSession.Status}). " +
                        "End it first or use forceStart=true to automatically end it and start a new session.");
                }
            }

            // Check if the task exists and belongs to the user
            TaskItem? task = await _context.Tasks
                .Where(t => t.Id == request.TaskId && t.UserId == userId)
                .FirstOrDefaultAsync();

            if (task == null)
            {
                return ApiNotFound<FocusSession>("Task not found or does not belong to you");
            }

            FocusSession focusSession = new FocusSession
            {
                UserId = userId,
                TaskId = request.TaskId,
                StartTime = DateTime.UtcNow,
                DurationMinutes = 0, // Will be calculated when session ends
                Status = SessionStatus.InProgress,
                Notes = request.Notes,
                IsCompleted = false,
                TaskProgressBefore = task.ProgressPercentage // Record initial task progress
            };

            _context.FocusSessions.Add(focusSession);
            await _context.SaveChangesAsync();

            // Load the task for the response
            await _context.Entry(focusSession)
                .Reference(fs => fs.TaskItem)
                .LoadAsync();

            _logger.LogInformation("Started new focus session {SessionId} for user {UserId} on task {TaskId}", 
                focusSession.Id, userId, request.TaskId);

            return ApiCreated(focusSession);
        }

        // POST: api/v1/focus/switch
        [HttpPost("switch")]
        public async Task<ActionResult<ApiResponse<FocusSession>>> SwitchFocusSession([FromBody] FocusSessionCreateDto request)
        {
            if (!ModelState.IsValid)
            {
                return ApiBadRequest<FocusSession>("Invalid focus session data");
            }

            int userId = GetUserId();

            // Find and end any active session
            FocusSession? activeSession = await _context.FocusSessions
                .Where(fs => fs.UserId == userId && 
                       (fs.Status == SessionStatus.InProgress || fs.Status == SessionStatus.Paused))
                .FirstOrDefaultAsync();

            if (activeSession != null)
            {
                // End the existing session
                activeSession.EndTime = DateTime.UtcNow;
                activeSession.Status = SessionStatus.Completed;
                activeSession.IsCompleted = true;
                
                // Calculate duration for the ended session
                TimeSpan duration = activeSession.EndTime.Value - activeSession.StartTime;
                activeSession.DurationMinutes = (int)Math.Ceiling(duration.TotalMinutes);
                
                _logger.LogInformation("Ended existing session {SessionId} to switch to new session for user {UserId}", 
                    activeSession.Id, userId);
            }

            // Check if the task exists and belongs to the user
            TaskItem? task = await _context.Tasks
                .Where(t => t.Id == request.TaskId && t.UserId == userId)
                .FirstOrDefaultAsync();

            if (task == null)
            {
                return ApiNotFound<FocusSession>("Task not found or does not belong to you");
            }

            FocusSession focusSession = new FocusSession
            {
                UserId = userId,
                TaskId = request.TaskId,
                StartTime = DateTime.UtcNow,
                DurationMinutes = 0, // Will be calculated when session ends
                Status = SessionStatus.InProgress,
                Notes = request.Notes,
                IsCompleted = false,
                TaskProgressBefore = task.ProgressPercentage // Record initial task progress
            };

            _context.FocusSessions.Add(focusSession);
            await _context.SaveChangesAsync();

            // Load the task for the response
            await _context.Entry(focusSession)
                .Reference(fs => fs.TaskItem)
                .LoadAsync();

            _logger.LogInformation("Started new focus session {SessionId} for user {UserId} on task {TaskId} (switched from previous session)", 
                focusSession.Id, userId, request.TaskId);

            return ApiCreated(focusSession);
        }

        // POST: api/v1/focus/{id}/end
        [HttpPost("{id}/end")]
        public async Task<ActionResult<ApiResponse<FocusSession>>> EndFocusSession(int id)
        {
            int userId = GetUserId();
            
            FocusSession? session = await _context.FocusSessions
                .Where(fs => fs.Id == id && fs.UserId == userId)
                .Include(fs => fs.TaskItem)
                .FirstOrDefaultAsync();

            if (session == null)
            {
                return ApiNotFound<FocusSession>("Focus session not found");
            }

            if (session.Status == SessionStatus.Completed)
            {
                return ApiBadRequest<FocusSession>("Focus session is already completed");
            }

            session.EndTime = DateTime.UtcNow;
            session.Status = SessionStatus.Completed;
            session.IsCompleted = true;
            
            // Calculate actual duration in minutes
            TimeSpan duration = session.EndTime.Value - session.StartTime;
            session.DurationMinutes = (int)Math.Ceiling(duration.TotalMinutes);

            // Update task's actual time spent (accumulate from all focus sessions)
            int totalTimeSpent = await _context.FocusSessions
                .Where(fs => fs.TaskId == session.TaskItem!.Id && fs.Status == SessionStatus.Completed)
                .SumAsync(fs => fs.DurationMinutes);
            
            session.TaskItem!.ActualTimeSpentMinutes = totalTimeSpent + session.DurationMinutes;

            await _context.SaveChangesAsync();

            // ✅ NEW: Integrate with gamification service for basic session completion
            try
            {
                var focusReward = await _gamificationService.ProcessFocusSessionCompletionAsync(
                    userId, 
                    session.Id, 
                    session.DurationMinutes, 
                    true
                );

                await _gamificationService.ProcessAchievementUnlocksAsync(
                    userId, 
                    "focus_session", 
                    session.Id
                );

                _logger.LogInformation("Focus session {SessionId} gamification completed: {Points} points, {XP} XP", 
                    session.Id, focusReward.PointsAwarded, focusReward.CharacterXPAwarded);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing focus session gamification for session {SessionId}", session.Id);
            }
            
            return ApiOk(session);
        }

        // PUT: api/v1/focus/{id}/complete
        [HttpPut("{id}/complete")]
        public async Task<ActionResult<ApiResponse<FocusSession>>> CompleteSessionWithDetails(int id, [FromBody] FocusSessionCompleteDto completeDto)
        {
            int userId = GetUserId();
            
            var sessionData = await _context.FocusSessions
                .Where(fs => fs.Id == id && fs.UserId == userId)
                .Select(fs => new {
                    Session = fs,
                    TaskItem = new TaskItem {
                        Id = fs.TaskItem.Id,
                        Title = fs.TaskItem.Title,
                        Description = fs.TaskItem.Description,
                        Status = fs.TaskItem.Status,
                        DueDate = fs.TaskItem.DueDate,
                        Priority = fs.TaskItem.Priority,
                        CreatedAt = fs.TaskItem.CreatedAt,
                        UpdatedAt = fs.TaskItem.UpdatedAt,
                        IsCompleted = fs.TaskItem.IsCompleted,
                        UserId = fs.TaskItem.UserId,
                        ProgressPercentage = fs.TaskItem.ProgressPercentage,
                        ActualTimeSpentMinutes = fs.TaskItem.ActualTimeSpentMinutes,
                        Category = fs.TaskItem.Category
                    }
                })
                .FirstOrDefaultAsync();

            if (sessionData == null)
            {
                return ApiNotFound<FocusSession>("Focus session not found");
            }

            FocusSession session = sessionData.Session;
            TaskItem task = sessionData.TaskItem;
            session.TaskItem = task;

            if (session.Status == SessionStatus.Completed)
            {
                return ApiBadRequest<FocusSession>("Focus session is already completed");
            }

            // Record initial task progress if not already set
            if (session.TaskProgressBefore == 0 && task.ProgressPercentage > 0)
            {
                session.TaskProgressBefore = task.ProgressPercentage;
            }

            // End the session
            session.EndTime = DateTime.UtcNow;
            session.Status = SessionStatus.Completed;
            session.IsCompleted = true;
            
            // Calculate actual duration in minutes
            TimeSpan duration = session.EndTime.Value - session.StartTime;
            session.DurationMinutes = (int)Math.Ceiling(duration.TotalMinutes);

            // Add session completion details
            session.SessionQualityRating = completeDto.SessionQualityRating;
            session.CompletionNotes = completeDto.CompletionNotes;
            session.TaskProgressAfter = completeDto.TaskProgressAfter ?? task.ProgressPercentage;
            session.TaskCompletedDuringSession = completeDto.TaskCompletedDuringSession;

            // Update task progress and completion if specified
            if (completeDto.TaskProgressAfter.HasValue)
            {
                task.ProgressPercentage = completeDto.TaskProgressAfter.Value;
                task.UpdatedAt = DateTime.UtcNow;
            }

            if (completeDto.TaskCompletedDuringSession)
            {
                task.Status = TaskItemStatus.Completed;
                task.IsCompleted = true;
                task.CompletedAt = DateTime.UtcNow;
                task.ProgressPercentage = 100;
            }

            // Update task's actual time spent (accumulate from all focus sessions)
            int totalTimeSpent = await _context.FocusSessions
                .Where(fs => fs.TaskId == task.Id && fs.Status == SessionStatus.Completed)
                .SumAsync(fs => fs.DurationMinutes);
            
            task.ActualTimeSpentMinutes = totalTimeSpent + session.DurationMinutes;

            await _context.SaveChangesAsync();

            // ✅ NEW: Integrate with gamification service for achievements and points
            try
            {
                // Process focus session completion for points and achievements
                var focusReward = await _gamificationService.ProcessFocusSessionCompletionAsync(
                    userId, 
                    session.Id, 
                    session.DurationMinutes, 
                    true
                );

                // Process achievement unlocks specifically for focus sessions
                var additionalData = new Dictionary<string, object>
                {
                    ["durationMinutes"] = session.DurationMinutes,
                    ["qualityRating"] = session.SessionQualityRating ?? 0,
                    ["taskCompleted"] = completeDto.TaskCompletedDuringSession
                };

                await _gamificationService.ProcessAchievementUnlocksAsync(
                    userId, 
                    "focus_session", 
                    session.Id, 
                    additionalData
                );

                _logger.LogInformation("Focus session {SessionId} gamification completed: {Points} points, {XP} XP", 
                    session.Id, focusReward.PointsAwarded, focusReward.CharacterXPAwarded);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing focus session gamification for session {SessionId}", session.Id);
                // Don't fail the whole request if gamification fails
            }
            
            _logger.LogInformation("Focus session {SessionId} completed with quality rating {Quality} by user {UserId}", 
                session.Id, session.SessionQualityRating, userId);
            
            return ApiOk(session);
        }

        // POST: api/v1/focus/current/end
        [HttpPost("current/end")]
        public async Task<ActionResult<ApiResponse<FocusSession>>> EndCurrentFocusSession()
        {
            int userId = GetUserId();
            
            var sessionData = await _context.FocusSessions
                .Where(fs => fs.UserId == userId && 
                       (fs.Status == SessionStatus.InProgress || fs.Status == SessionStatus.Paused))
                .OrderByDescending(fs => fs.StartTime)
                .Select(fs => new {
                    Session = fs,
                    TaskItem = new TaskItem {
                        Id = fs.TaskItem.Id,
                        Title = fs.TaskItem.Title,
                        Description = fs.TaskItem.Description,
                        Status = fs.TaskItem.Status,
                        DueDate = fs.TaskItem.DueDate,
                        Priority = fs.TaskItem.Priority,
                        CreatedAt = fs.TaskItem.CreatedAt,
                        UpdatedAt = fs.TaskItem.UpdatedAt,
                        IsCompleted = fs.TaskItem.IsCompleted,
                        UserId = fs.TaskItem.UserId,
                        ProgressPercentage = fs.TaskItem.ProgressPercentage,
                        ActualTimeSpentMinutes = fs.TaskItem.ActualTimeSpentMinutes
                    }
                })
                .FirstOrDefaultAsync();

            if (sessionData == null)
            {
                return ApiNotFound<FocusSession>("No active focus session found");
            }

            FocusSession session = sessionData.Session;
            TaskItem task = sessionData.TaskItem;
            session.TaskItem = task;

            session.EndTime = DateTime.UtcNow;
            session.Status = SessionStatus.Completed;
            session.IsCompleted = true;
            
            // Calculate actual duration in minutes
            TimeSpan duration = session.EndTime.Value - session.StartTime;
            session.DurationMinutes = (int)Math.Ceiling(duration.TotalMinutes);

            // Update task's actual time spent (accumulate from all focus sessions)
            int totalTimeSpent = await _context.FocusSessions
                .Where(fs => fs.TaskId == task.Id && fs.Status == SessionStatus.Completed)
                .SumAsync(fs => fs.DurationMinutes);
            
            task.ActualTimeSpentMinutes = totalTimeSpent + session.DurationMinutes;

            await _context.SaveChangesAsync();

            // ✅ NEW: Integrate with gamification service for basic session completion
            try
            {
                var focusReward = await _gamificationService.ProcessFocusSessionCompletionAsync(
                    userId, 
                    session.Id, 
                    session.DurationMinutes, 
                    true
                );

                await _gamificationService.ProcessAchievementUnlocksAsync(
                    userId, 
                    "focus_session", 
                    session.Id
                );

                _logger.LogInformation("Focus session {SessionId} gamification completed: {Points} points, {XP} XP", 
                    session.Id, focusReward.PointsAwarded, focusReward.CharacterXPAwarded);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing focus session gamification for session {SessionId}", session.Id);
            }

            return ApiOk(session);
        }

        // POST: api/v1/focus/{id}/pause
        [HttpPost("{id}/pause")]
        public async Task<ActionResult<ApiResponse<FocusSession>>> PauseFocusSession(int id)
        {
            int userId = GetUserId();
            
            var sessionData = await _context.FocusSessions
                .Where(fs => fs.Id == id && fs.UserId == userId)
                .Select(fs => new {
                    Session = fs,
                    TaskItem = new TaskItem {
                        Id = fs.TaskItem.Id,
                        Title = fs.TaskItem.Title,
                        Description = fs.TaskItem.Description,
                        Status = fs.TaskItem.Status,
                        DueDate = fs.TaskItem.DueDate,
                        Priority = fs.TaskItem.Priority,
                        CreatedAt = fs.TaskItem.CreatedAt,
                        UpdatedAt = fs.TaskItem.UpdatedAt,
                        IsCompleted = fs.TaskItem.IsCompleted,
                        UserId = fs.TaskItem.UserId,
                        // Don't include AssignedToName
                    }
                })
                .FirstOrDefaultAsync();

            if (sessionData == null)
            {
                return ApiNotFound<FocusSession>("Focus session not found");
            }

            FocusSession session = sessionData.Session;
            session.TaskItem = sessionData.TaskItem;

            if (session.Status != SessionStatus.InProgress)
            {
                return ApiBadRequest<FocusSession>("Only in-progress sessions can be paused");
            }

            // Calculate and accumulate duration up to this point
            TimeSpan currentDuration = DateTime.UtcNow - session.StartTime;
            session.DurationMinutes += (int)Math.Ceiling(currentDuration.TotalMinutes);
            
            // Update start time to now (for when we resume)
            session.StartTime = DateTime.UtcNow;
            session.Status = SessionStatus.Paused;
            
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Paused focus session {SessionId} for user {UserId}, accumulated duration: {Duration} minutes", 
                session.Id, userId, session.DurationMinutes);
            
            return ApiOk(session);
        }

        // POST: api/v1/focus/current/pause
        [HttpPost("current/pause")]
        public async Task<ActionResult<ApiResponse<FocusSession>>> PauseCurrentFocusSession()
        {
            int userId = GetUserId();
            
            var sessionData = await _context.FocusSessions
                .Where(fs => fs.UserId == userId && fs.Status == SessionStatus.InProgress)
                .OrderByDescending(fs => fs.StartTime)
                .Select(fs => new {
                    Session = fs,
                    TaskItem = new TaskItem {
                        Id = fs.TaskItem.Id,
                        Title = fs.TaskItem.Title,
                        Description = fs.TaskItem.Description,
                        Status = fs.TaskItem.Status,
                        DueDate = fs.TaskItem.DueDate,
                        Priority = fs.TaskItem.Priority,
                        CreatedAt = fs.TaskItem.CreatedAt,
                        UpdatedAt = fs.TaskItem.UpdatedAt,
                        IsCompleted = fs.TaskItem.IsCompleted,
                        UserId = fs.TaskItem.UserId,
                        // Don't include AssignedToName
                    }
                })
                .FirstOrDefaultAsync();

            if (sessionData == null)
            {
                return ApiNotFound<FocusSession>("No active focus session found");
            }

            FocusSession session = sessionData.Session;
            session.TaskItem = sessionData.TaskItem;

            // Calculate and accumulate duration up to this point
            TimeSpan currentDuration = DateTime.UtcNow - session.StartTime;
            session.DurationMinutes += (int)Math.Ceiling(currentDuration.TotalMinutes);
            
            // Update start time to now (for when we resume)
            session.StartTime = DateTime.UtcNow;
            session.Status = SessionStatus.Paused;
            
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Paused current focus session {SessionId} for user {UserId}, accumulated duration: {Duration} minutes", 
                session.Id, userId, session.DurationMinutes);
            
            return ApiOk(session);
        }

        // POST: api/v1/focus/{id}/resume
        [HttpPost("{id}/resume")]
        public async Task<ActionResult<ApiResponse<FocusSession>>> ResumeFocusSession(int id)
        {
            int userId = GetUserId();
            
            var sessionData = await _context.FocusSessions
                .Where(fs => fs.Id == id && fs.UserId == userId)
                .Select(fs => new {
                    Session = fs,
                    TaskItem = new TaskItem {
                        Id = fs.TaskItem.Id,
                        Title = fs.TaskItem.Title,
                        Description = fs.TaskItem.Description,
                        Status = fs.TaskItem.Status,
                        DueDate = fs.TaskItem.DueDate,
                        Priority = fs.TaskItem.Priority,
                        CreatedAt = fs.TaskItem.CreatedAt,
                        UpdatedAt = fs.TaskItem.UpdatedAt,
                        IsCompleted = fs.TaskItem.IsCompleted,
                        UserId = fs.TaskItem.UserId,
                        // Don't include AssignedToName
                    }
                })
                .FirstOrDefaultAsync();

            if (sessionData == null)
            {
                return ApiNotFound<FocusSession>("Focus session not found");
            }

            FocusSession session = sessionData.Session;
            session.TaskItem = sessionData.TaskItem;

            if (session.Status != SessionStatus.Paused)
            {
                return ApiBadRequest<FocusSession>("Only paused sessions can be resumed");
            }

            // Reset start time to now for duration calculation
            session.StartTime = DateTime.UtcNow;
            session.Status = SessionStatus.InProgress;
            
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Resumed focus session {SessionId} for user {UserId}, previous accumulated duration: {Duration} minutes", 
                session.Id, userId, session.DurationMinutes);
            
            return ApiOk(session);
        }

        // GET: api/v1/focus/suggestions
        [HttpGet("suggestions")]
        public async Task<ActionResult<ApiResponse<List<TaskItem>>>> GetFocusSuggestions([FromQuery] int count = 5)
        {
            int userId = GetUserId();
            
            List<TaskItem> suggestions = await _context.Tasks
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
            FocusSession? session = await _context.FocusSessions
                .FirstOrDefaultAsync(fs => fs.Id == request.SessionId && fs.UserId == userId);

            if (session == null)
            {
                return ApiNotFound<Distraction>("Focus session not found");
            }

            Distraction distraction = new Distraction
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
            
            try
            {
                // Default to last 7 days if no dates provided
                DateTime start = startDate ?? DateTime.UtcNow.AddDays(-7);
                DateTime end = endDate ?? DateTime.UtcNow;

                List<FocusSession> sessions = await _context.FocusSessions
                    .Where(fs => fs.UserId == userId && fs.StartTime >= start && fs.StartTime <= end)
                    .Include(fs => fs.Distractions)
                    .ToListAsync();

                // Handle case where user has no focus sessions yet
                if (!sessions.Any())
                {
                    return ApiOk(new FocusStatisticsDto
                    {
                        TotalMinutesFocused = 0,
                        SessionCount = 0,
                        DistractionCount = 0,
                        AverageSessionLength = 0,
                        DistractionsByCategory = new Dictionary<string, int>(),
                        DailyFocusMinutes = new Dictionary<string, int>()
                    });
                }

                FocusStatisticsDto statistics = new FocusStatisticsDto
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting focus statistics for user {UserId}", userId);
                return ApiServerError<FocusStatisticsDto>("Failed to retrieve focus statistics");
            }
        }

        // GET: api/v1/focus/history
        [HttpGet("history")]
        public async Task<ActionResult<ApiResponse<List<FocusSession>>>> GetFocusHistory()
        {
            int userId = GetUserId();
            
            var historySessions = await _context.FocusSessions
                .Where(fs => fs.UserId == userId)
                .OrderByDescending(fs => fs.StartTime)
                .Take(50) // Limit to 50 most recent sessions
                .Select(fs => new {
                    Session = fs,
                    TaskItem = new TaskItem {
                        Id = fs.TaskItem.Id,
                        Title = fs.TaskItem.Title,
                        Description = fs.TaskItem.Description,
                        Status = fs.TaskItem.Status,
                        DueDate = fs.TaskItem.DueDate,
                        Priority = fs.TaskItem.Priority,
                        CreatedAt = fs.TaskItem.CreatedAt,
                        UpdatedAt = fs.TaskItem.UpdatedAt,
                        IsCompleted = fs.TaskItem.IsCompleted,
                        UserId = fs.TaskItem.UserId,
                        // Don't include AssignedToName
                    }
                })
                .ToListAsync();

            // Create list of sessions with manually assigned TaskItems
            List<FocusSession> history = historySessions.Select(data => {
                FocusSession session = data.Session;
                session.TaskItem = data.TaskItem;
                return session;
            }).ToList();

            return ApiOk(history);
        }

        // GET: api/v1/focus/{id}/distractions
        [HttpGet("{id}/distractions")]
        public async Task<ActionResult<ApiResponse<List<Distraction>>>> GetSessionDistractions(int id)
        {
            int userId = GetUserId();
            
            // Verify the session exists and belongs to the user
            FocusSession? session = await _context.FocusSessions
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

        // GET: api/v1/focus/insights
        [HttpGet("insights")]
        public async Task<ActionResult<ApiResponse<ProductivityInsightsDto>>> GetProductivityInsights([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            int userId = GetUserId();
            
            // Default to last 30 days if no dates provided
            DateTime start = startDate ?? DateTime.UtcNow.AddDays(-30);
            DateTime end = endDate ?? DateTime.UtcNow;

            try
            {
                // Get focus sessions for the date range with all necessary includes
                List<FocusSession> sessions = await _context.FocusSessions
                    .Where(fs => fs.UserId == userId && 
                                 fs.StartTime >= start && 
                                 fs.StartTime <= end &&
                                 fs.EndTime.HasValue)
                    .Include(fs => fs.TaskItem)
                        .ThenInclude(t => t != null ? t.Category : null)
                    .Include(fs => fs.Distractions) // Include distractions for correlation analysis
                    .OrderBy(fs => fs.StartTime)
                    .ToListAsync();

                // Handle case where user has no focus sessions yet
                if (!sessions.Any())
                {
                    return ApiOk(new ProductivityInsightsDto
                    {
                        TimeOfDayPatterns = new TimeOfDayInsights
                        {
                            HourlyQualityRatings = new Dictionary<int, double>(),
                            HourlySessionCounts = new Dictionary<int, int>(),
                            HourlyAverageLength = new Dictionary<int, double>(),
                            HourlyCompletionRates = new Dictionary<int, double>(),
                            BestFocusHour = 9, // Default suggestion
                            WorstFocusHour = 15,
                            BestHourQuality = 0,
                            WorstHourQuality = 0
                        },
                        StreakData = new FocusStreakData
                        {
                            CurrentStreak = 0,
                            LongestStreak = 0,
                            QualityStreak = 0,
                            StreakHistory = new List<StreakPeriod>(),
                            StreakImpactOnProductivity = 0
                        },
                        Correlations = new CorrelationInsights
                        {
                            SessionLengthQualityCorrelation = 0,
                            DistractionQualityCorrelation = 0,
                            TaskProgressSessionQualityCorrelation = 0,
                            CompletionRateQualityCorrelation = 0
                        },
                        TaskTypeInsights = CalculateEmptyTaskTypeInsights(),
                        Recommendations = new List<ProductivityRecommendation>
                        {
                            new ProductivityRecommendation
                            {
                                Id = "getting_started",
                                Title = "Start Your Focus Journey",
                                Description = "Begin with a 25-minute focus session to establish your productivity baseline.",
                                Category = "Getting Started",
                                Priority = 1,
                                Data = new Dictionary<string, object> { { "actionSuggested", "Start your first focus session with any task" } }
                            }
                        }
                    });
                }

                // Calculate insights with existing data
                ProductivityInsightsDto insights = new ProductivityInsightsDto
                {
                    TimeOfDayPatterns = CalculateTimeOfDayInsights(sessions),
                    StreakData = await CalculateFocusStreakData(userId, sessions),
                    Correlations = CalculateCorrelationInsights(sessions),
                    TaskTypeInsights = CalculateTaskTypeInsights(sessions),
                    Recommendations = GenerateRecommendations(sessions)
                };

                return ApiOk(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting productivity insights for user {UserId}. Start: {StartDate}, End: {EndDate}", userId, start, end);
                return ApiServerError<ProductivityInsightsDto>("Failed to retrieve productivity insights");
            }
        }

        private TimeOfDayInsights CalculateTimeOfDayInsights(List<FocusSession> sessions)
        {
            TimeOfDayInsights insights = new TimeOfDayInsights();
            
            Dictionary<int, HourlySessionDataDTO> hourlyData = sessions
                .GroupBy(s => s.StartTime.Hour)
                .ToDictionary(
                    g => g.Key,
                    g => new HourlySessionDataDTO
                    {
                        Count = g.Count(),
                        AvgQuality = g.Where(s => s.SessionQualityRating.HasValue).DefaultIfEmpty()
                                   .Average(s => s?.SessionQualityRating ?? 0),
                        AvgLength = g.Average(s => s.DurationMinutes),
                        CompletionRate = g.Count(s => s.TaskCompletedDuringSession) / (double)g.Count() * 100
                    });

            insights.HourlyQualityRatings = hourlyData.ToDictionary(kv => kv.Key, kv => kv.Value.AvgQuality);
            insights.HourlySessionCounts = hourlyData.ToDictionary(kv => kv.Key, kv => kv.Value.Count);
            insights.HourlyAverageLength = hourlyData.ToDictionary(kv => kv.Key, kv => kv.Value.AvgLength);
            insights.HourlyCompletionRates = hourlyData.ToDictionary(kv => kv.Key, kv => kv.Value.CompletionRate);

            if (hourlyData.Any())
            {
                KeyValuePair<int, HourlySessionDataDTO> bestHour = hourlyData.OrderByDescending(kv => kv.Value.AvgQuality).First();
                KeyValuePair<int, HourlySessionDataDTO> worstHour = hourlyData.OrderBy(kv => kv.Value.AvgQuality).First();
                
                insights.BestFocusHour = bestHour.Key;
                insights.BestHourQuality = bestHour.Value.AvgQuality;
                insights.WorstFocusHour = worstHour.Key;
                insights.WorstHourQuality = worstHour.Value.AvgQuality;
            }

            return insights;
        }

        private async Task<FocusStreakData> CalculateFocusStreakData(int userId, List<FocusSession> sessions)
        {
            FocusStreakData streakData = new FocusStreakData();
            
            // Get all sessions for streak calculation (not just current date range)
            List<FocusSession> allSessions = await _context.FocusSessions
                .Where(fs => fs.UserId == userId && fs.Status == SessionStatus.Completed)
                .OrderBy(fs => fs.StartTime.Date)
                .ToListAsync();

            Dictionary<DateTime, List<FocusSession>> sessionsByDate = allSessions
                .GroupBy(s => s.StartTime.Date)
                .ToDictionary(g => g.Key, g => g.ToList());

            // Calculate current streak
            DateTime today = DateTime.UtcNow.Date;
            int currentStreak = 0;
            DateTime checkDate = today;
            
            while (sessionsByDate.ContainsKey(checkDate))
            {
                currentStreak++;
                checkDate = checkDate.AddDays(-1);
            }

            streakData.CurrentStreak = currentStreak;

            // Calculate longest streak
            int longestStreak = 0;
            int tempStreak = 0;
            List<DateTime> dates = sessionsByDate.Keys.OrderBy(d => d).ToList();
            
            for (int i = 0; i < dates.Count; i++)
            {
                if (i == 0 || dates[i] == dates[i - 1].AddDays(1))
                {
                    tempStreak++;
                    longestStreak = Math.Max(longestStreak, tempStreak);
                }
                else
                {
                    tempStreak = 1;
                }
            }

            streakData.LongestStreak = longestStreak;

            // Calculate quality streak (consecutive sessions with rating >= 4)
            int qualityStreak = 0;
            IEnumerable<FocusSession> recentSessions = allSessions.TakeLast(30).Reverse();
            
            foreach (var session in recentSessions)
            {
                if (session.SessionQualityRating >= 4)
                {
                    qualityStreak++;
                }
                else
                {
                    break;
                }
            }

            streakData.QualityStreak = qualityStreak;

            // Calculate productivity impact
            if (sessions.Count >= 10)
            {
                List<FocusSession> sessionsWithQuality = sessions.Where(s => s.SessionQualityRating.HasValue).ToList();
                if (sessionsWithQuality.Any())
                {
                    double avgQuality = sessionsWithQuality.Average(s => s.SessionQualityRating!.Value);
                    double avgLength = sessions.Average(s => s.DurationMinutes);
                    
                    // Simple productivity impact calculation
                    streakData.StreakImpactOnProductivity = (avgQuality - 3) * 10 + (avgLength - 25) * 0.5;
                }
            }

            return streakData;
        }

        private CorrelationInsights CalculateCorrelationInsights(List<FocusSession> sessions)
        {
            CorrelationInsights insights = new CorrelationInsights();
            
            List<FocusSession> qualitySessions = sessions.Where(s => s.SessionQualityRating.HasValue).ToList();
            
            if (qualitySessions.Count >= 5)
            {
                // Session length vs quality correlation
                double[] lengths = qualitySessions.Select(s => (double)s.DurationMinutes).ToArray();
                double[] qualities = qualitySessions.Select(s => (double)s.SessionQualityRating!.Value).ToArray();
                insights.SessionLengthQualityCorrelation = CalculateCorrelation(lengths, qualities);

                // Distractions vs quality correlation - handle potential null collections
                double[] distractionCounts = qualitySessions.Select(s => (double)(s.Distractions?.Count ?? 0)).ToArray();
                insights.DistractionQualityCorrelation = CalculateCorrelation(distractionCounts, qualities);

                // Task progress vs quality correlation
                List<FocusSession> progressSessions = qualitySessions.Where(s => s.TaskProgressBefore >= 0 && s.TaskProgressAfter >= 0).ToList();
                if (progressSessions.Any())
                {
                    double[] progressChanges = progressSessions
                        .Select(s => (double)(s.TaskProgressAfter - s.TaskProgressBefore))
                        .ToArray();
                    
                    double[] progressQualities = progressSessions
                        .Select(s => (double)s.SessionQualityRating!.Value)
                        .ToArray();
                    
                    insights.TaskProgressSessionQualityCorrelation = CalculateCorrelation(progressChanges, progressQualities);
                }

                // Completion rate vs quality correlation
                double[] completions = qualitySessions.Select(s => s.TaskCompletedDuringSession ? 1.0 : 0.0).ToArray();
                insights.CompletionRateQualityCorrelation = CalculateCorrelation(completions, qualities);
            }

            return insights;
        }

        private double CalculateCorrelation(double[] x, double[] y)
        {
            if (x.Length != y.Length || x.Length < 2) return 0;

            double avgX = x.Average();
            double avgY = y.Average();
            
            double numerator = x.Zip(y, (xi, yi) => (xi - avgX) * (yi - avgY)).Sum();
            double denominatorX = Math.Sqrt(x.Sum(xi => Math.Pow(xi - avgX, 2)));
            double denominatorY = Math.Sqrt(y.Sum(yi => Math.Pow(yi - avgY, 2)));
            
            return denominatorX * denominatorY == 0 ? 0 : numerator / (denominatorX * denominatorY);
        }

        private TaskTypeFocusInsights CalculateTaskTypeInsights(List<FocusSession> sessions)
        {
            TaskTypeFocusInsights insights = new TaskTypeFocusInsights();
            
            // Filter sessions with valid task items and categories, handling nulls safely
            List<FocusSession> taskSessions = sessions.Where(s => 
                s.TaskItem?.Category?.Name != null && 
                !string.IsNullOrWhiteSpace(s.TaskItem.Category.Name)
            ).ToList();
            
            if (taskSessions.Any())
            {
                Dictionary<string, CategorySessionDataDTO> categoryData = taskSessions
                    .GroupBy(s => s.TaskItem!.Category!.Name!)
                    .ToDictionary(g => g.Key, g => new CategorySessionDataDTO
                    {
                        Count = g.Count(),
                        AvgQuality = g.Where(s => s.SessionQualityRating.HasValue)
                                   .DefaultIfEmpty()
                                   .Average(s => s?.SessionQualityRating ?? 0),
                        TotalTime = g.Sum(s => s.DurationMinutes),
                        CompletedTasks = g.Count(s => s.TaskCompletedDuringSession)
                    });

                insights.CategorySessionCounts = categoryData.ToDictionary(kv => kv.Key, kv => kv.Value.Count);
                insights.CategoryAverageQuality = categoryData.ToDictionary(kv => kv.Key, kv => kv.Value.AvgQuality);
                
                // Calculate effectiveness as tasks completed per hour
                insights.CategoryEffectiveness = categoryData.ToDictionary(
                    kv => kv.Key, 
                    kv => kv.Value.TotalTime > 0 ? (kv.Value.CompletedTasks * 60.0) / kv.Value.TotalTime : 0
                );

                if (categoryData.Any())
                {
                    KeyValuePair<string, CategorySessionDataDTO> mostFocused = categoryData.OrderByDescending(kv => kv.Value.Count).First();
                    KeyValuePair<string, CategorySessionDataDTO> highestQuality = categoryData.OrderByDescending(kv => kv.Value.AvgQuality).First();
                    
                    insights.MostFocusedCategory = mostFocused.Key;
                    insights.HighestQualityCategory = highestQuality.Key;
                }
            }
            else
            {
                // Ensure all properties are initialized even when no data is available
                insights.CategorySessionCounts = new Dictionary<string, int>();
                insights.CategoryAverageQuality = new Dictionary<string, double>();
                insights.CategoryEffectiveness = new Dictionary<string, double>();
                insights.MostFocusedCategory = string.Empty;
                insights.HighestQualityCategory = string.Empty;
            }

            return insights;
        }

        private List<ProductivityRecommendation> GenerateRecommendations(List<FocusSession> sessions)
        {
            List<ProductivityRecommendation> recommendations = new List<ProductivityRecommendation>();

            if (!sessions.Any()) return recommendations;

            // Calculate time of day insights for best time recommendation
            Dictionary<int, HourlyRecommendationDataDTO> hourlyData = sessions
                .GroupBy(s => s.StartTime.Hour)
                .ToDictionary(
                    g => g.Key,
                    g => new HourlyRecommendationDataDTO
                    {
                        Count = g.Count(),
                        AvgQuality = g.Where(s => s.SessionQualityRating.HasValue).DefaultIfEmpty()
                                   .Average(s => s?.SessionQualityRating ?? 0)
                    });

            // Best time recommendation
            if (hourlyData.Any())
            {
                KeyValuePair<int, HourlyRecommendationDataDTO> bestHour = hourlyData.OrderByDescending(kv => kv.Value.AvgQuality).First();
                recommendations.Add(new ProductivityRecommendation
                {
                    Id = "best-time",
                    Title = "Optimal Focus Time",
                    Description = $"Schedule your most important tasks around {bestHour.Key}:00. This is when your focus quality peaks at {bestHour.Value.AvgQuality:F1}/5.",
                    Category = "Timing",
                    Priority = 1,
                    Data = new Dictionary<string, object> { { "bestHour", bestHour.Key }, { "avgQuality", bestHour.Value.AvgQuality } }
                });
            }

            // Streak building recommendation
            int uniqueDays = sessions.Select(s => s.StartTime.Date).Distinct().Count();
            if (uniqueDays < 7)
            {
                recommendations.Add(new ProductivityRecommendation
                {
                    Id = "build-streak",
                    Title = "Build Your Focus Streak",
                    Description = $"You're at {uniqueDays} days. Aim for daily focus sessions to build momentum and improve productivity.",
                    Category = "Habits",
                    Priority = 2,
                    Data = new Dictionary<string, object> { { "currentDays", uniqueDays }, { "targetDays", 7 } }
                });
            }

            // Session length optimization
            double avgLength = sessions.Average(s => s.DurationMinutes);
            List<FocusSession> qualitySessions = sessions.Where(s => s.SessionQualityRating.HasValue).ToList();
            
            if (qualitySessions.Any())
            {
                double avgQuality = qualitySessions.Average(s => s.SessionQualityRating!.Value);
                
                if (avgLength < 25 && avgQuality >= 3.5)
                {
                    recommendations.Add(new ProductivityRecommendation
                    {
                        Id = "extend-sessions",
                        Title = "Try Longer Sessions",
                        Description = "Your short sessions have good quality. Consider extending to 25-45 minutes for even better productivity.",
                        Category = "Duration",
                        Priority = 2,
                        Data = new Dictionary<string, object> { { "currentAvgLength", avgLength }, { "suggestedLength", 30 } }
                    });
                }
                else if (avgLength > 60 && avgQuality < 3.0)
                {
                    recommendations.Add(new ProductivityRecommendation
                    {
                        Id = "shorter-sessions",
                        Title = "Try Shorter Sessions",
                        Description = "Your longer sessions tend to have lower quality. Consider shorter, more focused 25-45 minute sessions.",
                        Category = "Duration",
                        Priority = 2,
                        Data = new Dictionary<string, object> { { "currentAvgLength", avgLength }, { "suggestedLength", 30 } }
                    });
                }
            }

            // Distraction management
            double avgDistractions = sessions.Average(s => s.Distractions?.Count ?? 0);
            if (avgDistractions > 3)
                {
                    recommendations.Add(new ProductivityRecommendation
                    {
                        Id = "reduce-distractions",
                        Title = "Minimize Distractions",
                    Description = $"You average {avgDistractions:F1} distractions per session. Try using Do Not Disturb mode or working in a quieter environment.",
                        Category = "Environment",
                    Priority = 1,
                    Data = new Dictionary<string, object> { { "avgDistractions", avgDistractions } }
                    });
            }

            // Category-based recommendations
            List<FocusSession> taskSessions = sessions.Where(s => s.TaskItem?.Category?.Name != null).ToList();
            if (taskSessions.Any())
            {
                Dictionary<string, double> categoryPerformance = taskSessions
                    .Where(s => s.SessionQualityRating.HasValue)
                    .GroupBy(s => s.TaskItem!.Category!.Name)
                    .ToDictionary(g => g.Key, g => g.Average(s => s.SessionQualityRating!.Value));

                if (categoryPerformance.Any())
                {
                    KeyValuePair<string, double> bestCategory = categoryPerformance.OrderByDescending(kv => kv.Value).First();
                    recommendations.Add(new ProductivityRecommendation
                    {
                        Id = "focus-category",
                        Title = "Leverage Your Strengths",
                        Description = $"You're most effective with {bestCategory.Key} tasks (avg quality: {bestCategory.Value:F1}/5). Consider scheduling these during your peak focus times.",
                        Category = "Task Planning",
                        Priority = 3,
                        Data = new Dictionary<string, object> { { "bestCategory", bestCategory.Key }, { "avgQuality", bestCategory.Value } }
                    });
                }
            }

            // Quality improvement recommendation
            if (qualitySessions.Any())
            {
                double avgQuality = qualitySessions.Average(s => s.SessionQualityRating!.Value);
                if (avgQuality < 3.0)
                {
                    recommendations.Add(new ProductivityRecommendation
                    {
                        Id = "improve-quality",
                        Title = "Focus on Session Quality",
                        Description = "Your average session quality is below 3.0. Try preparing better before sessions and eliminating distractions.",
                        Category = "Quality",
                        Priority = 1,
                        Data = new Dictionary<string, object> { { "avgQuality", avgQuality } }
                    });
                }
            }

            return recommendations.OrderBy(r => r.Priority).ToList();
        }

        private TaskTypeFocusInsights CalculateEmptyTaskTypeInsights()
        {
            return new TaskTypeFocusInsights
            {
                CategoryEffectiveness = new Dictionary<string, double>(),
                CategoryAverageQuality = new Dictionary<string, double>(),
                CategorySessionCounts = new Dictionary<string, int>(),
                MostFocusedCategory = string.Empty,
                HighestQualityCategory = string.Empty
            };
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