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
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

public interface IFocusRepository
{
    // Focus Session operations
    Task<FocusSession?> GetActiveFocusSessionAsync(int userId);
    Task<FocusSession?> GetFocusSessionByIdAsync(int sessionId);
    Task<IEnumerable<FocusSession>> GetFocusSessionsByUserIdAsync(int userId);
    Task<IEnumerable<FocusSession>> GetFocusSessionsInTimeRangeAsync(int userId, DateTime startTime, DateTime endTime);
    Task<FocusSession> CreateFocusSessionAsync(FocusSession session);
    Task<FocusSession?> UpdateFocusSessionAsync(FocusSession session);
    Task<bool> EndFocusSessionAsync(int sessionId, DateTime endTime);
    Task<bool> DeleteFocusSessionAsync(int sessionId);
    Task<bool> IsFocusSessionOwnedByUserAsync(int sessionId, int userId);
    
    // Distraction operations
    Task<Distraction?> GetDistractionByIdAsync(int distractionId);
    Task<IEnumerable<Distraction>> GetDistractionsBySessionIdAsync(int sessionId);
    Task<Distraction> CreateDistractionAsync(Distraction distraction);
    Task<Distraction?> UpdateDistractionAsync(Distraction distraction);
    Task<bool> DeleteDistractionAsync(int distractionId);
    
    // Focus statistics operations
    Task<int> GetTotalFocusMinutesAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);
    Task<int> GetTotalSessionsCountAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);
    Task<int> GetTotalDistractionsCountAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);
    Task<Dictionary<string, int>> GetDistractionsByCategoryAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);
    Task<Dictionary<string, int>> GetDailyFocusMinutesAsync(int userId, int numberOfDays = 7);
} 