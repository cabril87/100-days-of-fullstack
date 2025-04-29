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
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Focus;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services
{
    public class FocusService : IFocusService
    {
        private readonly IFocusRepository _focusRepository;
        private readonly ITaskItemRepository _taskRepository;
        private readonly ITaskPriorityService _priorityService;
        private readonly IMapper _mapper;
        private readonly ILogger<FocusService> _logger;

        public FocusService(
            IFocusRepository focusRepository,
            ITaskItemRepository taskRepository,
            ITaskPriorityService priorityService,
            IMapper mapper,
            ILogger<FocusService> logger)
        {
            _focusRepository = focusRepository;
            _taskRepository = taskRepository;
            _priorityService = priorityService;
            _mapper = mapper;
            _logger = logger;
        }

        /// <inheritdoc />
        public async Task<FocusSessionDTO?> GetCurrentFocusSessionAsync(int userId)
        {
            try
            {
                FocusSession? session = await _focusRepository.GetActiveFocusSessionAsync(userId);
                return session != null ? _mapper.Map<FocusSessionDTO>(session) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current focus session for user {UserId}", userId);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<TaskItemDTO?> GetCurrentFocusItemAsync(int userId)
        {
            try
            {
                // Check if the user has an active focus session
                FocusSession? currentSession = await _focusRepository.GetActiveFocusSessionAsync(userId);
                
                if (currentSession != null && currentSession.TaskItem != null)
                {
                    // Return the task from the active session
                    return _mapper.Map<TaskItemDTO>(currentSession.TaskItem);
                }
                
                // If no active session, get the highest priority task as a suggestion
                TaskItem? suggestedTask = await _priorityService.GetHighestPriorityTaskAsync(userId.ToString());
                return suggestedTask != null ? _mapper.Map<TaskItemDTO>(suggestedTask) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current focus item for user {UserId}", userId);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<FocusSessionDTO> SetCurrentFocusItemAsync(int userId, FocusRequestDTO focusRequest)
        {
            try
            {
                // Validate task exists and belongs to user
                TaskItem? task = await _taskRepository.GetTaskByIdAsync(focusRequest.TaskId, userId);
                if (task == null)
                {
                    throw new ArgumentException($"Task with ID {focusRequest.TaskId} not found or does not belong to user", nameof(focusRequest.TaskId));
                }

                // End any current focus sessions
                FocusSession? activeSession = await _focusRepository.GetActiveFocusSessionAsync(userId);
                if (activeSession != null)
                {
                    await _focusRepository.EndFocusSessionAsync(activeSession.Id, DateTime.UtcNow);
                }

                // Create new focus session
                FocusSession newSession = new FocusSession
                {
                    UserId = userId,
                    TaskId = focusRequest.TaskId,
                    StartTime = DateTime.UtcNow,
                    Notes = focusRequest.Notes,
                    Status = SessionStatus.InProgress
                };

                FocusSession createdSession = await _focusRepository.CreateFocusSessionAsync(newSession);
                return _mapper.Map<FocusSessionDTO>(createdSession);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting current focus item for user {UserId}", userId);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<FocusSessionDTO?> EndCurrentFocusSessionAsync(int userId, int? sessionId = null)
        {
            try
            {
                FocusSession? session;
                
                // If session ID is provided, use that
                if (sessionId.HasValue)
                {
                    session = await _focusRepository.GetFocusSessionByIdAsync(sessionId.Value);
                    if (session == null || session.UserId != userId)
                    {
                        throw new ArgumentException($"Focus session with ID {sessionId} not found or does not belong to user", nameof(sessionId));
                    }
                }
                else
                {
                    // Otherwise, get the active session
                    session = await _focusRepository.GetActiveFocusSessionAsync(userId);
                }
                
                if (session == null)
                {
                    return null; // No active session to end
                }
                
                // End the session
                await _focusRepository.EndFocusSessionAsync(session.Id, DateTime.UtcNow);
                
                // Get the updated session
                FocusSession? updatedSession = await _focusRepository.GetFocusSessionByIdAsync(session.Id);
                return updatedSession != null ? _mapper.Map<FocusSessionDTO>(updatedSession) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error ending focus session for user {UserId}", userId);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<List<TaskItemDTO>> GetFocusSuggestionsAsync(int userId, int count = 5)
        {
            try
            {
                // Get prioritized tasks
                List<TaskItem> suggestedTasks = await _priorityService.GetPrioritizedTasksAsync(userId.ToString(), count);
                return _mapper.Map<List<TaskItemDTO>>(suggestedTasks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting focus suggestions for user {UserId}", userId);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<DistractionDTO> RecordDistractionAsync(int userId, DistractionCreateDTO distractionDto)
        {
            try
            {
                // Verify the session exists and belongs to the user
                FocusSession? session = await _focusRepository.GetFocusSessionByIdAsync(distractionDto.SessionId);
                if (session == null || session.UserId != userId)
                {
                    throw new ArgumentException($"Focus session with ID {distractionDto.SessionId} not found or does not belong to user", nameof(distractionDto.SessionId));
                }

                // Create the distraction
                Distraction distraction = new Distraction
                {
                    FocusSessionId = distractionDto.SessionId,
                    Description = distractionDto.Description,
                    Category = distractionDto.Category,
                    Timestamp = DateTime.UtcNow
                };

                Distraction createdDistraction = await _focusRepository.CreateDistractionAsync(distraction);
                return _mapper.Map<DistractionDTO>(createdDistraction);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording distraction for user {UserId}", userId);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<FocusStatisticsDTO> GetFocusStatisticsAsync(int userId, DateTime? startDate = null, DateTime? endDate = null)
        {
            try
            {
                // Collect statistics
                int totalMinutesFocused = await _focusRepository.GetTotalFocusMinutesAsync(userId, startDate, endDate);
                int sessionCount = await _focusRepository.GetTotalSessionsCountAsync(userId, startDate, endDate);
                int distractionCount = await _focusRepository.GetTotalDistractionsCountAsync(userId, startDate, endDate);
                Dictionary<string, int> distractionsByCategory = await _focusRepository.GetDistractionsByCategoryAsync(userId, startDate, endDate);
                Dictionary<string, int> dailyFocusMinutes = await _focusRepository.GetDailyFocusMinutesAsync(userId, 7);

                // Calculate average session length
                int averageSessionLength = sessionCount > 0 ? totalMinutesFocused / sessionCount : 0;

                // Create and return the statistics DTO
                return new FocusStatisticsDTO
                {
                    TotalMinutesFocused = totalMinutesFocused,
                    SessionCount = sessionCount,
                    DistractionCount = distractionCount,
                    DistractionsByCategory = distractionsByCategory,
                    AverageSessionLength = averageSessionLength,
                    DailyFocusMinutes = dailyFocusMinutes
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting focus statistics for user {UserId}", userId);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<List<FocusSessionDTO>> GetFocusHistoryAsync(int userId)
        {
            try
            {
                IEnumerable<FocusSession> sessions = await _focusRepository.GetFocusSessionsByUserIdAsync(userId);
                return _mapper.Map<List<FocusSessionDTO>>(sessions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting focus history for user {UserId}", userId);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<List<DistractionDTO>> GetSessionDistractionsAsync(int userId, int sessionId)
        {
            try
            {
                // Verify the session exists and belongs to the user
                bool isOwner = await _focusRepository.IsFocusSessionOwnedByUserAsync(sessionId, userId);
                if (!isOwner)
                {
                    throw new ArgumentException($"Focus session with ID {sessionId} not found or does not belong to user", nameof(sessionId));
                }

                IEnumerable<Distraction> distractions = await _focusRepository.GetDistractionsBySessionIdAsync(sessionId);
                return _mapper.Map<List<DistractionDTO>>(distractions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting distractions for session {SessionId} for user {UserId}", sessionId, userId);
                throw;
            }
        }
    }
} 