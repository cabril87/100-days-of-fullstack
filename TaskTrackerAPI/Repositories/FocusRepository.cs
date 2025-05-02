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
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories;

public class FocusRepository : IFocusRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<FocusRepository> _logger;

    public FocusRepository(ApplicationDbContext context, ILogger<FocusRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    // Focus Session operations
    public async Task<FocusSession?> GetActiveFocusSessionAsync(int userId)
    {
        try
        {
            return await _context.FocusSessions
                .Include(f => f.TaskItem)
                .Include(f => f.Distractions)
                .Where(f => f.UserId == userId && f.EndTime == null)
                .OrderByDescending(f => f.StartTime)
                .FirstOrDefaultAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active focus session for user {UserId}", userId);
            throw;
        }
    }

    public async Task<FocusSession?> GetFocusSessionByIdAsync(int sessionId)
    {
        try
        {
            return await _context.FocusSessions
                .Include(f => f.TaskItem)
                .Include(f => f.Distractions)
                .FirstOrDefaultAsync(f => f.Id == sessionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving focus session with ID {SessionId}", sessionId);
            throw;
        }
    }

    public async Task<IEnumerable<FocusSession>> GetFocusSessionsByUserIdAsync(int userId)
    {
        try
        {
            return await _context.FocusSessions
                .Include(f => f.TaskItem)
                .Include(f => f.Distractions)
                .Where(f => f.UserId == userId)
                .OrderByDescending(f => f.StartTime)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving focus sessions for user {UserId}", userId);
            throw;
        }
    }

    public async Task<IEnumerable<FocusSession>> GetFocusSessionsInTimeRangeAsync(int userId, DateTime startTime, DateTime endTime)
    {
        try
        {
            return await _context.FocusSessions
                .Include(f => f.TaskItem)
                .Include(f => f.Distractions)
                .Where(f => f.UserId == userId && f.StartTime >= startTime && (f.EndTime == null || f.EndTime <= endTime))
                .OrderByDescending(f => f.StartTime)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving focus sessions in time range for user {UserId}", userId);
            throw;
        }
    }

    public async Task<FocusSession> CreateFocusSessionAsync(FocusSession session)
    {
        try
        {
            _context.FocusSessions.Add(session);
            await _context.SaveChangesAsync();
            return session;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating focus session for user {UserId}", session.UserId);
            throw;
        }
    }

    public async Task<FocusSession?> UpdateFocusSessionAsync(FocusSession session)
    {
        try
        {
            _context.FocusSessions.Update(session);
            await _context.SaveChangesAsync();
            return session;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating focus session with ID {SessionId}", session.Id);
            throw;
        }
    }

    public async Task<bool> EndFocusSessionAsync(int sessionId, DateTime endTime)
    {
        try
        {
            FocusSession? session = await _context.FocusSessions.FindAsync(sessionId);
            if (session == null)
                return false;

            session.EndTime = endTime;
            session.IsCompleted = true;
            session.Status = SessionStatus.Completed;
            
            // Calculate duration in minutes
            TimeSpan duration = endTime - session.StartTime;
            session.DurationMinutes = (int)duration.TotalMinutes;

            _context.FocusSessions.Update(session);
            int result = await _context.SaveChangesAsync();
            return result > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error ending focus session with ID {SessionId}", sessionId);
            throw;
        }
    }

    public async Task<bool> DeleteFocusSessionAsync(int sessionId)
    {
        try
        {
            FocusSession? session = await _context.FocusSessions.FindAsync(sessionId);
            if (session == null)
                return false;

            _context.FocusSessions.Remove(session);
            int result = await _context.SaveChangesAsync();
            return result > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting focus session with ID {SessionId}", sessionId);
            throw;
        }
    }

    public async Task<bool> IsFocusSessionOwnedByUserAsync(int sessionId, int userId)
    {
        try
        {
            return await _context.FocusSessions
                .AnyAsync(f => f.Id == sessionId && f.UserId == userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking ownership of focus session {SessionId} for user {UserId}", sessionId, userId);
            throw;
        }
    }

    // Distraction operations
    public async Task<Distraction?> GetDistractionByIdAsync(int distractionId)
    {
        try
        {
            return await _context.Distractions
                .Include(d => d.FocusSession)
                .FirstOrDefaultAsync(d => d.Id == distractionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving distraction with ID {DistractionId}", distractionId);
            throw;
        }
    }

    public async Task<IEnumerable<Distraction>> GetDistractionsBySessionIdAsync(int sessionId)
    {
        try
        {
            return await _context.Distractions
                .Where(d => d.FocusSessionId == sessionId)
                .OrderBy(d => d.Timestamp)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving distractions for session {SessionId}", sessionId);
            throw;
        }
    }

    public async Task<Distraction> CreateDistractionAsync(Distraction distraction)
    {
        try
        {
            _context.Distractions.Add(distraction);
            await _context.SaveChangesAsync();
            return distraction;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating distraction for session {SessionId}", distraction.FocusSessionId);
            throw;
        }
    }

    public async Task<Distraction?> UpdateDistractionAsync(Distraction distraction)
    {
        try
        {
            _context.Distractions.Update(distraction);
            await _context.SaveChangesAsync();
            return distraction;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating distraction with ID {DistractionId}", distraction.Id);
            throw;
        }
    }

    public async Task<bool> DeleteDistractionAsync(int distractionId)
    {
        try
        {
            Distraction? distraction = await _context.Distractions.FindAsync(distractionId);
            if (distraction == null)
                return false;

            _context.Distractions.Remove(distraction);
            int result = await _context.SaveChangesAsync();
            return result > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting distraction with ID {DistractionId}", distractionId);
            throw;
        }
    }

    // Focus statistics operations
    public async Task<int> GetTotalFocusMinutesAsync(int userId, DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            IQueryable<FocusSession> query = _context.FocusSessions
                .Where(f => f.UserId == userId && f.EndTime != null);

            if (startDate.HasValue)
                query = query.Where(f => f.StartTime >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(f => f.EndTime <= endDate.Value);

            return await query.SumAsync(f => f.DurationMinutes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating total focus minutes for user {UserId}", userId);
            throw;
        }
    }

    public async Task<int> GetTotalSessionsCountAsync(int userId, DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            IQueryable<FocusSession> query = _context.FocusSessions
                .Where(f => f.UserId == userId);

            if (startDate.HasValue)
                query = query.Where(f => f.StartTime >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(f => f.StartTime <= endDate.Value);

            return await query.CountAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error counting total focus sessions for user {UserId}", userId);
            throw;
        }
    }

    public async Task<int> GetTotalDistractionsCountAsync(int userId, DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            IQueryable<Distraction> query = _context.Distractions
                .Join(_context.FocusSessions,
                    d => d.FocusSessionId,
                    s => s.Id,
                    (d, s) => new { Distraction = d, Session = s })
                .Where(x => x.Session.UserId == userId)
                .Select(x => x.Distraction);

            if (startDate.HasValue)
                query = query.Where(d => d.Timestamp >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(d => d.Timestamp <= endDate.Value);

            return await query.CountAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error counting total distractions for user {UserId}", userId);
            throw;
        }
    }

    public async Task<Dictionary<string, int>> GetDistractionsByCategoryAsync(int userId, DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            IQueryable<Distraction> query = _context.Distractions
                .Join(_context.FocusSessions,
                    d => d.FocusSessionId,
                    s => s.Id,
                    (d, s) => new { Distraction = d, Session = s })
                .Where(x => x.Session.UserId == userId)
                .Select(x => x.Distraction);

            if (startDate.HasValue)
                query = query.Where(d => d.Timestamp >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(d => d.Timestamp <= endDate.Value);

            // Using var is appropriate here because we're dealing with an anonymous type
            // that doesn't have a directly expressible concrete type
            var categoryGroups = await query
                .GroupBy(d => d.Category)
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .ToListAsync();
                
            return categoryGroups.ToDictionary(x => x.Category, x => x.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting distractions by category for user {UserId}", userId);
            throw;
        }
    }

    public async Task<Dictionary<string, int>> GetDailyFocusMinutesAsync(int userId, int numberOfDays = 7)
    {
        try
        {
            DateTime startDate = DateTime.UtcNow.Date.AddDays(-numberOfDays + 1);
            DateTime endDate = DateTime.UtcNow.Date.AddDays(1).AddSeconds(-1); // End of today

            IEnumerable<FocusSession> focusSessions = await _context.FocusSessions
                .Where(f => f.UserId == userId && f.StartTime >= startDate && f.EndTime <= endDate)
                .ToListAsync();

            Dictionary<string, int> dailyMinutes = new Dictionary<string, int>();

            // Initialize dictionary with all days in range
            for (int i = 0; i < numberOfDays; i++)
            {
                string dateKey = startDate.AddDays(i).ToString("yyyy-MM-dd");
                dailyMinutes[dateKey] = 0;
            }

            // Sum up minutes for each day
            foreach (FocusSession session in focusSessions)
            {
                if (session.EndTime.HasValue)
                {
                    string dateKey = session.StartTime.ToString("yyyy-MM-dd");
                    if (dailyMinutes.ContainsKey(dateKey))
                    {
                        dailyMinutes[dateKey] += session.DurationMinutes;
                    }
                }
            }

            return dailyMinutes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting daily focus minutes for user {UserId}", userId);
            throw;
        }
    }
} 