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
using TaskTrackerAPI.DTOs.Focus;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces
{
    /// <summary>
    /// Service for managing focus sessions and related features
    /// </summary>
    public interface IFocusService
    {
        /// <summary>
        /// Gets the current active focus session for a user
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <returns>The focus session DTO if one is active, null otherwise</returns>
        Task<FocusSessionDTO?> GetCurrentFocusSessionAsync(int userId);
        
        /// <summary>
        /// Gets the task that the user should be currently focusing on
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <returns>The task to focus on</returns>
        Task<TaskItemDTO?> GetCurrentFocusItemAsync(int userId);
        
        /// <summary>
        /// Sets the current focus item for a user
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <param name="focusRequest">The focus request details</param>
        /// <returns>The created focus session</returns>
        Task<FocusSessionDTO> SetCurrentFocusItemAsync(int userId, FocusRequestDTO focusRequest);
        
        /// <summary>
        /// Ends the current focus session for a user
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <param name="sessionId">The session ID to end (optional)</param>
        /// <returns>The ended focus session</returns>
        Task<FocusSessionDTO?> EndCurrentFocusSessionAsync(int userId, int? sessionId = null);
        
        /// <summary>
        /// Gets suggestions for what to focus on next
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <param name="count">The number of suggestions to return</param>
        /// <returns>A list of suggested tasks</returns>
        Task<List<TaskItemDTO>> GetFocusSuggestionsAsync(int userId, int count = 5);
        
        /// <summary>
        /// Records a distraction during a focus session
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <param name="distraction">The distraction details</param>
        /// <returns>The created distraction</returns>
        Task<DistractionDTO> RecordDistractionAsync(int userId, DistractionCreateDTO distraction);
        
        /// <summary>
        /// Gets focus statistics for a user
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <param name="startDate">Optional start date for filtering</param>
        /// <param name="endDate">Optional end date for filtering</param>
        /// <returns>Focus statistics</returns>
        Task<FocusStatisticsDTO> GetFocusStatisticsAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);
        
        /// <summary>
        /// Gets all focus sessions for a user
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <returns>A list of focus sessions</returns>
        Task<List<FocusSessionDTO>> GetFocusHistoryAsync(int userId);
        
        /// <summary>
        /// Gets all distractions for a specific focus session
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <param name="sessionId">The session ID</param>
        /// <returns>A list of distractions</returns>
        Task<List<DistractionDTO>> GetSessionDistractionsAsync(int userId, int sessionId);
    }
} 