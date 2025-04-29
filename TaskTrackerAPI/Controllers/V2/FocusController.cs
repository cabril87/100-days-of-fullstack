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
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services;
using TaskTrackerAPI.Services.Interfaces;
using System.Linq;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.DTOs.Focus;

namespace TaskTrackerAPI.Controllers.V2
{
    public class FocusController : BaseApiController
    {
        private readonly ApplicationDbContext _context;
        private readonly IUserAccessor _userAccessor;
        private readonly ITaskPriorityService _priorityService;

        public FocusController(
            ApplicationDbContext context,
            IUserAccessor userAccessor,
            ITaskPriorityService priorityService)
        {
            _context = context;
            _userAccessor = userAccessor;
            _priorityService = priorityService;
        }

        /// <summary>
        /// Gets the current focus item for the authenticated user
        /// </summary>
        /// <returns>The current task the user should be focusing on</returns>
        [HttpGet("current")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<TaskItemDTO>>> GetCurrentFocusItem()
        {
            string userId = _userAccessor.GetCurrentUserId();

            // Get the user's current focus item (if any is explicitly set)
            FocusSession? currentFocus = await _context.FocusSessions
                .Include(f => f.TaskItem)
                .Where(f => f.UserId == int.Parse(userId) && f.EndTime == null)
                .OrderByDescending(f => f.StartTime)
                .FirstOrDefaultAsync();

            // If user has an active focus session
            if (currentFocus != null && currentFocus.TaskItem != null)
            {
                TaskItemDTO taskDto = new TaskItemDTO
                {
                    Id = currentFocus.TaskItem.Id,
                    Title = currentFocus.TaskItem.Title,
                    Description = currentFocus.TaskItem.Description,
                    Status = currentFocus.TaskItem.Status,
                    DueDate = currentFocus.TaskItem.DueDate,
                    Priority = ConvertPriorityToInt(currentFocus.TaskItem.Priority),
                    // Map other properties as needed
                };

                return Ok(new ApiResponse<TaskItemDTO>
                {
                    Success = true,
                    Data = taskDto,
                    Message = "Current focus item retrieved successfully"
                });
            }

            // If no active session, suggest the highest priority task
            TaskItem? suggestedTask = await _priorityService.GetHighestPriorityTaskAsync(userId);
            
            if (suggestedTask == null)
            {
                return Ok(new ApiResponse<TaskItemDTO>
                {
                    Success = true,
                    Data = null,
                    Message = "No tasks available to focus on"
                });
            }

            TaskItemDTO suggestedTaskDto = new TaskItemDTO
            {
                Id = suggestedTask.Id,
                Title = suggestedTask.Title,
                Description = suggestedTask.Description,
                Status = suggestedTask.Status,
                DueDate = suggestedTask.DueDate,
                Priority = ConvertPriorityToInt(suggestedTask.Priority),
                // Map other properties as needed
            };

            return Ok(new ApiResponse<TaskItemDTO>
            {
                Success = true,
                Data = suggestedTaskDto,
                Message = "Suggested focus item retrieved successfully"
            });
        }

        /// <summary>
        /// Sets the current focus item for the authenticated user
        /// </summary>
        /// <param name="focusRequest">The task ID to focus on</param>
        /// <returns>The current focus session information</returns>
        [HttpPost("current")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<FocusSessionDTO>>> SetCurrentFocusItem(FocusRequestDTO focusRequest)
        {
            string userId = _userAccessor.GetCurrentUserId();
            int userIdInt = int.Parse(userId);

            // Validate task exists and belongs to user
            TaskItem? task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == focusRequest.TaskId && t.UserId == userIdInt);
            
            if (task == null)
            {
                return NotFound(new ApiResponse<FocusSessionDTO>
                {
                    Success = false,
                    Message = "Task not found or does not belong to user"
                });
            }

            // End any current focus sessions
            List<FocusSession> activeSessions = await _context.FocusSessions
                .Where(f => f.UserId == userIdInt && f.EndTime == null)
                .ToListAsync();

            foreach (FocusSession session in activeSessions)
            {
                session.EndTime = DateTime.UtcNow;
            }

            // Create new focus session
            FocusSession newSession = new FocusSession
            {
                UserId = userIdInt,
                TaskId = focusRequest.TaskId,
                StartTime = DateTime.UtcNow,
                Notes = focusRequest.Notes
            };

            _context.FocusSessions.Add(newSession);
            await _context.SaveChangesAsync();

            // Return the new focus session
            FocusSessionDTO sessionDto = new FocusSessionDTO
            {
                Id = newSession.Id,
                TaskId = newSession.TaskId,
                StartTime = newSession.StartTime,
                Notes = newSession.Notes ?? string.Empty
            };

            return Ok(new ApiResponse<FocusSessionDTO>
            {
                Success = true,
                Data = sessionDto,
                Message = "Focus set successfully"
            });
        }

        /// <summary>
        /// Ends the current focus session
        /// </summary>
        /// <param name="sessionId">The ID of the session to end</param>
        /// <returns>The updated focus session information</returns>
        [HttpPut("current/{sessionId}/end")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<FocusSessionDTO>>> EndFocusSession(int sessionId)
        {
            string userId = _userAccessor.GetCurrentUserId();
            int userIdInt = int.Parse(userId);

            // Find the active session
            FocusSession? session = await _context.FocusSessions
                .FirstOrDefaultAsync(f => f.Id == sessionId && f.UserId == userIdInt && f.EndTime == null);

            if (session == null)
            {
                return NotFound(new ApiResponse<FocusSessionDTO>
                {
                    Success = false,
                    Message = "Active focus session not found"
                });
            }

            // End the session
            session.EndTime = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Return the updated session
            FocusSessionDTO sessionDto = new FocusSessionDTO
            {
                Id = session.Id,
                TaskId = session.TaskId,
                StartTime = session.StartTime,
                EndTime = session.EndTime,
                Notes = session.Notes ?? string.Empty
            };

            return Ok(new ApiResponse<FocusSessionDTO>
            {
                Success = true,
                Data = sessionDto,
                Message = "Focus session ended successfully"
            });
        }

        /// <summary>
        /// Gets suggestions for what to focus on next
        /// </summary>
        /// <returns>A list of suggested tasks to focus on</returns>
        [HttpGet("suggestions")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<List<TaskItemDTO>>>> GetFocusSuggestions()
        {
            string userId = _userAccessor.GetCurrentUserId();

            // Get top 5 suggested tasks based on priority algorithm
            List<TaskItem> suggestedTasks = await _priorityService.GetPrioritizedTasksAsync(userId, 5);
            
            List<TaskItemDTO> taskDtos = suggestedTasks.Select(task => new TaskItemDTO
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status,
                DueDate = task.DueDate,
                Priority = ConvertPriorityToInt(task.Priority),
                // Map other properties as needed
            }).ToList();

            return Ok(new ApiResponse<List<TaskItemDTO>>
            {
                Success = true,
                Data = taskDtos,
                Message = "Focus suggestions retrieved successfully"
            });
        }

        /// <summary>
        /// Records a distraction during a focus session
        /// </summary>
        /// <param name="sessionId">The ID of the active focus session</param>
        /// <param name="distraction">The distraction details</param>
        /// <returns>The created distraction record</returns>
        [HttpPost("distractions")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<DistractionDTO>>> RecordDistraction(DistractionCreateDTO distraction)
        {
            string userId = _userAccessor.GetCurrentUserId();
            int userIdInt = int.Parse(userId);

            // Validate active session exists
            FocusSession? session = await _context.FocusSessions
                .FirstOrDefaultAsync(f => f.Id == distraction.SessionId && f.UserId == userIdInt && f.EndTime == null);

            if (session == null)
            {
                return NotFound(new ApiResponse<DistractionDTO>
                {
                    Success = false,
                    Message = "Active focus session not found"
                });
            }

            // Create distraction record
            Distraction newDistraction = new Distraction
            {
                FocusSessionId = distraction.SessionId,
                Description = distraction.Description,
                Category = distraction.Category,
                Timestamp = DateTime.UtcNow
            };

            _context.Distractions.Add(newDistraction);
            await _context.SaveChangesAsync();

            // Return the created distraction
            DistractionDTO distractionDto = new DistractionDTO
            {
                Id = newDistraction.Id,
                FocusSessionId = newDistraction.FocusSessionId,
                Description = newDistraction.Description,
                Category = newDistraction.Category,
                Timestamp = newDistraction.Timestamp
            };

            return Ok(new ApiResponse<DistractionDTO>
            {
                Success = true,
                Data = distractionDto,
                Message = "Distraction recorded successfully"
            });
        }

        /// <summary>
        /// Gets focus statistics for the authenticated user
        /// </summary>
        /// <param name="days">Number of days to include in statistics</param>
        /// <returns>Focus statistics</returns>
        [HttpGet("statistics")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<FocusStatisticsDTO>>> GetFocusStatistics([FromQuery] int days = 7)
        {
            string userId = _userAccessor.GetCurrentUserId();
            int userIdInt = int.Parse(userId);
            DateTime startDate = DateTime.UtcNow.AddDays(-days);

            // Get all completed focus sessions within date range
            List<FocusSession> sessions = await _context.FocusSessions
                .Where(f => f.UserId == userIdInt && 
                           f.StartTime >= startDate && 
                           f.EndTime != null)
                .Include(f => f.Distractions)
                .ToListAsync();

            // Calculate statistics
            TimeSpan totalFocusTime = TimeSpan.Zero;
            Dictionary<string, int> distractionsByCategory = new Dictionary<string, int>();
            Dictionary<DateTime, TimeSpan> dailyFocusTime = new Dictionary<DateTime, TimeSpan>();

            foreach (FocusSession session in sessions)
            {
                TimeSpan? sessionDuration = session.EndTime?.Subtract(session.StartTime);
                if (sessionDuration.HasValue)
                {
                    totalFocusTime += sessionDuration.Value;
                }

                // Group by day
                DateTime day = session.StartTime.Date;
                if (!dailyFocusTime.ContainsKey(day))
                {
                    dailyFocusTime[day] = TimeSpan.Zero;
                }
                if (sessionDuration.HasValue)
                {
                    dailyFocusTime[day] += sessionDuration.Value;
                }

                // Count distractions by category
                foreach (Distraction distraction in session.Distractions)
                {
                    if (!distractionsByCategory.ContainsKey(distraction.Category))
                    {
                        distractionsByCategory[distraction.Category] = 0;
                    }
                    distractionsByCategory[distraction.Category]++;
                }
            }

            // Create response
            FocusStatisticsDTO statistics = new FocusStatisticsDTO
            {
                TotalMinutesFocused = (int)totalFocusTime.TotalMinutes,
                SessionCount = sessions.Count,
                DistractionCount = sessions.Sum(s => s.Distractions.Count),
                DistractionsByCategory = distractionsByCategory,
                AverageSessionLength = sessions.Count > 0 ? (int)(totalFocusTime.TotalMinutes / sessions.Count) : 0,
                DailyFocusMinutes = dailyFocusTime.ToDictionary(
                    kvp => kvp.Key.ToString("yyyy-MM-dd"), 
                    kvp => (int)kvp.Value.TotalMinutes)
            };

            return Ok(new ApiResponse<FocusStatisticsDTO>
            {
                Success = true,
                Data = statistics,
                Message = "Focus statistics retrieved successfully"
            });
        }

        /// <summary>
        /// Helper method to convert priority string to integer
        /// </summary>
        private int ConvertPriorityToInt(string priority)
        {
            return priority?.ToLower() switch
            {
                "critical" => 3,
                "high" => 2,
                "medium" => 1,
                "low" => 0,
                _ => 0
            };
        }
    }
} 